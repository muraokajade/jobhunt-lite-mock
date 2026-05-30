<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use Illuminate\Http\Request;
use App\Models\Company;

class CompanyDashboardController extends Controller
{
    public function index() {
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
                                ->take(3)   //take(3) は、Collectionの中から先頭3件だけ取り出す処理です。SQLのLIMITに近いですが、今回はDB取得後のCollectionに対して使っています。
                                ->values() //Collectionのキー番号を0から振り直す。Reactへ配列として返しやすくするために、Collectionのキーを0から振り直す処理
                                
                )->resolve(), //CompanyResourceで整形した結果を、JSONに入れられる配列にする

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
        // LaravelではDBから取った複数データをCollectionとして扱います。
        // Collectionは高機能な配列のようなもので、filter、sortBy、takeなどで加工できます。
        // ただしReactへ返す時はJSONで返したいので、CompanyResourceで形を整え、必要に応じてresolve()で配列化してresponse()->json()に入れています。

    }
}
