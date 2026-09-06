<?php
$json = json_decode(file_get_contents(__DIR__ . '/../database/seeders/hotels_dataset.json'), true);
echo "Total hotels in json: " . count($json) . "\n";
$images = [];
foreach ($json as $hotel) {
    foreach ($hotel['images'] as $img) {
        $images[] = $img['image_url'];
    }
}
echo "Total image URLs in json: " . count($images) . "\n";
echo "Distinct image URLs in json: " . count(array_unique($images)) . "\n";
