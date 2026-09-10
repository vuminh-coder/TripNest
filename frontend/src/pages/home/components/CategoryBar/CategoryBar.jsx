import './CategoryBar.css';
import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  categories = [],
  activeCategory = 'all',
  onSelectCategory = () => {},
  onOpenFilters = () => {},
  activeFilterCount = 0,
  showTotalBeforeTaxes = false,
  setShowTotalBeforeTaxes = () => {},
}) => {
  const scrollContainerRef = useRef(null);
  const activeTabRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Mouse Drag to Scroll State
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [dragMoved, setDragMoved] = useState(false);

  // Update arrow visibility based on scroll position
  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollability();

    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);

    const observer = new ResizeObserver(() => checkScrollability());
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
      observer.disconnect();
    };
  }, [checkScrollability, categories]);

  // Scroll active tab into view when activeCategory changes
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeCategory]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Mouse Drag to Scroll Handlers
  const handleMouseDown = (e) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
    setDragMoved(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) {
      setDragMoved(true);
    }
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="category-section">
      <div className="category-scroll-container">
        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <div className="category-nav-arrow-wrapper left">
            <button
              type="button"
              className="nav-arrow-btn"
              onClick={() => handleScroll('left')}
              title="Cuộn sang trái"
            >
              <TbChevronLeft />
            </button>
          </div>
        )}

        {/* Categories Horizontal Scroll */}
        <div
          className={`categories-scroll-wrapper ${isDragging ? 'is-dragging' : ''}`}
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                ref={isActive ? activeTabRef : null}
                className={`category-tab ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (!dragMoved) {
                    onSelectCategory(cat.id);
                  }
                }}
                title={cat.label}
              >
                <div className="category-icon">{iconMap[cat.icon] || <TbCompass />}</div>
                <span className="category-label">{cat.label}</span>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <div className="category-nav-arrow-wrapper right">
            <button
              type="button"
              className="nav-arrow-btn"
              onClick={() => handleScroll('right')}
              title="Cuộn sang phải"
            >
              <TbChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Filter Controls & Taxes toggle */}
      <div className="filter-controls-group">
        <button
          type="button"
          className="filter-btn-outline"
          onClick={onOpenFilters}
          title="Mở bộ lọc nâng cao"
        >
          <TbAdjustmentsHorizontal style={{ fontSize: '1.15rem' }} />
          <span>Bộ lọc</span>
          {activeFilterCount > 0 && (
            <span className="filter-badge-count">{activeFilterCount}</span>
          )}
        </button>

        <div className="tax-toggle-box" title="Bật để xem tổng tiền lưu trú trước thuế">
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
