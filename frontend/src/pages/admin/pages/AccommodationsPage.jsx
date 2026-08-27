import React, { useState } from "react";
import {
  TbEye,
  TbBan,
  TbCircleCheck,
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
    <div>
      {/* Header - Admin manages & regulates accommodations without creating new ones */}
      <AdminPageHeader
        title="Cơ Sở Lưu Trú & Hạng Phòng"
        subtitle={`Quản lý và kiểm duyệt ${accommodations.length} cơ sở trên toàn hệ thống · Điều phối trạng thái kinh doanh`}
      />

      {/* Filter Bar */}
      <div
        className="admin-card-box"
        style={{ padding: "0.85rem 1.25rem", marginBottom: "1.25rem" }}
      >
        <div
          className="admin-filter-bar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#f8fafc",
              border: "1px solid #edf2f7",
              borderRadius: "8px",
              padding: "0.42rem 0.85rem",
              flex: 1,
              minWidth: "220px",
            }}
          >
            <TbSearch style={{ color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Tìm theo tên chỗ ở, địa điểm, chủ nhà..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                border: "none",
                background: "transparent",
                width: "100%",
                fontSize: "0.84rem",
                outline: "none",
              }}
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
            <option value="all">Tất cả Địa điểm</option>
            <option value="Đà Lạt">Đà Lạt</option>
            <option value="Phú Quốc">Phú Quốc</option>
            <option value="Hạ Long">Hạ Long</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Sapa">Sapa</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Nha Trang">Nha Trang</option>
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
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "3.5rem 1rem",
                    color: "#94a3b8",
                  }}
                >
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
                    style={{
                      background: isSuspended ? "#fffafa" : "transparent",
                    }}
                  >
                    {/* Name & Image */}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img
                          src={
                            acc.image ||
                            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80"
                          }
                          alt={acc.name_vi}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            flexShrink: 0,
                            border: isSuspended
                              ? "1.5px solid #fca5a5"
                              : "1px solid #e2e8f0",
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: "0.88rem",
                              color: isSuspended ? "#991b1b" : "#0f172a",
                              maxWidth: "240px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "pointer",
                            }}
                            title={acc.name_vi}
                            onClick={() => onOpenDetailModal && onOpenDetailModal(acc)}
                          >
                            {acc.name_vi}
                          </div>
                          <div
                            style={{
                              fontSize: "0.74rem",
                              color: "#64748b",
                              marginTop: "1px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {acc.type?.toUpperCase()} • {acc.category_name || acc.category || "Tiêu chuẩn"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Host */}
                    <td className="td-nowrap">
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#0f172a",
                          fontSize: "0.86rem",
                        }}
                      >
                        {hostName}
                      </div>
                    </td>

                    {/* City */}
                    <td className="td-nowrap">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          fontWeight: 600,
                          fontSize: "0.84rem",
                        }}
                      >
                        <TbMapPin style={{ color: "#ff385c" }} />
                        <span>{acc.city}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="td-nowrap">
                      <strong style={{ color: "#0f172a" }}>
                        {formatVND(acc.priceVND || acc.price_per_night)}
                      </strong>
                    </td>

                    {/* Rating */}
                    <td className="td-nowrap">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          fontWeight: 700,
                          fontSize: "0.84rem",
                        }}
                      >
                        <TbStar style={{ color: "#f59e0b" }} />
                        <span>{acc.rating || 4.95}</span>
                        <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                          ({acc.reviewsCount || 0})
                        </span>
                      </div>
                    </td>

                    {/* Status select */}
                    <td className="td-nowrap">
                      <select
                        value={acc.status}
                        onChange={(e) => onUpdateStatus(acc.id, e.target.value)}
                        style={{
                          padding: "3px 6px",
                          borderRadius: "6px",
                          border: "1px solid #edf2f7",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          background:
                            acc.status === "published"
                              ? "#ecfdf5"
                              : acc.status === "suspended"
                              ? "#fee2e2"
                              : acc.status === "maintenance"
                              ? "#fffbeb"
                              : "#f1f5f9",
                          color:
                            acc.status === "published"
                              ? "#059669"
                              : acc.status === "suspended"
                              ? "#dc2626"
                              : acc.status === "maintenance"
                              ? "#d97706"
                              : "#475569",
                          cursor: "pointer",
                        }}
                      >
                        <option value="published">Hiển thị</option>
                        <option value="paused">Tạm ẩn</option>
                        <option value="suspended">Đình chỉ</option>
                        <option value="maintenance">Bảo trì</option>
                      </select>
                    </td>

                    {/* Flags (Star / Fire) */}
                    <td className="td-nowrap">
                      <div style={{ display: "flex", gap: "4px" }}>
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
