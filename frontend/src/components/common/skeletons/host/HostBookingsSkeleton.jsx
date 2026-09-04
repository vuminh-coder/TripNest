import React from 'react';
import { Skeleton } from '../Skeleton';

export const HostBookingsSkeleton = () => {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', background: '#ffffff' }}>
      {/* 1. Header & Status Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Skeleton width="220px" height="24px" />
        <div style={{ display: 'flex', gap: '8px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width="85px" height="34px" pill />
          ))}
        </div>
      </div>

      {/* 2. Bookings Table Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.5fr 2.5fr 1.5fr 1.3fr 1.2fr',
              gap: '1rem',
              alignItems: 'center',
              padding: '1rem',
              border: '1px solid #f1f5f9',
              borderRadius: '12px',
            }}
          >
            <Skeleton width="80px" height="16px" />
            <Skeleton width="110px" height="16px" />
            <Skeleton width="85%" height="16px" />
            <Skeleton width="100px" height="14px" />
            <Skeleton width="90px" height="16px" />
            <div style={{ display: 'flex', gap: '6px' }}>
              <Skeleton width="60px" height="32px" borderRadius="6px" />
              <Skeleton width="60px" height="32px" borderRadius="6px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HostBookingsSkeleton;
