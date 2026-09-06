import React, { useState, useEffect, useRef } from 'react';
import {
  TbCompass,
  TbLayoutDashboard,
  TbBuildingCastle,
  TbCalendarEvent,
  TbStar,
  TbWallet,
  TbPlus,
  TbChevronLeft,
  TbChevronRight,
  TbAward,
  TbSparkles,
  TbPlaneDeparture,
  TbUser,
  TbLogout,
  TbDotsVertical,
  TbChevronUp,
  TbSwitchHorizontal,
  TbShieldCheck,
  TbLogin,
  TbExternalLink,
} from 'react-icons/tb';
import { apiService } from '@/services/api';
import { useToast } from '@/context/ToastContext';

export const HostSidebar = ({
  activeTab,
  onNavigate,
  collapsed,
  setCollapsed,
  onOpenWizard,
  onOpenBookings,
  pendingBookingsCount = 0,
  onSwitchToClient,
  onLogout,
}) => {
  const toast = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const userMenuRef = useRef(null);

  // Sync user from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tripnest_user') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncUser = () => {
      try {
        const u = JSON.parse(localStorage.getItem('tripnest_user') || 'null');
        setCurrentUser(u);
      } catch {
        setCurrentUser(null);
      }
    };
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  // Close popup menu when clicking outside
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

  const token = localStorage.getItem('token');
  const isLoggedIn = Boolean(currentUser && (currentUser.id || currentUser.email) && token);

  const hostName =
    currentUser?.full_name ||
    currentUser?.name ||
    currentUser?.host_name ||
    (currentUser?.email ? currentUser.email.split('@')[0] : 'Chủ nhà TripNest');

  const hostEmail = currentUser?.email || '';
  const hostAvatar = currentUser?.avatar_url || currentUser?.avatar || '';
  const isSuperhost = Boolean(currentUser?.host?.is_superhost !== false);
  const roleBadge = isSuperhost ? '★ Chủ nhà Siêu cấp' : '★ Chủ nhà Đối tác';

  // Initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'TN';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(hostName);

  // Logout handler
  const handleHostLogout = async () => {
    setUserMenuOpen(false);
    try {
      await apiService.logout();
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('tripnest_user');
      localStorage.removeItem('tripnest_is_host');
      toast.success('Đã đăng xuất', 'Hẹn gặp lại bạn trên Kênh Chủ Nhà TripNest!');
      if (onLogout) {
        onLogout();
      } else if (onSwitchToClient) {
        onSwitchToClient();
      } else {
        window.location.href = '/';
      }
    }
  };

  // Switch to Client mode
  const handleSwitchToClient = () => {
    setUserMenuOpen(false);
    if (onSwitchToClient) {
      onSwitchToClient();
    } else {
      window.location.href = '/';
    }
  };

  // Quick Switch / Login host
  const handleSwitchAccount = () => {
    setUserMenuOpen(false);
    // Open auth or switch host
    toast.info('Đổi tài khoản', 'Vui lòng đăng nhập với tài khoản Chủ nhà khác.');
    localStorage.removeItem('token');
    localStorage.removeItem('tripnest_user');
    window.location.href = '/?login=host';
  };

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
                <TbAward style={{ fontSize: '0.85rem' }} /> KÊNH CHỦ NHÀ
              </span>
            </div>
          )}
        </div>

        {!collapsed ? (
          <button
            type="button"
            className="host-sidebar-collapse-btn"
            onClick={() => setCollapsed(true)}
            title="Thu gọn thanh bên"
          >
            <TbChevronLeft />
          </button>
        ) : (
          <button
            type="button"
            className="host-sidebar-collapse-btn collapsed"
            onClick={() => setCollapsed(false)}
            title="Mở rộng thanh bên"
          >
            <TbChevronRight />
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
              const isActive =
                activeTab === item.id ||
                (item.id === 'accommodations' && activeTab === 'edit_listing');
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

      {/* Host User Info Card Footer with Interactive Popover */}
      <div className="host-sidebar-footer" ref={userMenuRef}>
        {/* Floating Account Popover Menu */}
        {userMenuOpen && (
          <div className={`host-user-popover ${collapsed ? 'collapsed' : ''}`}>
            <div className="host-user-popover-header">
              <div className="host-user-avatar-wrap">
                {hostAvatar && !avatarError ? (
                  <img
                    src={hostAvatar}
                    alt={hostName}
                    className="host-user-avatar"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="host-user-initials">{initials}</div>
                )}
                {isLoggedIn && <span className="host-user-online-dot" />}
              </div>
              <div className="host-user-popover-meta">
                <span className="host-user-popover-name">{hostName}</span>
                {hostEmail && (
                  <span className="host-user-popover-email" title={hostEmail}>
                    {hostEmail}
                  </span>
                )}
                <span className="host-user-popover-status">
                  <span className="host-status-dot-inline" /> Trực tuyến · Kênh Host
                </span>
              </div>
            </div>

            <div className="host-user-popover-divider" />

            <div className="host-user-popover-actions">
              <button
                type="button"
                className="host-user-popover-btn"
                onClick={handleSwitchToClient}
              >
                <TbPlaneDeparture />
                <span>Về chế độ khách đặt phòng</span>
              </button>

              <button
                type="button"
                className="host-user-popover-btn"
                onClick={handleSwitchAccount}
              >
                <TbSwitchHorizontal />
                <span>Đổi tài khoản Host</span>
              </button>

              <div className="host-user-popover-divider" />

              <button
                type="button"
                className="host-user-popover-btn danger"
                onClick={handleHostLogout}
              >
                <TbLogout />
                <span>Đăng xuất khỏi hệ thống</span>
              </button>
            </div>
          </div>
        )}

        {/* User Card */}
        {isLoggedIn ? (
          <div
            className={`host-user-card ${userMenuOpen ? 'menu-active' : ''}`}
            onClick={() => setUserMenuOpen((prev) => !prev)}
            title="Tài khoản chủ nhà - Nhấp để quản lý hoặc đăng xuất"
          >
            <div className="host-user-avatar-wrap">
              {hostAvatar && !avatarError ? (
                <img
                  src={hostAvatar}
                  alt={hostName}
                  className="host-user-avatar"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="host-user-initials">{initials}</div>
              )}
              <span className="host-user-online-dot" />
            </div>

            {!collapsed && (
              <>
                <div className="host-user-info">
                  <span className="host-user-name">{hostName}</span>
                  <span className="host-user-role">{roleBadge}</span>
                </div>
                <button
                  type="button"
                  className="host-user-menu-trigger"
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
        ) : (
          <div
            className="host-user-card guest-mode"
            onClick={handleSwitchAccount}
            title="Chưa đăng nhập. Nhấp để đăng nhập Host"
          >
            <div className="host-user-avatar-wrap">
              <div className="host-user-initials guest">
                <TbUser />
              </div>
            </div>

            {!collapsed && (
              <>
                <div className="host-user-info">
                  <span className="host-user-name">Chưa đăng nhập</span>
                  <span className="host-user-role text-muted">Bấm để đăng nhập Host</span>
                </div>
                <button
                  type="button"
                  className="host-user-login-badge"
                  onClick={handleSwitchAccount}
                >
                  <TbLogin />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default HostSidebar;
