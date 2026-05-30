<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\CompanyDashboardController; 

Route::get('companies/dashboard', [CompanyDashboardController::class, 'index']);
Route::patch('companies/{company}/favorite', [CompanyController::class, 'toggleFavorite']);
Route::apiResource('companies', CompanyController::class);

Route::get('/hello', function () { return response()->json(['message' => 'Hello JobHunt API']); });