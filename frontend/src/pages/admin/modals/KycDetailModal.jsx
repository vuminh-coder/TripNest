import React, { useState } from 'react';
import {
  TbX,
  TbShieldCheck,
  TbShieldX,
  TbBuildingBank,
  TbCheck,
  TbAlertTriangle,
  TbZoomIn,
  TbUser,
  TbId,
  TbPhone,
  TbMail,
} from 'react-icons/tb';

export const KycDetailModal = ({ host, onClose, onApprove, onReject }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [activeImageZoom, setActiveImageZoom] = useState(null);

  if (!host) return null;

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối để thông báo cho chủ nhà.');
      return;
    }
    onReject(host.id, rejectReason);
    onClose();
  };

  const frontDocImg = host.id_card_front || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600';
  const backDocImg = host.id_card_back || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-container"
        style={{ width: '840px', maxWidth: '95vw', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="kyc-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.45rem',
                flexShrink: 0,
              }}
            >
              <TbShieldCheck />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Thẩm Định Hồ Sơ Định Danh KYC
                </h2>
                <span className={`status-pill ${host.kyc_status}`}>
                  {host.kyc_status === 'verified'
                    ? 'ĐÃ XÁC MINH'
                    : host.kyc_status === 'pending'
                    ? 'CHỜ DUYỆT'
                    : 'TỪ CHỐI'}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
                Chủ nhà: <strong>{host.name}</strong> • Mã ID: #{host.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            style={{ position: 'static' }}
            title="Đóng"
          >
            <TbX />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="kyc-modal-body">
          {/* Host Info Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              background: '#f8fafc',
              padding: '1.15rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div>
              <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TbUser style={{ fontSize: '0.9rem' }} /> Tên hiển thị
              </span>
              <p style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', margin: '3px 0 0 0' }}>
                {host.display_name || host.name}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TbId style={{ fontSize: '0.9rem' }} /> Số CCCD / Hộ chiếu
              </span>
              <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0284c7', margin: '3px 0 0 0' }}>
                {host.id_card_number || 'Chưa cung cấp'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TbPhone style={{ fontSize: '0.9rem' }} /> Điện thoại
              </span>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', margin: '3px 0 0 0' }}>
                {host.phone || 'Chưa cập nhật'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TbMail style={{ fontSize: '0.9rem' }} /> Email liên hệ
              </span>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', margin: '3px 0 0 0' }}>
                {host.email || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          {/* Bank Account Info */}
          <div
            style={{
              background: '#f0fdf4',
              padding: '0.9rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <TbBuildingBank style={{ fontSize: '1.8rem', color: '#16a34a', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                Tài khoản nhận tiền Payouts
              </span>
              <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#14532d', margin: '2px 0 0 0' }}>
                {host.bank_name || 'Ngân hàng'} • STK: <strong>{host.account_number || 'N/A'}</strong> ({host.account_holder || host.name})
              </p>
            </div>
          </div>

          {/* Documents Showcase: CCCD Mặt trước & Mặt sau */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Ảnh Chụp Giấy Tờ Tùy Thân (CCCD / CMND / Hộ Chiếu)
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                Nhấp vào ảnh để phóng to xem chi tiết
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Mặt trước */}
              <div className="kyc-doc-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                  <span>Mặt Trước CCCD / Hộ Chiếu</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#0284c7', fontSize: '0.75rem' }}>
                    <TbZoomIn /> Phóng to
                  </span>
                </div>
                <div className="kyc-doc-img-box" onClick={() => setActiveImageZoom(frontDocImg)}>
                  <img
                    src={frontDocImg}
                    alt="Mặt trước CCCD"
                    className="kyc-doc-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600';
                    }}
                  />
                  <div className="kyc-doc-overlay-hint">
                    <TbZoomIn /> Nhấp để phóng to
                  </div>
                </div>
              </div>

              {/* Mặt sau */}
              <div className="kyc-doc-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                  <span>Mặt Sau CCCD</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#0284c7', fontSize: '0.75rem' }}>
                    <TbZoomIn /> Phóng to
                  </span>
                </div>
                <div className="kyc-doc-img-box" onClick={() => setActiveImageZoom(backDocImg)}>
                  <img
                    src={backDocImg}
                    alt="Mặt sau CCCD"
                    className="kyc-doc-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600';
                    }}
                  />
                  <div className="kyc-doc-overlay-hint">
                    <TbZoomIn /> Nhấp để phóng to
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rejection Note Form if Active */}
          {isRejecting && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', fontWeight: 800, marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                <TbAlertTriangle style={{ fontSize: '1.1rem' }} />
                <span>Nhập lý do từ chối phê duyệt hồ sơ KYC:</span>
              </div>
              <textarea
                placeholder="VD: Ảnh chụp mờ không rõ số CCCD, hoặc thông tin tên không khớp tài khoản ngân hàng thụ hưởng..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', fontSize: '0.86rem', outline: 'none', background: 'white' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  style={{ padding: '0.45rem 0.9rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                  onClick={() => setIsRejecting(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  style={{ padding: '0.45rem 1.15rem', borderRadius: '6px', background: '#ef4444', color: 'white', fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer' }}
                  onClick={handleConfirmReject}
                >
                  Xác nhận Từ Chối Hồ Sơ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer Actions */}
        <div className="kyc-modal-footer">
          <button
            type="button"
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              border: '1.5px solid #e2e8f0',
              background: 'white',
              fontWeight: 700,
              color: '#64748b',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Đóng
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {!isRejecting && (
              <button
                type="button"
                style={{
                  padding: '0.55rem 1.15rem',
                  borderRadius: '8px',
                  border: '1.5px solid #fecaca',
                  background: '#fef2f2',
                  color: '#b91c1c',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
                onClick={() => setIsRejecting(true)}
              >
                <TbShieldX />
                <span>Từ Chối Hồ Sơ</span>
              </button>
            )}

            <button
              type="button"
              className="btn-admin-primary"
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
              onClick={() => {
                onApprove(host.id);
                onClose();
              }}
            >
              <TbCheck style={{ fontSize: '1.1rem' }} />
              <span>Phê Duyệt KYC (Verified)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom */}
      {activeImageZoom && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(4px)',
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            cursor: 'zoom-out',
          }}
          onClick={() => setActiveImageZoom(null)}
        >
          <div style={{ position: 'relative', maxWidth: '85vw', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#ffffff',
                border: 'none',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
              onClick={() => setActiveImageZoom(null)}
            >
              <TbX />
            </button>
            <img
              src={activeImageZoom}
              alt="Zoomed Document"
              style={{
                maxWidth: '85vw',
                maxHeight: '85vh',
                borderRadius: '10px',
                objectFit: 'contain',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KycDetailModal;

