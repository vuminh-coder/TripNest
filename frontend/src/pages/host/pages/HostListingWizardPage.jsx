import React, { useEffect, useState, useMemo, useRef } from 'react';
import './HostListingWizardPage.css';
import {
  TbArrowLeft,
  TbArrowRight,
  TbHome,
  TbBuildingCastle,
  TbBuildingCommunity,
  TbSailboat,
  TbTrees,
  TbBuilding,
  TbMapPin,
  TbUsers,
  TbBed,
  TbBath,
  TbSparkles,
  TbWifi,
  TbSwimming,
  TbToolsKitchen2,
  TbAirConditioning,
  TbCar,
  TbFlame,
  TbDeviceTv,
  TbPhoto,
  TbPlus,
  TbTrash,
  TbCheck,
  TbEye,
  TbCoin,
  TbX,
  TbUpload,
  TbLink,
  TbStarFilled,
  TbLoader,
  TbDoor,
  TbCopy,
  TbPaw,
  TbDeviceLaptop,
  TbBeach,
  TbWashMachine,
  TbShieldCheck,
  TbCoffee,
  TbBarbell,
  TbSearch,
  TbInfoCircle,
  TbDiamond,
} from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/services/api';

// Trích xuất direct image URL nếu người dùng dán link từ công cụ tìm kiếm (Bing, Google Images...)
const cleanImageUrl = (rawUrl) => {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  try {
    const parsed = new URL(trimmed);
    // Bing Image Search: ?mediaurl=... hoặc ?cdnurl=...
    if (parsed.hostname.includes('bing.com') && parsed.pathname.includes('/images/search')) {
      const mediaurl = parsed.searchParams.get('mediaurl');
      if (mediaurl) return decodeURIComponent(mediaurl);
      const cdnurl = parsed.searchParams.get('cdnurl');
      if (cdnurl) return decodeURIComponent(cdnurl);
    }
    // Google Image Search: ?imgurl=...
    if (parsed.hostname.includes('google.com') && (parsed.pathname.includes('/imgres') || parsed.pathname.includes('/images'))) {
      const imgurl = parsed.searchParams.get('imgurl');
      if (imgurl) return decodeURIComponent(imgurl);
    }
  } catch {
    // Giữ nguyên chuỗi nếu không parse được
  }
  return trimmed;
};

// 5 ảnh Ngoại cảnh & Khuôn viên Cơ sở lưu trú (Hiển thị ở Hero Gallery 5 ảnh trang Accommodation)
const DEFAULT_ACCOMMODATION_EXTERIOR_IMAGES = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80',
];

// 5 ảnh Nội thất Chi tiết Không gian Bên trong Căn (Cho thuê Nguyên căn - Hiển thị ở Room Detail)
const DEFAULT_ENTIRE_INTERIOR_IMAGES = [
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&auto=format&fit=crop&q=80', // Phòng ngủ Master
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop&q=80', // Phòng ngủ phụ 2
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80', // Phòng khách sang trọng
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80', // Bếp ăn tiện nghi
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80', // Phòng tắm Jacuzzi
];

// 5 ảnh Mẫu cho Hạng phòng Deluxe King (Multi-Room)
const SAMPLE_DELUXE_ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&auto=format&fit=crop&q=80',
];

// 5 ảnh Mẫu cho Hạng phòng Suite Gia Đình (Multi-Room)
const SAMPLE_SUITE_ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
];

// 5 ảnh Mẫu cho Hạng phòng Villa / Penthouse (Multi-Room)
const SAMPLE_VILLA_ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80',
];

const WIZARD_DRAFT_KEY = 'tripnest_host_new_listing_draft';

