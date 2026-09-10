<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI Service Configuration for TripNest
    |--------------------------------------------------------------------------
    |
    | Hỗ trợ linh hoạt Google Gemini API, OpenAI hoặc Smart Fallback Engine.
    |
    */

    'provider' => env('AI_PROVIDER', 'gemini'),

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY', ''),
        'model' => env('GEMINI_MODEL', 'gemini-3.1-flash-lite'),
        'api_url' => env('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models'),
        'temperature' => (float) env('GEMINI_TEMPERATURE', 0.7),
        'max_tokens' => (int) env('GEMINI_MAX_TOKENS', 1500),
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY', ''),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        'api_url' => env('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions'),
        'temperature' => (float) env('OPENAI_TEMPERATURE', 0.7),
    ],

    /*
    |--------------------------------------------------------------------------
    | Data Security Whitelist & Blacklist Guardrails
    |--------------------------------------------------------------------------
    |
    | Cấu hình danh mục bảng dữ liệu được phép đọc và cấm tuyệt đối.
    |
    */
    'security' => [
        'forbidden_keywords' => [
            'mật khẩu', 'password', 'token', 'otp', 'ngân hàng', 'số tài khoản', 
            'stk', 'doanh thu sàn', 'hoa hồng host', 'payout', 'escrow', 
            'cccd', 'cmnd', 'admin', 'bị khóa', 'banned'
        ],
        'default_suggestions' => [
            'Tìm villa Đà Lạt săn mây cho gia đình 4-6 người',
            'Homestay Phú Quốc gần biển có bếp nấu ăn',
            'Có chỗ nghỉ nào ở Sa Pa có bồn tắm ngâm thảo mộc?',
            'Gợi ý tour chèo SUP hoặc trải nghiệm thú vị',
            'Hiện tại có mã giảm giá voucher nào áp dụng được?'
        ],
    ],
];
