import React from 'react';
import './ExperiencesPage.css';
import { TbClock, TbMapPin } from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';

export const ExperiencesPage = ({ experiences, onToggleActive }) => {
  const formatVND = (val) => `${(val || 0).toLocaleString('vi-VN')} ₫`;

  return (
    <div className="adm-experiences-container">
      {/* Header */}
      <AdminPageHeader
        title="Trải Nghiệm & Tour Du Lịch"
        subtitle={`Quản lý ${experiences.length} hoạt động tour khám phá văn hóa và ẩm thực`}
      />

      {/* Grid of Experiences */}
      <div className="adm-exp-grid">
        {experiences.map((exp) => (
          <div key={exp.id} className="admin-card-box adm-exp-card">
            <div className="adm-exp-media">
              <img
                src={exp.image || exp.image_url || exp.background || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'}
                alt={exp.title_vi || exp.title}
                className="adm-exp-img"
              />
              <span
                className={`status-pill ${exp.is_active ? 'active' : 'paused'} adm-exp-status-pill`}
              >
                {exp.is_active ? 'ĐANG MỞ BÁN' : 'TẠM DỪNG'}
              </span>
            </div>

            <div className="adm-exp-content">
              <div className="adm-exp-meta-row">
                <TbMapPin className="adm-exp-pin-icon" />
                <span>{exp.city}</span>
                <span>•</span>
                <TbClock />
                <span>{exp.duration_hours || exp.duration || 3} giờ</span>
              </div>

              <h3 className="adm-exp-title">
                {exp.title_vi || exp.title}
              </h3>
              <p className="adm-exp-caption">
                {exp.caption || exp.description}
              </p>

              <div className="adm-exp-footer-row">
                <div>
                  <div className="adm-exp-price-label">Giá vé / khách</div>
                  <strong className="adm-exp-price-val">
                    {formatVND(exp.priceVND || exp.price || exp.rentVND || exp.price_per_person)}
                  </strong>
                </div>

                <button
                  className={`adm-exp-toggle-btn ${exp.is_active ? 'active' : 'paused'}`}
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
