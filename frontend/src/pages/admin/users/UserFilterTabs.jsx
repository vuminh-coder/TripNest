import React from 'react';
import { TbShieldCheck } from 'react-icons/tb';

export const UserFilterTabs = ({
  activeTab,
  onTabChange,
  totalCount,
  pendingUpgradeCount,
  guestCount,
  hostCount,
  adminCount,
}) => {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
      <button
        className={`subtab-pill ${activeTab === 'all' ? 'active' : ''}`}
        onClick={() => onTabChange('all')}
      >
        Tất Cả ({totalCount})
      </button>

      <button
        className={`subtab-pill ${activeTab === 'pending_upgrade' ? 'active' : ''}`}
        onClick={() => onTabChange('pending_upgrade')}
        style={{
          color: activeTab === 'pending_upgrade' ? '#b45309' : '#64748b',
          borderColor: activeTab === 'pending_upgrade' ? '#fde68a' : 'var(--adm-border)',
          background: activeTab === 'pending_upgrade' ? '#fffbeb' : '#f8fafc',
        }}
      >
        <TbShieldCheck style={{ color: '#d97706' }} />
        <span>Yêu Cầu Nâng Quyền Host</span>
        {pendingUpgradeCount > 0 && (
          <span
            style={{
              background: '#ef4444',
              color: '#ffffff',
              borderRadius: '999px',
              padding: '1px 6px',
              fontSize: '0.68rem',
              fontWeight: 800,
            }}
          >
            {pendingUpgradeCount}
          </span>
        )}
      </button>

      <button
        className={`subtab-pill ${activeTab === 'guest' ? 'active' : ''}`}
        onClick={() => onTabChange('guest')}
      >
        Khách ({guestCount})
      </button>

      <button
        className={`subtab-pill ${activeTab === 'host' ? 'active' : ''}`}
        onClick={() => onTabChange('host')}
      >
        Chủ Nhà ({hostCount})
      </button>

      <button
        className={`subtab-pill ${activeTab === 'admin' ? 'active' : ''}`}
        onClick={() => onTabChange('admin')}
      >
        Quản Trị ({adminCount})
      </button>
    </div>
  );
};

export default UserFilterTabs;
