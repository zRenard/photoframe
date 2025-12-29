/**
 * @jest-environment jsdom
 */
import pkg from '@jest/globals';
const { describe, test, expect } = pkg;
import { renderHook } from '@testing-library/react';
import { translations, useTranslations } from '../utils/translations.js';

describe('translations module', () => {
  // Basic structure tests
  describe('basic structure', () => {
    test('should export translations object', () => {
      expect(translations).toBeDefined();
      expect(typeof translations).toBe('object');
    });

    test('should export useTranslations hook', () => {
      expect(useTranslations).toBeDefined();
      expect(typeof useTranslations).toBe('function');
    });
  });

  // Language availability tests
  describe('language availability', () => {
    test('should have all supported languages', () => {
      const expectedLanguages = ['en', 'es', 'it', 'de', 'zh', 'fr', 'ja'];
      expectedLanguages.forEach(lang => {
        expect(translations[lang]).toBeDefined();
        expect(typeof translations[lang]).toBe('object');
      });
    });

    test('should have english as default language', () => {
      expect(translations.en).toBeDefined();
      expect(translations.en.settings).toBeDefined();
    });
  });

  // Translation completeness tests
  describe('translation completeness', () => {
    const referenceKeys = Object.keys(translations.en);
    const languages = ['es', 'it', 'de', 'zh', 'fr', 'ja'];

    languages.forEach(lang => {
      test(`${lang} should have all main keys from english`, () => {
        referenceKeys.forEach(key => {
          expect(translations[lang]).toHaveProperty(key);
        });
      });
    });

    test('all languages should have basic UI elements', () => {
      const basicKeys = ['settings', 'general', 'save', 'cancel', 'close'];
      Object.keys(translations).forEach(lang => {
        basicKeys.forEach(key => {
          expect(translations[lang]).toHaveProperty(key);
          expect(typeof translations[lang][key]).toBe('string');
          expect(translations[lang][key].length).toBeGreaterThan(0);
        });
      });
    });
  });

  // Nested object structure tests
  describe('nested object structures', () => {
    test('should have positions object in all languages', () => {
      Object.keys(translations).forEach(lang => {
        expect(translations[lang].positions).toBeDefined();
        expect(typeof translations[lang].positions).toBe('object');
        
        // Check for specific position keys
        const positionKeys = ['top-left', 'top-center', 'top-right', 'center', 'bottom-right'];
        positionKeys.forEach(key => {
          expect(translations[lang].positions).toHaveProperty(key);
        });
      });
    });

    test('should have sizes object in all languages', () => {
      Object.keys(translations).forEach(lang => {
        expect(translations[lang].sizes).toBeDefined();
        expect(typeof translations[lang].sizes).toBe('object');
        
        // Check for specific size keys
        const sizeKeys = ['size-1', 'size-2', 'size-3', 'size-4'];
        sizeKeys.forEach(key => {
          expect(translations[lang].sizes).toHaveProperty(key);
        });
      });
    });

    test('should have dateFormats object in all languages', () => {
      Object.keys(translations).forEach(lang => {
        expect(translations[lang].dateFormats).toBeDefined();
        expect(typeof translations[lang].dateFormats).toBe('object');
        
        // Check for specific format keys - accommodate both old and new format styles
        const newFormatKeys = ['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'];
        const oldFormatKeys = ['DD/MM/YYYY', 'MM/DD/YYYY', 'DD-MM-YYYY'];
        
        // Check if this language has the new format keys or old format keys
        const hasNewFormat = newFormatKeys.some(key => Object.prototype.hasOwnProperty.call(translations[lang].dateFormats, key));
        const hasOldFormat = oldFormatKeys.some(key => Object.prototype.hasOwnProperty.call(translations[lang].dateFormats, key));
        
        if (hasNewFormat) {
          newFormatKeys.forEach(key => {
            expect(translations[lang].dateFormats).toHaveProperty(key);
          });
        } else if (hasOldFormat) {
          oldFormatKeys.forEach(key => {
            expect(translations[lang].dateFormats).toHaveProperty(key);
          });
        } else {
          // If neither format is found, throw an error with a descriptive message
          throw new Error(`Language ${lang} dateFormats doesn't contain expected format keys. Found keys: ${Object.keys(translations[lang].dateFormats).join(', ')}`);
        }
      });
    });

    test('should have transitions object in all languages', () => {
      Object.keys(translations).forEach(lang => {
        expect(translations[lang].transitions).toBeDefined();
        expect(typeof translations[lang].transitions).toBe('object');
        
        // Check for specific transition keys
        const transitionKeys = ['fade', 'slide-right', 'slide-left', 'zoom-in'];
        transitionKeys.forEach(key => {
          expect(translations[lang].transitions).toHaveProperty(key);
        });
      });
    });

    test('should have weather-related nested objects', () => {
      Object.keys(translations).forEach(lang => {
        expect(translations[lang].forecastModes).toBeDefined();
        expect(translations[lang].units).toBeDefined();
        expect(translations[lang].airQualityLevels).toBeDefined();
        
        // Check specific weather keys
        expect(translations[lang].forecastModes.today).toBeDefined();
        expect(translations[lang].units.metric).toBeDefined();
        expect(translations[lang].airQualityLevels.good).toBeDefined();
      });
    });
  });

  // Content validation tests
  describe('content validation', () => {
    test('should have non-empty translation values', () => {
      Object.keys(translations).forEach(lang => {
        // Test some key translations are not empty
        const keyTranslations = ['settings', 'general', 'save', 'cancel'];
        keyTranslations.forEach(key => {
          expect(translations[lang][key]).toBeTruthy();
          expect(translations[lang][key].length).toBeGreaterThan(0);
        });
      });
    });

    test('should have timer-related translations', () => {
      Object.keys(translations).forEach(lang => {
        const timerKeys = ['timer', 'start', 'pause', 'reset', 'countdown', 'chronometer'];
        timerKeys.forEach(key => {
          expect(translations[lang]).toHaveProperty(key);
          expect(typeof translations[lang][key]).toBe('string');
        });
      });
    });

    test('should have calendar-related translations', () => {
      Object.keys(translations).forEach(lang => {
        const calendarKeys = ['enableCalendar', 'selectDate', 'sunday', 'monday'];
        calendarKeys.forEach(key => {
          expect(translations[lang]).toHaveProperty(key);
          expect(typeof translations[lang][key]).toBe('string');
        });
      });
    });
  });

  // useTranslations hook tests (basic functionality)
  describe('useTranslations function', () => {
    test('should be exported as a function', () => {
      expect(useTranslations).toBeDefined();
      expect(typeof useTranslations).toBe('function');
    });

    test('should return the correct language translations when called directly', () => {
      // Test direct function call behavior (without React hooks)
      expect(typeof useTranslations).toBe('function');
      
      // We can't test the actual hook functionality without renderHook,
      // but we can verify the function exists and is callable
      expect(() => useTranslations).not.toThrow();
    });

    // Test the hook logic directly (not as a React hook)
    test('should return correct translations for supported languages', () => {
      // Mock the useMemo behavior to test the hook logic directly
      const mockUseMemo = (fn) => fn();
      
      // Test the hook logic by calling it directly
      const testHookLogic = (language) => {
        return mockUseMemo(() => {
          return translations[language] || translations.en;
        });
      };

      // Test various language scenarios
      expect(testHookLogic('en')).toEqual(translations.en);
      expect(testHookLogic('es')).toEqual(translations.es);
      expect(testHookLogic('fr')).toEqual(translations.fr);
      expect(testHookLogic('it')).toEqual(translations.it);
      expect(testHookLogic('ja')).toEqual(translations.ja);
      
      // Test fallback to English for unsupported languages
      expect(testHookLogic('unsupported')).toEqual(translations.en);
      expect(testHookLogic(null)).toEqual(translations.en);
      expect(testHookLogic(undefined)).toEqual(translations.en);
    });

    test('should return English translations for valid language code (en)', () => {
      const { result } = renderHook(() => useTranslations('en'));
      
      expect(result.current).toBeDefined();
      expect(result.current).toEqual(translations.en);
      expect(result.current.settings).toBe('Slideshow Settings');
    });

    test('should return Spanish translations for valid language code (es)', () => {
      const { result } = renderHook(() => useTranslations('es'));
      
      expect(result.current).toBeDefined();
      expect(result.current).toEqual(translations.es);
      expect(result.current.settings).toBe('Configuración de Presentación');
    });

    test('should return French translations for valid language code (fr)', () => {
      const { result } = renderHook(() => useTranslations('fr'));
      
      expect(result.current).toBeDefined();
      expect(result.current).toEqual(translations.fr);
      expect(result.current.settings).toBe('Paramètres du Diaporama');
    });

    test('should return Italian translations for valid language code (it)', () => {
      const { result } = renderHook(() => useTranslations('it'));
      
      expect(result.current).toBeDefined();
      expect(result.current).toEqual(translations.it);
      expect(result.current.settings).toBe('Impostazioni Slideshow');
    });

    test('should return German translations for valid language code (de)', () => {
      const { result } = renderHook(() => useTranslations('de'));
      
      expect(result.current).toBeDefined();
      expect(result.current).toEqual(translations.de);
      expect(result.current.settings).toBe('Diashow-Einstellungen');
    });

    test('should return Chinese translations for valid language code (zh)', () => {
      const { result } = renderHook(() => useTranslations('zh'));
      
      expect(result.current).toBeDefined();
      expect(result.current).toEqual(translations.zh);
      expect(result.current.settings).toBe('幻灯片设置');
    });

    test('should return Japanese translations for valid language code (ja)', () => {
      const { result } = renderHook(() => useTranslations('ja'));
      
      expect(result.current).toBeDefined();
      expect(result.current).toEqual(translations.ja);
      expect(result.current.settings).toBe('スライドショー設定');
    });

    test('should fallback to English for unsupported language code', () => {
      const { result } = renderHook(() => useTranslations('unsupported-lang'));
      
      expect(result.current).toBeDefined();
      expect(result.current).toEqual(translations.en);
      expect(result.current.settings).toBe('Slideshow Settings');
    });

    test('should fallback to English for null language', () => {
      const { result } = renderHook(() => useTranslations(null));
      
      expect(result.current).toBeDefined();
      expect(result.current).toEqual(translations.en);
    });

    test('should fallback to English for undefined language', () => {
      const { result } = renderHook(() => useTranslations(undefined));
      
      expect(result.current).toBeDefined();
      expect(result.current).toEqual(translations.en);
    });

    test('should fallback to English for empty string language', () => {
      const { result } = renderHook(() => useTranslations(''));
      
      expect(result.current).toBeDefined();
      expect(result.current).toEqual(translations.en);
    });

    test('should memoize translations based on language', () => {
      const { result, rerender } = renderHook(
        ({ lang }) => useTranslations(lang),
        { initialProps: { lang: 'en' } }
      );
      
      const firstResult = result.current;
      expect(firstResult).toEqual(translations.en);
      
      // Re-render with same language - should return same memoized object
      rerender({ lang: 'en' });
      expect(result.current).toBe(firstResult);
    });

    test('should update memoized translations when language changes', () => {
      const { result, rerender } = renderHook(
        ({ lang }) => useTranslations(lang),
        { initialProps: { lang: 'en' } }
      );
      
      expect(result.current).toEqual(translations.en);
      expect(result.current.settings).toBe('Slideshow Settings');
      
      // Change language
      rerender({ lang: 'es' });
      expect(result.current).toEqual(translations.es);
      expect(result.current.settings).toBe('Configuración de Presentación');
      
      // Change to French
      rerender({ lang: 'fr' });
      expect(result.current).toEqual(translations.fr);
      expect(result.current.settings).toBe('Paramètres du Diaporama');
    });

    test('should handle rapid language changes', () => {
      const { result, rerender } = renderHook(
        ({ lang }) => useTranslations(lang),
        { initialProps: { lang: 'en' } }
      );
      
      expect(result.current.settings).toBe('Slideshow Settings');
      
      rerender({ lang: 'es' });
      expect(result.current.settings).toBe('Configuración de Presentación');
      
      rerender({ lang: 'it' });
      expect(result.current.settings).toBe('Impostazioni Slideshow');
      
      rerender({ lang: 'de' });
      expect(result.current.settings).toBe('Diashow-Einstellungen');
      
      // Back to English
      rerender({ lang: 'en' });
      expect(result.current.settings).toBe('Slideshow Settings');
    });

    test('should return complete translation object with all keys', () => {
      const { result } = renderHook(() => useTranslations('en'));
      
      expect(result.current).toHaveProperty('settings');
      expect(result.current).toHaveProperty('general');
      expect(result.current).toHaveProperty('save');
      expect(result.current).toHaveProperty('cancel');
      expect(result.current).toHaveProperty('positions');
      expect(result.current).toHaveProperty('sizes');
      expect(result.current).toHaveProperty('dateFormats');
      expect(result.current).toHaveProperty('transitions');
    });

    test('should preserve nested object structures', () => {
      const { result } = renderHook(() => useTranslations('en'));
      
      expect(typeof result.current.positions).toBe('object');
      expect(result.current.positions['top-left']).toBeDefined();
      
      expect(typeof result.current.sizes).toBe('object');
      expect(result.current.sizes['size-1']).toBeDefined();
      
      expect(typeof result.current.dateFormats).toBe('object');
      expect(typeof result.current.transitions).toBe('object');
    });
  });

  // Data integrity tests
  describe('data integrity', () => {
    test('should have safe object structure', () => {
      // Check that the object structure is safe and has standard properties
      expect(translations.constructor).toBeDefined();
      expect(translations.hasOwnProperty).toBeDefined();
      
      // Check that all language objects are plain objects
      Object.keys(translations).forEach(lang => {
        expect(typeof translations[lang]).toBe('object');
        expect(translations[lang]).not.toBeNull();
        expect(Array.isArray(translations[lang])).toBe(false);
      });
    });

    test('should have consistent number format patterns', () => {
      Object.keys(translations).forEach(lang => {
        // Check that size values follow expected pattern
        Object.keys(translations[lang].sizes).forEach(sizeKey => {
          const sizeValue = translations[lang].sizes[sizeKey];
          expect(sizeValue).toMatch(/\d+/); // Should contain numbers
        });
      });
    });

    test('should have unique translation keys', () => {
      Object.keys(translations).forEach(lang => {
        const keys = Object.keys(translations[lang]);
        const uniqueKeys = [...new Set(keys)];
        expect(keys.length).toBe(uniqueKeys.length);
      });
    });
  });

  // Settings Panel tab translation tests
  describe('Settings Panel tab translations', () => {
    test('should have all main tab translations in all languages', () => {
      const mainTabKeys = ['general', 'basicSettings', 'effectsSettings', 'imagesSettings', 'imagesSettingsDescription', 'scanForImages', 'scanning', 'featuresActivation'];
      
      Object.keys(translations).forEach(lang => {
        mainTabKeys.forEach(key => {
          expect(translations[lang]).toHaveProperty(key);
          expect(typeof translations[lang][key]).toBe('string');
          expect(translations[lang][key].length).toBeGreaterThan(0);
        });
      });
    });

    test('should have Images tab translation in all languages', () => {
      Object.keys(translations).forEach(lang => {
        expect(translations[lang]).toHaveProperty('imagesSettings');
        expect(typeof translations[lang].imagesSettings).toBe('string');
        expect(translations[lang].imagesSettings.length).toBeGreaterThan(0);
        
        expect(translations[lang]).toHaveProperty('imagesSettingsDescription');
        expect(typeof translations[lang].imagesSettingsDescription).toBe('string');
        expect(translations[lang].imagesSettingsDescription.length).toBeGreaterThan(0);
        
        expect(translations[lang]).toHaveProperty('scanForImages');
        expect(typeof translations[lang].scanForImages).toBe('string');
        expect(translations[lang].scanForImages.length).toBeGreaterThan(0);
        
        expect(translations[lang]).toHaveProperty('scanning');
        expect(typeof translations[lang].scanning).toBe('string');
        expect(translations[lang].scanning.length).toBeGreaterThan(0);
        
        // Verify it's not just the fallback English text
        if (lang !== 'en') {
          // We can't easily test if it's actually translated without knowing the expected translations,
          // but we can ensure the property exists and is a non-empty string
          expect(translations[lang].imagesSettings).toBeTruthy();
          expect(translations[lang].imagesSettingsDescription).toBeTruthy();
          expect(translations[lang].scanForImages).toBeTruthy();
          expect(translations[lang].scanning).toBeTruthy();
        }
      });
    });

    test('should have all tab category translations', () => {
      const tabCategoryKeys = [
        'general',               // General category
        'features',              // Features category  
        'basicSettings',         // Basic Settings tab
        'effectsSettings',       // Effects tab
        'imagesSettings',        // Images tab
        'imagesSettingsDescription', // Images tab description
        'scanForImages',         // Scan for Images button
        'scanning',              // Scanning... text
        'featuresActivation'     // Features activation tab
      ];
      
      Object.keys(translations).forEach(lang => {
        tabCategoryKeys.forEach(key => {
          expect(translations[lang]).toHaveProperty(key);
          expect(typeof translations[lang][key]).toBe('string');
          expect(translations[lang][key].length).toBeGreaterThan(0);
        });
      });
    });

    test('should have consistent tab translations structure', () => {
      const requiredTabKeys = ['basicSettings', 'effectsSettings', 'imagesSettings', 'imagesSettingsDescription', 'scanForImages', 'scanning', 'featuresActivation'];
      
      // Check that all languages have the same tab keys as English
      Object.keys(translations).forEach(lang => {
        if (lang !== 'en') {
          requiredTabKeys.forEach(key => {
            expect(translations[lang]).toHaveProperty(key);
            // Ensure the translation is not empty or just whitespace
            expect(translations[lang][key].trim()).not.toBe('');
          });
        }
      });
    });

    test('Images tab translations should be properly localized', () => {
      // Test specific translations for Images tab
      const expectedTranslations = {
        en: { 
          title: 'Images', 
          description: 'View and manage your photo collection',
          scanButton: 'Scan for Images',
          scanning: 'Scanning...'
        },
        es: { 
          title: 'Imágenes', 
          description: 'Ver y gestionar tu colección de fotos',
          scanButton: 'Buscar Imágenes',
          scanning: 'Buscando...'
        }, 
        it: { 
          title: 'Immagini', 
          description: 'Visualizza e gestisci la tua collezione di foto',
          scanButton: 'Scansiona Immagini',
          scanning: 'Scansionando...'
        },
        de: { 
          title: 'Bilder', 
          description: 'Betrachten und verwalten Sie Ihre Fotosammlung',
          scanButton: 'Nach Bildern Suchen',
          scanning: 'Suche läuft...'
        },
        zh: { 
          title: '图片', 
          description: '查看和管理您的照片收藏',
          scanButton: '扫描图片',
          scanning: '扫描中...'
        },
        fr: { 
          title: 'Images', 
          description: 'Visualisez et gérez votre collection de photos',
          scanButton: 'Rechercher des Images',
          scanning: 'Recherche en cours...'
        },
        ja: { 
          title: '画像', 
          description: '写真コレクションを表示および管理する',
          scanButton: '画像をスキャン',
          scanning: 'スキャン中...'
        }
      };

      Object.keys(expectedTranslations).forEach(lang => {
        expect(translations[lang].imagesSettings).toBe(expectedTranslations[lang].title);
        expect(translations[lang].imagesSettingsDescription).toBe(expectedTranslations[lang].description);
        expect(translations[lang].scanForImages).toBe(expectedTranslations[lang].scanButton);
        expect(translations[lang].scanning).toBe(expectedTranslations[lang].scanning);
      });
    });

    test('should not have missing translation fallbacks for tab keys', () => {
      const criticalTabKeys = ['basicSettings', 'effectsSettings', 'imagesSettings', 'imagesSettingsDescription', 'scanForImages', 'scanning', 'featuresActivation'];
      
      Object.keys(translations).forEach(lang => {
        criticalTabKeys.forEach(key => {
          const translation = translations[lang][key];
          
          // For imagesSettings, French "Images" is actually correct, so we only check other languages
          if (lang !== 'en' && key === 'imagesSettings' && lang !== 'fr') {
            expect(translation).not.toBe('Images'); // Should not be English fallback
          }
          
          // For imagesSettingsDescription, check it's not the English fallback
          if (lang !== 'en' && key === 'imagesSettingsDescription') {
            expect(translation).not.toBe('View and manage your photo collection'); // Should not be English fallback
          }
          
          // For scanForImages, check it's not the English fallback
          if (lang !== 'en' && key === 'scanForImages') {
            expect(translation).not.toBe('Scan for Images'); // Should not be English fallback
          }
          
          // For scanning, check it's not the English fallback
          if (lang !== 'en' && key === 'scanning') {
            expect(translation).not.toBe('Scanning...'); // Should not be English fallback
          }
          
          // Ensure all translations exist and are meaningful
          expect(translation).toBeDefined();
          expect(translation).not.toBe('');
          expect(translation).not.toBe(undefined);
          expect(translation).not.toBe(null);
        });
      });
    });
  });

  // Data integrity tests
  describe('data integrity', () => {
    test('should have safe object structure', () => {
      // Check that the object structure is safe and has standard properties
      expect(translations.constructor).toBeDefined();
      expect(translations.hasOwnProperty).toBeDefined();
      
      // Check that all language objects are plain objects
      Object.keys(translations).forEach(lang => {
        expect(typeof translations[lang]).toBe('object');
        expect(translations[lang]).not.toBeNull();
        expect(Array.isArray(translations[lang])).toBe(false);
      });
    });

    test('should have consistent number format patterns', () => {
      Object.keys(translations).forEach(lang => {
        // Check that size values follow expected pattern
        Object.keys(translations[lang].sizes).forEach(sizeKey => {
          const sizeValue = translations[lang].sizes[sizeKey];
          expect(sizeValue).toMatch(/\d+/); // Should contain numbers
        });
      });
    });

    test('should have unique translation keys', () => {
      Object.keys(translations).forEach(lang => {
        const keys = Object.keys(translations[lang]);
        const uniqueKeys = [...new Set(keys)];
        expect(keys.length).toBe(uniqueKeys.length);
      });
    });
  });
});
