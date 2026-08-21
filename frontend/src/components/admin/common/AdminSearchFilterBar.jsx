import React from 'react';
import { TbSearch } from 'react-icons/tb';

export const AdminSearchFilterBar = ({
  searchValue,
  onSearchChange,
  placeholder = 'Tìm kiếm nhanh...',
  children,
}) => {
  return (
    <div className="admin-card-box" style={{ padding: '0.75rem 1.15rem', marginBottom: '1.25rem' }}>
      <div className="admin-filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f8fafc',
            border: '1px solid #edf2f7',
            borderRadius: '9px',
            padding: '0.45rem 0.85rem',
            flex: 1,
            minWidth: '220px',
          }}
        >
          <TbSearch style={{ color: '#94a3b8', fontSize: '1.1rem', flexShrink: 0 }} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            style={{
              border: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: '0.84rem',
              outline: 'none',
              color: '#0f172a',
              fontWeight: 500,
            }}
          />
        </div>

        {/* Filter controls / Selects passed as children */}
        {children && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSearchFilterBar;
