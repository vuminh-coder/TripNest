import React, { useState, useMemo } from 'react';
import {
  TbChevronLeft,
  TbChevronRight,
  TbX,
  TbCalendar,
  TbSparkles,
} from 'react-icons/tb';
import './LuxuryDateRangePicker.css';

/**
 * Component LuxuryDateRangePicker
 * Bộ chọn dải ngày sang trọng chuẩn UI/UX ProMax dành cho TripNest
 * Hỗ trợ 2 tháng đồng thời, tiếng Việt 100%, chọn ngày nhận/trả phòng mượt mà
 */
export const LuxuryDateRangePicker = ({
  checkInDate = '',
  checkOutDate = '',
  onChange = () => {},
  onClose = () => {},
  minDate = new Date().toISOString().split('T')[0],
}) => {
  // Tháng hiển thị hiện tại (mặc định lấy từ checkInDate hoặc hôm nay)
  const initialDate = useMemo(() => {
    if (checkInDate) {
      const d = new Date(checkInDate);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [checkInDate]);

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0 - 11
  const [hoveredDate, setHoveredDate] = useState(null);

  // Chuyển sang tháng trước
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  // Chuyển sang tháng kế tiếp
  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Tính toán thông tin của tháng thứ 2
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;

  // Helper render ngày cho 1 tháng cụ thể
  const renderMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Thứ 2 = 0, ..., Chủ Nhật = 6
    let startingDayIndex = firstDay.getDay() - 1;
    if (startingDayIndex === -1) startingDayIndex = 6;

    const days = [];

    // Ô trống đầu tháng
    for (let i = 0; i < startingDayIndex; i++) {
      days.push(
        <div key={`empty-${i}`} className="date-picker-day empty" />
      );
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      const isPast = minDate && dateStr < minDate;
      const isCheckIn = checkInDate === dateStr;
      const isCheckOut = checkOutDate === dateStr;
      const isToday = dateStr === todayStr;

      // Kiểm tra có nằm trong dải ngày đã chọn không
      let isInRange = false;
      if (checkInDate && checkOutDate) {
        isInRange = dateStr > checkInDate && dateStr < checkOutDate;
      } else if (checkInDate && !checkOutDate && hoveredDate) {
        isInRange = dateStr > checkInDate && dateStr <= hoveredDate;
      }

      let dayClass = 'date-picker-day';
      if (isPast) dayClass += ' is-disabled';
      if (isCheckIn) dayClass += ' is-checkin';
      if (isCheckOut) dayClass += ' is-checkout';
      if (isInRange) dayClass += ' in-range';
      if (isToday) dayClass += ' is-today';

      days.push(
        <button
          key={dateStr}
          type="button"
          disabled={isPast}
          className={dayClass}
          onClick={(e) => {
            e.stopPropagation();
            handleDateClick(dateStr);
          }}
          onMouseEnter={() => {
            if (checkInDate && !checkOutDate) {
              setHoveredDate(dateStr);
            }
          }}
        >
          <span className="day-number">{d}</span>
        </button>
      );
    }

    return days;
  };

  // Xử lý khi click vào 1 ngày
  const handleDateClick = (dateStr) => {
    if (!checkInDate || (checkInDate && checkOutDate)) {
      // Bắt đầu chọn ngày nhận phòng mới
      onChange(dateStr, '');
      setHoveredDate(null);
    } else if (checkInDate && !checkOutDate) {
      if (dateStr < checkInDate) {
        // Nếu chọn ngày trước ngày nhận phòng, đổi ngày nhận phòng thành ngày mới
        onChange(dateStr, '');
      } else if (dateStr === checkInDate) {
        // Click lại chính ngày đó -> không làm gì hoặc chọn làm 1 đêm nếu muốn
        return;
      } else {
        // Chọn xong ngày trả phòng -> hoàn tất
        onChange(checkInDate, dateStr);
        setHoveredDate(null);
      }
    }
  };

  // Tính số đêm nghỉ
  const nightsCount = useMemo(() => {
    if (checkInDate && checkOutDate) {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    }
    return 0;
  }, [checkInDate, checkOutDate]);

  const monthNamesVi = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const weekDayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="luxury-date-picker-popover" onClick={(e) => e.stopPropagation()}>
      <div className="picker-header-status">
        <div className="picker-title-group">
          <span className="picker-badge">
            <TbCalendar /> Lịch chọn ngày
          </span>
          <h4 className="picker-heading">
            {!checkInDate && !checkOutDate && 'Chọn ngày nhận phòng'}
            {checkInDate && !checkOutDate && 'Chọn ngày trả phòng'}
            {checkInDate && checkOutDate && (
              <>
                <TbSparkles style={{ color: '#ff385c' }} /> {nightsCount} đêm nghỉ tại chỗ ở
              </>
            )}
          </h4>
        </div>

        <button
          type="button"
          className="picker-close-btn"
          onClick={onClose}
          title="Đóng lịch"
        >
          <TbX />
        </button>
      </div>

      <div className="picker-calendars-wrapper">
        {/* Month 1 */}
        <div className="calendar-month-block">
          <div className="calendar-month-header">
            <button
              type="button"
              className="calendar-nav-btn prev"
              onClick={handlePrevMonth}
              title="Tháng trước"
            >
              <TbChevronLeft />
            </button>
            <span className="calendar-month-title">
              {monthNamesVi[currentMonth]}, {currentYear}
            </span>
            <div className="calendar-nav-placeholder desktop-only" />
          </div>

          <div className="calendar-weekdays-row">
            {weekDayLabels.map((w) => (
              <span key={w} className="weekday-header-cell">
                {w}
              </span>
            ))}
          </div>

          <div className="calendar-days-grid">
            {renderMonthDays(currentYear, currentMonth)}
          </div>
        </div>

        {/* Month 2 (Dual-Month View) */}
        <div className="calendar-month-block month-2 desktop-only">
          <div className="calendar-month-header">
            <div className="calendar-nav-placeholder" />
            <span className="calendar-month-title">
              {monthNamesVi[nextMonth]}, {nextMonthYear}
            </span>
            <button
              type="button"
              className="calendar-nav-btn next"
              onClick={handleNextMonth}
              title="Tháng sau"
            >
              <TbChevronRight />
            </button>
          </div>

          <div className="calendar-weekdays-row">
            {weekDayLabels.map((w) => (
              <span key={w} className="weekday-header-cell">
                {w}
              </span>
            ))}
          </div>

          <div className="calendar-days-grid">
            {renderMonthDays(nextMonthYear, nextMonth)}
          </div>
        </div>
      </div>

      <div className="picker-footer-bar">
        <button
          type="button"
          className="picker-clear-btn"
          onClick={() => {
            onChange('', '');
            setHoveredDate(null);
          }}
        >
          Xóa ngày
        </button>

        <button
          type="button"
          className="picker-apply-btn"
          onClick={onClose}
        >
          {checkInDate && checkOutDate ? 'Áp dụng ngày' : 'Đóng'}
        </button>
      </div>
    </div>
  );
};

export default LuxuryDateRangePicker;
