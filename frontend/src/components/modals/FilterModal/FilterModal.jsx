import './FilterModal.css';
import React, { useState } from 'react';
import {
  TbX,
  TbHomeCheck,
  TbBuildingCastle,
  TbHome2,
  TbWifi,
  TbToolsKitchen2,
  TbSwimming,
  TbCar,
  TbAirConditioning,
  TbWashMachine,
  TbPaw,
  TbDeviceLaptop,
  TbFlame,
  TbBath,
  TbDeviceTv,
  TbCheck,
  TbFilter,
} from 'react-icons/tb';

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
  const [bathrooms, setBathrooms] = useState(initialFilters.bathrooms || 'any');
  const [selectedAmenities, setSelectedAmenities] = useState(initialFilters.amenities || []);

  if (!isOpen) return null;

  const currencySign = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₫';

  // Currency-aware price presets
  const pricePresets =
    currency === 'VND'
      ? [
          { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
          { label: '1 - 3 triệu', min: 1000000, max: 3000000 },
          { label: '3 - 5 triệu', min: 3000000, max: 5000000 },
          { label: 'Trên 5 triệu', min: 5000000, max: '' },
        ]
      : [
          { label: '< $50', min: 0, max: 50 },
          { label: '$50 - $150', min: 50, max: 150 },
          { label: '$150 - $300', min: 150, max: 300 },
          { label: '> $300', min: 300, max: '' },
        ];

  const amenityOptions = [
    { key: 'Wifi', label: 'Wifi tốc độ cao', icon: <TbWifi /> },
    { key: 'Bếp', label: 'Bếp nấu ăn đầy đủ', icon: <TbToolsKitchen2 /> },
    { key: 'Bể bơi', label: 'Hồ bơi riêng', icon: <TbSwimming /> },
    { key: 'Chỗ đỗ xe', label: 'Chỗ đỗ xe miễn phí', icon: <TbCar /> },
    { key: 'Điều hòa', label: 'Điều hòa nhiệt độ', icon: <TbAirConditioning /> },
    { key: 'Máy giặt', label: 'Máy giặt & sấy', icon: <TbWashMachine /> },
    { key: 'thú cưng', label: 'Cho phép thú cưng', icon: <TbPaw /> },
    { key: 'làm việc', label: 'Không gian làm việc', icon: <TbDeviceLaptop /> },
    { key: 'BBQ', label: 'Bếp nướng BBQ', icon: <TbFlame /> },
    { key: 'Lò sưởi', label: 'Lò sưởi ấm cúng', icon: <TbFlame /> },
    { key: 'Bồn tắm', label: 'Bồn tắm nằm sang trọng', icon: <TbBath /> },
    { key: 'Tivi', label: 'Tivi truyền hình cáp', icon: <TbDeviceTv /> },
  ];

  const toggleAmenity = (amenityKey) => {
    if (selectedAmenities.includes(amenityKey)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenityKey));
    } else {
      setSelectedAmenities([...selectedAmenities, amenityKey]);
    }
  };

  const handleClearAll = () => {
    setMinPrice('');
    setMaxPrice('');
    setPlaceType('all');
    setBedrooms('any');
    setBathrooms('any');
    setSelectedAmenities([]);
  };

  const handleApply = () => {
    onApplyFilters({
      minPrice,
      maxPrice,
      placeType,
      bedrooms,
      bathrooms,
      amenities: selectedAmenities,
    });
    onClose();
  };

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Sticky Header */}
        <div className="filter-modal-header">
          <button className="filter-modal-close-btn" onClick={onClose} title="Đóng bộ lọc">
            <TbX />
          </button>
          <h2 className="filter-modal-title">Bộ lọc nâng cao</h2>
          <div style={{ width: '36px' }} />
        </div>

        {/* Scrollable Body */}
        <div className="filter-modal-body">
          {/* Section 1: Khoảng giá */}
          <div className="filter-section">
            <h3 className="filter-section-title">Khoảng giá ({currency})</h3>
            <p className="filter-section-desc">Giá tính theo đêm chưa bao gồm thuế và phí dịch vụ</p>

            <div className="filter-price-boxes-row">
              <div className="filter-price-box">
                <span className="filter-price-label">Giá tối thiểu</span>
                <div className="filter-price-input-wrapper">
                  <span className="filter-price-currency-sign">{currencySign}</span>
                  <input
                    type="number"
                    placeholder="0"
                    className="filter-price-input"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
              </div>

              <span style={{ color: '#94a3b8', fontWeight: 800 }}>—</span>

              <div className="filter-price-box">
                <span className="filter-price-label">Giá tối đa</span>
                <div className="filter-price-input-wrapper">
                  <span className="filter-price-currency-sign">{currencySign}</span>
                  <input
                    type="number"
                    placeholder={currency === 'VND' ? '10000000+' : '500+'}
                    className="filter-price-input"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="filter-price-presets-row">
              {pricePresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`filter-preset-chip ${minPrice == p.min && maxPrice == p.max ? 'is-active' : ''}`}
                  onClick={() => {
                    setMinPrice(p.min);
                    setMaxPrice(p.max);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Loại chỗ ở */}
          <div className="filter-section">
            <h3 className="filter-section-title">Loại chỗ ở</h3>
            <p className="filter-section-desc">Tìm kiếm phòng riêng hoặc toàn bộ không gian nghỉ dưỡng</p>

            <div className="filter-place-types-grid">
              {[
                { id: 'all', label: 'Tất cả', icon: <TbBuildingCastle /> },
                { id: 'entire', label: 'Toàn bộ nhà', icon: <TbHome2 /> },
                { id: 'room', label: 'Phòng riêng', icon: <TbHomeCheck /> },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`filter-place-card-btn ${placeType === t.id ? 'is-active' : ''}`}
                  onClick={() => setPlaceType(t.id)}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Phòng ngủ và phòng tắm */}
          <div className="filter-section">
            <h3 className="filter-section-title">Phòng ngủ và phòng tắm</h3>
            <p className="filter-section-desc">Lựa chọn số lượng phòng phù hợp với đoàn khách của bạn</p>

            {/* Bedrooms */}
            <div className="filter-sub-group">
              <span className="filter-sub-title">Số phòng ngủ</span>
              <div className="filter-pills-row">
                {['any', '1', '2', '3', '4', '5+'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`filter-pill-btn ${bedrooms === num ? 'is-active' : ''}`}
                    onClick={() => setBedrooms(num)}
                  >
                    {num === 'any' ? 'Bất kỳ' : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Bathrooms */}
            <div className="filter-sub-group">
              <span className="filter-sub-title">Số phòng tắm</span>
              <div className="filter-pills-row">
                {['any', '1', '2', '3', '4+'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`filter-pill-btn ${bathrooms === num ? 'is-active' : ''}`}
                    onClick={() => setBathrooms(num)}
                  >
                    {num === 'any' ? 'Bất kỳ' : num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Tiện nghi cao cấp */}
          <div className="filter-section">
            <h3 className="filter-section-title">Tiện nghi chỗ ở</h3>
            <p className="filter-section-desc">Chọn các dịch vụ và tiện ích mong muốn trong kỳ nghỉ</p>

            <div className="filter-amenities-grid">
              {amenityOptions.map((a) => {
                const isSelected = selectedAmenities.includes(a.key);
                return (
                  <div
                    key={a.key}
                    className={`amenity-toggle-card ${isSelected ? 'is-active' : ''}`}
                    onClick={() => toggleAmenity(a.key)}
                  >
                    <div className="amenity-card-left">
                      <div className="amenity-card-icon">{a.icon}</div>
                      <span className="amenity-card-label">{a.label}</span>
                    </div>
                    <div className="amenity-card-checkbox">
                      {isSelected && <TbCheck style={{ fontSize: '0.85rem' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="filter-modal-footer">
          <button type="button" className="filter-clear-all-link" onClick={handleClearAll}>
            Xóa tất cả bộ lọc
          </button>
          <button type="button" className="filter-apply-btn" onClick={handleApply}>
            <TbFilter />
            <span>Áp dụng bộ lọc</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default FilterModal;
