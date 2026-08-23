import React from 'react';
import { TbX, TbHeart, TbHeartFilled, TbStarFilled, TbMapPin } from 'react-icons/tb';

export const WishlistModal = ({
  isOpen,
  onClose,
  wishlistRooms = [],
  onSelectRoom,
  onRemoveFavorite,
  currency = 'VND',
}) => {
  if (!isOpen) return null;

  const formatPrice = (priceUSD, priceVND) => {
    if (currency === 'USD') return `$${priceUSD}`;
    if (currency === 'EUR') return `€${Math.round(priceUSD * 0.92)}`;
    return `${(priceVND || priceUSD * 25000).toLocaleString()} ₫`;
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal-card"
        style={{ width: '820px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TbHeartFilled style={{ fontSize: '1.4rem', color: '#ff385c' }} />
            <h2>Danh sách yêu thích ({wishlistRooms.length})</h2>
          </div>
          <button className="auth-modal-close-btn" onClick={onClose} title="Đóng">
            <TbX />
          </button>
        </div>

        <div style={{ padding: '1.5rem', maxHeight: '68vh', overflowY: 'auto' }}>
          {wishlistRooms.length === 0 ? (
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
                <TbHeart />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Danh sách yêu thích đang trống
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                Chạm vào biểu tượng trái tim trên các chỗ ở bạn yêu thích để dễ dàng theo dõi và đặt phòng bất kỳ lúc nào.
              </p>
              <button
                className="auth-primary-submit"
                style={{ width: 'auto', display: 'inline-flex', padding: '0.65rem 1.75rem', margin: '0 auto' }}
                onClick={onClose}
              >
                Khám phá chỗ ở ngay
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.25rem' }}>
              {wishlistRooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    cursor: 'pointer',
                    position: 'relative',
                    background: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1.5px solid #f1f5f9',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => { onClose(); onSelectRoom(room); }}
                >
                  <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                    <img
                      src={room.images ? room.images[0] : room.image}
                      alt={room.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        color: '#ff385c',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                      onClick={(e) => { e.stopPropagation(); onRemoveFavorite(room.id); }}
                      title="Bỏ thích"
                    >
                      <TbHeartFilled />
                    </button>
                  </div>

                  <div style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                        {room.city}, {room.country}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                        <TbStarFilled style={{ color: '#f59e0b', fontSize: '0.85rem' }} /> {room.rating}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '6px' }}>
                      {room.title}
                    </div>

                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ff385c' }}>
                      {formatPrice(room.priceUSD, room.priceVND)} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>/ đêm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistModal;
