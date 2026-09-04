import React from 'react';
import './UserDetailModal.css';
import {
  TbX,
  TbUser,
  TbMail,
  TbPhone,
  TbId,
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
    <div className="modal-overlay adm-usrdet-overlay" onClick={onClose}>
      <div
        className="modal-container adm-usrdet-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="adm-usrdet-header">
          <div className="adm-usrdet-header-left">
            <div className="adm-usrdet-icon-wrap">
              <TbUser />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="adm-usrdet-title">
                  Hồ Sơ Chi Tiết Tài Khoản #{user.id}
                </h2>
                <span className={`role-pill ${roleBadgeClass}`}>
                  {user.role === 'admin' ? 'Quản Trị' : user.role === 'host' ? 'Chủ Nhà' : 'Khách Hàng'}
                </span>
                <span className={`status-pill ${user.status}`}>
                  {user.status === 'active' ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
                </span>
              </div>
              <p className="adm-usrdet-sub-text">
                Xem toàn bộ thông tin cá nhân, định danh, phân quyền và lịch sử hoạt động
              </p>
            </div>
          </div>

          <button className="btn-action-icon" onClick={onClose} title="Đóng">
            <TbX style={{ fontSize: '1.1rem' }} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="adm-usrdet-body">
          {/* User Profile Card Banner */}
          <div className="adm-usrdet-hero-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="adm-usrdet-avatar-wrap">
                <img
                  src={user.avatar || defaultAvatar}
                  alt={user.name}
                  className="adm-usrdet-avatar"
                />
                <span
                  className="adm-usrdet-status-dot"
                  style={{
                    backgroundColor: user.status === 'active' ? '#10b981' : '#ef4444',
                  }}
                  title={user.status === 'active' ? 'Đang hoạt động' : 'Tài khoản bị khóa'}
                />
              </div>
              <div>
                <h3 className="adm-usrdet-user-name">
                  {user.name}
                </h3>
                <div className="adm-usrdet-user-contact-row">
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
              <div className="adm-usrdet-stats-pill">
                <div className="adm-usrdet-stats-label">
                  Lượt đặt phòng
                </div>
                <div className="adm-usrdet-stats-val">
                  {user.total_bookings_count ?? 0}
                </div>
              </div>
              <div className="adm-usrdet-stats-pill">
                <div className="adm-usrdet-stats-label">
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
          <div className="adm-usrdet-2col-grid">
            {/* Section 1: Thông tin cá nhân & định danh */}
            <div className="adm-usrdet-card">
              <div className="adm-usrdet-card-head">
                <TbId style={{ color: '#ff385c', fontSize: '1.1rem' }} />
                <span>Thông Tin Định Danh & Liên Hệ</span>
              </div>

              <div className="adm-usrdet-info-list">
                <div className="adm-usrdet-info-row">
                  <span style={{ color: '#64748b' }}>Họ và Tên:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{user.name}</span>
                </div>
                <div className="adm-usrdet-info-row">
                  <span style={{ color: '#64748b' }}>Email:</span>
                  <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{user.email}</span>
                </div>
                <div className="adm-usrdet-info-row">
                  <span style={{ color: '#64748b' }}>Số Điện Thoại:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{user.phone || 'Chưa cung cấp'}</span>
                </div>
                <div className="adm-usrdet-info-row">
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
            <div className="adm-usrdet-card">
              <div className="adm-usrdet-card-head">
                <TbShieldCheck style={{ color: '#6366f1', fontSize: '1.1rem' }} />
                <span>Hệ Thống & Hoạt Động</span>
              </div>

              <div className="adm-usrdet-info-list">
                <div className="adm-usrdet-info-row">
                  <span style={{ color: '#64748b' }}>Mã Thành Viên (ID):</span>
                  <span style={{ fontWeight: 800, color: '#6366f1', fontFamily: 'monospace' }}>#{user.id}</span>
                </div>
                <div className="adm-usrdet-info-row">
                  <span style={{ color: '#64748b' }}>Vai Trò Hiện Tại:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{roleLabel}</span>
                </div>
                <div className="adm-usrdet-info-row">
                  <span style={{ color: '#64748b' }}>Trạng Thái:</span>
                  <span className={`status-pill ${user.status}`}>
                    {user.status === 'active' ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
                  </span>
                </div>
                <div className="adm-usrdet-info-row">
                  <span style={{ color: '#64748b' }}>Ngày Tham Gia:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{user.joined_date || 'N/A'}</span>
                </div>
                <div className="adm-usrdet-info-row">
                  <span style={{ color: '#64748b' }}>Đăng Nhập Cuối:</span>
                  <span style={{ fontWeight: 600, color: '#64748b' }}>{user.last_login || 'Chưa đăng nhập'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="adm-usrdet-footer">
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={onClose}
          >
            Đóng Cửa Sổ
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-admin-secondary"
              onClick={() => {
                onClose();
                if (onEdit) onEdit(user);
              }}
            >
              <TbEdit />
              <span>Chỉnh Sửa Hồ Sơ</span>
            </button>

            {user.role !== 'admin' && (
              <button
                type="button"
                className={user.status === 'active' ? 'btn-admin-danger' : 'btn-admin-success'}
                onClick={() => {
                  if (onToggleStatus) onToggleStatus(user.id);
                  onClose();
                }}
              >
                {user.status === 'active' ? (
                  <>
                    <TbLock />
                    <span>Khóa Tài Khoản</span>
                  </>
                ) : (
                  <>
                    <TbLockOpen />
                    <span>Mở Khóa Tài Khoản</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
