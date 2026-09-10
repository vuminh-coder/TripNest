import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
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
  TbPlaneDeparture,
  TbSwitchHorizontal,
  TbLogout,
  TbChevronUp,
  TbUser,
  TbChartLine,
  TbTrophy,
} from 'react-icons/tb';
import apiService from '@/services/api';
import { useToast } from '@/context/ToastContext';

export const AdminSidebar = ({
  activeTab,
  onNavigate,
  collapsed,
  setCollapsed,
  onOpenBookings,
  onExitAdmin,
  onLogout,
  onSwitchToHost,
  pendingKycCount = 0,
  pendingRoleUpgradeCount = 0,
}) => {
  const toast = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const userMenuRef = useRef(null);

  // Redux & LocalStorage user sync
  const reduxUser = useSelector((state) => state.userInfo);
  const [currentUser, setCurrentUser] = useState(() => {
    if (reduxUser && (reduxUser.id || reduxUser.name || reduxUser.email)) return reduxUser;
    try {
      const saved = localStorage.getItem('tripnest_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (reduxUser && (reduxUser.id || reduxUser.name || reduxUser.email)) {
      setCurrentUser(reduxUser);
    }
  }, [reduxUser]);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const adminName =
    currentUser?.full_name ||
    currentUser?.name ||
    (currentUser?.email ? currentUser.email.split('@')[0] : 'Minh Hoàng');

  const adminEmail = currentUser?.email || 'minhhoang.dalat@gmail.com';
  const adminAvatar =
    currentUser?.avatar_url ||
    currentUser?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const roleBadge = '★ Quản trị viên cấp cao';

  // Initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(adminName);

  // Switch to Client mode
  const handleSwitchToClient = () => {
    setUserMenuOpen(false);
    if (onExitAdmin) {
      onExitAdmin();
    } else {
      window.location.href = '/';
    }
  };

  // Switch to Host mode
  const handleSwitchToHost = () => {
    setUserMenuOpen(false);
    if (onSwitchToHost) {
      onSwitchToHost();
    } else {
      window.location.href = '/host';
    }
  };

  // Logout handler
  const handleAdminLogout = async () => {
    setUserMenuOpen(false);
    try {
      await apiService.logout();
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('tripnest_user');
      localStorage.removeItem('tripnest_is_host');
      toast.success('Đã đăng xuất', 'Hẹn gặp lại bạn trên hệ thống Quản Trị TripNest!');
      if (onLogout) {
        onLogout();
      } else if (onExitAdmin) {
        onExitAdmin();
      } else {
        window.location.href = '/';
      }
    }
  };

  const navGroups = [
    {
      group: 'Tổng Quan',
      items: [
        { id: 'dashboard', label: 'Tổng Quan & Dòng Tiền', icon: TbLayoutDashboard },
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
        {
          id: 'hosts_revenue',
          label: 'Doanh Thu & Xếp Hạng',
          icon: TbTrophy,
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
                  onClick={() => {
                    if (item.isAction && item.action) {
                      item.action();
                    } else {
                      onNavigate(item.id);
                    }
                  }}
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

        {/* Nút mở rộng thanh bên khi thu gọn */}
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

      {/* Admin User Info Card Footer with Interactive Popover */}
      <div className="admin-sidebar-footer" ref={userMenuRef}>
        {/* Floating Account Popover Menu */}
        {userMenuOpen && (
          <div className={`admin-user-popover ${collapsed ? 'collapsed' : ''}`}>
            <div className="admin-user-popover-header">
              <div className="admin-user-avatar-wrap">
                {adminAvatar && !avatarError ? (
                  <img
                    src={adminAvatar}
                    alt={adminName}
                    className="admin-user-avatar"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="admin-user-initials">{initials}</div>
                )}
                <span className="admin-user-online-dot" />
              </div>
              <div className="admin-user-popover-meta">
                <span className="admin-user-popover-name">{adminName}</span>
                {adminEmail && (
                  <span className="admin-user-popover-email" title={adminEmail}>
                    {adminEmail}
                  </span>
                )}
                <span className="admin-user-popover-status">
                  <span className="admin-status-dot-inline" /> Trực tuyến · Kênh Admin
                </span>
              </div>
            </div>

            <div className="admin-user-popover-divider" />

            <div className="admin-user-popover-actions">
              <button
                type="button"
                className="admin-user-popover-btn"
                onClick={handleSwitchToClient}
              >
                <TbPlaneDeparture />
                <span>Về chế độ khách đặt phòng</span>
              </button>

              <button
                type="button"
                className="admin-user-popover-btn"
                onClick={handleSwitchToHost}
              >
                <TbSwitchHorizontal />
                <span>Chuyển sang Kênh Host</span>
              </button>

              <div className="admin-user-popover-divider" />

              <button
                type="button"
                className="admin-user-popover-btn danger"
                onClick={handleAdminLogout}
              >
                <TbLogout />
                <span>Đăng xuất khỏi hệ thống</span>
              </button>
            </div>
          </div>
        )}

        {/* User Card */}
        <div
          className={`admin-user-card ${userMenuOpen ? 'menu-active' : ''}`}
          onClick={() => setUserMenuOpen((prev) => !prev)}
          title="Tài khoản Quản trị viên - Nhấp để mở tùy chọn"
        >
          <div className="admin-user-avatar-wrap">
            {adminAvatar && !avatarError ? (
              <img
                src={adminAvatar}
                alt={adminName}
                className="admin-user-avatar"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="admin-user-initials">{initials}</div>
            )}
            <span className="admin-user-online-dot" />
          </div>

          {!collapsed && (
            <>
              <div className="admin-user-info">
                <span className="admin-user-name">{adminName}</span>
                <span className="admin-user-role">{roleBadge}</span>
              </div>
              <button
                type="button"
                className="admin-user-menu-trigger"
                aria-label="Tùy chọn tài khoản"
              >
                <TbChevronUp
                  style={{
                    transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
