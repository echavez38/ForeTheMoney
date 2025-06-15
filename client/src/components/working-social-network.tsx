import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, UserPlus, Search, Plus, Crown, Trophy, MessageCircle, 
  Share2, Heart, Send, Clock, MapPin, Target, Zap, TrendingUp, Award
} from 'lucide-react';

interface SocialPost {
  id: number;
  userId: number;
  userName: string;
  userHandicap: number;
  content: string;
  courseId: string;
  courseName: string;
  roundDate: string;
  scoreTopar: number;
  highlights: string[];
  likes: number;
  hasLiked: boolean;
  comments: any[];
  createdAt: string;
}

interface Friend {
  id: number;
  name: string;
  email: string;
  username: string;
  handicap: number;
  totalRounds: number;
  bestScore: number;
  isOnline: boolean;
}

interface WorkingSocialNetworkProps {
  currentUser: {
    id: number;
    name: string;
    handicap: number;
  };
}

export function WorkingSocialNetwork({ currentUser }: WorkingSocialNetworkProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});

  // Fetch social feed
  const { data: posts = [], isLoading: feedLoading } = useQuery<SocialPost[]>({
    queryKey: ['/api/social/feed'],
  });

  // Search users
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['/api/users/search', searchQuery],
    enabled: searchQuery.length >= 2,
    queryFn: async () => {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    }
  });

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId, action }: { postId: number; action: 'like' | 'unlike' }) => {
      const response = await fetch(`/api/social/posts/${postId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Like action failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/feed'] });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await fetch(`/api/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Comment failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/feed'] });
    },
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
    },
    onSuccess: () => {
      toast({
        title: "Solicitud enviada",
        description: "La solicitud de amistad ha sido enviada",
      });
    },
  });

  const handleLike = (postId: number, hasLiked: boolean) => {
    likeMutation.mutate({
      postId,
      action: hasLiked ? 'unlike' : 'like',
    });
  };

  const handleComment = (postId: number) => {
    const content = commentText[postId]?.trim();
    if (!content) return;

    commentMutation.mutate({ postId, content });
    setCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const getScoreDisplay = (scoreTopar: number) => {
    if (scoreTopar === 0) return { text: 'E', color: 'text-gray-400' };
    if (scoreTopar > 0) return { text: `+${scoreTopar}`, color: 'text-red-400' };
    return { text: `${scoreTopar}`, color: 'text-green-400' };
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'birdie': return <Target className="h-4 w-4" />;
      case 'eagle': return <Trophy className="h-4 w-4" />;
      case 'chip_in': return <Zap className="h-4 w-4" />;
      case 'long_drive': return <TrendingUp className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'birdie': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'eagle': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'chip_in': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'long_drive': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-dark-card border-gray-600">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Feed Social
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar Amigos
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Ranking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Feed Social de Golf</h2>
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Publicación
            </Button>
          </div>

          {feedLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Cargando feed social...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No hay publicaciones aún</p>
              <p className="text-sm text-gray-500 mt-2">¡Comparte tu primera ronda de golf!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => {
                const scoreDisplay = getScoreDisplay(post.scoreTopar);
                
                return (
                  <Card key={post.id} className="bg-dark-card border-gray-600">
                    <CardHeader className="pb-3">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-green-600 text-white">
                            {post.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-white truncate">
                              {post.userName}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              HCP {post.userHandicap}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-1 text-sm text-gray-400">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{post.courseName}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>Hace 2 horas</span>
                          </div>
                        </div>
                        
                        {post.scoreTopar !== undefined && (
                          <div className="text-right">
                            <div className={`text-lg font-bold ${scoreDisplay.color}`}>
                              {scoreDisplay.text}
                            </div>
                            <div className="text-xs text-gray-400">vs par</div>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {post.content}
                      </p>

                      {post.highlights && post.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.highlights.map((highlight, index) => (
                            <Badge
                              key={index}
                              className={`flex items-center space-x-1 px-2 py-1 ${getAchievementColor(highlight)}`}
                            >
                              {getAchievementIcon(highlight)}
                              <span className="text-xs font-medium capitalize">
                                {highlight.replace('_', ' ')}
                              </span>
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id, post.hasLiked)}
                            className={`flex items-center space-x-1 hover:bg-red-500/10 ${
                              post.hasLiked ? 'text-red-500' : 'text-gray-400'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${post.hasLiked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowComments(prev => ({ 
                              ...prev, 
                              [post.id]: !prev[post.id] 
                            }))}
                            className="flex items-center space-x-1 text-gray-400 hover:bg-blue-500/10 hover:text-blue-400"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments.length}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center space-x-1 text-gray-400 hover:bg-green-500/10 hover:text-green-400"
                          >
                            <Share2 className="h-4 w-4" />
                            <span>Compartir</span>
                          </Button>
                        </div>
                      </div>

                      {showComments[post.id] && (
                        <div className="mt-4 space-y-3 border-t border-gray-600 pt-4">
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Escribe un comentario..."
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText(prev => ({ 
                                ...prev, 
                                [post.id]: e.target.value 
                              }))}
                              className="flex-1 bg-gray-700 border-gray-600 text-white"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleComment(post.id);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleComment(post.id)}
                              disabled={!commentText[post.id]?.trim()}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
              </div>

              {searchLoading && searchQuery.length >= 2 && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
              )}

              {searchResults.length > 0 && (
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
                            HCP {user.handicap || 18}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => addFriendMutation.mutate(user.id)}
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

              {searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
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
                Tabla de Posiciones Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Carlos Mendoza', handicap: 8, winnings: 850, change: 0 },
                  { rank: 2, name: 'Ana García', handicap: 12, winnings: 720, change: 1 },
                  { rank: 3, name: 'Roberto Silva', handicap: 15, winnings: 680, change: -1 },
                  { rank: 4, name: currentUser.name, handicap: currentUser.handicap, winnings: 620, change: 2 },
                ].map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.name === currentUser.name
                        ? 'bg-emerald-900/30 border border-emerald-600'
                        : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-white font-bold">
                        {entry.rank}
                      </div>
                      <div>
                        <div className="font-medium text-white">{entry.name}</div>
                        <div className="text-sm text-gray-400">
                          HCP {entry.handicap} • ${entry.winnings} ganados
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