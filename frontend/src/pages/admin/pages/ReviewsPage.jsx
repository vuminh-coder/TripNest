import React, { useState, useMemo } from 'react';
import './ReviewsPage.css';
import {
  TbStar,
  TbStarFilled,
  TbEyeOff,
  TbEye,
  TbCheck,
  TbFlag,
  TbTrash,
  TbMessageDots,
  TbSearch,
  TbFilter,
  TbX,
  TbSparkles,
  TbAlertTriangle,
  TbThumbUp,
  TbBuildingEstate,
} from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import Pagination from '../Pagination';
import AdminConfirmDialog from '../common/AdminConfirmDialog';

export const ReviewsPage = ({
  reviews = [],
  onUpdateReviewStatus,
  onDeleteReview,
  onRespondReview,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | approved | flagged | hidden
  const [sortBy, setSortBy] = useState('newest'); // newest | highest | lowest
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Reply Modal State
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Statistics KPI calculations
  const totalReviews = reviews.length;
  const avgRating = useMemo(() => {
    if (!reviews.length) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating_overall) || 5), 0);
    return (sum / reviews.length).toFixed(2);
  }, [reviews]);

  const countApproved = reviews.filter((r) => r.status === 'approved').length;
  const countFlagged = reviews.filter((r) => r.status === 'flagged').length;
  const countHidden = reviews.filter((r) => r.status === 'hidden').length;
  const countResponded = reviews.filter((r) => Boolean(r.host_response)).length;
  const responseRate = totalReviews > 0 ? Math.round((countResponded / totalReviews) * 100) : 0;

  // Filter & Search Logic
  const filtered = useMemo(() => {
    return reviews.filter((rev) => {
      if (statusFilter !== 'all' && rev.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchGuest = (rev.guest_name || '').toLowerCase().includes(q);
        const matchRoom = (rev.room_name || '').toLowerCase().includes(q);
        const matchComment = (rev.comment || '').toLowerCase().includes(q);
        if (!matchGuest && !matchRoom && !matchComment) return false;
      }
      return true;
    });
  }, [reviews, statusFilter, search]);

  // Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'highest') {
        return (Number(b.rating_overall) || 0) - (Number(a.rating_overall) || 0);
      }
      if (sortBy === 'lowest') {
        return (Number(a.rating_overall) || 0) - (Number(b.rating_overall) || 0);
      }
      // newest by id
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = useMemo(() => {
    return sorted.slice((page - 1) * pageSize, page * pageSize);
  }, [sorted, page, pageSize]);

  const handleOpenReply = (rev) => {
    setReplyTarget(rev);
    setReplyText(rev.host_response || '');
  };

  const handleSaveReply = () => {
    if (replyTarget && onRespondReview) {
      onRespondReview(replyTarget.id, replyText);
      setReplyTarget(null);
      setReplyText('');
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget && onDeleteReview) {
      onDeleteReview(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const RADAR_LABELS = [
    { key: 'cleanliness', label: 'Sạch sẽ' },
    { key: 'accuracy', label: 'Chính xác' },
    { key: 'communication', label: 'Giao tiếp' },
    { key: 'location', label: 'Vị trí' },
    { key: 'checkin', label: 'Nhận phòng' },
    { key: 'value', label: 'Giá trị' },
  ];

  return (
    <div className="adm-reviews-container">
      {/* Header */}
      <AdminPageHeader
        title="Kiểm Duyệt Đánh Giá Radar 6 Tiêu Chí"
        subtitle={`Giám sát và kiểm duyệt toàn bộ ${totalReviews} đánh giá khách hàng theo tiêu chuẩn chất lượng Airbnb`}
      />

      {/* 4 KPI Summary Cards */}
      <div className="adm-rev-kpi-grid">
        <div className="adm-rev-kpi-card blue">
          <div className="adm-rev-kpi-icon">
            <TbSparkles />
          </div>
          <div className="adm-rev-kpi-info">
            <span className="adm-rev-kpi-label">Tổng Số Đánh Giá</span>
            <span className="adm-rev-kpi-val">{totalReviews}</span>
          </div>
        </div>

        <div className="adm-rev-kpi-card gold">
          <div className="adm-rev-kpi-icon">
            <TbStarFilled />
          </div>
          <div className="adm-rev-kpi-info">
            <span className="adm-rev-kpi-label">Điểm Trung Bình Toàn Sàn</span>
            <span className="adm-rev-kpi-val">{avgRating} ★</span>
          </div>
        </div>

        <div className="adm-rev-kpi-card green">
          <div className="adm-rev-kpi-icon">
            <TbThumbUp />
          </div>
          <div className="adm-rev-kpi-info">
            <span className="adm-rev-kpi-label">Tỷ Lệ Phản Hồi Chủ Nhà</span>
            <span className="adm-rev-kpi-val">{responseRate}% ({countResponded}/{totalReviews})</span>
          </div>
        </div>

        <div className="adm-rev-kpi-card amber">
          <div className="adm-rev-kpi-icon">
            <TbAlertTriangle />
          </div>
          <div className="adm-rev-kpi-info">
            <span className="adm-rev-kpi-label">Cần Xem Xét / Gắn Cờ</span>
            <span className="adm-rev-kpi-val">{countFlagged}</span>
          </div>
        </div>
      </div>

      {/* Filter, Search & Sorting Toolbar */}
      <div className="admin-card-box adm-rev-toolbar-box">
        <div className="adm-rev-toolbar-top">
          {/* Status Filter Tabs */}
          <div className="adm-rev-filter-tabs">
            <button
              onClick={() => { setStatusFilter('all'); setPage(1); }}
              className={`adm-rev-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            >
              Tất cả ({totalReviews})
            </button>
            <button
              onClick={() => { setStatusFilter('approved'); setPage(1); }}
              className={`adm-rev-filter-pill approved ${statusFilter === 'approved' ? 'active' : ''}`}
            >
              Đang hiển thị ({countApproved})
            </button>
            <button
              onClick={() => { setStatusFilter('flagged'); setPage(1); }}
              className={`adm-rev-filter-pill flagged ${statusFilter === 'flagged' ? 'active' : ''}`}
            >
              Cần duyệt ({countFlagged})
            </button>
            <button
              onClick={() => { setStatusFilter('hidden'); setPage(1); }}
              className={`adm-rev-filter-pill hidden ${statusFilter === 'hidden' ? 'active' : ''}`}
            >
              Đã ẩn ({countHidden})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="adm-rev-sort-wrap">
            <span className="adm-rev-sort-label">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="adm-rev-sort-select"
            >
              <option value="newest">Mới nhất</option>
              <option value="highest">Điểm cao nhất (5★ → 1★)</option>
              <option value="lowest">Điểm thấp nhất (1★ → 5★)</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="adm-rev-search-bar">
          <TbSearch className="adm-rev-search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm theo tên khách hàng, chỗ ở hoặc nội dung nhận xét..."
            className="adm-rev-search-input"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="adm-rev-clear-btn"
              title="Xóa tìm kiếm"
            >
              <TbX />
            </button>
          )}
        </div>
      </div>

      {/* Review Feed List */}
      {paginated.length === 0 ? (
        <div className="admin-card-box adm-rev-empty-box">
          <div className="adm-rev-empty-icon">📝</div>
          <h4 className="adm-rev-empty-title">Không tìm thấy đánh giá nào</h4>
          <p className="adm-rev-empty-desc">
            Vui lòng thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="adm-rev-list">
          {paginated.map((rev) => {
            const radar = rev.radar || {};
            const ratingNum = Number(rev.rating_overall) || 5;

            return (
              <div key={rev.id} className="admin-card-box adm-rev-card">
                {/* Header row */}
                <div className="adm-rev-card-header">
                  <div className="adm-rev-author-wrap">
                    <img
                      src={rev.guest_avatar}
                      alt={rev.guest_name}
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                      }}
                      className="adm-rev-author-img"
                    />
                    <div className="adm-rev-author-text">
                      <div className="adm-rev-author-name">{rev.guest_name}</div>
                      <div className="adm-rev-author-meta">
                        <TbBuildingEstate className="adm-rev-room-icon" />
                        <span className="adm-rev-room-name">{rev.room_name}</span>
                        {rev.sub_room_name && rev.sub_room_name !== rev.room_name && (
                          <span className="adm-rev-subroom-name"> ({rev.sub_room_name})</span>
                        )}
                        <span className="adm-rev-meta-sep">•</span>
                        <span>{rev.created_at}</span>
                      </div>
                    </div>
                  </div>

                  <div className="adm-rev-header-badges">
                    <div className="adm-rev-score-badge">
                      <TbStarFilled />
                      <span>{ratingNum.toFixed(2).replace(/\.00$/, '')}★</span>
                    </div>
                    <span className={`adm-rev-status-tag ${rev.status}`}>
                      {rev.status === 'approved'
                        ? 'HIỂN THỊ'
                        : rev.status === 'flagged'
                        ? 'CẦN DUYỆT'
                        : 'ĐÃ ẨN'}
                    </span>
                  </div>
                </div>

                {/* Radar 6 Dimensions Mini Visualizer */}
                <div className="adm-rev-radar-grid">
                  {RADAR_LABELS.map((item) => {
                    const val = Number(radar[item.key] ?? 5);
                    const pct = Math.min(100, Math.max(0, (val / 5) * 100));
                    const colorClass =
                      val >= 4.5 ? 'high' : val >= 3.5 ? 'medium' : 'low';

                    return (
                      <div key={item.key} className="adm-rev-radar-cell">
                        <div className="adm-rev-radar-cell-top">
                          <span className="adm-rev-radar-cell-lbl">{item.label}</span>
                          <span className={`adm-rev-radar-cell-val ${colorClass}`}>
                            {val.toFixed(1)}★
                          </span>
                        </div>
                        <div className="adm-rev-radar-bar-bg">
                          <div
                            className={`adm-rev-radar-bar-fill ${colorClass}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Comment Content */}
                <p className="adm-rev-comment-text">"{rev.comment}"</p>

                {/* Host Response Box */}
                {rev.host_response && (
                  <div className="adm-rev-host-response-box">
                    <div className="adm-rev-host-response-head">
                      <strong className="adm-rev-host-label">
                        <TbMessageDots /> Phản hồi từ Chủ nhà / Admin:
                      </strong>
                      {rev.host_responded_at && (
                        <span className="adm-rev-host-time">{rev.host_responded_at}</span>
                      )}
                    </div>
                    <div className="adm-rev-host-content">{rev.host_response}</div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="adm-rev-card-footer">
                  <button
                    onClick={() => handleOpenReply(rev)}
                    className="adm-rev-reply-btn"
                    title="Soạn hoặc chỉnh sửa phản hồi"
                  >
                    <TbMessageDots />
                    <span>{rev.host_response ? 'Sửa phản hồi' : 'Gửi phản hồi'}</span>
                  </button>

                  <div className="adm-rev-actions-group">
                    {rev.status !== 'approved' && (
                      <button
                        className="adm-rev-act-btn approve"
                        title="Duyệt cho phép hiển thị trên website"
                        onClick={() => onUpdateReviewStatus(rev.id, 'approved')}
                      >
                        <TbCheck />
                        <span>Duyệt</span>
                      </button>
                    )}

                    {rev.status !== 'flagged' && (
                      <button
                        className="adm-rev-act-btn flag"
                        title="Gắn cờ nghi vấn cần xem xét"
                        onClick={() => onUpdateReviewStatus(rev.id, 'flagged')}
                      >
                        <TbFlag />
                        <span>Gắn cờ</span>
                      </button>
                    )}

                    {rev.status !== 'hidden' && (
                      <button
                        className="adm-rev-act-btn hide"
                        title="Tạm ẩn đánh giá khỏi trang chi tiết phòng"
                        onClick={() => onUpdateReviewStatus(rev.id, 'hidden')}
                      >
                        <TbEyeOff />
                        <span>Ẩn</span>
                      </button>
                    )}

                    {onDeleteReview && (
                      <button
                        className="adm-rev-act-btn delete"
                        title="Xóa vĩnh viễn đánh giá này"
                        onClick={() => setDeleteTarget(rev)}
                      >
                        <TbTrash />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="admin-card-box adm-rev-pagination-card">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={sorted.length}
          pageSize={pageSize}
          label="đánh giá"
        />
      </div>

      {/* Host Response Reply Modal */}
      {replyTarget && (
        <div
          className="adm-modal-overlay"
          onClick={() => setReplyTarget(null)}
        >
          <div
            className="adm-modal-container adm-rev-reply-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header">
              <div className="adm-rev-modal-title-wrap">
                <div className="adm-rev-modal-icon">
                  <TbMessageDots />
                </div>
                <div>
                  <h3 className="adm-modal-title">Phản Hồi Đánh Giá Của Khách</h3>
                  <p className="adm-modal-subtitle">
                    Lời phản hồi sẽ hiển thị công khai dưới nhận xét của khách du lịch
                  </p>
                </div>
              </div>
              <button
                className="adm-modal-close-btn"
                onClick={() => setReplyTarget(null)}
              >
                <TbX />
              </button>
            </div>

            <div className="adm-modal-form">
              <div className="adm-rev-modal-quote-box">
                <div className="adm-rev-quote-meta">
                  <strong>{replyTarget.guest_name}</strong> • {replyTarget.room_name} ({replyTarget.rating_overall}★)
                </div>
                <div className="adm-rev-quote-text">"{replyTarget.comment}"</div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">
                  Nội dung phản hồi công khai <span className="adm-required">*</span>
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Gửi lời cảm ơn chân thành hoặc giải thích các biện pháp cải thiện trải nghiệm..."
                  rows={4}
                  className="adm-form-textarea"
                />
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={() => setReplyTarget(null)}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-primary"
                  onClick={handleSaveReply}
                >
                  <TbCheck />
                  <span>Lưu Phản Hồi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <AdminConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Xác Nhận Xóa Đánh Giá"
          message={`Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá của khách "${deleteTarget.guest_name}" tại "${deleteTarget.room_name}"? Thao tác này không thể khôi phục.`}
          confirmText="Xóa Vĩnh Viễn"
          cancelText="Hủy Bỏ"
          type="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default ReviewsPage;
