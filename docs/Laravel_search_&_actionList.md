# JobHunt Lite 検索・Dashboard ActionLists 回答集

## 0. このセクションで必ず伝えること

このセクションでは、検索機能とDashboard用の集計・ActionListsを扱う。

重要なのは、FrontendだけでもBackendだけでも検索機能は完成しないという点。

React側では、検索フォームの入力値をURLのquery stringに変換する。

例：

    /api/companies?keyword=React&status=選考中&media=Green

Laravel側では、そのURLからRequestで値を受け取る。

例：

    $request->query('keyword') // React
    $request->query('status')  // 選考中
    $request->query('media')   // Green

そして、Company::query()で検索条件を組み立てる土台を作り、whereやorWhereで条件を追加し、最後にget()でDBから取得する。

つまり検索機能の流れはこう。

    Reactの入力値
    ↓
    URLSearchParams
    ↓
    /api/companies?keyword=...
    ↓
    Laravel Request
    ↓
    Company::query()
    ↓
    where / orWhere
    ↓
    get()
    ↓
    CompanyResource
    ↓
    JSON
    ↓
    ReactのsetCompanies

この一本道を説明できれば、受講者はかなり迷子になりにくい。

---

# 1. Backend検索処理の全体像

## 完成コード：認証なし版

    /**
     * 企業一覧を取得する
     */
    public function index(Request $request)
    {
        // 検索条件を後から追加するため、まずCompany検索の土台を作る
        // この時点ではまだDBから取得していない
        $query = Company::query();

        // keyword がURLに含まれている場合だけ、企業名・メモの検索条件を追加する
        if ($request->filled('keyword')) {
            $keyword = $request->query('keyword');

            // name または memo に keyword が含まれる企業を検索する
            // where(function...) で OR 条件をひとまとまりにする
            $query->where(function ($innerQuery) use ($keyword) {
                $innerQuery->where('name', 'like', "%{$keyword}%")
                    ->orWhere('memo', 'like', "%{$keyword}%");
            });
        }

        // status がURLに含まれている場合だけ、状況で絞り込む
        if ($request->filled('status')) {
            $status = $request->query('status');

            $query->where('status', $status);
        }

        // media がURLに含まれている場合だけ、媒体名で部分一致検索する
        if ($request->filled('media')) {
            $media = $request->query('media');

            $query->where('media', 'like', "%{$media}%");
        }

        // ここで初めてDBから取得する
        // 面談日がある企業を優先し、その後は作成日の新しい順にする
        $companies = $query
            ->orderByRaw('interview_date IS NULL')
            ->orderBy('interview_date')
            ->orderByDesc('created_at')
            ->get();

        // CompanyResourceを通してReactへ返す
        return CompanyResource::collection($companies);
    }

---

# 2. Company::query() の意味

    $query = Company::query();

これは、companiesテーブルを検索するための土台を作る処理。

この時点では、まだDBからデータを取得していない。

SQLイメージでいうと、

    SELECT * FROM companies

の下書きを作っている状態。

ただし、まだ実行していない。

実行するのは最後のget。

    $companies = $query->get();

つまり、

    Company::query()
    → 検索条件を組み立てる準備

    $query->where(...)
    → 検索条件を追加

    $query->get()
    → ここでDBから取得

という流れ。

---

# 3. Company::query() と $query->where() はセット

ここは必ず言う。

    Company::query() と $query->where(...) はセットで考える。

    Company::query() は検索条件を組み立てるための土台。
    $query->where(...) は、その土台に条件を追加していく処理。
    最後に $query->get() でDBから取得する。

例：

    $query = Company::query();

    $query->where('status', '選考中');

    $companies = $query->get();

SQLイメージ：

    SELECT * FROM companies
    WHERE status = '選考中';

---

# 4. なぜ Company::query()->get() ではないのか

    Company::query()->get();

これは、すぐにDBから取得してしまう。

検索では、取得する前に条件を足したい。