export const HostListingWizardPage = ({
  onCancel,
  onListingCreated,
  currency = 'VND',
}) => {
  const toast = useToast();
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const hasShownDraftToastRef = useRef(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // 1. Form State: Type, Category, Rental Mode & Location
  const [accommodationType, setAccommodationType] = useState('villa');
  const [rentalMode, setRentalMode] = useState('entire_place'); // 'entire_place' | 'multi_room'
  const [categoryId, setCategoryId] = useState(1);
  const [categoriesList, setCategoriesList] = useState([]);
  const [city, setCity] = useState('Đà Lạt');
  const [district, setDistrict] = useState('Phường 3');
  const [address, setAddress] = useState('12 Đường Khe Sanh, Đà Lạt');

  // 2. Multi-Room Configuration State (Mỗi phòng tối thiểu 5 ảnh)
  const [rooms, setRooms] = useState([
    {
      id: 'rm-1',
      roomNameVi: 'Phòng Deluxe King Hướng Rừng Thông',
      spaceType: 'private_room',
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      roomSizeM2: 38,
      priceVND: 1800000,
      cleaningFeeVND: 150000,
      totalInventory: 3,
      description: 'Phòng tiêu chuẩn cao cấp với 1 giường King-size, ban công ngắm cảnh rừng thông mây ngàn.',
      images: [...SAMPLE_DELUXE_ROOM_IMAGES],
      imageUrl: SAMPLE_DELUXE_ROOM_IMAGES[0],
    },
    {
      id: 'rm-2',
      roomNameVi: 'Phòng Suite Gia Đình 2 Phòng Ngủ',
      spaceType: 'private_room',
      maxGuests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      roomSizeM2: 75,
      priceVND: 3200000,
      cleaningFeeVND: 250000,
      totalInventory: 2,
      description: 'Không gian ấm cúng sang trọng gồm 2 phòng ngủ riêng biệt, phòng khách mở và bồn tắm tiện nghi.',
      images: [...SAMPLE_SUITE_ROOM_IMAGES],
      imageUrl: SAMPLE_SUITE_ROOM_IMAGES[0],
    },
  ]);
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  // Single Entire Place Specs (dùng khi rentalMode === 'entire_place')
  const [entireRoomName, setEntireRoomName] = useState('Toàn bộ Biệt thự Nghỉ dưỡng Nguyên căn');
  const [entireMaxGuests, setEntireMaxGuests] = useState(8);
  const [entireBedrooms, setEntireBedrooms] = useState(4);
  const [entireBeds, setEntireBeds] = useState(5);
  const [entireBathrooms, setEntireBathrooms] = useState(4);
  const [entireRoomSizeM2, setEntireRoomSizeM2] = useState(250);
  const [entirePriceVND, setEntirePriceVND] = useState(4500000);
  const [entireCleaningFeeVND, setEntireCleaningFeeVND] = useState(400000);
  // Bộ ảnh nội thất bên trong căn nguyên căn (ít nhất 5 ảnh)
  const [entirePlaceImages, setEntirePlaceImages] = useState([...DEFAULT_ENTIRE_INTERIOR_IMAGES]);
  const [newEntireImageUrl, setNewEntireImageUrl] = useState('');
  const [isUploadingEntireImage, setIsUploadingEntireImage] = useState(false);

  const stepTitles = [
    'Loại hình & Vị trí',
    rentalMode === 'entire_place' ? 'Cấu hình Trọn căn & Giá' : `Cấu hình Hạng phòng & Giá (${rooms.length} phòng)`,
    'Tiện ích nổi bật',
    'Bộ sưu tập hình ảnh',
    'Tiêu đề, Mô tả & Quy định',
    'Xem trước & Xuất bản',
  ];

  const handleSelectAccommodationType = (typeId) => {
    setAccommodationType(typeId);
    if (typeId === 'hotel' || typeId === 'resort') {
      setRentalMode('multi_room');
    } else if (typeId === 'cabin' || typeId === 'apartment' || typeId === 'yacht') {
      setRentalMode('entire_place');
    }
  };

  // 3. Amenities State & Filters
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([
    'Hồ bơi nước ấm vô cực',
    'Wifi tốc độ cao (150 Mbps)',
    'Bếp nấu đầy đủ dụng cụ & gia vị',
    'View ngắm mây & đồi núi tuyệt đẹp',
    'Điều hòa & Máy sưởi hai chiều',
    'Chỗ đỗ xe ô tô miễn phí tại chỗ',
  ]);
  const [amenityCategoryFilter, setAmenityCategoryFilter] = useState('all');
  const [amenitySearchQuery, setAmenitySearchQuery] = useState('');

  // 4. Images State (5 ảnh Ngoại cảnh & Toàn cảnh Accommodation)
  const [images, setImages] = useState([...DEFAULT_ACCOMMODATION_EXTERIOR_IMAGES]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 5. Title, Description & Policies State
  const [nameVi, setNameVi] = useState('The Sunset Valley Luxury Villa & Resort Đà Lạt');
  const [description, setDescription] = useState(
    'Khu nghỉ dưỡng sân vườn cao cấp view thung lũng rừng thông thơ mộng, không gian mở ngập tràn ánh sáng tự nhiên và đầy đủ tiện nghi chuẩn mực quốc tế.'
  );
  const [houseRules, setHouseRules] = useState(
    'Không hút thuốc trong phòng, giữ gìn không gian chung sau 22:00, xuất trình CMND/CCCD khi nhận phòng.'
  );
  const [cancellationPolicy, setCancellationPolicy] = useState(
    'Hủy miễn phí 100% trước 48h nhận phòng. Thanh toán linh hoạt tại chỗ nghỉ.'
  );
  const [isPublishing, setIsPublishing] = useState(false);

  // Types list
  const typesList = [
    { id: 'villa', name: 'Biệt thự (Villa)', icon: <TbBuildingCastle /> },
    { id: 'resort', name: 'Khu nghỉ dưỡng', icon: <TbBuildingCommunity /> },
    { id: 'homestay', name: 'Homestay ấm cúng', icon: <TbHome /> },
    { id: 'apartment', name: 'Căn hộ cao cấp', icon: <TbBuilding /> },
    { id: 'cabin', name: 'Cabin rừng thông', icon: <TbTrees /> },
    { id: 'yacht', name: 'Du thuyền vịnh', icon: <TbSailboat /> },
  ];

  // Helper map amenity icon
  const renderAmenityIcon = (nameOrIcon) => {
    const key = (nameOrIcon || '').toLowerCase();
    if (key.includes('wifi') || key.includes('mạng') || key.includes('internet')) return <TbWifi />;
    if (key.includes('bơi') || key.includes('pool') || key.includes('swimming')) return <TbSwimming />;
    if (key.includes('kitchen') || key.includes('bếp') || key.includes('nấu') || key.includes('dụng cụ')) return <TbToolsKitchen2 />;
    if (key.includes('bbq') || key.includes('nướng') || key.includes('flame')) return <TbFlame />;
    if (key.includes('sưởi') || key.includes('lò sưởi') || key.includes('fireplace')) return <TbFlame />;
    if (key.includes('air') || key.includes('điều hòa') || key.includes('máy lạnh')) return <TbAirConditioning />;
    if (key.includes('car') || key.includes('xe') || key.includes('đỗ xe') || key.includes('bãi đỗ') || key.includes('parking')) return <TbCar />;
    if (key.includes('tv') || key.includes('tivi') || key.includes('smart tv')) return <TbDeviceTv />;
    if (key.includes('jacuzzi') || key.includes('sục') || key.includes('bồn tắm') || key.includes('tắm') || key.includes('bath') || key.includes('sauna') || key.includes('xông hơi')) return <TbBath />;
    if (key.includes('washer') || key.includes('giặt') || key.includes('sấy')) return <TbWashMachine />;
    if (key.includes('pet') || key.includes('thú cưng') || key.includes('chó') || key.includes('mèo')) return <TbPaw />;
    if (key.includes('workspace') || key.includes('làm việc') || key.includes('laptop') || key.includes('bàn')) return <TbDeviceLaptop />;
    if (key.includes('beach') || key.includes('biển') || key.includes('bãi biển')) return <TbBeach />;
    if (key.includes('safe') || key.includes('két sắt') || key.includes('an toàn')) return <TbShieldCheck />;
    if (key.includes('breakfast') || key.includes('ăn sáng') || key.includes('sáng') || key.includes('coffee') || key.includes('cà phê')) return <TbCoffee />;
    if (key.includes('fitness') || key.includes('gym') || key.includes('thể hình') || key.includes('thể thao') || key.includes('barbell')) return <TbBarbell />;
    if (key.includes('bed') || key.includes('giường')) return <TbBed />;
    return <TbSparkles />;
  };

  const getAmenityLabel = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.name_vi || item.name || item.label_vi || item.label || '';
  };

  const toggleAmenity = (item) => {
    const name = getAmenityLabel(item);
    if (!name) return;
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  // Load Categories & Amenities on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const cats = await apiService.getCategories();
        if (Array.isArray(cats) && cats.length > 0) {
          const filtered = cats.filter((c) => c.slug !== 'all');
          setCategoriesList(filtered);
          if (filtered.length > 0) {
            setCategoryId((prev) => prev || filtered[0].id);
          }
        }
      } catch (e) {
        console.error('Error loading categories:', e);
      }

      try {
        const data = await apiService.getAmenities();
        const amList = data?.amenities || (Array.isArray(data) ? data : []);
        if (Array.isArray(amList) && amList.length > 0) {
          setAmenities(amList);
        } else {
          setAmenities([
            { id: 1, code: 'wifi', name_vi: 'Wifi tốc độ cao (150 Mbps)', icon: 'TbWifi', category: 'basic' },
            { id: 2, code: 'kitchen', name_vi: 'Bếp nấu đầy đủ dụng cụ & gia vị', icon: 'TbToolsKitchen2', category: 'basic' },
            { id: 3, code: 'pool', name_vi: 'Hồ bơi nước ấm vô cực', icon: 'TbSwimming', category: 'standout' },
            { id: 4, code: 'bbq', name_vi: 'Bếp nướng BBQ ngoài trời', icon: 'TbFlame', category: 'standout' },
            { id: 5, code: 'fireplace', name_vi: 'Lò sưởi ấm cúng trong nhà', icon: 'TbFlame', category: 'standout' },
            { id: 6, code: 'parking', name_vi: 'Chỗ đỗ xe ô tô miễn phí tại chỗ', icon: 'TbCar', category: 'basic' },
            { id: 7, code: 'ac', name_vi: 'Điều hòa & Máy sưởi hai chiều', icon: 'TbAirConditioning', category: 'basic' },
            { id: 8, code: 'washer', name_vi: 'Máy giặt & Máy sấy quần áo', icon: 'TbWashMachine', category: 'basic' },
            { id: 9, code: 'pet_friendly', name_vi: 'Cho phép mang theo thú cưng', icon: 'TbPaw', category: 'standout' },
            { id: 10, code: 'workspace', name_vi: 'Bàn làm việc chuyên dụng', icon: 'TbDeviceLaptop', category: 'basic' },
            { id: 11, code: 'jacuzzi', name_vi: 'Bồn tắm sục Jacuzzi ngoài trời', icon: 'TbBath', category: 'luxury' },
            { id: 12, code: 'private_beach', name_vi: 'Lối đi thẳng ra bãi biển riêng', icon: 'TbBeach', category: 'luxury' },
            { id: 13, code: 'tv', name_vi: 'Smart TV 4K màn hình lớn', icon: 'TbDeviceTv', category: 'basic' },
            { id: 14, code: 'mountain_view', name_vi: 'View ngắm mây & đồi núi tuyệt đẹp', icon: 'TbSparkles', category: 'standout' },
            { id: 15, code: 'balcony', name_vi: 'Ban công ngắm cảnh riêng biệt', icon: 'TbSparkles', category: 'standout' },
            { id: 16, code: 'ev_charger', name_vi: 'Trạm sạc xe điện (EV Charger)', icon: 'TbCar', category: 'standout' },
            { id: 17, code: 'sauna', name_vi: 'Phòng xông hơi Sauna / Spa', icon: 'TbBath', category: 'luxury' },
            { id: 18, code: 'safe', name_vi: 'Két sắt an toàn trong phòng', icon: 'TbShieldCheck', category: 'basic' },
            { id: 19, code: 'breakfast', name_vi: 'Phục vụ bữa sáng hàng ngày', icon: 'TbCoffee', category: 'luxury' },
            { id: 20, code: 'fitness', name_vi: 'Phòng tập thể dục / Gym tại chỗ', icon: 'TbBarbell', category: 'luxury' },
          ]);
        }
      } catch (e) {
        console.error('Error loading amenities:', e);
      }
    };
    loadInitialData();
  }, []);

  // 1. Restore draft from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WIZARD_DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.currentStep) setCurrentStep(draft.currentStep);
        if (draft.accommodationType) setAccommodationType(draft.accommodationType);
        if (draft.rentalMode) setRentalMode(draft.rentalMode);
        if (draft.categoryId) setCategoryId(draft.categoryId);
        if (draft.city) setCity(draft.city);
        if (draft.district !== undefined) setDistrict(draft.district);
        if (draft.address !== undefined) setAddress(draft.address);

        if (draft.entireRoomName !== undefined) setEntireRoomName(draft.entireRoomName);
        if (draft.entireMaxGuests) setEntireMaxGuests(Number(draft.entireMaxGuests));
        if (draft.entireBedrooms) setEntireBedrooms(Number(draft.entireBedrooms));
        if (draft.entireBeds) setEntireBeds(Number(draft.entireBeds));
        if (draft.entireBathrooms) setEntireBathrooms(Number(draft.entireBathrooms));
        if (draft.entireRoomSizeM2) setEntireRoomSizeM2(Number(draft.entireRoomSizeM2));
        if (draft.entirePriceVND) setEntirePriceVND(Number(draft.entirePriceVND));
        if (draft.entireCleaningFeeVND !== undefined) setEntireCleaningFeeVND(Number(draft.entireCleaningFeeVND));
        if (Array.isArray(draft.entirePlaceImages) && draft.entirePlaceImages.length > 0) {
          setEntirePlaceImages(draft.entirePlaceImages);
        }

        if (Array.isArray(draft.rooms) && draft.rooms.length > 0) {
          setRooms(draft.rooms);
        }
        if (draft.activeRoomIndex !== undefined) setActiveRoomIndex(Number(draft.activeRoomIndex));

        if (Array.isArray(draft.selectedAmenities)) setSelectedAmenities(draft.selectedAmenities);
        if (Array.isArray(draft.images) && draft.images.length > 0) setImages(draft.images);

        if (draft.nameVi !== undefined) setNameVi(draft.nameVi);
        if (draft.description !== undefined) setDescription(draft.description);
        if (draft.houseRules !== undefined) setHouseRules(draft.houseRules);
        if (draft.cancellationPolicy !== undefined) setCancellationPolicy(draft.cancellationPolicy);

        if (!hasShownDraftToastRef.current) {
          hasShownDraftToastRef.current = true;
          toast.info('Đã khôi phục bản nháp', 'Tiến trình đăng ký chỗ nghỉ trước đó đã được tự động phục hồi từ bộ nhớ.');
        }
      }
    } catch (err) {
      console.warn('Lỗi đọc bản nháp wizard từ localStorage:', err);
    } finally {
      setIsDraftRestored(true);
    }
  }, []);

  // 2. Auto-save draft to localStorage whenever form changes
  useEffect(() => {
    if (!isDraftRestored) return;

    const draft = {
      currentStep,
      accommodationType,
      rentalMode,
      categoryId,
      city,
      district,
      address,
      entireRoomName,
      entireMaxGuests,
      entireBedrooms,
      entireBeds,
      entireBathrooms,
      entireRoomSizeM2,
      entirePriceVND,
      entireCleaningFeeVND,
      entirePlaceImages,
      rooms,
      activeRoomIndex,
      selectedAmenities,
      images,
      nameVi,
      description,
      houseRules,
      cancellationPolicy,
      lastSaved: new Date().toISOString(),
    };

    try {
      localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(draft));
    } catch (err) {
      console.warn('Lỗi lưu bản nháp wizard vào localStorage:', err);
    }
  }, [
    isDraftRestored,
    currentStep,
    accommodationType,
    rentalMode,
    categoryId,
    city,
    district,
    address,
    entireRoomName,
    entireMaxGuests,
    entireBedrooms,
    entireBeds,
    entireBathrooms,
    entireRoomSizeM2,
    entirePriceVND,
    entireCleaningFeeVND,
    entirePlaceImages,
    rooms,
    activeRoomIndex,
    selectedAmenities,
    images,
    nameVi,
    description,
    houseRules,
    cancellationPolicy,
  ]);

  const handleResetDraft = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản nháp và làm lại từ đầu?')) {
      try {
        localStorage.removeItem(WIZARD_DRAFT_KEY);
      } catch (e) {}
      setCurrentStep(1);
      setAccommodationType('villa');
      setRentalMode('entire_place');
      setCategoryId(1);
      setCity('Đà Lạt');
      setDistrict('Phường 3');
      setAddress('12 Đường Khe Sanh, Đà Lạt');
      setEntireRoomName('Toàn bộ Biệt thự Nghỉ dưỡng Nguyên căn');
      setEntireMaxGuests(8);
      setEntireBedrooms(4);
      setEntireBeds(5);
      setEntireBathrooms(4);
      setEntireRoomSizeM2(250);
      setEntirePriceVND(4500000);
      setEntireCleaningFeeVND(400000);
      setEntirePlaceImages([...DEFAULT_ENTIRE_INTERIOR_IMAGES]);
      setRooms([
        {
          id: 'rm-1',
          roomNameVi: 'Phòng Deluxe King Hướng Rừng Thông',
          spaceType: 'private_room',
          maxGuests: 2,
          bedrooms: 1,
          beds: 1,
          bathrooms: 1,
          roomSizeM2: 38,
          priceVND: 1800000,
          cleaningFeeVND: 150000,
          totalInventory: 3,
          description: 'Phòng tiêu chuẩn cao cấp với 1 giường King-size, ban công ngắm cảnh rừng thông mây ngàn.',
          images: [...SAMPLE_DELUXE_ROOM_IMAGES],
          imageUrl: SAMPLE_DELUXE_ROOM_IMAGES[0],
        },
        {
          id: 'rm-2',
          roomNameVi: 'Phòng Suite Gia Đình 2 Phòng Ngủ',
          spaceType: 'private_room',
          maxGuests: 4,
          bedrooms: 2,
          beds: 2,
          bathrooms: 2,
          roomSizeM2: 75,
          priceVND: 3200000,
          cleaningFeeVND: 250000,
          totalInventory: 2,
          description: 'Không gian ấm cúng sang trọng gồm 2 phòng ngủ riêng biệt, phòng khách mở và bồn tắm tiện nghi.',
          images: [...SAMPLE_SUITE_ROOM_IMAGES],
          imageUrl: SAMPLE_SUITE_ROOM_IMAGES[0],
        },
      ]);
      setActiveRoomIndex(0);
      setSelectedAmenities([
        'Hồ bơi nước ấm vô cực',
        'Wifi tốc độ cao (150 Mbps)',
        'Bếp nấu đầy đủ dụng cụ & gia vị',
        'View ngắm mây & đồi núi tuyệt đẹp',
        'Điều hòa & Máy sưởi hai chiều',
        'Chỗ đỗ xe ô tô miễn phí tại chỗ',
      ]);
      setImages([...DEFAULT_ACCOMMODATION_EXTERIOR_IMAGES]);
      setNameVi('The Sunset Valley Luxury Villa & Resort Đà Lạt');
      setDescription(
        'Khu nghỉ dưỡng sân vườn cao cấp view thung lũng rừng thông thơ mộng, không gian mở ngập tràn ánh sáng tự nhiên và đầy đủ tiện nghi chuẩn mực quốc tế.'
      );
      setHouseRules('Không hút thuốc trong phòng, giữ gìn không gian chung sau 22:00, xuất trình CMND/CCCD khi nhận phòng.');
      setCancellationPolicy('Hủy miễn phí 100% trước 48h nhận phòng. Thanh toán linh hoạt tại chỗ nghỉ.');
      toast.success('Đã làm mới', 'Đã xóa bản nháp và nạp lại dữ liệu khởi tạo.');
    }
  };

  // Filtered Amenities Computed
  const filteredAmenities = useMemo(() => {
    return amenities.filter((a) => {
      const name = getAmenityLabel(a);
      if (!name) return false;
      if (amenityCategoryFilter !== 'all' && a.category && a.category !== amenityCategoryFilter) {
        return false;
      }
      if (amenitySearchQuery.trim()) {
        const q = amenitySearchQuery.toLowerCase().trim();
        return name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [amenities, amenityCategoryFilter, amenitySearchQuery]);

  // Room Management Handlers (Multi-Room)
  const handleAddRoom = () => {
    const newRoomNum = rooms.length + 1;
    const defaultSample = newRoomNum % 3 === 1
      ? SAMPLE_DELUXE_ROOM_IMAGES
      : (newRoomNum % 3 === 2 ? SAMPLE_SUITE_ROOM_IMAGES : SAMPLE_VILLA_ROOM_IMAGES);
    const newRoom = {
      id: 'rm-' + Date.now(),
      roomNameVi: `Hạng phòng ${newRoomNum} - Tiêu chuẩn cao cấp`,
      spaceType: 'private_room',
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      roomSizeM2: 40,
      priceVND: 2000000,
      cleaningFeeVND: 150000,
      totalInventory: 1,
      description: 'Không gian phòng nghỉ tinh tế, đầy đủ tiện nghi cao cấp.',
      images: [...defaultSample],
      imageUrl: defaultSample[0],
    };
    setRooms([...rooms, newRoom]);
    setActiveRoomIndex(rooms.length);
    toast.success('Đã thêm hạng phòng', 'Đã thêm hạng phòng mới với bộ 5 ảnh thực tế mẫu.');
  };

  const handleUpdateRoom = (roomId, field, value) => {
    setRooms(rooms.map((r) => (r.id === roomId ? { ...r, [field]: value } : r)));
  };

  const handleRemoveRoom = (roomId) => {
    if (rooms.length <= 1) {
      toast.warning('Yêu cầu tối thiểu', 'Cơ sở lưu trú cần có ít nhất 1 hạng phòng đón khách.');
      return;
    }
    const updated = rooms.filter((r) => r.id !== roomId);
    setRooms(updated);
    if (activeRoomIndex >= updated.length) {
      setActiveRoomIndex(Math.max(0, updated.length - 1));
    }
    toast.info('Đã xóa hạng phòng', 'Đã gỡ hạng phòng khỏi danh sách.');
  };

  // Multi-Room Image Album Handlers
  const handleAddRoomImageUrl = (roomId, urlInput) => {
    const url = cleanImageUrl(urlInput);
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.warning('Định dạng URL', 'Vui lòng dán link bắt đầu bằng http:// hoặc https://');
      return;
    }
    setRooms(rooms.map((r) => {
      if (r.id !== roomId) return r;
      const curImgs = Array.isArray(r.images) ? [...r.images] : (r.imageUrl ? [r.imageUrl] : []);
      if (curImgs.includes(url)) {
        toast.info('Ảnh trùng lặp', 'Ảnh này đã có trong danh mục của phòng.');
        return r;
      }
      const updated = [...curImgs, url];
      return { ...r, images: updated, imageUrl: updated[0] };
    }));
    toast.success('Đã thêm ảnh', 'Đã thêm 1 ảnh vào album của hạng phòng.');
  };

  const handleRemoveRoomImage = (roomId, imgIndex) => {
    setRooms(rooms.map((r) => {
      if (r.id !== roomId) return r;
      const curImgs = Array.isArray(r.images) ? [...r.images] : (r.imageUrl ? [r.imageUrl] : []);
      if (curImgs.length <= 1) {
        toast.warning('Yêu cầu tối thiểu', 'Hạng phòng cần ít nhất 1 ảnh thực tế.');
        return r;
      }
      const updated = curImgs.filter((_, idx) => idx !== imgIndex);
      return { ...r, images: updated, imageUrl: updated[0] || '' };
    }));
  };

  const handleSetRoomCoverImage = (roomId, imgIndex) => {
    if (imgIndex === 0) return;
    setRooms(rooms.map((r) => {
      if (r.id !== roomId) return r;
      const curImgs = Array.isArray(r.images) ? [...r.images] : (r.imageUrl ? [r.imageUrl] : []);
      const target = curImgs[imgIndex];
      const rest = curImgs.filter((_, idx) => idx !== imgIndex);
      const updated = [target, ...rest];
      return { ...r, images: updated, imageUrl: target };
    }));
    toast.info('Đã đổi ảnh chính', 'Đã đặt ảnh này làm ảnh bìa chính cho hạng phòng.');
  };

  const handleUploadRoomImages = async (roomId, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      toast.info('Đang tải ảnh...', `Đang tải ${files.length} ảnh phòng lên hệ thống.`);
      const uploadedUrls = [];
      for (const file of files) {
        const res = await apiService.uploadHostImage(file);
        if (res && res.url) uploadedUrls.push(res.url);
      }
      if (uploadedUrls.length > 0) {
        setRooms(rooms.map((r) => {
          if (r.id !== roomId) return r;
          const curImgs = Array.isArray(r.images) ? [...r.images] : (r.imageUrl ? [r.imageUrl] : []);
          const updated = [...curImgs, ...uploadedUrls];
          return { ...r, images: updated, imageUrl: updated[0] };
        }));
        toast.success('Tải ảnh thành công', `Đã thêm ${uploadedUrls.length} ảnh vào album hạng phòng.`);
      }
    } catch (err) {
      toast.error('Lỗi tải ảnh', err.message || 'Không thể tải ảnh.');
    }
    e.target.value = '';
  };

  const handleApplySampleRoomImages = (roomId, sampleSet) => {
    setRooms(rooms.map((r) => {
      if (r.id !== roomId) return r;
      return { ...r, images: [...sampleSet], imageUrl: sampleSet[0] };
    }));
    toast.success('Đã áp dụng ảnh mẫu', 'Đã cập nhật bộ 5 ảnh thực tế mẫu cho hạng phòng.');
  };

  // Entire Place Interior Image Handlers
  const handleAddEntirePlaceImageUrl = (e) => {
    if (e) e.preventDefault();
    const url = cleanImageUrl(newEntireImageUrl);
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.warning('Định dạng URL', 'Vui lòng dán link bắt đầu bằng http:// hoặc https://');
      return;
    }
    if (entirePlaceImages.includes(url)) {
      toast.info('Ảnh trùng lặp', 'Ảnh này đã có trong bộ sưu tập nội thất căn.');
      return;
    }
    setEntirePlaceImages([...entirePlaceImages, url]);
    setNewEntireImageUrl('');
    toast.success('Đã thêm ảnh', 'Đã thêm ảnh nội thất chi tiết vào căn nguyên căn.');
  };

  const handleRemoveEntirePlaceImage = (index) => {
    if (entirePlaceImages.length <= 1) {
      toast.warning('Yêu cầu tối thiểu', 'Cần ít nhất 1 ảnh không gian bên trong căn.');
      return;
    }
    setEntirePlaceImages(entirePlaceImages.filter((_, i) => i !== index));
  };

  const handleSetEntirePlaceCoverImage = (index) => {
    if (index === 0) return;
    const target = entirePlaceImages[index];
    const rest = entirePlaceImages.filter((_, i) => i !== index);
    setEntirePlaceImages([target, ...rest]);
    toast.info('Ảnh chính nội thất', 'Đã đặt ảnh này làm ảnh chính không gian bên trong căn.');
  };

  const handleUploadEntirePlaceImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingEntireImage(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const res = await apiService.uploadHostImage(file);
        if (res && res.url) uploaded.push(res.url);
      }
      if (uploaded.length > 0) {
        setEntirePlaceImages((prev) => [...prev, ...uploaded]);
        toast.success('Tải ảnh thành công', `Đã thêm ${uploaded.length} ảnh nội thất vào căn.`);
      }
    } catch (err) {
      toast.error('Lỗi upload', err.message || 'Không thể tải ảnh');
    } finally {
      setIsUploadingEntireImage(false);
      e.target.value = '';
    }
  };

  const handleApplyDefaultEntirePlaceImages = () => {
    setEntirePlaceImages([...DEFAULT_ENTIRE_INTERIOR_IMAGES]);
    toast.success('Đã áp dụng mẫu', 'Đã nạp bộ 5 ảnh nội thất chuẩn cho căn nguyên căn.');
  };

  const handleApplyDefaultExteriorImages = () => {
    setImages([...DEFAULT_ACCOMMODATION_EXTERIOR_IMAGES]);
    toast.success('Đã áp dụng mẫu', 'Đã nạp bộ 5 ảnh ngoại cảnh chuẩn mực cho cơ sở lưu trú.');
  };

  // Image Handlers
  const handleAddImageFromDevice = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    let uploadCount = 0;
    const newUploaded = [];

    for (const file of files) {
      try {
        const res = await apiService.uploadHostImage(file);
        if (res && res.url) {
          newUploaded.push(res.url);
          uploadCount++;
        }
      } catch (err) {
        toast.error('Lỗi tải ảnh', `Tệp ${file.name}: ${err.message || 'Không thể tải lên'}`);
      }
    }

    if (newUploaded.length > 0) {
      setImages((prev) => [...prev, ...newUploaded]);
      toast.success('Tải ảnh thành công', `Đã lưu ${uploadCount} ảnh vào bộ sưu tập chỗ nghỉ.`);
    }

    setIsUploading(false);
    e.target.value = '';
  };

  const handleAddImageUrl = (e) => {
    if (e) e.preventDefault();
    const url = cleanImageUrl(newImageUrl);
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.warning('Định dạng URL', 'Vui lòng dán link bắt đầu bằng http:// hoặc https://');
      return;
    }
    if (images.includes(url)) {
      toast.info('Ảnh trùng lặp', 'Ảnh này đã có trong bộ sưu tập.');
      return;
    }
    setImages([...images, url]);
    setNewImageUrl('');
    toast.success('Đã thêm ảnh', 'Ảnh từ URL đã được thêm vào danh sách.');
  };

  const handleRemoveImage = (index) => {
    if (images.length <= 1) {
      toast.warning('Yêu cầu hình ảnh', 'Chỗ ở cần ít nhất 1 ảnh đại diện để hiển thị.');
      return;
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSetCoverImage = (index) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    setImages([target, ...rest]);
    toast.info('Ảnh bìa mới', 'Đã đặt ảnh này làm ảnh bìa đại diện.');
  };

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round(val / 25000).toLocaleString()}`;
    return `${Number(val).toLocaleString('vi-VN')} ₫`;
  };

  // Pricing calculations for preview
  const previewRooms = rentalMode === 'entire_place'
    ? [
        {
          roomNameVi: entireRoomName || 'Toàn bộ chỗ nghỉ nguyên căn',
          spaceType: 'entire_place',
          maxGuests: entireMaxGuests,
          bedrooms: entireBedrooms,
          beds: entireBeds,
          bathrooms: entireBathrooms,
          roomSizeM2: entireRoomSizeM2,
          priceVND: entirePriceVND,
          cleaningFeeVND: entireCleaningFeeVND,
          totalInventory: 1,
          description,
          imageUrl: entirePlaceImages[0] || '',
          images: entirePlaceImages,
        },
      ]
    : rooms.map((r) => ({
        ...r,
        images: Array.isArray(r.images) && r.images.length > 0 ? r.images : (r.imageUrl ? [r.imageUrl] : []),
        imageUrl: (Array.isArray(r.images) && r.images.length > 0) ? r.images[0] : (r.imageUrl || ''),
      }));

  const minPriceVND = Math.min(...previewRooms.map((r) => Number(r.priceVND) || 1500000));
  const maxPriceVND = Math.max(...previewRooms.map((r) => Number(r.priceVND) || 1500000));
  const totalMaxGuests = rentalMode === 'entire_place'
    ? entireMaxGuests
    : Math.max(...previewRooms.map((r) => Number(r.maxGuests) || 2));

  // Step Transition Validation (Tối thiểu 5 ảnh nội thất chi tiết & 5 ảnh ngoại cảnh)
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!accommodationType) { toast.warning('Thiếu thông tin', 'Vui lòng chọn loại hình chỗ nghỉ.'); return false; }
        if (!address.trim()) { toast.warning('Thiếu địa chỉ', 'Vui lòng nhập địa chỉ chi tiết của chỗ ở.'); return false; }
        return true;
      case 2:
        if (rentalMode === 'entire_place') {
          if (!entirePriceVND || entirePriceVND < 50000) { toast.warning('Giá chưa hợp lệ', 'Vui lòng nhập giá niêm yết mỗi đêm (tối thiểu 50.000 ₫).'); return false; }
          if (entirePlaceImages.length < 5) {
            toast.warning('Yêu cầu ảnh nội thất', `Vui lòng tải hoặc thêm tối thiểu 5 ảnh nội thất chi tiết bên trong căn (hiện có ${entirePlaceImages.length}/5 ảnh).`);
            return false;
          }
        } else {
          if (rooms.length === 0) { toast.warning('Thiếu hạng phòng', 'Vui lòng thêm ít nhất 1 hạng phòng.'); return false; }
          const invalidRoom = rooms.find((r) => !r.priceVND || r.priceVND < 50000);
          if (invalidRoom) {
            toast.warning('Giá chưa hợp lệ', `Hạng phòng "${invalidRoom.roomNameVi}" cần có giá tối thiểu 50.000 ₫/đêm.`);
            const targetIdx = rooms.findIndex((r) => r.id === invalidRoom.id);
            if (targetIdx !== -1) setActiveRoomIndex(targetIdx);
            return false;
          }
          const noName = rooms.find((r) => !r.roomNameVi || !r.roomNameVi.trim());
          if (noName) {
            toast.warning('Thiếu tên phòng', 'Mỗi hạng phòng cần có tên hiển thị.');
            const targetIdx = rooms.findIndex((r) => r.id === noName.id);
            if (targetIdx !== -1) setActiveRoomIndex(targetIdx);
            return false;
          }
          const missingImgsRoom = rooms.find((r) => !r.images || r.images.length < 5);
          if (missingImgsRoom) {
            toast.warning('Yêu cầu ảnh hạng phòng', `Hạng phòng "${missingImgsRoom.roomNameVi}" cần tối thiểu 5 ảnh thực tế (hiện có ${missingImgsRoom.images?.length || 0}/5 ảnh).`);
            const targetIdx = rooms.findIndex((r) => r.id === missingImgsRoom.id);
            if (targetIdx !== -1) setActiveRoomIndex(targetIdx);
            return false;
          }
        }
        return true;
      case 3:
        return true; // amenities optional
      case 4:
        if (images.length < 5) {
          toast.warning('Thiếu hình ảnh cơ sở', `Vui lòng cung cấp tối thiểu 5 ảnh ngoại cảnh / toàn cảnh cơ sở lưu trú (hiện có ${images.length}/5 ảnh).`);
          return false;
        }
        return true;
      case 5:
        if (!nameVi.trim()) { toast.warning('Thiếu tiêu đề', 'Vui lòng nhập tên cơ sở lưu trú.'); return false; }
        if (!description.trim()) { toast.warning('Thiếu mô tả', 'Vui lòng nhập mô tả tổng quan về trải nghiệm lưu trú.'); return false; }
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Publish Listing Execution
  const handlePublishListing = async () => {
    if (!nameVi.trim()) {
      toast.warning('Thiếu thông tin', 'Vui lòng nhập tên cơ sở lưu trú.');
      setCurrentStep(5);
      return;
    }
    if (images.length < 5) {
      toast.warning('Thiếu hình ảnh', 'Vui lòng cung cấp ít nhất 5 ảnh ngoại cảnh cơ sở.');
      setCurrentStep(4);
      return;
    }

    setIsPublishing(true);
    try {
      const payload = {
        nameVi: nameVi.trim(),
        accommodationType,
        rentalMode,
        categoryId,
        city,
        district: district.trim(),
        address: address.trim(),
        description: description.trim(),
        houseRules,
        cancellationPolicy,
        images,
        amenities: selectedAmenities,
        rooms: previewRooms.map((r) => ({
          roomNameVi: r.roomNameVi,
          spaceType: r.spaceType || (rentalMode === 'entire_place' ? 'entire_place' : 'private_room'),
          priceVND: Number(r.priceVND),
          cleaningFeeVND: Number(r.cleaningFeeVND || 0),
          maxGuests: Number(r.maxGuests),
          bedrooms: Number(r.bedrooms),
          beds: Number(r.beds),
          bathrooms: Number(r.bathrooms),
          roomSizeM2: Number(r.roomSizeM2),
          totalInventory: Number(r.totalInventory || 1),
          description: r.description || description,
          imageUrl: r.imageUrl || '',
          images: Array.isArray(r.images) && r.images.length > 0 ? r.images : (r.imageUrl ? [r.imageUrl] : []),
        })),
        roomImages: rentalMode === 'entire_place' ? entirePlaceImages : undefined,
        // Root fallbacks for backward compatibility
        priceVND: minPriceVND,
        cleaningFeeVND: previewRooms[0]?.cleaningFeeVND || 350000,
        maxGuests: totalMaxGuests,
        bedrooms: previewRooms[0]?.bedrooms || 1,
        beds: previewRooms[0]?.beds || 1,
        bathrooms: previewRooms[0]?.bathrooms || 1,
        roomSizeM2: previewRooms[0]?.roomSizeM2 || 50,
      };

      const result = await apiService.createHostAccommodation(payload);
      try {
        localStorage.removeItem(WIZARD_DRAFT_KEY);
      } catch (e) {}

      const newListing = {
        id: result?.data?.accommodationId || ('ACC-' + Date.now()),
        roomId: result?.data?.roomId,
        nameVi,
        title: nameVi,
        accommodationType,
        categoryId,
        city,
        district,
        address,
        description,
        priceVND: minPriceVND,
        priceFrom: minPriceVND,
        priceTo: maxPriceVND,
        priceUSD: Math.round(minPriceVND / 25000),
        maxGuests: totalMaxGuests,
        roomsCount: previewRooms.length,
        rooms: previewRooms,
        rating: 5.0,
        reviewsCount: 0,
        status: 'published',
        thumbnail: images[0],
        images,
        amenities: selectedAmenities,
        createdAt: new Date().toLocaleDateString('vi-VN'),
      };

      toast.success(
        '🎉 Đăng bán thành công!',
        `"${nameVi}" đã xuất bản với ${previewRooms.length} hạng phòng. Đang chuyển về danh sách...`
      );

      if (onListingCreated) {
        onListingCreated(newListing);
      } else {
        // Auto-redirect nếu không có callback
        setTimeout(() => {
          if (onCancel) onCancel();
        }, 2000);
      }
    } catch (err) {
      toast.error('Lỗi lưu chỗ ở', err.message || 'Không thể đăng bán chỗ ở lúc này.');
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedCategoryObj = categoriesList.find((c) => c.id === categoryId) || categoriesList[0];

  return (
    <div className="host-panel-card" style={{ margin: 0, width: '100%', boxSizing: 'border-box' }}>
      {/* Top Header */}
      <div className="host-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="host-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TbBuildingCastle style={{ color: 'var(--host-primary, #059669)' }} />
            Đăng Ký Chỗ Nghỉ Mới
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--host-text-muted)', margin: '3px 0 0 0', fontWeight: 500 }}>
            Bước {currentStep}/{totalSteps}: <strong style={{ color: 'var(--host-text-main)' }}>{stepTitles[currentStep - 1]}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="host-btn-client"
            onClick={handleResetDraft}
            title="Xóa bản nháp và làm lại từ đầu"
            style={{ fontSize: '0.78rem', padding: '4px 8px' }}
          >
            Làm lại từ đầu
          </button>
          {onCancel && (
            <button
              type="button"
              className="host-btn-client"
              onClick={onCancel}
              title="Hủy và quay lại danh sách"
            >
              <TbX /> Hủy bỏ
            </button>
          )}
        </div>
      </div>

      {/* Modern 6-Step Visual Stepper */}
      <div className="host-wiz-stepper-container">
        <div className="host-wiz-stepper-track">
          {stepTitles.map((title, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            const shortLabels = [
              'Loại hình',
              'Cấu hình phòng',
              'Tiện ích',
              'Ảnh cơ sở',
              'Tiêu đề & Nội quy',
              'Hoàn tất',
            ];
            return (
              <div
                key={i}
                className={`host-wiz-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setCurrentStep(stepNum)}
                role="button"
                tabIndex={0}
                title={`Chuyển sang Bước ${stepNum}: ${shortLabels[i]}`}
              >
                <div className="host-wiz-step-circle">
                  {isCompleted ? <TbCheck size={16} /> : stepNum}
                </div>
                <span className="host-wiz-step-label">{shortLabels[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body Content */}
      <div className="host-wiz-body">
        {/* STEP 1: TYPE, RENTAL MODE, CATEGORY & LOCATION */}
        {currentStep === 1 && (
          <div>
            <h4 className="host-wiz-section-title">
              1. Chọn loại hình chỗ nghỉ của bạn
            </h4>
            <div className="host-wiz-types-grid">
              {typesList.map((t) => (
                <div
                  key={t.id}
                  className={`host-wiz-type-card ${accommodationType === t.id ? 'selected' : ''}`}
                  onClick={() => handleSelectAccommodationType(t.id)}
                >
                  <div className="host-wiz-type-card-icon">
                    {t.icon}
                  </div>
                  <div className="host-wiz-type-card-title">
                    {t.name}
                  </div>
                </div>
              ))}
            </div>

            {/* RENTAL MODE */}
            <h4 className="host-wiz-section-title">
              2. Hình thức cho thuê chỗ nghỉ
            </h4>
            <div className="host-rental-mode-grid">
              <div
                className={`host-rental-mode-card ${rentalMode === 'entire_place' ? 'selected' : ''}`}
                onClick={() => setRentalMode('entire_place')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <TbHome style={{ fontSize: '1.35rem', color: rentalMode === 'entire_place' ? 'var(--host-primary, #059669)' : '#64748b' }} />
                  <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>Cho thuê Trọn gói Nguyên căn</strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Khách được sử dụng toàn bộ không gian riêng tư (Thích hợp cho Biệt thự villa, Căn hộ cao cấp, Cabin, Homestay nguyên căn).
                </p>
              </div>

              <div
                className={`host-rental-mode-card ${rentalMode === 'multi_room' ? 'selected' : ''}`}
                onClick={() => setRentalMode('multi_room')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <TbDoor style={{ fontSize: '1.35rem', color: rentalMode === 'multi_room' ? 'var(--host-primary, #059669)' : '#64748b' }} />
                  <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>Cơ sở nhiều Hạng phòng riêng lẻ</strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Cơ sở có nhiều phòng với các mức giá và diện tích khác nhau để khách lựa chọn (Thích hợp cho Khách sạn, Resort, Khu phòng nghỉ).
                </p>
              </div>
            </div>

            <h4 className="host-wiz-section-title">
              3. Danh mục phong cách trải nghiệm (Hiển thị trên CategoryBar Trang Chủ)
            </h4>
            <div className="host-wiz-categories-grid">
              {categoriesList.map((cat) => (
                <div
                  key={cat.id}
                  className={`host-wiz-cat-card ${categoryId === cat.id ? 'selected' : ''}`}
                  onClick={() => setCategoryId(cat.id)}
                >
                  <TbSparkles size={16} style={{ color: categoryId === cat.id ? 'var(--host-primary, #059669)' : '#94a3b8' }} />
                  <span className="host-wiz-cat-name">
                    {cat.label_vi || cat.name_vi || cat.label || cat.name}
                  </span>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '1.25rem 0 0.85rem 0', color: 'var(--host-text-main)' }}>
              4. Vị trí & địa điểm chỗ ở
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)', display: 'block', marginBottom: '5px' }}>
                  Tỉnh / Thành phố *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.58rem 0.8rem',
                    borderRadius: 'var(--host-radius-md, 8px)',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                >
                  {['Đà Lạt', 'Phú Quốc', 'Đà Nẵng', 'Hạ Long', 'Hội An', 'Vũng Tàu', 'Hà Nội', 'TP. Hồ Chí Minh', 'Sa Pa', 'Nha Trang'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)', display: 'block', marginBottom: '5px' }}>
                  Quận / Huyện / Phường
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Ví dụ: Phường 3, Quận 1..."
                  style={{
                    width: '100%',
                    padding: '0.58rem 0.8rem',
                    borderRadius: 'var(--host-radius-md, 8px)',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)', display: 'block', marginBottom: '5px' }}>
                Địa chỉ chi tiết *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ví dụ: 12 Đường Khe Sanh, Phường 10..."
                style={{
                  width: '100%',
                  padding: '0.58rem 0.8rem',
                  borderRadius: 'var(--host-radius-md, 8px)',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 2: ROOM INFORMATION & CAPACITY (CHUYÊN SÂU) */}
        {currentStep === 2 && (
          <div>
            {rentalMode === 'entire_place' ? (
              /* MODE A: CHO THUÊ NGUYÊN CĂN */
              <div>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--host-text-main)' }}>
                  Cấu hình Chỗ ở Nguyên Căn (Entire Place)
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--host-text-muted)', marginBottom: '1.25rem' }}>
                  Thiết lập quy mô trọn gói cho toàn bộ căn nhà / biệt thự. Thông tin này sẽ lưu vào CSDL và đồng bộ lên Trang Chủ.
                </p>

                <div style={{ marginBottom: '1.15rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)', display: 'block', marginBottom: '5px' }}>
                    Tên gói phòng hiển thị
                  </label>
                  <input
                    type="text"
                    value={entireRoomName}
                    onChange={(e) => setEntireRoomName(e.target.value)}
                    placeholder="VD: Toàn bộ Biệt thự Nghỉ dưỡng Nguyên căn"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div className="counter-row-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div className="counter-label-wrap">
                    <strong style={{ display: 'block', fontSize: '0.92rem' }}>Số lượng khách tối đa</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Đoàn khách tối đa có thể lưu trú</span>
                  </div>
                  <div className="counter-controls-box" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setEntireMaxGuests(Math.max(1, entireMaxGuests - 1))}
                      disabled={entireMaxGuests <= 1}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span className="counter-val-num" style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>{entireMaxGuests}</span>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setEntireMaxGuests(entireMaxGuests + 1)}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="counter-row-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div className="counter-label-wrap">
                    <strong style={{ display: 'block', fontSize: '0.92rem' }}>Số phòng ngủ</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Tổng số phòng ngủ riêng biệt trong căn</span>
                  </div>
                  <div className="counter-controls-box" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setEntireBedrooms(Math.max(1, entireBedrooms - 1))}
                      disabled={entireBedrooms <= 1}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span className="counter-val-num" style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>{entireBedrooms}</span>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setEntireBedrooms(entireBedrooms + 1)}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="counter-row-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div className="counter-label-wrap">
                    <strong style={{ display: 'block', fontSize: '0.92rem' }}>Số giường ngủ</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Giường đơn, giường đôi hoặc King-size</span>
                  </div>
                  <div className="counter-controls-box" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setEntireBeds(Math.max(1, entireBeds - 1))}
                      disabled={entireBeds <= 1}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span className="counter-val-num" style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>{entireBeds}</span>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setEntireBeds(entireBeds + 1)}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="counter-row-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div className="counter-label-wrap">
                    <strong style={{ display: 'block', fontSize: '0.92rem' }}>Số phòng tắm</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Phòng tắm riêng biệt & tiện nghi</span>
                  </div>
                  <div className="counter-controls-box" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setEntireBathrooms(Math.max(1, entireBathrooms - 1))}
                      disabled={entireBathrooms <= 1}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span className="counter-val-num" style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>{entireBathrooms}</span>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setEntireBathrooms(entireBathrooms + 1)}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="counter-row-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0' }}>
                  <div className="counter-label-wrap">
                    <strong style={{ display: 'block', fontSize: '0.92rem' }}>Tổng diện tích sử dụng (m²)</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Diện tích toàn bộ khu đất / căn hộ</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      value={entireRoomSizeM2}
                      onChange={(e) => setEntireRoomSizeM2(Number(e.target.value))}
                      style={{
                        width: '80px',
                        padding: '0.45rem',
                        borderRadius: 'var(--host-radius-sm, 6px)',
                        border: '1.5px solid #cbd5e1',
                        textAlign: 'center',
                        fontWeight: 700,
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--host-text-muted)', fontWeight: 600 }}>m²</span>
                  </div>
                </div>

                {/* PRICING — Entire Place (gộp từ Bước 5 về đây) */}
                <div style={{ marginTop: '1.25rem', padding: '1rem 1.15rem', borderRadius: '10px', border: '1.5px solid #d1fae5', background: '#f0fdf4' }}>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, margin: '0 0 0.85rem 0', color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TbCoin style={{ fontSize: '1.1rem' }} /> Thiết lập giá cho thuê trọn gói
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                        Giá niêm yết mỗi đêm (VND) *
                      </label>
                      <input
                        type="number"
                        step="50000"
                        value={entirePriceVND}
                        onChange={(e) => setEntirePriceVND(Number(e.target.value))}
                        style={{ width: '100%', padding: '0.58rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700, color: '#059669', boxSizing: 'border-box' }}
                      />
                      <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                        Tương đương ~{formatPrice(entirePriceVND)}/đêm
                      </span>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                        Phí vệ sinh trọn căn (VND)
                      </label>
                      <input
                        type="number"
                        step="50000"
                        value={entireCleaningFeeVND}
                        onChange={(e) => setEntireCleaningFeeVND(Number(e.target.value))}
                        style={{ width: '100%', padding: '0.58rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 600, boxSizing: 'border-box' }}
                      />
                      <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                        Tương đương ~{formatPrice(entireCleaningFeeVND || 0)}/lần
                      </span>
                    </div>
                  </div>
                </div>

                {/* Album ảnh nội thất chi tiết bên trong căn (ít nhất 5 ảnh) */}
                <div className="host-photo-section">
                  <div className="host-photo-header-strip">
                    <div>
                      <h5 className="host-photo-title">
                        <TbPhoto style={{ fontSize: '1.2rem', color: 'var(--host-primary, #059669)' }} />
                        Bộ sưu tập ảnh không gian bên trong căn (Tối thiểu 5 ảnh nội thất chi tiết) *
                      </h5>
                      <p style={{ fontSize: '0.8rem', color: 'var(--host-text-muted)', margin: '3px 0 0 0', lineHeight: 1.45 }}>
                        Bao gồm phòng ngủ, phòng khách, phòng tắm, bếp ăn bên trong căn. Hiển thị độc lập khi khách xem chi tiết căn (Room Detail) và <strong>tách biệt hoàn toàn với 5 ảnh ngoại cảnh</strong> ở Bước 4.
                      </p>
                    </div>
                    <div className={`host-photo-compliance-badge ${entirePlaceImages.length >= 5 ? 'valid' : 'needed'}`}>
                      {entirePlaceImages.length >= 5 ? <TbCheck size={14} /> : <TbInfoCircle size={14} />}
                      <span>{entirePlaceImages.length >= 5 ? `Đạt chuẩn: ${entirePlaceImages.length}/5 ảnh` : `Cần thêm: ${entirePlaceImages.length}/5 ảnh`}</span>
                    </div>
                  </div>

                  {/* Input Toolbar: URL & Upload & Sample */}
                  <div className="host-photo-toolbar">
                    <div className="host-photo-input-wrap">
                      <TbLink className="host-photo-input-icon" />
                      <input
                        type="url"
                        className="host-photo-input"
                        placeholder="Dán link ảnh nội thất (https://...)"
                        value={newEntireImageUrl}
                        onChange={(e) => setNewEntireImageUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddEntirePlaceImageUrl(e); }}
                      />
                    </div>
                    <button
                      type="button"
                      className="host-photo-btn host-photo-btn-primary"
                      onClick={handleAddEntirePlaceImageUrl}
                    >
                      <TbPlus size={15} /> Thêm link
                    </button>
                    <label className="host-photo-btn host-photo-btn-outline">
                      {isUploadingEntireImage ? <TbLoader className="spin" size={15} /> : <TbUpload size={15} />}
                      {isUploadingEntireImage ? 'Đang tải...' : 'Tải từ máy'}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={isUploadingEntireImage}
                        onChange={handleUploadEntirePlaceImages}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button
                      type="button"
                      className="host-photo-btn host-photo-btn-sample"
                      onClick={handleApplyDefaultEntirePlaceImages}
                      title="Nạp nhanh 5 ảnh nội thất biệt thự mẫu chất lượng cao"
                    >
                      <TbSparkles size={15} /> Nạp 5 ảnh mẫu
                    </button>
                  </div>

                  {/* Thumbnail Grid */}
                  <div className="host-photo-grid">
                    {entirePlaceImages.map((imgUrl, idx) => (
                      <div key={idx} className="host-photo-card">
                        <img
                          src={imgUrl}
                          alt={`Nội thất ${idx + 1}`}
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300'; }}
                        />
                        {idx === 0 ? (
                          <div className="host-photo-star-btn is-main" title="Ảnh chính">
                            <TbStarFilled size={13} />
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="host-photo-star-btn"
                            onClick={() => handleSetEntirePlaceCoverImage(idx)}
                            title="Đặt làm ảnh chính"
                          >
                            <TbStarFilled size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="host-photo-delete-btn"
                          onClick={() => handleRemoveEntirePlaceImage(idx)}
                          title="Xóa ảnh này"
                        >
                          <TbTrash size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* MODE B: CƠ SỞ NHIỀU HẠNG PHÒNG (MULTI-ROOM) */
              <div>
                {/* Thanh chuyển đổi giữa các hạng phòng (Sub-Tabs) */}
                <div className="host-room-switcher-nav">
                  <div className="host-room-switcher-pills">
                    {rooms.map((r, rIdx) => {
                      const isActive = rIdx === Math.min(Math.max(0, activeRoomIndex), Math.max(0, rooms.length - 1));
                      const imgCount = (r.images || []).length;
                      const isImgValid = imgCount >= 5;
                      return (
                        <button
                          key={r.id || rIdx}
                          type="button"
                          className={`host-room-pill-btn ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveRoomIndex(rIdx)}
                          title={`Chuyển sang: ${r.roomNameVi || `Hạng phòng ${rIdx + 1}`}`}
                        >
                          <TbDoor size={16} />
                          <span>{r.roomNameVi || `Hạng phòng ${rIdx + 1}`}</span>
                          <span className={`host-room-pill-badge ${isImgValid ? 'valid' : 'warning'}`}>
                            {imgCount}/5 ảnh
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddRoom}
                    className="host-room-add-pill-btn"
                    title="Thêm một hạng phòng mới vào cơ sở"
                  >
                    <TbPlus size={15} /> Thêm hạng phòng
                  </button>
                </div>

                {/* Hiển thị chi tiết 1 hạng phòng đang chọn */}
                {rooms[Math.min(Math.max(0, activeRoomIndex), Math.max(0, rooms.length - 1))] && (() => {
                  const safeIdx = Math.min(Math.max(0, activeRoomIndex), Math.max(0, rooms.length - 1));
                  const room = rooms[safeIdx];
                  const idx = safeIdx;
                  return (
                    <div
                      key={room.id}
                      style={{
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '1.15rem',
                        background: '#f8fafc',
                        position: 'relative',
                      }}
                    >
                      {/* Header of room card */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--host-primary, #059669)', textTransform: 'uppercase' }}>
                          Hạng phòng #{idx + 1}
                        </span>
                        {rooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              handleRemoveRoom(room.id);
                              if (activeRoomIndex >= rooms.length - 1) setActiveRoomIndex(Math.max(0, rooms.length - 2));
                            }}
                            style={{
                              border: 'none',
                              background: '#fee2e2',
                              color: '#dc2626',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <TbTrash /> Xóa phòng này
                          </button>
                        )}
                      </div>

                      {/* Room inputs */}
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                            Tên hạng phòng *
                          </label>
                          <input
                            type="text"
                            value={room.roomNameVi}
                            onChange={(e) => handleUpdateRoom(room.id, 'roomNameVi', e.target.value)}
                            placeholder="VD: Phòng Deluxe Giường Đôi..."
                            style={{ width: '100%', padding: '0.48rem 0.75rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600, boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                            Số lượng phòng có sẵn
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={room.totalInventory}
                            onChange={(e) => handleUpdateRoom(room.id, 'totalInventory', Number(e.target.value))}
                            style={{ width: '100%', padding: '0.48rem 0.75rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                            Khách tối đa
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateRoom(room.id, 'maxGuests', Math.max(1, (room.maxGuests || 2) - 1))}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >-</button>
                            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>{room.maxGuests || 2}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateRoom(room.id, 'maxGuests', (room.maxGuests || 2) + 1)}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >+</button>
                          </div>
                        </div>

                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                            Phòng ngủ
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateRoom(room.id, 'bedrooms', Math.max(1, (room.bedrooms || 1) - 1))}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >-</button>
                            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>{room.bedrooms || 1}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateRoom(room.id, 'bedrooms', (room.bedrooms || 1) + 1)}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >+</button>
                          </div>
                        </div>

                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                            Số giường
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateRoom(room.id, 'beds', Math.max(1, (room.beds || 1) - 1))}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >-</button>
                            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>{room.beds || 1}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateRoom(room.id, 'beds', (room.beds || 1) + 1)}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >+</button>
                          </div>
                        </div>

                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                            Phòng tắm
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateRoom(room.id, 'bathrooms', Math.max(1, (room.bathrooms || 1) - 1))}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >-</button>
                            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>{room.bathrooms || 1}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateRoom(room.id, 'bathrooms', (room.bathrooms || 1) + 1)}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >+</button>
                          </div>
                        </div>

                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                            Diện tích
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <input
                              type="number"
                              min="10"
                              value={room.roomSizeM2 || 35}
                              onChange={(e) => handleUpdateRoom(room.id, 'roomSizeM2', Number(e.target.value))}
                              style={{ width: '56px', height: '26px', padding: '0 4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 800, textAlign: 'center', color: '#0f172a' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginLeft: '4px' }}>m²</span>
                          </div>
                        </div>
                      </div>

                      {/* Giá & Phí vệ sinh phòng */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                            Giá niêm yết mỗi đêm (VND) *
                          </label>
                          <input
                            type="number"
                            step="50000"
                            value={room.priceVND}
                            onChange={(e) => handleUpdateRoom(room.id, 'priceVND', Number(e.target.value))}
                            style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700, color: '#059669', boxSizing: 'border-box' }}
                          />
                          <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, display: 'block', marginTop: '3px' }}>
                            ~ {formatPrice(room.priceVND)} / đêm
                          </span>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                            Phí vệ sinh phòng (VND)
                          </label>
                          <input
                            type="number"
                            step="50000"
                            value={room.cleaningFeeVND}
                            onChange={(e) => handleUpdateRoom(room.id, 'cleaningFeeVND', Number(e.target.value))}
                            style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600, boxSizing: 'border-box' }}
                          />
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, display: 'block', marginTop: '3px' }}>
                            ~ {formatPrice(room.cleaningFeeVND || 0)} / lần
                          </span>
                        </div>
                      </div>

                      {/* Mô tả hạng phòng */}
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Mô tả đặc điểm hạng phòng
                        </label>
                        <textarea
                          rows={2}
                          value={room.description || ''}
                          onChange={(e) => handleUpdateRoom(room.id, 'description', e.target.value)}
                          placeholder="Mô tả ngắn gọn về hạng phòng (nội thất, tầm nhìn, tiện nghi đặc biệt...)"
                          style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', resize: 'vertical' }}
                        />
                      </div>

                      {/* Album ảnh riêng của hạng phòng (Ít nhất 5 ảnh) */}
                      <div className="host-photo-section">
                        <div className="host-photo-header-strip">
                          <div>
                            <h5 className="host-photo-title">
                              <TbPhoto style={{ fontSize: '1.2rem', color: 'var(--host-primary, #059669)' }} />
                              Bộ sưu tập ảnh thực tế hạng phòng #{idx + 1} (Tối thiểu 5 ảnh) *
                            </h5>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0', lineHeight: 1.45 }}>
                              Bao gồm ảnh giường ngủ, không gian làm việc, phòng tắm, ban công view của riêng hạng phòng này.
                            </p>
                          </div>
                          <div className={`host-photo-compliance-badge ${(room.images || []).length >= 5 ? 'valid' : 'needed'}`}>
                            {(room.images || []).length >= 5 ? <TbCheck size={14} /> : <TbInfoCircle size={14} />}
                            <span>{(room.images || []).length >= 5 ? `Đạt chuẩn: ${room.images.length}/5 ảnh` : `Cần thêm: ${(room.images || []).length}/5 ảnh`}</span>
                          </div>
                        </div>

                        {/* Toolbar: URL & Upload & Sample */}
                        <div className="host-photo-toolbar">
                          <div className="host-photo-input-wrap">
                            <TbLink className="host-photo-input-icon" />
                            <input
                              type="url"
                              id={`wiz-room-input-${room.id}`}
                              placeholder="Dán link ảnh hạng phòng (https://)..."
                              className="host-photo-input"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddRoomImageUrl(room.id, e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            className="host-photo-btn host-photo-btn-primary"
                            onClick={() => {
                              const input = document.getElementById(`wiz-room-input-${room.id}`);
                              if (input) {
                                handleAddRoomImageUrl(room.id, input.value);
                                input.value = '';
                              }
                            }}
                          >
                            <TbPlus size={15} /> Thêm link
                          </button>
                          <label className="host-photo-btn host-photo-btn-outline">
                            <TbUpload size={15} />
                            <span>Tải từ máy</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleUploadRoomImages(room.id, e)}
                              style={{ display: 'none' }}
                            />
                          </label>
                          <button
                            type="button"
                            className="host-photo-btn host-photo-btn-sample"
                            onClick={() => {
                              const sample = idx === 0 ? SAMPLE_DELUXE_ROOM_IMAGES : (idx === 1 ? SAMPLE_SUITE_ROOM_IMAGES : SAMPLE_VILLA_ROOM_IMAGES);
                              handleApplySampleRoomImages(room.id, sample);
                            }}
                            title="Nạp nhanh 5 ảnh thực tế mẫu chất lượng cao cho hạng phòng này"
                          >
                            <TbSparkles size={15} /> Nạp 5 ảnh mẫu
                          </button>
                        </div>

                        {/* Room Photos Thumbnail Grid */}
                        <div className="host-photo-grid">
                          {(room.images || []).map((imgUrl, iIdx) => (
                            <div key={iIdx} className="host-photo-card">
                              <img
                                src={imgUrl}
                                alt={`Ảnh ${iIdx + 1}`}
                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300'; }}
                              />
                              {iIdx === 0 ? (
                                <div className="host-photo-star-btn is-main" title="Ảnh chính">
                                  <TbStarFilled size={13} />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="host-photo-star-btn"
                                  onClick={() => handleSetRoomCoverImage(room.id, iIdx)}
                                  title="Đặt làm ảnh chính"
                                >
                                  <TbStarFilled size={13} />
                                </button>
                              )}
                              <button
                                type="button"
                                className="host-photo-delete-btn"
                                onClick={() => handleRemoveRoomImage(room.id, iIdx)}
                                title="Xóa ảnh này"
                              >
                                <TbTrash size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer chuyển hạng phòng Trước / Tiếp theo */}
                      <div className="host-room-nav-footer">
                        <button
                          type="button"
                          className="host-room-nav-btn"
                          disabled={safeIdx === 0}
                          onClick={() => setActiveRoomIndex(safeIdx - 1)}
                        >
                          <TbArrowLeft size={15} /> Hạng phòng trước
                        </button>

                        <div className="host-room-nav-summary">
                          <span>Đang cấu hình <strong>{safeIdx + 1}</strong> / <strong>{rooms.length}</strong> hạng phòng</span>
                        </div>

                        {safeIdx < rooms.length - 1 ? (
                          <button
                            type="button"
                            className="host-room-nav-btn"
                            onClick={() => setActiveRoomIndex(safeIdx + 1)}
                          >
                            Hạng phòng tiếp theo <TbArrowRight size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="host-room-nav-btn"
                            style={{ color: 'var(--host-primary, #059669)', borderColor: 'var(--host-primary, #059669)', background: 'var(--host-primary-soft, #ecfdf5)' }}
                            onClick={handleAddRoom}
                          >
                            <TbPlus size={15} /> Thêm hạng phòng mới
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: AMENITIES */}
        {currentStep === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--host-text-main)' }}>
                  <TbSparkles style={{ color: 'var(--host-primary, #059669)', verticalAlign: 'middle', marginRight: '6px' }} />
                  Tiện ích nổi bật tại chỗ ở (Amenities)
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--host-text-muted)', margin: 0 }}>
                  Những tiện nghi chất lượng cao sẽ giúp chỗ ở của bạn nổi bật và thu hút nhiều lượt đặt phòng hơn.
                </p>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--host-primary-soft, #ecfdf5)',
                color: 'var(--host-primary, #059669)',
                border: '1px solid var(--host-primary-border, #a7f3d0)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 800,
                whiteSpace: 'nowrap'
              }}>
                <TbCheck size={14} />
                <span>Đã chọn: {selectedAmenities.length} tiện ích</span>
              </div>
            </div>

            {/* Toolbar: Categories & Search */}
            <div className="host-amenities-search-bar">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { id: 'all', label: 'Tất cả tiện ích', icon: <TbSparkles size={14} /> },
                  { id: 'standout', label: 'Nổi bật & View', icon: <TbStarFilled size={14} /> },
                  { id: 'basic', label: 'Thiết yếu & Bếp', icon: <TbToolsKitchen2 size={14} /> },
                  { id: 'luxury', label: 'Sang trọng & Spa', icon: <TbDiamond size={14} /> },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAmenityCategoryFilter(cat.id)}
                    style={{
                      border: amenityCategoryFilter === cat.id ? '1.5px solid var(--host-primary, #059669)' : '1.5px solid #cbd5e1',
                      background: amenityCategoryFilter === cat.id ? 'var(--host-primary, #059669)' : '#ffffff',
                      color: amenityCategoryFilter === cat.id ? '#ffffff' : '#475569',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="host-search-input-group">
                <TbSearch />
                <input
                  type="text"
                  className="host-search-input"
                  placeholder="Tìm nhanh tiện ích..."
                  value={amenitySearchQuery}
                  onChange={(e) => setAmenitySearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Grid Cards */}
            <div className="host-amenities-grid">
              {filteredAmenities.map((a, idx) => {
                const name = getAmenityLabel(a);
                if (!name) return null;
                const isChecked = selectedAmenities.includes(name);
                return (
                  <div
                    key={a.id || name || idx}
                    className={`host-amenity-card ${isChecked ? 'selected' : ''}`}
                    onClick={() => toggleAmenity(name)}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: isChecked ? '#ffffff' : '#f1f5f9',
                      color: isChecked ? 'var(--host-primary, #059669)' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0,
                    }}>
                      {renderAmenityIcon(a.icon || name)}
                    </div>
                    <span className="host-amenity-name" style={{ color: isChecked ? '#065f46' : '#1e293b', flex: 1 }}>
                      {name}
                    </span>
                    <div style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--host-primary, #059669)', fontWeight: 900 }}>
                      {isChecked && <TbCheck size={16} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: IMAGES */}
        {currentStep === 4 && (
          <div className="host-photo-section" style={{ marginTop: 0, background: '#ffffff' }}>
            <div className="host-photo-header-strip">
              <div>
                <h4 className="host-photo-title" style={{ fontSize: '1.05rem' }}>
                  <TbPhoto style={{ fontSize: '1.25rem', color: 'var(--host-primary, #059669)' }} />
                  Bộ sưu tập ảnh toàn cảnh & ngoại cảnh cơ sở (Tối thiểu 5 ảnh) *
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--host-text-muted)', margin: '3px 0 0 0', lineHeight: 1.45 }}>
                  5 ảnh này sẽ hiển thị tại <strong>Hero Gallery 5 ảnh trên trang chi tiết cơ sở (Accommodation)</strong> và thẻ tìm kiếm. Bao gồm mặt tiền, sân vườn, hồ bơi, khuôn viên chung... tách biệt với ảnh nội thất phòng.
                </p>
              </div>
              <div className={`host-photo-compliance-badge ${images.length >= 5 ? 'valid' : 'needed'}`}>
                {images.length >= 5 ? <TbCheck size={14} /> : <TbInfoCircle size={14} />}
                <span>{images.length >= 5 ? `Đạt chuẩn: ${images.length}/5 ảnh` : `Cần thêm: ${images.length}/5 ảnh`}</span>
              </div>
            </div>

            {/* Upload Toolbar */}
            <div className="host-photo-toolbar">
              <div className="host-photo-input-wrap">
                <TbLink className="host-photo-input-icon" />
                <input
                  type="url"
                  className="host-photo-input"
                  placeholder="Dán link ảnh trực tiếp (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddImageUrl(e); }}
                />
              </div>
              <button
                type="button"
                className="host-photo-btn host-photo-btn-primary"
                onClick={handleAddImageUrl}
              >
                <TbPlus size={15} /> Thêm link
              </button>
              <label className="host-photo-btn host-photo-btn-outline">
                {isUploading ? <TbLoader className="spin" size={15} /> : <TbUpload size={15} />}
                {isUploading ? 'Đang tải...' : 'Tải từ máy'}
                <input
                  type="file"
                  id="wizard-upload-input"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  disabled={isUploading}
                  style={{ display: 'none' }}
                  onChange={handleAddImageFromDevice}
                />
              </label>
              <button
                type="button"
                className="host-photo-btn host-photo-btn-sample"
                onClick={handleApplyDefaultExteriorImages}
                title="Áp dụng ngay 5 ảnh ngoại cảnh khuôn viên chất lượng cao"
              >
                <TbSparkles size={15} /> Nạp 5 ảnh ngoại cảnh mẫu
              </button>
            </div>

            {/* Images Grid */}
            <div className="host-photo-grid">
              {images.map((img, idx) => (
                <div key={idx} className="host-photo-card">
                  <img
                    src={img}
                    alt={`Chỗ ở ${idx}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800';
                    }}
                  />
                  {idx === 0 ? (
                    <div className="host-photo-star-btn is-main" title="Ảnh bìa chính">
                      <TbStarFilled size={13} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="host-photo-star-btn"
                      onClick={() => handleSetCoverImage(idx)}
                      title="Đặt làm ảnh bìa"
                    >
                      <TbStarFilled size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="host-photo-delete-btn"
                    onClick={() => handleRemoveImage(idx)}
                    title="Xóa ảnh này"
                  >
                    <TbTrash size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: '#64748b' }}>
              * Tổng cộng: <strong>{images.length}</strong> ảnh ngoại cảnh. Ảnh đầu tiên sẽ hiển thị làm thẻ đại diện trên Trang Chủ.
            </div>
          </div>
        )}

        {/* STEP 5: TITLE, DESCRIPTION & POLICIES */}
        {currentStep === 5 && (
          <div>
            <h4 style={{ fontSize: '1.02rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--host-text-main)' }}>
              1. Tiêu đề cơ sở & mô tả không gian
            </h4>

            <div style={{ marginBottom: '1.15rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)', margin: 0 }}>
                  Tên cơ sở lưu trú nổi bật *
                </label>
                <span style={{ fontSize: '0.74rem', color: nameVi.length > 50 ? '#d97706' : '#64748b' }}>
                  {nameVi.length}/60 ký tự (Khuyên dùng: 30 - 50)
                </span>
              </div>
              <input
                type="text"
                maxLength={60}
                value={nameVi}
                onChange={(e) => setNameVi(e.target.value)}
                placeholder="Ví dụ: The Sunset Valley Luxury Villa & Resort Đà Lạt..."
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: 'var(--host-radius-md, 8px)',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)', margin: 0 }}>
                  Mô tả tổng quan về trải nghiệm lưu trú *
                </label>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {description.length}/1000 ký tự
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả vẻ đẹp, cảnh quan thiên nhiên và trải nghiệm nghỉ dưỡng..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--host-radius-md, 8px)',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  minHeight: '100px',
                  lineHeight: 1.5,
                }}
                required
              />
            </div>

            <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '1.25rem 0 0.85rem 0', color: 'var(--host-text-main)' }}>
              2. Quy định & Chính sách đặt phòng
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)', display: 'block', marginBottom: '5px' }}>
                  Nội quy chỗ ở
                </label>
                <textarea
                  rows={3}
                  value={houseRules}
                  onChange={(e) => setHouseRules(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', minHeight: '80px', lineHeight: 1.45 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)', display: 'block', marginBottom: '5px' }}>
                  Chính sách hủy phòng
                </label>
                <textarea
                  rows={3}
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', minHeight: '80px', lineHeight: 1.45 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: PREVIEW & PUBLISH */}
        {currentStep === 6 && (
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.3rem', color: 'var(--host-text-main)' }}>
              Xem trước hiển thị trên Trang Chủ & Trang Chi Tiết
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--host-text-muted)', marginBottom: '1.25rem' }}>
              Đây là cách cơ sở lưu trú và các hạng phòng của bạn sẽ hiển thị với du khách trên TripNest.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: previewRooms.length > 1 ? '340px 1fr' : '1fr', gap: '1.5rem', maxWidth: '820px', margin: '0 auto', textAlign: 'left' }}>
              {/* Left: Card on Homepage */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Thẻ hiển thị trang chủ
                </div>
                <div
                  className="live-preview-box"
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                    background: '#fff',
                  }}
                >
                  <div style={{ position: 'relative', height: '190px', background: '#f1f5f9' }}>
                    <img
                      src={images[0]}
                      alt={nameVi}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800';
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: 'rgba(255,255,255,0.92)',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <TbMapPin style={{ color: '#ef4444' }} /> {city}
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(15, 23, 42, 0.75)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '20px',
                      }}
                    >
                      {selectedCategoryObj?.label_vi || selectedCategoryObj?.name_vi || 'Nổi bật'}
                    </span>
                  </div>

                  <div className="live-preview-body" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>
                        {city} · {accommodationType.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <TbStarFilled style={{ color: '#ff385c', fontSize: '0.85rem' }} /> 5.00 <span style={{ color: '#64748b', fontWeight: 500 }}>(Mới)</span>
                      </span>
                    </div>

                    <h4 className="host-preview-title">
                      {nameVi}
                    </h4>

                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {previewRooms.length > 1 && (
                        <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                          {previewRooms.length} hạng phòng
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Tối đa {totalMaxGuests} khách
                      </span>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        {previewRooms.length > 1 && <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Từ </span>}
                        <strong className="live-preview-price" style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                          {formatPrice(minPriceVND)}
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}> / đêm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Matrix of rooms in AccommodationDetailPage */}
              {previewRooms.length > 1 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Bảng hạng phòng ({previewRooms.length} phòng)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {previewRooms.map((rm, i) => (
                      <div
                        key={i}
                        style={{
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0.75rem 0.95rem',
                          background: '#fff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rm.roomNameVi}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {rm.maxGuests} khách · {rm.bedrooms} PN · {rm.beds} giường · {rm.bathrooms} WC · {rm.roomSizeM2} m²
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap' }}>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--host-primary, #059669)', display: 'block', whiteSpace: 'nowrap' }}>
                            {formatPrice(rm.priceVND)}
                          </strong>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap' }}>/ đêm</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Actions */}
      <div className="host-wiz-footer">
        {currentStep > 1 ? (
          <button
            type="button"
            className="host-btn-client"
            onClick={() => setCurrentStep(currentStep - 1)}
            style={{ fontSize: '0.84rem', padding: '0.48rem 0.95rem' }}
          >
            <TbArrowLeft /> Quay lại
          </button>
        ) : onCancel ? (
          <button
            type="button"
            className="host-btn-client"
            onClick={onCancel}
            style={{ fontSize: '0.84rem', padding: '0.48rem 0.95rem' }}
          >
            <TbArrowLeft /> Quay lại danh sách
          </button>
        ) : (
          <div />
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            className="host-btn-primary"
            onClick={handleNextStep}
            style={{ fontSize: '0.84rem', padding: '0.5rem 1.25rem' }}
          >
            Tiếp tục <TbArrowRight />
          </button>
        ) : (
          <button
            type="button"
            className="host-btn-primary"
            disabled={isPublishing}
            onClick={handlePublishListing}
            style={{
              fontSize: '0.88rem',
              padding: '0.58rem 1.35rem',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isPublishing ? <TbLoader className="spin" size={18} /> : <TbCheck size={18} />}
            {isPublishing ? 'Đang xuất bản...' : 'HOÀN TẤT & ĐĂNG BÁN'}
          </button>
        )}
      </div>
    </div>
  );
};

export default HostListingWizardPage;
