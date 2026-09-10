import React, { useState, useEffect, useMemo } from 'react';
import './AccommodationDetailPage.css';
import { apiService } from '../../services/api';
import {
  TbStarFilled,
  TbHeart,
  TbHeartFilled,
  TbShare,
  TbMapPin,
  TbShieldCheck,
  TbAlertCircle,
  TbCalendar,
  TbUsers,
  TbCheck,
  TbChevronLeft,
  TbChevronRight,
  TbX,
  TbArrowLeft,
  TbArrowRight,
  TbWifi,
  TbToolsKitchen2,
  TbSwimming,
  TbFlame,
  TbBolt,
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
  TbNavigation,
  TbCopy,
  TbRoute,
  TbMotorbike,
  TbWalk,
  TbExternalLink,
} from 'react-icons/tb';
import { ListingCard } from '@/components/common/ListingCard/ListingCard';
import { AccommodationDetailSkeleton } from '@/components/common/skeletons';
import { useToast } from '@/context/ToastContext';
import { openGoogleMapsDirections, getTargetCoordinates } from '@/utils/mapUtils';
import { InteractiveMapModal } from '@/components/modals/InteractiveMapModal/InteractiveMapModal';

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
  onOpenMapPage,
  recentBooking = null,
  onClearRecentBooking = null,
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

  const getNextDayStr = (dateStr) => {
    if (!dateStr) return tomorrowStr;
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const formatVNDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const [checkIn, setCheckIn] = useState(searchParams.checkInDate || tomorrowStr);
  const [checkOut, setCheckOut] = useState(searchParams.checkOutDate || defaultOutStr);

  const handleCheckInChange = (newIn) => {
    setCheckIn(newIn);
    if (!checkOut || new Date(newIn) >= new Date(checkOut)) {
      setCheckOut(getNextDayStr(newIn));
    }
  };

  const [guestCount, setGuestCount] = useState(Number(searchParams.guests) || 2);

  // Sync state if searchParams change from global navigation
  useEffect(() => {
    if (searchParams.checkInDate || searchParams.checkIn) {
      setCheckIn(searchParams.checkInDate || searchParams.checkIn);
    }
    if (searchParams.checkOutDate || searchParams.checkOut) {
      setCheckOut(searchParams.checkOutDate || searchParams.checkOut);
    }
    if (searchParams.guests) {
      setGuestCount(Number(searchParams.guests));
    }
  }, [searchParams]);
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [travelMode, setTravelMode] = useState('driving');
  const [isLocating, setIsLocating] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Multi-room selection state: { [roomId]: quantity }
  const [selectedRoomsCount, setSelectedRoomsCount] = useState({});

  // Lightbox modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Dynamic room availability cache fetched according to checkIn/checkOut
  const [dynamicAvailability, setDynamicAvailability] = useState({});

  useEffect(() => {
    let isSubscribed = true;
    if (!checkIn || !checkOut || !accommodation?.id) return;

    const fetchAvail = async () => {
      try {
        const detailed = await apiService.getAccommodationById(accommodation.id, checkIn, checkOut);
        if (isSubscribed && detailed?.rooms) {
          const map = {};
          detailed.rooms.forEach((r) => {
            if (r.id) {
              map[r.id] = {
                availability: r.availability,
                bookedRanges: r.bookedRanges,
              };
            }
          });
          setDynamicAvailability(map);
        }
      } catch (e) {
        console.warn('Error fetching dynamic availability:', e);
      }
    };

    fetchAvail();
    return () => { isSubscribed = false; };
  }, [accommodation?.id, checkIn, checkOut]);

  // Nhận diện đơn đặt gần đây của chính người dùng tại cơ sở lưu trú này
  const activeBookingForThisAccom = useMemo(() => {
    if (recentBooking) {
      const matchAccom = String(recentBooking.accommodationId) === String(accommodation.id) ||
        (Array.isArray(accommodation.rooms) && accommodation.rooms.some((r) => String(r.id) === String(recentBooking.roomId)));
      if (matchAccom) return recentBooking;
    }

    if (Array.isArray(accommodation.userActiveBookings) && accommodation.userActiveBookings.length > 0) {
      return accommodation.userActiveBookings[0];
    }

    return null;
  }, [recentBooking, accommodation]);

  // Accurate target coordinates for map display and directions
  const targetCoords = useMemo(() => getTargetCoordinates(accommodation), [accommodation]);

  // Handler for Google Maps Directions from current user GPS position
  const handleOpenGoogleMaps = (mode = travelMode) => {
    setIsLocating(true);
    toast?.info?.('📍 Đang định vị GPS và mở Google Maps chỉ đường...');
    openGoogleMapsDirections(accommodation, {
      travelMode: mode,
      onSuccess: () => {
        setIsLocating(false);
        toast?.success?.('Đã mở Google Maps', 'Lộ trình từ vị trí của bạn đã sẵn sàng trên tab mới!');
      },
      onError: (err) => {
        setIsLocating(false);
        console.warn('Geolocation warning:', err);
      },
    });
  };

  const handleCopyAddress = () => {
    const fullAddress = accommodation.address || `${accommodation.city}, Việt Nam`;
    navigator.clipboard.writeText(fullAddress);
    setCopiedAddress(true);
    toast?.success?.('Đã sao chép địa chỉ', fullAddress);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

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
    return `${total.toLocaleString()}\u00A0₫`;
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

  // Distinguish between Entire Place (1 unit: Villa / Homestay nguyên căn / Cabin / Penthouse) vs Multi-room (2+ rooms or private rooms)
  const isEntirePlace = useMemo(() => {
    if (!roomsList || roomsList.length === 0) return true;

    // Explicit rental mode from accommodation metadata
    if (accommodation?.rentalMode === 'entire_place') {
      return true;
    }
    if (accommodation?.rentalMode === 'multi_room') {
      return false;
    }

    // If there is only 1 room, check if it's entire place
    if (roomsList.length === 1) {
      const singleRoom = roomsList[0];
      if (singleRoom?.spaceType === 'entire_place' || accommodation?.spaceType === 'entire_place') {
        return true;
      }
      const type = accommodation?.accommodationType?.toLowerCase() || '';
      if (['villa', 'homestay', 'cabin', 'apartment', 'yacht'].includes(type)) {
        return true;
      }
      return false;
    }

    // If there are 2 or more rooms, it's definitely a multi-room accommodation
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
    const qty = selectedRoomsCount[roomItem.id] || 1;
    const priceNight = currency === 'USD' 
      ? (roomItem.priceUSD || 100) 
      : (roomItem.priceVND || roomItem.pricePerNight || (roomItem.priceUSD ? roomItem.priceUSD * 25000 : 2250000));
    const baseTotal = priceNight * nightsCount * qty;
    const cleaningFee = currency === 'USD' 
      ? (roomItem.cleaningFeeUSD || roomItem.cleaning_fee_usd || 30) 
      : (roomItem.cleaningFeeVND || roomItem.cleaning_fee_vnd || roomItem.cleaningFee || roomItem.cleaning_fee || 350000);
    const serviceFee = Math.round(baseTotal * 0.12);
    const grandTotal = baseTotal + cleaningFee + serviceFee;

    // If user selected multiple rooms across the property, proceed with all selected rooms
    if (totalSelectedRooms > 1) {
      handleProceedMultiRoomCheckout();
      return;
    }

    if (onStartCheckout) {
      onStartCheckout({
        room: {
          ...roomItem,
          title: qty > 1 ? `${qty}x ${roomItem.roomNameVi || roomItem.title}` : (roomItem.roomNameVi || roomItem.title),
          roomNameVi: qty > 1 ? `${qty}x ${roomItem.roomNameVi || roomItem.title}` : (roomItem.roomNameVi || roomItem.title),
        },
        accommodation: accommodation,
        bookingParams: {
          checkIn: checkIn,
          checkInDate: checkIn,
          checkOut: checkOut,
          checkOutDate: checkOut,
          guests: guestCount,
          nights: nightsCount,
          roomsCount: qty,
          selectedRoomsDetail: { [roomItem.id]: qty },
          basePrice: baseTotal,
          cleaningFee: cleaningFee,
          serviceFee: serviceFee,
          totalPrice: grandTotal,
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

  // Calculate total selected rooms & price (including all taxes and fees)
  const totalSelectedRooms = useMemo(() => {
    return Object.values(selectedRoomsCount).reduce((sum, count) => sum + count, 0);
  }, [selectedRoomsCount]);

  const totalSelectedBase = useMemo(() => {
    return Object.entries(selectedRoomsCount).reduce((sum, [rId, count]) => {
      const found = roomsList.find((r) => String(r.id) === String(rId));
      const price = currency === 'USD' 
        ? (found?.priceUSD || 100) 
        : (found?.priceVND || found?.pricePerNight || (found?.priceUSD ? found.priceUSD * 25000 : 2250000));
      return sum + price * nightsCount * count;
    }, 0);
  }, [selectedRoomsCount, roomsList, nightsCount, currency]);

  const totalSelectedCleaning = useMemo(() => {
    if (totalSelectedRooms <= 0) return 0;
    const firstId = Object.keys(selectedRoomsCount)[0];
    const found = roomsList.find((r) => String(r.id) === String(firstId));
    return currency === 'USD' 
      ? (found?.cleaningFeeUSD || found?.cleaning_fee_usd || 30) 
      : (found?.cleaningFeeVND || found?.cleaning_fee_vnd || found?.cleaningFee || found?.cleaning_fee || 350000);
  }, [totalSelectedRooms, selectedRoomsCount, roomsList, currency]);

  const totalSelectedService = useMemo(() => {
    return Math.round(totalSelectedBase * 0.12);
  }, [totalSelectedBase]);

  const totalSelectedPrice = useMemo(() => {
    return totalSelectedBase + totalSelectedCleaning + totalSelectedService;
  }, [totalSelectedBase, totalSelectedCleaning, totalSelectedService]);

  // Proceed checkout for selected rooms
  const handleProceedMultiRoomCheckout = () => {
    const selectedEntries = Object.entries(selectedRoomsCount);
    if (selectedEntries.length === 0) {
      scrollToSection('tn-rooms-matrix-section', 'rooms');
      return;
    }
    const [firstRoomId] = selectedEntries[0];
    const selectedRoomObj = roomsList.find((r) => String(r.id) === String(firstRoomId)) || roomsList[0];

    const selectedTitles = selectedEntries
      .map(([rId, qty]) => {
        const found = roomsList.find((r) => String(r.id) === String(rId));
        return `${qty}x ${found?.roomNameVi || found?.title || 'Phòng'}`;
      })
      .join(' + ');

    const compositeRoom = {
      ...selectedRoomObj,
      roomNameVi: selectedEntries.length > 1 ? selectedTitles : selectedRoomObj.roomNameVi,
      title: selectedEntries.length > 1 ? selectedTitles : selectedRoomObj.title,
    };

    if (onStartCheckout) {
      onStartCheckout({
        room: compositeRoom,
        accommodation: accommodation,
        bookingParams: {
          checkIn: checkIn,
          checkInDate: checkIn,
          checkOut: checkOut,
          checkOutDate: checkOut,
          guests: guestCount,
          nights: nightsCount,
          roomsCount: totalSelectedRooms,
          selectedRoomsDetail: selectedRoomsCount,
          basePrice: totalSelectedBase,
          cleaningFee: totalSelectedCleaning,
          serviceFee: totalSelectedService,
          totalPrice: totalSelectedPrice,
        },
      });
    }
  };

  if (!accommodation || (!accommodation.name_vi && !accommodation.title && !accommodation.name)) {
    return <AccommodationDetailSkeleton />;
  }

  const rating5 = accommodation.rating ? Number(accommodation.rating).toFixed(2) : '4.98';
  const reviewsCount = accommodation.reviewsCount !== undefined
    ? accommodation.reviewsCount
    : (accommodation.reviews_count !== undefined ? accommodation.reviews_count : (accommodation.reviewsList?.length || 0));

  const reviewBreakdown = accommodation.reviewScoresBreakdown || {
    cleanliness: 9.8,
    facilities: 9.6,
    location: 9.9,
    comfort: 9.7,
    staff: 9.8,
    value: 9.5,
  };

  const reviewsList = Array.isArray(accommodation.reviewsList)
    ? accommodation.reviewsList
    : [];

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
      {/* RECENT OR ACTIVE BOOKING CELEBRATION BANNER */}
      {activeBookingForThisAccom && (
        <div className="tn-booking-celebration-banner">
          <div className="tn-celebration-left">
            <div className="tn-celebration-icon-box">
              <TbCircleCheck />
            </div>
            <div className="tn-celebration-text">
              <div className="tn-celebration-title">
                🎉 Bạn đã đặt thành công phòng tại cơ sở lưu trú này!
              </div>
              <div className="tn-celebration-subtitle">
                Hạng phòng: <strong>{activeBookingForThisAccom.roomTitle || 'Phòng nghỉ dưỡng'}</strong> · 
                Thời gian: <strong>{formatVNDate(activeBookingForThisAccom.checkIn)} – {formatVNDate(activeBookingForThisAccom.checkOut)}</strong> ({activeBookingForThisAccom.nights || 1} đêm) · 
                Mã đơn: <strong className="tn-code-highlight">{activeBookingForThisAccom.id || activeBookingForThisAccom.bookingCode}</strong>
              </div>
            </div>
          </div>
          <div className="tn-celebration-actions">
            <button
              type="button"
              className="tn-celebration-action-btn"
              onClick={() => {
                const myTripsNav = document.getElementById('my-trips-nav-link');
                if (myTripsNav) myTripsNav.click();
                else window.location.href = '/my-trips';
              }}
            >
              Xem vé & Quản lý chuyến đi →
            </button>
            {onClearRecentBooking && (
              <button
                type="button"
                className="tn-celebration-close-btn"
                onClick={onClearRecentBooking}
                title="Đóng thông báo"
              >
                <TbX />
              </button>
            )}
          </div>
        </div>
      )}

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
              onClick={() => (onOpenMapPage ? onOpenMapPage(accommodation) : setIsMapModalOpen(true))}
              title="Mở trang bản đồ vị trí & chỉ đường chuyên dụng"
            >
              <TbNavigation className="tn-mini-nav-icon" />
              — Xem bản đồ vị trí & Chỉ đường
            </button>
            <button
              type="button"
              className="tn-quick-scroll-map-btn"
              onClick={() => scrollToSection('tn-location-section', 'location')}
              title="Xem vị trí & cẩm nang lân cận"
            >
              (Chi tiết)
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
                onChange={(e) => handleCheckInChange(e.target.value)}
              />
            </div>

            <div className="tn-search-field">
              <label>TRẢ PHÒNG</label>
              <input
                type="date"
                value={checkOut}
                min={getNextDayStr(checkIn)}
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
              {isEntirePlace ? 'Thông Tin Chi Tiết Căn & Đặt Trọn Gói' : `Danh Sách Hạng Phòng & Biệt Thự Có Sẵn (${roomsList.length} hạng phòng)`}
            </h2>
            <p className="tn-matrix-subtitle">
              Giá phòng tính cho <strong>{nightsCount} đêm</strong> (từ <strong>{formatVNDate(checkIn)}</strong> đến <strong>{formatVNDate(checkOut)}</strong>) cho <strong>{guestCount} khách</strong>
            </p>
          </div>

          <div className="tn-currency-badge">
            Hiển thị bằng <strong>{currency}</strong> · Đã bao gồm thuế GTGT & phí dịch vụ
          </div>
        </div>

        {/* Room Cards List */}
        <div className="tn-room-cards-matrix">
          {roomsList.map((roomItem, rIdx) => {
            const hasDistinctRoomImages = Array.isArray(roomItem.images) && roomItem.images.length > 0;
            const rImages = hasDistinctRoomImages
              ? roomItem.images
              : (images.length > rIdx ? [images[rIdx % images.length], ...images.filter((_, i) => i !== (rIdx % images.length))] : images);
            const priceNight = currency === 'USD' 
              ? (roomItem.priceUSD || 100) 
              : (roomItem.priceVND || roomItem.pricePerNight || (roomItem.priceUSD ? roomItem.priceUSD * 25000 : 2250000));
            const roomBase = priceNight * nightsCount;
            const roomCleaning = currency === 'USD' 
              ? (roomItem.cleaningFeeUSD || roomItem.cleaning_fee_usd || 30) 
              : (roomItem.cleaningFeeVND || roomItem.cleaning_fee_vnd || roomItem.cleaningFee || roomItem.cleaning_fee || 350000);
            const roomService = Math.round(roomBase * 0.12);
            const roomGrandTotal = roomBase + roomCleaning + roomService;
            const selectedQty = selectedRoomsCount[roomItem.id] || 0;

            // AVAILABILITY & COLLISION LOGIC
            const dyn = dynamicAvailability[roomItem.id];
            const bookedRanges = dyn?.bookedRanges || roomItem.bookedRanges || [];

            // 0. Số lượng tồn kho phòng trống khả dụng thực tế
            const maxAvailable = dyn?.availability?.remainingInventory !== undefined
              ? Math.max(0, dyn.availability.remainingInventory)
              : (roomItem.totalInventory || roomItem.quantity || 1);

            // 1. Kiểm tra xem phòng này có vừa được người dùng hiện tại đặt hay không
            const isBookedByMe = Boolean(
              activeBookingForThisAccom &&
              (String(activeBookingForThisAccom.roomId) === String(roomItem.id) ||
                (!activeBookingForThisAccom.roomId && isEntirePlace))
            );

            // 2. Kiểm tra trùng lặp ngày với đơn đặt của khách khác (Overlap Collision)
            const hasConfirmedCollision = (() => {
              if (dyn?.availability && dyn.availability.isAvailable === false && dyn.availability.status === 'booked') {
                return true;
              }
              if (checkIn && checkOut && Array.isArray(bookedRanges)) {
                return bookedRanges.some((r) => {
                  if (r.status === 'cancelled') return false;
                  const bIn = r.checkIn || r.check_in_date || r.check_in;
                  const bOut = r.checkOut || r.check_out_date || r.check_out;
                  if (!bIn || !bOut) return false;
                  const isHold = r.type === 'hold' || r.type === 'hold_lock' || r.status === 'held' || r.status === 'holding';
                  return checkIn < bOut && checkOut > bIn && !isHold;
                });
              }
              return false;
            })();

            // 3. Kiểm tra xem có khách đang tạm giữ chỗ thanh toán (Hold Lock 15 phút)
            const isHeldByOther = (() => {
              if (hasConfirmedCollision) return false;
              if (dyn?.availability?.status === 'held' || (dyn?.availability?.heldCount > 0 && dyn?.availability?.remainingInventory <= 0)) {
                return true;
              }
              if (checkIn && checkOut && Array.isArray(bookedRanges)) {
                return bookedRanges.some((r) => {
                  const isHold = r.type === 'hold' || r.type === 'hold_lock' || r.status === 'held' || r.status === 'holding';
                  if (isHold) {
                    const bIn = r.checkIn || r.check_in_date || r.check_in;
                    const bOut = r.checkOut || r.check_out_date || r.check_out;
                    return checkIn < bOut && checkOut > bIn;
                  }
                  return false;
                });
              }
              return false;
            })();

            return (
              <div
                key={roomItem.id || rIdx}
                className={`tn-luxury-room-card ${isBookedByMe ? 'tn-card-booked-by-me' : ''} ${hasConfirmedCollision ? 'tn-card-conflict' : ''} ${isHeldByOther ? 'tn-card-holding' : ''}`}
              >
                {/* Left: Thumbnail & Badges */}
                <div className="tn-room-media-box">
                  <div
                    className="tn-room-img-wrap"
                    onClick={() => onOpenRoomDetail && onOpenRoomDetail(roomItem, { checkIn, checkInDate: checkIn, checkOut, checkOutDate: checkOut, guests: guestCount, nights: nightsCount })}
                  >
                    <img src={rImages[0]} alt={roomItem.title} className="tn-room-img" />
                    
                    {/* Status Badges Overlay */}
                    {isBookedByMe && (
                      <span className="tn-room-booked-status-chip">
                        <TbCircleCheck /> Bạn đã đặt phòng này
                      </span>
                    )}
                    {!isBookedByMe && hasConfirmedCollision && (
                      <span className="tn-room-conflict-status-chip">
                        <TbAlertCircle /> Đã có khách đặt ngày này
                      </span>
                    )}
                    {!isBookedByMe && !hasConfirmedCollision && isHeldByOther && (
                      <span className="tn-room-holding-status-chip">
                        <TbClock /> Đang giữ chỗ thanh toán
                      </span>
                    )}

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
                      onClick={() => onOpenRoomDetail && onOpenRoomDetail(roomItem, { checkIn, checkInDate: checkIn, checkOut, checkOutDate: checkOut, guests: guestCount, nights: nightsCount })}
                      title="Nhấp để xem chi tiết không gian này"
                    >
                      {roomItem.roomNameVi || roomItem.title}
                    </h3>
                    <div className="tn-room-rating-badge">
                      <TbStarFilled style={{ color: '#ff385c' }} />
                      <span>{roomItem.rating ? Number(roomItem.rating).toFixed(2) : '4.98'}</span>
                    </div>
                  </div>

                  {/* Highlight Callouts */}
                  {isBookedByMe && (
                    <div className="tn-booked-by-me-callout">
                      <div className="tn-callout-icon-wrap">
                        <TbCircleCheck />
                      </div>
                      <div className="tn-callout-content">
                        <div className="tn-suggest-title">Bạn đã đặt thành công phòng này</div>
                        <p className="tn-suggest-desc">
                          Thời gian lưu trú: <strong>{formatVNDate(activeBookingForThisAccom?.checkIn || checkIn)}</strong> đến <strong>{formatVNDate(activeBookingForThisAccom?.checkOut || checkOut)}</strong>
                          {activeBookingForThisAccom?.bookingCode && ` · Mã đặt phòng: ${activeBookingForThisAccom.bookingCode}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {!isBookedByMe && hasConfirmedCollision && (
                    <div className="tn-smart-alternative-box">
                      <TbAlertCircle className="tn-suggest-icon" />
                      <div className="tn-suggest-content">
                        <div className="tn-suggest-title">Không còn phòng trống trong ngày đã chọn</div>
                        <p className="tn-suggest-desc">
                          Đã có khách đặt phòng từ <span className="tn-date-text">{formatVNDate(checkIn)}</span> đến <span className="tn-date-text">{formatVNDate(checkOut)}</span>.
                          <br />
                          Vui lòng chọn ngày lưu trú khác hoặc xem các phòng còn trống dưới đây.
                        </p>
                      </div>
                    </div>
                  )}

                  {!isBookedByMe && !hasConfirmedCollision && isHeldByOther && (
                    <div className="tn-holding-note-box">
                      <TbClock className="tn-suggest-icon" />
                      <div className="tn-suggest-content">
                        <div className="tn-suggest-title">Có khách đang tiến hành thanh toán</div>
                        <p className="tn-suggest-desc">Phòng này đang được tạm giữ trong 15 phút. Sẽ tự động mở lại cho bạn nếu khách chưa thanh toán.</p>
                      </div>
                    </div>
                  )}

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

                  {guestCount > (roomItem.maxGuests || 2) && (
                    <div className="tn-room-capacity-alert">
                      <TbInfoCircle /> Đoàn của bạn có {guestCount} khách. Phòng này phù hợp {roomItem.maxGuests || 2} người (gợi ý đặt từ {Math.ceil(guestCount / (roomItem.maxGuests || 2))} phòng).
                    </div>
                  )}

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
                    onClick={() => onOpenRoomDetail && onOpenRoomDetail(roomItem, { checkIn, checkInDate: checkIn, checkOut, checkOutDate: checkOut, guests: guestCount, nights: nightsCount })}
                  >
                    Xem chi tiết bài viết & album ảnh phòng riêng →
                  </button>
                </div>

                {/* Right: Pricing Box & Action Buttons */}
                <div className={`tn-room-pricing-box ${hasConfirmedCollision ? 'is-conflict' : ''} ${isBookedByMe ? 'is-booked' : ''} ${isHeldByOther ? 'is-held' : ''}`}>
                  {hasConfirmedCollision ? (
                    <div className="tn-pricing-conflict-card">
                      <div className="tn-conflict-status-badge">
                        <TbAlertCircle /> HẾT PHÒNG NGÀY ĐÃ CHỌN
                      </div>

                      <div className="tn-conflict-price-block">
                        <span className="tn-conflict-price-label">Giá niêm yết tham khảo</span>
                        <div className="tn-conflict-price-row">
                          <strong className="tn-conflict-price-num">{formatPrice(priceNight, 1)}</strong>
                          <span className="tn-conflict-price-unit">/ đêm</span>
                        </div>
                        <div className="tn-conflict-estimate-pill">
                          <span>Ước tính {nightsCount} đêm:</span>
                          <strong className="tn-conflict-nowrap-val">~{formatPrice(roomGrandTotal, 1)}</strong>
                        </div>
                        <span className="tn-conflict-tax-hint">Đã bao gồm thuế & phí dịch vụ</span>
                      </div>

                      <div className="tn-conflict-action-buttons">
                        <button
                          type="button"
                          className="tn-conflict-change-dates-btn"
                          onClick={() => scrollToSection('tn-overview-section', 'overview')}
                        >
                          <TbCalendar />
                          <span>Đổi ngày lưu trú khác</span>
                        </button>
                        <button
                          type="button"
                          className="tn-conflict-see-details-btn"
                          onClick={() => onOpenRoomDetail && onOpenRoomDetail(roomItem, { checkIn, checkInDate: checkIn, checkOut, checkOutDate: checkOut, guests: guestCount, nights: nightsCount })}
                        >
                          <span>Xem lịch trống & chi tiết</span>
                          <TbChevronRight className="tn-btn-chevron" />
                        </button>
                      </div>
                    </div>
                  ) : isBookedByMe ? (
                    <div className="tn-pricing-booked-card">
                      <div className="tn-booked-status-badge">
                        <TbCircleCheck /> BẠN ĐÃ ĐẶT THÀNH CÔNG
                      </div>

                      <div className="tn-booked-price-block">
                        <div className="tn-booked-total-val">{formatPrice(roomGrandTotal, 1)}</div>
                        <span className="tn-booked-sub">Tổng tiền đã đặt cho {nightsCount} đêm</span>
                        {activeBookingForThisAccom?.bookingCode && (
                          <div className="tn-booked-code-tag">Mã: {activeBookingForThisAccom.bookingCode}</div>
                        )}
                      </div>

                      <div className="tn-booked-action-buttons">
                        <button
                          type="button"
                          className="tn-booked-by-you-btn"
                          onClick={() => {
                            window.location.href = '/profile/bookings';
                          }}
                        >
                          <TbCircleCheck />
                          <span>Xem đơn đặt phòng</span>
                          <TbChevronRight className="tn-btn-chevron" />
                        </button>
                        <button
                          type="button"
                          className="tn-book-additional-btn"
                          onClick={() => handleInstantBook(roomItem)}
                        >
                          <span>Đặt thêm 1 phòng nữa</span>
                        </button>
                      </div>
                    </div>
                  ) : isHeldByOther ? (
                    <div className="tn-pricing-holding-card">
                      <div className="tn-holding-status-badge">
                        <TbClock /> ĐANG GIỮ CHỖ THANH TOÁN
                      </div>

                      <div className="tn-holding-price-block">
                        <div className="tn-holding-total-val">{formatPrice(roomGrandTotal, 1)}</div>
                        <span className="tn-holding-sub">/ {nightsCount} đêm (đã gồm thuế & phí)</span>
                      </div>

                      <div className="tn-holding-action-buttons">
                        <button
                          type="button"
                          className="tn-room-holding-btn"
                          disabled
                        >
                          <TbClock style={{ fontSize: '1.15rem' }} /> Đang giữ chỗ...
                        </button>
                        <span className="tn-holding-subtext">Khách khác đang thanh toán (tạm giữ 15 phút)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="tn-pricing-available-card">
                      <div className="tn-price-display-wrapper">
                        <div className="tn-price-total-text">
                          <span className="tn-price-val">{formatPrice(roomGrandTotal, 1)}</span>
                          <span className="tn-price-sub">/ {nightsCount} đêm</span>
                        </div>
                        <div className="tn-price-avg">
                          ~ {formatPrice(Math.round(roomGrandTotal / nightsCount), 1)} / đêm
                        </div>
                        <div className="tn-tax-note">
                          Đã bao gồm thuế GTGT & phí dịch vụ
                        </div>
                      </div>

                      <div className="tn-room-actions-group">
                        {!isEntirePlace && maxAvailable > 0 && (
                          <div className={`tn-scarcity-pill ${maxAvailable === 1 ? 'critical' : maxAvailable <= 3 ? 'warning' : 'plenty'}`}>
                            {maxAvailable === 1 ? (
                              <>
                                <TbFlame className="tn-scarcity-icon-flame" />
                                <span>Chỉ còn duy nhất 1 phòng trống!</span>
                              </>
                            ) : maxAvailable <= 3 ? (
                              <>
                                <TbBolt className="tn-scarcity-icon-bolt" />
                                <span>Chỉ còn {maxAvailable} phòng trống cho ngày này</span>
                              </>
                            ) : (
                              <>
                                <TbCheck className="tn-scarcity-icon-check" />
                                <span>Còn {maxAvailable} phòng trống sẵn sàng</span>
                              </>
                            )}
                          </div>
                        )}

                        {!isEntirePlace && (
                          <div className="tn-qty-select-wrapper">
                            <div className="tn-qty-label-row">
                              <label>Số lượng phòng:</label>
                              {maxAvailable > 1 && <span className="tn-qty-max-hint">(Tối đa {Math.min(maxAvailable, 4)} phòng)</span>}
                            </div>
                            <select
                              value={Math.min(selectedQty, maxAvailable)}
                              onChange={(e) => handleRoomCountChange(roomItem.id, Number(e.target.value))}
                              className="tn-qty-dropdown"
                            >
                              <option value={0}>0 phòng (0 ₫)</option>
                              {Array.from({ length: Math.min(maxAvailable, 4) }, (_, idx) => idx + 1).map((q) => {
                                const totalQ = roomBase * q + roomCleaning + Math.round(roomBase * q * 0.12);
                                return (
                                  <option key={q} value={q}>
                                    {q} phòng ({formatPrice(totalQ, 1)})
                                  </option>
                                );
                              })}
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
                          <TbBolt className="tn-urgency-icon" />
                          <span>Đặt ngay để giữ mức giá ưu đãi hôm nay</span>
                        </div>
                      </div>
                    </div>
                  )}
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
              <div className="tn-floating-rooms-badge">
                <span className="tn-badge-pulse-dot" />
                <TbBed className="tn-badge-bed-icon" />
                <span>
                  <strong>{totalSelectedRooms}</strong> phòng đã chọn <span className="tn-badge-nights">({nightsCount} đêm)</span>
                </span>
              </div>

              <div className="tn-floating-divider" />

              <div className="tn-floating-price-box">
                <span className="tn-floating-label">Tổng thanh toán:</span>
                <strong className="tn-floating-val">{formatPrice(totalSelectedPrice, 1)}</strong>
                <span className="tn-floating-tax-note">Đã gồm thuế & phí</span>
              </div>
            </div>

            <div className="tn-floating-actions">
              <div className="tn-floating-guarantee">
                <TbShieldCheck className="tn-guarantee-icon" />
                <span>Bảo đảm giữ phòng 100%</span>
              </div>

              <button
                type="button"
                className="tn-floating-submit-btn"
                onClick={handleProceedMultiRoomCheckout}
              >
                <span>TIẾP TỤC ĐẶT PHÒNG</span>
                <TbArrowRight className="tn-btn-arrow-icon" />
              </button>
            </div>
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
              <h3>{Number(rating5) >= 4.8 ? 'Xuất sắc' : (Number(rating5) >= 4.5 ? 'Tuyệt vời' : 'Rất tốt')}</h3>
              <p>{reviewsCount} bài đánh giá</p>
            </div>
          </div>
        </div>

        {/* 6 Category Score Breakdown Grid */}
        <div className="tn-reviews-breakdown-grid">
          <div className="tn-breakdown-item">
            <div className="tn-breakdown-label-row">
              <span>Mức độ sạch sẽ</span>
              <span className="tn-breakdown-val">{Number(reviewBreakdown.cleanliness || 9.8).toFixed(1)}</span>
            </div>
            <div className="tn-breakdown-progress-track">
              <div
                className="tn-breakdown-progress-fill"
                style={{ width: `${Math.min(100, (Number(reviewBreakdown.cleanliness || 9.8) / 10) * 100)}%` }}
              />
            </div>
          </div>
          <div className="tn-breakdown-item">
            <div className="tn-breakdown-label-row">
              <span>Độ chính xác & Tiện nghi</span>
              <span className="tn-breakdown-val">{Number(reviewBreakdown.accuracy || reviewBreakdown.facilities || 9.6).toFixed(1)}</span>
            </div>
            <div className="tn-breakdown-progress-track">
              <div
                className="tn-breakdown-progress-fill"
                style={{ width: `${Math.min(100, (Number(reviewBreakdown.accuracy || reviewBreakdown.facilities || 9.6) / 10) * 100)}%` }}
              />
            </div>
          </div>
          <div className="tn-breakdown-item">
            <div className="tn-breakdown-label-row">
              <span>Giao tiếp & Phục vụ</span>
              <span className="tn-breakdown-val">{Number(reviewBreakdown.staff || reviewBreakdown.communication || 9.8).toFixed(1)}</span>
            </div>
            <div className="tn-breakdown-progress-track">
              <div
                className="tn-breakdown-progress-fill"
                style={{ width: `${Math.min(100, (Number(reviewBreakdown.staff || reviewBreakdown.communication || 9.8) / 10) * 100)}%` }}
              />
            </div>
          </div>
          <div className="tn-breakdown-item">
            <div className="tn-breakdown-label-row">
              <span>Vị trí thuận tiện</span>
              <span className="tn-breakdown-val">{Number(reviewBreakdown.location || 9.9).toFixed(1)}</span>
            </div>
            <div className="tn-breakdown-progress-track">
              <div
                className="tn-breakdown-progress-fill"
                style={{ width: `${Math.min(100, (Number(reviewBreakdown.location || 9.9) / 10) * 100)}%` }}
              />
            </div>
          </div>
          <div className="tn-breakdown-item">
            <div className="tn-breakdown-label-row">
              <span>Nhận phòng & Thoải mái</span>
              <span className="tn-breakdown-val">{Number(reviewBreakdown.comfort || 9.7).toFixed(1)}</span>
            </div>
            <div className="tn-breakdown-progress-track">
              <div
                className="tn-breakdown-progress-fill"
                style={{ width: `${Math.min(100, (Number(reviewBreakdown.comfort || 9.7) / 10) * 100)}%` }}
              />
            </div>
          </div>
          <div className="tn-breakdown-item">
            <div className="tn-breakdown-label-row">
              <span>Giá trị tương xứng</span>
              <span className="tn-breakdown-val">{Number(reviewBreakdown.value || 9.5).toFixed(1)}</span>
            </div>
            <div className="tn-breakdown-progress-track">
              <div
                className="tn-breakdown-progress-fill"
                style={{ width: `${Math.min(100, (Number(reviewBreakdown.value || 9.5) / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Detailed Reviews Cards */}
        {reviewsList.length === 0 ? (
          <div className="tn-reviews-empty-state">
            <div className="tn-empty-star-icon">
              <TbStarFilled style={{ color: '#ff385c', fontSize: '2rem' }} />
            </div>
            <h3>Chưa có bài đánh giá nào</h3>
            <p>Hãy là vị khách đầu tiên trải nghiệm và chia sẻ nhận xét sau kỳ nghỉ của bạn tại đây!</p>
          </div>
        ) : (
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
                      <span>{Number(rev.rating || 5).toFixed(1)} / 5.0</span>
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
        )}
      </div>

      {/* 10. LOCATION & GOOGLE MAPS DIRECTIONS SECTION */}
      <div id="tn-location-section" className="tn-section-block tn-map-interactive-section">
        <div className="tn-map-section-header">
          <div>
            <h2 className="tn-section-main-heading">Vị trí & Chỉ đường Google Maps</h2>
            <p className="tn-section-subtitle">
              <TbMapPin style={{ color: '#ff385c' }} /> {accommodation.address || `${accommodation.city}, Việt Nam`} —{' '}
              <strong style={{ color: '#ff385c' }}>Vị trí đắc địa (Điểm 9.8)</strong>
            </p>
          </div>
          <div className="tn-map-header-actions">
            <button
              type="button"
              className="tn-copy-address-btn"
              onClick={handleCopyAddress}
              title="Sao chép địa chỉ chính xác"
            >
              <TbCopy /> {copiedAddress ? 'Đã sao chép địa chỉ!' : 'Sao chép địa chỉ'}
            </button>
            <button
              type="button"
              className="tn-open-gmaps-link-btn"
              onClick={() => (onOpenMapPage ? onOpenMapPage(accommodation) : handleOpenGoogleMaps(travelMode))}
              title="Mở trang Bản đồ & Chỉ đường chuyên biệt"
            >
              <TbRoute /> Mở trang bản đồ
            </button>
          </div>
        </div>

        {/* Interactive Luxury Map Card */}
        <div className="tn-luxury-map-hero-card">
          <div className="tn-map-viewport-wrapper">
            <iframe
              title={`Bản đồ ${accommodation.nameVi || accommodation.title}`}
              className="tn-map-iframe"
              src={`https://maps.google.com/maps?q=${targetCoords.lat},${targetCoords.lng}&hl=vi&z=16&output=embed`}
              loading="lazy"
              allowFullScreen
            />
            {/* Floating Info Overlay on Map */}
            <div className="tn-map-overlay-floating-card">
              <div className="tn-map-pin-pulse-box">
                <span className="tn-pin-pulsing-dot" />
                <TbMapPin className="tn-map-floating-pin-icon" />
              </div>
              <div className="tn-map-floating-details">
                <h4 className="tn-map-floating-title">{accommodation.nameVi || accommodation.title}</h4>
                <p className="tn-map-floating-address">{accommodation.address || `${accommodation.city}, Việt Nam`}</p>
                <div className="tn-map-coords-badge">
                  <TbRoute /> {targetCoords.lat.toFixed(4)}° N, {targetCoords.lng.toFixed(4)}° E
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Navigation CTA Bar */}
          <div className="tn-map-cta-action-bar">
            <div className="tn-map-cta-left">
              <div className="tn-travel-mode-selector">
                <span className="tn-travel-mode-label">Phương tiện di chuyển:</span>
                <button
                  type="button"
                  className={`tn-mode-pill ${travelMode === 'driving' ? 'active' : ''}`}
                  onClick={() => setTravelMode('driving')}
                >
                  <TbCar /> Ô tô
                </button>
                <button
                  type="button"
                  className={`tn-mode-pill ${travelMode === 'motorcycle' ? 'active' : ''}`}
                  onClick={() => setTravelMode('motorcycle')}
                >
                  <TbMotorbike /> Xe máy
                </button>
                <button
                  type="button"
                  className={`tn-mode-pill ${travelMode === 'walking' ? 'active' : ''}`}
                  onClick={() => setTravelMode('walking')}
                >
                  <TbWalk /> Đi bộ
                </button>
              </div>
            </div>

            <div className="tn-map-cta-right">
              <button
                type="button"
                className={`primary-gradient-btn tn-gmaps-direction-btn ${isLocating ? 'locating' : ''}`}
                onClick={() => (onOpenMapPage ? onOpenMapPage(accommodation) : setIsMapModalOpen(true))}
                title="Xem bản đồ và chỉ đường trên trang chuyên biệt"
              >
                <TbNavigation className="tn-nav-icon-spin" />
                <span>Chỉ đường trực tiếp</span>
                <span className="tn-gmaps-live-tag">Trang riêng</span>
              </button>
            </div>
          </div>
        </div>

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

      {/* In-app Interactive Google Maps & Directions Modal */}
      <InteractiveMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        target={accommodation}
      />
    </div>
  );
};

export default AccommodationDetailPage;
