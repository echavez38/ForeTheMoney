import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { SocialFeedReal } from '@/components/social-feed-real';
import { CreatePost } from '@/components/create-post';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { 
  Users, UserPlus, Search, Plus, Crown, Trophy, Target, TrendingUp,
  MessageCircle, Share2, Mail, Copy, Send
} from 'lucide-react';

interface Friend {
  id: number;
  name: string;
  email: string;
  username: string;
  handicap: number;
  totalRounds: number;
  bestScore: number;
  totalWinnings: number;
  isOnline: boolean;
  lastActive: string;
}

interface SocialNetworkProps {
  currentUser: {
    id: number;
    name: string;
    handicap: number;
  };
}

export function SocialNetwork({ currentUser }: SocialNetworkProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Search users for friend requests
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/users/search', searchQuery],
    enabled: searchQuery.length >= 2,
  });

  // Get user's friends
  const { data: friends } = useQuery<Friend[]>({
    queryKey: ['/api/friends'],
  });

  // Add friend mutation
  const addFriendMutation = useMutation({
    mutationFn: async (friendId: number) => {
      const response = await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });
      if (!response.ok) throw new Error('Failed to add friend');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitud enviada",
        description: "La solicitud de amistad ha sido enviada",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
    },
  });

  // Sample leaderboard data
  const leaderboardData = [
    {
      rank: 1,
      user: { name: 'Carlos Mendoza', handicap: 8, totalWinnings: 850 },
      change: 0
    },
    {
      rank: 2,
      user: { name: 'Ana García', handicap: 12, totalWinnings: 720 },
      change: 1
    },
    {
      rank: 3,
      user: { name: 'Roberto Silva', handicap: 15, totalWinnings: 680 },
      change: -1
    },
    {
      rank: 4,
      user: { name: currentUser.name, handicap: currentUser.handicap, totalWinnings: 620 },
      change: 2
    },
  ];

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    // Search functionality handled by React Query
  };

  const handleAddFriend = (friendId: number) => {
    addFriendMutation.mutate(friendId);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-dark-card border-gray-600">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {t('feed')}
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('friends')}
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Ranking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Feed Social</h2>
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Publicación
            </Button>
          </div>
          
          <SocialFeedReal />
          
          {showCreatePost && (
            <CreatePost onClose={() => setShowCreatePost(false)} />
          )}
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mis Amigos ({friends?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!friends || friends.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes amigos agregados aún</p>
                  <p className="text-sm mt-2">Busca usuarios para agregar como amigos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-emerald-600 text-white">
                            {friend.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white">{friend.name}</div>
                          <div className="text-sm text-gray-400">
                            HCP {friend.handicap} • {friend.totalRounds} rondas
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={friend.isOnline ? 'default' : 'secondary'}>
                          {friend.isOnline ? 'En línea' : 'Desconectado'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Golfistas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Buscar por nombre o usuario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Button onClick={handleSearch} disabled={searchLoading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
              )}

              {searchResults && searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {user.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">
                            @{user.username || user.name.toLowerCase().replace(' ', '')} • HCP {user.handicap}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddFriend(user.id)}
                        disabled={addFriendMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && searchResults && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron usuarios</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Tabla de Posiciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.user.name === currentUser.name
                        ? 'bg-emerald-900/30 border border-emerald-600'
                        : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-white font-bold">
                        {entry.rank}
                      </div>
                      <div>
                        <div className="font-medium text-white">{entry.user.name}</div>
                        <div className="text-sm text-gray-400">
                          HCP {entry.user.handicap} • ${entry.user.totalWinnings} ganados
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {entry.rank <= 3 && (
                        <Crown className={`h-5 w-5 ${
                          entry.rank === 1 ? 'text-yellow-500' :
                          entry.rank === 2 ? 'text-gray-400' : 'text-amber-600'
                        }`} />
                      )}
                      <Badge variant={entry.change > 0 ? 'default' : entry.change < 0 ? 'destructive' : 'secondary'}>
                        {entry.change > 0 ? `+${entry.change}` : entry.change === 0 ? '=' : entry.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}