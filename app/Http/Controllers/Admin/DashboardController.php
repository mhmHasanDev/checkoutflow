<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\Form;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $shop = Shop::where('shopify_domain', env('SHOPIFY_STORE'))->first();

        if (!$shop) {
            return response()->json(['error' => 'Shop not found'], 404);
        }

        return response()->json([
            'shop'              => $shop->shopify_domain,
            'plan'              => $shop->plan_name,
            'total_forms'       => $shop->forms()->count(),
            'active_forms'      => $shop->activeForms()->count(),
            'total_submissions' => $shop->submissions()->count(),
            'this_month'        => $shop->monthlySubmissionCount(),
            'limit_reached'     => $shop->hasReachedSubmissionLimit(),
        ]);
    }
}
