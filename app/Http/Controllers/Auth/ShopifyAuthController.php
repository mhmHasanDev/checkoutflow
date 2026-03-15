<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ShopifyAuthController extends Controller
{
    public function install(Request $request)
    {
        $shop = $request->query('shop');
        if (!$shop) return response('Missing shop parameter', 400);

        $shop = $this->sanitizeShop($shop);
        $scopes = env('SHOPIFY_SCOPES', 'read_customers,write_customers,read_orders,write_orders');
        $redirectUri = env('APP_URL') . '/auth/callback';
        $nonce = bin2hex(random_bytes(16));
        session(['shopify_nonce' => $nonce]);

        $authUrl = "https://{$shop}/admin/oauth/authorize?" . http_build_query([
            'client_id'    => env('SHOPIFY_API_KEY'),
            'scope'        => $scopes,
            'redirect_uri' => $redirectUri,
            'state'        => $nonce,
        ]);

        return redirect($authUrl);
    }

    public function callback(Request $request)
    {
        $shop  = $request->query('shop');
        $code  = $request->query('code');
        $state = $request->query('state');
        $hmac  = $request->query('hmac');

        if (!$this->verifyHmac($request->query->all())) {
            return response('Invalid HMAC', 403);
        }

        $shop = $this->sanitizeShop($shop);

        // Exchange code for access token
        $response = Http::post("https://{$shop}/admin/oauth/access_token", [
            'client_id'     => env('SHOPIFY_API_KEY'),
            'client_secret' => env('SHOPIFY_API_SECRET'),
            'code'          => $code,
        ]);

        if (!$response->successful()) {
            return response('Failed to get access token', 400);
        }

        $accessToken = $response->json('access_token');

        // Save or update shop
        $shopModel = Shop::updateOrCreate(
            ['shopify_domain' => $shop],
            [
                'access_token' => $accessToken,
                'plan_name'    => 'free',
                'plan_status'  => 'active',
            ]
        );

        // Register required webhooks
        $this->registerWebhooks($shop, $accessToken);

        // Redirect to admin dashboard
        return redirect("https://{$shop}/admin/apps/" . env('SHOPIFY_API_KEY'));
    }

    protected function registerWebhooks(string $shop, string $token): void
    {
        $appUrl   = env('APP_URL');
        $webhooks = [
            ['topic' => 'app/uninstalled',        'address' => $appUrl . '/webhooks/app/uninstalled'],
            ['topic' => 'customers/data_request', 'address' => $appUrl . '/webhooks/customers/data-request'],
            ['topic' => 'customers/redact',       'address' => $appUrl . '/webhooks/customers/redact'],
        ];

        foreach ($webhooks as $webhook) {
            Http::withHeaders([
                'X-Shopify-Access-Token' => $token,
                'Content-Type'           => 'application/json',
            ])->post("https://{$shop}/admin/api/2024-01/webhooks.json", [
                'webhook' => [
                    'topic'   => $webhook['topic'],
                    'address' => $webhook['address'],
                    'format'  => 'json',
                ]
            ]);
        }
    }

    protected function verifyHmac(array $params): bool
    {
        $hmac   = $params['hmac'] ?? '';
        $secret = env('SHOPIFY_API_SECRET');
        unset($params['hmac']);
        ksort($params);
        $message   = http_build_query($params);
        $calculated = hash_hmac('sha256', $message, $secret);
        return hash_equals($calculated, $hmac);
    }

    protected function sanitizeShop(string $shop): string
    {
        $shop = strtolower(trim($shop));
        if (!str_contains($shop, '.myshopify.com')) {
            $shop .= '.myshopify.com';
        }
        return preg_replace('/[^a-z0-9\-\.]/i', '', $shop);
    }
}
