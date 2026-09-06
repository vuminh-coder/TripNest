<?php
$files = glob(__DIR__ . '/../database/seeders/*.php');
$files = array_merge($files, glob(__DIR__ . '/*.php'));

$allIds = [];
foreach ($files as $file) {
    $content = file_get_contents($file);
    if (preg_match_all('/photo-([0-9a-zA-Z_-]+)/', $content, $matches)) {
        foreach ($matches[1] as $id) {
            $allIds[$id] = true;
        }
    }
}

echo "Found " . count($allIds) . " unique Unsplash photo IDs in repository files.\n";
