<?php

namespace Tests\Feature;

use Tests\TestCase;

class LocationApiTest extends TestCase
{
    public function test_can_get_all_provinces()
    {
        $response = $this->getJson('/api/locations/provinces');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'total',
                'data' => [
                    '*' => ['id', 'name', 'code', 'slug', 'region', 'lat', 'lng']
                ]
            ]);

        $this->assertGreaterThanOrEqual(63, $response->json('total'));
    }

    public function test_can_search_provinces_by_character_h()
    {
        $response = $this->getJson('/api/locations/search?q=h');

        $response->assertStatus(200)
            ->assertJsonStructure(['status', 'query', 'total', 'data']);

        $results = collect($response->json('data'))->pluck('name')->toArray();

        $this->assertContains('Hà Nội', $results);
        $this->assertContains('Hải Phòng', $results);
    }

    public function test_can_search_provinces_without_vietnamese_accent()
    {
        $response = $this->getJson('/api/locations/search?q=da%20nang');

        $response->assertStatus(200);
        $results = collect($response->json('data'))->pluck('name')->toArray();

        $this->assertContains('Đà Nẵng', $results);
    }

    public function test_can_search_tourist_hubs_and_aliases()
    {
        // Tìm kiếm 'da lat' ra Đà Lạt
        $resDalat = $this->getJson('/api/locations/search?q=da%20lat');
        $resDalat->assertStatus(200);
        $this->assertContains('Đà Lạt', collect($resDalat->json('data'))->pluck('name')->toArray());

        // Tìm kiếm 'phu quoc' ra Phú Quốc
        $resPQ = $this->getJson('/api/locations/search?q=phu%20quoc');
        $resPQ->assertStatus(200);
        $this->assertContains('Phú Quốc', collect($resPQ->json('data'))->pluck('name')->toArray());

        // Tìm kiếm 'sai gon' ra TP. Hồ Chí Minh
        $resSG = $this->getJson('/api/locations/search?q=sai%20gon');
        $resSG->assertStatus(200);
        $this->assertContains('TP. Hồ Chí Minh', collect($resSG->json('data'))->pluck('name')->toArray());
    }
}
