import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';

// Import custom hooks
import { useImageSlideshow } from './hooks/useImageSlideshow';
import { useSettings } from './hooks/useSettings';
import { translations } from './utils/translations';

// Import optimized components
import ImageSlideshow from './components/ImageSlideshow';
import ImageCounter from './components/ImageCounter';
import CountdownDisplay from './components/CountdownDisplay';
import NoImagesMessage from './components/NoImagesMessage';
import UIControls from './components/UIControls';
import DisplayManager from './components/DisplayManager';
import SettingsPanel from './components/SettingsPanel';
import CalendarPopin from './components/CalendarPopin';
import { getAllAvailableImages } from './utils/imageUtils';

// Function to fetch images without Express server
const fetchImages = async () => {
  try {
    const imageList = await getAllAvailableImages();
    
    // Convert simple filename array to the format expected by the slideshow
    const validImages = imageList.map(imageName => ({
      url: `/photos/${imageName}`,
      name: imageName.replace(/\.[^/.]+$/, '') // Remove extension for display name
    }));
    
    if (validImages.length > 0) {
      return validImages;
    }
    
    // Return sample images if no local images found
    return [
      { url: 'https://source.unsplash.com/random/800x600?nature,1', name: 'Nature' },
      { url: 'https://source.unsplash.com/random/800x600?mountain,1', name: 'Mountain' },
      { url: 'https://source.unsplash.com/random/800x600?ocean,1', name: 'Ocean' },
      { url: 'https://source.unsplash.com/random/800x600?forest,1', name: 'Forest' },
      { url: 'https://source.unsplash.com/random/800x600?sunset,1', name: 'Sunset' },
    ];
  } catch (error) {
    console.error('Error fetching images:', error);
    // Return sample images if there's an error
    return [
      { url: 'https://source.unsplash.com/random/800x600?nature,1', name: 'Nature' },
      { url: 'https://source.unsplash.com/random/800x600?mountain,1', name: 'Mountain' },
      { url: 'https://source.unsplash.com/random/800x600?ocean,1', name: 'Ocean' },
      { url: 'https://source.unsplash.com/random/800x600?forest,1', name: 'Forest' },
      { url: 'https://source.unsplash.com/random/800x600?sunset,1', name: 'Sunset' },
    ];
  }
};

