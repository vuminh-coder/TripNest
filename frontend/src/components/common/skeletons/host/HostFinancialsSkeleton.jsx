import React from 'react';
import { Skeleton } from '../Skeleton';

export const HostFinancialsSkeleton = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', alignItems: 'start' }}>
      {/* Left Column: Bank Account */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <Skeleton width="180px" height="22px" />
          <Skeleton width="60px" height="16px" />
        </div>
        <div style={{ border: '1.5px dashed #cbd5e1', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="120px" height="16px" />
            <Skeleton width="70px" height="20px" pill />
          </div>
          <Skeleton width="160px" height="22px" />
          <Skeleton width="140px" height="14px" />
        </div>
      </div>

      {/* Right Column: Wallet Balances & History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Balances Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', background: '#ffffff' }}>
            <Skeleton width="120px" height="13px" style={{ marginBottom: '8px' }} />
            <Skeleton width="140px" height="26px" style={{ marginBottom: '10px' }} />
            <Skeleton width="100px" height="34px" borderRadius="8px" />
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', background: '#ffffff' }}>
            <Skeleton width="130px" height="13px" style={{ marginBottom: '8px' }} />
            <Skeleton width="140px" height="26px" style={{ marginBottom: '10px' }} />
            <Skeleton width="90px" height="13px" />
          </div>
        </div>

        {/* Payout History Table */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', background: '#ffffff' }}>
          <Skeleton width="160px" height="20px" style={{ marginBottom: '1rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <Skeleton width="120px" height="16px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="80px" height="12px" />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Skeleton width="90px" height="18px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="60px" height="16px" pill />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostFinancialsSkeleton;
