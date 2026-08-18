import React from 'react';
import {
  TbBrandFacebook,
  TbBrandTwitter,
  TbBrandInstagram,
  TbWorld,
  TbCompass,
} from 'react-icons/tb';

export const Footer = ({ currency = 'VND' }) => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-content-inner">
        <div className="footer-links-grid">
          {/* Column 1 */}
          <div>
            <h4 className="footer-column-title">Hỗ trợ & Trợ giúp</h4>
            <ul className="footer-links-list">
              <li><a href="#help" className="footer-link-anchor">Trung tâm trợ giúp TripNest</a></li>
              <li><a href="#aircover" className="footer-link-anchor">TripCover - Bảo vệ toàn diện</a></li>
              <li><a href="#safety" className="footer-link-anchor">Thông tin an toàn & sức khỏe</a></li>
              <li><a href="#cancellation" className="footer-link-anchor">Chính sách hủy linh hoạt</a></li>
              <li><a href="#disabilities" className="footer-link-anchor">Hỗ trợ người khuyết tật</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="footer-column-title">Cộng đồng</h4>
            <ul className="footer-links-list">
              <li><a href="#charity" className="footer-link-anchor">TripNest.org - Cứu trợ khẩn cấp</a></li>
              <li><a href="#community" className="footer-link-anchor">Diễn đàn cộng đồng thành viên</a></li>
              <li><a href="#diversity" className="footer-link-anchor">Không phân biệt đối xử</a></li>
              <li><a href="#events" className="footer-link-anchor">Sự kiện du lịch & Trải nghiệm</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="footer-column-title">Đón tiếp khách (Hosting)</h4>
            <ul className="footer-links-list">
              <li><a href="#host" className="footer-link-anchor">Cho thuê chỗ ở cùng TripNest</a></li>
              <li><a href="#hostcover" className="footer-link-anchor">TripCover cho Chủ nhà</a></li>
              <li><a href="#resources" className="footer-link-anchor">Tài nguyên & cẩm nang đón tiếp</a></li>
              <li><a href="#forum" className="footer-link-anchor">Ghé thăm diễn đàn chủ nhà</a></li>
              <li><a href="#responsibly" className="footer-link-anchor">Đón tiếp khách có trách nhiệm</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="footer-column-title">Về TripNest</h4>
            <ul className="footer-links-list">
              <li><a href="#news" className="footer-link-anchor">Trang tin tức & Báo chí</a></li>
              <li><a href="#features" className="footer-link-anchor">Tìm hiểu các tính năng mới</a></li>
              <li><a href="#careers" className="footer-link-anchor">Cơ hội nghề nghiệp</a></li>
              <li><a href="#investors" className="footer-link-anchor">Nhà đầu tư</a></li>
              <li><a href="#giftcards" className="footer-link-anchor">Thẻ quà tặng TripNest</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span>© 2026 TripNest, Inc. Bảo lưu mọi quyền.</span>
            <span>·</span>
            <a href="#privacy" className="footer-link-anchor">Quyền riêng tư</a>
            <span>·</span>
            <a href="#terms" className="footer-link-anchor">Điều khoản</a>
            <span>·</span>
            <a href="#sitemap" className="footer-link-anchor">Sơ đồ trang web</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              <TbWorld /> Tiếng Việt (VN)
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {currency === 'VND' ? '₫ VND' : currency === 'USD' ? '$ USD' : '€ EUR'}
            </div>
            <div className="footer-socials">
              <a href="#fb" style={{ color: 'inherit' }} title="Facebook"><TbBrandFacebook /></a>
              <a href="#tw" style={{ color: 'inherit' }} title="Twitter"><TbBrandTwitter /></a>
              <a href="#ins" style={{ color: 'inherit' }} title="Instagram"><TbBrandInstagram /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
