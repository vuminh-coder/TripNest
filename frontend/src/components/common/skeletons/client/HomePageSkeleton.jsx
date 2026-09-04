import React from 'react';
import { ListingGridSkeleton } from './ListingCardSkeleton';
import { ExperienceSectionSkeleton } from './ExperienceSectionSkeleton';

export const HomePageSkeleton = () => {
  return (
    <div className="home-skeleton-wrapper" style={{ width: '100%' }}>
      {/* 1. Accommodations Grid Skeleton (8 Cards matching .listings-grid 1:1) */}
      <ListingGridSkeleton count={8} />

      {/* 2. Experience Section Skeleton (4 Cards matching .exp-slider-track 1:1) */}
      <ExperienceSectionSkeleton />
    </div>
  );
};

export default HomePageSkeleton;
