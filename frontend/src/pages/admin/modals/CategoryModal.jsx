import React, { useState, useEffect } from 'react';
import {
  TbX,
  TbFolder,
  TbSparkles,
  TbCheck,
  TbHome,
  TbBuildingSkyscraper,
  TbBeach,
  TbMountain,
  TbCampfire,
  TbSailboat,
  TbTree,
  TbBuildingCottage,
  TbFlame,
  TbCoffee,
  TbSun,
  TbBuilding,
  TbCompass,
  TbCrown,
} from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import './CategoryModal.css';

const ICON_PRESETS = [
  { name: 'TbHome', icon: TbHome, label: 'Nhà' },
  { name: 'TbBuildingCottage', icon: TbBuildingCottage, label: 'Biệt thự' },
  { name: 'TbBuildingSkyscraper', icon: TbBuildingSkyscraper, label: 'Căn hộ' },
  { name: 'TbBeach', icon: TbBeach, label: 'Bãi biển' },
  { name: 'TbMountain', icon: TbMountain, label: 'Núi non' },
  { name: 'TbCampfire', icon: TbCampfire, label: 'Cắm trại' },
  { name: 'TbSailboat', icon: TbSailboat, label: 'Thuyền / Hồ' },
  { name: 'TbTree', icon: TbTree, label: 'Nhiệt đới' },
  { name: 'TbFlame', icon: TbFlame, label: 'Thịnh hành' },
  { name: 'TbCoffee', icon: TbCoffee, label: 'Nghỉ dưỡng' },
  { name: 'TbSun', icon: TbSun, label: 'Mùa hè' },
  { name: 'TbCrown', icon: TbCrown, label: 'Cao cấp' },
];

export const CategoryModal = ({
  isOpen,
  onClose,
  onSave,
  category = null,
}) => {
  const toast = useToast();
  const isEdit = Boolean(category && (category.id || category.slug));

  const [formData, setFormData] = useState({
    label_vi: '',
    label_en: '',
    slug: '',
    icon: 'TbHome',
    description: '',
    display_order: 0,
    is_active: true,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        label_vi: category.label_vi || category.label || '',
        label_en: category.label_en || category.labelEn || '',
        slug: category.slug || '',
        icon: category.icon || 'TbHome',
        description: category.description || '',
        display_order: category.display_order ?? 0,
        is_active: category.is_active ?? true,
      });
    } else {
      setFormData({
        label_vi: '',
        label_en: '',
        slug: '',
        icon: 'TbHome',
        description: '',
        display_order: 0,
        is_active: true,
      });
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      // Auto-generate slug from label_vi if creating new and slug not edited manually
      if (!isEdit && name === 'label_vi' && !prev.slugManuallyEdited) {
        next.slug = value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[đĐ]/g, 'd')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      if (name === 'slug') {
        next.slugManuallyEdited = true;
      }
      return next;
    });
  };

  const handleSelectIcon = (iconName) => {
    setFormData((prev) => ({ ...prev, icon: iconName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.label_vi.trim()) {
      toast.error('Thiếu thông tin', 'Vui lòng nhập tên danh mục tiếng Việt');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        label_vi: formData.label_vi.trim(),
        label_en: formData.label_en.trim() || formData.label_vi.trim(),
        slug: formData.slug.trim() || 'cat_' + Date.now(),
        icon: formData.icon || 'TbHome',
        description: formData.description.trim() || '',
        display_order: Number(formData.display_order) || 0,
        is_active: Boolean(formData.is_active),
      };

      await onSave(payload, category?.id || category?.slug);
      toast.success(
        isEdit ? 'Cập nhật thành công' : 'Tạo mới thành công',
        `Danh mục "${formData.label_vi}" đã được lưu.`
      );
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi', err.message || 'Không thể lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div
        className="adm-modal-container adm-cat-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="adm-modal-header">
          <div className="adm-cat-modal-title-wrap">
            <div className="adm-cat-modal-icon">
              <TbFolder />
            </div>
            <div>
              <h2 className="adm-modal-title">
                {isEdit ? 'Chỉnh Sửa Danh Mục Lưu Trú' : 'Thêm Danh Mục Lưu Trú Mới'}
              </h2>
              <p className="adm-modal-subtitle">
                {isEdit
                  ? `Cập nhật phong cách chỗ ở #${category?.slug || category?.id}`
                  : 'Tạo mới phong cách lưu trú hiển thị trên thanh tìm kiếm Trang chủ'}
              </p>
            </div>
          </div>
          <button className="adm-modal-close-btn" onClick={onClose}>
            <TbX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="adm-modal-form">
          <div className="adm-cat-form-fields">
            {/* Vietnamese Label */}
            <div className="adm-form-group">
              <label className="adm-form-label">
                Tên danh mục (Tiếng Việt) <span className="adm-required">*</span>
              </label>
              <input
                type="text"
                name="label_vi"
                className="adm-form-input"
                placeholder="Ví dụ: Biệt thự nghỉ dưỡng"
                value={formData.label_vi}
                onChange={handleChange}
                required
              />
            </div>

            {/* English Label & Slug */}
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label className="adm-form-label">Tên tiếng Anh (Label EN)</label>
                <input
                  type="text"
                  name="label_en"
                  className="adm-form-input"
                  placeholder="Ví dụ: Luxury Villas"
                  value={formData.label_en}
                  onChange={handleChange}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Mã định danh (Slug / Code)</label>
                <input
                  type="text"
                  name="slug"
                  className="adm-form-input"
                  placeholder="villa, beachfront, views..."
                  value={formData.slug}
                  onChange={handleChange}
                  disabled={isEdit}
                />
              </div>
            </div>

            {/* Icon Picker */}
            <div className="adm-form-group">
              <label className="adm-form-label">
                Biểu tượng hiển thị (Icon) <span className="adm-required">*</span>
              </label>
              <div className="adm-cat-icon-grid">
                {ICON_PRESETS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = formData.icon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      className={`adm-cat-icon-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectIcon(item.name)}
                    >
                      <IconComp className="adm-cat-icon-svg" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Order & Active */}
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label className="adm-form-label">Thứ tự hiển thị (Ưu tiên từ 0, 1, 2...)</label>
                <input
                  type="number"
                  name="display_order"
                  className="adm-form-input"
                  value={formData.display_order}
                  onChange={handleChange}
                />
              </div>

              <div className="adm-form-group" style={{ justifyContent: 'center' }}>
                <label className="adm-exp-switch-label" style={{ marginTop: '1.25rem' }}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <span className="adm-exp-slider" />
                  <span className="adm-exp-switch-text">
                    {formData.is_active ? 'Kích hoạt mở hiển thị' : 'Tạm ẩn khỏi menu'}
                  </span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="adm-form-group">
              <label className="adm-form-label">Mô tả đặc trưng phong cách</label>
              <textarea
                name="description"
                className="adm-form-textarea"
                rows="2"
                placeholder="Ghi chú về tiêu chuẩn hoặc đặc điểm của danh mục này..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="adm-modal-footer">
            <button
              type="button"
              className="adm-btn adm-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="adm-btn adm-btn-primary"
              disabled={submitting}
            >
              <TbCheck />
              <span>{submitting ? 'Đang lưu...' : isEdit ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
