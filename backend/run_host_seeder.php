<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Running HostAccountSeeder...\n";
$seeder = new Database\Seeders\HostAccountSeeder();
$seeder->run();
echo "HostAccountSeeder completed successfully!\n";
