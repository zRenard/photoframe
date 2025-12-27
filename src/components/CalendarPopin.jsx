import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
// Import date-fns locale for internationalization
import { enUS, es, fr, de, it, zhCN, ja } from 'date-fns/locale';
import './CalendarPopin.css';

// Map of supported locales
const locales = {
  en: enUS,
  es: es,
  fr: fr,
  de: de,
  it: it,
  zh: zhCN,
  ja: ja,
};

// Map for translating month navigation buttons and screen reader labels
const translations = {
  en: { previous: 'Previous month', next: 'Next month' },
  es: { previous: 'Mes anterior', next: 'Mes siguiente' },
  fr: { previous: 'Mois précédent', next: 'Mois suivant' },
  de: { previous: 'Vorheriger Monat', next: 'Nächster Monat' },
  it: { previous: 'Mese precedente', next: 'Mese successivo' },
  zh: { previous: '上个月', next: '下个月' },
  ja: { previous: '前月', next: '来月' },
};

const CalendarPopin = ({ initialDate = new Date(), onSelectDate, firstDayOfWeek = 0, language = 'en' }) => {
  // Store initialDate as a ref to avoid re-renders
  const initialDateRef = React.useRef(initialDate);
  
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate));
  const [selectedDate, setSelectedDate] = useState(new Date(initialDate));
  
  // Get the appropriate locale for the current language
  const locale = locales[language] || locales.en;
  // Get translations for the current language
  const t = translations[language] || translations.en;
  
  // Only update state if initialDate has actually changed (compare timestamps)
  useEffect(() => {
    // Only update if the dates are different (by timestamp)
    if (initialDateRef.current.getTime() !== initialDate.getTime()) {
      initialDateRef.current = initialDate;
      setSelectedDate(new Date(initialDate));
      setCurrentMonth(new Date(initialDate));
    }
  }, [initialDate]);

  const renderHeader = () => {
    return (
      <div className="header row flex-middle">
        <button 
          className="col col-start" 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          aria-label={t.previous}
        >
          <div className="icon">&lt;</div>
        </button>
        <div className="col col-center">
          <span>{format(currentMonth, 'MMMM yyyy', { locale })}</span>
        </div>
        <button 
          className="col col-end" 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          aria-label={t.next}
        >
          <div className="icon">&gt;</div>
        </button>
      </div>
    );
  };
  
  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEE';
    const startDate = startOfWeek(new Date(), { weekStartsOn: firstDayOfWeek });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col col-center" key={i}>
          {format(addDays(startDate, i), dateFormat, { locale })}
        </div>
      );
    }

    return <div className="days row">{days}</div>;
  };
  
  const renderCells = () => {
    const today = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd', { locale });
        const cloneDay = day;
        
        // Determine cell class names
        let cellClassName = 'col cell';
        
        if (!isSameMonth(day, monthStart)) {
          cellClassName += ' disabled';
        } else if (isSameDay(day, selectedDate)) {
          cellClassName += ' selected';
        } 
        
        // Add today class for current day
        if (isSameDay(day, today)) {
          cellClassName += ' today';
        }
        
        days.push(
          <button
            className={cellClassName}
            key={day.toString()}
            onClick={() => {
              setSelectedDate(cloneDay);
              if (onSelectDate) {
                onSelectDate(cloneDay);
              }
            }}
            disabled={!isSameMonth(day, monthStart)}
          >
            <span className="number">{formattedDate}</span>
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="body">{rows}</div>;
  };

  return (
    <div className="calendar">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

// Add PropTypes validation at the end of the file
CalendarPopin.propTypes = {
  initialDate: PropTypes.instanceOf(Date),
  onSelectDate: PropTypes.func,
  firstDayOfWeek: PropTypes.oneOf([0, 1]), // 0 for Sunday, 1 for Monday
  language: PropTypes.string // Language code (en, es, fr, de, it, zh, ja)
};

export default CalendarPopin;
