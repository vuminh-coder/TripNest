import React from 'react';
import './ViewReviewModal.css';
import {
  TbX,
  TbStarFilled,
  TbCircleCheck,
  TbQuote,
  TbSparkles,
  TbTarget,
  TbMessage2,
  TbMapPin,
  TbKey,
  TbReceipt2,
} from 'react-icons/tb';

export const ViewReviewModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const review = booking.review || booking.userReview || {
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    checkin: 5,
    value: 5,
    comment: booking.reviewComment || 'Không gian tuyệt vời, chủ nhà rất thân thiện và chu đáo!',
    createdAt: new Date().toISOString(),
  };

  const score = (
    ((review.cleanliness || 5) +
      (review.accuracy || 5) +
      (review.communication || 5) +
      (review.location || 5) +
      (review.checkin || 5) +
      (review.value || 5)) /
    6
  ).toFixed(1);

  const criteria = [
    { label: 'Độ Sạch Sẽ', val: review.cleanliness || 5, icon: TbSparkles, color: '#0d9488' },
    { label: 'Độ Chính Xác', val: review.accuracy || 5, icon: TbTarget, color: '#ff385c' },
    { label: 'Giao Tiếp', val: review.communication || 5, icon: TbMessage2, color: '#0284c7' },
    { label: 'Vị Trí Chỗ Nghỉ', val: review.location || 5, icon: TbMapPin, color: '#d97706' },
    { label: 'Nhận Phòng', val: review.checkin || 5, icon: TbKey, color: '#7c3aed' },
    { label: 'Giá Trị', val: review.value || 5, icon: TbReceipt2, color: '#059669' },
  ];

  return (
    <div className="view-review-overlay" onClick={onClose}>
      <div className="view-review-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="view-review-header">
          <div>
            <h3>
              <TbCircleCheck style={{ color: '#059669' }} /> Bài Đánh Giá Đã Công Bố
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
              Đơn đặt phòng: <strong style={{ color: '#0f172a' }}>{booking.roomTitle}</strong> (#{booking.id})
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <TbX />
          </button>
        </div>

        {/* Body */}
        <div className="view-review-body">
          {/* Overall Rating Pill */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              padding: '1.1rem 1.35rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1.5px solid #a7f3d0',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857', letterSpacing: '0.5px' }}>
                ĐIỂM ĐÁNH GIÁ CỦA BẠN
              </div>
              <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TbCircleCheck /> Đã được xác nhận lưu trú thực tế
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#059669' }}>
                {score}
              </span>
              <TbStarFilled style={{ color: '#ff385c', fontSize: '1.5rem' }} />
            </div>
          </div>

          {/* 6 Radar Score Grid */}
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Chi tiết 6 tiêu chí Radar đã đánh giá:
            </div>
            <div className="view-radar-grid">
              {criteria.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="view-radar-item">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Icon style={{ color: item.color, fontSize: '1.1rem' }} />
                      {item.label}
                    </span>
                    <span style={{ color: '#ff385c', fontWeight: 900 }}>
                      {item.val}★
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Comment Box */}
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TbQuote style={{ color: '#059669' }} /> Nội dung nhận xét đăng tải:
            </div>
            <div className="view-review-comment-box">
              "{review.comment}"
            </div>
          </div>

          {/* Host Response if any */}
          {review.hostResponse && (
            <div style={{ marginTop: '0.75rem', padding: '0.9rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                Phản hồi từ Chủ nhà:
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                "{review.hostResponse}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.1rem 1.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#fafafa' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.65rem 1.6rem',
              borderRadius: '12px',
              border: 'none',
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewReviewModal;
