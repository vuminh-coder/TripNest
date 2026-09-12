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
  TbLayoutList,
  TbLayoutGrid,
  TbChevronDown,
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

  // View Mode: 'table' (default - like other pages) or 'grid'
  const [viewMode, setViewMode] = useState('table');

  // Category Search & Filter States
  const [catSearch, setCatSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all'); // 'all', 'active', 'inactive'

  // Amenity Search & Filter States
  const [amenitySearch, setAmenitySearch] = useState('');
  const [amenityTab, setAmenityTab] = useState('all'); // 'all', 'basic', 'standout', 'luxury'

  // Quick Add Amenity Drawer State
  const [showQuickAddAmenity, setShowQuickAddAmenity] = useState(false);

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

  // Calculations
  const totalCats = categories.length;
  const activeCats = categories.filter((c) => c.is_active).length;
  const inactiveCats = totalCats - activeCats;

  const totalAmenities = amenities.length;
  const basicAmenities = amenities.filter((a) => !a.category || a.category === 'basic').length;
  const standoutAmenities = amenities.filter((a) => a.category === 'standout').length;
  const luxuryAmenities = amenities.filter((a) => a.category === 'luxury').length;

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

  // Color Theme Resolver for Categories (Vibrant, distinct, non-monochrome)
  const getCategoryColorTheme = (slug = '') => {
    const s = (slug || '').toLowerCase();
    if (s.includes('beach') || s.includes('sea') || s.includes('pool') || s.includes('lake') || s.includes('boat')) {
      return 'cyan'; // Xanh biển / Hồ bơi
    }
    if (s.includes('mansion') || s.includes('villa') || s.includes('luxe') || s.includes('crown')) {
      return 'purple'; // Biệt thự / Sang trọng
    }
    if (s.includes('cabin') || s.includes('country') || s.includes('tree') || s.includes('tropical') || s.includes('forest')) {
      return 'green'; // Rừng thông / Thiên nhiên
    }
    if (s.includes('trend') || s.includes('flame') || s.includes('fire')) {
      return 'orange'; // Thịnh hành / Lửa
    }
    if (s.includes('camp') || s.includes('tent') || s.includes('mountain')) {
      return 'amber'; // Cắm trại / Núi non
    }
    if (s.includes('iconic') || s.includes('city') || s.includes('skyscrap') || s.includes('experien')) {
      return 'rose'; // Thành phố / Trải nghiệm
    }
    return 'blue'; // Mặc định / Tất cả
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
    setShowQuickAddAmenity(false);
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
      {/* Page Header (Unified Standard) */}
      <AdminPageHeader
        title="Danh Mục & Tiện Nghi Chỗ Ở"
        subtitle={`Quản lý ${totalCats} danh mục lưu trú và ${totalAmenities} tiện nghi phòng nghỉ đồng bộ toàn sàn`}
        actionButton={
          activeMainTab === 'categories' ? (
            <button
              type="button"
              className="adm-header-action-btn"
              onClick={handleOpenCreateCategory}
            >
              <TbPlus />
              <span>Thêm Danh Mục Mới</span>
            </button>
          ) : (
            <button
              type="button"
              className={`adm-header-action-btn ${showQuickAddAmenity ? 'active' : ''}`}
              onClick={() => setShowQuickAddAmenity((prev) => !prev)}
            >
              <TbPlus />
              <span>{showQuickAddAmenity ? 'Đóng Form Thêm' : 'Thêm Tiện Nghi Mới'}</span>
            </button>
          )
        }
      />

      {/* Compact Segmented Pill Navigation */}
      <div className="adm-compact-tab-bar">
        <div className="adm-tab-pill-group">
          <button
            className={`adm-tab-pill-btn ${activeMainTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('categories')}
            type="button"
          >
            <TbFolder className="adm-tab-pill-icon" />
            <span className="adm-tab-pill-text">Danh Mục Chỗ Ở</span>
            <span className="adm-tab-pill-badge">{totalCats}</span>
          </button>

          <button
            className={`adm-tab-pill-btn ${activeMainTab === 'amenities' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('amenities')}
            type="button"
          >
            <TbSparkles className="adm-tab-pill-icon" />
            <span className="adm-tab-pill-text">Tiện Nghi Chỗ Ở</span>
            <span className="adm-tab-pill-badge">{totalAmenities}</span>
          </button>
        </div>

        {/* View Mode Toggle: Table / Grid */}
        <div className="adm-view-toggle-group">
          <button
            type="button"
            className={`adm-view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Xem dạng bảng chuẩn"
          >
            <TbLayoutList />
            <span>Bảng</span>
          </button>
          <button
            type="button"
            className={`adm-view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Xem dạng thẻ"
          >
            <TbLayoutGrid />
            <span>Thẻ</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: DANH MỤC CHỖ Ở
          ========================================================================= */}
      {activeMainTab === 'categories' && (
        <div className="admin-card-box adm-clean-panel fade-in">
          {/* Filter & Search Toolbar */}
          <div className="adm-clean-toolbar">
            <div className="adm-clean-search">
              <TbSearch className="adm-clean-search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm danh mục theo tên, slug..."
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                className="adm-clean-search-input"
              />
              {catSearch && (
                <button
                  className="adm-clean-clear-btn"
                  onClick={() => setCatSearch('')}
                  title="Xóa tìm kiếm"
                  type="button"
                >
                  <TbX />
                </button>
              )}
            </div>

            <div className="adm-clean-filters">
              <button
                className={`adm-clean-filter-btn ${catFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCatFilter('all')}
                type="button"
              >
                Tất cả ({totalCats})
              </button>
              <button
                className={`adm-clean-filter-btn ${catFilter === 'active' ? 'active' : ''}`}
                onClick={() => setCatFilter('active')}
                type="button"
              >
                Đang hiển thị ({activeCats})
              </button>
              <button
                className={`adm-clean-filter-btn ${catFilter === 'inactive' ? 'active' : ''}`}
                onClick={() => setCatFilter('inactive')}
                type="button"
              >
                Tạm ẩn ({inactiveCats})
              </button>
            </div>
          </div>

          {/* TABLE VIEW (Standard Clean SaaS) */}
          {viewMode === 'table' ? (
            <div className="admin-table-container">
              {filteredCategories.length === 0 ? (
                <div className="adm-clean-empty">
                  <TbFolder className="adm-clean-empty-icon" />
                  <p>Không tìm thấy danh mục nào phù hợp.</p>
                </div>
              ) : (
                <table className="admin-table adm-categories-table">
                  <thead>
                    <tr>
                      <th style={{ width: '38%' }}>Danh Mục & Phong Cách</th>
                      <th style={{ width: '18%' }}>Mã Định Danh (Slug)</th>
                      <th style={{ width: '16%' }}>Chỗ Ở Liên Kết</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Thứ Tự</th>
                      <th style={{ width: '10%' }}>Trạng Thái</th>
                      <th style={{ width: '8%', textAlign: 'right' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((c) => {
                      const accCount = Number(c.accommodations_count || 0);
                      const theme = getCategoryColorTheme(c.slug);
                      return (
                        <tr key={c.slug || c.id}>
                          {/* Name & Icon */}
                          <td>
                            <div className="adm-table-cat-cell">
                              <div className={`adm-table-cat-icon ${theme} ${c.is_active ? 'active' : 'inactive'}`}>
                                {renderIcon(c.icon, TbHome)}
                              </div>
                              <div className="adm-table-cat-info">
                                <span className="adm-table-cat-title">
                                  {c.label_vi || c.label || c.labelVi}
                                </span>
                                <span className="adm-table-cat-subtitle">
                                  {c.label_en || c.labelEn || c.slug}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Slug */}
                          <td>
                            <code className={`adm-table-slug-code ${theme}`}>#{c.slug}</code>
                          </td>

                          {/* Accommodations Count */}
                          <td>
                            <span className={`adm-count-pill ${accCount > 0 ? 'has-count' : 'zero'}`}>
                              <TbBuildingEstate />
                              <strong>{accCount}</strong> chỗ ở
                            </span>
                          </td>

                          {/* Display Order */}
                          <td style={{ textAlign: 'center' }}>
                            <span className="adm-order-badge">#{c.display_order ?? 0}</span>
                          </td>

                          {/* Status */}
                          <td>
                            <span className={`adm-status-badge ${c.is_active ? 'active' : 'inactive'}`}>
                              <span className="adm-status-dot-sm" />
                              {c.is_active ? 'Hiển thị' : 'Tạm ẩn'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div className="adm-table-actions-inline">
                              <button
                                type="button"
                                className={`adm-action-icon-btn toggle ${c.is_active ? 'is-active' : 'is-inactive'}`}
                                onClick={() => onToggleCategory(c.slug || c.id)}
                                title={c.is_active ? 'Ẩn danh mục khỏi thanh lọc' : 'Bật hiển thị danh mục'}
                              >
                                {c.is_active ? <TbEyeOff /> : <TbEye />}
                              </button>

                              <button
                                type="button"
                                className="adm-action-icon-btn edit"
                                onClick={() => handleOpenEditCategory(c)}
                                title="Chỉnh sửa danh mục"
                              >
                                <TbEdit />
                              </button>

                              <button
                                type="button"
                                className={`adm-action-icon-btn delete ${accCount > 0 ? 'disabled' : ''}`}
                                onClick={() => handleDeleteCategoryPrompt(c)}
                                title={
                                  accCount > 0
                                    ? `Không thể xóa vì đang có ${accCount} chỗ ở`
                                    : 'Xóa danh mục'
                                }
                                disabled={accCount > 0}
                              >
                                <TbTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            /* COMPACT GRID VIEW */
            <div className="adm-clean-grid-container">
              {filteredCategories.length === 0 ? (
                <div className="adm-clean-empty">
                  <TbFolder className="adm-clean-empty-icon" />
                  <p>Không tìm thấy danh mục nào phù hợp.</p>
                </div>
              ) : (
                <div className="adm-compact-grid">
                  {filteredCategories.map((c) => {
                    const accCount = Number(c.accommodations_count || 0);
                    const theme = getCategoryColorTheme(c.slug);
                    return (
                      <div
                        key={c.slug || c.id}
                        className={`adm-compact-card ${theme} ${c.is_active ? 'active' : 'inactive'}`}
                      >
                        <div className="adm-compact-card-top">
                          <div className={`adm-compact-icon ${theme} ${c.is_active ? 'active' : 'inactive'}`}>
                            {renderIcon(c.icon, TbHome)}
                          </div>
                          <div className="adm-compact-meta">
                            <div className="adm-compact-title-row">
                              <span className="adm-compact-title">
                                {c.label_vi || c.label || c.labelVi}
                              </span>
                              <span className={`adm-status-badge ${c.is_active ? 'active' : 'inactive'}`}>
                                <span className="adm-status-dot-sm" />
                                {c.is_active ? 'Hiển thị' : 'Ẩn'}
                              </span>
                            </div>
                            <div className="adm-compact-sub-row">
                              <span className="adm-compact-sub">{c.label_en || c.labelEn || c.slug}</span>
                              <code className={`adm-table-slug-code ${theme}`}>#{c.slug}</code>
                            </div>
                          </div>
                        </div>

                        <div className="adm-compact-card-bottom">
                          <div className="adm-compact-metrics">
                            <span className={`adm-count-pill ${accCount > 0 ? 'has-count' : 'zero'}`}>
                              <TbBuildingEstate />
                              <strong>{accCount}</strong> chỗ ở
                            </span>
                            <span className="adm-order-badge">#{c.display_order ?? 0}</span>
                          </div>

                          <div className="adm-table-actions-inline">
                            <button
                              type="button"
                              className={`adm-action-icon-btn toggle ${c.is_active ? 'is-active' : 'is-inactive'}`}
                              onClick={() => onToggleCategory(c.slug || c.id)}
                              title={c.is_active ? 'Ẩn danh mục' : 'Hiện danh mục'}
                            >
                              {c.is_active ? <TbEyeOff /> : <TbEye />}
                            </button>
                            <button
                              type="button"
                              className="adm-action-icon-btn edit"
                              onClick={() => handleOpenEditCategory(c)}
                              title="Chỉnh sửa"
                            >
                              <TbEdit />
                            </button>
                            <button
                              type="button"
                              className={`adm-action-icon-btn delete ${accCount > 0 ? 'disabled' : ''}`}
                              onClick={() => handleDeleteCategoryPrompt(c)}
                              title={accCount > 0 ? 'Đang có chỗ ở' : 'Xóa'}
                              disabled={accCount > 0}
                            >
                              <TbTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: TIỆN NGHI CHỖ Ở
          ========================================================================= */}
      {activeMainTab === 'amenities' && (
        <div className="admin-card-box adm-clean-panel fade-in">
          {/* Collapsible Slim Quick-Add Form Bar */}
          {showQuickAddAmenity && (
            <div className="adm-slim-quick-add-card">
              <div className="adm-slim-quick-add-header">
                <span className="adm-slim-quick-add-title">
                  <TbPlus /> Thêm tiện nghi mới vào hệ sinh thái TripNest
                </span>
                <button
                  type="button"
                  className="adm-clean-clear-btn"
                  onClick={() => setShowQuickAddAmenity(false)}
                >
                  <TbX />
                </button>
              </div>
              <form onSubmit={handleAddAmenitySubmit} className="adm-slim-quick-add-form">
                <input
                  type="text"
                  placeholder="Tên tiếng Việt * (VD: Bồn tắm Jacuzzi, Trạm sạc EV...)"
                  value={newAmenity.name_vi}
                  onChange={(e) =>
                    setNewAmenity((prev) => ({ ...prev, name_vi: e.target.value }))
                  }
                  className="adm-slim-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Tên tiếng Anh (VD: Hot Tub, EV Charger...)"
                  value={newAmenity.name_en}
                  onChange={(e) =>
                    setNewAmenity((prev) => ({ ...prev, name_en: e.target.value }))
                  }
                  className="adm-slim-input"
                />
                <select
                  value={newAmenity.category}
                  onChange={(e) =>
                    setNewAmenity((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="adm-slim-select"
                >
                  <option value="basic">Cơ bản (Basic)</option>
                  <option value="standout">Nổi bật (Standout)</option>
                  <option value="luxury">Hạng VIP (Luxury)</option>
                </select>
                <button type="submit" className="adm-header-action-btn">
                  <TbCheck />
                  <span>Lưu Ngay</span>
                </button>
              </form>
            </div>
          )}

          {/* Filter & Search Toolbar */}
          <div className="adm-clean-toolbar">
            <div className="adm-clean-search">
              <TbSearch className="adm-clean-search-icon" />
              <input
                type="text"
                placeholder="Tìm tiện nghi theo tên tiếng Việt, tiếng Anh, mã code..."
                value={amenitySearch}
                onChange={(e) => setAmenitySearch(e.target.value)}
                className="adm-clean-search-input"
              />
              {amenitySearch && (
                <button
                  className="adm-clean-clear-btn"
                  onClick={() => setAmenitySearch('')}
                  title="Xóa tìm kiếm"
                  type="button"
                >
                  <TbX />
                </button>
              )}
            </div>

            <div className="adm-clean-filters">
              <button
                className={`adm-clean-filter-btn ${amenityTab === 'all' ? 'active' : ''}`}
                onClick={() => setAmenityTab('all')}
                type="button"
              >
                Tất cả ({totalAmenities})
              </button>
              <button
                className={`adm-clean-filter-btn blue ${amenityTab === 'basic' ? 'active' : ''}`}
                onClick={() => setAmenityTab('basic')}
                type="button"
              >
                Cơ bản ({basicAmenities})
              </button>
              <button
                className={`adm-clean-filter-btn amber ${amenityTab === 'standout' ? 'active' : ''}`}
                onClick={() => setAmenityTab('standout')}
                type="button"
              >
                Nổi bật ({standoutAmenities})
              </button>
              <button
                className={`adm-clean-filter-btn purple ${amenityTab === 'luxury' ? 'active' : ''}`}
                onClick={() => setAmenityTab('luxury')}
                type="button"
              >
                Hạng VIP ({luxuryAmenities})
              </button>
            </div>
          </div>

          {/* TABLE VIEW FOR AMENITIES (Standard Clean SaaS) */}
          {viewMode === 'table' ? (
            <div className="admin-table-container">
              {filteredAmenities.length === 0 ? (
                <div className="adm-clean-empty">
                  <TbSparkles className="adm-clean-empty-icon" />
                  <p>Không tìm thấy tiện nghi nào phù hợp.</p>
                </div>
              ) : (
                <table className="admin-table adm-amenities-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Tiện Nghi & Tên Gọi</th>
                      <th style={{ width: '22%' }}>Mã Định Danh (Code)</th>
                      <th style={{ width: '23%' }}>Phân Cấp Tiện Ích</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAmenities.map((a) => {
                      const catType = a.category || 'basic';
                      return (
                        <tr key={a.id || a.code}>
                          {/* Name & Icon */}
                          <td>
                            <div className="adm-table-cat-cell">
                              <div className={`adm-table-amn-icon ${catType}`}>
                                {renderIcon(a.icon, TbSparkles)}
                              </div>
                              <div className="adm-table-cat-info">
                                <span className="adm-table-cat-title" title={a.name_vi}>
                                  {a.name_vi}
                                </span>
                                {a.name_en && a.name_en !== a.name_vi && (
                                  <span className="adm-table-cat-subtitle" title={a.name_en}>
                                    {a.name_en}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Code */}
                          <td>
                            <code className="adm-table-slug-code">#{a.code || 'amn'}</code>
                          </td>

                          {/* Tier Badge */}
                          <td>
                            <span className={`adm-amenity-tier-badge ${catType}`}>
                              {catType === 'luxury'
                                ? 'Hạng VIP (Luxury)'
                                : catType === 'standout'
                                ? 'Nổi Bật (Standout)'
                                : 'Cơ Bản (Basic)'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="adm-action-icon-btn delete"
                              onClick={() => handleDeleteAmenityPrompt(a)}
                              title={`Xóa tiện nghi "${a.name_vi}"`}
                            >
                              <TbTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            /* COMPACT GRID FOR AMENITIES */
            <div className="adm-clean-grid-container">
              {filteredAmenities.length === 0 ? (
                <div className="adm-clean-empty">
                  <TbSparkles className="adm-clean-empty-icon" />
                  <p>Không tìm thấy tiện nghi nào phù hợp.</p>
                </div>
              ) : (
                <div className="adm-amenities-clean-grid">
                  {filteredAmenities.map((a) => {
                    const catType = a.category || 'basic';
                    return (
                      <div key={a.id || a.code} className={`adm-amenity-clean-card ${catType}`}>
                        <div className={`adm-table-amn-icon ${catType}`}>
                          {renderIcon(a.icon, TbSparkles)}
                        </div>
                        <div className="adm-amenity-clean-meta">
                          <span className="adm-amenity-clean-name" title={a.name_vi}>
                            {a.name_vi}
                          </span>
                          <div className="adm-amenity-clean-sub">
                            {a.name_en && a.name_en !== a.name_vi && (
                              <span className="adm-amenity-clean-en" title={a.name_en}>
                                {a.name_en}
                              </span>
                            )}
                            <code className="adm-table-slug-code">#{a.code || 'amn'}</code>
                          </div>
                        </div>
                        <div className="adm-amenity-clean-right">
                          <span className={`adm-amenity-tier-badge-sm ${catType}`}>
                            {catType === 'luxury' ? 'VIP' : catType === 'standout' ? 'Nổi bật' : 'Cơ bản'}
                          </span>
                          <button
                            type="button"
                            className="adm-action-icon-btn delete"
                            onClick={() => handleDeleteAmenityPrompt(a)}
                            title={`Xóa tiện nghi "${a.name_vi}"`}
                          >
                            <TbTrash />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
