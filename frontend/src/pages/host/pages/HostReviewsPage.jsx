import React, { useState, useEffect } from 'react';
import './HostReviewsPage.css';
import {
  TbStarFilled,
  TbSparkles,
  TbShieldCheck,
  TbMessageCircle,
  TbSend,
  TbX,
  TbCornerDownRight,
} from 'react-icons/tb';
import { apiService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { HostReviewsSkeleton } from '@/components/common/skeletons';

export const HostReviewsPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [reviewsList, setReviewsList] = useState([]);
  const [overallRating, setOverallRating] = useState(4.98);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingCategories, setRatingCategories] = useState([
    { label: 'Độ Sạch Sẽ', score: '4.98', progress: '99%' },
    { label: 'Độ Chính Xác', score: '4.95', progress: '97%' },
    { label: 'Giao Tiếp', score: '5.00', progress: '100%' },
    { label: 'Vị Trí', score: '4.92', progress: '96%' },
    { label: 'Nhận Phòng', score: '4.97', progress: '98%' },
    { label: 'Giá Trị', score: '4.94', progress: '97%' },
  ]);

  // Reply State
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await apiService.getHostReviews();
      if (res && res.data && Array.isArray(res.data)) {
        setReviewsList(res.data);
        if (res.ratingCategories) setRatingCategories(res.ratingCategories);
        if (res.overallRating) setOverallRating(res.overallRating);
        setTotalReviews(typeof res.totalReviews === 'number' ? res.totalReviews : res.data.length);
      } else {
        setReviewsList([]);
        setTotalReviews(0);
      }
    } catch (e) {
      console.error('Failed to load host reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSendReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    setSubmittingReply(true);
    try {
      await apiService.replyHostReview(reviewId, replyText);
      toast.success('Đã gửi phản hồi thành công!', 'Phản hồi của bạn đã được lưu và hiển thị công khai.');

      // Update local state
      setReviewsList((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, hostReply: replyText } : r))
      );
      setReplyingReviewId(null);
      setReplyText('');
    } catch (err) {
      toast.error('Lỗi khi gửi phản hồi', err.message || 'Vui lòng thử lại sau.');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return <HostReviewsSkeleton />;
  }

  return (
    <div>
      {/* Rating Overview Banner */}
      <div className="host-panel-card host-rev-banner-card">
        <div className="host-rev-banner-wrap">
          <div>
            <div className="host-rev-score-head">
              <span className="host-rev-score-num">
                {overallRating.toFixed(2)}
              </span>
              <div className="host-rev-stars">
                <TbStarFilled />
                <TbStarFilled />
                <TbStarFilled />
                <TbStarFilled />
                <TbStarFilled />
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--host-text-muted)', fontWeight: 600 }}>
              Dựa trên {totalReviews > 0 ? totalReviews : reviewsList.length} đánh giá đã xác thực từ khách hàng thực tế
            </div>
          </div>

          <div className="host-rev-superhost-pill">
            <TbShieldCheck style={{ color: '#059669', fontSize: '1.4rem' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--host-text-main)' }}>Chủ Nhà Siêu Cấp (Superhost)</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Tỷ lệ hài lòng 99.2%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Radar Breakdown Categories */}
      <div className="host-panel-card">
        <div className="host-panel-header">
          <h3 className="host-panel-title">
            <TbSparkles style={{ color: '#d97706' }} /> Chi Tiết Điểm Chất Lượng Radar 6 Tiêu Chí
          </h3>
        </div>
        <div className="host-rev-radar-grid">
          {ratingCategories.map((cat) => (
            <div key={cat.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--host-text-main)' }}>
                <span>{cat.label}</span>
                <span style={{ color: 'var(--host-primary)' }}>{cat.score} ★</span>
              </div>
              <div className="host-rev-radar-bar-track">
                <div className="host-rev-radar-bar-fill" style={{ width: cat.progress }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List Feed */}
      <div className="host-panel-card">
        <div className="host-panel-header">
          <h3 className="host-panel-title">
            <TbMessageCircle style={{ color: 'var(--host-indigo)' }} /> Đánh Giá & Bình Luận Của Khách Hàng ({reviewsList.length})
          </h3>
        </div>

        <div className="host-rev-list-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              Đang tải danh sách đánh giá...
            </div>
          ) : reviewsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
              Chưa có đánh giá nào từ khách hàng cho chỗ nghỉ của bạn.
            </div>
          ) : (
            reviewsList.map((r) => (
              <div
                key={r.id}
                className="host-rev-card"
              >
                <div className="host-rev-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={r.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={r.guestName}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--host-text-main)' }}>{r.guestName}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--host-text-muted)' }}>{r.date} · {r.roomTitle}</div>
                    </div>
                  </div>

                  <div className="host-rev-score-badge">
                    <TbStarFilled style={{ color: '#f59e0b' }} /> {Number(r.rating).toFixed(1)} ★
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
                  "{r.comment}"
                </p>

                {/* Host reply display */}
                {r.hostReply ? (
                  <div className="host-rev-reply-box">
                    <strong style={{ color: 'var(--host-primary)', display: 'block', marginBottom: '3px' }}>Phản hồi của bạn:</strong>
                    {r.hostReply}
                  </div>
                ) : (
                  <div>
                    {replyingReviewId === r.id ? (
                      <div className="host-rev-reply-form">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c2410c' }}>
                            <TbCornerDownRight style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                            Viết phản hồi cho khách hàng:
                          </span>
                          <button
                            onClick={() => { setReplyingReviewId(null); setReplyText(''); }}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                          >
                            <TbX />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Nhập lời cảm ơn hoặc giải đáp của chủ nhà..."
                          className="host-rev-textarea"
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            className="btn-host-secondary"
                            style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                            onClick={() => { setReplyingReviewId(null); setReplyText(''); }}
                          >
                            Hủy
                          </button>
                          <button
                            className="btn-host-primary"
                            style={{ padding: '5px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            disabled={submittingReply}
                            onClick={() => handleSendReply(r.id)}
                          >
                            <TbSend /> {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                        <button
                          onClick={() => { setReplyingReviewId(r.id); setReplyText(''); }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 12px',
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <TbCornerDownRight /> Phản hồi khách hàng
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HostReviewsPage;
