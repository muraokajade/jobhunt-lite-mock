# Last Check 5/31 Answer

## 今日はスピード一択。即コーディング開始する日の判断メモ

---

# 0. 今日の結論

今日は「迷って設計を広げる日」ではなく、最後のUX調整を最小限だけ入れて、音なし収録に入る日。

優先順位はこれ。

1. 壊れている・違和感が強いUXだけ直す
2. 収録で説明しやすい状態にする
3. 完璧なプロダクト化は後回し
4. toast / pagination / もっと見る / 高度なソートは必要最小限
5. 今日は本番収録へ進む

合言葉：

今日の勝ちは「完成度100点」ではなく「収録できる状態」。

---

# 1. インライン更新でActionListが即時反映されない問題

## Answer

これは直した方がいい。

理由は、受講者目線でも実アプリ目線でも違和感が大きいから。

例えば、企業一覧でstatusを「応募済み」から「内定」に変えたのに、DashboardやActionListが古いままだと「更新できてない？」と見える。

## 方針

インライン更新後に fetchDashboard() を呼ぶ。

対象：

- priority変更
- status変更
- favorite変更
- update
- delete
- create

## 最小修正

handlePriorityChange の成功後：

await fetchCompanies();
await fetchDashboard();

handleStatusChange の成功後：

await fetchCompanies();
await fetchDashboard();

toggleFavorite の成功後：

await fetchCompanies();
await fetchDashboard();

handleUpdateCompany の成功後：

await fetchCompanies();
await fetchDashboard();

handleDelete の成功後：

await fetchCompanies();
await fetchDashboard();

createCompany の成功後：

setCompaniesで即時追加
await fetchDashboard();

## 収録で言うこと

企業一覧だけでなくDashboardやActionListも同じデータを元にしているため、更新後は再取得します。
これにより、一覧・集計・次に確認する企業リストの表示ズレを防ぎます。

---

# 2. ActionListが3件しか見えない問題

## Answer

今は take(3) のままでOK。

理由は、DashboardのActionListは「全件一覧」ではなく「次に確認する候補」を見せる場所だから。

3件は現実的にちょうどいい。

## 判断

今やらない：

- もっと見る
- 5件表示切り替え
- ActionList専用ページ
- 開閉UI

今やる：

- 3件表示の意図を説明する
- 全件は企業一覧で見る

## 収録で言うこと

ActionListは全件表示ではなく、Dashboard上で優先的に確認したい企業を最大3件だけ表示します。
全企業は下の企業一覧で確認できるため、Dashboardでは情報量を絞っています。

## 将来改善

- 「もっと見る」ボタン
- 5件表示
- ActionList専用ページ
- 条件別フィルタ

これはPro版や改善案でよい。

---

# 3. 一覧表示は10件までにするか、ページングするか

## Answer

今日はやらない。

理由は、ページングはコストが高い。
Laravel側のpaginate、React側のページ番号管理、検索条件との組み合わせが入って、収録前に重くなる。

## 現時点の判断

一覧は全件表示のままでOK。

ただし、講座内では「今後の改善案」として触れる。

## 収録で言うこと

今回は学習用のJobHunt Liteなので、一覧はシンプルに全件表示しています。
実運用で件数が増える場合は、paginationや「もっと見る」を追加するとよいです。

## 将来改善

- Laravel paginate()
- Reactでページ番号state
- 検索条件とページングの連動
- 10件ずつ表示
- 「もっと見る」形式

今日は実装しない。

---

# 4. 検索フォームがあるから一覧制御は不要か

## Answer

現時点では、検索フォームがあるので一覧制御は後回しでOK。

検索できるなら、データが増えても最低限は探せる。

## 判断

今のJobHunt Liteでは、

- keyword検索
- status絞り込み
- media絞り込み

がある。

そのため、ページングより先に検索機能を教材として見せる方が価値が高い。

## 収録で言うこと

件数が増えた場合、ページングやもっと見るも選択肢になります。
ただし今回は、まず検索・絞り込みで目的の企業にたどり着ける形を優先しています。

---

# 5. 一覧のソート機能、日付順 asc / desc

## Answer

今日はやらない。

理由は、検索・Dashboard・ActionList・認証・Feature Testまで既に教材として十分重い。
ここでソートUIを追加すると、説明が散る。

## 今のままでOKな理由

Backend側で既に並び順を決めている。

