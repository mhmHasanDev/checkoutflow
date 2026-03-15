<?php

return [
    'shopify' => [
        'app_name'     => env('SHOPIFY_APP_NAME', 'CheckoutFlow'),
        'api_key'      => env('SHOPIFY_API_KEY'),
        'api_secret'   => env('SHOPIFY_API_SECRET'),
        'store'        => env('SHOPIFY_STORE'),
        'scopes'       => env('SHOPIFY_SCOPES'),
        'access_token' => env('SHOPIFY_ACCESS_TOKEN'),
    ],
];
