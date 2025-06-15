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
    both: 'Ambos'
  },
  en: {
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
    both: 'Both'
  }
};

export function getTranslation(key: string, language: 'es' | 'en' = 'es'): string {
  return translations[language][key as keyof typeof translations.es] || key;
}