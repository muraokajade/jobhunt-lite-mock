<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Company;
use App\Http\Resources\CompanyResource;
use App\Http\Requests\StoreCompanyRequest;
use App\Http\Requests\updateCompanyRequest;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
/**
 * 企業一覧を取得する
 */
    public function index(Request $request)
    {

            //         ここで少し見慣れない書き方が出てきます。

            // まず Company::query() で、企業一覧を検索するための土台を作っています。
            // この時点ではまだDBから取得していません。

            // その後、$query->where(...) のように書くことで、
            // その土台に検索条件を追加していきます。

            // つまり Company::query() と $query->where(...) はセットで考えます。
            // Company::query() が土台作り、$query->where(...) が条件追加です。
            // 最後に $query->get() を呼んだタイミングでDBから取得します。

            // 次に keyword 検索です。

            // 今回は、企業名 name またはメモ memo にキーワードが含まれている企業を検索したいです。
            // SQLでいうと、

            // WHERE (
            // name LIKE '%React%'
            // OR memo LIKE '%React%'
            // )

            // のような条件です。

            // この OR 条件をひとまとまりにするために、
            // Laravelでは where(function ($innerQuery) { ... }) という書き方を使います。

            // $innerQuery は、このOR条件の中で使う内側のqueryです。
            // 名前は $q でも動きますが、今回はわかりやすく $innerQuery としています。

            // また、$keyword はこの無名関数の外で作った変数です。
            // PHPでは、外側の変数を無名関数の中で使う場合、
            // use ($keyword) と書く必要があります。

            // なのでここは、
            // 「OR条件をまとめるために function ($innerQuery) を使う」
            // 「外側の $keyword を中で使うために use ($keyword) を書く」
            // というLaravel/PHPの書き方として覚えてください。

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
            $query->where('status', $request->query('status'));
        }

        //
        // if ($request->filled('status')) {
        //     // URLの ?status=選考中 から「選考中」を取り出す
        //     $status = $request->query('status');

        //     // statusカラムが「選考中」の企業だけに絞り込む
        //     $query->where('status', $status);
        // }

        // media がURLに含まれている場合だけ、媒体名で部分一致検索する
        if ($request->filled('media')) {
            $query->where('media', 'like', '%' . $request->query('media') . '%');
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCompanyRequest $request)
    {
        $validated = $request->validated();

        $company = Company::create($validated);

        return new CompanyResource($company);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(updateCompanyRequest $request, Company $company)
    {
        $validated = $request->validated();

        $company->update($validated);

        return new CompanyResource($company);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company)
    {
        $company->delete();

        return response()->json([
            'message' => '企業を削除しました。'
        ]);
    }
    public function toggleFavorite(Company $company)
    {
        $company->is_favorite = ! (bool) $company->is_favorite;

        $company->save();

        //fresh?is_favorite を反転して保存した後の最新データを CompanyResource で返すために使っています。
        return new CompanyResource($company->fresh());
    }
}
