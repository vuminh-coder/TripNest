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
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-container"
        style={{ width: '760px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ffe4e6', color: '#ff385c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <TbBuildingCastle />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {accommodation ? 'Chỉnh Sửa Chỗ Ở & Phòng' : 'Thêm Cơ Sở Lưu Trú Mới'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <TbX />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Tên chỗ ở (Tiếng Việt) *
              </label>
              <input
                type="text"
                required
                value={formData.name_vi}
                onChange={(e) => setFormData({ ...formData, name_vi: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                placeholder="VD: Biệt Thự Rừng Thông Đà Lạt"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Tên chỗ ở (Tiếng Anh)
              </label>
              <input
                type="text"
                value={formData.name_en || ''}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                placeholder="VD: Pine Forest Cloud Villa"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Tỉnh / Thành phố
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="Đà Lạt">Đà Lạt</option>
                <option value="Phú Quốc">Phú Quốc</option>
                <option value="Hạ Long">Hạ Long</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Sapa">Sapa</option>
                <option value="Hội An">Hội An</option>
                <option value="Nha Trang">Nha Trang</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Loại hình
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="villa">Biệt thự (Villa)</option>
                <option value="cabin">Nhà gỗ (Cabin)</option>
                <option value="hotel">Khách sạn cao cấp</option>
                <option value="yacht">Du thuyền (Yacht)</option>
                <option value="resort">Khu nghỉ dưỡng</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Chủ nhà (Host)
              </label>
              <input
                type="text"
                value={formData.host_name}
                onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Địa chỉ chi tiết
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              placeholder="VD: Đường Mimosa, Phường 10, TP. Đà Lạt"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Giá mỗi đêm (VND)
              </label>
              <input
                type="number"
                value={formData.priceVND}
                onChange={(e) => setFormData({ ...formData, priceVND: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Giá mỗi đêm (USD)
              </label>
              <input
                type="number"
                value={formData.priceUSD}
                onChange={(e) => setFormData({ ...formData, priceUSD: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              URL Ảnh đại diện phòng
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }}
              />
            )}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', padding: '0.75rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              Gắn cờ Nổi Bật (Featured) ⭐
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_guest_favorite}
                onChange={(e) => setFormData({ ...formData, is_guest_favorite: e.target.checked })}
              />
              Yêu Thích Của Khách (Guest Favorite) 🔥
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <button
              type="button"
              style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#64748b' }}
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn-admin-primary">
              <TbCheck />
              <span>Lưu Thông Tin Chỗ Ở</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AccommodationEditModal;
