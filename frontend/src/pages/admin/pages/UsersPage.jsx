import React, { useState } from 'react';
import { TbPlus, TbSearch, TbShieldCheck } from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import AdminTableWrapper from '../common/AdminTableWrapper';
import AdminConfirmDialog from '../common/AdminConfirmDialog';
import UserFilterTabs from '../users/UserFilterTabs';
import UserTable from '../users/UserTable';

export const UsersPage = ({
  users,
  deleteError,
  onToggleStatus,
  onOpenDetailModal,
  onOpenEditModal,
  onDeleteUser,
  onApproveUpgrade,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchUser, setSearchUser] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Confirm delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Upgrade approval prompt state
  const [upgradeTarget, setUpgradeTarget] = useState(null);

  // Counts
  const pendingUpgradeCount = users.filter(
    (u) => u.role_upgrade_request && u.role_upgrade_request.status === 'pending'
  ).length;
  const guestCount = users.filter((u) => u.role === 'guest').length;
  const hostCount = users.filter((u) => u.role === 'host').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  const filtered = users.filter((u) => {
    if (activeTab === 'pending_upgrade') {
      if (!u.role_upgrade_request || u.role_upgrade_request.status !== 'pending') return false;
    } else if (activeTab !== 'all') {
      if (u.role !== activeTab) return false;
    }

    if (searchUser.trim()) {
      const q = searchUser.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchPhone = u.phone && String(u.phone).includes(q);
      const matchIdCard = u.id_card_number && String(u.id_card_number).includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchIdCard) return false;
    }
    return true;
  });

  const paginatedUsers = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {deleteError && (
        <div
          role="alert"
          style={{
            background: '#fff0f3',
            border: '1px solid #fecdd3',
            color: '#be123c',
            borderRadius: '8px',
            padding: '0.8rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          {deleteError}
        </div>
      )}

      {/* Header */}
      <AdminPageHeader
        title="Quản Lý Tài Khoản & Người Dùng"
        subtitle={`Tổng ${users.length} thành viên trên hệ thống`}
        badge={pendingUpgradeCount > 0 ? `${pendingUpgradeCount} đơn xin làm Host` : null}
        actionButton={
          <button className="btn-admin-primary" onClick={() => onOpenEditModal(null)}>
            <TbPlus style={{ fontSize: '1.1rem' }} />
            <span>Thêm Người Dùng</span>
          </button>
        }
      />

      {/* Filter Toolbar */}
      <div className="admin-card-box" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
          {/* Sub-tabs */}
          <UserFilterTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setPage(1);
            }}
            totalCount={users.length}
            pendingUpgradeCount={pendingUpgradeCount}
            guestCount={guestCount}
            hostCount={hostCount}
            adminCount={adminCount}
          />

          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #edf2f7',
              borderRadius: '8px',
              padding: '0.42rem 0.85rem',
              flex: 1,
              minWidth: '220px',
              maxWidth: '300px',
            }}
          >
            <TbSearch style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo họ tên, email, SĐT, CCCD..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.84rem', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Table with Anti-wrap rules and pagination wrapper */}
      <AdminTableWrapper
        page={page}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        label="người dùng"
      >
        <UserTable
          users={paginatedUsers}
          onOpenDetailModal={onOpenDetailModal}
          onOpenEditModal={onOpenEditModal}
          onToggleStatus={onToggleStatus}
          onDeletePrompt={(u) => setDeleteTarget(u)}
          onApproveUpgradePrompt={(u, approved) => {
            if (approved) {
              setUpgradeTarget({ user: u, approved: true });
            } else {
              const reason = prompt('Lý do từ chối yêu cầu làm Host:', 'Hồ sơ chưa đạt tiêu chuẩn');
              if (reason !== null) {
                onApproveUpgrade(u.id, false, reason);
              }
            }
          }}
        />
      </AdminTableWrapper>

      {/* Confirm Delete Dialog */}
      <AdminConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa Tài Khoản Người Dùng"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${deleteTarget?.name}" (${deleteTarget?.email})?`}
        confirmText="Xóa Vĩnh Viễn"
        cancelText="Giữ Lại"
        type="danger"
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteUser(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Confirm Upgrade Dialog */}
      <AdminConfirmDialog
        isOpen={!!upgradeTarget}
        title="Phê Duyệt Làm Chủ Nhà (Host)"
        message={`Phê duyệt cho "${upgradeTarget?.user?.name}" chuyển đổi từ Khách (Guest) thành Chủ Nhà (Host) và kích hoạt tài khoản Host trên hệ thống?`}
        confirmText="Phê Duyệt Ngay"
        cancelText="Xem Lại"
        type="primary"
        onConfirm={() => {
          if (upgradeTarget) {
            onApproveUpgrade(upgradeTarget.user.id, true);
            setUpgradeTarget(null);
          }
        }}
        onCancel={() => setUpgradeTarget(null)}
      />
    </div>
  );
};

export default UsersPage;
