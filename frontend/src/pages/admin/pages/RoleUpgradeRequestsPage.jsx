import React, { useState } from 'react';
import { TbShieldCheck, TbSearch, TbCircleCheck, TbX, TbAlertTriangle } from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import AdminConfirmDialog from '../common/AdminConfirmDialog';
import UserUpgradeCard from '../users/UserUpgradeCard';

export const RoleUpgradeRequestsPage = ({ users, onApproveUpgrade, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedUserToApprove, setSelectedUserToApprove] = useState(null);
  const [userToReject, setUserToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('Hồ sơ CCCD hoặc thông tin kinh doanh chưa đạt tiêu chuẩn.');

  const pendingUsers = users.filter(
    (u) => u.role_upgrade_request && u.role_upgrade_request.status === 'pending'
  );

  const filtered = pendingUsers.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone && u.phone.includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const handleConfirmReject = () => {
    if (userToReject) {
      onApproveUpgrade(userToReject.id, false, rejectReason);
      setUserToReject(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <AdminPageHeader
        title="Duyệt Yêu Cầu Nâng Quyền Làm Host"
        subtitle="Thẩm định đơn đăng ký trở thành Chủ nhà cho thuê của Khách hàng"
        badge={pendingUsers.length > 0 ? `${pendingUsers.length} hồ sơ chờ duyệt` : null}
      />

      {/* Search toolbar if any */}
      {pendingUsers.length > 0 && (
        <div className="admin-card-box" style={{ padding: '0.75rem 1.15rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '8px', padding: '0.42rem 0.85rem' }}>
            <TbSearch style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo tên người nộp đơn, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.84rem', outline: 'none' }}
            />
          </div>
        </div>
      )}

      {/* List of Upgrade Applications */}
      {filtered.length === 0 ? (
        <div className="admin-card-box" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 0.75rem auto',
            }}
          >
            <TbCircleCheck />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            Không có yêu cầu nâng quyền nào đang chờ xử lý
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Tất cả các đơn đăng ký trở thành Chủ nhà đã được duyệt hoàn tất.
          </p>
          <button className="btn-admin-primary" onClick={() => onNavigate('users')}>
            Quản Lý Danh Sách Thành Viên
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((user) => (
            <UserUpgradeCard
              key={user.id}
              user={user}
              onApprove={(u) => setSelectedUserToApprove(u)}
              onReject={(u) => {
                setUserToReject(u);
                setRejectReason('Hồ sơ CCCD hoặc thông tin kinh doanh chưa đạt tiêu chuẩn.');
              }}
            />
          ))}
        </div>
      )}

      {/* Confirm Approve Dialog */}
      <AdminConfirmDialog
        isOpen={!!selectedUserToApprove}
        title="Xác Nhận Phê Duyệt Làm Host"
        message={`Chính thức phê duyệt cho "${selectedUserToApprove?.name}" trở thành Chủ Nhà (Host) và kích hoạt quyền đăng chỗ ở?`}
        confirmText="Xác Nhận & Kích Hoạt"
        cancelText="Đóng"
        type="primary"
        onConfirm={() => {
          if (selectedUserToApprove) {
            onApproveUpgrade(selectedUserToApprove.id, true);
            setSelectedUserToApprove(null);
          }
        }}
        onCancel={() => setSelectedUserToApprove(null)}
      />

      {/* Reject Modal */}
      {userToReject && (
        <div className="admin-modal-backdrop" onClick={() => setUserToReject(null)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header" style={{ borderColor: '#fee2e2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 800 }}>
                <TbAlertTriangle style={{ fontSize: '1.25rem' }} />
                <span>Từ Chối Đơn Xin Làm Host</span>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setUserToReject(null)}
              >
                <TbX />
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 1rem 0' }}>
                Từ chối hồ sơ đăng ký của <strong>{userToReject.name}</strong> ({userToReject.email}). Vui lòng nhập lý do để thông báo:
              </p>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Lý do từ chối *
              </label>
              <textarea
                rows="3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ padding: '0.85rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setUserToReject(null)}
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1.1rem',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleUpgradeRequestsPage;
