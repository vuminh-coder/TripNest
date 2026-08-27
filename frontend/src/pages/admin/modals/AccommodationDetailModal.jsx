import React from 'react';
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
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-container"
        style={{
          width: '780px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          borderRadius: 'var(--adm-radius-xl)',
          background: '#ffffff',
          boxShadow: 'var(--adm-shadow-modal)',
          border: '1px solid var(--adm-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.15rem 1.5rem',
            borderBottom: '1px solid var(--adm-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fbfcfd',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--adm-radius-md)',
                background: 'var(--adm-primary-soft)',
                color: 'var(--adm-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                border: '1px solid var(--adm-primary-border)',
                flexShrink: 0,
              }}
            >
              <TbBuildingCastle />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: 'var(--adm-text-main)',
                    fontFamily: 'var(--adm-font-display)',
                    letterSpacing: '-0.3px',
                  }}
                >
                  Chi Tiết Cơ Sở #{accommodation.id}
                </h2>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: statusBadge.bg,
                    color: statusBadge.text,
                    border: `1px solid ${statusBadge.border}`,
                    letterSpacing: '0.3px',
                  }}
                >
                  {statusBadge.label}
                </span>
                {accommodation.is_featured && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: '#fffbeb',
                      color: '#d97706',
                      border: '1px solid #fde68a',
                    }}
                  >
                    ⭐ NỔI BẬT
                  </span>
                )}
                {accommodation.is_guest_favorite && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: '#fff1f2',
                      color: '#e11d48',
                      border: '1px solid #fecdd3',
                    }}
                  >
                    🔥 YÊU THÍCH
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                Kiểm duyệt thông tin đăng tải, chủ nhà và điều phối trạng thái kinh doanh
              </p>
            </div>
          </div>

          <button className="btn-action-icon" onClick={onClose} title="Đóng">
            <TbX style={{ fontSize: '1.1rem' }} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Accommodation Banner */}
          <div
            style={{
              position: 'relative',
              borderRadius: '14px',
              overflow: 'hidden',
              height: '200px',
              marginBottom: '1.25rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            }}
          >
            <img
              src={accommodation.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80'}
              alt={accommodation.name_vi}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '1.25rem 1.5rem',
                color: '#ffffff',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, textTransform: 'uppercase' }}>
                {accommodation.type?.toUpperCase()} • {accommodation.category_name || accommodation.category}
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '2px 0 6px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {accommodation.name_vi}
              </h3>
              {accommodation.name_en && (
                <div style={{ fontSize: '0.86rem', color: '#e2e8f0', fontStyle: 'italic' }}>
                  {accommodation.name_en}
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.75rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Giá / Đêm
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {formatVND(accommodation.priceVND || accommodation.price_per_night)}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {formatUSD(accommodation.priceUSD || Math.round((accommodation.priceVND || 2500000) / 25400))}
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.75rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Đánh Giá
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                <TbStar /> {accommodation.rating || 4.95}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                ({accommodation.reviewsCount || 0} nhận xét)
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.75rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Vị Trí
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                <TbMapPin style={{ color: '#ff385c' }} /> {accommodation.city}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {accommodation.address || 'Trung tâm'}
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.75rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Quy Mô
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {accommodation.specs?.guests || 4} Khách
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {accommodation.specs?.bedrooms || 2} PN · {accommodation.specs?.bathrooms || 2} WC
              </div>
            </div>
          </div>

          {/* Details 2-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Host Information Card */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.15rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#334155',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  marginBottom: '0.85rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <TbUser style={{ color: '#ff385c', fontSize: '1.1rem' }} />
                <span>Thông Tin Chủ Nhà (Host)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.85rem' }}>
                <img
                  src={hostAvatar}
                  alt={hostName}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                    {hostName}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>
                    ✓ Đối tác chủ nhà đã xác minh KYC
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Địa chỉ cơ sở:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right', maxWidth: '65%' }}>
                    {accommodation.address || 'Đang cập nhật'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Tỉnh / Thành phố:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{accommodation.city}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Ngày đăng ký:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{accommodation.created_at || '15/03/2026'}</span>
                </div>
              </div>
            </div>

            {/* Amenities & Space */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.15rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#334155',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  marginBottom: '0.85rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <TbInfoCircle style={{ color: '#6366f1', fontSize: '1.1rem' }} />
                <span>Tiện Ích & Không Gian</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '0.75rem' }}>
                {(accommodation.amenities && accommodation.amenities.length > 0
                  ? accommodation.amenities
                  : ['Wifi tốc độ cao', 'Hồ bơi nước ấm', 'Bếp nướng BBQ', 'Điều hòa 2 chiều', 'Smart TV']
                ).map((amenity, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    ✓ {amenity}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                <strong>Cấu trúc chỗ nghỉ:</strong> {accommodation.specs?.guests || 4} khách · {accommodation.specs?.bedrooms || 2} phòng ngủ · {accommodation.specs?.beds || 2} giường · {accommodation.specs?.bathrooms || 2} phòng tắm.
              </div>
            </div>
          </div>

          {/* Warning Banner if Suspended */}
          {isSuspended && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#b91c1c',
                fontSize: '0.84rem',
              }}
            >
              <TbBan style={{ fontSize: '1.35rem', flexShrink: 0 }} />
              <div>
                <strong>Cơ sở lưu trú đang bị ĐÌNH CHỈ:</strong> Cơ sở này đã tạm dừng mở bán trên toàn hệ thống TripNest và không thể nhận bất kỳ lượt đặt phòng mới nào cho tới khi được Quản trị viên khôi phục.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--adm-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fbfcfd',
          }}
        >
          <button
            type="button"
            style={{
              padding: '0.52rem 1.15rem',
              borderRadius: 'var(--adm-radius-sm)',
              border: '1px solid var(--adm-border)',
              background: '#ffffff',
              color: '#64748b',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Đóng
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              style={{
                padding: '0.52rem 1rem',
                borderRadius: 'var(--adm-radius-sm)',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              onClick={() => {
                window.open(`/accommodation/${accommodation.id}`, '_blank');
              }}
            >
              <TbExternalLink /> Xem Trang Công Khai
            </button>

            {isSuspended ? (
              <button
                type="button"
                style={{
                  padding: '0.52rem 1rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: '1px solid #a7f3d0',
                  background: '#ecfdf5',
                  color: '#059669',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
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
                style={{
                  padding: '0.52rem 1rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
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
