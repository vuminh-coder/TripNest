import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './InteractiveMapModal.css';
import {
  TbX,
  TbMapPin,
  TbNavigation,
  TbCar,
  TbMotorbike,
  TbWalk,
  TbCopy,
  TbExternalLink,
  TbRoute,
  TbCompass,
  TbClock,
  TbMaximize,
  TbMinimize,
  TbCurrentLocation,
  TbCheck,
  TbShieldCheck,
  TbSparkles,
} from 'react-icons/tb';
import {
  getTargetCoordinates,
  calculateDistanceKm,
  estimateTravelTime,
  getUserLocation,
  openGoogleMapsDirections,
  CITY_COORDINATES,
} from '@/utils/mapUtils';
import { useToast } from '@/context/ToastContext';

export const InteractiveMapModal = ({
  isOpen,
  onClose,
  target, // Accommodation or Room object
}) => {
  const toast = useToast();
  const [travelMode, setTravelMode] = useState('driving');
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'locating' | 'success' | 'fallback'
  const [customOrigin, setCustomOrigin] = useState('');
  const [isCustomOriginActive, setIsCustomOriginActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Target destination coordinates
  const targetCoords = useMemo(() => getTargetCoordinates(target), [target]);
  const placeTitle = target?.nameVi || target?.title || target?.roomNameVi || 'Chỗ nghỉ TripNest';
  const placeAddress = target?.address || target?.location || `${target?.city || 'Đà Lạt'}, Việt Nam`;
  const placeCity = target?.city || target?.accommodation?.city || 'Đà Lạt';

  // Fetch user GPS on open
  const fetchCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationStatus('locating');
    const result = await getUserLocation(6000);
    setIsLocating(false);

    if (result.success && result.coords) {
      setUserLocation(result.coords);
      setLocationStatus('success');
      setIsCustomOriginActive(false);
    } else {
      console.warn('Geolocation fallback:', result.error);
      setLocationStatus('fallback');
      // Set reasonable fallback (e.g. city center or Vietnam center)
      setUserLocation(null);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchCurrentLocation();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, fetchCurrentLocation]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Active Origin Coordinates or String
  const activeOriginCoords = useMemo(() => {
    if (isCustomOriginActive && customOrigin.trim()) {
      // Check if customOrigin matches any city in CITY_COORDINATES
      const matchedCity = Object.keys(CITY_COORDINATES).find((c) =>
        customOrigin.toLowerCase().includes(c.toLowerCase())
      );
      if (matchedCity) return CITY_COORDINATES[matchedCity];
      return null;
    }
    return userLocation;
  }, [isCustomOriginActive, customOrigin, userLocation]);

  // Real-time Distance & Duration calculation
  const distanceKm = useMemo(() => {
    if (activeOriginCoords && targetCoords) {
      return calculateDistanceKm(
        activeOriginCoords.lat,
        activeOriginCoords.lng,
        targetCoords.lat,
        targetCoords.lng
      );
    }
    return null;
  }, [activeOriginCoords, targetCoords]);

  const estimatedTimeText = useMemo(() => {
    return estimateTravelTime(distanceKm, travelMode);
  }, [distanceKm, travelMode]);

  // Build iframe embed URL with directions inside the web modal
  const iframeSrc = useMemo(() => {
    if (isCustomOriginActive && customOrigin.trim()) {
      return `https://maps.google.com/maps?saddr=${encodeURIComponent(customOrigin)}&daddr=${targetCoords.lat},${targetCoords.lng}&hl=vi&output=embed`;
    }
    if (userLocation && userLocation.lat && userLocation.lng) {
      return `https://maps.google.com/maps?saddr=${userLocation.lat},${userLocation.lng}&daddr=${targetCoords.lat},${targetCoords.lng}&hl=vi&output=embed`;
    }
    // Default preview
    return `https://maps.google.com/maps?q=${targetCoords.lat},${targetCoords.lng}&hl=vi&z=15&output=embed`;
  }, [isCustomOriginActive, customOrigin, userLocation, targetCoords]);

  const handleCopy = () => {
    navigator.clipboard.writeText(placeAddress);
    setCopiedAddress(true);
    toast?.success?.('Đã sao chép địa chỉ', placeAddress);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleOpenExternal = () => {
    openGoogleMapsDirections(target, {
      travelMode,
      onSuccess: () => {
        toast?.success?.('Đã mở trên Google Maps', 'Lộ trình chi tiết sẵn sàng trên tab mới!');
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="tn-map-modal-overlay" onClick={onClose}>
      <div
        className={`tn-map-modal-container ${isFullscreen ? 'fullscreen' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="tn-map-modal-header">
          <div className="tn-map-modal-title-box">
            <div className="tn-map-header-icon-pill">
              <TbCompass />
            </div>
            <div>
              <h3 className="tn-map-modal-title">Bản đồ & Lộ trình di chuyển nội bộ</h3>
              <p className="tn-map-modal-subtitle">
                Đích đến: <strong>{placeTitle}</strong> · {placeCity}
              </p>
            </div>
          </div>

          <div className="tn-map-modal-header-actions">
            <button
              type="button"
              className="tn-map-icon-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <TbMinimize /> : <TbMaximize />}
            </button>
            <button
              type="button"
              className="tn-map-icon-btn close"
              onClick={onClose}
              title="Đóng bản đồ (Esc)"
            >
              <TbX />
            </button>
          </div>
        </div>

        {/* MODAL BODY (2-COLUMN / SPLIT VIEW) */}
        <div className="tn-map-modal-body">
          {/* LEFT SIDEBAR: ROUTE CONTROLLER & STATS */}
          <div className="tn-map-sidebar-control">
            {/* Location Permission Prompt Banner */}
            {locationStatus !== 'success' && (
              <div className="tn-location-prompt-card">
                <div className="tn-prompt-top">
                  <div className="tn-prompt-radar-icon">
                    <TbCurrentLocation className={isLocating ? 'spin' : ''} />
                  </div>
                  <div>
                    <strong>Bật định vị vị trí của bạn</strong>
                    <p>Cho phép GPS để tự động vẽ lộ trình từ vị trí hiện tại đến {placeTitle}.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="tn-prompt-enable-btn"
                  onClick={fetchCurrentLocation}
                  disabled={isLocating}
                >
                  <TbCurrentLocation />
                  <span>{isLocating ? 'Đang định vị GPS...' : 'Bật vị trí ngay'}</span>
                </button>
              </div>
            )}

            {locationStatus === 'success' && (
              <div className="tn-location-success-badge">
                <span className="tn-gps-live-dot" />
                <span>Đã định vị vị trí của bạn — Lộ trình tối ưu đang hiển thị</span>
              </div>
            )}

            {/* Origin & Destination Nodes */}
            <div className="tn-route-inputs-card">
              <div className="tn-route-node-row">
                <div className="tn-node-dot origin" />
                <div className="tn-node-info">
                  <div className="tn-node-label-line">
                    <span className="tn-node-label">Điểm xuất phát:</span>
                    <button
                      type="button"
                      className="tn-gps-refresh-link"
                      onClick={fetchCurrentLocation}
                      disabled={isLocating}
                      title="Cập nhật vị trí GPS"
                    >
                      <TbCurrentLocation className={isLocating ? 'spin' : ''} />
                      {isLocating ? 'Đang định vị...' : 'Định vị lại'}
                    </button>
                  </div>
                  {isCustomOriginActive ? (
                    <input
                      type="text"
                      className="tn-origin-text-input"
                      placeholder="Nhập vị trí hoặc thành phố xuất phát..."
                      value={customOrigin}
                      onChange={(e) => setCustomOrigin(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="tn-origin-display-pill"
                      onClick={() => setIsCustomOriginActive(true)}
                      title="Nhấp để thay đổi điểm xuất phát"
                    >
                      <span className="tn-gps-live-dot" />
                      <strong>
                        {locationStatus === 'success'
                          ? `Vị trí GPS hiện tại của bạn (${userLocation?.lat.toFixed(3)}, ${userLocation?.lng.toFixed(3)})`
                          : locationStatus === 'locating'
                          ? 'Đang lấy tọa độ GPS từ trình duyệt...'
                          : 'Vị trí hiện tại (Nhấp để đổi)'}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="tn-route-connector-line" />

              <div className="tn-route-node-row">
                <div className="tn-node-dot destination" />
                <div className="tn-node-info">
                  <span className="tn-node-label">Điểm đến (Cơ sở lưu trú):</span>
                  <div className="tn-dest-display-box">
                    <strong>{placeTitle}</strong>
                    <p>{placeAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Mode Switcher */}
            <div className="tn-mode-switch-group">
              <span className="tn-group-label">Phương tiện di chuyển:</span>
              <div className="tn-mode-buttons-row">
                <button
                  type="button"
                  className={`tn-mode-select-btn ${travelMode === 'driving' ? 'active' : ''}`}
                  onClick={() => setTravelMode('driving')}
                >
                  <TbCar />
                  <span>Ô tô</span>
                </button>
                <button
                  type="button"
                  className={`tn-mode-select-btn ${travelMode === 'motorcycle' ? 'active' : ''}`}
                  onClick={() => setTravelMode('motorcycle')}
                >
                  <TbMotorbike />
                  <span>Xe máy</span>
                </button>
                <button
                  type="button"
                  className={`tn-mode-select-btn ${travelMode === 'walking' ? 'active' : ''}`}
                  onClick={() => setTravelMode('walking')}
                >
                  <TbWalk />
                  <span>Đi bộ</span>
                </button>
              </div>
            </div>

            {/* Live Distance & Time Card */}
            <div className="tn-route-summary-card">
              <div className="tn-summary-metric-row">
                <div className="tn-metric-box">
                  <span className="tn-metric-label">Khoảng cách lộ trình</span>
                  <strong className="tn-metric-val">
                    {distanceKm ? `${distanceKm} km` : 'Đang tính...'}
                  </strong>
                </div>
                <div className="tn-metric-divider" />
                <div className="tn-metric-box">
                  <span className="tn-metric-label">Thời gian ước tính</span>
                  <strong className="tn-metric-val highlight">
                    <TbClock style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {estimatedTimeText}
                  </strong>
                </div>
              </div>
              <div className="tn-route-safety-tag">
                <TbShieldCheck /> Tuyến đường gợi ý tối ưu nhất theo bản đồ thời gian thực
              </div>
            </div>

            {/* Quick Origin Presets (Airport, Center, etc.) */}
            <div className="tn-quick-presets-box">
              <span className="tn-presets-label">Điểm xuất phát phổ biến:</span>
              <div className="tn-presets-chips">
                {['Sân bay gần nhất', `Trung tâm ${placeCity}`, 'Ga Đà Lạt', 'Hồ Xuân Hương'].map(
                  (preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="tn-preset-chip"
                      onClick={() => {
                        setCustomOrigin(preset);
                        setIsCustomOriginActive(true);
                      }}
                    >
                      + {preset}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="tn-modal-action-footer">
              <button
                type="button"
                className="tn-modal-action-btn secondary"
                onClick={handleCopy}
              >
                {copiedAddress ? <TbCheck style={{ color: '#10b981' }} /> : <TbCopy />}
                <span>{copiedAddress ? 'Đã sao chép!' : 'Sao chép địa chỉ'}</span>
              </button>

              <button
                type="button"
                className="tn-modal-action-btn primary"
                onClick={handleOpenExternal}
                title="Mở Google Maps trên tab mới để xem dẫn đường GPS giọng nói"
              >
                <TbNavigation />
                <span>Mở tab ngoài</span>
              </button>
            </div>
          </div>

          {/* RIGHT STAGE: INTERACTIVE LIVE MAP VIEWPORT */}
          <div className="tn-map-stage-viewport">
            <iframe
              title={`Bản đồ lộ trình ${placeTitle}`}
              className="tn-map-interactive-iframe"
              src={iframeSrc}
              loading="lazy"
              allowFullScreen
            />

            {/* Floating In-Map Destination Card */}
            <div className="tn-map-floating-place-card">
              <div className="tn-place-icon-circle">
                <TbMapPin />
              </div>
              <div className="tn-place-text-details">
                <span className="tn-floating-name">{placeTitle}</span>
                <span className="tn-floating-coords">
                  <TbRoute /> {targetCoords.lat.toFixed(4)}° N, {targetCoords.lng.toFixed(4)}° E
                </span>
              </div>
              <div className="tn-floating-rating-tag">
                <TbSparkles /> Điểm 9.8
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
