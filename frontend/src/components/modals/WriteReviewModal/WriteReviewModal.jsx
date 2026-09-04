import React, { useState } from 'react';
import './WriteReviewModal.css';
import {
  TbX,
  TbStarFilled,
  TbSend,
  TbSparkles,
  TbCheck,
  TbTag,
  TbTarget,
  TbMessage2,
  TbMapPin,
  TbKey,
  TbReceipt2,
} from 'react-icons/tb';
import { apiService } from '@/services/api';
import { useToast } from '@/context/ToastContext';

const RATING_HINTS = {
  1: 'Thất vọng 😞',
  2: 'Tạm được 😐',
  3: 'Khá tốt 🙂',
  4: 'Rất tốt 😊',
  5: 'Tuyệt vời! 🌟',
};

const QUICK_CHIPS = [
  '🧹 Sạch sẽ sáng bóng',
  '💬 Chủ nhà nhiệt tình',
  '📍 Vị trí đắc địa',
  '🌿 Không gian riêng tư',
  '✨ Tiện nghi hiện đại',
  '💰 Rất đáng tiền',
];

export const WriteReviewModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [ratings, setRatings] = useState({
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    checkin: 5,
    value: 5,
  });

  const [hoveredRatings, setHoveredRatings] = useState({});
  const [comment, setComment] = useState('');

  if (!isOpen || !booking) return null;

  const criteria = [
    { key: 'cleanliness', label: 'Độ Sạch Sẽ', icon: TbSparkles, iconColor: '#0d9488' },
    { key: 'accuracy', label: 'Độ Chính Xác', icon: TbTarget, iconColor: '#ff385c' },
    { key: 'communication', label: 'Giao Tiếp Chủ Nhà', icon: TbMessage2, iconColor: '#0284c7' },
    { key: 'location', label: 'Vị Trí Chỗ Nghỉ', icon: TbMapPin, iconColor: '#d97706' },
    { key: 'checkin', label: 'Thủ Tục Nhận Phòng', icon: TbKey, iconColor: '#7c3aed' },
    { key: 'value', label: 'Giá Trị Tương Xứng', icon: TbReceipt2, iconColor: '#059669' },
  ];

  const overallScore = (
    Object.values(ratings).reduce((a, b) => a + b, 0) / 6
  ).toFixed(1);

  const handleSetRating = (key, val) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  const handleChipClick = (chipText) => {
    if (comment.includes(chipText)) return;
    setComment((prev) => (prev ? `${prev.trim()} • ${chipText}` : chipText));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!comment.trim() || comment.trim().length < 5) {
      toast.error('Vui lòng nhập nhận xét ít nhất 5 ký tự.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        booking_id: booking.bookingId || booking.id,
        rating_cleanliness: ratings.cleanliness,
        rating_accuracy: ratings.accuracy,
        rating_communication: ratings.communication,
        rating_location: ratings.location,
        rating_checkin: ratings.checkin,
        rating_value: ratings.value,
        comment: comment.trim(),
      };

      await apiService.submitReview(payload);
      toast.success(
        'Đã gửi đánh giá thành công!',
        'Cảm ơn bạn đã đóng góp đánh giá thực tế cho cộng đồng du lịch TripNest.'
      );

      if (onSuccess) onSuccess(booking.id || booking.bookingId);
      onClose();
    } catch (err) {
      toast.error('Lỗi khi gửi đánh giá', err.message || 'Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="review-modal-header">
          <div>
            <h3>
              <TbSparkles style={{ color: '#ff385c' }} /> Đánh Giá Chuyến Đi Thực Tế
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
              Chỗ nghỉ: <strong style={{ color: '#0f172a' }}>{booking.roomTitle || 'Phòng nghỉ dưỡng'}</strong> (Mã đơn #{booking.id})
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f8fafc',
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
        <div className="review-modal-body">
          {/* Overall Score Badge */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 50%, #ffe4e6 100%)',
              padding: '1.1rem 1.35rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1.5px solid #fecdd3',
              boxShadow: '0 4px 14px rgba(255, 56, 92, 0.08)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#be123c', letterSpacing: '0.5px' }}>
                ĐIỂM ĐÁNH GIÁ TỔNG THỂ
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                Tự động tính toán trung bình từ 6 tiêu chí Radar bên dưới
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#ff385c' }}>
                {overallScore}
              </span>
              <TbStarFilled style={{ color: '#f59e0b', fontSize: '1.5rem' }} />
            </div>
          </div>

          {/* 6 Radar Criteria */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
              1. Khảo sát 6 tiêu chí chất lượng (Chọn từ 1 đến 5 sao):
            </div>
            {criteria.map((c) => {
              const currentScore = hoveredRatings[c.key] || ratings[c.key];
              const hintLabel = RATING_HINTS[currentScore] || '';
              const Icon = c.icon;

              return (
                <div key={c.key} className="radar-slider-item">
                  <span className="radar-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Icon style={{ color: c.iconColor, fontSize: '1.15rem' }} />
                    {c.label}
                  </span>
                  <div className="stars-rating-selector">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= currentScore ? 'active' : ''}`}
                        onClick={() => handleSetRating(c.key, star)}
                        onMouseEnter={() => setHoveredRatings((prev) => ({ ...prev, [c.key]: star }))}
                        onMouseLeave={() => setHoveredRatings((prev) => ({ ...prev, [c.key]: 0 }))}
                        title={`${star} sao — ${RATING_HINTS[star]}`}
                      >
                        <TbStarFilled />
                      </button>
                    ))}
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        minWidth: '100px',
                        textAlign: 'right',
                        color: currentScore >= 4 ? '#059669' : '#d97706',
                        marginLeft: '6px',
                      }}
                    >
                      {currentScore}★ {hintLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Compliment Chips */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TbTag style={{ color: '#ff385c' }} /> 2. Nhãn khen nhanh (Click để thêm vào bài viết):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {QUICK_CHIPS.map((chip) => {
                const isSelected = comment.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: isSelected ? '1.5px solid #ff385c' : '1px solid #e2e8f0',
                      background: isSelected ? '#fff1f2' : '#ffffff',
                      color: isSelected ? '#be123c' : '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {chip} {isSelected && <TbCheck style={{ color: '#be123c' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Comment */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                3. Nhận xét chi tiết chuyến đi của bạn:
              </div>
              <span style={{ fontSize: '0.78rem', color: comment.length > 450 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
                {comment.length} / 500 ký tự
              </span>
            </div>
            <textarea
              className="review-comment-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder="Chia sẻ cảm nhận về độ sạch sẽ, thái độ phục vụ của chủ nhà hoặc kỷ niệm đáng nhớ trong chuyến đi..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="review-modal-footer">
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={submitting || !comment.trim()}
            onClick={handleSubmit}
            style={{
              padding: '0.65rem 1.6rem',
              borderRadius: '12px',
              border: 'none',
              background: submitting || !comment.trim() ? '#cbd5e1' : 'linear-gradient(135deg, #ff385c 0%, #e00b41 100%)',
              color: '#ffffff',
              fontWeight: 800,
              cursor: submitting || !comment.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: submitting || !comment.trim() ? 'none' : '0 4px 14px rgba(255, 56, 92, 0.28)',
            }}
          >
            <TbSend /> {submitting ? 'Đang đăng...' : 'Đăng bài đánh giá'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewModal;
