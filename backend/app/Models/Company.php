<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    /** @use HasFactory<\Database\Factories\CompanyFactory> */
    use HasFactory;

        protected $fillable = [
        'user_id',
        'name',
        'media',
        'priority',
        'status',
        'applied_date',
        'interview_date',
        'job_url',
        'interview_url',
        'memo',
        'next_action',
        'document_result',
        'first_interview_result',
        'second_interview_result',
        'final_result',
        'rejection_stage',
        'is_favorite'

    ];
}
