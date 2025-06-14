import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/use-websocket';
import { StorageManager } from '@/lib/storage';
import { Link, useLocation } from 'wouter';
import { Users, Plus, LogIn, Copy, Check, Wifi, WifiOff, Crown, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InteractiveBackground } from '@/components/interactive-background';
import { FloatingElement, LobbyAmbientEffects, ConnectionPulse, RoomCodeAnimation, PlayerJoinedAnimation } from '@/components/floating-ui-elements';

interface GameRoom {
  id: string;
  code: string;
  hostId: string;
  players: Array<{
    id: string;
    name: string;
    handicap: number;
    isHost: boolean;
    connected: boolean;
  }>;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: string;
}

export default function MultiplayerLobby() {
  const [location, navigate] = useLocation();
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'room'>('menu');
  const [joinCode, setJoinCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentJoinedPlayer, setRecentJoinedPlayer] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { isConnected, sendMessage, lastMessage } = useWebSocket('/ws');
  
  const currentUser = StorageManager.getUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (lastMessage) {
      handleWebSocketMessage(lastMessage);
    }
  }, [lastMessage]);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'room_joined':
        setCurrentRoom(message.room);
        setMode('room');
        break;
      
      case 'player_joined':
        setRecentJoinedPlayer(message.player.name);
        setTimeout(() => setRecentJoinedPlayer(null), 3000);
        toast({
          title: "Jugador unido",
          description: `${message.player.name} se unió a la partida`,
        });
        setCurrentRoom(message.room);
        break;
      
      case 'player_connected':
      case 'player_disconnected':
        setCurrentRoom(message.room);
        break;
      
      case 'round_started':
        // Redirect to scorecard with room data
        StorageManager.setCurrentRound({
          ...message.roundData,
          isMultiplayer: true,
          roomCode: currentRoom?.code
        });
        navigate('/scorecard');
        break;
      
      case 'error':
        toast({
          title: "Error",
          description: message.message,
          variant: "destructive",
        });
        break;
    }
  };

  const createRoom = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: currentUser.id,
          hostName: currentUser.name,
          hostHandicap: currentUser.handicap
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentRoom(data.room);
        setMode('room');
        
        // Connect to WebSocket room
        sendMessage({
          type: 'join_room',
          roomCode: data.roomCode,
          playerId: currentUser.id
        });

        toast({
          title: "Sala creada",
          description: `Código de sala: ${data.roomCode}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la sala",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!currentUser || !joinCode.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/rooms/${joinCode.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentUser.id,
          playerName: currentUser.name,
          playerHandicap: currentUser.handicap
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentRoom(data.room);
        setMode('room');
        
        // Connect to WebSocket room
        sendMessage({
          type: 'join_room',
          roomCode: joinCode.toUpperCase(),
          playerId: currentUser.id
        });

        toast({
          title: "Unido a la sala",
          description: `Te uniste a la partida de ${data.room.players.find((p: any) => p.isHost)?.name}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo unir a la sala",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startGame = () => {
    if (!currentRoom || !currentUser) return;
    
    // Only host can start the game
    const currentPlayer = currentRoom.players.find(p => p.id === currentUser.id);
    if (!currentPlayer?.isHost) return;

    navigate('/create-round', { 
      state: { 
        multiplayerRoom: currentRoom,
        prefilledPlayers: currentRoom.players.map(p => ({
          id: p.id,
          name: p.name,
          handicap: p.handicap
        }))
      }
    });
  };

  const copyRoomCode = async () => {
    if (!currentRoom) return;
    
    try {
      await navigator.clipboard.writeText(currentRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Código copiado",
        description: "El código de la sala se copió al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el código",
        variant: "destructive",
      });
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setMode('menu');
    setJoinCode('');
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-dark-bg p-4 relative overflow-hidden">
      {/* Interactive Background Effects */}
      <InteractiveBackground 
        intensity={mode === 'room' ? 'high' : 'medium'} 
        theme="golf" 
      />
      <LobbyAmbientEffects />
      <ConnectionPulse isConnected={isConnected} />
      
      {/* Player Join Animation */}
      {recentJoinedPlayer && (
        <PlayerJoinedAnimation playerName={recentJoinedPlayer} />
      )}
      
      <div className="max-w-md mx-auto space-y-6 relative z-20">
        {/* Header */}
        <FloatingElement delay={0} intensity="subtle">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-8 w-8 text-golf-green" />
              <h1 className="text-2xl font-bold text-white">Multijugador</h1>
            </div>
          </div>
        </FloatingElement>

        {/* Main Menu */}
        {mode === 'menu' && (
          <div className="space-y-4">
            <FloatingElement delay={0.2} intensity="moderate">
              <Card className="bg-dark-surface/80 backdrop-blur-md border-gray-700/50 shadow-2xl">
                <CardContent className="p-6 space-y-4">
                  <Button
                    onClick={createRoom}
                    disabled={isLoading || !isConnected}
                    className="w-full bg-gradient-to-r from-golf-green to-green-600 text-white py-4 text-lg font-semibold hover:from-golf-light hover:to-green-500 transition-all duration-300 shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {isLoading ? 'Creando...' : 'Crear Partida'}
                  </Button>
                  
                  <Button
                    onClick={() => setMode('join')}
                    disabled={!isConnected}
                    variant="outline"
                    className="w-full border-gray-600/50 bg-dark-accent/50 text-white py-4 text-lg font-semibold hover:bg-dark-accent hover:border-golf-green transition-all duration-300"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Unirse con Código
                  </Button>
                </CardContent>
              </Card>
            </FloatingElement>

            <FloatingElement delay={0.4} intensity="subtle">
              <div className="text-center">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-gray-400 hover:text-white transition-all duration-300">
                    ← Volver al Dashboard
                  </Button>
                </Link>
              </div>
            </FloatingElement>
          </div>
        )}

        {/* Join Room */}
        {mode === 'join' && (
          <div className="space-y-4">
            <Card className="bg-dark-surface border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center">Unirse a Partida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Código de Partida
                  </label>
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Ej: ABC123"
                    maxLength={6}
                    className="bg-dark-card border-gray-600 text-white text-center text-lg font-mono"
                  />
                </div>
                
                <Button
                  onClick={joinRoom}
                  disabled={isLoading || !joinCode.trim() || !isConnected}
                  className="w-full bg-golf-green text-white py-3 font-semibold hover:bg-golf-light"
                >
                  {isLoading ? 'Conectando...' : 'Unirse'}
                </Button>
                
                <Button
                  onClick={() => setMode('menu')}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                >
                  Cancelar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Room Lobby */}
        {mode === 'room' && currentRoom && (
          <div className="space-y-4">
            {/* Room Info */}
            <Card className="bg-dark-surface border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Sala de Partida</CardTitle>
                  <Badge className="bg-golf-green text-white">
                    {currentRoom.status === 'waiting' ? 'Esperando' : 'En juego'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-dark-card rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">Código de Sala</p>
                    <p className="text-xl font-mono font-bold text-white">{currentRoom.code}</p>
                  </div>
                  <Button
                    onClick={copyRoomCode}
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-dark-accent"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Players List */}
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-3">
                    Jugadores ({currentRoom.players.length}/6)
                  </p>
                  <div className="space-y-2">
                    {currentRoom.players.map((player) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          player.connected ? 'bg-dark-card' : 'bg-red-900/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-golf-blue rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {player.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {player.isHost && (
                              <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{player.name}</p>
                            <p className="text-sm text-gray-400">HCP {player.handicap}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {player.connected ? (
                            <Badge className="bg-green-600 text-white">Conectado</Badge>
                          ) : (
                            <Badge variant="destructive">Desconectado</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Host Controls */}
                {currentRoom.players.find(p => p.id === currentUser.id)?.isHost && (
                  <div className="space-y-3 pt-4 border-t border-gray-700">
                    <Button
                      onClick={startGame}
                      disabled={currentRoom.players.length < 2}
                      className="w-full bg-golf-green text-white py-3 font-semibold hover:bg-golf-light"
                    >
                      Iniciar Partida
                    </Button>
                    <p className="text-xs text-gray-400 text-center">
                      {currentRoom.players.length < 2 ? 'Necesitas al menos 2 jugadores' : 'Todos los jugadores están listos'}
                    </p>
                  </div>
                )}

                <Button
                  onClick={leaveRoom}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                >
                  Salir de la Sala
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}