- 面談日ありを優先
- 面談日が近い順
- 作成日が新しい順

この設計で十分。

## 収録で言うこと

一覧の並び順はBackend側で指定しています。
面談日がある企業を優先し、面談日順、その後は作成日の新しい順で表示します。

## 将来改善

- 応募日順
- 面談日順
- 志望度順
- 作成日順
- asc / desc切り替え

これは拡張課題でよい。

---

# 6. alertをtoastにするか

## Answer

できればやる。
ただし、時間がなければ後回し。

優先度は中。

alertは教材としては悪くない。
ただし、見た目とUXはtoastの方が自然。

## 今日の判断

時間があるなら、登録・更新・削除だけtoastにする。

対象：

- 登録成功
- 更新成功
- 削除成功
- ログイン失敗
- 登録失敗

ただし、toastライブラリ導入で詰まりそうならやらない。

## 最小実装案

ライブラリなしで簡易toast stateを作る。

toastMessage stateを作る。
成功時に setToastMessage("登録しました")。
数秒後に消す。

## 収録で言うこと

今回はシンプルにalertで動作確認しています。
実運用ではtoastにすると、画面遷移を邪魔せず自然に通知できます。

## 結論

今日の本番収録優先なら、alertのままでもOK。
余裕があれば簡易toast。

---

# 7. UX修正後に音なし収録するか

## Answer

する。

今日は音なし収録でOK。

理由：

- コーディングしながら喋ると負荷が高い
- 既に3周している
- 後入れ音声の方が説明が整理できる
- 今はスピード一択

## 収録方針

1. 画面録画だけする
2. 詰まっても止めすぎない
3. ミスった箇所はメモ
4. 後で音声を入れる
5. 補足はmd / スライドで入れる

## 収録中のルール

- 完璧なタイピングを狙わない
- TailwindはコピペでOK
- 詰まったら一旦飛ばす
- 後で編集・補足する

---

# 8. どこまでコピペするか

## Answer

ロジックは手書き寄り。
Tailwind / JSXの見た目はコピペでOK。

## 判断基準

手書きするもの：

- state
- props
- fetch
- API接続
- handle関数
- 型定義
- Laravel Controller
- Request
- Resource
- Feature Testの重要部分

コピペするもの：

- Tailwind className
- 長いJSXレイアウト
- Header
- Modalの見た目
- Login/Registerの見た目
- select optionの大量部分

## 理由

受講者が学ぶべきなのは、見た目のclassNameではなく、

- データの流れ
- APIとの接続
- state管理
- 認証
- 本人データ分離
- テスト

だから。

## 収録で言うこと

Tailwindの見た目部分は本質ではないため、ここは完成コードを貼り付けます。
このセクションでは、state、props、API通信、認証などの処理の流れを重点的に見ます。

---

# 9. JSX全コピペすると赤だらけになる問題

## Answer

JSX全コピペは危険。
セクションごとに小さく貼る。

## 方針

いきなり完成形を全部貼らない。

分割する。

1. 最小の枠だけ作る
2. stateを作る
3. propsを渡す
4. map表示する
5. eventをつなぐ
6. 最後にTailwindを貼る

## mockを使うか

使ってOK。

特にDashboardやActionListは、API接続前にmockで見た目確認してもよい。

ただし、教材の流れとしては、

mock
↓
API接続
↓
実データ表示

にする。

## 収録で言うこと

大きなJSXを一気に貼ると、未定義の変数やpropsで赤くなりやすいです。
そのため、まずは最小構成で表示し、必要なstateやpropsを作ってから見た目を整えます。

---

# 10. セクション始まりにPPT図解を入れるか

## Answer

入れた方がいい。
ただし、今すぐ完璧なPPTを作らなくていい。

## 最小構成

各セクション冒頭に1枚だけ図解。

例：

- この章で作るもの
- データの流れ
- 完成後の画面
- 受講者が理解すべきポイント

## 例：検索セクション

React input
↓
URLSearchParams
↓
/api/companies?keyword=React
↓
Laravel Request
↓
Company::query()
↓
where
↓
CompanyResource
↓
React setCompanies

## 例：認証セクション

register / login
↓
token発行
↓
localStorage保存
↓
Authorization: Bearer token
↓
auth:sanctum
↓
Auth::id()
↓
本人データ取得

## 収録で言うこと

最初に全体像を見てから実装に入ります。
細かいコードに入る前に、どのデータがどこへ流れるかを確認しておきます。

