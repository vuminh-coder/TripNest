import './BookingCheckoutPage.css';
import React, { useState } from 'react';
import {
  TbArrowLeft,
  TbArrowRight,
  TbShieldCheck,
  TbStarFilled,
  TbCreditCard,
  TbQrcode,
  TbCash,
  TbCheck,
  TbCalendar,
  TbUsers,
  TbLock,
  TbTag,
  TbUser,
  TbMail,
  TbPhone,
  TbMessageDots,
  TbCircleCheck,
  TbCopy,
  TbClock,
  TbReceipt,
  TbSparkles,
  TbShieldLock,
  TbPrinter,
  TbGift,
  TbEdit,
  TbAlertCircle,
  TbAward,
  TbFileInvoice,
  TbLockCheck,
  TbHeartHandshake,
} from 'react-icons/tb';

export const BookingCheckoutPage = ({
  room,
  bookingParams = {},
  currency = 'VND',
  onBack,
  onBookingComplete,
}) => {
  // Step Wizard State: 1 = Review Trip, 2 = Guest Info, 3 = Payment & Confirmation
  const [currentStep, setCurrentStep] = useState(1);

  const checkIn = bookingParams.checkIn || '2026-08-25';
  const checkOut = bookingParams.checkOut || '2026-08-28';
  const guests = Number(bookingParams.guests) || Number(bookingParams.guestCount) || 2;

  // Calculate nights
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const nights = bookingParams.nights || Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24))) || 3;

  // Helper date formatter: "25 thg 8, 2026"
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parseInt(parts[2], 10)} thg ${parseInt(parts[1], 10)}, ${parts[0]}`;
      }
      const d = new Date(dateStr);
      return `${d.getDate()} thg ${d.getMonth() + 1}, ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Helper compact date range: "25 – 28 thg 8, 2026" (always fits 1 line perfectly)
  const formatDateRange = (d1Str, d2Str) => {
    if (!d1Str || !d2Str) return '';
    try {
      const p1 = d1Str.split('-').map(Number);
      const p2 = d2Str.split('-').map(Number);
      if (p1.length === 3 && p2.length === 3) {
        const [y1, m1, day1] = p1;
        const [y2, m2, day2] = p2;
        if (y1 === y2 && m1 === m2) {
          return `${day1} – ${day2} thg ${m1}, ${y1}`;
        }
        if (y1 === y2) {
          return `${day1} thg ${m1} – ${day2} thg ${m2}, ${y1}`;
        }
        return `${day1}/${m1}/${y1} – ${day2}/${m2}/${y2}`;
      }
    } catch {}
    return `${formatDisplayDate(d1Str)} ➔ ${formatDisplayDate(d2Str)}`;
  };

  // Price calculations
  const pricePerNight = currency === 'USD' ? (room.priceUSD || 100) : (room.priceVND || (room.priceUSD || 100) * 25000);
  const baseTotal = pricePerNight * nights;
  const cleaningFee = currency === 'USD' ? 30 : (room.cleaning_fee_vnd || 350000);
  const serviceFee = Math.round(baseTotal * 0.12);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guestNote, setGuestNote] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('vietqr');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [isVATRequested, setIsVATRequested] = useState(false);
  const [isBookingForOther, setIsBookingForOther] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const NOTE_MAX = 500;

  // Quick note chips
  const quickNotes = [
    'Nhận phòng lúc 14:00',
    'Yêu cầu phòng view đẹp',
    'Cần chuẩn bị giường phụ',
    'Chuyến đi kỷ niệm',
  ];

  const handleAddQuickNote = (chipText) => {
    if (guestNote.includes(chipText)) return;
    const newNote = guestNote ? `${guestNote}, ${chipText}` : chipText;
    if (newNote.length <= NOTE_MAX) setGuestNote(newNote);
  };

  // Step 1 -> Step 2
  const handleProceedToStep2 = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 140, behavior: 'smooth' });
  };

  // Step 2 -> Step 3 (With Validation)
  const handleProceedToStep3 = (e) => {
    if (e) e.preventDefault();
    const errors = {};
    if (!fullName.trim()) {
      errors.fullName = 'Vui lòng nhập Họ và tên khách';
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Vui lòng nhập địa chỉ email hợp lệ';
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      errors.phone = 'Vui lòng nhập số điện thoại hợp lệ (9-11 số)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setCurrentStep(3);
    window.scrollTo({ top: 140, behavior: 'smooth' });
  };

  // Apply promo
  const handleApplyPromo = (e) => {
    if (e) e.preventDefault();
    if (!promoCode.trim()) return;
    if (promoCode.trim().toUpperCase() === 'TRIPNESTVIP') {
      const discount = Math.round(baseTotal * 0.1);
      setPromoDiscount(discount);
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Mã ưu đãi không hợp lệ hoặc đã hết hạn.');
    }
  };

  const handleAutoFillPromo = () => {
    setPromoCode('TRIPNESTVIP');
    const discount = Math.round(baseTotal * 0.1);
    setPromoDiscount(discount);
    setPromoApplied(true);
    setPromoError('');
  };

  const grandTotal = Math.max(0, baseTotal + cleaningFee + serviceFee - promoDiscount);

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Number(val).toLocaleString()}`;
    return `${Number(val).toLocaleString('vi-VN')} ₫`;
  };

  // Step 3 Final Submission
  const handleFinalConfirmBooking = (e) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    const generatedId = 'TN-' + Math.floor(100000 + Math.random() * 900000);
    setTimeout(() => {
      setIsProcessing(false);
      setIsConfirmed(true);
      setBookingId(generatedId);
      if (onBookingComplete) {
        onBookingComplete({
          id: generatedId,
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
          guestNote,
          isVATRequested,
          isBookingForOther,
        });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(bookingId).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
  };

  // =========================================================================
  // SUCCESS SCREEN: VOUCHER / BOARDING PASS
  // =========================================================================
  if (isConfirmed) {
    return (
      <div className="checkout-success-container">
        <div className="checkout-success-card">
          <div className="success-icon-badge success-pop-anim">
            <TbCircleCheck />
          </div>
          <h2 className="success-heading fade-slide-up">Đặt Chỗ Thành Công!</h2>
          <p className="success-subtext fade-slide-up">
            Vé điện tử xác nhận đã được gửi tự động tới hòm thư <strong>{email}</strong> và số điện thoại <strong>{phone}</strong>.
          </p>

          {/* Luxury Voucher Card */}
          <div className="success-voucher-card fade-slide-up">
            <div className="voucher-header-bar">
              <div className="voucher-brand">
                <span className="voucher-brand-logo">TripNest</span>
                <span className="voucher-brand-tag">Vé Xác Nhận</span>
              </div>
              <div className="booking-id-pill">
                <span className="booking-id-label">Mã đặt:</span>
                <strong className="booking-id-code">{bookingId}</strong>
                <button className="voucher-copy-btn" onClick={handleCopyBookingId} title="Sao chép mã">
                  {copiedId ? <TbCheck style={{ color: '#10b981' }} /> : <TbCopy />}
                </button>
              </div>
            </div>

            <div className="voucher-details-grid">
              <div className="voucher-detail-item">
                <span className="v-label"><TbCalendar /> Thời gian lưu trú</span>
                <strong className="v-val">{formatDateRange(checkIn, checkOut)}</strong>
                <span className="v-sub">({nights} đêm · Nhận 14:00 · Trả 12:00)</span>
              </div>

              <div className="voucher-detail-item">
                <span className="v-label"><TbUsers /> Khách lưu trú</span>
                <strong className="v-val">{guests} khách</strong>
                <span className="v-sub">{room.title}</span>
              </div>

              <div className="voucher-detail-item">
                <span className="v-label"><TbCreditCard /> Phương thức thanh toán</span>
                <strong className="v-val">
                  {paymentMethod === 'vietqr' ? 'Chuyển khoản VietQR / MoMo' : paymentMethod === 'card' ? 'Thẻ quốc tế (Visa/Mastercard)' : 'Thanh toán trực tiếp khi nhận phòng'}
                </strong>
                <span className="v-sub">Bảo đảm 100% bởi TripCover</span>
              </div>

              <div className="voucher-detail-item v-total-box">
                <span className="v-label"><TbReceipt /> Tổng thanh toán</span>
                <strong className="v-total-price">{formatPrice(grandTotal)}</strong>
                <span className="v-sub">Đã gồm thuế và phí</span>
              </div>
            </div>
          </div>

          <div className="success-actions-row">
            <button className="primary-gradient-btn" onClick={onBack}>
              <TbArrowLeft /> Quay lại chỗ ở
            </button>
            <button className="secondary-outline-btn" onClick={() => window.print()}>
              <TbPrinter /> In vé xác nhận
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MULTI-STEP WIZARD MAIN VIEW
  // =========================================================================
  return (
    <div className="dedicated-checkout-page">
      <div className="checkout-inner-container">
        {/* Top Header Navigation */}
        <div className="checkout-nav-bar">
          <button className="checkout-back-btn" onClick={onBack} title="Quay lại chỗ ở">
            <TbArrowLeft /> Quay lại
          </button>
          <div className="checkout-header-center">
            <h1 className="checkout-page-title">Xác nhận & Thanh toán</h1>
            <p className="checkout-page-subtitle">Hoàn tất đặt chỗ cho kỳ nghỉ của bạn</p>
          </div>
          <div className="checkout-secure-badge">
            <TbShieldLock /> Bảo mật SSL 256-bit
          </div>
        </div>

        {/* Dynamic Interactive Stepper Bar */}
        <div className="checkout-stepper-wrap">
          {/* Step 1 Pill */}
          <div
            className={`stepper-step ${currentStep === 1 ? 'active' : 'completed'} ${currentStep > 1 ? 'clickable' : ''}`}
            onClick={() => { if (currentStep > 1) setCurrentStep(1); }}
            title={currentStep > 1 ? 'Nhấn để quay lại Bước 1' : ''}
          >
            <div className="step-circle">
              {currentStep > 1 ? <TbCheck /> : '1'}
            </div>
            <span className="step-text">Kiểm tra chuyến đi</span>
          </div>

          <div className={`stepper-line ${currentStep >= 2 ? 'completed' : ''}`} />

          {/* Step 2 Pill */}
          <div
            className={`stepper-step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'} ${currentStep > 2 ? 'clickable' : ''}`}
            onClick={() => { if (currentStep > 2) setCurrentStep(2); }}
            title={currentStep > 2 ? 'Nhấn để quay lại Bước 2' : ''}
          >
            <div className="step-circle">
              {currentStep > 2 ? <TbCheck /> : '2'}
            </div>
            <span className="step-text">Thông tin khách</span>
          </div>

          <div className={`stepper-line ${currentStep >= 3 ? 'completed' : ''}`} />

          {/* Step 3 Pill */}
          <div className={`stepper-step ${currentStep === 3 ? 'active' : 'pending'}`}>
            <div className="step-circle">3</div>
            <span className="step-text">Thanh toán</span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="checkout-grid-layout">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: ACTIVE STEP CONTENT (60%) */}
          {/* ========================================================================= */}
          <div className="checkout-left-col">
            {/* --------------------------------------------------------------------- */}
            {/* [BƯỚC 1]: KIỂM TRA & XÁC NHẬN CHUYẾN ĐI                               */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === 1 && (
              <div className="wizard-step-panel step-fade-in">
                <section className="checkout-card-luxury">
                  <div className="card-luxury-header">
                    <span className="card-step-badge">1</span>
                    <div>
                      <h3 className="card-luxury-title">Chi tiết chuyến đi</h3>
                      <p className="card-luxury-subtitle">Kiểm tra thời gian và số lượng khách lưu trú</p>
                    </div>
                  </div>

                  <div className="trip-dates-preview-grid">
                    {/* Date Tile */}
                    <div className="trip-preview-tile">
                      <div className="tile-icon-box"><TbCalendar /></div>
                      <div className="tile-content">
                        <span className="tile-label">Thời gian lưu trú ({nights} đêm)</span>
                        <strong className="tile-value-bold">{formatDateRange(checkIn, checkOut)}</strong>
                        <span className="tile-sub">
                          <TbClock className="tile-sub-icon" />
                          Nhận 14:00 · Trả 12:00
                        </span>
                      </div>
                    </div>

                    {/* Guest Tile */}
                    <div className="trip-preview-tile">
                      <div className="tile-icon-box"><TbUsers /></div>
                      <div className="tile-content">
                        <span className="tile-label">Số lượng khách</span>
                        <strong className="tile-value-bold">{guests} khách lưu trú</strong>
                        <span className="tile-sub">
                          <TbCheck className="tile-sub-icon" style={{ color: '#10b981' }} />
                          Toàn bộ chỗ ở riêng tư
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Policies & TripCover included in Step 1 */}
                <section className="checkout-card-luxury policy-card-wrap">
                  <div className="policy-header-row">
                    <TbShieldCheck className="policy-icon-main" />
                    <div>
                      <h4 className="policy-main-title">Chính sách hủy phòng</h4>
                      <p className="policy-main-desc">
                        Hủy miễn phí 100% trước 48h nhận phòng (trước 14:00 ngày {formatDisplayDate(checkIn)}).
                      </p>
                    </div>
                  </div>

                  {/* 3 Structured Pastel Timeline Cards */}
                  <div className="policy-cards-3grid">
                    <div className="policy-badge-card badge-green">
                      <span className="p-badge-time">Hôm nay</span>
                      <strong className="p-badge-status">Hủy miễn phí 100%</strong>
                      <span className="p-badge-sub">Trước 14:00 ngày {formatDisplayDate(checkIn)}</span>
                    </div>

                    <div className="policy-badge-card badge-yellow">
                      <span className="p-badge-time">Trước 48h nhận phòng</span>
                      <strong className="p-badge-status">Hoàn 50% tiền phòng</strong>
                      <span className="p-badge-sub">Theo chính sách chỗ ở</span>
                    </div>

                    <div className="policy-badge-card badge-red">
                      <span className="p-badge-time">Ngày nhận phòng</span>
                      <strong className="p-badge-status">Không hoàn lại</strong>
                      <span className="p-badge-sub">Sau 14:00 ngày nhận</span>
                    </div>
                  </div>
                </section>

                {/* Step 1 Action Button */}
                <div className="wizard-action-buttons-row">
                  <button
                    type="button"
                    className="wizard-next-step-btn"
                    onClick={handleProceedToStep2}
                  >
                    Tiếp tục: Nhập thông tin khách <TbArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* [BƯỚC 2]: THÔNG TIN KHÁCH HÀNG & YÊU CẦU ĐẶC BIỆT                      */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === 2 && (
              <div className="wizard-step-panel step-fade-in">
                <section className="checkout-card-luxury">
                  <div className="card-luxury-header">
                    <span className="card-step-badge">2</span>
                    <div>
                      <h3 className="card-luxury-title">Thông tin khách lưu trú</h3>
                      <p className="card-luxury-subtitle">Mã vé sẽ được gửi tự động qua email & SĐT này</p>
                    </div>
                  </div>

                  <form onSubmit={handleProceedToStep3} className="guest-info-form">
                    <div className="form-group-field">
                      <label className="form-field-label">Họ và tên khách đại diện *</label>
                      <div className={`input-with-icon ${formErrors.fullName ? 'has-error' : ''}`}>
                        <TbUser className="input-icon-prefix" />
                        <input
                          type="text"
                          placeholder="Ví dụ: Nguyễn Văn An"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: null });
                          }}
                          required
                        />
                      </div>
                      {formErrors.fullName ? (
                        <span className="field-error-msg"><TbAlertCircle /> {formErrors.fullName}</span>
                      ) : (
                        <span className="field-helper-text">Theo CCCD / Hộ chiếu khi nhận phòng</span>
                      )}
                    </div>

                    <div className="form-two-cols">
                      <div className="form-group-field">
                        <label className="form-field-label">Email nhận vé *</label>
                        <div className={`input-with-icon ${formErrors.email ? 'has-error' : ''}`}>
                          <TbMail className="input-icon-prefix" />
                          <input
                            type="email"
                            placeholder="tenban@email.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                            }}
                            required
                          />
                        </div>
                        {formErrors.email && (
                          <span className="field-error-msg"><TbAlertCircle /> {formErrors.email}</span>
                        )}
                      </div>

                      <div className="form-group-field">
                        <label className="form-field-label">Số điện thoại (Zalo) *</label>
                        <div className={`input-with-icon ${formErrors.phone ? 'has-error' : ''}`}>
                          <TbPhone className="input-icon-prefix" />
                          <input
                            type="tel"
                            placeholder="0912 345 678"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (formErrors.phone) setFormErrors({ ...formErrors, phone: null });
                            }}
                            required
                          />
                        </div>
                        {formErrors.phone && (
                          <span className="field-error-msg"><TbAlertCircle /> {formErrors.phone}</span>
                        )}
                      </div>
                    </div>

                    {/* Optional Special Requests */}
                    <div className="form-group-field">
                      <label className="form-field-label">Lời nhắn gửi chủ nhà (Tùy chọn)</label>
                      <div className="quick-notes-chips-row">
                        {quickNotes.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="quick-note-chip"
                            onClick={() => handleAddQuickNote(chip)}
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                      <div className="textarea-with-icon">
                        <TbMessageDots className="textarea-icon-prefix" />
                        <textarea
                          rows={3}
                          placeholder="Ví dụ: Dự kiến nhận phòng lúc 15:00..."
                          value={guestNote}
                          onChange={(e) => {
                            if (e.target.value.length <= NOTE_MAX) setGuestNote(e.target.value);
                          }}
                          maxLength={NOTE_MAX}
                        />
                      </div>
                      <span className="char-counter">{guestNote.length}/{NOTE_MAX} ký tự</span>
                    </div>

                    {/* Additional Options */}
                    <div className="extra-booking-options-list">
                      <label className={`extra-checkbox-card ${isVATRequested ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isVATRequested}
                          onChange={(e) => setIsVATRequested(e.target.checked)}
                        />
                        <div className="checkbox-custom-content">
                          <strong className="checkbox-main-title">
                            <TbFileInvoice className="chk-title-icon" />
                            Xuất hóa đơn VAT doanh nghiệp (Miễn phí)
                          </strong>
                          <span className="checkbox-sub-desc">
                            Gửi hóa đơn điện tử qua email trong 24h
                          </span>
                        </div>
                      </label>

                      <label className={`extra-checkbox-card ${isBookingForOther ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isBookingForOther}
                          onChange={(e) => setIsBookingForOther(e.target.checked)}
                        />
                        <div className="checkbox-custom-content">
                          <strong className="checkbox-main-title">
                            <TbHeartHandshake className="chk-title-icon" />
                            Đặt phòng giúp người thân / bạn bè
                          </strong>
                          <span className="checkbox-sub-desc">
                            Đồng bộ thông tin khi check-in tại quầy
                          </span>
                        </div>
                      </label>
                    </div>
                  </form>
                </section>

                {/* Step 2 Action Buttons */}
                <div className="wizard-action-buttons-row">
                  <button
                    type="button"
                    className="wizard-prev-step-btn"
                    onClick={() => setCurrentStep(1)}
                  >
                    <TbArrowLeft /> Quay lại Bước 1
                  </button>
                  <button
                    type="button"
                    className="wizard-next-step-btn"
                    onClick={handleProceedToStep3}
                  >
                    Tiếp tục: Thanh toán <TbArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* [BƯỚC 3]: PHƯƠNG THỨC THANH TOÁN & HOÀN TẤT ĐẶT CHỖ                    */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === 3 && (
              <div className="wizard-step-panel step-fade-in">
                {/* Guest Mini Summary Strip */}
                <div className="guest-mini-summary-box">
                  <div className="guest-mini-summary-left">
                    <span className="guest-mini-label"><TbUser /> Khách đặt:</span>
                    <strong className="guest-mini-name">{fullName}</strong>
                    <span className="guest-mini-contact">· {phone} · {email}</span>
                  </div>
                  <button
                    type="button"
                    className="guest-mini-edit-btn"
                    onClick={() => setCurrentStep(2)}
                    title="Chỉnh sửa thông tin khách"
                  >
                    <TbEdit /> Sửa
                  </button>
                </div>

                <section className="checkout-card-luxury">
                  <div className="card-luxury-header">
                    <span className="card-step-badge">3</span>
                    <div>
                      <h3 className="card-luxury-title">Phương thức thanh toán</h3>
                      <p className="card-luxury-subtitle">Giao dịch mã hóa an toàn chuẩn ngân hàng</p>
                    </div>
                  </div>

                  <div className="payment-options-luxury-grid">
                    {/* VietQR Option */}
                    <div
                      className={`payment-luxury-card ${paymentMethod === 'vietqr' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('vietqr')}
                    >
                      <div className="pay-card-top">
                        <div className="pay-radio-wrap">
                          <input
                            type="radio"
                            name="payMethod"
                            checked={paymentMethod === 'vietqr'}
                            onChange={() => setPaymentMethod('vietqr')}
                          />
                        </div>
                        <div className="pay-icon-box icon-vietqr">
                          <TbQrcode />
                        </div>
                        <div className="pay-text-wrap">
                          <div className="pay-title-row">
                            <strong>Chuyển khoản VietQR / MoMo</strong>
                            <span className="pay-recommended-badge">
                              <TbSparkles style={{ verticalAlign: 'middle', marginRight: 3 }} /> Khuyên dùng
                            </span>
                          </div>
                          <span className="pay-desc">Quét mã QR chuyển khoản 24/7 không mất phí</span>
                        </div>
                      </div>

                      {paymentMethod === 'vietqr' && (
                        <div className="vietqr-interactive-drawer">
                          <div className="vietqr-banks-logo-strip">
                            <span className="bank-logo-chip">Vietcombank</span>
                            <span className="bank-logo-chip">MB Bank</span>
                            <span className="bank-logo-chip">Techcombank</span>
                            <span className="bank-logo-chip">MoMo</span>
                            <span className="bank-logo-chip">ZaloPay</span>
                          </div>
                          <p className="vietqr-guide-hint">
                            <TbSparkles style={{ color: '#ff385c', marginRight: 4 }} />
                            Mã QR động sẽ tự động tạo ngay sau khi bấm Xác nhận.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Credit / Debit Card Option */}
                    <div
                      className={`payment-luxury-card ${paymentMethod === 'card' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <div className="pay-card-top">
                        <div className="pay-radio-wrap">
                          <input
                            type="radio"
                            name="payMethod"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                          />
                        </div>
                        <div className="pay-icon-box icon-card">
                          <TbCreditCard />
                        </div>
                        <div className="pay-text-wrap">
                          <div className="pay-title-row">
                            <strong>Thẻ quốc tế Visa / Mastercard / JCB</strong>
                          </div>
                          <span className="pay-desc">Bảo mật chuẩn quốc tế 3D-Secure</span>
                        </div>
                      </div>

                      {paymentMethod === 'card' && (
                        <div className="card-interactive-drawer">
                          <div className="card-form-grid">
                            <div className="card-form-field">
                              <label>Số thẻ *</label>
                              <input
                                type="text"
                                placeholder="4123 4567 8901 2345"
                                maxLength={19}
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                              />
                            </div>
                            <div className="card-form-field">
                              <label>Tên chủ thẻ *</label>
                              <input
                                type="text"
                                placeholder="NGUYEN VAN AN"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                              />
                            </div>
                            <div className="card-form-half-row">
                              <div className="card-form-field">
                                <label>Hạn thẻ (MM/YY) *</label>
                                <input
                                  type="text"
                                  placeholder="12/28"
                                  maxLength={5}
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                />
                              </div>
                              <div className="card-form-field">
                                <label>Mã CVV *</label>
                                <input
                                  type="password"
                                  placeholder="•••"
                                  maxLength={4}
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cash on Arrival Option */}
                    <div
                      className={`payment-luxury-card ${paymentMethod === 'cash' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <div className="pay-card-top">
                        <div className="pay-radio-wrap">
                          <input
                            type="radio"
                            name="payMethod"
                            checked={paymentMethod === 'cash'}
                            onChange={() => setPaymentMethod('cash')}
                          />
                        </div>
                        <div className="pay-icon-box icon-cash">
                          <TbCash />
                        </div>
                        <div className="pay-text-wrap">
                          <div className="pay-title-row">
                            <strong>Thanh toán khi nhận phòng</strong>
                          </div>
                          <span className="pay-desc">Thanh toán tiền mặt hoặc thẻ tại quầy lễ tân</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Step 3 Final Submit CTA */}
                <div className="checkout-submit-wrap">
                  <div className="wizard-action-buttons-row" style={{ marginBottom: '0.75rem' }}>
                    <button
                      type="button"
                      className="wizard-prev-step-btn"
                      onClick={() => setCurrentStep(2)}
                    >
                      <TbArrowLeft /> Quay lại Bước 2
                    </button>
                    <button
                      type="button"
                      className="checkout-submit-luxury-btn"
                      disabled={isProcessing}
                      onClick={handleFinalConfirmBooking}
                    >
                      {isProcessing ? (
                        <>
                          <span className="submit-spinner" /> Đang xử lý...
                        </>
                      ) : (
                        <>
                          <TbLockCheck style={{ fontSize: '1.25rem' }} /> XÁC NHẬN & ĐẶT PHÒNG ({formatPrice(grandTotal)})
                        </>
                      )}
                    </button>
                  </div>
                  <p className="checkout-legal-terms-text">
                    Nhấn xác nhận đồng nghĩa với việc đồng ý Điều khoản & Chính sách của TripNest.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: PRICE SUMMARY & ROOM DETAILS (40% - STICKY THROUGHOUT)      */}
          {/* ========================================================================= */}
          <div className="checkout-right-col">
            <div className="sticky-checkout-summary-card">
              {/* Room Summary Header */}
              <div className="summary-room-luxury-box">
                <img
                  src={room.images?.[0] || room.images}
                  alt={room.title}
                  className="summary-luxury-thumb"
                />
                <div className="summary-luxury-info">
                  <span className="summary-type-tag">{room.type || 'Biệt thự nghỉ dưỡng'} · {room.city}</span>
                  <h4 className="summary-room-name">{room.title}</h4>
                  <div className="summary-rating-row">
                    <TbStarFilled style={{ color: '#ff385c', fontSize: '0.95rem' }} />
                    <strong className="summary-score">{room.rating?.toFixed(2) || '4.96'}</strong>
                    <span className="summary-reviews-count">({room.reviewsCount || 128})</span>
                    <span className="summary-host-pill">
                      <TbAward style={{ verticalAlign: 'middle', marginRight: 3, color: '#d97706' }} /> Siêu cấp
                    </span>
                  </div>
                </div>
              </div>

              <div className="summary-divider-line" />

              {/* Promo Code Input Box */}
              <div className="summary-promo-section">
                <form onSubmit={handleApplyPromo} className="promo-form-luxury">
                  <div className="promo-input-wrapper">
                    <TbTag className="promo-tag-icon" />
                    <input
                      type="text"
                      placeholder="Nhập mã ưu đãi..."
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <button
                      type="submit"
                      className="promo-apply-submit-btn"
                      disabled={promoApplied}
                    >
                      {promoApplied ? 'Đã áp dụng' : 'Áp dụng'}
                    </button>
                  </div>
                </form>

                {!promoApplied && (
                  <button
                    type="button"
                    className="quick-fill-promo-btn"
                    onClick={handleAutoFillPromo}
                  >
                    <TbGift style={{ color: '#ff385c' }} /> Mã VIP: <strong>TRIPNESTVIP</strong> (Giảm 10%)
                  </button>
                )}

                {promoApplied && (
                  <div className="promo-success-pill">
                    <TbCircleCheck style={{ color: '#10b981', fontSize: '1.1rem' }} />
                    <span>Đã áp dụng mã <strong>TRIPNESTVIP</strong>: Giảm 10%</span>
                  </div>
                )}
                {promoError && <p className="promo-error-msg">{promoError}</p>}
              </div>

              <div className="summary-divider-line" />

              {/* Transparent Price Breakdown */}
              <div className="summary-price-table">
                <h4 className="price-table-heading">Chi tiết giá</h4>

                <div className="price-item-row">
                  <span className="price-item-name">{formatPrice(pricePerNight)} x {nights} đêm</span>
                  <span className={`price-item-val ${promoApplied ? 'has-discount' : ''}`}>
                    {formatPrice(baseTotal)}
                  </span>
                </div>

                <div className="price-item-row">
                  <span className="price-item-name">Phí vệ sinh</span>
                  <span className="price-item-val">{formatPrice(cleaningFee)}</span>
                </div>

                <div className="price-item-row">
                  <span className="price-item-name">Phí dịch vụ (12%)</span>
                  <span className="price-item-val">{formatPrice(serviceFee)}</span>
                </div>

                {promoApplied && (
                  <div className="price-item-row promo-applied-row">
                    <span className="price-item-name">
                      <TbTag style={{ verticalAlign: 'middle', marginRight: 4 }} /> Voucher VIP (-10%)
                    </span>
                    <span className="price-item-val">- {formatPrice(promoDiscount)}</span>
                  </div>
                )}

                <div className="summary-divider-line" />

                <div className="price-item-row grand-total-highlight-row">
                  <div className="grand-total-label-wrap">
                    <strong>Tổng thanh toán</strong>
                    <span className="grand-total-sub">Đã gồm thuế và phí</span>
                  </div>
                  <strong className="grand-total-amount">{formatPrice(grandTotal)}</strong>
                </div>
              </div>

              {/* Trust Guarantees */}
              <div className="summary-trust-seals-box">
                <div className="trust-seal-item">
                  <TbShieldCheck className="trust-seal-icon" />
                  <div>
                    <strong>Bảo đảm TripCover 100%</strong>
                    <p>Hoàn tiền nếu chỗ ở có sự cố</p>
                  </div>
                </div>
                <div className="trust-seal-item">
                  <TbShieldLock className="trust-seal-icon" />
                  <div>
                    <strong>Bảo mật SSL 256-bit</strong>
                    <p>Mã hóa tiêu chuẩn PCI-DSS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckoutPage;
