import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Cog6ToothIcon, XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, CalendarIcon } from '@heroicons/react/24/outline';
import './App.css';
import defaultConfig from './config/defaults.json';
import CalendarPopin from './components/CalendarPopin';
import WeatherDisplay from './components/WeatherDisplay';
import { useWeatherData } from './hooks/useWeatherData';
import TimerDisplay from './components/TimerDisplay';

// Translation strings
const translations = {
  en: {
    settings: 'Slideshow Settings',
    general: 'General',
    theme: 'Theme',
    resetToDefaults: 'Reset to Defaults',
    saveChanges: 'Save Changes',
    resetToDefaultsTooltip: 'Reset all settings to their default values',
    saveChangesTooltip: 'Save all current settings',
    language: 'Language',
    showImageCounter: 'Show Image Counter',
    showCountdown: 'Show Countdown',
    rotationTime: 'Rotation Time',
    coordinates: 'Coordinates',
    coordinatesHelp: 'Used if location field is empty',
    enableCalendar: 'Enable Calendar Feature',
    selectDate: 'Select a date',
    firstDayOfWeek: 'First day of week',
    sunday: 'Sunday',
    monday: 'Monday',
    timeSettings: 'Time Settings',
    showTime: 'Show Time',
    timeFormat: 'Time Format',
    timeFormat12h: '12-hour',
    timeFormat24h: '24-hour',
    showSeconds: 'Show Seconds',
    timer: 'Timer',
    timerEnabled: 'Enable Timer',
    timerType: 'Timer Type',
    countdown: 'Countdown',
    chronometer: 'Chronometer',
    showTimerIcon: 'Show Timer Icon',
    countdownSettings: 'Countdown Settings',
    hoursLabel: 'Hours',
    minutesLabel: 'Minutes',
    secondsLabel: 'Seconds',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    timeOut: 'Time Out',
    timerComplete: 'Timer Complete!',
    timerTimeoutDuration: 'Timeout Blink Duration (seconds)',
    timerTimeoutDurationDescription: 'How long the timer blinks when it reaches zero',
    position: 'Position',
    size: 'Size',
    sizes: {
      'size-1': 'Size 1 (3rem)',
      'size-2': 'Size 2 (4.7rem)',
      'size-3': 'Size 3 (6.4rem)',
      'size-4': 'Size 4 (8.1rem)',
      'size-5': 'Size 5 (9.8rem)',
      'size-6': 'Size 6 (11.5rem)',
      'size-7': 'Size 7 (13.2rem)',
      'size-8': 'Size 8 (15rem)'
    },
    dateSettings: 'Date Settings',
    showDate: 'Show Date',
    format: 'Format',
    photo: 'Photo',
    nextIn: 'Next in',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    seconds: 'seconds',
    minutes: 'minutes',
    enterFullscreen: 'Enter fullscreen',
    exitFullscreen: 'Exit fullscreen',
    dateFormats: {
      'DD/MM/YYYY': 'DD/MM/YYYY',
      'MM/DD/YYYY': 'MM/DD/YYYY',
      'DD-MM-YYYY': 'DD-MM-YYYY',
      'DD/MM/YY': 'DD/MM/YY',
      'DD MMMM YYYY': 'DD Month YYYY'
    },
    imageDisplay: 'Image Display',
    displayMode: 'Display Mode',
    original: 'Original',
    adjust: 'Adjust',
    fit: 'Fit',
    displayModeDescription: 'Controls how images are displayed',
    originalDescription: 'Show images at their original size',
    adjustDescription: 'Fit image to screen while maintaining aspect ratio',
    fitDescription: 'Fill screen with image (may crop)',
    transitionEffect: 'Transition Effect',
    transitionDuration: 'Transition Duration',
    transitions: {
      fade: 'Fade',
      'slide-right': 'Slide Right',
      'slide-left': 'Slide Left',
      'slide-up': 'Slide Up',
      'slide-down': 'Slide Down',
      'zoom-in': 'Zoom In',
      'zoom-out': 'Zoom Out',
      rotate: 'Rotate',
      flip: 'Flip',
      blur: 'Blur'
    },
    weather: 'Weather',
    weatherSettings: 'Weather Settings',
    showWeather: 'Show Weather',
    location: 'Location',
    forecastMode: 'Forecast Mode',
    forecastModes: {
      today: 'Today',
      tomorrow: 'Tomorrow',
      smart: 'Smart (Today until noon, then Tomorrow)'
    },
    unit: 'Unit',
    units: {
      metric: 'Metric (°C)',
      imperial: 'Imperial (°F)'
    },
    currentWeather: 'Current Weather',
    forecast: 'Forecast',
    refreshInterval: 'Refresh Interval',
    weatherRefreshInterval: 'Weather Refresh Interval',
    showWeatherCountdown: 'Show Refresh Countdown',
    refreshWeatherNow: 'Refresh Weather Now',
    nextUpdate: 'Next update in',
    lastUpdated: 'Last updated',
    showAirQuality: 'Show Air Quality',
    airQuality: 'Air Quality',
    airQualityLevels: {
      good: 'Good',
      fair: 'Fair',
      moderate: 'Moderate',
      poor: 'Poor',
      veryPoor: 'Very Poor',
      unknown: 'Unknown'
    }
  },
  es: {
    settings: 'Configuración de Presentación',
    general: 'General',
    theme: 'Tema',
    resetToDefaults: 'Restablecer valores predeterminados',
    saveChanges: 'Guardar cambios',
    resetToDefaultsTooltip: 'Restablecer todos los ajustes a los valores predeterminados',
    saveChangesTooltip: 'Guardar todos los ajustes actuales',
    language: 'Idioma',
    showImageCounter: 'Mostrar Contador',
    showCountdown: 'Mostrar Cuenta Atrás',
    rotationTime: 'Tiempo de Rotación',
    coordinates: 'Coordenadas',
    coordinatesHelp: 'Se utiliza si el campo de ubicación está vacío',
    enableCalendar: 'Habilitar Función de Calendario',
    selectDate: 'Seleccionar una fecha',
    firstDayOfWeek: 'Primer día de la semana',
    sunday: 'Domingo',
    monday: 'Lunes',
    timeSettings: 'Configuración de Hora',
    showTime: 'Mostrar Hora',
    timeFormat: 'Formato de Hora',
    timeFormat12h: '12 horas',
    timeFormat24h: '24 horas',
    showSeconds: 'Mostrar Segundos',
    timer: 'Temporizador',
    timerEnabled: 'Activar Temporizador',
    timerType: 'Tipo de Temporizador',
    countdown: 'Cuenta Regresiva',
    chronometer: 'Cronómetro',
    showTimerIcon: 'Mostrar Icono de Temporizador',
    countdownSettings: 'Configuración de Cuenta Regresiva',
    hoursLabel: 'Horas',
    minutesLabel: 'Minutos',
    secondsLabel: 'Segundos',
    start: 'Iniciar',
    pause: 'Pausar',
    reset: 'Reiniciar',
    timeOut: 'Tiempo Agotado',
    timerComplete: '¡Temporizador Completado!',
    timerTimeoutDuration: 'Duración del parpadeo de tiempo agotado (segundos)',
    timerTimeoutDurationDescription: 'Cuánto tiempo parpadea el temporizador cuando llega a cero',
    position: 'Posición',
    size: 'Tamaño',
    sizes: {
      'size-1': 'Tamaño 1 (3rem)',
      'size-2': 'Tamaño 2 (4.7rem)',
      'size-3': 'Tamaño 3 (6.4rem)',
      'size-4': 'Tamaño 4 (8.1rem)',
      'size-5': 'Tamaño 5 (9.8rem)',
      'size-6': 'Tamaño 6 (11.5rem)',
      'size-7': 'Tamaño 7 (13.2rem)',
      'size-8': 'Tamaño 8 (15rem)'
    },
    dateSettings: 'Configuración de Fecha',
    showDate: 'Mostrar Fecha',
    format: 'Formato',
    photo: 'Foto',
    nextIn: 'Siguiente en',
    close: 'Cerrar',
    save: 'Guardar',
    cancel: 'Cancelar',
    seconds: 'segundos',
    minutes: 'minutos',
    enterFullscreen: 'Pantalla completa',
    exitFullscreen: 'Salir de pantalla completa',
    dateFormats: {
      'DD/MM/YYYY': 'DD/MM/AAAA',
      'MM/DD/YYYY': 'MM/DD/AAAA',
      'DD-MM-YYYY': 'DD-MM-AAAA',
      'DD/MM/YY': 'DD/MM/AA',
      'DD MMMM YYYY': 'DD de MMMM de YYYY'
    },
    imageDisplay: 'Visualización de Imágenes',
    displayMode: 'Modo de Visualización',
    original: 'Original',
    adjust: 'Ajustar',
    fit: 'Ajustar a Pantalla',
    displayModeDescription: 'Controla cómo se muestran las imágenes',
    originalDescription: 'Mostrar imágenes en su tamaño original',
    adjustDescription: 'Ajustar la imagen a la pantalla manteniendo la relación de aspecto',
    fitDescription: 'Llenar la pantalla con la imagen (puede recortar)',
    transitionEffect: 'Efecto de Transición',
    transitionDuration: 'Duración de la Transición',
    transitions: {
      fade: 'Desvanecer',
      'slide-right': 'Deslizar a la Derecha',
      'slide-left': 'Deslizar a la Izquierda',
      'slide-up': 'Deslizar hacia Arriba',
      'slide-down': 'Deslizar hacia Abajo',
      'zoom-in': 'Acercar',
      'zoom-out': 'Alejar',
      rotate: 'Rotar',
      flip: 'Voltear',
      blur: 'Difuminar'
    },
    weather: 'Clima',
    weatherSettings: 'Configuración del Clima',
    showWeather: 'Mostrar Clima',
    location: 'Ubicación',
    forecastMode: 'Modo de Pronóstico',
    forecastModes: {
      today: 'Hoy',
      tomorrow: 'Mañana',
      smart: 'Inteligente (Hoy hasta el mediodía, luego Mañana)'
    },
    unit: 'Unidad',
    units: {
      metric: 'Métrico (°C)',
      imperial: 'Imperial (°F)'
    },
    currentWeather: 'Meteo Actual',
    forecast: 'Pronóstico',
    refreshInterval: 'Intervalo de Actualización',
    weatherRefreshInterval: 'Intervalo de Actualización',
    showWeatherCountdown: 'Mostrar Cuenta Regresiva',
    refreshWeatherNow: 'Actualizar Clima Ahora',
    nextUpdate: 'Próxima actualización en',
    lastUpdated: 'Última actualización',
    showAirQuality: 'Mostrar Calidad del Aire',
    airQuality: 'Calidad del Aire',
    airQualityLevels: {
      good: 'Buena',
      fair: 'Aceptable',
      moderate: 'Moderada',
      poor: 'Mala',
      veryPoor: 'Muy Mala',
      unknown: 'Desconocida'
    }
  },
  it: {
    settings: 'Impostazioni Presentazione',
    general: 'Generale',
    theme: 'Tema',
    resetToDefaults: 'Ripristina impostazioni predefinite',
    saveChanges: 'Salva modifiche',
    resetToDefaultsTooltip: 'Ripristina tutte le impostazioni ai valori predefiniti',
    saveChangesTooltip: 'Salva tutte le impostazioni correnti',
    language: 'Lingua',
    showImageCounter: 'Mostra Contatore',
    showCountdown: 'Mostra Conto alla Rovescia',
    rotationTime: 'Tempo di Rotazione',
    enableCalendar: 'Abilita Funzione Calendario',
    selectDate: 'Seleziona una data',
    firstDayOfWeek: 'Primo giorno della settimana',
    sunday: 'Domenica',
    monday: 'Lunedì',
    timeSettings: 'Impostazioni Ora',
    showTime: 'Mostra Ora',
    timeFormat: 'Formato Ora',
    timeFormat12h: '12 ore',
    timeFormat24h: '24 ore',
    showSeconds: 'Mostra Secondi',
    position: 'Posizione',
    size: 'Dimensione',
    sizes: {
      small: 'Piccolo',
      medium: 'Medio',
      large: 'Grande',
      xlarge: 'Molto Grande',
      xxlarge: 'Extra Grande'
    },
    dateSettings: 'Impostazioni Data',
    showDate: 'Mostra Data',
    format: 'Formato',
    photo: 'Foto',
    nextIn: 'Prossima tra',
    close: 'Chiudi',
    save: 'Salva',
    cancel: 'Annulla',
    seconds: 'secondi',
    minutes: 'minuti',
    enterFullscreen: 'Schermo intero',
    exitFullscreen: 'Esci da schermo intero',
    dateFormats: {
      'DD/MM/YYYY': 'GG/MM/AAAA',
      'MM/DD/YYYY': 'MM/GG/AAAA',
      'DD-MM-YYYY': 'GG-MM-AAAA',
      'DD/MM/YY': 'GG/MM/AA',
      'DD MMMM YYYY': 'D MMMM YYYY'
    },
    imageDisplay: 'Visualizzazione Immagini',
    displayMode: 'Modalità Visualizzazione',
    original: 'Originale',
    adjust: 'Adatta',
    fit: 'Riempi Schermo',
    displayModeDescription: 'Controlla come vengono visualizzate le immagini',
    originalDescription: 'Mostra le immagini alla loro dimensione originale',
    adjustDescription: 'Adatta l\'immagine allo schermo mantenendo le proporzioni',
    fitDescription: 'Riempi lo schermo con l\'immagine (potrebbe essere ritagliata)',
    transitionEffect: 'Effetto di Transizione',
    transitionDuration: 'Durata della Transizione',
    transitions: {
      fade: 'Dissolvenza',
      'slide-right': 'Scorri a Destra',
      'slide-left': 'Scorri a Sinistra',
      'slide-up': 'Scorri Verso l\'Alto',
      'slide-down': 'Scorri Verso il Basso',
      'zoom-in': 'Zoom Avanti',
      'zoom-out': 'Zoom Indietro',
      rotate: 'Rotazione',
      flip: 'Capovolgimento',
      blur: 'Sfocatura'
    },
    weather: 'Meteo',
    weatherSettings: 'Impostazioni Meteo',
    showWeather: 'Mostra Meteo',
    location: 'Località',
    forecastMode: 'Modalità Previsioni',
    forecastModes: {
      today: 'Oggi',
      tomorrow: 'Domani',
      smart: 'Intelligente (Oggi fino a mezzogiorno, poi Domani)'
    },
    unit: 'Unità',
    units: {
      metric: 'Metrico (°C)',
      imperial: 'Imperiale (°F)'
    },
    currentWeather: 'Meteo Attuale',
    forecast: 'Previsioni',
    refreshInterval: 'Intervallo di Aggiornamento',
    weatherRefreshInterval: 'Intervallo di Aggiornamento',
    showWeatherCountdown: 'Mostra Conto alla Rovescia',
    refreshWeatherNow: 'Aggiorna Meteo Ora',
    nextUpdate: 'Prossimo aggiornamento in',
    lastUpdated: 'Ultimo aggiornamento',
    showAirQuality: 'Mostra Qualità dell\'Aria',
    airQuality: 'Qualità dell\'Aria',
    airQualityLevels: {
      good: 'Buona',
      fair: 'Discreta',
      moderate: 'Moderata',
      poor: 'Scadente',
      veryPoor: 'Molto Scadente',
      unknown: 'Sconosciuta'
    }
  },
  de: {
    settings: 'Diashow-Einstellungen',
    general: 'Allgemein',
    theme: 'Thema',
    resetToDefaults: 'Standardwerte wiederherstellen',
    saveChanges: 'Änderungen speichern',
    resetToDefaultsTooltip: 'Alle Einstellungen auf Standardwerte zurücksetzen',
    saveChangesTooltip: 'Aktuelle Einstellungen speichern',
    language: 'Sprache',
    showImageCounter: 'Bildzähler anzeigen',
    showCountdown: 'Countdown anzeigen',
    rotationTime: 'Wechselintervall',
    enableCalendar: 'Kalenderfunktion aktivieren',
    selectDate: 'Datum auswählen',
    firstDayOfWeek: 'Erster Tag der Woche',
    sunday: 'Sonntag',
    monday: 'Montag',
    timeSettings: 'Uhrzeit-Einstellungen',
    showTime: 'Uhrzeit anzeigen',
    timeFormat: 'Uhrzeit-Format',
    timeFormat12h: '12-Stunden',
    timeFormat24h: '24-Stunden',
    showSeconds: 'Sekunden anzeigen',
    position: 'Position',
    size: 'Größe',
    weather: 'Wetter',
    weatherSettings: 'Wetter-Einstellungen',
    showWeather: 'Wetter anzeigen',
    location: 'Standort',
    forecastMode: 'Vorhersage-Modus',
    forecastModes: {
      today: 'Heute',
      tomorrow: 'Morgen',
      smart: 'Intelligent (Heute bis Mittag, dann Morgen)'
    },
    unit: 'Einheit',
    units: {
      metric: 'Metrisch (°C)',
      imperial: 'Imperial (°F)'
    },
    currentWeather: 'Aktuelles Wetter',
    forecast: 'Vorhersage',
    refreshInterval: 'Aktualisierungsintervall',
    weatherRefreshInterval: 'Aktualisierungsintervall',
    showWeatherCountdown: 'Countdown anzeigen',
    refreshWeatherNow: 'Wetter jetzt aktualisieren',
    nextUpdate: 'Nächstes Update in',
    lastUpdated: 'Zuletzt aktualisiert',
    showAirQuality: 'Luftqualität anzeigen',
    airQuality: 'Luftqualität',
    airQualityLevels: {
      good: 'Gut',
      fair: 'Befriedigend',
      moderate: 'Mäßig',
      poor: 'Schlecht',
      veryPoor: 'Sehr Schlecht',
      unknown: 'Unbekannt'
    },
    sizes: {
      'size-1': 'Größe 1 (3rem)',
      'size-2': 'Größe 2 (4.7rem)',
      'size-3': 'Größe 3 (6.4rem)',
      'size-4': 'Größe 4 (8.1rem)',
      'size-5': 'Größe 5 (9.8rem)',
      'size-6': 'Größe 6 (11.5rem)',
      'size-7': 'Größe 7 (13.2rem)',
      'size-8': 'Größe 8 (15rem)'
    },
    dateSettings: 'Datums-Einstellungen',
    showDate: 'Datum anzeigen',
    format: 'Format',
    photo: 'Foto',
    nextIn: 'Nächstes in',
    close: 'Schließen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    seconds: 'Sekunden',
    minutes: 'Minuten',
    enterFullscreen: 'Vollbildmodus',
    exitFullscreen: 'Vollbildmodus beenden',
    dateFormats: {
      'DD/MM/YYYY': 'TT.MM.JJJJ',
      'MM/DD/YYYY': 'MM/TT/JJJJ',
      'DD-MM-YYYY': 'TT-MM-JJJJ',
      'DD/MM/YY': 'TT.MM.JJ',
      'DD MMMM YYYY': 'D. MMMM YYYY'
    },
    imageDisplay: 'Bildanzeige',
    displayMode: 'Anzeigemodus',
    original: 'Original',
    adjust: 'Anpassen',
    fit: 'Ausfüllen',
    displayModeDescription: 'Steuert die Bildanzeige',
    originalDescription: 'Bilder in Originalgröße anzeigen',
    adjustDescription: 'Bild an den Bildschirm anpassen, Seitenverhältnis beibehalten',
    fitDescription: 'Bildschirm mit Bild füllen (kann zugeschnitten werden)',
    transitionEffect: 'Übergangseffekt',
    transitionDuration: 'Übergangsdauer',
    transitions: {
      fade: 'Ausblenden',
      'slide-right': 'Nach rechts schieben',
      'slide-left': 'Nach links schieben',
      'slide-up': 'Nach oben schieben',
      'slide-down': 'Nach unten schieben',
      'zoom-in': 'Heranzoomen',
      'zoom-out': 'Herauszoomen',
      rotate: 'Drehen',
      flip: 'Umdrehen',
      blur: 'Weichzeichnen'
    }
  },
  zh: {
    settings: '幻灯片设置',
    general: '常规',
    theme: '主题',
    language: '语言',
    showImageCounter: '显示图片计数',
    showCountdown: '显示倒计时',
    rotationTime: '切换时间',
    enableCalendar: '启用日历功能',
    selectDate: '选择日期',
    firstDayOfWeek: '每周第一天',
    sunday: '星期日',
    monday: '星期一',
    timeSettings: '时间设置',
    weather: '天气',
    weatherSettings: '天气设置',
    showWeather: '显示天气',
    location: '位置',
    forecastMode: '预报模式',
    forecastModes: {
      today: '今天',
      tomorrow: '明天',
      smart: '智能（中午前显示今天，之后显示明天）'
    },
    unit: '单位',
    units: {
      metric: '公制 (°C)',
      imperial: '英制 (°F)'
    },
    currentWeather: '当前天气',
    forecast: '天气预报',
    refreshInterval: '刷新间隔',
    weatherRefreshInterval: '刷新间隔',
    showWeatherCountdown: '显示刷新倒计时',
    refreshWeatherNow: '立即刷新天气',
    nextUpdate: '下次更新于',
    lastUpdated: '上次更新',
    showAirQuality: '显示空气质量',
    airQuality: '空气质量',
    airQualityLevels: {
      good: '良好',
      fair: '一般',
      moderate: '中等',
      poor: '较差',
      veryPoor: '很差',
      unknown: '未知'
    },
    showTime: '显示时间',
    timeFormat: '时间格式',
    timeFormat12h: '12小时制',
    timeFormat24h: '24小时制',
    showSeconds: '显示秒数',
    position: '位置',
    size: '大小',
    sizes: {
      'size-1': '大小 1 (3rem)',
      'size-2': '大小 2 (4.7rem)',
      'size-3': '大小 3 (6.4rem)',
      'size-4': '大小 4 (8.1rem)',
      'size-5': '大小 5 (9.8rem)',
      'size-6': '大小 6 (11.5rem)',
      'size-7': '大小 7 (13.2rem)',
      'size-8': '大小 8 (15rem)'
    },
    dateSettings: '日期设置',
    showDate: '显示日期',
    format: '格式',
    photo: '照片',
    nextIn: '下一张',
    close: '关闭',
    save: '保存',
    cancel: '取消',
    seconds: '秒',
    minutes: '分钟',
    enterFullscreen: '全屏',
    exitFullscreen: '退出全屏',
    dateFormats: {
      'DD/MM/YYYY': 'DD/MM/YYYY',
      'MM/DD/YYYY': 'MM/DD/YYYY',
      'DD-MM-YYYY': 'DD-MM-YYYY',
      'DD/MM/YY': 'DD/MM/YY',
      'DD MMMM YYYY': 'YYYY年MM月DD日'
    },
    imageDisplay: '图像显示',
    displayMode: '显示模式',
    original: '原始',
    adjust: '调整',
    fit: '填充',
    displayModeDescription: '控制图像的显示方式',
    originalDescription: '以原始尺寸显示图像',
    adjustDescription: '调整图像大小以适合屏幕，保持宽高比',
    fitDescription: '填充屏幕（可能会裁剪图像）',
    transitionEffect: '过渡效果',
    transitionDuration: '过渡时间',
    transitions: {
      fade: '淡入淡出',
      'slide-right': '向右滑动',
      'slide-left': '向左滑动',
      'slide-up': '向上滑动',
      'slide-down': '向下滑动',
      'zoom-in': '放大',
      'zoom-out': '缩小',
      rotate: '旋转',
      flip: '翻转',
      blur: '模糊'
    }
  },
  ja: {
    settings: 'スライドショー設定',
    general: '一般',
    theme: 'テーマ',
    resetToDefaults: 'デフォルトにリセット',
    saveChanges: '変更を保存',
    resetToDefaultsTooltip: 'すべての設定をデフォルト値にリセットします',
    saveChangesTooltip: '現在の設定をすべて保存します',
    language: '言語',
    showImageCounter: '画像カウンターを表示',
    showCountdown: 'カウントダウンを表示',
    rotationTime: '切り替え時間',
    enableCalendar: 'カレンダー機能を有効にする',
    selectDate: '日付を選択',
    firstDayOfWeek: '週の最初の日',
    sunday: '日曜日',
    monday: '月曜日',
    timeSettings: '時間設定',
    showTime: '時間を表示',
    timeFormat: '時間形式',
    timeFormat12h: '12時間制',
    timeFormat24h: '24時間制',
    showSeconds: '秒を表示',
    position: '位置',
    size: 'サイズ',
    sizes: {
      small: '小',
      medium: '中',
      large: '大',
      xlarge: '特大',
      xxlarge: '超特大'
    },
    dateSettings: '日付設定',
    showDate: '日付を表示',
    format: '形式',
    photo: '写真',
    nextIn: '次へ',
    close: '閉じる',
    save: '保存',
    cancel: 'キャンセル',
    seconds: '秒',
    minutes: '分',
    enterFullscreen: '全画面表示',
    exitFullscreen: '全画面表示を終了',
    dateFormats: {
      'DD/MM/YYYY': 'DD/MM/YYYY',
      'MM/DD/YYYY': 'MM/DD/YYYY',
      'DD-MM-YYYY': 'DD-MM-YYYY',
      'DD/MM/YY': 'DD/MM/YY',
      'DD MMMM YYYY': 'YYYY年MM月DD日'
    },
    imageDisplay: '画像表示',
    displayMode: '表示モード',
    original: 'オリジナル',
    adjust: '調整',
    fit: 'フィット',
    displayModeDescription: '画像の表示方法を制御します',
    originalDescription: '画像を元のサイズで表示します',
    adjustDescription: 'アスペクト比を維持しながら画像を画面に合わせます',
    fitDescription: '画像で画面を埋めます（トリミングされる場合があります）',
    transitionEffect: 'トランジション効果',
    transitionDuration: 'トランジション時間',
    transitions: {
      fade: 'フェード',
      'slide-right': '右にスライド',
      'slide-left': '左にスライド',
      'slide-up': '上にスライド',
      'slide-down': '下にスライド',
      'zoom-in': 'ズームイン',
      'zoom-out': 'ズームアウト',
      rotate: '回転',
      flip: '反転',
      blur: 'ぼかし'
    }
  },
  fr: {
    settings: 'Paramètres du Diaporama',
    general: 'Général',
    theme: 'Thème',
    resetToDefaults: 'Réinitialiser les paramètres',
    saveChanges: 'Enregistrer les modifications',
    resetToDefaultsTooltip: 'Réinitialiser tous les paramètres aux valeurs par défaut',
    saveChangesTooltip: 'Enregistrer tous les paramètres actuels',
    language: 'Langue',
    showImageCounter: 'Afficher le compteur',
    showCountdown: 'Afficher le décompte',
    rotationTime: 'Temps de rotation',
    enableCalendar: 'Activer la fonction calendrier',
    selectDate: 'Sélectionner une date',
    firstDayOfWeek: 'Premier jour de la semaine',
    sunday: 'Dimanche',
    monday: 'Lundi',
    timeSettings: 'Paramètres de l\'heure',
    showTime: 'Afficher l\'heure',
    timeFormat: 'Format de l\'heure',
    timeFormat12h: '12 heures',
    timeFormat24h: '24 heures',
    showSeconds: 'Afficher les secondes',
    timer: 'Minuterie',
    timerEnabled: 'Activer la Minuterie',
    timerType: 'Type de Minuterie',
    countdown: 'Compte à Rebours',
    chronometer: 'Chronomètre',
    showTimerIcon: 'Afficher l\'Icône de Minuterie',
    countdownSettings: 'Réglages du Compte à Rebours',
    hoursLabel: 'Heures',
    minutesLabel: 'Minutes',
    secondsLabel: 'Secondes',
    start: 'Démarrer',
    pause: 'Pause',
    reset: 'Réinitialiser',
    timerComplete: 'Minuterie Terminée !',
    timerTimeoutDuration: 'Durée de transition',
    timerTimeoutDurationDescription: 'Durée pendant laquelle le minuteur clignote lorsqu\'il atteint zéro',
    position: 'Position',
    size: 'Taille',
    weather: 'Météo',
    weatherSettings: 'Paramètres de la Météo',
    showWeather: 'Afficher la Météo',
    location: 'Emplacement',
    coordinates: 'Coordonnées',
    coordinatesHelp: 'Utilisées si le champ d\'emplacement est vide',
    forecastMode: 'Mode de Prévision',
    forecastModes: {
      today: 'Aujourd\'hui',
      tomorrow: 'Demain',
      smart: 'Intelligent (Aujourd\'hui jusqu\'à midi, puis Demain)'
    },
    unit: 'Unité',
    units: {
      metric: 'Métrique (°C)',
      imperial: 'Impérial (°F)'
    },
    currentWeather: 'Météo Actuelle',
    forecast: 'Prévision',
    refreshInterval: 'Intervalle de Rafraîchissement',
    weatherRefreshInterval: 'Intervalle de Rafraîchissement',
    showWeatherCountdown: 'Afficher le Compte à Rebours',
    refreshWeatherNow: 'Actualiser la Météo Maintenant',
    nextUpdate: 'Prochaine mise à jour dans',
    lastUpdated: 'Dernière mise à jour',
    showAirQuality: 'Afficher la Qualité de l\'Air',
    airQuality: 'Qualité de l\'Air',
    airQualityLevels: {
      good: 'Bonne',
      fair: 'Correcte',
      moderate: 'Modérée',
      poor: 'Mauvaise',
      veryPoor: 'Très Mauvaise',
      unknown: 'Inconnue'
    },
    sizes: {
      'size-1': 'Taille 1 (3rem)',
      'size-2': 'Taille 2 (4.7rem)',
      'size-3': 'Taille 3 (6.4rem)',
      'size-4': 'Taille 4 (8.1rem)',
      'size-5': 'Taille 5 (9.8rem)',
      'size-6': 'Taille 6 (11.5rem)',
      'size-7': 'Taille 7 (13.2rem)',
      'size-8': 'Taille 8 (15rem)'
    },
    dateSettings: 'Paramètres de la date',
    showDate: 'Afficher la date',
    format: 'Format',
    photo: 'Photo',
    nextIn: 'Prochaine dans',
    close: 'Fermer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    seconds: 'secondes',
    minutes: 'minutes',
    enterFullscreen: 'Plein écran',
    exitFullscreen: 'Quitter le mode plein écran',
    dateFormats: {
      'DD/MM/YYYY': 'JJ/MM/AAAA',
      'MM/DD/YYYY': 'MM/JJ/AAAA',
      'DD-MM-YYYY': 'JJ-MM-AAAA',
      'DD/MM/YY': 'JJ/MM/AA',
      'DD MMMM YYYY': 'D MMMM YYYY'
    },
    imageDisplay: 'Affichage des images',
    displayMode: 'Mode d\'affichage',
    original: 'Original',
    adjust: 'Ajuster',
    fit: 'Remplir',
    displayModeDescription: 'Contrôle la façon dont les images sont affichées',
    originalDescription: 'Afficher les images à leur taille d\'origine',
    adjustDescription: 'Ajuster l\'image à l\'écran en conservant les proportions',
    fitDescription: 'Remplir l\'écran avec l\'image (peut être rognée)',
    transitionEffect: 'Effet de transition',
    transitionDuration: 'Durée de transition',
    transitions: {
      fade: 'Fondu',
      'slide-right': 'Glisser à droite',
      'slide-left': 'Glisser à gauche',
      'slide-up': 'Glisser vers le haut',
      'slide-down': 'Glisser vers le bas',
      'zoom-in': 'Zoom avant',
      'zoom-out': 'Zoom arrière',
      rotate: 'Rotation',
      flip: 'Retournement',
      blur: 'Flou'
    }
  }
};

