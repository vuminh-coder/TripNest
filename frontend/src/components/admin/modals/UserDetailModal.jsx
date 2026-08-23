import React from 'react';
import {
  TbX,
  TbUser,
  TbMail,
  TbPhone,
  TbId,
  TbMapPin,
  TbShieldCheck,
  TbEdit,
  TbLock,
  TbLockOpen,
  TbHome,
  TbCheck,
} from 'react-icons/tb';

export const UserDetailModal = ({
  user,
  onClose,
  onEdit,
  onToggleStatus,
  onApproveUpgrade,
}) => {
  if (!user) return null;

  const defaultAvatar =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  const roleLabel =
    user.role === 'admin'
      ? 'Quản Trị Viên (Admin)'
      : user.role === 'host'
      ? 'Chủ Nhà (Host)'
      : 'Khách Hàng (Guest)';

  const roleBadgeClass =
    user.role === 'admin' ? 'admin' : user.role === 'host' ? 'host' : 'guest';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-container"
        style={{
          width: '760px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--adm-radius-md)',
                background: 'var(--adm-primary-soft)',
                color: 'var(--adm-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                border: '1px solid var(--adm-primary-border)',
                flexShrink: 0,
              }}
            >
              <TbUser />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: 'var(--adm-text-main)',
                    fontFamily: 'var(--adm-font-display)',
                    letterSpacing: '-0.3px',
                  }}
                >
                  Hồ Sơ Chi Tiết Tài Khoản #{user.id}
                </h2>
                <span className={`role-pill ${roleBadgeClass}`}>
                  {user.role === 'admin' ? 'Quản Trị' : user.role === 'host' ? 'Chủ Nhà' : 'Khách Hàng'}
                </span>
                <span className={`status-pill ${user.status}`}>
                  {user.status === 'active' ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                Xem toàn bộ thông tin cá nhân, định danh, phân quyền và lịch sử hoạt động
              </p>
            </div>
          </div>

          <button className="btn-action-icon" onClick={onClose} title="Đóng">
            <TbX style={{ fontSize: '1.1rem' }} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* User Profile Card Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={user.avatar || defaultAvatar}
                  alt={user.name}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: user.status === 'active' ? '#10b981' : '#ef4444',
                    border: '2px solid #ffffff',
                  }}
                  title={user.status === 'active' ? 'Đang hoạt động' : 'Tài khoản bị khóa'}
                />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '3px',
                  }}
                >
                  {user.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.82rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TbMail style={{ color: '#0ea5e9' }} /> {user.email}
                  </span>
                  {user.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TbPhone style={{ color: '#10b981' }} /> {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.6rem 1rem',
                  textAlign: 'center',
                  minWidth: '100px',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Lượt đặt phòng
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  {user.total_bookings_count ?? 0}
                </div>
              </div>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.6rem 1rem',
                  textAlign: 'center',
                  minWidth: '100px',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Phân Quyền
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: user.role === 'admin' ? '#4f46e5' : user.role === 'host' ? '#059669' : '#475569',
                    marginTop: '4px',
                  }}
                >
                  {user.role === 'admin' ? 'Quản Trị' : user.role === 'host' ? 'Chủ Nhà' : 'Khách Hàng'}
                </div>
              </div>
            </div>
          </div>

          {/* Grid Information Sections */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Section 1: Thông tin cá nhân & định danh */}
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
                <TbId style={{ color: '#ff385c', fontSize: '1.1rem' }} />
                <span>Thông Tin Định Danh & Liên Hệ</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Họ và Tên:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{user.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Email:</span>
                  <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Số Điện Thoại:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{user.phone || 'Chưa cung cấp'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>CCCD / Hộ Chiếu:</span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color: user.id_card_number ? '#0284c7' : '#94a3b8',
                      background: user.id_card_number ? '#f0f9ff' : 'transparent',
                      padding: user.id_card_number ? '2px 6px' : '0',
                      borderRadius: '4px',
                    }}
                  >
                    {user.id_card_number || 'Chưa cập nhật'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>Địa Chỉ:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>
                    {user.address || 'Chưa cập nhật'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Tài khoản & Hệ thống */}
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
                <TbShieldCheck style={{ color: '#6366f1', fontSize: '1.1rem' }} />
                <span>Hệ Thống & Hoạt Động</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Mã Thành Viên (ID):</span>
                  <span style={{ fontWeight: 800, color: '#6366f1', fontFamily: 'monospace' }}>#{user.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Vai Trò Hiện Tại:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{roleLabel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Trạng Thái:</span>
                  <span className={`status-pill ${user.status}`}>
                    {user.status === 'active' ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Ngày Tham Gia:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{user.joined_date || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Đăng Nhập Cuối:</span>
                  <span style={{ fontWeight: 600, color: '#64748b' }}>{user.last_login || 'Chưa đăng nhập'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Yêu cầu nâng quyền Host (nếu có) */}
          {user.role_upgrade_request && (
            <div
              style={{
                background:
                  user.role_upgrade_request.status === 'pending'
                    ? '#fffbeb'
                    : user.role_upgrade_request.status === 'approved'
                    ? '#f0fdf4'
                    : '#fef2f2',
                border:
                  user.role_upgrade_request.status === 'pending'
                    ? '1px solid #fde68a'
                    : user.role_upgrade_request.status === 'approved'
                    ? '1px solid #bbf7d0'
                    : '1px solid #fecaca',
                borderRadius: '12px',
                padding: '1.15rem 1.25rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.65rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    color:
                      user.role_upgrade_request.status === 'pending'
                        ? '#b45309'
                        : user.role_upgrade_request.status === 'approved'
                        ? '#15803d'
                        : '#b91c1c',
                  }}
                >
                  <TbHome />
                  <span>Yêu Cầu Nâng Cấp Quyền Chủ Nhà (Host)</span>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background:
                      user.role_upgrade_request.status === 'pending'
                        ? '#fef3c7'
                        : user.role_upgrade_request.status === 'approved'
                        ? '#dcfce7'
                        : '#fee2e2',
                    color:
                      user.role_upgrade_request.status === 'pending'
                        ? '#b45309'
                        : user.role_upgrade_request.status === 'approved'
                        ? '#16a34a'
                        : '#dc2626',
                    border:
                      user.role_upgrade_request.status === 'pending'
                        ? '1px solid #fcd34d'
                        : user.role_upgrade_request.status === 'approved'
                        ? '1px solid #86efac'
                        : '1px solid #fca5a5',
                  }}
                >
                  {user.role_upgrade_request.status === 'pending'
                    ? 'CHỜ DUYỆT'
                    : user.role_upgrade_request.status === 'approved'
                    ? 'ĐÃ DUYỆT'
                    : 'TỪ CHỐI'}
                </span>
              </div>

              <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                <strong>Lý do đăng ký:</strong> "{user.role_upgrade_request.reason}"
              </div>

              {user.role_upgrade_request.property_type && (
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.4rem' }}>
                  <strong>Loại hình chỗ ở dự kiến:</strong> {user.role_upgrade_request.property_type}
                </div>
              )}

              {user.role_upgrade_request.request_date && (
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Ngày gửi yêu cầu: {user.role_upgrade_request.request_date}
                </div>
              )}

              {/* Action buttons inside detail if pending */}
              {user.role_upgrade_request.status === 'pending' && onApproveUpgrade && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '0.85rem' }}>
                  <button
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#10b981',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onClick={() => {
                      onApproveUpgrade(user.id, true);
                      onClose();
                    }}
                  >
                    <TbCheck /> Phê Duyệt Làm Host
                  </button>
                  <button
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '6px',
                      border: '1px solid #fee2e2',
                      background: '#fee2e2',
                      color: '#dc2626',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onClick={() => {
                      const reason = prompt('Lý do từ chối yêu cầu làm Host:', 'Hồ sơ chưa đạt tiêu chuẩn');
                      if (reason !== null) {
                        onApproveUpgrade(user.id, false, reason);
                        onClose();
                      }
                    }}
                  >
                    <TbX /> Từ Chối Yêu Cầu
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
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
            {onToggleStatus && (
              <button
                type="button"
                style={{
                  padding: '0.52rem 1rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: user.status === 'active' ? '1px solid #fecaca' : '1px solid #a7f3d0',
                  background: user.status === 'active' ? '#fef2f2' : '#ecfdf5',
                  color: user.status === 'active' ? '#dc2626' : '#059669',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
                onClick={() => onToggleStatus(user.id)}
              >
                {user.status === 'active' ? (
                  <>
                    <TbLock /> Khóa Tài Khoản
                  </>
                ) : (
                  <>
                    <TbLockOpen /> Mở Khóa Tài Khoản
                  </>
                )}
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                className="btn-admin-primary"
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
              >
                <TbEdit />
                <span>Chỉnh Sửa Thông Tin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
