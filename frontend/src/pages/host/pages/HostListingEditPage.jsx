import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './HostListingEditPage.css';
import {
  TbArrowLeft,
  TbArrowRight,
  TbDoor,
  TbCheck,
  TbBuildingCastle,
  TbBuildingCommunity,
  TbHome,
  TbBuilding,
  TbTrees,
  TbSailboat,
  TbPlus,
  TbTrash,
  TbUpload,
  TbStarFilled,
  TbMapPin,
  TbWifi,
  TbSwimming,
  TbToolsKitchen2,
  TbAirConditioning,
  TbCar,
  TbFlame,
  TbDeviceTv,
  TbSparkles,
  TbBed,
  TbBath,
  TbRefresh,
  TbEye,
  TbPaw,
  TbDeviceLaptop,
  TbBeach,
  TbWashMachine,
  TbShieldCheck,
  TbCoffee,
  TbBarbell,
  TbSearch,
  TbPhoto,
  TbX,
  TbLoader,
  TbLink,
  TbInfoCircle,
  TbDiamond,
} from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/services/api';

// 5 ảnh Ngoại cảnh & Khuôn viên Cơ sở lưu trú (Hero Gallery trang Accommodation)
const DEFAULT_ACCOMMODATION_EXTERIOR_IMAGES = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80',
];

