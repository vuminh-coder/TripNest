<?php

// Fix SCRIPT_NAME and SCRIPT_FILENAME for Vercel Serverless so Symfony/Laravel doesn't strip /api as baseUrl
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/../public/index.php';

// Ensure writable temporary storage folders exist in AWS Lambda / Vercel Serverless environment
$tmpPaths = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/framework/cache',
    '/tmp/storage/logs',
    '/tmp/views',
    '/tmp/database',
];
foreach ($tmpPaths as $path) {
    if (!is_dir($path)) {
        @mkdir($path, 0777, true);
    }
}

// Copy sqlite database to /tmp if it exists so SQLite can read/write in serverless
$sourceDb = __DIR__ . '/../database/database.sqlite';
$tmpDb = '/tmp/database/database.sqlite';
if (file_exists($sourceDb) && !file_exists($tmpDb)) {
    @copy($sourceDb, $tmpDb);
}
if (!file_exists($tmpDb)) {
    @touch($tmpDb);
}

// Bootstrap Laravel application
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Auto-run migrations and seeders if tables are not yet created in serverless SQLite
try {
    if (!\Illuminate\Support\Facades\Schema::connection('sqlite')->hasTable('rooms')) {
        \Illuminate\Support\Facades\Artisan::call('migrate', [
            '--database' => 'sqlite',
            '--path' => 'database/migrations',
            '--force' => true,
        ]);
        \Illuminate\Support\Facades\Artisan::call('db:seed', [
            '--database' => 'sqlite',
            '--class' => 'Database\\Seeders\\DatabaseSeeder',
            '--force' => true,
        ]);
    }
} catch (\Throwable $e) {
    error_log('Auto migration/seed notice: ' . $e->getMessage());
}

// Handle HTTP Request
$app->handleRequest(\Illuminate\Http\Request::capture());
