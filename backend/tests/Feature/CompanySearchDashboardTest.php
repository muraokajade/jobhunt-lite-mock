<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanySearchDashboardTest extends TestCase
{
    use RefreshDatabase;

    /**
     * keywordで検索できることを確認する
     */
    public function test_user_can_search_companies_by_keyword(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        Company::create([
            'user_id' => $user->id,
            'name' => 'React株式会社',
            'media' => 'Green',
            'priority' => '3.0',
            'status' => '応募済み',
            'memo' => 'React経験が活かせる',
        ]);

        Company::create([
            'user_id' => $user->id,
            'name' => 'Laravel株式会社',
            'media' => 'type',
            'priority' => '3.0',
            'status' => '応募済み',
            'memo' => 'PHP案件',
        ]);

        $response = $this->getJson('/api/companies?' . http_build_query([
            'keyword' => 'React',
        ]));

        $response->assertOk();

        $names = collect($response->json('data'))->pluck('name');

        $this->assertTrue($names->contains('React株式会社'));
        $this->assertFalse($names->contains('Laravel株式会社'));
    }

    /**
     * statusで検索できることを確認する
     */
    public function test_user_can_search_companies_by_status(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        Company::create([
            'user_id' => $user->id,
            'name' => '応募済み会社',
            'media' => 'Green',
            'priority' => '3.0',
            'status' => '応募済み',
        ]);

        Company::create([
            'user_id' => $user->id,
            'name' => '内定会社',
            'media' => 'type',
            'priority' => '5.0',
            'status' => '内定',
        ]);

        $response = $this->getJson('/api/companies?' . http_build_query([
            'status' => '内定',
        ]));

        $response->assertOk();

        $names = collect($response->json('data'))->pluck('name');

        $this->assertTrue($names->contains('内定会社'));
        $this->assertFalse($names->contains('応募済み会社'));
    }

    /**
     * mediaで検索できることを確認する
     */
    public function test_user_can_search_companies_by_media(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        Company::create([
            'user_id' => $user->id,
            'name' => 'Green会社',
            'media' => 'Green',
            'priority' => '3.0',
            'status' => '応募済み',
        ]);

        Company::create([
            'user_id' => $user->id,
            'name' => 'type会社',
            'media' => 'type',
            'priority' => '3.0',
            'status' => '応募済み',
        ]);

        $response = $this->getJson('/api/companies?' . http_build_query([
            'media' => 'Green',
        ]));

        $response->assertOk();

        $names = collect($response->json('data'))->pluck('name');

        $this->assertTrue($names->contains('Green会社'));
        $this->assertFalse($names->contains('type会社'));
    }

    /**
     * Dashboard summaryとActionListsが返ることを確認する
     */
    public function test_user_can_get_dashboard_summary_and_action_lists(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        Company::create([
            'user_id' => $user->id,
            'name' => '面談予定会社',
            'media' => 'Green',
            'priority' => '4.5',
            'status' => '面談予定',
            'interview_date' => '2026-06-01 10:00:00',
        ]);

        Company::create([
            'user_id' => $user->id,
            'name' => '確認待ち会社',
            'media' => 'type',
            'priority' => '3.0',
            'status' => '応募済み',
        ]);

        Company::create([
            'user_id' => $user->id,
            'name' => '内定会社',
            'media' => 'レバテック',
            'priority' => '5.0',
            'status' => '内定',
        ]);

        $response = $this->getJson('/api/companies/dashboard');

        $response->assertOk()
            ->assertJsonPath('summary.total', 3)
            ->assertJsonPath('summary.interview', 1)
            ->assertJsonPath('summary.waiting', 1)
            ->assertJsonPath('summary.offer', 1)
            ->assertJsonPath('summary.highPriority', 2)
            ->assertJsonStructure([
                'summary',
                'actionLists' => [
                    'interview',
                    'waiting',
                    'highPriority',
                ],
            ]);
    }
}