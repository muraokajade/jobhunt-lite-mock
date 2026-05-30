<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyStoreTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 企業を登録できることを確認する
     */
    public function test_user_can_store_company(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/companies', [
            'name' => '株式会社登録テスト',
            'media' => 'Green',
            'priority' => '4.0',
            'status' => '応募済み',
            'applied_date' => '2026-05-30',
            'job_url' => 'https://example.com/jobs/1',
            'memo' => 'React経験が活かせそう',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', '株式会社登録テスト');

        $this->assertDatabaseHas('companies', [
            'user_id' => $user->id,
            'name' => '株式会社登録テスト',
            'status' => '応募済み',
        ]);
    }

    /**
     * name未入力の場合422になることを確認する
     */
    public function test_store_company_requires_name(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/companies', [
            'name' => '',
            'media' => 'Green',
            'priority' => '3.0',
            'status' => '応募済み',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }
}