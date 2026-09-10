<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LocationController extends Controller
{
    /**
     * Danh sách đầy đủ 63 Tỉnh/Thành phố Việt Nam & Các điểm đến du lịch nổi tiếng
     */
    protected static array $provinces = [
        ['id' => 1, 'name' => 'An Giang', 'code' => 'AG', 'slug' => 'an-giang', 'region' => 'Miền Nam', 'lat' => 10.3885, 'lng' => 105.4358, 'aliases' => ['châu đốc', 'long xuyên']],
        ['id' => 2, 'name' => 'Bà Rịa - Vũng Tàu', 'code' => 'VT', 'slug' => 'ba-ria-vung-tau', 'region' => 'Miền Nam', 'lat' => 10.3460, 'lng' => 107.0843, 'aliases' => ['vũng tàu', 'vung tau', 'côn đảo', 'long hải']],
        ['id' => 3, 'name' => 'Bắc Giang', 'code' => 'BG', 'slug' => 'bac-giang', 'region' => 'Miền Bắc', 'lat' => 21.2731, 'lng' => 106.1946, 'aliases' => ['lục ngạn']],
        ['id' => 4, 'name' => 'Bắc Kạn', 'code' => 'BK', 'slug' => 'bac-kan', 'region' => 'Miền Bắc', 'lat' => 22.1470, 'lng' => 105.8348, 'aliases' => ['ba bể', 'hồ ba bể']],
        ['id' => 5, 'name' => 'Bạc Liêu', 'code' => 'BL', 'slug' => 'bac-lieu', 'region' => 'Miền Nam', 'lat' => 9.2941, 'lng' => 105.7278, 'aliases' => ['công tử bạc liêu']],
        ['id' => 6, 'name' => 'Bắc Ninh', 'code' => 'BN', 'slug' => 'bac-ninh', 'region' => 'Miền Bắc', 'lat' => 21.1861, 'lng' => 106.0763, 'aliases' => ['kinh bắc', 'từ sơn']],
        ['id' => 7, 'name' => 'Bến Tre', 'code' => 'BT', 'slug' => 'ben-tre', 'region' => 'Miền Nam', 'lat' => 10.2433, 'lng' => 106.3756, 'aliases' => ['xứ dừa']],
        ['id' => 8, 'name' => 'Bình Định', 'code' => 'BDI', 'slug' => 'binh-dinh', 'region' => 'Miền Trung', 'lat' => 13.7820, 'lng' => 109.2197, 'aliases' => ['quy nhơn', 'quy nhon', 'kỳ co', 'eo gió']],
        ['id' => 9, 'name' => 'Bình Dương', 'code' => 'BD', 'slug' => 'binh-duong', 'region' => 'Miền Nam', 'lat' => 11.1667, 'lng' => 106.6667, 'aliases' => ['thủ dầu một', 'dĩ an']],
        ['id' => 10, 'name' => 'Bình Phước', 'code' => 'BP', 'slug' => 'binh-phuoc', 'region' => 'Miền Nam', 'lat' => 11.7511, 'lng' => 106.9048, 'aliases' => ['đồng xoài']],
        ['id' => 11, 'name' => 'Bình Thuận', 'code' => 'BTH', 'slug' => 'binh-thuan', 'region' => 'Miền Trung', 'lat' => 10.9273, 'lng' => 108.1022, 'aliases' => ['phan thiết', 'phan thiet', 'mũi né', 'mui ne']],
        ['id' => 12, 'name' => 'Cà Mau', 'code' => 'CM', 'slug' => 'ca-mau', 'region' => 'Miền Nam', 'lat' => 9.1769, 'lng' => 105.1524, 'aliases' => ['đất mũi', 'u minh']],
        ['id' => 13, 'name' => 'Cần Thơ', 'code' => 'CT', 'slug' => 'can-tho', 'region' => 'Miền Nam', 'lat' => 10.0452, 'lng' => 105.7469, 'aliases' => ['ninh kiều', 'cái răng']],
        ['id' => 14, 'name' => 'Cao Bằng', 'code' => 'CB', 'slug' => 'cao-bang', 'region' => 'Miền Bắc', 'lat' => 22.6657, 'lng' => 106.2577, 'aliases' => ['thác bản giốc', 'pác bó']],
        ['id' => 15, 'name' => 'Đà Nẵng', 'code' => 'DN', 'slug' => 'da-nang', 'region' => 'Miền Trung', 'lat' => 16.0544, 'lng' => 108.2022, 'aliases' => ['bà nà', 'ba na hills', 'ngũ hành sơn', 'sơn trà']],
        ['id' => 16, 'name' => 'Đắk Lắk', 'code' => 'DL', 'slug' => 'dak-lak', 'region' => 'Tây Nguyên', 'lat' => 12.6667, 'lng' => 108.0500, 'aliases' => ['buôn ma thuột', 'bmt', 'hồ lắk']],
        ['id' => 17, 'name' => 'Đắk Nông', 'code' => 'DNO', 'slug' => 'dak-nong', 'region' => 'Tây Nguyên', 'lat' => 12.0044, 'lng' => 107.6876, 'aliases' => ['tà đùng', 'gia nghĩa']],
        ['id' => 18, 'name' => 'Điện Biên', 'code' => 'DB', 'slug' => 'dien-bien', 'region' => 'Miền Bắc', 'lat' => 21.3842, 'lng' => 103.0188, 'aliases' => ['điện biên phủ']],
        ['id' => 19, 'name' => 'Đồng Nai', 'code' => 'DNA', 'slug' => 'dong-nai', 'region' => 'Miền Nam', 'lat' => 10.9574, 'lng' => 106.8427, 'aliases' => ['biên hòa', 'nam cát tiên']],
        ['id' => 20, 'name' => 'Đồng Tháp', 'code' => 'DT', 'slug' => 'dong-thap', 'region' => 'Miền Nam', 'lat' => 10.4578, 'lng' => 105.6322, 'aliases' => ['cao lãnh', 'sa đéc', 'tràm chim']],
        ['id' => 21, 'name' => 'Gia Lai', 'code' => 'GL', 'slug' => 'gia-lai', 'region' => 'Tây Nguyên', 'lat' => 13.9833, 'lng' => 108.0000, 'aliases' => ['pleiku', 'biển hồ']],
        ['id' => 22, 'name' => 'Hà Giang', 'code' => 'HG', 'slug' => 'ha-giang', 'region' => 'Miền Bắc', 'lat' => 22.8233, 'lng' => 104.9839, 'aliases' => ['đồng văn', 'mã pí lèng', 'mèo vạc']],
        ['id' => 23, 'name' => 'Hà Nam', 'code' => 'HNA', 'slug' => 'ha-nam', 'region' => 'Miền Bắc', 'lat' => 20.5844, 'lng' => 105.9224, 'aliases' => ['tam chúc', 'phủ lý']],
        ['id' => 24, 'name' => 'Hà Nội', 'code' => 'HN', 'slug' => 'ha-noi', 'region' => 'Miền Bắc', 'lat' => 21.0285, 'lng' => 105.8542, 'aliases' => ['thủ đô', 'hoàn kiếm', 'ba đình', 'tây hồ']],
        ['id' => 25, 'name' => 'Hà Tĩnh', 'code' => 'HT', 'slug' => 'ha-tinh', 'region' => 'Miền Trung', 'lat' => 18.3560, 'lng' => 105.9059, 'aliases' => ['thiên cầm']],
        ['id' => 26, 'name' => 'Hải Dương', 'code' => 'HD', 'slug' => 'hai-duong', 'region' => 'Miền Bắc', 'lat' => 20.9386, 'lng' => 106.3157, 'aliases' => ['chí linh', 'côn sơn']],
        ['id' => 27, 'name' => 'Hải Phòng', 'code' => 'HP', 'slug' => 'hai-phong', 'region' => 'Miền Bắc', 'lat' => 20.8449, 'lng' => 106.6881, 'aliases' => ['cát bà', 'cat ba', 'đồ sơn', 'do son']],
        ['id' => 28, 'name' => 'Hậu Giang', 'code' => 'HGI', 'slug' => 'hau-giang', 'region' => 'Miền Nam', 'lat' => 9.7844, 'lng' => 105.4701, 'aliases' => ['vị thanh']],
        ['id' => 29, 'name' => 'Hòa Bình', 'code' => 'HB', 'slug' => 'hoa-binh', 'region' => 'Miền Bắc', 'lat' => 20.8172, 'lng' => 105.3376, 'aliases' => ['mai châu', 'mai chau', 'kim bôi']],
        ['id' => 30, 'name' => 'Hưng Yên', 'code' => 'HY', 'slug' => 'hung-yen', 'region' => 'Miền Bắc', 'lat' => 20.6464, 'lng' => 106.0511, 'aliases' => ['phố hiến']],
        ['id' => 31, 'name' => 'Khánh Hòa', 'code' => 'KH', 'slug' => 'khanh-hoa', 'region' => 'Miền Trung', 'lat' => 12.2451, 'lng' => 109.1943, 'aliases' => ['nha trang', 'cam ranh', 'vân phong']],
        ['id' => 32, 'name' => 'Kiên Giang', 'code' => 'KG', 'slug' => 'kien-giang', 'region' => 'Miền Nam', 'lat' => 10.0125, 'lng' => 105.0809, 'aliases' => ['phú quốc', 'phu quoc', 'hà tiên', 'nam du']],
        ['id' => 33, 'name' => 'Kon Tum', 'code' => 'KT', 'slug' => 'kon-tum', 'region' => 'Tây Nguyên', 'lat' => 14.3500, 'lng' => 108.0000, 'aliases' => ['măng đen', 'mang den']],
        ['id' => 34, 'name' => 'Lai Châu', 'code' => 'LC', 'slug' => 'lai-chau', 'region' => 'Miền Bắc', 'lat' => 22.3964, 'lng' => 103.4684, 'aliases' => ['sin suối hồ']],
        ['id' => 35, 'name' => 'Lâm Đồng', 'code' => 'LD', 'slug' => 'lam-dong', 'region' => 'Tây Nguyên', 'lat' => 11.9404, 'lng' => 108.4583, 'aliases' => ['đà lạt', 'da lat', 'bảo lộc', 'tuyền lâm']],
        ['id' => 36, 'name' => 'Lạng Sơn', 'code' => 'LS', 'slug' => 'lang-son', 'region' => 'Miền Bắc', 'lat' => 21.8537, 'lng' => 106.7621, 'aliases' => ['mẫu sơn']],
        ['id' => 37, 'name' => 'Lào Cai', 'code' => 'LCA', 'slug' => 'lao-cai', 'region' => 'Miền Bắc', 'lat' => 22.4856, 'lng' => 103.9707, 'aliases' => ['sa pa', 'sapa', 'fansipan', 'y tý']],
        ['id' => 38, 'name' => 'Long An', 'code' => 'LA', 'slug' => 'long-an', 'region' => 'Miền Nam', 'lat' => 10.5442, 'lng' => 106.4116, 'aliases' => ['tân an', 'bến lức']],
        ['id' => 39, 'name' => 'Nam Định', 'code' => 'ND', 'slug' => 'nam-dinh', 'region' => 'Miền Bắc', 'lat' => 20.4344, 'lng' => 106.1773, 'aliases' => ['quất lâm']],
        ['id' => 40, 'name' => 'Nghệ An', 'code' => 'NA', 'slug' => 'nghe-an', 'region' => 'Miền Trung', 'lat' => 19.2343, 'lng' => 104.9200, 'aliases' => ['vinh', 'cửa lò', 'cua lo']],
        ['id' => 41, 'name' => 'Ninh Bình', 'code' => 'NB', 'slug' => 'ninh-binh', 'region' => 'Miền Bắc', 'lat' => 20.2506, 'lng' => 105.9745, 'aliases' => ['tràng an', 'tam cốc', 'bái đính']],
        ['id' => 42, 'name' => 'Ninh Thuận', 'code' => 'NT', 'slug' => 'ninh-thuan', 'region' => 'Miền Trung', 'lat' => 11.6739, 'lng' => 108.9328, 'aliases' => ['phan rang', 'vĩnh hy']],
        ['id' => 43, 'name' => 'Phú Thọ', 'code' => 'PT', 'slug' => 'phu-tho', 'region' => 'Miền Bắc', 'lat' => 21.3228, 'lng' => 105.2280, 'aliases' => ['đền hùng', 'việt trì']],
        ['id' => 44, 'name' => 'Phú Yên', 'code' => 'PY', 'slug' => 'phu-yen', 'region' => 'Miền Trung', 'lat' => 13.0882, 'lng' => 109.0924, 'aliases' => ['tuy hòa', 'gành đá đĩa']],
        ['id' => 45, 'name' => 'Quảng Bình', 'code' => 'QB', 'slug' => 'quang-binh', 'region' => 'Miền Trung', 'lat' => 17.4690, 'lng' => 106.6200, 'aliases' => ['đồng hới', 'phong nha', 'sơn đoòng']],
        ['id' => 46, 'name' => 'Quảng Nam', 'code' => 'QNA', 'slug' => 'quang-nam', 'region' => 'Miền Trung', 'lat' => 15.5394, 'lng' => 108.0191, 'aliases' => ['hội an', 'hoi an', 'tam kỳ', 'cù lao chàm']],
        ['id' => 47, 'name' => 'Quảng Ngãi', 'code' => 'QNG', 'slug' => 'quang-ngai', 'region' => 'Miền Trung', 'lat' => 15.1205, 'lng' => 108.7923, 'aliases' => ['lý sơn', 'ly son']],
        ['id' => 48, 'name' => 'Quảng Ninh', 'code' => 'QN', 'slug' => 'quang-ninh', 'region' => 'Miền Bắc', 'lat' => 21.0069, 'lng' => 107.2925, 'aliases' => ['hạ long', 'ha long', 'cô tô', 'vân đồn']],
        ['id' => 49, 'name' => 'Quảng Trị', 'code' => 'QT', 'slug' => 'quang-tri', 'region' => 'Miền Trung', 'lat' => 16.7500, 'lng' => 107.1857, 'aliases' => ['đông hà']],
        ['id' => 50, 'name' => 'Sóc Trăng', 'code' => 'ST', 'slug' => 'soc-trang', 'region' => 'Miền Nam', 'lat' => 9.6033, 'lng' => 105.9800, 'aliases' => ['chùa dơi']],
        ['id' => 51, 'name' => 'Sơn La', 'code' => 'SL', 'slug' => 'son-la', 'region' => 'Miền Bắc', 'lat' => 21.3283, 'lng' => 103.9148, 'aliases' => ['mộc châu', 'moc chau', 'tà xùa']],
        ['id' => 52, 'name' => 'Tây Ninh', 'code' => 'TN', 'slug' => 'tay-ninh', 'region' => 'Miền Nam', 'lat' => 11.3102, 'lng' => 106.0988, 'aliases' => ['núi bà đen']],
        ['id' => 53, 'name' => 'Thái Bình', 'code' => 'TB', 'slug' => 'thai-binh', 'region' => 'Miền Bắc', 'lat' => 20.4463, 'lng' => 106.3366, 'aliases' => ['đồng châu']],
        ['id' => 54, 'name' => 'Thái Nguyên', 'code' => 'TNG', 'slug' => 'thai-nguyen', 'region' => 'Miền Bắc', 'lat' => 21.5928, 'lng' => 105.8442, 'aliases' => ['hồ núi cốc']],
        ['id' => 55, 'name' => 'Thanh Hóa', 'code' => 'TH', 'slug' => 'thanh-hoa', 'region' => 'Miền Trung', 'lat' => 19.8067, 'lng' => 105.7852, 'aliases' => ['sầm sơn', 'sam son', 'pù luông']],
        ['id' => 56, 'name' => 'Thừa Thiên Huế', 'code' => 'TTH', 'slug' => 'thua-thien-hue', 'region' => 'Miền Trung', 'lat' => 16.4637, 'lng' => 107.5909, 'aliases' => ['huế', 'hue', 'lăng cô']],
        ['id' => 57, 'name' => 'Tiền Giang', 'code' => 'TG', 'slug' => 'tien-giang', 'region' => 'Miền Nam', 'lat' => 10.3600, 'lng' => 106.3600, 'aliases' => ['mỹ tho', 'cái bè']],
        ['id' => 58, 'name' => 'TP. Hồ Chí Minh', 'code' => 'HCM', 'slug' => 'ho-chi-minh', 'region' => 'Miền Nam', 'lat' => 10.8231, 'lng' => 106.6297, 'aliases' => ['sài gòn', 'sai gon', 'tphcm', 'tp hcm', 'tp.hcm', 'hồ chí minh']],
        ['id' => 59, 'name' => 'Trà Vinh', 'code' => 'TV', 'slug' => 'tra-vinh', 'region' => 'Miền Nam', 'lat' => 9.9347, 'lng' => 106.3455, 'aliases' => ['ba động']],
        ['id' => 60, 'name' => 'Tuyên Quang', 'code' => 'TQ', 'slug' => 'tuyen-quang', 'region' => 'Miền Bắc', 'lat' => 21.8234, 'lng' => 105.2148, 'aliases' => ['na hang']],
        ['id' => 61, 'name' => 'Vĩnh Long', 'code' => 'VL', 'slug' => 'vinh-long', 'region' => 'Miền Nam', 'lat' => 10.2537, 'lng' => 105.9722, 'aliases' => ['bình minh']],
        ['id' => 62, 'name' => 'Vĩnh Phúc', 'code' => 'VP', 'slug' => 'vinh-phuc', 'region' => 'Miền Bắc', 'lat' => 21.3089, 'lng' => 105.6049, 'aliases' => ['tam đảo', 'tam dao', 'đại lải']],
        ['id' => 63, 'name' => 'Yên Bái', 'code' => 'YB', 'slug' => 'yen-bai', 'region' => 'Miền Bắc', 'lat' => 21.7168, 'lng' => 104.8986, 'aliases' => ['mù cang chải', 'mu cang chai', 'hồ thác bà']],

        // --- Các Điểm Đến Du Lịch Trọng Điểm ---
        ['id' => 101, 'name' => 'Đà Lạt', 'code' => 'DLI', 'slug' => 'da-lat', 'region' => 'Lâm Đồng', 'lat' => 11.9404, 'lng' => 108.4583, 'is_tourist_hub' => true, 'aliases' => ['da lat', 'lâm đồng', 'thành phố ngàn hoa', 'tuyền lâm']],
        ['id' => 102, 'name' => 'Phú Quốc', 'code' => 'PQC', 'slug' => 'phu-quoc', 'region' => 'Kiên Giang', 'lat' => 10.2899, 'lng' => 103.9840, 'is_tourist_hub' => true, 'aliases' => ['phu quoc', 'đảo ngọc', 'kiên giang', 'bãi sao']],
        ['id' => 103, 'name' => 'Nha Trang', 'code' => 'NHA', 'slug' => 'nha-trang', 'region' => 'Khánh Hòa', 'lat' => 12.2388, 'lng' => 109.1967, 'is_tourist_hub' => true, 'aliases' => ['nha trang', 'khánh hòa', 'vinpearl']],
        ['id' => 104, 'name' => 'Hội An', 'code' => 'HOI', 'slug' => 'hoi-an', 'region' => 'Quảng Nam', 'lat' => 15.8801, 'lng' => 108.3380, 'is_tourist_hub' => true, 'aliases' => ['hoi an', 'phố cổ hội an', 'quảng nam']],
        ['id' => 105, 'name' => 'Sa Pa', 'code' => 'SPA', 'slug' => 'sa-pa', 'region' => 'Lào Cai', 'lat' => 22.3364, 'lng' => 103.8438, 'is_tourist_hub' => true, 'aliases' => ['sapa', 'sa pa', 'fansipan', 'lào cai']],
        ['id' => 106, 'name' => 'Hạ Long', 'code' => 'HLG', 'slug' => 'ha-long', 'region' => 'Quảng Ninh', 'lat' => 20.9599, 'lng' => 107.0425, 'is_tourist_hub' => true, 'aliases' => ['ha long', 'vịnh hạ long', 'quảng ninh']],
        ['id' => 107, 'name' => 'Vũng Tàu', 'code' => 'VTU', 'slug' => 'vung-tau', 'region' => 'Bà Rịa - Vũng Tàu', 'lat' => 10.3460, 'lng' => 107.0843, 'is_tourist_hub' => true, 'aliases' => ['vung tau', 'bà rịa', 'hồ tràm']],
        ['id' => 108, 'name' => 'Quy Nhơn', 'code' => 'UIH', 'slug' => 'quy-nhon', 'region' => 'Bình Định', 'lat' => 13.7820, 'lng' => 109.2197, 'is_tourist_hub' => true, 'aliases' => ['quy nhon', 'bình định', 'kỳ co', 'eo gió']],
        ['id' => 109, 'name' => 'Phan Thiết', 'code' => 'PTH', 'slug' => 'phan-thiet', 'region' => 'Bình Thuận', 'lat' => 10.9273, 'lng' => 108.1022, 'is_tourist_hub' => true, 'aliases' => ['phan thiet', 'mũi né', 'mui ne', 'bình thuận']],
        ['id' => 110, 'name' => 'Huế', 'code' => 'HUE', 'slug' => 'hue', 'region' => 'Thừa Thiên Huế', 'lat' => 16.4637, 'lng' => 107.5909, 'is_tourist_hub' => true, 'aliases' => ['hue', 'thừa thiên huế', 'sông hương']],
        ['id' => 111, 'name' => 'Côn Đảo', 'code' => 'CDO', 'slug' => 'con-dao', 'region' => 'Bà Rịa - Vũng Tàu', 'lat' => 8.6835, 'lng' => 106.6067, 'is_tourist_hub' => true, 'aliases' => ['con dao', 'côn sơn', 'vũng tàu']],
        ['id' => 112, 'name' => 'Cát Bà', 'code' => 'CBA', 'slug' => 'cat-ba', 'region' => 'Hải Phòng', 'lat' => 20.7276, 'lng' => 107.0487, 'is_tourist_hub' => true, 'aliases' => ['cat ba', 'vịnh lan hạ', 'hải phòng']],
        ['id' => 113, 'name' => 'Mộc Châu', 'code' => 'MCH', 'slug' => 'moc-chau', 'region' => 'Sơn La', 'lat' => 20.8427, 'lng' => 104.6469, 'is_tourist_hub' => true, 'aliases' => ['moc chau', 'sơn la']],
        ['id' => 114, 'name' => 'Tam Đảo', 'code' => 'TDO', 'slug' => 'tam-dao', 'region' => 'Vĩnh Phúc', 'lat' => 21.4586, 'lng' => 105.6483, 'is_tourist_hub' => true, 'aliases' => ['tam dao', 'vĩnh phúc']],
    ];

    /**
     * Chuyển chuỗi tiếng Việt có dấu thành không dấu để so sánh tìm kiếm
     */
    protected static function removeVietnameseTones(string $str): string
    {
        $unicode = [
            'a' => 'á|à|ả|ã|ạ|ă|ắ|ặ|ằ|ẳ|ẵ|â|ấ|ầ|ẩ|ẫ|ậ',
            'd' => 'đ',
            'e' => 'é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ',
            'i' => 'í|ì|ỉ|ĩ|ị',
            'o' => 'ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ',
            'u' => 'ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự',
            'y' => 'ý|ỳ|ỷ|ỹ|ỵ',
            'A' => 'Á|À|Ả|Ã|Ạ|Ă|Ắ|Ặ|Ằ|Ẳ|Ẵ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ',
            'D' => 'Đ',
            'E' => 'É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|Ễ|Ệ',
            'I' => 'Í|Ì|Ỉ|Ĩ|Ị',
            'O' => 'Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ',
            'U' => 'Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự',
            'Y' => 'Ý|Ỳ|Ỷ|Ỹ|Ỵ',
        ];

        foreach ($unicode as $nonAccent => $accent) {
            $str = preg_replace("/($accent)/i", $nonAccent, $str);
        }

        $str = preg_replace('/^(tinh|thanh pho|tp\.|tp)\s+/i', '', $str);

        return strtolower(trim($str));
    }

    /**
     * Lấy toàn bộ danh sách 63 Tỉnh/Thành phố & Điểm đến (kèm đếm số cơ sở lưu trú)
     */
    public function getProvinces(Request $request): JsonResponse
    {
        $data = Cache::remember('vietnam_provinces_complete_v2', 3600, function () {
            // Lấy thống kê số lượng chỗ nghỉ theo từng tỉnh
            $accommodationCounts = [];
            try {
                $accommodationCounts = Accommodation::selectRaw('province, COUNT(*) as count')
                    ->where('status', 'approved')
                    ->groupBy('province')
                    ->pluck('count', 'province')
                    ->toArray();
            } catch (\Throwable $e) {
                // Ignore DB error if table not ready
            }

            return array_map(function ($province) use ($accommodationCounts) {
                $province['accommodations_count'] = $accommodationCounts[$province['name']] ?? 0;
                return $province;
            }, self::$provinces);
        });

        return response()->json([
            'status' => 'success',
            'total' => count($data),
            'data' => $data,
        ]);
    }

    /**
     * Tìm kiếm Tỉnh/Thành phố theo từ khóa (Fuzzy Search)
     */
    public function searchLocations(Request $request): JsonResponse
    {
        $keyword = trim((string) $request->query('q', ''));

        if (empty($keyword)) {
            return $this->getProvinces($request);
        }

        $normalizedQuery = self::removeVietnameseTones($keyword);
        $scored = [];

        foreach (self::$provinces as $province) {
            $normalizedName = self::removeVietnameseTones($province['name']);
            $lowerName = mb_strtolower($province['name'], 'UTF-8');
            $normalizedRegion = isset($province['region']) ? self::removeVietnameseTones($province['region']) : '';
            $code = strtolower($province['code'] ?? '');
            $slug = strtolower($province['slug'] ?? '');
            $aliases = array_map([self::class, 'removeVietnameseTones'], $province['aliases'] ?? []);

            $score = 0;

            if ($normalizedName === $normalizedQuery || $lowerName === strtolower($keyword)) {
                $score += 100;
            } elseif (str_starts_with($normalizedName, $normalizedQuery) || str_starts_with($lowerName, strtolower($keyword))) {
                $score += 80;
            } elseif (str_contains($normalizedName, $normalizedQuery) || str_contains($lowerName, strtolower($keyword))) {
                $score += 60;
            } elseif (in_array($normalizedQuery, $aliases, true)) {
                $score += 55;
            } else {
                foreach ($aliases as $alias) {
                    if (str_starts_with($alias, $normalizedQuery)) {
                        $score += 45;
                        break;
                    } elseif (str_contains($alias, $normalizedQuery)) {
                        $score += 35;
                        break;
                    }
                }
            }

            if ($score === 0 && ($code === $normalizedQuery || $slug === $normalizedQuery)) {
                $score += 30;
            } elseif ($score === 0 && str_contains($normalizedRegion, $normalizedQuery)) {
                $score += 20;
            }

            if ($score > 0) {
                $scored[] = ['province' => $province, 'score' => $score];
            }
        }

        usort($scored, function ($a, $b) {
            if ($b['score'] !== $a['score']) {
                return $b['score'] <=> $a['score'];
            }
            return strcmp($a['province']['name'], $b['province']['name']);
        });

        $results = array_map(function ($item) {
            return $item['province'];
        }, $scored);

        return response()->json([
            'status' => 'success',
            'query' => $keyword,
            'total' => count($results),
            'data' => $results,
        ]);
    }
}
