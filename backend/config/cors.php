<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Liệt kê chính xác domain của Frontend thay vì để dấu '*'
    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Bật true nếu Frontend có gửi Cookie, Header Authorization hoặc dùng Sanctum
    'supports_credentials' => true,

];