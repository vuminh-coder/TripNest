<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "--- AMENITIES ---\n";
$amns = DB::table('amenities')->get();
foreach ($amns as $a) {
    echo sprintf("%-20s | %-30s | %s\n", $a->code, $a->name_vi, $a->category);
}

echo "\n--- CATEGORIES ---\n";
$cats = DB::table('categories')->get();
foreach ($cats as $c) {
    echo sprintf("%-4d | %-20s | %-30s | %s\n", $c->id, $c->slug, $c->label_vi, $c->icon);
}

echo "\n--- HOSTS ---\n";
$hosts = DB::table('hosts')->get();
foreach ($hosts as $h) {
    echo sprintf("%-4d | %-30s | %s\n", $h->id, $h->host_display_name, $h->kyc_status);
}
