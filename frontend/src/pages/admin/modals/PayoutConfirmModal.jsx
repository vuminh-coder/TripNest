import React, { useState } from 'react';
import './PayoutConfirmModal.css';
import {
  TbX,
  TbBuildingBank,
  TbCoins,
  TbCheck,
  TbShieldCheck,
  TbRefresh,
  TbCopy,
  TbReceipt2,
  TbArrowRight,
  TbUser,
} from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';

export const PayoutConfirmModal = ({ payout, onClose, onConfirm }) => {
  const toast = useToast();

  const generateRef = () => {
    const today = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `FT${today}${rand}`;
  };

  const [transactionRef, setTransactionRef] = useState(() => generateRef());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!payout) return null;

  const formatVND = (val) => `${(val || 0).toLocaleString('vi-VN')} ₫`;

  // Calculate gross, commission (12%), and net payout with absolute precision
  const gross = payout.gross_amount || payout.amount || 0;
  const commission = payout.commission_fee || Math.round(gross * 0.12);
  const net = payout.net_payout || (gross - commission);

  const hostName = payout.host_name || 'NGUYEN VAN AN';
  const bankName = payout.bank_name || 'Vietcombank (VCB)';
  const accountNumber = payout.account_number || '9988776655';
  const accountHolder = (payout.account_holder || hostName).toUpperCase();

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transactionRef);
    toast.info('Đã sao chép', `Đã chép mã giao dịch: ${transactionRef}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      toast.warning('Thiếu mã giao dịch', 'Vui lòng nhập mã giao dịch đối soát ngân hàng.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(payout.id, transactionRef.trim());
      toast.success(
        'Giải ngân thành công!',
        `Đã giải ngân ${formatVND(net)} cho ${hostName} (Mã GD: ${transactionRef})`
      );
      onClose();
    } catch (err) {
      toast.error('Lỗi giải ngân', err.message || 'Không thể xác nhận giải ngân.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay adm-paymod-overlay" onClick={onClose}>
      <div
        className="modal-container adm-paymod-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="adm-paymod-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="adm-paymod-icon-wrap">
              <TbCoins />
            </div>
            <div>
              <h2 className="adm-paymod-title">
                Xác Nhận Quyết Toán & Giải Ngân
              </h2>
              <p className="adm-paymod-sub-text">
                Lệnh chi #{payout.id} • Chuyển tiền từ Quỹ Ký Quỹ Escrow sang Chủ Nhà
              </p>
            </div>
          </div>

          <button className="btn-action-icon" onClick={onClose} title="Đóng">
            <TbX style={{ fontSize: '1.1rem' }} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="adm-paymod-body">
          {/* Net Amount Hero Callout */}
          <div className="adm-paymod-hero-box">
            <div className="adm-paymod-hero-label">
              Số tiền thực chuyển khoản (Net Payout)
            </div>
            <div className="adm-paymod-hero-amount">
              {formatVND(net)}
            </div>
            <div className="adm-paymod-hero-note">
              ✓ Đã tự động khấu trừ 12% phí hoa hồng nền tảng TripNest
            </div>
          </div>

          {/* Math Breakdown Table */}
          <div className="adm-paymod-math-card">
            <div className="adm-paymod-math-row">
              <span style={{ color: '#64748b' }}>Doanh thu phòng (Gross):</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatVND(gross)}</span>
            </div>
            <div className="adm-paymod-math-row">
              <span style={{ color: '#64748b' }}>Hoa hồng sàn TripNest (12%):</span>
              <span style={{ fontWeight: 700, color: '#dc2626' }}>- {formatVND(commission)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.45rem',
                borderTop: '1px dashed #cbd5e1',
                marginTop: '0.25rem',
              }}
            >
              <strong style={{ color: '#0f172a' }}>Chủ nhà thực nhận:</strong>
              <strong style={{ color: '#059669', fontSize: '0.92rem' }}>{formatVND(net)}</strong>
            </div>
          </div>

          {/* Beneficiary Account Details */}
          <div className="adm-paymod-bank-card">
            <div className="adm-paymod-bank-head">
              <TbBuildingBank style={{ color: '#059669', fontSize: '1.1rem' }} />
              <span>Tài Khoản Ngân Hàng Thụ Hưởng (Đã Xác Minh KYC)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                <strong style={{ color: '#0f172a', letterSpacing: '0.3px' }}>{accountHolder}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Ngân hàng thụ hưởng:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{bankName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                <strong style={{ color: '#0284c7', fontSize: '0.98rem', fontFamily: 'monospace', letterSpacing: '0.8px' }}>
                  {accountNumber}
                </strong>
              </div>
            </div>
          </div>

          {/* Bank Transaction Ref Input */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                Mã Giao Dịch Ngân Hàng Đối Soát (Bank Reference ID) *
              </label>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
                onClick={() => setTransactionRef(generateRef())}
                title="Tạo mã giao dịch ngẫu nhiên mới"
              >
                <TbRefresh /> Tạo mã mới
              </button>
            </div>

            <div className="adm-paymod-ref-input-wrap">
              <input
                type="text"
                required
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="VD: FT260826998822 hoặc mã giao dịch Internet Banking..."
                className="adm-paymod-ref-input"
              />
              <button
                type="button"
                className="btn-action-icon"
                onClick={handleCopyRef}
                title="Sao chép mã giao dịch"
                style={{ height: 'auto', padding: '0 0.85rem' }}
              >
                <TbCopy />
              </button>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', margin: 0 }}>
              Mã giao dịch dùng để đối soát ngân hàng và gửi thông báo SMS/Email biên nhận cho chủ nhà.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="adm-paymod-footer">
            <button
              type="button"
              className="btn-admin-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="btn-admin-success"
              disabled={isSubmitting}
            >
              <TbCheck style={{ fontSize: '1.15rem' }} />
              <span>{isSubmitting ? 'Đang Xử Lý...' : 'Xác Nhận & Hoàn Tất Giải Ngân'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayoutConfirmModal;
