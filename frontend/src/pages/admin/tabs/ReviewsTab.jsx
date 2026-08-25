import React, { useState } from 'react';
import Pagination from '../Pagination';
import {
  TbStar,
  TbEyeOff,
  TbCheck,
} from 'react-icons/tb';

export const ReviewsTab = ({ reviews, onUpdateReviewStatus }) => {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  return (
    <div>
      {/* Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>Kiểm Duyệt Đánh Giá Radar</h1>
          <p>Giám sát {reviews.length} đánh giá trải nghiệm của khách</p>
        </div>
      </div>

      {/* Review Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reviews.slice((page - 1) * pageSize, page * pageSize).map((rev) => (
          <div key={rev.id} className="admin-card-box" style={{ padding: '1.25rem', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={rev.guest_avatar}
                  alt={rev.guest_name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>{rev.guest_name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Chỗ ở: <strong style={{ color: '#0ea5e9' }}>{rev.room_name}</strong> • {rev.created_at}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: '999px', fontWeight: 800, fontSize: '0.84rem' }}>
                  <TbStar style={{ color: '#f59e0b' }} />
                  <span>{rev.rating_overall}★</span>
                </div>
                <span className={`status-pill ${rev.status}`}>
                  {rev.status === 'approved' ? 'HIỂN THỊ' : rev.status === 'flagged' ? 'CẦN DUYỆT' : 'ĐÃ ẨN'}
                </span>
              </div>
            </div>

            {/* Radar 6 Breakdown pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '8px', marginBottom: '0.85rem', border: '1px solid #edf2f7' }}>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>Sạch sẽ: <strong>{rev.radar.cleanliness}★</strong></span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>Chính xác: <strong>{rev.radar.accuracy}★</strong></span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>Giao tiếp: <strong>{rev.radar.communication}★</strong></span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>Vị trí: <strong>{rev.radar.location}★</strong></span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>Nhận phòng: <strong>{rev.radar.checkin}★</strong></span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>Giá trị: <strong>{rev.radar.value}★</strong></span>
            </div>

            {/* Comment */}
            <p style={{ color: '#334155', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              "{rev.comment}"
            </p>

            {/* Host Response if any */}
            {rev.host_response && (
              <div style={{ background: '#f8fafc', borderLeft: '3px solid #ff385c', padding: '0.6rem 0.85rem', borderRadius: '0 6px 6px 0', marginBottom: '0.75rem', fontSize: '0.82rem', color: '#64748b' }}>
                <strong>Phản hồi chủ nhà:</strong> {rev.host_response}
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem' }}>
              {rev.status !== 'approved' && (
                <button
                  className="btn-action-icon success"
                  title="Cho phép hiển thị"
                  onClick={() => onUpdateReviewStatus(rev.id, 'approved')}
                >
                  <TbCheck />
                </button>
              )}
              {rev.status !== 'hidden' && (
                <button
                  className="btn-action-icon danger"
                  title="Ẩn bình luận"
                  onClick={() => onUpdateReviewStatus(rev.id, 'hidden')}
                >
                  <TbEyeOff />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.25rem', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #edf2f7' }}>
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
export default ReviewsTab;

