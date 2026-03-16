<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Services\ScriptTagService;
use Illuminate\Http\Request;

class ScriptTagController extends Controller
{
    public function install(Request $request)
    {
        $shop = Shop::where('shopify_domain', env('SHOPIFY_STORE'))->first();

        if (!$shop) {
            return response()->json(['error' => 'Shop not found'], 404);
        }

        $scriptUrl = env('APP_URL') . '/build/assets/' . $this->getModalFilename();

        $service  = new ScriptTagService($shop->shopify_domain, $shop->access_token);
        $result   = $service->install($scriptUrl);

        return response()->json([
            'success'    => true,
            'script_tag' => $result,
            'script_url' => $scriptUrl,
        ]);
    }

    public function status()
    {
        $shop = Shop::where('shopify_domain', env('SHOPIFY_STORE'))->first();

        if (!$shop) {
            return response()->json(['installed' => false]);
        }

        $service = new ScriptTagService($shop->shopify_domain, $shop->access_token);
        $tags    = $service->list();

        $installed = collect($tags)->contains(fn($tag) =>
            str_contains($tag['src'] ?? '', 'checkoutflow') ||
            str_contains($tag['src'] ?? '', 'modal')
        );

        return response()->json([
            'installed'   => $installed,
            'script_tags' => $tags,
        ]);
    }

    public function remove()
    {
        $shop = Shop::where('shopify_domain', env('SHOPIFY_STORE'))->first();

        if (!$shop) {
            return response()->json(['error' => 'Shop not found'], 404);
        }

        $service = new ScriptTagService($shop->shopify_domain, $shop->access_token);
        $service->removeAll();

        return response()->json(['success' => true, 'message' => 'Script tags removed']);
    }

    private function getModalFilename(): string
    {
        $manifest = public_path('build/manifest.json');
        if (file_exists($manifest)) {
            $data = json_decode(file_get_contents($manifest), true);
            foreach ($data as $key => $value) {
                if (str_contains($key, 'modal')) {
                    return $value['file'] ?? 'assets/modal.js';
                }
            }
        }
        return 'assets/modal.js';
    }
}
