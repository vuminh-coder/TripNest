import React from 'react';
import {
  TbBrandFacebook,
  TbBrandTwitter,
  TbBrandInstagram,
  TbWorld,
  TbCompass,
  TbShieldCheck,
} from 'react-icons/tb';

export const Footer = ({ currency = 'VND' }) => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-content-inner">
        {/* Main Grid: 1 Brand Bio Col + 3 Link Cols spanning 1400px evenly */}
        <div className="footer-main-grid">
          {/* Brand Info Column */}
          <div className="footer-brand-col">
            <div className="footer-logo-row">
              <TbCompass className="footer-logo-icon" />
              <span className="footer-logo-text">TripNest</span>
            </div>
            <p className="footer-brand-tagline">
              Nền tảng đặt phòng nghỉ dưỡng, biệt thự & trải nghiệm du lịch cao cấp hàng đầu.
            </p>
            <div className="footer-trust-badge">
              <TbShieldCheck className="trust-badge-icon" />
              <span>Bảo đảm chuyến đi TripCover 100%</span>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="footer-col">
            <h4 className="footer-column-title">Hỗ trợ</h4>
            <ul className="footer-links-list">
              <li><a href="#help" className="footer-link-anchor">Trung tâm trợ giúp</a></li>
              <li><a href="#tripcover" className="footer-link-anchor">Bảo đảm TripCover</a></li>
              <li><a href="#cancellation" className="footer-link-anchor">Chính sách hoàn hủy</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="footer-col">
            <h4 className="footer-column-title">Đón tiếp khách</h4>
            <ul className="footer-links-list">
              <li><a href="#host" className="footer-link-anchor">Cho thuê chỗ ở</a></li>
              <li><a href="#resources" className="footer-link-anchor">Cẩm nang chủ nhà</a></li>
              <li><a href="#community" className="footer-link-anchor">Diễn đàn cộng đồng</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div className="footer-col">
            <h4 className="footer-column-title">Về TripNest</h4>
            <ul className="footer-links-list">
              <li><a href="#about" className="footer-link-anchor">Giới thiệu & Tin tức</a></li>
              <li><a href="#careers" className="footer-link-anchor">Cơ hội nghề nghiệp</a></li>
              <li><a href="#investors" className="footer-link-anchor">Nhà đầu tư</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright on Left, Regional & Socials on Right */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright-links">
            <span className="footer-copy-text">© 2026 TripNest, Inc.</span>
            <span className="footer-dot-sep">·</span>
            <a href="#privacy" className="footer-legal-link">Quyền riêng tư</a>
            <span className="footer-dot-sep">·</span>
            <a href="#terms" className="footer-legal-link">Điều khoản</a>
            <span className="footer-dot-sep">·</span>
            <a href="#sitemap" className="footer-legal-link">Sơ đồ trang web</a>
          </div>

          <div className="footer-settings-socials">
            <div className="footer-lang-pill">
              <TbWorld className="footer-lang-icon" /> Tiếng Việt (VN)
            </div>
            <div className="footer-currency-pill">
              {currency === 'VND' ? '₫ VND' : currency === 'USD' ? '$ USD' : '€ EUR'}
            </div>
            <div className="footer-socials">
              <a href="#fb" className="social-icon-btn" title="Facebook"><TbBrandFacebook /></a>
              <a href="#tw" className="social-icon-btn" title="Twitter"><TbBrandTwitter /></a>
              <a href="#ins" className="social-icon-btn" title="Instagram"><TbBrandInstagram /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
