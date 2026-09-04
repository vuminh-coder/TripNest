import React, { useState } from 'react';
import './CategoriesPage.css';
import { TbPlus, TbSparkles } from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';

export const CategoriesPage = ({
  categories,
  amenities,
  onToggleCategory,
  onAddAmenity,
}) => {
  const [newAmenityName, setNewAmenityName] = useState('');
  const [newAmenityCat, setNewAmenityCat] = useState('basic');

  const handleAddAmenity = (e) => {
    e.preventDefault();
    if (!newAmenityName.trim()) return;
    onAddAmenity({
      code: 'custom_' + Date.now(),
      name_vi: newAmenityName.trim(),
      category: newAmenityCat,
      icon: 'TbSparkles',
    });
    setNewAmenityName('');
  };

  return (
    <div className="adm-categories-container">
      {/* Header */}
      <AdminPageHeader
        title="Danh Mục & Tiện Nghi"
        subtitle="Thiết lập 14 danh mục lưu trú và bộ lọc tiện ích phòng nghỉ"
      />

      <div className="adm-cat-grid-layout">
        {/* Categories Section */}
        <div className="admin-card-box adm-cat-box">
          <div className="admin-card-box-header">
            <h3 className="admin-card-box-title">14 Danh Mục Chỗ Ở</h3>
          </div>

          <div className="adm-cat-list">
            <div className="adm-cat-items-col">
              {categories.map((c) => (
                <div key={c.slug} className="adm-cat-item-row">
                  <div className="adm-cat-label-wrap">
                    <strong className="adm-cat-label-vi">
                      {c.label_vi || c.label || c.labelVi}
                    </strong>
                    <span className="adm-cat-label-en">
                      ({c.label_en || c.labelEn || c.slug})
                    </span>
                  </div>

                  <button
                    className={`adm-cat-toggle-btn ${c.is_active ? 'active' : 'inactive'}`}
                    onClick={() => onToggleCategory(c.slug)}
                  >
                    {c.is_active ? 'Hiển thị' : 'Tạm ẩn'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Amenities Section */}
        <div className="admin-card-box adm-cat-box">
          <div className="admin-card-box-header">
            <h3 className="admin-card-box-title">Tiện Nghi Phòng & Chỗ Ở</h3>
          </div>

          <div style={{ padding: '1rem 1.15rem' }}>
            {/* Add Amenity Form */}
            <form onSubmit={handleAddAmenity} className="adm-amenity-form">
              <input
                type="text"
                placeholder="Tên tiện nghi mới..."
                value={newAmenityName}
                onChange={(e) => setNewAmenityName(e.target.value)}
                className="adm-amenity-input"
              />
              <select
                value={newAmenityCat}
                onChange={(e) => setNewAmenityCat(e.target.value)}
                className="adm-amenity-select"
              >
                <option value="basic">Cơ bản</option>
                <option value="standout">Nổi bật</option>
                <option value="luxury">Cao cấp</option>
              </select>
              <button type="submit" className="btn-admin-primary adm-amenity-btn-submit">
                <TbPlus />
              </button>
            </form>

            <div className="adm-amenity-chips-wrap">
              {amenities.map((a) => (
                <div
                  key={a.code}
                  className={`adm-amenity-chip ${a.category || 'basic'}`}
                >
                  <TbSparkles style={{ fontSize: '0.88rem' }} />
                  <span>{a.name_vi}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
