import React from 'react';
import {
  TbCompass,
  TbLayoutDashboard,
  TbBuildingCastle,
  TbCalendarEvent,
  TbIdBadge2,
  TbUsers,
  TbShieldCheck,
  TbCategory,
  TbStar,
  TbCoins,
  TbSparkles,
  TbChevronLeft,
  TbChevronRight,
  TbLayoutSidebarLeftCollapse,
} from 'react-icons/tb';

export const AdminSidebar = ({
  activeTab,
  onNavigate,
  collapsed,
  setCollapsed,
  pendingKycCount = 0,
  pendingRoleUpgradeCount = 0,
}) => {
  const navGroups = [
    {
      group: 'Tổng Quan',
      items: [
        { id: 'dashboard', label: 'Bảng Điều Khiển', icon: TbLayoutDashboard },
      ],
    },
    {
      group: 'Vận Hành & Chỗ Ở',
      items: [
        { id: 'accommodations', label: 'Cơ Sở Lưu Trú', icon: TbBuildingCastle },
        { id: 'bookings', label: 'Đơn Đặt Phòng', icon: TbCalendarEvent },
        {
          id: 'hosts_kyc',
          label: 'Thẩm Định KYC Chủ Nhà',
          icon: TbIdBadge2,
          badge: pendingKycCount > 0 ? pendingKycCount : null,
          badgeType: 'alert',
        },
        { id: 'experiences', label: 'Trải Nghiệm & Tour', icon: TbSparkles },
      ],
    },
    {
      group: 'Người Dùng & Phân Quyền',
      items: [
        { id: 'users', label: 'Tài Khoản Thành Viên', icon: TbUsers },
        {
          id: 'role_requests',
          label: 'Duyệt Yêu Cầu Làm Host',
          icon: TbShieldCheck,
          badge: pendingRoleUpgradeCount > 0 ? pendingRoleUpgradeCount : null,
          badgeType: 'alert',
        },
        { id: 'reviews', label: 'Đánh Giá Radar 6 Điểm', icon: TbStar },
      ],
    },
    {
      group: 'Hệ Thống & Tài Chính',
      items: [
        { id: 'financials', label: 'Tài Chính & Giải Ngân', icon: TbCoins },
        { id: 'categories', label: 'Danh Mục & Tiện Nghi', icon: TbCategory },
      ],
    },
  ];

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <div className="admin-brand" onClick={() => onNavigate('dashboard')} title="Về Bảng Điều Khiển">
          <div className="admin-brand-icon">
            <TbCompass />
          </div>
          {!collapsed && (
            <div className="admin-brand-text">
              <span className="admin-brand-title">TripNest</span>
              <span className="admin-brand-badge">Admin Portal</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(true)}
            title="Thu gọn thanh bên"
          >
            <TbChevronLeft />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="admin-nav-list">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} style={{ marginBottom: '0.35rem' }}>
            {!collapsed && <div className="nav-section-title">{group.group}</div>}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? `${item.label} ${item.badge ? `(${item.badge})` : ''}` : ''}
                >
                  <Icon />
                  {!collapsed && <span>{item.label}</span>}
                  {item.badge && !collapsed && (
                    <span className={`admin-nav-badge ${item.badgeType === 'alert' ? 'badge-alert' : 'badge-info'}`}>
                      {item.badge}
                    </span>
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

        {/* NÚT MỞ RỘNG CHỈ HIỂN THỊ KHI SIDEBAR ĐANG ẨN / THU GỌN */}
        {collapsed && (
          <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid var(--adm-border-subtle)' }}>
            <button
              className="admin-nav-item"
              onClick={() => setCollapsed(false)}
              title="Mở rộng thanh bên (Click để mở rộng)"
              style={{
                color: 'var(--adm-primary)',
                background: 'var(--adm-primary-soft)',
                border: '1px solid var(--adm-primary-border)',
                borderRadius: '7px',
                fontWeight: 700,
                justifyContent: 'center',
                padding: '0.6rem 0',
              }}
            >
              <TbChevronRight style={{ fontSize: '1.35rem' }} />
            </button>
          </div>
        )}
      </nav>

      {/* Sidebar Footer Profile */}
      <div className="admin-sidebar-footer">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          alt="Master Admin"
          className="admin-user-avatar"
        />
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Master Admin
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              admin@tripnest.com
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
