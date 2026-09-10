<?php

namespace App\Http\Controllers;

use App\Services\AiTravelAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AiChatController extends Controller
{
    protected AiTravelAssistantService $aiService;

    public function __construct(AiTravelAssistantService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Tiếp nhận câu hỏi và trả lời từ Trợ lý AI
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function chat(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:1000',
            'history' => 'nullable|array',
            'history.*.role' => 'nullable|string|in:user,model,assistant',
            'history.*.text' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        $message = $request->input('message');
        $history = $request->input('history', []);

        $result = $this->aiService->handleChat($message, $history);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Lấy danh sách câu hỏi mẫu gợi ý nhanh (Quick Prompts)
     *
     * @return JsonResponse
     */
    public function getSuggestedPrompts(): JsonResponse
    {
        $prompts = config('ai.security.default_suggestions', [
            'Tìm villa Đà Lạt săn mây cho gia đình 4-6 người',
            'Homestay Phú Quốc gần biển có bếp nấu ăn',
            'Có chỗ nghỉ nào ở Sa Pa có bồn tắm ngâm thảo mộc?',
            'Gợi ý tour chèo SUP hoặc trải nghiệm thú vị',
            'Hiện tại có mã giảm giá voucher nào áp dụng được?'
        ]);

        return response()->json([
            'success' => true,
            'data' => $prompts,
        ]);
    }
}
