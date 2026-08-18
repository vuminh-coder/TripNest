import React from 'react';
import { TbX, TbCalendarCheck, TbTrash, TbReceipt, TbMapPin } from 'react-icons/tb';

export const MyBookingsModal = ({ isOpen, onClose, bookings = [], onCancelBooking, currency = 'VND' }) => {
  if (!isOpen) return null;

  const formatPrice = (val, cur) => {
    if (cur === 'USD') return `$${val.toLocaleString()}`;
    if (cur === 'EUR') return `€${Math.round(val * 0.92).toLocaleString()}`;
    return `${val.toLocaleString()} ₫`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ width: '700px', maxWidth: '95vw', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #ebebeb' }}>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <TbX />
          </button>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Chuyến đi đã đặt của bạn ({bookings.length})</h2>
          <div style={{ width: '36px' }} />
        </div>

        <div style={{ padding: '1.5rem 0', maxHeight: '60vh', overflowY: 'auto' }}>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <TbCalendarCheck style={{ fontSize: '3.5rem', color: '#ff385c', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Chưa có chuyến đi nào được đặt</h3>
              <p style={{ color: '#717171', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
                Khi bạn hoàn tất đặt phòng trên TripNest, tất cả lịch trình và mã đặt chỗ sẽ xuất hiện tại đây.
              </p>
              <button className="primary-gradient-btn" style={{ width: 'auto', padding: '0.65rem 1.5rem' }} onClick={onClose}>
                Khám phá các điểm đến
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {bookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    border: '1px solid #ebebeb',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <img
                    src={b.roomImage}
                    alt={b.roomTitle}
                    style={{ width: '120px', height: '100px', borderRadius: '10px', objectFit: 'cover' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d8a43', background: '#e6f7ed', padding: '2px 8px', borderRadius: '4px' }}>
                        MÃ: {b.id} · ĐÃ XÁC NHẬN
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#717171' }}>
                        {b.guests} khách · {b.nights} đêm
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#222', marginBottom: '4px' }}>
                      {b.roomTitle}
                    </h4>

                    <div style={{ fontSize: '0.85rem', color: '#717171', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <TbMapPin /> {b.roomCity}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#484848' }}>
                        Lịch trình: {b.checkIn} đến {b.checkOut}
                      </span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ff385c' }}>
                        {formatPrice(b.totalPrice, b.currency)}
                      </span>
                    </div>
                  </div>

                  <button
                    style={{
                      padding: '0.5rem',
                      color: '#e00b41',
                      fontSize: '1.2rem',
                      borderRadius: '8px',
                      border: '1px solid #ffe0e6',
                    }}
                    title="Hủy đặt phòng"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này?')) {
                        onCancelBooking(b.id);
                      }
                    }}
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
