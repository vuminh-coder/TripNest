import React, { useState, useEffect } from 'react';
import {
  TbX,
  TbBuildingCastle,
  TbId,
  TbBuildingBank,
  TbCheck,
  TbSparkles,
  TbArrowRight,
  TbArrowLeft,
  TbShieldCheck,
  TbPhoto,
  TbPhone,
  TbMail,
  TbUser,
  TbInfoCircle,
} from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/services/api';
import { adminService } from '@/services/adminApi';
import './BecomeHostModal.css';

export const BecomeHostModal = ({ isOpen, onClose, user, onSuccess }) => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    hostDisplayName: user?.full_name || user?.name || '',
    contactPhone: user?.phone_number || user?.phone || '',
    contactEmail: user?.email || '',
    propertyType: 'Biệt thự villa nghỉ dưỡng',
    introduction: 'Tôi muốn tham gia kinh doanh phòng nghỉ sang trọng trên hệ sinh thái TripNest.',
    idCardNumber: user?.id_card_number || '00109' + Date.now().toString().slice(-7),
    idCardFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    idCardBackUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    bankName: 'Vietcombank',
    accountNumber: '10' + Date.now().toString().slice(-8),
    accountHolderName: (user?.full_name || user?.name || 'NGUYEN VAN A').toUpperCase(),
    agreeTerms: true,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        hostDisplayName: prev.hostDisplayName || user.full_name || user.name || '',
        contactPhone: prev.contactPhone || user.phone_number || user.phone || '',
        contactEmail: prev.contactEmail || user.email || '',
        accountHolderName: prev.accountHolderName || (user.full_name || user.name || '').toUpperCase(),
      }));
    }
  }, [user]);

  if (!isOpen) return null;

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.hostDisplayName.trim() || !formData.contactPhone.trim()) {
        toast.warning('Thiếu thông tin', 'Vui lòng nhập Tên hiển thị chủ nhà và Số điện thoại.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.idCardNumber.trim()) {
        toast.warning('Thiếu số CCCD', 'Vui lòng nhập Số Căn cước công dân / Hộ chiếu.');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.accountNumber.trim() || !formData.accountHolderName.trim()) {
        toast.warning('Thiếu thông tin ngân hàng', 'Vui lòng điền đầy đủ Số tài khoản và Tên chủ tài khoản.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!formData.agreeTerms) {
      toast.warning('Điều khoản', 'Vui lòng xác nhận đồng ý với Quy chuẩn Dịch vụ & Điều khoản TripNest.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Gửi lên Backend API
      await apiService.registerHost(formData);

      // 2. Đồng bộ sang Admin Store để Admin thấy ngay lập tức
      try {
        const adminData = JSON.parse(localStorage.getItem('tripnest_admin_data_v1') || '{}');
        if (adminData.users) {
          const targetId = user?.id || Date.now();
          const existingUserIdx = adminData.users.findIndex((u) => u.id === targetId || u.email === formData.contactEmail);
          const upgradeRequest = {
            requested_role: 'host',
            status: 'pending',
            reason: formData.introduction,
            request_date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            property_type: formData.propertyType,
          };

          if (existingUserIdx >= 0) {
            adminData.users[existingUserIdx].role_upgrade_request = upgradeRequest;
            adminData.users[existingUserIdx].phone = formData.contactPhone;
            adminData.users[existingUserIdx].id_card_number = formData.idCardNumber;
          } else {
            adminData.users.unshift({
              id: targetId,
              name: formData.hostDisplayName,
              email: formData.contactEmail,
              phone: formData.contactPhone,
              role: 'guest',
              status: 'active',
              id_card_number: formData.idCardNumber,
              avatar: user?.avatar || user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              role_upgrade_request: upgradeRequest,
            });
          }
          localStorage.setItem('tripnest_admin_data_v1', JSON.stringify(adminData));
        }
      } catch (e) {
        console.warn('Sync to admin store failed', e);
      }

      setIsSuccess(true);
      toast.success(
        'Nộp hồ sơ thành công!',
        'Hồ sơ đăng ký Chủ nhà đã được gửi đến Ban Quản trị TripNest để thẩm định.'
      );
      if (onSuccess) onSuccess(formData);
    } catch (err) {
      toast.error('Lỗi nộp hồ sơ', err.message || 'Không thể gửi hồ sơ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAll = () => {
    setIsSuccess(false);
    setCurrentStep(1);
    onClose();
  };

  const banksList = [
    'Vietcombank',
    'Techcombank',
    'MB Bank',
    'ACB',
    'VPBank',
    'BIDV',
    'VietinBank',
    'TPBank',
    'Sacombank',
    'HDBank',
  ];

  return (
    <div className="become-host-overlay" onClick={handleCloseAll}>
      <div className="become-host-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="become-host-header">
          <div className="become-host-header-badge">
            <TbSparkles /> Trở Thành Đối Tác Chủ Nhà TripNest
          </div>
          <button className="become-host-close-btn" onClick={handleCloseAll}>
            <TbX />
          </button>
        </div>

        {!isSuccess ? (
          <>
            {/* Step Progress Tracker */}
            <div className="become-host-steps">
              <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <div className="step-circle">{currentStep > 1 ? <TbCheck /> : '1'}</div>
                <span>Thương hiệu</span>
              </div>
              <div className="step-line" />
              <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="step-circle">{currentStep > 2 ? <TbCheck /> : '2'}</div>
                <span>Pháp lý KYC</span>
              </div>
              <div className="step-line" />
              <div className={`step-item ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                <div className="step-circle">{currentStep > 3 ? <TbCheck /> : '3'}</div>
                <span>Ngân hàng</span>
              </div>
              <div className="step-line" />
              <div className={`step-item ${currentStep >= 4 ? 'active' : ''}`}>
                <div className="step-circle">4</div>
                <span>Xác nhận</span>
              </div>
            </div>

            {/* Form Content */}
            <div className="become-host-body">
              {/* STEP 1: Basic & Brand Info */}
              {currentStep === 1 && (
                <div className="step-pane animate-fade">
                  <h3 className="step-title">Thông Tin Chủ Nhà & Bất Động Sản</h3>
                  <p className="step-desc">
                    Tên hiển thị và thông tin liên hệ chính thức sẽ xuất hiện trên trang chi tiết chỗ nghỉ của bạn.
                  </p>

                  <div className="form-group-grid">
                    <div className="form-group">
                      <label>Tên hiển thị Chủ nhà (Host Name) *</label>
                      <input
                        type="text"
                        placeholder="VD: Minh Hoàng Luxury Stay"
                        value={formData.hostDisplayName}
                        onChange={(e) => setFormData({ ...formData, hostDisplayName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Số điện thoại liên hệ *</label>
                      <input
                        type="tel"
                        placeholder="VD: 0912 345 678"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-grid">
                    <div className="form-group">
                      <label>Email liên hệ công việc</label>
                      <input
                        type="email"
                        placeholder="VD: host.contact@gmail.com"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Loại hình lưu trú dự kiến</label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      >
                        <option value="Biệt thự villa nghỉ dưỡng">Biệt thự villa nghỉ dưỡng</option>
                        <option value="Căn hộ cao cấp ven biển / trung tâm">Căn hộ cao cấp ven biển / trung tâm</option>
                        <option value="Homestay bungalow mộc mạc">Homestay bungalow mộc mạc</option>
                        <option value="Nhà gỗ rừng thông Sapa / Đà Lạt">Nhà gỗ rừng thông Sapa / Đà Lạt</option>
                        <option value="Du thuyền & Tour trải nghiệm">Du thuyền & Tour trải nghiệm</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Giới thiệu tóm tắt & Kế hoạch đón khách</label>
                    <textarea
                      rows="3"
                      placeholder="Mô tả ngắn gọn về không gian và trải nghiệm bạn muốn mang tới cho du khách..."
                      value={formData.introduction}
                      onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Legal KYC */}
              {currentStep === 2 && (
                <div className="step-pane animate-fade">
                  <h3 className="step-title">Định Danh Pháp Lý (KYC Verification)</h3>
                  <p className="step-desc">
                    TripNest cam kết bảo mật 100% tài liệu định danh cá nhân theo tiêu chuẩn an toàn dữ liệu lưu trú.
                  </p>

                  <div className="form-group">
                    <label>Số Căn cước công dân / Hộ chiếu *</label>
                    <input
                      type="text"
                      placeholder="VD: 001095012847"
                      value={formData.idCardNumber}
                      onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
                      style={{ letterSpacing: '1px', fontWeight: 700 }}
                      required
                    />
                  </div>

                  <div className="cccd-preview-grid">
                    <div className="cccd-card">
                      <span className="cccd-label">Ảnh CCCD Mặt Trước</span>
                      <div className="cccd-img-wrap">
                        <img src={formData.idCardFrontUrl} alt="CCCD Mặt trước" />
                        <span className="cccd-verified-pill">
                          <TbShieldCheck /> Đã định dạng chuẩn
                        </span>
                      </div>
                    </div>

                    <div className="cccd-card">
                      <span className="cccd-label">Ảnh CCCD Mặt Sau</span>
                      <div className="cccd-img-wrap">
                        <img src={formData.idCardBackUrl} alt="CCCD Mặt sau" />
                        <span className="cccd-verified-pill">
                          <TbShieldCheck /> Đã định dạng chuẩn
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-callout">
                    <TbInfoCircle style={{ fontSize: '1.2rem', color: '#0284c7', flexShrink: 0 }} />
                    <span>Hệ thống tự động kích hoạt mã hóa SSL 256-bit bảo vệ hồ sơ pháp lý của bạn trước khi Admin thẩm định.</span>
                  </div>
                </div>
              )}

              {/* STEP 3: Bank Account */}
              {currentStep === 3 && (
                <div className="step-pane animate-fade">
                  <h3 className="step-title">Tài Khoản Nhận Tiền Giải Ngân (Payout)</h3>
                  <p className="step-desc">
                    Doanh thu cho thuê (sau khi khấu trừ 12% hoa hồng sàn) sẽ được chuyển tự động vào tài khoản này sau mỗi đợt khách Check-out.
                  </p>

                  <div className="form-group">
                    <label>Ngân hàng thụ hưởng *</label>
                    <select
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    >
                      {banksList.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-grid">
                    <div className="form-group">
                      <label>Số tài khoản ngân hàng *</label>
                      <input
                        type="text"
                        placeholder="VD: 0071001234567"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        style={{ letterSpacing: '1px', fontWeight: 700 }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Tên chủ tài khoản (In hoa không dấu) *</label>
                      <input
                        type="text"
                        placeholder="VD: NGUYEN MINH HOANG"
                        value={formData.accountHolderName}
                        onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value.toUpperCase() })}
                        style={{ fontWeight: 700 }}
                        required
                      />
                    </div>
                  </div>

                  <div className="escrow-payout-box">
                    <div className="escrow-badge">
                      <TbShieldCheck /> Cơ Chế Escrow Bảo Đảm 100%
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>
                      TripNest thu hộ tiền từ khách và giải ngân minh bạch 88% cho Host ngay sau khi khách hoàn tất lưu trú.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="step-pane animate-fade">
                  <h3 className="step-title">Xác Nhận Hồ Sơ & Nộp Thẩm Định</h3>
                  <p className="step-desc">
                    Vui lòng kiểm tra lại thông tin hồ sơ trước khi gửi đến Ban Quản Trị TripNest.
                  </p>

                  <div className="review-summary-card">
                    <div className="review-row">
                      <span>Tên thương hiệu Host:</span>
                      <strong>{formData.hostDisplayName}</strong>
                    </div>
                    <div className="review-row">
                      <span>Số điện thoại:</span>
                      <strong>{formData.contactPhone}</strong>
                    </div>
                    <div className="review-row">
                      <span>Số CCCD:</span>
                      <strong style={{ fontFamily: 'monospace' }}>{formData.idCardNumber}</strong>
                    </div>
                    <div className="review-row">
                      <span>Ngân hàng nhận Payout:</span>
                      <strong>{formData.bankName} - {formData.accountNumber} ({formData.accountHolderName})</strong>
                    </div>
                    <div className="review-row">
                      <span>Loại hình BĐS:</span>
                      <strong>{formData.propertyType}</strong>
                    </div>
                  </div>

                  <div className="terms-checkbox-row">
                    <input
                      type="checkbox"
                      id="terms-check"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    />
                    <label htmlFor="terms-check">
                      Tôi cam kết thông tin cung cấp là chính xác, đồng ý với <strong>Quy chế Hoạt động</strong> và <strong>Chính sách Hoa hồng 12%</strong> của sàn TripNest.
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation Buttons */}
            <div className="become-host-footer">
              {currentStep > 1 ? (
                <button type="button" className="btn-back" onClick={handleBack}>
                  <TbArrowLeft /> Quay lại
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button type="button" className="btn-primary-gradient" onClick={handleNext}>
                  <span>Tiếp tục</span>
                  <TbArrowRight />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary-gradient"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? 'Đang gửi hồ sơ...' : 'Nộp Hồ Sơ Thẩm Định'}
                  <TbCheck />
                </button>
              )}
            </div>
          </>
        ) : (
          /* SUCCESS CELEBRATION PANE */
          <div className="become-host-success animate-fade">
            <div className="success-icon-circle">
              <TbShieldCheck />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Hồ Sơ Đã Được Gửi Thành Công!
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              Cảm ơn bạn đã đăng ký làm Chủ Nhà trên <strong>TripNest</strong>. Ban Quản Trị sẽ thẩm định thông tin định danh và kích hoạt quyền đăng chỗ nghỉ của bạn trong thời gian sớm nhất.
            </p>

            <div className="success-status-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Trạng thái hồ sơ:</span>
                <span className="status-pill pending" style={{ padding: '3px 10px', fontSize: '0.78rem' }}>
                  ĐANG CHỜ DUYỆT (PENDING)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Chủ nhà đăng ký:</span>
                <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>{formData.hostDisplayName}</strong>
              </div>
            </div>

            <button className="btn-primary-gradient" style={{ width: '100%' }} onClick={handleCloseAll}>
              Đã hiểu & Hoàn tất
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BecomeHostModal;
