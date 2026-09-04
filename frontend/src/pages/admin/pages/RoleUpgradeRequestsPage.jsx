import React, { useState } from 'react';
import './RoleUpgradeRequestsPage.css';
import { TbSearch, TbCircleCheck, TbX, TbAlertTriangle } from 'react-icons/tb';
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
    <div className="adm-role-requests-container">
      {/* Header */}
      <AdminPageHeader
        title="Duyệt Yêu Cầu Nâng Quyền Làm Host"
        subtitle="Thẩm định đơn đăng ký trở thành Chủ nhà cho thuê của Khách hàng"
        badge={pendingUsers.length > 0 ? `${pendingUsers.length} hồ sơ chờ duyệt` : null}
      />

      {/* Search toolbar if any */}
      {pendingUsers.length > 0 && (
        <div className="admin-card-box adm-role-filter-box">
          <div className="adm-role-search-wrap">
            <TbSearch className="adm-role-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên người nộp đơn, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-role-search-input"
            />
          </div>
        </div>
      )}

      {/* List of Upgrade Applications */}
      {filtered.length === 0 ? (
        <div className="admin-card-box adm-role-empty-box">
          <div className="adm-role-empty-icon-wrap">
            <TbCircleCheck />
          </div>
          <h3 className="adm-role-empty-title">
            Không có yêu cầu nâng quyền nào đang chờ xử lý
          </h3>
          <p className="adm-role-empty-desc">
            Tất cả các đơn đăng ký trở thành Chủ nhà đã được duyệt hoàn tất.
          </p>
          <button className="btn-admin-primary" onClick={() => onNavigate('users')}>
            Quản Lý Danh Sách Thành Viên
          </button>
        </div>
      ) : (
        <div className="adm-role-cards-list">
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
            className="admin-modal-card adm-role-reject-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header adm-role-reject-header">
              <div className="adm-role-reject-header-title">
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

            <div className="adm-role-reject-body">
              <p className="adm-role-reject-desc">
                Từ chối hồ sơ đăng ký của <strong>{userToReject.name}</strong> ({userToReject.email}). Vui lòng nhập lý do để thông báo:
              </p>

              <label className="adm-role-reject-label">
                Lý do từ chối *
              </label>
              <textarea
                rows="3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="adm-role-reject-textarea"
              />
            </div>

            <div className="adm-role-reject-footer">
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
                className="adm-role-reject-confirm-btn"
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
