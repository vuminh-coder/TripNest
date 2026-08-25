/**
 * Format tiền tệ linh hoạt theo VND, USD hoặc EUR
 */
export const formatPrice = (amount, currency = 'VND') => {
  const val = Number(amount) || 0;
  if (currency === 'USD') {
    return `$${val.toLocaleString('en-US')}`;
  }
  if (currency === 'EUR') {
    return `€${Math.round(val * 0.92).toLocaleString('de-DE')}`;
  }
  return `${val.toLocaleString('vi-VN')} ₫`;
};

/**
 * Format ngày theo định dạng chuẩn Việt Nam dd/mm/yyyy
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  return date.toLocaleDateString('vi-VN');
};