// 5 ảnh Nội thất Chi tiết Không gian Bên trong Căn (Cho thuê Nguyên căn - Room Detail)
const DEFAULT_ENTIRE_INTERIOR_IMAGES = [
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80',
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

const getEditDraftKey = (id) => `tripnest_host_edit_draft_${id}`;

export const HostListingEditPage = ({
  accommodationId,
  initialListing = null,
  onCancel,
  onListingUpdated,
  currency = 'VND',
}) => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const hasShownDraftToastRef = useRef(false);
  const [activeTab, setActiveTab] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  // 1. Basic Info & Location
  const [nameVi, setNameVi] = useState('');
  const [accommodationType, setAccommodationType] = useState('villa');
  const [rentalMode, setRentalMode] = useState('entire_place');
  const [categoryId, setCategoryId] = useState(1);
  const [categoriesList, setCategoriesList] = useState([]);
  const [city, setCity] = useState('Đà Lạt');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('published');

  // 2. Room Configuration State
  const [rooms, setRooms] = useState([]);
  const [entireRoomName, setEntireRoomName] = useState('Toàn bộ chỗ nghỉ nguyên căn');
  const [entireMaxGuests, setEntireMaxGuests] = useState(6);
  const [entireBedrooms, setEntireBedrooms] = useState(3);
  const [entireBeds, setEntireBeds] = useState(3);
  const [entireBathrooms, setEntireBathrooms] = useState(3);
  const [entireRoomSizeM2, setEntireRoomSizeM2] = useState(150);
  const [entirePriceVND, setEntirePriceVND] = useState(3500000);
  const [entireCleaningFeeVND, setEntireCleaningFeeVND] = useState(300000);
  // Bộ ảnh nội thất bên trong căn nguyên căn (ít nhất 5 ảnh)
  const [entirePlaceImages, setEntirePlaceImages] = useState([]);
  const [newEntireImageUrl, setNewEntireImageUrl] = useState('');
  const [isUploadingEntireImage, setIsUploadingEntireImage] = useState(false);

  // 3. Amenities State & Filtering
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [amenityCategoryFilter, setAmenityCategoryFilter] = useState('all');
  const [amenitySearchQuery, setAmenitySearchQuery] = useState('');

  // 4. Images State
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 5. Description & Policies
  const [description, setDescription] = useState('');
  const [houseRules, setHouseRules] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');

  const typesList = [
    { id: 'villa', name: 'Biệt thự (Villa)', icon: <TbBuildingCastle /> },
    { id: 'resort', name: 'Khu nghỉ dưỡng', icon: <TbBuildingCommunity /> },
    { id: 'homestay', name: 'Homestay ấm cúng', icon: <TbHome /> },
    { id: 'apartment', name: 'Căn hộ cao cấp', icon: <TbBuilding /> },
    { id: 'cabin', name: 'Cabin rừng thông', icon: <TbTrees /> },
    { id: 'yacht', name: 'Du thuyền vịnh', icon: <TbSailboat /> },
  ];

  // 6 Clean, Non-Clipped Tabs with Dynamic Room Count
  const tabs = useMemo(() => [
    { id: 1, label: 'Thông tin & Vị trí', icon: <TbMapPin /> },
    { id: 2, label: `Hạng phòng & Giá (${rentalMode === 'entire_place' ? 1 : rooms.length})`, icon: <TbBed /> },
    { id: 3, label: 'Tiện ích nổi bật', icon: <TbSparkles /> },
    { id: 4, label: 'Album hình ảnh', icon: <TbUpload /> },
    { id: 5, label: 'Mô tả & Quy định', icon: <TbBuilding /> },
    { id: 6, label: 'Xem trước', icon: <TbEye /> },
  ], [rentalMode, rooms.length]);

  // Load Categories & Amenities with Guaranteed Fallback
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const cats = await apiService.getCategories();
        if (Array.isArray(cats)) {
          setCategoriesList(cats.filter((c) => c.slug !== 'all'));
        }
      } catch (e) {
        console.error('Error loading categories:', e);
      }

      try {
        const data = await apiService.getAmenities();
        const amList = data?.amenities || (Array.isArray(data) ? data : []);
        if (Array.isArray(amList) && amList.length > 0) {
          setAmenitiesList(amList);
        } else {
          setAmenitiesList([
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
    fetchMetadata();
  }, []);

  // Fetch full details of target Accommodation & restore uncommitted draft
  const loadAccommodationDetails = useCallback(async (ignoreDraft = false) => {
    if (!accommodationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.getAccommodationById(accommodationId);
      if (!data) {
        setLoading(false);
        return;
      }

      // 1. Set baseline data from server
      setNameVi(data.nameVi || data.title || '');
      setAccommodationType(data.accommodationType || 'villa');
      setCategoryId(data.categoryId || 1);
      setCity(data.city || 'Đà Lạt');
      setDistrict(data.district || '');
      setAddress(data.address || '');
      setDescription(data.description || '');
      setStatus(data.status || 'published');

      if (Array.isArray(data.houseRules)) {
        setHouseRules(data.houseRules.join('\n'));
      } else {
        setHouseRules(data.houseRules || 'Không hút thuốc trong phòng, giữ gìn vệ sinh chung.');
      }

      setCancellationPolicy(data.cancellationPolicy || 'Hủy miễn phí 100% trước 48h nhận phòng.');

      // Images
      const imgs = Array.isArray(data.images) && data.images.length > 0 ? data.images : (data.thumbnail ? [data.thumbnail] : []);
      setImages(imgs);

      // Amenities
      const ams = Array.isArray(data.amenities) ? data.amenities : [];
      setSelectedAmenities(ams);

      // Rooms
      const loadedRooms = Array.isArray(data.rooms) ? data.rooms : [];
      const isEntire = loadedRooms.length === 1 && loadedRooms[0].spaceType === 'entire_place';

      if (isEntire) {
        setRentalMode('entire_place');
        const r0 = loadedRooms[0];
        setEntireRoomName(r0.roomNameVi || r0.title || 'Toàn bộ chỗ nghỉ nguyên căn');
        setEntireMaxGuests(Number(r0.maxGuests) || 6);
        setEntireBedrooms(Number(r0.bedroomsCount || r0.bedrooms) || 3);
        setEntireBeds(Number(r0.bedsCount || r0.beds) || 3);
        setEntireBathrooms(Number(r0.bathroomsCount || r0.bathrooms) || 3);
        setEntireRoomSizeM2(Number(r0.roomSizeM2) || 150);
        setEntirePriceVND(Number(r0.priceVND || r0.pricePerNight) || 3500000);
        setEntireCleaningFeeVND(Number(r0.cleaningFee || r0.cleaningFeeVND) || 300000);
        const r0Imgs = Array.isArray(r0.images) && r0.images.length > 0 ? r0.images : (r0.imageUrl ? [r0.imageUrl] : []);
        setEntirePlaceImages(r0Imgs.length > 0 ? r0Imgs : [...DEFAULT_ENTIRE_INTERIOR_IMAGES]);
      } else if (loadedRooms.length > 0) {
        setRentalMode('multi_room');
        setRooms(
          loadedRooms.map((r, idx) => {
            const sampleSet = idx === 0 ? SAMPLE_DELUXE_ROOM_IMAGES : (idx === 1 ? SAMPLE_SUITE_ROOM_IMAGES : SAMPLE_VILLA_ROOM_IMAGES);
            const rImgs = Array.isArray(r.images) && r.images.length > 0 ? r.images : (r.imageUrl ? [r.imageUrl] : [...sampleSet]);
            return {
              id: r.id || `rm-${idx + 1}`,
              roomNameVi: r.roomNameVi || r.title || `Hạng phòng ${idx + 1}`,
              spaceType: r.spaceType || 'private_room',
              maxGuests: Number(r.maxGuests) || 2,
              bedrooms: Number(r.bedroomsCount || r.bedrooms) || 1,
              beds: Number(r.bedsCount || r.beds) || 1,
              bathrooms: Number(r.bathroomsCount || r.bathrooms) || 1,
              roomSizeM2: Number(r.roomSizeM2) || 40,
              priceVND: Number(r.priceVND || r.pricePerNight) || 1800000,
              cleaningFeeVND: Number(r.cleaningFee || r.cleaningFeeVND) || 150000,
              totalInventory: Number(r.totalInventory) || 1,
              description: r.description || '',
              imageUrl: rImgs[0] || '',
              images: rImgs,
            };
          })
        );
      } else {
        setRentalMode('entire_place');
        setEntirePriceVND(Number(data.priceVND || data.priceFrom) || 2500000);
        setEntireMaxGuests(Number(data.maxGuests) || 4);
        setEntirePlaceImages([...DEFAULT_ENTIRE_INTERIOR_IMAGES]);
      }

      // 2. Check and restore localStorage draft if available
      if (!ignoreDraft) {
        try {
          const draftKey = getEditDraftKey(accommodationId);
          const saved = localStorage.getItem(draftKey);
          if (saved) {
            const draft = JSON.parse(saved);
            if (draft.activeTab) setActiveTab(draft.activeTab);
            if (draft.nameVi !== undefined) setNameVi(draft.nameVi);
            if (draft.accommodationType) setAccommodationType(draft.accommodationType);
            if (draft.rentalMode) setRentalMode(draft.rentalMode);
            if (draft.categoryId) setCategoryId(draft.categoryId);
            if (draft.city) setCity(draft.city);
            if (draft.district !== undefined) setDistrict(draft.district);
            if (draft.address !== undefined) setAddress(draft.address);
            if (draft.status) setStatus(draft.status);

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

            if (draft.description !== undefined) setDescription(draft.description);
            if (draft.houseRules !== undefined) setHouseRules(draft.houseRules);
            if (draft.cancellationPolicy !== undefined) setCancellationPolicy(draft.cancellationPolicy);

            if (!hasShownDraftToastRef.current) {
              hasShownDraftToastRef.current = true;
              toast.info(
                'Đã khôi phục bản nháp chỉnh sửa',
                'Các thay đổi đang chỉnh sửa dở trước đó đã được tự động phục hồi từ bộ nhớ trình duyệt.'
              );
            }
          }
        } catch (err) {
          console.warn('Lỗi đọc bản nháp edit từ localStorage:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching accommodation details for edit:', err);
      toast.error('Lỗi tải dữ liệu', 'Không thể tải chi tiết cơ sở lưu trú để chỉnh sửa.');
    } finally {
      setLoading(false);
      setIsDraftRestored(true);
    }
  }, [accommodationId]);

  // Initial mount: load details & restore draft
  useEffect(() => {
    setIsDraftRestored(false);
    loadAccommodationDetails();
  }, [loadAccommodationDetails]);

  // Auto-save draft to localStorage whenever user modifies any field
  useEffect(() => {
    if (!isDraftRestored || loading || !accommodationId) return;

    const draft = {
      activeTab,
      nameVi,
      accommodationType,
      rentalMode,
      categoryId,
      city,
      district,
      address,
      status,
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
      description,
      houseRules,
      cancellationPolicy,
      lastSaved: new Date().toISOString(),
    };

    try {
      localStorage.setItem(getEditDraftKey(accommodationId), JSON.stringify(draft));
    } catch (err) {
      console.warn('Lỗi lưu bản nháp edit vào localStorage:', err);
    }
  }, [
    isDraftRestored,
    loading,
    accommodationId,
    activeTab,
    nameVi,
    accommodationType,
    rentalMode,
    categoryId,
    city,
    district,
    address,
    status,
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
    description,
    houseRules,
    cancellationPolicy,
  ]);

  // Discard draft and reset to server values
  const handleDiscardDraft = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy bỏ các chỉnh sửa nháp và khôi phục lại dữ liệu gốc từ máy chủ?')) {
      try {
        localStorage.removeItem(getEditDraftKey(accommodationId));
      } catch (e) {}
      setIsDraftRestored(false);
      await loadAccommodationDetails(true);
      toast.success('Đã khôi phục', 'Đã nạp lại dữ liệu gốc từ máy chủ.');
    }
  };

  // Helpers
  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round(val / 25000).toLocaleString()}`;
    return `${Number(val).toLocaleString('vi-VN')} ₫`;
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

  // Filtered Amenities Computed
  const filteredAmenities = useMemo(() => {
    return amenitiesList.filter((a) => {
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
  }, [amenitiesList, amenityCategoryFilter, amenitySearchQuery]);

  // Room Management Handlers
  const handleAddRoom = () => {
    const newIdx = rooms.length;
    const sampleSet = newIdx % 3 === 0 ? SAMPLE_DELUXE_ROOM_IMAGES : (newIdx % 3 === 1 ? SAMPLE_SUITE_ROOM_IMAGES : SAMPLE_VILLA_ROOM_IMAGES);
    const newRoom = {
      id: `rm-${Date.now()}`,
      roomNameVi: `Hạng phòng mới ${rooms.length + 1}`,
      spaceType: 'private_room',
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      roomSizeM2: 40,
      priceVND: 2000000,
      cleaningFeeVND: 150000,
      totalInventory: 2,
      description: 'Không gian phòng tiện nghi, ánh sáng tự nhiên thoáng mát.',
      imageUrl: sampleSet[0],
      images: [...sampleSet],
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
    toast.info('Đã gỡ hạng phòng', 'Đã gỡ bỏ hạng phòng khỏi danh sách.');
  };

  // Multi-Room Image Album Handlers
  const handleAddRoomImageUrl = (roomId, urlInput) => {
    const url = (urlInput || '').trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.warning('Định dạng URL', 'Vui lòng dán link bắt đầu bằng http:// hoặc https://');
      return;
    }
    setRooms(rooms.map((r) => {
      if (r.id !== roomId) return r;
      const curImgs = Array.isArray(r.images) ? [...r.images] : (r.imageUrl ? [r.imageUrl] : []);
      if (curImgs.includes(url)) {
        toast.info('Ảnh trùng lặp', 'Ảnh này đã có trong album phòng.');
        return r;
      }
      const updated = [...curImgs, url];
      return { ...r, images: updated, imageUrl: updated[0] };
    }));
    toast.success('Đã thêm ảnh', 'Đã thêm ảnh vào album hạng phòng.');
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
    toast.info('Đã đổi ảnh chính', 'Đã đặt ảnh này làm ảnh chính của hạng phòng.');
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
    const url = newEntireImageUrl.trim();
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

  // Image Management Handlers
  const handleAddImageFromDevice = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    let count = 0;
    const uploadedUrls = [];

    for (const file of files) {
      try {
        const res = await apiService.uploadHostImage(file);
        if (res && res.url) {
          uploadedUrls.push(res.url);
          count++;
        }
      } catch (err) {
        toast.error('Lỗi tải ảnh', `Tệp ${file.name}: ${err.message || 'Không thể tải lên'}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success('Tải ảnh thành công', `Đã lưu ${count} ảnh vào bộ sưu tập cơ sở.`);
    }
    setIsUploading(false);
    e.target.value = '';
  };

  const handleAddImageUrl = (e) => {
    if (e) e.preventDefault();
    const url = newImageUrl.trim();
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
    toast.success('Đã thêm ảnh', 'Ảnh từ liên kết đã được thêm vào album cơ sở.');
  };

  const handleRemoveImage = (idx) => {
    if (images.length <= 1) {
      toast.warning('Yêu cầu hình ảnh', 'Chỗ nghỉ cần ít nhất 1 hình ảnh đại diện.');
      return;
    }
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSetCoverImage = (idx) => {
    if (idx === 0) return;
    const target = images[idx];
    const rest = images.filter((_, i) => i !== idx);
    setImages([target, ...rest]);
    toast.info('Ảnh bìa mới', 'Đã đặt ảnh này làm ảnh bìa đại diện của chỗ ở.');
  };

  const handleApplyDefaultExteriorImages = () => {
    setImages([...DEFAULT_ACCOMMODATION_EXTERIOR_IMAGES]);
    toast.success('Đã áp dụng mẫu', 'Đã nạp 5 ảnh ngoại cảnh khuôn viên chất lượng cao.');
  };

  // Computed Values for Live Preview
  const previewRooms = rentalMode === 'entire_place'
    ? [
        {
          id: rooms[0]?.id || 'rm-entire',
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

  // Save / Update Handler
  const handleSaveListing = async () => {
    if (!nameVi.trim()) {
      toast.warning('Thiếu tiêu đề', 'Vui lòng nhập tên cơ sở lưu trú.');
      setActiveTab(1);
      return;
    }

    if (!address.trim()) {
      toast.warning('Thiếu địa chỉ', 'Vui lòng nhập địa chỉ cụ thể của cơ sở.');
      setActiveTab(1);
      return;
    }

    if (images.length < 5) {
      toast.warning('Thiếu hình ảnh cơ sở', `Chỗ nghỉ cần tối thiểu 5 ảnh ngoại cảnh/khuôn viên (hiện có ${images.length}/5 ảnh).`);
      setActiveTab(4);
      return;
    }

    if (rentalMode === 'entire_place') {
      if (!entirePriceVND || entirePriceVND < 50000) {
        toast.warning('Giá chưa hợp lệ', 'Giá mỗi đêm tối thiểu là 50.000 ₫.');
        setActiveTab(2);
        return;
      }
      if (entirePlaceImages.length < 5) {
        toast.warning('Yêu cầu ảnh nội thất', `Vui lòng tải hoặc thêm tối thiểu 5 ảnh nội thất chi tiết bên trong căn (hiện có ${entirePlaceImages.length}/5 ảnh).`);
        setActiveTab(2);
        return;
      }
    } else {
      if (rooms.length === 0) {
        toast.warning('Thiếu hạng phòng', 'Vui lòng cấu hình ít nhất 1 hạng phòng đón khách.');
        setActiveTab(2);
        return;
      }
      const invalidRoom = rooms.find((r) => !r.priceVND || r.priceVND < 50000);
      if (invalidRoom) {
        toast.warning('Giá phòng chưa hợp lệ', `Hạng phòng "${invalidRoom.roomNameVi}" cần có giá tối thiểu 50.000 ₫/đêm.`);
        const targetIdx = rooms.findIndex((r) => r.id === invalidRoom.id);
        if (targetIdx !== -1) setActiveRoomIndex(targetIdx);
        setActiveTab(2);
        return;
      }
      const missingRoomImgs = rooms.find((r) => !r.images || r.images.length < 5);
      if (missingRoomImgs) {
        toast.warning('Yêu cầu ảnh hạng phòng', `Hạng phòng "${missingRoomImgs.roomNameVi}" cần tối thiểu 5 ảnh thực tế (hiện có ${missingRoomImgs.images?.length || 0}/5 ảnh).`);
        const targetIdx = rooms.findIndex((r) => r.id === missingRoomImgs.id);
        if (targetIdx !== -1) setActiveRoomIndex(targetIdx);
        setActiveTab(2);
        return;
      }
    }

    setIsSaving(true);
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
        houseRules: houseRules.trim(),
        cancellationPolicy: cancellationPolicy.trim(),
        images,
        amenities: selectedAmenities,
        rooms: previewRooms.map((r) => ({
          id: r.id,
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
        priceVND: minPriceVND,
        cleaningFeeVND: previewRooms[0]?.cleaningFeeVND || 300000,
        maxGuests: totalMaxGuests,
        bedrooms: previewRooms[0]?.bedrooms || 1,
        beds: previewRooms[0]?.beds || 1,
        bathrooms: previewRooms[0]?.bathrooms || 1,
        roomSizeM2: previewRooms[0]?.roomSizeM2 || 50,
      };

      const result = await apiService.updateHostAccommodation(accommodationId, payload);

      try {
        localStorage.removeItem(getEditDraftKey(accommodationId));
      } catch (e) {}

      toast.success(
        'Cập nhật thành công!',
        `Thông tin cơ sở lưu trú "${nameVi}" đã được lưu thành công trên TripNest.`
      );

      if (onListingUpdated) {
        onListingUpdated({ id: accommodationId, ...payload });
      }

      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      toast.error('Lỗi lưu chỗ nghỉ', err.message || 'Không thể lưu thay đổi vào lúc này.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="host-edit-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="host-acc-loading-spinner" style={{ margin: '0 auto 1.25rem auto' }} />
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--host-text-main)' }}>
          Đang tải dữ liệu cơ sở lưu trú...
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--host-text-muted)' }}>
          Vui lòng đợi trong giây lát trong khi chúng tôi chuẩn bị form chỉnh sửa.
        </p>
      </div>
    );
  }

  const selectedCategoryObj = categoriesList.find((c) => c.id === categoryId) || categoriesList[0];

  return (
    <div className="host-edit-container">
      {/* 1. Header Toolbar */}
      <div className="host-edit-header">
        <div className="host-edit-header-left">
          <button
            type="button"
            className="host-edit-back-btn"
            onClick={onCancel}
            title="Quay lại danh sách cơ sở lưu trú"
          >
            <TbArrowLeft /> Về danh sách
          </button>
          <div className="host-edit-title-group">
            <h3>
              <TbBuildingCastle style={{ color: 'var(--host-primary)' }} />
              Chỉnh Sửa: {nameVi || 'Cơ sở lưu trú'}
            </h3>
            <p>Mã cơ sở: #{accommodationId} · Cập nhật giá bán, sức chứa, hình ảnh và chính sách</p>
          </div>
        </div>

        <div className="host-edit-header-actions">
          <button
            type="button"
            className="host-edit-back-btn"
            onClick={handleDiscardDraft}
            title="Hủy bỏ các chỉnh sửa nháp và tải lại dữ liệu gốc từ máy chủ"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <TbRefresh /> Khôi phục gốc
          </button>
          <button
            type="button"
            className="host-edit-save-btn"
            onClick={handleSaveListing}
            disabled={isSaving}
          >
            {isSaving ? <TbRefresh className="spin" /> : <TbCheck />}
            {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>

      {/* 2. Horizontal Navigation Tabs Bar */}
      <nav className="host-edit-tabs-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`host-edit-tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* 3. Form Body */}
      <div className="host-edit-body">
        {/* TAB 1: THÔNG TIN CƠ BẢN & VỊ TRÍ */}
        {activeTab === 1 && (
          <div className="host-edit-section-card">
            <h4><TbBuildingCastle /> Thông tin cơ bản & Vị trí địa lý</h4>
            <p className="host-edit-section-desc">
              Cập nhật loại hình lưu trú, danh mục phong cách và địa chỉ hiển thị trên bản đồ.
            </p>

            <div className="host-edit-field-group">
              <label className="host-edit-label">Tiêu đề cơ sở lưu trú (Tên hiển thị) *</label>
              <input
                type="text"
                className="host-edit-input"
                value={nameVi}
                onChange={(e) => setNameVi(e.target.value)}
                placeholder="Ví dụ: Sun Valley Luxury Private Villa Đà Lạt"
                style={{ fontSize: '1rem', fontWeight: 700 }}
                required
              />
            </div>

            <div className="host-edit-field-group">
              <label className="host-edit-label">Loại hình chỗ nghỉ *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {typesList.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setAccommodationType(t.id)}
                    style={{
                      padding: '0.85rem 0.75rem',
                      borderRadius: '8px',
                      border: accommodationType === t.id ? '2px solid var(--host-primary, #059669)' : '1.5px solid #cbd5e1',
                      background: accommodationType === t.id ? 'var(--host-primary-soft, #ecfdf5)' : '#ffffff',
                      color: accommodationType === t.id ? 'var(--host-primary, #059669)' : '#0f172a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t.icon} {t.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="host-edit-field-group" style={{ marginTop: '1.25rem' }}>
              <label className="host-edit-label">Chế độ cho thuê *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div
                  className={`host-mode-select-card ${rentalMode === 'entire_place' ? 'active' : ''}`}
                  onClick={() => setRentalMode('entire_place')}
                >
                  <div className="host-mode-card-header">
                    <TbBuildingCastle className="host-mode-icon" />
                    <span>Cho thuê nguyên căn (Entire Place)</span>
                  </div>
                  <p>Trọn gói toàn bộ biệt thự, homestay, hoặc căn hộ riêng tư. Giá tính theo cả căn.</p>
                </div>

                <div
                  className={`host-mode-select-card ${rentalMode === 'multi_room' ? 'active' : ''}`}
                  onClick={() => setRentalMode('multi_room')}
                >
                  <div className="host-mode-card-header">
                    <TbBuildingCommunity className="host-mode-icon" />
                    <span>Nhiều hạng phòng độc lập (Multi-Room)</span>
                  </div>
                  <p>Mỗi hạng phòng (Deluxe, Suite...) bán riêng. Thích hợp cho khách sạn, resort.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
              <div className="host-edit-field-group">
                <label className="host-edit-label">Danh mục phong cách *</label>
                <select
                  className="host-edit-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                >
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_vi || c.label_vi}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="host-edit-field-group">
                <label className="host-edit-label">Tỉnh / Thành phố *</label>
                <select
                  className="host-edit-select"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="Đà Lạt">Đà Lạt</option>
                  <option value="Phú Quốc">Phú Quốc</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Hạ Long">Hạ Long</option>
                  <option value="Hội An">Hội An</option>
                  <option value="Vũng Tàu">Vũng Tàu</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Nha Trang">Nha Trang</option>
                  <option value="Sa Pa">Sa Pa</option>
                </select>
              </div>

              <div className="host-edit-field-group">
                <label className="host-edit-label">Quận / Huyện / Phường</label>
                <input
                  type="text"
                  className="host-edit-input"
                  placeholder="Ví dụ: Phường 3"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
            </div>

            <div className="host-edit-field-group">
              <label className="host-edit-label">Địa chỉ chi tiết *</label>
              <input
                type="text"
                className="host-edit-input"
                placeholder="Số nhà, tên đường, khu vực..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* TAB 2: CẤU HÌNH HẠNG PHÒNG & GIÁ */}
        {activeTab === 2 && (
          <div className="host-edit-section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div>
                <h4><TbBed /> Cấu hình Hạng phòng & Giá niêm yết</h4>
                <p className="host-edit-section-desc" style={{ marginBottom: 0 }}>
                  {rentalMode === 'entire_place'
                    ? 'Quản lý thông số diện tích, sức chứa và giá trọn gói cho toàn bộ chỗ nghỉ nguyên căn.'
                    : 'Quản lý từng hạng phòng đón khách độc lập. Mỗi hạng phòng có giá bán, tồn kho và tiện nghi riêng.'}
                </p>
              </div>
              {rentalMode === 'multi_room' && (
                <button
                  type="button"
                  className="host-btn-primary"
                  onClick={handleAddRoom}
                  style={{ fontSize: '0.84rem', padding: '0.5rem 1rem' }}
                >
                  <TbPlus /> Thêm Hạng Phòng Mới
                </button>
              )}
            </div>

            {/* Chế độ Cho thuê nguyên căn */}
            {rentalMode === 'entire_place' ? (
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', marginTop: '1rem' }}>
                <div className="host-edit-field-group">
                  <label className="host-edit-label">Tên gọi không gian nguyên căn</label>
                  <input
                    type="text"
                    className="host-edit-input"
                    value={entireRoomName}
                    onChange={(e) => setEntireRoomName(e.target.value)}
                    placeholder="Ví dụ: Toàn bộ Biệt thự Nghỉ dưỡng Nguyên căn"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.85rem' }}>
                  <div className="host-edit-field-group">
                    <label className="host-edit-label">Số khách tối đa</label>
                    <div className="host-input-with-suffix">
                      <input
                        type="number"
                        min="1"
                        className="host-edit-input"
                        value={entireMaxGuests}
                        onChange={(e) => setEntireMaxGuests(Math.max(1, Number(e.target.value)))}
                      />
                      <span className="host-input-suffix">khách</span>
                    </div>
                  </div>
                  <div className="host-edit-field-group">
                    <label className="host-edit-label">Phòng ngủ</label>
                    <div className="host-input-with-suffix">
                      <input
                        type="number"
                        min="1"
                        className="host-edit-input"
                        value={entireBedrooms}
                        onChange={(e) => setEntireBedrooms(Math.max(1, Number(e.target.value)))}
                      />
                      <span className="host-input-suffix">phòng</span>
                    </div>
                  </div>
                  <div className="host-edit-field-group">
                    <label className="host-edit-label">Số giường</label>
                    <div className="host-input-with-suffix">
                      <input
                        type="number"
                        min="1"
                        className="host-edit-input"
                        value={entireBeds}
                        onChange={(e) => setEntireBeds(Math.max(1, Number(e.target.value)))}
                      />
                      <span className="host-input-suffix">giường</span>
                    </div>
                  </div>
                  <div className="host-edit-field-group">
                    <label className="host-edit-label">Phòng tắm</label>
                    <div className="host-input-with-suffix">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        className="host-edit-input"
                        value={entireBathrooms}
                        onChange={(e) => setEntireBathrooms(Math.max(1, Number(e.target.value)))}
                      />
                      <span className="host-input-suffix">phòng</span>
                    </div>
                  </div>
                  <div className="host-edit-field-group">
                    <label className="host-edit-label">Diện tích (m²)</label>
                    <div className="host-input-with-suffix">
                      <input
                        type="number"
                        min="10"
                        className="host-edit-input"
                        value={entireRoomSizeM2}
                        onChange={(e) => setEntireRoomSizeM2(Math.max(10, Number(e.target.value)))}
                      />
                      <span className="host-input-suffix">m²</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '0.5rem', background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1.5px solid #bfdbfe' }}>
                  <div className="host-edit-field-group" style={{ margin: 0 }}>
                    <label className="host-edit-label" style={{ color: '#1e40af' }}>
                      Giá niêm yết mỗi đêm (VND) *
                    </label>
                    <input
                      type="number"
                      step="50000"
                      min="50000"
                      className="host-edit-input"
                      value={entirePriceVND}
                      onChange={(e) => setEntirePriceVND(Number(e.target.value))}
                      style={{ borderColor: '#93c5fd', fontWeight: 800, fontSize: '1rem' }}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: 600 }}>
                      Quy đổi: {formatPrice(entirePriceVND)} / đêm
                    </span>
                  </div>

                  <div className="host-edit-field-group" style={{ margin: 0 }}>
                    <label className="host-edit-label" style={{ color: '#1e40af' }}>
                      Phí vệ sinh & Dọn dẹp (VND)
                    </label>
                    <input
                      type="number"
                      step="50000"
                      min="0"
                      className="host-edit-input"
                      value={entireCleaningFeeVND}
                      onChange={(e) => setEntireCleaningFeeVND(Number(e.target.value))}
                      style={{ borderColor: '#93c5fd' }}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                      Quy đổi: {formatPrice(entireCleaningFeeVND || 0)} · Tính 1 lần
                    </span>
                  </div>
                </div>

                {/* BỘ ẢNH NỘI THẤT CHI TIẾT CHO THUÊ NGUYÊN CĂN (Tối thiểu 5 ảnh) */}
                <div className="host-photo-section">
                  <div className="host-photo-header-strip">
                    <div>
                      <h4 className="host-photo-title">
                        <TbPhoto style={{ color: 'var(--host-primary, #059669)' }} />
                        Bộ sưu tập ảnh không gian bên trong căn (Tối thiểu 5 ảnh nội thất) *
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                        Bao gồm phòng ngủ, phòng khách, phòng tắm, khu bếp bên trong căn. Tách biệt với 5 ảnh ngoại cảnh khuôn viên ở Tab 4.
                      </p>
                    </div>
                    <div className={`host-photo-compliance-badge ${entirePlaceImages.length >= 5 ? 'valid' : 'needed'}`}>
                      {entirePlaceImages.length >= 5 ? <TbCheck /> : <TbInfoCircle />}
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
                        placeholder="Dán link ảnh nội thất (https://)..."
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
                      <TbPlus /> Thêm link
                    </button>
                    <label className="host-photo-btn host-photo-btn-outline">
                      {isUploadingEntireImage ? <TbLoader className="spin" /> : <TbUpload />}
                      <span>{isUploadingEntireImage ? 'Đang tải...' : 'Tải từ máy'}</span>
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
                      <TbSparkles /> Nạp 5 ảnh nội thất mẫu
                    </button>
                  </div>

                  {/* Thumbnail Grid */}
                  <div className="host-photo-grid">
                    {entirePlaceImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="host-photo-card"
                        style={idx === 0 ? { borderColor: 'var(--host-primary, #059669)', boxShadow: '0 0 0 2px rgba(5, 150, 105, 0.2)' } : {}}
                      >
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
              /* Chế độ Nhiều hạng phòng (Multi-Room) - Chuyển hạng phòng & Mỗi lần hiển thị 1 hạng phòng */
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
                    <div key={room.id} className="host-edit-room-box">
                      <div className="host-edit-room-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ background: 'var(--host-primary-soft, #ecfdf5)', color: 'var(--host-primary, #059669)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                            Hạng phòng #{idx + 1}
                          </span>
                          <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>
                            {room.roomNameVi || `Hạng phòng ${idx + 1}`}
                          </strong>
                        </div>
                        {rooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoom(room.id)}
                            className="host-btn-action danger"
                            title="Xóa hạng phòng này"
                            style={{ padding: '4px 8px' }}
                          >
                            <TbTrash /> Xóa phòng này
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div className="host-edit-field-group">
                          <label className="host-edit-label">Tên hạng phòng *</label>
                          <input
                            type="text"
                            className="host-edit-input"
                            value={room.roomNameVi}
                            onChange={(e) => handleUpdateRoom(room.id, 'roomNameVi', e.target.value)}
                            placeholder="Ví dụ: Phòng Deluxe King Hướng Rừng Thông"
                          />
                        </div>

                        <div className="host-edit-field-group">
                          <label className="host-edit-label">Loại không gian</label>
                          <select
                            className="host-edit-select"
                            value={room.spaceType || 'private_room'}
                            onChange={(e) => handleUpdateRoom(room.id, 'spaceType', e.target.value)}
                          >
                            <option value="private_room">Phòng riêng tư (Private room)</option>
                            <option value="entire_place">Căn hộ / Suite nguyên căn</option>
                            <option value="shared_room">Phòng tập thể (Shared room)</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.85rem' }}>
                        <div className="host-edit-field-group">
                          <label className="host-edit-label">Khách tối đa</label>
                          <div className="host-input-with-suffix">
                            <input
                              type="number"
                              min="1"
                              className="host-edit-input"
                              value={room.maxGuests}
                              onChange={(e) => handleUpdateRoom(room.id, 'maxGuests', Math.max(1, Number(e.target.value)))}
                            />
                            <span className="host-input-suffix">khách</span>
                          </div>
                        </div>
                        <div className="host-edit-field-group">
                          <label className="host-edit-label">Phòng ngủ</label>
                          <div className="host-input-with-suffix">
                            <input
                              type="number"
                              min="1"
                              className="host-edit-input"
                              value={room.bedrooms}
                              onChange={(e) => handleUpdateRoom(room.id, 'bedrooms', Math.max(1, Number(e.target.value)))}
                            />
                            <span className="host-input-suffix">phòng</span>
                          </div>
                        </div>
                        <div className="host-edit-field-group">
                          <label className="host-edit-label">Số giường</label>
                          <div className="host-input-with-suffix">
                            <input
                              type="number"
                              min="1"
                              className="host-edit-input"
                              value={room.beds}
                              onChange={(e) => handleUpdateRoom(room.id, 'beds', Math.max(1, Number(e.target.value)))}
                            />
                            <span className="host-input-suffix">giường</span>
                          </div>
                        </div>
                        <div className="host-edit-field-group">
                          <label className="host-edit-label">Phòng tắm</label>
                          <div className="host-input-with-suffix">
                            <input
                              type="number"
                              step="0.5"
                              min="1"
                              className="host-edit-input"
                              value={room.bathrooms}
                              onChange={(e) => handleUpdateRoom(room.id, 'bathrooms', Math.max(1, Number(e.target.value)))}
                            />
                            <span className="host-input-suffix">phòng</span>
                          </div>
                        </div>
                        <div className="host-edit-field-group">
                          <label className="host-edit-label">Diện tích (m²)</label>
                          <div className="host-input-with-suffix">
                            <input
                              type="number"
                              min="10"
                              className="host-edit-input"
                              value={room.roomSizeM2}
                              onChange={(e) => handleUpdateRoom(room.id, 'roomSizeM2', Math.max(10, Number(e.target.value)))}
                            />
                            <span className="host-input-suffix">m²</span>
                          </div>
                        </div>
                        <div className="host-edit-field-group">
                          <label className="host-edit-label">Số phòng có</label>
                          <div className="host-input-with-suffix">
                            <input
                              type="number"
                              min="1"
                              className="host-edit-input"
                              value={room.totalInventory}
                              onChange={(e) => handleUpdateRoom(room.id, 'totalInventory', Math.max(1, Number(e.target.value)))}
                            />
                            <span className="host-input-suffix">phòng</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                        <div className="host-edit-field-group" style={{ margin: 0 }}>
                          <label className="host-edit-label" style={{ color: 'var(--host-primary, #059669)' }}>
                            Giá mỗi đêm (VND) *
                          </label>
                          <input
                            type="number"
                            step="50000"
                            min="50000"
                            className="host-edit-input"
                            value={room.priceVND}
                            onChange={(e) => handleUpdateRoom(room.id, 'priceVND', Number(e.target.value))}
                            style={{ fontWeight: 800 }}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                            {formatPrice(room.priceVND)} / đêm
                          </span>
                        </div>

                        <div className="host-edit-field-group" style={{ margin: 0 }}>
                          <label className="host-edit-label">Phí dọn dẹp (VND)</label>
                          <input
                            type="number"
                            step="50000"
                            min="0"
                            className="host-edit-input"
                            value={room.cleaningFeeVND}
                            onChange={(e) => handleUpdateRoom(room.id, 'cleaningFeeVND', Number(e.target.value))}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                            {formatPrice(room.cleaningFeeVND || 0)} / lần
                          </span>
                        </div>
                      </div>

                      <div className="host-edit-field-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                        <label className="host-edit-label">Mô tả riêng cho hạng phòng này</label>
                        <textarea
                          rows={2}
                          className="host-edit-textarea"
                          value={room.description || ''}
                          onChange={(e) => handleUpdateRoom(room.id, 'description', e.target.value)}
                          placeholder="Mô tả đặc điểm nổi bật, view ban công, loại giường của hạng phòng..."
                        />
                      </div>

                      {/* BỘ ẢNH THỰC TẾ HẠNG PHÒNG (Tối thiểu 5 ảnh) */}
                      <div className="host-photo-section" style={{ marginTop: '1rem' }}>
                        <div className="host-photo-header-strip">
                          <div>
                            <h4 className="host-photo-title">
                              <TbPhoto style={{ color: 'var(--host-primary, #059669)' }} />
                              Bộ sưu tập ảnh thực tế hạng phòng #{idx + 1} (Tối thiểu 5 ảnh) *
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                              Bao gồm ảnh giường ngủ, góc làm việc, phòng tắm, ban công view của riêng hạng phòng này.
                            </p>
                          </div>
                          <div className={`host-photo-compliance-badge ${(room.images || []).length >= 5 ? 'valid' : 'needed'}`}>
                            {(room.images || []).length >= 5 ? <TbCheck /> : <TbInfoCircle />}
                            <span>{(room.images || []).length >= 5 ? `Đạt chuẩn: ${room.images.length}/5 ảnh` : `Cần thêm: ${(room.images || []).length}/5 ảnh`}</span>
                          </div>
                        </div>

                        {/* Controls Toolbar: URL Input, Upload File, Apply Sample */}
                        <div className="host-photo-toolbar">
                          <div className="host-photo-input-wrap">
                            <TbLink className="host-photo-input-icon" />
                            <input
                              type="url"
                              id={`room-img-input-${room.id}`}
                              className="host-photo-input"
                              placeholder="Dán link ảnh hạng phòng (https://images.unsplash.com/...)..."
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
                              const input = document.getElementById(`room-img-input-${room.id}`);
                              if (input) {
                                handleAddRoomImageUrl(room.id, input.value);
                                input.value = '';
                              }
                            }}
                          >
                            <TbPlus /> Thêm link
                          </button>

                          <label className="host-photo-btn host-photo-btn-outline">
                            <TbUpload />
                            <span>Tải từ máy</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleUploadRoomImages(room.id, e)}
                            />
                          </label>

                          {/* Quick Sample Button */}
                          <button
                            type="button"
                            className="host-photo-btn host-photo-btn-sample"
                            onClick={() => {
                              const sample = idx === 0 ? SAMPLE_DELUXE_ROOM_IMAGES : (idx === 1 ? SAMPLE_SUITE_ROOM_IMAGES : SAMPLE_VILLA_ROOM_IMAGES);
                              handleApplySampleRoomImages(room.id, sample);
                            }}
                            title="Áp dụng ngay 5 ảnh mẫu chất lượng cao cho hạng phòng"
                          >
                            <TbSparkles /> Nạp 5 ảnh mẫu
                          </button>
                        </div>

                        {/* Room Photos Thumbnail Grid */}
                        <div className="host-photo-grid">
                          {(room.images || []).map((imgUrl, iIdx) => (
                            <div
                              key={iIdx}
                              className="host-photo-card"
                              style={iIdx === 0 ? { borderColor: 'var(--host-primary, #059669)', boxShadow: '0 0 0 2px rgba(5, 150, 105, 0.2)' } : {}}
                            >
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
                          <span>Đang hiển thị <strong>{safeIdx + 1}</strong> / <strong>{rooms.length}</strong> hạng phòng</span>
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

        {/* TAB 3: TIỆN ÍCH NỔI BẬT */}
        {activeTab === 3 && (
          <div className="host-edit-section-card">
            <div className="host-section-header-wrap">
              <div>
                <h4><TbSparkles /> Tiện ích nổi bật (Amenities)</h4>
                <p className="host-edit-section-desc">
                  Chọn các tiện ích sẵn có tại cơ sở để thu hút du khách tìm kiếm và lọc kết quả.
                </p>
              </div>
              <div className="host-amenity-counter-pill">
                <TbCheck style={{ color: 'var(--host-primary, #059669)' }} />
                <span>Đã chọn: {selectedAmenities.length} tiện ích</span>
              </div>
            </div>

            {/* Toolbar: Category Filters & Search */}
            <div className="host-amenities-toolbar">
              <div className="host-amenities-categories">
                {[
                  { id: 'all', label: 'Tất cả tiện ích', icon: <TbSparkles /> },
                  { id: 'standout', label: 'Nổi bật & View', icon: <TbStarFilled /> },
                  { id: 'basic', label: 'Thiết yếu & Bếp', icon: <TbToolsKitchen2 /> },
                  { id: 'luxury', label: 'Sang trọng & Spa', icon: <TbDiamond /> },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`host-amenity-cat-btn ${amenityCategoryFilter === cat.id ? 'active' : ''}`}
                    onClick={() => setAmenityCategoryFilter(cat.id)}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <TbSearch style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '1rem', pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="host-amenities-search-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="Tìm nhanh tiện ích..."
                  value={amenitySearchQuery}
                  onChange={(e) => setAmenitySearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Grid of Amenities */}
            <div className="host-amenities-grid">
              {filteredAmenities.map((a, idx) => {
                const name = getAmenityLabel(a);
                if (!name) return null;
                const isSelected = selectedAmenities.includes(name);
                return (
                  <div
                    key={a.id || name || idx}
                    className={`host-amenity-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleAmenity(name)}
                  >
                    <div className="host-amenity-icon-circle">
                      {renderAmenityIcon(a.icon || name)}
                    </div>
                    <span className="host-amenity-title">{name}</span>
                    <div className="host-amenity-check-indicator">
                      {isSelected && <TbCheck />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ALBUM HÌNH ẢNH NGOẠI CẢNH */}
        {activeTab === 4 && (
          <div className="host-edit-section-card">
            <div className="host-photo-header-strip">
              <div>
                <h4 className="host-photo-title">
                  <TbUpload style={{ color: 'var(--host-primary, #059669)' }} />
                  Bộ sưu tập ảnh toàn cảnh & ngoại cảnh cơ sở (Tối thiểu 5 ảnh) *
                </h4>
                <p className="host-edit-section-desc" style={{ marginBottom: 0 }}>
                  5 ảnh này sẽ hiển thị tại <strong>Hero Gallery 5 ảnh trên trang chi tiết cơ sở (Accommodation)</strong> và thẻ tìm kiếm. Bao gồm mặt tiền, sân vườn, hồ bơi, khuôn viên chung... tách biệt với ảnh nội thất phòng.
                </p>
              </div>
              <div className={`host-photo-compliance-badge ${images.length >= 5 ? 'valid' : 'needed'}`}>
                {images.length >= 5 ? <TbCheck /> : <TbInfoCircle />}
                <span>{images.length >= 5 ? `Đạt chuẩn: ${images.length}/5 ảnh` : `Cần thêm: ${images.length}/5 ảnh`}</span>
              </div>
            </div>

            {/* Upload Zone & URL Input */}
            <div className="host-photo-toolbar">
              <div className="host-photo-input-wrap">
                <TbLink className="host-photo-input-icon" />
                <input
                  type="url"
                  className="host-photo-input"
                  placeholder="Dán link ảnh ngoại cảnh (https://images.unsplash.com/...)..."
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
                <TbPlus /> Thêm link
              </button>
              <label className="host-photo-btn host-photo-btn-outline">
                {isUploading ? <TbLoader className="spin" /> : <TbUpload />}
                <span>{isUploading ? 'Đang tải...' : 'Tải từ máy'}</span>
                <input
                  type="file"
                  id="edit-file-upload"
                  multiple
                  accept="image/*"
                  disabled={isUploading}
                  onChange={handleAddImageFromDevice}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                type="button"
                className="host-photo-btn host-photo-btn-sample"
                onClick={handleApplyDefaultExteriorImages}
                title="Nạp 5 ảnh ngoại cảnh khuôn viên chất lượng cao"
              >
                <TbSparkles /> Nạp 5 ảnh ngoại cảnh mẫu
              </button>
            </div>

            {/* Images Grid */}
            <div className="host-photo-grid">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="host-photo-card"
                  style={idx === 0 ? { borderColor: 'var(--host-primary, #059669)', boxShadow: '0 0 0 2px rgba(5, 150, 105, 0.2)' } : {}}
                >
                  <img
                    src={imgUrl}
                    alt={`Ảnh ngoại cảnh ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600';
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
          </div>
        )}

        {/* TAB 5: MÔ TẢ & CHÍNH SÁCH */}
        {activeTab === 5 && (
          <div className="host-edit-section-card">
            <h4><TbBuilding /> Tiêu đề, Mô tả & Chính sách chỗ nghỉ</h4>
            <p className="host-edit-section-desc">
              Cung cấp câu chuyện trải nghiệm, nội quy chỗ nghỉ và chính sách hủy phòng minh bạch.
            </p>

            <div className="host-edit-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="host-edit-label">Tiêu đề cơ sở lưu trú *</label>
                <span style={{ fontSize: '0.78rem', color: nameVi.length > 60 ? '#dc2626' : '#64748b', fontWeight: 600 }}>
                  {nameVi.length}/60 ký tự
                </span>
              </div>
              <input
                type="text"
                className="host-edit-input"
                value={nameVi}
                onChange={(e) => setNameVi(e.target.value)}
                placeholder="Ví dụ: The Sunset Valley Luxury Villa & Resort Đà Lạt"
                required
              />
            </div>

            <div className="host-edit-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="host-edit-label">Mô tả tổng quan trải nghiệm *</label>
                <span style={{ fontSize: '0.78rem', color: description.length > 1000 ? '#dc2626' : '#64748b', fontWeight: 600 }}>
                  {description.length}/1000 ký tự
                </span>
              </div>
              <textarea
                rows={5}
                className="host-edit-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả không gian, cảnh quan xung quanh, điểm đặc biệt..."
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="host-edit-field-group">
                <label className="host-edit-label">Nội quy lưu trú (House Rules)</label>
                <textarea
                  rows={3}
                  className="host-edit-textarea"
                  value={houseRules}
                  onChange={(e) => setHouseRules(e.target.value)}
                  placeholder="Không hút thuốc, giữ yên tĩnh sau 22h, xuất trình CMND/CCCD..."
                />
              </div>

              <div className="host-edit-field-group">
                <label className="host-edit-label">Chính sách hủy phòng (Cancellation Policy)</label>
                <textarea
                  rows={3}
                  className="host-edit-textarea"
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                  placeholder="Miễn phí hủy trước 48h, thanh toán tại chỗ nghỉ..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: XEM TRƯỚC (LIVE PREVIEW) */}
        {activeTab === 6 && (
          <div className="host-edit-section-card" style={{ textAlign: 'center' }}>
            <h4><TbEye /> Xem trước hiển thị trên Trang Chủ & Trang Chi Tiết</h4>
            <p className="host-edit-section-desc">
              Dưới đây là hình ảnh cơ sở lưu trú và các hạng phòng của bạn khi khách du lịch xem trên TripNest sau khi cập nhật.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: previewRooms.length > 1 ? '340px 1fr' : '1fr', gap: '1.5rem', maxWidth: '820px', margin: '0 auto', textAlign: 'left' }}>
              {/* Card ListingCard */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Thẻ hiển thị trang chủ
                </div>
                <div
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    background: '#fff',
                  }}
                >
                  <div style={{ position: 'relative', height: '190px', background: '#f1f5f9' }}>
                    <img
                      src={images[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'}
                      alt={nameVi}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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

                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>
                        {city} · {accommodationType.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <TbStarFilled style={{ color: '#ff385c', fontSize: '0.85rem' }} /> 5.00
                      </span>
                    </div>

                    <h4 className="host-preview-title">
                      {nameVi || 'Tên cơ sở lưu trú'}
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
                        <strong style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                          {formatPrice(minPriceVND)}
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}> / đêm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matrix of rooms */}
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

      {/* 4. Footer Sticky Action Bar */}
      <div className="host-edit-footer">
        <button
          type="button"
          className="host-edit-back-btn"
          onClick={onCancel}
        >
          Hủy & Quay lại
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab > 1 && (
            <button
              type="button"
              className="host-btn-client"
              onClick={() => setActiveTab(activeTab - 1)}
            >
              Mục trước
            </button>
          )}
          {activeTab < 6 && (
            <button
              type="button"
              className="host-btn-client"
              onClick={() => setActiveTab(activeTab + 1)}
            >
              Mục tiếp theo
            </button>
          )}
          <button
            type="button"
            className="host-edit-save-btn"
            onClick={handleSaveListing}
            disabled={isSaving}
          >
            {isSaving ? <TbRefresh className="spin" /> : <TbCheck />}
            {isSaving ? 'Đang lưu cập nhật...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostListingEditPage;
