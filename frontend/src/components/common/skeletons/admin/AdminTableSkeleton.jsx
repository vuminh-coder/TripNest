import React from 'react';
import { Skeleton } from '../Skeleton';

export const AdminTableSkeleton = ({ rows = 8, columns = 6, titleWidth = '240px' }) => {
  return (
    <div style={{ width: '100%' }}>
      {/* 1. Header & Filters Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Skeleton width={titleWidth} height="28px" style={{ marginBottom: '6px' }} />
          <Skeleton width="300px" height="14px" />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Skeleton width="220px" height="40px" borderRadius="10px" />
          <Skeleton width="130px" height="40px" borderRadius="10px" />
        </div>
      </div>

      {/* 2. Main Admin Card Box with Table */}
      <div className="admin-card-box" style={{ padding: '1.25rem', overflow: 'hidden' }}>
        {/* Table Header Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '1rem',
            padding: '0.8rem 1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '0.5rem',
          }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} width={i === 0 ? '70%' : '50%'} height="14px" />
          ))}
        </div>

        {/* Table 8 Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: '1rem',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Skeleton width="42px" height="42px" borderRadius="8px" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="85%" height="15px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="55%" height="11px" />
                </div>
              </div>
              <Skeleton width="70%" height="14px" />
              <Skeleton width="60%" height="14px" />
              <Skeleton width="65%" height="16px" />
              <Skeleton width="70px" height="24px" pill />
              <div style={{ display: 'flex', gap: '6px' }}>
                <Skeleton circle height="30px" />
                <Skeleton circle height="30px" />
              </div>
            </div>
          ))}
        </div>

        {/* 3. Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <Skeleton width="140px" height="14px" />
          <div style={{ display: 'flex', gap: '6px' }}>
            <Skeleton width="34px" height="34px" borderRadius="8px" />
            <Skeleton width="34px" height="34px" borderRadius="8px" />
            <Skeleton width="34px" height="34px" borderRadius="8px" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTableSkeleton;
