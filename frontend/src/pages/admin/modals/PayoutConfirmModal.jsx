import React, { useState } from 'react';
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
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-container"
        style={{
          width: '580px',
          maxWidth: '95vw',
          maxHeight: '92vh',
          borderRadius: 'var(--adm-radius-xl)',
          background: '#ffffff',
          boxShadow: 'var(--adm-shadow-modal)',
          border: '1px solid var(--adm-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--adm-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.28)',
                flexShrink: 0,
              }}
            >
              <TbCoins />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    fontFamily: 'var(--adm-font-display)',
                    letterSpacing: '-0.3px',
                  }}
                >
                  Xác Nhận Lệnh Giải Ngân Payout
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: '#0284c7',
                    background: '#e0f2fe',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  Mã lệnh: #{payout.id}
                </span>
                {payout.booking_code && (
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Đơn: <strong>{payout.booking_code}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button className="btn-action-icon" onClick={onClose} title="Đóng">
            <TbX style={{ fontSize: '1.1rem' }} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '1.5rem', flex: 1 }}>
            {/* 1. Beneficiary Information Box */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.15rem 1.25rem',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.85rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  <TbBuildingBank style={{ color: '#0284c7', fontSize: '1.1rem' }} />
                  <span>Thông Tin Tài Khoản Thụ Hưởng</span>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    border: '1px solid #a7f3d0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <TbShieldCheck /> Đã Xác Minh KYC
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Chủ nhà thụ hưởng:</span>
                  <strong style={{ color: '#0f172a', fontWeight: 800 }}>{hostName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Ngân hàng thụ hưởng:</span>
                  <strong style={{ color: '#0284c7', fontWeight: 800 }}>
                    {bankName} - {accountNumber}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Tên tài khoản:</span>
                  <strong style={{ color: '#0f172a', fontWeight: 800, letterSpacing: '0.3px' }}>
                    {accountHolder}
                  </strong>
                </div>
              </div>
            </div>

            {/* 2. Financial Breakdown Box */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.15rem 1.25rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.45rem',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <TbReceipt2 style={{ color: '#ff385c', fontSize: '1.1rem' }} />
                <span>Chi Tiết Quyết Toán Doanh Thu</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Doanh thu phòng (Gross):</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatVND(gross)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Khấu trừ hoa hồng sàn (12%):</span>
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>- {formatVND(commission)}</span>
                </div>

                <div
                  style={{
                    height: '1px',
                    background: '#cbd5e1',
                    margin: '4px 0',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>
                      Thực chuyển cho Host:
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      (Đã trừ toàn bộ phí quản lý nền tảng)
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 900,
                      color: '#16a34a',
                      fontFamily: 'var(--adm-font-display)',
                      letterSpacing: '-0.3px',
                    }}
                  >
                    {formatVND(net)}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Banking Reference Code Input */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.15rem 1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    color: '#334155',
                  }}
                >
                  Mã Giao Dịch Ngân Hàng (Banking Ref Code) *
                </label>
                <button
                  type="button"
                  onClick={() => setTransactionRef(generateRef())}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <TbRefresh /> Tạo mã mới
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 2.5rem 0.7rem 0.9rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.96rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: '#0f172a',
                    letterSpacing: '0.8px',
                    background: '#fcfdfe',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="VD: FT2608276687"
                />
                <button
                  type="button"
                  onClick={handleCopyRef}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                  }}
                  title="Sao chép mã giao dịch"
                >
                  <TbCopy />
                </button>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                Nhập mã ủy nhiệm chi hoặc số tham chiếu giao dịch từ Internet Banking để lưu đối soát.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--adm-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              background: '#fbfcfd',
            }}
          >
            <button
              type="button"
              style={{
                padding: '0.62rem 1.25rem',
                borderRadius: '8px',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                fontWeight: 700,
                color: '#64748b',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={onClose}
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-admin-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                padding: '0.62rem 1.4rem',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.32)',
              }}
            >
              <TbCheck style={{ fontSize: '1.1rem' }} />
              <span>{isSubmitting ? 'Đang Xử Lý...' : 'Xác Nhận Đã Chuyển Tiền'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayoutConfirmModal;
