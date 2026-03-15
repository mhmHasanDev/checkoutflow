<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SubmissionController;

// ──────
// Storefront API (called from JS widget)
// ───────────────
Route::prefix('v1')->group(function () {

    // Get active form for a shop
    Route::get('/form', [SubmissionController::class, 'getActiveForm']);

    // Submit form data
    Route::post('/submit', [SubmissionController::class, 'store']);

});
