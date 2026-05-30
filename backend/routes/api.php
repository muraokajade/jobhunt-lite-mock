<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\CompanyDashboardController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/companies/dashboard', [CompanyDashboardController::class, 'index']);
    Route::patch('/companies/{company}/favorite', [CompanyController::class, 'toggleFavorite']);
    Route::apiResource('/companies', CompanyController::class);
});