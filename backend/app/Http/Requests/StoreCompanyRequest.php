<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// 企業登録時の入力値を検証するRequest
class StoreCompanyRequest extends FormRequest
{
    /**
     * このリクエストを実行できるかどうかを判定する
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * 企業登録時のバリデーションルールを定義する
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'media' => ['nullable', 'string', 'max:255'],
            'priority' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'max:255'],
            'applied_date' => ['nullable', 'date'],
            'interview_date' => ['nullable', 'date'],
            'job_url' => ['nullable', 'string', 'max:2048'],
            'interview_url' => ['nullable', 'string', 'max:2048'],
            'memo' => ['nullable', 'string'],
            'next_action' => ['nullable', 'string', 'max:255'],
            'document_result' => ['nullable', 'string', 'max:255'],
            'first_interview_result' => ['nullable', 'string', 'max:255'],
            'second_interview_result' => ['nullable', 'string', 'max:255'],
            'final_result' => ['nullable', 'string', 'max:255'],
            'rejection_stage' => ['nullable', 'string', 'max:255'],
            'is_favorite' => ['nullable', 'boolean'],
        ];
    }
}