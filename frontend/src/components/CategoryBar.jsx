import React, { useRef } from 'react';
import {
  TbHomeCheck,
  TbBeach,
  TbBuildingCastle,
  TbMountain,
  TbPool,
  TbHome2,
  TbFlame,
  TbTrees,
  TbSailboat,
  TbCampfire,
  TbSun,
  TbBuildingSkyscraper,
  TbCrown,
  TbCompass,
  TbAdjustmentsHorizontal,
  TbChevronLeft,
  TbChevronRight,
} from 'react-icons/tb';

const iconMap = {
  TbHomeCheck: <TbHomeCheck />,
  TbBeach: <TbBeach />,
  TbBuildingCastle: <TbBuildingCastle />,
  TbMountain: <TbMountain />,
  TbPool: <TbPool />,
  TbHome2: <TbHome2 />,
  TbFlame: <TbFlame />,
  TbTrees: <TbTrees />,
  TbSailboat: <TbSailboat />,
  TbCampfire: <TbCampfire />,
  TbSun: <TbSun />,
  TbBuildingSkyscraper: <TbBuildingSkyscraper />,
  TbCrown: <TbCrown />,
  TbCompass: <TbCompass />,
};

export const CategoryBar = ({
  categories,
  activeCategory,
  onSelectCategory,
  onOpenFilters,
  activeFilterCount = 0,
  showTotalBeforeTaxes,
  setShowTotalBeforeTaxes,
}) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="category-section">
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: 1, minWidth: 0 }}>
        {/* Left Scroll Arrow */}
        <button
          className="nav-arrow-btn"
          style={{ marginRight: '8px', flexShrink: 0 }}
          onClick={() => scroll('left')}
          title="Cuộn sang trái"
        >
          <TbChevronLeft />
        </button>

        {/* Categories Horizontal Scroll */}
        <div className="categories-scroll-wrapper" ref={scrollContainerRef}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <div className="category-icon">{iconMap[cat.icon] || <TbCompass />}</div>
              <span className="category-label">{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Right Scroll Arrow */}
        <button
          className="nav-arrow-btn"
          style={{ marginLeft: '8px', flexShrink: 0 }}
          onClick={() => scroll('right')}
          title="Cuộn sang phải"
        >
          <TbChevronRight />
        </button>
      </div>

      {/* Filter Controls & Taxes toggle */}
      <div className="filter-controls-group">
        <button className="filter-btn-outline" onClick={onOpenFilters}>
          <TbAdjustmentsHorizontal style={{ fontSize: '1.15rem' }} />
          <span>Bộ lọc</span>
          {activeFilterCount > 0 && (
            <span className="filter-badge-count">{activeFilterCount}</span>
          )}
        </button>

        <div className="tax-toggle-box">
          <span>Hiển thị tổng trước thuế</span>
          <label className="switch-control">
            <input
              type="checkbox"
              checked={showTotalBeforeTaxes}
              onChange={(e) => setShowTotalBeforeTaxes(e.target.checked)}
            />
            <span className="switch-slider" />
          </label>
        </div>
      </div>
    </div>
  );
};
export default CategoryBar;
