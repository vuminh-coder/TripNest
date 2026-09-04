import React from 'react';
import { Skeleton, SkeletonText } from '../Skeleton';

export const RoomDetailSkeleton = () => {
  return (
    <div className="sk-detail-container">
      {/* 1. Header Section */}
      <div style={{ marginBottom: '1.2rem' }}>
        <Skeleton width="100px" height="20px" style={{ marginBottom: '12px' }} />
        <Skeleton width="70%" height="32px" style={{ marginBottom: '10px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <Skeleton width="90px" height="16px" />
            <Skeleton width="160px" height="16px" />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Skeleton width="85px" height="34px" pill />
            <Skeleton width="85px" height="34px" pill />
          </div>
        </div>
      </div>

      {/* 2. Photo Collage */}
      <div className="sk-mosaic-gallery">
        <div className="sk-mosaic-main">
          <Skeleton width="100%" height="100%" borderRadius="0" />
        </div>
        <Skeleton width="100%" height="100%" borderRadius="0" />
        <Skeleton width="100%" height="100%" borderRadius="0" />
        <Skeleton width="100%" height="100%" borderRadius="0" />
        <Skeleton width="100%" height="100%" borderRadius="0" />
      </div>

      {/* 3. Main 2-Column Section */}
      <div className="sk-detail-layout">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Room Specs & Host */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '70%' }}>
              <Skeleton width="75%" height="22px" style={{ marginBottom: '8px' }} />
              <Skeleton width="50%" height="14px" />
            </div>
            <Skeleton circle height="54px" />
          </div>

          {/* Highlights Icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Skeleton circle height="24px" />
                <div style={{ width: '80%' }}>
                  <Skeleton width="35%" height="16px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="65%" height="13px" />
                </div>
              </div>
            ))}
          </div>

          {/* Room Description */}
          <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <Skeleton width="160px" height="20px" style={{ marginBottom: '12px' }} />
            <SkeletonText lines={4} gap={10} lastLineWidth="75%" />
          </div>

          {/* Amenities Grid */}
          <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <Skeleton width="180px" height="20px" style={{ marginBottom: '1.2rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Skeleton width="22px" height="22px" borderRadius="4px" />
                  <Skeleton width="110px" height="14px" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Calculator */}
        <div className="sk-sticky-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
            <Skeleton width="130px" height="28px" />
            <Skeleton width="70px" height="16px" />
          </div>

          <Skeleton width="100%" height="80px" borderRadius="12px" style={{ marginBottom: '1rem' }} />
          <Skeleton width="100%" height="48px" borderRadius="12px" style={{ marginBottom: '1.5rem' }} />
          <Skeleton width="100%" height="48px" borderRadius="12px" style={{ marginBottom: '1.2rem' }} />

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

      {/* 4. Similar Rooms Grid Skeleton */}
      <div style={{ marginTop: '4rem', borderTop: '1px solid #f1f5f9', paddingTop: '3rem' }}>
        <Skeleton width="280px" height="26px" style={{ marginBottom: '1.8rem' }} />
        <div className="sk-rooms-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="sk-room-card">
              <Skeleton width="100%" height="220px" borderRadius="14px" />
              <Skeleton width="70%" height="16px" />
              <Skeleton width="40%" height="14px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailSkeleton;
