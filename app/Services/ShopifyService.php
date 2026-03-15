<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShopifyService
{
    protected string $shop;
    protected string $accessToken;
    protected string $apiVersion = '2024-01';
    protected string $baseUrl;

    public function __construct()
    {
        $this->shop        = env('SHOPIFY_STORE', '');
        $this->accessToken = env('SHOPIFY_ACCESS_TOKEN', '');
        $this->baseUrl     = "https://{$this->shop}/admin/api/{$this->apiVersion}";
    }

    protected function headers(): array
    {
        return [
            'X-Shopify-Access-Token' => $this->accessToken,
            'Content-Type'           => 'application/json',
            'Accept'                 => 'application/json',
        ];
    }

    protected function get(string $endpoint, array $params = []): array
    {
        $response = Http::withHeaders($this->headers())
            ->get("{$this->baseUrl}/{$endpoint}", $params);
        return $this->handleResponse($response, $endpoint);
    }

    protected function post(string $endpoint, array $data = []): array
    {
        $response = Http::withHeaders($this->headers())
            ->post("{$this->baseUrl}/{$endpoint}", $data);
        return $this->handleResponse($response, $endpoint);
    }

    protected function put(string $endpoint, array $data = []): array
    {
        $response = Http::withHeaders($this->headers())
            ->put("{$this->baseUrl}/{$endpoint}", $data);
        return $this->handleResponse($response, $endpoint);
    }

    protected function handleResponse($response, string $endpoint): array
    {
        if ($response->failed()) {
            Log::error('Shopify API error', [
                'endpoint' => $endpoint,
                'status'   => $response->status(),
                'body'     => $response->body(),
            ]);
            return ['error' => $response->body(), 'status' => $response->status()];
        }
        return $response->json() ?? [];
    }

    public function getShopInfo(): array
    {
        return $this->get('shop.json');
    }

    public function verifyConnection(): bool
    {
        $response = $this->getShopInfo();
        return isset($response['shop']['id']);
    }

    public function getCustomer(string $customerId): array
    {
        return $this->get("customers/{$customerId}.json");
    }

    public function tagCustomer(string $customerId, array $newTags): array
    {
        $customer     = $this->getCustomer($customerId);
        $existingTags = isset($customer['customer']['tags'])
            ? explode(', ', $customer['customer']['tags']) : [];
        $allTags   = array_unique(array_merge($existingTags, $newTags));
        $tagString = implode(', ', array_filter($allTags));
        return $this->put("customers/{$customerId}.json", [
            'customer' => ['id' => $customerId, 'tags' => $tagString]
        ]);
    }

    public function setCustomerMetafield(string $customerId, string $key, string $value, string $type = 'single_line_text_field'): array
    {
        return $this->post("customers/{$customerId}/metafields.json", [
            'metafield' => ['namespace' => 'checkoutflow', 'key' => $key, 'value' => $value, 'type' => $type]
        ]);
    }

    public function getOrder(string $orderId): array
    {
        return $this->get("orders/{$orderId}.json");
    }

    public function appendOrderNote(string $orderId, string $note): array
    {
        $order        = $this->getOrder($orderId);
        $existingNote = $order['order']['note'] ?? '';
        $separator    = $existingNote ? "\n\n---\n" : '';
        $newNote      = $existingNote . $separator . $note;
        return $this->put("orders/{$orderId}.json", [
            'order' => ['id' => $orderId, 'note' => $newNote]
        ]);
    }

    public function setOrderMetafield(string $orderId, string $key, string $value, string $type = 'single_line_text_field'): array
    {
        return $this->post("orders/{$orderId}/metafields.json", [
            'metafield' => ['namespace' => 'checkoutflow', 'key' => $key, 'value' => $value, 'type' => $type]
        ]);
    }

    public function syncSubmission(array $submission): void
    {
        $data       = $submission['data'] ?? [];
        $customerId = $submission['customer_id'] ?? null;
        $orderId    = $submission['order_id'] ?? null;

        if ($customerId) {
            foreach ($data as $key => $value) {
                $this->setCustomerMetafield($customerId, $key,
                    is_array($value) ? implode(', ', $value) : (string) $value);
            }
            $tags = $this->resolveTagsFromData($data);
            if (!empty($tags)) $this->tagCustomer($customerId, $tags);
        }

        if ($orderId) {
            $note = $this->formatSubmissionAsNote($data);
            $this->appendOrderNote($orderId, $note);
            $this->setOrderMetafield($orderId, 'form_submission', json_encode($data), 'json');
        }
    }

    protected function resolveTagsFromData(array $data): array
    {
        $tags = [];
        if (isset($data['customer_type'])) {
            $typeMap = ['business' => 'B2B', 'virksomhed' => 'B2B', 'wholesale' => 'Wholesale', 'public' => 'Public-Institution', 'private' => 'B2C'];
            $type = strtolower($data['customer_type']);
            if (isset($typeMap[$type])) $tags[] = $typeMap[$type];
        }
        if (!empty($data['cvr_number'])) $tags[] = 'Has-CVR';
        if (!empty($data['vat_number'])) $tags[] = 'Has-VAT';
        if (!empty($data['ean_number'])) $tags[] = 'Has-EAN';
        return $tags;
    }

    protected function formatSubmissionAsNote(array $data): string
    {
        $lines = ["CheckoutFlow Form Submission:"];
        foreach ($data as $key => $value) {
            $label   = ucwords(str_replace('_', ' ', $key));
            $val     = is_array($value) ? implode(', ', $value) : $value;
            $lines[] = "• {$label}: {$val}";
        }
        return implode("\n", $lines);
    }
}
