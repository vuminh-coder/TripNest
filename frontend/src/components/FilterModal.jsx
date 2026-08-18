import React, { useState } from 'react';
import { TbX, TbHomeCheck, TbBuildingCastle, TbHome2 } from 'react-icons/tb';

export const FilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters = {},
  currency = 'VND',
}) => {
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
  const [placeType, setPlaceType] = useState(initialFilters.placeType || 'all');
  const [bedrooms, setBedrooms] = useState(initialFilters.bedrooms || 'any');
  const [beds, setBeds] = useState(initialFilters.beds || 'any');
  const [bathrooms, setBathrooms] = useState(initialFilters.bathrooms || 'any');
  const [selectedAmenities, setSelectedAmenities] = useState(initialFilters.amenities || []);

  if (!isOpen) return null;

  const amenityOptions = [
    'Wifi',
    'Bếp',
    'Bể bơi',
    'Chỗ đỗ xe',
    'Điều hòa',
    'Máy giặt',
    'thú cưng',
    'làm việc',
    'BBQ',
    'Lò sưởi',
  ];

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleClearAll = () => {
    setMinPrice('');
    setMaxPrice('');
    setPlaceType('all');
    setBedrooms('any');
    setBeds('any');
    setBathrooms('any');
    setSelectedAmenities([]);
  };

  const handleApply = () => {
    onApplyFilters({
      minPrice,
      maxPrice,
      placeType,
      bedrooms,
      beds,
      bathrooms,
      amenities: selectedAmenities,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ width: '640px', maxWidth: '95vw', padding: '1.75rem 2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #ebebeb' }}>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <TbX />
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Bộ lọc nâng cao</h2>
          <div style={{ width: '36px' }} />
        </div>

        <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Price Range */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Khoảng giá (USD)</h3>
            <p style={{ color: '#717171', fontSize: '0.85rem', marginBottom: '1rem' }}>Giá theo đêm chưa bao gồm phí và thuế</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', padding: '0.5rem 0.8rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#717171', textTransform: 'uppercase' }}>Tối thiểu</span>
                <input
                  type="number"
                  placeholder="$0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{ border: 'none', width: '100%', fontSize: '0.95rem', fontWeight: 600 }}
                />
              </div>
              <span style={{ color: '#717171' }}>-</span>
              <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', padding: '0.5rem 0.8rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#717171', textTransform: 'uppercase' }}>Tối đa</span>
                <input
                  type="number"
                  placeholder="$1000+"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ border: 'none', width: '100%', fontSize: '0.95rem', fontWeight: 600 }}
                />
              </div>
            </div>
          </div>

          {/* Place Type */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Loại chỗ ở</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { id: 'all', label: 'Bất kỳ' },
                { id: 'entire', label: 'Toàn bộ nhà' },
                { id: 'room', label: 'Phòng riêng' },
              ].map((t) => (
                <button
                  key={t.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: placeType === t.id ? '2px solid #222' : '1px solid #ebebeb',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    background: placeType === t.id ? '#f7f7f7' : 'white',
                  }}
                  onClick={() => setPlaceType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms & Beds */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Phòng ngủ và giường</h3>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.88rem', color: '#484848' }}>Phòng ngủ</span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                {['any', '1', '2', '3', '4+'].map((num) => (
                  <button
                    key={num}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '999px',
                      border: bedrooms === num ? '1px solid #222' : '1px solid #ebebeb',
                      background: bedrooms === num ? '#222' : 'white',
                      color: bedrooms === num ? 'white' : '#222',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                    onClick={() => setBedrooms(num)}
                  >
                    {num === 'any' ? 'Bất kỳ' : num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Tiện nghi</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {amenityOptions.map((a) => (
                <label
                  key={a}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(a)}
                    onChange={() => toggleAmenity(a)}
                    style={{ width: '18px', height: '18px', accentColor: '#ff385c' }}
                  />
                  <span>{a}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.25rem', borderTop: '1px solid #ebebeb' }}>
          <button
            style={{ fontWeight: 600, textDecoration: 'underline', fontSize: '0.92rem' }}
            onClick={handleClearAll}
          >
            Xóa tất cả
          </button>
          <button
            className="primary-gradient-btn"
            style={{ width: 'auto', padding: '0.75rem 1.75rem' }}
            onClick={handleApply}
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
};
export default FilterModal;
