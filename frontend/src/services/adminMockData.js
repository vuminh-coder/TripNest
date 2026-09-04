// TripNest Pure Database Store Schema
// Reset to clean empty initial state - All data is loaded directly from MySQL Database

export const initialAdminData = {
  // 1. Thống kê tổng quan KPIs
  stats: {
    totalRevenueVND: 0,
    totalRevenueUSD: 0,
    commissionRevenueVND: 0,
    totalBookings: 0,
    completedBookings: 0,
    activeRooms: 0,
    totalHosts: 0,
    pendingKycCount: 0,
    totalGuests: 0,
    occupancyRate: 0,
    growthRatePercent: 0,
  },

  // 2. Danh sách Chỗ ở & Phòng (Accommodations)
  accommodations: [],

  // 3. Đơn đặt phòng (Bookings)
  bookings: [],

  // 4. Đối tác Chủ nhà & KYC (Hosts)
  hosts: [],

  // 5. Người dùng (Users)
  users: [],

  // 6. Quyết toán & Giải ngân (Payouts)
  payouts: [],

  // 7. Đánh giá Radar (Reviews)
  reviews: [],

  // 8. Danh mục lưu trú (Categories)
  categories: [],

  // 9. Tiện nghi (Amenities)
  amenities: [],

  // 10. Tour Trải nghiệm (Experiences)
  experiences: [],

  // 11. Mã giảm giá (Vouchers)
  vouchers: [],
};
