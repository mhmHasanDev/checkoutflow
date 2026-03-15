<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\Shop;
use App\Models\Submission;
use App\Jobs\SyncSubmissionToShopify;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubmissionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'form_id'     => 'required|exists:forms,id',
            'customer_id' => 'nullable|string',
            'order_id'    => 'nullable|string',
            'data'        => 'required|array',
        ]);

        $form = Form::findOrFail($validated['form_id']);
        $shop = $form->shop;

        if ($shop->hasReachedSubmissionLimit()) {
            return response()->json([
                'error' => 'Submission limit reached for this month.'
            ], 429);
        }

        $submission = Submission::create([
            'form_id'     => $form->id,
            'shop_id'     => $shop->id,
            'customer_id' => $validated['customer_id'] ?? null,
            'order_id'    => $validated['order_id'] ?? null,
            'data'        => $validated['data'],
        ]);

        // Dispatch job to sync with Shopify asynchronously
        SyncSubmissionToShopify::dispatch($submission);

        return response()->json([
            'success'    => true,
            'message'    => 'Submission saved successfully',
            'submission' => $submission->id,
        ], 201);
    }

    public function index(Form $form): JsonResponse
    {
        $submissions = $form->submissions()->latest()->paginate(20);
        return response()->json($submissions);
    }

    public function getActiveForm(Request $request): JsonResponse
    {
        $shop = Shop::where('shopify_domain', $request->get('shop'))->first();
        if (!$shop) return response()->json(['error' => 'Shop not found'], 404);

        $form = $shop->activeForms()->latest()->first();
        if (!$form) return response()->json(['form' => null]);

        return response()->json(['form' => $form]);
    }
}
