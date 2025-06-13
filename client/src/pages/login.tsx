import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PinInput } from '@/components/ui/pin-input';
import { StorageManager } from '@/lib/storage';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [handicap, setHandicap] = useState('18');
  const { toast } = useToast();

  const handleLogin = () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu nombre",
        variant: "destructive",
      });
      return;
    }

    if (pin.length !== 4) {
      toast({
        title: "Error", 
        description: "El PIN debe tener 4 dígitos",
        variant: "destructive",
      });
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: name.trim(),
      pin,
      handicap: parseInt(handicap) || 18,
    };

    StorageManager.saveUser(user);
    toast({
      title: "¡Bienvenido!",
      description: `Hola ${user.name}, tu sesión ha sido guardada`,
    });
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-dark-bg">
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-golf-green rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-golf-ball text-3xl text-white"></i>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Fore the Money</h1>
        <p className="text-gray-400">Tu app de apuestas de golf</p>
      </div>

      <Card className="bg-dark-surface border-gray-700">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-center text-white">
            Iniciar Sesión
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre
              </label>
              <Input
                type="text"
                placeholder="Ingresa tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-dark-card border-gray-600 text-white placeholder-gray-400 focus:border-golf-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Handicap
              </label>
              <Input
                type="number"
                placeholder="18"
                value={handicap}
                onChange={(e) => setHandicap(e.target.value)}
                min="0"
                max="54"
                className="bg-dark-card border-gray-600 text-white placeholder-gray-400 focus:border-golf-green"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                PIN (4 dígitos)
              </label>
              <PinInput
                value={pin}
                onChange={setPin}
                className="mb-4"
              />
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-golf-green text-white py-3 mt-6 font-semibold hover:bg-golf-light transition-colors"
          >
            Entrar
          </Button>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <p className="text-gray-400 text-sm">
          ¿Primera vez? Tu PIN se guardará de forma segura
        </p>
      </div>
    </div>
  );
}
