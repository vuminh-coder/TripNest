import React from 'react';

export const AdminPageHeader = ({ title, subtitle, badge, actionButton }) => {
  return (
    <div className="page-header-row">
      <div className="page-title-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1>{title}</h1>
          {badge && (
            <span
              style={{
                background: '#fff1f2',
                color: '#e11d48',
                border: '1px solid #fecdd3',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {actionButton && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;