例えば、

    keywordがあれば name / memo を検索
    statusがあれば status で絞り込み
    mediaがあれば media で絞り込み

のように、条件がある場合だけwhereを追加したい。

だから、

    $query = Company::query();

で土台を作ってから、

    $query->where(...);

で条件を追加し、最後に、

    $query->get();

で取得する。

---

# 5. $request->filled('keyword') の意味

    if ($request->filled('keyword')) {
        ...
    }

これは、

    URLにkeywordがあり、かつ空ではないか？

を確認している。

trueになる例：

    /api/companies?keyword=React

falseになる例：

    /api/companies?keyword=

    /api/companies

つまり、keywordが入力されている時だけ、キーワード検索条件を追加する。

---

# 6. $request->query('keyword') の意味

    $keyword = $request->query('keyword');

これは、URLのquery parameterから値を取り出している。

例：

    /api/companies?keyword=React

この場合、

    $request->query('keyword')

は、

    React

になる。

React側のこれと対応している。

    params.append("keyword", keyword);

ReactでURLにkeyword=Reactを付ける。

Laravelで$request->query('keyword')として受け取る。

---

# 7. status検索がバチコンと見える理由

statusの場合はこう書く。

    if ($request->filled('status')) {
        $status = $request->query('status');

        $query->where('status', $status);
    }

やっていることは3つ。

    1. URLにstatusがあるか確認
    2. statusの値を取り出す
    3. statusカラムで絞り込む

例：

    /api/companies?status=選考中

この場合、

    $status = '選考中';

なので、

    $query->where('status', $status);

はSQLでいうと、

    WHERE status = '選考中'

になる。

keywordより短い理由は、statusは1カラムだけを完全一致で見ればよいから。

---

# 8. keyword検索が複雑な理由

keywordは、企業名nameとメモmemoの2カラムを見たい。

やりたいことはこれ。

    企業名にReactが含まれる
    または
    メモにReactが含まれる

SQLイメージ：

    WHERE (
      name LIKE '%React%'
      OR memo LIKE '%React%'
    )

このOR条件をひとまとまりにするために、Laravelでは次のように書く。

    $query->where(function ($innerQuery) use ($keyword) {
        $innerQuery->where('name', 'like', "%{$keyword}%")
            ->orWhere('memo', 'like', "%{$keyword}%");
    });

---

# 9. 無名関数 function ($innerQuery) の意味

    function ($innerQuery) {
        ...
    }

これは名前のない関数。

ここでは、name検索とmemo検索のOR条件をひとまとまりにするために使っている。

SQLでいうと、この括弧を作るイメージ。

    WHERE (
      name LIKE '%React%'
      OR memo LIKE '%React%'
    )

Laravelでこの括弧のまとまりを作るために、

    where(function ($innerQuery) {
        ...
    })

という書き方を使う。

ここは深掘りしすぎず、

    LaravelでOR条件をまとめる時の定番パターンです。

と伝えればよい。

---

# 10. $innerQuery の意味

    function ($innerQuery)

この$innerQueryは、OR条件の中だけで使う内側のquery。

名前は$innerQueryでなくてもよい。

例えば、よくある書き方はこれ。

    $query->where(function ($q) use ($keyword) {
        $q->where('name', 'like', "%{$keyword}%")
            ->orWhere('memo', 'like', "%{$keyword}%");
    });

$qでも動く。

ただし講座では、$qより$innerQueryの方がわかりやすい。

    外側の $query
    内側の $innerQuery

という説明ができるため。

---

# 11. use ($keyword) の意味

    use ($keyword)

これはPHPの無名関数のルール。

無名関数の外で定義した変数を、無名関数の中で使うために必要。

今回、$keywordは外側で作っている。

    $keyword = $request->query('keyword');

その$keywordを、無名関数の中で使いたい。

    $query->where(function ($innerQuery) use ($keyword) {
        $innerQuery->where('name', 'like', "%{$keyword}%")
            ->orWhere('memo', 'like', "%{$keyword}%");
    });

