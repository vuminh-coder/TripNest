import React, { useState } from 'react';
import { TbShieldCheck, TbSearch, TbCircleCheck } from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import AdminConfirmDialog from '../common/AdminConfirmDialog';
import UserUpgradeCard from '../users/UserUpgradeCard';

export const RoleUpgradeRequestsPage = ({ users, onApproveUpgrade, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedUserToApprove, setSelectedUserToApprove] = useState(null);

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
                const reason = prompt('Lý do từ chối đơn làm Host:', 'Hồ sơ chưa đạt tiêu chuẩn');
                if (reason !== null) {
                  onApproveUpgrade(u.id, false, reason);
                }
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
    </div>
  );
};

export default RoleUpgradeRequestsPage;
