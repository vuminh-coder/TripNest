import React, { useState } from 'react';
import {
  TbStar,
  TbStarFilled,
  TbSparkles,
  TbShieldCheck,
  TbMessageCircle,
  TbThumbUp,
} from 'react-icons/tb';

export const HostReviewsPage = () => {
  const [reviewsList, setReviewsList] = useState([
    {
      id: 1,
      guestName: 'Nguyễn Thu Trang',
      guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      date: '20/08/2026',
      rating: 5.0,
      roomTitle: 'The Oasis Garden Retreat Đà Lạt',
      comment:
        'Chỗ ở tuyệt đẹp ngoài sức tưởng tượng! Không gian sân vườn yên tĩnh, ngắm bình minh cực chill. Chủ nhà rất nhiệt tình hỗ trợ nhận phòng sớm.',
      hostReply: 'Cảm ơn Trang rất nhiều! Rất vui được đón tiếp bạn và gia đình. Hẹn gặp lại bạn trong chuyến đi tới nhé!',
    },
    {
      id: 2,
      guestName: 'Hoàng Minh Quân',
      guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      date: '12/08/2026',
      rating: 4.9,
      roomTitle: 'Grand Sunset Ocean Villa Phú Quốc',
      comment:
        'Biệt thự sát biển view hoàng hôn đỉnh cao, hồ bơi riêng sạch sẽ. Mọi tiện nghi đều như mô tả trên ảnh.',
      hostReply: null,
    },
    {
      id: 3,
      guestName: 'Phạm Linh Chi',
      guestAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      date: '02/08/2026',
      rating: 5.0,
      roomTitle: 'Mây Homestay Sapa',
      comment:
        'Không gian ấm cúng đậm chất núi rừng Sapa. Cà phê sáng nhìn ra thung lũng Tả Van cực kỳ thơ mộng.',
      hostReply: 'Cảm ơn Chi đã lựa chọn Mây Homestay! Chúc bạn luôn có những chuyến hành trình ngập tràn niềm vui!',
    },
  ]);

  const ratingCategories = [
    { label: 'Độ Sạch Sẽ', score: '4.98', progress: '99%' },
    { label: 'Độ Chính Xác', score: '4.95', progress: '97%' },
    { label: 'Giao Tiếp', score: '5.00', progress: '100%' },
    { label: 'Vị Trí', score: '4.92', progress: '96%' },
    { label: 'Nhận Phòng', score: '4.97', progress: '98%' },
    { label: 'Giá Trị', score: '4.94', progress: '97%' },
  ];

  return (
    <div>
      {/* Rating Overview Banner */}
      <div
        className="host-panel-card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 60%, #ffe4e6 100%)',
          border: '1px solid var(--host-primary-border)',
        }}
      >
        <div style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--host-text-main)', fontFamily: 'var(--host-font-display)' }}>
                4.96
              </span>
              <div style={{ display: 'flex', color: '#f59e0b', fontSize: '1.2rem' }}>
                <TbStarFilled />
                <TbStarFilled />
                <TbStarFilled />
                <TbStarFilled />
                <TbStarFilled />
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--host-text-muted)', fontWeight: 600 }}>
              Dựa trên 81 đánh giá đã xác thực từ khách hàng
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '0.6rem 1rem', borderRadius: 'var(--host-radius-lg)', border: '1px solid var(--host-primary-border)' }}>
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
            <TbSparkles style={{ color: '#d97706' }} /> Chi Tiết Điểm Chất Lượng
          </h3>
        </div>
        <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {ratingCategories.map((cat) => (
            <div key={cat.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--host-text-main)' }}>
                <span>{cat.label}</span>
                <span style={{ color: 'var(--host-primary)' }}>{cat.score} ★</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: cat.progress, height: '100%', background: 'var(--host-primary-gradient)', borderRadius: '999px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List Feed */}
      <div className="host-panel-card">
        <div className="host-panel-header">
          <h3 className="host-panel-title">
            <TbMessageCircle style={{ color: 'var(--host-indigo)' }} /> Đánh Giá Từ Khách Hàng ({reviewsList.length})
          </h3>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {reviewsList.map((r) => (
            <div
              key={r.id}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--host-radius-lg)',
                border: '1px solid var(--host-border-subtle)',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={r.guestAvatar} alt={r.guestName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--host-text-main)' }}>{r.guestName}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--host-text-muted)' }}>{r.date} · {r.roomTitle}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontSize: '0.88rem', fontWeight: 700 }}>
                  <TbStarFilled /> {r.rating.toFixed(1)}
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
                "{r.comment}"
              </p>

              {r.hostReply && (
                <div style={{ background: '#ffffff', padding: '0.75rem 1rem', borderRadius: 'var(--host-radius-md)', borderLeft: '3px solid var(--host-primary)', fontSize: '0.82rem', color: '#475569' }}>
                  <strong style={{ color: 'var(--host-primary)', display: 'block', marginBottom: '2px' }}>Phản hồi của bạn:</strong>
                  {r.hostReply}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostReviewsPage;
