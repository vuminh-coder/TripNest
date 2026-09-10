/**
 * Danh sách đầy đủ toàn bộ 63 Tỉnh/Thành phố Việt Nam & Các điểm đến du lịch hàng đầu
 * Tích hợp tọa độ GPS, mã vùng, slug, phân vùng miền và từ khóa tìm kiếm (aliases)
 */

export const VIETNAM_PROVINCES = [
  // --- 5 Thành phố Trực thuộc Trung ương & Các Tỉnh Thành Phổ Biến (A-Z) ---
  { id: 1, name: 'An Giang', code: 'AG', slug: 'an-giang', region: 'Miền Nam', lat: 10.3885, lng: 105.4358, aliases: ['an giang', 'châu đốc', 'long xuyên'] },
  { id: 2, name: 'Bà Rịa - Vũng Tàu', code: 'VT', slug: 'ba-ria-vung-tau', region: 'Miền Nam', lat: 10.3460, lng: 107.0843, aliases: ['vũng tàu', 'vung tau', 'bà rịa', 'côn đảo', 'con dao', 'long hải'] },
  { id: 3, name: 'Bắc Giang', code: 'BG', slug: 'bac-giang', region: 'Miền Bắc', lat: 21.2731, lng: 106.1946, aliases: ['bac giang', 'lục ngạn'] },
  { id: 4, name: 'Bắc Kạn', code: 'BK', slug: 'bac-kan', region: 'Miền Bắc', lat: 22.1470, lng: 105.8348, aliases: ['bac kan', 'ba bể', 'hồ ba bể'] },
  { id: 5, name: 'Bạc Liêu', code: 'BL', slug: 'bac-lieu', region: 'Miền Nam', lat: 9.2941, lng: 105.7278, aliases: ['bac lieu', 'công tử bạc liêu'] },
  { id: 6, name: 'Bắc Ninh', code: 'BN', slug: 'bac-ninh', region: 'Miền Bắc', lat: 21.1861, lng: 106.0763, aliases: ['bac ninh', 'kinh bắc', 'từ sơn'] },
  { id: 7, name: 'Bến Tre', code: 'BT', slug: 'ben-tre', region: 'Miền Nam', lat: 10.2433, lng: 106.3756, aliases: ['ben tre', 'xứ dừa', 'châu thành'] },
  { id: 8, name: 'Bình Định', code: 'BDI', slug: 'binh-dinh', region: 'Miền Trung', lat: 13.7820, lng: 109.2197, aliases: ['binh dinh', 'quy nhơn', 'quy nhon', 'kỳ co', 'eo gió'] },
  { id: 9, name: 'Bình Dương', code: 'BD', slug: 'binh-duong', region: 'Miền Nam', lat: 11.1667, lng: 106.6667, aliases: ['binh duong', 'thủ dầu một', 'dĩ an', 'thuận an'] },
  { id: 10, name: 'Bình Phước', code: 'BP', slug: 'binh-phuoc', region: 'Miền Nam', lat: 11.7511, lng: 106.9048, aliases: ['binh phuoc', 'đồng xoài', 'bình long'] },
  { id: 11, name: 'Bình Thuận', code: 'BTH', slug: 'binh-thuan', region: 'Miền Trung', lat: 10.9273, lng: 108.1022, aliases: ['binh thuan', 'phan thiết', 'phan thiet', 'mũi né', 'mui ne'] },
  { id: 12, name: 'Cà Mau', code: 'CM', slug: 'ca-mau', region: 'Miền Nam', lat: 9.1769, lng: 105.1524, aliases: ['ca mau', 'đất mũi', 'u minh'] },
  { id: 13, name: 'Cần Thơ', code: 'CT', slug: 'can-tho', region: 'Miền Nam', lat: 10.0452, lng: 105.7469, aliases: ['can tho', 'tây đô', 'ninh kiều', 'cái răng'] },
  { id: 14, name: 'Cao Bằng', code: 'CB', slug: 'cao-bang', region: 'Miền Bắc', lat: 22.6657, lng: 106.2577, aliases: ['cao bang', 'thác bản giốc', 'pác bó'] },
  { id: 15, name: 'Đà Nẵng', code: 'DN', slug: 'da-nang', region: 'Miền Trung', lat: 16.0544, lng: 108.2022, aliases: ['da nang', 'bà nà', 'ba na hills', 'ngũ hành sơn', 'sơn trà'] },
  { id: 16, name: 'Đắk Lắk', code: 'DL', slug: 'dak-lak', region: 'Tây Nguyên', lat: 12.6667, lng: 108.0500, aliases: ['dak lak', 'đắc lắc', 'buôn ma thuột', 'bmt', 'hồ lắk'] },
  { id: 17, name: 'Đắk Nông', code: 'DNO', slug: 'dak-nong', region: 'Tây Nguyên', lat: 12.0044, lng: 107.6876, aliases: ['dak nong', 'đắc nông', 'gia nghĩa', 'tà đùng'] },
  { id: 18, name: 'Điện Biên', code: 'DB', slug: 'dien-bien', region: 'Miền Bắc', lat: 21.3842, lng: 103.0188, aliases: ['dien bien', 'điện biên phủ', 'mường thanh'] },
  { id: 19, name: 'Đồng Nai', code: 'DNA', slug: 'dong-nai', region: 'Miền Nam', lat: 10.9574, lng: 106.8427, aliases: ['dong nai', 'biên hòa', 'long khánh', 'nam cát tiên'] },
  { id: 20, name: 'Đồng Tháp', code: 'DT', slug: 'dong-thap', region: 'Miền Nam', lat: 10.4578, lng: 105.6322, aliases: ['dong thap', 'cao lãnh', 'sa đéc', 'tràm chim'] },
  { id: 21, name: 'Gia Lai', code: 'GL', slug: 'gia-lai', region: 'Tây Nguyên', lat: 13.9833, lng: 108.0000, aliases: ['gia lai', 'pleiku', 'biển hồ'] },
  { id: 22, name: 'Hà Giang', code: 'HG', slug: 'ha-giang', region: 'Miền Bắc', lat: 22.8233, lng: 104.9839, aliases: ['ha giang', 'đồng văn', 'mã pí lèng', 'mèo vạc', 'yên minh'] },
  { id: 23, name: 'Hà Nam', code: 'HNA', slug: 'ha-nam', region: 'Miền Bắc', lat: 20.5844, lng: 105.9224, aliases: ['ha nam', 'phủ lý', 'tam chúc'] },
  { id: 24, name: 'Hà Nội', code: 'HN', slug: 'ha-noi', region: 'Miền Bắc', lat: 21.0285, lng: 105.8542, aliases: ['ha noi', 'thủ đô', 'hoàn kiếm', 'ba đình', 'tây hồ'] },
  { id: 25, name: 'Hà Tĩnh', code: 'HT', slug: 'ha-tinh', region: 'Miền Trung', lat: 18.3560, lng: 105.9059, aliases: ['ha tinh', 'thiên cầm', 'hồng lĩnh'] },
  { id: 26, name: 'Hải Dương', code: 'HD', slug: 'hai-duong', region: 'Miền Bắc', lat: 20.9386, lng: 106.3157, aliases: ['hai duong', 'chí linh', 'côn sơn'] },
  { id: 27, name: 'Hải Phòng', code: 'HP', slug: 'hai-phong', region: 'Miền Bắc', lat: 20.8449, lng: 106.6881, aliases: ['hai phong', 'cát bà', 'cat ba', 'đồ sơn', 'do son'] },
  { id: 28, name: 'Hậu Giang', code: 'HGI', slug: 'hau-giang', region: 'Miền Nam', lat: 9.7844, lng: 105.4701, aliases: ['hau giang', 'vị thanh', 'ngã bảy'] },
  { id: 29, name: 'Hòa Bình', code: 'HB', slug: 'hoa-binh', region: 'Miền Bắc', lat: 20.8172, lng: 105.3376, aliases: ['hoa binh', 'mai châu', 'mai chau', 'kim bôi', 'lương sơn'] },
  { id: 30, name: 'Hưng Yên', code: 'HY', slug: 'hung-yen', region: 'Miền Bắc', lat: 20.6464, lng: 106.0511, aliases: ['hung yen', 'phố hiến'] },
  { id: 31, name: 'Khánh Hòa', code: 'KH', slug: 'khanh-hoa', region: 'Miền Trung', lat: 12.2451, lng: 109.1943, aliases: ['khanh hoa', 'nha trang', 'cam ranh', 'vân phong', 'bình ba'] },
  { id: 32, name: 'Kiên Giang', code: 'KG', slug: 'kien-giang', region: 'Miền Nam', lat: 10.0125, lng: 105.0809, aliases: ['kien giang', 'phú quốc', 'phu quoc', 'hà tiên', 'rạch giá', 'nam du'] },
  { id: 33, name: 'Kon Tum', code: 'KT', slug: 'kon-tum', region: 'Tây Nguyên', lat: 14.3500, lng: 108.0000, aliases: ['kon tum', 'măng đen', 'mang den', 'ngọc linh'] },
  { id: 34, name: 'Lai Châu', code: 'LC', slug: 'lai-chau', region: 'Miền Bắc', lat: 22.3964, lng: 103.4684, aliases: ['lai chau', 'sin suối hồ'] },
  { id: 35, name: 'Lâm Đồng', code: 'LD', slug: 'lam-dong', region: 'Tây Nguyên', lat: 11.9404, lng: 108.4583, aliases: ['lam dong', 'đà lạt', 'da lat', 'bảo lộc', 'tuyền lâm', 'langbiang'] },
  { id: 36, name: 'Lạng Sơn', code: 'LS', slug: 'lang-son', region: 'Miền Bắc', lat: 21.8537, lng: 106.7621, aliases: ['lang son', 'mẫu sơn', 'tân thanh'] },
  { id: 37, name: 'Lào Cai', code: 'LCA', slug: 'lao-cai', region: 'Miền Bắc', lat: 22.4856, lng: 103.9707, aliases: ['lao cai', 'sa pa', 'sapa', 'fansipan', 'y tý', 'bắc hà'] },
  { id: 38, name: 'Long An', code: 'LA', slug: 'long-an', region: 'Miền Nam', lat: 10.5442, lng: 106.4116, aliases: ['long an', 'tân an', 'bến lức', 'đức hòa'] },
  { id: 39, name: 'Nam Định', code: 'ND', slug: 'nam-dinh', region: 'Miền Bắc', lat: 20.4344, lng: 106.1773, aliases: ['nam dinh', 'quất lâm', 'thịnh long'] },
  { id: 40, name: 'Nghệ An', code: 'NA', slug: 'nghe-an', region: 'Miền Trung', lat: 19.2343, lng: 104.9200, aliases: ['nghe an', 'vinh', 'cửa lò', 'cua lo', 'nam đàn'] },
  { id: 41, name: 'Ninh Bình', code: 'NB', slug: 'ninh-binh', region: 'Miền Bắc', lat: 20.2506, lng: 105.9745, aliases: ['ninh binh', 'tràng an', 'trang an', 'tam cốc', 'bái đính', 'hang múa'] },
  { id: 42, name: 'Ninh Thuận', code: 'NT', slug: 'ninh-thuan', region: 'Miền Trung', lat: 11.6739, lng: 108.9328, aliases: ['ninh thuan', 'phan rang', 'tháp chàm', 'vĩnh hy', 'vinh hy'] },
  { id: 43, name: 'Phú Thọ', code: 'PT', slug: 'phu-tho', region: 'Miền Bắc', lat: 21.3228, lng: 105.2280, aliases: ['phu tho', 'việt trì', 'đền hùng', 'thanh thủy'] },
  { id: 44, name: 'Phú Yên', code: 'PY', slug: 'phu-yen', region: 'Miền Trung', lat: 13.0882, lng: 109.0924, aliases: ['phu yen', 'tuy hòa', 'gành đá đĩa', 'vũng rô'] },
  { id: 45, name: 'Quảng Bình', code: 'QB', slug: 'quang-binh', region: 'Miền Trung', lat: 17.4690, lng: 106.6200, aliases: ['quang binh', 'đồng hới', 'phong nha', 'kẻ bàng', 'sơn đoòng'] },
  { id: 46, name: 'Quảng Nam', code: 'QNA', slug: 'quang-nam', region: 'Miền Trung', lat: 15.5394, lng: 108.0191, aliases: ['quang nam', 'hội an', 'hoi an', 'tam kỳ', 'mỹ sơn', 'cù lao chàm'] },
  { id: 47, name: 'Quảng Ngãi', code: 'QNG', slug: 'quang-ngai', region: 'Miền Trung', lat: 15.1205, lng: 108.7923, aliases: ['quang ngai', 'lý sơn', 'ly son', 'dung quất'] },
  { id: 48, name: 'Quảng Ninh', code: 'QN', slug: 'quang-ninh', region: 'Miền Bắc', lat: 21.0069, lng: 107.2925, aliases: ['quang ninh', 'hạ long', 'ha long', 'vân đồn', 'cô tô', 'uông bí', 'yên tử'] },
  { id: 49, name: 'Quảng Trị', code: 'QT', slug: 'quang-tri', region: 'Miền Trung', lat: 16.7500, lng: 107.1857, aliases: ['quang tri', 'đông hà', 'thành cổ'] },
  { id: 50, name: 'Sóc Trăng', code: 'ST', slug: 'soc-trang', region: 'Miền Nam', lat: 9.6033, lng: 105.9800, aliases: ['soc trang', 'chùa dơi'] },
  { id: 51, name: 'Sơn La', code: 'SL', slug: 'son-la', region: 'Miền Bắc', lat: 21.3283, lng: 103.9148, aliases: ['son la', 'mộc châu', 'moc chau', 'tà xùa', 'ta xua'] },
  { id: 52, name: 'Tây Ninh', code: 'TN', slug: 'tay-ninh', region: 'Miền Nam', lat: 11.3102, lng: 106.0988, aliases: ['tay ninh', 'núi bà đen', 'tòa thánh'] },
  { id: 53, name: 'Thái Bình', code: 'TB', slug: 'thai-binh', region: 'Miền Bắc', lat: 20.4463, lng: 106.3366, aliases: ['thai binh', 'đồng châu'] },
  { id: 54, name: 'Thái Nguyên', code: 'TNG', slug: 'thai-nguyen', region: 'Miền Bắc', lat: 21.5928, lng: 105.8442, aliases: ['thai nguyen', 'hồ núi cốc', 'sông công'] },
  { id: 55, name: 'Thanh Hóa', code: 'TH', slug: 'thanh-hoa', region: 'Miền Trung', lat: 19.8067, lng: 105.7852, aliases: ['thanh hoa', 'sầm sơn', 'sam son', 'pù luông', 'hải tiến'] },
  { id: 56, name: 'Thừa Thiên Huế', code: 'TTH', slug: 'thua-thien-hue', region: 'Miền Trung', lat: 16.4637, lng: 107.5909, aliases: ['thua thien hue', 'huế', 'hue', 'cố đô', 'lăng cô'] },
  { id: 57, name: 'Tiền Giang', code: 'TG', slug: 'tien-giang', region: 'Miền Nam', lat: 10.3600, lng: 106.3600, aliases: ['tien giang', 'mỹ tho', 'cái bè'] },
  { id: 58, name: 'TP. Hồ Chí Minh', code: 'HCM', slug: 'ho-chi-minh', region: 'Miền Nam', lat: 10.8231, lng: 106.6297, aliases: ['hồ chí minh', 'ho chi minh', 'sài gòn', 'sai gon', 'tphcm', 'tp hcm', 'tp.hcm'] },
  { id: 59, name: 'Trà Vinh', code: 'TV', slug: 'tra-vinh', region: 'Miền Nam', lat: 9.9347, lng: 106.3455, aliases: ['tra vinh', 'ba động'] },
  { id: 60, name: 'Tuyên Quang', code: 'TQ', slug: 'tuyen-quang', region: 'Miền Bắc', lat: 21.8234, lng: 105.2148, aliases: ['tuyen quang', 'na hang', 'tân trào'] },
  { id: 61, name: 'Vĩnh Long', code: 'VL', slug: 'vinh-long', region: 'Miền Nam', lat: 10.2537, lng: 105.9722, aliases: ['vinh long', 'bình minh'] },
  { id: 62, name: 'Vĩnh Phúc', code: 'VP', slug: 'vinh-phuc', region: 'Miền Bắc', lat: 21.3089, lng: 105.6049, aliases: ['vinh phuc', 'tam đảo', 'tam dao', 'đại lải', 'phúc yên'] },
  { id: 63, name: 'Yên Bái', code: 'YB', slug: 'yen-bai', region: 'Miền Bắc', lat: 21.7168, lng: 104.8986, aliases: ['yen bai', 'mù cang chải', 'mu cang chai', 'nghĩa lộ', 'hồ thác bà'] },

  // --- Các Điểm Đến Du Lịch Trọng Điểm Được Tìm Kiếm Nhiều Nhất ---
  { id: 101, name: 'Đà Lạt', code: 'DLI', slug: 'da-lat', region: 'Lâm Đồng', lat: 11.9404, lng: 108.4583, isTouristHub: true, aliases: ['da lat', 'lâm đồng', 'thành phố ngàn hoa', 'tuyền lâm'] },
  { id: 102, name: 'Phú Quốc', code: 'PQC', slug: 'phu-quoc', region: 'Kiên Giang', lat: 10.2899, lng: 103.9840, isTouristHub: true, aliases: ['phu quoc', 'đảo ngọc', 'kiên giang', 'bãi sao', 'bãi khem'] },
  { id: 103, name: 'Nha Trang', code: 'NHA', slug: 'nha-trang', region: 'Khánh Hòa', lat: 12.2388, lng: 109.1967, isTouristHub: true, aliases: ['nha trang', 'khánh hòa', 'vinpearl', 'vịnh nha trang'] },
  { id: 104, name: 'Hội An', code: 'HOI', slug: 'hoi-an', region: 'Quảng Nam', lat: 15.8801, lng: 108.3380, isTouristHub: true, aliases: ['hoi an', 'phố cổ hội an', 'quảng nam', 'an bàng'] },
  { id: 105, name: 'Sa Pa', code: 'SPA', slug: 'sa-pa', region: 'Lào Cai', lat: 22.3364, lng: 103.8438, isTouristHub: true, aliases: ['sapa', 'sa pa', 'fansipan', 'lào cai', 'cát cát', 'mường hoa'] },
  { id: 106, name: 'Hạ Long', code: 'HLG', slug: 'ha-long', region: 'Quảng Ninh', lat: 20.9599, lng: 107.0425, isTouristHub: true, aliases: ['ha long', 'vịnh hạ long', 'quảng ninh', 'bãi cháy', 'tuần châu'] },
  { id: 107, name: 'Vũng Tàu', code: 'VTU', slug: 'vung-tau', region: 'Bà Rịa - Vũng Tàu', lat: 10.3460, lng: 107.0843, isTouristHub: true, aliases: ['vung tau', 'bà rịa', 'bãi trước', 'bãi sau', 'hồ tràm'] },
  { id: 108, name: 'Quy Nhơn', code: 'UIH', slug: 'quy-nhon', region: 'Bình Định', lat: 13.7820, lng: 109.2197, isTouristHub: true, aliases: ['quy nhon', 'bình định', 'kỳ co', 'eo gió'] },
  { id: 109, name: 'Phan Thiết', code: 'PTH', slug: 'phan-thiet', region: 'Bình Thuận', lat: 10.9273, lng: 108.1022, isTouristHub: true, aliases: ['phan thiet', 'mũi né', 'mui ne', 'bình thuận'] },
  { id: 110, name: 'Huế', code: 'HUE', slug: 'hue', region: 'Thừa Thiên Huế', lat: 16.4637, lng: 107.5909, isTouristHub: true, aliases: ['hue', 'thừa thiên huế', 'sông hương', 'đại nội'] },
  { id: 111, name: 'Côn Đảo', code: 'CDO', slug: 'con-dao', region: 'Bà Rịa - Vũng Tàu', lat: 8.6835, lng: 106.6067, isTouristHub: true, aliases: ['con dao', 'côn sơn', 'vũng tàu'] },
  { id: 112, name: 'Cát Bà', code: 'CBA', slug: 'cat-ba', region: 'Hải Phòng', lat: 20.7276, lng: 107.0487, isTouristHub: true, aliases: ['cat ba', 'vịnh lan hạ', 'hải phòng'] },
  { id: 113, name: 'Mộc Châu', code: 'MCH', slug: 'moc-chau', region: 'Sơn La', lat: 20.8427, lng: 104.6469, isTouristHub: true, aliases: ['moc chau', 'sơn la', 'rừng thông bản áng'] },
  { id: 114, name: 'Tam Đảo', code: 'TDO', slug: 'tam-dao', region: 'Vĩnh Phúc', lat: 21.4586, lng: 105.6483, isTouristHub: true, aliases: ['tam dao', 'vĩnh phúc', 'thị trấn mờ sương'] },
];

