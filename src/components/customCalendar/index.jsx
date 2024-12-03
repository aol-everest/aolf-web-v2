import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  format,
  startOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  setMonth,
  setYear,
  getMonth,
  getYear,
  isWithinInterval,
} from 'date-fns';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import { enUS } from 'date-fns/locale';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'; // Import React Icons

const CustomCalendar = ({
  highlightDates = [],
  onMonthChange,
  onRangeSelect,
  onDayCreate,
  weeksToShow = 4,
  locale = enUS,
}) => {
  const initialWeekStart = useMemo(
    () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    [],
  );

  const [currentWeekStart, setCurrentWeekStart] = useState(initialWeekStart);
  const [currentMonth, setCurrentMonth] = useState(getMonth(initialWeekStart));
  const [currentYear, setCurrentYear] = useState(getYear(initialWeekStart));
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null); // Track selected day for animation

  const generateWeekDays = useCallback((startDate) => {
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  }, []);

  const weeks = useMemo(() => {
    return Array.from({ length: weeksToShow }, (_, i) => {
      const weekStart = addWeeks(currentWeekStart, i);
      return generateWeekDays(weekStart);
    });
  }, [currentWeekStart, weeksToShow, generateWeekDays]);

  const debouncedOnMonthChange = useCallback(
    debounce((newMonth) => {
      if (onMonthChange) onMonthChange(newMonth);
    }, 300),
    [onMonthChange],
  );

  const handleMonthChange = (event) => {
    const newMonth = parseInt(event.target.value, 10);
    const updatedWeekStart = setMonth(currentWeekStart, newMonth);
    setCurrentWeekStart(updatedWeekStart);
    setCurrentMonth(newMonth);
    debouncedOnMonthChange(newMonth);
  };

  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value, 10);
    const updatedWeekStart = setYear(currentWeekStart, newYear);
    setCurrentWeekStart(updatedWeekStart);
    setCurrentYear(newYear);
  };

  const isDateInSelectedRange = useCallback(
    (date) => {
      if (!selectedRange) return false;
      return isWithinInterval(date, {
        start: selectedRange[0],
        end: selectedRange[selectedRange.length - 1],
      });
    },
    [selectedRange],
  );

  const isFirstHighlightDate = useCallback(
    (date) => {
      return highlightDates.some(
        (range) =>
          format(range[0], 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
      );
    },
    [highlightDates],
  );

  const handleDateClick = (date) => {
    setSelectedDay(date); // Update the selected day for animation
    const matchingRange = highlightDates.find((range) =>
      isWithinInterval(date, { start: range[0], end: range[range.length - 1] }),
    );
    if (matchingRange) {
      setSelectedRange(matchingRange);
      if (onRangeSelect) onRangeSelect(matchingRange);
    }
  };

  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToPreviousWeek = () =>
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));

  return (
    <div className="calendar-container">
      <div className="dropdown-container">
        <select
          value={currentMonth}
          onChange={handleMonthChange}
          className="month-dropdown"
        >
          {Array.from({ length: 12 }, (_, index) => (
            <option key={index} value={index}>
              {format(new Date(2024, index, 1), 'MMMM', { locale })}
            </option>
          ))}
        </select>

        <select
          value={currentYear}
          onChange={handleYearChange}
          className="year-dropdown"
        >
          {Array.from({ length: 10 }, (_, index) => {
            const year = getYear(new Date()) - 5 + index;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>

      <div className="navigation-buttons">
        <button onClick={goToPreviousWeek} className="nav-button">
          <FiArrowLeft />
        </button>
        <button onClick={goToNextWeek} className="nav-button">
          <FiArrowRight />
        </button>
      </div>

      <div className="calendar-grid">
        {generateWeekDays(startOfWeek(new Date(), { weekStartsOn: 0 })).map(
          (day, index) => (
            <div key={index} className="day-header">
              {format(day, 'EEE', { locale })}
            </div>
          ),
        )}

        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => {
              const isDisabled = !isFirstHighlightDate(day);
              const initClass = isDisabled ? 'disabled' : '';

              const isHighlighted = highlightDates.some(
                (range) =>
                  format(range[0], 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'),
              );
              const isInRange = isDateInSelectedRange(day);
              const additionalClass = onDayCreate ? onDayCreate(day) : '';

              const cellClasses = [
                'day-cell',
                initClass,
                additionalClass,
                isHighlighted ? 'highlighted' : '',
                isInRange ? 'selected' : '',
                selectedDay &&
                format(selectedDay, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                  ? 'selected-animated'
                  : '',
              ].join(' ');

              return (
                <div
                  key={dayIndex}
                  className={cellClasses}
                  onClick={() => handleDateClick(day)}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

CustomCalendar.propTypes = {
  highlightDates: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  ),
  onMonthChange: PropTypes.func,
  onRangeSelect: PropTypes.func,
  onDayCreate: PropTypes.func,
  weeksToShow: PropTypes.number,
  locale: PropTypes.object,
};

export default CustomCalendar;
