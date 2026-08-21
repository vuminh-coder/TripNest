import React, { useState } from 'react';
import {
  TbCategory,
  TbPlus,
  TbSparkles,
} from 'react-icons/tb';

export const CategoriesAmenitiesTab = ({
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
    <div>
      {/* Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>Danh Mục & Tiện Nghi</h1>
          <p>Thiết lập danh mục lưu trú và bộ lọc tiện ích</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Categories Section */}
        <div className="admin-card-box">
          <div className="admin-card-box-header">
            <h3 className="admin-card-box-title">14 Danh Mục Chỗ Ở</h3>
          </div>

          <div style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categories.map((c) => (
                <div
                  key={c.slug}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #edf2f7',
                  }}
                >
                  <div>
                    <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>{c.label_vi}</strong>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: '6px' }}>({c.label_en})</span>
                  </div>

                  <button
                    style={{
                      padding: '3px 8px',
                      borderRadius: '999px',
                      border: c.is_active ? '1px solid #bbf7d0' : '1px solid #edf2f7',
                      background: c.is_active ? '#ecfdf5' : '#f1f5f9',
                      color: c.is_active ? '#059669' : '#64748b',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
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
        <div className="admin-card-box">
          <div className="admin-card-box-header">
            <h3 className="admin-card-box-title">Tiện Nghi Phòng & Chỗ Ở</h3>
          </div>

          <div style={{ padding: '1rem 1.25rem' }}>
            {/* Add Amenity Form */}
            <form onSubmit={handleAddAmenity} style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Tên tiện nghi mới..."
                value={newAmenityName}
                onChange={(e) => setNewAmenityName(e.target.value)}
                style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #edf2f7', fontSize: '0.82rem' }}
              />
              <select
                value={newAmenityCat}
                onChange={(e) => setNewAmenityCat(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #edf2f7', fontSize: '0.82rem', fontWeight: 600 }}
              >
                <option value="basic">Cơ bản</option>
                <option value="standout">Nổi bật</option>
                <option value="luxury">Cao cấp</option>
              </select>
              <button type="submit" className="btn-admin-primary" style={{ padding: '0.45rem 0.85rem' }}>
                <TbPlus />
              </button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {amenities.map((a) => (
                <div
                  key={a.code}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    background: a.category === 'luxury' ? '#fffbeb' : a.category === 'standout' ? '#f0f9ff' : '#f8fafc',
                    border: '1px solid #edf2f7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: a.category === 'luxury' ? '#b45309' : '#0f172a',
                  }}
                >
                  <TbSparkles style={{ fontSize: '0.9rem' }} />
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
export default CategoriesAmenitiesTab;
