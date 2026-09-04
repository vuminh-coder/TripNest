import React from 'react';
import { Skeleton } from '../Skeleton';

export const HostReviewsSkeleton = () => {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', background: '#ffffff' }}>
      {/* 1. Header & Overall Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <Skeleton width="180px" height="24px" style={{ marginBottom: '6px' }} />
          <Skeleton width="220px" height="14px" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Skeleton circle height="40px" />
          <Skeleton width="70px" height="28px" />
        </div>
      </div>

      {/* 2. 6 Radar Category Progress Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <Skeleton width="80px" height="14px" />
              <Skeleton width="30px" height="14px" />
            </div>
            <Skeleton width="100%" height="8px" pill />
          </div>
        ))}
      </div>

      {/* 3. Review Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ border: '1px solid #f1f5f9', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Skeleton circle height="40px" />
                <div>
                  <Skeleton width="120px" height="16px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="80px" height="12px" />
                </div>
              </div>
              <Skeleton width="60px" height="16px" />
            </div>
            <Skeleton width="100%" height="14px" style={{ marginBottom: '6px' }} />
            <Skeleton width="75%" height="14px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HostReviewsSkeleton;
