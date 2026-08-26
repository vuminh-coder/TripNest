import React, { useState, useEffect, useMemo } from 'react';
import './AccommodationDetailPage.css';
import {
  TbStarFilled,
  TbHeart,
  TbHeartFilled,
  TbShare,
  TbMapPin,
  TbShieldCheck,
  TbCalendar,
  TbUsers,
  TbCheck,
  TbChevronLeft,
  TbChevronRight,
  TbX,
  TbArrowLeft,
  TbWifi,
  TbToolsKitchen2,
  TbSwimming,
  TbFlame,
  TbCar,
  TbAirConditioning,
  TbWashMachine,
  TbPaw,
  TbDeviceLaptop,
  TbBath,
  TbBeach,
  TbSparkles,
  TbBed,
  TbArrowsMaximize,
  TbCoffee,
  TbEye,
  TbClock,
  TbCreditCard,
  TbCircleCheck,
  TbSmokingNo,
  TbVolumeOff,
  TbChevronDown,
  TbInfoCircle,
  TbAward,
  TbHome,
  TbBuildingSkyscraper,
  TbSailboat,
} from 'react-icons/tb';
import { ListingCard } from '@/components/common/ListingCard/ListingCard';

const amenityIcons = {
  'Wifi': <TbWifi />,
  'Bếp': <TbToolsKitchen2 />,
  'Hồ bơi': <TbSwimming />,
  'Bể bơi': <TbSwimming />,
  'Lò sưởi': <TbFlame />,
  'BBQ': <TbFlame />,
  'Chỗ đỗ xe': <TbCar />,
  'Điều hòa': <TbAirConditioning />,
  'Máy giặt': <TbWashMachine />,
  'thú cưng': <TbPaw />,
  'làm việc': <TbDeviceLaptop />,
  'Bồn tắm': <TbBath />,
  'Jacuzzi': <TbBath />,
  'Bãi biển': <TbBeach />,
};

