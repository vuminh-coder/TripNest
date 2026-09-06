<?php
$extracted = json_decode(file_get_contents(__DIR__ . '/extracted_ids.json'), true);
echo "Extracted IDs: " . count($extracted) . "\n";

$json = json_decode(file_get_contents(__DIR__ . '/../database/seeders/hotels_dataset.json'), true);
$hotelsUrls = [];
foreach ($json as $hotel) {
    foreach ($hotel['images'] as $img) {
        $hotelsUrls[] = $img['image_url'];
    }
}
echo "Hotels JSON URLs: " . count($hotelsUrls) . "\n";
