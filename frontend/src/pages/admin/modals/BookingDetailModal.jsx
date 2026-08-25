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
} from 'react-icons/tb';

export const BookingDetailModal = ({ booking, onClose, onUpdateStatus }) => {
  if (!booking) return null;

  const formatVND = (val) => `${(val || 0).toLocaleString()} ₫`;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-container"
        style={{ width: '740px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <TbReceipt />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Hóa Đơn Đặt Phòng #{booking.id}
                </h2>
                <span className={`status-pill ${booking.status}`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
                Ngày tạo đơn: {booking.created_at}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <TbX />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem 0' }}>
          {/* Guest & Room Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <TbUser />
                <span>THÔNG TIN KHÁCH HÀNG</span>
              </div>
              <p style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{booking.guest_name}</p>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '2px' }}>{booking.guest_email}</p>
              <p style={{ fontSize: '0.86rem', color: '#64748b' }}>{booking.guest_phone}</p>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <TbHome />
                <span>CHỖ Ở & CHỦ NHÀ</span>
              </div>
              <p style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>{booking.room_name}</p>
              <p style={{ fontSize: '0.86rem', color: '#0284c7', marginTop: '2px' }}>Chủ nhà: {booking.host_name}</p>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ background: '#f1f5f9', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TbCalendarEvent style={{ fontSize: '1.4rem', color: '#0f172a' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Lịch trình lưu trú</span>
                <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                  {booking.check_in} ➔ {booking.check_out} ({booking.nights} đêm)
                </p>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Số lượng</span>
              <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                {booking.guests_count} khách
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Thanh toán</span>
              <p style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.95rem' }}>
                {booking.payment_method} ({booking.payment_status.toUpperCase()})
              </p>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Bảng Kê Chi Tiết Tài Chính
          </h3>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
              <span>Giá gốc ({booking.nights} đêm)</span>
              <strong>{formatVND(booking.base_price)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
              <span>Phí dọn dẹp vệ sinh</span>
              <strong>{formatVND(booking.cleaning_fee)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
              <span>Phí dịch vụ nền tảng TripNest (5%)</span>
              <strong>{formatVND(booking.service_fee)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#f8fafc', fontSize: '1.1rem', fontWeight: 800, color: '#ff385c' }}>
              <span>Tổng thanh toán của khách</span>
              <span>{formatVND(booking.total_price)}</span>
            </div>
          </div>

          {/* Special Requests */}
          {booking.special_requests && (
            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px', padding: '1rem', color: '#92400e', fontSize: '0.88rem' }}>
              <strong>Yêu cầu đặc biệt của khách:</strong> {booking.special_requests}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
          <button
            style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#64748b' }}
            onClick={onClose}
          >
            Đóng
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {booking.status !== 'cancelled' && (
              <button
                style={{ padding: '0.65rem 1.1rem', borderRadius: '10px', border: '1.5px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => {
                  if (window.confirm(`Hủy đơn đặt phòng ${booking.id} và hoàn tiền cho khách?`)) {
                    onUpdateStatus(booking.id, 'cancelled', 'Admin can thiệp hủy theo yêu cầu');
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
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
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
