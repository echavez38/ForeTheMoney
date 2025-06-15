import { useState, useEffect } from 'react';
import { PreferencesManager } from '@/lib/preferences';

export const translations = {
  es: {
    // Navigation
    'dashboard': 'Tablero',
    'analytics': 'Analytics',
    'achievements': 'Logros',
    'social': 'Social',
    'notifications': 'Notificaciones',
    'settings': 'Configuración',
    'profile': 'Perfil',
    'subscription': 'Suscripción',
    'game_preferences': 'Preferencias de Juego',
    'notification_preferences': 'Preferencias de Notificación',
    'account': 'Cuenta',
    
    // Golf terms
    'par': 'Par',
    'birdie': 'Birdie',
    'eagle': 'Eagle',
    'hole_in_one': 'Hoyo en Uno',
    'handicap': 'Handicap',
    'round': 'Ronda',
    'course': 'Campo',
    'tee': 'Tee',
    'score': 'Score',
    'stroke_play': 'Stroke Play',
    'match_play': 'Match Play',
    
    // Social
    'feed': 'Feed',
    'friends': 'Amigos',
    'add_friend': 'Agregar Amigo',
    'search_friends': 'Buscar Amigos',
    'leaderboard': 'Tabla de Posiciones',
    'activity': 'Actividad',
    'post': 'Publicación',
    'comment': 'Comentario',
    'like': 'Me Gusta',
    'share': 'Compartir',
    
    // Actions
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'delete': 'Eliminar',
    'edit': 'Editar',
    'create': 'Crear',
    'search': 'Buscar',
    'invite': 'Invitar',
    'accept': 'Aceptar',
    'decline': 'Rechazar',
    
    // Messages
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito',
    'no_data': 'Sin datos',
    'no_friends': 'No tienes amigos aún',
    'no_posts': 'No hay publicaciones',
    'search_placeholder': 'Buscar por nombre o usuario...',
  },
  en: {
    // Navigation
    'dashboard': 'Dashboard',
    'analytics': 'Analytics',
    'achievements': 'Achievements',
    'social': 'Social',
    'notifications': 'Notifications',
    'settings': 'Settings',
    'profile': 'Profile',
    'subscription': 'Subscription',
    'game_preferences': 'Game Preferences',
    'notification_preferences': 'Notification Preferences',
    'account': 'Account',
    
    // Golf terms
    'par': 'Par',
    'birdie': 'Birdie',
    'eagle': 'Eagle',
    'hole_in_one': 'Hole in One',
    'handicap': 'Handicap',
    'round': 'Round',
    'course': 'Course',
    'tee': 'Tee',
    'score': 'Score',
    'stroke_play': 'Stroke Play',
    'match_play': 'Match Play',
    
    // Social
    'feed': 'Feed',
    'friends': 'Friends',
    'add_friend': 'Add Friend',
    'search_friends': 'Search Friends',
    'leaderboard': 'Leaderboard',
    'activity': 'Activity',
    'post': 'Post',
    'comment': 'Comment',
    'like': 'Like',
    'share': 'Share',
    
    // Actions
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'create': 'Create',
    'search': 'Search',
    'invite': 'Invite',
    'accept': 'Accept',
    'decline': 'Decline',
    
    // Messages
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'no_data': 'No data',
    'no_friends': 'You have no friends yet',
    'no_posts': 'No posts available',
    'search_placeholder': 'Search by name or username...',
  }
};

export function useTranslation() {
  const [language, setLanguage] = useState<'es' | 'en'>(() => {
    // Initialize from localStorage or preferences
    const saved = localStorage.getItem('language');
    if (saved && (saved === 'es' || saved === 'en')) {
      return saved;
    }
    
    const preferences = PreferencesManager.getPreferences();
    return preferences.language;
  });

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const changeLanguage = (newLanguage: 'es' | 'en') => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Update preferences
    const preferences = PreferencesManager.getPreferences();
    PreferencesManager.setPreferences({ ...preferences, language: newLanguage });
  };

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const newLanguage = event.detail.language;
      if (newLanguage !== language) {
        setLanguage(newLanguage);
      }
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, [language]);

  useEffect(() => {
    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language' && e.newValue && (e.newValue === 'es' || e.newValue === 'en')) {
        setLanguage(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { t, language, changeLanguage };
}