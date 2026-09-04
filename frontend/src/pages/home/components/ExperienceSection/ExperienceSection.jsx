import "./ExperienceSection.css";
import React, { useRef, useState } from "react";
import {
  TbChevronLeft,
  TbChevronRight,
  TbStarFilled,
  TbTicket,
  TbHeart,
  TbHeartFilled,
  TbMapPin,
} from "react-icons/tb";

export const ExperienceSection = ({
  experiences = [],
  currency = "VND",
  onSelectExperience,
}) => {
  const scrollRef = useRef(null);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const card = scrollRef.current.querySelector('.exp-card');
      const cardW = card ? card.offsetWidth + 24 : 310;
      const scrollAmount = direction === "left" ? -cardW : cardW;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleToggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const formatPrice = (rentUSD, rentVND) => {
    if (currency === "USD")
      return `$${(rentUSD || Math.round((rentVND || 0) / 25450)).toLocaleString()}`;
    if (currency === "EUR")
      return `€${Math.round((rentUSD || (rentVND || 0) / 25450) * 0.92).toLocaleString()}`;
    const val = rentVND || (rentUSD || 0) * 25450;
    return `${val.toLocaleString()} đ`;
  };

  return (
    <div className="experiences-section-wrapper">
      <div className="section-headline">
        <div>
          <div className="exp-section-title-box">
            <TbTicket className="exp-section-icon" />
            <h2 className="section-title">
              Trải nghiệm du lịch & Hoạt động cuối tuần
            </h2>
          </div>
          <p className="exp-section-subtitle">
            Tham gia các tour nghệ thuật, lớp học ẩm thực và khám phá văn hóa
            cùng các chuyên gia địa phương.
          </p>
        </div>

        <div className="slider-arrows-group">
          <button
            className="nav-arrow-btn"
            onClick={() => scroll("left")}
            title="Trước"
            aria-label="Cuộn sang trái"
          >
            <TbChevronLeft />
          </button>
          <button
            className="nav-arrow-btn"
            onClick={() => scroll("right")}
            title="Tiếp"
            aria-label="Cuộn sang phải"
          >
            <TbChevronRight />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="exp-slider-track">
        {experiences.map((exp) => {
          // Parse rating score and review count
          const ratingParts = (exp.rating || "5.0 (100)").split(" ");
          const score = ratingParts[0] || "5.0";
          const reviewCount = ratingParts[1] || "";
          const isFav = favoriteIds.includes(exp.id);

          return (
            <div
              key={exp.id}
              className="exp-card"
              onClick={() => onSelectExperience && onSelectExperience(exp)}
            >
              <div
                className="exp-image-box"
                style={{ backgroundImage: `url(${exp.background})` }}
              >
                {/* Frosted Category Badge */}
                <span className="exp-category-badge">
                  <TbTicket style={{ fontSize: "0.85rem" }} />
                  <span>Trải nghiệm</span>
                </span>

                {/* Favorite Heart Button */}
                <button
                  className={`exp-heart-btn ${isFav ? "active" : ""}`}
                  onClick={(e) => handleToggleFavorite(e, exp.id)}
                  title={isFav ? "Bỏ lưu" : "Lưu trải nghiệm"}
                  aria-label="Lưu trải nghiệm"
                >
                  {isFav ? <TbHeartFilled /> : <TbHeart />}
                </button>
              </div>

              {/* Meta Row: Rating (Left) + Location (Right) */}
              <div className="exp-meta-row">
                <div className="exp-rating-wrap">
                  <TbStarFilled className="exp-star-icon" />
                  <span className="exp-rating-val">{score}</span>
                  {reviewCount && (
                    <span className="exp-review-val">{reviewCount}</span>
                  )}
                </div>
                <div className="exp-city-name" title={exp.city}>
                  <TbMapPin className="exp-pin-icon" />
                  <span>{exp.city}</span>
                </div>
              </div>

              {/* Caption (Single Line) */}
              <h4 className="exp-caption-title" title={exp.caption}>
                {exp.caption}
              </h4>

              {/* Price */}
              <div className="exp-price-row">
                <span className="exp-price-from">Từ</span>
                <span className="exp-price-number">
                  {formatPrice(exp.rentUSD, exp.rentVND)}
                </span>
                <span className="exp-price-unit">/ người</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ExperienceSection;
