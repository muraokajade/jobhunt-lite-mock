<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 他人の企業を更新できないことを確認する
     */
    public function test_user_cannot_update_other_user_company(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Sanctum::actingAs($user);

        $company = Company::create([
            'user_id' => $otherUser->id,
            'name' => '他人の会社',
            'media' => 'Green',
            'priority' => '3.0',
            'status' => '応募済み',
        ]);

        $response = $this->putJson("/api/companies/{$company->id}", [
            'name' => '不正更新',
            'media' => 'type',
            'priority' => '5.0',
            'status' => '内定',
        ]);

        $response->assertForbidden();
    }

    /**
     * 他人の企業を削除できないことを確認する
     */
    public function test_user_cannot_delete_other_user_company(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Sanctum::actingAs($user);

        $company = Company::create([
            'user_id' => $otherUser->id,
            'name' => '他人の会社',
            'media' => 'Green',
            'priority' => '3.0',
            'status' => '応募済み',
        ]);

        $response = $this->deleteJson("/api/companies/{$company->id}");

        $response->assertForbidden();
    }

    /**
     * 他人の企業のお気に入りを変更できないことを確認する
     */
    public function test_user_cannot_toggle_favorite_other_user_company(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Sanctum::actingAs($user);

        $company = Company::create([
            'user_id' => $otherUser->id,
            'name' => '他人の会社',
            'media' => 'Green',
            'priority' => '3.0',
            'status' => '応募済み',
        ]);

        $response = $this->patchJson("/api/companies/{$company->id}/favorite");

        $response->assertForbidden();
    }
}