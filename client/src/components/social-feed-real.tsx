import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Heart, MessageCircle, Share2, Trophy, Target, Zap, TrendingUp, Award, Send, Clock, MapPin, Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { apiRequest } from "@/lib/queryClient";

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

interface SocialFeedProps {
  className?: string;
}

export function SocialFeedReal({ className }: SocialFeedProps) {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  
  const { data: posts, isLoading, error } = useQuery<SocialPost[]>({
    queryKey: ['/api/social/feed'],
  });

  const likeMutation = useMutation({
    mutationFn: async ({ postId, action }: { postId: number; action: 'like' | 'unlike' }) => {
      await fetch(`/api/social/posts/${postId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/feed'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      await fetch(`/api/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/feed'] });
    },
  });

  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});

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

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'birdie':
        return <Target className="h-4 w-4" />;
      case 'eagle':
        return <Trophy className="h-4 w-4" />;
      case 'chip_in':
        return <Zap className="h-4 w-4" />;
      case 'long_drive':
        return <TrendingUp className="h-4 w-4" />;
      case 'handicap_improvement':
        return <Award className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'birdie':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'eagle':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'chip_in':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'long_drive':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'handicap_improvement':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
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
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Cargando feed social...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">Error al cargar el feed social</p>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <Users className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No hay publicaciones aún</p>
          <p className="text-sm text-gray-400 mt-2">¡Comparte tu primera ronda!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {posts.map((post) => {
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
                    <Badge variant="secondary" className="text-xs">
                      HCP {post.userHandicap}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1 text-sm text-gray-400">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{post.courseName}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(post.createdAt)}</span>
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
                      className={cn(
                        "flex items-center space-x-1 px-2 py-1",
                        getAchievementColor(highlight)
                      )}
                    >
                      {getAchievementIcon(highlight)}
                      <span className="text-xs font-medium capitalize">
                        {highlight.replace('_', ' ')}
                      </span>
                    </Badge>
                  ))}
                </div>
              )}

              {post.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt="Golf round"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id, post.hasLiked)}
                    className={cn(
                      "flex items-center space-x-1 hover:bg-red-500/10",
                      post.hasLiked ? "text-red-500" : "text-gray-400"
                    )}
                  >
                    <Heart 
                      className={cn("h-4 w-4", post.hasLiked && "fill-current")} 
                    />
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
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback className="bg-gray-600 text-white text-xs">
                          {comment.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-700 rounded-lg px-3 py-2">
                          <div className="font-medium text-sm text-white mb-1">
                            {comment.userName}
                          </div>
                          <p className="text-sm text-gray-300">
                            {comment.content}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 px-3">
                          {formatTimeAgo(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex space-x-2 mt-3">
                    <Input
                      placeholder="Escribe un comentario..."
                      value={commentText[post.id] || ''}
                      onChange={(e) => setCommentText(prev => ({ 
                        ...prev, 
                        [post.id]: e.target.value 
                      }))}
                      className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(post.id);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleComment(post.id)}
                      disabled={!commentText[post.id]?.trim() || commentMutation.isPending}
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
  );
}