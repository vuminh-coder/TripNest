import React from 'react';
import './management.css';

export const ManagementTableWrapper = ({ children, className = '' }) => {
  return (
    <div className={`mgmt-table-card ${className}`}>
      <div className="mgmt-table-responsive">
        {children}
      </div>
    </div>
  );
};

export default ManagementTableWrapper;
