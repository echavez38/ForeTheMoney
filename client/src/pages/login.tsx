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
        <div className="w-20 h-20 bg-golf-blue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-3xl font-bold text-white">⛳</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 text-shadow-sm">Fore the Money</h1>
        <p className="text-secondary">Scorecard inteligente de golf</p>
      </div>

      <Card className="bg-dark-surface border-gray-700 shadow-2xl rounded-2xl">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold mb-8 text-center text-white">
            Configurar Jugador
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">
                Nombre del Jugador
              </label>
              <Input
                type="text"
                placeholder="Tu nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-dark-card border-gray-600 text-white placeholder-gray-400 focus:border-golf-blue h-12 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-3">
                Handicap de Golf
              </label>
              <Input
                type="number"
                placeholder="18"
                value={handicap}
                onChange={(e) => setHandicap(e.target.value)}
                min="0"
                max="54"
                className="bg-dark-card border-gray-600 text-white placeholder-gray-400 focus:border-golf-blue h-12 rounded-xl"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-4">
                PIN de Seguridad (4 dígitos)
              </label>
              <div className="flex justify-center">
                <PinInput
                  value={pin}
                  onChange={setPin}
                  className="mb-4"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-golf-blue text-white py-4 mt-8 font-semibold hover:bg-golf-blue-dark transition-all duration-200 rounded-xl h-14 text-lg"
          >
            Comenzar Partida
          </Button>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <p className="text-secondary text-sm">
          Tu información se guarda localmente en tu dispositivo
        </p>
      </div>
    </div>
  );
}
