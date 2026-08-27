import React, { useState } from 'react';
import './host.css';
import { TbX, TbArrowLeft, TbArrowRight, TbHome, TbBuildingCastle, TbBuildingCommunity, TbSailboat, TbTrees, TbBuilding, TbMapPin, TbUsers, TbBed, TbBath, TbSparkles, TbWifi, TbSwimming, TbToolsKitchen2, TbAirConditioning, TbCar, TbFlame, TbDeviceTv, TbPhoto, TbPlus, TbTrash, TbCheck, TbEye, TbLockCheck, TbCoin } from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/services/api';

export const HostListingWizard = ({ isOpen, onClose, onListingCreated, currency = 'VND' }) => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [accommodationType, setAccommodationType] = useState('villa');
  const [city, setCity] = useState('Đà Lạt');
  const [district, setDistrict] = useState('Phường 3');
  const [address, setAddress] = useState('12 Đường Khe Sanh, Đà Lạt');
  const [spaceType, setSpaceType] = useState('entire_place');
  
  // Counters
  const [roomTypeCode, setRoomTypeCode] = useState('entire_villa');
  const [maxGuests, setMaxGuests] = useState(4);
  const [bedrooms, setBedrooms] = useState(2);
  const [beds, setBeds] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [roomSizeM2, setRoomSizeM2] = useState(85);

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState([
    'Hồ bơi riêng',
    'WiFi tốc độ cao',
    'Bếp nấu ăn đầy đủ',
    'View thiên nhiên tuyệt đẹp',
    'Điều hòa 2 chiều',
    'Chỗ đỗ xe miễn phí',
  ]);

  // Images
  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1000&auto=format&fit=crop&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Title, Description & Pricing
  const [nameVi, setNameVi] = useState('The Pine Forest Luxury Villa Đà Lạt');
  const [description, setDescription] = useState('Biệt thự sân vườn view rừng thông thơ mộng, không gian mở ngập tràn ánh sáng tự nhiên và đầy đủ tiện nghi cao cấp.');
  const [priceVND, setPriceVND] = useState(2500000);
  const [cleaningFeeVND, setCleaningFeeVND] = useState(350000);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen) return null;

  // Types list
  const typesList = [
    { id: 'villa', name: 'Biệt thự (Villa)', icon: <TbBuildingCastle /> },
    { id: 'resort', name: 'Khu nghỉ dưỡng', icon: <TbBuildingCommunity /> },
    { id: 'homestay', name: 'Homestay ấm cúng', icon: <TbHome /> },
    { id: 'apartment', name: 'Căn hộ cao cấp', icon: <TbBuilding /> },
    { id: 'cabin', name: 'Cabin rừng thông', icon: <TbTrees /> },
    { id: 'yacht', name: 'Du thuyền vịnh', icon: <TbSailboat /> },
  ];

  // Available amenities
  const allAmenities = [
    { name: 'Hồ bơi riêng', icon: <TbSwimming /> },
    { name: 'WiFi tốc độ cao', icon: <TbWifi /> },
    { name: 'Bếp nấu ăn đầy đủ', icon: <TbToolsKitchen2 /> },
    { name: 'Điều hòa 2 chiều', icon: <TbAirConditioning /> },
    { name: 'Chỗ đỗ xe miễn phí', icon: <TbCar /> },
    { name: 'Bếp nướng BBQ', icon: <TbFlame /> },
    { name: 'Smart TV 4K', icon: <TbDeviceTv /> },
    { name: 'View thiên nhiên tuyệt đẹp', icon: <TbSparkles /> },
  ];

  const toggleAmenity = (name) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const handleAddImage = (e) => {
    if (e) e.preventDefault();
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    if (images.length <= 1) {
      toast.warning('Yêu cầu hình ảnh', 'Chỗ ở cần ít nhất 1 ảnh đại diện.');
      return;
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round(val / 25000).toLocaleString()}`;
    return `${Number(val).toLocaleString('vi-VN')} ₫`;
  };

  const handlePublishListing = async () => {
    setIsPublishing(true);
    try {
      const payload = {
        nameVi,
        accommodationType,
        spaceType,
        city,
        district,
        address,
        description,
        priceVND: Number(priceVND),
        cleaningFeeVND: Number(cleaningFeeVND),
        maxGuests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        beds: Number(beds),
        bathrooms: Number(bathrooms),
        roomSizeM2: Number(roomSizeM2),
        roomTypeCode: roomTypeCode,
        images,
        amenities: selectedAmenities,
        houseRules: 'Không hút thuốc trong phòng, giữ gìn vệ sinh chung.',
        cancellationPolicy: 'Hủy miễn phí 100% trước 48h nhận phòng.',
      };

      const result = await apiService.createHostAccommodation(payload);

      const newListing = {
        id: result?.data?.accommodationId || ('ACC-' + Date.now()),
        roomId: result?.data?.roomId,
        nameVi,
        accommodationType,
        city,
        district,
        address,
        description,
        priceVND,
        priceUSD: Math.round(priceVND / 25000),
        cleaningFeeVND,
        maxGuests,
        bedrooms,
        beds,
        bathrooms,
        roomSizeM2,
        rating: 5.0,
        reviewsCount: 0,
        status: 'published',
        thumbnail: images[0],
        images,
        amenities: selectedAmenities,
        createdAt: new Date().toLocaleDateString('vi-VN'),
      };

      toast.success('Đăng bài thành công!', result?.message || 'Chỗ nghỉ của bạn đã sẵn sàng đón khách.');
      if (onListingCreated) onListingCreated(newListing);
      onClose();
    } catch (err) {
      toast.error('Lỗi lưu', err.message || 'Không thể đăng bán chỗ ở.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="wizard-modal-overlay" onClick={onClose}>
      <div className="wizard-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="wizard-top-header">
          <div className="wizard-title-group">
            <h3>Đăng ký cho thuê chỗ ở mới</h3>
            <p>Bước {currentStep}/{totalSteps}: {
              currentStep === 1 ? 'Loại hình & Địa điểm' :
              currentStep === 2 ? 'Quy mô & Sức chứa' :
              currentStep === 3 ? 'Tiện ích nổi bật' :
              currentStep === 4 ? 'Bộ sưu tập hình ảnh' :
              currentStep === 5 ? 'Tiêu đề & Định giá' : 'Xem trước & Xuất bản'
            }</p>
          </div>
          <button type="button" className="host-action-btn" onClick={onClose} title="Đóng">
            <TbX />
          </button>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="wizard-stepper-strip">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`wizard-step-pill ${i + 1 <= currentStep ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Wizard Body Content */}
        <div className="wizard-body-content">
          {/* STEP 1: TYPE & LOCATION */}
          {currentStep === 1 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>
                Chọn loại hình chỗ ở của bạn
              </h4>
              <div className="types-selector-grid">
                {typesList.map((t) => (
                  <div
                    key={t.id}
                    className={`type-select-card ${accommodationType === t.id ? 'active' : ''}`}
                    onClick={() => setAccommodationType(t.id)}
                  >
                    <div className="type-card-icon">{t.icon}</div>
                    <div className="type-card-title">{t.name}</div>
                  </div>
                ))}
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '1.5rem 0 1rem 0', color: '#0f172a' }}>
                Địa điểm chỗ ở
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Tỉnh / Thành phố *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                  >
                    {['Đà Lạt', 'Phú Quốc', 'Đà Nẵng', 'Hạ Long', 'Hội An', 'Vũng Tàu', 'Hà Nội', 'TP. Hồ Chí Minh', 'Sa Pa', 'Nha Trang'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Quận / Huyện / Phường
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Ví dụ: Phường 3, Quận 1..."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Địa chỉ chi tiết *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ví dụ: 12 Đường Khe Sanh, Phường 10..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: CAPACITY & SCALE */}
          {currentStep === 2 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
                Quy mô & sức chứa chỗ ở
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Thiết lập số lượng khách và các tiện nghi phòng ngủ để khách dễ dàng lựa chọn.
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Hạng phòng (Tier)
                </label>
                <select
                  value={roomTypeCode}
                  onChange={(e) => setRoomTypeCode(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="entire_villa">Nguyên căn (Entire Villa/Place)</option>
                  <option value="deluxe_king">Phòng Deluxe (Deluxe Room)</option>
                  <option value="executive_suite">Suite Cao Cấp (Executive Suite)</option>
                  <option value="pool_villa">Villa Hồ Bơi Riêng (Pool Villa)</option>
                </select>
              </div>

              <div className="counter-row-item">
                <div className="counter-label-wrap">
                  <strong>Số lượng khách tối đa</strong>
                  <span>Số lượng người lớn & trẻ em có thể lưu trú</span>
                </div>
                <div className="counter-controls-box">
                  <button className="counter-btn" onClick={() => setMaxGuests(Math.max(1, maxGuests - 1))} disabled={maxGuests <= 1}>-</button>
                  <span className="counter-val-num">{maxGuests}</span>
                  <button className="counter-btn" onClick={() => setMaxGuests(maxGuests + 1)}>+</button>
                </div>
              </div>

              <div className="counter-row-item">
                <div className="counter-label-wrap">
                  <strong>Số phòng ngủ</strong>
                  <span>Phòng ngủ riêng tư cho khách</span>
                </div>
                <div className="counter-controls-box">
                  <button className="counter-btn" onClick={() => setBedrooms(Math.max(1, bedrooms - 1))} disabled={bedrooms <= 1}>-</button>
                  <span className="counter-val-num">{bedrooms}</span>
                  <button className="counter-btn" onClick={() => setBedrooms(bedrooms + 1)}>+</button>
                </div>
              </div>

              <div className="counter-row-item">
                <div className="counter-label-wrap">
                  <strong>Số giường ngủ</strong>
                  <span>Giường đơn, đôi hoặc King-size</span>
                </div>
                <div className="counter-controls-box">
                  <button className="counter-btn" onClick={() => setBeds(Math.max(1, beds - 1))} disabled={beds <= 1}>-</button>
                  <span className="counter-val-num">{beds}</span>
                  <button className="counter-btn" onClick={() => setBeds(beds + 1)}>+</button>
                </div>
              </div>

              <div className="counter-row-item">
                <div className="counter-label-wrap">
                  <strong>Số phòng tắm</strong>
                  <span>Phòng tắm riêng biệt & tiện nghi</span>
                </div>
                <div className="counter-controls-box">
                  <button className="counter-btn" onClick={() => setBathrooms(Math.max(1, bathrooms - 1))} disabled={bathrooms <= 1}>-</button>
                  <span className="counter-val-num">{bathrooms}</span>
                  <button className="counter-btn" onClick={() => setBathrooms(bathrooms + 1)}>+</button>
                </div>
              </div>

              <div className="counter-row-item" style={{ borderBottom: 'none' }}>
                <div className="counter-label-wrap">
                  <strong>Diện tích không gian (m²)</strong>
                  <span>Tổng diện tích sử dụng</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    value={roomSizeM2}
                    onChange={(e) => setRoomSizeM2(Number(e.target.value))}
                    style={{ width: '80px', padding: '0.45rem', borderRadius: '6px', border: '1.5px solid #e2e8f0', textAlign: 'center', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>m²</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AMENITIES */}
          {currentStep === 3 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
                Tiện ích nổi bật tại chỗ ở
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Những tiện nghi đặc biệt sẽ giúp chỗ ở của bạn nổi bật và thu hút nhiều lượt đặt phòng hơn.
              </p>

              <div className="amenities-selector-grid">
                {allAmenities.map((a) => {
                  const isChecked = selectedAmenities.includes(a.name);
                  return (
                    <div
                      key={a.name}
                      className={`amenity-toggle-card ${isChecked ? 'checked' : ''}`}
                      onClick={() => toggleAmenity(a.name)}
                    >
                      <span style={{ fontSize: '1.25rem', color: isChecked ? '#ff385c' : '#64748b' }}>{a.icon}</span>
                      <span>{a.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: PHOTOS */}
          {currentStep === 4 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
                Bộ sưu tập hình ảnh chỗ ở
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Hình ảnh đẹp và sắc nét là yếu tố quan trọng nhất quyết định lựa chọn của khách.
              </p>

              {/* Add Photo Input */}
              <form onSubmit={handleAddImage} style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                <input
                  type="url"
                  placeholder="Dán link ảnh chất lượng cao (URL)..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                />
                <button
                  type="submit"
                  className="host-btn-primary"
                  style={{ borderRadius: 'var(--host-radius-md)', padding: '0.65rem 1.25rem' }}
                >
                  <TbPlus /> Thêm ảnh
                </button>
              </form>

              {/* Preview Grid */}
              <div className="photos-preview-strip">
                {images.map((img, idx) => (
                  <div key={idx} className="photo-preview-item">
                    <img src={img} alt={`Chỗ ở ${idx}`} className="photo-preview-img" />
                    {idx === 0 && <span className="photo-cover-tag">Ảnh bìa</span>}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Xóa ảnh này"
                    >
                      <TbX style={{ fontSize: '0.9rem' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: TITLE, DESCRIPTION & PRICE */}
          {currentStep === 5 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>
                Tiêu đề & mô tả chỗ ở
              </h4>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Tên chỗ ở nổi bật *
                </label>
                <input
                  type="text"
                  value={nameVi}
                  onChange={(e) => setNameVi(e.target.value)}
                  placeholder="Ví dụ: The Sunset Villa Đà Lạt..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Mô tả không gian & trải nghiệm *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả vẻ đẹp, không gian và cảm giác khi nghỉ dưỡng tại đây..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '1.5rem 0 1rem 0', color: '#0f172a' }}>
                Thiết lập giá cho thuê
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Giá niêm yết mỗi đêm (VND) *
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={priceVND}
                    onChange={(e) => setPriceVND(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '1rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                    required
                  />
                  <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                    Tương đương ~{formatPrice(priceVND)}/đêm
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Phí vệ sinh chỗ ở (VND)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={cleaningFeeVND}
                    onChange={(e) => setCleaningFeeVND(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '1rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                    Phí dịch vụ dọn dẹp sau mỗi lượt khách
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: PREVIEW & PUBLISH */}
          {currentStep === 6 && (
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>
                Xem trước thẻ phòng của bạn
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Đây là cách chỗ ở của bạn sẽ hiển thị với hàng triệu khách du lịch trên TripNest.
              </p>

              {/* Live Preview Card */}
              <div className="live-preview-box">
                <img src={images[0]} alt={nameVi} className="live-preview-img" />
                <div className="live-preview-body" style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                      {city} · {accommodationType.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      ★ 5.00 <span style={{ color: '#64748b', fontWeight: 500 }}>(Mới)</span>
                    </span>
                  </div>
                  <h4 className="live-preview-title">{nameVi}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 10px 0' }}>
                    {maxGuests} khách · {bedrooms} phòng ngủ · {bathrooms} phòng tắm
                  </p>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong className="live-preview-price">{formatPrice(priceVND)}</strong>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}> / đêm</span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      Sẵn sàng đón khách
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation Actions */}
        <div className="wizard-footer-actions">
          {currentStep > 1 ? (
            <button
              type="button"
              className="host-btn-client"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <TbArrowLeft /> Quay lại
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              className="host-btn-primary"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Tiếp tục <TbArrowRight />
            </button>
          ) : (
            <button
              type="button"
              className="host-btn-primary"
              disabled={isPublishing}
              onClick={handlePublishListing}
            >
              {isPublishing ? (
                <>Đang lưu & đăng bài...</>
              ) : (
                <>
                  <TbCheck style={{ fontSize: '1.1rem' }} /> HOÀN TẤT & ĐĂNG BÁN CHỖ NGHỈ
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostListingWizard;
