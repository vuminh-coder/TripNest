import React, { useState } from 'react';
import './AccommodationEditModal.css';
import { TbX, TbBuildingCastle, TbPhoto, TbCheck } from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';

export const AccommodationEditModal = ({ accommodation, onClose, onSave }) => {
  const toast = useToast();
  const [formData, setFormData] = useState(
    accommodation || {
      name_vi: '',
      name_en: '',
      host_name: 'Minh Hoàng',
      category: 'views',
      category_name: 'Tầm nhìn tuyệt đẹp',
      type: 'villa',
      city: 'Đà Lạt',
      address: '',
      priceVND: 2500000,
      priceUSD: 100,
      image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80',
      specs: { guests: 4, bedrooms: 2, beds: 2, bathrooms: 2 },
      amenities: ['Wifi tốc độ cao', 'Hồ bơi nước ấm', 'Bếp nướng BBQ'],
      is_featured: false,
      is_guest_favorite: false,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name_vi.trim()) {
      toast.warning('Thiếu tên chỗ ở', 'Vui lòng nhập tên chỗ ở.');
      return;
    }
    onSave(formData);
    toast.success('Lưu chỗ ở', 'Đã lưu thông tin chỗ ở thành công.');
    onClose();
  };

  return (
    <div className="modal-overlay adm-accedit-overlay" onClick={onClose}>
      <div
        className="modal-container adm-accedit-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adm-accedit-header">
          <div className="adm-accedit-header-left">
            <div className="adm-accedit-icon-wrap">
              <TbBuildingCastle />
            </div>
            <h2 className="adm-accedit-title">
              {accommodation ? 'Chỉnh Sửa Chỗ Ở & Phòng' : 'Thêm Cơ Sở Lưu Trú Mới'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <TbX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="adm-accedit-form">
          <div className="adm-accedit-2col">
            <div>
              <label className="adm-accedit-label">
                Tên chỗ ở (Tiếng Việt) *
              </label>
              <input
                type="text"
                required
                value={formData.name_vi}
                onChange={(e) => setFormData({ ...formData, name_vi: e.target.value })}
                className="adm-accedit-input"
                placeholder="VD: Biệt Thự Rừng Thông Đà Lạt"
              />
            </div>

            <div>
              <label className="adm-accedit-label">
                Tên chỗ ở (Tiếng Anh)
              </label>
              <input
                type="text"
                value={formData.name_en || ''}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="adm-accedit-input"
                placeholder="VD: Pine Forest Cloud Villa"
              />
            </div>
          </div>

          <div className="adm-accedit-3col">
            <div>
              <label className="adm-accedit-label">
                Tỉnh / Thành phố
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="adm-accedit-input"
              >
                <option value="Đà Lạt">Đà Lạt</option>
                <option value="Phú Quốc">Phú Quốc</option>
                <option value="Hạ Long">Hạ Long</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Sapa">Sapa</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Nha Trang">Nha Trang</option>
              </select>
            </div>

            <div>
              <label className="adm-accedit-label">
                Loại hình
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="adm-accedit-input"
              >
                <option value="villa">Biệt Thự (Villa)</option>
                <option value="apartment">Căn Hộ (Apartment)</option>
                <option value="hotel">Khách Sạn (Hotel)</option>
                <option value="resort">Khu Nghỉ Dưỡng (Resort)</option>
                <option value="homestay">Homestay</option>
              </select>
            </div>

            <div>
              <label className="adm-accedit-label">
                Danh mục phong cách
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="adm-accedit-input"
              >
                <option value="views">Tầm nhìn tuyệt đẹp</option>
                <option value="beach">Bãi biển</option>
                <option value="luxury">Sang trọng</option>
                <option value="pool">Hồ bơi tuyệt đẹp</option>
                <option value="countryside">Miền quê</option>
                <option value="mansions">Dinh thự</option>
              </select>
            </div>
          </div>

          <div className="adm-accedit-2col">
            <div>
              <label className="adm-accedit-label">
                Giá một đêm (VND) *
              </label>
              <input
                type="number"
                required
                value={formData.priceVND}
                onChange={(e) => setFormData({ ...formData, priceVND: Number(e.target.value) })}
                className="adm-accedit-input"
              />
            </div>

            <div>
              <label className="adm-accedit-label">
                Địa chỉ chi tiết
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="adm-accedit-input"
                placeholder="VD: 12 Hoàng Hoa Thám, Phường 10"
              />
            </div>
          </div>

          <div className="adm-accedit-4col">
            <div>
              <label className="adm-accedit-label">Khách tối đa</label>
              <input
                type="number"
                value={formData.specs?.guests || 4}
                onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, guests: Number(e.target.value) } })}
                className="adm-accedit-input"
              />
            </div>
            <div>
              <label className="adm-accedit-label">Phòng ngủ</label>
              <input
                type="number"
                value={formData.specs?.bedrooms || 2}
                onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, bedrooms: Number(e.target.value) } })}
                className="adm-accedit-input"
              />
            </div>
            <div>
              <label className="adm-accedit-label">Giường ngủ</label>
              <input
                type="number"
                value={formData.specs?.beds || 2}
                onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, beds: Number(e.target.value) } })}
                className="adm-accedit-input"
              />
            </div>
            <div>
              <label className="adm-accedit-label">Phòng tắm</label>
              <input
                type="number"
                value={formData.specs?.bathrooms || 2}
                onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, bathrooms: Number(e.target.value) } })}
                className="adm-accedit-input"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="adm-accedit-label">
              URL Hình ảnh đại diện
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="adm-accedit-input"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          <div className="adm-accedit-footer">
            <button type="button" className="btn-admin-secondary" onClick={onClose}>
              Hủy Bỏ
            </button>
            <button type="submit" className="btn-admin-primary">
              <TbCheck />
              <span>Lưu Cơ Sở Lưu Trú</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccommodationEditModal;
