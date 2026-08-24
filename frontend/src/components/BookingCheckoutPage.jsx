import React, { useState } from 'react';
import {
  TbArrowLeft,
  TbShieldCheck,
  TbStarFilled,
  TbCreditCard,
  TbQrcode,
  TbCash,
  TbCheck,
  TbCalendar,
  TbUsers,
  TbLock,
  TbInfoCircle,
  TbTag,
} from 'react-icons/tb';

export const BookingCheckoutPage = ({
  room,
  bookingParams = {},
  currency = 'VND',
  onBack,
  onBookingComplete,
}) => {
  const checkIn = bookingParams.checkIn || '2026-10-15';
  const checkOut = bookingParams.checkOut || '2026-10-20';
  const guests = bookingParams.guestCount || 2;

  // Calculate nights
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24))) || 5;

  // Price calculations
  const pricePerNight = currency === 'USD' ? room.priceUSD : (room.priceVND || room.priceUSD * 25000);
  const baseTotal = pricePerNight * nights;
  const cleaningFee = currency === 'USD' ? 30 : (room.cleaning_fee_vnd || 500000);
  const serviceFee = Math.round(baseTotal * 0.12);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guestNote, setGuestNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('vietqr');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Apply promo
  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    if (promoCode.trim().toUpperCase() === 'TRIPNESTVIP') {
      const discount = Math.round(baseTotal * 0.1);
      setPromoDiscount(discount);
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.');
    }
  };

  const grandTotal = Math.max(0, baseTotal + cleaningFee + serviceFee - promoDiscount);

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${val.toLocaleString()}`;
    return `${val.toLocaleString('vi-VN')} ₫`;
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      alert('Vui lòng điền đầy đủ họ tên, email và số điện thoại liên hệ.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsConfirmed(true);
      if (onBookingComplete) {
        onBookingComplete({
          roomId: room.id,
          roomTitle: room.title,
          checkIn,
          checkOut,
          nights,
          guests,
          totalPrice: grandTotal,
          paymentMethod,
          fullName,
          email,
          phone,
        });
      }
    }, 1200);
  };

  if (isConfirmed) {
    return (
      <div className="checkout-success-container">
        <div className="checkout-success-card">
          <div className="success-icon-badge">
            <TbCheck />
          </div>
          <h2 className="success-heading">Đặt Chỗ Thành Công!</h2>
          <p className="success-subtext">
            Cảm ơn <strong>{fullName}</strong>, mã đặt chỗ của bạn đã được xác nhận và gửi tới email <strong>{email}</strong>.
          </p>
          <div className="confirmed-summary-box">
            <div className="confirmed-row">
              <span>Chỗ ở:</span>
              <strong>{room.title}</strong>
            </div>
            <div className="confirmed-row">
              <span>Thời gian:</span>
              <strong>{checkIn} – {checkOut} ({nights} đêm)</strong>
            </div>
            <div className="confirmed-row">
              <span>Khách lưu trú:</span>
              <strong>{guests} khách</strong>
            </div>
            <div className="confirmed-row">
              <span>Phương thức:</span>
              <strong>{paymentMethod === 'vietqr' ? 'Quét mã VietQR / MoMo' : paymentMethod === 'card' ? 'Thẻ quốc tế' : 'Thanh toán khi nhận phòng'}</strong>
            </div>
            <div className="confirmed-row total-highlight">
              <span>Tổng tiền thanh toán:</span>
              <strong className="price-highlight">{formatPrice(grandTotal)}</strong>
            </div>
          </div>
          <button className="primary-gradient-btn" onClick={onBack}>
            Quay lại trang chi tiết phòng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dedicated-checkout-page">
      <div className="checkout-nav-bar">
        <button className="checkout-back-btn" onClick={onBack}>
          <TbArrowLeft /> Quay lại chỗ ở
        </button>
        <h1 className="checkout-page-title">Xác nhận & Thanh toán</h1>
        <div className="checkout-secure-badge">
          <TbLock /> Thanh toán bảo mật SSL 256-bit
        </div>
      </div>

      <div className="checkout-grid-layout">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: GUEST INFO & PAYMENT (60%) */}
        {/* ========================================================================= */}
        <div className="checkout-left-col">
          {/* Trip Summary Card */}
          <section className="checkout-section-card">
            <h3 className="checkout-card-heading">1. Chuyến đi của bạn</h3>
            <div className="trip-dates-guests-row">
              <div className="trip-meta-item">
                <span className="trip-label"><TbCalendar /> Ngày lưu trú</span>
                <span className="trip-value">{checkIn} – {checkOut} ({nights} đêm)</span>
              </div>
              <div className="trip-meta-item">
                <span className="trip-label"><TbUsers /> Khách lưu trú</span>
                <span className="trip-value">{guests} khách</span>
              </div>
            </div>
          </section>

          {/* Guest Contact Information */}
          <section className="checkout-section-card">
            <h3 className="checkout-card-heading">2. Thông tin khách lưu trú</h3>
            <form onSubmit={handleConfirmBooking} className="guest-info-form">
              <div className="form-group-field">
                <label>Họ và tên khách hàng *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-two-cols">
                <div className="form-group-field">
                  <label>Địa chỉ Email nhận vé *</label>
                  <input
                    type="email"
                    placeholder="email@vidu.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group-field">
                  <label>Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-field">
                <label>Lời nhắn gửi chủ nhà (Tùy chọn)</label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Tôi dự kiến nhận phòng lúc 15:00 và có mang theo hành lý nhỏ..."
                  value={guestNote}
                  onChange={(e) => setGuestNote(e.target.value)}
                />
              </div>
            </form>
          </section>

          {/* Payment Method */}
          <section className="checkout-section-card">
            <h3 className="checkout-card-heading">3. Chọn phương thức thanh toán</h3>
            <div className="payment-options-grid">
              <label
                className={`payment-option-card ${paymentMethod === 'vietqr' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('vietqr')}
              >
                <div className="pay-radio">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'vietqr'}
                    onChange={() => setPaymentMethod('vietqr')}
                  />
                </div>
                <div className="pay-icon"><TbQrcode /></div>
                <div className="pay-details">
                  <strong>Quét mã QR VietQR / MoMo</strong>
                  <span>Chuyển khoản tức thì mọi ngân hàng 24/7</span>
                </div>
              </label>

              <label
                className={`payment-option-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="pay-radio">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                </div>
                <div className="pay-icon"><TbCreditCard /></div>
                <div className="pay-details">
                  <strong>Thẻ quốc tế Visa / Mastercard / JCB</strong>
                  <span>Bảo mật 3D-Secure không lưu thông tin thẻ</span>
                </div>
              </label>

              <label
                className={`payment-option-card ${paymentMethod === 'cash' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <div className="pay-radio">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                  />
                </div>
                <div className="pay-icon"><TbCash /></div>
                <div className="pay-details">
                  <strong>Thanh toán trực tiếp khi nhận phòng</strong>
                  <span>Thanh toán tiền mặt hoặc thẻ tại quầy lễ tân</span>
                </div>
              </label>
            </div>
          </section>

          {/* Cancellation Policy & TripCover */}
          <section className="checkout-section-card policies-notice-card">
            <div className="notice-row">
              <TbShieldCheck className="notice-icon" />
              <div>
                <strong>Chính sách hủy phòng miễn phí</strong>
                <p>Hủy miễn phí trước 48 giờ trước ngày nhận phòng (14:00 ngày {checkIn}). Sau thời gian này, bạn sẽ được hoàn lại 50% tiền phòng.</p>
              </div>
            </div>
          </section>

          {/* Submit Action */}
          <button
            type="button"
            className="checkout-submit-btn"
            disabled={isProcessing}
            onClick={handleConfirmBooking}
          >
            {isProcessing ? 'Đang xử lý đặt chỗ...' : `⚡ XÁC NHẬN & ĐẶT PHÒNG (${formatPrice(grandTotal)})`}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PRICE SUMMARY & ROOM DETAILS (40%) */}
        {/* ========================================================================= */}
        <div className="checkout-right-col">
          <div className="checkout-room-summary-card">
            <div className="summary-room-header">
              <img
                src={room.images?.[0] || room.images}
                alt={room.title}
                className="summary-room-thumb"
              />
              <div className="summary-room-info">
                <span className="summary-room-type">{room.type || 'Toàn bộ chỗ ở'} · {room.city}</span>
                <h4 className="summary-room-title">{room.title}</h4>
                <div className="summary-room-rating">
                  <TbStarFilled style={{ color: '#ff385c' }} />
                  <span>{room.rating.toFixed(2)}</span>
                  <span style={{ color: '#717171' }}>({room.reviewsCount} đánh giá)</span>
                </div>
              </div>
            </div>

            <div className="summary-divider" />

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="promo-input-box">
              <div className="promo-field-wrap">
                <TbTag className="promo-icon" />
                <input
                  type="text"
                  placeholder="Mã ưu đãi (Thử: TRIPNESTVIP)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                />
                <button type="submit" className="apply-promo-btn" disabled={promoApplied}>
                  {promoApplied ? 'Đã áp dụng' : 'Áp dụng'}
                </button>
              </div>
              {promoApplied && (
                <p className="promo-success-text">🎉 Đã áp dụng mã TRIPNESTVIP: Giảm 10% tiền phòng!</p>
              )}
              {promoError && <p className="promo-error-text">{promoError}</p>}
            </form>

            <div className="summary-divider" />

            {/* Transparent Calculation Breakdown */}
            <h4 className="price-details-title">Chi tiết giá</h4>
            <div className="price-breakdown-list">
              <div className="price-row">
                <span>{formatPrice(pricePerNight)} x {nights} đêm</span>
                <span>{formatPrice(baseTotal)}</span>
              </div>
              <div className="price-row">
                <span>Phí vệ sinh chỗ ở</span>
                <span>{formatPrice(cleaningFee)}</span>
              </div>
              <div className="price-row">
                <span>Phí dịch vụ TripNest (12%)</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              {promoApplied && (
                <div className="price-row promo-discount-row">
                  <span>Ưu đãi voucher VIP (10%)</span>
                  <span>- {formatPrice(promoDiscount)}</span>
                </div>
              )}
              <div className="summary-divider" />
              <div className="price-row grand-total-row">
                <span>Tổng tiền thanh toán</span>
                <span className="grand-total-val">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="tripcover-guarantee-chip">
              <TbShieldCheck style={{ color: '#0d8a43', fontSize: '1.3rem' }} />
              <div>
                <strong>Bảo vệ toàn diện bởi TripCover</strong>
                <p>Kỳ nghỉ của bạn được bảo hiểm 100% trong trường hợp có sự cố bất ngờ.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckoutPage;
