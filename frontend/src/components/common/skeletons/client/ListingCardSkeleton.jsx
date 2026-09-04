import React from 'react';
import { Skeleton } from '../Skeleton';

/**
 * Single Listing Card Skeleton matching ListingCard geometry 1:1
 */
export const ListingCardSkeleton = () => {
  return (
    <div className="listing-card" style={{ pointerEvents: 'none' }}>
      {/* Media Wrapper matching aspect-ratio: 1 / 0.95 */}
      <div className="listing-media-wrapper" style={{ position: 'relative' }}>
        <Skeleton width="100%" height="100%" borderRadius="14px" />
        {/* Heart button placeholder */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
        />
      </div>

      {/* Content Area matching ListingCard layout */}
      <div className="listing-card-content" style={{ marginTop: '0.45rem' }}>
        {/* Row 1: Title Skeleton */}
        <div className="listing-title-row" style={{ marginBottom: '0.35rem' }}>
          <Skeleton width="78%" height="17px" borderRadius="4px" />
        </div>

        {/* Row 2: Badges Row Skeleton (Rating Pill + Type Badge + Room Count Badge) */}
        <div className="listing-badges-row" style={{ display: 'flex', gap: '6px', marginBottom: '0.35rem' }}>
          <Skeleton width="58px" height="18px" borderRadius="6px" />
          <Skeleton width="82px" height="18px" borderRadius="6px" />
          <Skeleton width="72px" height="18px" borderRadius="6px" />
        </div>

        {/* Row 3: Distance Text Skeleton */}
        <div className="listing-distance-text" style={{ marginBottom: '0.3rem' }}>
          <Skeleton width="48%" height="13px" borderRadius="3px" />
        </div>

        {/* Row 4: Price Row Skeleton */}
        <div className="listing-price-row" style={{ marginTop: '0.25rem' }}>
          <Skeleton width="52%" height="19px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
};

/**
 * Grid of Listing Card Skeletons matching .listings-grid layout
 */
export const ListingGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="listings-grid">
      {Array.from({ length: count }).map((_, index) => (
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default ListingCardSkeleton;
