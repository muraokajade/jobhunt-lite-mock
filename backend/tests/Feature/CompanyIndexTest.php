<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyIndexTest extends TestCase
{
    use RefreshDatabase;

    /**
     * ログイン中ユーザーの企業一覧を取得できることを確認する
     */
    public function test_user_can_get_own_companies(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        Company::create([
            'user_id' => $user->id,
            'name' => '株式会社テスト',
            'media' => 'Green',
            'priority' => '3.0',
            'status' => '応募済み',
            'applied_date' => '2026-05-30',
        ]);

        $response = $this->getJson('/api/companies');

        $response->assertOk()
            ->assertJsonPath('data.0.name', '株式会社テスト');
    }

    /**
     * 他ユーザーの企業が一覧に表示されないことを確認する
     */
    public function test_user_cannot_see_other_user_companies(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Sanctum::actingAs($user);

        Company::create([
            'user_id' => $user->id,
            'name' => '自分の会社',
            'media' => 'Green',
            'priority' => '3.0',
            'status' => '応募済み',
        ]);

        Company::create([
            'user_id' => $otherUser->id,
            'name' => '他人の会社',
            'media' => 'type',
            'priority' => '5.0',
            'status' => '内定',
        ]);

        $response = $this->getJson('/api/companies');

        $response->assertOk();

        $names = collect($response->json('data'))->pluck('name');

        $this->assertTrue($names->contains('自分の会社'));
        $this->assertFalse($names->contains('他人の会社'));
    }
}