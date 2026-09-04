import React from 'react';
import { Skeleton } from '../Skeleton';

export const BookingsListSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '1rem 0' }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: '1.2rem',
            padding: '1.2rem',
            border: '1px solid #f1f5f9',
            borderRadius: '16px',
            alignItems: 'center',
          }}
        >
          <Skeleton width="110px" height="85px" borderRadius="12px" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <Skeleton width="100px" height="16px" pill />
              <Skeleton width="70px" height="14px" />
            </div>
            <Skeleton width="75%" height="18px" style={{ marginBottom: '6px' }} />
            <Skeleton width="50%" height="14px" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <Skeleton width="90px" height="20px" />
            <Skeleton width="100px" height="34px" borderRadius="8px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const WishlistGridSkeleton = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', padding: '1rem 0' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width="100%" height="180px" borderRadius="14px" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="65%" height="16px" />
            <Skeleton width="20%" height="16px" />
          </div>
          <Skeleton width="45%" height="14px" />
          <Skeleton width="35%" height="16px" />
        </div>
      ))}
    </div>
  );
};