そのため、

    use ($keyword)

と書く。

ここは事実として伝えればよい。

    $keywordは無名関数の外で作った変数です。
    PHPでは、外側の変数を無名関数の中で使う場合、use ($keyword) と書く必要があります。

これで十分。

---

# 12. use ($keyword) がないとどうなるか

これだと中で$keywordが使えない。

    $query->where(function ($innerQuery) {
        $innerQuery->where('name', 'like', "%{$keyword}%")
            ->orWhere('memo', 'like', "%{$keyword}%");
    });

エラーイメージ：

    Undefined variable $keyword

だから、外側の$keywordを中に持ち込むためにuse ($keyword)を書く。

---

# 13. orWhereの意味

    $innerQuery->where('name', 'like', "%{$keyword}%")
        ->orWhere('memo', 'like', "%{$keyword}%");

これは、

    nameにkeywordが含まれる
    または
    memoにkeywordが含まれる

という意味。

SQLイメージ：

    name LIKE '%React%'
    OR memo LIKE '%React%'

もしorWhereではなくwhereにすると、

    nameにkeywordが含まれる
    かつ
    memoにもkeywordが含まれる

になる。

つまりAND検索になる。

今回は、企業名かメモのどちらかに含まれていれば検索結果に出したいのでorWhereを使う。

---

# 14. media検索の意味

    if ($request->filled('media')) {
        $media = $request->query('media');

        $query->where('media', 'like', "%{$media}%");
    }

これは、mediaに入力文字が含まれる企業だけに絞る処理。

例：

    /api/companies?media=Green

SQLイメージ：

    WHERE media LIKE '%Green%'

statusは完全一致。

    WHERE status = '選考中'

mediaは部分一致。

    WHERE media LIKE '%Green%'

この違いは説明ポイント。

    statusはselectで決まった値なので完全一致。
    mediaは手入力の可能性があるので部分一致。

---

# 15. orderByRaw('interview_date IS NULL') の意味

    orderByRaw('interview_date IS NULL')

これは、interview_dateがNULLかどうかを使って並び替えている。

SQLでは、

    interview_date IS NULL

は、面談日がNULLならtrue、NULLでなければfalseになる。

DBではfalseが0、trueが1のように扱われるため、昇順にすると、

    interview_date がある企業
    ↓
    interview_date がない企業

の順に並びやすい。

その後、

    orderBy('interview_date')

で面談日が近い順。

最後に、

    orderByDesc('created_at')

で作成日の新しい順。

つまり、

    面談日がある企業を優先
    面談日が近い順
    同じ条件なら新しく作成された企業を優先

という並び。

---

# 16. Frontend検索処理の完成コード

    const searchCompanies = async () => {
      if (!authToken) return;

      const params = new URLSearchParams();

      if (keyword) {
        params.append("keyword", keyword);
      }

      if (status) {
        params.append("status", status);
      }

      if (media) {
        params.append("media", media);
      }

      const queryString = params.toString();

      const url = queryString
        ? `${API_BASE_URL}/companies?${queryString}`
        : `${API_BASE_URL}/companies`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("検索に失敗しました。");
      }

      const json = await response.json();

      setCompanies(json.data);
      await fetchDashboard();
    };

---

# 17. URLSearchParamsの意味

    const params = new URLSearchParams();

これは、URLのquery stringを作るための入れ物。

例えば、

    keyword = "React"
    status = "選考中"
    media = "Green"

の場合、

    params.append("keyword", keyword);
    params.append("status", status);
    params.append("media", media);

とすると、

    keyword=React&status=選考中&media=Green

のような文字列を作れる。

---

# 18. queryStringの意味

    const queryString = params.toString();

URLSearchParamsを文字列に変換している。

例：

    keyword=React&status=選考中&media=Green

この文字列をURLの後ろに付ける。

    /api/companies?keyword=React&status=選考中&media=Green

