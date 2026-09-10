import './ListingCard.css';
import React, { useState } from 'react';
import {
  TbHeart,
  TbHeartFilled,
  TbStarFilled,
  TbChevronLeft,
  TbChevronRight,
  TbMapPin,
  TbCalendar,
} from 'react-icons/tb';

// Helper format ngày tìm kiếm thân thiện chuẩn du lịch
const formatSearchDates = (inStr, outStr) => {
  if (!inStr || !outStr) return '';
  try {
    const parts1 = inStr.split('-');
    const parts2 = outStr.split('-');
    if (parts1.length === 3 && parts2.length === 3) {
      const d1 = parts1[2].padStart(2, '0');
      const m1 = parts1[1].padStart(2, '0');
      const y1 = parts1[0];
      const d2 = parts2[2].padStart(2, '0');
      const m2 = parts2[1].padStart(2, '0');
      const y2 = parts2[0];
      if (y1 === y2) {
        return `${d1}/${m1} – ${d2}/${m2}/${y1}`;
      }
      return `${d1}/${m1}/${y1} – ${d2}/${m2}/${y2}`;
    }
    return `${inStr} – ${outStr}`;
  } catch {
    return `${inStr} – ${outStr}`;
  }
};

export const ListingCard = ({
  room,
  onOpenDetail,
  isFavorite = false,
  onToggleFavorite,
  currency = 'VND',
  showTotalBeforeTaxes = false,
  searchParams = {},
}) => {
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const images = Array.isArray(room.images) && room.images.length > 0 
    ? room.images 
    : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'];

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleHeartClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(room.id);
  };

  const formatPrice = (usdPrice, vndPrice, nights = 1) => {
    const safeUsd = typeof usdPrice === 'number' ? usdPrice : parseFloat(usdPrice) || 0;
    const safeVnd = typeof vndPrice === 'number' ? vndPrice : parseFloat(vndPrice) || 0;

    let baseAmount = safeVnd;
    if (currency === 'USD') baseAmount = safeUsd;
    else if (currency === 'EUR') baseAmount = safeUsd * 0.92;

    const total = baseAmount * nights;

    if (currency === 'VND') {
      return `${Math.round(total).toLocaleString('vi-VN')} ₫`;
    } else if (currency === 'EUR') {
      return `€${total.toFixed(0)}`;
    }
    return `$${total.toFixed(0)}`;
  };

  // Calculate search nights safely
  let searchNights = 0;
  if (searchParams.checkInDate && searchParams.checkOutDate) {
    const diff = new Date(searchParams.checkOutDate) - new Date(searchParams.checkInDate);
    searchNights = Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="listing-card" onClick={() => onOpenDetail(room)}>
      {/* Media with Carousel */}
      <div className="listing-media-wrapper">
        <img
          src={images[activeImgIndex] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'}
          alt={room.title}
          className="listing-img-slide"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800';
          }}
        />

        {/* Favorite Heart Button */}
        <button
          className={`favorite-heart-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleHeartClick}
          title={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Lưu vào danh sách yêu thích'}
          aria-label={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Lưu vào danh sách yêu thích'}
        >
          {isFavorite ? <TbHeartFilled /> : <TbHeart />}
        </button>

        {/* Guest Favorite Badge */}
        {room.isGuestFavorite && (
          <div className="guest-favorite-badge">
            Khách yêu thích
          </div>
        )}

        {/* City Location Tag */}
        {room.city && (
          <div className="card-city-tag">
            <TbMapPin style={{ fontSize: '0.8rem' }} />
            <span>{room.city}</span>
          </div>
        )}

        {/* Slider Controls */}
        {images.length > 1 && (
          <>
            <button className="card-slide-arrow prev" onClick={handlePrevImg} title="Ảnh trước" aria-label="Ảnh trước">
              <TbChevronLeft />
            </button>
            <button className="card-slide-arrow next" onClick={handleNextImg} title="Ảnh tiếp" aria-label="Ảnh tiếp">
              <TbChevronRight />
            </button>
            <div className="card-dots-indicator">
              {images.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={`dot-indicator ${idx === activeImgIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Information Row */}
      <div className="listing-info">
        <h3 className="listing-hotel-title" title={room.nameVi || room.title}>
          {(room.nameVi || room.title || '')
            .replace(/(Phu|Phú)\s+(Quoc|Quốc)/gi, '$1\u00A0$2')
            .replace(/(Nha)\s+(Trang)/gi, '$1\u00A0$2')
            .replace(/(Đà|Da)\s+(Lạt|Lat|Nẵng|Nang)/gi, '$1\u00A0$2')
            .replace(/(Hội|Hoi)\s+(An)/gi, '$1\u00A0$2')
            .replace(/(Hạ|Ha)\s+(Long)/gi, '$1\u00A0$2')}
        </h3>

        <div className="listing-meta-row">
          <div className="listing-rating-pill">
            <TbStarFilled style={{ fontSize: '0.85rem', color: '#ff385c' }} />
            <span style={{ fontWeight: 700 }}>{room.rating ? Number(room.rating).toFixed(2) : '5.00'}</span>
            {room.reviewsCount > 0 && (
              <span className="listing-reviews-count">({room.reviewsCount})</span>
            )}
          </div>

          <span className="listing-type-tag">
            {room.accommodationType === 'resort'
              ? 'Resort 5 sao'
              : room.accommodationType === 'hotel'
              ? 'Khách sạn 5 sao'
              : room.accommodationType === 'villa'
              ? 'Villa nghỉ dưỡng'
              : room.accommodationType === 'homestay'
              ? 'Homestay'
              : room.accommodationType === 'cabin'
              ? 'Cabin rừng'
              : room.accommodationType === 'apartment'
              ? 'Căn hộ cao cấp'
              : 'Lưu trú cao cấp'}
          </span>

          {room.roomsCount > 1 ? (
            <span className="listing-rooms-badge">
              {room.roomsCount} hạng phòng
            </span>
          ) : (
            <span className="listing-rooms-badge entire">
              Trọn căn
            </span>
          )}
        </div>

        <span className="listing-distance-text" title={room.distance || `Cách trung tâm ${room.city}`}>
          {(() => {
            const raw = room.distance || (room.city ? `Cách trung tâm ${room.city}` : '');
            if (raw.includes('·')) {
              const parts = raw.split('·').map(s => s.trim());
              const distPart = parts.find(p => /cách\s+trung\s+tâm|\d+\s*km/i.test(p));
              if (distPart) return distPart.replace(/(\d+(?:\.\d+)?)\s*km/gi, '$1\u00A0km');
            }
            return raw.replace(/(\d+(?:\.\d+)?)\s*km/gi, '$1\u00A0km');
          })()}
        </span>

        {((searchParams.checkInDate && searchParams.checkOutDate) || (room.dates && room.dates !== 'Khả dụng cho mọi ngày nghỉ')) && (
          <span className="listing-date-text">
            {searchParams.checkInDate && searchParams.checkOutDate ? (
              <>
                <TbCalendar className="listing-date-icon" />
                <span>{formatSearchDates(searchParams.checkInDate, searchParams.checkOutDate)}</span>
                {searchNights > 0 && <span className="listing-nights-chip">· {searchNights} đêm</span>}
              </>
            ) : (
              room.dates
            )}
          </span>
        )}

        <div className="listing-price-row">
          {searchNights > 0 ? (
            <div className="listing-price-container">
              <div className="listing-nightly-price">
                <span className="listing-price-from-label">Từ </span>
                <span className="listing-price-bold">{formatPrice(room.priceUSD, room.priceFrom || room.priceVND, 1)}</span>
                <span className="listing-price-period"> / đêm</span>
              </div>
              <div className="listing-total-search-price">
                <span className="total-search-label">Tổng ~ </span>
                <strong className="total-search-amount">{formatPrice(room.priceUSD, room.priceFrom || room.priceVND, searchNights)}</strong>
                <span className="total-search-nights"> {showTotalBeforeTaxes ? `cho ${searchNights} đêm (trước thuế)` : `cho ${searchNights} đêm`}</span>
              </div>
            </div>
          ) : showTotalBeforeTaxes ? (
            <div>
              <span className="listing-price-from-label">Từ </span>
              <span className="listing-price-bold">{formatPrice(room.priceUSD, room.priceFrom || room.priceVND, 1)}</span>
              <span className="listing-price-period"> / đêm (tổng trước thuế)</span>
            </div>
          ) : (
            <div>
              <span className="listing-price-from-label">Từ </span>
              <span className="listing-price-bold">{formatPrice(room.priceUSD, room.priceFrom || room.priceVND, 1)}</span>
              <span className="listing-price-period"> / đêm</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
