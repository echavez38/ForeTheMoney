import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SocialFeedReal } from '@/components/social-feed-real';
import { CreatePost } from '@/components/create-post';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from '@/hooks/use-translation';
import { 
  Users, UserPlus, Mail, Share2, Trophy, Crown, 
  MessageSquare, ThumbsUp, Award, Star, Copy,
  Send, Link2, Facebook, Twitter, Instagram,
  QrCode, MapPin, Calendar, Target, TrendingUp, Activity, Search, Plus
} from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  handicap: number;
  totalRounds: number;
  bestScore: number;
  totalWinnings: number;
  isOnline: boolean;
  lastActive: Date;
  mutualFriends: number;
}

interface LeaderboardEntry {
  rank: number;
  user: Friend;
  score: number;
  metric: 'handicap' | 'winnings' | 'rounds' | 'improvement';
  change: number; // Position change from last period
}

interface SharedRound {
  id: string;
  user: Friend;
  course: string;
  score: number;
  par: number;
  date: Date;
  highlights: string[];
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

interface Comment {
  id: string;
  user: Friend;
  text: string;
  date: Date;
}

interface SocialFeaturesProps {
  currentUser: Friend;
  className?: string;
}

export function SocialFeatures({ currentUser, className }: SocialFeaturesProps) {
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [leaderboards, setLeaderboards] = useState<LeaderboardEntry[]>([]);
  const [recentActivity, setRecentActivity] = useState<SharedRound[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [shareText, setShareText] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<'handicap' | 'winnings' | 'rounds' | 'improvement'>('handicap');

  // Mock data - en producción vendría del API
  useEffect(() => {
    setFriends([
      {
        id: '1',
        name: 'Carlos Mendoza',
        email: 'carlos@email.com',
        handicap: 12,
        totalRounds: 45,
        bestScore: 78,
        totalWinnings: 145,
        isOnline: true,
        lastActive: new Date(),
        mutualFriends: 3
      },
      {
        id: '2',
        name: 'Ana Rodriguez',
        email: 'ana@email.com',
        handicap: 16,
        totalRounds: 32,
        bestScore: 82,
        totalWinnings: 89,
        isOnline: false,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        mutualFriends: 1
      },
      {
        id: '3',
        name: 'Miguel Torres',
        email: 'miguel@email.com',
        handicap: 8,
        totalRounds: 67,
        bestScore: 72,
        totalWinnings: 234,
        isOnline: true,
        lastActive: new Date(),
        mutualFriends: 5
      }
    ]);

    setRecentActivity([
      {
        id: '1',
        user: friends[0] || currentUser,
        course: 'Club Campestre de Puebla',
        score: 78,
        par: 72,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        highlights: ['Eagle en hoyo 15', '4 birdies consecutivos'],
        likes: 12,
        comments: [
          {
            id: '1',
            user: friends[1] || currentUser,
            text: '¡Increíble ronda! Ese eagle debió ser espectacular',
            date: new Date(Date.now() - 1 * 60 * 60 * 1000)
          }
        ],
        isLiked: false
      }
    ]);
  }, []);

  // Generate leaderboard based on selected metric
  useEffect(() => {
    const allUsers = [currentUser, ...friends];
    const sorted = allUsers.sort((a, b) => {
      switch (selectedMetric) {
        case 'handicap':
          return a.handicap - b.handicap; // Lower is better
        case 'winnings':
          return b.totalWinnings - a.totalWinnings; // Higher is better
        case 'rounds':
          return b.totalRounds - a.totalRounds; // Higher is better
        case 'improvement':
          return Math.random() - 0.5; // Mock improvement metric
        default:
          return 0;
      }
    });

    setLeaderboards(sorted.map((user, index) => ({
      rank: index + 1,
      user,
      score: selectedMetric === 'handicap' ? user.handicap :
             selectedMetric === 'winnings' ? user.totalWinnings :
             selectedMetric === 'rounds' ? user.totalRounds :
             Math.floor(Math.random() * 10) - 5, // Mock improvement
      metric: selectedMetric,
      change: Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
    })));
  }, [selectedMetric, currentUser, friends]);

  const inviteFriend = async () => {
    if (!inviteEmail) return;

    try {
      // API call would go here
      toast({
        title: "Invitación enviada",
        description: `Se envió una invitación a ${inviteEmail}`,
      });
      setInviteEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la invitación",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string, content?: string) => {
    const text = content || shareText || "¡Echa un vistazo a mi progreso en Fore the Money!";
    const url = window.location.origin;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(text + ' ' + url);
        toast({
          title: "Copiado",
          description: "El enlace se copió al portapapeles",
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const likeRound = (roundId: string) => {
    setRecentActivity(prev => prev.map(round => 
      round.id === roundId 
        ? { 
            ...round, 
            isLiked: !round.isLiked,
            likes: round.isLiked ? round.likes - 1 : round.likes + 1
          }
        : round
    ));
  };

  const addComment = (roundId: string, text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      user: currentUser,
      text,
      date: new Date()
    };

    setRecentActivity(prev => prev.map(round => 
      round.id === roundId 
        ? { ...round, comments: [...round.comments, newComment] }
        : round
    ));
  };

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const getRankChange = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (change < 0) return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
    return <div className="w-3 h-3" />;
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'handicap': return 'Handicap';
      case 'winnings': return 'Ganancias';
      case 'rounds': return 'Rondas';
      case 'improvement': return 'Mejora';
      default: return metric;
    }
  };

  const getMetricValue = (entry: LeaderboardEntry) => {
    switch (entry.metric) {
      case 'handicap': return entry.score.toString();
      case 'winnings': return `$${entry.score}`;
      case 'rounds': return entry.score.toString();
      case 'improvement': return `${entry.score > 0 ? '+' : ''}${entry.score}`;
      default: return entry.score.toString();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Social Golf</h2>
          <p className="text-gray-400">Conecta con amigos y comparte tu progreso</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Invitar Amigos
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-dark-card border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-white">Invitar Amigos</DialogTitle>
              <DialogDescription className="text-gray-400">
                Invita a tus amigos a unirse a Fore the Money
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="email" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="email">Por Email</TabsTrigger>
                <TabsTrigger value="code">Código</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <div>
                  <Label className="text-white">Email del amigo</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="email"
                      placeholder="amigo@email.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-dark-card border-gray-600 text-white"
                    />
                    <Button onClick={inviteFriend} disabled={!inviteEmail}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="code" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                    <div className="text-2xl font-mono font-bold text-white">
                      {generateInviteCode()}
                    </div>
                    <p className="text-sm text-gray-400">Código de invitación</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => shareToSocial('copy', `¡Únete a mí en Fore the Money! Código: ${generateInviteCode()}`)}
                    className="border-gray-600 text-white"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Código
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="friends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-dark-card border-gray-600">
          <TabsTrigger value="friends">Amigos</TabsTrigger>
          <TabsTrigger value="leaderboard">Rankings</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
          <TabsTrigger value="share">Compartir</TabsTrigger>
        </TabsList>

        {/* Friends Tab */}
        <TabsContent value="friends" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mis Amigos ({friends.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={friend.avatar} />
                          <AvatarFallback className="bg-green-600 text-white">
                            {friend.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {friend.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                        )}
                      </div>
                      
                      <div>
                        <div className="font-semibold text-white">{friend.name}</div>
                        <div className="text-sm text-gray-400">
                          Handicap {friend.handicap} • {friend.totalRounds} rondas
                        </div>
                        <div className="text-xs text-gray-500">
                          {friend.mutualFriends} amigos en común
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-400">
                        ${friend.totalWinnings}
                      </div>
                      <div className="text-xs text-gray-400">
                        Mejor: {friend.bestScore}
                      </div>
                    </div>
                  </div>
                ))}
                
                {friends.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aún no tienes amigos agregados</p>
                    <p className="text-sm">Invita a tus compañeros de golf</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Rankings
                </CardTitle>
                
                <div className="flex gap-2">
                  {['handicap', 'winnings', 'rounds', 'improvement'].map((metric) => (
                    <Button
                      key={metric}
                      variant={selectedMetric === metric ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMetric(metric as any)}
                      className={`${
                        selectedMetric === metric 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'border-gray-600 text-white hover:bg-gray-800'
                      }`}
                    >
                      {getMetricLabel(metric)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboards.map((entry, index) => (
                  <div key={entry.user.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.user.id === currentUser.id ? 'bg-green-600/20 border border-green-600' : 'bg-gray-800'
                  }`}>
                    <div className="flex items-center gap-2 w-12">
                      <span className={`text-lg font-bold ${
                        entry.rank === 1 ? 'text-yellow-500' :
                        entry.rank === 2 ? 'text-gray-400' :
                        entry.rank === 3 ? 'text-amber-600' :
                        'text-white'
                      }`}>
                        #{entry.rank}
                      </span>
                      {entry.rank <= 3 && (
                        <Crown className={`h-4 w-4 ${
                          entry.rank === 1 ? 'text-yellow-500' :
                          entry.rank === 2 ? 'text-gray-400' :
                          'text-amber-600'
                        }`} />
                      )}
                    </div>
                    
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={entry.user.avatar} />
                      <AvatarFallback className="bg-green-600 text-white text-xs">
                        {entry.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-white">{entry.user.name}</div>
                      <div className="text-sm text-gray-400">
                        {getMetricValue(entry)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {getRankChange(entry.change)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((round) => (
                  <div key={round.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar>
                        <AvatarImage src={round.user.avatar} />
                        <AvatarFallback className="bg-green-600 text-white">
                          {round.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{round.user.name}</span>
                          <Badge variant="outline" className="border-gray-600 text-gray-400">
                            {round.score} ({round.score > round.par ? '+' : ''}{round.score - round.par})
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {round.course} • {round.date.toLocaleDateString()}
                        </div>
                        
                        {round.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {round.highlights.map((highlight, index) => (
                              <Badge key={index} className="bg-green-600/20 text-green-400 border-green-600">
                                <Star className="h-3 w-3 mr-1" />
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likeRound(round.id)}
                            className={`p-1 ${round.isLiked ? 'text-red-500' : 'text-gray-400'}`}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {round.likes}
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="p-1 text-gray-400">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {round.comments.length}
                          </Button>
                        </div>
                        
                        {round.comments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {round.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-2 text-sm">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-gray-600 text-xs">
                                    {comment.user.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="font-semibold text-white">{comment.user.name}</span>
                                  <span className="text-gray-300 ml-2">{comment.text}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentActivity.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay actividad reciente</p>
                    <p className="text-sm">Cuando tus amigos compartan rondas aparecerán aquí</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share Tab */}
        <TabsContent value="share" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Compartir Progreso
              </CardTitle>
              <CardDescription className="text-gray-400">
                Comparte tus logros en redes sociales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Mensaje personalizado</Label>
                <Textarea
                  placeholder="¡Echa un vistazo a mi progreso en golf!"
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  className="bg-dark-card border-gray-600 text-white mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('facebook')}
                  className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('twitter')}
                  className="border-blue-400 text-blue-400 hover:bg-blue-400/20"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('whatsapp')}
                  className="border-green-500 text-green-400 hover:bg-green-500/20"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('copy')}
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
              
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Tu perfil público:</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• Handicap: {currentUser.handicap}</p>
                  <p>• Rondas jugadas: {currentUser.totalRounds}</p>
                  <p>• Mejor score: {currentUser.bestScore}</p>
                  <p>• Ganancias totales: ${currentUser.totalWinnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SocialFeatures;