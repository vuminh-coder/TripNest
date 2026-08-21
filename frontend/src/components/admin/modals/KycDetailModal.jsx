import React, { useState } from 'react';
import {
  TbX,
  TbShieldCheck,
  TbShieldX,
  TbBuildingBank,
  TbCheck,
  TbAlertTriangle,
  TbZoomIn,
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

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-container"
        style={{ width: '820px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <TbShieldCheck />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Thẩm Định Hồ Sơ Định Danh KYC
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
                Chủ nhà: <strong>{host.name}</strong> • Mã ID: #{host.id}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <TbX />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 0' }}>
          {/* Host Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Tên hiển thị:</span>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{host.display_name}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Số CCCD / Hộ chiếu:</span>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0284c7' }}>{host.id_card_number}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Điện thoại:</span>
              <p style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0f172a' }}>{host.phone}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Email liên hệ:</span>
              <p style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0f172a' }}>{host.email}</p>
            </div>
          </div>

          {/* Bank Account Info */}
          <div style={{ background: '#f0fdf4', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <TbBuildingBank style={{ fontSize: '2rem', color: '#16a34a' }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Tài khoản nhận tiền Payouts</span>
              <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#14532d' }}>
                {host.bank_name} • STK: <strong>{host.account_number}</strong> ({host.account_holder})
              </p>
            </div>
          </div>

          {/* Documents Showcase: CCCD Mặt trước & Mặt sau */}
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Hình Ảnh Giấy Tờ Tùy Thân
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="kyc-doc-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                <span>Mặt Trước CCCD / Hộ Chiếu</span>
                <TbZoomIn style={{ fontSize: '1.1rem' }} />
              </div>
              <img
                src={host.id_card_front}
                alt="CCCD Front"
                className="kyc-doc-img"
                onClick={() => setActiveImageZoom(host.id_card_front)}
              />
            </div>
            <div className="kyc-doc-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                <span>Mặt Sau CCCD</span>
                <TbZoomIn style={{ fontSize: '1.1rem' }} />
              </div>
              <img
                src={host.id_card_back}
                alt="CCCD Back"
                className="kyc-doc-img"
                onClick={() => setActiveImageZoom(host.id_card_back)}
              />
            </div>
          </div>

          {/* Rejection Note Form if Active */}
          {isRejecting && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.92rem' }}>
                <TbAlertTriangle />
                <span>Lý do từ chối hồ sơ KYC:</span>
              </div>
              <textarea
                placeholder="VD: Ảnh chụp mờ không rõ số CCCD, hoặc thông tin tên không khớp tài khoản ngân hàng..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', fontSize: '0.88rem' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, fontSize: '0.85rem' }}
                  onClick={() => setIsRejecting(false)}
                >
                  Hủy
                </button>
                <button
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#ef4444', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}
                  onClick={handleConfirmReject}
                >
                  Xác nhận Từ Chối Hồ Sơ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
          <button
            style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#64748b' }}
            onClick={onClose}
          >
            Đóng
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {!isRejecting && (
              <button
                style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1.5px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsRejecting(true)}
              >
                <TbShieldX />
                <span>Từ Chối Hồ Sơ</span>
              </button>
            )}

            <button
              className="btn-admin-primary"
              style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}
              onClick={() => {
                onApprove(host.id);
                onClose();
              }}
            >
              <TbCheck style={{ fontSize: '1.2rem' }} />
              <span>Phê Duyệt KYC (Verified)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom */}
      {activeImageZoom && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          onClick={() => setActiveImageZoom(null)}
        >
          <img src={activeImageZoom} alt="Zoom" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
        </div>
      )}
    </div>
  );
};
export default KycDetailModal;
