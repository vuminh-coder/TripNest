import React, { useState } from "react";
import "./AccommodationsPage.css";
import {
  TbEye,
  TbBan,
  TbStar,
  TbFlame,
  TbSearch,
  TbMapPin,
  TbLockOpen,
} from "react-icons/tb";
import AdminPageHeader from "../common/AdminPageHeader";
import AdminTableWrapper from "../common/AdminTableWrapper";
import AdminConfirmDialog from "../common/AdminConfirmDialog";

export const AccommodationsPage = ({
  accommodations = [],
  onUpdateStatus,
  onToggleFlag,
  onOpenDetailModal,
}) => {
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Confirm Suspend / Restore Dialog State
  const [suspendTarget, setSuspendTarget] = useState(null); // { acc, action: 'suspend' | 'restore' }

  const formatVND = (val) => `${(val || 0).toLocaleString("vi-VN")} ₫`;

  const getHostName = (acc) => {
    return (
      acc.host_name ||
      acc.host?.displayName ||
      acc.host?.user?.full_name ||
      acc.host?.name ||
      "Chủ nhà TripNest"
    );
  };

  const distinctCities = React.useMemo(() => {
    const set = new Set(accommodations.map((a) => a.city).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [accommodations]);

  const filtered = accommodations.filter((acc) => {
    if (cityFilter !== "all" && acc.city !== cityFilter) return false;
    if (statusFilter !== "all" && acc.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName =
        (acc.name_vi && acc.name_vi.toLowerCase().includes(q)) ||
        (acc.name_en && acc.name_en.toLowerCase().includes(q));
      const matchCity = acc.city && acc.city.toLowerCase().includes(q);
      const host = getHostName(acc).toLowerCase();
      const matchHost = host.includes(q);
      if (!matchName && !matchCity && !matchHost) return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="adm-accommodations-container">
      {/* Header */}
      <AdminPageHeader
        title="Cơ Sở Lưu Trú & Hạng Phòng"
        subtitle={`Quản lý và kiểm duyệt ${accommodations.length} cơ sở trên toàn hệ thống · Điều phối trạng thái kinh doanh`}
      />

      {/* Filter Bar */}
      <div className="admin-card-box adm-acc-filter-box">
        <div className="adm-acc-filter-bar">
          <div className="adm-acc-search-wrapper">
            <TbSearch className="adm-acc-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên chỗ ở, địa điểm, chủ nhà..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="adm-acc-search-input"
            />
          </div>

          <select
            className="admin-select-filter"
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả Địa điểm ({distinctCities.length})</option>
            {distinctCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="admin-select-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="published">Đang hiển thị</option>
            <option value="paused">Tạm ẩn</option>
            <option value="suspended">Đã đình chỉ</option>
            <option value="maintenance">Bảo trì</option>
          </select>
        </div>
      </div>

      {/* Table with Anti-Wrap Rules */}
      <AdminTableWrapper
        page={page}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        label="chỗ ở"
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>Chỗ Ở & Hạng Phòng</th>
              <th>Chủ Nhà</th>
              <th>Địa Điểm</th>
              <th>Giá / Đêm</th>
              <th>Đánh Giá</th>
              <th>Trạng Thái</th>
              <th>Huy Hiệu</th>
              <th style={{ textAlign: "right" }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="8" className="adm-acc-empty-state">
                  Không tìm thấy cơ sở lưu trú nào phù hợp.
                </td>
              </tr>
            ) : (
              paginated.map((acc) => {
                const isSuspended = acc.status === "suspended";
                const hostName = getHostName(acc);

                return (
                  <tr
                    key={acc.id}
                    className={isSuspended ? "adm-acc-row-suspended" : ""}
                  >
                    {/* Name & Image */}
                    <td>
                      <div className="adm-acc-info-cell">
                        <img
                          src={
                            acc.thumbnail ||
                            acc.image ||
                            acc.images?.[0] ||
                            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80"
                          }
                          alt={acc.name_vi}
                          className={`adm-acc-thumbnail ${isSuspended ? "suspended" : ""}`}
                        />
                        <div className="adm-acc-meta">
                          <div
                            className={`adm-acc-name ${isSuspended ? "suspended" : ""}`}
                            title={acc.name_vi}
                            onClick={() => onOpenDetailModal && onOpenDetailModal(acc)}
                          >
                            {acc.name_vi}
                          </div>
                          <div className="adm-acc-category-sub">
                            {acc.type?.toUpperCase()} • {acc.category_name || acc.category || "Tiêu chuẩn"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Host */}
                    <td className="td-nowrap">
                      <div className="adm-acc-host-name">
                        {hostName}
                      </div>
                    </td>

                    {/* City */}
                    <td className="td-nowrap">
                      <div className="adm-acc-city-cell">
                        <TbMapPin className="adm-acc-city-icon" />
                        <span>{acc.city}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="td-nowrap">
                      <strong className="adm-acc-price">
                        {formatVND(acc.priceVND || acc.price_from || acc.price_per_night || acc.price)}
                      </strong>
                    </td>

                    {/* Rating */}
                    <td className="td-nowrap">
                      <div className="adm-acc-rating-cell">
                        <TbStar className="adm-acc-star-icon" />
                        <span>{acc.rating || 4.95}</span>
                        <span className="adm-acc-review-count">
                          ({acc.reviewsCount || acc.reviews_count || 0})
                        </span>
                      </div>
                    </td>

                    {/* Status select */}
                    <td className="td-nowrap">
                      <select
                        value={acc.status}
                        onChange={(e) => onUpdateStatus(acc.id, e.target.value)}
                        className={`adm-acc-status-select ${acc.status}`}
                      >
                        <option value="published">Hiển thị</option>
                        <option value="paused">Tạm ẩn</option>
                        <option value="suspended">Đình chỉ</option>
                        <option value="maintenance">Bảo trì</option>
                      </select>
                    </td>

                    {/* Flags (Star / Fire) */}
                    <td className="td-nowrap">
                      <div className="adm-acc-flags-wrap">
                        <button
                          type="button"
                          className="btn-action-icon"
                          style={{
                            width: "28px",
                            height: "28px",
                            color: acc.is_featured ? "#f59e0b" : "#cbd5e1",
                            background: acc.is_featured ? "#fffbeb" : "white",
                          }}
                          title="Nổi bật ⭐"
                          onClick={() => onToggleFlag(acc.id, "is_featured")}
                        >
                          <TbStar />
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon"
                          style={{
                            width: "28px",
                            height: "28px",
                            color: acc.is_guest_favorite ? "#ff385c" : "#cbd5e1",
                            background: acc.is_guest_favorite
                              ? "#fff1f2"
                              : "white",
                          }}
                          title="Yêu thích 🔥"
                          onClick={() =>
                            onToggleFlag(acc.id, "is_guest_favorite")
                          }
                        >
                          <TbFlame />
                        </button>
                      </div>
                    </td>

                    {/* Actions: Exactly 2 icons (Xem chi tiết + Đình chỉ / Khôi phục) */}
                    <td style={{ textAlign: "right" }}>
                      <div className="td-actions-group">
                        {/* 1. Icon Xem chi tiết */}
                        <button
                          type="button"
                          className="btn-action-icon"
                          title="Xem chi tiết cơ sở lưu trú"
                          onClick={() => onOpenDetailModal && onOpenDetailModal(acc)}
                        >
                          <TbEye />
                        </button>

                        {/* 2. Icon Đình chỉ / Khôi phục */}
                        {isSuspended ? (
                          <button
                            type="button"
                            className="btn-action-icon success"
                            title="Khôi phục hoạt động cơ sở lưu trú"
                            onClick={() =>
                              setSuspendTarget({ acc, action: "restore" })
                            }
                          >
                            <TbLockOpen style={{ color: "#059669" }} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-action-icon danger"
                            title="Đình chỉ cơ sở lưu trú"
                            onClick={() =>
                              setSuspendTarget({ acc, action: "suspend" })
                            }
                          >
                            <TbBan style={{ color: "#dc2626" }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </AdminTableWrapper>

      {/* Confirm Suspend / Restore Dialog */}
      <AdminConfirmDialog
        isOpen={!!suspendTarget}
        title={
          suspendTarget?.action === "suspend"
            ? "Đình Chỉ Hoạt Động Cơ Sở Lưu Trú"
            : "Khôi Phục Hoạt Động Cơ Sở Lưu Trú"
        }
        message={
          suspendTarget?.action === "suspend"
            ? `Bạn có chắc chắn muốn đình chỉ hoạt động cơ sở "${suspendTarget?.acc?.name_vi}"? Cơ sở này sẽ tạm dừng mở bán và không thể nhận đặt phòng trên toàn hệ thống TripNest.`
            : `Bạn có chắc chắn muốn khôi phục mở bán cho cơ sở "${suspendTarget?.acc?.name_vi}"?`
        }
        confirmText={
          suspendTarget?.action === "suspend"
            ? "Xác Nhận Đình Chỉ"
            : "Khôi Phục Hoạt Động"
        }
        cancelText="Hủy Bỏ"
        type={suspendTarget?.action === "suspend" ? "danger" : "primary"}
        onConfirm={() => {
          if (suspendTarget) {
            const newStatus =
              suspendTarget.action === "suspend" ? "suspended" : "published";
            onUpdateStatus(suspendTarget.acc.id, newStatus);
            setSuspendTarget(null);
          }
        }}
        onCancel={() => setSuspendTarget(null)}
      />
    </div>
  );
};

export default AccommodationsPage;
