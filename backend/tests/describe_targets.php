<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$targets = ['accommodations', 'rooms', 'accommodation_images', 'room_images', 'experiences', 'vouchers', 'reviews', 'amenities'];

foreach ($targets as $table) {
    echo "\n=== TABLE: {$table} ===\n";
    $columns = DB::select("DESCRIBE {$table}");
    foreach ($columns as $c) {
        echo sprintf("  %-25s %-20s %-8s %-6s %s\n", $c->Field, $c->Type, $c->Null, $c->Key, $c->Default ?? 'NULL');
    }
}