---

# 19. url作成の意味

    const url = queryString
      ? `${API_BASE_URL}/companies?${queryString}`
      : `${API_BASE_URL}/companies`;

これは、

    検索条件がある場合は、query string付きのURL
    検索条件がない場合は、通常のcompanies API

に分けている。

検索条件あり：

    /api/companies?keyword=React

検索条件なし：

    /api/companies

---

# 20. React側とLaravel側のつながり

React側：

    params.append("status", status);

URL：

    /api/companies?status=選考中

Laravel側：

    $request->query('status')

値：

    選考中

検索条件：

    $query->where('status', '選考中');

SQLイメージ：

    WHERE status = '選考中'

この対応を必ず説明する。

---

# 21. setCompanies(json.data) の意味

    const json = await response.json();

    setCompanies(json.data);

Laravel APIから返ってきたJSONをJavaScriptで扱える形にし、その中のdataをcompanies stateに入れている。

Laravel Resourceで返した場合、基本的に一覧データはdataの中に入る。

例：

    {
      "data": [
        {
          "id": 1,
          "name": "株式会社A",
          "status": "選考中"
        }
      ]
    }

だからReact側では、

    setCompanies(json.data);

とする。

検索後は、companies stateが検索結果の配列に置き換わるため、画面の企業一覧も検索結果に変わる。

---

# 22. fetchDashboard() を検索後に呼ぶ意味

    await fetchDashboard();

検索後にDashboardも再取得している。

ただし注意点がある。

Dashboard APIが全企業の集計を返す設計なら、検索後もDashboardは全体集計のまま。

検索条件に応じたDashboardにしたい場合は、Dashboard APIにも同じquery stringを渡す必要がある。

Lite版では、まずは

    一覧は検索結果
    Dashboardは全体集計

でもよい。

ただし講座では、ここは設計判断として説明できる。

---

# 23. 条件クリアの意味

    onClick={() => {
      setKeyword("");
      setStatus("");
      setMedia("");
      fetchCompanies();
    }}

これは、

    keywordを空にする
    statusを空にする
    mediaを空にする
    全件取得APIを呼ぶ

という処理。

検索条件をリセットして、一覧を全件表示に戻す。

---

# 24. 検索ボタンが動かないように見える時の確認

検索ボタンが動いていないように見える場合は、まずconsole.logで確認する。

    console.log("検索ボタン押された");
    console.log("検索URL:", url);
    console.log("検索response:", response.status);
    console.log("検索結果:", json.data);

確認ポイント：

    1. 検索ボタン押された、が出るか
    2. 検索URLが正しいか
    3. Networkで /companies?keyword=... が飛んでいるか
    4. response.status が200か
    5. json.dataが検索結果になっているか

よくある原因：

    FrontendでURLは作れているが、BackendのindexがRequestを使って絞り込んでいない
    fetchDashboard()でエラーになっている
    Authorizationが必要なのにtokenを送っていない
    auth:sanctumが付いているのに認証なしで叩いている
    routeが間違っている

---

# 25. 検索機能の講座台本

ここでは検索・絞り込み機能を作っていきます。

検索機能はFrontendだけでは完成しません。

React側で検索フォームを作って、

    /api/companies?keyword=React

というURLを作っても、Laravel側のindexメソッドがkeywordを受け取って検索条件に使っていなければ、ただの全件取得のままです。

そのため、まずBackend側でRequestを受け取り、Company::query()で検索条件を追加するための土台を作ります。

Company::query()は、この時点ではまだDBから取得していません。

ここにwhereやorWhereで条件を追加していき、最後にget()を呼んだタイミングでDBから取得します。

keywordがある場合は、企業名nameまたはメモmemoにkeywordが含まれる企業を検索します。

このとき、name検索とmemo検索はOR条件にしたいので、

    where(function ($innerQuery) use ($keyword) { ... })

と書いて条件をひとまとまりにしています。

$innerQueryはOR条件の中で使う内側のqueryです。

use ($keyword)は、無名関数の外で定義した$keywordを中で使うために必要なPHPのルールです。

statusは「選考中」「内定」「落選」のように決まった値なので完全一致で検索します。

mediaは手入力の可能性があるので部分一致検索にしています。

Backend側で検索条件に対応できたら、Frontend側でkeyword / status / mediaをstate管理し、URLSearchParamsを使ってquery stringを作ります。

最後にfetchでLaravel APIへGETリクエストを送り、返ってきたjson.dataをsetCompaniesに入れることで、画面の企業一覧が検索結果に更新されます。

---

# 26. Dashboard ActionListsの全体像

Dashboardでは、summaryとactionListsを返す。

summaryは件数の集計。

例：

    total
    interview
    waiting
    offer
    rejected
    highPriority

actionListsは、Dashboardに表示する候補企業リスト。

例：

    面談予定の企業
    確認待ちの企業
    高優先度の企業

Backend側では、DBから取得した企業一覧をLaravel Collectionとして扱い、filter、sortBy、take、valuesで加工している。

---

# 27. CompanyDashboardControllerのコード

    <?php

    namespace App\Http\Controllers\Api;

    use App\Http\Controllers\Controller;
    use App\Http\Resources\CompanyResource;
    use Illuminate\Http\Request;
    use App\Models\Company;

    class CompanyDashboardController extends Controller
    {
        public function index()
        {
            $companies = Company::query()->get();

            $total = $companies->count();

            $interviewCompanies = $companies->filter(function ($company) {
                return $company->status === '面談予定'
                    || $company->interview_date !== null;
            });

            $waitingCompanies = $companies->filter(function ($company) {
                return in_array($company->status, [
                    '応募済み',
                    '書類選考待ち',
                    '面談日程調整中',
                    '面談後返答待ち'
                ]);
            });

            $highPriorityCompanies = $companies->filter(function ($company) {
                return ((float) $company->priority >= 4.0);
            });

            return response()->json([
                'summary' => [
                    'total' => $companies->count(),
                    'interview' => $interviewCompanies->count(),
                    'waiting' => $waitingCompanies->count(),
                    'offer' => $companies->where('status', '内定')->count(),
                    'rejected' => $companies->where('status', '落選')->count(),
                    'highPriority' => $highPriorityCompanies->count(),
                ],
                'actionLists' => [
                    'interview' => CompanyResource::collection(
                        $interviewCompanies
                            ->sortBy('interview_date')
                            ->take(3)
                            ->values()
                    )->resolve(),

                    'waiting' => CompanyResource::collection(
                        $waitingCompanies
                            ->sortBy('applied_date')
                            ->take(3)
                            ->values()
                    )->resolve(),

                    'highPriority' => CompanyResource::collection(
                        $highPriorityCompanies
                            ->sortByDesc('priority')
                            ->take(3)
                            ->values()
                    )->resolve(),
                ],
            ]);
        }
    }

---

# 28. Collectionとは何か

Laravelでは、DBから取った複数データをCollectionとして扱う。

Collectionは高機能な配列のようなもの。

    $companies = Company::query()->get();

この$companiesは、普通の配列ではなくLaravel Collection。

中身のイメージ：

    Collection {
        0 => Company {
            id: 1,
            name: "株式会社A",
            status: "選考中",
            priority: "4.0",
            media: "Green",
        },
        1 => Company {
            id: 2,
            name: "株式会社B",
            status: "落選",
            priority: "2.0",
            media: "type",
        },
        2 => Company {
            id: 3,
            name: "株式会社C",
            status: "内定",
            priority: "5.0",
            media: "レバテック",
        },
    }

Collectionでは、こういう便利メソッドが使える。

    count()
    filter()
    where()
    sortBy()
    sortByDesc()
    take()
    values()

---

# 29. CollectionとJSONの関係