// Function to fetch images from the server
const fetchImages = async () => {
  // In development, use the full URL to the API server
  const apiBase = import.meta.env.DEV 
    ? 'http://localhost:3001' 
    : '';
  const apiUrl = `${apiBase}/api/images`;
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter out any invalid or empty entries and ensure the data has the expected structure
    const validImages = Array.isArray(data) 
      ? data.filter(img => img && (img.url || img.path))
           .map(img => ({
             url: img.url || img.path,
             name: img.name || (img.path ? img.path.split('/').pop() : 'Image')
           }))
      : [];
    
    if (validImages.length > 0) {
      return validImages;
    }
    
    // Return sample images in the same format
    return [
      { url: 'https://source.unsplash.com/random/800x600?nature,1', name: 'Nature' },
      { url: 'https://source.unsplash.com/random/800x600?mountain,1', name: 'Mountain' },
      { url: 'https://source.unsplash.com/random/800x600?ocean,1', name: 'Ocean' },
      { url: 'https://source.unsplash.com/random/800x600?forest,1', name: 'Forest' },
      { url: 'https://source.unsplash.com/random/800x600?sunset,1', name: 'Sunset' },
    ];
  } catch (error) {
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

function App() {
  // PERFORMANCE NOTICE: This is the original App component
  // For better performance, use ModularApp.jsx instead
  // You can switch by changing imports in main.jsx or using AppWrapper.jsx
  
  useEffect(() => {
    console.warn('⚠️ PERFORMANCE NOTICE: You are using the original App component. For better performance, consider switching to ModularApp by changing the import in main.jsx or using AppWrapper.jsx');
  }, []);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const configRef = useRef(null);
  const [showDate, setShowDate] = useState(defaultConfig.dateDisplay.show);
  const [showTime, setShowTime] = useState(defaultConfig.timeDisplay.show);
  const [enableCalendar, setEnableCalendar] = useState(defaultConfig.dateDisplay.enableCalendar);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(defaultConfig.dateDisplay.firstDayOfWeek || 0);
  const [showImageCounter, setShowImageCounter] = useState(defaultConfig.showImageCounter);
  const [showCountdown, setShowCountdown] = useState(defaultConfig.showCountdown);
  const [language, setLanguage] = useState(defaultConfig.language);
  
  // Timer settings
  const [timerEnabled, setTimerEnabled] = useState(defaultConfig.timeDisplay?.timer?.enabled ?? false);
  const [timerType, setTimerType] = useState(defaultConfig.timeDisplay?.timer?.type ?? 'countdown');
  // No longer using showTimerIcon since it will always be shown when timer is enabled
  const [countdownHours, setCountdownHours] = useState(defaultConfig.timeDisplay?.timer?.countdownHours ?? 0);
  const [countdownMinutes, setCountdownMinutes] = useState(defaultConfig.timeDisplay?.timer?.countdownMinutes ?? 5);
  const [countdownSeconds, setCountdownSeconds] = useState(defaultConfig.timeDisplay?.timer?.countdownSeconds ?? 0);
  const [timerTimeoutBlinkDuration, setTimerTimeoutBlinkDuration] = useState(defaultConfig.timeDisplay?.timer?.timeoutBlinkDuration ?? 10);
  // Timer position is always "below" - no longer configurable

  // Timer state - shared between icon and below components
  const [timerIsActive, setTimerIsActive] = useState(false);
  const [timerIsPaused, setTimerIsPaused] = useState(false);
  const [timerIsComplete, setTimerIsComplete] = useState(false);
  const [timerBlinkClass, setTimerBlinkClass] = useState('');
  const [timerTime, setTimerTime] = useState({
    hours: countdownHours,
    minutes: countdownMinutes,
    seconds: countdownSeconds
  });

  // Update timer time when countdown settings change
  useEffect(() => {
    if (!timerIsActive && !timerIsPaused) {
      if (timerType === 'countdown') {
        setTimerTime({
          hours: countdownHours,
          minutes: countdownMinutes,
          seconds: countdownSeconds
        });
      } else {
        // For chronometer, start from 00:00:00
        setTimerTime({
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    }
  }, [countdownHours, countdownMinutes, countdownSeconds, timerType, timerIsActive, timerIsPaused]);
  
  // Weather settings
  const [showWeather, setShowWeather] = useState(defaultConfig.weather?.show ?? true);
  const [weatherLocation, setWeatherLocation] = useState(defaultConfig.weather?.location ?? "Nice, France");
  const [weatherCoordinates, setWeatherCoordinates] = useState(defaultConfig.weather?.coordinates ?? { lat: 43.7, lon: 7.25 });
  const [forecastMode, setForecastMode] = useState(defaultConfig.weather?.forecastMode ?? "smart");
  const [weatherPosition, setWeatherPosition] = useState(defaultConfig.weather?.position ?? "top-right");
  const [weatherUnit, setWeatherUnit] = useState(defaultConfig.weather?.unit ?? "metric");
  const [weatherSize, setWeatherSize] = useState(defaultConfig.weather?.size ?? "size-2");
  const [weatherRefreshInterval, setWeatherRefreshInterval] = useState(defaultConfig.weather?.refreshInterval ?? 60);
  const [showWeatherCountdown, setShowWeatherCountdown] = useState(defaultConfig.weather?.showCountdown ?? false);
  const [showAirQuality, setShowAirQuality] = useState(defaultConfig.weather?.showAirQuality ?? false);
  // API key is now static from the configuration file, no longer user-editable
  const weatherApiKey = defaultConfig.weather?.apiKey ?? "";
  
  // Get weather data using the hook at component top level (to avoid Rules of Hooks violations)
  const { 
    weatherData,
    airQualityData,
    loading: weatherLoading,
    error: weatherError,
    timeRemaining, 
    lastUpdated,
    refreshWeather
  } = useWeatherData({
    location: weatherLocation,
    forecastMode,
    unit: weatherUnit,
    language, // This language parameter should be passed to the API for translations
    translations,
    apiKey: weatherApiKey,
    refreshInterval: weatherRefreshInterval,
    showAirQuality,
    coordinates: weatherCoordinates
  });
  
  // Log for debugging weather translation issues
  useEffect(() => {
    if (defaultConfig.debug) {
      console.log(`App component language changed to: ${language}`);
    }
    // Force weather refresh on language change
    if (typeof refreshWeather === 'function') {
      refreshWeather(true);
    }
  }, [language, refreshWeather]);
  
  // Initialize translations based on current language
  const t = translations[language] || translations.en;
  const [theme, setTheme] = useState(defaultConfig.theme);
  const [rotationTime, setRotationTime] = useState(defaultConfig.rotationTime);
  
  // Apply theme class to the root element
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      'theme-dark', 'theme-light', 'theme-blue', 'theme-green', 
      'theme-red', 'theme-purple', 'theme-orange', 'theme-pink'
    );
    // Add the current theme class
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);
  const [timeLeft, setTimeLeft] = useState(defaultConfig.rotationTime);
  const [timeFormat24h, setTimeFormat24h] = useState(defaultConfig.timeDisplay.format24h);
  const [showSeconds, setShowSeconds] = useState(defaultConfig.timeDisplay.showSeconds);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageDisplayMode, setImageDisplayMode] = useState(defaultConfig.imageDisplayMode);
  
  // Time and date display settings
  const [timeDisplay, setTimeDisplay] = useState({
    position: defaultConfig.timeDisplay.position,
    size: defaultConfig.timeDisplay.size
  });
  
  const [dateDisplay, setDateDisplay] = useState({
    position: defaultConfig.dateDisplay.position,
    size: defaultConfig.dateDisplay.size,
    format: defaultConfig.dateDisplay.format
  });
  
  // Date format options with translations
  const dateFormats = [
    { 
      id: 'DD/MM/YYYY', 
      label: 'DD/MM/YYYY', 
      format: (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}/${date.getFullYear()}`;
      }
    },
    { 
      id: 'MM/DD/YYYY', 
      label: 'MM/DD/YYYY', 
      format: (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${month}/${day}/${date.getFullYear()}`;
      }
    },
    { 
      id: 'DD-MM-YYYY', 
      label: 'DD-MM-YYYY', 
      format: (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}-${month}-${date.getFullYear()}`;
      }
    },
    { 
      id: 'DD/MM/YY', 
      label: 'DD/MM/YY', 
      format: (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
      }
    },
    { 
      id: 'DD MMMM YYYY', 
      label: 'DD Month YYYY', 
      format: (date) => {
        const day = date.getDate();
        const month = date.toLocaleString(language, { month: 'long' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
      }
    }
  ];

  const [dateFormat, setDateFormat] = useState(dateFormats[0]);
  
  // Date display sizes (slightly smaller than time sizes for better hierarchy)
  const dateSizes = {
    'size-1': 'text-[1.5rem]',    // 1.5rem
    'size-2': 'text-[2.35rem]',  // 2.35rem
    'size-3': 'text-[3.2rem]',   // 3.2rem
    'size-4': 'text-[4.05rem]',  // 4.05rem
    'size-5': 'text-[4.9rem]',   // 4.9rem
    'size-6': 'text-[5.75rem]',  // 5.75rem
    'size-7': 'text-[6.6rem]',   // 6.6rem
    'size-8': 'text-[7.5rem]'    // 7.5rem
  };
  
  // Weather display sizes (sizes for both icon and text)
  const weatherSizes = {
    'size-1': {
      icon: 'w-8 h-8',
      temp: 'text-lg',
      text: 'text-xs'
    },
    'size-2': {
      icon: 'w-12 h-12',
      temp: 'text-xl',
      text: 'text-sm'
    },
    'size-3': {
      icon: 'w-16 h-16',
      temp: 'text-2xl',
      text: 'text-base'
    },
    'size-4': {
      icon: 'w-20 h-20',
      temp: 'text-3xl',
      text: 'text-lg'
    },
    'size-5': {
      icon: 'w-24 h-24',
      temp: 'text-4xl',
      text: 'text-xl'
    }
  };
  
  // Initialize config state with default values first
  const [config, setConfig] = useState({
    ...defaultConfig,
    transition: {
      type: 'fade',
      duration: 1000,
      ...defaultConfig.transition
    }
  });

  const [images, setImages] = useState([
    { url: 'https://source.unsplash.com/random/800x600?nature,1', name: 'Nature' },
    { url: 'https://source.unsplash.com/random/800x600?mountain,1', name: 'Mountain' },
    { url: 'https://source.unsplash.com/random/800x600?ocean,1', name: 'Ocean' },
    { url: 'https://source.unsplash.com/random/800x600?forest,1', name: 'Forest' },
    { url: 'https://source.unsplash.com/random/800x600?sunset,1', name: 'Sunset' },
  ]);
  
  const [transition, setTransition] = useState({
    type: config.transition?.type || 'fade',
    duration: config.transition?.duration || 1000
  });
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('next');
  const intervalRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  
  // Available transitions
  const availableTransitions = [
    { id: 'fade', name: t.transitions?.fade || 'Fade' },
    { id: 'slide-right', name: t.transitions?.['slide-right'] || 'Slide Right' },
    { id: 'slide-left', name: t.transitions?.['slide-left'] || 'Slide Left' },
    { id: 'slide-up', name: t.transitions?.['slide-up'] || 'Slide Up' },
    { id: 'slide-down', name: t.transitions?.['slide-down'] || 'Slide Down' },
    { id: 'zoom-in', name: t.transitions?.['zoom-in'] || 'Zoom In' },
    { id: 'zoom-out', name: t.transitions?.['zoom-out'] || 'Zoom Out' },
    { id: 'rotate', name: t.transitions?.rotate || 'Rotate' },
    { id: 'flip', name: t.transitions?.flip || 'Flip' },
    { id: 'blur', name: t.transitions?.blur || 'Blur' },
  ];
  


  // Function to save config
  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    // Here you can add code to persist the config to localStorage or a backend
  };

  // Load transition settings from config
  useEffect(() => {
    if (config?.transition) {
      setTransition({
        type: config.transition.type || 'fade',
        duration: config.transition.duration || 1000
      });
    }
  }, [config?.transition]);
  
  // Save transition settings to config
  const saveTransitionSettings = (newTransition) => {
    const updatedConfig = { 
      ...config,
      transition: {
        ...config.transition,
        ...newTransition
      }
    };
    saveConfig(updatedConfig);
  };

  // Fetch images when component mounts
  useEffect(() => {
    const loadImages = async () => {
      const imageList = await fetchImages();
      setImages(imageList);
    };
    
    loadImages();
  }, []);

  // Helper function to get theme color class
  const getThemeColorClass = (themeName) => {
    switch (themeName) {
      case 'light': return 'bg-gray-100';
      case 'blue': return 'bg-blue-400';
      case 'green': return 'bg-green-400';
      case 'red': return 'bg-red-400';
      case 'purple': return 'bg-purple-400';
      case 'orange': return 'bg-orange-400';
      case 'pink': return 'bg-pink-400';
      default: return 'bg-gray-800'; // dark theme
    }
  };

  // Format current date and time
  const now = new Date();
  
  // Get the selected date format from dateDisplay.format
  const selectedDateFormat = dateFormats.find(f => f.id === dateDisplay.format) || dateFormats[0];
  const currentDate = selectedDateFormat.format(now);
  
  // Initialize current time state
  const [currentTime, setCurrentTime] = useState('');

  // Update time every second when seconds are shown, or every minute otherwise
  useEffect(() => {
    const updateTime = () => {
      const options = {
        hour12: !timeFormat24h,
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined
      };
      setCurrentTime(new Date().toLocaleTimeString(undefined, options));
    };
    
    // Initial update
    updateTime();
    
    // Set interval for updates
    const interval = setInterval(
      updateTime,
      showSeconds ? 1000 : 60000 // Update every second when showing seconds, otherwise every minute
    );
    
    return () => clearInterval(interval);
  }, [timeFormat24h, showSeconds]); // Re-run effect when time format or seconds display changes
  
  // Time display sizes (8 levels from 3rem to 15rem)
  const timeSizes = {
    'size-1': 'text-[3rem]',    // 3rem
    'size-2': 'text-[4.7rem]',  // 4.7rem
    'size-3': 'text-[6.4rem]',  // 6.4rem
    'size-4': 'text-[8.1rem]',  // 8.1rem
    'size-5': 'text-[9.8rem]',  // 9.8rem
    'size-6': 'text-[11.5rem]', // 11.5rem
    'size-7': 'text-[13.2rem]', // 13.2rem
    'size-8': 'text-[15rem]'    // 15rem
  };
  
  // Position classes mapping
  const positionClasses = {
    'top-left': 'absolute top-4 left-4',
    'top-center': 'absolute top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'absolute top-4 right-4',
    'center-left': 'absolute top-1/2 left-4 transform -translate-y-1/2',
    'center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'center-right': 'absolute top-1/2 right-4 transform -translate-y-1/2',
    'bottom-left': 'absolute bottom-16 left-4',
    'bottom-center': 'absolute bottom-16 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'absolute bottom-16 right-4'
  };

  // Function to get a random image index that's different from the current one
  const getRandomImageIndex = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * images.length);
    } while (images.length > 1 && newIndex === currentImageIndex);
    return newIndex;
  };

  // Function to go to the next image
  const nextImage = () => {
    setCurrentImageIndex(getRandomImageIndex());
  };

  // Navigate to next or previous image with transition
  const navigateImage = useCallback((direction) => {
    if (images.length <= 1 || isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionDirection(direction);
    
    // Start the transition after a small delay
    transitionTimeoutRef.current = setTimeout(() => {
      // Update to the next/previous image
      const newIndex = direction === 'next'
        ? (currentImageIndex + 1) % images.length
        : (currentImageIndex - 1 + images.length) % images.length;
      
      // Complete the transition after the animation duration
      transitionTimeoutRef.current = setTimeout(() => {
        setCurrentImageIndex(newIndex);
        setIsTransitioning(false);
      }, transition.duration);
      
    }, 50); // Small delay to start the transition
  }, [images.length, isTransitioning, currentImageIndex, transition.duration]);

  // Countdown timer and auto-advance slides
  useEffect(() => {
    if (images.length <= 1) return;
    
    let countdownInterval;
    const slideInterval = setInterval(() => {
      navigateImage('next');
    }, rotationTime * 1000);
    
    // Update countdown every second
    if (showCountdown) {
      setTimeLeft(rotationTime); // Reset countdown when rotation time changes
      countdownInterval = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft <= 1) {
            return rotationTime; // Reset to full rotation time when it reaches 0
          }
          return prevTimeLeft - 1; // Decrement by 1 second
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(slideInterval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [rotationTime, images.length, isTransitioning, showCountdown, navigateImage]);
  
  // Reset countdown when rotation time changes
  useEffect(() => {
    if (showCountdown) {
      setTimeLeft(rotationTime);
    }
  }, [rotationTime, showCountdown]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Handle rotation time change
  const handleRotationTimeChange = (e) => {
    const newRotationTime = parseInt(e.target.value, 10);
    setRotationTime(newRotationTime);
    
    // Update the config with the new rotation time
    const updatedConfig = {
      ...config,
      rotationTime: newRotationTime
    };
    saveConfig(updatedConfig);
  };

  // Calculate margin top based on time display size
  const getMarginTopForTimeSize = (size) => {
    switch(size) {
      case 'xxlarge': return '8rem';  // 32 * 0.25rem = 8rem
      case 'xlarge': return '7rem';   // 28 * 0.25rem = 7rem
      case 'large': return '6rem';    // 24 * 0.25rem = 6rem
      case 'medium': return '5rem';   // 20 * 0.25rem = 5rem
      case 'small': 
      default: return '4rem';         // 16 * 0.25rem = 4rem
    }
  };

  // Create ref for time element
  const timeRef = useRef(null);

  // Calculate dynamic margin based on time and date sizes
  const getDynamicMargin = (timeSize, dateSize) => {
    // Base margins for each size (in rem)
    const timeSizes = {
      'xxlarge': 9,  // 9rem
      'xlarge': 8,   // 8rem
      'large': 7,    // 7rem
      'medium': 6,   // 6rem
      'small': 5     // 5rem
    };

    // Adjust margin based on date size
    const dateSizeAdjustment = {
      'xxlarge': 1.5,  // Add 1.5rem
      'xlarge': 1.25,  // Add 1.25rem
      'large': 1,      // Add 1rem
      'medium': 0.75,  // Add 0.75rem
      'small': 0.5     // Add 0.5rem
    };

    const baseMargin = timeSizes[timeSize] || 6; // Default to medium if size not found
    const adjustment = dateSizeAdjustment[dateSize] || 0.75; // Default adjustment
    
    return `${baseMargin + adjustment}rem`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  // Toggle config panel
  const toggleConfig = () => {
    setIsConfigOpen(!isConfigOpen);
  };

  // Reset settings to default values
  const handleResetToDefaults = () => {
    setShowDate(defaultConfig.dateDisplay.show);
    setShowTime(defaultConfig.timeDisplay.show);
    setShowImageCounter(defaultConfig.showImageCounter);
    setShowCountdown(defaultConfig.showCountdown);
    setLanguage(defaultConfig.language);
    setTheme(defaultConfig.theme);
    const defaultRotationTime = defaultConfig.rotationTime;
    setRotationTime(defaultRotationTime);
    setTimeLeft(defaultRotationTime); // Reset timeLeft to match the new rotationTime
    setTimeFormat24h(defaultConfig.timeDisplay.format24h);
    setShowSeconds(defaultConfig.timeDisplay.showSeconds);
    setImageDisplayMode(defaultConfig.imageDisplayMode);
    setTimeDisplay({
      position: defaultConfig.timeDisplay.position,
      size: defaultConfig.timeDisplay.size
    });
    setDateDisplay({
      position: defaultConfig.dateDisplay.position,
      size: defaultConfig.dateDisplay.size,
      format: defaultConfig.dateDisplay.format
    });
    setEnableCalendar(defaultConfig.dateDisplay.enableCalendar);
    setFirstDayOfWeek(defaultConfig.dateDisplay.firstDayOfWeek || 0); // Reset first day of week
    
    // Reset weather settings
    setShowWeather(defaultConfig.weather?.show ?? true);
    setWeatherLocation(defaultConfig.weather?.location ?? "Nice, France");
    setWeatherCoordinates(defaultConfig.weather?.coordinates ?? { lat: 43.7, lon: 7.25 });
    setForecastMode(defaultConfig.weather?.forecastMode ?? "smart");
    setWeatherPosition(defaultConfig.weather?.position ?? "top-right");
    setWeatherUnit(defaultConfig.weather?.unit ?? "metric");
    setWeatherSize(defaultConfig.weather?.size ?? "size-2");
    setWeatherRefreshInterval(defaultConfig.weather?.refreshInterval ?? 60);
    setShowWeatherCountdown(defaultConfig.weather?.showCountdown ?? false);
    setShowAirQuality(defaultConfig.weather?.showAirQuality ?? false);
    
    // Reset timer settings
    setTimerEnabled(defaultConfig.timeDisplay?.timer?.enabled ?? false);
    setTimerType(defaultConfig.timeDisplay?.timer?.type ?? 'countdown');
    // No longer using showTimerIcon
    setCountdownHours(defaultConfig.timeDisplay?.timer?.countdownHours ?? 0);
    setCountdownMinutes(defaultConfig.timeDisplay?.timer?.countdownMinutes ?? 5);
    setCountdownSeconds(defaultConfig.timeDisplay?.timer?.countdownSeconds ?? 0);
    setTimerTimeoutBlinkDuration(defaultConfig.timeDisplay?.timer?.timeoutBlinkDuration ?? 10);
    // Timer position is always "below" - no setter needed
  };

  // Save settings
  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      language,
      theme,
      imageDisplayMode,
      transition,
      showImageCounter,
      showCountdown,
      rotationTime,
      weather: {
        show: showWeather,
        location: weatherLocation,
        coordinates: weatherCoordinates,
        forecastMode,
        position: weatherPosition, // Make sure this value is saved
        unit: weatherUnit,
        size: weatherSize,
        apiKey: defaultConfig.weather?.apiKey || '', // Use the default API key from the configuration
        refreshInterval: weatherRefreshInterval,
        showCountdown: showWeatherCountdown,
        showAirQuality: showAirQuality
      },
      timeDisplay: {
        show: showTime,
        format24h: timeFormat24h,
        showSeconds,
        position: timeDisplay.position,
        size: timeDisplay.size,
        timer: {
          enabled: timerEnabled,
          type: timerType,
          countdownHours,
          countdownMinutes,
          countdownSeconds,
          timeoutBlinkDuration: timerTimeoutBlinkDuration,
          position: "below"
        }
      },
      dateDisplay: {
        show: showDate,
        format: dateDisplay.format,
        position: dateDisplay.position,
        size: dateDisplay.size,
        enableCalendar,
        firstDayOfWeek
      }
    };
    
    localStorage.setItem('photoframeSettings', JSON.stringify(settings));
    setIsConfigOpen(false);
  };

  // Helper function to get button classes
  const getButtonClasses = (isActive = false) => {
    const baseClasses = 'button-theme p-2 rounded-md transition-colors';
    const activeClasses = isActive 
      ? 'ring-2 ring-opacity-50 bg-opacity-30' 
      : 'hover:bg-opacity-20';
    return `${baseClasses} ${activeClasses}`;
  };

  // Close config panel when clicking outside
  const handleClickOutside = (e) => {
    if (e.target.closest('.config-panel') === null && e.target.closest('.config-button') === null) {
      setIsConfigOpen(false);
    }
  };

  // Add click outside listener
  useEffect(() => {
    if (isConfigOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isConfigOpen]);

  const [showCalendar, setShowCalendar] = useState(false);
  
  // Memoize the initial date to prevent unnecessary re-renders of CalendarPopin
  const calendarInitialDate = useMemo(() => new Date(), []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900" style={{ overflow: 'hidden' }}>
      
      {/* Main Content */}
      <div className="slideshow-container">
        {images.length > 0 && (
          <>
            {/* Current Image */}
            <div 
              key={`current-${currentImageIndex}`}
              className={`slide transition-${transition.type} ${isTransitioning ? '' : 'active'}`}
              style={{
                transition: `all ${transition.duration}ms ease-in-out`,
                zIndex: 2,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: isTransitioning ? 0 : 1
              }}
            >
              <img
                src={typeof images[currentImageIndex] === 'string' ? images[currentImageIndex] : images[currentImageIndex]?.url || ''}
                alt={`Slide ${currentImageIndex + 1}`}
                className={`${
                  imageDisplayMode === 'original' ? 'object-scale-down' :
                  imageDisplayMode === 'adjust' ? 'object-contain' :
                  'object-cover'
                } ${
                  imageDisplayMode === 'original' ? 'max-w-none max-h-none' : 'w-full h-full'
                }`}
                onError={(e) => {
                  // Fallback to a sample image if the current one fails to load
                  if (images.length === 0) {
                    const sampleImages = [
                      'https://source.unsplash.com/random/800x600?nature,1',
                      'https://source.unsplash.com/random/800x600?mountain,1',
                      'https://source.unsplash.com/random/800x600?ocean,1',
                      'https://source.unsplash.com/random/800x600?forest,1',
                      'https://source.unsplash.com/random/800x600?sunset,1',
                    ];
                    const randomIndex = Math.floor(Math.random() * sampleImages.length);
                    e.target.src = sampleImages[randomIndex];
                  }
                }}
              />
            </div>
            
            {/* Next/Previous Image (for transitions) */}
            {isTransitioning && (
              <div 
                key={`next-${currentImageIndex}-${transitionDirection}`}
                className={`slide transition-${transition.type} active`}
                style={{
                  transition: `all ${transition.duration}ms ease-in-out`,
                  zIndex: 1,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 1
                }}
              >
                <img
                  src={typeof images[transitionDirection === 'next' 
                    ? (currentImageIndex + 1) % images.length
                    : (currentImageIndex - 1 + images.length) % images.length
                  ] === 'string' 
                    ? images[transitionDirection === 'next' 
                      ? (currentImageIndex + 1) % images.length
                      : (currentImageIndex - 1 + images.length) % images.length
                    ]
                    : images[transitionDirection === 'next' 
                      ? (currentImageIndex + 1) % images.length
                      : (currentImageIndex - 1 + images.length) % images.length
                    ]?.url || ''}
                  alt="Next slide"
                  className={`${
                    imageDisplayMode === 'original' ? 'object-scale-down' :
                    imageDisplayMode === 'adjust' ? 'object-contain' :
                    'object-cover'
                  } ${
                    imageDisplayMode === 'original' ? 'max-w-none max-h-none' : 'w-full h-full'
                  }`}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* UI Controls Overlay */}
      <div className="ui-controls">
        {/* Control Buttons Container */}
        <div className="fixed bottom-4 right-4 z-50 flex space-x-2">
          {/* Settings Button */}
          <button
            onClick={toggleConfig}
            className="p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            aria-label={t.settings}
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            aria-label={isFullscreen ? t.exitFullscreen : t.enterFullscreen}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="w-6 h-6" />
            ) : (
              <ArrowsPointingOutIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Unified Time/Date/Weather Display when all three are at the same position */}
        {showTime && showDate && showWeather && 
         timeDisplay.position === dateDisplay.position && 
         dateDisplay.position === weatherPosition && (
          <div className={`unified-display ${positionClasses[timeDisplay.position]} fixed bg-black bg-opacity-50 text-white p-4 rounded-lg transition-all duration-300`}>
            {/* Time */}
            <div className={`${timeSizes[timeDisplay.size]} font-bold text-center relative`}>
              {currentTime}
              
              {/* Timer Icon - Show when timer is enabled OR when timer is active/paused/complete */}
              {(timerEnabled || timerIsActive || timerIsPaused || timerIsComplete) && (
                <div className="absolute right-[-30px] top-1/2 transform -translate-y-1/2">
                  <TimerDisplay 
                    enabled={timerEnabled}
                    type={timerType}
                    initialHours={countdownHours}
                    initialMinutes={countdownMinutes}
                    initialSeconds={countdownSeconds}
                    position="icon"
                    language={language}
                    translations={translations}
                    showIconButton={true}
                    onTimerTypeChange={setTimerType}
                    timeoutBlinkDuration={timerTimeoutBlinkDuration}
                    debug={defaultConfig.debug}
                    // Shared timer state
                    isActive={timerIsActive}
                    isPaused={timerIsPaused}
                    isComplete={timerIsComplete}
                    timerTime={timerTime}
                    timerBlinkClass={timerBlinkClass}
                    onTimerStateChange={{
                      setIsActive: setTimerIsActive,
                      setIsPaused: setTimerIsPaused,
                      setIsComplete: setTimerIsComplete,
                      setTime: setTimerTime,
                      setBlinkClass: setTimerBlinkClass
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Timer Display (when active) - Show when timer is enabled OR when timer is active/paused/complete */}
            {(timerEnabled || timerIsActive || timerIsPaused || timerIsComplete) && (
              <div className="timer-container mt-4">
                <TimerDisplay 
                  enabled={timerEnabled}
                  type={timerType}
                  initialHours={countdownHours}
                  initialMinutes={countdownMinutes}
                  initialSeconds={countdownSeconds}
                  position="below"
                  language={language}
                  translations={translations}
                  showIconButton={false}
                  timeoutBlinkDuration={timerTimeoutBlinkDuration}
                  debug={defaultConfig.debug}
                  // Shared timer state
                  isActive={timerIsActive}
                  isPaused={timerIsPaused}
                  isComplete={timerIsComplete}
                  timerTime={timerTime}
                  timerBlinkClass={timerBlinkClass}
                  onTimerStateChange={{
                    setIsActive: setTimerIsActive,
                    setIsPaused: setTimerIsPaused,
                    setIsComplete: setTimerIsComplete,
                    setTime: setTimerTime,
                    setBlinkClass: setTimerBlinkClass
                  }}
                />
              </div>
            )}
            
            {/* Date */}
            <div className="mt-2">
              <div className="flex items-center justify-center">
                <div className={`${dateSizes[dateDisplay.size]} font-medium text-center`}>
                  {currentDate}
                </div>
                {enableCalendar && (
                  <button 
                    className="ml-2 text-white hover:text-accent cursor-pointer p-1 rounded-full flex items-center justify-center" 
                    onClick={() => setShowCalendar(true)}
                    aria-label="Open calendar"
                  >
                    <CalendarIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Weather */}
            <div className="weather-unified mt-3 pt-3 border-t border-gray-500">
              {renderWeatherContent()}
            </div>
          </div>
        )}
        
        {/* Time Display - When not all three components are at the same position */}
        {showTime && !(showDate && showWeather && timeDisplay.position === dateDisplay.position && dateDisplay.position === weatherPosition) && (
          <div className={`time-display ${positionClasses[timeDisplay.position]} fixed bg-black bg-opacity-50 text-white p-4 rounded-lg transition-all duration-300`}>
            <div className={`${timeSizes[timeDisplay.size]} font-bold text-center relative`}>
              {currentTime}
              
              {/* Timer Icon - Show when timer is enabled OR when timer is active/paused/complete */}
              {(timerEnabled || timerIsActive || timerIsPaused || timerIsComplete) && (
                <div className="absolute right-[-30px] top-1/2 transform -translate-y-1/2">
                  <TimerDisplay 
                    enabled={timerEnabled}
                    type={timerType}
                    initialHours={countdownHours}
                    initialMinutes={countdownMinutes}
                    initialSeconds={countdownSeconds}
                    position="icon"
                    language={language}
                    translations={translations}
                    showIconButton={true}
                    onTimerTypeChange={setTimerType}
                    timeoutBlinkDuration={timerTimeoutBlinkDuration}
                    debug={defaultConfig.debug}
                    // Shared timer state
                    isActive={timerIsActive}
                    isPaused={timerIsPaused}
                    isComplete={timerIsComplete}
                    timerTime={timerTime}
                    timerBlinkClass={timerBlinkClass}
                    onTimerStateChange={{
                      setIsActive: setTimerIsActive,
                      setIsPaused: setTimerIsPaused,
                      setIsComplete: setTimerIsComplete,
                      setTime: setTimerTime,
                      setBlinkClass: setTimerBlinkClass
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Timer Display (when active) - Show when timer is enabled OR when timer is active/paused/complete */}
            {(timerEnabled || timerIsActive || timerIsPaused || timerIsComplete) && (
              <div className="timer-container mt-4">
                <TimerDisplay 
                  enabled={timerEnabled}
                  type={timerType}
                  initialHours={countdownHours}
                  initialMinutes={countdownMinutes}
                  initialSeconds={countdownSeconds}
                  position="below"
                  language={language}
                  translations={translations}
                  showIconButton={false}
                  timeoutBlinkDuration={timerTimeoutBlinkDuration}
                  debug={defaultConfig.debug}
                  // Shared timer state
                  isActive={timerIsActive}
                  isPaused={timerIsPaused}
                  isComplete={timerIsComplete}
                  timerTime={timerTime}
                  timerBlinkClass={timerBlinkClass}
                  onTimerStateChange={{
                    setIsActive: setTimerIsActive,
                    setIsPaused: setTimerIsPaused,
                    setIsComplete: setTimerIsComplete,
                    setTime: setTimerTime,
                    setBlinkClass: setTimerBlinkClass
                  }}
                />
              </div>
            )}
            
            
            {/* Date Display - When same position as time but not weather */}
            {showDate && timeDisplay.position === dateDisplay.position && 
             !(showWeather && dateDisplay.position === weatherPosition) && (
              <div className="mt-2">
                <div className="flex items-center justify-center">
                  <div className={`${dateSizes[dateDisplay.size]} font-medium text-center`}>
                    {currentDate}
                  </div>
                  {enableCalendar && (
                    <button 
                      className="ml-2 text-white hover:text-accent cursor-pointer p-1 rounded-full flex items-center justify-center" 
                      onClick={() => setShowCalendar(true)}
                      aria-label="Open calendar"
                    >
                      <CalendarIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Weather Display - When same position as time but not date */}
            {showWeather && weatherPosition === timeDisplay.position && 
             !(showDate && timeDisplay.position === dateDisplay.position) && (
              <div className="weather-with-time mt-3 pt-3 border-t border-gray-500">
                {renderWeatherContent()}
              </div>
            )}
          </div>
        )}
        
        {/* Date Display - When different position than time and not unified with weather */}
        {showDate && (!showTime || timeDisplay.position !== dateDisplay.position) && 
         !(showWeather && showTime && timeDisplay.position === dateDisplay.position && dateDisplay.position === weatherPosition) && (
          <div className={`date-display ${positionClasses[dateDisplay.position]} fixed bg-black bg-opacity-50 text-white p-3 rounded-lg transition-all duration-300`}>
                <div className="flex items-center justify-center">
                  <div className={`${dateSizes[dateDisplay.size]} font-medium text-center`}>
                    {currentDate}
                  </div>
                  {enableCalendar && (
                    <button 
                      className="ml-2 text-white hover:text-accent cursor-pointer p-1 rounded-full flex items-center justify-center" 
                      onClick={() => setShowCalendar(true)}
                      aria-label="Open calendar"
                    >
                      <CalendarIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {/* Weather Display - When same position as date but not time */}
                {showWeather && weatherPosition === dateDisplay.position && 
                 (!showTime || timeDisplay.position !== dateDisplay.position) && (
                  <div className="weather-with-date mt-3 pt-3 border-t border-gray-500">
                    {renderWeatherContent()}
                  </div>
                )}
          </div>
        )}
        
        {/* Standalone Weather Display - Only when not sharing position with time or date */}
        {showWeather && 
         !(showTime && weatherPosition === timeDisplay.position) && 
         !(showDate && weatherPosition === dateDisplay.position) && (
          <WeatherDisplay
            location={weatherLocation}
            coordinates={weatherCoordinates}
            forecastMode={forecastMode}
            unit={weatherUnit}
            position={weatherPosition}
            language={language}
            translations={translations}
            timePosition={timeDisplay.position}
            datePosition={dateDisplay.position}
            showTime={showTime}
            showDate={showDate}
            size={weatherSize}
            apiKey={weatherApiKey}
            refreshInterval={weatherRefreshInterval}
            showRefreshCountdown={showWeatherCountdown}
            showAirQuality={showAirQuality}
          />
        )}

        {/* Bottom Bar */}
        <div className="bottom-bar">
          {/* Countdown - Bottom Left */}
          {showCountdown && (
            <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-50 text-white p-3 rounded-lg">
              <div className="text-sm text-gray-300">{t.nextIn}</div>
              <div className="text-2xl font-bold">{timeLeft}s</div>
            </div>
          )}
          
          {/* No Images Found Message */}
          {images.length === 0 && (
            <div className="no-images-message absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4 bg-panel-bg bg-opacity-80 text-text rounded-lg border border-panel-border">
                <p className="text-lg fontmedium">{t.noImagesFound}</p>
                <p className="text-sm mt-1">{t.addImagesToFolder}</p>
              </div>
            </div>
          )}
          
          {/* Image Counter - Bottom Center */}
          {showImageCounter && images.length > 0 && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                <div className="text-sm text-gray-300 text-center">{t.photo}</div>
                <div className="text-xl font-bold text-center">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      {isConfigOpen && (
        <div 
          className="config-overlay"
          onClick={(e) => e.target === e.currentTarget && setIsConfigOpen(false)}
        >
          <div 
            ref={configRef}
            className="config-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-panel-bg z-10 p-4 border-b border-panel-border">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{t.settings}</h2>
                <div className="flex items-center space-x-4">
                  <div className="tooltip-container">
                    <button
                      onClick={handleResetToDefaults}
                      className="px-4 py-2 text-sm font-medium bg-panel-bg text-text rounded-md hover:bg-panel-bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                      aria-label={t.resetToDefaultsTooltip}
                    >
                      {t.resetToDefaults}
                    </button>
                    <div className="tooltip">
                      {t.resetToDefaultsTooltip}
                    </div>
                  </div>
                  <div className="tooltip-container">
                    <button
                      onClick={handleSaveSettings}
                      className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                      aria-label={t.saveChangesTooltip}
                    >
                      {t.saveChanges}
                    </button>
                    <div className="tooltip">
                      {t.saveChangesTooltip}
                    </div>
                  </div>
                  <button 
                    onClick={toggleConfig}

                    className="p-1 rounded-full hover:bg-panel-bg-hover transition-colors"
                    aria-label={t.close}
                  >
                    <XMarkIcon className="w-6 h-6 icon-theme fill-current" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* General Settings Column */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium border-b border-panel-border pb-2">{t.general}</h3>
                  
                  {/* Theme Selector */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">{t.theme}</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {['dark', 'light', 'blue', 'green', 'red', 'purple', 'orange', 'pink'].map((themeOption) => {
                        const isDarkTheme = themeOption === 'dark';
                        const isSelected = theme === themeOption;
                        
                        return (
                          <button
                            key={themeOption}
                            onClick={() => setTheme(themeOption)}
                            className={`p-2 rounded-md transition-all ${
                              isSelected 
                                ? isDarkTheme 
                                  ? 'ring-2 ring-white ring-opacity-50 bg-opacity-30 bg-gray-800' 
                                  : 'ring-2 ring-white ring-opacity-50 bg-opacity-30 bg-white'
                                : 'bg-panel-bg hover:bg-panel-bg-hover'
                            }`}
                            title={themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                          >
                            <div 
                              className={`w-full h-8 rounded ${
                                isDarkTheme ? 'bg-gray-900' : getThemeColorClass(themeOption)
                              }`}
                            ></div>
                            <span className="text-xs text-text mt-1 block">
                              {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Image Display Mode */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">{t.imageDisplay}</h4>
                    <div className="space-y-2 pl-1">
                      {[
                        { id: 'original', label: t.original, description: t.originalDescription },
                        { id: 'adjust', label: t.adjust, description: t.adjustDescription },
                        { id: 'fit', label: t.fit, description: t.fitDescription }
                      ].map((mode) => (
                        <div key={mode.id} className="flex items-center">
                          <input
                            id={`display-mode-${mode.id}`}
                            name="display-mode"
                            type="radio"
                            checked={imageDisplayMode === mode.id}
                            onChange={() => setImageDisplayMode(mode.id)}
                            className="h-4 w-4 border-gray-500 text-accent focus:ring-accent"
                          />
                          <div className="ml-3 flex items-center">
                            <label 
                              htmlFor={`display-mode-${mode.id}`} 
                              className="text-sm font-medium"
                            >
                              {mode.label}
                            </label>
                            <div className="tooltip-container ml-2">
                              <svg 
                                className="w-4 h-4 text-gray-500 hover:text-gray-700" 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path 
                                  fillRule="evenodd" 
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                                  clipRule="evenodd" 
                                />
                              </svg>
                              <div className="tooltip max-w-xs whitespace-normal text-xs">
                                {mode.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Transition Settings */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">{t.transitionEffect}</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {availableTransitions.map((tran) => (
                          <button
                            key={tran.id}
                            type="button"
                            onClick={() => saveTransitionSettings({ type: tran.id })}
                            className={`px-3 py-2 text-sm rounded-md ${
                              transition.type === tran.id
                                ? 'bg-accent text-white'
                                : 'bg-panel-bg hover:bg-panel-bg-hover text-text'
                            }`}
                          >
                            {tran.name}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4">
                        <label htmlFor="transition-duration" className="block text-sm font-medium mb-1">
                          {t.transitionDuration}: {transition.duration}ms
                        </label>
                        <input
                          type="range"
                          id="transition-duration"
                          min="100"
                          max="3000"
                          step="100"
                          value={transition.duration}
                          onChange={(e) => saveTransitionSettings({ duration: parseInt(e.target.value, 10) })}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>100ms</span>
                          <span>3000ms</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        {t.language}
                      </label>
                      <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-panel-bg text-white"
                      >
                        <option value="en" className="bg-panel-bg">English</option>
                        <option value="es" className="bg-panel-bg">Español</option>
                        <option value="fr" className="bg-panel-bg">Français</option>
                        <option value="de" className="bg-panel-bg">Deutsch</option>
                        <option value="it" className="bg-panel-bg">Italiano</option>
                        <option value="zh" className="bg-panel-bg">中文 (Chinese)</option>
                        <option value="ja" className="bg-panel-bg">日本語 (Japanese)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="showImageCounter" className="text-sm">
                          {t.showImageCounter}
                        </label>
                        <input
                          type="checkbox"
                          id="showImageCounter"
                          checked={showImageCounter}
                          onChange={(e) => setShowImageCounter(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-500 bg-panel-bg text-accent focus:ring-accent"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="showCountdown" className="text-sm">
                          {t.showCountdown}
                        </label>
                        <input
                          type="checkbox"
                          id="showCountdown"
                          checked={showCountdown}
                          onChange={(e) => setShowCountdown(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-500 bg-panel-bg text-accent focus:ring-accent"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        {t.rotationTime}
                      </label>
                      <div className="relative">
                        <input
                          type="range"
                          id="rotationTime"
                          min="10"
                          max="3600"
                          step="1"
                          value={rotationTime}
                          onChange={handleRotationTimeChange}
                          className="w-full h-2 bg-panel-bg rounded-lg appearance-none cursor-pointer"
                        />
                        {/* Custom slider track with markers */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 pointer-events-none">
                          <div className="relative h-full">
                            {/* Background track */}
                            <div className="absolute inset-0 bg-panel-bg-hover rounded-full"></div>
                            {/* Active track */}
                            <div 
                              className="absolute top-0 bottom-0 left-0 bg-accent rounded-full"
                              style={{ width: `${(rotationTime / 3600) * 100}%` }}
                            ></div>
                            {/* Markers */}
                            {[10, 30, 60, 300, 900, 1800, 3600].map((marker) => (
                              <div 
                                key={marker}
                                className="absolute top-1/2 w-px h-2 -translate-y-1/2 bg-panel-border"
                                style={{ left: `${(marker / 3600) * 100}%` }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-text/60 px-1 mt-1">
                        {[10, 30, 60, 300, 900, 1800, 3600].map((value) => {
                          const displayValue = value < 60 ? `${value}s` : `${value / 60}m`;
                          return (
                            <button
                              type="button"
                              key={value}
                              onClick={() => setRotationTime(value)}
                              className={`px-1 py-0.5 min-w-[2.5rem] rounded transition-colors ${rotationTime === value ? 'font-bold text-accent bg-accent/10' : 'hover:text-accent/70 hover:bg-panel-bg-hover'}`}
                              style={{ flex: '1 0 0', margin: '0 1px' }}
                              aria-label={`Set rotation time to ${displayValue}`}
                            >
                              {displayValue}
                            </button>
                          );
                        })}
                      </div>
                      <div className="text-xs text-text/60 text-center mt-1">
                        {rotationTime < 60 ? `${rotationTime} ${t.seconds}` : 
                          `${Math.floor(rotationTime / 60)} ${t.minutes}${rotationTime % 60 ? ` ${rotationTime % 60} ${t.seconds}` : ''}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Settings Column */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-panel-border pb-2">
                    <h3 className="text-lg font-medium">{t.timeSettings}</h3>
                    <div className="flex items-center">
                      <label htmlFor="showTime" className="text-sm mr-2">
                        {t.showTime}
                      </label>
                      <input
                        type="checkbox"
                        id="showTime"
                        checked={showTime}
                        onChange={(e) => setShowTime(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-500 bg-panel-bg text-accent focus:ring-accent"
                      />
                    </div>
                  </div>
                  
                  {showTime && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          {t.timeFormat}
                        </label>
                        <div className="flex items-center space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="h-4 w-4 text-accent border-gray-500 focus:ring-accent"
                              checked={!timeFormat24h}
                              onChange={() => setTimeFormat24h(false)}
                            />
                            <span className="ml-2">{t.timeFormat12h}</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="h-4 w-4 text-accent border-gray-500 focus:ring-accent"
                              checked={timeFormat24h}
                              onChange={() => setTimeFormat24h(true)}
                            />
                            <span className="ml-2">{t.timeFormat24h}</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          {t.position}
                        </label>
                        <div className="relative w-full h-40 border border-panel-border rounded-lg p-4 bg-panel-bg/50">
                          <div className="absolute inset-0 border-2 border-panel-border rounded pointer-events-none"></div>
                          {[
                            { pos: 'top-left', x: 'left-4', y: 'top-4', transform: '' },
                            { pos: 'top-center', x: 'left-1/2', y: 'top-4', transform: '-translate-x-1/2' },
                            { pos: 'top-right', x: 'right-4', y: 'top-4', transform: '' },
                            { pos: 'center-left', x: 'left-4', y: 'top-1/2', transform: '-translate-y-1/2' },
                            { pos: 'center', x: 'left-1/2', y: 'top-1/2', transform: '-translate-x-1/2 -translate-y-1/2' },
                            { pos: 'center-right', x: 'right-4', y: 'top-1/2', transform: '-translate-y-1/2' },
                            { pos: 'bottom-left', x: 'left-4', y: 'bottom-4', transform: '' },
                            { pos: 'bottom-center', x: 'left-1/2', y: 'bottom-4', transform: 'translateX(-50%)' },
                            { pos: 'bottom-right', x: 'right-4', y: 'bottom-4', transform: '' },
                          ].map(({pos, x, y, transform = ''}) => (
                            <div 
                              key={`time-${pos}`} 
                              className={`absolute ${x} ${y} ${transform} flex items-center justify-center w-8 h-8`}
                              style={{ 
                                transform: transform === '-translate-x-1/2 -translate-y-1/2' 
                                  ? 'translate(-50%, -50%)' 
                                  : transform === '-translate-x-1/2' 
                                    ? 'translateX(-50%)' 
                                    : transform === '-translate-y-1/2'
                                      ? 'translateY(-50%)'
                                      : 'none' 
                              }}
                            >
                              <button
                                onClick={() => setTimeDisplay({...timeDisplay, position: pos})}
                                className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                                  timeDisplay.position === pos 
                                    ? 'bg-accent ring-2 ring-accent ring-opacity-70 shadow-md' 
                                    : 'bg-panel-border hover:bg-panel-border-hover border-2 border-panel-border-hover'
                                }`}
                                aria-label={`Time position ${pos}`}
                                title={pos.replace('-', ' ')}
                              >
                                {timeDisplay.position === pos && (
                                  <span className="w-2 h-2 bg-white rounded-full"></span>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="showSeconds" className="text-sm">
                            {t.showSeconds}
                          </label>
                          <input
                            type="checkbox"
                            id="showSeconds"
                            checked={showSeconds}
                            onChange={(e) => setShowSeconds(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-500 bg-panel-bg text-accent focus:ring-accent"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          {t.size}
                        </label>
                        <select
                          value={timeDisplay.size}
                          onChange={(e) => setTimeDisplay({...timeDisplay, size: e.target.value})}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-panel-bg text-white"
                        >
                          {Object.entries(t.sizes).map(([value, label]) => (
                            <option key={"date-size-" + value} value={value} className="bg-panel-bg">
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Timer Settings */}
                      <div className="mt-6 space-y-3 border-t border-panel-border pt-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-medium">{t.timer || 'Timer'}</h4>
                          <div className="flex items-center">
                            <label htmlFor="timerEnabled" className="text-sm mr-2">
                              {t.timerEnabled || 'Enable Timer'}
                            </label>
                            <input
                              type="checkbox"
                              id="timerEnabled"
                              checked={timerEnabled}
                              onChange={(e) => setTimerEnabled(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-500 bg-panel-bg text-accent focus:ring-accent"
                            />
                          </div>
                        </div>
                        <div className="flex items-center mt-2">
                          <label htmlFor="timerTimeoutBlinkDuration" className="text-sm mr-2">
                            {t.timerTimeoutDuration || 'Timeout Blink Duration (seconds)'}
                          </label>
                          <input
                            type="number"
                            id="timerTimeoutBlinkDuration"
                            min={1}
                            max={60}
                            value={timerTimeoutBlinkDuration}
                            onChange={e => setTimerTimeoutBlinkDuration(Number(e.target.value))}
                            className="w-16 ml-2 rounded border-gray-500 bg-panel-bg text-accent focus:ring-accent px-2 py-1"
                          />
                          <span className="ml-2 text-xs text-gray-400">{t.timerTimeoutDurationDescription}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Date Settings Column */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-panel-border pb-2">
                    <h3 className="text-lg font-medium">{t.dateSettings}</h3>
                    <div className="flex items-center">
                      <label htmlFor="showDate" className="text-sm mr-2">
                        {t.showDate}
                      </label>
                      <input
                        type="checkbox"
                        id="showDate"
                        checked={showDate}
                        onChange={(e) => setShowDate(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-500 bg-panel-bg text-accent focus:ring-accent"
                      />
                    </div>
                  </div>
                  
                  {showDate && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="enableCalendar" className="text-sm">
                            {t.enableCalendar}
                          </label>
                          <input
                            type="checkbox"
                            id="enableCalendar"
                            checked={enableCalendar}
                            onChange={(e) => setEnableCalendar(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-500 bg-panel-bg text-accent focus:ring-accent"
                          />
                        </div>
                      </div>

                      {enableCalendar && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">
                            {t.firstDayOfWeek}
                          </label>
                          <div className="flex items-center space-x-4 mt-1">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                className="h-4 w-4 text-accent border-gray-500 focus:ring-accent"
                                checked={firstDayOfWeek === 0}
                                onChange={() => setFirstDayOfWeek(0)}
                              />
                              <span className="ml-2 text-sm">{t.sunday}</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                className="h-4 w-4 text-accent border-gray-500 focus:ring-accent"
                                checked={firstDayOfWeek === 1}
                                onChange={() => setFirstDayOfWeek(1)}
                              />
                              <span className="ml-2 text-sm">{t.monday}</span>
                            </label>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          {t.format}
                        </label>
                        <select
                          value={dateDisplay.format}
                          onChange={(e) => setDateDisplay({...dateDisplay, format: e.target.value})}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-panel-bg text-white"
                        >
                          {Object.entries(t.dateFormats || {}).map(([value, label]) => (
                            <option key={`date-format-${value}`} value={value} className="bg-panel-bg">
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          {t.position}
                        </label>
                        <div className="relative w-full h-40 border border-panel-border rounded-lg p-4 bg-panel-bg/50">
                          <div className="absolute inset-0 border-2 border-panel-border rounded pointer-events-none"></div>
                          {[
                            { pos: 'top-left', x: 'left-4', y: 'top-4', transform: '' },
                            { pos: 'top-right', x: 'right-4', y: 'top-4', transform: '' },
                            { pos: 'top-center', x: 'left-1/2', y: 'top-4', transform: 'translateX(-50%)' },
                            { pos: 'center-left', x: 'left-4', y: 'top-1/2', transform: 'translateY(-50%)' },
                            { pos: 'center', x: 'left-1/2', y: 'top-1/2', transform: 'translate(-50%, -50%)' },
                            { pos: 'center-right', x: 'right-4', y: 'top-1/2', transform: 'translateY(-50%)' },
                            { pos: 'bottom-left', x: 'left-4', y: 'bottom-4', transform: '' },
                            { pos: 'bottom-right', x: 'right-4', y: 'bottom-4', transform: '' },
                            { pos: 'bottom-center', x: 'left-1/2', y: 'bottom-4', transform: 'translateX(-50%)' },
                          ].map(({pos, x, y, transform}) => (
                            <div 
                              key={`date-${pos}`} 
                              className={`absolute ${x} ${y} ${transform} flex items-center justify-center w-8 h-8`}
                              style={{ transform }}
                            >
                              <button
                                onClick={() => setDateDisplay({...dateDisplay, position: pos})}
                                className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                                  dateDisplay.position === pos 
                                    ? 'bg-accent ring-2 ring-accent ring-opacity-70 shadow-md' 
                                    : 'bg-panel-border hover:bg-panel-border-hover border-2 border-panel-border-hover'
                                }`}
                                aria-label={`Date position ${pos}`}
                                title={pos.replace('-', ' ')}
                              >
                                {dateDisplay.position === pos && (
                                  <span className="w-2 h-2 bg-white rounded-full"></span>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          {t.size}
                        </label>
                        <select
                          value={dateDisplay.size}
                          onChange={(e) => setDateDisplay({...dateDisplay, size: e.target.value})}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-panel-bg text-white"
                        >
                          {Object.entries(t.sizes || {}).map(([value, label]) => (
                            <option key={"date-size-" + value} value={value} className="bg-panel-bg">
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {/* Weather Settings Column */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-panel-border pb-2">
                    <h3 className="text-lg font-medium">{t.weatherSettings}</h3>
                    <div className="flex items-center">
                      <label htmlFor="showWeather" className="text-sm mr-2">
                        {t.showWeather}
                      </label>
                      <input
                        type="checkbox"
                        id="showWeather"
                        checked={showWeather}
                        onChange={(e) => setShowWeather(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-500 bg-panel-bg text-accent focus:ring-accent"
                      />
                    </div>
                  </div>
                  
                  {showWeather && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          {t.location}
                        </label>
                        <input
                          type="text"
                          value={weatherLocation}
                          onChange={(e) => setWeatherLocation(e.target.value)}
                          placeholder="City, Country (leave blank to use coordinates)"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-panel-bg text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          {t.coordinates}
                        </label>
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <input
                              type="number"
                              value={weatherCoordinates.lat}
                              onChange={(e) => setWeatherCoordinates({...weatherCoordinates, lat: parseFloat(e.target.value)})}
                              step="0.01"
                              placeholder="Latitude"
                              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-panel-bg text-white"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="number"
                              value={weatherCoordinates.lon}
                              onChange={(e) => setWeatherCoordinates({...weatherCoordinates, lon: parseFloat(e.target.value)})}
                              step="0.01"
                              placeholder="Longitude"
                              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-panel-bg text-white"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{t.coordinatesHelp}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          {t.forecastMode}
                        </label>
                        <select
                          value={forecastMode}
                          onChange={(e) => setForecastMode(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-panel-bg text-white"
                        >
                          <option value="today" className="bg-panel-bg">{t.forecastModes?.today || 'Today'}</option>
                          <option value="tomorrow" className="bg-panel-bg">{t.forecastModes?.tomorrow || 'Tomorrow'}</option>
                          <option value="smart" className="bg-panel-bg">{t.forecastModes?.smart || 'Smart'}</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          {t.unit}
                        </label>
                        <div className="flex items-center space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="h-4 w-4 text-accent border-gray-500 focus:ring-accent"
                              checked={weatherUnit === 'metric'}
                              onChange={() => setWeatherUnit('metric')}
                            />
                            <span className="ml-2">{t.units?.metric || 'Metric (°C)'}</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="h-4 w-4 text-accent border-gray-500 focus:ring-accent"
                              checked={weatherUnit === 'imperial'}
                              onChange={() => setWeatherUnit('imperial')}
                            />
                            <span className="ml-2">{t.units?.imperial || 'Imperial (°F)'}</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          {t.size}
                        </label>
                        <select
                          value={weatherSize}
                          onChange={(e) => setWeatherSize(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-panel-bg text-white"
                        >
                          {Object.entries(t.sizes || {}).slice(0, 5).map(([value, label]) => (
                            <option key={`weather-size-${value}`} value={value} className="bg-panel-bg">
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          {t.position}
                        </label>
                        <div className="relative w-full h-40 border border-panel-border rounded-lg p-4 bg-panel-bg/50">
                          <div className="absolute inset-0 border-2 border-panel-border rounded pointer-events-none"></div>
                          {[
                            { pos: 'top-left', x: 'left-4', y: 'top-4', transform: '' },
                            { pos: 'top-right', x: 'right-4', y: 'top-4', transform: '' },
                            { pos: 'top-center', x: 'left-1/2', y: 'top-4', transform: 'translateX(-50%)' },
                            { pos: 'center-left', x: 'left-4', y: 'top-1/2', transform: 'translateY(-50%)' },
                            { pos: 'center', x: 'left-1/2', y: 'top-1/2', transform: 'translate(-50%, -50%)' },
                            { pos: 'center-right', x: 'right-4', y: 'top-1/2', transform: 'translateY(-50%)' },
                            { pos: 'bottom-left', x: 'left-4', y: 'bottom-4', transform: '' },
                            { pos: 'bottom-right', x: 'right-4', y: 'bottom-4', transform: '' },
                            { pos: 'bottom-center', x: 'left-1/2', y: 'bottom-4', transform: 'translateX(-50%)' },
                          ].map(({pos, x, y, transform}) => (
                            <div 
                              key={`weather-${pos}`} 
                              className={`absolute ${x} ${y} flex items-center justify-center w-8 h-8`}
                              style={{ transform }}
                            >
                              <button
                                onClick={() => {
                                  setWeatherPosition(pos);
                                  // Update config immediately when position changes
                                  const updatedConfig = {
                                    ...config,
                                    weather: {
                                      ...config.weather,
                                      position: pos
                                    }
                                  };
                                  saveConfig(updatedConfig);
                                }}
                                className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                                  weatherPosition === pos 
                                    ? 'bg-accent ring-2 ring-accent ring-opacity-70 shadow-md' 
                                    : 'bg-panel-border hover:bg-panel-border-hover border-2 border-panel-border-hover'
                                }`}
                                aria-label={`Weather position ${pos}`}
                                title={pos.replace('-', ' ')}
                              >
                                {weatherPosition === pos && (
                                  <span className="w-2 h-2 bg-white rounded-full"></span>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {/* Weather Refresh Interval */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor="weather-refresh-interval" className="block text-sm font-medium">
                              {t.weatherRefreshInterval}: {weatherRefreshInterval} {t.minutes || 'minutes'}
                            </label>
                          </div>
                          <input
                            id="weather-refresh-interval"
                            type="range"
                            min="30"
                            max="240"
                            step="10"
                            value={weatherRefreshInterval}
                            onChange={(e) => {
                              const newInterval = parseInt(e.target.value);
                              setWeatherRefreshInterval(newInterval);
                              // Force refresh weather data with new interval, but use setTimeout 
                              // to avoid potential infinite refresh loops
                              if (refreshWeather) {
                                setTimeout(() => refreshWeather(true), 50);
                              }
                            }}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>30{t.minutes ? t.minutes.charAt(0) : 'm'}</span>
                            <span>4h</span>
                          </div>
                        </div>
                        
                        {/* Show Weather Countdown Toggle */}
                        <div className="mt-4 flex items-center justify-between">
                          <label htmlFor="show-weather-countdown" className="text-sm">
                            {t.showWeatherCountdown}
                          </label>
                          <input
                            type="checkbox"
                            id="show-weather-countdown"
                            checked={showWeatherCountdown}
                            onChange={(e) => setShowWeatherCountdown(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-500 bg-panel-bg text-accent focus:ring-accent"
                          />
                        </div>
                        
                        {/* Show Air Quality Toggle */}
                        <div className="mt-4 flex items-center justify-between">
                          <label htmlFor="show-air-quality" className="text-sm">
                            {t.showAirQuality || 'Show Air Quality'}
                          </label>
                          <input
                            type="checkbox"
                            id="show-air-quality"
                            checked={showAirQuality}
                            onChange={(e) => setShowAirQuality(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-500 bg-panel-bg text-accent focus:ring-accent"
                          />
                        </div>
                        
                        {/* Weather Refresh Countdown Display */}
                        <div className="mt-4 p-3 bg-panel-bg-hover rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-sm font-medium">{t.nextUpdate}: </span>
                              <span className="text-sm text-accent font-bold">{formattedTimeRemaining}</span>
                            </div>
                            <div>
                              {lastUpdated && (
                                <span className="text-xs text-gray-400">
                                  {t.lastUpdated || 'Last update'}: {lastUpdated.toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-accent h-2.5" 
                              style={{ 
                                width: `${Math.max(0, 100)}%`,
                                transition: 'none'
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Manual Refresh Button */}
                        <button
                          onClick={() => refreshWeather ? refreshWeather() : null}
                          className="mt-4 w-full py-2 px-4 bg-accent text-white rounded hover:bg-accent-hover transition-colors"
                        >
                          {t.refreshWeatherNow}
                        </button>
                        
                        <div className="relative w-full h-40 border border-panel-border rounded-lg p-4 bg-panel-bg/50">
                          <div className="absolute inset-0 border-2 border-panel-border rounded pointer-events-none"></div>
                          {[
                            { pos: 'top-left', x: 'left-4', y: 'top-4', transform: '' },
                            { pos: 'top-right', x: 'right-4', y: 'top-4', transform: '' },
                            { pos: 'top-center', x: 'left-1/2', y: 'top-4', transform: 'translateX(-50%)' },
                            { pos: 'center-left', x: 'left-4', y: 'top-1/2', transform: 'translateY(-50%)' },
                            { pos: 'center', x: 'left-1/2', y: 'top-1/2', transform: 'translate(-50%, -50%)' },
                            { pos: 'center-right', x: 'right-4', y: 'top-1/2', transform: 'translateY(-50%)' },
                            { pos: 'bottom-left', x: 'left-4', y: 'bottom-4', transform: '' },
                            { pos: 'bottom-right', x: 'right-4', y: 'bottom-4', transform: '' },
                            { pos: 'bottom-center', x: 'left-1/2', y: 'bottom-4', transform: 'translateX(-50%)' },
                          ].map(({pos, x, y, transform}) => (
                            <div 
                              key={`weather-${pos}`} 
                              className={`absolute ${x} ${y} flex items-center justify-center w-8 h-8`}
                              style={{ transform }}
                            >
                              <button
                                onClick={() => {
                                  setWeatherPosition(pos);
                                  // Update config immediately when position changes
                                  const updatedConfig = {
                                    ...config,
                                    weather: {
                                      ...config.weather,
                                      position: pos
                                    }
                                  };
                                  saveConfig(updatedConfig);
                                }}
                                className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                                  weatherPosition === pos 
                                    ? 'bg-accent ring-2 ring-accent ring-opacity-70 shadow-md' 
                                    : 'bg-panel-border hover:bg-panel-border-hover border-2 border-panel-border-hover'
                                }`}
                                aria-label={`Weather position ${pos}`}
                                title={pos.replace('-', ' ')}
                              >
                                {weatherPosition === pos && (
                                  <span className="w-2 h-2 bg-white rounded-full"></span>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-panel-border mt-6">
                <button
                  onClick={handleResetToDefaults}
                  className="px-4 py-2 text-sm font-medium bg-panel-bg text-text rounded-md hover:bg-panel-bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                >
                  {t.resetToDefaults}
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                >
                  {t.saveChanges}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Calendar Popin - Date Picker */}
      {showCalendar && enableCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{translations[language].selectDate}</h3>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label={translations[language].close}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Calendar Component */}
            <div className="border-t border-gray-200 pt-4">
              <CalendarPopin 
                initialDate={calendarInitialDate} 
                firstDayOfWeek={firstDayOfWeek}
                language={language}
                events={defaultConfig.dateDisplay?.calendarEvents || []}
                onSelectDate={(date, event) => {
                  // Store the selected date and close the calendar if no event
                  localStorage.setItem('selectedDate', date.toISOString());
                  
                  // If there's no event, close the calendar
                  // Otherwise keep it open to show the event details
                  if (!event) {
                    setShowCalendar(false);
                  }
                }} 
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowCalendar(false)} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                {translations[language].close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App;
