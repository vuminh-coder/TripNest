import { roomsData, experiencesData } from '../data/roomsData';
import { categories } from '../data/categoriesData';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('tripnest_user') || 'null');
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (user?.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  return headers;
};

export const apiService = {
  // 1. Đăng nhập bằng Google Email
  async googleLogin(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('API Auth Failed');
      const data = await res.json();
      return data;
    } catch (e) {
      // Fallback
      return {
        success: true,
        token: 'google-token-' + Date.now(),
        user: {
          name: payload.name || payload.email.split('@')[0],
          email: payload.email,
          avatar: payload.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          role: 'guest',
        },
      };
    }
  },

  // 2. Lấy danh mục
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error('Network response not ok');
      return await res.json();
    } catch (e) {
      return categories;
    }
  },

  // 3. Lấy danh sách phòng với bộ lọc đa tiêu chí
  async getRooms(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/rooms?${query}`);
      if (!res.ok) throw new Error('Network response not ok');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
      return roomsData;
    } catch (e) {
      let filtered = [...roomsData];
      if (params.category && params.category !== 'all') {
        filtered = filtered.filter((r) => r.category === params.category);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(s) ||
            r.city.toLowerCase().includes(s) ||
            r.location.toLowerCase().includes(s)
        );
      }
      if (params.minPrice) {
        filtered = filtered.filter((r) => r.priceUSD >= Number(params.minPrice));
      }
      if (params.maxPrice) {
        filtered = filtered.filter((r) => r.priceUSD <= Number(params.maxPrice));
      }
      if (params.guests) {
        filtered = filtered.filter((r) => r.specs.guests >= Number(params.guests));
      }
      return filtered;
    }
  },

  // 4. Lấy chi tiết phòng
  async getRoomDetail(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${id}`);
      if (!res.ok) throw new Error('Room detail error');
      return await res.json();
    } catch (e) {
      return roomsData.find((r) => r.id === Number(id)) || null;
    }
  },

  // 5. Lấy danh sách trải nghiệm
  async getExperiences() {
    try {
      const res = await fetch(`${API_BASE_URL}/experiences`);
      if (!res.ok) throw new Error('Network response not ok');
      return await res.json();
    } catch (e) {
      return experiencesData;
    }
  },

  // 6. Tạo đơn đặt phòng mới
  async createBooking(bookingPayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingPayload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Lỗi đặt phòng');
      }
      return await res.json();
    } catch (e) {
      // Local fallback
      const savedBookings = JSON.parse(localStorage.getItem('tripnest_bookings') || '[]');
      const newBooking = {
        id: 'TN-' + Math.floor(100000 + Math.random() * 900000),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        ...bookingPayload,
      };
      savedBookings.unshift(newBooking);
      localStorage.setItem('tripnest_bookings', JSON.stringify(savedBookings));
      return { success: true, booking: newBooking, message: e.message || 'Đặt phòng thành công!' };
    }
  },

  // 7. Lấy danh sách phòng đã đặt của user
  async getMyBookings() {
    try {
      const res = await fetch(`${API_BASE_URL}/my-bookings`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      return JSON.parse(localStorage.getItem('tripnest_bookings') || '[]');
    }
  },

  // 8. Hủy đơn đặt phòng
  async cancelBooking(bookingId) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  },

  // 9. Lấy danh sách Wishlist
  async getWishlist() {
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      return JSON.parse(localStorage.getItem('tripnest_wishlist') || '[]');
    }
  },

  // 10. Bật/tắt yêu thích
  async toggleWishlist(roomId) {
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ roomId }),
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  },

  // 11. Đăng ký trở thành Chủ nhà (Host)
  async registerHost(hostData) {
    try {
      const res = await fetch(`${API_BASE_URL}/host/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(hostData),
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'Đăng ký chủ nhà thành công!' };
    }
  },
};