Reactは最終的にJSONとして返ってきたデータを扱う。

Laravel側では、DBから取ったデータをCollectionとして持っている。

そのため、Backend側ではCollectionをResourceで整形して、JSONとして返す。

流れ：

    DB
    ↓
    Company::query()->get()
    ↓
    Laravel Collection
    ↓
    filter / sortBy / take / values で加工
    ↓
    CompanyResource::collection(...)
    ↓
    resolve()
    ↓
    response()->json(...)
    ↓
    ReactでJSONとして扱う

受講者向けにはこう言う。

    LaravelではDBから取った複数データをCollectionとして扱います。
    Collectionは高機能な配列のようなもので、filter、sortBy、takeなどで加工できます。
    ただしReactへ返す時はJSONで返したいので、CompanyResourceで形を整え、必要に応じてresolve()で配列化してresponse()->json()に入れています。

---

# 30. filterの意味

    $interviewCompanies = $companies->filter(function ($company) {
        return $company->status === '面談予定'
            || $company->interview_date !== null;
    });

filterは、条件に合うものだけを残す処理。

ここでは、

    statusが面談予定
    または
    interview_dateが入っている

企業だけを残している。

SQLでいうWHEREに近いが、今回はDB取得後のCollectionに対してPHP側で絞り込んでいる。

---

# 31. in_arrayの意味

    return in_array($company->status, [
        '応募済み',
        '書類選考待ち',
        '面談日程調整中',
        '面談後返答待ち'
    ]);

in_arrayは、指定した値が配列の中に含まれているかを確認するPHP関数。

ここでは、

    会社のstatusが、確認待ちステータス一覧のどれかに含まれているか

を確認している。

つまり、

    応募済み
    書類選考待ち
    面談日程調整中
    面談後返答待ち

のどれかなら、waitingCompaniesに含める。

---

# 32. priorityをfloatにする意味

    return ((float) $company->priority >= 4.0);

priorityが文字列として入っている可能性があるため、数値比較できるようにfloatへ変換している。

例：

    "4.5" → 4.5

これにより、

    priorityが4.0以上の企業

を高優先度として扱える。

---

# 33. take(3) の意味

    ->take(3)

take(3)は、Collectionの先頭から3件だけ取り出す処理。

SQLのLIMIT 3に近い。

ただし違いがある。

    SQLのLIMIT
    → DBに対して3件だけ取得する

    Collectionのtake
    → すでに取得済みのCollectionから3件だけ取り出す

今回の流れ：

    面談予定企業をfilter
    ↓
    面談日順にsortBy
    ↓
    take(3)で上位3件だけ取得

講座ではこう言う。

    take(3)はSQLのLIMITに近いですが、今回はDB取得後のCollectionに対して使っています。
    先頭から3件だけ取り出す処理です。

---

# 34. values() の意味

    ->values()

values()は、Collectionのキーを0から振り直す処理。

filterやsortByを使うと、元のキー番号が残ることがある。

例：

    [
        0 => 'A社',
        1 => 'B社',
        2 => 'C社',
        3 => 'D社',
    ]

ここからB社とD社だけ残ると、

    [
        1 => 'B社',
        3 => 'D社',
    ]

のように、キーが1と3のまま残ることがある。

Reactへ返す時は普通の配列として扱いたいので、

    values()

で0から振り直す。

結果：

    [
        0 => 'B社',
        1 => 'D社',
    ]

講座ではこう言う。

    values()は、Reactへ配列として返しやすくするために、Collectionのキーを0から振り直す処理です。

---

# 35. resolve() の意味

    CompanyResource::collection(...)->resolve()

CompanyResource::collection(...) は、CompanyのCollectionをAPIレスポンス用の形に変換するResource Collectionを作る。

ただし今回は、

    return response()->json([
        'summary' => [...],
        'actionLists' => [
            'interview' => CompanyResource::collection(...)->resolve(),
        ],
    ]);

のように、summaryとactionListsを1つのJSONにまとめて返している。

