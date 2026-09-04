import React from 'react';
import { Skeleton } from '../Skeleton';

export const HostDashboardSkeleton = () => {
  return (
    <div style={{ width: '100%' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <Skeleton width="220px" height="28px" style={{ marginBottom: '6px' }} />
          <Skeleton width="320px" height="14px" />
        </div>
        <Skeleton width="160px" height="42px" borderRadius="10px" />
      </div>

      {/* 2. 3 Core KPI Cards */}
      <div className="sk-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.4rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff',
            }}
          >
            <div style={{ width: '70%' }}>
              <Skeleton width="65%" height="13px" style={{ marginBottom: '10px' }} />
              <Skeleton width="85%" height="26px" style={{ marginBottom: '8px' }} />
              <Skeleton width="50%" height="11px" />
            </div>
            <Skeleton circle height="48px" />
          </div>
        ))}
      </div>

      {/* 3. Recent Bookings Table Skeleton */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <Skeleton width="200px" height="22px" />
          <Skeleton width="100px" height="14px" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1.5fr 2fr 1.5fr 1.2fr 1fr',
                gap: '1rem',
                alignItems: 'center',
                padding: '0.85rem 0',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <Skeleton width="90px" height="18px" />
              <Skeleton width="120px" height="16px" />
              <Skeleton width="160px" height="16px" />
              <Skeleton width="110px" height="14px" />
              <Skeleton width="80px" height="16px" />
              <Skeleton width="70px" height="30px" borderRadius="6px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostDashboardSkeleton;
