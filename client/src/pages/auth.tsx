import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StorageManager } from '@/lib/storage';
import { InteractiveBackground } from '@/components/interactive-background';
import { FloatingElement } from '@/components/floating-ui-elements';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, Shield, Key, Check, X } from 'lucide-react';

interface RegisterFormData {
  email: string;
  username: string;
  name: string;
  handicap: number;
  authType: 'pin' | 'password';
  pin: string;
  password: string;
}

interface LoginFormData {
  identifier: string;
  credential: string;
}

export default function Auth() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Form states
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    email: '',
    username: '',
    name: '',
    handicap: 18,
    authType: 'pin',
    pin: '',
    password: ''
  });
  
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    identifier: '',
    credential: ''
  });

  // Validation states
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false
  });

  // Check for existing session
  useEffect(() => {
    const user = StorageManager.getUser();
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Real-time email availability check
  useEffect(() => {
    const checkEmail = async () => {
      if (registerForm.email && registerForm.email.includes('@')) {
        try {
          const response = await fetch(`/api/auth/check-email/${encodeURIComponent(registerForm.email)}`);
          const data = await response.json();
          setEmailAvailable(data.available);
        } catch (error) {
          console.error('Error checking email:', error);
        }
      } else {
        setEmailAvailable(null);
      }
    };

    const debounceTimer = setTimeout(checkEmail, 500);
    return () => clearTimeout(debounceTimer);
  }, [registerForm.email]);

  // Real-time username availability check
  useEffect(() => {
    const checkUsername = async () => {
      if (registerForm.username && registerForm.username.length >= 3) {
        try {
          const response = await fetch(`/api/auth/check-username/${encodeURIComponent(registerForm.username)}`);
          const data = await response.json();
          setUsernameAvailable(data.available);
        } catch (error) {
          console.error('Error checking username:', error);
        }
      } else {
        setUsernameAvailable(null);
      }
    };

    const debounceTimer = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounceTimer);
  }, [registerForm.username]);

  // Password strength validation
  useEffect(() => {
    if (registerForm.authType === 'password') {
      const password = registerForm.password;
      setPasswordStrength({
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[@$!%*?&]/.test(password),
        hasMinLength: password.length >= 8
      });
    }
  }, [registerForm.password, registerForm.authType]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data
        StorageManager.saveUser({
          id: data.id.toString(),
          name: data.name,
          pin: data.pin || data.username, // Fallback for compatibility
          handicap: data.handicap
        });

        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada correctamente",
        });

        navigate('/dashboard');
      } else {
        toast({
          title: "Error de registro",
          description: data.error || "No se pudo crear la cuenta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data
        StorageManager.saveUser({
          id: data.id.toString(),
          name: data.name,
          pin: data.pin || data.username, // Fallback for compatibility
          handicap: data.handicap
        });

        toast({
          title: "Bienvenido",
          description: `Hola ${data.name}, sesión iniciada correctamente`,
        });

        navigate('/dashboard');
      } else {
        toast({
          title: "Error de autenticación",
          description: data.error || "Credenciales incorrectas",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomPin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setRegisterForm({ ...registerForm, pin });
  };

  const isRegisterFormValid = () => {
    const basicValid = registerForm.email && 
                      registerForm.username && 
                      registerForm.name && 
                      emailAvailable && 
                      usernameAvailable;

    if (registerForm.authType === 'pin') {
      return basicValid && registerForm.pin.length === 6;
    } else {
      return basicValid && 
             passwordStrength.hasUpper && 
             passwordStrength.hasLower && 
             passwordStrength.hasNumber && 
             passwordStrength.hasSpecial && 
             passwordStrength.hasMinLength;
    }
  };

  const isLoginFormValid = () => {
    return loginForm.identifier.trim() && loginForm.credential.trim();
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Interactive Background */}
      <InteractiveBackground intensity="medium" theme="golf" />
      
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <FloatingElement delay={0} intensity="moderate">
          <Card className="w-full max-w-md bg-dark-surface/90 backdrop-blur-md border-gray-700/50 shadow-2xl">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-white">Fore the Money</CardTitle>
              <p className="text-gray-400">Golf Scoring & Betting App</p>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-dark-card">
                  <TabsTrigger value="login" className="data-[state=active]:bg-golf-green">
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-golf-green">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrarse
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label className="text-white">Email o Username</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={loginForm.identifier}
                          onChange={(e) => setLoginForm({...loginForm, identifier: e.target.value})}
                          placeholder="tu@email.com o tu_username"
                          className="bg-dark-card border-gray-600 text-white pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">PIN o Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={loginForm.credential}
                          onChange={(e) => setLoginForm({...loginForm, credential: e.target.value})}
                          placeholder="123456 o tu contraseña"
                          className="bg-dark-card border-gray-600 text-white pl-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={!isLoginFormValid() || isLoading}
                      className="w-full bg-golf-green hover:bg-golf-light py-3 font-semibold"
                    >
                      {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Email */}
                    <div>
                      <Label className="text-white">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                          placeholder="tu@email.com"
                          className="bg-dark-card border-gray-600 text-white pl-10 pr-10"
                          required
                        />
                        {emailAvailable !== null && (
                          <div className="absolute right-3 top-3">
                            {emailAvailable ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <X className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        )}
                      </div>
                      {emailAvailable === false && (
                        <p className="text-red-400 text-xs mt-1">Este email ya está registrado</p>
                      )}
                    </div>

                    {/* Username */}
                    <div>
                      <Label className="text-white">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                          placeholder="tu_username"
                          className="bg-dark-card border-gray-600 text-white pl-10 pr-10"
                          pattern="[a-zA-Z0-9_]+"
                          required
                        />
                        {usernameAvailable !== null && (
                          <div className="absolute right-3 top-3">
                            {usernameAvailable ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <X className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        )}
                      </div>
                      {usernameAvailable === false && (
                        <p className="text-red-400 text-xs mt-1">Este username ya está en uso</p>
                      )}
                    </div>

                    {/* Name */}
                    <div>
                      <Label className="text-white">Nombre Completo</Label>
                      <Input
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                        placeholder="Tu Nombre"
                        className="bg-dark-card border-gray-600 text-white"
                        required
                      />
                    </div>

                    {/* Handicap */}
                    <div>
                      <Label className="text-white">Handicap</Label>
                      <Input
                        type="number"
                        min="0"
                        max="54"
                        value={registerForm.handicap}
                        onChange={(e) => setRegisterForm({...registerForm, handicap: parseInt(e.target.value) || 18})}
                        className="bg-dark-card border-gray-600 text-white"
                      />
                    </div>

                    {/* Auth Type Selection */}
                    <div>
                      <Label className="text-white mb-3 block">Tipo de Autenticación</Label>
                      <RadioGroup
                        value={registerForm.authType}
                        onValueChange={(value: 'pin' | 'password') => setRegisterForm({...registerForm, authType: value})}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg hover:border-golf-green transition-colors">
                          <RadioGroupItem value="pin" id="pin" />
                          <Label htmlFor="pin" className="text-white flex items-center">
                            <Key className="h-4 w-4 mr-2" />
                            PIN (6 dígitos)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg hover:border-golf-green transition-colors">
                          <RadioGroupItem value="password" id="password" />
                          <Label htmlFor="password" className="text-white flex items-center">
                            <Shield className="h-4 w-4 mr-2" />
                            Contraseña
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* PIN Input */}
                    {registerForm.authType === 'pin' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-white">PIN (6 dígitos)</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={generateRandomPin}
                            className="text-golf-green hover:text-golf-light"
                          >
                            Generar PIN
                          </Button>
                        </div>
                        <Input
                          type="text"
                          value={registerForm.pin}
                          onChange={(e) => setRegisterForm({...registerForm, pin: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                          placeholder="123456"
                          maxLength={6}
                          className="bg-dark-card border-gray-600 text-white text-center text-lg font-mono"
                        />
                      </div>
                    )}

                    {/* Password Input */}
                    {registerForm.authType === 'password' && (
                      <div>
                        <Label className="text-white">Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                            placeholder="Tu contraseña segura"
                            className="bg-dark-card border-gray-600 text-white pl-10 pr-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        
                        {/* Password Strength Indicators */}
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center space-x-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${passwordStrength.hasMinLength ? 'bg-green-400' : 'bg-gray-600'}`} />
                            <span className={passwordStrength.hasMinLength ? 'text-green-400' : 'text-gray-400'}>
                              Mínimo 8 caracteres
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${passwordStrength.hasUpper ? 'bg-green-400' : 'bg-gray-600'}`} />
                            <span className={passwordStrength.hasUpper ? 'text-green-400' : 'text-gray-400'}>
                              Una mayúscula
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${passwordStrength.hasLower ? 'bg-green-400' : 'bg-gray-600'}`} />
                            <span className={passwordStrength.hasLower ? 'text-green-400' : 'text-gray-400'}>
                              Una minúscula
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${passwordStrength.hasNumber ? 'bg-green-400' : 'bg-gray-600'}`} />
                            <span className={passwordStrength.hasNumber ? 'text-green-400' : 'text-gray-400'}>
                              Un número
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${passwordStrength.hasSpecial ? 'bg-green-400' : 'bg-gray-600'}`} />
                            <span className={passwordStrength.hasSpecial ? 'text-green-400' : 'text-gray-400'}>
                              Un carácter especial (@$!%*?&)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={!isRegisterFormValid() || isLoading}
                      className="w-full bg-golf-green hover:bg-golf-light py-3 font-semibold"
                    >
                      {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </FloatingElement>
      </div>
    </div>
  );
}