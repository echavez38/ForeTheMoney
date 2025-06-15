import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, BellOff, Calendar, Trophy, Users, Star, 
  TrendingUp, MessageSquare, Gift, AlertCircle,
  Check, X, Settings, Volume2, VolumeX, Clock
} from 'lucide-react';

interface NotificationSettings {
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
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'social' | 'update' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationSystemProps {
  className?: string;
}

export function NotificationSystem({ className }: NotificationSystemProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
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
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Initialize notifications and check permission
  useEffect(() => {
    checkNotificationPermission();
    loadNotifications();
    
    // Service Worker registration for push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      registerServiceWorker();
    }
  }, []);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Notificaciones habilitadas",
          description: "Ahora recibirás notificaciones de golf importantes",
        });
        
        // Register for push notifications
        await registerPushNotifications();
      } else {
        toast({
          title: "Notificaciones bloqueadas",
          description: "Puedes habilitarlas desde la configuración del navegador",
          variant: "destructive",
        });
      }
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const registerPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || '')
      });
      
      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Push notification registration failed:', error);
    }
  };

  const urlB64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const loadNotifications = () => {
    // Mock notifications - en producción vendrían del API
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'reminder',
        title: 'Ronda programada',
        message: 'Tienes una ronda mañana a las 08:00 en Club Campestre',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
        actionUrl: '/scorecard',
        actionText: 'Ver detalles',
        priority: 'high'
      },
      {
        id: '2',
        type: 'achievement',
        title: '¡Nuevo logro desbloqueado!',
        message: 'Has conseguido el logro "Maestro de Birdies"',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: false,
        actionUrl: '/analytics',
        actionText: 'Ver logros',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'social',
        title: 'Carlos te ha invitado',
        message: 'Carlos Mendoza te invita a una ronda el sábado',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isRead: true,
        actionUrl: '/multiplayer',
        actionText: 'Responder',
        priority: 'medium'
      },
      {
        id: '4',
        type: 'update',
        title: 'Handicap actualizado',
        message: 'Tu handicap oficial GHIN ha sido actualizado a 16.2',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isRead: true,
        priority: 'low'
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const showLocalNotification = (notification: Notification) => {
    if (permission === 'granted' && settings.sound) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
        data: notification.actionUrl ? {
          actionUrl: notification.actionUrl,
          actionText: notification.actionText || 'Ver'
        } : undefined
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const updateSettings = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Save to API
    fetch('/api/notifications/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value })
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'social': return <Users className="h-4 w-4 text-green-500" />;
      case 'update': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'alert': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-green-500';
      default: return '';
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    return `hace ${diffDays}d`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Notificaciones</h2>
          <p className="text-gray-400">
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
          </p>
        </div>
        
        <div className="flex gap-2">
          {permission !== 'granted' && (
            <Button
              onClick={requestNotificationPermission}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Bell className="h-4 w-4 mr-2" />
              Habilitar
            </Button>
          )}
          
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Marcar todas
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-dark-card border-gray-600">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {permission !== 'granted' && (
            <Card className="bg-yellow-600/20 border-yellow-600">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-200 font-semibold">Notificaciones deshabilitadas</h4>
                    <p className="text-yellow-100 text-sm mt-1">
                      Habilita las notificaciones para recibir recordatorios importantes sobre tus rondas de golf.
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-2 bg-yellow-600 hover:bg-yellow-700"
                      onClick={requestNotificationPermission}
                    >
                      Habilitar ahora
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card key={notification.id} className={`bg-dark-card border-gray-600 ${getPriorityColor(notification.priority)} ${
                !notification.isRead ? 'bg-gray-800/50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={`font-semibold ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-300' : 'text-gray-400'}`}>
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                          
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      {notification.actionUrl && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              markAsRead(notification.id);
                              // Navigate to actionUrl
                            }}
                          >
                            {notification.actionText}
                          </Button>
                          
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Marcar leída
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {notifications.length === 0 && (
              <Card className="bg-dark-card border-gray-600">
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-white font-semibold mb-2">No hay notificaciones</h3>
                  <p className="text-gray-400">Cuando tengas nuevas notificaciones aparecerán aquí</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Tipos de Notificaciones</CardTitle>
              <CardDescription className="text-gray-400">
                Elige qué notificaciones quieres recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <Label className="text-white">Recordatorios de rondas</Label>
                      <p className="text-sm text-gray-400">Rondas programadas y próximas</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.roundReminders}
                    onCheckedChange={(checked) => updateSettings('roundReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <div>
                      <Label className="text-white">Actualizaciones de handicap</Label>
                      <p className="text-sm text-gray-400">Cambios en tu handicap GHIN</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.handicapUpdates}
                    onCheckedChange={(checked) => updateSettings('handicapUpdates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-green-500" />
                    <div>
                      <Label className="text-white">Invitaciones de amigos</Label>
                      <p className="text-sm text-gray-400">Invitaciones a rondas multijugador</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.friendInvites}
                    onCheckedChange={(checked) => updateSettings('friendInvites', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <div>
                      <Label className="text-white">Logros y achievements</Label>
                      <p className="text-sm text-gray-400">Nuevos logros desbloqueados</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.achievements}
                    onCheckedChange={(checked) => updateSettings('achievements', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <div>
                      <Label className="text-white">Actividad social</Label>
                      <p className="text-sm text-gray-400">Comentarios y likes en tus rondas</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.socialActivity}
                    onCheckedChange={(checked) => updateSettings('socialActivity', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-orange-500" />
                    <div>
                      <Label className="text-white">Resultados de apuestas</Label>
                      <p className="text-sm text-gray-400">Ganancias y pérdidas</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.betResults}
                    onCheckedChange={(checked) => updateSettings('betResults', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Configuración de Sonido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.sound ? (
                    <Volume2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-gray-500" />
                  )}
                  <div>
                    <Label className="text-white">Sonidos de notificación</Label>
                    <p className="text-sm text-gray-400">Reproducir sonido al recibir notificaciones</p>
                  </div>
                </div>
                <Switch
                  checked={settings.sound}
                  onCheckedChange={(checked) => updateSettings('sound', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <Label className="text-white">Horario silencioso</Label>
                    <p className="text-sm text-gray-400">No molestar durante ciertas horas</p>
                  </div>
                </div>
                <Switch
                  checked={settings.quietHours.enabled}
                  onCheckedChange={(checked) => updateSettings('quietHours', { ...settings.quietHours, enabled: checked })}
                />
              </div>

              {settings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-7">
                  <div>
                    <Label className="text-white text-sm">Desde</Label>
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) => updateSettings('quietHours', { ...settings.quietHours, start: e.target.value })}
                      className="w-full mt-1 p-2 bg-dark-card border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm">Hasta</Label>
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) => updateSettings('quietHours', { ...settings.quietHours, end: e.target.value })}
                      className="w-full mt-1 p-2 bg-dark-card border border-gray-600 rounded text-white"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NotificationSystem;