import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './MapDirectionsPage.css';
import {
  TbArrowLeft,
  TbMapPin,
  TbNavigation,
  TbCar,
  TbMotorbike,
  TbBus,
  TbBike,
  TbWalk,
  TbCopy,
  TbExternalLink,
  TbRoute,
  TbClock,
  TbCurrentLocation,
  TbCheck,
  TbShieldCheck,
  TbSparkles,
  TbStarFilled,
  TbCoffee,
  TbTrees,
  TbBuildingSkyscraper,
  TbPlaneDeparture,
  TbSailboat,
  TbCalendar,
  TbChevronRight,
  TbArrowsExchange,
  TbAlertTriangle,
} from 'react-icons/tb';
import {
  getTargetCoordinates,
  calculateDistanceKm,
  estimateTravelTime,
  getUserLocation,
  getCachedUserLocation,
  openGoogleMapsDirections,
  getGoogleMapsEmbedDirectionsUrl,
  resolveCanonicalCity,
  CITY_COORDINATES,
  findNearestAirport,
  VIETNAM_AIRPORTS,
} from '@/utils/mapUtils';
import { useToast } from '@/context/ToastContext';

// Comprehensive City Presets Hubs
export const CITY_PRESETS = {
  'Đà Lạt': [
    { name: 'Trung tâm TP. Đà Lạt', lat: 11.9404, lng: 108.4583, tag: 'Trung tâm' },
    { name: 'Sân bay Liên Khương (DLI)', lat: 11.7506, lng: 108.3732, tag: 'Sân bay' },
    { name: 'Hồ Tuyền Lâm & Cáp treo', lat: 11.9056, lng: 108.4312, tag: 'Bến thuyền' },
    { name: 'Quảng trường Lâm Viên', lat: 11.9360, lng: 108.4452, tag: 'Quảng trường' },
    { name: 'Bến xe Liên tỉnh Đà Lạt', lat: 11.9288, lng: 108.4449, tag: 'Bến xe' },
    { name: 'Chợ đêm Đà Lạt', lat: 11.9425, lng: 108.4375, tag: 'Ẩm thực' },
  ],
  'Phú Quốc': [
    { name: 'Sân bay Quốc tế Phú Quốc (PQC)', lat: 10.1698, lng: 103.9931, tag: 'Sân bay' },
    { name: 'Bến tàu Bãi Vòng', lat: 10.1523, lng: 104.0534, tag: 'Bến tàu' },
    { name: 'Thị trấn Dương Đông & Chợ đêm', lat: 10.2222, lng: 103.9632, tag: 'Trung tâm' },
    { name: 'Grand World Phú Quốc', lat: 10.3274, lng: 103.8569, tag: 'Vui chơi' },
    { name: 'Cảng An Thới', lat: 10.0270, lng: 104.0150, tag: 'Bến cảng' },
  ],
  'Nha Trang': [
    { name: 'Sân bay Cam Ranh (CXR)', lat: 11.9982, lng: 109.2194, tag: 'Sân bay' },
    { name: 'Bến tàu Du lịch Cầu Đá', lat: 12.2033, lng: 109.2133, tag: 'Bến tàu' },
    { name: 'Tháp Trầm Hương & Biển Trần Phú', lat: 12.2388, lng: 109.1967, tag: 'Trung tâm' },
    { name: 'Ga xe lửa Nha Trang', lat: 12.2479, lng: 109.1869, tag: 'Ga tàu' },
    { name: 'Bến xe Phía Nam Nha Trang', lat: 12.2330, lng: 109.1670, tag: 'Bến xe' },
  ],
  'Hội An': [
    { name: 'Chùa Cầu & Phố cổ Hội An', lat: 15.8778, lng: 108.3268, tag: 'Phố cổ' },
    { name: 'Sân bay Quốc tế Đà Nẵng (DAD)', lat: 16.0544, lng: 108.2022, tag: 'Sân bay' },
    { name: 'Bến tàu Cửa Đại (Cù Lao Chàm)', lat: 15.8820, lng: 108.3840, tag: 'Bến tàu' },
    { name: 'Bãi biển An Bàng', lat: 15.9083, lng: 108.3475, tag: 'Bãi biển' },
  ],
  'Đà Nẵng': [
    { name: 'Sân bay Quốc tế Đà Nẵng (DAD)', lat: 16.0544, lng: 108.2022, tag: 'Sân bay' },
    { name: 'Cầu Rồng & Trung tâm Đà Nẵng', lat: 16.0610, lng: 108.2270, tag: 'Trung tâm' },
    { name: 'Bến du thuyền Sông Hàn', lat: 16.0715, lng: 108.2240, tag: 'Bến thuyền' },
    { name: 'Bãi biển Mỹ Khê', lat: 16.0583, lng: 108.2460, tag: 'Bãi biển' },
    { name: 'Bà Nà Hills & Cầu Vàng', lat: 15.9950, lng: 107.9960, tag: 'Cảnh quan' },
  ],
  'Sa Pa': [
    { name: 'Nhà thờ Đá Sa Pa & Quảng trường', lat: 22.3364, lng: 103.8438, tag: 'Trung tâm' },
    { name: 'Ga Cáp treo Fansipan Legend', lat: 22.3168, lng: 103.8247, tag: 'Cáp treo' },
    { name: 'Bản Cát Cát', lat: 22.3271, lng: 103.8349, tag: 'Làng bản' },
    { name: 'Đèo Ô Quy Hồ & Cổng trời', lat: 22.3550, lng: 103.7740, tag: 'Đèo núi' },
  ],
  'Vũng Tàu': [
    { name: 'Bến tàu Cánh Ngầm Vũng Tàu', lat: 10.3460, lng: 107.0753, tag: 'Bến tàu' },
    { name: 'Bãi Sau & Tượng Chúa Kito', lat: 10.3283, lng: 107.0874, tag: 'Điểm tham quan' },
    { name: 'Bãi Trước & Ngọn Hải Đăng', lat: 10.3460, lng: 107.0843, tag: 'Trung tâm' },
  ],
  'Hạ Long': [
    { name: 'Cảng tàu Khách Quốc tế Hạ Long', lat: 20.9530, lng: 107.0520, tag: 'Cảng tàu' },
    { name: 'Sân bay Quốc tế Vân Đồn (VDO)', lat: 21.1180, lng: 107.4150, tag: 'Sân bay' },
    { name: 'Trung tâm Bãi Cháy', lat: 20.9600, lng: 107.0370, tag: 'Trung tâm' },
  ],
  'Hà Nội': [
    { name: 'Sân bay Quốc tế Nội Bài (HAN)', lat: 21.2187, lng: 105.8041, tag: 'Sân bay' },
    { name: 'Hồ Hoàn Kiếm & Phố cổ Hà Nội', lat: 21.0285, lng: 105.8542, tag: 'Trung tâm' },
    { name: 'Ga Hà Nội', lat: 21.0245, lng: 105.8412, tag: 'Ga tàu' },
  ],
  'TP. Hồ Chí Minh': [
    { name: 'Sân bay Quốc tế Tân Sơn Nhất (SGN)', lat: 10.8185, lng: 106.6588, tag: 'Sân bay' },
    { name: 'Bến tàu Cao tốc Bạch Đằng', lat: 10.7735, lng: 106.7065, tag: 'Bến tàu' },
    { name: 'Chợ Bến Thành & Phố đi bộ Nguyễn Huệ', lat: 10.7725, lng: 106.6980, tag: 'Trung tâm' },
    { name: 'Bến xe Miền Đông mới', lat: 10.8800, lng: 106.8150, tag: 'Bến xe' },
  ],
};

