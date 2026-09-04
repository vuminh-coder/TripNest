import React, { useState } from 'react';
import './ReviewsPage.css';
import { TbStar, TbEyeOff, TbCheck } from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import Pagination from '../Pagination';

export const ReviewsPage = ({ reviews, onUpdateReviewStatus }) => {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const paginated = reviews.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="adm-reviews-container">
      {/* Header */}
      <AdminPageHeader
        title="Kiểm Duyệt Đánh Giá Radar 6 Tiêu Chí"
        subtitle={`Giám sát chất lượng trải nghiệm của ${reviews.length} đánh giá`}
      />

      {/* Review Cards */}
      <div className="adm-rev-list">
        {paginated.map((rev) => (
          <div key={rev.id} className="admin-card-box adm-rev-card">
            {/* Top row */}
            <div className="adm-rev-top-row">
              <div className="adm-rev-author-info">
                <img
                  src={rev.guest_avatar}
                  alt={rev.guest_name}
                  className="adm-rev-avatar"
                />
                <div>
                  <div className="adm-rev-guest-name">{rev.guest_name}</div>
                  <div className="adm-rev-sub-meta">
                    Chỗ ở: <strong className="adm-rev-room-name">{rev.room_name}</strong> • {rev.created_at}
                  </div>
                </div>
              </div>

              <div className="adm-rev-badges-wrap">
                <div className="adm-rev-score-badge">
                  <TbStar className="adm-rev-star-icon" />
                  <span>{rev.rating_overall}★</span>
                </div>
                <span className={`status-pill ${rev.status}`}>
                  {rev.status === 'approved' ? 'HIỂN THỊ' : rev.status === 'flagged' ? 'CẦN DUYỆT' : 'ĐÃ ẨN'}
                </span>
              </div>
            </div>

            {/* Radar 6 Breakdown pills */}
            <div className="adm-rev-radar-strip">
              <span className="adm-rev-radar-item">Sạch sẽ: <strong>{rev.radar.cleanliness}★</strong></span>
              <span className="adm-rev-dot-sep">•</span>
              <span className="adm-rev-radar-item">Chính xác: <strong>{rev.radar.accuracy}★</strong></span>
              <span className="adm-rev-dot-sep">•</span>
              <span className="adm-rev-radar-item">Giao tiếp: <strong>{rev.radar.communication}★</strong></span>
              <span className="adm-rev-dot-sep">•</span>
              <span className="adm-rev-radar-item">Vị trí: <strong>{rev.radar.location}★</strong></span>
              <span className="adm-rev-dot-sep">•</span>
              <span className="adm-rev-radar-item">Nhận phòng: <strong>{rev.radar.checkin}★</strong></span>
              <span className="adm-rev-dot-sep">•</span>
              <span className="adm-rev-radar-item">Giá trị: <strong>{rev.radar.value}★</strong></span>
            </div>

            {/* Comment */}
            <p className="adm-rev-comment">
              "{rev.comment}"
            </p>

            {/* Host Response */}
            {rev.host_response && (
              <div className="adm-rev-host-reply-box">
                <strong>Phản hồi chủ nhà:</strong> {rev.host_response}
              </div>
            )}

            {/* Action Bar */}
            <div className="adm-rev-actions-bar">
              {rev.status !== 'approved' && (
                <button
                  className="btn-action-icon success"
                  title="Cho phép hiển thị bình luận"
                  onClick={() => onUpdateReviewStatus(rev.id, 'approved')}
                >
                  <TbCheck />
                </button>
              )}
              {rev.status !== 'hidden' && (
                <button
                  className="btn-action-icon danger"
                  title="Ẩn bình luận vi phạm"
                  onClick={() => onUpdateReviewStatus(rev.id, 'hidden')}
                >
                  <TbEyeOff />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination wrapper */}
      <div className="admin-card-box adm-rev-pagination-box">
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(reviews.length / pageSize)}
          onPageChange={setPage}
          totalItems={reviews.length}
          pageSize={pageSize}
          label="đánh giá"
        />
      </div>
    </div>
  );
};

export default ReviewsPage;
