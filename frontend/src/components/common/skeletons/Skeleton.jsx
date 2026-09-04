import React from 'react';
import './Skeleton.css';

export const Skeleton = ({
  width = '100%',
  height = '16px',
  borderRadius = '6px',
  circle = false,
  pill = false,
  className = '',
  style = {},
}) => {
  const dynamicStyle = {
    width: circle ? height : width,
    height,
    borderRadius: circle ? '50%' : pill ? '9999px' : borderRadius,
    ...style,
  };

  return (
    <div
      className={`tripnest-skeleton ${circle ? 'sk-circle' : ''} ${pill ? 'sk-pill' : ''} ${className}`}
      style={dynamicStyle}
    />
  );
};

export const SkeletonText = ({ lines = 3, gap = 8, lastLineWidth = '65%' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, width: '100%' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height="14px"
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ height = '260px', borderRadius = '14px', className = '' }) => {
  return <Skeleton width="100%" height={height} borderRadius={borderRadius} className={className} />;
};

export default Skeleton;