function ModularApp() {
  // State
  const [images, setImages] = useState([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transition, setTransition] = useState({ type: 'fade', duration: 1000 });
  const [showCalendar, setShowCalendar] = useState(false);

  // Memoize the initial date to prevent unnecessary re-renders of CalendarPopin
  const calendarInitialDate = useMemo(() => new Date(), []);

  // Custom hooks
  const settings = useSettings();
  
  // Image slideshow hook
  const {
    currentImageIndex,
    timeLeft,
    isTransitioning,
    getCurrentImage,
    setTimeLeft
  } = useImageSlideshow(images, settings.rotationTime, settings.showCountdown, settings.slideshowOrder);

  // Apply theme class to the root element
  useEffect(() => {
    document.documentElement.classList.remove(
      'theme-dark', 'theme-light', 'theme-blue', 'theme-green', 
      'theme-red', 'theme-purple', 'theme-orange', 'theme-pink'
    );
    document.documentElement.classList.add(`theme-${settings.theme}`);
  }, [settings.theme]);

  // Function to refresh images (can be called from SettingsPanel)
  const refreshImages = useCallback(async () => {
    const imageList = await fetchImages();
    setImages(imageList);
  }, []);

  // Function to force refresh images (clears cache first)
  const forceRefreshImages = useCallback(async () => {
    // Clear cache to force fresh scan
    const { clearImageCache } = await import('./utils/imageUtils');
    clearImageCache();
    await refreshImages();
  }, [refreshImages]);

  // Fetch images when component mounts
  useEffect(() => {
    refreshImages();
  }, [refreshImages]);

  // Periodic refresh to detect new images added to the directory
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      // Only refresh if not in settings panel to avoid disrupting user
      if (!isConfigOpen) {
        refreshImages();
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, [refreshImages, isConfigOpen]);

  // Reset timeLeft when rotationTime changes
  useEffect(() => {
    if (settings.showCountdown) {
      setTimeLeft(settings.rotationTime);
    }
  }, [settings.rotationTime, settings.showCountdown, setTimeLeft]);

  // Memoized fullscreen toggle function
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  // Memoized config toggle function
  const toggleConfig = useCallback(() => {
    setIsConfigOpen(prev => !prev);
  }, []);

  // Memoized save settings function
  const handleSaveSettings = useCallback(() => {
    settings.saveSettings();
    setIsConfigOpen(false);
  }, [settings]);

  // Memoized reset to defaults function
  const handleResetToDefaults = useCallback(() => {
    settings.resetToDefaults();
    setTimeLeft(settings.rotationTime);
  }, [settings, setTimeLeft]);

  // Current image memoization
  const currentImage = useMemo(() => getCurrentImage(), [getCurrentImage]);

  // Close config panel when clicking outside
  const handleClickOutside = useCallback((e) => {
    if (e.target.closest('.config-panel') === null && e.target.closest('.config-button') === null) {
      setIsConfigOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isConfigOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isConfigOpen, handleClickOutside]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900" style={{ overflow: 'hidden' }}>
      {/* Main Content */}
      <div className="slideshow-container">
        {/* Main Image Slideshow */}
        <ImageSlideshow
          currentImage={currentImage}
          imageDisplayMode={settings.imageDisplayMode}
          transition={transition}
          isTransitioning={isTransitioning}
        />

        {/* UI Controls */}
        <UIControls
          onToggleConfig={toggleConfig}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          language={settings.language}
          translations={translations}
          position={settings.uiControlsPosition}
        />

        {/* Unified Display Manager - Handles time, date, and weather positioning */}
        <DisplayManager
          // Time settings
          showTime={settings.showTime}
          timeDisplay={settings.timeDisplay}
          timeFormat24h={settings.timeFormat24h}
          showSeconds={settings.showSeconds}
          
          // Date settings
          showDate={settings.showDate}
          dateDisplay={settings.dateDisplay}
          enableCalendar={settings.enableCalendar}
          onCalendarClick={() => setShowCalendar(true)}
          
          // Weather settings
          showWeather={settings.showWeather}
          weatherLocation={settings.weatherLocation}
          weatherCoordinates={settings.weatherCoordinates}
          forecastMode={settings.forecastMode}
          weatherUnit={settings.weatherUnit}
          weatherPosition={settings.weatherPosition}
          weatherSize={settings.weatherSize}
          weatherRefreshInterval={settings.weatherRefreshInterval}
          showWeatherCountdown={settings.showWeatherCountdown}
          showAirQuality={settings.showAirQuality}
          
          // Timer settings
          timerEnabled={settings.timerEnabled}
          timerType={settings.timerType}
          countdownHours={settings.countdownHours}
          countdownMinutes={settings.countdownMinutes}
          countdownSeconds={settings.countdownSeconds}
          timerTimeoutBlinkDuration={settings.timerTimeoutBlinkDuration}
          countdownFontSize={settings.countdownFontSize}
          chronometerFontSize={settings.chronometerFontSize}
          onTimerTypeChange={settings.setTimerType}
          
          // Common
          language={settings.language}
          translations={translations}
        />

        {/* Image Counter */}
        {settings.showImageCounter && images.length > 0 && (
          <ImageCounter
            current={currentImageIndex}
            total={images.length}
            language={settings.language}
            translations={translations}
            position={settings.imageCounterPosition}
          />
        )}

        {/* Countdown Display */}
        {settings.showCountdown && (
          <CountdownDisplay
            timeLeft={timeLeft}
            language={settings.language}
            translations={translations}
            position={settings.countdownPosition}
          />
        )}



        {/* No Images Message */}
        {images.length === 0 && (
          <NoImagesMessage
            language={settings.language}
            translations={translations}
          />
        )}
      </div>

      {/* Settings Panel - Outside slideshow container for proper z-index */}
      {isConfigOpen && (
        <SettingsPanel
          settings={settings}
          translations={translations}
          onSave={handleSaveSettings}
          onReset={handleResetToDefaults}
          onClose={toggleConfig}
          transition={transition}
          onTransitionChange={setTransition}
          onRefreshImages={refreshImages}
          onForceRefreshImages={forceRefreshImages}
        />
      )}

      {/* Calendar Modal */}
      {showCalendar && settings.enableCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {translations[settings.language]?.selectDate || 'Select a date'}
              </h3>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={translations[settings.language]?.close || 'Close'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Calendar Component */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <CalendarPopin 
                initialDate={calendarInitialDate} 
                firstDayOfWeek={settings.firstDayOfWeek}
                language={settings.language}
                events={settings.calendarEvents || []}
                onSelectDate={(date) => {
                  // Store the selected date
                  localStorage.setItem('selectedDate', date.toISOString());
                  
                  // Don't auto-close the calendar - let users manually close it
                  // This provides better UX for browsing and selecting dates
                }} 
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowCalendar(false)} 
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                {translations[settings.language]?.close || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModularApp;
