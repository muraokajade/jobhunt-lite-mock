<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyUpdateDeleteTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 企業を更新できることを確認する
     */
    public function test_user_can_update_company(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $company = Company::create([
            'user_id' => $user->id,
            'name' => '更新前会社',
            'media' => 'Green',
            'priority' => '3.0',
            'status' => '応募済み',
            'applied_date' => '2026-05-30',
        ]);

        $response = $this->putJson("/api/companies/{$company->id}", [
            'name' => '更新後会社',
            'media' => 'type',
            'priority' => '4.0',
            'status' => '選考中',
            'applied_date' => '2026-05-30',
            'interview_date' => null,
            'job_url' => null,
            'interview_url' => null,
            'memo' => '更新済み',
            'next_action' => '面談準備',
            'document_result' => '未対応',
            'first_interview_result' => '未対応',
            'second_interview_result' => '未対応',
            'final_result' => '未対応',
            'rejection_stage' => '未設定',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', '更新後会社');

        $this->assertDatabaseHas('companies', [
            'id' => $company->id,
            'name' => '更新後会社',
            'status' => '選考中',
        ]);
    }

    /**
     * 企業を削除できることを確認する
     */
    public function test_user_can_delete_company(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $company = Company::create([
            'user_id' => $user->id,
            'name' => '削除対象会社',
            'media' => 'Green',
            'priority' => '3.0',
            'status' => '応募済み',
        ]);

        $response = $this->deleteJson("/api/companies/{$company->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('companies', [
            'id' => $company->id,
        ]);
    }
}