import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, Calculator, Wind, Thermometer, Droplets, Eye,
  Navigation, Target, Ruler, Camera, Save, Edit3, 
  CloudRain, Sun, CloudSnow, Cloud, Compass, Flag,
  TrendingUp, TrendingDown, Activity, Clock, Users
} from 'lucide-react';

interface HoleNote {
  id: string;
  holeNumber: number;
  note: string;
  imageUrl?: string;
  date: Date;
  conditions: WeatherConditions;
  club?: string;
  distance?: number;
  result?: string;
}

interface WeatherConditions {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  visibility: string;
  conditions: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'overcast';
  pressure: number;
}

interface DistanceCalculation {
  actualDistance: number;
  adjustedDistance: number;
  elevation: number;
  windAdjustment: number;
  temperatureAdjustment: number;
  clubRecommendation: string;
  notes: string;
}

interface CourseToolsProps {
  currentHole: number;
  holeDistance: number;
  holePar: number;
  className?: string;
}

export function CourseTools({ currentHole, holeDistance, holePar, className }: CourseToolsProps) {
  const [weather, setWeather] = useState<WeatherConditions>({
    temperature: 22,
    windSpeed: 5,
    windDirection: 'N',
    humidity: 65,
    visibility: 'clear',
    conditions: 'sunny',
    pressure: 1013
  });

  const [notes, setNotes] = useState<HoleNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [playerDistance, setPlayerDistance] = useState(holeDistance);
  const [elevation, setElevation] = useState(0);
  const [distanceCalc, setDistanceCalc] = useState<DistanceCalculation | null>(null);

  // Club distances (promedio para handicap medio)
  const clubs = [
    { name: 'Driver', distance: 220, type: 'driver' },
    { name: 'Madera 3', distance: 200, type: 'fairway' },
    { name: 'Madera 5', distance: 180, type: 'fairway' },
    { name: 'Híbrido', distance: 170, type: 'hybrid' },
    { name: 'Hierro 4', distance: 160, type: 'iron' },
    { name: 'Hierro 5', distance: 150, type: 'iron' },
    { name: 'Hierro 6', distance: 140, type: 'iron' },
    { name: 'Hierro 7', distance: 130, type: 'iron' },
    { name: 'Hierro 8', distance: 120, type: 'iron' },
    { name: 'Hierro 9', distance: 110, type: 'iron' },
    { name: 'Pitching Wedge', distance: 100, type: 'wedge' },
    { name: 'Sand Wedge', distance: 80, type: 'wedge' },
    { name: 'Lob Wedge', distance: 60, type: 'wedge' },
    { name: 'Putter', distance: 0, type: 'putter' }
  ];

  // Simular datos meteorológicos (en producción vendría de API real)
  useEffect(() => {
    // Mock weather API call
    const fetchWeather = () => {
      setWeather({
        temperature: 20 + Math.random() * 15,
        windSpeed: Math.random() * 20,
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        humidity: 40 + Math.random() * 40,
        visibility: Math.random() > 0.8 ? 'limited' : 'clear',
        conditions: ['sunny', 'cloudy', 'overcast'][Math.floor(Math.random() * 3)] as any,
        pressure: 995 + Math.random() * 35
      });
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Calcular distancia ajustada
  useEffect(() => {
    const calculateDistance = () => {
      let adjustedDistance = playerDistance;
      let windAdjustment = 0;
      let temperatureAdjustment = 0;
      let elevationAdjustment = 0;

      // Ajuste por viento
      const windFactor = weather.windSpeed * 0.5; // yards per mph
      if (['N', 'NE', 'NW'].includes(weather.windDirection)) {
        windAdjustment = windFactor; // viento en contra
        adjustedDistance += windAdjustment;
      } else if (['S', 'SE', 'SW'].includes(weather.windDirection)) {
        windAdjustment = -windFactor; // viento a favor
        adjustedDistance += windAdjustment;
      }

      // Ajuste por temperatura (bola vuela más lejos en calor)
      if (weather.temperature > 25) {
        temperatureAdjustment = -((weather.temperature - 25) * 0.5);
      } else if (weather.temperature < 10) {
        temperatureAdjustment = (10 - weather.temperature) * 0.5;
      }
      adjustedDistance += temperatureAdjustment;

      // Ajuste por elevación
      elevationAdjustment = elevation * 0.1; // 10% per 10m elevation
      adjustedDistance += elevationAdjustment;

      // Recomendación de palo
      const recommendedClub = clubs.find(club => 
        Math.abs(club.distance - adjustedDistance) === 
        Math.min(...clubs.map(c => Math.abs(c.distance - adjustedDistance)))
      );

      setDistanceCalc({
        actualDistance: playerDistance,
        adjustedDistance: Math.round(adjustedDistance),
        elevation: elevationAdjustment,
        windAdjustment,
        temperatureAdjustment,
        clubRecommendation: recommendedClub?.name || 'Hierro 7',
        notes: generateDistanceNotes(windAdjustment, temperatureAdjustment, elevationAdjustment)
      });
    };

    calculateDistance();
  }, [playerDistance, weather, elevation]);

  const generateDistanceNotes = (wind: number, temp: number, elev: number) => {
    const notes = [];
    if (Math.abs(wind) > 2) {
      notes.push(`Viento ${wind > 0 ? 'en contra' : 'a favor'}: ${Math.abs(wind).toFixed(0)}m`);
    }
    if (Math.abs(temp) > 1) {
      notes.push(`Temperatura: ${temp > 0 ? '+' : ''}${temp.toFixed(0)}m`);
    }
    if (Math.abs(elev) > 1) {
      notes.push(`Elevación: ${elev > 0 ? '+' : ''}${elev.toFixed(0)}m`);
    }
    return notes.join(', ') || 'Condiciones normales';
  };

  const saveHoleNote = () => {
    if (!currentNote.trim()) return;

    const newNote: HoleNote = {
      id: Date.now().toString(),
      holeNumber: currentHole,
      note: currentNote,
      date: new Date(),
      conditions: weather,
      club: selectedClub,
      distance: playerDistance,
      result: '' // Se podría agregar después del tiro
    };

    setNotes(prev => [...prev, newNote]);
    setCurrentNote('');
  };

  const getWeatherIcon = (conditions: string) => {
    switch (conditions) {
      case 'sunny': return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-5 w-5 text-gray-400" />;
      case 'rainy': return <CloudRain className="h-5 w-5 text-blue-500" />;
      case 'overcast': return <Cloud className="h-5 w-5 text-gray-600" />;
      default: return <Sun className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getWindDirection = (direction: string) => {
    const directions: Record<string, number> = {
      'N': 0, 'NE': 45, 'E': 90, 'SE': 135,
      'S': 180, 'SW': 225, 'W': 270, 'NW': 315
    };
    return directions[direction] || 0;
  };

  const getCurrentHoleNotes = () => {
    return notes.filter(note => note.holeNumber === currentHole);
  };

  const getClubTypeColor = (type: string) => {
    switch (type) {
      case 'driver': return 'text-red-400 border-red-400';
      case 'fairway': return 'text-blue-400 border-blue-400';
      case 'iron': return 'text-green-400 border-green-400';
      case 'wedge': return 'text-yellow-400 border-yellow-400';
      case 'putter': return 'text-purple-400 border-purple-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Herramientas del Campo</h2>
          <p className="text-gray-400">Hoyo {currentHole} • Par {holePar} • {holeDistance}m</p>
        </div>
      </div>

      <Tabs defaultValue="distance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-dark-card border-gray-600">
          <TabsTrigger value="distance">Distancia</TabsTrigger>
          <TabsTrigger value="weather">Condiciones</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
          <TabsTrigger value="clubs">Palos</TabsTrigger>
        </TabsList>

        {/* Distance Calculator Tab */}
        <TabsContent value="distance" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-500" />
                Calculadora de Distancia
              </CardTitle>
              <CardDescription className="text-gray-400">
                Calcula la distancia ajustada según condiciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Distancia al Pin (m)</Label>
                  <Input
                    type="number"
                    value={playerDistance}
                    onChange={(e) => setPlayerDistance(parseInt(e.target.value) || 0)}
                    className="bg-dark-card border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Diferencia Elevación (m)</Label>
                  <Input
                    type="number"
                    value={elevation}
                    onChange={(e) => setElevation(parseInt(e.target.value) || 0)}
                    placeholder="+ subida, - bajada"
                    className="bg-dark-card border-gray-600 text-white"
                  />
                </div>
              </div>

              {distanceCalc && (
                <div className="p-4 bg-gray-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Distancia real:</span>
                    <span className="text-white font-semibold">{distanceCalc.actualDistance}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Distancia ajustada:</span>
                    <span className="text-green-400 font-bold text-lg">{distanceCalc.adjustedDistance}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Palo recomendado:</span>
                    <Badge className={getClubTypeColor(clubs.find(c => c.name === distanceCalc.clubRecommendation)?.type || '')}>
                      {distanceCalc.clubRecommendation}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    {distanceCalc.notes}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-gray-800 rounded">
                  <Wind className="h-4 w-4 mx-auto mb-1 text-blue-400" />
                  <div className="text-xs text-gray-400">Viento</div>
                  <div className="text-sm text-white">{weather.windSpeed.toFixed(0)} km/h</div>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <Thermometer className="h-4 w-4 mx-auto mb-1 text-orange-400" />
                  <div className="text-xs text-gray-400">Temp</div>
                  <div className="text-sm text-white">{weather.temperature.toFixed(0)}°C</div>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <Eye className="h-4 w-4 mx-auto mb-1 text-green-400" />
                  <div className="text-xs text-gray-400">Visibilidad</div>
                  <div className="text-sm text-white capitalize">{weather.visibility}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weather Conditions Tab */}
        <TabsContent value="weather" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {getWeatherIcon(weather.conditions)}
                Condiciones Meteorológicas
              </CardTitle>
              <CardDescription className="text-gray-400">
                Condiciones actuales del campo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-400" />
                  <div className="text-lg font-bold text-white">{weather.temperature.toFixed(0)}°C</div>
                  <div className="text-sm text-gray-400">Temperatura</div>
                </div>
                
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="relative mx-auto mb-2">
                    <Wind className="h-6 w-6 text-blue-400" style={{ 
                      transform: `rotate(${getWindDirection(weather.windDirection)}deg)` 
                    }} />
                  </div>
                  <div className="text-lg font-bold text-white">{weather.windSpeed.toFixed(0)} km/h</div>
                  <div className="text-sm text-gray-400">{weather.windDirection}</div>
                </div>
                
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-lg font-bold text-white">{weather.humidity.toFixed(0)}%</div>
                  <div className="text-sm text-gray-400">Humedad</div>
                </div>
                
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                  <div className="text-lg font-bold text-white">{weather.pressure.toFixed(0)}</div>
                  <div className="text-sm text-gray-400">hPa</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Condiciones generales</span>
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(weather.conditions)}
                    <span className="text-white capitalize">{weather.conditions}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Visibilidad</span>
                  <Badge variant={weather.visibility === 'clear' ? 'default' : 'destructive'}>
                    {weather.visibility === 'clear' ? 'Despejado' : 'Limitada'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-green-500" />
                Notas del Hoyo {currentHole}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Registra observaciones y estrategias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Añade una nota sobre este hoyo..."
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  className="bg-dark-card border-gray-600 text-white"
                />
                
                <div className="flex gap-2">
                  <Select value={selectedClub} onValueChange={setSelectedClub}>
                    <SelectTrigger className="bg-dark-card border-gray-600 text-white">
                      <SelectValue placeholder="Palo usado" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map(club => (
                        <SelectItem key={club.name} value={club.name}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={saveHoleNote} disabled={!currentNote.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-semibold">Notas anteriores:</h4>
                {getCurrentHoleNotes().map((note) => (
                  <div key={note.id} className="p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-white">{note.note}</div>
                      <Badge variant="outline" className="border-gray-600 text-gray-400">
                        {note.date.toLocaleDateString()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {note.club && (
                        <Badge className={getClubTypeColor(clubs.find(c => c.name === note.club)?.type || '')}>
                          {note.club}
                        </Badge>
                      )}
                      <span>{note.distance}m</span>
                      <span>•</span>
                      <span>{note.conditions.temperature.toFixed(0)}°C</span>
                      <span>•</span>
                      <span>Viento {note.conditions.windSpeed.toFixed(0)} km/h</span>
                    </div>
                  </div>
                ))}
                
                {getCurrentHoleNotes().length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    <Edit3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay notas para este hoyo</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clubs Reference Tab */}
        <TabsContent value="clubs" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Referencia de Palos
              </CardTitle>
              <CardDescription className="text-gray-400">
                Distancias promedio por palo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clubs.map((club) => (
                  <div key={club.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        club.type === 'driver' ? 'bg-red-400' :
                        club.type === 'fairway' ? 'bg-blue-400' :
                        club.type === 'iron' ? 'bg-green-400' :
                        club.type === 'wedge' ? 'bg-yellow-400' :
                        'bg-purple-400'
                      }`} />
                      <span className="text-white">{club.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{club.distance}m</div>
                      <div className="text-xs text-gray-400 capitalize">{club.type}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-600/20 border border-blue-600 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 font-semibold">Consejo</span>
                </div>
                <p className="text-sm text-blue-200">
                  Las distancias son aproximadas y varían según condiciones meteorológicas, 
                  elevación y técnica personal. Ajusta según tu experiencia.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CourseTools;