import React from 'react';
import {
  TbCompass,
  TbLayoutDashboard,
  TbBuildingCastle,
  TbCalendarEvent,
  TbStar,
  TbWallet,
  TbPlus,
  TbChevronLeft,
  TbAward,
  TbSparkles,
  TbPlaneDeparture,
} from 'react-icons/tb';

export const HostSidebar = ({
  activeTab,
  onNavigate,
  collapsed,
  setCollapsed,
  onOpenWizard,
  onOpenBookings,
  pendingBookingsCount = 0,
}) => {
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('tripnest_user') || '{}');
    } catch {
      return {};
    }
  })();
  const hostName = currentUser?.name || currentUser?.full_name || currentUser?.host_name || 'Minh Hoàng';
  const hostAvatar = currentUser?.avatar || currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

  const navGroups = [
    {
      group: 'Tổng Quan',
      items: [
        { id: 'dashboard', label: 'Bảng Điều Khiển', icon: TbLayoutDashboard },
      ],
    },
    {
      group: 'Vận Hành Đón Khách',
      items: [
        { id: 'accommodations', label: 'Cơ Sở Lưu Trú', icon: TbBuildingCastle },
        { id: 'new_listing', label: 'Đăng Ký Chỗ Nghỉ', icon: TbPlus },
        {
          id: 'bookings',
          label: 'Đơn Đặt Phòng (Host)',
          icon: TbCalendarEvent,
          badge: pendingBookingsCount > 0 ? pendingBookingsCount : null,
        },
        { id: 'reviews', label: 'Đánh Giá & Phản Hồi', icon: TbStar },
      ],
    },
    {
      group: 'Tài Chính & Thu Nhập',
      items: [
        { id: 'financials', label: 'Ví & Payout Ngân Hàng', icon: TbWallet },
      ],
    },
  ];

  return (
    <aside className={`host-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="host-sidebar-header">
        <div
          className="host-brand"
          onClick={() => onNavigate('dashboard')}
          title="Về Bảng Điều Khiển Chủ Nhà"
        >
          <div className="host-brand-icon">
            <TbCompass />
          </div>
          {!collapsed && (
            <div className="host-brand-text">
              <span className="host-brand-title">TripNest</span>
              <span className="host-brand-badge">
                <TbAward style={{ fontSize: '0.85rem' }} /> Kênh Chủ Nhà
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            type="button"
            className="host-sidebar-collapse-btn"
            onClick={() => setCollapsed(true)}
            title="Thu gọn thanh bên"
          >
            <TbChevronLeft />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="host-nav-list">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} style={{ marginBottom: '0.35rem' }}>
            {!collapsed && (
              <div className="host-nav-section-title">{group.group}</div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`host-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (item.isAction && item.action) {
                      item.action();
                    } else {
                      onNavigate(item.id);
                    }
                  }}
                  title={
                    collapsed
                      ? `${item.label} ${item.badge ? `(${item.badge})` : ''}`
                      : ''
                  }
                >
                  <Icon />
                  {!collapsed && <span>{item.label}</span>}
                  {item.badge && !collapsed && (
                    <span className="host-nav-badge">{item.badge}</span>
                  )}
                  {item.badge && collapsed && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '12px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        border: '1.5px solid #ffffff',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Nút mở rộng khi Sidebar đang thu gọn */}
        {collapsed && (
          <div
            style={{
              marginTop: '0.65rem',
              paddingTop: '0.65rem',
              borderTop: '1px solid var(--host-border-subtle)',
            }}
          >
            <button
              type="button"
              className="host-nav-item"
              onClick={() => setCollapsed(false)}
              title="Mở rộng thanh bên"
              style={{
                color: 'var(--host-primary)',
                background: 'var(--host-primary-soft)',
                justifyContent: 'center',
              }}
            >
              <TbSparkles />
            </button>
          </div>
        )}
      </nav>

      {/* Host User Info Card Footer */}
      {!collapsed && (
        <div className="host-sidebar-footer">
          <div className="host-user-card">
            <img
              src={hostAvatar}
              alt={hostName}
              className="host-user-avatar"
            />
            <div className="host-user-info">
              <span className="host-user-name">{hostName}</span>
              <span className="host-user-role">★ Chủ nhà Siêu cấp</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default HostSidebar;
