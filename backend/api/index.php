<?php

// Ensure writable temporary storage folders exist in AWS Lambda / Vercel Serverless environment
$tmpPaths = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/framework/cache',
    '/tmp/storage/logs',
    '/tmp/views',
];
foreach ($tmpPaths as $path) {
    if (!is_dir($path)) {
        @mkdir($path, 0777, true);
    }
}

// Forward execution to standard Laravel entry point
require __DIR__ . '/../public/index.php';
