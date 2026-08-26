import React from 'react';
import {
  TbX,
  TbCalendarEvent,
  TbUser,
  TbHome,
  TbReceipt,
  TbCheck,
  TbBan,
  TbCreditCard,
  TbClock,
  TbSparkles,
  TbPhone,
  TbMail,
  TbShieldCheck,
  TbUsers,
  TbFileInvoice,
  TbBuildingBank,
  TbNotes,
  TbPrinter,
} from 'react-icons/tb';
import { useConfirm } from '@/context/ConfirmContext';
import { useToast } from '@/context/ToastContext';

export const BookingDetailModal = ({ booking, onClose, onUpdateStatus }) => {
  const confirm = useConfirm();
  const toast = useToast();
  if (!booking) return null;

  const formatVND = (val) => `${(val || 0).toLocaleString('vi-VN')} ₫`;

  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split(' ')[0].split('-');
    if (parts.length === 3) {
      const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr.includes(' ') ? `${formattedDate} ${dateStr.split(' ')[1]}` : formattedDate;
    }
    return dateStr;
  };

  const calculateNights = () => {
    if (booking.nights && Number(booking.nights) > 0) return Number(booking.nights);
    try {
      const d1 = new Date(booking.check_in);
      const d2 = new Date(booking.check_out);
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  const getStatusInfo = (st) => {
    switch (st) {
      case 'confirmed':
        return { label: 'ĐÃ XÁC NHẬN', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      case 'checked_in':
        return { label: 'ĐANG LƯU TRÚ', bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
      case 'completed':
        return { label: 'HOÀN TẤT', bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
      case 'pending':
        return { label: 'CHỜ XÁC NHẬN', bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
      case 'cancelled':
        return { label: 'ĐÃ HỦY ĐƠN', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
      default:
        return { label: (st || 'UNKNOWN').toUpperCase(), bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  const getPaymentBadge = (pm, ps) => {
    let name = pm || 'Thanh toán trực tuyến';
    if (name.toLowerCase().includes('vietqr')) name = 'VietQR Pro';
    else if (name.toLowerCase().includes('momo')) name = 'Ví MoMo';
    else if (name.toLowerCase().includes('credit') || name.toLowerCase().includes('visa')) name = 'Thẻ Quốc Tế (Visa/Mastercard)';
    else if (name.toLowerCase().includes('bank')) name = 'Chuyển khoản Ngân hàng';

    const isPaid = ps === 'paid' || ps === 'completed';
    return {
      name,
      statusLabel: isPaid ? 'Đã thanh toán' : 'Chờ thanh toán',
      isPaid,
    };
  };

  const totalNights = calculateNights();
  const statusInfo = getStatusInfo(booking.status);
  const paymentInfo = getPaymentBadge(booking.payment_method, booking.payment_status);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-container"
        style={{
          width: '780px',
          maxWidth: '95vw',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '20px',
          padding: '1.75rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.22)',
          background: '#ffffff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.35)',
              }}
            >
              <TbFileInvoice />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                  Hóa Đơn Đặt Phòng <span style={{ color: '#7c3aed', fontFamily: 'monospace' }}>#{booking.id}</span>
                </h2>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: statusInfo.bg,
                    color: statusInfo.text,
                    border: `1px solid ${statusInfo.border}`,
                    letterSpacing: '0.5px',
                  }}
                >
                  {statusInfo.label}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '3px', margin: 0 }}>
                Ngày tạo đơn: <strong style={{ color: '#334155' }}>{formatDateVN(booking.created_at)}</strong> · TripNest Escrow Protection
              </p>
            </div>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
            style={{
              position: 'static',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <TbX style={{ fontSize: '1.2rem' }} />
          </button>
        </div>

        {/* 2. Main Content Body */}
        <div style={{ padding: '1.25rem 0' }}>
          {/* Top 2 Cards: Guest Info & Accommodation Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Customer Info Card */}
            <div
              style={{
                background: '#f8fafc',
                padding: '1.15rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#64748b',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  marginBottom: '0.65rem',
                }}
              >
                <TbUser style={{ color: '#7c3aed', fontSize: '0.95rem' }} />
                <span>Thông Tin Khách Hàng</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                {booking.guest_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#475569', marginTop: '5px' }}>
                <TbMail style={{ color: '#94a3b8' }} />
                <span>{booking.guest_email || 'Chưa cung cấp email'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#475569', marginTop: '3px' }}>
                <TbPhone style={{ color: '#94a3b8' }} />
                <strong style={{ color: '#0f172a' }}>{booking.guest_phone || '0912 345 678'}</strong>
              </div>
            </div>

            {/* Accommodation & Host Info Card */}
            <div
              style={{
                background: '#f8fafc',
                padding: '1.15rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#64748b',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  marginBottom: '0.65rem',
                }}
              >
                <TbHome style={{ color: '#0284c7', fontSize: '0.95rem' }} />
                <span>Chỗ Ở & Chủ Nhà</span>
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  color: '#0f172a',
                  lineHeight: '1.35',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
                title={booking.room_name}
              >
                {booking.room_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#0284c7', fontWeight: 700, marginTop: '6px' }}>
                <TbShieldCheck style={{ fontSize: '1rem', color: '#0ea5e9' }} />
                <span>Chủ nhà: {booking.host_name || 'Minh Vũ'}</span>
                <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px' }}>Superhost</span>
              </div>
            </div>
          </div>

          {/* 3 Elevated Info Tiles: Schedule, Guests, Payment */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 0.9fr 1.3fr',
              gap: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {/* Tile 1: Lịch trình */}
            <div
              style={{
                background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TbCalendarEvent style={{ color: '#2563eb' }} /> Lịch Trình Lưu Trú
              </span>
              <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', marginTop: '4px', margin: 0, whiteSpace: 'nowrap' }}>
                {formatDateVN(booking.check_in)} ➔ {formatDateVN(booking.check_out)}
              </p>
              <div style={{ marginTop: '3px' }}>
                <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                  {totalNights} đêm nghỉ dưỡng
                </span>
              </div>
            </div>

            {/* Tile 2: Số lượng */}
            <div
              style={{
                background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TbUsers style={{ color: '#7c3aed' }} /> Số Lượng Khách
              </span>
              <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', marginTop: '4px', margin: 0 }}>
                {booking.guests_count || booking.guests || 2} khách lưu trú
              </p>
              <div style={{ marginTop: '3px', fontSize: '0.72rem', color: '#64748b' }}>
                Toàn bộ căn hộ/phòng
              </div>
            </div>

            {/* Tile 3: Thanh toán */}
            <div
              style={{
                background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TbBuildingBank style={{ color: '#059669' }} /> Cổng Thanh Toán
              </span>
              <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', marginTop: '4px', margin: 0 }}>
                {paymentInfo.name}
              </p>
              <div style={{ marginTop: '3px' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: paymentInfo.isPaid ? '#ecfdf5' : '#fffbeb',
                    color: paymentInfo.isPaid ? '#059669' : '#d97706',
                    border: `1px solid ${paymentInfo.isPaid ? '#a7f3d0' : '#fde68a'}`,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  ✓ {paymentInfo.statusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Financial Breakdown Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Bảng Kê Chi Tiết Tài Chính
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                100% Escrow Bảo Đảm
              </span>
            </div>

            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                overflow: 'hidden',
                background: '#ffffff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              {/* Row 1 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem' }}>
                <span style={{ color: '#475569' }}>Giá gốc phòng nghỉ ({totalNights} đêm)</span>
                <strong style={{ color: '#0f172a' }}>{formatVND(booking.base_price)}</strong>
              </div>

              {/* Row 2 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem' }}>
                <span style={{ color: '#475569' }}>Phí dọn dẹp vệ sinh</span>
                <strong style={{ color: '#0f172a' }}>{formatVND(booking.cleaning_fee)}</strong>
              </div>

              {/* Row 3 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem', background: '#faf5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#6b21a8', fontWeight: 600 }}>Phí dịch vụ nền tảng TripNest (12%)</span>
                  <span style={{ fontSize: '0.68rem', background: '#f3e8ff', color: '#7c3aed', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>VAT & Bảo hiểm</span>
                </div>
                <strong style={{ color: '#7c3aed' }}>{formatVND(booking.service_fee)}</strong>
              </div>

              {/* Grand Total Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                  borderTop: '1px solid #fecdd3',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#9f1239', display: 'block' }}>
                    Tổng thanh toán của khách
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#be123c' }}>
                    Đã thanh toán đầy đủ qua cổng trung gian
                  </span>
                </div>
                <strong style={{ fontSize: '1.3rem', fontWeight: 900, color: '#e11d48', letterSpacing: '-0.3px' }}>
                  {formatVND(booking.total_price)}
                </strong>
              </div>
            </div>
          </div>

          {/* 5. Special Requests Box */}
          {booking.special_requests && (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '0.85rem 1.1rem',
                color: '#92400e',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <TbNotes style={{ fontSize: '1.2rem', color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#b45309' }}>Yêu cầu đặc biệt của khách:</strong>
                <span style={{ color: '#78350f', marginLeft: '4px' }}>"{booking.special_requests}"</span>
              </div>
            </div>
          )}
        </div>

        {/* 6. Footer Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '1.25rem',
          }}
        >
          <button
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
              background: '#ffffff',
              fontWeight: 700,
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
            }}
            onClick={onClose}
          >
            Đóng
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {booking.status !== 'cancelled' && (
              <button
                style={{
                  padding: '0.65rem 1.1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #fecaca',
                  background: '#fef2f2',
                  color: '#b91c1c',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
                onClick={async () => {
                  const isConfirmed = await confirm({
                    title: 'Hủy đơn & hoàn tiền?',
                    message: `Hủy đơn đặt phòng ${booking.id} và hoàn tiền cho khách lưu trú?`,
                    type: 'danger',
                    confirmText: 'Xác nhận hủy & hoàn tiền',
                    cancelText: 'Đóng',
                  });
                  if (isConfirmed) {
                    onUpdateStatus(booking.id, 'cancelled', 'Admin can thiệp hủy theo yêu cầu');
                    toast.info('Hủy đơn phòng', `Đã hủy đơn ${booking.id} và kích hoạt hoàn tiền.`);
                    onClose();
                  }
                }}
              >
                <TbBan />
                <span>Hủy Đơn & Hoàn Tiền</span>
              </button>
            )}

            {booking.status === 'pending' && (
              <button
                className="btn-admin-primary"
                onClick={() => {
                  onUpdateStatus(booking.id, 'confirmed');
                  onClose();
                }}
              >
                <TbCheck />
                <span>Duyệt Xác Nhận Đơn</span>
              </button>
            )}

            {booking.status === 'confirmed' && (
              <button
                className="btn-admin-primary"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
                onClick={() => {
                  onUpdateStatus(booking.id, 'completed');
                  onClose();
                }}
              >
                <TbCheck />
                <span>Đánh Dấu Hoàn Tất Chuyến Đi</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BookingDetailModal;
