<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = DB::select('SHOW TABLES');
$dbName = DB::getDatabaseName();
$key = 'Tables_in_' . $dbName;

echo "DATABASE: " . $dbName . "\n";
echo str_repeat('-', 55) . "\n";

foreach ($tables as $t) {
    $arr = (array)$t;
    $name = reset($arr);
    $count = DB::table($name)->count();
    echo sprintf("%-35s : %6d rows\n", $name, $count);
}
