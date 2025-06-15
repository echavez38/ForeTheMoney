import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/preferences';
import { 
  Heart, MessageCircle, Share2, Trophy, Target, Zap, 
  Calendar, MapPin, Users, TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

interface SocialPost {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  userHandicap: number;
  content: string;
  courseId: string;
  courseName: string;
  roundDate: string;
  scoreTopar: number;
  highlights: string[];
  imageUrl?: string;
  likes: number;
  hasLiked: boolean;
  comments: Comment[];
  createdAt: string;
  visibility: 'public' | 'friends' | 'private';
}

interface Comment {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

interface Achievement {
  type: 'birdie' | 'eagle' | 'chip_in' | 'long_drive' | 'handicap_improvement';
  holeNumber?: number;
  description: string;
  icon: any;
  color: string;
}

interface SocialFeedProps {
  className?: string;
}

export function SocialFeed({ className }: SocialFeedProps) {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});

  // Fetch feed posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/social/feed'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Like/unlike post mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId, action }: { postId: number; action: 'like' | 'unlike' }) => {
      const response = await fetch(`/api/social/posts/${postId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to update like');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/feed'] });
    },
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await fetch(`/api/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onSuccess: (_, { postId }) => {
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      queryClient.invalidateQueries({ queryKey: ['/api/social/feed'] });
      toast({
        title: "Comentario agregado",
        description: "Tu comentario ha sido publicado exitosamente.",
      });
    },
  });

  const handleLike = (postId: number, hasLiked: boolean) => {
    likeMutation.mutate({ 
      postId, 
      action: hasLiked ? 'unlike' : 'like' 
    });
  };

  const handleComment = (postId: number) => {
    const content = newComment[postId]?.trim();
    if (!content) return;
    
    commentMutation.mutate({ postId, content });
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'birdie': return <Target className="h-4 w-4" />;
      case 'eagle': return <Trophy className="h-4 w-4" />;
      case 'chip_in': return <Zap className="h-4 w-4" />;
      case 'long_drive': return <TrendingUp className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'birdie': return 'bg-blue-500';
      case 'eagle': return 'bg-purple-500';
      case 'chip_in': return 'bg-yellow-500';
      case 'long_drive': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: language === 'es' ? es : enUS 
    });
  };

  const getScoreDisplay = (scoreTopar: number) => {
    if (scoreTopar === 0) return { text: 'E', color: 'text-gray-400' };
    if (scoreTopar > 0) return { text: `+${scoreTopar}`, color: 'text-red-400' };
    return { text: `${scoreTopar}`, color: 'text-green-400' };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-dark-card border-gray-600 animate-pulse">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="h-12 w-12 bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-16 bg-gray-600 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {posts.map((post: SocialPost) => {
        const scoreDisplay = getScoreDisplay(post.scoreTopar);
        
        return (
          <Card key={post.id} className="bg-dark-card border-gray-600 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.userAvatar} />
                  <AvatarFallback className="bg-green-600 text-white">
                    {post.userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white truncate">
                      {post.userName}
                    </h3>
                    <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                      HCP {post.userHandicap}
                    </Badge>
                    <span className={`font-bold ${scoreDisplay.color}`}>
                      {scoreDisplay.text}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{post.courseName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Post content */}
              <div className="mb-4">
                <p className="text-gray-300 leading-relaxed">{post.content}</p>
              </div>

              {/* Achievements/Highlights */}
              {post.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.highlights.map((highlight, index) => (
                    <Badge 
                      key={index}
                      className={`${getAchievementColor(highlight)} text-white border-0`}
                    >
                      {getAchievementIcon(highlight)}
                      <span className="ml-1 text-xs">
                        {highlight === 'birdie' && 'Birdie'}
                        {highlight === 'eagle' && 'Eagle'}
                        {highlight === 'chip_in' && 'Chip-in'}
                        {highlight === 'long_drive' && 'Long Drive'}
                        {highlight === 'handicap_improvement' && 'Mejora HCP'}
                      </span>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Image if present */}
              {post.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={post.imageUrl} 
                    alt="Golf round photo"
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Interaction buttons */}
              <div className="flex items-center justify-between py-3 border-t border-gray-600">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id, post.hasLiked)}
                    className={`flex items-center space-x-2 ${
                      post.hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.hasLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-gray-400 hover:text-blue-500"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments.length}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-gray-400 hover:text-green-500"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Comments section */}
              {post.comments.length > 0 && (
                <div className="space-y-3 mt-4 pt-3 border-t border-gray-600">
                  {post.comments.slice(0, 3).map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback className="bg-gray-600 text-white text-xs">
                          {comment.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-700 rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-white text-sm">
                              {comment.userName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {post.comments.length > 3 && (
                    <Button variant="ghost" size="sm" className="text-gray-400 text-xs">
                      Ver {post.comments.length - 3} comentarios más
                    </Button>
                  )}
                </div>
              )}

              {/* Add comment */}
              <div className="flex space-x-3 mt-4 pt-3 border-t border-gray-600">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-green-600 text-white text-xs">
                    TU
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 flex space-x-2">
                  <Input
                    placeholder="Escribe un comentario..."
                    value={newComment[post.id] || ''}
                    onChange={(e) => setNewComment(prev => ({ 
                      ...prev, 
                      [post.id]: e.target.value 
                    }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleComment(post.id);
                      }
                    }}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleComment(post.id)}
                    disabled={!newComment[post.id]?.trim() || commentMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {posts.length === 0 && (
        <Card className="bg-dark-card border-gray-600">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No hay publicaciones aún
            </h3>
            <p className="text-gray-400">
              ¡Sé el primero en compartir tu ronda de golf!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}