import React, { useState } from 'react';
import {
  TbHeart,
  TbHeartFilled,
  TbStarFilled,
  TbChevronLeft,
  TbChevronRight,
} from 'react-icons/tb';

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

  const images = room.images && room.images.length > 0 ? room.images : [room.images];

  // Calculate nights from search dates if present
  let searchNights = 0;
  if (searchParams.checkInDate && searchParams.checkOutDate) {
    const d1 = new Date(searchParams.checkInDate);
    const d2 = new Date(searchParams.checkOutDate);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    if (diff > 0) searchNights = diff;
  }

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

  // Format price
  const formatPrice = (priceUSD, priceVND, nights = 1) => {
    if (currency === 'USD') {
      const val = priceUSD * nights;
      return `$${val.toLocaleString()}`;
    }
    if (currency === 'EUR') {
      const val = Math.round(priceUSD * 0.92 * nights);
      return `€${val.toLocaleString()}`;
    }
    const val = (priceVND || priceUSD * 25000) * nights;
    return `${val.toLocaleString()} ₫`;
  };

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
        >
          {isFavorite ? <TbHeartFilled /> : <TbHeart />}
        </button>

        {/* Guest Favorite Badge */}
        {room.isGuestFavorite && (
          <div className="guest-favorite-badge">
            Khách yêu thích
          </div>
        )}

        {/* Slider Controls */}
        {images.length > 1 && (
          <>
            <button className="card-slide-arrow prev" onClick={handlePrevImg}>
              <TbChevronLeft />
            </button>
            <button className="card-slide-arrow next" onClick={handleNextImg}>
              <TbChevronRight />
            </button>
            <div className="card-dots-indicator">
              {images.map((_, idx) => (
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
        <div className="listing-header-row">
          <span className="listing-city-title">{room.city}, {room.country}</span>
          <div className="listing-rating-pill">
            <TbStarFilled style={{ fontSize: '0.8rem' }} />
            <span>{room.rating.toFixed(2)}</span>
          </div>
        </div>

        <span className="listing-distance-text">{room.distance}</span>
        <span className="listing-date-text">
          {searchParams.checkInDate && searchParams.checkOutDate
            ? `${searchParams.checkInDate} - ${searchParams.checkOutDate}`
            : room.dates}
        </span>

        <div className="listing-price-row">
          {searchNights > 0 ? (
            <div>
              <span className="listing-price-bold">{formatPrice(room.priceUSD, room.priceVND, 1)}</span>
              <span className="listing-price-period"> / đêm</span>
              <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                Tổng {formatPrice(room.priceUSD, room.priceVND, searchNights)} cho {searchNights} đêm
              </div>
            </div>
          ) : showTotalBeforeTaxes ? (
            <div>
              <span className="listing-price-bold">{formatPrice(room.priceUSD, room.priceVND, 5)}</span>
              <span className="listing-price-period"> / 5 đêm trước thuế</span>
            </div>
          ) : (
            <div>
              <span className="listing-price-bold">{formatPrice(room.priceUSD, room.priceVND, 1)}</span>
              <span className="listing-price-period"> / đêm</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ListingCard;
