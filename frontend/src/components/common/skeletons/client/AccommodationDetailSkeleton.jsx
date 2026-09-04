import React from 'react';
import { Skeleton, SkeletonText } from '../Skeleton';

export const AccommodationDetailSkeleton = () => {
  return (
    <div className="sk-detail-container">
      {/* 1. Header Section */}
      <div style={{ marginBottom: '1rem' }}>
        <Skeleton width="60%" height="32px" style={{ marginBottom: '10px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Skeleton width="100px" height="16px" />
            <Skeleton width="140px" height="16px" />
            <Skeleton width="180px" height="16px" />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Skeleton width="90px" height="36px" pill />
            <Skeleton width="90px" height="36px" pill />
          </div>
        </div>
      </div>

      {/* 2. Mosaic Gallery (5 Images) */}
      <div className="sk-mosaic-gallery">
        <div className="sk-mosaic-main">
          <Skeleton width="100%" height="100%" borderRadius="0" />
        </div>
        <Skeleton width="100%" height="100%" borderRadius="0" />
        <Skeleton width="100%" height="100%" borderRadius="0" />
        <Skeleton width="100%" height="100%" borderRadius="0" />
        <Skeleton width="100%" height="100%" borderRadius="0" />
      </div>

      {/* 3. Main 2-Column Layout */}
      <div className="sk-detail-layout">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Host Card Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '70%' }}>
              <Skeleton width="80%" height="22px" style={{ marginBottom: '8px' }} />
              <Skeleton width="50%" height="14px" />
            </div>
            <Skeleton circle height="56px" />
          </div>

          {/* Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Skeleton circle height="24px" />
                <div style={{ width: '80%' }}>
                  <Skeleton width="40%" height="16px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="70%" height="12px" />
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <Skeleton width="180px" height="22px" style={{ marginBottom: '12px' }} />
            <SkeletonText lines={4} gap={10} lastLineWidth="80%" />
          </div>

          {/* Amenities Grid */}
          <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <Skeleton width="200px" height="22px" style={{ marginBottom: '1.2rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Skeleton width="20px" height="20px" borderRadius="4px" />
                  <Skeleton width="120px" height="14px" />
                </div>
              ))}
            </div>
          </div>

          {/* Rooms Matrix Table */}
          <div>
            <Skeleton width="240px" height="24px" style={{ marginBottom: '1.2rem' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ border: '1px solid #f1f5f9', borderRadius: '14px', padding: '1.2rem', display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                  <Skeleton width="120px" height="90px" borderRadius="10px" />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="60%" height="18px" style={{ marginBottom: '6px' }} />
                    <Skeleton width="40%" height="14px" style={{ marginBottom: '10px' }} />
                    <Skeleton width="30%" height="20px" />
                  </div>
                  <Skeleton width="100px" height="40px" borderRadius="8px" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Box */}
        <div className="sk-sticky-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
            <Skeleton width="120px" height="28px" />
            <Skeleton width="80px" height="16px" />
          </div>

          {/* Date Picker Input Box */}
          <Skeleton width="100%" height="80px" borderRadius="12px" style={{ marginBottom: '1rem' }} />

          {/* Guests Picker */}
          <Skeleton width="100%" height="50px" borderRadius="12px" style={{ marginBottom: '1.5rem' }} />

          {/* CTA Button */}
          <Skeleton width="100%" height="48px" borderRadius="12px" style={{ marginBottom: '1.2rem' }} />

          {/* Price Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width="120px" height="14px" />
              <Skeleton width="70px" height="14px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width="100px" height="14px" />
              <Skeleton width="60px" height="14px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
              <Skeleton width="80px" height="18px" />
              <Skeleton width="90px" height="18px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationDetailSkeleton;
