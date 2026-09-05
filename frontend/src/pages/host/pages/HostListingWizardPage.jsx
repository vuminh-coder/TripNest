import React, { useEffect, useState } from 'react';
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
} from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/services/api';

const DEFAULT_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80',
];

export const HostListingWizardPage = ({
  onCancel,
  onListingCreated,
  currency = 'VND',
}) => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const stepTitles = [
    'Loại hình & Vị trí',
    'Cấu hình Hạng phòng & Sức chứa',
    'Tiện ích nổi bật',
    'Bộ sưu tập hình ảnh',
    'Tiêu đề & Định giá',
    'Xem trước & Xuất bản',
  ];

  // 1. Form State: Type, Category, Rental Mode & Location
  const [accommodationType, setAccommodationType] = useState('villa');
  const [rentalMode, setRentalMode] = useState('entire_place'); // 'entire_place' | 'multi_room'
  const [categoryId, setCategoryId] = useState(1);
  const [categoriesList, setCategoriesList] = useState([]);
  const [city, setCity] = useState('Đà Lạt');
  const [district, setDistrict] = useState('Phường 3');
  const [address, setAddress] = useState('12 Đường Khe Sanh, Đà Lạt');

  // 2. Multi-Room Configuration State (Chuyên sâu)
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
    },
  ]);

  // Single Entire Place Specs (dùng khi rentalMode === 'entire_place')
  const [entireRoomName, setEntireRoomName] = useState('Toàn bộ Biệt thự Nghỉ dưỡng Nguyên căn');
  const [entireMaxGuests, setEntireMaxGuests] = useState(8);
  const [entireBedrooms, setEntireBedrooms] = useState(4);
  const [entireBeds, setEntireBeds] = useState(5);
  const [entireBathrooms, setEntireBathrooms] = useState(4);
  const [entireRoomSizeM2, setEntireRoomSizeM2] = useState(250);
  const [entirePriceVND, setEntirePriceVND] = useState(4500000);
  const [entireCleaningFeeVND, setEntireCleaningFeeVND] = useState(400000);

  // 3. Amenities State
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([
    'Hồ bơi riêng',
    'WiFi tốc độ cao',
    'Bếp nấu ăn đầy đủ',
    'View thiên nhiên tuyệt đẹp',
    'Điều hòa 2 chiều',
    'Chỗ đỗ xe miễn phí',
  ]);

  // 4. Images State
  const [images, setImages] = useState(DEFAULT_SAMPLE_IMAGES);
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
  const renderAmenityIcon = (iconName) => {
    const key = (iconName || '').toLowerCase();
    if (key.includes('wifi')) return <TbWifi />;
    if (key.includes('pool') || key.includes('bơi') || key.includes('swimming')) return <TbSwimming />;
    if (key.includes('kitchen') || key.includes('bếp') || key.includes('tool')) return <TbToolsKitchen2 />;
    if (key.includes('air') || key.includes('điều hòa')) return <TbAirConditioning />;
    if (key.includes('car') || key.includes('xe') || key.includes('parking')) return <TbCar />;
    if (key.includes('bbq') || key.includes('flame') || key.includes('nướng')) return <TbFlame />;
    if (key.includes('tv') || key.includes('device')) return <TbDeviceTv />;
    if (key.includes('view') || key.includes('sparkle') || key.includes('thiên nhiên')) return <TbSparkles />;
    if (key.includes('bed') || key.includes('giường')) return <TbBed />;
    if (key.includes('bath') || key.includes('tắm')) return <TbBath />;
    return <TbCheck />;
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
            setCategoryId(filtered[0].id);
          }
        }
      } catch (e) {
        console.error('Error loading categories:', e);
      }

      try {
        const data = await apiService.getAmenities();
        const amList = data?.amenities || (Array.isArray(data) ? data : []);
        if (amList.length > 0) {
          setAmenities(amList);
        } else {
          setAmenities([
            { id: 1, name_vi: 'Hồ bơi riêng', icon: 'TbSwimming' },
            { id: 2, name_vi: 'WiFi tốc độ cao', icon: 'TbWifi' },
            { id: 3, name_vi: 'Bếp nấu ăn đầy đủ', icon: 'TbToolsKitchen2' },
            { id: 4, name_vi: 'Điều hòa 2 chiều', icon: 'TbAirConditioning' },
            { id: 5, name_vi: 'Chỗ đỗ xe miễn phí', icon: 'TbCar' },
            { id: 6, name_vi: 'Bếp nướng BBQ', icon: 'TbFlame' },
            { id: 7, name_vi: 'Smart TV 4K', icon: 'TbDeviceTv' },
            { id: 8, name_vi: 'View thiên nhiên tuyệt đẹp', icon: 'TbSparkles' },
          ]);
        }
      } catch (e) {
        console.error('Error loading amenities:', e);
      }
    };
    loadInitialData();
  }, []);

  const toggleAmenity = (name) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  // Room Management Handlers (Multi-Room)
  const handleAddRoom = () => {
    const newRoomNum = rooms.length + 1;
    const newRoom = {
      id: 'rm-' + Date.now(),
      roomNameVi: `Hạng phòng ${newRoomNum} - Tiêu chuẩn mới`,
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
    };
    setRooms([...rooms, newRoom]);
    toast.success('Đã thêm hạng phòng', 'Bạn có thể chỉnh sửa thông số cho hạng phòng vừa tạo.');
  };

  const handleUpdateRoom = (roomId, field, value) => {
    setRooms(rooms.map((r) => (r.id === roomId ? { ...r, [field]: value } : r)));
  };

  const handleRemoveRoom = (roomId) => {
    if (rooms.length <= 1) {
      toast.warning('Yêu cầu tối thiểu', 'Cơ sở lưu trú cần có ít nhất 1 hạng phòng đón khách.');
      return;
    }
    setRooms(rooms.filter((r) => r.id !== roomId));
    toast.info('Đã xóa hạng phòng', 'Đã gỡ hạng phòng khỏi danh sách.');
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
        },
      ]
    : rooms;

  const minPriceVND = Math.min(...previewRooms.map((r) => Number(r.priceVND) || 1500000));
  const maxPriceVND = Math.max(...previewRooms.map((r) => Number(r.priceVND) || 1500000));
  const totalMaxGuests = rentalMode === 'entire_place'
    ? entireMaxGuests
    : Math.max(...previewRooms.map((r) => Number(r.maxGuests) || 2));

  // Step Transition Validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!accommodationType) { toast.warning('Thiếu thông tin', 'Vui lòng chọn loại hình chỗ nghỉ.'); return false; }
        if (!address.trim()) { toast.warning('Thiếu địa chỉ', 'Vui lòng nhập địa chỉ chi tiết của chỗ ở.'); return false; }
        return true;
      case 2:
        if (rentalMode === 'entire_place') {
          if (!entirePriceVND || entirePriceVND < 50000) { toast.warning('Giá chưa hợp lệ', 'Vui lòng nhập giá niêm yết mỗi đêm (tối thiểu 50.000 ₫).'); return false; }
        } else {
          if (rooms.length === 0) { toast.warning('Thiếu hạng phòng', 'Vui lòng thêm ít nhất 1 hạng phòng.'); return false; }
          const invalidRoom = rooms.find((r) => !r.priceVND || r.priceVND < 50000);
          if (invalidRoom) { toast.warning('Giá chưa hợp lệ', `Hạng phòng "${invalidRoom.roomNameVi}" cần có giá tối thiểu 50.000 ₫/đêm.`); return false; }
          const noName = rooms.find((r) => !r.roomNameVi || !r.roomNameVi.trim());
          if (noName) { toast.warning('Thiếu tên phòng', 'Mỗi hạng phòng cần có tên hiển thị.'); return false; }
        }
        return true;
      case 3:
        return true; // amenities optional
      case 4:
        if (images.length === 0) { toast.warning('Thiếu hình ảnh', 'Vui lòng cung cấp ít nhất 1 ảnh đại diện cho chỗ nghỉ.'); return false; }
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
    if (images.length === 0) {
      toast.warning('Thiếu hình ảnh', 'Vui lòng cung cấp ít nhất 1 ảnh đại diện.');
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
        })),
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

      {/* Stepper Progress Bar */}
      <div className="wizard-stepper-strip" style={{ padding: '0.65rem 1.65rem', gap: '6px', display: 'flex' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`wizard-step-pill ${i + 1 <= currentStep ? 'active' : ''}`}
            style={{
              height: '5px',
              flex: 1,
              borderRadius: '999px',
              background: i + 1 <= currentStep ? 'var(--host-primary, #059669)' : '#e2e8f0',
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </div>

      {/* Body Content */}
      <div style={{ padding: '1.65rem' }}>
        {/* STEP 1: TYPE, RENTAL MODE, CATEGORY & LOCATION */}
        {currentStep === 1 && (
          <div>
            <h4 style={{ fontSize: '1.02rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--host-text-main)' }}>
              1. Chọn loại hình chỗ nghỉ của bạn
            </h4>
            <div className="types-selector-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {typesList.map((t) => (
                <div
                  key={t.id}
                  className={`type-select-card ${accommodationType === t.id ? 'active' : ''}`}
                  onClick={() => setAccommodationType(t.id)}
                  style={{
                    padding: '0.95rem 0.75rem',
                    borderRadius: 'var(--host-radius-md, 8px)',
                    border: accommodationType === t.id ? '2px solid var(--host-primary, #059669)' : '1.5px solid #e2e8f0',
                    background: accommodationType === t.id ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div className="type-card-icon" style={{ fontSize: '1.65rem', color: accommodationType === t.id ? 'var(--host-primary, #059669)' : '#64748b' }}>
                    {t.icon}
                  </div>
                  <div className="type-card-title" style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: '4px' }}>
                    {t.name}
                  </div>
                </div>
              ))}
            </div>

            {/* RENTAL MODE (QUAN TRỌNG) */}
            <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '1.25rem 0 0.85rem 0', color: 'var(--host-text-main)' }}>
              2. Hình thức cho thuê chỗ nghỉ
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                onClick={() => setRentalMode('entire_place')}
                style={{
                  padding: '1rem 1.15rem',
                  borderRadius: '10px',
                  border: rentalMode === 'entire_place' ? '2.5px solid var(--host-primary, #059669)' : '1.5px solid #e2e8f0',
                  background: rentalMode === 'entire_place' ? '#ecfdf5' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <TbHome style={{ fontSize: '1.3rem', color: rentalMode === 'entire_place' ? 'var(--host-primary, #059669)' : '#64748b' }} />
                  <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>Cho thuê Trọn gói Nguyên căn</strong>
                </div>
                <p style={{ fontSize: '0.79rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Khách được sử dụng toàn bộ không gian riêng tư (Thích hợp cho Biệt thự villa, Căn hộ cao cấp, Cabin, Homestay nguyên căn).
                </p>
              </div>

              <div
                onClick={() => setRentalMode('multi_room')}
                style={{
                  padding: '1rem 1.15rem',
                  borderRadius: '10px',
                  border: rentalMode === 'multi_room' ? '2.5px solid var(--host-primary, #059669)' : '1.5px solid #e2e8f0',
                  background: rentalMode === 'multi_room' ? '#ecfdf5' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <TbDoor style={{ fontSize: '1.3rem', color: rentalMode === 'multi_room' ? 'var(--host-primary, #059669)' : '#64748b' }} />
                  <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>Cơ sở nhiều Hạng phòng riêng lẻ</strong>
                </div>
                <p style={{ fontSize: '0.79rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Cơ sở có nhiều phòng với các mức giá và diện tích khác nhau để khách lựa chọn (Thích hợp cho Khách sạn, Resort, Khu phòng nghỉ).
                </p>
              </div>
            </div>

            <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '1.25rem 0 0.85rem 0', color: 'var(--host-text-main)' }}>
              3. Danh mục phong cách trải nghiệm (Hiển thị trên CategoryBar Trang Chủ)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {categoriesList.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  style={{
                    padding: '0.7rem 0.9rem',
                    borderRadius: '8px',
                    border: categoryId === cat.id ? '2px solid var(--host-primary, #059669)' : '1.5px solid #e2e8f0',
                    background: categoryId === cat.id ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <TbSparkles style={{ color: categoryId === cat.id ? 'var(--host-primary, #059669)' : '#94a3b8' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: categoryId === cat.id ? 700 : 500 }}>
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
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* MODE B: CƠ SỞ NHIỀU HẠNG PHÒNG (MULTI-ROOM) */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, color: 'var(--host-text-main)' }}>
                      Danh sách các Hạng phòng trong cơ sở
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--host-text-muted)', margin: '3px 0 0 0' }}>
                      Thêm và thiết lập giá cho từng hạng phòng (VD: Phòng Deluxe, Phòng Suite, Penthouse...).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRoom}
                    className="host-btn-primary"
                    style={{ padding: '0.48rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <TbPlus /> Thêm hạng phòng mới
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {rooms.map((room, idx) => (
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
                            onClick={() => handleRemoveRoom(room.id)}
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

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.65rem', marginBottom: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>
                            Khách tối đa
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={room.maxGuests}
                            onChange={(e) => handleUpdateRoom(room.id, 'maxGuests', Number(e.target.value))}
                            style={{ width: '100%', padding: '0.42rem', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700, boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>
                            Phòng ngủ
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={room.bedrooms}
                            onChange={(e) => handleUpdateRoom(room.id, 'bedrooms', Number(e.target.value))}
                            style={{ width: '100%', padding: '0.42rem', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700, boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>
                            Số giường
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={room.beds}
                            onChange={(e) => handleUpdateRoom(room.id, 'beds', Number(e.target.value))}
                            style={{ width: '100%', padding: '0.42rem', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700, boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>
                            Phòng tắm
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={room.bathrooms}
                            onChange={(e) => handleUpdateRoom(room.id, 'bathrooms', Number(e.target.value))}
                            style={{ width: '100%', padding: '0.42rem', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700, boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>
                            Diện tích (m²)
                          </label>
                          <input
                            type="number"
                            value={room.roomSizeM2}
                            onChange={(e) => handleUpdateRoom(room.id, 'roomSizeM2', Number(e.target.value))}
                            style={{ width: '100%', padding: '0.42rem', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700, boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                            Giá niêm yết mỗi đêm (VND) *
                          </label>
                          <input
                            type="number"
                            step="50000"
                            value={room.priceVND}
                            onChange={(e) => handleUpdateRoom(room.id, 'priceVND', Number(e.target.value))}
                            style={{ width: '100%', padding: '0.48rem 0.75rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, color: '#059669', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                            Phí vệ sinh phòng (VND)
                          </label>
                          <input
                            type="number"
                            step="50000"
                            value={room.cleaningFeeVND}
                            onChange={(e) => handleUpdateRoom(room.id, 'cleaningFeeVND', Number(e.target.value))}
                            style={{ width: '100%', padding: '0.48rem 0.75rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600, boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      {/* Loại không gian phòng */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                            Loại không gian phòng
                          </label>
                          <select
                            value={room.spaceType || 'private_room'}
                            onChange={(e) => handleUpdateRoom(room.id, 'spaceType', e.target.value)}
                            style={{ width: '100%', padding: '0.48rem 0.75rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', fontWeight: 600, background: '#fff', boxSizing: 'border-box' }}
                          >
                            <option value="private_room">Phòng riêng (Private Room)</option>
                            <option value="shared_room">Phòng chung (Shared Room)</option>
                            <option value="entire_place">Nguyên căn (Entire Place)</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 600, lineHeight: 1.4 }}>
                            Giá: {formatPrice(room.priceVND)}/đêm
                          </span>
                        </div>
                      </div>

                      {/* Mô tả hạng phòng */}
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                          Mô tả hạng phòng
                        </label>
                        <textarea
                          rows={2}
                          value={room.description || ''}
                          onChange={(e) => handleUpdateRoom(room.id, 'description', e.target.value)}
                          placeholder="Mô tả ngắn gọn về hạng phòng (nội thất, tầm nhìn, tiện nghi đặc biệt...)"
                          style={{ width: '100%', padding: '0.48rem 0.75rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: AMENITIES */}
        {currentStep === 3 && (
          <div>
            <h4 style={{ fontSize: '1.02rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--host-text-main)' }}>
              Tiện ích nổi bật tại chỗ ở
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--host-text-muted)', marginBottom: '1.25rem' }}>
              Những tiện nghi đặc biệt sẽ giúp chỗ ở của bạn nổi bật và thu hút nhiều lượt đặt phòng hơn.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {amenities.map((a) => {
                const name = a.name_vi || a.name;
                const isChecked = selectedAmenities.includes(name);
                return (
                  <div
                    key={a.id || name}
                    onClick={() => toggleAmenity(name)}
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '8px',
                      border: isChecked ? '2px solid var(--host-primary, #059669)' : '1.5px solid #e2e8f0',
                      background: isChecked ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.3rem', color: isChecked ? 'var(--host-primary, #059669)' : '#94a3b8', display: 'flex', alignItems: 'center' }}>
                      {renderAmenityIcon(a.icon || name)}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#065f46' : '#1e293b' }}>
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: PHOTOS */}
        {currentStep === 4 && (
          <div>
            <h4 style={{ fontSize: '1.02rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--host-text-main)' }}>
              Bộ sưu tập hình ảnh cơ sở & phòng nghỉ
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--host-text-muted)', marginBottom: '1.25rem' }}>
              Hình ảnh chất lượng cao là yếu tố quyết định hàng đầu của du khách. Bạn có thể tải ảnh từ thiết bị hoặc dán link ảnh trực tiếp.
            </p>

            {/* Upload Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.25rem', alignItems: 'center' }}>
              {/* Device Upload */}
              <div>
                <input
                  type="file"
                  id="wizard-upload-input"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  style={{ display: 'none' }}
                  onChange={handleAddImageFromDevice}
                />
                <label
                  htmlFor="wizard-upload-input"
                  className="host-btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 1.15rem',
                    fontSize: '0.86rem',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    opacity: isUploading ? 0.7 : 1,
                  }}
                >
                  {isUploading ? <TbLoader className="spin" /> : <TbUpload />}
                  {isUploading ? 'Đang tải lên server...' : 'Tải ảnh từ thiết bị'}
                </label>
              </div>

              {/* URL Input Form */}
              <form onSubmit={handleAddImageUrl} style={{ display: 'flex', gap: '6px', flex: 1, minWidth: '280px' }}>
                <input
                  type="url"
                  placeholder="Hoặc dán link ảnh trực tiếp (http/https)..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.58rem 0.85rem',
                    borderRadius: 'var(--host-radius-md, 8px)',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  className="host-btn-client"
                  style={{ padding: '0.58rem 1rem', fontSize: '0.84rem' }}
                >
                  <TbPlus /> Thêm link
                </button>
              </form>
            </div>

            {/* Images Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    height: '120px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: idx === 0 ? '2.5px solid var(--host-primary, #059669)' : '1px solid #e2e8f0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <img
                    src={img}
                    alt={`Chỗ ở ${idx}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800';
                    }}
                  />
                  {idx === 0 ? (
                    <span
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        background: 'var(--host-primary, #059669)',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      Ảnh bìa
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCoverImage(idx)}
                      title="Đặt làm ảnh bìa"
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        padding: '2px 6px',
                        cursor: 'pointer',
                      }}
                    >
                      Đặt ảnh bìa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      background: 'rgba(0,0,0,0.65)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Xóa ảnh này"
                  >
                    <TbX style={{ fontSize: '0.85rem' }} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
              * Tổng cộng: <strong>{images.length}</strong> ảnh. Ảnh đầu tiên sẽ hiển thị làm thẻ đại diện trên Trang Chủ.
            </div>
          </div>
        )}

        {/* STEP 5: TITLE, DESCRIPTION & POLICIES */}
        {currentStep === 5 && (
          <div>
            <h4 style={{ fontSize: '1.02rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--host-text-main)' }}>
              1. Tiêu đề cơ sở & mô tả không gian
            </h4>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)', display: 'block', marginBottom: '5px' }}>
                Tên cơ sở lưu trú nổi bật *
              </label>
              <input
                type="text"
                value={nameVi}
                onChange={(e) => setNameVi(e.target.value)}
                placeholder="Ví dụ: The Sunset Valley Luxury Villa & Resort Đà Lạt..."
                style={{
                  width: '100%',
                  padding: '0.58rem 0.85rem',
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
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)', display: 'block', marginBottom: '5px' }}>
                Mô tả tổng quan về trải nghiệm lưu trú *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả vẻ đẹp, cảnh quan thiên nhiên và trải nghiệm nghỉ dưỡng..."
                style={{
                  width: '100%',
                  padding: '0.58rem 0.85rem',
                  borderRadius: 'var(--host-radius-md, 8px)',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
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
                  rows={2}
                  value={houseRules}
                  onChange={(e) => setHouseRules(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)', display: 'block', marginBottom: '5px' }}>
                  Chính sách hủy phòng
                </label>
                <textarea
                  rows={2}
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Pricing for entire_place đã được chuyển về Bước 2 */}
          </div>
        )}

        {/* STEP 6: PREVIEW & PUBLISH */}
        {currentStep === 6 && (
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.3rem', color: 'var(--host-text-main)' }}>
              Xem trước hiển thị trên Trang Chủ & Trang Chi Tiết
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--host-text-muted)', marginBottom: '1.25rem' }}>
              Đây là cách cơ sở lưu trú và các hạng phòng của bạn sẽ hiển thị với du khách trên TripNest.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: previewRooms.length > 1 ? '340px 1fr' : '1fr', gap: '1.5rem', maxWidth: '820px', margin: '0 auto', textAlign: 'left' }}>
              {/* Left: Card on Homepage */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                  1. Hiển thị Thẻ Trang Chủ (Listing Card)
                </div>
                <div
                  className="live-preview-box"
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>
                        {city} · {accommodationType.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <TbStarFilled style={{ color: '#ff385c', fontSize: '0.85rem' }} /> 5.00 <span style={{ color: '#64748b', fontWeight: 500 }}>(Mới)</span>
                      </span>
                    </div>

                    <h4 className="live-preview-title" style={{ fontSize: '0.96rem', fontWeight: 700, margin: '3px 0 6px 0', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                      <span
                        style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Sẵn sàng đón khách
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Matrix of rooms in AccommodationDetailPage */}
              {previewRooms.length > 1 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                    2. Bảng Hạng phòng trong Trang Chi Tiết (Ma trận phòng)
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
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>
                            {rm.roomNameVi}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {rm.maxGuests} khách · {rm.bedrooms} PN · {rm.beds} giường · {rm.bathrooms} WC · {rm.roomSizeM2} m²
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--host-primary, #059669)', display: 'block' }}>
                            {formatPrice(rm.priceVND)}
                          </strong>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>/ đêm</span>
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
      <div className="wizard-footer-actions" style={{ padding: '1rem 1.65rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              background: 'var(--host-primary, #059669)',
              cursor: isPublishing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isPublishing ? (
              <>
                <TbLoader className="spin" /> Đang lưu & xuất bản...
              </>
            ) : (
              <>
                <TbCheck style={{ fontSize: '1.1rem' }} /> HOÀN TẤT & ĐĂNG BÁN
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default HostListingWizardPage;
