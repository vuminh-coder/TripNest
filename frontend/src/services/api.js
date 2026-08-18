import { roomsData, experiencesData } from '../data/roomsData';
import { categories } from '../data/categoriesData';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const apiService = {
  // Lấy danh mục
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error('Network response not ok');
      return await res.json();
    } catch (e) {
      return categories;
    }
  },

  // Lấy danh sách phòng với bộ lọc
  async getRooms(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/rooms?${query}`);
      if (!res.ok) throw new Error('Network response not ok');
      return await res.json();
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

  // Lấy danh sách trải nghiệm
  async getExperiences() {
    try {
      const res = await fetch(`${API_BASE_URL}/experiences`);
      if (!res.ok) throw new Error('Network response not ok');
      return await res.json();
    } catch (e) {
      return experiencesData;
    }
  },

  // Tạo đơn đặt phòng mới
  async createBooking(bookingPayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });
      if (!res.ok) throw new Error('Network error');
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
      return { success: true, booking: newBooking };
    }
  },

  // Lấy danh sách phòng đã đặt của user
  async getMyBookings() {
    try {
      const res = await fetch(`${API_BASE_URL}/my-bookings`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      return JSON.parse(localStorage.getItem('tripnest_bookings') || '[]');
    }
  },
};
