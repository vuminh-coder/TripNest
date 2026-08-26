import './MyBookingsModal.css';
import React from 'react';
import { TbX, TbCalendarCheck, TbTrash, TbReceipt, TbMapPin, TbClock, TbUsers, TbPlaneDeparture } from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

export const MyBookingsModal = ({ isOpen, onClose, bookings = [], onCancelBooking, currency = 'VND' }) => {
  const toast = useToast();
  const confirm = useConfirm();

  if (!isOpen) return null;

  const formatPrice = (val, cur) => {
    if (cur === 'USD') return `$${Number(val).toLocaleString()}`;
    if (cur === 'EUR') return `€${Math.round(Number(val) * 0.92).toLocaleString()}`;
    return `${Number(val).toLocaleString()} ₫`;
  };

  const handleCancel = async (booking) => {
    const isConfirmed = await confirm({
      title: 'Hủy đơn đặt phòng?',
      html: `Bạn có chắc chắn muốn hủy đặt phòng <b>${booking.roomTitle}</b> (Mã: <code>${booking.id}</code>)?<br><span style="color: #64748b; font-size: 0.85rem;">Chính sách hủy phòng linh hoạt áp dụng theo quy định của chỗ ở.</span>`,
      type: 'danger',
      confirmText: 'Xác nhận hủy phòng',
      cancelText: 'Giữ lại lịch trình',
    });

    if (isConfirmed) {
      onCancelBooking(booking.id);
      toast.success(
        'Đã hủy đơn đặt phòng',
        `Đơn đặt chỗ #${booking.id} đã được hủy thành công.`
      );
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal-card"
        style={{ width: '740px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TbPlaneDeparture style={{ fontSize: '1.4rem', color: '#ff385c' }} />
            <h2>Chuyến đi đã đặt của bạn ({bookings.length})</h2>
          </div>
          <button className="auth-modal-close-btn" onClick={onClose} title="Đóng">
            <TbX />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', maxHeight: '68vh', overflowY: 'auto' }}>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#fff1f2',
                  color: '#ff385c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  margin: '0 auto 1.25rem',
                }}
              >
                <TbCalendarCheck />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Chưa có chuyến đi nào được đặt
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                Khi bạn hoàn tất đặt phòng trên TripNest, toàn bộ lịch trình, hướng dẫn nhận phòng và mã đặt chỗ sẽ hiển thị tại đây.
              </p>
              <button
                className="auth-primary-submit"
                style={{ width: 'auto', display: 'inline-flex', padding: '0.65rem 1.75rem', margin: '0 auto' }}
                onClick={onClose}
              >
                Khám phá các điểm đến ngay
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    border: '1.5px solid #f1f5f9',
                    borderRadius: '16px',
                    padding: '1.1rem',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'center',
                    background: '#ffffff',
                    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <img
                    src={b.roomImage || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&auto=format&fit=crop&q=80'}
                    alt={b.roomTitle}
                    style={{ width: '130px', height: '110px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#059669',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          letterSpacing: '0.5px',
                        }}
                      >
                        MÃ: #{b.id} • ĐÃ XÁC NHẬN
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TbUsers style={{ fontSize: '0.95rem' }} /> {b.guests} khách • {b.nights || 1} đêm
                      </span>
                    </div>

                    <h4
                      style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        margin: '0 0 4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {b.roomTitle}
                    </h4>

                    <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <TbMapPin style={{ color: '#ff385c' }} /> {b.roomCity || 'Việt Nam'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f8fafc', paddingTop: '6px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TbClock style={{ color: '#0ea5e9' }} /> {b.checkIn} ➔ {b.checkOut}
                      </span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ff385c' }}>
                        {formatPrice(b.totalPrice, b.currency || currency)}
                      </span>
                    </div>
                  </div>

                  <button
                    style={{
                      padding: '0.6rem',
                      color: '#ef4444',
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '1.15rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                    title="Hủy đặt phòng"
                    onClick={() => handleCancel(b)}
                  >
                    <TbTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsModal;
