import React, { useState, useMemo } from 'react';
import {
  TbTrophy,
  TbCrown,
  TbMedal,
  TbSearch,
  TbDownload,
  TbRefresh,
  TbBuildingCastle,
  TbStar,
  TbCoins,
  TbShieldCheck,
  TbFileDollar,
  TbArrowUpRight,
  TbArrowsSort,
  TbChevronDown,
  TbX,
  TbAlertCircle,
  TbPlus,
} from 'react-icons/tb';
import AdminPageHeader from '../../admin/common/AdminPageHeader';
import AccommodationPerformanceModal from '../modals/AccommodationPerformanceModal';
import { HostRankingsSkeleton } from '@/components/common/skeletons';
import { apiService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import './HostRankingsPage.css';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600';
const BACKUP_LUXURY_IMAGE = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600';

export const HostRankingsPage = ({
  listings = [],
  bookings = [],
  statsData = {},
  currency = 'VND',
  onNavigate,
  onEditListing,
  onOpenRoomDetail,
  onOpenWizard,
}) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [dbRankings, setDbRankings] = useState(null);
  const [selectedAccForStatement, setSelectedAccForStatement] = useState(null);

  // Chu kỳ thời gian đồng bộ với Dashboard (Mặc định: 7 Ngày)
  const [period, setPeriod] = useState('week'); // 'week' | 'month' | 'quarter' | 'year' | 'all'
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Filter & Search states (chuẩn Admin)
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'top_revenue' | 'has_revenue' | 'published'
  const [sortBy, setSortBy] = useState('gmv_desc'); // 'gmv_desc' | 'net_desc' | 'bookings_desc' | 'occupancy_desc' | 'rating_desc'

  const fetchRankings = async (currentPeriod = period, currentYear = selectedYear, currentQuarter = selectedQuarter) => {
    setLoading(true);
    try {
      const res = await apiService.getHostRankings({
        period: currentPeriod,
        year: currentYear,
        quarter: currentQuarter,
        month: new Date().getMonth() + 1,
      });
      if (res && res.success && Array.isArray(res.data)) {
        setDbRankings(res.data);
      }
    } catch (e) {
      console.warn('Lỗi tải bảng xếp hạng Host:', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRankings(period, selectedYear, selectedQuarter);
  }, [period, selectedYear, selectedQuarter]);

  const formatCurrency = (val) => {
    if (currency === 'USD') return `$${Math.round((val || 0) / 25000).toLocaleString()}`;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  // Helper tìm ảnh hợp lệ, loại trừ domain chết
  const getSafeImage = (item) => {
    const isBadUrl = (url) => !url || typeof url !== 'string' || url.includes('thegioibietthu.com') || url === 'undefined' || url === 'null';

    if (!isBadUrl(item.thumbnail)) {
      return item.thumbnail;
    }
    if (Array.isArray(item.images) && item.images.length > 0) {
      const goodImg = item.images.find((img) => !isBadUrl(img) && (img.startsWith('http') || img.startsWith('/')));
      if (goodImg) return goodImg;
    }
    return DEFAULT_FALLBACK_IMAGE;
  };

  // 1. Chuẩn hoá dữ liệu cơ sở lưu trú đồng bộ với Admin HostsRevenuePage
  const normalizedAccommodations = useMemo(() => {
    if (Array.isArray(dbRankings) && dbRankings.length > 0) {
      return dbRankings.map((item) => ({
        ...item,
        thumbnail: getSafeImage(item),
      }));
    }

    const rawListings = Array.isArray(listings) && listings.length > 0 ? listings : [];
    if (rawListings.length === 0) {
      return [];
    }

    const breakdown = statsData?.accommodationBreakdown || [];

    return rawListings.map((item, idx) => {
      const matchedBreakdown = breakdown.find(
        (b) => String(b.id) === String(item.id) || b.name === (item.nameVi || item.name)
      );

      const accBookings = (Array.isArray(bookings) ? bookings : []).filter(
        (b) =>
          String(b.accommodation_id || b.accommodationId || b.property_id) === String(item.id) ||
          (b.roomTitle && b.roomTitle.toLowerCase().includes((item.nameVi || item.name || '').toLowerCase())) ||
          (b.listingName && b.listingName.toLowerCase().includes((item.nameVi || item.name || '').toLowerCase()))
      );

      let gmv = 0;
      let completedBookingsCount = 0;

      if (matchedBreakdown && Number(matchedBreakdown.gmv) > 0) {
        gmv = Number(matchedBreakdown.gmv);
        completedBookingsCount = Number(matchedBreakdown.bookings_count) || accBookings.length;
      } else if (accBookings.length > 0) {
        gmv = accBookings.reduce((sum, b) => {
          const val = Number(b.totalPrice || b.totalAmount || b.grossAmount || 0);
          return sum + val;
        }, 0);
        completedBookingsCount = accBookings.length;
      }

      const commission = Math.round(gmv * 0.12);
      const netEarnings = Math.max(0, gmv - commission);
      const occupancyRate = 0;
      const rating = item.rating ? Number(item.rating) : 5.0;
      const reviewsCount = item.reviews_count || item.review_count || 0;

      return {
        ...item,
        id: item.id || idx + 1,
        nameVi: item.nameVi || item.name || item.title || `Cơ sở #${idx + 1}`,
        city: item.city || 'Việt Nam',
        address: item.address || `${item.city || 'Việt Nam'}, Việt Nam`,
        accommodationType: item.accommodationType || item.category || 'Biệt thự',
        thumbnail: getSafeImage(item),
        status: item.status || 'published',
        priceVND: item.priceVND || item.price || 1500000,
        total_gmv: gmv,
        commission: commission,
        net_earnings: netEarnings,
        completed_bookings: completedBookingsCount,
        occupancy_rate: occupancyRate,
        rating: rating,
        reviews_count: reviewsCount,
        bookingsList: accBookings,
      };
    });
  }, [dbRankings, listings, bookings, statsData]);

  // Max GMV for progress bars
  const maxGMV = useMemo(() => {
    return Math.max(...normalizedAccommodations.map((i) => i.total_gmv), 1000000);
  }, [normalizedAccommodations]);

  // Top 3 Podium Winners sorted by GMV
  const sortedByGmv = useMemo(() => {
    return [...normalizedAccommodations].sort((a, b) => b.total_gmv - a.total_gmv);
  }, [normalizedAccommodations]);

  const top1 = sortedByGmv[0];
  const top2 = sortedByGmv[1];
  const top3 = sortedByGmv[2];

  // Filter counts
  const topRevenueCount = useMemo(() => {
    const threshold = maxGMV * 0.25;
    return normalizedAccommodations.filter((i) => i.total_gmv >= threshold).length;
  }, [normalizedAccommodations, maxGMV]);

  const hasRevenueCount = useMemo(() => {
    return normalizedAccommodations.filter((i) => i.total_gmv > 0).length;
  }, [normalizedAccommodations]);

  const publishedCount = useMemo(() => {
    return normalizedAccommodations.filter((i) => i.status === 'published').length;
  }, [normalizedAccommodations]);

  // Filtered & sorted accommodations
  const filteredAccommodations = useMemo(() => {
    let result = [...normalizedAccommodations];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.nameVi.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q) ||
          (i.address && i.address.toLowerCase().includes(q)) ||
          i.accommodationType.toLowerCase().includes(q)
      );
    }

    if (filterType === 'top_revenue') {
      const threshold = maxGMV * 0.25;
      result = result.filter((i) => i.total_gmv >= threshold);
    } else if (filterType === 'has_revenue') {
      result = result.filter((i) => i.total_gmv > 0);
    } else if (filterType === 'published') {
      result = result.filter((i) => i.status === 'published');
    }

    if (sortBy === 'gmv_desc') {
      result.sort((a, b) => b.total_gmv - a.total_gmv);
    } else if (sortBy === 'net_desc') {
      result.sort((a, b) => b.net_earnings - a.net_earnings);
    } else if (sortBy === 'bookings_desc') {
      result.sort((a, b) => b.completed_bookings - a.completed_bookings);
    } else if (sortBy === 'occupancy_desc') {
      result.sort((a, b) => b.occupancy_rate - a.occupancy_rate);
    } else if (sortBy === 'rating_desc') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [normalizedAccommodations, search, filterType, sortBy, maxGMV]);

  // Refresh handler
  const handleRefresh = async () => {
    toast.info('Đang làm mới', 'Đang cập nhật số liệu từ cơ sở dữ liệu...');
    await fetchRankings();
    toast.success('Đã làm mới', 'Bảng xếp hạng cơ sở lưu trú đã được đồng bộ từ cơ sở dữ liệu.');
  };

  // Export CSV Report (Chuẩn Admin)
  const handleExportCSV = () => {
    try {
      const headers = [
        'Hạng',
        'ID Chỗ Nghỉ',
        'Tên Cơ Sở Lưu Trú',
        'Thành Phố',
        'Loại Hình',
        'Giá Niêm Yết/Đêm (VND)',
        'Số Đơn Hoàn Tất',
        'Tổng GMV Thu Hộ (VND)',
        'Phí Sàn 12% (VND)',
        'Thực Nhận 88% (VND)',
        'Tỷ Lệ Lấp Đầy (%)',
        'Đánh Giá Sao',
        'Trạng Thái',
      ];

      const rows = filteredAccommodations.map((h, i) => [
        i + 1,
        h.id,
        `"${h.nameVi}"`,
        `"${h.city}"`,
        `"${h.accommodationType}"`,
        h.priceVND,
        h.completed_bookings,
        h.total_gmv,
        h.commission,
        h.net_earnings,
        `${h.occupancy_rate}%`,
        h.rating,
        h.status === 'published' ? 'Đang mở bán' : 'Tạm dừng',
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `TripNest_XepHang_CoSoLuuTru_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Xuất file thành công', `Đã xuất dữ liệu của ${filteredAccommodations.length} cơ sở lưu trú ra file CSV.`);
    } catch (e) {
      toast.error('Lỗi khi xuất file', e.message);
    }
  };

  if (loading && !dbRankings) {
    return <HostRankingsSkeleton />;
  }

  return (
    <div className={`adm-hosts-revenue-container host-rank-admin-mirror ${loading ? 'sk-refresh-overlay' : ''}`}>
      {/* 1. Header (Chuẩn AdminPageHeader) */}
      <AdminPageHeader
        title="Bảng Xếp Hạng & Thống Kê Doanh Thu Cơ Sở Lưu Trú"
        subtitle="Theo dõi hiệu suất dòng tiền, doanh số GMV và sao kê chi tiết của từng chỗ nghỉ trên hệ thống"
        actionButton={
          <div className="host-rank-header-right">
            <div className="host-rank-header-actions">
              <button
                type="button"
                className="btn-admin-secondary adm-hr-mini-btn"
                onClick={() => onNavigate && onNavigate('accommodations')}
                title="Quay lại danh sách Quản lý cơ sở lưu trú"
              >
                <TbBuildingCastle />
                <span>Quản Lý Chỗ Ở</span>
              </button>
              {onOpenWizard && (
                <button
                  type="button"
                  className="btn-admin-primary adm-hr-mini-btn"
                  onClick={onOpenWizard}
                  title="Đăng ký thêm cơ sở lưu trú mới"
                >
                  <TbPlus />
                  <span>Thêm Chỗ Nghỉ</span>
                </button>
              )}
            </div>

            {/* Khối chu kỳ thời gian (7 Ngày / Tháng / Quý / Năm / Tất Cả) đặt dưới 2 nút quản lý */}
            <div className="host-rank-period-pills">
              <button
                type="button"
                className={`host-rank-pill ${period === 'week' ? 'active' : ''}`}
                onClick={() => setPeriod('week')}
              >
                7 Ngày
              </button>
              <button
                type="button"
                className={`host-rank-pill ${period === 'month' ? 'active' : ''}`}
                onClick={() => setPeriod('month')}
              >
                Tháng Này
              </button>
              <button
                type="button"
                className={`host-rank-pill ${period === 'quarter' ? 'active' : ''}`}
                onClick={() => setPeriod('quarter')}
              >
                Quý {selectedQuarter}
              </button>
              <button
                type="button"
                className={`host-rank-pill ${period === 'year' ? 'active' : ''}`}
                onClick={() => setPeriod('year')}
              >
                Năm {selectedYear}
              </button>
              <button
                type="button"
                className={`host-rank-pill ${period === 'all' ? 'active' : ''}`}
                onClick={() => setPeriod('all')}
              >
                Tất Cả
              </button>
            </div>
          </div>
        }
      />

      {/* 2. Top Podium Winners (Khuôn mẫu 100% Admin HostsRevenuePage) */}
      {sortedByGmv.length > 0 && (
        <div className="adm-hr-podium-section">
          <div className="adm-hr-section-header">
            <div className="adm-hr-section-title">
              <TbTrophy className="adm-hr-trophy-icon" />
              <span>{sortedByGmv.length >= 3 ? 'Vinh Danh Top 3 Cơ Sở Lưu Trú Doanh Số Dẫn Đầu' : 'Cơ Sở Lưu Trú Doanh Số Dẫn Đầu'}</span>
            </div>
            <span className="adm-hr-section-sub">
              Đóng góp {Math.round(((sortedByGmv.slice(0, 3).reduce((s, c) => s + c.total_gmv, 0)) / Math.max(1, sortedByGmv.reduce((s, c) => s + c.total_gmv, 0))) * 100)}% tổng giá trị giao dịch của bạn trên nền tảng
            </span>
          </div>

          <div className="adm-hr-podium-grid">
            {/* Rank 2 - Silver (Á Quân) */}
            {top2 && (
              <div
                className="adm-hr-podium-card rank-2"
                onClick={() => setSelectedAccForStatement({ ...top2, rank: 2 })}
                title="Bấm để xem sao kê dòng tiền chi tiết"
              >
                <div className="adm-hr-podium-rank rank-2">
                  <TbMedal className="podium-inline-rank-icon silver" />
                  <span>Á Quân (#2)</span>
                </div>
                <div className="adm-hr-podium-avatar-container">
                  <div className="adm-hr-podium-avatar-wrap">
                    <img
                      src={top2.thumbnail}
                      alt=""
                      className="adm-hr-podium-avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = BACKUP_LUXURY_IMAGE;
                      }}
                    />
                  </div>
                  <span className="adm-hr-podium-star" title="Đánh giá cao">
                    <TbStar />
                  </span>
                </div>
                <h4 className="adm-hr-podium-name" title={top2.nameVi}>{top2.nameVi}</h4>
                <div className="adm-hr-podium-meta">
                  <span>{top2.accommodationType}</span> • <span>{top2.completed_bookings} Đơn</span> • <span>{top2.city}</span>
                </div>
                <div className="adm-hr-podium-gmv">{formatCurrency(top2.total_gmv)}</div>
                <div className="adm-hr-podium-net">Thực nhận: {formatCurrency(top2.net_earnings)}</div>
                <button type="button" className="adm-hr-podium-btn">
                  <TbFileDollar size={14} />
                  <span>Xem Sao Kê</span>
                  <TbArrowUpRight />
                </button>
              </div>
            )}

            {/* Rank 1 - Gold (Quán Quân) */}
            {top1 && (
              <div
                className="adm-hr-podium-card rank-1"
                onClick={() => setSelectedAccForStatement({ ...top1, rank: 1 })}
                title="Bấm để xem sao kê dòng tiền chi tiết"
              >
                <div className="adm-hr-podium-crown">
                  <TbCrown />
                </div>
                <div className="adm-hr-podium-rank rank-1">
                  <TbCrown className="podium-inline-rank-icon gold" />
                  <span>Quán Quân (#1)</span>
                </div>
                <div className="adm-hr-podium-avatar-container main">
                  <div className="adm-hr-podium-avatar-wrap main">
                    <img
                      src={top1.thumbnail}
                      alt=""
                      className="adm-hr-podium-avatar main"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                  <span className="adm-hr-podium-star main" title="Đánh giá cao">
                    <TbStar />
                  </span>
                </div>
                <h3 className="adm-hr-podium-name main" title={top1.nameVi}>{top1.nameVi}</h3>
                <div className="adm-hr-podium-meta">
                  <span>{top1.accommodationType}</span> • <span>{top1.completed_bookings} Đơn</span> • <span>{top1.city}</span>
                </div>
                <div className="adm-hr-podium-gmv main">{formatCurrency(top1.total_gmv)}</div>
                <div className="adm-hr-podium-net">Thực nhận: {formatCurrency(top1.net_earnings)}</div>
                <button type="button" className="adm-hr-podium-btn main">
                  <TbFileDollar size={15} />
                  <span>Xem Bảng Sao Kê Dòng Tiền</span>
                  <TbArrowUpRight />
                </button>
              </div>
            )}

            {/* Rank 3 - Bronze (Quý Quân) */}
            {top3 && (
              <div
                className="adm-hr-podium-card rank-3"
                onClick={() => setSelectedAccForStatement({ ...top3, rank: 3 })}
                title="Bấm để xem sao kê dòng tiền chi tiết"
              >
                <div className="adm-hr-podium-rank rank-3">
                  <TbMedal className="podium-inline-rank-icon bronze" />
                  <span>Quý Quân (#3)</span>
                </div>
                <div className="adm-hr-podium-avatar-container">
                  <div className="adm-hr-podium-avatar-wrap">
                    <img
                      src={top3.thumbnail}
                      alt=""
                      className="adm-hr-podium-avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = BACKUP_LUXURY_IMAGE;
                      }}
                    />
                  </div>
                  <span className="adm-hr-podium-star" title="Đánh giá cao">
                    <TbStar />
                  </span>
                </div>
                <h4 className="adm-hr-podium-name" title={top3.nameVi}>{top3.nameVi}</h4>
                <div className="adm-hr-podium-meta">
                  <span>{top3.accommodationType}</span> • <span>{top3.completed_bookings} Đơn</span> • <span>{top3.city}</span>
                </div>
                <div className="adm-hr-podium-gmv">{formatCurrency(top3.total_gmv)}</div>
                <div className="adm-hr-podium-net">Thực nhận: {formatCurrency(top3.net_earnings)}</div>
                <button type="button" className="adm-hr-podium-btn">
                  <TbFileDollar size={14} />
                  <span>Xem Sao Kê</span>
                  <TbArrowUpRight />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Filter & Search Toolbar (Chuẩn Admin) */}
      <div className="adm-hr-toolbar-card">
        {/* Top Row: Filter Tabs & Actions Group */}
        <div className="adm-hr-toolbar-top">
          <div className="adm-hr-filter-tabs">
            <button
              type="button"
              className={`adm-hr-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              <span>Tất Cả ({normalizedAccommodations.length})</span>
            </button>
            <button
              type="button"
              className={`adm-hr-tab ${filterType === 'top_revenue' ? 'active' : ''}`}
              onClick={() => setFilterType('top_revenue')}
            >
              <TbStar className="tab-svg-icon text-amber" style={{ strokeWidth: 2.2 }} />
              <span>Top Doanh Thu ({topRevenueCount})</span>
            </button>
            <button
              type="button"
              className={`adm-hr-tab ${filterType === 'has_revenue' ? 'active' : ''}`}
              onClick={() => setFilterType('has_revenue')}
            >
              <TbCoins className="tab-svg-icon text-emerald" />
              <span>Có Doanh Thu ({hasRevenueCount})</span>
            </button>
            <button
              type="button"
              className={`adm-hr-tab ${filterType === 'published' ? 'active' : ''}`}
              onClick={() => setFilterType('published')}
            >
              <TbBuildingCastle className="tab-svg-icon text-sky" />
              <span>Đang Mở Bán ({publishedCount})</span>
            </button>
          </div>

          <div className="adm-hr-actions-group">
            <button
              type="button"
              className="btn-admin-secondary adm-hr-mini-btn"
              onClick={handleRefresh}
              disabled={loading}
              title="Tải lại số liệu từ Database"
            >
              <TbRefresh className={loading ? 'adm-spin' : ''} />
              <span>Làm Mới</span>
            </button>

            <button
              type="button"
              className="btn-admin-primary adm-hr-mini-btn"
              onClick={handleExportCSV}
              title="Tải bảng tính báo cáo doanh thu"
            >
              <TbDownload />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Search Input & Sort Select */}
        <div className="adm-hr-toolbar-bottom">
          <div className="adm-hr-search-wrap">
            <TbSearch className="adm-hr-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên chỗ nghỉ, thành phố, địa chỉ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-hr-search-input"
            />
            {search && (
              <button
                type="button"
                className="adm-hr-search-clear"
                onClick={() => setSearch('')}
                title="Xóa tìm kiếm"
              >
                <TbX size={14} />
              </button>
            )}
          </div>

          <div className="adm-hr-sort-box">
            <div className="adm-hr-select-wrapper">
              <TbArrowsSort className="adm-hr-select-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="adm-hr-custom-select"
                aria-label="Sắp xếp danh sách chỗ nghỉ"
              >
                <option value="gmv_desc">GMV Doanh Thu Cao Nhất</option>
                <option value="net_desc">Thực Nhận Host Cao Nhất</option>
                <option value="bookings_desc">Nhiều Đơn Đặt Phòng Nhất</option>
                <option value="occupancy_desc">Tỷ Lệ Lấp Đầy Cao Nhất</option>
                <option value="rating_desc">Điểm Đánh Giá Cao Nhất</option>
              </select>
              <TbChevronDown className="adm-hr-select-chevron" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Content: Table View (Chuẩn 100% Admin HostsRevenuePage) */}
      {filteredAccommodations.length === 0 ? (
        <div className="adm-hr-empty-box">
          <TbAlertCircle className="adm-hr-empty-icon" />
          <h4 className="adm-hr-empty-title">Không tìm thấy cơ sở lưu trú phù hợp</h4>
          <p className="adm-hr-empty-desc">Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc phân loại.</p>
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={() => {
              setSearch('');
              setFilterType('all');
            }}
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="adm-hr-table-card">
          <div className="adm-hr-table-responsive">
            <table className="adm-hr-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Hạng</th>
                  <th style={{ minWidth: '300px' }}>Cơ Sở Lưu Trú</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Thành Phố</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Đơn Hoàn Tất</th>
                  <th style={{ minWidth: '150px' }}>GMV Thu Hộ (100%)</th>
                  <th style={{ minWidth: '130px' }}>Thực Nhận (88%)</th>
                  <th style={{ minWidth: '110px' }}>Phí Sàn (12%)</th>
                  <th style={{ minWidth: '130px', textAlign: 'right' }}>Giá Bình Quân (ADR)</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccommodations.map((acc, index) => {
                  const gmvPercent = Math.min(100, Math.max(8, (acc.total_gmv / maxGMV) * 100));
                  return (
                    <tr
                      key={acc.id}
                      className="adm-hr-table-row"
                      onClick={() => setSelectedAccForStatement({ ...acc, rank: index + 1 })}
                      title="Bấm để mở bảng sao kê dòng tiền chi tiết"
                    >
                      {/* Rank with momentum */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="adm-hr-rank-wrap">
                          <div className={`adm-hr-rank-badge rank-${index + 1}`}>
                            {index === 0 ? (
                              <TbCrown className="rank-svg-icon gold" title="Quán quân" />
                            ) : index === 1 ? (
                              <TbMedal className="rank-svg-icon silver" title="Á quân" />
                            ) : index === 2 ? (
                              <TbMedal className="rank-svg-icon bronze" title="Quý quân" />
                            ) : (
                              `#${index + 1}`
                            )}
                            {acc.rank_trend && acc.rank_trend !== 'same' && (
                              <span
                                className={`rank-momentum ${acc.rank_trend}`}
                                title={acc.rank_trend === 'up' ? 'Thứ hạng tăng' : 'Thứ hạng giảm'}
                              >
                                {acc.rank_trend === 'up' ? (
                                  <svg viewBox="0 0 10 10" width="7" height="7" fill="currentColor">
                                    <path d="M5 1.5L9 7.5H1z" />
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 10 10" width="7" height="7" fill="currentColor">
                                    <path d="M5 8.5L1 2.5h8z" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Accommodation Info */}
                      <td>
                        <div className="adm-hr-host-cell">
                          <div className="adm-hr-host-avatar-container">
                            <div className="adm-hr-host-avatar-wrap">
                              <img
                                src={acc.thumbnail}
                                alt=""
                                className="adm-hr-host-avatar"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = BACKUP_LUXURY_IMAGE;
                                }}
                              />
                            </div>
                            <span className="adm-hr-host-badge-super" title="Đánh giá cao">
                              <TbStar />
                            </span>
                          </div>
                          <div className="adm-hr-host-info">
                            <div className="adm-hr-host-name-row">
                              <span className="adm-hr-host-name" title={acc.nameVi}>
                                {acc.nameVi}
                              </span>
                              <span className="badge-superhost">{acc.accommodationType}</span>
                            </div>
                            <span className="adm-hr-host-sub" title={acc.address || acc.city}>
                              {acc.address || acc.city}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* City */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="adm-hr-tag acc">{acc.city}</span>
                      </td>

                      {/* Completed bookings */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="adm-hr-tag booking">{acc.completed_bookings} đơn</span>
                      </td>

                      {/* GMV */}
                      <td>
                        <div className="adm-hr-gmv-cell">
                          <span className="adm-hr-gmv-val">{formatCurrency(acc.total_gmv)}</span>
                          <div className="adm-hr-bar-track">
                            <div className="adm-hr-bar-fill gmv" style={{ width: `${gmvPercent}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Net Earnings */}
                      <td>
                        <span className="adm-hr-net-val">{formatCurrency(acc.net_earnings)}</span>
                      </td>

                      {/* Platform Fee */}
                      <td>
                        <span className="adm-hr-fee-val">{formatCurrency(acc.commission)}</span>
                      </td>

                      {/* ADR & RevPAR (Chỉ số tài chính chuyên sâu) */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="adm-hr-adr-cell">
                          <span className="adm-hr-adr-val">{formatCurrency(acc.adr || acc.priceVND || 0)}</span>
                          <span className="adm-hr-revpar-sub">RevPAR: {formatCurrency(acc.revpar || 0)}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="adm-hr-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAccForStatement({ ...acc, rank: index + 1 });
                          }}
                          title="Xem sao kê dòng tiền chi tiết"
                        >
                          <TbFileDollar size={15} />
                          <span>Sao Kê</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Accommodation Statement Modal */}
      {selectedAccForStatement && (
        <AccommodationPerformanceModal
          accommodation={selectedAccForStatement}
          currency={currency}
          onClose={() => setSelectedAccForStatement(null)}
          onEdit={(acc) => {
            setSelectedAccForStatement(null);
            if (onEditListing) onEditListing(acc);
          }}
          onViewDetail={(acc) => {
            setSelectedAccForStatement(null);
            if (onOpenRoomDetail) onOpenRoomDetail(acc);
          }}
        />
      )}
    </div>
  );
};

export default HostRankingsPage;
