import { useState, useEffect, useRef } from 'react';
import { Cog6ToothIcon, XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import './App.css';
import defaultConfig from './config/defaults.json';

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
    timeSettings: 'Time Settings',
    showTime: 'Show Time',
    timeFormat: 'Time Format',
    timeFormat12h: '12-hour',
    timeFormat24h: '24-hour',
    showSeconds: 'Show Seconds',
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
    fitDescription: 'Fill screen with image (may crop)'
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
    timeSettings: 'Configuración de Hora',
    showTime: 'Mostrar Hora',
    timeFormat: 'Formato de Hora',
    timeFormat12h: '12 horas',
    timeFormat24h: '24 horas',
    showSeconds: 'Mostrar Segundos',
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
    fitDescription: 'Llenar la pantalla con la imagen (puede recortar)'
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
    fitDescription: 'Riempi lo schermo con l\'immagine (potrebbe essere ritagliata)'
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
    timeSettings: 'Uhrzeit-Einstellungen',
    showTime: 'Uhrzeit anzeigen',
    timeFormat: 'Uhrzeit-Format',
    timeFormat12h: '12-Stunden',
    timeFormat24h: '24-Stunden',
    showSeconds: 'Sekunden anzeigen',
    position: 'Position',
    size: 'Größe',
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
    fitDescription: 'Bildschirm mit Bild füllen (kann zugeschnitten werden)'
  },
  zh: {
    settings: '幻灯片设置',
    general: '常规',
    theme: '主题',
    language: '语言',
    showImageCounter: '显示图片计数',
    showCountdown: '显示倒计时',
    rotationTime: '切换时间',
    timeSettings: '时间设置',
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
    fitDescription: '填充屏幕（可能会裁剪图像）'
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
    fitDescription: '画像で画面を埋めます（トリミングされる場合があります）'
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
    timeSettings: 'Paramètres de l\'heure',
    showTime: 'Afficher l\'heure',
    timeFormat: 'Format de l\'heure',
    timeFormat12h: '12 heures',
    timeFormat24h: '24 heures',
    showSeconds: 'Afficher les secondes',
    position: 'Position',
    size: 'Taille',
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
    fitDescription: 'Remplir l\'écran avec l\'image (peut être rognée)'
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const configRef = useRef(null);
  const [showDate, setShowDate] = useState(defaultConfig.dateDisplay.show);
  const [showTime, setShowTime] = useState(defaultConfig.timeDisplay.show);
  const [showImageCounter, setShowImageCounter] = useState(defaultConfig.showImageCounter);
  const [showCountdown, setShowCountdown] = useState(defaultConfig.showCountdown);
  const [language, setLanguage] = useState(defaultConfig.language);
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
        return `${day} ${month} ${date.getFullYear()}`;
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
    { id: 'fade', name: 'Fade' },
    { id: 'slide-right', name: 'Slide Right' },
    { id: 'slide-left', name: 'Slide Left' },
    { id: 'slide-up', name: 'Slide Up' },
    { id: 'slide-down', name: 'Slide Down' },
    { id: 'zoom-in', name: 'Zoom In' },
    { id: 'zoom-out', name: 'Zoom Out' },
    { id: 'rotate', name: 'Rotate' },
    { id: 'flip', name: 'Flip' },
    { id: 'blur', name: 'Blur' },
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
  
  const timeOptions = {
    hour12: !timeFormat24h,
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined
  };

  const currentTime = new Date().toLocaleTimeString(undefined, timeOptions);
  
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
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-16 left-4',
    'bottom-center': 'bottom-16 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-16 right-4'
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

  // Countdown timer and auto-advance slides
  useEffect(() => {
    if (images.length <= 1) return;
    
    let countdownInterval;
    const slideInterval = setInterval(() => {
      if (!isTransitioning) {
        navigateImage('next');
      }
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
  }, [rotationTime, images.length, isTransitioning, showCountdown]);

  // Navigate to next or previous image with transition
  const navigateImage = (direction) => {
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
  };
  
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
  };

  // Save settings
  const handleSaveSettings = () => {
    // In a real app, you would save these settings to a server or local storage
    // For now, we'll just close the config panel
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

        {/* Time Display */}
        {showTime && (
          <div className={`time-display ${positionClasses[timeDisplay.position]} bg-black bg-opacity-50 text-white p-4 rounded-lg transition-all duration-300`}>
            <div className={`${timeSizes[timeDisplay.size]} font-bold text-center`}>
              {currentTime}
            </div>
            
            {/* Date Display - When same position as time */}
            {showDate && timeDisplay.position === dateDisplay.position && (
              <div className="mt-2">
                <div className={`${dateSizes[dateDisplay.size]} font-medium text-center`}>
                  {currentDate}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Date Display - When different position than time */}
        {showDate && (!showTime || timeDisplay.position !== dateDisplay.position) && (
          <div className={`date-display ${positionClasses[dateDisplay.position]} bg-black bg-opacity-50 text-white p-3 rounded-lg transition-all duration-300`}>
            <div className={`${dateSizes[dateDisplay.size]} font-medium text-center`}>
              {currentDate}
            </div>
          </div>
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
                <p className="text-lg font-medium">{t.noImagesFound}</p>
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
                    <h4 className="text-sm font-medium">Transition Effect</h4>
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
                          Transition Duration: {transition.duration}ms
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
                            { pos: 'top-left', x: 'left-4', y: 'top-4' },
                            { pos: 'top-center', x: 'left-1/2', y: 'top-4', transform: '-translate-x-1/2' },
                            { pos: 'top-right', x: 'right-4', y: 'top-4' },
                            { pos: 'center', x: 'left-1/2', y: 'top-1/2', transform: '-translate-x-1/2 -translate-y-1/2' },
                            { pos: 'bottom-left', x: 'left-4', y: 'bottom-4' },
                            { pos: 'bottom-center', x: 'left-1/2', y: 'bottom-4', transform: '-translate-x-1/2' },
                            { pos: 'bottom-right', x: 'right-4', y: 'bottom-4' },
                          ].map(({pos, x, y, transform = ''}) => (
                            <div 
                              key={`time-${pos}`} 
                              className={`absolute ${x} ${y} ${transform} flex items-center justify-center w-8 h-8`}
                              style={{ transform: transform === '-translate-x-1/2 -translate-y-1/2' ? 'translate(-50%, -50%)' : transform === '-translate-x-1/2' ? 'translateX(-50%)' : 'none' }}
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
                            <option key={`time-${value}`} value={value} className="bg-panel-bg">
                              {label}
                            </option>
                          ))}
                        </select>
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
                            { pos: 'top-left', x: 'left-4', y: 'top-4' },
                            { pos: 'top-center', x: 'left-1/2', y: 'top-4', transform: '-translate-x-1/2' },
                            { pos: 'top-right', x: 'right-4', y: 'top-4' },
                            { pos: 'center', x: 'left-1/2', y: 'top-1/2', transform: '-translate-x-1/2 -translate-y-1/2' },
                            { pos: 'bottom-left', x: 'left-4', y: 'bottom-4' },
                            { pos: 'bottom-center', x: 'left-1/2', y: 'bottom-4', transform: '-translate-x-1/2' },
                            { pos: 'bottom-right', x: 'right-4', y: 'bottom-4' },
                          ].map(({pos, x, y, transform = ''}) => (
                            <div 
                              key={`date-${pos}`} 
                              className={`absolute ${x} ${y} ${transform} flex items-center justify-center w-8 h-8`}
                              style={{ transform: transform === '-translate-x-1/2 -translate-y-1/2' ? 'translate(-50%, -50%)' : transform === '-translate-x-1/2' ? 'translateX(-50%)' : 'none' }}
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
                            <option key={`date-size-${value}`} value={value} className="bg-panel-bg">
                              {label}
                            </option>
                          ))}
                        </select>
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
    </div>
  )
}

export default App