/**
 * Hàm loại bỏ dấu tiếng Việt chuẩn và ký tự đặc biệt
 */
export const removeVietnameseTones = (str) => {
  if (!str) return '';
  let cleanStr = str.toString().trim().toLowerCase();
  cleanStr = cleanStr.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  cleanStr = cleanStr.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  cleanStr = cleanStr.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  cleanStr = cleanStr.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  cleanStr = cleanStr.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  cleanStr = cleanStr.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  cleanStr = cleanStr.replace(/đ/g, 'd');
  // Bỏ tiền tố thường gõ như 'tp.', 'tp ', 'tinh ', 'thanh pho '
  cleanStr = cleanStr.replace(/^(tinh|thanh pho|tp\.|tp)\s+/i, '');
  return cleanStr.trim();
};

/**
 * Tìm kiếm thông minh danh sách tỉnh thành & điểm đến theo từ khóa (kèm Smart Ranking)
 */
export const searchProvincesLocal = (query = '', list = VIETNAM_PROVINCES) => {
  const q = (query || '').trim();
  if (!q) return list;

  const normalizedQ = removeVietnameseTones(q);

  const scored = [];

  for (const item of list) {
    const normName = removeVietnameseTones(item.name);
    const lowerName = item.name.toLowerCase();
    const normRegion = item.region ? removeVietnameseTones(item.region) : '';
    const code = (item.code || '').toLowerCase();
    const slug = (item.slug || '').toLowerCase();
    const aliases = (item.aliases || []).map((a) => removeVietnameseTones(a));

    let score = 0;

    if (normName === normalizedQ || lowerName === q.toLowerCase()) {
      score += 100;
    } else if (normName.startsWith(normalizedQ) || lowerName.startsWith(q.toLowerCase())) {
      score += 80;
    } else if (normName.includes(normalizedQ) || lowerName.includes(q.toLowerCase())) {
      score += 60;
    } else if (aliases.some((a) => a === normalizedQ)) {
      score += 55;
    } else if (aliases.some((a) => a.startsWith(normalizedQ))) {
      score += 45;
    } else if (aliases.some((a) => a.includes(normalizedQ))) {
      score += 35;
    } else if (code === normalizedQ || slug === normalizedQ) {
      score += 30;
    } else if (normRegion.includes(normalizedQ)) {
      score += 20;
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.name.localeCompare(b.item.name, 'vi');
  });

  return scored.map((s) => s.item);
};

