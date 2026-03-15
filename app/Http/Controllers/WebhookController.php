<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WebhookController extends Controller
{
    public function appUninstalled(Request $request): Response
    {
        if (!$this->verifyWebhook($request)) {
            return response('Unauthorized', 401);
        }

        $domain = $request->header('X-Shopify-Shop-Domain');
        $shop   = Shop::where('shopify_domain', $domain)->first();

        if ($shop) {
            $shop->forms()->delete();
            $shop->submissions()->delete();
            $shop->delete();
        }

        return response('OK', 200);
    }

    public function customersDataRequest(Request $request): Response
    {
        if (!$this->verifyWebhook($request)) {
            return response('Unauthorized', 401);
        }
        // GDPR: log the request — data is in submissions table
        return response('OK', 200);
    }

    public function customersRedact(Request $request): Response
    {
        if (!$this->verifyWebhook($request)) {
            return response('Unauthorized', 401);
        }

        $payload    = $request->json()->all();
        $customerId = $payload['customer']['id'] ?? null;

        if ($customerId) {
            \App\Models\Submission::where('customer_id', $customerId)->delete();
        }

        return response('OK', 200);
    }

    protected function verifyWebhook(Request $request): bool
    {
        $hmac    = $request->header('X-Shopify-Hmac-Sha256');
        $secret  = env('SHOPIFY_API_SECRET');
        $payload = $request->getContent();
        $hash    = base64_encode(hash_hmac('sha256', $payload, $secret, true));
        return hash_equals($hash, $hmac ?? '');
    }
}
