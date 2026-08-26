import './RoomDetailPage.css';
import React, { useState, useEffect, useMemo } from 'react';
import { removeVietnameseTones } from '@/utils/textUtils';
import {
  TbArrowLeft,
  TbStarFilled,
  TbShare,
  TbHeart,
  TbHeartFilled,
  TbShieldCheck,
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
  TbBed,
  TbUsers,
  TbCheck,
  TbX,
  TbChevronLeft,
  TbChevronRight,
  TbGridDots,
  TbMapPin,
  TbCalendar,
  TbSparkles,
  TbAward,
  TbClock,
  TbCompass,
  TbBuildingCommunity,
  TbMessageCircle,
  TbMessageCheck,
  TbLock,
  TbInfoCircle,
  TbCrown,
  TbMaximize,
  TbBolt,
  TbSun,
  TbCoffee,
  TbTrees,
  TbBuildingSkyscraper,
  TbPlaneDeparture,
  TbWalk,
  TbListCheck,
} from 'react-icons/tb';

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
  'Tủ lạnh': <TbToolsKitchen2 />,
  'Tivi': <TbDeviceLaptop />,
};

export const RoomDetailPage = ({
  room,
  allRooms = [],
  experiences = [],
  searchParams = {},
  onBack,
  onSelectRoom,
  currency = 'VND',
  isFavorite = false,
  onToggleFavorite,
  onBookRoom,
  onStartCheckout,
}) => {
  // Today and default check-in/out
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);
  const defaultOutStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  }, []);

  const defaultCheckIn = searchParams.checkInDate || searchParams.checkIn || tomorrowStr;
  const defaultCheckOut = searchParams.checkOutDate || searchParams.checkOut || defaultOutStr;

  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guestCount, setGuestCount] = useState(Number(searchParams.guests) || 2);
  const [copiedLink, setCopiedLink] = useState(false);

  const getNextDayStr = (dateStr) => {
    if (!dateStr) return todayStr;
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Review keyword filter chip state
  const [activeReviewKeyword, setActiveReviewKeyword] = useState('all');

  // Lightbox modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(0);

  // Description expand state
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  // All amenities modal state
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  // Contact host toast state
  const [contactToast, setContactToast] = useState(false);

  // Scroll to top when room changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [room?.id]);

  // Smooth scroll to interactive booking calendar
  const scrollToCalendar = (e) => {
    if (e) e.preventDefault();
    const el = document.getElementById('section-calendar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Vietnamese date formatter
  const formatVNDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parseInt(parts[2], 10)} thg ${parseInt(parts[1], 10)}, ${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) =>
          prev === 0 ? (room?.images?.length || 1) - 1 : prev - 1
        );
      }
      if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) =>
          prev === (room?.images?.length || 1) - 1 ? 0 : prev + 1
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, room]);

  if (!room) {
    return (
      <div className="room-detail-page-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Không tìm thấy thông tin phòng nghỉ</h2>
        <p style={{ color: '#717171', margin: '1rem 0 2rem' }}>
          Chỗ ở này có thể đã được cập nhật hoặc không còn khả dụng trên hệ thống.
        </p>
        <button className="hero-reserve-gradient-btn" style={{ width: 'auto', padding: '0.85rem 2.25rem' }} onClick={onBack}>
          Quay lại danh sách phòng
        </button>
      </div>
    );
  }

  // Ensure at least 8 luxury resort photos for the 2-tier collage layout
  const galleryPhotos = useMemo(() => {
    const base = room.images && room.images.length > 0 ? room.images : [];
    const fallbackList = [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    ];
    const merged = [...base];
    for (const fb of fallbackList) {
      if (merged.length < 8 && !merged.includes(fb)) {
        merged.push(fb);
      }
    }
    return merged;
  }, [room.images]);

  // Alias for lightbox and reserve functions
  const images = galleryPhotos;

  // 6 Curated Recommendations prioritized by exact same location/city:
  // 1. First find all other rooms in the SAME destination/city (excluding current room).
  // 2. If fewer than 6, fill remaining slots with rooms from OTHER destinations.
  // 3. If still fewer than 6, backfill with high-quality styled cards.
  const sideRecommendations = useMemo(() => {
    if (!room) return [];

    const norm = (str) => removeVietnameseTones(str || '');
    const curCity = norm(room.city);
    const curLoc = norm(room.location);

    const isMatchLocation = (r) => {
      if (!r) return false;
      const rCity = norm(r.city);
      const rLoc = norm(r.location);

      if (curCity && rCity && (rCity.includes(curCity) || curCity.includes(rCity))) return true;
      if (curCity && rLoc && rLoc.includes(curCity)) return true;
      if (curLoc && rCity && curLoc.includes(rCity)) return true;
      if (curLoc && rLoc && (rLoc.includes(curLoc) || curLoc.includes(rLoc))) return true;
      return false;
    };

    const sourceRooms = (allRooms && allRooms.length > 0 ? allRooms : []).filter(
      (r) => String(r.id) !== String(room.id)
    );

    // Group 1: Rooms in the exact same location/city
    const sameLocRooms = sourceRooms.filter(isMatchLocation);

    // Group 2: Rooms in other locations
    const otherLocRooms = sourceRooms.filter((r) => !isMatchLocation(r));

    // Combine: same location first, then pad with other locations
    let results = [...sameLocRooms];

    if (results.length < 6) {
      const needed = 6 - results.length;
      results = [...results, ...otherLocRooms.slice(0, needed)];
    }

    // Dynamic demo fallback if total list is still < 6
    if (results.length < 6) {
      const demoList = [
        {
          id: `rec-demo-${room.id}-1`,
          title: `Chalet Gỗ Mộc View Đồi ${room.city || 'Nghỉ Dưỡng'}`,
          city: room.city || 'Sa Pa',
          type: 'Bungalow view mây',
          rating: 4.98,
          reviewsCount: 142,
          priceUSD: Math.round((room.priceUSD || 80) * 0.95),
          priceVND: Math.round((room.priceVND || 2000000) * 0.95),
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400'],
        },
        {
          id: `rec-demo-${room.id}-2`,
          title: `Boutique Ecolodge & Spa ${room.city || 'Nghỉ Dưỡng'}`,
          city: room.city || 'Sa Pa',
          type: 'Resort nghỉ dưỡng',
          rating: 4.96,
          reviewsCount: 118,
          priceUSD: Math.round((room.priceUSD || 80) * 1.1),
          priceVND: Math.round((room.priceVND || 2000000) * 1.1),
          images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400'],
        },
        {
          id: `rec-demo-${room.id}-3`,
          title: `Villa Sân Vườn Biệt Lập ${room.city || 'Nghỉ Dưỡng'}`,
          city: room.city || 'Sa Pa',
          type: 'Biệt thự riêng tư',
          rating: 4.95,
          reviewsCount: 96,
          priceUSD: Math.round((room.priceUSD || 80) * 1.25),
          priceVND: Math.round((room.priceVND || 2000000) * 1.25),
          images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400'],
        },
        {
          id: `rec-demo-${room.id}-4`,
          title: `Panorama Skyview Studio ${room.city || 'Nghỉ Dưỡng'}`,
          city: room.city || 'Sa Pa',
          type: 'Studio view toàn cảnh',
          rating: 4.92,
          reviewsCount: 75,
          priceUSD: Math.round((room.priceUSD || 80) * 0.85),
          priceVND: Math.round((room.priceVND || 2000000) * 0.85),
          images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400'],
        },
        {
          id: `rec-demo-${room.id}-5`,
          title: `Riverside Bamboo House ${room.city || 'Nghỉ Dưỡng'}`,
          city: room.city || 'Sa Pa',
          type: 'Nhà tre ven suối',
          rating: 4.97,
          reviewsCount: 130,
          priceUSD: Math.round((room.priceUSD || 80) * 0.9),
          priceVND: Math.round((room.priceVND || 2000000) * 0.9),
          images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'],
        },
        {
          id: `rec-demo-${room.id}-6`,
          title: `Luxury Glass Heritage Villa ${room.city || 'Nghỉ Dưỡng'}`,
          city: room.city || 'Sa Pa',
          type: 'Biệt thự kính panorama',
          rating: 4.99,
          reviewsCount: 168,
          priceUSD: Math.round((room.priceUSD || 80) * 1.4),
          priceVND: Math.round((room.priceVND || 2000000) * 1.4),
          images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'],
        },
      ];

      for (const fallback of demoList) {
        if (results.length < 6 && !results.some((r) => r.title === fallback.title || r.id === fallback.id)) {
          results.push(fallback);
        }
      }
    }

    return results.slice(0, 6);
  }, [allRooms, room]);

  const hasSameLocationRooms = useMemo(() => {
    if (!room || !sideRecommendations || sideRecommendations.length === 0) return false;
    const norm = (str) => removeVietnameseTones(str || '');
    const curCity = norm(room.city);
    return sideRecommendations.some((rec) => {
      const rCity = norm(rec.city);
      return curCity && rCity && (rCity.includes(curCity) || curCity.includes(rCity));
    });
  }, [room, sideRecommendations]);

  // Calculate nights with auto-adjustment
  const calculateNights = () => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 5;
    }
  };

  const nights = calculateNights();

  // Price calculations
  const pricePerNight = currency === 'USD' ? room.priceUSD : (room.priceVND || room.priceUSD * 25000);
  const baseTotal = pricePerNight * nights;
  const cleaningFee = currency === 'USD' ? 30 : 500000;
  const serviceFee = Math.round(baseTotal * 0.12);
  const grandTotal = baseTotal + cleaningFee + serviceFee;

  const formatPriceVal = (val) => {
    if (currency === 'USD') return `$${Math.round(val).toLocaleString()}`;
    if (currency === 'EUR') return `€${Math.round(val * 0.92).toLocaleString()}`;
    return `${Math.round(val).toLocaleString()} ₫`;
  };

  const formatExpPrice = (exp) => {
    const usdVal = exp.rentUSD || exp.priceUSD || 35;
    const vndVal = exp.rentVND || exp.priceVND || (usdVal * 25000);
    if (currency === 'USD') return `$${usdVal.toLocaleString()}`;
    if (currency === 'EUR') return `€${Math.round(usdVal * 0.92).toLocaleString()}`;
    return `${vndVal.toLocaleString()} ₫`;
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleReserve = () => {
    const bookingParams = {
      checkIn,
      checkOut,
      nights,
      guests: guestCount,
      totalPrice: grandTotal,
      currency,
    };
    if (onStartCheckout) {
      onStartCheckout(room, bookingParams);
    } else if (onBookRoom) {
      onBookRoom({
        roomId: room.id,
        roomTitle: room.title,
        roomCity: room.city,
        roomImage: images[0],
        ...bookingParams,
      });
    }
  };

  // Smart Recommendations Filtering
  // 1. Same city/destination
  const sameCityRooms = allRooms
    .filter((r) => r.id !== room.id && (r.city === room.city || r.location?.includes(room.city)))
    .slice(0, 4);

  // 2. Same category / style
  const sameCategoryRooms = allRooms
    .filter((r) => r.id !== room.id && r.category === room.category && !sameCityRooms.some(sc => sc.id === r.id))
    .slice(0, 4);

  // 3. Fallback recommendations if list is small
  const topRatedRooms = allRooms
    .filter((r) => r.id !== room.id && !sameCityRooms.some(sc => sc.id === r.id) && !sameCategoryRooms.some(sc => sc.id === r.id))
  const nearbyExperiences = experiences
    .filter((exp) => exp.city?.toLowerCase().includes(room.city?.toLowerCase()) || room.location?.toLowerCase().includes(exp.city?.toLowerCase()))
    .slice(0, 3);

  const displayExperiences = nearbyExperiences.length > 0 ? nearbyExperiences : experiences.slice(0, 3);

  return (
    <div className="room-detail-page-container">
      {/* ========================================================================= */}
      {/* 0. SENSIBLE TOP NAVIGATION: Back Button & Contextual Breadcrumbs */}
      {/* ========================================================================= */}
      <div className="room-top-nav-bar">
        <button className="room-top-back-btn" onClick={onBack} title="Quay lại danh sách phòng">
          <TbArrowLeft className="back-arrow-icon" />
          <span>Quay lại tất cả chỗ ở</span>
        </button>

        <div className="room-breadcrumbs">
          <span className="bc-item" onClick={onBack}>Khám phá</span>
          <TbChevronRight className="bc-separator" />
          <span className="bc-item" onClick={onBack}>{room.city || 'Việt Nam'}</span>
          <TbChevronRight className="bc-separator" />
          <span className="bc-current">{room.type || 'Chỗ ở nghỉ dưỡng'}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP HERO SECTION: Photo Gallery (Left) & Side Recommendations (Right) */}
      {/* ========================================================================= */}
      <div className="gallery-and-recommendations-row">
        {/* Resort Multi-Tier Collage Gallery (Left) */}
        <div className="resort-collage-wrapper">
          {/* Top Tier: 1 Hero Left + 2 Stacked Right */}
          <div className="collage-top-tier">
            {/* 1. Main Hero */}
            <div
              className="collage-item collage-hero-main"
              onClick={() => {
                setActiveLightboxIndex(0);
                setIsLightboxOpen(true);
              }}
            >
              <img
                src={galleryPhotos[0]}
                alt={`${room.title} - Toàn cảnh ngoại thất`}
                className="collage-img"
              />
            </div>

            {/* 2 & 3. Right Stacked Column */}
            <div className="collage-right-stacked">
              <div
                className="collage-item collage-stacked-item"
                onClick={() => {
                  setActiveLightboxIndex(1);
                  setIsLightboxOpen(true);
                }}
              >
                <img
                  src={galleryPhotos[1]}
                  alt={`${room.title} - Không gian phòng`}
                  className="collage-img"
                />
              </div>
              <div
                className="collage-item collage-stacked-item"
                onClick={() => {
                  setActiveLightboxIndex(2);
                  setIsLightboxOpen(true);
                }}
              >
                <img
                  src={galleryPhotos[2]}
                  alt={`${room.title} - Tiện ích nghỉ dưỡng`}
                  className="collage-img"
                />
              </div>
            </div>
          </div>

          {/* Bottom Tier: 5 Smaller Thumbnails */}
          <div className="collage-bottom-tier">
            {galleryPhotos.slice(3, 8).map((photoUrl, idx) => {
              const actualIndex = idx + 3;
              const isLastItem = idx === 4;

              return (
                <div
                  key={actualIndex}
                  className="collage-item collage-bottom-thumb"
                  onClick={() => {
                    setActiveLightboxIndex(actualIndex);
                    setIsLightboxOpen(true);
                  }}
                >
                  <img
                    src={photoUrl}
                    alt={`${room.title} - Chi tiết ${actualIndex + 1}`}
                    className="collage-img"
                  />
                  {isLastItem && (
                    <div className="collage-more-overlay">
                      <span>+38 ảnh</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 6 Curated Recommendations (Right Side Panel) */}
        <aside className="gallery-side-recommendations">
          <div className="side-rec-card">
            <div className="side-rec-header">
              <div>
                <span className="side-rec-tag">
                  <TbSparkles style={{ color: '#ff385c' }} /> {hasSameLocationRooms ? `GỢI Ý TẠI ${(room.city || 'Khu vực này').toUpperCase()}` : 'GỢI Ý TƯƠNG TỰ'}
                </span>
                <h3 className="side-rec-title">
                  {hasSameLocationRooms ? `Chỗ ở tại ${room.city || 'khu vực'}` : 'Chỗ ở nổi bật khác'}
                </h3>
              </div>
              <button
                type="button"
                className="side-rec-viewall-link"
                onClick={() => window.scrollTo({ top: 1200, behavior: 'smooth' })}
              >
                Xem thêm <TbChevronRight />
              </button>
            </div>

            <div className="side-rec-items-list">
              {sideRecommendations.map((rec) => {
                const thumbImg = rec.images?.[0] || rec.image || (Array.isArray(rec.images) ? rec.images[0] : rec.images) || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400';
                return (
                  <div
                    key={rec.id}
                    className="side-rec-item"
                    onClick={() => {
                      const matched = allRooms.find(r => r.id === rec.id) || rec;
                      if (onSelectRoom) onSelectRoom(matched);
                    }}
                    title={`Xem chỗ ở: ${rec.title}`}
                  >
                    <div className="side-rec-thumb-box">
                      <img
                        src={thumbImg}
                        alt={rec.title}
                        className="side-rec-thumb"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400';
                        }}
                      />
                    </div>
                    <div className="side-rec-meta">
                      <h5 className="side-rec-name">{rec.title}</h5>
                      <span className="side-rec-type-text">
                        {rec.city} · {rec.type || 'Nghỉ dưỡng'}
                      </span>
                      <div className="side-rec-bottom-line">
                        <div className="side-rec-rating">
                          <TbStarFilled style={{ color: '#ff385c', fontSize: '0.75rem' }} />
                          <span>{rec.rating ? Number(rec.rating).toFixed(2) : '4.95'}</span>
                          <span className="side-rec-count">({rec.reviewsCount || 80})</span>
                        </div>
                        <div className="side-rec-price">
                          <strong>{formatPriceVal(currency === 'USD' ? rec.priceUSD : (rec.priceVND || rec.priceUSD * 25000))}</strong>
                          <span className="side-rec-unit"> / đêm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 2. ROOM HEADER: Back Button + Room Title (Row 1) & Meta + Actions (Row 2) */}
      {/* ========================================================================= */}
      <div className="room-page-header">
        {/* Row 1: Room Title */}
        <h1 className="room-page-title">{room.title}</h1>

        {/* Row 2: Meta Info (Left) & Share/Save Actions (Right Corner) */}
        <div className="room-page-meta-row">
          <div className="room-page-meta-left">
            <div className="meta-rating-badge">
              <TbStarFilled style={{ color: '#ff385c' }} />
              <span style={{ fontWeight: 700 }}>{room.rating.toFixed(2)}</span>
              <span className="meta-reviews-link">({room.reviewsCount} đánh giá)</span>
            </div>
            {room.isSuperhost && (
              <span className="meta-badge-superhost">
                <TbAward /> Chủ nhà siêu cấp
              </span>
            )}
            {room.isGuestFavorite && (
              <span className="meta-badge-favorite">
                <TbSparkles /> Khách yêu thích
              </span>
            )}
            <span className="meta-location-text">
              <TbMapPin style={{ verticalAlign: 'middle', marginRight: '3px', color: '#ff385c' }} />
              {room.city}, {room.country}
            </span>
          </div>

          {/* Action buttons aligned to right corner */}
          <div className="room-page-actions">
            <button className="action-btn" onClick={handleShare} title="Sao chép liên kết">
              <TbShare /> {copiedLink ? 'Đã sao chép link!' : 'Chia sẻ'}
            </button>
            <button
              className={`action-btn ${isFavorite ? 'favorite-active' : ''}`}
              onClick={() => onToggleFavorite && onToggleFavorite(room.id)}
              title={isFavorite ? 'Bỏ lưu' : 'Lưu vào danh sách'}
            >
              {isFavorite ? <TbHeartFilled style={{ color: '#ff385c' }} /> : <TbHeart />}
              {isFavorite ? 'Đã lưu' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SINGLE-COLUMN LUXURY MAIN CONTAINER (1040px Width) */}
      {/* ========================================================================= */}
      <div className="single-col-luxury-container">
        {/* ------------------------------------------------------------------------- */}
        {/* [MỤC 1]: TỔNG QUAN CHỦ NHÀ & THÔNG SỐ DATABASE (Horizontal Metric Strip) */}
        {/* ------------------------------------------------------------------------- */}
        <section id="section-overview" className="single-col-section">
          <div className="host-overview-header-card">
            <div className="host-info-group">
              <div className="host-avatar-ring">
                <img
                  src={room.host?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={room.host?.name}
                  className="host-avatar-large"
                />
                {room.host?.isSuperhost && (
                  <span className="host-super-crown" title="Chủ nhà siêu cấp (Superhost)">
                    <TbCrown style={{ color: '#f59e0b', fontSize: '0.85rem' }} />
                  </span>
                )}
              </div>
              <div className="host-meta-details">
                <h2 className="room-space-heading">
                  {room.type || 'Toàn bộ Biệt thự nghỉ dưỡng'} · {room.specs?.size || '120 m²'}
                </h2>
                <p className="host-subtitle">
                  Chủ nhà: <strong>{room.host?.name || 'Minh Hoàng'}</strong> (<TbAward style={{ color: '#ff385c', verticalAlign: 'middle' }} /> Superhost 4 năm kinh nghiệm · Phản hồi 100%)
                </p>
              </div>
            </div>

            {/* Horizontal Metric Strip - Thanh mảnh, sang trọng */}
            <div className="room-metrics-strip">
              <span className="metric-item"><TbUsers /> {room.specs?.guests || 8} khách</span>
              <span className="strip-dot">·</span>
              <span className="metric-item"><TbBed /> {room.specs?.bedrooms || 4} phòng ngủ</span>
              <span className="strip-dot">·</span>
              <span className="metric-item"><TbBed /> {room.specs?.beds || 5} giường</span>
              <span className="strip-dot">·</span>
              <span className="metric-item"><TbBath /> {room.specs?.bathrooms || 4} phòng tắm</span>
              <span className="strip-dot">·</span>
              <span className="metric-item"><TbMaximize style={{ verticalAlign: 'middle', marginRight: '2px' }} /> {room.specs?.size || '120 m²'}</span>
            </div>

            {/* 3 Verified Trust Highlights */}
            <div className="trust-highlights-grid">
              <div className="trust-highlight-card">
                <div className="trust-icon-box"><TbShieldCheck /></div>
                <div>
                  <h4 className="trust-title">Tự nhận phòng thông minh</h4>
                  <p className="trust-desc">Khóa mã số tự động 24/7. 100% du khách đánh giá 5 sao cho quy trình check-in.</p>
                </div>
              </div>
              <div className="trust-highlight-card">
                <div className="trust-icon-box"><TbStarFilled /></div>
                <div>
                  <h4 className="trust-title">Chủ nhà siêu cấp danh tiếng</h4>
                  <p className="trust-desc">{room.host?.name || 'Minh Hoàng'} cam kết đồng hành và chăm sóc bạn chu đáo suốt kỳ nghỉ.</p>
                </div>
              </div>
              <div className="trust-highlight-card">
                <div className="trust-icon-box"><TbMapPin /></div>
                <div>
                  <h4 className="trust-title">Vị trí nghỉ dưỡng đắc địa</h4>
                  <p className="trust-desc">{room.distance || 'Cách trung tâm 4.2 km'}, không gian yên tĩnh và thuận tiện di chuyển.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* [MỤC 2]: KHỐI ĐẶT PHÒNG & THỜI GIAN LƯU TRÚ (INSTANT BOOKING & TIME BAR) */}
        {/* ------------------------------------------------------------------------- */}
        <section id="section-booking" className="single-col-section">
          <div className="instant-booking-card">
            {/* Top Row: Price + Cancellation & Standard Hours Policy */}
            <div className="instant-booking-top-row">
              <div className="instant-price-group">
                <span className="instant-price-val">{formatPriceVal(pricePerNight)}</span>
                <span className="instant-price-unit"> / đêm</span>
              </div>
              <div className="instant-badge-group">
                <span className="instant-tag-cancel">
                  <TbShieldCheck style={{ verticalAlign: 'middle', marginRight: '4px', fontSize: '0.88rem' }} /> Miễn phí hủy trước 48h
                </span>
                <span className="instant-tag-hours">
                  <TbClock style={{ verticalAlign: 'middle', marginRight: '4px', fontSize: '0.88rem' }} /> Nhận phòng từ 14:00 · Trả phòng trước 12:00
                </span>
              </div>
            </div>

            {/* Middle Row: Interactive Check-in / Check-out / Guests Controls */}
            <div className="instant-booking-controls-grid">
              {/* Check-In Picker */}
              <div className="instant-field-box">
                <label className="instant-field-label">
                  <TbCalendar style={{ color: '#ff385c' }} /> Ngày nhận phòng (Từ 14:00)
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={checkIn}
                  onChange={(e) => {
                    const newIn = e.target.value;
                    setCheckIn(newIn);
                    if (new Date(newIn) >= new Date(checkOut)) {
                      setCheckOut(getNextDayStr(newIn));
                    }
                  }}
                  className="instant-date-input"
                />
              </div>

              {/* Check-Out Picker */}
              <div className="instant-field-box">
                <label className="instant-field-label">
                  <TbCalendar style={{ color: '#ff385c' }} /> Ngày trả phòng (Trước 12:00)
                </label>
                <input
                  type="date"
                  min={getNextDayStr(checkIn)}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="instant-date-input"
                />
              </div>

              {/* Guest Count Counter */}
              <div className="instant-field-box">
                <label className="instant-field-label">
                  <TbUsers style={{ color: '#ff385c' }} /> Số lượng khách lưu trú
                </label>
                <div className="instant-guest-control">
                  <span className="instant-guest-text">
                    <strong>{guestCount} khách</strong> <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>(tối đa {room.specs?.guests || 8})</span>
                  </span>
                  <div className="instant-counter-btns">
                    <button
                      type="button"
                      className="instant-mini-btn"
                      onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
                      disabled={guestCount <= 1}
                    >-</button>
                    <button
                      type="button"
                      className="instant-mini-btn"
                      onClick={() => setGuestCount((g) => Math.min(room.specs?.guests || 8, g + 1))}
                      disabled={guestCount >= (room.specs?.guests || 8)}
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Total Estimation + High-Converting CTA */}
            <div className="instant-booking-footer-row">
              <div className="instant-total-info">
                <span className="instant-total-nights">Tổng ước tính cho {nights} đêm lưu trú:</span>
                <div className="instant-total-price-wrap">
                  <strong className="instant-total-val">{formatPriceVal(grandTotal)}</strong>
                  <span className="instant-fee-note">(Đã gồm thuế & phí dịch vụ 12%)</span>
                </div>
              </div>

              <button
                type="button"
                className="instant-reserve-submit-btn"
                onClick={handleReserve}
              >
                <TbBolt style={{ verticalAlign: 'middle', marginRight: '4px', fontSize: '1.05rem' }} /> Đặt phòng nghỉ dưỡng ngay
              </button>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* [MỤC 3]: GIỚI THIỆU CHI TIẾT KHÔNG GIAN NGHỈ DƯỠNG */}
        {/* ------------------------------------------------------------------------- */}
        <section id="section-about" className="single-col-section">
          <h3 className="section-title-luxury">Về không gian nghỉ dưỡng này</h3>
          <div className={`about-text-content ${isDescriptionExpanded ? 'expanded' : ''}`}>
            <p className="lead-paragraph">{room.description}</p>
            <p style={{ marginTop: '0.85rem' }}>
              Được bao bọc bởi đồi thông nguyên sơ và bầu không khí trong lành quanh năm, chỗ ở mang đến không gian thư thái trọn vẹn. Từng góc nhỏ từ phòng khách, căn bếp ấm cúng đến sân nướng BBQ ngoài trời đều được chăm chút tỉ mỉ nhằm mang lại kỳ nghỉ đẳng cấp nhất.
            </p>
          </div>
          <button
            type="button"
            className="expand-see-more-btn"
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            {isDescriptionExpanded ? 'Thu gọn bớt' : 'Hiển thị thêm chi tiết >'}
          </button>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* [MỤC 4]: NƠI BẠN SẼ NGHỈ NGƠI (Visual Sleeping Rooms Grid - Full Width Photos) */}
        {/* ------------------------------------------------------------------------- */}
        <section id="section-sleeping" className="single-col-section">
          <h3 className="section-title-luxury">Nơi bạn sẽ nghỉ ngơi</h3>
          <div className="visual-sleeping-grid">
            <div className="visual-sleeping-card">
              <div className="sleeping-photo-box">
                <img
                  src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800"
                  alt="Phòng ngủ Master King Bed"
                  className="sleeping-photo-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800';
                  }}
                />
                <span className="room-bed-type-tag">Phòng Master En-suite</span>
              </div>
              <div className="sleeping-card-info">
                <h4 className="sleeping-card-title">Phòng ngủ 1 (Master King Bed)</h4>
                <p className="sleeping-card-sub">1 giường đôi cỡ King (1m8 x 2m) · View rừng thông · Máy lạnh riêng</p>
              </div>
            </div>

            <div className="visual-sleeping-card">
              <div className="sleeping-photo-box">
                <img
                  src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
                  alt="Phòng ngủ 2 Queen Bed"
                  className="sleeping-photo-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800';
                  }}
                />
                <span className="room-bed-type-tag">Phòng Queen View Đồi</span>
              </div>
              <div className="sleeping-card-info">
                <h4 className="sleeping-card-title">Phòng ngủ 2 (Queen Bed)</h4>
                <p className="sleeping-card-sub">1 giường đôi Queen (1m6 x 2m) · Cửa sổ kính ngắm hoàng hôn</p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* [MỤC 5]: TIỆN NGHI 5 SAO (GRID 4 CỘT NGANG GỌN GÀNG) */}
        {/* ------------------------------------------------------------------------- */}
        <section id="section-amenities" className="single-col-section">
          <h3 className="section-title-luxury">Tiện nghi có sẵn cho bạn</h3>
          <div className="categorized-amenities-4grid">
            <div className="amenity-cat-card">
              <h4 className="amenity-cat-title">
                <TbSparkles style={{ color: '#ff385c', marginRight: '6px', verticalAlign: 'middle' }} /> Nghỉ dưỡng
              </h4>
              <ul className="amenity-bullet-list">
                <li><TbCheck className="bullet-icon" /> Hồ bơi nước ấm</li>
                <li><TbCheck className="bullet-icon" /> Lò sưởi trong nhà</li>
                <li><TbCheck className="bullet-icon" /> Bếp nướng BBQ</li>
              </ul>
            </div>

            <div className="amenity-cat-card">
              <h4 className="amenity-cat-title">
                <TbSun style={{ color: '#f59e0b', marginRight: '6px', verticalAlign: 'middle' }} /> Cảnh quan
              </h4>
              <ul className="amenity-bullet-list">
                <li><TbCheck className="bullet-icon" /> Không gian thiên nhiên</li>
                <li><TbCheck className="bullet-icon" /> Sân vườn riêng</li>
                <li><TbCheck className="bullet-icon" /> Ban công ngắm cảnh</li>
              </ul>
            </div>

            <div className="amenity-cat-card">
              <h4 className="amenity-cat-title">
                <TbCoffee style={{ color: '#0ea5e9', marginRight: '6px', verticalAlign: 'middle' }} /> Sinh hoạt
              </h4>
              <ul className="amenity-bullet-list">
                <li><TbCheck className="bullet-icon" /> Bếp nấu gia vị</li>
                <li><TbCheck className="bullet-icon" /> Wi-Fi tốc độ cao</li>
                <li><TbCheck className="bullet-icon" /> Chỗ đỗ xe ô tô</li>
              </ul>
            </div>

            <div className="amenity-cat-card">
              <h4 className="amenity-cat-title">
                <TbShieldCheck style={{ color: '#10b981', marginRight: '6px', verticalAlign: 'middle' }} /> An toàn
              </h4>
              <ul className="amenity-bullet-list">
                <li><TbCheck className="bullet-icon" /> Khóa tự động</li>
                <li><TbCheck className="bullet-icon" /> Báo khói & CO</li>
                <li><TbCheck className="bullet-icon" /> Hộp sơ cứu y tế</li>
              </ul>
            </div>
          </div>
          <button
            type="button"
            className="outline-show-all-btn"
            onClick={() => setShowAllAmenities(true)}
          >
            <TbListCheck style={{ marginRight: '6px', fontSize: '1.05rem', verticalAlign: 'middle' }} /> Hiển thị tất cả {room.amenities?.length || 10} tiện nghi đầy đủ
          </button>
        </section>


        {/* ------------------------------------------------------------------------- */}
        {/* [MỤC 7]: TRUNG TÂM ĐÁNH GIÁ (2 CỘT x 3 HÀNG CHUẨN SENIOR UX) */}
        {/* ------------------------------------------------------------------------- */}
        <section id="section-reviews" className="single-col-section">
          <div className="reviews-hub-2col-layout">
            {/* Left Col: Giant Overall Score */}
            <div className="reviews-big-score-col">
              <div className="reviews-huge-number">{room.rating.toFixed(2)}</div>
              <div className="reviews-huge-stars">
                <TbStarFilled style={{ color: '#ff385c' }} />
                <TbStarFilled style={{ color: '#ff385c' }} />
                <TbStarFilled style={{ color: '#ff385c' }} />
                <TbStarFilled style={{ color: '#ff385c' }} />
                <TbStarFilled style={{ color: '#ff385c' }} />
              </div>
              <h4 className="reviews-overall-label">Khách yêu thích tuyệt đối</h4>
              <p className="reviews-overall-sub">{room.reviewsCount} đánh giá từ du khách đã lưu trú thực tế</p>
            </div>

            {/* Right Col: 6 Criteria in 2 columns x 3 rows with 4px progress bars */}
            <div className="reviews-criteria-col">
              {room.reviewsBreakdown &&
                Object.entries(room.reviewsBreakdown).map(([key, score]) => (
                  <div key={key} className="criteria-row">
                    <span className="criteria-label">
                      {key === 'cleanliness' ? 'Độ sạch sẽ' :
                       key === 'accuracy' ? 'Độ chính xác' :
                       key === 'communication' ? 'Giao tiếp chủ nhà' :
                       key === 'location' ? 'Vị trí đắc địa' :
                       key === 'checkIn' ? 'Nhận phòng' : 'Giá trị tương xứng'}
                    </span>
                    <div className="criteria-progress-wrap">
                      <div className="criteria-progress-bar">
                        <div
                          className="criteria-progress-fill"
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="criteria-val">{score.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Keyword Search & Filter Chips */}
          <div className="review-keywords-filter-bar">
            {[
              { id: 'all', label: `Tất cả (${room.reviewsCount})`, icon: null },
              { id: 'clean', label: 'Sạch sẽ (86)', icon: <TbSparkles style={{ color: '#ff385c', marginRight: '4px', verticalAlign: 'middle' }} /> },
              { id: 'view', label: 'View đẹp (74)', icon: <TbSun style={{ color: '#f59e0b', marginRight: '4px', verticalAlign: 'middle' }} /> },
              { id: 'cafe', label: 'Gần quán cafe (52)', icon: <TbCoffee style={{ color: '#0ea5e9', marginRight: '4px', verticalAlign: 'middle' }} /> },
              { id: 'family', label: 'Gia đình (48)', icon: <TbUsers style={{ color: '#8b5cf6', marginRight: '4px', verticalAlign: 'middle' }} /> },
            ].map((kw) => (
              <button
                key={kw.id}
                type="button"
                className={`kw-tag ${activeReviewKeyword === kw.id ? 'active' : ''}`}
                onClick={() => setActiveReviewKeyword(kw.id)}
              >
                {kw.icon} {kw.label}
              </button>
            ))}
          </div>

          {/* Guest Reviews Cards (Dynamic from Backend or Curated Testimonials) */}
          <div className="guest-reviews-grid">
            {room.reviewsList && room.reviewsList.length > 0 ? (
              room.reviewsList.map((rev) => (
                <div key={rev.id} className="guest-review-card">
                  <div className="reviewer-meta">
                    <img
                      src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt={rev.userName}
                      className="reviewer-avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80';
                      }}
                    />
                    <div>
                      <h5 className="reviewer-name">{rev.userName}</h5>
                      <span className="review-date">
                        {rev.createdAt ? `${rev.createdAt}` : 'Kỳ nghỉ thực tế'} · Đánh giá {rev.rating || 5}⭐
                      </span>
                    </div>
                  </div>
                  <p className="review-comment">"{rev.comment}"</p>
                  {rev.hostResponse && (
                    <div className="host-response-box">
                      <strong>Phản hồi từ chủ nhà {room.host?.name || 'Chủ nhà'}:</strong>
                      <p>"{rev.hostResponse}"</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <>
                <div className="guest-review-card">
                  <div className="reviewer-meta">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"
                      alt="Hoàng Anh"
                      className="reviewer-avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80';
                      }}
                    />
                    <div>
                      <h5 className="reviewer-name">Hoàng Anh</h5>
                      <span className="review-date">Tháng 9 năm 2026 · Kỳ nghỉ 4 đêm</span>
                    </div>
                  </div>
                  <p className="review-comment">
                    "Không gian tuyệt vời hơn cả mong đợi! View bình minh đẹp mê hồn, phòng sạch sẽ và chủ nhà hỗ trợ cực kỳ chu đáo. Chắc chắn sẽ quay lại!"
                  </p>
                  <div className="host-response-box">
                    <strong>Phản hồi từ chủ nhà {room.host?.name || 'Minh Hoàng'}:</strong>
                    <p>"Cảm ơn bạn Hoàng Anh rất nhiều! Rất vui được đón tiếp bạn và hẹn gặp lại bạn trong chuyến đi tới nhé!"</p>
                  </div>
                </div>

                <div className="guest-review-card">
                  <div className="reviewer-meta">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80"
                      alt="Tuấn Kiệt"
                      className="reviewer-avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80';
                      }}
                    />
                    <div>
                      <h5 className="reviewer-name">Tuấn Kiệt</h5>
                      <span className="review-date">Tháng 8 năm 2026 · Đi cùng gia đình</span>
                    </div>
                  </div>
                  <p className="review-comment">
                    "Biệt thự rất rộng rãi, các bé nhà mình thích mê hồ bơi và khu BBQ ngoài trời. Đầy đủ tiện nghi nấu nướng tiện lợi."
                  </p>
                  <div className="host-response-box">
                    <strong>Phản hồi từ chủ nhà {room.host?.name || 'Minh Hoàng'}:</strong>
                    <p>"Cảm ơn gia đình anh Kiệt! Chúc các bé luôn ngoan và có thật nhiều kỷ niệm đẹp tại {room.city || 'kỳ nghỉ'} ạ."</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* [MỤC 8]: VỊ TRÍ & CẨM NANG KHÁM PHÁ (TỶ LỆ 60% MAP : 40% GUIDE) */}
        {/* ------------------------------------------------------------------------- */}
        <section id="section-location" className="single-col-section">
          <h3 className="section-title-luxury">Vị trí & Khám phá lân cận</h3>
          <p className="section-sub-desc">{room.location} · {room.distance || 'Khu vực trung tâm thuận tiện'}</p>
          
          <div className="location-and-guide-layout">
            {/* Left 60%: Interactive Map Preview */}
            <div className="map-preview-mockup">
              <div className="map-overlay-badge">
                <TbMapPin style={{ color: '#ff385c', fontSize: '1.3rem' }} />
                <span>{room.city} - {room.distance || 'Khu vực yên tĩnh nghỉ dưỡng'}</span>
              </div>
            </div>

            {/* Right 40%: Realistic Travel Distance Cards */}
            <div className="neighborhood-guide-column">
              <div className="neighbor-card">
                <span className="neighbor-icon">
                  <TbTrees style={{ color: '#10b981', fontSize: '1.2rem' }} />
                </span>
                <div>
                  <h5 className="neighbor-name">Cảnh quan & Thiên nhiên lân cận</h5>
                  <span className="neighbor-dist">800m · <TbWalk style={{ verticalAlign: 'middle' }} /> 10 phút đi bộ</span>
                </div>
              </div>
              <div className="neighbor-card">
                <span className="neighbor-icon">
                  <TbCoffee style={{ color: '#f59e0b', fontSize: '1.2rem' }} />
                </span>
                <div>
                  <h5 className="neighbor-name">Tiệm cafe & Ẩm thực ngắm cảnh</h5>
                  <span className="neighbor-dist">400m · <TbWalk style={{ verticalAlign: 'middle' }} /> 5 phút đi bộ</span>
                </div>
              </div>
              <div className="neighbor-card">
                <span className="neighbor-icon">
                  <TbBuildingSkyscraper style={{ color: '#0ea5e9', fontSize: '1.2rem' }} />
                </span>
                <div>
                  <h5 className="neighbor-name">Trung tâm thành phố {room.city}</h5>
                  <span className="neighbor-dist">4.2 km · <TbCar style={{ verticalAlign: 'middle' }} /> 8 phút đi xe</span>
                </div>
              </div>
              <div className="neighbor-card">
                <span className="neighbor-icon">
                  <TbPlaneDeparture style={{ color: '#8b5cf6', fontSize: '1.2rem' }} />
                </span>
                <div>
                  <h5 className="neighbor-name">Sân bay & Trạm trung chuyển</h5>
                  <span className="neighbor-dist">32 km · <TbCar style={{ verticalAlign: 'middle' }} /> 40 phút đi xe</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* [MỤC 9]: HỒ SƠ CHỦ NHÀ & NỘI QUY (2 CỘT CÂN ĐỐI) */}
        {/* ------------------------------------------------------------------------- */}
        <section id="section-rules" className="single-col-section">
          <div className="host-and-rules-2col">
            {/* Left: Host Profile */}
            <div className="host-profile-box">
              <div className="host-profile-top">
                <img
                  src={room.host?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={room.host?.name}
                  className="host-profile-avatar"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                  }}
                />
                <div>
                  <h3 className="host-profile-name">Chủ nhà: {room.host?.name || 'Minh Hoàng'}</h3>
                  <span className="host-join-sub">{room.host?.joined || 'Đã tham gia TripNest từ năm 2021'}</span>
                </div>
              </div>
              <div className="host-stats-row">
                <div className="host-stat-item">
                  <TbStarFilled style={{ color: '#ff385c' }} /> {room.host?.reviews || 310} đánh giá
                </div>
                <div className="host-stat-item">
                  <TbShieldCheck style={{ color: '#0d8a43' }} /> Đã xác minh KYC
                </div>
                <div className="host-stat-item">
                  <TbClock /> Phản hồi 100% trong 1 giờ
                </div>
              </div>
              <p className="host-bio">
                "Chào mừng bạn đến với TripNest! Chúng tôi luôn nỗ lực hết mình để đem lại không gian nghỉ dưỡng ấm cúng, riêng tư và trọn vẹn cảm xúc nhất."
              </p>
              <button
                type="button"
                className="contact-host-btn"
                onClick={() => {
                  toast.success(
                    'Kết nối trò chuyện an toàn',
                    `Đã kết nối trò chuyện an toàn với Chủ nhà ${room.host?.name || 'Minh Hoàng'} (Phản hồi dự kiến trong vòng 1 giờ)`
                  );
                }}
              >
                <TbMessageCircle style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '1.05rem' }} /> Nhắn tin trực tiếp cho chủ nhà
              </button>
            </div>

            {/* Right: House Rules & Safety */}
            <div className="rules-summary-box">
              <h4 className="rules-summary-heading">Nội quy & Chính sách chỗ ở</h4>
              <ul className="rules-summary-list">
                <li><TbClock /> Nhận phòng từ: <strong>14:00</strong> · Trả phòng trước: <strong>12:00</strong></li>
                <li><TbUsers /> Tối đa <strong>{room.specs?.guests || 8} khách lưu trú</strong></li>
                <li><TbPaw /> Cho phép mang thú cưng (theo thỏa thuận)</li>
                <li><TbShieldCheck /> Khóa mã số tự động 24/7 & Cảm biến báo khói</li>
                <li><TbShieldCheck /> <strong>Miễn phí hủy phòng trước 48 giờ</strong> nhận phòng</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM FULL-WIDTH RECOMMENDATIONS SECTION */}
      {/* ========================================================================= */}
      <section className="recommendations-section">
        {/* 1. Same City Recommendations */}
        {sameCityRooms.length > 0 && (
          <div className="recommendation-block">
            <div className="rec-header">
              <div>
                <h3 className="rec-title">Chỗ ở tương tự tuyệt vời tại {room.city}</h3>
                <p className="rec-subtitle">Khám phá các căn hộ và biệt thự có cùng vị trí đắc địa</p>
              </div>
            </div>
            <div className="rec-cards-grid">
              {sameCityRooms.map((recRoom) => {
                const imgUrl = recRoom.images?.[0] || (Array.isArray(recRoom.images) ? recRoom.images[0] : recRoom.images) || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600';
                return (
                  <div
                    key={recRoom.id}
                    className="rec-room-card"
                    onClick={() => onSelectRoom && onSelectRoom(recRoom)}
                  >
                    <div className="rec-img-wrapper">
                      <img
                        src={imgUrl}
                        alt={recRoom.title}
                        className="rec-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600';
                        }}
                      />
                      <div className="rec-rating-badge">
                        <TbStarFilled style={{ color: '#ff385c', fontSize: '0.75rem' }} />
                        <span>{recRoom.rating ? Number(recRoom.rating).toFixed(2) : '4.95'}</span>
                      </div>
                    </div>
                    <div className="rec-info">
                      <h4 className="rec-room-title">{recRoom.title}</h4>
                      <p className="rec-room-loc">{recRoom.city}, {recRoom.country}</p>
                      <div className="rec-room-price">
                        <strong>{formatPriceVal(currency === 'USD' ? recRoom.priceUSD : (recRoom.priceVND || recRoom.priceUSD * 25000))}</strong>
                        <span> / đêm</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Same Category / Style Recommendations */}
        {sameCategoryRooms.length > 0 && (
          <div className="recommendation-block">
            <div className="rec-header">
              <div>
                <h3 className="rec-title">Chỗ ở cùng phong cách thiết kế</h3>
                <p className="rec-subtitle">Nghỉ dưỡng đẳng cấp theo cùng phong cách bạn đang quan tâm</p>
              </div>
            </div>
            <div className="rec-cards-grid">
              {sameCategoryRooms.map((recRoom) => {
                const imgUrl = recRoom.images?.[0] || (Array.isArray(recRoom.images) ? recRoom.images[0] : recRoom.images) || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600';
                return (
                  <div
                    key={recRoom.id}
                    className="rec-room-card"
                    onClick={() => onSelectRoom && onSelectRoom(recRoom)}
                  >
                    <div className="rec-img-wrapper">
                      <img
                        src={imgUrl}
                        alt={recRoom.title}
                        className="rec-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600';
                        }}
                      />
                      <div className="rec-rating-badge">
                        <TbStarFilled style={{ color: '#ff385c', fontSize: '0.75rem' }} />
                        <span>{recRoom.rating ? Number(recRoom.rating).toFixed(2) : '4.95'}</span>
                      </div>
                    </div>
                    <div className="rec-info">
                      <h4 className="rec-room-title">{recRoom.title}</h4>
                      <p className="rec-room-loc">{recRoom.city}, {recRoom.country}</p>
                      <div className="rec-room-price">
                        <strong>{formatPriceVal(currency === 'USD' ? recRoom.priceUSD : (recRoom.priceVND || recRoom.priceUSD * 25000))}</strong>
                        <span> / đêm</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Local Experiences Recommendations */}
        {displayExperiences.length > 0 && (
          <div className="recommendation-block experiences-rec-block">
            <div className="rec-header">
              <div>
                <h3 className="rec-title">Trải nghiệm & Hoạt động độc đáo tại {room.city}</h3>
                <p className="rec-subtitle">Tô điểm kỳ nghỉ với các tour trải nghiệm địa phương đáng nhớ</p>
              </div>
            </div>
            <div className="rec-experiences-grid">
              {displayExperiences.map((exp) => {
                const expImg = exp.background || exp.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600';
                return (
                  <div key={exp.id} className="rec-experience-card">
                    <div className="rec-exp-img-box">
                      <img
                        src={expImg}
                        alt={exp.caption || exp.title}
                        className="rec-exp-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600';
                        }}
                      />
                      <span className="rec-exp-city-tag">{exp.city}</span>
                    </div>
                    <div className="rec-exp-info">
                      <h4 className="rec-exp-caption">{exp.caption || exp.title}</h4>
                      <div className="rec-exp-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <TbStarFilled style={{ color: '#ff385c', fontSize: '0.8rem' }} />
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{exp.rating}</span>
                        </div>
                        <span className="rec-exp-price">
                          {formatExpPrice(exp)} / người
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. FULLSCREEN LIGHTBOX PHOTO TOUR MODAL */}
      {/* ========================================================================= */}
      {isLightboxOpen && (
        <div className="lightbox-modal-overlay" onClick={() => setIsLightboxOpen(false)}>
          <div className="lightbox-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Lightbox Header */}
            <div className="lightbox-header">
              <div className="lightbox-counter">
                {activeLightboxIndex + 1} / {images.length}
              </div>
              <button
                className="lightbox-close-btn"
                onClick={() => setIsLightboxOpen(false)}
                title="Đóng chế độ toàn màn hình"
              >
                <TbX />
              </button>
            </div>

            {/* Lightbox Main Stage */}
            <div className="lightbox-stage">
              <button
                className="lightbox-nav-btn prev"
                onClick={() =>
                  setActiveLightboxIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  )
                }
              >
                <TbChevronLeft />
              </button>

              <div className="lightbox-img-wrapper">
                <img
                  src={images[activeLightboxIndex]}
                  alt={`${room.title} - ${activeLightboxIndex + 1}`}
                  className="lightbox-active-img"
                />
              </div>

              <button
                className="lightbox-nav-btn next"
                onClick={() =>
                  setActiveLightboxIndex((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  )
                }
              >
                <TbChevronRight />
              </button>
            </div>

            {/* Lightbox Thumbnail Strip */}
            <div className="lightbox-thumbnails-strip">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`lightbox-thumb ${idx === activeLightboxIndex ? 'active' : ''}`}
                  onClick={() => setActiveLightboxIndex(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ALL AMENITIES MODAL (LUXURY MODAL DIALOG) */}
      {/* ========================================================================= */}
      {showAllAmenities && (
        <div className="filter-modal-overlay" onClick={() => setShowAllAmenities(false)}>
          <div
            className="filter-modal-card"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="filter-modal-header">
              <button
                type="button"
                className="filter-modal-close-btn"
                onClick={() => setShowAllAmenities(false)}
                title="Đóng tiện nghi"
              >
                <TbX />
              </button>
              <h2 className="filter-modal-title">Tiện nghi & Dịch vụ đầy đủ</h2>
              <div style={{ width: '36px' }} />
            </div>

            <div className="filter-modal-body" style={{ gap: '0.85rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                Toàn bộ các trang thiết bị và tiện ích cao cấp được chuẩn bị chu đáo để phục vụ kỳ nghỉ của bạn:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                {room.amenities && room.amenities.map((item, idx) => {
                  let icon = <TbCheck />;
                  for (const key in amenityIcons) {
                    if (item.toLowerCase().includes(key.toLowerCase())) {
                      icon = amenityIcons[key];
                      break;
                    }
                  }
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: '1.5px solid #e2e8f0',
                        background: '#f8fafc',
                      }}
                    >
                      <span style={{ fontSize: '1.25rem', color: '#ff385c', display: 'flex', alignItems: 'center' }}>{icon}</span>
                      <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MOBILE BOTTOM STICKY BOOKING BAR */}
      {/* ========================================================================= */}
      <div className="mobile-bottom-booking-bar">
        <div>
          <span className="mobile-bar-price">{formatPriceVal(pricePerNight)}</span>
          <span className="mobile-bar-unit"> / đêm</span>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{formatVNDate(checkIn)} – {formatVNDate(checkOut)}</div>
        </div>
        <button
          className="primary-gradient-btn mobile-bar-btn"
          onClick={scrollToCalendar}
        >
          Chọn ngày đặt phòng
        </button>
      </div>
    </div>
  );
};

export default RoomDetailPage;
