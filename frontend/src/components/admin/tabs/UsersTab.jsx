import React, { useState } from 'react';
import Pagination from '../Pagination';
import Swal from 'sweetalert2';
import {
  TbSearch,
  TbLock,
  TbLockOpen,
  TbPlus,
  TbEdit,
  TbTrash,
  TbCheck,
  TbX,
  TbShieldCheck,
  TbUserCheck,
  TbMapPin,
  TbId,
} from 'react-icons/tb';

export const UsersTab = ({
  users,
  onToggleStatus,
  onOpenEditModal,
  onDeleteUser,
  onApproveUpgrade,
}) => {
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all', 'pending_upgrade', 'guest', 'host', 'admin'
  const [searchUser, setSearchUser] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Pending upgrade requests count
  const pendingUpgrades = users.filter(
    (u) => u.role_upgrade_request && u.role_upgrade_request.status === 'pending'
  );

  const filtered = users.filter((u) => {
    if (activeSubTab === 'pending_upgrade') {
      if (!u.role_upgrade_request || u.role_upgrade_request.status !== 'pending') return false;
    } else if (activeSubTab !== 'all') {
      if (u.role !== activeSubTab) return false;
    }

    if (searchUser.trim()) {
      const q = searchUser.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone && u.phone.includes(q);
      const matchIdCard = u.id_card_number && u.id_card_number.includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchIdCard) return false;
    }
    return true;
  });

  const handleDeleteClick = (user) => {
    Swal.fire({
      title: 'Xác nhận xóa tài khoản?',
      html: `Bạn có chắc chắn muốn xóa tài khoản <b>${user.name}</b> (<code>${user.email}</code>)?<br><span style="color: #ef4444; font-size: 0.85rem;">Hành động này sẽ được ghi nhận vào cơ sở dữ liệu!</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đúng, xóa vĩnh viễn',
      cancelButtonText: 'Hủy bỏ',
      reverseButtons: true,
    }).then((res) => {
      if (res.isConfirmed) {
        onDeleteUser(user);
      }
    });
  };

  const handleRejectUpgradeClick = (user) => {
    Swal.fire({
      title: 'Từ chối yêu cầu làm Host',
      input: 'text',
      inputLabel: 'Lý do từ chối gửi tới thành viên:',
      inputValue: 'Hồ sơ định danh chưa đầy đủ hoặc không hợp lệ',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Xác nhận từ chối',
      cancelButtonText: 'Đóng',
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        onApproveUpgrade(user.id, false, res.value);
      }
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>Tài Khoản & Phân Quyền Người Dùng</h1>
          <p>Quản lý {users.length} tài khoản thành viên trên hệ thống</p>
        </div>

        <button className="btn-admin-primary" onClick={() => onOpenEditModal(null)}>
          <TbPlus style={{ fontSize: '1.1rem' }} />
          <span>Thêm Người Dùng</span>
        </button>
      </div>

      {/* Sub-tabs & Filter Toolbar */}
      <div className="admin-card-box" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setActiveSubTab('all'); setPage(1); }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: activeSubTab === 'all' ? '1px solid #ff385c' : '1px solid #edf2f7',
                background: activeSubTab === 'all' ? '#fff1f2' : '#f8fafc',
                color: activeSubTab === 'all' ? '#e11d48' : '#64748b',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Tất Cả ({users.length})
            </button>

            <button
              onClick={() => { setActiveSubTab('pending_upgrade'); setPage(1); }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: activeSubTab === 'pending_upgrade' ? '1px solid #f59e0b' : '1px solid #edf2f7',
                background: activeSubTab === 'pending_upgrade' ? '#fffbeb' : '#f8fafc',
                color: activeSubTab === 'pending_upgrade' ? '#b45309' : '#64748b',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <TbShieldCheck />
              <span>Yêu Cầu Nâng Quyền Host</span>
              {pendingUpgrades.length > 0 && (
                <span style={{ background: '#ef4444', color: '#ffffff', borderRadius: '999px', padding: '1px 6px', fontSize: '0.7rem' }}>
                  {pendingUpgrades.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveSubTab('guest'); setPage(1); }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: activeSubTab === 'guest' ? '1px solid #0ea5e9' : '1px solid #edf2f7',
                background: activeSubTab === 'guest' ? '#f0f9ff' : '#f8fafc',
                color: activeSubTab === 'guest' ? '#0284c7' : '#64748b',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Khách (Guest)
            </button>

            <button
              onClick={() => { setActiveSubTab('host'); setPage(1); }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: activeSubTab === 'host' ? '1px solid #10b981' : '1px solid #edf2f7',
                background: activeSubTab === 'host' ? '#ecfdf5' : '#f8fafc',
                color: activeSubTab === 'host' ? '#059669' : '#64748b',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Chủ Nhà (Host)
            </button>

            <button
              onClick={() => { setActiveSubTab('admin'); setPage(1); }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: activeSubTab === 'admin' ? '1px solid #6366f1' : '1px solid #edf2f7',
                background: activeSubTab === 'admin' ? '#eef2ff' : '#f8fafc',
                color: activeSubTab === 'admin' ? '#4f46e5' : '#64748b',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Quản Trị (Admin)
            </button>
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '8px', padding: '0.45rem 0.85rem', flex: 1, minWidth: '220px', maxWidth: '320px' }}>
            <TbSearch style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm họ tên, email, SĐT, CCCD..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.84rem' }}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card-box">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người Dùng</th>
                <th>Liên Hệ & CCCD</th>
                <th>Vai Trò (Cố Định)</th>
                <th>Yêu Cầu Nâng Cấp</th>
                <th>Ngày Tham Gia</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.slice((page - 1) * pageSize, page * pageSize).map((user) => (
                  <tr key={user.id}>
                    {/* User Info */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #edf2f7' }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{user.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{user.email}</div>
                          {user.address && (
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '1px' }}>
                              <TbMapPin /> {user.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact & ID */}
                    <td>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                        {user.phone || 'Chưa có SĐT'}
                      </div>
                      {user.id_card_number && (
                        <div style={{ fontSize: '0.74rem', color: '#0ea5e9', fontFamily: 'monospace', fontWeight: 700 }}>
                          CCCD: {user.id_card_number}
                        </div>
                      )}
                    </td>

                    {/* Role (Fixed - changed only when Admin approves) */}
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 9px',
                          borderRadius: '999px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          background:
                            user.role === 'admin'
                              ? '#eef2ff'
                              : user.role === 'host'
                              ? '#ecfdf5'
                              : '#f1f5f9',
                          color:
                            user.role === 'admin'
                              ? '#4f46e5'
                              : user.role === 'host'
                              ? '#059669'
                              : '#475569',
                          border:
                            user.role === 'admin'
                              ? '1px solid #c7d2fe'
                              : user.role === 'host'
                              ? '1px solid #a7f3d0'
                              : '1px solid #e2e8f0',
                        }}
                      >
                        {user.role === 'admin' ? 'Quản Trị' : user.role === 'host' ? 'Chủ Nhà' : 'Khách Hàng'}
                      </span>
                    </td>

                    {/* Role Upgrade Request */}
                    <td>
                      {user.role_upgrade_request ? (
                        user.role_upgrade_request.status === 'pending' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '240px' }}>
                            <span style={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 700, background: '#fffbeb', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fde68a', width: 'fit-content' }}>
                              Xin lên Chủ Nhà (Host)
                            </span>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.2 }}>
                              "{user.role_upgrade_request.reason}"
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                              <button
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#10b981',
                                  color: '#ffffff',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                                onClick={() => onApproveUpgrade(user.id, true)}
                                title="Phê duyệt nâng cấp làm Host"
                              >
                                <TbCheck /> Duyệt Host
                              </button>
                              <button
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #fee2e2',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                                onClick={() => handleRejectUpgradeClick(user)}
                                title="Từ chối yêu cầu"
                              >
                                <TbX /> Từ chối
                              </button>
                            </div>
                          </div>
                        ) : user.role_upgrade_request.status === 'approved' ? (
                          <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
                            ✓ Đã duyệt làm Host
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 600 }}>
                            ✗ Bị từ chối
                          </span>
                        )
                      ) : (
                        <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Không có yêu cầu</span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{user.joined_date}</span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`status-pill ${user.status}`}>
                        {user.status === 'active' ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
                      </span>
                    </td>

                    {/* Actions: Edit, Lock, Delete */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        {/* Edit Button */}
                        <button
                          className="btn-action-icon"
                          title="Sửa thông tin"
                          onClick={() => onOpenEditModal(user)}
                        >
                          <TbEdit />
                        </button>

                        {/* Lock / Unlock Button */}
                        <button
                          className={`btn-action-icon ${user.status === 'active' ? 'danger' : 'success'}`}
                          onClick={() => onToggleStatus(user.id)}
                          title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                        >
                          {user.status === 'active' ? <TbLock /> : <TbLockOpen />}
                        </button>

                        {/* Delete Button */}
                        <button
                          className="btn-action-icon danger"
                          title="Xóa người dùng"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <TbTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filtered.length / pageSize)}
          onPageChange={setPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          label="người dùng"
        />
      </div>
    </div>
  );
};

export default UsersTab;
