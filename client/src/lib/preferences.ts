// Preferences management system
export interface UserPreferences {
  distanceUnit: 'meters' | 'yards';
  defaultTees: string;
  defaultBettingAmount: number;
  defaultGameFormat: 'stroke' | 'match' | 'both';
  emailNotifications: boolean;
  theme: 'dark' | 'light' | 'system';
  language: 'es' | 'en';
  fontSize: 'small' | 'medium' | 'large';
  roundReminders: boolean;
  handicapUpdates: boolean;
  friendInvites: boolean;
  achievements: boolean;
  weeklyReports: boolean;
  socialActivity: boolean;
  betResults: boolean;
  courseConditions: boolean;
  sound: boolean;
  vibration: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export const defaultPreferences: UserPreferences = {
  distanceUnit: 'meters',
  defaultTees: 'Azules',
  defaultBettingAmount: 10,
  defaultGameFormat: 'both',
  emailNotifications: true,
  theme: 'dark',
  language: 'es',
  fontSize: 'medium',
  roundReminders: true,
  handicapUpdates: true,
  friendInvites: true,
  achievements: true,
  weeklyReports: false,
  socialActivity: true,
  betResults: true,
  courseConditions: false,
  sound: true,
  vibration: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00'
};

export class PreferencesManager {
  private static readonly STORAGE_KEY = 'userPreferences';
  
  static getPreferences(): UserPreferences {
    if (typeof window === 'undefined') return defaultPreferences;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
    
    return defaultPreferences;
  }
  
  static setPreferences(preferences: Partial<UserPreferences>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      
      // Apply immediate UI changes
      this.applyPreferences(updated);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }
  
  static applyPreferences(preferences: UserPreferences): void {
    if (typeof window === 'undefined') return;
    
    // Apply theme
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    
    // Apply font size
    root.style.fontSize = preferences.fontSize === 'small' ? '14px' : 
                         preferences.fontSize === 'large' ? '18px' : '16px';
    
    // Store language for app-wide access
    localStorage.setItem('language', preferences.language);
    localStorage.setItem('distanceUnit', preferences.distanceUnit);
  }
  
  static initializePreferences(): void {
    const preferences = this.getPreferences();
    this.applyPreferences(preferences);
  }
  
  static clearPreferences(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Language translations
export const translations = {
  es: {
    // Navigation and general
    dashboard: 'Tablero',
    settings: 'Configuración',
    analytics: 'Analíticas', 
    subscription: 'Suscripción',
    logout: 'Cerrar Sesión',
    
    // Settings page
    profile: 'Perfil',
    preferences: 'Preferencias',
    privacy: 'Privacidad',
    personalizeExperience: 'Personaliza tu experiencia de golf',
    gamePreferences: 'Preferencias de Juego',
    configureDefaultPreferences: 'Configura tus preferencias predeterminadas',
    distanceUnit: 'Unidad de Distancia',
    defaultTees: 'Tees Predeterminados',
    defaultBettingAmount: 'Apuesta Predeterminada ($)',
    gameFormat: 'Formato de Juego',
    notifications: 'Notificaciones',
    emailNotifications: 'Envío de actualizaciones',
    interface: 'Interfaz',
    theme: 'Tema',
    language: 'Idioma',
    savePreferences: 'Guardar Preferencias',
    
    // Values
    meters: 'Metros',
    yards: 'Yardas',
    dark: 'Oscuro',
    light: 'Claro',
    system: 'Sistema',
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',
    stroke: 'Stroke Play',
    match: 'Match Play',
    both: 'Ambos',
    spanish: 'Español',
    english: 'Inglés',
    
    // Golf Hub
    golfHub: 'Golf Hub',
    recentRounds: 'Rondas Recientes',
    quickStats: 'Estadísticas Rápidas',
    achievements: 'Logros',
    friends: 'Amigos',
    
    // Create Round
    createRound: 'Crear Ronda',
    selectCourse: 'Seleccionar Campo',
    addPlayers: 'Agregar Jugadores',
    bettingOptions: 'Opciones de Apuestas',
    startRound: 'Comenzar Ronda'
  },
  en: {
    // Navigation and general
    dashboard: 'Dashboard',
    settings: 'Settings',
    analytics: 'Analytics',
    subscription: 'Subscription', 
    logout: 'Logout',
    
    // Settings page
    profile: 'Profile',
    preferences: 'Preferences',
    privacy: 'Privacy',
    personalizeExperience: 'Personalize your golf experience',
    gamePreferences: 'Game Preferences',
    configureDefaultPreferences: 'Configure your default preferences',
    distanceUnit: 'Distance Unit',
    defaultTees: 'Default Tees',
    defaultBettingAmount: 'Default Betting Amount ($)',
    gameFormat: 'Game Format',
    notifications: 'Notifications',
    emailNotifications: 'Email updates',
    interface: 'Interface',
    theme: 'Theme',
    language: 'Language',
    savePreferences: 'Save Preferences',
    
    // Values
    meters: 'Meters',
    yards: 'Yards',
    dark: 'Dark',
    light: 'Light',
    system: 'System',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    stroke: 'Stroke Play',
    match: 'Match Play',
    both: 'Both',
    spanish: 'Spanish',
    english: 'English',
    
    // Golf Hub
    golfHub: 'Golf Hub',
    recentRounds: 'Recent Rounds',
    quickStats: 'Quick Stats',
    achievements: 'Achievements',
    friends: 'Friends',
    
    // Create Round
    createRound: 'Create Round',
    selectCourse: 'Select Course',
    addPlayers: 'Add Players',
    bettingOptions: 'Betting Options',
    startRound: 'Start Round'
  }
};

export function getTranslation(key: string, language: 'es' | 'en' = 'es'): string {
  return translations[language][key as keyof typeof translations.es] || key;
}

// Hook for using translations in components
export function useTranslation() {
  const currentLang = (typeof window !== 'undefined' ? localStorage.getItem('language') : 'es') as 'es' | 'en' || 'es';
  
  return {
    t: (key: string) => getTranslation(key, currentLang),
    language: currentLang
  };
}