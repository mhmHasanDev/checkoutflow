<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FormController;
use App\Http\Controllers\WebhookController;

Route::get('/', function () {
    return response()->json(['app' => 'CheckoutFlow', 'status' => 'running', 'version' => '1.0.0']);
});

Route::get('/auth', [App\Http\Controllers\Auth\ShopifyAuthController::class, 'install']);
Route::get('/auth/callback', [App\Http\Controllers\Auth\ShopifyAuthController::class, 'callback']);

Route::prefix('webhooks')->group(function () {
    Route::post('/app/uninstalled', [WebhookController::class, 'appUninstalled']);
    Route::post('/customers/data-request', [WebhookController::class, 'customersDataRequest']);
    Route::post('/customers/redact', [WebhookController::class, 'customersRedact']);
});

// API routes - BEFORE SPA catch-all
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/forms', [FormController::class, 'index']);
    Route::post('/forms', [FormController::class, 'store']);
    Route::get('/forms/{form}', [FormController::class, 'show']);
    Route::put('/forms/{form}', [FormController::class, 'update']);
    Route::delete('/forms/{form}', [FormController::class, 'destroy']);
    Route::post('/forms/{form}/toggle', [FormController::class, 'toggle']);
    Route::post('/forms/{form}/duplicate', [FormController::class, 'duplicate']);
    Route::get('/forms/{form}/submissions', [App\Http\Controllers\Api\SubmissionController::class, 'index']);
});

// SPA catch-all - MUST BE LAST
Route::get('/admin/{any?}', function () {
    return view('admin.index');
})->where('any', '.*');