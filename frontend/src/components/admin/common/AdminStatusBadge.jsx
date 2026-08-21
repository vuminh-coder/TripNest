import React from 'react';

export const AdminStatusBadge = ({ status, label }) => {
  const normalized = (status || '').toLowerCase();
  
  const getDisplayLabel = () => {
    if (label) return label;
    switch (normalized) {
      case 'published': return 'ĐANG HIỂN THỊ';
      case 'paused': return 'TẠM ẨN';
      case 'maintenance': return 'BẢO TRÌ';
      case 'confirmed': return 'ĐÃ XÁC NHẬN';
      case 'pending': return 'CHỜ XỬ LÝ';
      case 'completed': return 'HOÀN THÀNH';
      case 'cancelled': return 'ĐÃ HỦY';
      case 'verified': return 'ĐÃ XÁC MINH';
      case 'rejected': return 'BỊ TỪ CHỐI';
      case 'active': return 'HOẠT ĐỘNG';
      case 'banned': return 'BỊ KHÓA';
      case 'paid': return 'ĐÃ THANH TOÁN';
      case 'approved': return 'HIỂN THỊ';
      case 'flagged': return 'CẦN DUYỆT';
      case 'hidden': return 'ĐÃ ẨN';
      default: return (status || '').toUpperCase();
    }
  };

  return (
    <span className={`status-pill ${normalized}`}>
      {getDisplayLabel()}
    </span>
  );
};

export default AdminStatusBadge;
