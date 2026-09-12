import React from 'react';
import './management.css';
import { TbInbox } from 'react-icons/tb';

export const ManagementEmptyState = ({
  icon: Icon = TbInbox,
  title = 'Không tìm thấy dữ liệu phù hợp',
  description = 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc đang chọn.',
  actionLabel = null,
  onAction = null,
  children
}) => {
  return (
    <div className="mgmt-empty-state">
      <div className="mgmt-empty-icon-wrap">
        <Icon />
      </div>
      <h4 className="mgmt-empty-title">{title}</h4>
      {description && <p className="mgmt-empty-desc">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          className="mgmt-btn-action mgmt-btn-primary"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  );
};

export default ManagementEmptyState;
