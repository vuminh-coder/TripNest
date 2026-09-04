import React from 'react';
import { Skeleton, SkeletonText } from '../Skeleton';

export const CheckoutSkeleton = () => {
  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '2rem 1.5rem 4rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Skeleton circle height="36px" />
        <Skeleton width="280px" height="28px" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '3rem', alignItems: 'start' }}>
        {/* Left Column: Form & Stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Trip Summary Box */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
            <Skeleton width="180px" height="22px" style={{ marginBottom: '1rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <Skeleton width="60px" height="12px" style={{ marginBottom: '4px' }} />
                <Skeleton width="120px" height="16px" />
              </div>
              <div>
                <Skeleton width="60px" height="12px" style={{ marginBottom: '4px' }} />
                <Skeleton width="100px" height="16px" />
              </div>
            </div>
          </div>

          {/* Guest Contact Form */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
            <Skeleton width="220px" height="22px" style={{ marginBottom: '1.2rem' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Skeleton width="100%" height="46px" borderRadius="10px" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Skeleton width="100%" height="46px" borderRadius="10px" />
                <Skeleton width="100%" height="46px" borderRadius="10px" />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
            <Skeleton width="200px" height="22px" style={{ marginBottom: '1.2rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <Skeleton width="100%" height="70px" borderRadius="12px" />
              <Skeleton width="100%" height="70px" borderRadius="12px" />
              <Skeleton width="100%" height="70px" borderRadius="12px" />
            </div>
          </div>

          {/* Submit Button */}
          <Skeleton width="100%" height="52px" borderRadius="14px" />
        </div>

        {/* Right Column: Booking Summary Card */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <Skeleton width="90px" height="90px" borderRadius="14px" />
            <div style={{ flex: 1 }}>
              <Skeleton width="85%" height="18px" style={{ marginBottom: '6px' }} />
              <Skeleton width="60%" height="14px" style={{ marginBottom: '6px' }} />
              <Skeleton width="40%" height="12px" />
            </div>
          </div>

          {/* Voucher Box */}
          <div style={{ padding: '1.2rem 0', borderBottom: '1px solid #f1f5f9' }}>
            <Skeleton width="100%" height="44px" borderRadius="10px" />
          </div>

          {/* Price Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width="130px" height="14px" />
              <Skeleton width="80px" height="14px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width="90px" height="14px" />
              <Skeleton width="70px" height="14px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9', marginTop: '6px' }}>
              <Skeleton width="100px" height="20px" />
              <Skeleton width="110px" height="20px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSkeleton;
