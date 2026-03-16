<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ScriptTagService
{
    private string $shop;
    private string $token;
    private string $apiBase;

    public function __construct(string $shop, string $token)
    {
        $this->shop    = $shop;
        $this->token   = $token;
        $this->apiBase = "https://{$shop}/admin/api/2024-01";
    }

    public function install(string $scriptUrl): array
    {
        // Remove existing CheckoutFlow script tags first
        $this->removeAll();

        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => $this->token,
            'Content-Type'           => 'application/json',
        ])->post("{$this->apiBase}/script_tags.json", [
            'script_tag' => [
                'event'   => 'onload',
                'src'     => $scriptUrl,
                'display_scope' => 'all',
            ]
        ]);

        return $response->json();
    }

    public function list(): array
    {
        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => $this->token,
        ])->get("{$this->apiBase}/script_tags.json");

        return $response->json('script_tags', []);
    }

    public function removeAll(): void
    {
        $tags = $this->list();
        foreach ($tags as $tag) {
            if (str_contains($tag['src'] ?? '', 'checkoutflow')) {
                Http::withHeaders([
                    'X-Shopify-Access-Token' => $this->token,
                ])->delete("{$this->apiBase}/script_tags/{$tag['id']}.json");
            }
        }
    }
}
