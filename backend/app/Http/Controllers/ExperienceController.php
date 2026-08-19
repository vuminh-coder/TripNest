<?php

namespace App\Http\Controllers;

use App\Models\Experience;
use Illuminate\Http\JsonResponse;

class ExperienceController extends Controller
{
    /**
     * Danh sách các hoạt động trải nghiệm du lịch
     */
    public function index(): JsonResponse
    {
        $experiences = Experience::where('is_active', true)
            ->get()
            ->map(function ($exp) {
                return [
                    'id' => $exp->id,
                    'title' => $exp->title_vi,
                    'titleEn' => $exp->title_en,
                    'category' => 'experiences',
                    'city' => $exp->city,
                    'country' => $exp->country,
                    'rating' => $exp->rating . ' (' . $exp->reviews_count . ')',
                    'rentUSD' => (float)$exp->price_usd_per_person,
                    'rentVND' => (float)$exp->price_vnd_per_person,
                    'background' => $exp->image_url,
                    'caption' => $exp->caption,
                ];
            });

        return response()->json($experiences);
    }
}
