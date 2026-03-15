<?php

namespace Database\Seeders;

use App\Models\Shop;
use Illuminate\Database\Seeder;

class ShopSeeder extends Seeder
{
    public function run(): void
    {
        Shop::updateOrCreate(
            ['shopify_domain' => env('SHOPIFY_STORE', 'groomieclub-2.myshopify.com')],
            [
                'access_token' => env('SHOPIFY_ACCESS_TOKEN', ''),
                'plan_name'    => 'free',
                'plan_status'  => 'active',
            ]
        );
    }
}