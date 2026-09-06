import React, { useState, useMemo } from 'react';
import './ExperiencesPage.css';
import {
  TbClock,
  TbMapPin,
  TbPlus,
  TbSearch,
  TbFilter,
  TbSparkles,
  TbCompass,
  TbCoins,
  TbAlertCircle,
  TbEdit,
  TbTrash,
  TbStarFilled,
  TbUserCheck,
  TbX,
  TbRefresh,
} from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import AdminConfirmDialog from '../common/AdminConfirmDialog';
import ExperienceModal from '../modals/ExperienceModal';

export const ExperiencesPage = ({
  experiences = [],
  hosts = [],
  onToggleActive,
  onCreateExperience,
  onUpdateExperience,
  onDeleteExperience,
}) => {
  const formatVND = (val) => `${(Number(val) || 0).toLocaleString('vi-VN')} ₫`;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Calculate 4 KPI Metrics
  const kpiStats = useMemo(() => {
    const total = experiences.length;
    const activeCount = experiences.filter((e) => e.is_active).length;
    const inactiveCount = experiences.filter((e) => !e.is_active).length;
    const avgPrice =
      total > 0
        ? Math.round(
            experiences.reduce(
              (sum, e) =>
                sum + Number(e.priceVND || e.price || e.price_per_person || 0),
              0
            ) / total
          )
        : 0;

    return { total, activeCount, inactiveCount, avgPrice };
  }, [experiences]);

  // Distinct cities list for filter dropdown
  const cities = useMemo(() => {
    const unique = new Set(experiences.map((e) => e.city).filter(Boolean));
    return Array.from(unique);
  }, [experiences]);

  // Filtered List
  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      const title = (exp.title_vi || exp.title || '').toLowerCase();
      const city = (exp.city || '').toLowerCase();
      const hostName = (exp.host?.name || '').toLowerCase();
      const caption = (exp.caption || '').toLowerCase();
      const query = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        city.includes(query) ||
        hostName.includes(query) ||
        caption.includes(query);

      const matchesCity = cityFilter === 'all' || exp.city === cityFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? exp.is_active : !exp.is_active);

      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [experiences, searchTerm, cityFilter, statusFilter]);

  // Modal Handlers
  const handleOpenCreateModal = () => {
    setEditingExperience(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exp) => {
    setEditingExperience(exp);
    setIsModalOpen(true);
  };

  const handleSaveExperience = async (payload, id) => {
    if (id) {
      if (onUpdateExperience) {
        await onUpdateExperience(payload, id);
      }
    } else {
      if (onCreateExperience) {
        await onCreateExperience(payload);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget && onDeleteExperience) {
      await onDeleteExperience(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCityFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="adm-experiences-container">
      {/* Header */}
      <AdminPageHeader
        title="Trải Nghiệm & Tour Du Lịch"
        subtitle={`Quản lý ${experiences.length} hoạt động tour khám phá văn hóa và ẩm thực địa phương`}
      />

      {/* 4 Financial & Operational KPI Cards */}
      <div className="adm-exp-kpi-grid">
        {/* Card 1: Tổng tour */}
        <div className="stat-card-glass adm-exp-kpi-card">
          <div className="adm-exp-kpi-info">
            <span className="stat-label">Tổng Tour Trải Nghiệm</span>
            <div className="stat-value">{kpiStats.total}</div>
            <div className="adm-exp-kpi-sub">Tour du lịch & workshop</div>
          </div>
          <div className="stat-icon-wrap blue">
            <TbCompass />
          </div>
        </div>

        {/* Card 2: Đang mở bán */}
        <div className="stat-card-glass adm-exp-kpi-card">
          <div className="adm-exp-kpi-info">
            <span className="stat-label">Đang Mở Bán</span>
            <div className="stat-value adm-exp-val-green">
              {kpiStats.activeCount}
            </div>
            <div className="adm-exp-sub-green adm-exp-kpi-sub">
              Hiển thị trên sàn TripNest
            </div>
          </div>
          <div className="stat-icon-wrap green">
            <TbSparkles />
          </div>
        </div>

        {/* Card 3: Tạm dừng hoạt động */}
        <div className="stat-card-glass adm-exp-kpi-card">
          <div className="adm-exp-kpi-info">
            <span className="stat-label">Tạm Dừng Hoạt Động</span>
            <div className="stat-value adm-exp-val-amber">
              {kpiStats.inactiveCount}
            </div>
            <div className="adm-exp-sub-amber adm-exp-kpi-sub">
              Tạm ẩn khỏi khách hàng
            </div>
          </div>
          <div className="stat-icon-wrap amber">
            <TbAlertCircle />
          </div>
        </div>

        {/* Card 4: Giá vé trung bình */}
        <div className="stat-card-glass adm-exp-kpi-card">
          <div className="adm-exp-kpi-info">
            <span className="stat-label">Giá Vé Trung Bình</span>
            <div className="stat-value adm-exp-val-pink">
              {formatVND(kpiStats.avgPrice)}
            </div>
            <div className="adm-exp-kpi-sub">Giá vé / khách / trải nghiệm</div>
          </div>
          <div className="stat-icon-wrap pink">
            <TbCoins />
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="admin-card-box adm-exp-filter-box">
        <div className="adm-exp-filter-bar">
          {/* Search Input */}
          <div className="adm-exp-search-wrap">
            <TbSearch className="adm-exp-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên tour, thành phố, tên chủ tour..."
              className="adm-exp-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="adm-exp-clear-search"
                onClick={() => setSearchTerm('')}
              >
                <TbX />
              </button>
            )}
          </div>

          {/* City Filter */}
          <div className="adm-exp-select-wrap">
            <TbMapPin className="adm-exp-select-icon" />
            <select
              className="adm-exp-select"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="all">Tất cả điểm đến ({cities.length})</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="adm-exp-select-wrap">
            <TbFilter className="adm-exp-select-icon" />
            <select
              className="adm-exp-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang mở bán ({kpiStats.activeCount})</option>
              <option value="inactive">Tạm dừng ({kpiStats.inactiveCount})</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || cityFilter !== 'all' || statusFilter !== 'all') && (
            <button
              className="adm-btn adm-btn-secondary adm-exp-reset-btn"
              onClick={handleResetFilters}
              title="Đặt lại bộ lọc"
            >
              <TbRefresh />
              <span>Đặt lại</span>
            </button>
          )}

          {/* Add New Experience Button */}
          <button
            className="adm-btn adm-btn-primary adm-exp-add-btn"
            onClick={handleOpenCreateModal}
          >
            <TbPlus />
            <span>Thêm Trải Nghiệm Mới</span>
          </button>
        </div>
      </div>

      {/* Grid of Experiences */}
      {filteredExperiences.length > 0 ? (
        <div className="adm-exp-grid">
          {filteredExperiences.map((exp) => {
            const price = Number(
              exp.priceVND || exp.price || exp.rentVND || exp.price_per_person || 0
            );
            const host = exp.host;
            const hostName = host?.name || 'Chủ tour địa phương';
            const hostAvatar =
              host?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120';

            return (
              <div key={exp.id} className="admin-card-box adm-exp-card">
                {/* Media Box */}
                <div className="adm-exp-media">
                  <img
                    src={
                      exp.image ||
                      exp.image_url ||
                      exp.background ||
                      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
                    }
                    alt={exp.title_vi || exp.title}
                    className="adm-exp-img"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800';
                    }}
                  />

                  {/* Rating Tag */}
                  <div className="adm-exp-rating-badge">
                    <TbStarFilled className="adm-exp-star-icon" />
                    <span>{exp.rating || 5.0}</span>
                    <span className="adm-exp-reviews-num">
                      ({exp.reviews_count || 0})
                    </span>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`status-pill ${
                      exp.is_active ? 'active' : 'paused'
                    } adm-exp-status-pill`}
                  >
                    {exp.is_active ? 'ĐANG MỞ BÁN' : 'TẠM DỪNG'}
                  </span>
                </div>

                {/* Content Box */}
                <div className="adm-exp-content">
                  <div className="adm-exp-meta-row">
                    <TbMapPin className="adm-exp-pin-icon" />
                    <span className="adm-exp-city-tag">{exp.city}</span>
                    <span className="adm-exp-dot">•</span>
                    <TbClock className="adm-exp-clock-icon" />
                    <span>{exp.duration_hours || exp.duration || 3} giờ</span>
                  </div>

                  <h3
                    className="adm-exp-title"
                    title={exp.title_vi || exp.title}
                  >
                    {exp.title_vi || exp.title}
                  </h3>

                  <p className="adm-exp-caption" title={exp.caption}>
                    {exp.caption || exp.description || 'Trải nghiệm du lịch khám phá'}
                  </p>

                  {/* Host Info Badge */}
                  <div className="adm-exp-host-row">
                    <img
                      src={hostAvatar}
                      alt={hostName}
                      className="adm-exp-host-avatar"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120';
                      }}
                    />
                    <div className="adm-exp-host-info">
                      <span className="adm-exp-host-label">Phụ trách tour:</span>
                      <strong className="adm-exp-host-name">{hostName}</strong>
                    </div>
                    {host?.is_superhost && (
                      <span className="adm-exp-superhost-pill" title="Superhost">
                        <TbUserCheck />
                        <span>Superhost</span>
                      </span>
                    )}
                  </div>

                  {/* Footer: Price & Actions */}
                  <div className="adm-exp-footer-row">
                    <div className="adm-exp-price-block">
                      <div className="adm-exp-price-label">Giá vé / khách</div>
                      <strong className="adm-exp-price-val">
                        {formatVND(price)}
                      </strong>
                    </div>

                    <div className="adm-exp-actions-group">
                      {/* Toggle Active Button */}
                      <button
                        className={`adm-exp-toggle-btn ${
                          exp.is_active ? 'active' : 'paused'
                        }`}
                        onClick={() => onToggleActive && onToggleActive(exp.id)}
                        title={
                          exp.is_active
                            ? 'Tạm dừng mở bán tour'
                            : 'Kích hoạt mở bán tour'
                        }
                      >
                        {exp.is_active ? 'Tạm Ẩn' : 'Mở Bán'}
                      </button>

                      {/* Edit Button */}
                      <button
                        className="adm-exp-action-icon-btn edit"
                        onClick={() => handleOpenEditModal(exp)}
                        title="Chỉnh sửa thông tin tour"
                      >
                        <TbEdit />
                      </button>

                      {/* Delete Button */}
                      <button
                        className="adm-exp-action-icon-btn delete"
                        onClick={() => setDeleteTarget(exp)}
                        title="Xóa tour trải nghiệm"
                      >
                        <TbTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="admin-card-box adm-exp-empty-box">
          <div className="adm-exp-empty-icon">
            <TbCompass />
          </div>
          <h3>Không tìm thấy trải nghiệm phù hợp</h3>
          <p>
            Thử thay đổi từ khóa tìm kiếm, bộ lọc điểm đến hoặc xóa bộ lọc để xem
            danh sách đầy đủ.
          </p>
          <button
            className="adm-btn adm-btn-secondary"
            onClick={handleResetFilters}
          >
            Xóa Tất Cả Bộ Lọc
          </button>
        </div>
      )}

      {/* Experience Create / Edit Modal */}
      <ExperienceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExperience}
        experience={editingExperience}
        hosts={hosts}
      />

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xóa Tour Trải Nghiệm"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn tour "${deleteTarget?.title_vi || deleteTarget?.title}"? Thao tác này sẽ loại bỏ tour khỏi cơ sở dữ liệu và không thể khôi phục.`}
        confirmText="Xóa Vĩnh Viễn"
        cancelText="Hủy Bỏ"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ExperiencesPage;
