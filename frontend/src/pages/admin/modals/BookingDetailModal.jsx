import React from 'react';
import './BookingDetailModal.css';
import {
  TbX,
  TbCalendarEvent,
  TbUser,
  TbHome,
  TbCheck,
  TbBan,
  TbCreditCard,
  TbClock,
  TbPhone,
  TbMail,
  TbShieldCheck,
  TbUsers,
  TbFileInvoice,
  TbBuildingBank,
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
    <div className="modal-overlay adm-bookdet-overlay" onClick={onClose}>
      <div
        className="modal-container adm-bookdet-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Section */}
        <div className="adm-bookdet-header">
          <div className="adm-bookdet-header-left">
            <div className="adm-bookdet-icon-wrap">
              <TbFileInvoice />
            </div>
            <div>
              <div className="adm-bookdet-title-row">
                <h2 className="adm-bookdet-title">
                  Hóa Đơn Đặt Phòng <span className="adm-bookdet-id-code">#{booking.id}</span>
                </h2>
                <span
                  className="adm-bookdet-status-badge"
                  style={{
                    background: statusInfo.bg,
                    color: statusInfo.text,
                    border: `1px solid ${statusInfo.border}`,
                  }}
                >
                  {statusInfo.label}
                </span>
              </div>
              <p className="adm-bookdet-date-sub">
                Ngày tạo đơn: <strong style={{ color: '#334155' }}>{formatDateVN(booking.created_at)}</strong> · TripNest Escrow Protection
              </p>
            </div>
          </div>

          <button
            className="adm-bookdet-close-btn"
            onClick={onClose}
          >
            <TbX style={{ fontSize: '1.2rem' }} />
          </button>
        </div>

        {/* 2. Main Content Body */}
        <div className="adm-bookdet-body">
          {/* Top 2 Cards: Guest Info & Accommodation Info */}
          <div className="adm-bookdet-2col-top">
            {/* Customer Info Card */}
            <div className="adm-bookdet-card-gray">
              <div className="adm-bookdet-card-head">
                <TbUser style={{ color: '#7c3aed', fontSize: '0.95rem' }} />
                <span>Thông Tin Khách Hàng</span>
              </div>
              <div className="adm-bookdet-guest-name">
                {booking.guest_name}
              </div>
              <div className="adm-bookdet-contact-row">
                <TbMail style={{ color: '#94a3b8' }} />
                <span>{booking.guest_email || 'Chưa cung cấp email'}</span>
              </div>
              <div className="adm-bookdet-contact-row">
                <TbPhone style={{ color: '#94a3b8' }} />
                <strong style={{ color: '#0f172a' }}>{booking.guest_phone || '0912 345 678'}</strong>
              </div>
            </div>

            {/* Accommodation & Host Info Card */}
            <div className="adm-bookdet-card-gray">
              <div className="adm-bookdet-card-head">
                <TbHome style={{ color: '#0284c7', fontSize: '0.95rem' }} />
                <span>Chỗ Ở & Chủ Nhà</span>
              </div>
              <div
                className="adm-bookdet-room-name"
                title={booking.room_name}
              >
                {booking.room_name}
              </div>
              <div className="adm-bookdet-host-row">
                <TbShieldCheck style={{ fontSize: '1rem', color: '#0ea5e9' }} />
                <span>Chủ nhà: {booking.host_name || 'Minh Vũ'}</span>
                <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px' }}>Superhost</span>
              </div>
            </div>
          </div>

          {/* 3 Elevated Info Tiles: Schedule, Guests, Payment */}
          <div className="adm-bookdet-3tiles-grid">
            {/* Tile 1: Lịch trình */}
            <div className="adm-bookdet-tile">
              <span className="adm-bookdet-tile-label">
                <TbCalendarEvent style={{ color: '#2563eb' }} /> Lịch Trình Lưu Trú
              </span>
              <p className="adm-bookdet-tile-val">
                {formatDateVN(booking.check_in)} ➔ {formatDateVN(booking.check_out)}
              </p>
              <div style={{ marginTop: '3px' }}>
                <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                  {totalNights} đêm nghỉ dưỡng
                </span>
              </div>
            </div>

            {/* Tile 2: Khách lưu trú */}
            <div className="adm-bookdet-tile">
              <span className="adm-bookdet-tile-label">
                <TbUsers style={{ color: '#7c3aed' }} /> Khách Lưu Trú
              </span>
              <p className="adm-bookdet-tile-val">
                {booking.guests_count || booking.guests || 2} Khách
              </p>
              <div style={{ marginTop: '3px' }}>
                <span style={{ fontSize: '0.72rem', background: '#ede9fe', color: '#6d28d9', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                  Tiêu chuẩn phòng
                </span>
              </div>
            </div>

            {/* Tile 3: Phương thức & Tình trạng TT */}
            <div className="adm-bookdet-tile">
              <span className="adm-bookdet-tile-label">
                <TbCreditCard style={{ color: '#059669' }} /> Thanh Toán
              </span>
              <p className="adm-bookdet-tile-val" style={{ fontSize: '0.84rem' }}>
                {paymentInfo.name}
              </p>
              <div style={{ marginTop: '3px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: paymentInfo.isPaid ? '#dcfce7' : '#fef3c7',
                    color: paymentInfo.isPaid ? '#15803d' : '#b45309',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  ● {paymentInfo.statusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Financial & Escrow Summary Box */}
          <div className="adm-bookdet-financial-box">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#4c1d95', fontSize: '0.88rem' }}>
                <TbBuildingBank style={{ fontSize: '1.1rem' }} />
                <span>Hạch Toán Dòng Tiền & Ký Quỹ Escrow</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#6d28d9', background: '#f5f3ff', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                Hợp đồng điện tử bảo chứng
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="adm-bookdet-escrow-row">
                <span style={{ color: '#64748b' }}>Đơn giá phòng ({totalNights} đêm):</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatVND(booking.total_price ? Math.round(booking.total_price * 0.88) : 0)}</span>
              </div>
              <div className="adm-bookdet-escrow-row">
                <span style={{ color: '#64748b' }}>Phí dịch vụ nền tảng (Hoa hồng 12%):</span>
                <span style={{ fontWeight: 700, color: '#7c3aed' }}>
                  {formatVND(booking.total_price ? Math.round(booking.total_price * 0.12) : 0)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1.5px dashed #e2e8f0',
                  marginTop: '4px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Tổng Tiền Khách Thanh Toán:</span>
                  <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>Đã bao gồm thuế GTGT & bảo hiểm du lịch</div>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ff385c' }}>
                  {formatVND(booking.total_price)}
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation & Refund Details if Cancelled */}
          {booking.status === 'cancelled' && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.85rem 1rem',
                background: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#991b1b', fontSize: '0.86rem', marginBottom: '0.5rem' }}>
                <TbBan /> Thông Tin Hủy Đơn & Hoàn Tiền
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#7f1d1d', fontWeight: 600 }}>Tỷ lệ hoàn tiền:</span>{' '}
                  <strong style={{ color: '#dc2626' }}>
                    {booking.refund_percentage ?? (booking.refund_amount > 0 ? 100 : 0)}%
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#7f1d1d', fontWeight: 600 }}>Số tiền hoàn khách:</span>{' '}
                  <strong style={{ color: '#dc2626' }}>
                    {formatVND(booking.refund_amount || 0)}
                  </strong>
                </div>
                {booking.cancelled_at && (
                  <div>
                    <span style={{ color: '#7f1d1d', fontWeight: 600 }}>Thời điểm hủy:</span>{' '}
                    <span>{formatDateVN(booking.cancelled_at)}</span>
                  </div>
                )}
                {booking.cancellation_reason && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#7f1d1d', fontWeight: 600 }}>Lý do hủy:</span>{' '}
                    <span style={{ fontStyle: 'italic', color: '#450a0a' }}>{booking.cancellation_reason}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Footer Action Buttons */}
        <div className="adm-bookdet-footer">
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={onClose}
          >
            Đóng Cửa Sổ
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {booking.status === 'pending' && (
              <button
                type="button"
                className="btn-admin-primary"
                onClick={() => {
                  onUpdateStatus(booking.id, 'confirmed');
                  onClose();
                }}
              >
                <TbCheck /> Duyệt Xác Nhận Đơn
              </button>
            )}

            {booking.status !== 'cancelled' && (
              <button
                type="button"
                style={{
                  padding: '0.52rem 1.1rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
                onClick={async () => {
                  const isConfirmed = await confirm({
                    title: 'Hủy Đơn Đặt Phòng Này?',
                    message: `Bạn có chắc chắn muốn hủy đơn #${booking.id} của khách ${booking.guest_name}? Tiền sẽ được hoàn trả theo chính sách hủy phòng.`,
                    confirmText: 'Xác Nhận Hủy Đơn',
                    cancelText: 'Giữ Lại',
                    type: 'danger',
                  });

                  if (isConfirmed) {
                    onUpdateStatus(booking.id, 'cancelled', 'Hủy bởi Quản trị viên');
                    toast.success('Đã hủy đơn thành công', `Đơn #${booking.id} đã được chuyển sang trạng thái HỦY.`);
                    onClose();
                  }
                }}
              >
                <TbBan /> Hủy Đơn Đặt Phòng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
