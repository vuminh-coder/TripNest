<?php

namespace App\Services;

use App\Models\Accommodation;
use App\Models\Experience;
use App\Models\Room;
use App\Models\Voucher;
use App\Models\Amenity;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AiTravelAssistantService
{
    protected string $provider;
    protected string $geminiApiKey;
    protected string $geminiModel;
    protected string $geminiApiUrl;
    protected float $temperature;
    protected int $maxTokens;
    protected array $forbiddenKeywords;

    public function __construct()
    {
        $this->provider = config('ai.provider', 'gemini');
        $this->geminiApiKey = config('ai.gemini.api_key', env('GEMINI_API_KEY', ''));
        $this->geminiModel = config('ai.gemini.model', env('GEMINI_MODEL', 'gemini-3.6-flash'));
        $this->geminiApiUrl = config('ai.gemini.api_url', 'https://generativelanguage.googleapis.com/v1beta/models');
        $this->temperature = config('ai.gemini.temperature', 0.7);
        $this->maxTokens = config('ai.gemini.max_tokens', 3000);
        $this->forbiddenKeywords = config('ai.security.forbidden_keywords', [
            'mật khẩu', 'password', 'token', 'otp', 'ngân hàng', 'số tài khoản', 
            'stk', 'doanh thu sàn', 'hoa hồng host', 'payout', 'escrow', 
            'cccd', 'cmnd', 'admin', 'bị khóa', 'banned'
        ]);
    }

    /**
     * Xử lý tin nhắn chat từ người dùng
     *
     * @param string $message
     * @param array $conversationHistory Mảng lịch sử chat [{ role: 'user'|'model', text: string }]
     * @return array
     */
    public function handleChat(string $message, array $conversationHistory = []): array
    {
        $cleanMessage = trim($message);
        if (empty($cleanMessage)) {
            return [
                'reply' => 'Chào bạn! Mình là Trợ lý AI của TripNest. Bạn đang dự định đi du lịch ở đâu (Đà Lạt, Phú Quốc, Sa Pa, Nha Trang...) để mình gợi ý chỗ nghỉ tuyệt vời nhất cho bạn nhé! ✨',
                'suggested_cards' => [],
                'quick_replies' => config('ai.security.default_suggestions')
            ];
        }

        // 1. Kiểm tra ranh giới an toàn (Guardrail Security Check)
        if ($this->containsForbiddenKeywords($cleanMessage)) {
            return [
                'reply' => 'Xin lỗi bạn, là Trợ lý Du lịch TripNest, mình chỉ được phép hỗ trợ bạn tìm kiếm phòng nghỉ, địa điểm tham quan, tour trải nghiệm và các chương trình ưu đãi du lịch công khai. Mình không có quyền truy cập vào các thông tin tài khoản, tài chính hoặc dữ liệu nhân thân bảo mật. Bạn có muốn mình gợi ý điểm đến nghỉ dưỡng hấp dẫn nào không? 🌿',
                'suggested_cards' => [],
                'quick_replies' => [
                    'Gợi ý villa nghỉ dưỡng Đà Lạt view đẹp',
                    'Homestay Phú Quốc gần biển',
                    'Tour chèo SUP ngắm bình minh'
                ]
            ];
        }

        // 2. Thu thập ngữ cảnh du lịch công khai phù hợp từ Database
        $contextData = $this->gatherPublicTravelContext($cleanMessage);

        // 3. Nếu có Gemini API Key hợp lệ, gọi mô hình Gemini 1.5 Flash
        if (!empty($this->geminiApiKey)) {
            try {
                $aiResponse = $this->callGeminiApi($cleanMessage, $contextData, $conversationHistory);
                if ($aiResponse && !empty($aiResponse['reply'])) {
                    return $aiResponse;
                }
            } catch (\Exception $e) {
                Log::warning('Gemini AI Call Failed, falling back to smart local engine: ' . $e->getMessage());
            }
        }

        // 4. Smart Fallback Engine: Khai thác Database cục bộ khi không có API Key
        return $this->generateSmartLocalReply($cleanMessage, $contextData);
    }

    /**
     * Kiểm tra tin nhắn có chứa từ khóa vi phạm ranh giới bảo mật không
     */
    protected function containsForbiddenKeywords(string $message): bool
    {
        $lower = mb_strtolower($message, 'UTF-8');
        foreach ($this->forbiddenKeywords as $kw) {
            if (mb_strpos($lower, mb_strtolower($kw, 'UTF-8')) !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * Truy xuất dữ liệu du lịch công khai an toàn (Whitelist Only)
     */
    public function gatherPublicTravelContext(string $message): array
    {
        $lowerMsg = mb_strtolower($message, 'UTF-8');

        // Nhận diện tỉnh thành tiềm năng
        $targetCity = null;
        $cities = ['Đà Lạt', 'Phú Quốc', 'Nha Trang', 'Hà Nội', 'Đà Nẵng', 'Sa Pa', 'Sapa', 'Hạ Long', 'Vũng Tàu', 'Ninh Bình', 'Huế', 'Hội An', 'Quy Nhơn'];
        foreach ($cities as $c) {
            if (mb_strpos($lowerMsg, mb_strtolower($c, 'UTF-8')) !== false) {
                $targetCity = $c;
                break;
            }
        }

        // 1. Query accommodations (chỉ lấy status = published)
        $query = Accommodation::query()
            ->where('status', 'published')
            ->select([
                'id', 'name_vi', 'accommodation_type', 'star_rating', 
                'description', 'address', 'city', 'district', 'distance_description',
                'check_in_time', 'check_out_time', 'house_rules', 'cancellation_policy', 'is_featured'
            ])
            ->with([
                'rooms' => function ($q) {
                    $q->where('status', 'available')
                      ->select(['id', 'accommodation_id', 'room_name_vi', 'space_type', 'price_per_night', 'max_guests', 'bedrooms_count', 'beds_count', 'rating', 'reviews_count', 'is_guest_favorite']);
                },
                'images' => function ($q) {
                    $q->select(['id', 'accommodation_id', 'image_url', 'caption', 'is_thumbnail'])
                      ->orderBy('is_thumbnail', 'desc')
                      ->orderBy('display_order', 'asc');
                },
                'amenities' => function ($q) {
                    $q->select(['amenities.id', 'name_vi', 'icon', 'category']);
                },
                'category' => function ($q) {
                    $q->select(['id', 'label_vi', 'slug']);
                }
            ]);

        if ($targetCity) {
            $query->where('city', 'like', "%{$targetCity}%");
        }

        // Lấy danh sách chỗ nghỉ phù hợp (tối đa 6 chỗ nghỉ tiêu biểu)
        $accommodations = $query->orderBy('is_featured', 'desc')->take(6)->get();

        // 2. Query experiences (Tour du lịch)
        $expQuery = Experience::query()
            ->where('is_active', true)
            ->select(['id', 'title_vi', 'caption', 'description', 'city', 'price_per_person', 'rating', 'reviews_count', 'image_url', 'duration_hours']);
        
        if ($targetCity) {
            $expQuery->where('city', 'like', "%{$targetCity}%");
        }
        $experiences = $expQuery->take(4)->get();

        // 3. Query vouchers đang hoạt động
        $vouchers = Voucher::query()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now()->toDateString());
            })
            ->select(['id', 'code', 'title', 'discount_type', 'discount_value', 'min_booking_amount', 'end_date'])
            ->take(3)
            ->get();

        return [
            'target_city' => $targetCity,
            'accommodations' => $accommodations,
            'experiences' => $experiences,
            'vouchers' => $vouchers,
        ];
    }

    /**
     * Gọi Google Gemini API với System Instruction thông minh toàn diện
     */
    protected function callGeminiApi(string $userMessage, array $contextData, array $conversationHistory): ?array
    {
        $url = "{$this->geminiApiUrl}/{$this->geminiModel}:generateContent?key={$this->geminiApiKey}";

        // Chuẩn bị tóm tắt dữ liệu du lịch dưới dạng Text gọn gàng nạp vào ngữ cảnh
        $contextSummary = $this->buildContextText($contextData);

        $systemInstruction = <<<TEXT
Bạn là "TripNest AI Travel & Lifestyle Concierge" - Cố vấn Du lịch & Trợ lý Trải nghiệm Đặt phòng Thông minh hàng đầu của nền tảng TripNest (Việt Nam).

TRÍ TUỆ & PHẠM VI HỖ TRỢ CỦA BẠN:
1. TRẢ LỜI MỌI CÂU HỎI VỀ DU LỊCH, VĂN HÓA, ẨM THỰC & ĐỜI SỐNG (KHÔNG HẠN CHẾ):
   - Bạn là chuyên gia am hiểu sâu sắc về văn hóa, địa lý, ẩm thực và kinh nghiệm du lịch tại Việt Nam và quốc tế.
   - SẴN SÀNG GIẢI ĐÁP MỌI CÂU HỎI: từ các câu hỏi ngoài lề (thời tiết mùa này thế nào, nên mặc gì, ăn món gì ngon ở địa phương, kinh nghiệm phượt, lịch trình 2N1Đ / 3N2Đ gợi ý, chi phí dự kiến, cách di chuyển máy bay/xe khách, gợi ý du lịch chữa lành, địa điểm chụp ảnh sống ảo, các quán cà phê view đẹp...) cho đến tâm sự, trò chuyện tự nhiên, giải tỏa căng thẳng cho du khách.
   - Khi được hỏi các chủ đề ngoài lề đặt phòng: HÃY TRẢ LỜI ĐẦY ĐỦ, THÔNG MINH, SÂU SẮC, GIÀU CẢM XÚC VÀ CỰC KỲ HỮU ÍCH. Sau đó, bạn có thể khéo léo gợi ý nhẹ nhàng đến các địa danh, tour hoặc chỗ nghỉ trên TripNest nếu thấy phù hợp.

2. TƯ VẤN & GỢI Ý CHỖ NGHỈ, TOUR, MÃ GIẢM GIÁ (TỪ DỮ LIỆU TRIPNEST ĐƯỢC CẤP):
   - Sử dụng DỮ LIỆU CÔNG KHAI CỦA TRIPNEST bên dưới để giới thiệu chỗ nghỉ (Villa, Resort, Homestay), tour du lịch hoặc mã giảm giá chính xác.
   - Khi trả về `suggested_cards`, hãy dùng đúng ID, tên, giá, rating, ảnh và link từ dữ liệu được cấp.
   - QUAN TRỌNG: Nếu câu hỏi của người dùng là câu hỏi thuần túy về kiến thức ngoài lề (thời tiết, ẩm thực, chào hỏi, chia sẻ cảm xúc...) mà không cần thẻ chỗ nghỉ: Bạn hãy để `suggested_cards` là mảng RỖNG [] để câu trả lời được tự nhiên, tinh tế, không gượng ép!
   - Nếu câu hỏi tìm kiếm chỗ nghỉ hoặc tour: Hãy chọn 2-3 thẻ phù hợp nhất đưa vào `suggested_cards`.

3. TỰ ĐỘNG GỢI Ý CÂU HỎI TIẾP THEO (QUICK REPLIES):
   - Trong `quick_replies`, hãy tự động tạo ra 3-4 câu hỏi tiếp theo thông minh, bám sát đúng chủ đề người dùng đang quan tâm.

4. NGUYÊN TẮC BẢO MẬT TUYỆT ĐỐI:
   - Tuyệt đối KHÔNG tiết lộ: mật khẩu, mã OTP, số tài khoản ngân hàng, thông tin thanh toán, doanh thu sàn, hồ sơ KYC chủ nhà hay tài khoản quản trị viên.

BẠN BẮT BUỘC PHẢI TRẢ VỀ ĐỊNH DẠNG JSON HỢP LỆ VỚI CẤU TRÚC SAU (KHÔNG KÈM BẤT KỲ KÝ TỰ NÀO NGOÀI JSON):
{
  "reply": "Nội dung câu trả lời chi tiết, thông minh, truyền cảm hứng và tự nhiên...",
  "suggested_cards": [
    {
      "type": "accommodation",
      "id": 123,
      "title": "Tên chỗ nghỉ",
      "subtitle": "Địa chỉ hoặc đặc điểm",
      "price": 1500000,
      "price_label": "1.500.000 ₫/đêm",
      "rating": 4.95,
      "image_url": "https://...",
      "link": "/accommodation/123"
    }
  ],
  "quick_replies": [
    "Gợi ý câu hỏi tiếp theo 1",
    "Gợi ý câu hỏi tiếp theo 2",
    "Gợi ý câu hỏi tiếp theo 3"
  ]
}

DỮ LIỆU CÔNG KHAI HỆ THỐNG TRIPNEST SẴN CÓ:
{$contextSummary}
TEXT;

        // Xây dựng contents payload cho Gemini API
        $contents = [];
        
        // Thêm vài lượt chat gần nhất nếu có
        foreach (array_slice($conversationHistory, -4) as $item) {
            $role = ($item['role'] ?? 'user') === 'user' ? 'user' : 'model';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $item['text'] ?? '']]
            ];
        }

        // Lượt chat hiện tại
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]]
        ];

        $payload = [
            'system_instruction' => [
                'parts' => [['text' => $systemInstruction]]
            ],
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.75,
                'maxOutputTokens' => $this->maxTokens,
                'response_mime_type' => 'application/json',
            ],
        ];

        $response = Http::timeout(20)
            ->withOptions(['verify' => false])
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url, $payload);

        if (!$response->successful()) {
            Log::error('Gemini API Error: ' . $response->body());
            return null;
        }

        $resultJson = $response->json();
        $rawText = $resultJson['candidates'][0]['content']['parts'][0]['text'] ?? '';
        
        if (empty($rawText)) {
            return null;
        }

        $decoded = $this->cleanAndParseJson($rawText);
        if ($decoded && isset($decoded['reply'])) {
            return [
                'reply' => $decoded['reply'],
                'suggested_cards' => $decoded['suggested_cards'] ?? [],
                'quick_replies' => $decoded['quick_replies'] ?? config('ai.security.default_suggestions'),
            ];
        }

        // Nếu chuỗi chứa JSON thô nhưng bị lỗi cú pháp, dùng Regex trích xuất 'reply'
        if (preg_match('/"reply"\s*:\s*"(.*?)(?<!\\\\)"/s', $rawText, $replyMatches)) {
            $extractedReply = stripcslashes($replyMatches[1]);
            return [
                'reply' => $extractedReply,
                'suggested_cards' => $this->extractFallbackCards($contextData),
                'quick_replies' => config('ai.security.default_suggestions'),
            ];
        }

        // Trường hợp Gemini trả về văn bản thường không phải JSON
        $cleanedText = preg_replace('/^```(?:json)?|```$/m', '', $rawText);
        return [
            'reply' => trim($cleanedText),
            'suggested_cards' => $this->extractFallbackCards($contextData),
            'quick_replies' => config('ai.security.default_suggestions'),
        ];
    }

    /**
     * Bóc tách và làm sạch JSON từ phản hồi của LLM
     */
    protected function cleanAndParseJson(string $rawText): ?array
    {
        $text = trim($rawText);

        // 1. Thử parse trực tiếp
        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE && isset($decoded['reply'])) {
            return $decoded;
        }

        // 2. Bỏ markdown block ```json ... ```
        if (preg_match('/```(?:json)?\s*(\{.*?\})\s*```/s', $text, $matches)) {
            $decoded = json_decode(trim($matches[1]), true);
            if (json_last_error() === JSON_ERROR_NONE && isset($decoded['reply'])) {
                return $decoded;
            }
        }

        // 3. Trích xuất từ dấu { đầu tiên đến dấu } cuối cùng
        $firstBrace = strpos($text, '{');
        $lastBrace = strrpos($text, '}');
        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            $jsonCandidate = substr($text, $firstBrace, $lastBrace - $firstBrace + 1);
            $decoded = json_decode($jsonCandidate, true);
            if (json_last_error() === JSON_ERROR_NONE && isset($decoded['reply'])) {
                return $decoded;
            }
        }

        // 4. Khắc phục JSON bị cụt đuôi (unclosed brackets)
        if ($firstBrace !== false) {
            $truncated = substr($text, $firstBrace);
            // Thử đóng mảng hoặc object
            $attempts = [$truncated . '"}', $truncated . '"]}', $truncated . ']}', $truncated . '}'];
            foreach ($attempts as $candidate) {
                $decoded = json_decode($candidate, true);
                if (json_last_error() === JSON_ERROR_NONE && isset($decoded['reply'])) {
                    return $decoded;
                }
            }
        }

        return null;
    }

    /**
     * Chuyển dữ liệu Eloquent thành Text tóm lược làm Context cho AI
     */
    protected function buildContextText(array $contextData): string
    {
        $text = "";
        
        // Chỗ nghỉ
        if (!empty($contextData['accommodations']) && count($contextData['accommodations']) > 0) {
            $text .= "DANH SÁCH CHỖ NGHỈ NỔI BẬT:\n";
            foreach ($contextData['accommodations'] as $acc) {
                $lowestRoom = $acc->rooms->sortBy('price_per_night')->first();
                $minPrice = $lowestRoom ? number_format($lowestRoom->price_per_night, 0, ',', '.') . ' ₫/đêm' : 'Liên hệ';
                $amenityNames = $acc->amenities->pluck('name_vi')->take(5)->implode(', ');
                $thumb = $acc->images->first()?->image_url ?? 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600';

                $text .= "- ID: {$acc->id} | Tên: {$acc->name_vi} | Loại: {$acc->accommodation_type} | TP: {$acc->city} | Giá từ: {$minPrice} | Tiện nghi: {$amenityNames} | Ảnh: {$thumb} | Đánh giá: {$acc->star_rating} sao\n";
            }
        }

        // Tour trải nghiệm
        if (!empty($contextData['experiences']) && count($contextData['experiences']) > 0) {
            $text .= "\nDANH SÁCH TOUR TRẢI NGHIỆM ĐỊA PHƯƠNG:\n";
            foreach ($contextData['experiences'] as $exp) {
                $price = number_format($exp->price_per_person, 0, ',', '.') . ' ₫/khách';
                $text .= "- Tour ID: {$exp->id} | {$exp->title_vi} tại {$exp->city} | Giá: {$price} | Thời lượng: {$exp->duration_hours}h | Đánh giá: {$exp->rating}★ | Ảnh: {$exp->image_url}\n";
            }
        }

        // Vouchers
        if (!empty($contextData['vouchers']) && count($contextData['vouchers']) > 0) {
            $text .= "\nMÃ GIẢM GIÁ HIỆN CÓ:\n";
            foreach ($contextData['vouchers'] as $v) {
                $discount = $v->discount_type === 'percentage' ? "{$v->discount_value}%" : number_format($v->discount_value, 0, ',', '.') . ' ₫';
                $text .= "- Mã: {$v->code} ({$v->title}) - Giảm {$discount} cho đơn từ " . number_format($v->min_booking_amount, 0, ',', '.') . " ₫\n";
            }
        }

        return $text;
    }

    /**
     * Smart Local Engine: Tạo câu trả lời thông minh dựa trên Database thực tế khi không kết nối Gemini
     */
    protected function generateSmartLocalReply(string $message, array $contextData): array
    {
        $lower = mb_strtolower($message, 'UTF-8');
        $city = $contextData['target_city'];
        $accommodations = $contextData['accommodations'] ?? collect();
        $experiences = $contextData['experiences'] ?? collect();
        $vouchers = $contextData['vouchers'] ?? collect();

        $suggestedCards = [];
        $quickReplies = [];

        // Kịch bản 1: Hỏi về Ẩm thực / Ăn gì ngon / Quán ăn đặc sản
        if (mb_strpos($lower, 'ăn gì') !== false || mb_strpos($lower, 'món ngon') !== false || mb_strpos($lower, 'quán ăn') !== false || mb_strpos($lower, 'ẩm thực') !== false || mb_strpos($lower, 'đặc sản') !== false) {
            $cityName = $city ?? 'Đà Lạt';
            if ($cityName === 'Đà Lạt' || mb_strpos($lower, 'đà lạt') !== false) {
                $reply = "Dạ, đi Đà Lạt trong tiết trời se lạnh mà được thưởng thức những món nóng hổi thì không gì tuyệt vời bằng! 🍜☕\n\n"
                    . "🌟 **Top đặc sản nhất định phải thử tại Đà Lạt:**\n"
                    . "1. **Lẩu gà lá é**: Vị ngọt thanh của thịt gà đồi kết hợp vị chua cay the the của lá é và măng giòn (Quán nổi tiếng: Tao Ngộ, É Quán).\n"
                    . "2. **Bánh ướt lòng gà**: Sự kết hợp mềm mịn của bánh ướt dẻo và thịt gà xé, lòng gà đậm đà (Quán Trang hoặc Long).\n"
                    . "3. **Bánh mì xíu mại chén**: Xíu mại thơm béo chấm bánh mì giòn rụm vào sáng sớm se lạnh (Quán Hoàng Diệu).\n"
                    . "4. **Bánh tráng nướng & Sữa đậu nành nóng**: Món ăn vặt 'pizza Đà Lạt' trứ danh tại Chợ đêm hoặc ngã ba Tăng Bạt Hổ.\n"
                    . "5. **Kem bơ sáp béo ngậy**: Bơ tươi xay mịn ăn cùng viên kem dừa thanh mát (Quán Thanh Thảo, Nari).\n\n"
                    . "Sau khi oanh tạc ẩm thực, về ngả lưng tại một căn villa view rừng thông yên tĩnh sẽ là trải nghiệm trọn vẹn nhất! Bạn có muốn mình gợi ý vài chỗ nghỉ gần các khu ăn uống này không? 🌿";
            } elseif ($cityName === 'Phú Quốc' || mb_strpos($lower, 'phú quốc') !== false) {
                $reply = "Chào bạn! Đến với đảo ngọc Phú Quốc, bạn nhất định không thể bỏ qua thiên đường hải sản tươi rói này nhé! 🦞🌊\n\n"
                    . "🌟 **Top món ngon nức tiếng Phú Quốc:**\n"
                    . "1. **Bún quậy Kiến Xây**: Tự tay pha nước chấm theo khẩu vị, chả tôm mực quết tươi giòn sần sật.\n"
                    . "2. **Gỏi cá trích cuốn bánh tráng**: Thịt cá trích tươi rói bóp chanh ớt, cuốn dừa nạo và rau rừng chấm nước mắm Phú Quốc.\n"
                    . "3. **Nhum biển nướng mỡ hành**: Béo ngậy, ngọt lịm đậm đà hương vị biển cả.\n"
                    . "4. **Cơm ghẹ Hàm Ninh & Còi biên mai nướng**: Thơm lừng giòn ngọt.\n\n"
                    . "Bạn đã chọn được resort sát biển để vừa nghỉ dưỡng vừa thưởng thức hải sản chưa? Hãy xem một số gợi ý dưới đây nhé! ✨";
            } else {
                $reply = "Chào bạn! Khám phá ẩm thực bản địa luôn là linh hồn của mỗi chuyến đi. Khi ghé thăm {$cityName}, bạn nên trải nghiệm các khu chợ đêm truyền thống hoặc các quán ăn lâu đời của người dân địa phương để cảm nhận trọn vẹn hương vị mộc mạc nhất! 🍲✨\n\n"
                    . "TripNest cũng gợi ý một số chỗ nghỉ có trang bị sẵn bếp nấu đầy đủ gia vị để bạn tự tay chế biến các món tươi ngon của địa phương nè:";
            }

            foreach ($accommodations->take(2) as $acc) {
                $lowestRoom = $acc->rooms->sortBy('price_per_night')->first();
                $priceNum = $lowestRoom ? (float)$lowestRoom->price_per_night : 1200000;
                $thumb = $acc->images->first()?->image_url ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
                $suggestedCards[] = [
                    'type' => 'accommodation',
                    'id' => $acc->id,
                    'title' => $acc->name_vi,
                    'subtitle' => "{$acc->city} • " . ($acc->distance_description ?? 'Gần trung tâm ẩm thực'),
                    'price' => $priceNum,
                    'price_label' => number_format($priceNum, 0, ',', '.') . ' ₫/đêm',
                    'rating' => (float)$acc->star_rating ?: 4.95,
                    'image_url' => $thumb,
                    'link' => "/accommodation/{$acc->id}",
                ];
            }

            return [
                'reply' => $reply,
                'suggested_cards' => $suggestedCards,
                'quick_replies' => ['Quán cà phê view đẹp sống ảo', 'Gợi ý chỗ nghỉ có bếp nấu ăn', 'Mã voucher giảm giá hôm nay']
            ];
        }

        // Kịch bản 2: Hỏi về Thời tiết / Đi mùa nào đẹp / Mặc gì
        if (mb_strpos($lower, 'thời tiết') !== false || mb_strpos($lower, 'mùa nào') !== false || mb_strpos($lower, 'mặc gì') !== false || mb_strpos($lower, 'nhiệt độ') !== false || mb_strpos($lower, 'săn mây') !== false) {
            $cityName = $city ?? 'Đà Lạt';
            if ($cityName === 'Đà Lạt' || mb_strpos($lower, 'đà lạt') !== false) {
                $reply = "Dạ, Đà Lạt bốn mùa đều có vẻ đẹp riêng, nhiệt độ trung bình từ **14°C - 24°C**, sáng sớm và đêm se se lạnh rất lãng mạn! ⛅🧣\n\n"
                    . "🌿 **Cẩm nang thời tiết & thời điểm lý tưởng:**\n"
                    . "- **Tháng 10 - Tháng 12**: Mùa hoa dã quỳ, đồi cỏ hồng và mùa săn mây đỉnh nhất năm. Đêm lạnh khoảng 12-14°C.\n"
                    . "- **Tháng 1 - Tháng 3**: Mùa mai anh đào nở rộ, thời tiết nắng ấm dịu dàng, trời trong veo.\n"
                    . "- **Mẹo trang phục**: Bạn nhớ chuẩn bị áo len mỏng, áo khoác dạ dáng dài, khăn choàng và boots vừa giữ ấm vừa lên hình vintage cực chất nhé!\n\n"
                    . "Để ngắm trọn biển mây sớm ngay từ phòng ngủ, bạn có thể tham khảo một số villa trên cao dưới đây:";
            } else {
                $reply = "Dạ, thời tiết tại {$cityName} hiện tại khá thuận lợi cho các hoạt động tham quan ngoài trời và nghỉ dưỡng! Để có chuyến đi trọn vẹn, bạn nên mang theo kem chống nắng, trang phục thoáng mát ban ngày và một chiếc áo khoác nhẹ cho buổi tối nhé! ☀️🌴";
            }

            foreach ($accommodations->take(2) as $acc) {
                $lowestRoom = $acc->rooms->sortBy('price_per_night')->first();
                $priceNum = $lowestRoom ? (float)$lowestRoom->price_per_night : 1200000;
                $thumb = $acc->images->first()?->image_url ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
                $suggestedCards[] = [
                    'type' => 'accommodation',
                    'id' => $acc->id,
                    'title' => $acc->name_vi,
                    'subtitle' => "{$acc->city} • View thung lũng săn mây",
                    'price' => $priceNum,
                    'price_label' => number_format($priceNum, 0, ',', '.') . ' ₫/đêm',
                    'rating' => (float)$acc->star_rating ?: 4.95,
                    'image_url' => $thumb,
                    'link' => "/accommodation/{$acc->id}",
                ];
            }

            return [
                'reply' => $reply,
                'suggested_cards' => $suggestedCards,
                'quick_replies' => ['Địa điểm săn mây đẹp nhất', 'Villa có lò sưởi ấm cúng', 'Lịch trình du lịch 3N2Đ']
            ];
        }

        // Kịch bản 3: Hỏi về Du lịch chữa lành / Stress / Tìm nơi yên bình
        if (mb_strpos($lower, 'stress') !== false || mb_strpos($lower, 'chữa lành') !== false || mb_strpos($lower, 'buồn') !== false || mb_strpos($lower, 'mệt mỏi') !== false || mb_strpos($lower, 'yên bình') !== false || mb_strpos($lower, 'nghỉ ngơi') !== false) {
            $reply = "Cuộc sống đôi khi hối hả khiến ta thấy mỏi mệt, một chuyến đi trốn phố thị về với thiên nhiên chính là liều thuốc chữa lành dịu dàng nhất! 🌿✨\n\n"
                . "TripNest gợi ý cho bạn 3 chốn dừng chân bình yên để nạp lại năng lượng:\n"
                . "🌲 **Đà Lạt**: Thức dậy giữa đồi thông mờ sương, nhâm nhi tách cà phê ấm, nghe tiếng chim hót và đọc một cuốn sách hay.\n"
                . "🌊 **Phú Quốc**: Nằm võng dưới rặng dừa, nghe tiếng sóng biển vỗ rì rào và ngắm hoàng hôn rực rỡ cuối chân trời.\n"
                . "🏔️ **Sa Pa**: Ngắm nhìn những thửa ruộng bậc thang kỳ vĩ, hít hà không khí trong lành của núi rừng Tây Bắc.\n\n"
                . "Hãy để tâm hồn được thảnh thơi vài ngày bạn nhé! Dưới đây là những không gian nghỉ dưỡng tĩnh lặng, riêng tư dành riêng cho bạn:";

            foreach ($accommodations->take(3) as $acc) {
                $lowestRoom = $acc->rooms->sortBy('price_per_night')->first();
                $priceNum = $lowestRoom ? (float)$lowestRoom->price_per_night : 1500000;
                $thumb = $acc->images->first()?->image_url ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
                $suggestedCards[] = [
                    'type' => 'accommodation',
                    'id' => $acc->id,
                    'title' => $acc->name_vi,
                    'subtitle' => "{$acc->city} • Không gian yên bình thư giãn",
                    'price' => $priceNum,
                    'price_label' => number_format($priceNum, 0, ',', '.') . ' ₫/đêm',
                    'rating' => (float)$acc->star_rating ?: 4.95,
                    'image_url' => $thumb,
                    'link' => "/accommodation/{$acc->id}",
                ];
            }

            return [
                'reply' => $reply,
                'suggested_cards' => $suggestedCards,
                'quick_replies' => ['Villa riêng tư có bồn tắm ngâm', 'Tour dạo bộ trong rừng', 'Voucher giảm giá cho kỳ nghỉ']
            ];
        }

        // Kịch bản 4: Hỏi về mã giảm giá / voucher
        if (mb_strpos($lower, 'voucher') !== false || mb_strpos($lower, 'giảm giá') !== false || mb_strpos($lower, 'khuyến mãi') !== false || mb_strpos($lower, 'ưu đãi') !== false) {
            $reply = "Dạ, hiện tại TripNest đang có các chương trình ưu đãi rất hấp dẫn dành cho bạn khi đặt phòng nè! ✨\n\n";
            if ($vouchers->count() > 0) {
                foreach ($vouchers as $v) {
                    $val = $v->discount_type === 'percentage' ? "{$v->discount_value}%" : number_format($v->discount_value, 0, ',', '.') . ' ₫';
                    $reply .= "🎁 **Mã `{$v->code}`**: Giảm ngay **{$val}** cho đơn đặt phòng từ " . number_format($v->min_booking_amount, 0, ',', '.') . " ₫ ({$v->title}).\n";
                    
                    $suggestedCards[] = [
                        'type' => 'voucher',
                        'id' => $v->id,
                        'title' => "Mã ưu đãi: {$v->code}",
                        'subtitle' => $v->title,
                        'price' => (float)$v->discount_value,
                        'price_label' => "Giảm {$val}",
                        'rating' => 5.0,
                        'image_url' => 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600',
                        'link' => '#voucher',
                    ];
                }
                $reply .= "\nBạn chỉ cần nhập mã trên tại bước thanh toán để được trừ tiền trực tiếp nhé!";
            } else {
                $reply .= "Hiện tại hệ thống đang chuẩn bị các mã ưu đãi mùa mới. Bạn cứ chọn phòng ưng ý trước nhé!";
            }

            $quickReplies = [
                'Tìm villa Đà Lạt săn mây',
                'Homestay Phú Quốc sát biển',
                'Xem tour trải nghiệm thú vị'
            ];

            return [
                'reply' => $reply,
                'suggested_cards' => $suggestedCards,
                'quick_replies' => $quickReplies
            ];
        }

        // Kịch bản 5: Hỏi về Tour / Trải nghiệm
        if (mb_strpos($lower, 'tour') !== false || mb_strpos($lower, 'trải nghiệm') !== false || mb_strpos($lower, 'sup') !== false || mb_strpos($lower, 'chơi gì') !== false) {
            $reply = "TripNest xin gợi ý một số hoạt động và tour trải nghiệm địa phương cực chill dành cho bạn:\n\n";
            foreach ($experiences->take(3) as $exp) {
                $priceStr = number_format($exp->price_per_person, 0, ',', '.') . ' ₫/khách';
                $reply .= "🌊 **{$exp->title_vi}** ({$exp->city}): {$exp->caption}. Giá chỉ từ **{$priceStr}** (Thời lượng {$exp->duration_hours} giờ).\n";

                $suggestedCards[] = [
                    'type' => 'experience',
                    'id' => $exp->id,
                    'title' => $exp->title_vi,
                    'subtitle' => "{$exp->city} • {$exp->duration_hours} giờ",
                    'price' => (float)$exp->price_per_person,
                    'price_label' => $priceStr,
                    'rating' => (float)$exp->rating,
                    'image_url' => $exp->image_url,
                    'link' => "/experiences",
                ];
            }

            $quickReplies = [
                'Gợi ý chỗ nghỉ gần đây',
                'Có mã giảm giá cho tour không?',
                'Tour nào ngắm hoàng hôn đẹp nhất?'
            ];

            return [
                'reply' => $reply,
                'suggested_cards' => $suggestedCards,
                'quick_replies' => $quickReplies
            ];
        }

        // Kịch bản 3: Hỏi về phòng nghỉ, biệt thự, homestay theo địa điểm hoặc chung
        $cityName = $city ?? 'Đà Lạt';
        $reply = "Dạ, để bạn có chuyến đi thật trọn vẹn tại **{$cityName}**, TripNest đã chọn lọc các cơ sở lưu trú được đánh giá cao nhất dành cho bạn:\n\n";

        foreach ($accommodations->take(3) as $acc) {
            $lowestRoom = $acc->rooms->sortBy('price_per_night')->first();
            $priceNum = $lowestRoom ? (float)$lowestRoom->price_per_night : 1200000;
            $priceStr = number_format($priceNum, 0, ',', '.') . ' ₫/đêm';
            $thumb = $acc->images->first()?->image_url ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
            $amenitiesStr = $acc->amenities->pluck('name_vi')->take(3)->implode(' • ');

            $reply .= "🏡 **{$acc->name_vi}** ({$acc->city})\n";
            $reply .= "- Phong cách: {$acc->accommodation_type} cao cấp ({$acc->star_rating} sao)\n";
            $reply .= "- Giá tham khảo: từ **{$priceStr}**\n";
            if ($amenitiesStr) {
                $reply .= "- Tiện ích nổi bật: {$amenitiesStr}\n";
            }
            $reply .= "\n";

            $suggestedCards[] = [
                'type' => 'accommodation',
                'id' => $acc->id,
                'title' => $acc->name_vi,
                'subtitle' => "{$acc->city} • " . ($acc->distance_description ?? $acc->district ?? 'Trung tâm'),
                'price' => $priceNum,
                'price_label' => $priceStr,
                'rating' => (float)$acc->star_rating ?: 4.95,
                'image_url' => $thumb,
                'link' => "/accommodation/{$acc->id}",
            ];
        }

        $reply .= "Bạn bấm vào thẻ phòng bên dưới để xem trọn bộ ảnh và đặt phòng trực tiếp nhé! Bạn có cần thêm yêu cầu nào về số người hay tiện ích bể bơi/BBQ không ạ? 🌿";

        $quickReplies = [
            'Chỗ nghỉ có bể bơi hoặc bồn tắm?',
            'Có bếp nấu ăn hoặc tiệc BBQ không?',
            'Hiện có voucher giảm giá nào không?'
        ];

        return [
            'reply' => $reply,
            'suggested_cards' => $suggestedCards,
            'quick_replies' => $quickReplies
        ];
    }

    /**
     * Lấy thẻ card dự phòng từ context
     */
    protected function extractFallbackCards(array $contextData): array
    {
        $cards = [];
        $accommodations = $contextData['accommodations'] ?? collect();
        foreach ($accommodations->take(3) as $acc) {
            $lowestRoom = $acc->rooms->sortBy('price_per_night')->first();
            $priceNum = $lowestRoom ? (float)$lowestRoom->price_per_night : 1200000;
            $thumb = $acc->images->first()?->image_url ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';

            $cards[] = [
                'type' => 'accommodation',
                'id' => $acc->id,
                'title' => $acc->name_vi,
                'subtitle' => "{$acc->city} • " . ($acc->distance_description ?? 'Vị trí đắc địa'),
                'price' => $priceNum,
                'price_label' => number_format($priceNum, 0, ',', '.') . ' ₫/đêm',
                'rating' => (float)$acc->star_rating ?: 4.95,
                'image_url' => $thumb,
                'link' => "/accommodation/{$acc->id}",
            ];
        }
        return $cards;
    }
}
