import React, { useState, useEffect } from 'react';
import {
  TbX,
  TbSparkles,
  TbMapPin,
  TbClock,
  TbCoins,
  TbPhoto,
  TbUser,
  TbFileText,
  TbCheck,
  TbInfoCircle,
} from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import './ExperienceModal.css';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80';

const PRESET_IMAGES = [
  { label: 'Biển & SUP', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80' },
  { label: 'Ẩm thực', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cà phê & Nghệ thuật', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80' },
  { label: 'Khám phá di sản', url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&auto=format&fit=crop&q=80' },
];

const POPULAR_CITIES = [
  'Hà Nội',
  'Đà Lạt',
  'Phú Quốc',
  'Nha Trang',
  'Hội An',
  'Đà Nẵng',
  'TP. Hồ Chí Minh',
  'Sa Pa',
  'Hạ Long',
];

export const ExperienceModal = ({
  isOpen,
  onClose,
  onSave,
  experience = null,
  hosts = [],
}) => {
  const toast = useToast();
  const isEdit = Boolean(experience && experience.id);

  const [formData, setFormData] = useState({
    title: '',
    city: '',
    price: '',
    duration_hours: 3,
    image_url: DEFAULT_IMAGE,
    caption: '',
    description: '',
    host_id: '',
    is_active: true,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title_vi || experience.title || '',
        city: experience.city || '',
        price: experience.price || experience.price_per_person || experience.rentVND || '',
        duration_hours: experience.duration_hours || 3,
        image_url: experience.image_url || experience.image || DEFAULT_IMAGE,
        caption: experience.caption || '',
        description: experience.description || '',
        host_id: experience.host_id || experience.host?.id || (hosts[0]?.id || 1),
        is_active: experience.is_active ?? true,
      });
    } else {
      setFormData({
        title: '',
        city: 'Đà Lạt',
        price: 750000,
        duration_hours: 3,
        image_url: DEFAULT_IMAGE,
        caption: 'Khám phá nét đẹp văn hóa và trải nghiệm bản địa đặc sắc',
        description: 'Hành trình cùng hướng dẫn viên bản địa đầy thú vị và độc đáo.',
        host_id: hosts[0]?.id || 1,
        is_active: true,
      });
    }
  }, [experience, isOpen, hosts]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Thiếu thông tin', 'Vui lòng nhập tên tour trải nghiệm');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('Thiếu thông tin', 'Vui lòng chọn hoặc nhập điểm đến / thành phố');
      return;
    }
    if (Number(formData.price) <= 0) {
      toast.error('Giá vé không hợp lệ', 'Giá vé phải lớn hơn 0 ₫');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title_vi: formData.title.trim(),
        title: formData.title.trim(),
        city: formData.city.trim(),
        price_per_person: Number(formData.price),
        price: Number(formData.price),
        duration_hours: Number(formData.duration_hours) || 3,
        image_url: formData.image_url.trim() || DEFAULT_IMAGE,
        image: formData.image_url.trim() || DEFAULT_IMAGE,
        caption: formData.caption.trim() || 'Trải nghiệm du lịch khám phá bản địa',
        description: formData.description.trim() || '',
        host_id: Number(formData.host_id) || (hosts[0]?.id || 1),
        is_active: Boolean(formData.is_active),
      };

      await onSave(payload, experience?.id);
      toast.success(
        isEdit ? 'Cập nhật thành công' : 'Tạo mới thành công',
        `Hoạt động "${formData.title}" đã được lưu vào hệ thống.`
      );
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi', 'Không thể lưu hoạt động trải nghiệm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div
        className="adm-modal-container adm-exp-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="adm-modal-header">
          <div className="adm-exp-modal-title-wrap">
            <div className="adm-exp-modal-icon">
              <TbSparkles />
            </div>
            <div>
              <h2 className="adm-modal-title">
                {isEdit ? 'Chỉnh Sửa Trải Nghiệm & Tour' : 'Thêm Trải Nghiệm Mới'}
              </h2>
              <p className="adm-modal-subtitle">
                {isEdit
                  ? `Cập nhật nội dung, giá vé và điều phối tour #${experience?.id}`
                  : 'Khởi tạo tour du lịch hoặc workshop văn hóa do Host cung ứng'}
              </p>
            </div>
          </div>
          <button className="adm-modal-close-btn" onClick={onClose}>
            <TbX />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="adm-modal-form">
          <div className="adm-exp-form-grid">
            {/* Left Column: Form Fields */}
            <div className="adm-exp-fields-col">
              {/* Tour Title */}
              <div className="adm-form-group">
                <label className="adm-form-label">
                  <TbFileText className="adm-label-icon" />
                  Tên hoạt động tour / trải nghiệm <span className="adm-required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="adm-form-input"
                  placeholder="Ví dụ: Tour Chèo SUP Hoàng Hôn Vịnh Biển"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* City & Duration */}
              <div className="adm-form-row">
                <div className="adm-form-group">
                  <label className="adm-form-label">
                    <TbMapPin className="adm-label-icon" />
                    Thành phố / Điểm đến <span className="adm-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    className="adm-form-input"
                    placeholder="Ví dụ: Phú Quốc"
                    value={formData.city}
                    onChange={handleChange}
                    list="popular-cities-list"
                    required
                  />
                  <datalist id="popular-cities-list">
                    {POPULAR_CITIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">
                    <TbClock className="adm-label-icon" />
                    Thời lượng (giờ) <span className="adm-required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="48"
                    name="duration_hours"
                    className="adm-form-input"
                    value={formData.duration_hours}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Price & Host Assignment */}
              <div className="adm-form-row">
                <div className="adm-form-group">
                  <label className="adm-form-label">
                    <TbCoins className="adm-label-icon" />
                    Giá vé / khách (₫) <span className="adm-required">*</span>
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="0"
                    name="price"
                    className="adm-form-input"
                    placeholder="990000"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">
                    <TbUser className="adm-label-icon" />
                    Host chủ quản / Điều phối
                  </label>
                  <select
                    name="host_id"
                    className="adm-form-select"
                    value={formData.host_id}
                    onChange={handleChange}
                  >
                    {hosts && hosts.length > 0 ? (
                      hosts.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.host_display_name || h.business_name || h.name || `Host #${h.id}`}
                        </option>
                      ))
                    ) : (
                      <option value="1">Host Mặc Định (#1)</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Caption */}
              <div className="adm-form-group">
                <label className="adm-form-label">
                  <TbInfoCircle className="adm-label-icon" />
                  Khẩu hiệu tóm tắt (Caption)
                </label>
                <input
                  type="text"
                  name="caption"
                  className="adm-form-input"
                  placeholder="Ví dụ: Thưởng thức 8 món ăn đường phố di sản"
                  value={formData.caption}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div className="adm-form-group">
                <label className="adm-form-label">
                  <TbFileText className="adm-label-icon" />
                  Mô tả chi tiết trải nghiệm
                </label>
                <textarea
                  name="description"
                  className="adm-form-textarea"
                  rows="3"
                  placeholder="Mô tả các hoạt động, lộ trình, điểm gặp gỡ, tiện ích kèm theo..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Active Toggle Switch */}
              <div className="adm-exp-switch-box">
                <label className="adm-exp-switch-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <span className="adm-exp-slider" />
                  <span className="adm-exp-switch-text">
                    {formData.is_active
                      ? 'Đang mở bán công khai (Active trên trang chủ & chi tiết phòng)'
                      : 'Tạm dừng mở bán (Ẩn khỏi trang chủ)'}
                  </span>
                </label>
              </div>
            </div>

            {/* Right Column: Image URL & Live Preview */}
            <div className="adm-exp-preview-col">
              <label className="adm-form-label">
                <TbPhoto className="adm-label-icon" />
                Ảnh bìa trải nghiệm (URL)
              </label>
              <input
                type="url"
                name="image_url"
                className="adm-form-input"
                placeholder="https://images.unsplash.com/..."
                value={formData.image_url}
                onChange={handleChange}
              />

              {/* Quick Image Presets */}
              <div className="adm-exp-preset-row">
                <span className="adm-exp-preset-title">Gợi ý ảnh:</span>
                {PRESET_IMAGES.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="adm-exp-preset-chip"
                    onClick={() => setFormData((prev) => ({ ...prev, image_url: p.url }))}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Live Preview Card */}
              <div className="adm-exp-live-preview-box">
                <div className="adm-exp-preview-header">
                  <span>XEM TRƯỚC HIỂN THỊ</span>
                  <span className="adm-exp-badge-mini">
                    {formData.is_active ? 'MỞ BÁN' : 'TẠM DỪNG'}
                  </span>
                </div>
                <div className="adm-exp-preview-media">
                  <img
                    src={formData.image_url || DEFAULT_IMAGE}
                    alt="Preview"
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                  <div className="adm-exp-preview-meta-floating">
                    <span>{formData.city || 'Việt Nam'}</span>
                    <span>•</span>
                    <span>{formData.duration_hours || 3} giờ</span>
                  </div>
                </div>
                <div className="adm-exp-preview-body">
                  <h4 className="adm-exp-preview-title">
                    {formData.title || 'Tên hoạt động trải nghiệm'}
                  </h4>
                  <p className="adm-exp-preview-cap">
                    {formData.caption || 'Khẩu hiệu tóm tắt hoạt động'}
                  </p>
                  <div className="adm-exp-preview-price-row">
                    <span className="adm-exp-preview-lbl">Giá vé từ</span>
                    <strong className="adm-exp-preview-val">
                      {(Number(formData.price) || 0).toLocaleString('vi-VN')} ₫
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions Footer */}
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
              <span>{submitting ? 'Đang lưu...' : isEdit ? 'Lưu Thay Đổi' : 'Tạo Tour Mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExperienceModal;
