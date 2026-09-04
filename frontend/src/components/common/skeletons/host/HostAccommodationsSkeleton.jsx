import React from 'react';
import { Skeleton } from '../Skeleton';

export const HostAccommodationsSkeleton = () => {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', background: '#ffffff' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Skeleton width="240px" height="24px" />
        <div style={{ display: 'flex', gap: '12px' }}>
          <Skeleton width="220px" height="38px" borderRadius="10px" />
          <Skeleton width="120px" height="38px" borderRadius="10px" />
          <Skeleton width="150px" height="38px" borderRadius="10px" />
        </div>
      </div>

      {/* Table Header & Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 1fr',
              gap: '1.2rem',
              alignItems: 'center',
              padding: '1rem',
              border: '1px solid #f1f5f9',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Skeleton width="60px" height="60px" borderRadius="10px" />
              <div style={{ flex: 1 }}>
                <Skeleton width="80%" height="16px" style={{ marginBottom: '6px' }} />
                <Skeleton width="50%" height="12px" />
              </div>
            </div>
            <Skeleton width="70px" height="14px" />
            <Skeleton width="90px" height="16px" />
            <Skeleton width="50px" height="14px" />
            <Skeleton width="50px" height="24px" pill />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Skeleton circle height="32px" />
              <Skeleton circle height="32px" />
              <Skeleton circle height="32px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HostAccommodationsSkeleton;
