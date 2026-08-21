import React from 'react';
import { TbMapPin, TbEdit, TbLock, TbLockOpen, TbTrash, TbCheck, TbX } from 'react-icons/tb';

export const UserTable = ({
  users,
  onOpenEditModal,
  onToggleStatus,
  onDeletePrompt,
  onApproveUpgradePrompt,
}) => {
  if (!users || users.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
        Không tìm thấy tài khoản người dùng nào.
      </div>
    );
  }

  return (
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
        {users.map((user) => (
          <tr key={user.id}>
            {/* User Details */}
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid var(--adm-border)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: 'var(--adm-text-main)',
                      fontSize: '0.88rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '220px',
                    }}
                    title={user.name}
                  >
                    {user.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: 'var(--adm-text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '220px',
                    }}
                    title={user.email}
                  >
                    {user.email}
                  </div>
                  {user.address && (
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--adm-text-light)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        marginTop: '1px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <TbMapPin /> {user.address}
                    </div>
                  )}
                </div>
              </div>
            </td>

            {/* Contact & CCCD */}
            <td className="td-nowrap">
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--adm-text-main)' }}>
                {user.phone || 'Chưa có SĐT'}
              </div>
              {user.id_card_number && (
                <div style={{ fontSize: '0.74rem', color: '#0ea5e9', fontFamily: 'monospace', fontWeight: 700 }}>
                  CCCD: {user.id_card_number}
                </div>
              )}
            </td>

            {/* Fixed Role */}
            <td className="td-nowrap">
              <span className={`role-pill ${user.role}`}>
                {user.role === 'admin' ? 'Quản Trị' : user.role === 'host' ? 'Chủ Nhà' : 'Khách Hàng'}
              </span>
            </td>

            {/* Upgrade Request */}
            <td>
              {user.role_upgrade_request ? (
                user.role_upgrade_request.status === 'pending' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '240px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: '#b45309',
                        fontWeight: 800,
                        background: '#fffbeb',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid #fde68a',
                        width: 'fit-content',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Xin làm Host (Chờ duyệt)
                    </span>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.25 }}>
                      "{user.role_upgrade_request.reason}"
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '2px', whiteSpace: 'nowrap' }}>
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
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                        onClick={() => onApproveUpgradePrompt(user, true)}
                        title="Duyệt nâng quyền làm Host"
                      >
                        <TbCheck /> Duyệt
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
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                        onClick={() => onApproveUpgradePrompt(user, false)}
                        title="Từ chối yêu cầu"
                      >
                        <TbX /> Từ chối
                      </button>
                    </div>
                  </div>
                ) : user.role_upgrade_request.status === 'approved' ? (
                  <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    ✓ Đã duyệt làm Host
                  </span>
                ) : (
                  <span style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ✗ Bị từ chối
                  </span>
                )
              ) : (
                <span style={{ fontSize: '0.76rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>—</span>
              )}
            </td>

            {/* Joined Date */}
            <td className="td-nowrap">
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{user.joined_date}</span>
            </td>

            {/* Status Pill */}
            <td className="td-nowrap">
              <span className={`status-pill ${user.status}`}>
                {user.status === 'active' ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
              </span>
            </td>

            {/* Actions (Strictly single line, no wrap) */}
            <td style={{ textAlign: 'right' }}>
              <div className="td-actions-group">
                <button
                  className="btn-action-icon"
                  title="Sửa thông tin chi tiết"
                  onClick={() => onOpenEditModal(user)}
                >
                  <TbEdit />
                </button>
                <button
                  className={`btn-action-icon ${user.status === 'active' ? 'danger' : 'success'}`}
                  onClick={() => onToggleStatus(user.id)}
                  title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                >
                  {user.status === 'active' ? <TbLock /> : <TbLockOpen />}
                </button>
                <button
                  className="btn-action-icon danger"
                  title="Xóa người dùng"
                  onClick={() => onDeletePrompt(user)}
                >
                  <TbTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
