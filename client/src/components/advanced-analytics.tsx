import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, BarChart3, Calendar, 
  MapPin, Clock, Award, Zap, Users, DollarSign, Flag,
  ArrowUp, ArrowDown, Minus, Star, Trophy, Activity
} from 'lucide-react';

interface RoundData {
  id: number;
  date: string;
  course: string;
  totalScore: number;
  par: number;
  handicap: number;
  netScore: number;
  birdies: number;
  eagles: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  earnings: number;
  holeScores: number[];
  weather?: string;
  tees: string;
}

interface HoleStats {
  holeNumber: number;
  par: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  birdieRate: number;
  parRate: number;
  bogeyRate: number;
  strokeIndex: number;
}

interface AdvancedAnalyticsProps {
  rounds: RoundData[];
  holeStats: HoleStats[];
  className?: string;
}

export function AdvancedAnalytics({ rounds, holeStats, className }: AdvancedAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'3months' | '6months' | '1year' | 'all'>('6months');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Filter data based on selections
  const filteredRounds = useMemo(() => {
    let filtered = rounds;
    
    // Filter by time range
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setFullYear(2000); // Show all
    }
    
    filtered = filtered.filter(round => new Date(round.date) >= cutoffDate);
    
    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(round => round.course === selectedCourse);
    }
    
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [rounds, timeRange, selectedCourse]);

  // Calculate key metrics
  const analytics = useMemo(() => {
    if (filteredRounds.length === 0) return null;

    const totalRounds = filteredRounds.length;
    const currentHandicap = filteredRounds[filteredRounds.length - 1]?.handicap || 18;
    const startHandicap = filteredRounds[0]?.handicap || currentHandicap;
    const handicapChange = startHandicap - currentHandicap;
    
    const averageScore = filteredRounds.reduce((sum, r) => sum + r.totalScore, 0) / totalRounds;
    const bestScore = Math.min(...filteredRounds.map(r => r.totalScore));
    const worstScore = Math.max(...filteredRounds.map(r => r.totalScore));
    
    const totalEarnings = filteredRounds.reduce((sum, r) => sum + r.earnings, 0);
    const winRate = filteredRounds.filter(r => r.earnings > 0).length / totalRounds * 100;
    
    const totalBirdies = filteredRounds.reduce((sum, r) => sum + r.birdies, 0);
    const totalEagles = filteredRounds.reduce((sum, r) => sum + r.eagles, 0);
    const totalPars = filteredRounds.reduce((sum, r) => sum + r.pars, 0);
    
    // Calculate trends (last 5 rounds vs previous 5)
    const recentRounds = filteredRounds.slice(-5);
    const previousRounds = filteredRounds.slice(-10, -5);
    
    const recentAvg = recentRounds.reduce((sum, r) => sum + r.totalScore, 0) / recentRounds.length;
    const previousAvg = previousRounds.length > 0 
      ? previousRounds.reduce((sum, r) => sum + r.totalScore, 0) / previousRounds.length 
      : recentAvg;
    
    const scoreTrend = recentAvg - previousAvg;
    
    return {
      totalRounds,
      currentHandicap,
      handicapChange,
      averageScore,
      bestScore,
      worstScore,
      totalEarnings,
      winRate,
      totalBirdies,
      totalEagles,
      totalPars,
      scoreTrend,
      recentAvg,
      previousAvg
    };
  }, [filteredRounds]);

  // Prepare chart data
  const scoreProgressData = filteredRounds.map((round, index) => ({
    round: index + 1,
    score: round.totalScore,
    par: round.par,
    netScore: round.netScore,
    handicap: round.handicap,
    date: new Date(round.date).toLocaleDateString(),
    movingAverage: filteredRounds
      .slice(Math.max(0, index - 2), index + 1)
      .reduce((sum, r) => sum + r.totalScore, 0) / Math.min(3, index + 1)
  }));

  const monthlyStats = useMemo(() => {
    const monthlyMap = new Map<string, {
      rounds: number;
      totalScore: number;
      earnings: number;
      birdies: number;
    }>();

    filteredRounds.forEach(round => {
      const month = new Date(round.date).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      const existing = monthlyMap.get(month) || { rounds: 0, totalScore: 0, earnings: 0, birdies: 0 };
      monthlyMap.set(month, {
        rounds: existing.rounds + 1,
        totalScore: existing.totalScore + round.totalScore,
        earnings: existing.earnings + round.earnings,
        birdies: existing.birdies + round.birdies
      });
    });

    return Array.from(monthlyMap.entries()).map(([month, stats]) => ({
      month,
      averageScore: stats.totalScore / stats.rounds,
      rounds: stats.rounds,
      earnings: stats.earnings,
      birdies: stats.birdies
    }));
  }, [filteredRounds]);

  const holePerformanceData = holeStats.map(hole => ({
    hole: `H${hole.holeNumber}`,
    par: hole.par,
    average: hole.averageScore,
    difficulty: hole.averageScore - hole.par,
    birdieRate: hole.birdieRate,
    parRate: hole.parRate,
    bogeyRate: hole.bogeyRate,
    strokeIndex: hole.strokeIndex
  }));

  const performanceDistribution = [
    { name: 'Eagles', value: analytics?.totalEagles || 0, color: '#10B981' },
    { name: 'Birdies', value: analytics?.totalBirdies || 0, color: '#3B82F6' },
    { name: 'Pars', value: analytics?.totalPars || 0, color: '#6B7280' },
    { name: 'Bogeys+', value: (filteredRounds.length * 18) - (analytics?.totalEagles || 0) - (analytics?.totalBirdies || 0) - (analytics?.totalPars || 0), color: '#EF4444' }
  ];

  const courses = Array.from(new Set(rounds.map(r => r.course)));

  if (!analytics) {
    return (
      <div className={`text-center text-gray-400 ${className}`}>
        No hay datos suficientes para mostrar analytics
      </div>
    );
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-red-500" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (value: number, inverse = false) => {
    if (inverse) {
      return value > 0 ? 'text-red-500' : value < 0 ? 'text-green-500' : 'text-gray-500';
    }
    return value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-500';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Avanzados</h2>
          <p className="text-gray-400">Análisis detallado de tu rendimiento</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-40 bg-dark-card border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último año</SelectItem>
              <SelectItem value="all">Todo el tiempo</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48 bg-dark-card border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los campos</SelectItem>
              {courses.map(course => (
                <SelectItem key={course} value={course}>{course}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-dark-card border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-400">Handicap Actual</span>
            </div>
            <div className="text-2xl font-bold text-white">{analytics.currentHandicap}</div>
            <div className={`flex items-center gap-1 text-sm ${getTrendColor(analytics.handicapChange)}`}>
              {getTrendIcon(-analytics.handicapChange)}
              {Math.abs(analytics.handicapChange).toFixed(1)} puntos
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-400">Score Promedio</span>
            </div>
            <div className="text-2xl font-bold text-white">{analytics.averageScore.toFixed(1)}</div>
            <div className={`flex items-center gap-1 text-sm ${getTrendColor(analytics.scoreTrend, true)}`}>
              {getTrendIcon(analytics.scoreTrend)}
              {Math.abs(analytics.scoreTrend).toFixed(1)} vs anterior
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-400">Ganancias</span>
            </div>
            <div className="text-2xl font-bold text-white">${analytics.totalEarnings}</div>
            <div className="text-sm text-gray-400">
              {analytics.winRate.toFixed(1)}% win rate
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-400">Mejor Score</span>
            </div>
            <div className="text-2xl font-bold text-white">{analytics.bestScore}</div>
            <div className="text-sm text-gray-400">
              en {analytics.totalRounds} rondas
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-dark-card border-gray-600">
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="holes">Por Hoyo</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Evolución del Score</CardTitle>
              <CardDescription className="text-gray-400">
                Progreso de tu puntuación a lo largo del tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scoreProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="round" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Score Total"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="movingAverage" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Promedio Móvil"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="par" 
                    stroke="#6B7280" 
                    strokeWidth={1}
                    name="Par del Campo"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Evolución del Handicap</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={scoreProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="round" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="handicap" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Holes Tab */}
        <TabsContent value="holes" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Rendimiento por Hoyo</CardTitle>
              <CardDescription className="text-gray-400">
                Análisis detallado de cada hoyo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={holePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hole" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="par" fill="#6B7280" name="Par" />
                  <Bar dataKey="average" fill="#3B82F6" name="Promedio" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-dark-card border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Dificultad Relativa</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={holePerformanceData.sort((a, b) => b.difficulty - a.difficulty)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hole" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" fontSize={10} />
                    <Tooltip />
                    <Bar 
                      dataKey="difficulty" 
                      fill="#EF4444" 
                      name="Golpes sobre par"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Tasa de Birdie</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={holePerformanceData.sort((a, b) => b.birdieRate - a.birdieRate)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hole" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" fontSize={10} />
                    <Tooltip />
                    <Bar 
                      dataKey="birdieRate" 
                      fill="#10B981" 
                      name="% Birdies"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-dark-card border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Distribución de Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={performanceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Estadísticas Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="averageScore" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                      name="Score Promedio"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Ganancias por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="earnings" fill="#F59E0B" name="Ganancias ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-dark-card border-gray-600">
              <CardContent className="p-4">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{analytics.recentAvg.toFixed(1)}</div>
                  <div className="text-sm text-gray-400">Promedio Últimas 5</div>
                  <div className={`text-sm ${getTrendColor(analytics.scoreTrend, true)}`}>
                    {analytics.scoreTrend > 0 ? '+' : ''}{analytics.scoreTrend.toFixed(1)} vs anteriores
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-gray-600">
              <CardContent className="p-4">
                <div className="text-center">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {(analytics.totalBirdies / analytics.totalRounds).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400">Birdies por Ronda</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-gray-600">
              <CardContent className="p-4">
                <div className="text-center">
                  <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{analytics.winRate.toFixed(0)}%</div>
                  <div className="text-sm text-gray-400">Tasa de Victoria</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdvancedAnalytics;