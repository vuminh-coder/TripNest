import React from 'react';
import './management.css';
import {
  TbCircleCheck,
  TbClock,
  TbAlertCircle,
  TbSparkles,
  TbShieldCheck,
  TbEyeOff
} from 'react-icons/tb';

export const ManagementStatusBadge = ({ status, label = null }) => {
  const normalized = String(status || '').toLowerCase();

  let className = 'mgmt-badge';
  let icon = null;
  let text = label;

  switch (normalized) {
    case 'published':
    case 'active':
    case 'available':
      className += ' published';
      icon = <TbCircleCheck />;
      text = text || 'Đang hoạt động';
      break;

    case 'paused':
    case 'pending':
    case 'inactive':
      className += ' paused';
      icon = <TbClock />;
      text = text || 'Tạm dừng';
      break;

    case 'draft':
    case 'hidden':
      className += ' draft';
      icon = <TbEyeOff />;
      text = text || 'Bản nháp';
      break;

    case 'superhost':
      className += ' superhost';
      icon = <TbSparkles />;
      text = text || 'Superhost';
      break;

    case 'verified':
      className += ' published';
      icon = <TbShieldCheck />;
      text = text || 'Đã KYC';
      break;

    default:
      className += ' draft';
      text = text || status;
      break;
  }

  return (
    <span className={className}>
      {icon}
      <span>{text}</span>
    </span>
  );
};

export default ManagementStatusBadge;
