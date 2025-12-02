import { useState } from 'react'
import { format, addDays, subDays, isToday, isSameDay, parseISO } from 'date-fns'
import './DateNavigator.css'

const DateNavigator = ({ 
  selectedDate, 
  onChange, 
  minDate = null,
  maxDate = null,
  showCalendar = true 
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handlePrevDay = () => {
    const newDate = subDays(parseISO(selectedDate), 1)
    if (!minDate || newDate >= parseISO(minDate)) {
      onChange(format(newDate, 'yyyy-MM-dd'))
    }
  }

  const handleNextDay = () => {
    const newDate = addDays(parseISO(selectedDate), 1)
    if (!maxDate || newDate <= parseISO(maxDate)) {
      onChange(format(newDate, 'yyyy-MM-dd'))
    }
  }

  const handleToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    onChange(today)
    setShowDatePicker(false)
  }

  const handleDateSelect = (date) => {
    onChange(format(date, 'yyyy-MM-dd'))
    setShowDatePicker(false)
  }

  const selectedDateObj = parseISO(selectedDate)
  const isSelectedToday = isToday(selectedDateObj)
  const canGoPrev = !minDate || selectedDateObj > parseISO(minDate)
  const canGoNext = !maxDate || selectedDateObj < parseISO(maxDate)

  return (
    <div className="date-navigator">
      <div className="date-navigator-controls">
        <button
          type="button"
          className="date-nav-btn"
          onClick={handlePrevDay}
          disabled={!canGoPrev}
          title="Previous day"
        >
          ←
        </button>

        <div 
          className="date-display"
          onClick={() => showCalendar && setShowDatePicker(!showDatePicker)}
          style={{ cursor: showCalendar ? 'pointer' : 'default' }}
        >
          <div className="date-main">
            {format(selectedDateObj, 'EEEE, MMMM d, yyyy')}
          </div>
          {isSelectedToday && (
            <div className="date-badge">Today</div>
          )}
        </div>

        <button
          type="button"
          className="date-nav-btn"
          onClick={handleNextDay}
          disabled={!canGoNext}
          title="Next day"
        >
          →
        </button>
      </div>

      {!isSelectedToday && (
        <button
          type="button"
          className="date-today-btn"
          onClick={handleToday}
        >
          Jump to Today
        </button>
      )}

      {showDatePicker && showCalendar && (
        <div className="date-picker-overlay" onClick={() => setShowDatePicker(false)}>
          <div className="date-picker-popup" onClick={(e) => e.stopPropagation()}>
            <div className="date-picker-header">
              <h3>Select Date</h3>
              <button 
                type="button"
                className="date-picker-close"
                onClick={() => setShowDatePicker(false)}
              >
                ×
              </button>
            </div>
            <div className="date-picker-body">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateSelect(parseISO(e.target.value))}
                max={maxDate || format(new Date(), 'yyyy-MM-dd')}
                min={minDate || '2020-01-01'}
                className="date-picker-input"
              />
              <div className="date-picker-quick">
                <button type="button" onClick={handleToday}>Today</button>
                <button 
                  type="button" 
                  onClick={() => handleDateSelect(subDays(new Date(), 1))}
                >
                  Yesterday
                </button>
                <button 
                  type="button" 
                  onClick={() => handleDateSelect(subDays(new Date(), 7))}
                >
                  Last Week
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateNavigator

