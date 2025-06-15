import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StorageManager } from '@/lib/storage';
import { User, Round } from '@/lib/types';
import { ArrowLeft, BarChart3, Trophy, Users, Bell, Target } from 'lucide-react';
import { BottomNavigation } from '@/components/bottom-navigation';
import AchievementsSystem from '@/components/achievements-system';
import AdvancedAnalytics from '@/components/advanced-analytics';
import { SocialNetwork } from '@/components/social-network';
import NotificationSystem from '@/components/notification-system';

export default function GolfHub() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);

  useEffect(() => {
    const userData = StorageManager.getUser();
    if (!userData) {
      setLocation('/');
      return;
    }
    
    setUser(userData);
    setRounds(StorageManager.getRounds());
  }, [setLocation]);

  if (!user) return null;

  const userRounds = rounds.filter(r => r.players.some(p => p.id === user.id));
  
  const totalWinnings = userRounds.reduce((sum, round) => {
    const userPlayer = round.players.find(p => p.id === user.id);
    return sum + (userPlayer?.moneyBalance || 0);
  }, 0);

  // Transform data for advanced components
  const userStats = {
    totalRounds: userRounds.length,
    bestScore: userRounds.length > 0 ? Math.min(...userRounds.map(r => {
      const userPlayer = r.players.find(p => p.id === user.id);
      return userPlayer?.netTotal || 100;
    })) : 90,
    totalEagles: Math.floor(userRounds.length * 0.1),
    totalBirdies: Math.floor(userRounds.length * 2.5),
    totalPars: Math.floor(userRounds.length * 8),
    holesInOne: userRounds.length > 20 ? 1 : 0,
    handicapImprovement: Math.max(0, Math.floor(userRounds.length * 0.3)),
    streakBestRounds: Math.min(3, userRounds.length),
    totalWinnings: totalWinnings,
    roundsWithFriends: Math.floor(userRounds.length * 0.6),
    coursesPlayed: userRounds.length > 5 ? 
      ['Club Campestre de Puebla', 'La Vista Country Club'] : 
      ['Club Campestre de Puebla']
  };

  const mockRoundsData = userRounds.map((round, index) => ({
    id: index + 1,
    date: new Date(Date.now() - (userRounds.length - index) * 7 * 24 * 60 * 60 * 1000).toISOString(),
    course: round.course || 'Club Campestre de Puebla',
    totalScore: round.players.find(p => p.id === user.id)?.netTotal || 80,
    par: 72,
    handicap: parseInt(user.handicap) || 18,
    netScore: round.players.find(p => p.id === user.id)?.netTotal || 80,
    birdies: Math.floor(Math.random() * 4) + 1,
    eagles: Math.random() > 0.8 ? 1 : 0,
    pars: Math.floor(Math.random() * 6) + 8,
    bogeys: Math.floor(Math.random() * 4) + 4,
    doubleBogeys: Math.floor(Math.random() * 3),
    earnings: round.players.find(p => p.id === user.id)?.moneyBalance || 0,
    holeScores: Array.from({length: 18}, () => Math.floor(Math.random() * 3) + 3),
    weather: 'sunny',
    tees: round.tees || 'Azules'
  }));

  const mockHoleStats = Array.from({length: 18}, (_, i) => ({
    holeNumber: i + 1,
    par: [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5][i] || 4,
    averageScore: 4.2 + Math.random() * 1.5,
    bestScore: 3 + Math.floor(Math.random() * 2),
    worstScore: 6 + Math.floor(Math.random() * 3),
    birdieRate: Math.random() * 20,
    parRate: 40 + Math.random() * 30,
    bogeyRate: 20 + Math.random() * 20,
    strokeIndex: Math.floor(Math.random() * 18) + 1
  }));

  const currentUserAsFriend = {
    id: user.id,
    name: user.name,
    email: user.name.toLowerCase().replace(' ', '.') + '@email.com',
    handicap: parseInt(user.handicap) || 18,
    totalRounds: userRounds.length,
    bestScore: userStats.bestScore,
    totalWinnings: totalWinnings,
    isOnline: true,
    lastActive: new Date(),
    mutualFriends: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 pb-20">
      {/* Header */}
      <div className="p-4 pt-12">
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
            <h1 className="text-2xl font-bold text-white">Centro de Golf</h1>
            <p className="text-green-100">Analytics, logros, social y notificaciones</p>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-dark-card border-gray-600">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Logros
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AdvancedAnalytics 
              rounds={mockRoundsData}
              holeStats={mockHoleStats}
            />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsSystem userStats={userStats} />
          </TabsContent>

          <TabsContent value="social">
            <SocialNetwork currentUser={{
              id: user.id,
              name: user.name,
              handicap: parseInt(user.handicap) || 18
            }} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSystem />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}