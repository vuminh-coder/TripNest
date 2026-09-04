<?php

namespace Database\Seeders;

use App\Models\Accommodation;
use App\Models\Review;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RealisticReviewSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Xóa toàn bộ đánh giá mang câu văn mẫu cũ
        Review::where('comment', 'like', 'Trải nghiệm tuyệt vời tại hạng%')->delete();

        $users = User::all();
        if ($users->isEmpty()) {
            echo "Chưa có người dùng để seed đánh giá." . PHP_EOL;
            return;
        }

        $accommodations = Accommodation::with('rooms')->get();

        $reviewTemplates = [
            'dalat' => [
                [
                    'comment' => 'Không gian rừng thông tĩnh lặng, sáng sớm mở cửa ban công là sương mờ bay vào tận phòng. Lò sưởi phòng khách ấm cúng, trà atiso và bữa sáng rau củ quả tươi rói. Đã có một kỳ nghỉ chữa lành tuyệt vời cùng người thương!',
                    'positive' => 'Khung cảnh săn mây thơ mộng, không khí trong lành se lạnh và hoa cẩm tú cầu nở rực rỡ.',
                    'response' => 'Cảm ơn quý khách đã dành trọn niềm tin cho không gian của chúng tôi tại Đà Lạt. Hẹn gặp lại bạn vào mùa hoa dã quỳ tới nhé!',
                    'radar' => ['cleanliness' => 5.0, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 4.9, 'checkin' => 5.0, 'value' => 4.9],
                    'rating' => 5.0,
                ],
                [
                    'comment' => 'Villa thiết kế phong cách Pháp cổ điển rất có gu. Sân vườn hoa cẩm tú cầu ngập tràn sắc hương, ngồi đọc sách uống cà phê ngắm thung lũng cực chill. Quản gia nhiệt tình hỗ trợ chuẩn bị tiệc BBQ buổi tối.',
                    'positive' => 'Sân vườn rộng rãi, tiệc BBQ ngoài trời ấm cúng và sự hiếu khách của anh chị chủ nhà.',
                    'response' => 'TripNest và toàn thể đội ngũ quản gia rất vui vì gia đình bạn đã có những giây phút sum vầy ấm cúng!',
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 4.8, 'checkin' => 4.9, 'value' => 4.8],
                    'rating' => 4.9,
                ],
                [
                    'comment' => 'Phòng ốc thơm mùi tinh dầu gỗ thông tự nhiên, nệm êm ái ngủ một mạch tới sáng. Nước nóng mạnh và ổn định dù trời Đà Lạt về đêm khá lạnh. 10/10 điểm cho sự chu đáo và thân thiện.',
                    'positive' => 'Giường nệm êm ái chuẩn 5 sao, bồn tắm view đồi thông thư giãn tuyệt đối.',
                    'response' => null,
                    'radar' => ['cleanliness' => 5.0, 'accuracy' => 4.9, 'communication' => 5.0, 'location' => 4.9, 'checkin' => 5.0, 'value' => 5.0],
                    'rating' => 5.0,
                ],
                [
                    'comment' => 'Vị trí yên tĩnh cách xa tiếng còi xe trung tâm, view thung lũng đèn lồng lung linh huyền ảo về đêm. Đồ uống chào mừng ngon miệng, bữa sáng ấm nóng tận phòng.',
                    'positive' => 'Cảnh đêm thung lũng ngập tràn ánh đèn và bữa sáng ấm nóng.',
                    'response' => 'Cảm ơn bạn đã yêu thích khung cảnh thung lũng ánh sáng của chúng tôi. Chúc bạn luôn có những chuyến đi ý nghĩa!',
                    'radar' => ['cleanliness' => 4.8, 'accuracy' => 4.9, 'communication' => 4.9, 'location' => 4.8, 'checkin' => 4.9, 'value' => 4.8],
                    'rating' => 4.8,
                ],
            ],

            'beach' => [
                [
                    'comment' => 'Vị trí sát bờ biển cát trắng tuyệt đẹp, chỉ bước vài bước chân là ra đến bãi tắm riêng sạch tinh. Bồn tắm ngoài trời view biển hoàng hôn lãng mạn vô cùng, buffet sáng hải sản tươi ngon phong phú.',
                    'positive' => 'Bãi biển riêng sạch cát mịn, hồ bơi vô cực nước ấm ngắm trọn hoàng hôn.',
                    'response' => 'Cảm ơn quý khách đã chia sẻ cảm nhận tuyệt vời. Chúc bạn và gia đình luôn tràn đầy năng lượng tươi mới từ biển khơi!',
                    'radar' => ['cleanliness' => 5.0, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 5.0, 'checkin' => 5.0, 'value' => 4.9],
                    'rating' => 5.0,
                ],
                [
                    'comment' => 'Hồ bơi vô cực ngắm hoàng hôn đẹp xuất sắc, không gian riêng tư đẳng cấp quốc tế. Nhân viên đón tiếp bằng nước dừa tươi tận phòng, dịch vụ đưa đón sân bay rất đúng giờ và ân cần.',
                    'positive' => 'Dịch vụ chuẩn mực 5 sao, nước dừa tươi đón tiếp và hồ bơi vô cực hướng biển.',
                    'response' => 'Thật vinh hạnh được đón tiếp bạn. Rất mong được chào đón bạn quay trở lại trong những kỳ nghỉ dưỡng tiếp theo!',
                    'radar' => ['cleanliness' => 5.0, 'accuracy' => 4.9, 'communication' => 5.0, 'location' => 5.0, 'checkin' => 5.0, 'value' => 4.8],
                    'rating' => 4.9,
                ],
                [
                    'comment' => 'Phòng ngủ view ôm trọn đại dương bao la, thức dậy nghe tiếng sóng vỗ rì rào rất thư thái. Đồ ăn nhà hàng chuẩn vị hải sản địa phương, các bạn nhỏ thích mê khu vui chơi cát.',
                    'positive' => 'Tiếng sóng biển thư thái, phòng cách âm tốt và bữa tối hải sản tươi sống.',
                    'response' => null,
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 4.9, 'communication' => 4.9, 'location' => 5.0, 'checkin' => 4.9, 'value' => 4.9],
                    'rating' => 4.9,
                ],
                [
                    'comment' => 'Khu nghỉ dưỡng ngập tràn cây xanh nhiệt đới, kiến trúc villa gỗ hài hòa với thiên nhiên. Thuyền kayak và ván chèo SUP miễn phí cho khách lưu trú, trải nghiệm chèo thuyền lúc bình minh cực đã!',
                    'positive' => 'Trải nghiệm chèo SUP ngắm bình minh trên biển và cảnh quan nhiệt đới xanh mát.',
                    'response' => 'Cảm ơn bạn đã tận hưởng trọn vẹn các hoạt động thể thao biển tại khu nghỉ dưỡng của chúng tôi!',
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 5.0, 'communication' => 4.9, 'location' => 4.9, 'checkin' => 5.0, 'value' => 4.9],
                    'rating' => 4.9,
                ],
            ],

            'heritage' => [
                [
                    'comment' => 'Cơ sở nằm cạnh cánh đồng lúa xanh mướt thanh bình, mượn xe đạp dạo quanh làng quê và vào phố cổ đèn lồng chỉ mất chưa đầy 10 phút. Không gian mộc mạc hoài niệm nhưng tiện nghi chuẩn mực.',
                    'positive' => 'Xe đạp miễn phí đi dạo phố cổ, không gian thanh bình ngát hương lúa.',
                    'response' => 'Cảm ơn quý khách đã ghé thăm mảnh đất di sản. Mong rằng nét bình dị nơi đây đã mang lại cho bạn sự an yên trọn vẹn!',
                    'radar' => ['cleanliness' => 5.0, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 5.0, 'checkin' => 5.0, 'value' => 5.0],
                    'rating' => 5.0,
                ],
                [
                    'comment' => 'Cảm giác bình yên tách biệt hoàn toàn với phố thị xô bồ. Bữa sáng với món đặc sản chuẩn vị truyền thống, chủ nhà hướng dẫn tận tình các làng nghề truyền thống và quán ăn bản địa.',
                    'positive' => 'Bữa sáng đậm đà phong vị bản xứ và sự hiếu khách nồng hậu.',
                    'response' => 'Sự hài lòng của bạn chính là niềm tự hào lớn nhất của gia đình chúng tôi!',
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 4.9, 'checkin' => 5.0, 'value' => 4.9],
                    'rating' => 4.9,
                ],
                [
                    'comment' => 'Hồ sen trước ban công thơm ngát, nhân viên thân thiện mỉm cười chào hỏi mỗi khi ra vào. Một nơi lưu trú hoàn hảo để sống chậm, đọc sách và nạp lại năng lượng tích cực.',
                    'positive' => 'Hương sen thanh tao đầu mùa và nụ cười ấm áp của đội ngũ phục vụ.',
                    'response' => null,
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 4.9, 'communication' => 5.0, 'location' => 4.9, 'checkin' => 4.9, 'value' => 4.8],
                    'rating' => 4.9,
                ],
            ],

            'bay' => [
                [
                    'comment' => 'Cửa sổ kính kịch trần nhìn thẳng ra vịnh biển kỳ quan, sáng sớm nhâm nhi tách trà ngắm cảnh non nước kỳ vĩ như tranh thủy mặc. Phòng ốc sang trọng, bồn tắm sục Jacuzzi ngắm cảnh cực kỳ thư giãn.',
                    'positive' => 'Tầm nhìn panorama ôm trọn kỳ quan thiên nhiên thế giới, bồn sục Jacuzzi đẳng cấp.',
                    'response' => 'Cảm ơn quý khách! Rất hạnh phúc khi mang đến cho bạn trải nghiệm ngắm vịnh kỳ vĩ từ phòng nghỉ.',
                    'radar' => ['cleanliness' => 5.0, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 5.0, 'checkin' => 5.0, 'value' => 4.9],
                    'rating' => 5.0,
                ],
                [
                    'comment' => 'Vị trí đắc địa ngay cung đường bao biển, ban công lộng gió ngắm hoàng hôn vịnh buông xuống. Khách sạn hỗ trợ đặt vé du thuyền tham quan hang động giá cực tốt và uy tín.',
                    'positive' => 'Hỗ trợ đặt dịch vụ du thuyền chuyên nghiệp, phòng ốc mới tinh tươm.',
                    'response' => 'Chúng tôi luôn nỗ lực hết mình để mỗi chuyến đi khám phá vịnh của du khách đều trọn vẹn nhất!',
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 4.9, 'communication' => 5.0, 'location' => 5.0, 'checkin' => 4.9, 'value' => 4.8],
                    'rating' => 4.9,
                ],
            ],

            'mountain' => [
                [
                    'comment' => 'View ban công ôm trọn thung lũng mây bồng bềnh và những thửa ruộng bậc thang kỳ vĩ. Chiều ngắm mây trôi ngay trước hiên, tối ngâm bồn lá thuốc người Dao đỏ xua tan mọi mệt mỏi.',
                    'positive' => 'Săn biển mây bồng bềnh ngay tại phòng ngủ, trải nghiệm tắm thảo dược bản địa.',
                    'response' => 'Cảm ơn bạn đã lựa chọn không gian núi rừng của chúng tôi. Chúc bạn có thêm nhiều hành trình chinh phục thiên nhiên tuyệt đẹp!',
                    'radar' => ['cleanliness' => 5.0, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 5.0, 'checkin' => 5.0, 'value' => 4.9],
                    'rating' => 5.0,
                ],
                [
                    'comment' => 'Kiến trúc nhà gỗ mộc mạc kết hợp thổ cẩm vùng cao tinh tế. Lò sưởi ấm cúng, bữa tối lẩu cá hồi rau rừng tươi giòn ngon xuất sắc. Không gian trong lành yên tĩnh vô cùng.',
                    'positive' => 'Ẩm thực Tây Bắc đặc sắc và không gian ấm áp bên lò sưởi.',
                    'response' => 'Hẹn gặp lại bạn vào mùa lúa chín vàng óng trên nương bậc thang nhé!',
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 4.9, 'communication' => 4.9, 'location' => 4.9, 'checkin' => 5.0, 'value' => 4.9],
                    'rating' => 4.9,
                ],
            ],

            'city' => [
                [
                    'comment' => 'Vị trí trung tâm vô cùng thuận tiện, bước xuống phố là ngập tràn quán ăn ngon và cà phê phong cách. Căn hộ thiết kế hiện đại, wifi cáp quang tốc độ cao làm việc từ xa mượt mà.',
                    'positive' => 'Vị trí đắc địa dễ di chuyển, wifi tốc độ cao và giường êm ái.',
                    'response' => 'Cảm ơn bạn đã tin tưởng lựa chọn cơ sở cho chuyến công tác và du lịch. Hân hạnh phục vụ bạn lần sau!',
                    'radar' => ['cleanliness' => 5.0, 'accuracy' => 5.0, 'communication' => 5.0, 'location' => 5.0, 'checkin' => 5.0, 'value' => 4.9],
                    'rating' => 5.0,
                ],
                [
                    'comment' => 'Căn hộ dịch vụ cao cấp, tòa nhà có bảo vệ 24/7 an ninh tuyệt đối. Bếp đầy đủ gia vị và dụng cụ nấu ăn, máy giặt sấy rất tiện lợi. Nhân viên hỗ trợ nhận phòng nhanh chóng chuyên nghiệp.',
                    'positive' => 'Đầy đủ tiện nghi giặt sấy nấu nướng như ở nhà, an ninh cao cấp.',
                    'response' => null,
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 4.9, 'communication' => 5.0, 'location' => 4.9, 'checkin' => 5.0, 'value' => 4.8],
                    'rating' => 4.9,
                ],
                [
                    'comment' => 'Hồ bơi vô cực trên tầng thượng ngắm toàn cảnh thành phố lung linh ánh đèn. Phòng ốc dọn dẹp sạch sẽ thơm tho mỗi ngày, quầy lễ tân tư vấn lịch trình rất nhiệt tình chu đáo.',
                    'positive' => 'Hồ bơi tầng thượng view panorama toàn cảnh và phong cách phục vụ chu đáo.',
                    'response' => 'Cảm ơn bạn đã dành lời khen ngợi cho hồ bơi vô cực và đội ngũ nhân viên TripNest!',
                    'radar' => ['cleanliness' => 4.9, 'accuracy' => 4.9, 'communication' => 5.0, 'location' => 4.9, 'checkin' => 4.9, 'value' => 4.8],
                    'rating' => 4.9,
                ],
            ],
        ];

        $userCount = $users->count();
        $userIndex = 0;
        $totalCreated = 0;

        foreach ($accommodations as $accom) {
            $city = mb_strtolower($accom->city ?: '');
            $name = mb_strtolower($accom->name_vi ?: '');

            // Xác định nhóm văn phong review phù hợp với vị trí và phong cách
            if (str_contains($city, 'đà lạt') || str_contains($city, 'bảo lộc') || str_contains($name, 'đà lạt')) {
                $categoryPool = $reviewTemplates['dalat'];
            } elseif (str_contains($city, 'phú quốc') || str_contains($city, 'nha trang') || str_contains($city, 'vũng tàu') || str_contains($city, 'quy nhơn') || str_contains($name, 'resort') || str_contains($name, 'biển')) {
                $categoryPool = $reviewTemplates['beach'];
            } elseif (str_contains($city, 'hội an') || str_contains($city, 'huế') || str_contains($city, 'ninh bình')) {
                $categoryPool = $reviewTemplates['heritage'];
            } elseif (str_contains($city, 'hạ long') || str_contains($city, 'cát bà') || str_contains($name, 'vịnh')) {
                $categoryPool = $reviewTemplates['bay'];
            } elseif (str_contains($city, 'sa pa') || str_contains($city, 'tam đảo') || str_contains($city, 'lào cai') || str_contains($name, 'núi')) {
                $categoryPool = $reviewTemplates['mountain'];
            } else {
                $categoryPool = $reviewTemplates['city'];
            }

            $rooms = $accom->rooms;
            if ($rooms->isEmpty()) {
                continue;
            }

            // Tạo từ 3 đến 5 review chân thực cho mỗi cơ sở lưu trú
            $numReviews = min(count($categoryPool), rand(3, 4));

            for ($i = 0; $i < $numReviews; $i++) {
                $tmpl = $categoryPool[$i % count($categoryPool)];
                $targetRoom = $rooms[$i % $rooms->count()];
                $reviewer = $users[$userIndex % $userCount];
                $userIndex++;

                $daysAgo = rand(3, 60);
                $reviewDate = Carbon::now()->subDays($daysAgo);

                Review::create([
                    'room_id' => $targetRoom->id,
                    'user_id' => $reviewer->id,
                    'booking_id' => null,
                    'rating' => $tmpl['rating'],
                    'rating_breakdown' => array_merge($tmpl['radar'], [
                        'positive_point' => $tmpl['positive'],
                    ]),
                    'comment' => $tmpl['comment'],
                    'host_response' => $tmpl['response'],
                    'host_responded_at' => $tmpl['response'] ? $reviewDate->copy()->addHours(rand(2, 24)) : null,
                    'status' => 'approved',
                    'created_at' => $reviewDate,
                    'updated_at' => $reviewDate,
                ]);

                $totalCreated++;
            }

            // Cập nhật lại số lượng và điểm trung bình cho từng room
            foreach ($rooms as $r) {
                $rReviews = Review::where('room_id', $r->id)->where('status', '!=', 'hidden')->get();
                $avgRoomRating = $rReviews->isNotEmpty() ? round($rReviews->avg('rating'), 2) : 4.96;
                $r->update([
                    'rating' => $avgRoomRating,
                    'reviews_count' => max(12, $rReviews->count() * 15),
                ]);
            }
        }

        echo "Đã tạo thành công {$totalCreated} bài đánh giá chân thực, đa dạng cho 56 cơ sở lưu trú và cập nhật điểm rating đồng bộ!" . PHP_EOL;
    }
}
