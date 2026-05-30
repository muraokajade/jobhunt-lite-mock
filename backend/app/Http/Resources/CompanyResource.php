<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// 企業データをフロントエンド向けに整形するResource
class CompanyResource extends JsonResource
{
    /**
     * 企業データをAPIレスポンス用に変換する
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // 企業ID
            'id' => $this->id,

            // 企業名
            'name' => $this->name,

            // 応募媒体
            'media' => $this->media,

            // 志望度
            'priority' => $this->priority,

            // 選考状況
            'status' => $this->status,

            // 応募日
            'appliedDate' => $this->applied_date,

            // 面談・面接予定日
            'interviewDate' => $this->interview_date,

            // 求人URL
            'jobUrl' => $this->job_url,

            // 面談・面接URL
            'interviewUrl' => $this->interview_url,

            // メモ
            'memo' => $this->memo,

            // 次にやること
            'nextAction' => $this->next_action,

            // 書類選考結果
            'documentResult' => $this->document_result,

            // 一次面接結果
            'firstInterviewResult' => $this->first_interview_result,

            // 二次面接結果
            'secondInterviewResult' => $this->second_interview_result,

            // 最終結果
            'finalResult' => $this->final_result,

            // 落選ステージ
            'rejectionStage' => $this->rejection_stage,

            // お気に入り状態
            'isFavorite' => (bool) $this->is_favorite,

            // 作成日時
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),

            // 更新日時
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}