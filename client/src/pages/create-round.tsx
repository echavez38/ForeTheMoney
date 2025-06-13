import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { StorageManager } from '@/lib/storage';
import { User, Round, RoundPlayer, BettingOptions, TeeSelection, TEE_OPTIONS } from '@/lib/types';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CreateRound() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [holes, setHoles] = useState<9 | 18>(18);
  const [course, setCourse] = useState('Club Campestre de Puebla');
  const [players, setPlayers] = useState<Omit<RoundPlayer, 'scores' | 'grossTotal' | 'netTotal' | 'moneyBalance'>[]>([]);
  const [bettingOptions, setBettingOptions] = useState<BettingOptions>({
    skins: false,
    oyeses: true,
    foursomes: false,
    unitPerHole: 1.0,
  });
  const [selectedTees, setSelectedTees] = useState<TeeSelection>(TEE_OPTIONS[2]); // Default to Blancas (ambos géneros)
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerHandicap, setNewPlayerHandicap] = useState('18');
  const { toast } = useToast();

  useEffect(() => {
    const userData = StorageManager.getUser();
    if (!userData) {
      setLocation('/');
      return;
    }
    setUser(userData);
    
    // Add current user as first player
    setPlayers([{
      id: userData.id,
      name: userData.name,
      handicap: userData.handicap,
      selectedTee: TEE_OPTIONS[2], // Default to Blancas
    }]);
  }, [setLocation]);

  const addPlayer = () => {
    if (!newPlayerName.trim()) {
      toast({
        title: "Error",
        description: "Ingresa el nombre del jugador",
        variant: "destructive",
      });
      return;
    }

    if (players.length >= 6) {
      toast({
        title: "Límite alcanzado",
        description: "Máximo 6 jugadores por ronda",
        variant: "destructive",
      });
      return;
    }

    const newPlayer = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      handicap: parseInt(newPlayerHandicap) || 18,
      selectedTee: TEE_OPTIONS[2], // Default to Blancas
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    setNewPlayerHandicap('18');
  };

  const removePlayer = (playerId: string) => {
    if (user && playerId === user.id) {
      toast({
        title: "Error",
        description: "No puedes eliminarte de la ronda",
        variant: "destructive",
      });
      return;
    }
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const updatePlayerTee = (playerId: string, tee: TeeSelection) => {
    setPlayers(players.map(player => 
      player.id === playerId 
        ? { ...player, selectedTee: tee }
        : player
    ));
  };

  const startRound = () => {
    if (!course.trim()) {
      toast({
        title: "Error",
        description: "Selecciona un campo de golf",
        variant: "destructive",
      });
      return;
    }

    if (players.length < 2) {
      toast({
        title: "Error",
        description: "Se necesitan al menos 2 jugadores",
        variant: "destructive",
      });
      return;
    }

    const round: Round = {
      id: Date.now().toString(),
      course: course.trim(),
      holes,
      players: players.map(p => ({
        ...p,
        scores: [],
        grossTotal: 0,
        netTotal: 0,
        moneyBalance: 0,
      })),
      currentHole: 1,
      bettingOptions,
      selectedTees,
      completed: false,
      createdAt: new Date(),
    };

    StorageManager.setCurrentRound(round);
    toast({
      title: "¡Ronda creada!",
      description: `Comenzando en ${course}`,
    });
    setLocation('/scorecard');
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-24">
      {/* Header */}
      <div className="bg-dark-surface px-6 py-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/dashboard')}
          className="mr-4 p-2 rounded-lg hover:bg-dark-card text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-white">Crear Nueva Ronda</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Round Type */}
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Tipo de Ronda</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={holes === 9 ? "default" : "outline"}
                onClick={() => setHoles(9)}
                className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                  holes === 9 
                    ? 'bg-golf-green hover:bg-golf-light' 
                    : 'bg-transparent border-gray-600 hover:border-golf-green hover:bg-golf-green/20'
                }`}
              >
                <i className="fas fa-golf-ball text-xl"></i>
                <p className="font-semibold">9 Hoyos</p>
              </Button>
              <Button
                variant={holes === 18 ? "default" : "outline"}
                onClick={() => setHoles(18)}
                className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                  holes === 18 
                    ? 'bg-golf-green hover:bg-golf-light' 
                    : 'bg-transparent border-gray-600 hover:border-golf-green hover:bg-golf-green/20'
                }`}
              >
                <i className="fas fa-golf-ball text-xl"></i>
                <p className="font-semibold">18 Hoyos</p>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Course Selection */}
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Campo de Golf</h3>
            <Select value={course} onValueChange={setCourse}>
              <SelectTrigger className="bg-dark-card border-gray-600 text-white">
                <SelectValue placeholder="Seleccionar campo..." />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gray-600">
                <SelectItem value="Club Campestre de Puebla">Club Campestre de Puebla</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Tee Selection */}
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Marcas de Salida (Tees)</h3>
            <div className="grid grid-cols-1 gap-3">
              {TEE_OPTIONS.map((tee) => (
                <Button
                  key={tee.color}
                  variant={selectedTees.color === tee.color ? "default" : "outline"}
                  onClick={() => setSelectedTees(tee)}
                  className={`p-4 h-auto flex items-center justify-between text-left ${
                    selectedTees.color === tee.color 
                      ? 'bg-golf-blue hover:bg-golf-blue-dark border-golf-blue' 
                      : 'bg-transparent border-gray-600 hover:border-golf-blue hover:bg-golf-blue/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      tee.color === 'negras' ? 'bg-black border border-gray-400' :
                      tee.color === 'azules' ? 'bg-blue-500' :
                      tee.color === 'blancas' ? 'bg-white border border-gray-400' :
                      tee.color === 'doradas' ? 'bg-yellow-400' :
                      tee.color === 'plateadas' ? 'bg-gray-400' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-semibold text-white">{tee.name}</p>
                      <p className="text-sm text-secondary">{tee.description}</p>
                    </div>
                  </div>
                  {selectedTees.color === tee.color && (
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-golf-blue rounded-full" />
                    </div>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Players */}
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Jugadores ({players.length}/6)</h3>
            </div>
            
            <div className="space-y-4 mb-4">
              {players.map((player) => (
                <div key={player.id} className="p-4 bg-dark-card rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-golf-green rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{player.name}</p>
                        <p className="text-sm text-gray-400">Handicap: {player.handicap}</p>
                      </div>
                    </div>
                    {user && player.id !== user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlayer(player.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Tee Selection for each player */}
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Marca de salida: <span className="text-white font-medium">{player.selectedTee.name}</span></p>
                    <div className="grid grid-cols-3 gap-2">
                      {TEE_OPTIONS.map((tee) => (
                        <Button
                          key={tee.color}
                          variant={player.selectedTee.color === tee.color ? "default" : "outline"}
                          onClick={() => updatePlayerTee(player.id, tee)}
                          className={`p-2 h-auto text-left text-xs ${
                            player.selectedTee.color === tee.color 
                              ? 'bg-golf-blue hover:bg-golf-blue-dark border-golf-blue' 
                              : 'bg-transparent border-gray-600 hover:border-golf-blue hover:bg-golf-blue/20'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              tee.color === 'negras' ? 'bg-black border border-gray-400' :
                              tee.color === 'azules' ? 'bg-blue-500' :
                              tee.color === 'blancas' ? 'bg-white border border-gray-400' :
                              tee.color === 'doradas' ? 'bg-yellow-400' :
                              tee.color === 'plateadas' ? 'bg-gray-400' :
                              'bg-red-500'
                            }`} />
                            <span className="text-white font-medium">{tee.name.replace('Tees ', '')}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {players.length < 6 && (
              <div className="space-y-3 p-3 bg-dark-card rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Nombre del jugador"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Handicap"
                    value={newPlayerHandicap}
                    onChange={(e) => setNewPlayerHandicap(e.target.value)}
                    min="0"
                    max="54"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button
                  onClick={addPlayer}
                  variant="outline"
                  className="w-full border-golf-green text-golf-green hover:bg-golf-green hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Jugador
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Betting Options */}
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Opciones de Apuestas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-white">Skins</label>
                <Checkbox
                  checked={bettingOptions.skins}
                  onCheckedChange={(checked) => 
                    setBettingOptions({...bettingOptions, skins: checked as boolean})
                  }
                  className="border-gray-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white">Oyeses</label>
                <Checkbox
                  checked={bettingOptions.oyeses}
                  onCheckedChange={(checked) => 
                    setBettingOptions({...bettingOptions, oyeses: checked as boolean})
                  }
                  className="border-gray-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white">Foursomes</label>
                <Checkbox
                  checked={bettingOptions.foursomes}
                  onCheckedChange={(checked) => 
                    setBettingOptions({...bettingOptions, foursomes: checked as boolean})
                  }
                  className="border-gray-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white">Unidad por hoyo (€)</label>
                <Input
                  type="number"
                  value={bettingOptions.unitPerHole}
                  onChange={(e) => 
                    setBettingOptions({
                      ...bettingOptions, 
                      unitPerHole: parseFloat(e.target.value) || 1.0
                    })
                  }
                  min="0.5"
                  step="0.5"
                  className="w-20 bg-dark-card border-gray-600 text-white text-center"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-6 left-6 right-6">
        <Button
          onClick={startRound}
          className="w-full bg-golf-green text-white py-4 rounded-xl font-semibold text-lg hover:bg-golf-light transition-colors"
        >
          Comenzar Ronda
        </Button>
      </div>
    </div>
  );
}
