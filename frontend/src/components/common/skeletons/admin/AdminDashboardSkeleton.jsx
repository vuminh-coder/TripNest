import React from 'react';
import { Skeleton } from '../Skeleton';

export const AdminDashboardSkeleton = () => {
  return (
    <div style={{ width: '100%' }}>
      {/* 1. 4 Glassmorphism KPI Cards */}
      <div className="stat-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card-glass" style={{ minHeight: '130px', padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <Skeleton width="65%" height="13px" />
              <Skeleton circle height="36px" />
            </div>
            <Skeleton width="80%" height="28px" style={{ marginBottom: '8px' }} />
            <Skeleton width="45%" height="12px" />
          </div>
        ))}
      </div>

      {/* 2. Chart & Recent Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="admin-card-box" style={{ padding: '1.5rem', minHeight: '320px' }}>
          <Skeleton width="200px" height="20px" style={{ marginBottom: '1.5rem' }} />
          <Skeleton width="100%" height="220px" borderRadius="10px" />
        </div>
        <div className="admin-card-box" style={{ padding: '1.5rem', minHeight: '320px' }}>
          <Skeleton width="160px" height="20px" style={{ marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Skeleton width="120px" height="14px" />
                <Skeleton width="60px" height="14px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;