このとき、actionListsの中だけCompanyResourceで整形した配列を入れたい。

そのため、

    ->resolve()

でResourceを実際の配列データに変換している。

講座ではこう言う。

    通常は return CompanyResource::collection($companies); のようにResourceをそのまま返せます。
    ただ今回は response()->json([...]) の中にsummaryとactionListsをまとめて入れています。
    そのため、actionListsの中身だけをResource変換した配列として入れたいので、resolve()を使っています。
    resolve()は、CompanyResourceで整形した結果を配列に変換する処理です。

---

# 36. actionListsの1ブロックを分解する

元のコード：

    'interview' => CompanyResource::collection(
        $interviewCompanies
            ->sortBy('interview_date')
            ->take(3)
            ->values()
    )->resolve(),

分解するとこう。

    // 面談予定の企業を、面談日の近い順に並べる
    $sortedInterviewCompanies = $interviewCompanies->sortBy('interview_date');

    // 上から3件だけ取り出す
    $limitedInterviewCompanies = $sortedInterviewCompanies->take(3);

    // Reactで扱いやすい配列にするため、キーを0から振り直す
    $reindexedInterviewCompanies = $limitedInterviewCompanies->values();

    // CompanyResourceを通して、APIレスポンス用の形に変換する
    $interviewActionList = CompanyResource::collection($reindexedInterviewCompanies)->resolve();

これを短く書いたものが、元のチェーン処理。

---

# 37. CompanyResourceを通す理由

DB側ではsnake_caseのカラム名を使うことが多い。

例：

    is_favorite
    applied_date
    interview_date

React側ではcamelCaseで扱いたい。

例：

    isFavorite
    appliedDate
    interviewDate

CompanyResourceを通すことで、DB用の形からReactで使いやすい形に変換できる。

つまり、

    DB用の形
    ↓
    CompanyResource
    ↓
    React用の形

という役割。

---

# 38. Dashboard ActionListsの講座台本

ここではDashboardに表示するActionListsを作っています。

まず、Company::query()->get()で企業一覧を取得します。

この時点で$companiesはLaravelのCollectionです。

Collectionは高機能な配列のようなもので、filter、sortBy、takeなどで加工できます。

面談予定の企業は、statusが面談予定、またはinterview_dateが入っている企業としてfilterしています。

確認待ちの企業は、statusが応募済み、書類選考待ち、面談日程調整中、面談後返答待ちのどれかに該当する企業です。

ここではin_arrayを使って、会社のstatusがその一覧に含まれているかを確認しています。

高優先度の企業は、priorityが4.0以上の企業です。

priorityは文字列として入っている可能性があるので、floatに変換してから比較しています。

ActionListsでは、それぞれの企業リストを並び替えて、take(3)で上位3件だけ取り出しています。

take(3)はSQLのLIMITに近いですが、今回はDB取得後のCollectionに対して使っています。

values()は、filterやsortByで残ったCollectionのキーを0から振り直す処理です。

Reactへ配列として返しやすくするために使っています。

最後にCompanyResource::collection(...)->resolve()で、CompanyResourceで整形した結果を配列に変換し、response()->json([...])の中に入れています。

ReactはJSONを扱うので、Backend側ではCollectionを加工し、Resourceで形を整え、JSONとして返す、という流れになります。

---

# 39. よくある詰まりポイント

## 詰まり1：Company::query() と $query->where() が混ざる

理解：

    Company::query()
    → 検索条件を組み立てる土台

    $query->where(...)
    → その土台に条件を追加

    $query->get()
    → 実行

## 詰まり2：なぜget()を最後にするのか

理由：

    先にget()すると全件取得してしまう。
    検索条件を追加してから取得したいので、get()は最後。

## 詰まり3：$request->filled() と $request->query() の違い

    filled()
    → 入っているかチェック

    query()
    → 値を取り出す

## 詰まり4：function ($innerQuery) use ($keyword) が謎

