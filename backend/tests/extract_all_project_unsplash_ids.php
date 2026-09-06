<?php
$scanPaths = [
    __DIR__ . '/../database/seeders',
    __DIR__ . '/../app',
    __DIR__ . '/../../frontend/src',
];

$allIds = [];
foreach ($scanPaths as $path) {
    if (!is_dir($path)) continue;
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));
    foreach ($iterator as $file) {
        if ($file->isFile() && preg_match('/\.(php|js|jsx|json)$/', $file->getFilename())) {
            $content = file_get_contents($file->getPathname());
            if (preg_match_all('/photo-([0-9a-zA-Z_-]{10,40})/', $content, $matches)) {
                foreach ($matches[1] as $id) {
                    $allIds[$id] = true;
                }
            }
        }
    }
}

echo "Total unique Unsplash photo IDs found: " . count($allIds) . "\n";
file_put_contents(__DIR__ . '/extracted_ids.json', json_encode(array_keys($allIds), JSON_PRETTY_PRINT));
