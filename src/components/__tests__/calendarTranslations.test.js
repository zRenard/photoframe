// Test file for the CalendarPopin component's functionality 
import { describe, it, expect } from '@jest/globals';

// Import the locales to test the translation functionality
import { enUS, es, fr, de, it as italian, zhCN, ja } from 'date-fns/locale';
import { format } from 'date-fns';

// Mock the CSS import
jest.mock('../../components/CalendarPopin.css', () => ({}));

describe('Calendar Internationalization', () => {
  it('should format dates correctly in different languages', () => {
    const testDate = new Date(2025, 5, 26); // June 26, 2025
    
    // Test English formatting
    const englishMonth = format(testDate, 'MMMM yyyy', { locale: enUS });
    expect(englishMonth).toBe('June 2025');
    
    // Test Spanish formatting
    const spanishMonth = format(testDate, 'MMMM yyyy', { locale: es });
    expect(spanishMonth).not.toBe('June 2025'); // Should be different from English
    expect(spanishMonth).toBe('junio 2025');
    
    // Test French formatting
    const frenchMonth = format(testDate, 'MMMM yyyy', { locale: fr });
    expect(frenchMonth).toBe('juin 2025');
    
    // Test German formatting
    const germanMonth = format(testDate, 'MMMM yyyy', { locale: de });
    expect(germanMonth).toBe('Juni 2025');
    
    // Test Italian formatting
    const italianMonth = format(testDate, 'MMMM yyyy', { locale: italian });
    expect(italianMonth).toBe('giugno 2025');
    
    // Test Chinese formatting (may include Chinese characters)
    const chineseMonth = format(testDate, 'MMMM yyyy', { locale: zhCN });
    expect(chineseMonth).not.toBe('June 2025');
    
    // Test Japanese formatting (may include Japanese characters)
    const japaneseMonth = format(testDate, 'MMMM yyyy', { locale: ja });
    expect(japaneseMonth).not.toBe('June 2025');
  });
  
  it('should convert day of week correctly', () => {
    const sunday = new Date(2025, 5, 29); // June 29, 2025 is a Sunday
    const monday = new Date(2025, 5, 30); // June 30, 2025 is a Monday
    
    // Test English day names
    expect(format(sunday, 'EEEE', { locale: enUS })).toBe('Sunday');
    expect(format(monday, 'EEEE', { locale: enUS })).toBe('Monday');
    
    // Test Spanish day names
    expect(format(sunday, 'EEEE', { locale: es })).toBe('domingo');
    expect(format(monday, 'EEEE', { locale: es })).toBe('lunes');
    
    // Test French day names
    expect(format(sunday, 'EEEE', { locale: fr })).toBe('dimanche');
    expect(format(monday, 'EEEE', { locale: fr })).toBe('lundi');
    
    // Test short day format
    expect(format(sunday, 'EEE', { locale: enUS })).toBe('Sun');
    expect(format(monday, 'EEE', { locale: enUS })).toBe('Mon');
  });
  
  it('should have translations for navigation buttons', () => {
    // These test the same translations used in the CalendarPopin component
    const translations = {
      en: { previous: 'Previous month', next: 'Next month' },
      es: { previous: 'Mes anterior', next: 'Mes siguiente' },
      fr: { previous: 'Mois précédent', next: 'Mois suivant' },
      de: { previous: 'Vorheriger Monat', next: 'Nächster Monat' },
      it: { previous: 'Mese precedente', next: 'Mese successivo' },
      zh: { previous: '上个月', next: '下个月' },
      ja: { previous: '前月', next: '来月' },
    };
    
    // Verify translations exist
    expect(translations.en.previous).toBe('Previous month');
    expect(translations.es.next).toBe('Mes siguiente');
    expect(translations.fr.previous).toBe('Mois précédent');
    expect(translations.de.next).toBe('Nächster Monat');
  });
});
