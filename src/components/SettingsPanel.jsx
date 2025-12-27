import React, { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getAllAvailableImages, clearImageCache, addImageToList, removeImageFromList, deleteImage } from '../utils/imageUtils';

const SettingsPanel = memo(({ 
  settings, 
  translations, 
  onSave, 
  onReset, 
  onClose,
  transition,
  onTransitionChange,
  onRefreshImages,
  onForceRefreshImages
}) => {
  const t = translations[settings.language] || translations.en;
  const [activeTab, setActiveTab] = useState('general');
  
  // State for add event form
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  
  // Edit event state
  const [editingEventIndex, setEditingEventIndex] = useState(null);
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventDescription, setEditEventDescription] = useState('');

  // Images state
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  // Add event function
  const addEvent = () => {
    if (newEventDate && newEventTitle.trim()) {
      const newEvent = {
        date: newEventDate,
        title: newEventTitle.trim(),
        description: newEventDescription.trim()
      };
      
      settings.setCalendarEvents([...settings.calendarEvents, newEvent]);
      
      // Reset form
      setNewEventDate('');
      setNewEventTitle('');
      setNewEventDescription('');
      setShowAddEventForm(false);
    }
  };

  // Edit event functions
  const startEditEvent = (index) => {
    const event = settings.calendarEvents[index];
    setEditingEventIndex(index);
    setEditEventDate(event.date);
    setEditEventTitle(event.title);
    setEditEventDescription(event.description || '');
  };

  const saveEditEvent = () => {
    if (editEventDate && editEventTitle.trim()) {
      const updatedEvents = [...settings.calendarEvents];
      updatedEvents[editingEventIndex] = {
        date: editEventDate,
        title: editEventTitle.trim(),
        description: editEventDescription.trim()
      };
      
      settings.setCalendarEvents(updatedEvents);
      
      // Reset edit form
      setEditingEventIndex(null);
      setEditEventDate('');
      setEditEventTitle('');
      setEditEventDescription('');
    }
  };

  const cancelEditEvent = () => {
    setEditingEventIndex(null);
    setEditEventDate('');
    setEditEventTitle('');
    setEditEventDescription('');
  };

  // Fetch images function
  const fetchImages = useCallback(async () => {
    setImagesLoading(true);
    try {
      // Try Express API first (for full development mode)
      try {
        const response = await fetch('/api/images');
        if (response.ok) {
          const imageList = await response.json();
          // Convert Express API format to simple filename array
          const imageNames = imageList.map(img => img.name || img);
          setImages(imageNames);
          // Also refresh the main app's image list
          if (onRefreshImages) {
            onRefreshImages();
          }
          return;
        }
      } catch {
        // Express API not available, fall back to client-side detection
      }
      
      // Fallback to client-side detection (for Vite-only mode)
      const imageList = await getAllAvailableImages();
      setImages(imageList);
      // Also refresh the main app's image list
      if (onRefreshImages) {
        onRefreshImages();
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
    } finally {
      setImagesLoading(false);
    }
  }, [onRefreshImages]);

  // Fetch images when Images tab is opened
  React.useEffect(() => {
    if (activeTab === 'images') {
      fetchImages();
    }
  }, [activeTab, fetchImages]);

  // Export settings as JSON
  const exportSettings = () => {
    const exportData = {
      debug: false,
      language: settings.language,
      theme: settings.theme,
      imageDisplayMode: settings.imageDisplayMode,
      transition: {
        type: transition?.type || 'fade',
        duration: transition?.duration || 1000
      },
      showImageCounter: settings.showImageCounter,
      showCountdown: settings.showCountdown,
      countdownPosition: settings.countdownPosition,
      imageCounterPosition: settings.imageCounterPosition,
      uiControlsPosition: settings.uiControlsPosition,
      rotationTime: settings.rotationTime,
      weather: {
        show: settings.showWeather,
        location: settings.weatherLocation || "",
        coordinates: {
          lat: settings.weatherCoordinates?.lat || 0,
          lon: settings.weatherCoordinates?.lon || 0
        },
        forecastMode: settings.forecastMode || "smart",
        position: settings.weatherPosition,
        unit: settings.weatherUnit,
        size: settings.weatherSize,
        apiKey: settings.weatherApiKey || "",
        refreshInterval: settings.weatherRefreshInterval || 60,
        showAirQuality: settings.showAirQuality,
        showCountdown: settings.showWeatherCountdown
      },
      timeDisplay: {
        show: settings.showTime,
        format24h: settings.timeFormat24h,
        showSeconds: settings.showSeconds,
        position: settings.timeDisplay?.position || 'center',
        size: settings.timeDisplay?.size || 'size-8',
        timer: {
          enabled: settings.timerEnabled,
          type: settings.timerType,
          countdownHours: settings.countdownHours || 0,
          countdownMinutes: settings.countdownMinutes || 0,
          countdownSeconds: settings.countdownSeconds || 0,
          position: "below",
          timeoutBlinkDuration: settings.timerTimeoutBlinkDuration || 10,
          countdownFontSize: settings.countdownFontSize,
          chronometerFontSize: settings.chronometerFontSize
        }
      },
      dateDisplay: {
        show: settings.showDate,
        format: settings.dateDisplay?.format || 'DD/MM/YYYY',
        position: settings.dateDisplay?.position || 'center',
        size: settings.dateDisplay?.size || 'size-1',
        enableCalendar: settings.enableCalendar,
        firstDayOfWeek: settings.firstDayOfWeek,
        calendarEvents: settings.calendarEvents || []
      }
    };

    // Create and download the JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `photoframe-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  // Import settings from JSON file
  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            
            // Apply imported settings
            if (importedData.language !== undefined) settings.setLanguage(importedData.language);
            if (importedData.theme !== undefined) settings.setTheme(importedData.theme);
            if (importedData.imageDisplayMode !== undefined) settings.setImageDisplayMode(importedData.imageDisplayMode);
            if (importedData.showImageCounter !== undefined) settings.setShowImageCounter(importedData.showImageCounter);
            if (importedData.showCountdown !== undefined) settings.setShowCountdown(importedData.showCountdown);
            if (importedData.countdownPosition !== undefined) settings.setCountdownPosition(importedData.countdownPosition);
            if (importedData.imageCounterPosition !== undefined) settings.setImageCounterPosition(importedData.imageCounterPosition);
            if (importedData.uiControlsPosition !== undefined) settings.setUiControlsPosition(importedData.uiControlsPosition);
            if (importedData.rotationTime !== undefined) settings.setRotationTime(importedData.rotationTime);
            
            // Weather settings
            if (importedData.weather) {
              if (importedData.weather.show !== undefined) settings.setShowWeather(importedData.weather.show);
              if (importedData.weather.position !== undefined) settings.setWeatherPosition(importedData.weather.position);
              if (importedData.weather.unit !== undefined) settings.setWeatherUnit(importedData.weather.unit);
              if (importedData.weather.size !== undefined) settings.setWeatherSize(importedData.weather.size);
              if (importedData.weather.showAirQuality !== undefined) settings.setShowAirQuality(importedData.weather.showAirQuality);
              if (importedData.weather.showCountdown !== undefined) settings.setShowWeatherCountdown(importedData.weather.showCountdown);
              if (importedData.weather.location !== undefined) settings.setWeatherLocation(importedData.weather.location);
              if (importedData.weather.coordinates !== undefined) settings.setWeatherCoordinates(importedData.weather.coordinates);
              if (importedData.weather.forecastMode !== undefined) settings.setForecastMode(importedData.weather.forecastMode);
              if (importedData.weather.refreshInterval !== undefined) settings.setWeatherRefreshInterval(importedData.weather.refreshInterval);
            }
            
            // Time settings
            if (importedData.timeDisplay) {
              if (importedData.timeDisplay.show !== undefined) settings.setShowTime(importedData.timeDisplay.show);
              if (importedData.timeDisplay.format24h !== undefined) settings.setTimeFormat24h(importedData.timeDisplay.format24h);
              if (importedData.timeDisplay.showSeconds !== undefined) settings.setShowSeconds(importedData.timeDisplay.showSeconds);
              
              // Update timeDisplay object for position and size
              if (importedData.timeDisplay.position !== undefined || importedData.timeDisplay.size !== undefined) {
                settings.setTimeDisplay(prev => ({
                  ...prev,
                  ...(importedData.timeDisplay.position !== undefined && { position: importedData.timeDisplay.position }),
                  ...(importedData.timeDisplay.size !== undefined && { size: importedData.timeDisplay.size })
                }));
              }
              
              // Timer settings
              if (importedData.timeDisplay.timer) {
                if (importedData.timeDisplay.timer.enabled !== undefined) settings.setTimerEnabled(importedData.timeDisplay.timer.enabled);
                if (importedData.timeDisplay.timer.type !== undefined) settings.setTimerType(importedData.timeDisplay.timer.type);
                if (importedData.timeDisplay.timer.countdownHours !== undefined) settings.setCountdownHours(importedData.timeDisplay.timer.countdownHours);
                if (importedData.timeDisplay.timer.countdownMinutes !== undefined) settings.setCountdownMinutes(importedData.timeDisplay.timer.countdownMinutes);
                if (importedData.timeDisplay.timer.countdownSeconds !== undefined) settings.setCountdownSeconds(importedData.timeDisplay.timer.countdownSeconds);
                if (importedData.timeDisplay.timer.timeoutBlinkDuration !== undefined) settings.setTimerTimeoutBlinkDuration(importedData.timeDisplay.timer.timeoutBlinkDuration);
                if (importedData.timeDisplay.timer.countdownFontSize !== undefined) settings.setCountdownFontSize(importedData.timeDisplay.timer.countdownFontSize);
                if (importedData.timeDisplay.timer.chronometerFontSize !== undefined) settings.setChronometerFontSize(importedData.timeDisplay.timer.chronometerFontSize);
              }
            }
            
            // Date settings
            if (importedData.dateDisplay) {
              if (importedData.dateDisplay.show !== undefined) settings.setShowDate(importedData.dateDisplay.show);
              if (importedData.dateDisplay.enableCalendar !== undefined) settings.setEnableCalendar(importedData.dateDisplay.enableCalendar);
              if (importedData.dateDisplay.firstDayOfWeek !== undefined) settings.setFirstDayOfWeek(importedData.dateDisplay.firstDayOfWeek);
              if (importedData.dateDisplay.calendarEvents !== undefined) settings.setCalendarEvents(importedData.dateDisplay.calendarEvents);
              
              // Update dateDisplay object for format, position and size
              if (importedData.dateDisplay.format !== undefined || 
                  importedData.dateDisplay.position !== undefined || 
                  importedData.dateDisplay.size !== undefined) {
                settings.setDateDisplay(prev => ({
                  ...prev,
                  ...(importedData.dateDisplay.format !== undefined && { format: importedData.dateDisplay.format }),
                  ...(importedData.dateDisplay.position !== undefined && { position: importedData.dateDisplay.position }),
                  ...(importedData.dateDisplay.size !== undefined && { size: importedData.dateDisplay.size })
                }));
              }
            }
            
            // Transition settings
            if (importedData.transition && onTransitionChange) {
              onTransitionChange(importedData.transition);
            }
            
            alert(t.importSettingsSuccess || 'Settings imported successfully!');
          } catch (error) {
            alert(t.importSettingsError || 'Error importing settings: Invalid JSON file');
            console.error('Import error:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Handle file upload
  const _handleImageUpload = useCallback(async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setImagesLoading(true);
    const uploadedImages = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Not an image file`);
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max 10MB)`);
        continue;
      }

      try {
        // For development without server, we'll just add to the list
        // In a real scenario, you'd upload to the server first
        const filename = file.name;
        addImageToList(filename);
        uploadedImages.push(filename);
        
        // Create a temporary URL for preview (optional)
        const url = URL.createObjectURL(file);
        console.log(`Image ${filename} would be uploaded. Preview URL: ${url}`);
        
      } catch (_error) {
        errors.push(`${file.name}: Upload failed`);
      }
    }

    // Update the images list
    await fetchImages();

    // Show results
    if (uploadedImages.length > 0) {
      alert(`Successfully added ${uploadedImages.length} image(s) to the list:\n${uploadedImages.join('\n')}\n\nNote: For full functionality, manually copy these files to public/photos directory.`);
    }
    
    if (errors.length > 0) {
      alert(`Some files had errors:\n${errors.join('\n')}`);
    }

    setImagesLoading(false);
    
    // Reset file input
    event.target.value = '';
  }, [fetchImages]);

  // Handle image deletion
  const _handleImageDelete = useCallback(async (imageName) => {
    if (!confirm(`Are you sure you want to remove "${imageName}" from the slideshow?`)) {
      return;
    }

    setImagesLoading(true);
    
    try {
      // Remove from the list
      removeImageFromList(imageName);
      
      // Attempt to delete from server (will fail gracefully if no server)
      const result = await deleteImage(imageName);
      
      if (!result.success) {
        alert(`Removed "${imageName}" from slideshow list.\n\nNote: To completely remove the file, manually delete it from public/photos directory.`);
      } else {
        alert(`Successfully deleted "${imageName}"`);
      }
      
      // Update the images list
      await fetchImages();
      
    } catch (error) {
      console.error('Error deleting image:', error);
      alert(`Error removing "${imageName}": ${error.message}`);
    }
    
    setImagesLoading(false);
  }, [fetchImages]);

  // Helper functions for rotation time slider scaling
  const getRotationTimeSliderValue = (seconds) => {
    // Convert seconds to a slider position (0-100)
    if (seconds <= 60) {
      // 10-60 seconds: linear scale (positions 0-25)
      return Math.round(((seconds - 10) / 50) * 25);
    } else if (seconds <= 600) {
      // 1-10 minutes: positions 25-50
      const minutes = seconds / 60;
      return Math.round(25 + ((minutes - 1) / 9) * 25);
    } else if (seconds <= 3600) {
      // 10-60 minutes: positions 50-75
      const minutes = seconds / 60;
      return Math.round(50 + ((minutes - 10) / 50) * 25);
    } else {
      // 60-120 minutes: positions 75-100
      const minutes = seconds / 60;
      return Math.round(75 + ((minutes - 60) / 60) * 25);
    }
  };

  const getRotationTimeFromSliderValue = (sliderValue) => {
    // Convert slider position (0-100) to seconds
    if (sliderValue <= 25) {
      // 10-60 seconds
      return Math.round(10 + (sliderValue / 25) * 50);
    } else if (sliderValue <= 50) {
      // 1-10 minutes
      const progress = (sliderValue - 25) / 25;
      return Math.round((1 + progress * 9) * 60);
    } else if (sliderValue <= 75) {
      // 10-60 minutes
      const progress = (sliderValue - 50) / 25;
      return Math.round((10 + progress * 50) * 60);
    } else {
      // 60-120 minutes
      const progress = (sliderValue - 75) / 25;
      return Math.round((60 + progress * 60) * 60);
    }
  };

  const formatRotationTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.round(seconds / 60);
      return `${minutes}min`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.round((seconds % 3600) / 60);
      if (minutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${minutes}min`;
    }
  };

  // Define available tabs with categories
  const tabCategories = [
    {
      id: 'general',
      label: t.general || 'General',
      icon: '⚙️',
      always: true,
      items: [
        { id: 'basic', label: t.basicSettings || 'Basic Settings' },
        { id: 'effects', label: t.effectsSettings || 'Effects' },
        { id: 'images', label: t.imagesSettings || 'Images' },
        { id: 'uicontrols', label: t.uiControlsSettings || 'UI Controls' },
        { id: 'activation', label: t.featuresActivation || 'Features activation' }
      ]
    },
    {
      id: 'features',
      label: t.features || 'Features',
      icon: '🎯',
      condition: settings.showTime || settings.showDate || settings.showWeather || settings.enableCalendar || settings.timerEnabled || settings.showCountdown || settings.showImageCounter,
      items: [
        { id: 'time', label: t.timeSettings || 'Time', condition: settings.showTime },
        { id: 'date', label: t.dateSettings || 'Date', condition: settings.showDate },
        { id: 'countdown', label: t.countdownSettings || 'Countdown', condition: settings.showCountdown },
        { id: 'imagecounter', label: t.imageCounterSettings || 'Image Counter', condition: settings.showImageCounter },
        { id: 'weather', label: t.weatherSettings || 'Weather', condition: settings.showWeather },
        { id: 'calendar', label: t.calendarSettings || 'Calendar', condition: settings.showDate && settings.enableCalendar },
        { id: 'timer', label: t.timerSettings || 'Timer', condition: settings.timerEnabled }
      ].filter(item => item.condition === undefined || item.condition)
    }
  ].filter(category => category.always || (category.condition && category.items.length > 0));

  // Reset to first available tab if current tab is no longer available
  React.useEffect(() => {
    const allItems = tabCategories.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.id })));
    if (!allItems.find(item => item.id === activeTab)) {
      setActiveTab(allItems[0]?.id || 'basic');
    }
  }, [tabCategories, activeTab]);

  return (
    <div className="config-overlay fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="config-panel modern-panel">
        {/* Modern Header */}
        <div className="modern-panel-header">
          <div className="header-content">
            <div className="header-title">
              <h2 className="panel-title">{t.settings}</h2>
              <p className="panel-subtitle">{t.configureYourPhotoframe || 'Configure your photoframe settings'}</p>
            </div>
            <div className="header-actions">
              <button
                onClick={onReset}
                className="btn btn-secondary"
                title={t.resetToDefaults}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t.reset || 'Reset'}
              </button>
              <button
                onClick={importSettings}
                className="btn btn-secondary"
                title={t.importSettingsTooltip || 'Import Settings'}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                {t.import || 'Import'}
              </button>
              <button
                onClick={exportSettings}
                className="btn btn-secondary"
                title={t.exportSettingsTooltip || 'Export Settings'}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t.export || 'Export'}
              </button>
              <button
                onClick={onSave}
                className="btn btn-primary"
                title={t.saveChanges}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.save || 'Save'}
              </button>
              <button 
                onClick={onClose}
                className="btn btn-icon"
                aria-label={t.close}
                title={t.close}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Left Sidebar + Right Content Layout */}
        <div className="settings-layout">
          {/* Left Sidebar */}
          <div className="settings-sidebar">
            <nav className="sidebar-nav" aria-label="Settings navigation">
              {tabCategories.map((category) => (
                <div key={category.id} className="nav-category">
                  <div className="category-header">
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-title">{category.label}</span>
                  </div>
                  <div className="category-items">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                      >
                        <span className="nav-item-label">{item.label}</span>
                        {activeTab === item.id && <div className="active-indicator" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="settings-content">
            <div className="content-wrapper">

          {/* Basic Settings (General) */}
          {activeTab === 'basic' && (
            <div className="tab-content">
              <div className="section-header">
                <h3 className="section-title">{t.general}</h3>
                <p className="section-description">{t.generalDescription || 'Configure basic application settings'}</p>
              </div>
              
              <div className="form-grid">
                {/* Language */}
                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    {t.language}
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => settings.setLanguage(e.target.value)}
                    className="form-select"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="it">🇮🇹 Italiano</option>
                    <option value="ja">🇯🇵 日本語</option>
                    <option value="zh">🇨🇳 中文</option>
                  </select>
                </div>

                {/* Theme */}
                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                    {t.theme}
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => settings.setTheme(e.target.value)}
                    className="form-select"
                  >
                    <option value="dark">🌙 Dark</option>
                    <option value="light">☀️ Light</option>
                    <option value="blue">💙 Blue</option>
                    <option value="green">💚 Green</option>
                    <option value="red">❤️ Red</option>
                    <option value="purple">💜 Purple</option>
                    <option value="orange">🧡 Orange</option>
                    <option value="pink">💗 Pink</option>
                  </select>
                </div>
              </div>

              {/* Slideshow Settings */}
              <div className="section-group">
                <h4 className="subsection-title">{t.slideshow || 'Slideshow'}</h4>
                <div className="form-row">
                  <div className="form-group w-full">
                    <label className="form-label">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.slideDuration}
                    </label>
                    <div className="slider-container">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={getRotationTimeSliderValue(settings.rotationTime)}
                        onChange={(e) => settings.setRotationTime(getRotationTimeFromSliderValue(parseInt(e.target.value)))}
                        className="form-slider"
                      />
                      <span className="slider-value">{formatRotationTime(settings.rotationTime)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {t.rotationTimeRange || 'Range: 10 seconds to 120 minutes'}
                    </div>
                    <div className="mt-3">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {t.quickPresets || 'Quick Presets:'}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => settings.setRotationTime(30)}
                          className={`px-3 py-1.5 text-xs rounded transition-all ${
                            settings.rotationTime === 30 
                              ? 'bg-blue-500 text-white shadow-md' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          30s
                        </button>
                        <button
                          type="button"
                          onClick={() => settings.setRotationTime(60)}
                          className={`px-3 py-1.5 text-xs rounded transition-all ${
                            settings.rotationTime === 60 
                              ? 'bg-blue-500 text-white shadow-md' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          1m
                        </button>
                        <button
                          type="button"
                          onClick={() => settings.setRotationTime(300)}
                          className={`px-3 py-1.5 text-xs rounded transition-all ${
                            settings.rotationTime === 300 
                              ? 'bg-blue-500 text-white shadow-md' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          5m
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Display Mode */}
                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t.displayMode}
                  </label>
                  <select
                    value={settings.imageDisplayMode || 'fit'}
                    onChange={(e) => settings.setImageDisplayMode(e.target.value)}
                    className="form-select"
                  >
                    <option value="original">📐 {t.original || 'Original'}</option>
                    <option value="adjust">🔧 {t.adjust || 'Adjust'}</option>
                    <option value="fit">📱 {t.fit || 'Fit'}</option>
                  </select>
                  <p className="form-description">{t.displayModeDescription}</p>
                </div>
              </div>
            </div>
          )}

          {/* Images Settings */}
          {activeTab === 'images' && (
            <div className="tab-content">
              <div className="section-header">
                <h3 className="section-title">{t.imagesSettings || 'Images'}</h3>
                <p className="section-description">{t.imagesSettingsDescription || 'View and manage your photo collection'}</p>
              </div>

              {/* DEV-ONLY: Upload form (works only with Express or custom dev API) */}
              <div className="mb-4">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fileInput = e.target.elements.imageFile;
                    if (!fileInput.files.length) return;
                    const file = fileInput.files[0];
                    // Try to upload via dev API (if available)
                    try {
                      const formData = new FormData();
                      formData.append('image', file);
                      const res = await fetch('/api/upload-image', {
                        method: 'POST',
                        body: formData
                      });
                      if (res.ok) {
                        fetchImages();
                        fileInput.value = '';
                      } else {
                        alert('Image upload is only available in development mode with Express API running.');
                      }
                    } catch {
                      alert('Image upload is only available in development mode with Express API running.');
                    }
                  }}
                  className="flex items-center gap-2"
                  encType="multipart/form-data"
                >
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    className="form-input"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                  >
                    {t.uploadImage || 'Upload Image'}
                  </button>
                  <span className="text-xs text-gray-400">{t.devOnly || '(Dev Only)'}</span>
                </form>
              </div>

              <div className="form-grid">
                {/* Images Count */}
                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Total Images
                  </label>
                  <div className="text-lg font-semibold text-blue-600">
                    {imagesLoading ? 'Loading...' : `${images.length} image${images.length !== 1 ? 's' : ''}`}
                  </div>
                </div>

                {/* Refresh Button */}
                <div className="form-group">
                  <button
                    onClick={() => {
                      // Use force refresh to clear cache and scan thoroughly
                      if (onForceRefreshImages) {
                        onForceRefreshImages();
                      } else {
                        // Fallback to local refresh with cache clear
                        clearImageCache();
                        fetchImages();
                      }
                    }}
                    disabled={imagesLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {imagesLoading ? (t.scanning || 'Scanning...') : (t.scanForImages || 'Scan for Images')}
                  </button>
                </div>
              </div>

              {/* Images Grid */}
              {!imagesLoading && images.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2m0 0V9a2 2 0 012-2m0 0a2 2 0 012-2h10a2 2 0 012 2M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" />
                    </svg>
                    {t.imageThumbnails || 'Image Thumbnails'}
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-96 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
                        title={image}
                      >
                        <img
                          src={`/photos/${image}`}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkwyMCAyNEwyOCAxNiIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KPC9zdmc+';
                          }}
                        />
                        {/* Delete Button (dev only) */}
                        <button
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 z-10"
                          title="Delete image (dev only)"
                          onClick={async () => {
                            if (!window.confirm(`Delete image '${image}'? This cannot be undone.`)) return;
                            try {
                              const res = await fetch(`/api/delete-image?name=${encodeURIComponent(image)}`, { method: 'DELETE' });
                              if (res.ok) {
                                fetchImages();
                              } else {
                                alert('Image delete is only available in development mode with Express API running.');
                              }
                            } catch {
                              alert('Image delete is only available in development mode with Express API running.');
                            }
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <div className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-75 px-2 py-1 rounded">
                            {image}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{t.deleteAndUploadDevMode || 'Delete and upload only work in dev mode with Express API running.'}</div>
                </div>
              )}

              {/* No Images Message */}
              {!imagesLoading && images.length === 0 && (
                <div className="mt-6 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Found</h3>
                  <p className="text-gray-500 mb-4">
                    Add images to the <code className="bg-gray-100 px-2 py-1 rounded">public/photos</code> directory to display them in the slideshow.
                  </p>
                  <p className="text-sm text-gray-400">
                    Supported formats: JPG, JPEG, PNG, GIF, WebP
                  </p>
                  <p className="text-xs text-yellow-500 mt-2">To upload or delete images from the browser, run <code>npm run dev:full</code> to start the Express API server.</p>
                </div>
              )}
            </div>
          )}

          {/* UI Controls Tab */}
          {activeTab === 'uicontrols' && (
            <div className="tab-content">
              <div className="section-header">
                <h3 className="section-title">{t.uiControlsSettings || 'UI Controls Settings'}</h3>
                <p className="section-description">{t.uiControlsPositionDescription || 'Choose where to display the settings and fullscreen buttons'}</p>
              </div>
              
              <div className="form-grid">
                {/* UI Controls Position */}
                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    {t.uiControlsPosition || 'UI Controls Position'}
                  </label>
                  <div className="position-grid">
                    {[
                      { pos: 'top-left', defaultLabel: '↖️' },
                      { pos: 'top-center', defaultLabel: '⬆️' },
                      { pos: 'top-right', defaultLabel: '↗️' },
                      { pos: 'center-left', defaultLabel: '⬅️' },
                      { pos: 'center', defaultLabel: '⭕' },
                      { pos: 'center-right', defaultLabel: '➡️' },
                      { pos: 'bottom-left', defaultLabel: '↙️' },
                      { pos: 'bottom-center', defaultLabel: '⬇️' },
                      { pos: 'bottom-right', defaultLabel: '↘️' }
                    ].map(({ pos, defaultLabel }) => {
                      const isSelected = settings.uiControlsPosition === pos;
                      const isCenter = pos === 'center';
                      
                      let displayContent;
                      if (isCenter) {
                        // Center position always shows blue circle, with red overlay if selected
                        displayContent = (
                          <div className="position-center-only">
                            {isSelected && <div className="position-center-selected" />}
                          </div>
                        );
                      } else if (isSelected) {
                        // Non-center selected positions show red circle with blue center
                        displayContent = <div className="position-center-indicator" />;
                      } else {
                        // Non-center unselected positions show directional arrow
                        displayContent = defaultLabel;
                      }
                      
                      return (
                        <button
                          key={pos}
                          onClick={() => settings.setUiControlsPosition(pos)}
                          className={`position-btn ${isSelected ? 'active' : ''}`}
                          title={pos.replace('-', ' ')}
                        >
                          {displayContent}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Activation */}
          {activeTab === 'activation' && (
            <div className="tab-content">
              <div className="section-header">
                <h3 className="section-title">{t.features || 'Features'}</h3>
                <p className="section-description">Enable or disable application features</p>
              </div>
              
              <div className="toggle-grid">
                <div className="toggle-item">
                  <div className="toggle-content">
                    <div className="toggle-info">
                      <span className="toggle-label">{t.showTime}</span>
                      <span className="toggle-description">{t.showTimeDescription || 'Display current time on screen'}</span>
                    </div>
                    <label className="modern-toggle" aria-label={t.showTime}>
                      <input
                        type="checkbox"
                        checked={settings.showTime}
                        onChange={(e) => settings.setShowTime(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="toggle-item">
                  <div className="toggle-content">
                    <div className="toggle-info">
                      <span className="toggle-label">{t.showDate}</span>
                      <span className="toggle-description">{t.showDateDescription || 'Display current date on screen'}</span>
                    </div>
                    <label className="modern-toggle" aria-label={t.showDate}>
                      <input
                        type="checkbox"
                        checked={settings.showDate}
                        onChange={(e) => settings.setShowDate(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="toggle-item">
                  <div className="toggle-content">
                    <div className="toggle-info">
                      <span className="toggle-label">{t.showImageCounter}</span>
                      <span className="toggle-description">{t.showImageCounterDescription || 'Show image counter display'}</span>
                    </div>
                    <label className="modern-toggle" aria-label={t.showImageCounter}>
                      <input
                        type="checkbox"
                        checked={settings.showImageCounter}
                        onChange={(e) => settings.setShowImageCounter(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="toggle-item">
                  <div className="toggle-content">
                    <div className="toggle-info">
                      <span className="toggle-label">{t.showCountdown}</span>
                      <span className="toggle-description">{t.showCountdownDescription || 'Show countdown to next image'}</span>
                    </div>
                    <label className="modern-toggle" aria-label={t.showCountdown}>
                      <input
                        type="checkbox"
                        checked={settings.showCountdown}
                        onChange={(e) => settings.setShowCountdown(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="toggle-item">
                  <div className="toggle-content">
                    <div className="toggle-info">
                      <span className="toggle-label">{t.enableCalendar}</span>
                      <span className="toggle-description">{t.enableCalendarDescription || 'Enable calendar events and displays'}</span>
                    </div>
                    <label className="modern-toggle" aria-label={t.enableCalendar}>
                      <input
                        type="checkbox"
                        checked={settings.enableCalendar}
                        onChange={(e) => settings.setEnableCalendar(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="toggle-item">
                  <div className="toggle-content">
                    <div className="toggle-info">
                      <span className="toggle-label">{t.timerEnabled}</span>
                      <span className="toggle-description">{t.timerEnabledDescription || 'Enable timer and chronometer functionality'}</span>
                    </div>
                    <label className="modern-toggle" aria-label={t.timerEnabled}>
                      <input
                        type="checkbox"
                        checked={settings.timerEnabled}
                        onChange={(e) => settings.setTimerEnabled(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="toggle-item">
                  <div className="toggle-content">
                    <div className="toggle-info">
                      <span className="toggle-label">{t.showWeather}</span>
                      <span className="toggle-description">{t.showWeatherDescription || 'Display weather information on screen'}</span>
                    </div>
                    <label className="modern-toggle" aria-label={t.showWeather}>
                      <input
                        type="checkbox"
                        checked={settings.showWeather}
                        onChange={(e) => settings.setShowWeather(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Time Settings */}
          {activeTab === 'time' && settings.showTime && (
            <div className="tab-content">
              <div className="section-header">
                <h3 className="section-title">{t.timeSettings}</h3>
                <p className="section-description">{t.timeSettingsDescription || 'Configure time display options'}</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t.timeFormat || 'Time Format'}
                  </label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="timeFormat"
                        checked={!settings.timeFormat24h}
                        onChange={() => settings.setTimeFormat24h(false)}
                        className="form-radio"
                      />
                      <span className="radio-label">🕐 {t.timeFormat12h || '12-hour'}</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="timeFormat"
                        checked={settings.timeFormat24h}
                        onChange={() => settings.setTimeFormat24h(true)}
                        className="form-radio"
                      />
                      <span className="radio-label">🕐 {t.timeFormat24h || '24-hour'}</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t.displayOptions || 'Display Options'}
                  </label>
                  <div className="toggle-list">
                    <label className="modern-toggle-item">
                      <span className="toggle-label">{t.showSeconds || 'Show seconds'}</span>
                      <label className="modern-toggle">
                        <input
                          type="checkbox"
                          checked={settings.showSeconds}
                          onChange={(e) => settings.setShowSeconds(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    {t.position || 'Position'}
                  </label>
                  <div className="position-grid">
                    {[
                      { pos: 'top-left', defaultLabel: '↖️' },
                      { pos: 'top-center', defaultLabel: '⬆️' },
                      { pos: 'top-right', defaultLabel: '↗️' },
                      { pos: 'center-left', defaultLabel: '⬅️' },
                      { pos: 'center', defaultLabel: '⭕' },
                      { pos: 'center-right', defaultLabel: '➡️' },
                      { pos: 'bottom-left', defaultLabel: '↙️' },
                      { pos: 'bottom-center', defaultLabel: '⬇️' },
                      { pos: 'bottom-right', defaultLabel: '↘️' }
                    ].map(({ pos, defaultLabel }) => {
                      const isSelected = settings.timeDisplay.position === pos;
                      const isCenter = pos === 'center';
                      
                      let displayContent;
                      if (isCenter) {
                        // Center position always shows blue circle, with red overlay if selected
                        displayContent = (
                          <div className="position-center-only">
                            {isSelected && <div className="position-center-selected" />}
                          </div>
                        );
                      } else if (isSelected) {
                        // Non-center selected positions show red circle with blue center
                        displayContent = <div className="position-center-indicator" />;
                      } else {
                        // Non-center unselected positions show directional arrow
                        displayContent = defaultLabel;
                      }
                      
                      return (
                        <button
                          key={pos}
                          onClick={() => settings.setTimeDisplay({ ...settings.timeDisplay, position: pos })}
                          className={`position-btn ${isSelected ? 'active' : ''}`}
                          title={pos.replace('-', ' ')}
                        >
                          {displayContent}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                    {t.size || 'Size'}
                  </label>
                  <select
                    value={settings.timeDisplay.size}
                    onChange={(e) => settings.setTimeDisplay({ ...settings.timeDisplay, size: e.target.value })}
                    className="form-select"
                  >
                    <option value="size-1">🔤 {t.sizes?.['size-1'] || 'Size 1 (3rem)'}</option>
                    <option value="size-2">🔤 {t.sizes?.['size-2'] || 'Size 2 (4.7rem)'}</option>
                    <option value="size-3">🔤 {t.sizes?.['size-3'] || 'Size 3 (6.4rem)'}</option>
                    <option value="size-4">🔤 {t.sizes?.['size-4'] || 'Size 4 (8.1rem)'}</option>
                    <option value="size-5">🔤 {t.sizes?.['size-5'] || 'Size 5 (9.8rem)'}</option>
                    <option value="size-6">🔤 {t.sizes?.['size-6'] || 'Size 6 (11.5rem)'}</option>
                    <option value="size-7">🔤 {t.sizes?.['size-7'] || 'Size 7 (13.2rem)'}</option>
                    <option value="size-8">🔤 {t.sizes?.['size-8'] || 'Size 8 (15rem)'}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Date Settings */}
          {activeTab === 'date' && settings.showDate && (
            <div className="tab-content">
              <div className="section-header">
                <h3 className="section-title">{t.dateSettings}</h3>
                <p className="section-description">{t.dateSettingsDescription || 'Configure date display options'}</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t.dateFormat || 'Date Format'}
                  </label>
                  <select
                    value={settings.dateDisplay.format}
                    onChange={(e) => settings.setDateDisplay({ ...settings.dateDisplay, format: e.target.value })}
                    className="form-select"
                  >
                    <option value="EEEE, MMMM d, yyyy">📅 {t.dateFormats?.['EEEE, MMMM d, yyyy'] || 'Full - Monday, January 1, 2025'}</option>
                    <option value="MMMM d, yyyy">📅 {t.dateFormats?.['MMMM d, yyyy'] || 'Long - January 1, 2025'}</option>
                    <option value="MMM d, yyyy">📅 {t.dateFormats?.['MMM d, yyyy'] || 'Medium - Jan 1, 2025'}</option>
                    <option value="MM/dd/yyyy">📅 {t.dateFormats?.['MM/dd/yyyy'] || 'Short US - 01/01/2025'}</option>
                    <option value="dd/MM/yyyy">📅 {t.dateFormats?.['dd/MM/yyyy'] || 'Short EU - 01/01/2025'}</option>
                    <option value="yyyy-MM-dd">📅 {t.dateFormats?.['yyyy-MM-dd'] || 'ISO - 2025-01-01'}</option>
                    <option value="EEEE, MMM d, yyyy">📅 {t.dateFormats?.['EEEE, MMM d, yyyy'] || 'Day + Short - Monday, Jan 1, 2025'}</option>
                    <option value="EEEE, d MMMM yyyy">📅 {t.dateFormats?.['EEEE, d MMMM yyyy'] || 'European - Monday, 1 January 2025'}</option>
                    <option value="d MMMM yyyy">📅 {t.dateFormats?.['d MMMM yyyy'] || 'European Short - 1 January 2025'}</option>
                    <option value="MMM d">📅 {t.dateFormats?.['MMM d'] || 'Month Day - Jan 1'}</option>
                    <option value="MMMM d">📅 {t.dateFormats?.['MMMM d'] || 'Full Month Day - January 1'}</option>
                    <option value="EEEE">📅 {t.dateFormats?.['EEEE'] || 'Day Only - Monday'}</option>
                    <option value="MMMM yyyy">📅 {t.dateFormats?.['MMMM yyyy'] || 'Month Year - January 2025'}</option>
                    <option value="MMM yyyy">📅 {t.dateFormats?.['MMM yyyy'] || 'Short Month Year - Jan 2025'}</option>
                  </select>
                  <div className="text-xs text-gray-500 mt-1">
                    {t.dateFormatPreview || 'Preview will update based on your selection'}
                  </div>
                  <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t.preview || 'Preview'}: </span>
                    <span className="font-medium">
                      {(() => {
                        const now = new Date();
                        const getDateFormatOptions = (format) => {
                          const formatMap = {
                            'EEEE, MMMM d, yyyy': { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
                            'MMMM d, yyyy': { year: 'numeric', month: 'long', day: 'numeric' },
                            'MMM d, yyyy': { year: 'numeric', month: 'short', day: 'numeric' },
                            'MM/dd/yyyy': { year: 'numeric', month: '2-digit', day: '2-digit' },
                            'dd/MM/yyyy': { year: 'numeric', month: '2-digit', day: '2-digit' },
                            'yyyy-MM-dd': { year: 'numeric', month: '2-digit', day: '2-digit' },
                            'EEEE, MMM d, yyyy': { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' },
                            'EEEE, d MMMM yyyy': { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
                            'd MMMM yyyy': { year: 'numeric', month: 'long', day: 'numeric' },
                            'MMM d': { month: 'short', day: 'numeric' },
                            'MMMM d': { month: 'long', day: 'numeric' },
                            'EEEE': { weekday: 'long' },
                            'MMMM yyyy': { year: 'numeric', month: 'long' },
                            'MMM yyyy': { year: 'numeric', month: 'short' }
                          };
                          return formatMap[format] || { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                        };
                        try {
                          const formatOptions = getDateFormatOptions(settings.dateDisplay.format);
                          return now.toLocaleDateString(settings.language, formatOptions);
                        } catch {
                          return 'Invalid format';
                        }
                      })()}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    {t.position || 'Position'}
                  </label>
                  <div className="position-grid">
                    {[
                      { pos: 'top-left', defaultLabel: '↖️' },
                      { pos: 'top-center', defaultLabel: '⬆️' },
                      { pos: 'top-right', defaultLabel: '↗️' },
                      { pos: 'center-left', defaultLabel: '⬅️' },
                      { pos: 'center', defaultLabel: '⭕' },
                      { pos: 'center-right', defaultLabel: '➡️' },
                      { pos: 'bottom-left', defaultLabel: '↙️' },
                      { pos: 'bottom-center', defaultLabel: '⬇️' },
                      { pos: 'bottom-right', defaultLabel: '↘️' }
                    ].map(({ pos, defaultLabel }) => {
                      const isSelected = settings.dateDisplay.position === pos;
                      const isCenter = pos === 'center';
                      
                      let displayContent;
                      if (isCenter) {
                        // Center position always shows blue circle, with red overlay if selected
                        displayContent = (
                          <div className="position-center-only">
                            {isSelected && <div className="position-center-selected" />}
                          </div>
                        );
                      } else if (isSelected) {
                        // Non-center selected positions show red circle with blue center
                        displayContent = <div className="position-center-indicator" />;
                      } else {
                        // Non-center unselected positions show directional arrow
                        displayContent = defaultLabel;
                      }
                      
                      return (
                        <button
                          key={pos}
                          onClick={() => settings.setDateDisplay({ ...settings.dateDisplay, position: pos })}
                          className={`position-btn ${isSelected ? 'active' : ''}`}
                          title={pos.replace('-', ' ')}
                        >
                          {displayContent}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                    {t.size || 'Size'}
                  </label>
                  <select
                    value={settings.dateDisplay.size}
                    onChange={(e) => settings.setDateDisplay({ ...settings.dateDisplay, size: e.target.value })}
                    className="form-select"
                  >
                    <option value="size-1">🔤 {t.sizes?.['size-1'] || 'Size 1 (3rem)'}</option>
                    <option value="size-2">🔤 {t.sizes?.['size-2'] || 'Size 2 (4.7rem)'}</option>
                    <option value="size-3">🔤 {t.sizes?.['size-3'] || 'Size 3 (6.4rem)'}</option>
                    <option value="size-4">🔤 {t.sizes?.['size-4'] || 'Size 4 (8.1rem)'}</option>
                    <option value="size-5">🔤 {t.sizes?.['size-5'] || 'Size 5 (9.8rem)'}</option>
                    <option value="size-6">🔤 {t.sizes?.['size-6'] || 'Size 6 (11.5rem)'}</option>
                    <option value="size-7">🔤 {t.sizes?.['size-7'] || 'Size 7 (13.2rem)'}</option>
                    <option value="size-8">🔤 {t.sizes?.['size-8'] || 'Size 8 (15rem)'}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Settings */}
          {activeTab === 'calendar' && settings.showDate && settings.enableCalendar && (
            <div className="tab-content">
              <div className="section-header">
                <h3 className="section-title">{t.calendarSettings}</h3>
                <p className="section-description">{t.calendarSettingsDescription || 'Configure calendar options'}</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t.firstDayOfWeek || 'First day of week'}
                  </label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="firstDayOfWeek"
                        checked={settings.firstDayOfWeek === 0}
                        onChange={() => settings.setFirstDayOfWeek(0)}
                        className="form-radio"
                      />
                      <span className="radio-label">📅 {t.sunday || 'Sunday'}</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="firstDayOfWeek"
                        checked={settings.firstDayOfWeek === 1}
                        onChange={() => settings.setFirstDayOfWeek(1)}
                        className="form-radio"
                      />
                      <span className="radio-label">📅 {t.monday || 'Monday'}</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {t.calendarEvents || 'Calendar Events'}
                  </label>
                  <div className="info-box">
                    <p className="text-sm text-muted-foreground">
                      {settings.calendarEvents.length > 0 
                        ? `${settings.calendarEvents.length} ${t.eventsStored || 'events stored'}`
                        : t.noEventsStored || 'No events stored'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.calendarEventsHelp || 'Click on dates to add or manage events'}
                    </p>
                  </div>
                  
                  {/* Events List */}
                  {settings.calendarEvents.length > 0 && (
                    <div className="events-list mt-4">
                      <h4 className="text-sm font-medium mb-3 text-foreground">{t.storedEvents || 'Stored Events'}</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {settings.calendarEvents.map((event, index) => (
                          <div key={index} className="event-item p-3 rounded-lg border border-border bg-card">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="font-medium text-sm text-foreground">{event.title}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  📅 {new Date(event.date).toLocaleDateString(settings.language === 'en' ? 'en-US' : settings.language === 'es' ? 'es-ES' : settings.language === 'fr' ? 'fr-FR' : settings.language === 'de' ? 'de-DE' : settings.language === 'it' ? 'it-IT' : settings.language === 'zh' ? 'zh-CN' : settings.language === 'ja' ? 'ja-JP' : 'en-US')}
                                </div>
                                {event.description && (
                                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {event.description}
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <button
                                  onClick={() => startEditEvent(index)}
                                  className="p-1 text-muted-foreground hover:text-primary transition-colors"
                                  title={t.edit || 'Edit'}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4l4 4-8 8H8v-4l8-8z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    const newEvents = settings.calendarEvents.filter((_, i) => i !== index);
                                    settings.setCalendarEvents(newEvents);
                                  }}
                                  className="ml-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                                  title="Delete event"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add Event Form */}
          {activeTab === 'calendar' && showAddEventForm && (
            <div className="tab-content">
              <div className="section-header">
                <h3 className="section-title">{t.addEvent}</h3>
                <p className="section-description">{t.addEventDescription || 'Add a new event to the calendar'}</p>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t.eventDate}
                    </label>
                    <input
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t.eventTitle}
                    </label>
                    <input
                      type="text"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      placeholder="Event title"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t.eventDescription}
                    </label>
                    <textarea
                      value={newEventDescription}
                      onChange={(e) => setNewEventDescription(e.target.value)}
                      placeholder="Event description"
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={addEvent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {t.addEventButton}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddEventForm(false);
                        setNewEventDate('');
                        setNewEventTitle('');
                        setNewEventDescription('');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Event Form */}
          {activeTab === 'calendar' && editingEventIndex !== null && (
            <div className="tab-content">
              <div className="section-header">
                <h3 className="section-title">{t.editEvent}</h3>
                <p className="section-description">{t.editEventDescription || 'Edit the event details'}</p>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t.eventDate}
                    </label>
                    <input
                      type="date"
                      value={editEventDate}
                      onChange={(e) => setEditEventDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t.eventTitle}
                    </label>
                    <input
                      type="text"
                      value={editEventTitle}
                      onChange={(e) => setEditEventTitle(e.target.value)}
                      placeholder="Event title"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t.eventDescription}
                    </label>
                    <textarea
                      value={editEventDescription}
                      onChange={(e) => setEditEventDescription(e.target.value)}
                      placeholder="Event description"
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={saveEditEvent}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      {t.saveChanges}
                    </button>
                    <button
                      onClick={cancelEditEvent}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Event Button */}
          {activeTab === 'calendar' && !showAddEventForm && (
            <div className="tab-content">
              <div className="border-t pt-4 mt-4">
                <button
                  onClick={() => setShowAddEventForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t.addEvent}
                </button>
              </div>
            </div>
          )}

          {/* Effects Tab */}
          {activeTab === 'effects' && (
            <div className="tab-content">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {t.effectsSettings || 'Effects Settings'}
              </h3>

              {/* Transition Effects */}
              <div className="form-group">
                <label className="form-label">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  {t.transitionEffect || 'Transition Effect'}
                </label>
                <select
                  value={transition?.type || 'fade'}
                  onChange={(e) => onTransitionChange({ ...transition, type: e.target.value })}
                  className="form-select"
                >
                  <option value="fade">✨ {t.transitions?.fade || 'Fade'}</option>
                  <option value="slide-right">➡️ {t.transitions?.['slide-right'] || 'Slide Right'}</option>
                  <option value="slide-left">⬅️ {t.transitions?.['slide-left'] || 'Slide Left'}</option>
                  <option value="slide-up">⬆️ {t.transitions?.['slide-up'] || 'Slide Up'}</option>
                  <option value="slide-down">⬇️ {t.transitions?.['slide-down'] || 'Slide Down'}</option>
                  <option value="zoom-in">🔍 {t.transitions?.['zoom-in'] || 'Zoom In'}</option>
                  <option value="zoom-out">🔎 {t.transitions?.['zoom-out'] || 'Zoom Out'}</option>
                  <option value="rotate">🔄 {t.transitions?.rotate || 'Rotate'}</option>
                  <option value="flip">🔀 {t.transitions?.flip || 'Flip'}</option>
                  <option value="blur">🌫️ {t.transitions?.blur || 'Blur'}</option>
                </select>
              </div>

              {/* Transition Duration */}
              <div className="form-group">
                <label className="form-label">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t.transitionDuration || 'Transition Duration'}
                </label>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={transition?.duration || 1000}
                  onChange={(e) => onTransitionChange({ ...transition, duration: parseInt(e.target.value) })}
                  className="form-range"
                />
                <span className="form-range-value">{transition?.duration || 1000}ms</span>
              </div>
            </div>
          )}

          {/* Weather Tab */}
          {activeTab === 'weather' && settings.showWeather && (
            <div className="tab-content">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                {t.weatherSettings || 'Weather Settings'}
              </h3>

              {/* Weather API Key */}
              <div className="form-group">
                <label className="form-label">
                  {t.weatherApiKey || 'Weather API Key'}
                </label>
                <input
                  type="text"
                  value={settings.weatherApiKey || ''}
                  onChange={(e) => settings.setWeatherApiKey(e.target.value)}
                  placeholder="Enter OpenWeatherMap API key"
                  className="form-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.weatherApiKeyHelp || 'Get a free API key from openweathermap.org'}
                </p>
              </div>

              {/* Weather Location */}
              <div className="form-group">
                <label className="form-label">
                  {t.weatherLocation || 'Location'}
                </label>
                <input
                  type="text"
                  value={settings.weatherLocation || ''}
                  onChange={(e) => settings.setWeatherLocation(e.target.value)}
                  placeholder={t.enterCityName || 'Enter city name'}
                  className="form-input"
                />
              </div>

              {/* Weather Coordinates */}
              <div className="form-group">
                <label className="form-label">
                  {t.weatherCoordinates || 'Coordinates (Optional)'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-sm">
                      {t.latitude || 'Latitude'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={settings.weatherCoordinates?.lat || ''}
                      onChange={(e) => settings.setWeatherCoordinates({
                        ...settings.weatherCoordinates,
                        lat: parseFloat(e.target.value) || 0
                      })}
                      placeholder="e.g. 40.7128"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label text-sm">
                      {t.longitude || 'Longitude'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={settings.weatherCoordinates?.lon || ''}
                      onChange={(e) => settings.setWeatherCoordinates({
                        ...settings.weatherCoordinates,
                        lon: parseFloat(e.target.value) || 0
                      })}
                      placeholder="e.g. -74.0060"
                      className="form-input"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t.weatherCoordinatesHelp || 'Use coordinates for more precise weather data. Leave empty to use city name.'}
                </p>
              </div>

              {/* Weather Unit */}
              <div className="form-group">
                <label className="form-label">
                  {t.weatherUnit || 'Temperature Unit'}
                </label>
                <select
                  value={settings.weatherUnit}
                  onChange={(e) => settings.setWeatherUnit(e.target.value)}
                  className="form-select"
                >
                  <option value="metric">{t.celsius || 'Celsius (°C)'}</option>
                  <option value="imperial">{t.fahrenheit || 'Fahrenheit (°F)'}</option>
                  <option value="kelvin">{t.kelvin || 'Kelvin (K)'}</option>
                </select>
              </div>

              {/* Weather Position */}
              <div className="form-group">
                <label className="form-label">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  {t.position || 'Position'}
                </label>
                <div className="position-grid">
                  {[
                    { pos: 'top-left', defaultLabel: '↖️' },
                    { pos: 'top-center', defaultLabel: '⬆️' },
                    { pos: 'top-right', defaultLabel: '↗️' },
                    { pos: 'center-left', defaultLabel: '⬅️' },
                    { pos: 'center', defaultLabel: '⭕' },
                    { pos: 'center-right', defaultLabel: '➡️' },
                    { pos: 'bottom-left', defaultLabel: '↙️' },
                    { pos: 'bottom-center', defaultLabel: '⬇️' },
                    { pos: 'bottom-right', defaultLabel: '↘️' }
                  ].map(({ pos, defaultLabel }) => {
                    const isSelected = settings.weatherPosition === pos;
                    const isCenter = pos === 'center';
                    
                    let displayContent;
                    if (isCenter) {
                      // Center position always shows blue circle, with red overlay if selected
                      displayContent = (
                        <div className="position-center-only">
                          {isSelected && <div className="position-center-selected" />}
                        </div>
                      );
                    } else if (isSelected) {
                      // Non-center selected positions show red circle with blue center
                      displayContent = <div className="position-center-indicator" />;
                    } else {
                      // Non-center unselected positions show directional arrow
                      displayContent = defaultLabel;
                    }
                    
                    return (
                      <button
                        key={pos}
                        onClick={() => settings.setWeatherPosition(pos)}
                        className={`position-btn ${isSelected ? 'active' : ''}`}
                        title={pos.replace('-', ' ')}
                      >
                        {displayContent}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weather Size */}
              <div className="form-group">
                <label className="form-label">
                  {t.textSize || 'Text Size'}
                </label>
                <select
                  value={settings.weatherSize}
                  onChange={(e) => settings.setWeatherSize(e.target.value)}
                  className="form-select"
                >
                  {Object.entries(t.sizes || {}).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Weather Refresh Interval */}
              <div className="form-group">
                <label className="form-label">
                  {t.refreshInterval || 'Refresh Interval'}: {settings.weatherRefreshInterval || 60} {t.minutes || 'minutes'}
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={settings.weatherRefreshInterval || 60}
                  onChange={(e) => settings.setWeatherRefreshInterval(parseInt(e.target.value))}
                  className="form-range"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 min</span>
                  <span>120 min</span>
                </div>
              </div>
            </div>
          )}

          {/* Countdown Tab */}
          {activeTab === 'countdown' && settings.showCountdown && (
            <div className="tab-content">
              <div className="section-header">
                <h3 className="section-title">{t.countdownSettings || 'Countdown Settings'}</h3>
                <p className="section-description">{t.countdownPositionDescription || 'Choose where to display the image countdown timer'}</p>
              </div>
              
              <div className="form-grid">
                {/* Countdown Position */}
                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    {t.countdownPosition || 'Countdown Position'}
                  </label>
                  <div className="position-grid">
                    {[
                      { pos: 'top-left', defaultLabel: '↖️' },
                      { pos: 'top-center', defaultLabel: '⬆️' },
                      { pos: 'top-right', defaultLabel: '↗️' },
                      { pos: 'center-left', defaultLabel: '⬅️' },
                      { pos: 'center', defaultLabel: '⭕' },
                      { pos: 'center-right', defaultLabel: '➡️' },
                      { pos: 'bottom-left', defaultLabel: '↙️' },
                      { pos: 'bottom-center', defaultLabel: '⬇️' },
                      { pos: 'bottom-right', defaultLabel: '↘️' }
                    ].map(({ pos, defaultLabel }) => {
                      const isSelected = settings.countdownPosition === pos;
                      const isCenter = pos === 'center';
                      
                      let displayContent;
                      if (isCenter) {
                        // Center position always shows blue circle, with red overlay if selected
                        displayContent = (
                          <div className="position-center-only">
                            {isSelected && <div className="position-center-selected" />}
                          </div>
                        );
                      } else if (isSelected) {
                        // Non-center selected positions show red circle with blue center
                        displayContent = <div className="position-center-indicator" />;
                      } else {
                        // Non-center unselected positions show directional arrow
                        displayContent = defaultLabel;
                      }
                      
                      return (
                        <button
                          key={pos}
                          onClick={() => settings.setCountdownPosition(pos)}
                          className={`position-btn ${isSelected ? 'active' : ''}`}
                          title={pos.replace('-', ' ')}
                        >
                          {displayContent}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Counter Tab */}
          {activeTab === 'imagecounter' && settings.showImageCounter && (
            <div className="tab-content">
              <div className="section-header">
                <h3 className="section-title">{t.imageCounterSettings || 'Image Counter Settings'}</h3>
                <p className="section-description">{t.imageCounterPositionDescription || 'Choose where to display the image counter'}</p>
              </div>
              
              <div className="form-grid">
                {/* Image Counter Position */}
                <div className="form-group">
                  <label className="form-label">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    {t.imageCounterPosition || 'Image Counter Position'}
                  </label>
                  <div className="position-grid">
                    {[
                      { pos: 'top-left', defaultLabel: '↖️' },
                      { pos: 'top-center', defaultLabel: '⬆️' },
                      { pos: 'top-right', defaultLabel: '↗️' },
                      { pos: 'center-left', defaultLabel: '⬅️' },
                      { pos: 'center', defaultLabel: '⭕' },
                      { pos: 'center-right', defaultLabel: '➡️' },
                      { pos: 'bottom-left', defaultLabel: '↙️' },
                      { pos: 'bottom-center', defaultLabel: '⬇️' },
                      { pos: 'bottom-right', defaultLabel: '↘️' }
                    ].map(({ pos, defaultLabel }) => {
                      const isSelected = settings.imageCounterPosition === pos;
                      const isCenter = pos === 'center';
                      
                      let displayContent;
                      if (isCenter) {
                        // Center position always shows blue circle, with red overlay if selected
                        displayContent = (
                          <div className="position-center-only">
                            {isSelected && <div className="position-center-selected" />}
                          </div>
                        );
                      } else if (isSelected) {
                        // Non-center selected positions show red circle with blue center
                        displayContent = <div className="position-center-indicator" />;
                      } else {
                        // Non-center unselected positions show directional arrow
                        displayContent = defaultLabel;
                      }
                      
                      return (
                        <button
                          key={pos}
                          onClick={() => settings.setImageCounterPosition(pos)}
                          className={`position-btn ${isSelected ? 'active' : ''}`}
                          title={pos.replace('-', ' ')}
                        >
                          {displayContent}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timer Tab */}
          {activeTab === 'timer' && settings.timerEnabled && (
            <div className="tab-content">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.timerSettings || 'Timer Settings'}
              </h3>

              {/* Timer Type */}
              <div className="form-group">
                <label className="form-label">
                  {t.timerType || 'Timer Type'}
                </label>
                <select
                  value={settings.timerType}
                  onChange={(e) => settings.setTimerType(e.target.value)}
                  className="form-select"
                >
                  <option value="countdown">{t.countdown || 'Countdown'}</option>
                  <option value="chronometer">{t.chronometer || 'Chronometer'}</option>
                </select>
              </div>

              {/* Countdown Settings (when timer type is countdown) */}
              {settings.timerType === 'countdown' && (
                <>
                  {/* Countdown Time Inputs */}
                  <div className="form-group">
                    <label className="form-label">
                      {t.countdownDuration || 'Countdown Duration'}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="form-label text-sm">
                          {t.hours || 'Hours'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={settings.countdownHours || 0}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            settings.setCountdownHours(newValue);
                            // Auto-save is handled by useSettings hook dependency array
                          }}
                          onKeyDown={(e) => {
                            // Prevent settings panel from closing when using arrow keys
                            e.stopPropagation();
                          }}
                          className="form-input text-center"
                        />
                      </div>
                      <div>
                        <label className="form-label text-sm">
                          {t.minutes || 'Minutes'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={settings.countdownMinutes || 0}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            settings.setCountdownMinutes(newValue);
                            // Auto-save is handled by useSettings hook dependency array
                          }}
                          onKeyDown={(e) => {
                            // Prevent settings panel from closing when using arrow keys
                            e.stopPropagation();
                          }}
                          className="form-input text-center"
                        />
                      </div>
                      <div>
                        <label className="form-label text-sm">
                          {t.seconds || 'Seconds'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={settings.countdownSeconds || 0}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            settings.setCountdownSeconds(newValue);
                            // Auto-save is handled by useSettings hook dependency array
                          }}
                          onKeyDown={(e) => {
                            // Prevent settings panel from closing when using arrow keys
                            e.stopPropagation();
                          }}
                          className="form-input text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Countdown Presets */}
                  <div className="form-group">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {t.quickPresets || 'Quick Presets:'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          settings.setCountdownHours(0);
                          settings.setCountdownMinutes(3);
                          settings.setCountdownSeconds(0);
                          // Auto-save is handled by useSettings hook dependency array
                        }}
                        className={`px-3 py-1.5 text-xs rounded transition-all ${
                          settings.countdownHours === 0 && settings.countdownMinutes === 3 && settings.countdownSeconds === 0
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        3min
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          settings.setCountdownHours(0);
                          settings.setCountdownMinutes(5);
                          settings.setCountdownSeconds(0);
                          // Auto-save is handled by useSettings hook dependency array
                        }}
                        className={`px-3 py-1.5 text-xs rounded transition-all ${
                          settings.countdownHours === 0 && settings.countdownMinutes === 5 && settings.countdownSeconds === 0
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        5min
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          settings.setCountdownHours(0);
                          settings.setCountdownMinutes(10);
                          settings.setCountdownSeconds(0);
                          // Auto-save is handled by useSettings hook dependency array
                        }}
                        className={`px-3 py-1.5 text-xs rounded transition-all ${
                          settings.countdownHours === 0 && settings.countdownMinutes === 10 && settings.countdownSeconds === 0
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        10min
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          settings.setCountdownHours(0);
                          settings.setCountdownMinutes(15);
                          settings.setCountdownSeconds(0);
                          // Auto-save is handled by useSettings hook dependency array
                        }}
                        className={`px-3 py-1.5 text-xs rounded transition-all ${
                          settings.countdownHours === 0 && settings.countdownMinutes === 15 && settings.countdownSeconds === 0
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        15min
                      </button>
                    </div>
                  </div>

                  {/* Timeout Blink Duration */}
                  <div className="form-group">
                    <label className="form-label">
                      {t.timeoutBlinkDuration || 'Timeout Blink Duration'}: {settings.timerTimeoutBlinkDuration || 10}s
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={settings.timerTimeoutBlinkDuration || 10}
                      onChange={(e) => settings.setTimerTimeoutBlinkDuration(parseInt(e.target.value))}
                      className="form-range"
                    />
                  </div>

                  {/* Countdown Font Size */}
                  <div className="form-group">
                    <label className="form-label">
                      {t.fontSize || 'Font Size'}
                    </label>
                    <select
                      value={settings.countdownFontSize}
                      onChange={(e) => settings.setCountdownFontSize(e.target.value)}
                      className="form-select"
                    >
                      {Object.entries(t.sizes || {}).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Chronometer Settings (when timer type is chronometer) */}
              {settings.timerType === 'chronometer' && (
                <>
                  {/* Chronometer Font Size */}
                  <div className="form-group">
                    <label className="form-label">
                      {t.fontSize || 'Font Size'}
                    </label>
                    <select
                      value={settings.chronometerFontSize}
                      onChange={(e) => settings.setChronometerFontSize(e.target.value)}
                      className="form-select"
                    >
                      {Object.entries(t.sizes || {}).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
    </div>
  );
});

SettingsPanel.displayName = 'SettingsPanel';

SettingsPanel.propTypes = {
  settings: PropTypes.object.isRequired,
  translations: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  transition: PropTypes.object.isRequired,
  onTransitionChange: PropTypes.func.isRequired,
  onRefreshImages: PropTypes.func,
  onForceRefreshImages: PropTypes.func
};

export default SettingsPanel;