理解：

    function ($innerQuery)
    → OR条件をまとめるための無名関数

    use ($keyword)
    → 外側の$keywordを無名関数の中で使うためのPHPのルール

## 詰まり5：orWhereをwhereにしてしまう

orWhere：

    nameに含まれる
    または
    memoに含まれる

whereを2つ：

    nameに含まれる
    かつ
    memoにも含まれる

検索結果がかなり狭くなる。

## 詰まり6：FrontendでURLを作っただけで検索できた気になる

Frontendで、

    /api/companies?keyword=React

を作っても、Laravel側でRequestを見てwhereを追加していなければ全件取得のまま。

## 詰まり7：CollectionとJSONが混ざる

Laravel内部：

    Collectionで加工する

Reactへ返す：

    JSONで返す

間にCompanyResourceを挟んで、表示用の形に整える。

---

# 40. このセクションの最終説明

このセクションでは、JobHunt Liteに検索・絞り込み機能とDashboard用のActionListsを追加しました。

検索機能では、React側でkeyword、status、mediaをstateとして管理し、URLSearchParamsを使ってquery stringを作成しました。

そのURLに対してfetchでGETリクエストを送り、Laravel側ではRequestからquery parameterを受け取りました。

Laravel側ではCompany::query()で検索条件を組み立てる土台を作り、keyword、status、mediaが入力されている場合だけwhere条件を追加しました。

keyword検索では、企業名nameまたはメモmemoにkeywordが含まれる企業を検索したいため、where(function...)とorWhereを使ってOR条件をひとまとまりにしました。

最後にget()でDBから取得し、CompanyResourceを通してReactへ返しました。

Dashboardでは、DBから取得した企業一覧をCollectionとして扱い、filter、sortBy、take、valuesを使ってActionLists用のデータを作りました。

Reactへ返す時はJSONとして扱いたいので、CompanyResourceで形を整え、必要に応じてresolve()で配列化してresponse()->json()に入れました。

この流れにより、Reactの検索フォームからLaravel APIへ条件を送り、Backendで条件に合う企業だけを取得し、Frontendの一覧とDashboardに反映できるようになりました。

---

# 41. 録画前チェックリスト

## Backend検索

- Requestをimportしているか
- index(Request $request)になっているか
- Company::query()を使っているか
- 最後に$queryからgetしているか
- Company::latest()->get()のままになっていないか
- keyword検索でname / memoをorWhereしているか
- use ($keyword)を書いているか
- statusは完全一致になっているか
- mediaは部分一致になっているか
- Resourceで返しているか

## Frontend検索

- keyword stateがあるか
- status stateがあるか
- media stateがあるか
- input/selectのvalueとonChangeがつながっているか
- searchCompaniesがあるか
- URLSearchParamsを使っているか
- queryString付きURLを作っているか
- fetchのURLが正しいか
- json.dataをsetCompaniesしているか
- 条件クリアでstateを空にしてfetchCompaniesしているか

## Dashboard ActionLists

- CompanyDashboardControllerのuse App\Models\Company; が正しいか
- APP\Models\Companyになっていないか
- Company::query()->get()しているか
- filterで面談予定を作っているか
- in_arrayで確認待ちを作っているか
- priorityをfloat変換しているか
- sortBy / sortByDescしているか
- take(3)しているか
- values()しているか
- CompanyResource::collection(...)->resolve()しているか
- response()->jsonでsummaryとactionListsを返しているか

---

# 42. 受講者に最後に伝える一言

検索機能は、Reactのフォームだけで完成するわけではありません。

ReactでURLを作り、LaravelでRequestを受け取り、Company::query()にwhere条件を追加し、最後にget()で取得します。

そして、Laravel内部ではCollectionとして加工し、Reactへ返す時はJSONとして返します。

この流れが理解できると、Todoアプリの次の段階である、実務寄りのCRUD検索・Dashboard APIがかなり作りやすくなります。
