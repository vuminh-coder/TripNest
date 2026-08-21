import React from 'react';
import {
  TbSearch,
  TbArrowLeft,
  TbRotateClockwise,
  TbBell,
} from 'react-icons/tb';

export const AdminHeader = ({
  searchTerm,
  setSearchTerm,
  onExitAdmin,
  onResetData,
  pendingKycCount = 0,
}) => {
  return (
    <header className="admin-topbar">
      {/* Left Search */}
      <div className="topbar-left">
        <div className="topbar-search">
          <TbSearch style={{ color: '#94a3b8', fontSize: '1.1rem' }} />
          <input
            type="text"
            placeholder="Tìm kiếm mã booking, tên chỗ ở, chủ nhà, khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="topbar-right">
        {/* Reset Demo Data Button */}
        <button
          className="btn-quick-reset"
          onClick={() => {
            if (window.confirm('Đặt lại toàn bộ dữ liệu mẫu Admin về trạng thái ban đầu?')) {
              onResetData();
            }
          }}
          title="Đặt lại dữ liệu mẫu"
        >
          <TbRotateClockwise />
          <span>Reset Demo</span>
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="btn-action-icon" title="Thông báo hệ thống">
            <TbBell style={{ fontSize: '1.2rem' }} />
            {pendingKycCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.68rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                }}
              >
                {pendingKycCount}
              </span>
            )}
          </button>
        </div>

        {/* Back to Client App */}
        <button className="btn-exit-admin" onClick={onExitAdmin}>
          <TbArrowLeft />
          <span>Về trang khách TripNest</span>
        </button>
      </div>
    </header>
  );
};
export default AdminHeader;
