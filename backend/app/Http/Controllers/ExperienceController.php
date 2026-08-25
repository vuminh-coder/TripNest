<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
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
                $priceVND = (float)$exp->price_per_person;
                return [
                    'id' => $exp->id,
                    'title' => $exp->title_vi,
                    'category' => 'experiences',
                    'city' => $exp->city,
                    'rating' => $exp->rating . ' (' . $exp->reviews_count . ')',
                    'rentVND' => $priceVND,
                    'rentUSD' => ExchangeRate::convert($priceVND, 'USD'),
                    'background' => $exp->image_url,
                    'caption' => $exp->caption,
                ];
            });

        return response()->json($experiences);
    }
}
