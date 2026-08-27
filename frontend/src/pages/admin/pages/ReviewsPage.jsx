import React, { useState } from 'react';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest | highest | lowest
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Reply Modal State
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter & Search Logic
  const filtered = reviews.filter((rev) => {
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

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'highest') {
      return (Number(b.rating_overall) || 0) - (Number(a.rating_overall) || 0);
    }
    if (sortBy === 'lowest') {
      return (Number(a.rating_overall) || 0) - (Number(b.rating_overall) || 0);
    }
    // newest
    return (b.id || 0) - (a.id || 0);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Counts for pills
  const countAll = reviews.length;
  const countApproved = reviews.filter((r) => r.status === 'approved').length;
  const countFlagged = reviews.filter((r) => r.status === 'flagged').length;
  const countHidden = reviews.filter((r) => r.status === 'hidden').length;

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

  return (
    <div>
      {/* Header */}
      <AdminPageHeader
        title="Kiểm Duyệt Đánh Giá Radar 6 Tiêu Chí"
        subtitle={`Giám sát chất lượng trải nghiệm của ${reviews.length} đánh giá từ cơ sở dữ liệu`}
      />

      {/* Filter & Search Bar */}
      <div
        className="admin-card-box"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setStatusFilter('all'); setPage(1); }}
              className={`filter-pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: statusFilter === 'all' ? '#ff385c' : '#e2e8f0',
                background: statusFilter === 'all' ? '#fff1f2' : '#ffffff',
                color: statusFilter === 'all' ? '#ff385c' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Tất cả ({countAll})
            </button>
            <button
              onClick={() => { setStatusFilter('approved'); setPage(1); }}
              className={`filter-pill-btn ${statusFilter === 'approved' ? 'active' : ''}`}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: statusFilter === 'approved' ? '#059669' : '#e2e8f0',
                background: statusFilter === 'approved' ? '#ecfdf5' : '#ffffff',
                color: statusFilter === 'approved' ? '#059669' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Đang hiển thị ({countApproved})
            </button>
            <button
              onClick={() => { setStatusFilter('flagged'); setPage(1); }}
              className={`filter-pill-btn ${statusFilter === 'flagged' ? 'active' : ''}`}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: statusFilter === 'flagged' ? '#d97706' : '#e2e8f0',
                background: statusFilter === 'flagged' ? '#fffbeb' : '#ffffff',
                color: statusFilter === 'flagged' ? '#d97706' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Cần duyệt ({countFlagged})
            </button>
            <button
              onClick={() => { setStatusFilter('hidden'); setPage(1); }}
              className={`filter-pill-btn ${statusFilter === 'hidden' ? 'active' : ''}`}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: statusFilter === 'hidden' ? '#64748b' : '#e2e8f0',
                background: statusFilter === 'hidden' ? '#f1f5f9' : '#ffffff',
                color: statusFilter === 'hidden' ? '#334155' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Đã ẩn ({countHidden})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '7px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                background: '#ffffff',
                color: '#334155',
                outline: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="highest">Điểm cao nhất (5★ → 1★)</option>
              <option value="lowest">Điểm thấp nhất (1★ → 5★)</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f8fafc',
            border: '1px solid #edf2f7',
            borderRadius: '9px',
            padding: '0.45rem 0.85rem',
          }}
        >
          <TbSearch style={{ color: '#94a3b8', fontSize: '1.1rem', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm theo tên khách, tên chỗ ở hoặc từ khóa trong nội dung đánh giá..."
            style={{
              border: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: '0.84rem',
              outline: 'none',
              color: '#0f172a',
              fontWeight: 500,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <TbX />
            </button>
          )}
        </div>
      </div>

      {/* Review Cards Feed */}
      {paginated.length === 0 ? (
        <div
          className="admin-card-box"
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.5 }}>📝</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
            Không tìm thấy đánh giá nào
          </div>
          <div style={{ fontSize: '0.84rem' }}>
            Vui lòng thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {paginated.map((rev) => {
            const radar = rev.radar || {};
            const cleanliness = radar.cleanliness ?? 5;
            const accuracy = radar.accuracy ?? 5;
            const communication = radar.communication ?? 5;
            const location = radar.location ?? 5;
            const checkin = radar.checkin ?? 5;
            const value = radar.value ?? 5;
            const ratingNum = Number(rev.rating_overall) || 5;

            return (
              <div key={rev.id} className="admin-card-box" style={{ padding: '1.25rem', marginBottom: 0 }}>
                {/* Top row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={rev.guest_avatar}
                      alt={rev.guest_name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                      }}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid #e2e8f0',
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem' }}>
                        {rev.guest_name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px' }}>
                        Chỗ ở: <strong style={{ color: '#0284c7' }}>{rev.room_name}</strong>
                        {rev.sub_room_name && rev.sub_room_name !== rev.room_name && (
                          <span style={{ color: '#94a3b8' }}> ({rev.sub_room_name})</span>
                        )}
                        {' '}• {rev.created_at}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        background: '#fffbeb',
                        color: '#b45309',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontWeight: 800,
                        fontSize: '0.86rem',
                        border: '1px solid #fef3c7',
                      }}
                    >
                      <TbStarFilled style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
                      <span>{ratingNum.toFixed(2).replace(/\.00$/, '')}★</span>
                    </div>
                    <span className={`status-pill ${rev.status}`}>
                      {rev.status === 'approved' ? 'HIỂN THỊ' : rev.status === 'flagged' ? 'CẦN DUYỆT' : 'ĐÃ ẨN'}
                    </span>
                  </div>
                </div>

                {/* Radar 6 Breakdown pills */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    background: '#f8fafc',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    marginBottom: '0.85rem',
                    border: '1px solid #edf2f7',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                    Sạch sẽ: <strong style={{ color: '#0f172a' }}>{cleanliness}★</strong>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                    Chính xác: <strong style={{ color: '#0f172a' }}>{accuracy}★</strong>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                    Giao tiếp: <strong style={{ color: '#0f172a' }}>{communication}★</strong>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                    Vị trí: <strong style={{ color: '#0f172a' }}>{location}★</strong>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                    Nhận phòng: <strong style={{ color: '#0f172a' }}>{checkin}★</strong>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                    Giá trị: <strong style={{ color: '#0f172a' }}>{value}★</strong>
                  </span>
                </div>

                {/* Comment Content */}
                <p
                  style={{
                    color: '#334155',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    marginBottom: '0.75rem',
                    fontStyle: 'normal',
                  }}
                >
                  "{rev.comment}"
                </p>

                {/* Host Response Section */}
                {rev.host_response && (
                  <div
                    style={{
                      background: '#f8fafc',
                      borderLeft: '3px solid #ff385c',
                      padding: '0.65rem 0.95rem',
                      borderRadius: '0 8px 8px 0',
                      marginBottom: '0.75rem',
                      fontSize: '0.82rem',
                      color: '#475569',
                      lineHeight: 1.45,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <strong style={{ color: '#ff385c' }}>Phản hồi từ chủ nhà:</strong>
                      {rev.host_responded_at && (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{rev.host_responded_at}</span>
                      )}
                    </div>
                    {rev.host_response}
                  </div>
                )}

                {/* Action Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.75rem',
                    marginTop: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenReply(rev)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        color: '#475569',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      title="Soạn hoặc chỉnh sửa phản hồi của chủ nhà"
                    >
                      <TbMessageDots style={{ fontSize: '0.95rem', color: '#0284c7' }} />
                      <span>{rev.host_response ? 'Sửa phản hồi' : 'Phản hồi'}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {rev.status !== 'approved' && (
                      <button
                        className="btn-action-icon success"
                        title="Cho phép hiển thị đánh giá"
                        onClick={() => onUpdateReviewStatus(rev.id, 'approved')}
                      >
                        <TbCheck />
                      </button>
                    )}
                    {rev.status !== 'hidden' && (
                      <button
                        className="btn-action-icon danger"
                        title="Ẩn đánh giá vi phạm"
                        onClick={() => onUpdateReviewStatus(rev.id, 'hidden')}
                      >
                        <TbEyeOff />
                      </button>
                    )}
                    {rev.status !== 'flagged' && (
                      <button
                        className="btn-action-icon warning"
                        title="Gắn cờ cần xem xét"
                        onClick={() => onUpdateReviewStatus(rev.id, 'flagged')}
                      >
                        <TbFlag />
                      </button>
                    )}
                    {onDeleteReview && (
                      <button
                        className="btn-action-icon"
                        style={{ color: '#ef4444' }}
                        title="Xóa vĩnh viễn đánh giá"
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

      {/* Pagination wrapper */}
      <div className="admin-card-box" style={{ padding: 0 }}>
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
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="admin-card-box"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Phản Hồi Đánh Giá Của Khách
              </h3>
              <button
                onClick={() => setReplyTarget(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '1.25rem' }}
              >
                <TbX />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.82rem', color: '#475569' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                {replyTarget.guest_name} • {replyTarget.room_name} ({replyTarget.rating_overall}★)
              </div>
              <div style={{ fontStyle: 'italic' }}>"{replyTarget.comment}"</div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Nội dung phản hồi từ Chủ nhà / Admin:
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập lời cảm ơn hoặc giải đáp thắc mắc của khách du lịch..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setReplyTarget(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveReply}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff385c 0%, #e00b41 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 56, 92, 0.3)',
                }}
              >
                Lưu Phản Hồi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <AdminConfirmDialog
          isOpen={true}
          title="Xác Nhận Xóa Đánh Giá"
          message={`Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá của khách "${deleteTarget.guest_name}" tại "${deleteTarget.room_name}"? Thao tác này không thể khôi phục.`}
          confirmLabel="Xóa Vĩnh Viễn"
          cancelLabel="Hủy"
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default ReviewsPage;
