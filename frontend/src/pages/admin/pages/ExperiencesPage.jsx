import React from 'react';
import { TbClock, TbMapPin } from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';

export const ExperiencesPage = ({ experiences, onToggleActive }) => {
  const formatVND = (val) => `${(val || 0).toLocaleString('vi-VN')} ₫`;

  return (
    <div>
      {/* Header */}
      <AdminPageHeader
        title="Trải Nghiệm & Tour Du Lịch"
        subtitle={`Quản lý ${experiences.length} hoạt động tour khám phá văn hóa và ẩm thực`}
      />

      {/* Grid of Experiences */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {experiences.map((exp) => (
          <div key={exp.id} className="admin-card-box" style={{ overflow: 'hidden', marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <img
                src={exp.image}
                alt={exp.title_vi}
                style={{ width: '100%', height: '160px', objectFit: 'cover' }}
              />
              <span
                className={`status-pill ${exp.is_active ? 'active' : 'paused'}`}
                style={{ position: 'absolute', top: '10px', right: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                {exp.is_active ? 'ĐANG MỞ BÁN' : 'TẠM DỪNG'}
              </span>
            </div>

            <div style={{ padding: '1rem 1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.78rem', marginBottom: '4px' }}>
                <TbMapPin style={{ color: '#ff385c' }} />
                <span>{exp.city}</span>
                <span>•</span>
                <TbClock />
                <span>{exp.duration_hours} giờ</span>
              </div>

              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35, marginBottom: '4px' }}>
                {exp.title_vi}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                {exp.caption}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Giá vé / khách</div>
                  <strong style={{ color: '#ff385c', fontSize: '0.98rem' }}>{formatVND(exp.priceVND)}</strong>
                </div>

                <button
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    border: exp.is_active ? '1px solid #edf2f7' : '1px solid #bbf7d0',
                    background: exp.is_active ? '#f8fafc' : '#ecfdf5',
                    color: exp.is_active ? '#475569' : '#059669',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onClick={() => onToggleActive(exp.id)}
                >
                  {exp.is_active ? 'Tạm Ẩn' : 'Kích Hoạt'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperiencesPage;
