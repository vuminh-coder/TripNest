import './SpotlightBanner.css';
import React, { useRef } from 'react';
import { TbChevronLeft, TbChevronRight, TbSparkles } from 'react-icons/tb';

import popular from '@/assets/popular.webp';
import team from '@/assets/team.webp';
import family from '@/assets/family.webp';
import sa from '@/assets/sa.webp';

export const SpotlightBanner = ({ onSelectCategory }) => {
  const sliderRef = useRef(null);

  const collections = [
    {
      id: 1,
      tag: 'Bộ sưu tập độc quyền',
      title: 'Top địa điểm được yêu thích nhất toàn cầu',
      image: popular,
      category: 'trending',
    },
    {
      id: 2,
      tag: 'Gắn kết đội nhóm',
      title: 'Biệt thự nghỉ dưỡng cho công ty & hội nhóm',
      image: team,
      category: 'mansions',
    },
    {
      id: 3,
      tag: 'Gia đình & Trẻ nhỏ',
      title: 'Kỳ nghỉ ấm cúng tràn ngập niềm vui gia đình',
      image: family,
      category: 'views',
    },
    {
      id: 4,
      tag: 'Khám phá biển đảo',
      title: 'Trải nghiệm du thuyền & biệt thự ven biển',
      image: sa,
      category: 'beachfront',
    },
  ];

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -440 : 440;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="spotlight-section">
      <div className="section-headline">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TbSparkles style={{ color: '#ff385c', fontSize: '1.4rem' }} />
          <h2 className="section-title">Nổi bật tuần này trên TripNest</h2>
        </div>
        <div className="slider-arrows-group">
          <button className="nav-arrow-btn" onClick={() => scroll('left')} title="Trước">
            <TbChevronLeft />
          </button>
          <button className="nav-arrow-btn" onClick={() => scroll('right')} title="Tiếp">
            <TbChevronRight />
          </button>
        </div>
      </div>

      <div className="spotlight-carousel" ref={sliderRef}>
        {collections.map((item) => (
          <div
            key={item.id}
            className="spotlight-card"
            onClick={() => onSelectCategory && onSelectCategory(item.category)}
          >
            <img src={item.image} alt={item.title} className="spotlight-card-bg" />
            <div className="spotlight-card-overlay" />
            <div className="spotlight-card-content">
              <div>
                <span className="spotlight-badge">{item.tag}</span>
                <h3 className="spotlight-card-title">{item.title}</h3>
              </div>
              <button className="spotlight-action-pill">
                Khám phá ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SpotlightBanner;
