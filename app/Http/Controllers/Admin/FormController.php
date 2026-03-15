<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FormController extends Controller
{
    private function getShop(): ?Shop
    {
        return Shop::where('shopify_domain', env('SHOPIFY_STORE'))->first();
    }

    public function index(): JsonResponse
    {
        $shop  = $this->getShop();
        $forms = $shop ? $shop->forms()->latest()->get() : [];
        return response()->json(['forms' => $forms]);
    }

    public function store(Request $request): JsonResponse
    {
        $shop = $this->getShop();
        if (!$shop) return response()->json(['error' => 'Shop not found'], 404);

        if (!$shop->canAddForm()) {
            return response()->json(['error' => 'Form limit reached. Upgrade your plan.'], 403);
        }

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'fields'            => 'nullable|array',
            'conditional_rules' => 'nullable|array',
            'appearance'        => 'nullable|array',
            'is_active'         => 'boolean',
        ]);

        $form = $shop->forms()->create($validated);
        return response()->json(['form' => $form], 201);
    }

    public function show(Form $form): JsonResponse
    {
        return response()->json(['form' => $form]);
    }

    public function update(Request $request, Form $form): JsonResponse
    {
        $validated = $request->validate([
            'name'              => 'sometimes|string|max:255',
            'fields'            => 'nullable|array',
            'conditional_rules' => 'nullable|array',
            'appearance'        => 'nullable|array',
            'is_active'         => 'boolean',
        ]);

        $form->update($validated);
        return response()->json(['form' => $form]);
    }

    public function destroy(Form $form): JsonResponse
    {
        $form->delete();
        return response()->json(['message' => 'Form deleted successfully']);
    }

    public function toggle(Form $form): JsonResponse
    {
        $form->update(['is_active' => !$form->is_active]);
        return response()->json(['form' => $form, 'message' => 'Form status updated']);
    }

    public function duplicate(Form $form): JsonResponse
    {
        $newForm = $form->replicate();
        $newForm->name = $form->name . ' (Copy)';
        $newForm->save();
        return response()->json(['form' => $newForm], 201);
    }
}
