import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
// Import date-fns locale for internationalization
import { enUS, es, fr, de, it, zhCN, ja } from 'date-fns/locale';
import defaultConfig from '../config/defaults.json';
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
  en: { previous: 'Previous month', next: 'Next month', today: 'Today', goToCurrentMonth: 'Go to current month' },
  es: { previous: 'Mes anterior', next: 'Mes siguiente', today: 'Hoy', goToCurrentMonth: 'Ir al mes actual' },
  fr: { previous: 'Mois précédent', next: 'Mois suivant', today: 'Aujourd\'hui', goToCurrentMonth: 'Aller au mois actuel' },
  de: { previous: 'Vorheriger Monat', next: 'Nächster Monat', today: 'Heute', goToCurrentMonth: 'Zum aktuellen Monat gehen' },
  it: { previous: 'Mese precedente', next: 'Mese successivo', today: 'Oggi', goToCurrentMonth: 'Vai al mese corrente' },
  zh: { previous: '上个月', next: '下个月', today: '今天', goToCurrentMonth: '转到当前月份' },
  ja: { previous: '前月', next: '来月', today: '今日', goToCurrentMonth: '今月に移動' },
};

const CalendarPopin = ({ initialDate = new Date(), onSelectDate, firstDayOfWeek = 0, language = 'en', events = defaultConfig.dateDisplay?.calendarEvents || [] }) => {
  // Use initialDate only for initial state, don't reset on changes
  const [currentMonth, setCurrentMonth] = useState(() => new Date(initialDate));
  const [selectedDate, setSelectedDate] = useState(() => new Date(initialDate));
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Get the appropriate locale for the current language
  const locale = locales[language] || locales.en;
  // Get translations for the current language
  const t = translations[language] || translations.en;
  
  // Process events and convert string dates to Date objects
  const calendarEvents = events.map(event => ({
    ...event,
    dateObj: parseISO(event.date)
  }));
  
  // Remove the useEffect that was causing the calendar to reset

  const renderHeader = () => {
    const today = new Date();
    const isCurrentMonth = format(currentMonth, 'yyyy-MM') === format(today, 'yyyy-MM');
    
    return (
      <>
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
        
        {/* Today button - show if not viewing current month OR if today is not selected */}
        {(!isCurrentMonth || !isSameDay(selectedDate, today)) && (
          <div className="today-button-container">
            <button 
              className="today-button"
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now);
                setSelectedDate(now);
                
                // Check if today has an event
                const todayEvent = calendarEvents.find(event => 
                  isSameDay(event.dateObj, now)
                );
                
                if (todayEvent) {
                  setSelectedEvent(todayEvent);
                } else {
                  setSelectedEvent(null);
                }
                
                // Notify parent component
                if (onSelectDate) {
                  onSelectDate(now, todayEvent || null);
                }
              }}
              aria-label={t.goToCurrentMonth}
            >
              {t.today}
            </button>
          </div>
        )}
      </>
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
        const cloneDay = new Date(day);
        
        // Check if this day has an event
        const dayEvent = calendarEvents.find(event => isSameDay(event.dateObj, cloneDay));
        const hasEventToday = Boolean(dayEvent);
        
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
        
        // Add event class for days with events
        if (hasEventToday && isSameMonth(day, monthStart)) {
          cellClassName += ' has-event';
        }
        
        days.push(
          <button
            className={cellClassName}
            key={day.toString()}
            onClick={() => {
              setSelectedDate(cloneDay);
              
              // If the day has an event, set it as the selected event
              if (hasEventToday) {
                setSelectedEvent(dayEvent);
              } else {
                setSelectedEvent(null);
              }
              
              if (onSelectDate) {
                onSelectDate(cloneDay, dayEvent);
              }
            }}
            disabled={!isSameMonth(day, monthStart)}
            title={hasEventToday ? dayEvent.title : ''}
          >
            <span className="number">{formattedDate}</span>
            {hasEventToday && <span className="event-dot"></span>}
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
      
      {/* Event Description Section */}
      {selectedEvent && (
        <div className="event-details">
          <h3 className="event-title">{selectedEvent.title}</h3>
          <p className="event-description">{selectedEvent.description}</p>
        </div>
      )}
    </div>
  );
};

// Add PropTypes validation at the end of the file
CalendarPopin.propTypes = {
  initialDate: PropTypes.instanceOf(Date),
  onSelectDate: PropTypes.func,
  firstDayOfWeek: PropTypes.oneOf([0, 1]), // 0 for Sunday, 1 for Monday
  language: PropTypes.string, // Language code (en, es, fr, de, it, zh, ja)
  events: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired, // ISO date string YYYY-MM-DD
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }))
};

export default CalendarPopin;
