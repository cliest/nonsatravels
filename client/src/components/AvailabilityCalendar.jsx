import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faSpinner } from '@fortawesome/free-solid-svg-icons';

const AvailabilityCalendar = ({ hotelId, onDateSelect, selectedCheckIn, selectedCheckOut }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkInDate, setCheckInDate] = useState(selectedCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(selectedCheckOut);

  useEffect(() => {
    if (hotelId) {
      fetchAvailability();
    }
  }, [hotelId, currentMonth]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const response = await fetch(
        `/api/availability/calendar/${hotelId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();

      if (data.success) {
        const availMap = {};
        data.data.forEach(day => {
          availMap[day.date] = day;
        });
        setAvailabilityData(availMap);
      }
    } catch (error) {
      // Silent fail - availability data is optional
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleDateClick = (date) => {
    if (!date || isPastDate(date)) return;

    const dateStr = date.toISOString().split('T')[0];
    const dayData = availabilityData[dateStr];

    // Allow clicking on dates even if availability data hasn't loaded yet
    // or if the date is available
    if (dayData && !dayData.isAvailable) return; // Only block if explicitly unavailable

    if (!checkInDate || (checkInDate && checkOutDate)) {
      // Start new selection
      setCheckInDate(date);
      setCheckOutDate(null);
      if (onDateSelect) onDateSelect({ checkIn: date, checkOut: null });
    } else if (checkInDate && !checkOutDate) {
      // Select check-out date
      if (date > checkInDate) {
        setCheckOutDate(date);
        if (onDateSelect) onDateSelect({ checkIn: checkInDate, checkOut: date });
      } else {
        // If selected date is before check-in, reset
        setCheckInDate(date);
        setCheckOutDate(null);
        if (onDateSelect) onDateSelect({ checkIn: date, checkOut: null });
      }
    }
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isInRange = (date) => {
    if (!checkInDate || !checkOutDate) return false;
    return date >= checkInDate && date <= checkOutDate;
  };

  const isCheckIn = (date) => {
    if (!checkInDate) return false;
    return date.toDateString() === checkInDate.toDateString();
  };

  const isCheckOut = (date) => {
    if (!checkOutDate) return false;
    return date.toDateString() === checkOutDate.toDateString();
  };

  const getDayClassName = (date) => {
    if (!date) return '';

    const dateStr = date.toISOString().split('T')[0];
    const dayData = availabilityData[dateStr];
    const isPast = isPastDate(date);
    const inRange = isInRange(date);

    let classes = 'calendar-day';

    if (isPast) {
      classes += ' past';
    } else if (isCheckIn(date)) {
      classes += ' check-in';
    } else if (isCheckOut(date)) {
      classes += ' check-out';
    } else if (inRange) {
      classes += ' in-range';
    } else if (dayData && !dayData.isAvailable) {
      classes += ' unavailable';
    } else {
      classes += ' available';
    }

    return classes;
  };

  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="availability-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)} className="nav-button">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h3 className="calendar-title">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={() => changeMonth(1)} className="nav-button">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="calendar-loading">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading...
        </div>
      )}

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="week-day-header">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="calendar-day empty" />;
          }

          const dateStr = date.toISOString().split('T')[0];
          const dayData = availabilityData[dateStr];

          return (
            <div
              key={dateStr}
              className={getDayClassName(date)}
              onClick={() => handleDateClick(date)}
              title={dayData ? `${dayData.availableRooms} rooms available` : 'No data'}
            >
              <span className="day-number">{date.getDate()}</span>
              {dayData && dayData.isAvailable && !isPastDate(date) && (
                <span className="room-count">{dayData.availableRooms}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-color unavailable"></span>
          <span>Unavailable</span>
        </div>
        <div className="legend-item">
          <span className="legend-color selected"></span>
          <span>Selected</span>
        </div>
      </div>

      <style>{`
        .availability-calendar {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .calendar-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .nav-button {
          background: #2b3990;
          border: none;
          padding: 6px 10px;
          cursor: pointer;
          color: white;
          font-size: 14px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .nav-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .calendar-loading {
          text-align: center;
          padding: 24px;
          color: #6b7280;
          font-size: 14px;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 12px;
        }

        .week-day-header {
          text-align: center;
          padding: 8px 2px;
          font-weight: 600;
          font-size: 11px;
          color: #667eea;
          text-transform: uppercase;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          min-height: 38px;
          border: 1.5px solid transparent;
        }

        .calendar-day.empty {
          cursor: default;
          background: transparent;
          border: none;
        }

        .calendar-day.past {
          color: #d1d5db;
          cursor: not-allowed;
          background: #fafafa;
          opacity: 0.5;
        }

        .calendar-day.unavailable {
          color: #dc2626;
          background: #fee2e2;
          cursor: not-allowed;
          font-weight: 500;
        }

        .calendar-day.available {
          background: #f0fdf4;
          color: #059669;
          font-weight: 500;
          border: 1.5px solid #d1fae5;
        }

        .calendar-day.available:hover {
          background: #dcfce7;
          transform: scale(1.05);
          border-color: #34d399;
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.15);
        }

        .calendar-day.check-in,
        .calendar-day.check-out {
          background: #2b3990;
          color: white;
          font-weight: 600;
          border: 1.5px solid #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .calendar-day.in-range {
          background: #e0e7ff;
          color: #4338ca;
          font-weight: 500;
          border: 1.5px solid #c7d2fe;
        }

        .day-number {
          font-size: 13px;
          font-weight: 600;
          line-height: 1;
        }

        .room-count {
          font-size: 9px;
          margin-top: 2px;
          opacity: 0.85;
          font-weight: 500;
          background: rgba(0, 0, 0, 0.06);
          padding: 1px 4px;
          border-radius: 6px;
        }

        .calendar-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #4b5563;
          font-weight: 500;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid;
        }

        .legend-color.available {
          background: #f0fdf4;
          border-color: #34d399;
        }

        .legend-color.unavailable {
          background: #fee2e2;
          border-color: #dc2626;
        }

        .legend-color.selected {
          background: #2b3990;
          border-color: #667eea;
        }

        @media (max-width: 640px) {
          .calendar-day {
            min-height: 34px;
          }

          .day-number {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

AvailabilityCalendar.propTypes = {
  hotelId: PropTypes.string.isRequired,
  onDateSelect: PropTypes.func.isRequired,
  selectedCheckIn: PropTypes.instanceOf(Date),
  selectedCheckOut: PropTypes.instanceOf(Date),
};

export default AvailabilityCalendar;
