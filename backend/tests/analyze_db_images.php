<?php
$data = json_decode(file_get_contents(__DIR__ . '/db_distinct_images.json'), true);
$unsplash = [];
$other = [];

foreach ($data as $url) {
    if (strpos($url, 'images.unsplash.com') !== false) {
        $unsplash[] = $url;
    } else {
        $other[] = $url;
    }
}

echo "Unsplash URLs: " . count($unsplash) . "\n";
echo "Other URLs: " . count($other) . "\n";

echo "Sample other URLs:\n";
foreach (array_slice($other, 0, 5) as $u) {
    echo "  - $u\n";
}