export const AccommodationDetailPage = ({
  accommodation,
  allAccommodations = [],
  searchParams = {},
  onBack,
  onSelectAccommodation,
  onOpenRoomDetail,
  currency = 'VND',
  isFavorite = false,
  onToggleFavorite,
  onStartCheckout,
}) => {
  // Today and default dates
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);
  const defaultOutStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  }, []);

  const [checkIn, setCheckIn] = useState(searchParams.checkInDate || tomorrowStr);
  const [checkOut, setCheckOut] = useState(searchParams.checkOutDate || defaultOutStr);
  const [guestCount, setGuestCount] = useState(Number(searchParams.guests) || 2);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // Multi-room selection state: { [roomId]: quantity }
  const [selectedRoomsCount, setSelectedRoomsCount] = useState({});

  // Lightbox modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Scroll to top when accommodation changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedRoomsCount({});
  }, [accommodation?.id]);

  // Calculate nights
  const nightsCount = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  // Format Price helper
  const formatPrice = (priceVND, nights = 1) => {
    const total = Number(priceVND) * nights;
    if (currency === 'USD') {
      return `$${Math.round(total / 25450).toLocaleString()}`;
    }
    if (currency === 'EUR') {
      return `€${Math.round((total / 25450) * 0.92).toLocaleString()}`;
    }
    return `${total.toLocaleString()} ₫`;
  };

  const images = Array.isArray(accommodation?.images) && accommodation.images.length > 0
    ? accommodation.images
    : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200'];

  const roomsList = Array.isArray(accommodation?.rooms) && accommodation.rooms.length > 0
    ? accommodation.rooms
    : [
        {
          id: accommodation?.id || 1,
          accommodationId: accommodation?.id,
          title: (accommodation?.nameVi || accommodation?.title) + ' - Không gian nghỉ dưỡng',
          roomNameVi: (accommodation?.nameVi || accommodation?.title) + ' - Không gian nghỉ dưỡng',
          pricePerNight: accommodation?.priceVND || accommodation?.priceFrom || 2250000,
          priceVND: accommodation?.priceVND || accommodation?.priceFrom || 2250000,
          priceUSD: Math.round((accommodation?.priceVND || 2250000) / 25450),
          maxGuests: 2,
          bedroomsCount: 1,
          bedsCount: 1,
          bathroomsCount: 1,
          roomSizeM2: 38,
          rating: accommodation?.rating || 4.98,
          reviewsCount: 168,
          images: images,
          amenities: ['Wifi tốc độ cao', 'Điều hòa 2 chiều', 'Chỗ đỗ xe', 'Bồn tắm Jacuzzi', 'Ban công view đồi'],
          description: 'Không gian tinh tế đầy đủ tiện nghi cao cấp tiêu chuẩn quốc tế.',
        },
      ];

  // Distinguish between Entire Place (Villa / Homestay / Cabin / Penthouse) vs Multi-room Resort / Hotel
  const isEntirePlace = useMemo(() => {
    const type = accommodation?.accommodationType?.toLowerCase() || '';
    if (type === 'villa' || type === 'homestay' || type === 'cabin' || type === 'apartment') {
      return true;
    }
    if (roomsList.length === 1 && (roomsList[0].spaceType === 'entire_place' || accommodation?.spaceType === 'entire_place')) {
      return true;
    }
    return false;
  }, [accommodation, roomsList]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const scrollToSection = (sectionId, tabKey) => {
    setActiveTab(tabKey);
    const el = document.getElementById(sectionId);
    if (el) {
      const offset = 85;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Handle single room instant booking
  const handleInstantBook = (roomItem) => {
    if (onStartCheckout) {
      onStartCheckout({
        room: roomItem,
        accommodation: accommodation,
        bookingParams: {
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests: guestCount,
          nights: nightsCount,
          totalPrice: (roomItem.priceVND || roomItem.pricePerNight || 2250000) * nightsCount,
        },
      });
    }
  };

  // Handle entire place direct booking
  const handleEntirePlaceBooking = () => {
    const targetRoom = roomsList[0];
    handleInstantBook(targetRoom);
  };

  // Handle room quantity selection
  const handleRoomCountChange = (roomId, count) => {
    setSelectedRoomsCount((prev) => {
      const updated = { ...prev };
      if (count <= 0) {
        delete updated[roomId];
      } else {
        updated[roomId] = count;
      }
      return updated;
    });
  };

  // Calculate total selected rooms & price
  const totalSelectedRooms = useMemo(() => {
    return Object.values(selectedRoomsCount).reduce((sum, count) => sum + count, 0);
  }, [selectedRoomsCount]);

  const totalSelectedPrice = useMemo(() => {
    return Object.entries(selectedRoomsCount).reduce((sum, [rId, count]) => {
      const found = roomsList.find((r) => String(r.id) === String(rId));
      const price = found?.priceVND || found?.pricePerNight || 2250000;
      return sum + price * nightsCount * count;
    }, 0);
  }, [selectedRoomsCount, roomsList, nightsCount]);

  // Proceed checkout for selected rooms
  const handleProceedMultiRoomCheckout = () => {
    const selectedEntries = Object.entries(selectedRoomsCount);
    if (selectedEntries.length === 0) {
      scrollToSection('tn-rooms-matrix-section', 'rooms');
      return;
    }
    const [firstRoomId] = selectedEntries[0];
    const selectedRoomObj = roomsList.find((r) => String(r.id) === String(firstRoomId)) || roomsList[0];

    if (onStartCheckout) {
      onStartCheckout({
        room: selectedRoomObj,
        accommodation: accommodation,
        bookingParams: {
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests: guestCount,
          nights: nightsCount,
          roomsCount: totalSelectedRooms,
          selectedRoomsDetail: selectedRoomsCount,
          totalPrice: totalSelectedPrice,
        },
      });
    }
  };

  if (!accommodation) {
    return (
      <div className="tn-empty-state-wrap">
        <h2>Không tìm thấy thông tin cơ sở lưu trú</h2>
        <button type="button" className="primary-gradient-btn" onClick={onBack} style={{ marginTop: '1.5rem' }}>
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const rating5 = accommodation.rating ? Number(accommodation.rating).toFixed(2) : '4.98';
  const reviewsCount = accommodation.reviewsCount || 364;

  const reviewBreakdown = accommodation.reviewScoresBreakdown || {
    cleanliness: 9.8,
    facilities: 9.6,
    location: 9.9,
    comfort: 9.7,
    staff: 9.8,
    value: 9.5,
  };

  const reviewsList = accommodation.reviewsList || [
    {
      id: 1,
      userName: 'Nguyễn Thu Trang',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      nationality: 'Hà Nội, Việt Nam',
      roomName: roomsList[0]?.title || 'Không gian nghỉ dưỡng',
      rating: 5.0,
      score10: 9.8,
      stayDuration: '3 đêm · Kỳ nghỉ lãng mạn',
      comment: `Kỳ nghỉ trên cả tuyệt vời tại ${accommodation.nameVi || accommodation.title}! Không gian sân vườn yên tĩnh, bữa sáng phong phú và giường ngủ êm ái tuyệt đối.`,
      positivePoint: 'Hồ bơi nước ấm ngắm cảnh cực chill, nhân viên lễ tân hỗ trợ nhiệt tình 24/7.',
      createdAt: '25/08/2026',
      hostResponse: 'Cảm ơn quý khách đã dành thời gian đánh giá và ủng hộ cơ sở. Hân hạnh phục vụ bạn lần sau!',
    },
    {
      id: 2,
      userName: 'Trần Minh Đức',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      nationality: 'TP. Hồ Chí Minh, Việt Nam',
      roomName: roomsList[1]?.title || roomsList[0]?.title || 'Phòng Cao Cấp',
      rating: 4.9,
      score10: 9.5,
      stayDuration: '2 đêm · Chuyến công tác',
      comment: 'Dịch vụ chuẩn quốc tế 5 sao. Wifi tốc độ cao làm việc mượt mà, phòng tắm bồn Jacuzzi ngâm mình rất thư giãn.',
      positivePoint: 'Vị trí đắc địa dễ dàng di chuyển vào trung tâm và các điểm tham quan.',
      createdAt: '20/08/2026',
      hostResponse: 'TripNest rất vui vì mang lại trải nghiệm tiện nghi và thư thái cho anh Đức!',
    },
  ];

  const surroundings = accommodation.surroundings || [
    { name: `Trung tâm thành phố ${accommodation.city}`, distance: '1.5 km', type: 'center' },
    { name: `Khu ẩm thực & Chợ đêm ${accommodation.city}`, distance: '800 m', type: 'food' },
    { name: 'Điểm ngắm cảnh / Bờ biển / Hồ trung tâm', distance: '350 m', type: 'nature' },
    { name: 'Sân bay / Ga xe buýt liên tỉnh', distance: '25 km', type: 'transport' },
  ];

  // Pick exactly 3 representative accommodations in same city/area
  const similarAccommodations = useMemo(() => {
    if (!allAccommodations || allAccommodations.length === 0) return [];

    const sameCityList = allAccommodations.filter(
      (a) =>
        String(a.id) !== String(accommodation.id) &&
        a.city?.toLowerCase().trim() === accommodation.city?.toLowerCase().trim()
    );

    sameCityList.sort((a, b) => (b.rating || 5) - (a.rating || 5));

    if (sameCityList.length >= 3) {
      return sameCityList.slice(0, 3);
    }

    const needed = 3 - sameCityList.length;
    const fallbackList = allAccommodations.filter(
      (a) =>
        String(a.id) !== String(accommodation.id) &&
        a.city?.toLowerCase().trim() !== accommodation.city?.toLowerCase().trim()
    );

    return [...sameCityList, ...fallbackList.slice(0, needed)];
  }, [allAccommodations, accommodation]);

  const entirePlaceSpecs = useMemo(() => {
    const primaryRoom = roomsList[0];
    return {
      guests: primaryRoom?.maxGuests || 8,
      bedrooms: primaryRoom?.bedroomsCount || 4,
      beds: primaryRoom?.bedsCount || 5,
      bathrooms: primaryRoom?.bathroomsCount || 4,
      size: primaryRoom?.roomSizeM2 || 250,
      pricePerNight: primaryRoom?.priceVND || primaryRoom?.pricePerNight || accommodation.priceVND || 7800000,
    };
  }, [roomsList, accommodation]);

  return (
    <div className="tn-accommodation-page">
      {/* 1. TOP BREADCRUMBS & ACTIONS BAR */}
      <div className="tn-breadcrumbs-bar">
        <div className="tn-breadcrumbs-nav">
          <button type="button" className="tn-bc-link" onClick={onBack}>
            Trang chủ
          </button>
          <span className="tn-bc-sep">/</span>
          <button type="button" className="tn-bc-link" onClick={onBack}>
            Việt Nam
          </button>
          <span className="tn-bc-sep">/</span>
          <button type="button" className="tn-bc-link" onClick={onBack}>
            {accommodation.city}
          </button>
          <span className="tn-bc-sep">/</span>
          <span className="tn-bc-current">{accommodation.nameVi || accommodation.title}</span>
        </div>

        <div className="tn-top-actions-group">
          <button type="button" className="tn-action-btn" onClick={handleShare}>
            <TbShare />
            <span>{copiedLink ? 'Đã sao chép liên kết!' : 'Chia sẻ'}</span>
          </button>
          <button
            type="button"
            className={`tn-action-btn ${isFavorite ? 'active-fav' : ''}`}
            onClick={() => onToggleFavorite && onToggleFavorite(accommodation.id)}
          >
            {isFavorite ? <TbHeartFilled style={{ color: '#ff385c' }} /> : <TbHeart />}
            <span>{isFavorite ? 'Đã lưu' : 'Lưu'}</span>
          </button>
          <button
            type="button"
            className="primary-gradient-btn tn-top-reserve-btn"
            onClick={() => isEntirePlace ? handleEntirePlaceBooking() : scrollToSection('tn-rooms-matrix-section', 'rooms')}
          >
            {isEntirePlace ? 'Đặt trọn căn ngay' : 'Đặt phòng ngay'}
          </button>
        </div>
      </div>

      {/* 2. PROPERTY IDENTITY & HIGHLIGHTS HEADER */}
      <div className="tn-property-header">
        <div className="tn-property-badges-row">
          <span className="tn-type-badge">
            {accommodation.accommodationType === 'resort'
              ? 'Khu nghỉ dưỡng 5 sao'
              : accommodation.accommodationType === 'hotel'
              ? 'Khách sạn cao cấp'
              : accommodation.accommodationType === 'villa'
              ? 'Biệt thự riêng tư'
              : accommodation.accommodationType === 'homestay'
              ? 'Homestay nguyên căn'
              : accommodation.accommodationType === 'cabin'
              ? 'Cabin nguyên căn'
              : accommodation.accommodationType === 'yacht'
              ? 'Du thuyền 5 sao'
              : 'Cơ sở lưu trú cao cấp'}
          </span>

          <span className="tn-star-rating-chip">
            {[...Array(accommodation.starRating || 5)].map((_, i) => (
              <TbStarFilled key={i} className="tn-star-gold" />
            ))}
          </span>

          <span className="tn-guest-favorite-chip">
            <TbAward /> Khách yêu thích 2026
          </span>

          <span className="tn-instant-chip">
            <TbCircleCheck /> Xác nhận tức thì
          </span>
        </div>

        <h1 className="tn-property-title">{accommodation.nameVi || accommodation.title}</h1>

        <div className="tn-location-score-subbar">
          <div className="tn-address-text">
            <TbMapPin className="tn-pin-icon" />
            <span>{accommodation.address || `${accommodation.city}, Việt Nam`}</span>
            <button
              type="button"
              className="tn-view-map-btn"
              onClick={() => scrollToSection('tn-location-section', 'location')}
            >
              — Xem bản đồ vị trí
            </button>
          </div>

          <div
            className="tn-rating-summary-pill"
            onClick={() => scrollToSection('tn-reviews-section', 'reviews')}
          >
            <div className="tn-rating-score-box">
              <TbStarFilled style={{ color: '#ff385c', fontSize: '1rem' }} />
              <strong>{rating5}</strong>
            </div>
            <div className="tn-rating-text-box">
              <span className="tn-rating-label">Xuất sắc</span>
              <span className="tn-rating-count">({reviewsCount} đánh giá)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HERO 5-PHOTO LUXURY GALLERY GRID */}
      <div className="tn-hero-gallery-wrapper">
        <div
          className="tn-gallery-main"
          onClick={() => { setActiveLightboxIndex(0); setIsLightboxOpen(true); }}
        >
          <img src={images[0]} alt={accommodation.title} className="tn-gallery-img-main" />
          <div className="tn-gallery-overlay">
            <TbEye /> Nhấp để phóng to toàn màn hình
          </div>
        </div>

        <div className="tn-gallery-sub-grid">
          {images.slice(1, 5).map((imgUrl, idx) => (
            <div
              key={idx}
              className="tn-gallery-sub-item"
              onClick={() => { setActiveLightboxIndex(idx + 1); setIsLightboxOpen(true); }}
            >
              <img src={imgUrl} alt={`${accommodation.title} ${idx + 2}`} className="tn-gallery-img-sub" />
              <div className="tn-gallery-overlay">
                <TbEye />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="tn-all-photos-badge-btn"
          onClick={() => { setActiveLightboxIndex(0); setIsLightboxOpen(true); }}
        >
          <TbEye /> Xem tất cả {images.length} ảnh
        </button>
      </div>

      {/* 4. STICKY SUB-NAVIGATION TABS BAR */}
      <div className="tn-sticky-nav-bar">
        <div className="tn-tabs-container">
          <button
            type="button"
            className={`tn-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => scrollToSection('tn-overview-section', 'overview')}
          >
            Tổng quan
          </button>
          <button
            type="button"
            className={`tn-tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => scrollToSection('tn-rooms-matrix-section', 'rooms')}
          >
            {isEntirePlace ? 'Chi tiết căn & Giá' : 'Hạng phòng & Giá'} <span className="tn-tab-badge">{roomsList.length}</span>
          </button>
          <button
            type="button"
            className={`tn-tab-btn ${activeTab === 'amenities' ? 'active' : ''}`}
            onClick={() => scrollToSection('tn-amenities-section', 'amenities')}
          >
            Tiện nghi & Dịch vụ
          </button>
          <button
            type="button"
            className={`tn-tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => scrollToSection('tn-rules-section', 'rules')}
          >
            Quy định lưu trú
          </button>
          <button
            type="button"
            className={`tn-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => scrollToSection('tn-reviews-section', 'reviews')}
          >
            Đánh giá ({reviewsCount})
          </button>
          <button
            type="button"
            className={`tn-tab-btn ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => scrollToSection('tn-location-section', 'location')}
          >
            Vị trí
          </button>
        </div>

        <div className="tn-tabs-cta-box">
          <div className="tn-tabs-price-info">
            <span className="tn-tabs-price-prefix">{isEntirePlace ? 'Trọn căn' : 'Từ'}</span>
            <strong className="tn-tabs-price-val">{formatPrice(accommodation.priceFrom || accommodation.priceVND || 2250000, 1)}</strong>
            <span className="tn-tabs-price-unit">/ đêm</span>
          </div>
          <button
            type="button"
            className="primary-gradient-btn tn-tabs-book-btn"
            onClick={() => isEntirePlace ? handleEntirePlaceBooking() : scrollToSection('tn-rooms-matrix-section', 'rooms')}
          >
            {isEntirePlace ? 'Đặt trọn căn' : 'Chọn phòng'}
          </button>
        </div>
      </div>

      {/* 5. OVERVIEW & AVAILABILITY SEARCH CARD */}
      <div id="tn-overview-section" className="tn-section-block">
        {/* Key Highlights Chips - Balanced 3x2 Grid */}
        <div className="tn-highlights-grid-wrap">
          <div className="tn-highlight-chip">
            <TbCoffee /> Bữa sáng buffet cao cấp
          </div>
          <div className="tn-highlight-chip">
            <TbSwimming /> Hồ bơi nước ấm vô cực
          </div>
          <div className="tn-highlight-chip">
            <TbMapPin /> Vị trí đắc địa (Điểm 9.8)
          </div>
          <div className="tn-highlight-chip">
            <TbWifi /> Wifi 150 Mbps miễn phí
          </div>
          <div className="tn-highlight-chip">
            <TbCar /> Bãi đỗ xe an toàn
          </div>
          <div className="tn-highlight-chip">
            <TbShieldCheck /> Lễ tân phục vụ 24/7
          </div>
        </div>

        {/* Availability Selector Card */}
        <div className="tn-availability-search-card">
          <div className="tn-search-card-header">
            <div className="tn-search-header-title">
              <TbCalendar className="tn-search-header-icon" />
              <div>
                <h3>Kiểm tra tình trạng phòng & giá theo ngày</h3>
                <p>Chọn ngày lưu trú để hệ thống tự động cập nhật bảng giá chính xác nhất</p>
              </div>
            </div>
            <div className="tn-search-nights-pill">
              {nightsCount} đêm nghỉ dưỡng
            </div>
          </div>

          <div className="tn-search-inputs-grid">
            <div className="tn-search-field">
              <label>NHẬN PHÒNG</label>
              <input
                type="date"
                value={checkIn}
                min={todayStr}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div className="tn-search-field">
              <label>TRẢ PHÒNG</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || todayStr}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>

            <div className="tn-search-field">
              <label>SỐ LƯỢNG KHÁCH</label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
              >
                <option value={1}>1 khách</option>
                <option value={2}>2 khách</option>
                <option value={3}>3 khách</option>
                <option value={4}>4 khách</option>
                <option value={6}>6+ khách (Đoàn / Gia đình)</option>
              </select>
            </div>

            <button
              type="button"
              className="primary-gradient-btn tn-search-execute-btn"
              onClick={() => scrollToSection('tn-rooms-matrix-section', 'rooms')}
            >
              {isEntirePlace ? `Kiểm tra (${nightsCount} đêm)` : `Xem phòng (${nightsCount} đêm)`}
            </button>
          </div>
        </div>

        {/* Overview Story & Host Info */}
        <div className="tn-overview-two-col">
          <div className="tn-overview-text-col">
            <h3 className="tn-sub-heading">Không gian nghỉ dưỡng tại {accommodation.nameVi || accommodation.title}</h3>
            
            {/* Metric Strip for Entire Place */}
            {isEntirePlace && (
              <div className="tn-entire-place-metrics-strip">
                <span className="tn-ep-metric"><TbUsers /> {entirePlaceSpecs.guests} khách</span>
                <span className="tn-ep-dot">·</span>
                <span className="tn-ep-metric"><TbBed /> {entirePlaceSpecs.bedrooms} phòng ngủ</span>
                <span className="tn-ep-dot">·</span>
                <span className="tn-ep-metric"><TbBed /> {entirePlaceSpecs.beds} giường</span>
                <span className="tn-ep-dot">·</span>
                <span className="tn-ep-metric"><TbBath /> {entirePlaceSpecs.bathrooms} phòng tắm</span>
                <span className="tn-ep-dot">·</span>
                <span className="tn-ep-metric"><TbArrowsMaximize /> {entirePlaceSpecs.size} m²</span>
              </div>
            )}

            <p className={`tn-description-body ${isDescriptionExpanded ? 'expanded' : ''}`}>
              {accommodation.description}
            </p>
            {accommodation.description?.length > 260 && (
              <button
                type="button"
                className="tn-expand-desc-btn"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                {isDescriptionExpanded ? 'Thu gọn bớt' : 'Đọc toàn bộ giới thiệu >'}
              </button>
            )}

            <div className="tn-host-profile-box">
              <img
                src={accommodation.host?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={accommodation.host?.displayName || 'Host'}
                className="tn-host-avatar"
              />
              <div className="tn-host-details">
                <h4>Quản lý bởi đối tác {accommodation.host?.displayName || 'Chủ nhà TripNest'}</h4>
                <p>
                  Chủ nhà Siêu cấp Superhost · Tỷ lệ phản hồi 100% · Phản hồi trong vòng 1 giờ
                </p>
              </div>
            </div>
          </div>

          <div className="tn-radar-rating-card">
            <div className="tn-radar-top-row">
              <div className="tn-radar-score-pill">
                <TbStarFilled /> {rating5}
              </div>
              <div className="tn-radar-title-box">
                <h4>Đánh giá từ khách lưu trú</h4>
                <p>Dựa trên {reviewsCount} đánh giá đã xác thực</p>
              </div>
            </div>

            <div className="tn-radar-bars-list">
              <div className="tn-radar-bar-item">
                <span>Mức độ sạch sẽ</span>
                <div className="tn-bar-track">
                  <div className="tn-bar-fill" style={{ width: `${(reviewBreakdown.cleanliness / 10) * 100}%` }}></div>
                </div>
                <strong>{reviewBreakdown.cleanliness}</strong>
              </div>
              <div className="tn-radar-bar-item">
                <span>Vị trí đắc địa</span>
                <div className="tn-bar-track">
                  <div className="tn-bar-fill" style={{ width: `${(reviewBreakdown.location / 10) * 100}%` }}></div>
                </div>
                <strong>{reviewBreakdown.location}</strong>
              </div>
              <div className="tn-radar-bar-item">
                <span>Tiện nghi & Dịch vụ</span>
                <div className="tn-bar-track">
                  <div className="tn-bar-fill" style={{ width: `${(reviewBreakdown.facilities / 10) * 100}%` }}></div>
                </div>
                <strong>{reviewBreakdown.facilities}</strong>
              </div>
              <div className="tn-radar-bar-item">
                <span>Sự thoải mái</span>
                <div className="tn-bar-track">
                  <div className="tn-bar-fill" style={{ width: `${(reviewBreakdown.comfort / 10) * 100}%` }}></div>
                </div>
                <strong>{reviewBreakdown.comfort}</strong>
              </div>
              <div className="tn-radar-bar-item">
                <span>Nhân viên phục vụ</span>
                <div className="tn-bar-track">
                  <div className="tn-bar-fill" style={{ width: `${(reviewBreakdown.staff / 10) * 100}%` }}></div>
                </div>
                <strong>{reviewBreakdown.staff}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. ROOM SELECTION MATRIX / ENTIRE PLACE DIRECT BOOKING */}
      <div id="tn-rooms-matrix-section" className="tn-section-block">
        <div className="tn-matrix-header-bar">
          <div>
            <h2 className="tn-section-main-heading">
              {isEntirePlace ? 'Thông Tin Chi Tiết Căn & Đặt Trọn Gói' : 'Danh Sách Hạng Phòng & Biệt Thự Có Sẵn'}
            </h2>
            <p className="tn-matrix-subtitle">
              Giá phòng tính cho <strong>{nightsCount} đêm</strong> (từ <strong>{checkIn}</strong> đến <strong>{checkOut}</strong>) cho <strong>{guestCount} khách</strong>
            </p>
          </div>

          <div className="tn-currency-badge">
            Hiển thị bằng <strong>{currency}</strong> · Đã bao gồm thuế GTGT & phí dịch vụ
          </div>
        </div>

        {/* Room Cards List */}
        <div className="tn-room-cards-matrix">
          {roomsList.map((roomItem, rIdx) => {
            const rImages = Array.isArray(roomItem.images) && roomItem.images.length > 0
              ? roomItem.images
              : images;
            const priceNight = roomItem.priceVND || roomItem.pricePerNight || 2250000;
            const totalPrice = priceNight * nightsCount;
            const selectedQty = selectedRoomsCount[roomItem.id] || 0;

            return (
              <div key={roomItem.id || rIdx} className="tn-luxury-room-card">
                {/* Left: Thumbnail & Badges */}
                <div className="tn-room-media-box">
                  <div
                    className="tn-room-img-wrap"
                    onClick={() => onOpenRoomDetail && onOpenRoomDetail(roomItem)}
                  >
                    <img src={rImages[0]} alt={roomItem.title} className="tn-room-img" />
                    <span className="tn-room-view-chip">
                      <TbEye /> {rImages.length} ảnh
                    </span>
                    <span className="tn-room-size-badge">
                      <TbArrowsMaximize /> {roomItem.roomSizeM2 || 38} m²
                    </span>
                  </div>
                </div>

                {/* Middle: Specifications, Amenities & Benefits */}
                <div className="tn-room-info-box">
                  <div className="tn-room-title-line">
                    <h3
                      className="tn-room-title-link"
                      onClick={() => onOpenRoomDetail && onOpenRoomDetail(roomItem)}
                      title="Nhấp để xem chi tiết không gian này"
                    >
                      {roomItem.roomNameVi || roomItem.title}
                    </h3>
                    <div className="tn-room-rating-badge">
                      <TbStarFilled style={{ color: '#ff385c' }} />
                      <span>{roomItem.rating ? Number(roomItem.rating).toFixed(2) : '4.98'}</span>
                    </div>
                  </div>

                  <p className="tn-room-short-desc">
                    {roomItem.description || 'Không gian tinh tế đầy đủ tiện nghi cao cấp tiêu chuẩn 5 sao.'}
                  </p>

                  <div className="tn-room-specs-row">
                    <div className="tn-spec-pill">
                      <TbUsers /> Tối đa <strong>{roomItem.maxGuests || 2} khách</strong>
                    </div>
                    <div className="tn-spec-pill">
                      <TbBed /> {roomItem.bedroomsCount || 1} PN · <strong>{roomItem.bedsCount || 1} giường</strong>
                    </div>
                    <div className="tn-spec-pill">
                      <TbBath /> {roomItem.bathroomsCount || 1} phòng tắm riêng
                    </div>
                  </div>

                  {/* Amenities Chips */}
                  <div className="tn-room-amenities-row">
                    {(roomItem.amenities || [
                      'Wifi tốc độ cao',
                      'Điều hòa 2 chiều',
                      'Bồn tắm Jacuzzi',
                      'Ban công view đồi',
                      'Chỗ đỗ xe',
                    ]).slice(0, 4).map((am, aIdx) => (
                      <span key={aIdx} className="tn-room-am-tag">
                        <TbCheck /> {am}
                      </span>
                    ))}
                  </div>

                  {/* Green Inclusions & Policies */}
                  <div className="tn-room-benefits-row">
                    <span className="tn-benefit-item green">
                      <TbCoffee /> Miễn phí bữa sáng buffet
                    </span>
                    <span className="tn-benefit-item green">
                      <TbCircleCheck /> HỦY MIỄN PHÍ trước 48h
                    </span>
                    <span className="tn-benefit-item gray">
                      <TbCreditCard /> Thanh toán tại chỗ nghỉ
                    </span>
                  </div>

                  <button
                    type="button"
                    className="tn-view-room-link-btn"
                    onClick={() => onOpenRoomDetail && onOpenRoomDetail(roomItem)}
                  >
                    Xem chi tiết bài viết & album ảnh phòng riêng →
                  </button>
                </div>

                {/* Right: Pricing Box & Action Buttons */}
                <div className="tn-room-pricing-box">
                  <div className="tn-price-display-wrapper">
                    <div className="tn-price-total-text">
                      <span className="tn-price-val">{formatPrice(totalPrice, 1)}</span>
                      <span className="tn-price-sub">/ {nightsCount} đêm</span>
                    </div>
                    <div className="tn-price-avg">
                      ~ {formatPrice(priceNight, 1)} / đêm
                    </div>
                    <div className="tn-tax-note">
                      Đã bao gồm thuế GTGT & phí dịch vụ
                    </div>
                  </div>

                  <div className="tn-room-actions-group">
                    {!isEntirePlace && (
                      <div className="tn-qty-select-wrapper">
                        <label>Số lượng phòng:</label>
                        <select
                          value={selectedQty}
                          onChange={(e) => handleRoomCountChange(roomItem.id, Number(e.target.value))}
                          className="tn-qty-dropdown"
                        >
                          <option value={0}>0 phòng (0 ₫)</option>
                          <option value={1}>1 phòng ({formatPrice(totalPrice, 1)})</option>
                          <option value={2}>2 phòng ({formatPrice(totalPrice * 2, 1)})</option>
                          <option value={3}>3 phòng ({formatPrice(totalPrice * 3, 1)})</option>
                        </select>
                      </div>
                    )}

                    <button
                      type="button"
                      className="primary-gradient-btn tn-book-this-room-btn"
                      onClick={() => handleInstantBook(roomItem)}
                    >
                      {isEntirePlace ? 'Đặt trọn căn ngay' : 'Tôi sẽ đặt phòng này'}
                    </button>

                    <div className="tn-urgency-note">
                      ⚡ Đặt ngay để giữ mức giá ưu đãi hôm nay
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOATING STICKY SUMMARY BOTTOM BAR (Khi khách chọn >= 1 phòng) */}
      {!isEntirePlace && totalSelectedRooms > 0 && (
        <div className="tn-floating-summary-bar">
          <div className="tn-floating-inner">
            <div className="tn-floating-summary-info">
              <span className="tn-floating-rooms-badge">
                {totalSelectedRooms} phòng đã chọn ({nightsCount} đêm)
              </span>
              <div className="tn-floating-price-box">
                <span className="tn-floating-label">Tổng thanh toán:</span>
                <span className="tn-floating-val">{formatPrice(totalSelectedPrice, 1)}</span>
                <span className="tn-floating-tax-note">(Đã gồm thuế & phí)</span>
              </div>
            </div>

            <button
              type="button"
              className="primary-gradient-btn tn-floating-submit-btn"
              onClick={handleProceedMultiRoomCheckout}
            >
              TIẾP TỤC ĐẶT PHÒNG →
            </button>
          </div>
        </div>
      )}

      {/* 7. AMENITIES & FACILITIES SECTION */}
      <div id="tn-amenities-section" className="tn-section-block">
        <h2 className="tn-section-main-heading">Tiện nghi & Dịch vụ 5 sao tại {accommodation.nameVi || accommodation.title}</h2>
        <p className="tn-section-subtitle">Mọi tiện ích cao cấp được chuẩn bị chu đáo cho kỳ nghỉ trọn vẹn</p>

        <div className="tn-amenities-grid">
          <div className="tn-amenity-card">
            <h4><TbSwimming /> Ngoài trời & Thư giãn</h4>
            <ul>
              <li><TbCheck /> Hồ bơi nước ấm vô cực ngắm cảnh</li>
              <li><TbCheck /> Sân hiên tắm nắng & Ghế nằm thư giãn</li>
              <li><TbCheck /> Khu vực tiệc nướng BBQ ngoài trời</li>
              <li><TbCheck /> Khuôn viên sân vườn hoa rực rỡ</li>
            </ul>
          </div>

          <div className="tn-amenity-card">
            <h4><TbToolsKitchen2 /> Ẩm thực & Nhà hàng</h4>
            <ul>
              <li><TbCheck /> Nhà hàng ẩm thực Á - Âu phục vụ 24/7</li>
              <li><TbCheck /> Bữa sáng buffet tiêu chuẩn quốc tế</li>
              <li><TbCheck /> Quầy Bar & Lounge sang trọng</li>
              <li><TbCheck /> Phục vụ bữa ăn riêng tại phòng</li>
            </ul>
          </div>

          <div className="tn-amenity-card">
            <h4><TbBath /> Chăm sóc sức khỏe & Spa</h4>
            <ul>
              <li><TbCheck /> Bồn tắm sục Jacuzzi thư giãn</li>
              <li><TbCheck /> Dịch vụ Spa & Massage trị liệu</li>
              <li><TbCheck /> Phòng xông hơi khô & ướt (Sauna)</li>
              <li><TbCheck /> Phòng tập thể dục (Gym & Fitness)</li>
            </ul>
          </div>

          <div className="tn-amenity-card">
            <h4><TbShieldCheck /> Dịch vụ lễ tân & An ninh</h4>
            <ul>
              <li><TbCheck /> Lễ tân phục vụ 24/7</li>
              <li><TbCheck /> Wifi cáp quang tốc độ cao (150 Mbps)</li>
              <li><TbCheck /> Chỗ đỗ xe ô tô miễn phí tại chỗ</li>
              <li><TbCheck /> Dịch vụ giữ hành lý & Két sắt an toàn</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 8. HOUSE RULES & POLICIES SECTION */}
      <div id="tn-rules-section" className="tn-section-block">
        <h2 className="tn-section-main-heading">Quy định lưu trú & Chính sách chỗ nghỉ</h2>

        <div className="tn-rules-grid-table">
          <div className="tn-rule-card">
            <div className="tn-rule-header">
              <TbClock className="tn-rule-icon" />
              <h4>Thời gian nhận & trả phòng</h4>
            </div>
            <div className="tn-rule-body">
              <p><strong>Nhận phòng (Check-in):</strong> Từ 14:00 (Xuất trình CMND/CCCD hoặc Hộ chiếu)</p>
              <p><strong>Trả phòng (Check-out):</strong> Trước 12:00 trưa (Có hỗ trợ gửi hành lý miễn phí)</p>
            </div>
          </div>

          <div className="tn-rule-card">
            <div className="tn-rule-header">
              <TbCircleCheck className="tn-rule-icon" />
              <h4>Chính sách hủy & Thanh toán</h4>
            </div>
            <div className="tn-rule-body">
              <p><strong>Hủy miễn phí:</strong> Trước 48 giờ so với ngày nhận phòng.</p>
              <p><strong>Thanh toán linh hoạt:</strong> Thanh toán trực tiếp tại chỗ nghỉ hoặc thanh toán online bảo mật qua TripNest.</p>
            </div>
          </div>

          <div className="tn-rule-card">
            <div className="tn-rule-header">
              <TbUsers className="tn-rule-icon" />
              <h4>Trẻ em & Giường phụ</h4>
            </div>
            <div className="tn-rule-body">
              <p>Phù hợp cho tất cả trẻ em mọi độ tuổi.</p>
              <p>Trẻ em dưới 6 tuổi lưu trú miễn phí khi dùng chung giường với cha mẹ.</p>
            </div>
          </div>

          <div className="tn-rule-card">
            <div className="tn-rule-header">
              <TbCreditCard className="tn-rule-icon" />
              <h4>Phương thức thanh toán chấp nhận</h4>
            </div>
            <div className="tn-payment-methods-row">
              <span className="tn-pay-chip">Visa</span>
              <span className="tn-pay-chip">MasterCard</span>
              <span className="tn-pay-chip">JCB</span>
              <span className="tn-pay-chip">Chuyển khoản QR</span>
              <span className="tn-pay-chip">MoMo</span>
              <span className="tn-pay-chip">VNPay</span>
              <span className="tn-pay-chip">Tiền mặt</span>
            </div>
          </div>
        </div>
      </div>

      {/* 9. GUEST REVIEWS SECTION */}
      <div id="tn-reviews-section" className="tn-section-block">
        <div className="tn-reviews-header-row">
          <div>
            <h2 className="tn-section-main-heading">Đánh giá từ khách hàng đã lưu trú</h2>
            <p className="tn-section-subtitle">100% nhận xét xác thực từ du khách đã đặt phòng qua TripNest</p>
          </div>

          <div className="tn-big-score-box">
            <div className="tn-big-score-num">
              <TbStarFilled style={{ color: '#ff385c' }} />
              <span>{rating5}</span>
            </div>
            <div className="tn-big-score-text">
              <h3>Xuất sắc</h3>
              <p>{reviewsCount} bài đánh giá</p>
            </div>
          </div>
        </div>

        {/* Detailed Reviews Cards */}
        <div className="tn-reviews-cards-list">
          {reviewsList.map((rev) => (
            <div key={rev.id} className="tn-review-card">
              <div className="tn-review-user-col">
                <img src={rev.userAvatar} alt={rev.userName} className="tn-rev-avatar" />
                <div className="tn-rev-user-meta">
                  <h4>{rev.userName}</h4>
                  <span className="tn-rev-nationality">{rev.nationality}</span>
                  <span className="tn-rev-room">{rev.roomName}</span>
                  <span className="tn-rev-duration">{rev.stayDuration}</span>
                </div>
              </div>

              <div className="tn-review-content-col">
                <div className="tn-review-score-line">
                  <div className="tn-rev-rating-pill">
                    <TbStarFilled style={{ color: '#ff385c' }} />
                    <span>5.0 / 5.0</span>
                  </div>
                  <span className="tn-rev-date">{rev.createdAt}</span>
                </div>

                <p className="tn-rev-comment-text">{rev.comment}</p>

                {rev.positivePoint && (
                  <div className="tn-rev-positive-box">
                    <strong>👍 Điểm yêu thích:</strong> {rev.positivePoint}
                  </div>
                )}

                {rev.hostResponse && (
                  <div className="tn-rev-host-reply-box">
                    <div className="tn-host-reply-title">
                      <TbShieldCheck /> Phản hồi từ Quản lý {accommodation.nameVi || accommodation.title}:
                    </div>
                    <p>{rev.hostResponse}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10. LOCATION & SURROUNDINGS SECTION */}
      <div id="tn-location-section" className="tn-section-block">
        <h2 className="tn-section-main-heading">Vị trí & Các địa danh lân cận</h2>
        <p className="tn-section-subtitle">
          <TbMapPin style={{ color: '#ff385c' }} /> {accommodation.address || `${accommodation.city}, Việt Nam`} —{' '}
          <strong style={{ color: '#ff385c' }}>Vị trí đắc địa (Điểm 9.8)</strong>
        </p>

        <div className="tn-surroundings-grid">
          <div className="tn-surroundings-card">
            <h4>Khoảng cách đến các địa điểm nổi tiếng</h4>
            <div className="tn-surroundings-list">
              {surroundings.map((item, idx) => (
                <div key={idx} className="tn-surrounding-row">
                  <div className="tn-surr-title">
                    <TbMapPin className="tn-surr-pin" />
                    <span>{item.name}</span>
                  </div>
                  <strong className="tn-surr-distance">{item.distance}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="tn-surroundings-card">
            <h4>Phương tiện di chuyển & Đưa đón</h4>
            <ul className="tn-transport-list">
              <li><TbCar /> Dịch vụ xe đưa đón sân bay (liên hệ lễ tân trước 24h)</li>
              <li><TbCar /> Dịch vụ cho thuê xe máy & ô tô tự lái tại cơ sở</li>
              <li><TbCheck /> Bãi đỗ xe ô tô miễn phí có bảo vệ trông coi 24/24</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 11. SIMILAR ACCOMMODATIONS */}
      {similarAccommodations.length > 0 && (
        <div className="tn-section-block tn-similar-block">
          <h2 className="tn-section-main-heading">Các cơ sở lưu trú tương tự tại {accommodation.city}</h2>
          <div className="tn-similar-cards-grid">
            {similarAccommodations.map((item) => (
              <ListingCard
                key={item.id}
                room={item}
                onOpenDetail={() => onSelectAccommodation && onSelectAccommodation(item)}
                currency={currency}
              />
            ))}
          </div>
        </div>
      )}

      {/* 12. FULLSCREEN CINEMA LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="cinema-lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          {/* Fixed Top Right Close Button */}
          <button
            type="button"
            className="cinema-lightbox-close-btn"
            onClick={() => setIsLightboxOpen(false)}
            title="Đóng xem ảnh (Esc)"
          >
            <TbX />
          </button>

          {/* Left Arrow Button */}
          <button
            type="button"
            className="cinema-lightbox-nav-btn prev"
            onClick={(e) => {
              e.stopPropagation();
              setActiveLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
            }}
            title="Ảnh trước"
          >
            <TbChevronLeft />
          </button>

          {/* Center Stage: Cinema Image Container */}
          <div className="cinema-lightbox-stage" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[activeLightboxIndex]}
              alt={`${accommodation.nameVi || accommodation.title} ${activeLightboxIndex + 1}`}
              className="cinema-lightbox-img"
            />
            
            <div className="cinema-lightbox-caption">
              <span className="cinema-caption-title">{accommodation.nameVi || accommodation.title}</span>
              <span className="cinema-caption-counter">{activeLightboxIndex + 1} / {images.length}</span>
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            className="cinema-lightbox-nav-btn next"
            onClick={(e) => {
              e.stopPropagation();
              setActiveLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
            }}
            title="Ảnh tiếp theo"
          >
            <TbChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default AccommodationDetailPage;
