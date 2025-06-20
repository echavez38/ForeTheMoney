import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { StorageManager } from '@/lib/storage';
import { User, Round, RoundPlayer, BettingOptions, TeeSelection, TEE_OPTIONS, GOLF_COURSES, GolfCourse } from '@/lib/types';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CreateRound() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [holes, setHoles] = useState<9 | 18>(18);
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse>(GOLF_COURSES[0]);
  const [players, setPlayers] = useState<Omit<RoundPlayer, 'scores' | 'grossTotal' | 'netTotal' | 'moneyBalance'>[]>([]);
  const [gameFormats, setGameFormats] = useState({
    strokePlay: true,
    matchPlay: false,
  });
  const [bettingOptions, setBettingOptions] = useState<BettingOptions>({
    skins: false,
    oyeses: true,
    foursomes: false,
    unitPerHole: 1.0,
    segments: {
      frontNine: true,
      backNine: true,
      total: true,
    },
    strokePlayBets: {
      frontNine: 10.0,
      backNine: 10.0,
      total: 20.0,
    },
    matchPlayBets: {
      frontNine: 15.0,
      backNine: 15.0,
      total: 30.0,
    },
    sideBets: {
      longestDrive: false,
      allPar3Closest: false,
      birdiePool: false,
      sandSaves: false,
    },
    pressBets: {
      enabled: false,
      autoPress: true,
      pressAmount: 5.0,
    },
    carryovers: false,
  });

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
      selectedTee: TEE_OPTIONS[2], // Default to Blancas (H)
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
      selectedTee: selectedCourse.teeOptions[0], // Default to first tee option for selected course
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

  const handleCourseChange = (courseId: string) => {
    const course = GOLF_COURSES.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      // Reset all player tees to first available option for new course
      setPlayers(prev => prev.map(player => ({
        ...player,
        selectedTee: course.teeOptions[0]
      })));
    }
  };

  const startRound = () => {
    if (!selectedCourse) {
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
      course: selectedCourse.name,
      holes,
      players: players.map(p => ({
        ...p,
        scores: [],
        grossTotal: 0,
        netTotal: 0,
        moneyBalance: 0,
      })),
      currentHole: 1,
      gameFormats,
      bettingOptions,
      completed: false,
      createdAt: new Date(),
    };

    StorageManager.setCurrentRound(round);
    toast({
      title: "¡Ronda creada!",
      description: `Comenzando en ${selectedCourse.name}`,
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
            <Select value={selectedCourse.id} onValueChange={handleCourseChange}>
              <SelectTrigger className="bg-dark-card border-gray-600 text-white">
                <SelectValue placeholder="Seleccionar campo..." />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gray-600">
                {GOLF_COURSES.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-gray-400 text-sm mt-2">
              {selectedCourse.holes.length} hoyos disponibles
            </p>
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
                      {selectedCourse.teeOptions.map((tee) => (
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
                              tee.color === 'blancas_f' ? 'bg-white border-2 border-pink-400' :
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

        {/* Game Format */}
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Formato de Juego</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Stroke Play</label>
                  <p className="text-xs text-gray-400">Conteo total de golpes</p>
                </div>
                <Checkbox
                  checked={gameFormats.strokePlay}
                  onCheckedChange={(checked) => 
                    setGameFormats({...gameFormats, strokePlay: checked as boolean})
                  }
                  className="border-gray-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Match Play</label>
                  <p className="text-xs text-gray-400">Hoyo por hoyo</p>
                </div>
                <Checkbox
                  checked={gameFormats.matchPlay}
                  onCheckedChange={(checked) => 
                    setGameFormats({...gameFormats, matchPlay: checked as boolean})
                  }
                  className="border-gray-600"
                />
              </div>
            </div>
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
                <label className="text-white">Unidad por hoyo ($)</label>
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
              
              {/* Betting Segments */}
              <div className="pt-4 border-t border-gray-600">
                <h4 className="text-md font-medium mb-3 text-white">Apuestas por Segmento</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-white">Front Nine (Hoyos 1-9)</label>
                    <Checkbox
                      checked={bettingOptions.segments.frontNine}
                      onCheckedChange={(checked) => 
                        setBettingOptions({
                          ...bettingOptions, 
                          segments: {
                            ...bettingOptions.segments,
                            frontNine: checked as boolean
                          }
                        })
                      }
                      className="border-gray-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-white">Back Nine (Hoyos 10-18)</label>
                    <Checkbox
                      checked={bettingOptions.segments.backNine}
                      onCheckedChange={(checked) => 
                        setBettingOptions({
                          ...bettingOptions, 
                          segments: {
                            ...bettingOptions.segments,
                            backNine: checked as boolean
                          }
                        })
                      }
                      className="border-gray-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-white">Total (18 Hoyos)</label>
                    <Checkbox
                      checked={bettingOptions.segments.total}
                      onCheckedChange={(checked) => 
                        setBettingOptions({
                          ...bettingOptions, 
                          segments: {
                            ...bettingOptions.segments,
                            total: checked as boolean
                          }
                        })
                      }
                      className="border-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Stroke Play Betting Values */}
              {gameFormats.strokePlay && (
                <div className="pt-4 border-t border-gray-600">
                  <h4 className="text-md font-medium mb-3 text-white">Valores de Apuesta - Stroke Play ($)</h4>
                  <div className="space-y-3">
                    {bettingOptions.segments.frontNine && (
                      <div className="flex items-center justify-between">
                        <label className="text-white">Front Nine (Hoyos 1-9)</label>
                        <Input
                          type="number"
                          value={bettingOptions.strokePlayBets.frontNine}
                          onChange={(e) => 
                            setBettingOptions({
                              ...bettingOptions, 
                              strokePlayBets: {
                                ...bettingOptions.strokePlayBets,
                                frontNine: parseFloat(e.target.value) || 0
                              }
                            })
                          }
                          min="0"
                          step="5"
                          className="w-20 bg-dark-card border-gray-600 text-white text-center"
                        />
                      </div>
                    )}
                    {bettingOptions.segments.backNine && (
                      <div className="flex items-center justify-between">
                        <label className="text-white">Back Nine (Hoyos 10-18)</label>
                        <Input
                          type="number"
                          value={bettingOptions.strokePlayBets.backNine}
                          onChange={(e) => 
                            setBettingOptions({
                              ...bettingOptions, 
                              strokePlayBets: {
                                ...bettingOptions.strokePlayBets,
                                backNine: parseFloat(e.target.value) || 0
                              }
                            })
                          }
                          min="0"
                          step="5"
                          className="w-20 bg-dark-card border-gray-600 text-white text-center"
                        />
                      </div>
                    )}
                    {bettingOptions.segments.total && (
                      <div className="flex items-center justify-between">
                        <label className="text-white">Total (18 Hoyos)</label>
                        <Input
                          type="number"
                          value={bettingOptions.strokePlayBets.total}
                          onChange={(e) => 
                            setBettingOptions({
                              ...bettingOptions, 
                              strokePlayBets: {
                                ...bettingOptions.strokePlayBets,
                                total: parseFloat(e.target.value) || 0
                              }
                            })
                          }
                          min="0"
                          step="5"
                          className="w-20 bg-dark-card border-gray-600 text-white text-center"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Match Play Betting Values */}
              {gameFormats.matchPlay && (
                <div className="pt-4 border-t border-gray-600">
                  <h4 className="text-md font-medium mb-3 text-white">Valores de Apuesta - Match Play ($)</h4>
                  <div className="space-y-3">
                    {bettingOptions.segments.frontNine && (
                      <div className="flex items-center justify-between">
                        <label className="text-white">Front Nine (Hoyos 1-9)</label>
                        <Input
                          type="number"
                          value={bettingOptions.matchPlayBets.frontNine}
                          onChange={(e) => 
                            setBettingOptions({
                              ...bettingOptions, 
                              matchPlayBets: {
                                ...bettingOptions.matchPlayBets,
                                frontNine: parseFloat(e.target.value) || 0
                              }
                            })
                          }
                          min="0"
                          step="5"
                          className="w-20 bg-dark-card border-gray-600 text-white text-center"
                        />
                      </div>
                    )}
                    {bettingOptions.segments.backNine && (
                      <div className="flex items-center justify-between">
                        <label className="text-white">Back Nine (Hoyos 10-18)</label>
                        <Input
                          type="number"
                          value={bettingOptions.matchPlayBets.backNine}
                          onChange={(e) => 
                            setBettingOptions({
                              ...bettingOptions, 
                              matchPlayBets: {
                                ...bettingOptions.matchPlayBets,
                                backNine: parseFloat(e.target.value) || 0
                              }
                            })
                          }
                          min="0"
                          step="5"
                          className="w-20 bg-dark-card border-gray-600 text-white text-center"
                        />
                      </div>
                    )}
                    {bettingOptions.segments.total && (
                      <div className="flex items-center justify-between">
                        <label className="text-white">Total (18 Hoyos)</label>
                        <Input
                          type="number"
                          value={bettingOptions.matchPlayBets.total}
                          onChange={(e) => 
                            setBettingOptions({
                              ...bettingOptions, 
                              matchPlayBets: {
                                ...bettingOptions.matchPlayBets,
                                total: parseFloat(e.target.value) || 0
                              }
                            })
                          }
                          min="0"
                          step="5"
                          className="w-20 bg-dark-card border-gray-600 text-white text-center"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Apuestas Avanzadas */}
        <Card className="bg-dark-surface border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Apuestas Avanzadas</h3>
            
            {/* Side Bets */}
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-yellow-400 mb-3">Side Bets</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white">Longest Drive</label>
                      <p className="text-gray-400 text-sm">Drive más largo en hoyos par 4/5</p>
                    </div>
                    <Checkbox
                      checked={bettingOptions.sideBets.longestDrive}
                      onCheckedChange={(checked) => 
                        setBettingOptions({
                          ...bettingOptions, 
                          sideBets: {
                            ...bettingOptions.sideBets,
                            longestDrive: checked as boolean
                          }
                        })
                      }
                      className="border-gray-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white">Birdie Pool</label>
                      <p className="text-gray-400 text-sm">Pozo acumulativo por cada birdie</p>
                    </div>
                    <Checkbox
                      checked={bettingOptions.sideBets.birdiePool}
                      onCheckedChange={(checked) => 
                        setBettingOptions({
                          ...bettingOptions, 
                          sideBets: {
                            ...bettingOptions.sideBets,
                            birdiePool: checked as boolean
                          }
                        })
                      }
                      className="border-gray-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white">Sand Saves</label>
                      <p className="text-gray-400 text-sm">Bonificación por salvar desde bunker</p>
                    </div>
                    <Checkbox
                      checked={bettingOptions.sideBets.sandSaves}
                      onCheckedChange={(checked) => 
                        setBettingOptions({
                          ...bettingOptions, 
                          sideBets: {
                            ...bettingOptions.sideBets,
                            sandSaves: checked as boolean
                          }
                        })
                      }
                      className="border-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Press Bets */}
              <div>
                <h4 className="text-md font-medium text-green-400 mb-3">Press Bets</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white">Activar Press Bets</label>
                      <p className="text-gray-400 text-sm">Duplicar apuestas cuando vas perdiendo</p>
                    </div>
                    <Checkbox
                      checked={bettingOptions.pressBets.enabled}
                      onCheckedChange={(checked) => 
                        setBettingOptions({
                          ...bettingOptions, 
                          pressBets: {
                            ...bettingOptions.pressBets,
                            enabled: checked as boolean
                          }
                        })
                      }
                      className="border-gray-600"
                    />
                  </div>

                  {bettingOptions.pressBets.enabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <label className="text-white">Auto Press (2 down)</label>
                        <Checkbox
                          checked={bettingOptions.pressBets.autoPress}
                          onCheckedChange={(checked) => 
                            setBettingOptions({
                              ...bettingOptions, 
                              pressBets: {
                                ...bettingOptions.pressBets,
                                autoPress: checked as boolean
                              }
                            })
                          }
                          className="border-gray-600"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-white">Monto Press ($)</label>
                        <Input
                          type="number"
                          value={bettingOptions.pressBets.pressAmount}
                          onChange={(e) => 
                            setBettingOptions({
                              ...bettingOptions, 
                              pressBets: {
                                ...bettingOptions.pressBets,
                                pressAmount: parseFloat(e.target.value) || 0
                              }
                            })
                          }
                          min="0"
                          step="1"
                          className="w-20 bg-dark-card border-gray-600 text-white text-center"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Carryovers */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white">Carryovers</label>
                  <p className="text-gray-400 text-sm">Acumular dinero de hoyos empatados</p>
                </div>
                <Checkbox
                  checked={bettingOptions.carryovers}
                  onCheckedChange={(checked) => 
                    setBettingOptions({
                      ...bettingOptions, 
                      carryovers: checked as boolean
                    })
                  }
                  className="border-gray-600"
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
