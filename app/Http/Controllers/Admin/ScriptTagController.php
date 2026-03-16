<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Services\ScriptTagService;

class ScriptTagController extends Controller
{
    private function getShop()
    {
        return Shop::where('shopify_domain', env('SHOPIFY_STORE'))->first();
    }

    private function getScriptUrl(): string
    {
        $appUrl = env('APP_URL', 'https://checkoutflow.onrender.com');
        $manifest = public_path('build/manifest.json');
        if (file_exists($manifest)) {
            $data = json_decode(file_get_contents($manifest), true);
            foreach ($data as $key => $value) {
                if (str_contains($key, 'modal')) {
                    return $appUrl . '/build/' . ($value['file'] ?? 'assets/modal.js');
                }
            }
        }
        return $appUrl . '/build/assets/modal.js';
    }

    public function install()
    {
        $shop = $this->getShop();
        if (!$shop) return response()->json(['error' => 'Shop not found'], 404);

        $scriptUrl = $this->getScriptUrl();
        $service = new ScriptTagService($shop->shopify_domain, $shop->access_token);
        $result = $service->install($scriptUrl);

        return response()->json(['success' => true, 'script_url' => $scriptUrl, 'result' => $result]);
    }

    public function status()
    {
        $shop = $this->getShop();
        if (!$shop) return response()->json(['installed' => false]);

        $service = new ScriptTagService($shop->shopify_domain, $shop->access_token);
        $tags = $service->list();

        $appUrl = env('APP_URL', 'https://checkoutflow.onrender.com');
        $domain = parse_url($appUrl, PHP_URL_HOST);

        $installed = collect($tags)->contains(function($tag) use ($domain) {
            return str_contains($tag['src'] ?? '', $domain);
        });

        return response()->json(['installed' => $installed, 'count' => count($tags)]);
    }

    public function remove()
    {
        $shop = $this->getShop();
        if (!$shop) return response()->json(['error' => 'Shop not found'], 404);

        $service = new ScriptTagService($shop->shopify_domain, $shop->access_token);
        $service->removeAll();

        return response()->json(['success' => true]);
    }
}
