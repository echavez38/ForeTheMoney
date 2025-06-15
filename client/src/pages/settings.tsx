import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { StorageManager } from '@/lib/storage';
import { PreferencesManager, type UserPreferences as PrefsType } from '@/lib/preferences';
import { 
  User, Mail, Shield, Bell, CreditCard, Database, 
  Palette, Globe, ArrowLeft, Save, Crown, Trash2,
  Eye, EyeOff, Check, AlertTriangle, Settings as SettingsIcon
} from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  username: string;
  handicap: number;
  ghinNumber?: string;
  authType: 'pin' | 'password';
  handicapVerified: boolean;
  subscriptionType: string;
  roundsThisMonth: number;
}

interface UserPreferences {
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

interface SubscriptionInfo {
  type: string;
  isPremium: boolean;
  roundsThisMonth: number;
  limits: {
    maxRoundsPerMonth: number;
    maxPlayersPerRound: number;
    hasAdvancedBetting: boolean;
    hasMultiplayer: boolean;
    hasAnalytics: boolean;
    hasCloudBackup: boolean;
  };
}

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form states
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({});
  const [preferencesForm, setPreferencesForm] = useState<UserPreferences>({
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
  });
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPin, setNewPin] = useState('');

  // Get current user
  const currentUser = StorageManager.getUser();

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/users', currentUser?.id],
    enabled: !!currentUser?.id
  });

  // Fetch user preferences
  const { data: userPreferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['/api/users', currentUser?.id, 'preferences'],
    enabled: !!currentUser?.id
  });

  // Fetch subscription info
  const { data: subscriptionInfo } = useQuery<SubscriptionInfo>({
    queryKey: ['/api/subscription/info', currentUser?.id],
    enabled: !!currentUser?.id
  });

  // Initialize forms when data loads
  useEffect(() => {
    if (userProfile) {
      setProfileForm(userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userPreferences && typeof userPreferences === 'object') {
      console.log('Loading user preferences:', userPreferences);
      setPreferencesForm(prevForm => ({
        ...prevForm,
        ...userPreferences
      } as UserPreferences));
    }
  }, [userPreferences]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await fetch(`/api/users/${currentUser?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Perfil actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { newPassword?: string; newPin?: string }) => {
      const response = await fetch(`/api/auth/change-credentials/${currentUser?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to change credentials');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Credenciales actualizadas",
        description: "Tu PIN/contraseña ha sido cambiado correctamente.",
      });
      setNewPassword('');
      setConfirmPassword('');
      setNewPin('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar las credenciales",
        variant: "destructive",
      });
    }
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${currentUser?.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete account');
      return response.json();
    },
    onSuccess: () => {
      StorageManager.clearUser();
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada permanentemente.",
      });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la cuenta",
        variant: "destructive",
      });
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<UserPreferences>) => {
      const response = await fetch(`/api/users/${currentUser?.id}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferencias guardadas",
        description: "Tus configuraciones han sido guardadas correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', currentUser?.id, 'preferences'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron guardar las preferencias",
        variant: "destructive",
      });
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate(preferencesForm);
    
    // Apply preferences immediately to local storage for instant UI updates
    if (typeof window !== 'undefined') {
      localStorage.setItem('userPreferences', JSON.stringify(preferencesForm));
      
      // Apply theme changes immediately
      if (preferencesForm.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Force a page refresh if language changed to apply new language
      const currentLang = localStorage.getItem('language') || 'es';
      if (preferencesForm.language !== currentLang) {
        localStorage.setItem('language', preferencesForm.language);
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  const handleChangeCredentials = () => {
    if (profileForm.authType === 'password') {
      if (newPassword !== confirmPassword) {
        toast({
          title: "Error",
          description: "Las contraseñas no coinciden",
          variant: "destructive",
        });
        return;
      }
      if (newPassword.length < 8) {
        toast({
          title: "Error",
          description: "La contraseña debe tener al menos 8 caracteres",
          variant: "destructive",
        });
        return;
      }
      changePasswordMutation.mutate({ newPassword });
    } else {
      if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
        toast({
          title: "Error",
          description: "El PIN debe tener exactamente 6 dígitos",
          variant: "destructive",
        });
        return;
      }
      changePasswordMutation.mutate({ newPin });
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      deleteAccountMutation.mutate();
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="text-center text-white">Cargando configuración...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 p-4">
      <div className="max-w-4xl mx-auto pt-20 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/dashboard')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Configuración</h1>
            <p className="text-green-100">Personaliza tu experiencia de golf</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-dark-card border-gray-600">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Preferencias
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Suscripción
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacidad
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-dark-card border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Actualiza tu información de perfil y credenciales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Nombre Completo</Label>
                    <Input
                      value={profileForm.name || ''}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="bg-dark-card border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Email</Label>
                    <Input
                      type="email"
                      value={profileForm.email || ''}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="bg-dark-card border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Username</Label>
                    <Input
                      value={profileForm.username || ''}
                      onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                      className="bg-dark-card border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Handicap</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="54"
                        value={profileForm.handicap || 18}
                        onChange={(e) => setProfileForm({...profileForm, handicap: parseInt(e.target.value) || 18})}
                        className="bg-dark-card border-gray-600 text-white"
                      />
                      {profileForm.handicapVerified && (
                        <Badge variant="secondary" className="bg-green-600 text-white">
                          <Check className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* GHIN Section */}
                <div>
                  <Label className="text-white">Número GHIN</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={profileForm.ghinNumber || ''}
                      onChange={(e) => setProfileForm({...profileForm, ghinNumber: e.target.value.replace(/\D/g, '').slice(0, 8)})}
                      placeholder="12345678"
                      maxLength={8}
                      className="bg-dark-card border-gray-600 text-white"
                    />
                    <Button variant="outline" size="sm" className="border-gray-600 text-white">
                      <Shield className="h-4 w-4 mr-1" />
                      Verificar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Verifica tu handicap oficial con USGA GHIN
                  </p>
                </div>

                <Separator className="bg-gray-600" />

                {/* Change Credentials */}
                <div>
                  <Label className="text-white">Cambiar Credenciales</Label>
                  <div className="space-y-3 mt-2">
                    <Select 
                      value={profileForm.authType || 'pin'} 
                      onValueChange={(value: 'pin' | 'password') => setProfileForm({...profileForm, authType: value})}
                    >
                      <SelectTrigger className="bg-dark-card border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pin">PIN (6 dígitos)</SelectItem>
                        <SelectItem value="password">Contraseña</SelectItem>
                      </SelectContent>
                    </Select>

                    {profileForm.authType === 'password' ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Nueva contraseña"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-dark-card border-gray-600 text-white pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirmar contraseña"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-dark-card border-gray-600 text-white"
                        />
                      </div>
                    ) : (
                      <Input
                        type="text"
                        placeholder="Nuevo PIN (6 dígitos)"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="bg-dark-card border-gray-600 text-white"
                      />
                    )}

                    <Button 
                      onClick={handleChangeCredentials}
                      disabled={changePasswordMutation.isPending}
                      className="w-full"
                    >
                      {changePasswordMutation.isPending ? 'Actualizando...' : 'Actualizar Credenciales'}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card className="bg-dark-card border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Preferencias de Juego
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configura tus preferencias predeterminadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Unidad de Distancia</Label>
                    <Select value={preferencesForm.distanceUnit} onValueChange={(value: 'meters' | 'yards') => setPreferencesForm({...preferencesForm, distanceUnit: value})}>
                      <SelectTrigger className="bg-dark-card border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meters">Metros</SelectItem>
                        <SelectItem value="yards">Yardas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Tees Predeterminados</Label>
                    <Select value={preferencesForm.defaultTees} onValueChange={(value) => setPreferencesForm({...preferencesForm, defaultTees: value})}>
                      <SelectTrigger className="bg-dark-card border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Negras">Negras</SelectItem>
                        <SelectItem value="Azules">Azules</SelectItem>
                        <SelectItem value="Blancas (H)">Blancas (Hombres)</SelectItem>
                        <SelectItem value="Blancas (M)">Blancas (Mujeres)</SelectItem>
                        <SelectItem value="Doradas">Doradas</SelectItem>
                        <SelectItem value="Plateadas">Plateadas</SelectItem>
                        <SelectItem value="Rojas">Rojas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Apuesta Predeterminada ($)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={preferencesForm.defaultBettingAmount}
                      onChange={(e) => setPreferencesForm({...preferencesForm, defaultBettingAmount: parseInt(e.target.value) || 10})}
                      className="bg-dark-card border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Formato de Juego</Label>
                    <Select value={preferencesForm.defaultGameFormat} onValueChange={(value: 'stroke' | 'match' | 'both') => setPreferencesForm({...preferencesForm, defaultGameFormat: value})}>
                      <SelectTrigger className="bg-dark-card border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stroke">Solo Stroke Play</SelectItem>
                        <SelectItem value="match">Solo Match Play</SelectItem>
                        <SelectItem value="both">Ambos Formatos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="bg-gray-600" />

                <div>
                  <Label className="text-white flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notificaciones
                  </Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Emails de actualizaciones</span>
                      <Switch 
                        checked={preferencesForm.emailNotifications}
                        onCheckedChange={(checked) => setPreferencesForm({...preferencesForm, emailNotifications: checked})}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-600" />

                <div>
                  <Label className="text-white flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Interfaz
                  </Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label className="text-gray-300">Tema</Label>
                      <Select value={preferencesForm.theme} onValueChange={(value: 'dark' | 'light' | 'system') => setPreferencesForm({...preferencesForm, theme: value})}>
                        <SelectTrigger className="bg-dark-card border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">Oscuro</SelectItem>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Idioma</Label>
                      <Select value={preferencesForm.language} onValueChange={(value: 'es' | 'en') => setPreferencesForm({...preferencesForm, language: value})}>
                        <SelectTrigger className="bg-dark-card border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSavePreferences}
                    disabled={updatePreferencesMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updatePreferencesMutation.isPending ? 'Guardando...' : 'Guardar Preferencias'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-4">
            <Card className="bg-dark-card border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Mi Suscripción
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Gestiona tu plan y facturación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscriptionInfo ? (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div>
                        <h3 className="text-white font-semibold">
                          {subscriptionInfo.type === 'free' ? 'Plan Básico Golf' : 'Plan Pro Golfer'}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {subscriptionInfo.type === 'free' 
                            ? 'Gratis para siempre' 
                            : '$4.99/mes - Renovación automática'
                          }
                        </p>
                      </div>
                      <Badge variant={subscriptionInfo.isPremium ? "default" : "secondary"}>
                        {subscriptionInfo.isPremium ? 'Premium' : 'Básico'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-sm">Rondas este mes</p>
                        <p className="text-white text-lg font-semibold">
                          {subscriptionInfo.limits.maxRoundsPerMonth === -1 
                            ? 'Ilimitadas' 
                            : `${subscriptionInfo.roundsThisMonth}/${subscriptionInfo.limits.maxRoundsPerMonth}`
                          }
                        </p>
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-sm">Jugadores máximos</p>
                        <p className="text-white text-lg font-semibold">
                          {subscriptionInfo.limits.maxPlayersPerRound}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Funciones incluidas:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-gray-300">Betting básico</span>
                        </div>
                        {subscriptionInfo.limits.hasAdvancedBetting && (
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-gray-300">Betting avanzado</span>
                          </div>
                        )}
                        {subscriptionInfo.limits.hasMultiplayer && (
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-gray-300">Multijugador</span>
                          </div>
                        )}
                        {subscriptionInfo.limits.hasAnalytics && (
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-gray-300">Analytics avanzado</span>
                          </div>
                        )}
                        {subscriptionInfo.limits.hasCloudBackup && (
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-gray-300">Backup en la nube</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!subscriptionInfo.isPremium && (
                      <Button 
                        onClick={() => setLocation('/subscription')}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Actualizar a Premium
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-400">Cargando información de suscripción...</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <Card className="bg-dark-card border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Datos y Privacidad
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Controla tus datos y configuración de privacidad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-800">
                    <Database className="h-4 w-4 mr-2" />
                    Exportar Historial de Rondas
                  </Button>
                  
                  <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-800">
                    <Mail className="h-4 w-4 mr-2" />
                    Descargar Mis Datos
                  </Button>
                </div>

                <Separator className="bg-gray-600" />

                <Alert className="border-red-600 bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-200">
                    <strong>Zona de Peligro:</strong> Las siguientes acciones son permanentes e irreversibles.
                  </AlertDescription>
                </Alert>

                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteAccountMutation.isPending ? 'Eliminando...' : 'Eliminar Cuenta Permanentemente'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}