export const MapDirectionsPage = ({
  accommodation,
  onBack,
  onBookNow,
  currency = 'VND',
}) => {
  const toast = useToast();
  const [travelMode, setTravelMode] = useState('driving');
  
  // Instant 0ms Geolocation from Cache if available
  const [userLocation, setUserLocation] = useState(() => getCachedUserLocation());
  const [isLocating, setIsLocating] = useState(false);

  // Swap Route state: false = Origin -> Destination; true = Destination -> Origin (Return Trip)
  const [isReversed, setIsReversed] = useState(false);

  // Selected Origin (Preset or Custom or GPS) - default is NULL so it always uses user GPS
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customOriginText, setCustomOriginText] = useState('');
  const [isCustomInputActive, setIsCustomInputActive] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Target destination coordinates & metadata (Defensive Null-safety)
  const targetCoords = useMemo(() => getTargetCoordinates(accommodation), [accommodation]);
  const placeTitle = accommodation?.nameVi || accommodation?.title || 'Chỗ nghỉ TripNest';
  const rawCity = accommodation?.city || accommodation?.location || 'Đà Lạt';
  const placeCity = useMemo(() => resolveCanonicalCity(rawCity), [rawCity]);
  const placeAddress = accommodation?.address || `${placeCity}, Việt Nam`;
  const placeRating = accommodation?.rating || accommodation?.bookingScore || 5.0;
  const placeReviewsCount = accommodation?.reviewsCount || 145;
  const placeImage =
    Array.isArray(accommodation?.images) && accommodation?.images.length > 0
      ? accommodation.images[0]
      : 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800';

  // City preset options with fallback
  const cityPresets = useMemo(() => {
    return (
      CITY_PRESETS[placeCity] || [
        { name: `Trung tâm ${placeCity}`, lat: targetCoords.lat + 0.015, lng: targetCoords.lng + 0.015, tag: 'Trung tâm' },
        { name: 'Sân bay gần nhất', lat: targetCoords.lat - 0.15, lng: targetCoords.lng - 0.05, tag: 'Sân bay' },
        { name: 'Bến xe khách', lat: targetCoords.lat + 0.01, lng: targetCoords.lng + 0.01, tag: 'Bến xe' },
      ]
    );
  }, [placeCity, targetCoords]);

  // Dedicated Hub Finders for specialized transport modes
  // 1. Departure Airport (Nearest airport to the USER'S CURRENT GPS LOCATION)
  const departureAirport = useMemo(() => {
    const userCoords = userLocation || CITY_COORDINATES['Hà Nội']; // default to user location
    return findNearestAirport(userCoords);
  }, [userLocation]);

  // 2. Arrival Airport (Nearest airport to the DESTINATION ACCOMMODATION)
  const arrivalAirport = useMemo(() => {
    return findNearestAirport(targetCoords);
  }, [targetCoords]);

  // Check if flight is intercity (> 60km between departure airport and arrival airport)
  const isIntercityFlight = useMemo(() => {
    return departureAirport.code !== arrivalAirport.code;
  }, [departureAirport, arrivalAirport]);

  // Flight flight distance in km (crow-flies)
  const airDistanceKm = useMemo(() => {
    return calculateDistanceKm(
      departureAirport.lat,
      departureAirport.lng,
      arrivalAirport.lat,
      arrivalAirport.lng,
      1.0
    ) || 950;
  }, [departureAirport, arrivalAirport]);

  // Ground transfer from arrival airport to homestay in km
  const groundTransferKm = useMemo(() => {
    return calculateDistanceKm(
      arrivalAirport.lat,
      arrivalAirport.lng,
      targetCoords.lat,
      targetCoords.lng,
      1.25
    ) || 28;
  }, [arrivalAirport, targetCoords]);

  // Flight duration string
  const flightDurationText = useMemo(() => {
    if (airDistanceKm > 800) return '1h 50m bay';
    if (airDistanceKm > 400) return '1h 10m bay';
    return '45m bay';
  }, [airDistanceKm]);

  const boatHub = useMemo(() => {
    return cityPresets.find((p) => p.tag === 'Bến tàu' || p.tag === 'Bến cảng' || p.tag === 'Cảng tàu' || p.tag === 'Bến thuyền' || p.name.includes('Bến') || p.name.includes('Hồ') || p.name.includes('Cảng')) || {
      name: `Bến thuyền / Cảng ${placeCity}`,
      lat: targetCoords.lat - 0.03,
      lng: targetCoords.lng - 0.01,
    };
  }, [cityPresets, placeCity, targetCoords]);

  // Fetch fresh user GPS location automatically on mount
  const fetchCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    const result = await getUserLocation(6000);
    setIsLocating(false);

    if (result.success && result.coords) {
      setUserLocation(result.coords);
      setSelectedPreset(null);
      setIsCustomInputActive(false);
      setCustomOriginText('');
      toast?.success?.('Vị trí hiện tại đã kết nối', 'Tuyến đường từ vị trí của bạn đến chỗ nghỉ');
    } else {
      console.warn('Geolocation fallback:', result.error);
    }
  }, [toast]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchCurrentLocation();
  }, [fetchCurrentLocation]);

  // Active Origin Calculation (Tailored dynamically per travel mode)
  const activeOrigin = useMemo(() => {
    // 1. Custom text input
    if (isCustomInputActive && customOriginText.trim()) {
      const match = cityPresets.find((p) =>
        p.name.toLowerCase().includes(customOriginText.toLowerCase())
      );
      if (match) return { coords: { lat: match.lat, lng: match.lng }, label: match.name, isGps: false };
      return { coords: null, queryText: customOriginText, label: customOriginText, isGps: false };
    }

    // 2. Explicit Selected Preset
    if (selectedPreset) {
      return {
        coords: { lat: selectedPreset.lat, lng: selectedPreset.lng },
        label: selectedPreset.name,
        isGps: false,
      };
    }

    // 3. Flight Mode: Departure Airport from User's Current Location
    if (travelMode === 'flight') {
      if (isIntercityFlight) {
        return {
          coords: { lat: departureAirport.lat, lng: departureAirport.lng },
          label: `${departureAirport.name} (Sân bay xuất phát gần bạn)`,
          isGps: false,
        };
      }
      return {
        coords: userLocation || targetCoords,
        label: `Vị trí hiện tại của bạn (Cùng khu vực ${placeCity})`,
        isGps: true,
      };
    }

    // 4. Boat Mode: Local Pier / Port
    if (travelMode === 'boat') {
      return {
        coords: { lat: boatHub.lat, lng: boatHub.lng },
        label: `${boatHub.name} (Bến thuyền / Cảng)`,
        isGps: false,
      };
    }

    // 5. User's Current Live Location (PRIMARY DEFAULT for Car, Motorcycle, Bus, Bicycle, Walking)
    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      return {
        coords: userLocation,
        label: `Vị trí hiện tại của bạn (${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)})`,
        isGps: true,
      };
    }

    // Fallback if GPS is still detecting or unavailable
    const defCenter = CITY_COORDINATES[placeCity] || { lat: targetCoords.lat + 0.02, lng: targetCoords.lng + 0.02 };
    return {
      coords: defCenter,
      label: `Vị trí hiện tại của bạn`,
      isGps: true,
    };
  }, [
    isCustomInputActive,
    customOriginText,
    selectedPreset,
    travelMode,
    departureAirport,
    isIntercityFlight,
    boatHub,
    userLocation,
    cityPresets,
    placeCity,
    targetCoords,
  ]);

  // Distance calculation in km (Haversine formula with realistic road curvature)
  const distanceKm = useMemo(() => {
    if (activeOrigin.coords && targetCoords) {
      const curvature = travelMode === 'flight' ? 1.0 : travelMode === 'boat' ? 1.15 : 1.25;
      return calculateDistanceKm(
        activeOrigin.coords.lat,
        activeOrigin.coords.lng,
        targetCoords.lat,
        targetCoords.lng,
        curvature
      );
    }
    return null;
  }, [activeOrigin.coords, targetCoords, travelMode]);

  // Display Distance String with Mode Context
  const displayDistanceText = useMemo(() => {
    if (distanceKm === null) return 'Đang tính...';
    if (travelMode === 'flight') {
      if (isIntercityFlight) {
        return `${airDistanceKm} km bay + ${groundTransferKm} km đón`;
      }
      return `${distanceKm} km (Nội vùng)`;
    }
    if (travelMode === 'boat') {
      return `${distanceKm} km (từ ${boatHub.name})`;
    }
    return `${distanceKm} km`;
  }, [distanceKm, travelMode, isIntercityFlight, airDistanceKm, groundTransferKm, boatHub]);

  // Estimated Travel Time based on active travel mode
  const estimatedTimeText = useMemo(() => {
    if (travelMode === 'flight') {
      if (isIntercityFlight) {
        return `✈️ ${flightDurationText} + 🚗 35m đón`;
      }
      return `8 phút (Nội vùng)`;
    }
    return estimateTravelTime(distanceKm, travelMode);
  }, [distanceKm, travelMode, isIntercityFlight, flightDurationText]);

  // Mode Icon Helper
  const getTravelModeIcon = useCallback((mode) => {
    switch (mode) {
      case 'motorcycle': return <TbMotorbike />;
      case 'bus': return <TbBus />;
      case 'flight': return <TbPlaneDeparture />;
      case 'boat': return <TbSailboat />;
      case 'bicycle': return <TbBike />;
      case 'walking': return <TbWalk />;
      default: return <TbCar />;
    }
  }, []);

  // Mode Banner Description with Guardrails Warning
  const modeBannerText = useMemo(() => {
    if ((travelMode === 'walking' || travelMode === 'bicycle') && distanceKm && distanceKm > 30) {
      return `⚠️ Lộ trình dài (${distanceKm} km), khuyến nghị chuyển sang Ô tô hoặc Xe máy`;
    }
    if (travelMode === 'flight') {
      if (isIntercityFlight) {
        return `✈️ Chuyến bay từ ${departureAirport.name} → ${arrivalAirport.name} (đón về ${placeTitle})`;
      }
      return `✈️ Bạn đang ở cùng khu vực với ${placeCity}. Khuyến nghị đi Ô tô hoặc Xe máy thay vì Máy bay.`;
    }
    switch (travelMode) {
      case 'motorcycle': return '🏍️ Tuyến xe máy linh hoạt đèo dốc & ngõ phố';
      case 'bus': return '🚌 Tuyến xe buýt & xe khách lịch trình cố định';
      case 'boat': return `⛵ Tuyến tàu cao tốc / cano từ ${boatHub.name}`;
      case 'bicycle': return '🚲 Cung đường đạp xe dạo cảnh ven hồ & đồi thông';
      case 'walking': return '🚶 Lối đi bộ dạo cảnh ngắm rừng thông & bậc thang';
      default: return '🚗 Tuyến đường bộ đề xuất tối ưu thời gian thực';
    }
  }, [travelMode, distanceKm, isIntercityFlight, departureAirport, arrivalAirport, placeTitle, boatHub, placeCity]);

  // Embedded Google Maps Iframe URL: Directly routes from active origin to destination (with swap support)
  const iframeSrc = useMemo(() => {
    const originParam = activeOrigin.queryText || activeOrigin.coords;
    return getGoogleMapsEmbedDirectionsUrl(originParam, targetCoords, travelMode, isReversed);
  }, [travelMode, activeOrigin, targetCoords, isReversed]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(placeAddress);
    setCopiedAddress(true);
    toast?.success?.('Đã sao chép địa chỉ', placeAddress);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleOpenExternalGoogleMaps = () => {
    const originParam = activeOrigin.coords || activeOrigin.queryText || (userLocation ? `${userLocation.lat},${userLocation.lng}` : null);
    openGoogleMapsDirections(accommodation, {
      origin: originParam,
      travelMode,
      isReversed,
      onSuccess: () => {
        toast?.success?.('Đang mở Google Maps', 'Lộ trình dẫn đường trực quan đã sẵn sàng!');
      },
    });
  };

  // Surroundings list (Defensive Fallback)
  const surroundings = useMemo(() => {
    return (
      accommodation?.surroundings || [
        { name: `Trung tâm TP. ${placeCity}`, distance: '3.5 km', time: '8 phút', icon: <TbBuildingSkyscraper />, lat: 11.9404, lng: 108.4583 },
        { name: 'Thung lũng & Rừng thông', distance: '850 m', time: '10 phút đi bộ', icon: <TbTrees />, lat: 11.9180, lng: 108.4320 },
        { name: 'Khu ẩm thực & Chợ đêm', distance: '3.6 km', time: '8 phút', icon: <TbCoffee />, lat: 11.9425, lng: 108.4375 },
        { name: 'Sân bay Liên Khương (DLI)', distance: '28 km', time: '35 phút', icon: <TbPlaneDeparture />, lat: 11.7506, lng: 108.3732 },
      ]
    );
  }, [accommodation, placeCity]);

  // Labels for Swap Route nodes
  const firstNodeTitle = isReversed ? 'Điểm xuất phát (Chỗ nghỉ)' : 'Điểm xuất phát';
  const firstNodeLabel = isReversed ? placeTitle : activeOrigin.label;
  const secondNodeTitle = isReversed ? 'Điểm đến (Vị trí kết thúc)' : 'Điểm đến (Nghỉ dưỡng)';
  const secondNodeLabel = isReversed ? activeOrigin.label : placeTitle;

  return (
    <div className="map-page-main-container">
      {/* 1. TOP HEADER & BREADCRUMB BAR (Synchronized 1280px) */}
      <header className="map-page-top-bar">
        <div className="map-page-top-inner">
          <div className="map-top-left">
            <button
              type="button"
              className="map-back-nav-btn"
              onClick={onBack}
              title="Quay lại trang chi tiết cơ sở lưu trú"
            >
              <TbArrowLeft />
              <span>Quay lại chi tiết</span>
            </button>

            <div className="map-breadcrumbs">
              <span className="crumb-link" onClick={onBack}>Trang chủ</span>
              <TbChevronRight className="crumb-sep" />
              <span className="crumb-link" onClick={onBack}>{placeCity}</span>
              <TbChevronRight className="crumb-sep" />
              <strong className="crumb-current">{placeTitle}</strong>
            </div>
          </div>

          <div className="map-top-right">
            <button
              type="button"
              className="map-top-copy-btn"
              onClick={handleCopyAddress}
            >
              {copiedAddress ? <TbCheck style={{ color: '#10b981' }} /> : <TbCopy />}
              <span>{copiedAddress ? 'Đã sao chép' : 'Sao chép địa chỉ'}</span>
            </button>
            <button
              type="button"
              className="primary-gradient-btn map-top-book-btn"
              onClick={onBack}
            >
              <TbCalendar /> Đặt phòng ngay
            </button>
          </div>
        </div>
      </header>

      {/* 2. SPLIT LAYOUT WRAPPER (Synchronized with 1280px container) */}
      <div className="map-page-content-wrapper">
        <div className="map-page-split-layout">
          {/* LEFT PANEL: HIERARCHICAL PRO NAVIGATION DASHBOARD (420px) */}
          <aside className="map-left-sidebar">
            {/* PRIORITY 1: DESTINATION HERO CARD */}
            <div className="map-dest-hero-card">
              <img src={placeImage} alt={placeTitle} className="map-dest-thumb" />
              <div className="map-dest-details">
                <span className="map-dest-city-chip">{placeCity}</span>
                <h2 className="map-dest-title">{placeTitle}</h2>
                <div className="map-dest-rating-line">
                  <div className="map-star-score">
                    <TbStarFilled style={{ color: '#ff385c' }} />
                    <strong>{Number(placeRating).toFixed(1)}</strong>
                  </div>
                  <span className="map-reviews-count">({placeReviewsCount} đánh giá)</span>
                  <span className="map-location-tag">Vị trí 9.8</span>
                </div>
                <p className="map-dest-address-text" title={placeAddress}>
                  <TbMapPin className="map-dest-pin-icon" />
                  <span>{placeAddress}</span>
                </p>
              </div>
            </div>

            {/* PRIORITY 2: ROUTE CONTROLLER (WITH SWAP ROUTE SUPPORT) */}
            <div className="map-route-box">
              {/* Origin Node */}
              <div className="map-route-node start">
                <div className="map-node-dot origin" />
                <div className="map-node-body">
                  <div className="map-node-header">
                    <span className="map-node-type">{firstNodeTitle}</span>
                    {!isReversed && !selectedPreset && !isCustomInputActive && travelMode !== 'flight' && travelMode !== 'boat' && (
                      <span className="map-gps-live-indicator">
                        <span className="map-gps-live-dot" /> Vị trí hiện tại
                      </span>
                    )}
                  </div>

                  {!isReversed && isCustomInputActive ? (
                    <input
                      type="text"
                      className="map-origin-input"
                      placeholder="Nhập địa điểm xuất phát..."
                      value={customOriginText}
                      onChange={(e) => setCustomOriginText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsCustomInputActive(false);
                      }}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="map-origin-pill"
                      onClick={() => {
                        if (!isReversed) setIsCustomInputActive(true);
                      }}
                      title={!isReversed ? 'Nhấp để nhập địa điểm xuất phát thủ công' : ''}
                    >
                      {!isReversed && <span className="map-gps-pulsing-dot" />}
                      <span className="map-origin-name">{firstNodeLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Swap Route Connector Button */}
              <div className="map-route-line-connector" />
              <button
                type="button"
                className="map-swap-route-btn"
                onClick={() => {
                  setIsReversed((prev) => !prev);
                  toast?.info?.(
                    isReversed ? 'Lộ trình: Đến chỗ nghỉ' : 'Lộ trình: Rời chỗ nghỉ',
                    isReversed ? `Từ ${activeOrigin.label} → ${placeTitle}` : `Từ ${placeTitle} → ${activeOrigin.label}`
                  );
                }}
                title="Đổi chiều lộ trình (Đi ⇄ Về)"
              >
                <TbArrowsExchange />
              </button>

              {/* Destination Node */}
              <div className="map-route-node end">
                <div className="map-node-dot dest" />
                <div className="map-node-body">
                  <span className="map-node-type">{secondNodeTitle}</span>
                  <strong className="map-dest-node-name">{secondNodeLabel}</strong>
                </div>
              </div>
            </div>

            {/* PRIORITY 3: TRAVEL MODE SELECTOR (7 Dedicated Modes) */}
            <div className="map-mode-selector-wrap">
              <span className="map-section-label">Phương tiện di chuyển:</span>
              <div className="map-modes-grid">
                <button
                  type="button"
                  className={`map-mode-tab ${travelMode === 'driving' ? 'active' : ''}`}
                  onClick={() => {
                    setTravelMode('driving');
                    toast?.info?.('Đã chọn Ô tô', 'Tuyến đường bộ/cao tốc tối ưu');
                  }}
                  title="Di chuyển bằng Ô tô / Taxi"
                >
                  <TbCar />
                  <span>Ô tô</span>
                </button>
                <button
                  type="button"
                  className={`map-mode-tab ${travelMode === 'motorcycle' ? 'active' : ''}`}
                  onClick={() => {
                    setTravelMode('motorcycle');
                    toast?.info?.('Đã chọn Xe máy', 'Tuyến đường đèo dốc & ngõ phố');
                  }}
                  title="Di chuyển bằng Xe máy"
                >
                  <TbMotorbike />
                  <span>Xe máy</span>
                </button>
                <button
                  type="button"
                  className={`map-mode-tab ${travelMode === 'bus' ? 'active' : ''}`}
                  onClick={() => {
                    setTravelMode('bus');
                    toast?.info?.('Đã chọn Xe buýt', 'Tuyến xe buýt & xe khách trung chuyển');
                  }}
                  title="Di chuyển bằng Xe buýt / Xe khách"
                >
                  <TbBus />
                  <span>Xe buýt</span>
                </button>
                <button
                  type="button"
                  className={`map-mode-tab ${travelMode === 'flight' ? 'active' : ''}`}
                  onClick={() => {
                    setTravelMode('flight');
                    toast?.info?.('Đã chọn Máy bay', `Lộ trình đón từ ${airportHub.name} đến chỗ nghỉ`);
                  }}
                  title="Chuyến bay liên tỉnh / Trung chuyển sân bay"
                >
                  <TbPlaneDeparture />
                  <span>Máy bay</span>
                </button>
                <button
                  type="button"
                  className={`map-mode-tab ${travelMode === 'boat' ? 'active' : ''}`}
                  onClick={() => {
                    setTravelMode('boat');
                    toast?.info?.('Đã chọn Tàu thuyền', `Lộ trình cano / du thuyền từ ${boatHub.name}`);
                  }}
                  title="Tàu cao tốc / Du thuyền / Ca nô"
                >
                  <TbSailboat />
                  <span>Tàu thuyền</span>
                </button>
                <button
                  type="button"
                  className={`map-mode-tab ${travelMode === 'bicycle' ? 'active' : ''}`}
                  onClick={() => {
                    setTravelMode('bicycle');
                    toast?.info?.('Đã chọn Xe đạp', 'Cung đường đạp xe dạo cảnh quanh hồ/phố');
                  }}
                  title="Di chuyển bằng Xe đạp"
                >
                  <TbBike />
                  <span>Xe đạp</span>
                </button>
                <button
                  type="button"
                  className={`map-mode-tab ${travelMode === 'walking' ? 'active' : ''}`}
                  onClick={() => {
                    setTravelMode('walking');
                    toast?.info?.('Đã chọn Đi bộ', 'Lối đi bộ dạo cảnh ngắm rừng thông');
                  }}
                  title="Đi bộ dạo cảnh"
                >
                  <TbWalk />
                  <span>Đi bộ</span>
                </button>
              </div>
            </div>

            {/* PRIORITY 4: REAL-TIME DISTANCE & DURATION METRICS */}
            <div className="map-metrics-card">
              <div className="map-metrics-grid">
                <div className="map-metric-col">
                  <span className="map-m-label">Khoảng cách</span>
                  <div className="map-m-val">
                    {travelMode === 'flight' && isIntercityFlight ? (
                      <>
                        <span className="map-m-main">{Math.round(airDistanceKm)} km bay</span>
                        <span className="map-m-sub">+ {Math.round(groundTransferKm)} km đón sân bay</span>
                      </>
                    ) : (
                      <span className="map-m-main">{displayDistanceText}</span>
                    )}
                  </div>
                </div>
                <div className="map-m-divider" />
                <div className="map-metric-col">
                  <span className="map-m-label">Thời gian dự kiến</span>
                  <div className="map-m-val highlight">
                    {travelMode === 'flight' && isIntercityFlight ? (
                      <>
                        <span className="map-m-main"><TbPlaneDeparture /> {flightDurationText}</span>
                        <span className="map-m-sub">+ 🚗 35m đón sân bay</span>
                      </>
                    ) : (
                      <span className="map-m-main">{getTravelModeIcon(travelMode)} {estimatedTimeText}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="map-safety-banner">
                <TbShieldCheck /> {modeBannerText}
              </div>
            </div>

            {/* PRIORITY 5: POPULAR LOCAL PRESET HUBS */}
            <div className="map-presets-block">
              <span className="map-presets-title">Điểm xuất phát phổ biến tại {placeCity}:</span>
              <div className="map-presets-list">
                <button
                  type="button"
                  className={`map-preset-button ${!selectedPreset && !isCustomInputActive && travelMode !== 'flight' && travelMode !== 'boat' ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedPreset(null);
                    setIsCustomInputActive(false);
                    setCustomOriginText('');
                    if (travelMode === 'flight' || travelMode === 'boat') {
                      setTravelMode('driving');
                    }
                    fetchCurrentLocation();
                  }}
                  title="Xem lộ trình từ vị trí GPS hiện tại của bạn"
                >
                  📍 Vị trí hiện tại của tôi
                </button>

                {cityPresets.map((preset, idx) => {
                  const isSelected = selectedPreset?.name === preset.name && !isCustomInputActive;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`map-preset-button ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedPreset(preset);
                        setIsCustomInputActive(false);
                        setCustomOriginText('');
                        if (preset.tag === 'Sân bay') setTravelMode('flight');
                        else if (preset.tag === 'Bến tàu' || preset.tag === 'Bến thuyền' || preset.tag === 'Bến cảng' || preset.tag === 'Cảng tàu') setTravelMode('boat');
                        else if (preset.tag === 'Bến xe' || preset.tag === 'Ga tàu') setTravelMode('bus');
                        toast?.info?.('Đã chọn điểm xuất phát', `Từ "${preset.name}" đến ${placeTitle}`);
                      }}
                    >
                      + {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRIORITY 6: NEARBY SURROUNDINGS & ATTRACTIONS */}
            <div className="map-surroundings-block">
              <h4 className="map-surroundings-title">Địa danh lân cận</h4>
              <div className="map-surroundings-items">
                {surroundings.map((item, idx) => {
                  const isSelected = selectedPreset?.name === item.name;
                  return (
                    <div
                      key={idx}
                      className={`map-surrounding-card ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPreset({ name: item.name, lat: item.lat || targetCoords.lat, lng: item.lng || targetCoords.lng });
                        setIsCustomInputActive(false);
                        toast?.info?.('Đã đặt lộ trình', `Từ "${item.name}" đến ${placeTitle}`);
                      }}
                      title="Nhấp để xem lộ trình từ địa danh này"
                    >
                      <div className="map-surr-icon-box">{item.icon || <TbMapPin />}</div>
                      <div className="map-surr-meta">
                        <strong>{item.name}</strong>
                        <span>{item.distance} · {item.time}</span>
                      </div>
                      <button type="button" className="map-surr-action-arrow">
                        <TbRoute />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PRIORITY 7: EXTERNAL GOOGLE MAPS APP LAUNCHER */}
            <div className="map-external-footer">
              <button
                type="button"
                className="map-external-app-btn"
                onClick={handleOpenExternalGoogleMaps}
                title="Mở ứng dụng Google Maps để nhận dẫn đường giọng nói Turn-by-Turn"
              >
                <TbNavigation />
                <span>Mở Google Maps App</span>
                <TbExternalLink />
              </button>
            </div>
          </aside>

          {/* RIGHT STAGE: FULL VIEWPORT INTERACTIVE MAP */}
          <main className="map-right-viewport">
            {/* FLOATING SMART OPTIMAL ROUTE BADGE (Top Right - Single Clean Pill) */}
            <div className="map-floating-top-controls">
              <div className="map-single-optimal-badge">
                <TbRoute />
                <span>Tuyến đường tối ưu</span>
              </div>
            </div>

            <iframe
              title={`Bản đồ lộ trình ${placeTitle}`}
              className="map-full-iframe"
              src={iframeSrc}
              loading="lazy"
              allowFullScreen
            />

            {/* COMPACT FLOATING BADGE AT BOTTOM-LEFT (Never covers routes or map controls) */}
            <div className="map-floating-bottom-badge">
              <div className="map-pulse-circle-mini">
                <TbMapPin />
              </div>
              <div className="map-floating-info-mini">
                <span className="map-badge-venue">{placeTitle}</span>
                <span className="map-badge-coords">
                  {targetCoords.lat.toFixed(4)}° N, {targetCoords.lng.toFixed(4)}° E
                </span>
              </div>
              <div className="map-badge-verified-tag">
                <TbSparkles /> Định vị chuẩn
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MapDirectionsPage;
