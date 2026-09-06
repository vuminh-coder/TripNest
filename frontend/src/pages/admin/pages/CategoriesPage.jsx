import React, { useState, useMemo } from 'react';
import './CategoriesPage.css';
import * as TbIcons from 'react-icons/tb';
import {
  TbFolder,
  TbSparkles,
  TbPlus,
  TbEdit,
  TbTrash,
  TbCheck,
  TbX,
  TbCrown,
  TbSearch,
  TbBuildingEstate,
  TbInfoCircle,
  TbEye,
  TbEyeOff,
  TbHome,
  TbLayersLinked,
  TbListNumbers,
  TbFlame,
  TbGridDots,
} from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import AdminConfirmDialog from '../common/AdminConfirmDialog';
import CategoryModal from '../modals/CategoryModal';
import { useToast } from '@/context/ToastContext';

export const CategoriesPage = ({
  categories = [],
  amenities = [],
  onToggleCategory,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddAmenity,
  onDeleteAmenity,
}) => {
  const toast = useToast();

  // Primary Tab State ('categories' | 'amenities')
  const [activeMainTab, setActiveMainTab] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('tab');
      return p === 'amenities' ? 'amenities' : 'categories';
    } catch {
      return 'categories';
    }
  });

  // Category Search & Filter States
  const [catSearch, setCatSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all'); // 'all', 'active', 'inactive'

  // Amenity Search & Filter States
  const [amenitySearch, setAmenitySearch] = useState('');
  const [amenityTab, setAmenityTab] = useState('all'); // 'all', 'basic', 'standout', 'luxury'

  // Modal States
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Confirm Dialog States
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: null,
  });

  // New Amenity Quick Form State
  const [newAmenity, setNewAmenity] = useState({
    name_vi: '',
    name_en: '',
    category: 'basic',
    icon: 'TbSparkles',
  });

  // KPI Calculations
  const totalCats = categories.length;
  const activeCats = categories.filter((c) => c.is_active).length;
  const inactiveCats = totalCats - activeCats;

  const totalAmenities = amenities.length;
  const basicAmenities = amenities.filter((a) => !a.category || a.category === 'basic').length;
  const standoutAmenities = amenities.filter((a) => a.category === 'standout').length;
  const luxuryAmenities = amenities.filter((a) => a.category === 'luxury').length;
  const premiumAmenities = standoutAmenities + luxuryAmenities;

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchSearch =
        !catSearch ||
        (c.label_vi || c.label || '').toLowerCase().includes(catSearch.toLowerCase()) ||
        (c.label_en || c.labelEn || '').toLowerCase().includes(catSearch.toLowerCase()) ||
        (c.slug || '').toLowerCase().includes(catSearch.toLowerCase());

      const matchFilter =
        catFilter === 'all' ||
        (catFilter === 'active' && c.is_active) ||
        (catFilter === 'inactive' && !c.is_active);

      return matchSearch && matchFilter;
    });
  }, [categories, catSearch, catFilter]);

  // Filtered Amenities
  const filteredAmenities = useMemo(() => {
    return amenities.filter((a) => {
      const matchSearch =
        !amenitySearch ||
        (a.name_vi || '').toLowerCase().includes(amenitySearch.toLowerCase()) ||
        (a.name_en || '').toLowerCase().includes(amenitySearch.toLowerCase()) ||
        (a.code || '').toLowerCase().includes(amenitySearch.toLowerCase());

      const matchTab = amenityTab === 'all' || a.category === amenityTab;

      return matchSearch && matchTab;
    });
  }, [amenities, amenitySearch, amenityTab]);

  // Dynamic Icon Resolver
  const renderIcon = (iconName, defaultComp = TbFolder) => {
    if (!iconName) {
      const DefaultIcon = defaultComp;
      return <DefaultIcon />;
    }
    const Comp = TbIcons[iconName] || defaultComp;
    return <Comp />;
  };

  // Category Actions
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setIsCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (payload, idOrSlug) => {
    if (idOrSlug && editingCategory) {
      await onUpdateCategory(payload, idOrSlug);
    } else {
      await onCreateCategory(payload);
    }
  };

  const handleDeleteCategoryPrompt = (cat) => {
    const count = Number(cat.accommodations_count || 0);
    if (count > 0) {
      toast.error(
        'Không thể xóa danh mục!',
        `Danh mục "${cat.label_vi || cat.label}" đang có ${count} chỗ ở liên kết. Vui lòng chuyển các chỗ ở sang danh mục khác trước.`
      );
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xóa Danh Mục',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn danh mục "${cat.label_vi || cat.label}"? Thao tác này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        await onDeleteCategory(cat.id || cat.slug);
      },
    });
  };

  // Amenity Actions
  const handleAddAmenitySubmit = async (e) => {
    e.preventDefault();
    if (!newAmenity.name_vi.trim()) {
      toast.error('Thiếu thông tin', 'Vui lòng nhập tên tiện nghi');
      return;
    }

    const payload = {
      code: 'amn_' + Date.now(),
      name_vi: newAmenity.name_vi.trim(),
      name_en: newAmenity.name_en.trim() || newAmenity.name_vi.trim(),
      category: newAmenity.category,
      icon: newAmenity.icon || 'TbSparkles',
      target_type: 'both',
    };

    await onAddAmenity(payload);
    toast.success('Đã thêm tiện nghi', `Tiện nghi "${payload.name_vi}" đã được lưu.`);
    setNewAmenity({
      name_vi: '',
      name_en: '',
      category: 'basic',
      icon: 'TbSparkles',
    });
  };

  const handleDeleteAmenityPrompt = (amenity) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa Tiện Nghi',
      message: `Bạn có chắc chắn muốn xóa tiện nghi "${amenity.name_vi}" khỏi danh sách hỗ trợ?`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        if (onDeleteAmenity) {
          await onDeleteAmenity(amenity.id || amenity.code);
        }
      },
    });
  };

  return (
    <div className="adm-categories-container">
      {/* Page Header */}
      <AdminPageHeader
        title="Danh Mục & Tiện Nghi Chỗ Ở"
        subtitle="Hệ thống phân loại danh mục lưu trú và danh mục tiện nghi phòng nghỉ đồng bộ trên toàn sàn TripNest"
      />

      {/* KPI Cards Row */}
      <div className="adm-cat-kpi-grid">
        <div className="adm-cat-kpi-card blue">
          <div className="adm-cat-kpi-icon">
            <TbFolder />
          </div>
          <div className="adm-cat-kpi-info">
            <span className="adm-cat-kpi-label">Tổng Danh Mục</span>
            <div className="adm-cat-kpi-val-row">
              <span className="adm-cat-kpi-val">{totalCats}</span>
              <span className="adm-cat-kpi-pill active">{activeCats} Hoạt động</span>
            </div>
          </div>
        </div>

        <div className="adm-cat-kpi-card green">
          <div className="adm-cat-kpi-icon">
            <TbCheck />
          </div>
          <div className="adm-cat-kpi-info">
            <span className="adm-cat-kpi-label">Tỷ Lệ Hiển Thị</span>
            <div className="adm-cat-kpi-val-row">
              <span className="adm-cat-kpi-val">
                {totalCats > 0 ? Math.round((activeCats / totalCats) * 100) : 0}%
              </span>
              <span className="adm-cat-kpi-pill green">100% Đồng bộ</span>
            </div>
          </div>
        </div>

        <div className="adm-cat-kpi-card purple">
          <div className="adm-cat-kpi-icon">
            <TbSparkles />
          </div>
          <div className="adm-cat-kpi-info">
            <span className="adm-cat-kpi-label">Tổng Tiện Nghi</span>
            <div className="adm-cat-kpi-val-row">
              <span className="adm-cat-kpi-val">{totalAmenities}</span>
              <span className="adm-cat-kpi-pill purple">{basicAmenities} Cơ bản</span>
            </div>
          </div>
        </div>

        <div className="adm-cat-kpi-card amber">
          <div className="adm-cat-kpi-icon">
            <TbCrown />
          </div>
          <div className="adm-cat-kpi-info">
            <span className="adm-cat-kpi-label">Tiện Ích Nổi Bật / VIP</span>
            <div className="adm-cat-kpi-val-row">
              <span className="adm-cat-kpi-val">{premiumAmenities}</span>
              <span className="adm-cat-kpi-pill amber">{luxuryAmenities} Hạng VIP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Segmented Navigation Bar (2 TABS) */}
      <div className="adm-main-tab-nav">
        <button
          className={`adm-main-tab-btn ${activeMainTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('categories')}
          type="button"
        >
          <div className="adm-main-tab-content">
            <div className="adm-main-tab-icon-box cat">
              <TbFolder />
            </div>
            <div className="adm-main-tab-text-box">
              <div className="adm-main-tab-title-line">
                <span className="adm-main-tab-title">Danh Mục Chỗ Ở</span>
                <span className="adm-main-tab-badge cat">{totalCats} danh mục</span>
              </div>
              <span className="adm-main-tab-desc">
                Cấu hình các phong cách lưu trú hiển thị trên thanh bộ lọc trang chủ
              </span>
            </div>
          </div>
        </button>

        <button
          className={`adm-main-tab-btn ${activeMainTab === 'amenities' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('amenities')}
          type="button"
        >
          <div className="adm-main-tab-content">
            <div className="adm-main-tab-icon-box amn">
              <TbSparkles />
            </div>
            <div className="adm-main-tab-text-box">
              <div className="adm-main-tab-title-line">
                <span className="adm-main-tab-title">Tiện Nghi Chỗ Ở</span>
                <span className="adm-main-tab-badge amn">{totalAmenities} tiện nghi</span>
              </div>
              <span className="adm-main-tab-desc">
                Cấu hình danh mục tiện ích phòng nghỉ và khuôn viên theo 3 cấp bậc
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* TAB 1: DANH MỤC CHỖ Ở (FULL-WIDTH) */}
      {activeMainTab === 'categories' && (
        <div className="adm-tab-panel-wrapper fade-in">
          <div className="admin-card-box adm-full-section-card">
            {/* Header & Primary Action Bar */}
            <div className="adm-panel-header">
              <div>
                <h3 className="adm-panel-title">
                  <TbFolder className="adm-panel-title-icon" />
                  Danh Mục Phong Cách Chỗ Ở
                </h3>
                <p className="adm-panel-subtitle">
                  Điều hướng du khách tìm kiếm chỗ ở theo phong cách (Bãi biển, Biệt thự, Nhà gỗ, Hồ bơi vô cực, Cắm trại...)
                </p>
              </div>
              <button
                className="adm-btn adm-btn-primary adm-btn-glow"
                onClick={handleOpenCreateCategory}
              >
                <TbPlus />
                <span>Thêm Danh Mục Mới</span>
              </button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="adm-toolbar-wrapper">
              <div className="adm-search-input-box">
                <TbSearch className="adm-search-icon" />
                <input
                  type="text"
                  placeholder="Tìm danh mục theo tên tiếng Việt, tên tiếng Anh, mã slug..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="adm-search-input"
                />
                {catSearch && (
                  <button
                    className="adm-search-clear-btn"
                    onClick={() => setCatSearch('')}
                    title="Xóa tìm kiếm"
                  >
                    <TbX />
                  </button>
                )}
              </div>

              <div className="adm-filter-pills-group">
                <button
                  className={`adm-filter-pill ${catFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCatFilter('all')}
                >
                  Tất cả ({totalCats})
                </button>
                <button
                  className={`adm-filter-pill ${catFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setCatFilter('active')}
                >
                  Đang hiển thị ({activeCats})
                </button>
                <button
                  className={`adm-filter-pill ${catFilter === 'inactive' ? 'active' : ''}`}
                  onClick={() => setCatFilter('inactive')}
                >
                  Tạm ẩn ({inactiveCats})
                </button>
              </div>
            </div>

            {/* Categories Full Grid */}
            <div className="adm-categories-grid-full">
              {filteredCategories.length === 0 ? (
                <div className="adm-empty-box">
                  <div className="adm-empty-icon-wrap">
                    <TbFolder />
                  </div>
                  <h4 className="adm-empty-title">Không tìm thấy danh mục nào</h4>
                  <p className="adm-empty-desc">
                    Thử tìm kiếm với từ khóa khác hoặc bấm "Tất cả" để xem toàn bộ danh sách.
                  </p>
                </div>
              ) : (
                filteredCategories.map((c) => {
                  const accCount = Number(c.accommodations_count || 0);
                  return (
                    <div
                      key={c.slug || c.id}
                      className={`adm-cat-card-modern ${c.is_active ? 'is-active' : 'is-inactive'}`}
                    >
                      {/* Card Header Row */}
                      <div className="adm-cat-card-header-modern">
                        <div className="adm-cat-card-icon-modern">
                          {renderIcon(c.icon, TbHome)}
                        </div>
                        <div className="adm-cat-card-title-group">
                          <div className="adm-cat-name-badge-row">
                            <h4 className="adm-cat-primary-name">
                              {c.label_vi || c.label || c.labelVi}
                            </h4>
                            <span
                              className={`adm-status-chip ${
                                c.is_active ? 'chip-active' : 'chip-inactive'
                              }`}
                            >
                              <span className="adm-status-dot" />
                              {c.is_active ? 'Hiển thị' : 'Đang ẩn'}
                            </span>
                          </div>
                          <div className="adm-cat-sub-slug-row">
                            <span className="adm-cat-secondary-name">
                              {c.label_en || c.labelEn || c.slug}
                            </span>
                            <span className="adm-cat-slug-pill">#{c.slug}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body & Description */}
                      <div className="adm-cat-card-body-modern">
                        <p className="adm-cat-description-text">
                          {c.description || 'Chưa có mô tả chi tiết cho danh mục lưu trú này.'}
                        </p>

                        <div className="adm-cat-meta-pills-row">
                          <span className="adm-meta-pill acc">
                            <TbBuildingEstate />
                            <span><strong>{accCount}</strong> chỗ ở liên kết</span>
                          </span>
                          <span className="adm-meta-pill order">
                            <TbListNumbers />
                            <span>Thứ tự: <strong>#{c.display_order ?? 0}</strong></span>
                          </span>
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="adm-cat-card-actions-modern">
                        <button
                          className={`adm-card-btn toggle ${c.is_active ? 'btn-active' : 'btn-inactive'}`}
                          onClick={() => onToggleCategory(c.slug || c.id)}
                          title={c.is_active ? 'Ẩn danh mục khỏi thanh lọc trang chủ' : 'Bật hiển thị danh mục trên trang chủ'}
                        >
                          {c.is_active ? <TbEyeOff /> : <TbEye />}
                          <span>{c.is_active ? 'Ẩn' : 'Hiện'}</span>
                        </button>

                        <button
                          className="adm-card-btn edit"
                          onClick={() => handleOpenEditCategory(c)}
                          title="Chỉnh sửa thông tin danh mục"
                        >
                          <TbEdit />
                          <span>Chỉnh sửa</span>
                        </button>

                        <button
                          className={`adm-card-btn delete ${accCount > 0 ? 'is-disabled' : ''}`}
                          onClick={() => handleDeleteCategoryPrompt(c)}
                          title={
                            accCount > 0
                              ? `Không thể xóa vì đang có ${accCount} chỗ ở liên kết`
                              : 'Xóa vĩnh viễn danh mục này'
                          }
                        >
                          <TbTrash />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TIỆN NGHI CHỖ Ở (FULL-WIDTH) */}
      {activeMainTab === 'amenities' && (
        <div className="adm-tab-panel-wrapper fade-in">
          <div className="admin-card-box adm-full-section-card">
            {/* Header */}
            <div className="adm-panel-header">
              <div>
                <h3 className="adm-panel-title">
                  <TbSparkles className="adm-panel-title-icon purple" />
                  Tiện Nghi Phòng & Chỗ Ở
                </h3>
                <p className="adm-panel-subtitle">
                  Cấu hình các tiện ích để Chủ nhà đánh dấu khi đăng bài và Du khách lọc tìm kiếm phòng phù hợp
                </p>
              </div>
            </div>

            {/* Quick Add Amenity Premium Bar */}
            <div className="adm-amenity-add-card">
              <div className="adm-amenity-add-header">
                <div className="adm-amenity-add-title">
                  <div className="adm-amenity-add-icon">
                    <TbPlus />
                  </div>
                  <div>
                    <h4 className="adm-amenity-add-headline">Thêm Tiện Nghi Mới Vào Hệ Thống</h4>
                    <p className="adm-amenity-add-sub">
                      Tiện nghi mới sẽ có hiệu lực ngay lập tức cho các chỗ ở và phòng nghỉ toàn sàn
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddAmenitySubmit} className="adm-amenity-form-grid">
                <div className="adm-form-field">
                  <label className="adm-field-label">Tên tiện nghi tiếng Việt *</label>
                  <input
                    type="text"
                    placeholder="VD: Bồn tắm Jacuzzi, Trạm sạc EV..."
                    value={newAmenity.name_vi}
                    onChange={(e) =>
                      setNewAmenity((prev) => ({ ...prev, name_vi: e.target.value }))
                    }
                    className="adm-field-input"
                    required
                  />
                </div>

                <div className="adm-form-field">
                  <label className="adm-field-label">Tên tiếng Anh (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="VD: Jacuzzi Hot Tub, EV Charger..."
                    value={newAmenity.name_en}
                    onChange={(e) =>
                      setNewAmenity((prev) => ({ ...prev, name_en: e.target.value }))
                    }
                    className="adm-field-input"
                  />
                </div>

                <div className="adm-form-field">
                  <label className="adm-field-label">Phân cấp tiện nghi</label>
                  <select
                    value={newAmenity.category}
                    onChange={(e) =>
                      setNewAmenity((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="adm-field-select"
                  >
                    <option value="basic">Tiện nghi cơ bản (Basic)</option>
                    <option value="standout">Tiện nghi nổi bật (Standout)</option>
                    <option value="luxury">Tiện nghi cao cấp VIP (Luxury)</option>
                  </select>
                </div>

                <div className="adm-form-action-field">
                  <button type="submit" className="adm-btn adm-btn-primary adm-btn-add-amenity">
                    <TbPlus />
                    <span>Lưu Tiện Nghi</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Filter & Search Toolbar for Amenities */}
            <div className="adm-toolbar-wrapper">
              <div className="adm-search-input-box">
                <TbSearch className="adm-search-icon" />
                <input
                  type="text"
                  placeholder="Lọc tiện nghi theo tên tiếng Việt, tiếng Anh, mã code..."
                  value={amenitySearch}
                  onChange={(e) => setAmenitySearch(e.target.value)}
                  className="adm-search-input"
                />
                {amenitySearch && (
                  <button
                    className="adm-search-clear-btn"
                    onClick={() => setAmenitySearch('')}
                    title="Xóa tìm kiếm"
                  >
                    <TbX />
                  </button>
                )}
              </div>

              <div className="adm-filter-pills-group">
                <button
                  className={`adm-filter-pill ${amenityTab === 'all' ? 'active' : ''}`}
                  onClick={() => setAmenityTab('all')}
                >
                  Tất cả ({totalAmenities})
                </button>
                <button
                  className={`adm-filter-pill blue ${amenityTab === 'basic' ? 'active' : ''}`}
                  onClick={() => setAmenityTab('basic')}
                >
                  Cơ bản ({basicAmenities})
                </button>
                <button
                  className={`adm-filter-pill amber ${amenityTab === 'standout' ? 'active' : ''}`}
                  onClick={() => setAmenityTab('standout')}
                >
                  Nổi bật ({standoutAmenities})
                </button>
                <button
                  className={`adm-filter-pill purple ${amenityTab === 'luxury' ? 'active' : ''}`}
                  onClick={() => setAmenityTab('luxury')}
                >
                  Cao cấp VIP ({luxuryAmenities})
                </button>
              </div>
            </div>

            {/* Amenities Cards Grid (Full-Width) */}
            <div className="adm-amenities-grid-full">
              {filteredAmenities.length === 0 ? (
                <div className="adm-empty-box">
                  <div className="adm-empty-icon-wrap purple">
                    <TbSparkles />
                  </div>
                  <h4 className="adm-empty-title">Không tìm thấy tiện nghi nào</h4>
                  <p className="adm-empty-desc">
                    Thử tìm kiếm với từ khóa khác hoặc chuyển sang tab "Tất cả".
                  </p>
                </div>
              ) : (
                filteredAmenities.map((a) => {
                  const catType = a.category || 'basic';
                  return (
                    <div
                      key={a.id || a.code}
                      className={`adm-amenity-card-modern ${catType}`}
                    >
                      <div className="adm-amenity-card-left">
                        <div className={`adm-amenity-icon-box ${catType}`}>
                          {renderIcon(a.icon, TbSparkles)}
                        </div>
                        <div className="adm-amenity-card-meta">
                          <h5 className="adm-amenity-name-vi">{a.name_vi}</h5>
                          {a.name_en && a.name_en !== a.name_vi && (
                            <span className="adm-amenity-name-en">{a.name_en}</span>
                          )}
                          <span className="adm-amenity-code-tag">#{a.code || 'amn'}</span>
                        </div>
                      </div>

                      <div className="adm-amenity-card-right">
                        <span className={`adm-amenity-level-badge ${catType}`}>
                          {catType === 'luxury'
                            ? 'VIP'
                            : catType === 'standout'
                            ? 'Nổi bật'
                            : 'Cơ bản'}
                        </span>
                        <button
                          className="adm-amenity-card-del-btn"
                          onClick={() => handleDeleteAmenityPrompt(a)}
                          title={`Xóa tiện nghi "${a.name_vi}"`}
                        >
                          <TbTrash />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Create / Edit Modal */}
      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      {/* Safe Delete Confirm Dialog */}
      <AdminConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default CategoriesPage;
