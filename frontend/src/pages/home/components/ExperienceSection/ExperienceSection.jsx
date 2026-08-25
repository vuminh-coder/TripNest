import './ExperienceSection.css';
import React, { useRef } from 'react';
import { TbChevronLeft, TbChevronRight, TbStarFilled, TbTicket } from 'react-icons/tb';

export const ExperienceSection = ({ experiences = [], currency = 'VND', onSelectExperience }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formatPrice = (rentUSD, rentVND) => {
    if (currency === 'USD') return `$${rentUSD || Math.round((rentVND || 0) / 25450)}`;
    if (currency === 'EUR') return `€${Math.round((rentUSD || (rentVND || 0) / 25450) * 0.92)}`;
    return `${(rentVND || (rentUSD || 0) * 25450).toLocaleString()} ₫`;
  };

  return (
    <div style={{ marginTop: '3.5rem', marginBottom: '2.5rem' }}>
      <div className="section-headline">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <TbTicket style={{ color: '#ff385c', fontSize: '1.4rem' }} />
            <h2 className="section-title">Trải nghiệm du lịch & Hoạt động cuối tuần</h2>
          </div>
          <p style={{ color: '#717171', fontSize: '0.92rem' }}>
            Tham gia các tour nghệ thuật, lớp học ẩm thực và khám phá văn hóa cùng các chuyên gia địa phương.
          </p>
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

      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '1.25rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          scrollBehavior: 'smooth',
          paddingBottom: '0.5rem',
        }}
      >
        {experiences.map((exp) => (
          <div
            key={exp.id}
            style={{
              flex: '0 0 230px',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
            }}
            onClick={() => onSelectExperience && onSelectExperience(exp)}
          >
            <div
              style={{
                width: '100%',
                height: '290px',
                borderRadius: '14px',
                backgroundImage: `url(${exp.background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginBottom: '0.75rem',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                transition: 'transform 0.25s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                Trải nghiệm
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
              <TbStarFilled style={{ fontSize: '0.8rem', color: '#222' }} />
              <span style={{ fontWeight: 600 }}>{exp.rating}</span>
              <span style={{ color: '#717171' }}>· {exp.city}</span>
            </div>

            <h4
              style={{
                fontSize: '0.92rem',
                fontWeight: 600,
                color: '#222',
                marginTop: '4px',
                lineHeight: 1.3,
              }}
            >
              {exp.caption}
            </h4>

            <div style={{ marginTop: '4px', fontSize: '0.92rem' }}>
              <span style={{ fontWeight: 700 }}>Từ {formatPrice(exp.rentUSD, exp.rentVND)}</span>
              <span style={{ color: '#717171', fontSize: '0.82rem' }}> / người</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ExperienceSection;
