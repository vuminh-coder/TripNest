import React from 'react';
import { Skeleton } from '../Skeleton';

export const AdminFinancialsSkeleton = () => {
  return (
    <div style={{ width: '100%' }}>
      {/* 1. 4 Financial Stat Cards */}
      <div className="stat-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card-glass" style={{ minHeight: '120px', padding: '1.25rem' }}>
            <Skeleton width="60%" height="13px" style={{ marginBottom: '12px' }} />
            <Skeleton width="85%" height="26px" style={{ marginBottom: '6px' }} />
            <Skeleton width="40%" height="11px" />
          </div>
        ))}
      </div>

      {/* 2. Payouts Table Box */}
      <div className="admin-card-box" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <Skeleton width="260px" height="24px" />
          <Skeleton width="180px" height="38px" borderRadius="10px" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 2fr 1.5fr 1.2fr 1.2fr 1.2fr 1.2fr',
                gap: '1rem',
                alignItems: 'center',
                padding: '0.85rem 0.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <Skeleton width="80px" height="15px" />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Skeleton circle height="32px" />
                <Skeleton width="100px" height="15px" />
              </div>
              <Skeleton width="120px" height="14px" />
              <Skeleton width="80px" height="15px" />
              <Skeleton width="70px" height="15px" />
              <Skeleton width="85px" height="16px" />
              <Skeleton width="90px" height="32px" borderRadius="8px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdminReviewsSkeleton = () => {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Skeleton width="260px" height="28px" />
        <Skeleton width="160px" height="38px" borderRadius="10px" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="admin-card-box" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Skeleton circle height="36px" />
                <div>
                  <Skeleton width="110px" height="15px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="70px" height="11px" />
                </div>
              </div>
              <Skeleton width="50px" height="20px" pill />
            </div>
            <Skeleton width="100%" height="13px" style={{ marginBottom: '6px' }} />
            <Skeleton width="80%" height="13px" style={{ marginBottom: '12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Skeleton width="70px" height="12px" />
              <Skeleton width="60px" height="26px" borderRadius="6px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
