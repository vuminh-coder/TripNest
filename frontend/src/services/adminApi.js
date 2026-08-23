// Admin API & State Service for TripNest Admin Portal
import { initialAdminData } from "./adminMockData";

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('tripnest_user') || 'null');
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (user?.token) headers.Authorization = `Bearer ${user.token}`;
  return headers;
};

const STORAGE_KEY = 'tripnest_admin_data_v1';

const getStoredData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAdminData));
      return initialAdminData;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initialAdminData;
  }
};

const saveStoredData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to persist admin data", e);
  }
};

export const adminService = {
  // Reset demo data
  resetDemoData() {
    saveStoredData(initialAdminData);
    return initialAdminData;
  },

  // 1. Get Dashboard Stats
  async getDashboardStats() {
    const data = getStoredData();
    // Dynamically calculate some stats
    const totalBookings = data.bookings.length;
    const completedBookings = data.bookings.filter(
      (b) => b.status === "completed",
    ).length;
    const totalRev = data.bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + (b.total_price || 0), 0);
    const commission = Math.round(totalRev * 0.11);
    const pendingKyc = data.hosts.filter(
      (h) => h.kyc_status === "pending",
    ).length;

    return {
      ...data.stats,
      totalRevenueVND: totalRev > 0 ? totalRev : data.stats.totalRevenueVND,
      commissionRevenueVND:
        commission > 0 ? commission : data.stats.commissionRevenueVND,
      totalBookings,
      completedBookings,
      pendingKycCount: pendingKyc,
    };
  },

  // Lấy chi tiết 1 user trực tiếp từ Database
  async getUserById(id) {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/user/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch (e) {
      console.warn(`Không lấy được user #${id} từ backend:`, e);
    }
    const data = getStoredData();
    return data.users.find((u) => String(u.id) === String(id)) || null;
  },

  // 2. Accommodations
  async getAccommodations() {
    const data = getStoredData();
    return data.accommodations || [];
  },

  async updateAccommodationStatus(id, newStatus) {
    const data = getStoredData();
    data.accommodations = data.accommodations.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item,
    );
    saveStoredData(data);
    return data.accommodations;
  },

  async toggleAccommodationFlag(id, flagName) {
    const data = getStoredData();
    data.accommodations = data.accommodations.map((item) => {
      if (item.id === id) {
        return { ...item, [flagName]: !item[flagName] };
      }
      return item;
    });
    saveStoredData(data);
    return data.accommodations;
  },

  async saveAccommodation(accData) {
    const data = getStoredData();
    if (accData.id) {
      // Edit
      data.accommodations = data.accommodations.map((item) =>
        item.id === accData.id ? { ...item, ...accData } : item,
      );
    } else {
      // Create
      const newAcc = {
        ...accData,
        id: Date.now(),
        rating: 5.0,
        reviewsCount: 0,
        status: "published",
        created_at: new Date().toISOString().split("T")[0],
      };
      data.accommodations.unshift(newAcc);
    }
    saveStoredData(data);
    return data.accommodations;
  },

  async deleteAccommodation(id) {
    const data = getStoredData();
    data.accommodations = data.accommodations.filter((item) => item.id !== id);
    saveStoredData(data);
    return data.accommodations;
  },

  // 3. Bookings
  async getBookings() {
    const data = getStoredData();
    return data.bookings || [];
  },

  async updateBookingStatus(bookingId, newStatus, reason = "") {
    const data = getStoredData();
    data.bookings = data.bookings.map((item) => {
      if (item.id === bookingId) {
        return {
          ...item,
          status: newStatus,
          cancellation_reason: reason || item.cancellation_reason,
          payment_status:
            newStatus === "cancelled" ? "refunded" : item.payment_status,
        };
      }
      return item;
    });
    saveStoredData(data);
    return data.bookings;
  },

  // 4. KYC & Hosts
  async getHosts() {
    const data = getStoredData();
    return data.hosts || [];
  },

  async updateKycStatus(hostId, status, rejectionReason = "") {
    const data = getStoredData();
    data.hosts = data.hosts.map((h) => {
      if (h.id === hostId) {
        return {
          ...h,
          kyc_status: status,
          kyc_rejection_reason: rejectionReason,
          verified_at: status === "verified" ? new Date().toISOString() : null,
        };
      }
      return h;
    });
    saveStoredData(data);
    return data.hosts;
  },

  async toggleSuperhost(hostId) {
    const data = getStoredData();
    data.hosts = data.hosts.map((h) => {
      if (h.id === hostId) {
        return { ...h, is_superhost: !h.is_superhost };
      }
      return h;
    });
    saveStoredData(data);
    return data.hosts;
  },

  // 5. Users & Accounts
async getUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const data = getStoredData();

        data.users = result.data;

        saveStoredData(data);

        return result.data;
      }
    }
  } catch (e) {
    console.warn(
      'Failed to fetch users from backend, fallback to local store',
      e
    );
  }

  const data = getStoredData();

  return data.users || [];
},

  async saveUser(userData) {
    if (userData.id) {
      // 1. Chỉnh sửa người dùng qua Backend API
      try {
        const res = await fetch(`http://localhost:8000/api/admin/user/${userData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        const json = await res.json();
        if (json.success && json.data) {
          // Cập nhật lại danh sách từ Backend
          return await this.getUsers();
        }
      } catch (e) {
        console.warn('Lỗi gọi API cập nhật user, dùng local fallback:', e);
      }

      // Fallback local storage nếu backend offline
      const data = getStoredData();
      data.users = data.users.map((u) =>
        u.id === userData.id ? { ...u, ...userData } : u,
      );
      saveStoredData(data);
      return data.users;
    } else {
      // 2. Thêm người dùng mới qua Backend API
      try {
        const res = await fetch('http://localhost:8000/api/admin/user/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        const json = await res.json();
        if (json.success) {
          return await this.getUsers();
        }
      } catch (e) {
        console.warn('Lỗi gọi API tạo user, dùng local fallback:', e);
      }

      // Fallback local storage
      const data = getStoredData();
      const newUser = {
        ...userData,
        id: Date.now(),
        avatar:
          userData.avatar ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        joined_date: new Date().toISOString().split("T")[0],
        last_login: "Chưa đăng nhập",
        total_bookings_count: 0,
        status: userData.status || "active",
        role: userData.role || "guest",
        role_upgrade_request: null,
      };
      data.users.unshift(newUser);
      saveStoredData(data);
      return data.users;
    }
  },

  async deleteUser(userId) {
    const targetId = typeof userId === 'object' ? userId.id : userId;
    const email = typeof userId === 'object' ? userId.email : userId;
    const response = await fetch(`${API_BASE_URL}/admin/users/by-email/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Không thể xóa người dùng.');
    }

    const data = getStoredData();
    data.users = data.users.filter((u) => u.id !== targetId && u.email !== email);
    saveStoredData(data);
    return data.users;
  },

  async toggleUserStatus(userId) {
    const data = getStoredData();
    data.users = data.users.map((u) => {
      if (u.id === userId) {
        return { ...u, status: u.status === "active" ? "banned" : "active" };
      }
      return u;
    });
    saveStoredData(data);
    return data.users;
  },

  async updateUserRole(userId, newRole) {
    const data = getStoredData();
    data.users = data.users.map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    saveStoredData(data);
    return data.users;
  },

  async approveRoleUpgrade(userId, approved, rejectionReason = "") {
    const data = getStoredData();
    let targetUser = null;
    data.users = data.users.map((u) => {
      if (u.id === userId) {
        if (approved) {
          const reqRole = u.role_upgrade_request?.requested_role || "host";
          targetUser = {
            ...u,
            role: reqRole,
            role_upgrade_request: {
              ...u.role_upgrade_request,
              status: "approved",
              approved_at: new Date().toISOString(),
            },
          };
          return targetUser;
        } else {
          return {
            ...u,
            role_upgrade_request: {
              ...u.role_upgrade_request,
              status: "rejected",
              rejection_reason: rejectionReason || "Hồ sơ chưa đạt tiêu chuẩn",
              rejected_at: new Date().toISOString(),
            },
          };
        }
      }
      return u;
    });

    // If upgraded to host, ensure a Host profile exists
    if (approved && targetUser && targetUser.role === "host") {
      const hostExists = data.hosts.some(
        (h) => h.id === targetUser.id || h.email === targetUser.email,
      );
      if (!hostExists) {
        data.hosts.unshift({
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          phone: targetUser.phone || "Chưa có SĐT",
          display_name: targetUser.name + " Stay",
          avatar: targetUser.avatar,
          id_card_number:
            targetUser.id_card_number ||
            "00109" + Date.now().toString().slice(-7),
          id_card_front:
            "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
          id_card_back:
            "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
          kyc_status: "verified",
          is_superhost: false,
          rating: 5.0,
          reviews_count: 0,
          bank_name: "Vietcombank",
          account_number: "10" + Date.now().toString().slice(-8),
          account_holder: targetUser.name.toUpperCase(),
          properties_count: 1,
          joined_date: new Date().toISOString().split("T")[0],
        });
      }
    }

    saveStoredData(data);
    return { users: data.users, hosts: data.hosts };
  },

  // 6. Payouts & Financials
  async getPayouts() {
    const data = getStoredData();
    return data.payouts || [];
  },

  async completePayout(payoutId, transactionRef) {
    const data = getStoredData();
    data.payouts = data.payouts.map((p) => {
      if (p.id === payoutId) {
        return {
          ...p,
          status: "completed",
          transaction_ref: transactionRef || "FT" + Date.now(),
          transferred_at: new Date().toISOString(),
        };
      }
      return p;
    });
    saveStoredData(data);
    return data.payouts;
  },

  // 7. Reviews
  async getReviews() {
    const data = getStoredData();
    return data.reviews || [];
  },

  async updateReviewStatus(reviewId, status) {
    const data = getStoredData();
    data.reviews = data.reviews.map((r) => {
      if (r.id === reviewId) {
        return { ...r, status };
      }
      return r;
    });
    saveStoredData(data);
    return data.reviews;
  },

  // 8. Categories & Amenities
  async getCategories() {
    const data = getStoredData();
    return data.categories || [];
  },

  async toggleCategoryActive(slug) {
    const data = getStoredData();
    data.categories = data.categories.map((c) => {
      if (c.slug === slug) {
        return { ...c, is_active: !c.is_active };
      }
      return c;
    });
    saveStoredData(data);
    return data.categories;
  },

  async getAmenities() {
    const data = getStoredData();
    return data.amenities || [];
  },

  async addAmenity(amenity) {
    const data = getStoredData();
    data.amenities.push(amenity);
    saveStoredData(data);
    return data.amenities;
  },

  // 9. Experiences
  async getExperiences() {
    const data = getStoredData();
    return data.experiences || [];
  },

  async toggleExperienceActive(id) {
    const data = getStoredData();
    data.experiences = data.experiences.map((exp) => {
      if (exp.id === id) {
        return { ...exp, is_active: !exp.is_active };
      }
      return exp;
    });
    saveStoredData(data);
    return data.experiences;
  },
};