---

# 11. セクション最後にもう一度確認するか

## Answer

やる。
これはかなり重要。

## 理由

受講者はコードを書いている途中で目的を見失いやすい。
最後に「何ができるようになったか」を確認すると理解が残る。

## セクション最後の型

1. 今作ったもの
2. どのファイルを触ったか
3. データの流れ
4. よくあるミス
5. 次のセクションでやること

## 例

このセクションでは、Reactの検索フォームからLaravel APIへ検索条件を送り、企業一覧を絞り込めるようにしました。
次のセクションでは、この企業データを使ってDashboard集計を表示していきます。

---

# 12. 次のセクションのモチベを上げるか

## Answer

やる。

これはUdemy教材として大事。

## 理由

受講者は「次に何ができるようになるか」が見えると継続しやすい。

## 例文

次のセクションでは、ただ一覧を表示するだけでなく、応募総数や面談予定などをDashboardカードとして表示していきます。
アプリらしさが一気に出る部分なので、ここからかなり実務CRUDっぽくなります。

## 各章の引き

検索 → Dashboardへ

検索できるようになったので、次は企業データを集計してDashboardに表示します。

Dashboard → ActionListへ

件数だけでなく、次に確認すべき企業をリスト化して、より実用的な画面にしていきます。

ActionList → 認証へ

アプリとして使うには、ユーザーごとにデータを分ける必要があります。次はSanctum認証を追加します。

認証 → Feature Testへ

認証と本人データ分離まで入ったので、最後にAPI全体が壊れていないかFeature Testで確認します。

---

# 13. 今日やるUX修正の優先順位

## 必須

1. 更新後にfetchDashboardする
2. fetchDashboardにAuthorizationが付いているか確認
3. useEffectがauthToken依存になっているか確認
4. createCompanyがvalidated + user_idで保存できるか確認
5. Feature Testが通る状態を維持

## できれば

6. alertを簡易toastにする
7. Header / navの表示崩れ確認
8. 空配列時の文言確認
9. ActionListの3件表示説明を用意

## やらない

10. pagination
11. もっと見る
12. asc / descソート
13. Cursor
14. 新機能追加
15. 大規模UI改修

---

# 14. 今日の実装順

## Step 1

更新後のDashboard再取得を入れる。

対象：

- createCompany
- handleUpdateCompany
- handleDelete
- handlePriorityChange
- handleStatusChange
- toggleFavorite

## Step 2

画面で以下を確認。

- 登録後に一覧が増える
- 登録後にDashboardが変わる
- status変更でActionListが変わる
- priority変更で高優先度が変わる
- 削除後にDashboardが変わる

## Step 3

Feature Testを流す。

php artisan test

## Step 4

音なし収録開始。

最初は完成物紹介から。

---

# 15. 収録前の最終チェック

## Backend

- php artisan test が通る
- /api/register が通る
- /api/login が通る
- /api/companies が通る
- /api/companies/dashboard が通る
- user_idで本人データ分離できる
- 他人データ操作は403

## Frontend

- Loginできる
- Registerできる
- Logoutできる
- 企業登録できる
- 一覧表示できる
- 検索できる
- Dashboard表示できる
- ActionList表示できる
- 更新・削除できる

## 教材

- セクション冒頭で何を作るか言う
- Tailwindはコピペでよい
- ロジックは説明する
- セクション最後に復習する
- 次の章への期待を作る

---

# 16. 今日の判断まとめ

## やる

- ActionList即時反映
- Dashboard再取得
- 認証後の動作確認
- Feature Test維持
- 音なし収録

## やってもよい

- 簡易toast
- 空表示文言
- md仮原稿
- 章冒頭の図解メモ

## やらない

- pagination
- もっと見る
- ソートUI
- Cursor
- 新機能
- 完璧なPPT
- 完璧な販売戦略

---

# 17. 最終Answer

今日はスピード一択。

UXの違和感で最低限直すのは、更新後にDashboard / ActionListが即時反映されない問題だけ。

ActionListの3件表示はそのままでOK。
一覧のpagination、もっと見る、ソートは後回し。
toastは余裕があれば。
Tailwindと長いJSXはコピペでOK。
ロジックは手書き・説明対象。

セクション冒頭に図解、最後に復習、次セクションのモチベ上げはUdemy教材としてかなり有効。

今日の勝ちは、完璧なアプリではなく、収録できる教材状態に入ること。
