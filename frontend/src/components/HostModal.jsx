import React, { useState } from 'react';
import { TbX, TbHomePlus, TbShieldCheck, TbCoins, TbHeadset } from 'react-icons/tb';

export const HostModal = ({ isOpen, onClose, currency = 'VND' }) => {
  const [nights, setNights] = useState(7);
  const [location, setLocation] = useState('Đà Lạt');

  if (!isOpen) return null;

  const basePricePerNight = location === 'Hà Nội' ? 1200000 : location === 'Phú Quốc' ? 2500000 : 1800000;
  const estimatedTotal = nights * basePricePerNight;

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round(val / 25000).toLocaleString()}`;
    if (currency === 'EUR') return `€${Math.round((val / 25000) * 0.92).toLocaleString()}`;
    return `${val.toLocaleString()} ₫`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ width: '740px', maxWidth: '95vw', padding: '2.5rem 2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #ebebeb' }}>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <TbX />
          </button>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Ước tính thu nhập cho thuê phòng</h2>
          <div style={{ width: '36px' }} />
        </div>

        <div style={{ padding: '2rem 0', textAlign: 'center' }}>
          <span style={{ fontSize: '0.95rem', color: '#ff385c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            TripNest your home
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0.5rem 0', color: '#222' }}>
            {formatPrice(estimatedTotal)}
          </h1>
          <p style={{ color: '#717171', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Ước tính cho <strong>{nights} đêm</strong> tại <strong>{location}</strong> với giá trung bình {formatPrice(basePricePerNight)}/đêm.
          </p>

          {/* Sliders */}
          <div style={{ maxWidth: '480px', margin: '0 auto 2.5rem auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
              <span>Số đêm cho thuê:</span>
              <span style={{ color: '#ff385c', fontWeight: 700 }}>{nights} đêm / tháng</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={nights}
              onChange={(e) => setNights(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#ff385c', height: '6px' }}
            />

            <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem', justifyContent: 'center' }}>
              {['Đà Lạt', 'Phú Quốc', 'Hạ Long', 'Hà Nội', 'Hội An'].map((loc) => (
                <button
                  key={loc}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '999px',
                    border: location === loc ? '1px solid #222' : '1px solid #ebebeb',
                    background: location === loc ? '#222' : 'white',
                    color: location === loc ? 'white' : '#222',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                  onClick={() => setLocation(loc)}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Benefits Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'left', borderTop: '1px solid #ebebeb', paddingTop: '2rem' }}>
            <div>
              <TbShieldCheck style={{ fontSize: '2rem', color: '#ff385c', marginBottom: '8px' }} />
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>Bảo hiểm TripCover</h4>
              <p style={{ color: '#717171', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Bảo hiểm thiệt hại tài sản và trách nhiệm dân sự lên đến 3.000.000 USD.
              </p>
            </div>
            <div>
              <TbCoins style={{ fontSize: '2rem', color: '#ff385c', marginBottom: '8px' }} />
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>Thanh toán linh hoạt</h4>
              <p style={{ color: '#717171', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Nhận tiền về tài khoản ngân hàng nhanh chóng sau 24h kể từ khi khách nhận phòng.
              </p>
            </div>
            <div>
              <TbHeadset style={{ fontSize: '2rem', color: '#ff385c', marginBottom: '8px' }} />
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>Hỗ trợ chuyên gia 24/7</h4>
              <p style={{ color: '#717171', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Đội ngũ cố vấn và chuyên gia hướng dẫn thiết lập danh sách phòng từ A-Z.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <button
              className="primary-gradient-btn"
              style={{ width: 'auto', padding: '0.85rem 2.5rem' }}
              onClick={() => {
                alert('Cảm ơn bạn! Đội ngũ cố vấn TripNest sẽ liên hệ hỗ trợ bạn đăng ký phòng.');
                onClose();
              }}
            >
              Bắt đầu cho thuê phòng ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HostModal;
