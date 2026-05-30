<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class updateCompanyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
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
