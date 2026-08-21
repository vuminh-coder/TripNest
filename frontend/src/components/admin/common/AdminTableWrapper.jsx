import React from 'react';
import Pagination from '../Pagination';

export const AdminTableWrapper = ({
  children,
  page,
  pageSize,
  totalItems,
  onPageChange,
  label = 'mục',
}) => {
  const totalPages = Math.ceil((totalItems || 0) / (pageSize || 10));

  return (
    <div className="admin-card-box" style={{ marginBottom: '1.5rem' }}>
      <div className="admin-table-container">
        {children}
      </div>

      {totalItems > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalItems}
          pageSize={pageSize}
          label={label}
        />
      )}
    </div>
  );
};

export default AdminTableWrapper;
