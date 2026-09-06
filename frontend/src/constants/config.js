/**
 * Cấu hình hằng số toàn hệ thống
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://tripnest-api.vercel.app/api'
    : 'http://127.0.0.1:8000/api');
export const DEFAULT_CURRENCY = 'VND';
export const SUPPORTED_CURRENCIES = ['VND', 'USD', 'EUR'];
