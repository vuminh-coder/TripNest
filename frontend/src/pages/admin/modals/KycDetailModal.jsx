import React, { useState } from 'react';
import './KycDetailModal.css';
import { TbX, TbShieldCheck, TbShieldX, TbBuildingBank, TbCheck, TbAlertTriangle, TbZoomIn, TbUser, TbId, TbPhone, TbMail } from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';

export const KycDetailModal = ({ host, onClose, onApprove, onReject }) => {
  const toast = useToast();
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [activeImageZoom, setActiveImageZoom] = useState(null);

  if (!host) return null;

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      toast.warning('Thiếu lý do từ chối', 'Vui lòng nhập lý do từ chối để thông báo cho chủ nhà.');
      return;
    }
    onReject(host.id, rejectReason);
    toast.info('Từ chối hồ sơ KYC', `Đã từ chối hồ sơ của ${host.name || 'chủ nhà'}.`);
    onClose();
  };

  const frontDocImg = host.id_card_front || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600';
  const backDocImg = host.id_card_back || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600';

  return (
    <div className="modal-overlay adm-kycdet-overlay" onClick={onClose}>
      <div
        className="modal-container adm-kycdet-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="adm-kycdet-header">
          <div className="adm-kycdet-header-left">
            <div className="adm-kycdet-icon-wrap">
              <TbShieldCheck />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="adm-kycdet-title">
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
              <p className="adm-kycdet-sub-text">
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
        <div className="adm-kycdet-body">
          {/* Host Info Grid */}
          <div className="adm-kycdet-info-grid">
            <div>
              <span className="adm-kycdet-field-label">
                <TbUser style={{ fontSize: '0.9rem' }} /> Tên hiển thị
              </span>
              <p className="adm-kycdet-field-val">
                {host.display_name || host.name}
              </p>
            </div>

            <div>
              <span className="adm-kycdet-field-label">
                <TbId style={{ fontSize: '0.9rem' }} /> Số CCCD / Hộ chiếu
              </span>
              <p className="adm-kycdet-idcard-val">
                {host.id_card_number || 'Chưa cung cấp'}
              </p>
            </div>

            <div>
              <span className="adm-kycdet-field-label">
                <TbPhone style={{ fontSize: '0.9rem' }} /> Điện thoại
              </span>
              <p className="adm-kycdet-field-val">
                {host.phone || 'Chưa cập nhật'}
              </p>
            </div>

            <div>
              <span className="adm-kycdet-field-label">
                <TbMail style={{ fontSize: '0.9rem' }} /> Email liên hệ
              </span>
              <p className="adm-kycdet-field-val">
                {host.email || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          {/* Bank Account Info */}
          <div className="adm-kycdet-bank-box">
            <TbBuildingBank className="adm-kycdet-bank-icon" />
            <div>
              <span className="adm-kycdet-bank-label">
                Tài khoản nhận tiền Payouts
              </span>
              <p className="adm-kycdet-bank-val">
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

            <div className="adm-kycdet-docs-grid">
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
            <div className="adm-kycdet-reject-box">
              <div className="adm-kycdet-reject-title">
                <TbAlertTriangle style={{ fontSize: '1.1rem' }} />
                <span>Nhập lý do từ chối phê duyệt hồ sơ KYC:</span>
              </div>
              <textarea
                placeholder="VD: Ảnh chụp mờ không rõ số CCCD, hoặc thông tin tên không khớp tài khoản ngân hàng thụ hưởng..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="adm-kycdet-reject-textarea"
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
        <div className="adm-kycdet-footer">
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={onClose}
          >
            Đóng Cửa Sổ
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {host.kyc_status !== 'rejected' && (
              <button
                type="button"
                className="btn-admin-danger"
                onClick={() => setIsRejecting(!isRejecting)}
              >
                <TbShieldX />
                <span>{isRejecting ? 'Thu gọn lý do' : 'Từ Chối Hồ Sơ'}</span>
              </button>
            )}

            {host.kyc_status !== 'verified' && (
              <button
                type="button"
                className="btn-admin-success"
                onClick={() => {
                  onApprove(host.id);
                  toast.success('Phê duyệt thành công!', `Đã xác thực danh tính KYC cho ${host.name}.`);
                  onClose();
                }}
              >
                <TbCheck />
                <span>Phê Duyệt KYC</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Zooming Document */}
      {activeImageZoom && (
        <div
          className="kyc-lightbox-overlay"
          onClick={() => setActiveImageZoom(null)}
        >
          <div className="kyc-lightbox-wrapper" onClick={(e) => e.stopPropagation()}>
            <img src={activeImageZoom} alt="Giấy tờ phóng to" className="kyc-lightbox-img" />
            <button className="kyc-lightbox-close-btn" onClick={() => setActiveImageZoom(null)}>
              <TbX />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycDetailModal;
