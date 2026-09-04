import React from 'react';
import './AccommodationDetailModal.css';
import {
  TbX,
  TbBuildingCastle,
  TbMapPin,
  TbStar,
  TbUser,
  TbBan,
  TbLockOpen,
  TbExternalLink,
  TbInfoCircle,
} from 'react-icons/tb';

export const AccommodationDetailModal = ({
  accommodation,
  onClose,
  onUpdateStatus,
}) => {
  if (!accommodation) return null;

  const formatVND = (val) => `${(val || 0).toLocaleString('vi-VN')} ₫`;
  const formatUSD = (val) => `$${(val || 0).toLocaleString('en-US')}`;

  const hostName =
    accommodation.host_name ||
    accommodation.host?.displayName ||
    accommodation.host?.user?.full_name ||
    accommodation.host?.name ||
    'Chủ nhà TripNest';

  const hostAvatar =
    accommodation.host_avatar ||
    accommodation.host?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const isSuspended = accommodation.status === 'suspended';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return { label: 'ĐANG HOẠT ĐỘNG', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      case 'suspended':
        return { label: 'ĐÃ ĐÌNH CHỈ', bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
      case 'paused':
        return { label: 'TẠM ẨN', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
      case 'maintenance':
        return { label: 'BẢO TRÌ', bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
      default:
        return { label: (status || 'UNKNOWN').toUpperCase(), bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  const statusBadge = getStatusBadge(accommodation.status);

  return (
    <div className="modal-overlay adm-accdet-overlay" onClick={onClose}>
      <div
        className="modal-container adm-accdet-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="adm-accdet-header">
          <div className="adm-accdet-header-left">
            <div className="adm-accdet-icon-wrap">
              <TbBuildingCastle />
            </div>
            <div>
              <div className="adm-accdet-title-row">
                <h2 className="adm-accdet-title">
                  Chi Tiết Cơ Sở #{accommodation.id}
                </h2>
                <span
                  className="adm-accdet-status-tag"
                  style={{
                    background: statusBadge.bg,
                    color: statusBadge.text,
                    border: `1px solid ${statusBadge.border}`,
                  }}
                >
                  {statusBadge.label}
                </span>
                {accommodation.is_featured && (
                  <span className="adm-accdet-tag-featured">
                    ⭐ NỔI BẬT
                  </span>
                )}
                {accommodation.is_guest_favorite && (
                  <span className="adm-accdet-tag-favorite">
                    🔥 YÊU THÍCH
                  </span>
                )}
              </div>
              <p className="adm-accdet-sub-text">
                Kiểm duyệt thông tin đăng tải, chủ nhà và điều phối trạng thái kinh doanh
              </p>
            </div>
          </div>

          <button className="btn-action-icon" onClick={onClose} title="Đóng">
            <TbX style={{ fontSize: '1.1rem' }} />
          </button>
        </div>

        {/* Body Content */}
        <div className="adm-accdet-body">
          {/* Accommodation Banner */}
          <div className="adm-accdet-banner">
            <img
              src={accommodation.thumbnail || accommodation.image || accommodation.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80'}
              alt={accommodation.name_vi}
              className="adm-accdet-banner-img"
            />
            <div className="adm-accdet-banner-overlay">
              <div className="adm-accdet-banner-type">
                {accommodation.type?.toUpperCase()} • {accommodation.category_name || accommodation.category}
              </div>
              <h3 className="adm-accdet-banner-name">
                {accommodation.name_vi}
              </h3>
              {accommodation.name_en && (
                <div className="adm-accdet-banner-name-en">
                  {accommodation.name_en}
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="adm-accdet-metrics-bar">
            <div className="adm-accdet-metric-card">
              <div className="adm-accdet-metric-label">
                Giá / Đêm
              </div>
              <div className="adm-accdet-metric-val">
                {formatVND(accommodation.priceVND || accommodation.price_from || accommodation.price_per_night)}
              </div>
              <div className="adm-accdet-metric-sub">
                {formatUSD(accommodation.priceUSD || Math.round((accommodation.priceVND || accommodation.price_from || 2500000) / 25400))}
              </div>
            </div>

            <div className="adm-accdet-metric-card">
              <div className="adm-accdet-metric-label">
                Đánh Giá
              </div>
              <div className="adm-accdet-metric-val star">
                <TbStar /> {accommodation.rating || 4.95}
              </div>
              <div className="adm-accdet-metric-sub">
                ({accommodation.reviewsCount || accommodation.reviews_count || 0} nhận xét)
              </div>
            </div>

            <div className="adm-accdet-metric-card">
              <div className="adm-accdet-metric-label">
                Vị Trí
              </div>
              <div className="adm-accdet-metric-val location">
                <TbMapPin style={{ color: '#ff385c' }} /> {accommodation.city}
              </div>
              <div className="adm-accdet-metric-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {accommodation.address || 'Trung tâm'}
              </div>
            </div>

            <div className="adm-accdet-metric-card">
              <div className="adm-accdet-metric-label">
                Quy Mô
              </div>
              <div className="adm-accdet-metric-val">
                {accommodation.specs?.guests || 4} Khách
              </div>
              <div className="adm-accdet-metric-sub">
                {accommodation.specs?.bedrooms || 2} PN · {accommodation.specs?.bathrooms || 2} WC
              </div>
            </div>
          </div>

          {/* Details 2-Column Grid */}
          <div className="adm-accdet-2col-grid">
            {/* Host Information Card */}
            <div className="adm-accdet-card">
              <div className="adm-accdet-card-head">
                <TbUser style={{ color: '#ff385c', fontSize: '1.1rem' }} />
                <span>Thông Tin Chủ Nhà (Host)</span>
              </div>

              <div className="adm-accdet-host-row">
                <img
                  src={hostAvatar}
                  alt={hostName}
                  className="adm-accdet-host-avatar"
                />
                <div>
                  <div className="adm-accdet-host-name">
                    {hostName}
                  </div>
                  <div className="adm-accdet-host-verified">
                    ✓ Đối tác chủ nhà đã xác minh KYC
                  </div>
                </div>
              </div>

              <div className="adm-accdet-host-info-list">
                <div className="adm-accdet-info-row">
                  <span style={{ color: '#64748b' }}>Địa chỉ cơ sở:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right', maxWidth: '65%' }}>
                    {accommodation.address || 'Đang cập nhật'}
                  </span>
                </div>
                <div className="adm-accdet-info-row">
                  <span style={{ color: '#64748b' }}>Tỉnh / Thành phố:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{accommodation.city}</span>
                </div>
                <div className="adm-accdet-info-row">
                  <span style={{ color: '#64748b' }}>Ngày đăng ký:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{accommodation.created_at || '15/03/2026'}</span>
                </div>
              </div>
            </div>

            {/* Amenities & Space */}
            <div className="adm-accdet-card">
              <div className="adm-accdet-card-head">
                <TbInfoCircle style={{ color: '#6366f1', fontSize: '1.1rem' }} />
                <span>Tiện Ích & Không Gian</span>
              </div>

              <div className="adm-accdet-amenities-tags">
                {(accommodation.amenities && accommodation.amenities.length > 0
                  ? accommodation.amenities
                  : ['Wifi tốc độ cao', 'Hồ bơi nước ấm', 'Bếp nướng BBQ', 'Điều hòa 2 chiều', 'Smart TV']
                ).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="adm-accdet-amenity-tag"
                  >
                    ✓ {amenity}
                  </span>
                ))}
              </div>

              <div className="adm-accdet-specs-note">
                <strong>Cấu trúc chỗ nghỉ:</strong> {accommodation.specs?.guests || 4} khách · {accommodation.specs?.bedrooms || 2} phòng ngủ · {accommodation.specs?.beds || 2} giường · {accommodation.specs?.bathrooms || 2} phòng tắm.
              </div>
            </div>
          </div>

          {/* Warning Banner if Suspended */}
          {isSuspended && (
            <div className="adm-accdet-warning-banner">
              <TbBan style={{ fontSize: '1.35rem', flexShrink: 0 }} />
              <div>
                <strong>Cơ sở lưu trú đang bị ĐÌNH CHỈ:</strong> Cơ sở này đã tạm dừng mở bán trên toàn hệ thống TripNest và không thể nhận bất kỳ lượt đặt phòng mới nào cho tới khi được Quản trị viên khôi phục.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="adm-accdet-footer">
          <button
            type="button"
            className="adm-accdet-btn-close"
            onClick={onClose}
          >
            Đóng
          </button>

          <div className="adm-accdet-footer-actions">
            <button
              type="button"
              className="adm-accdet-btn-view-live"
              onClick={() => {
                window.open(`/accommodation/${accommodation.id}`, '_blank');
              }}
            >
              <TbExternalLink /> Xem Trang Công Khai
            </button>

            {isSuspended ? (
              <button
                type="button"
                className="adm-accdet-btn-restore"
                onClick={() => {
                  onUpdateStatus(accommodation.id, 'published');
                  onClose();
                }}
              >
                <TbLockOpen /> Khôi Phục Hoạt Động
              </button>
            ) : (
              <button
                type="button"
                className="adm-accdet-btn-suspend"
                onClick={() => {
                  onUpdateStatus(accommodation.id, 'suspended');
                  onClose();
                }}
              >
                <TbBan /> Đình Chỉ Cơ Sở
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationDetailModal;
