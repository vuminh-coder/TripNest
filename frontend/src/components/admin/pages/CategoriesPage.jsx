import React, { useState } from 'react';
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
    <div>
      {/* Header */}
      <AdminPageHeader
        title="Danh Mục & Tiện Nghi"
        subtitle="Thiết lập 14 danh mục lưu trú và bộ lọc tiện ích phòng nghỉ"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {/* Categories Section */}
        <div className="admin-card-box" style={{ marginBottom: 0 }}>
          <div className="admin-card-box-header">
            <h3 className="admin-card-box-title">14 Danh Mục Chỗ Ở</h3>
          </div>

          <div style={{ padding: '0.85rem 1.15rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {categories.map((c) => (
                <div
                  key={c.slug}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.85rem',
                    background: '#f8fafc',
                    borderRadius: '9px',
                    border: '1px solid #edf2f7',
                  }}
                >
                  <div style={{ whiteSpace: 'nowrap' }}>
                    <strong style={{ color: '#0f172a', fontSize: '0.86rem' }}>{c.label_vi}</strong>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: '6px' }}>({c.label_en})</span>
                  </div>

                  <button
                    style={{
                      padding: '3px 8px',
                      borderRadius: '999px',
                      border: c.is_active ? '1px solid #bbf7d0' : '1px solid #edf2f7',
                      background: c.is_active ? '#ecfdf5' : '#f1f5f9',
                      color: c.is_active ? '#059669' : '#64748b',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
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
        <div className="admin-card-box" style={{ marginBottom: 0 }}>
          <div className="admin-card-box-header">
            <h3 className="admin-card-box-title">Tiện Nghi Phòng & Chỗ Ở</h3>
          </div>

          <div style={{ padding: '1rem 1.15rem' }}>
            {/* Add Amenity Form */}
            <form onSubmit={handleAddAmenity} style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Tên tiện nghi mới..."
                value={newAmenityName}
                onChange={(e) => setNewAmenityName(e.target.value)}
                style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #edf2f7', fontSize: '0.82rem', outline: 'none' }}
              />
              <select
                value={newAmenityCat}
                onChange={(e) => setNewAmenityCat(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #edf2f7', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
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
                    padding: '0.35rem 0.7rem',
                    borderRadius: '8px',
                    background: a.category === 'luxury' ? '#fffbeb' : a.category === 'standout' ? '#f0f9ff' : '#f8fafc',
                    border: '1px solid #edf2f7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: a.category === 'luxury' ? '#b45309' : '#0f172a',
                    whiteSpace: 'nowrap',
                  }}
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
