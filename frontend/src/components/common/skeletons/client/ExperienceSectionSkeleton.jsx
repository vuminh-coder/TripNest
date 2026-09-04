import React from 'react';
import { Skeleton } from '../Skeleton';

/**
 * Experience Section Skeleton matching ExperienceSection geometry 1:1
 */
export const ExperienceSectionSkeleton = () => {
  return (
    <div className="experiences-section-wrapper" style={{ pointerEvents: 'none' }}>
      {/* Section Headline Skeleton */}
      <div className="section-headline">
        <div>
          <div className="exp-section-title-box">
            <Skeleton circle height="24px" style={{ flexShrink: 0 }} />
            <Skeleton width="340px" height="26px" borderRadius="6px" />
          </div>
          <div style={{ marginTop: '6px' }}>
            <Skeleton width="460px" height="15px" borderRadius="4px" />
          </div>
        </div>

        {/* Slider Arrows Skeleton */}
        <div className="slider-arrows-group">
          <Skeleton circle height="34px" />
          <Skeleton circle height="34px" />
        </div>
      </div>

      {/* 4 Cards Slider Track Skeleton */}
      <div className="exp-slider-track">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="exp-card">
            {/* Image Box Skeleton */}
            <div className="exp-image-box" style={{ position: 'relative' }}>
              <Skeleton width="100%" height="100%" borderRadius="14px" />
              
              {/* Category Badge Placeholder */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  width: '96px',
                  height: '24px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(6px)',
                }}
              />

              {/* Heart Button Placeholder */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(15, 23, 42, 0.25)',
                  backdropFilter: 'blur(6px)',
                }}
              />
            </div>

            {/* Meta Row Skeleton: Rating (Left) + Location (Right) */}
            <div className="exp-meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', marginBottom: '3px' }}>
              <Skeleton width="72px" height="14px" borderRadius="4px" />
              <Skeleton width="86px" height="14px" borderRadius="4px" />
            </div>

            {/* Single Line Caption Skeleton */}
            <div style={{ margin: '0.3rem 0 0.2rem 0' }}>
              <Skeleton width={i % 2 === 0 ? '88%' : '76%'} height="16px" borderRadius="4px" />
            </div>

            {/* Price Row Skeleton */}
            <div style={{ marginTop: '0.25rem' }}>
              <Skeleton width="50%" height="18px" borderRadius="4px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceSectionSkeleton;
