import React from 'react';
import { TbX, TbHeart, TbHeartFilled, TbStarFilled } from 'react-icons/tb';

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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ width: '780px', maxWidth: '95vw', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #ebebeb' }}>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <TbX />
          </button>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Danh sách yêu thích ({wishlistRooms.length})</h2>
          <div style={{ width: '36px' }} />
        </div>

        <div style={{ padding: '1.5rem 0', maxHeight: '65vh', overflowY: 'auto' }}>
          {wishlistRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <TbHeart style={{ fontSize: '3.5rem', color: '#ff385c', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Danh sách yêu thích đang trống</h3>
              <p style={{ color: '#717171', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto 1.5rem auto' }}>
                Nhấn vào biểu tượng trái tim trên bất kỳ chỗ ở nào để lưu lại các địa điểm bạn yêu thích.
              </p>
              <button className="primary-gradient-btn" style={{ width: 'auto', padding: '0.65rem 1.5rem' }} onClick={onClose}>
                Khám phá ngay
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {wishlistRooms.map((room) => (
                <div
                  key={room.id}
                  style={{ cursor: 'pointer', position: 'relative' }}
                  onClick={() => { onClose(); onSelectRoom(room); }}
                >
                  <img
                    src={room.images ? room.images[0] : room.image}
                    alt={room.title}
                    style={{ width: '100%', height: '180px', borderRadius: '12px', objectFit: 'cover', marginBottom: '8px' }}
                  />

                  <button
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      color: '#ff385c',
                      fontSize: '1.4rem',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    }}
                    onClick={(e) => { e.stopPropagation(); onRemoveFavorite(room.id); }}
                    title="Bỏ thích"
                  >
                    <TbHeartFilled />
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem' }}>
                    <span>{room.city}, {room.country}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <TbStarFilled style={{ fontSize: '0.8rem' }} /> {room.rating}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: '2px' }}>
                    {formatPrice(room.priceUSD, room.priceVND)} / đêm
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
