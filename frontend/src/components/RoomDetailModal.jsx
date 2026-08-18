import React, { useState } from 'react';
import {
  TbX,
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
};

export const RoomDetailModal = ({
  room,
  onClose,
  currency = 'VND',
  isFavorite = false,
  onToggleFavorite,
  onBookRoom,
}) => {
  const [checkIn, setCheckIn] = useState('2026-10-15');
  const [checkOut, setCheckOut] = useState('2026-10-20');
  const [guestCount, setGuestCount] = useState(2);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  if (!room) return null;

  const images = room.images || [];

  // Calculate nights
  const calculateNights = () => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 3;
    } catch {
      return 3;
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
    if (currency === 'USD') return `$${val.toLocaleString()}`;
    if (currency === 'EUR') return `€${Math.round(val * 0.92).toLocaleString()}`;
    return `${val.toLocaleString()} ₫`;
  };

  const handleReserve = () => {
    const bookingData = {
      roomId: room.id,
      roomTitle: room.title,
      roomCity: room.city,
      roomImage: images[0],
      checkIn,
      checkOut,
      nights,
      guests: guestCount,
      totalPrice: grandTotal,
      currency,
    };
    if (onBookRoom) {
      onBookRoom(bookingData);
    }
    setIsBookingSuccess(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container room-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} title="Đóng">
          <TbX />
        </button>

        {/* Title and Top Meta */}
        <h1 className="room-modal-title">{room.title}</h1>
        <div className="room-modal-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TbStarFilled style={{ fontSize: '0.95rem' }} />
            <span>{room.rating.toFixed(2)}</span>
            <span style={{ color: '#717171', textDecoration: 'underline' }}>
              ({room.reviewsCount} đánh giá)
            </span>
          </div>
          {room.isSuperhost && (
            <span style={{ color: '#717171' }}>· 🏆 Chủ nhà siêu cấp</span>
          )}
          <span style={{ textDecoration: 'underline', color: '#222' }}>
            {room.location}
          </span>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600 }}
              onClick={() => navigator.clipboard.writeText(window.location.href)}
            >
              <TbShare /> Chia sẻ
            </button>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: isFavorite ? '#ff385c' : '#222' }}
              onClick={() => onToggleFavorite && onToggleFavorite(room.id)}
            >
              {isFavorite ? <TbHeartFilled /> : <TbHeart />} Lưu
            </button>
          </div>
        </div>

        {/* Mosaic Photo Grid */}
        <div className="mosaic-photo-grid">
          {images.slice(0, 5).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${room.title} - ${idx}`}
              className={`mosaic-img ${idx === 0 ? 'mosaic-main' : ''}`}
            />
          ))}
        </div>

        {/* Two Column Layout: Details & Booking Widget */}
        <div className="room-details-layout">
          {/* Left Column: Room & Host Info */}
          <div>
            <div className="room-host-badge-row">
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                  Toàn bộ chỗ ở nghỉ dưỡng. Chủ nhà: {room.host?.name || 'TripNest Host'}
                </h3>
                <div className="room-specs-row">
                  <span><TbUsers style={{ verticalAlign: 'middle' }} /> {room.specs.guests} khách</span>
                  <span>·</span>
                  <span><TbBed style={{ verticalAlign: 'middle' }} /> {room.specs.bedrooms} phòng ngủ</span>
                  <span>·</span>
                  <span>{room.specs.beds} giường</span>
                  <span>·</span>
                  <span><TbBath style={{ verticalAlign: 'middle' }} /> {room.specs.bathrooms} phòng tắm</span>
                </div>
              </div>
              <img
                src={room.host?.avatar}
                alt={room.host?.name}
                className="room-host-avatar"
              />
            </div>

            {/* Highlights */}
            <div style={{ padding: '1.25rem 0', borderBottom: '1px solid #ebebeb' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <TbShieldCheck style={{ fontSize: '1.8rem', color: '#ff385c', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.98rem' }}>Trải nghiệm tự nhận phòng mượt mà</h4>
                  <p style={{ color: '#717171', fontSize: '0.88rem' }}>100% khách gần đây đánh giá 5 sao cho quy trình nhận phòng của chủ nhà.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <TbStarFilled style={{ fontSize: '1.6rem', color: '#ff385c', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.98rem' }}>Chủ nhà siêu cấp (Superhost)</h4>
                  <p style={{ color: '#717171', fontSize: '0.88rem' }}>Chủ nhà có uy tín cao, luôn mang lại trải nghiệm tuyệt vời cho du khách.</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ padding: '1.75rem 0', borderBottom: '1px solid #ebebeb' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Về chỗ ở này</h3>
              <p style={{ lineHeight: 1.7, color: '#484848', fontSize: '0.95rem' }}>{room.description}</p>
            </div>

            {/* Amenities */}
            <div style={{ padding: '1.75rem 0', borderBottom: '1px solid #ebebeb' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Nơi này có những gì cho bạn</h3>
              <div className="amenities-preview-grid">
                {room.amenities.map((item, idx) => {
                  let icon = <TbCheck />;
                  for (const key in amenityIcons) {
                    if (item.toLowerCase().includes(key.toLowerCase())) {
                      icon = amenityIcons[key];
                      break;
                    }
                  }
                  return (
                    <div key={idx} className="amenity-item-row">
                      <span style={{ fontSize: '1.3rem', color: '#484848' }}>{icon}</span>
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews Criteria */}
            <div style={{ padding: '1.75rem 0' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                ★ {room.rating.toFixed(2)} · {room.reviewsCount} đánh giá từ khách hàng
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {room.reviewsBreakdown &&
                  Object.entries(room.reviewsBreakdown).map(([key, score]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                      <span style={{ textTransform: 'capitalize', color: '#484848' }}>
                        {key === 'cleanliness' ? 'Độ sạch sẽ' :
                         key === 'accuracy' ? 'Độ chính xác' :
                         key === 'communication' ? 'Giao tiếp' :
                         key === 'location' ? 'Vị trí' :
                         key === 'checkIn' ? 'Nhận phòng' : 'Giá trị tương xứng'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '4px', background: '#ebebeb', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${(score / 5) * 100}%`, height: '100%', background: '#222' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{score.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div>
            <div className="booking-widget-card">
              {isBookingSuccess ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e6f7ed', color: '#0d8a43', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1rem auto' }}>
                    <TbCheck />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Đặt phòng thành công!</h3>
                  <p style={{ color: '#717171', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                    Mã đặt phòng đã được lưu vào danh sách chuyến đi của bạn.
                  </p>
                  <button
                    className="primary-gradient-btn"
                    onClick={onClose}
                  >
                    Xem chuyến đi của tôi
                  </button>
                </div>
              ) : (
                <>
                  <div className="widget-price-header">
                    <div>
                      <span className="widget-price-bold">{formatPriceVal(pricePerNight)}</span>
                      <span style={{ color: '#717171', fontSize: '0.9rem' }}> / đêm</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.88rem', fontWeight: 600 }}>
                      <TbStarFilled style={{ fontSize: '0.85rem' }} />
                      <span>{room.rating.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Date & Guests Selection */}
                  <div className="widget-dates-box">
                    <div className="widget-dates-grid">
                      <div className="widget-date-cell">
                        <span className="widget-date-label">Nhận phòng</span>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', width: '100%', marginTop: '2px' }}
                        />
                      </div>
                      <div className="widget-date-cell">
                        <span className="widget-date-label">Trả phòng</span>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', width: '100%', marginTop: '2px' }}
                        />
                      </div>
                    </div>

                    <div className="widget-guests-cell" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="widget-date-label">Khách</span>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{guestCount} khách</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          style={{ border: '1px solid #ccc', borderRadius: '50%', width: '26px', height: '26px' }}
                          onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        >-</button>
                        <button
                          type="button"
                          style={{ border: '1px solid #ccc', borderRadius: '50%', width: '26px', height: '26px' }}
                          onClick={() => setGuestCount(Math.min(room.specs.guests, guestCount + 1))}
                        >+</button>
                      </div>
                    </div>
                  </div>

                  {/* Reserve Action Button */}
                  <button className="primary-gradient-btn" onClick={handleReserve}>
                    Đặt phòng ngay
                  </button>
                  <p className="widget-notice-muted">Bạn vẫn chưa bị trừ tiền ở bước này</p>

                  {/* Calculation Breakdown */}
                  <div className="widget-calculation-row">
                    <span style={{ textDecoration: 'underline' }}>{formatPriceVal(pricePerNight)} x {nights} đêm</span>
                    <span>{formatPriceVal(baseTotal)}</span>
                  </div>
                  <div className="widget-calculation-row">
                    <span style={{ textDecoration: 'underline' }}>Phí vệ sinh</span>
                    <span>{formatPriceVal(cleaningFee)}</span>
                  </div>
                  <div className="widget-calculation-row">
                    <span style={{ textDecoration: 'underline' }}>Phí dịch vụ TripNest (12%)</span>
                    <span>{formatPriceVal(serviceFee)}</span>
                  </div>

                  <div className="widget-total-row">
                    <span>Tổng trước thuế</span>
                    <span>{formatPriceVal(grandTotal)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RoomDetailModal;
