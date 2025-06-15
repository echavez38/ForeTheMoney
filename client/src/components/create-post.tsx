import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/preferences';
import { StorageManager } from '@/lib/storage';
import { 
  Camera, X, Trophy, Target, Zap, TrendingUp, 
  MapPin, Calendar, Users, Globe, Lock, UserCheck
} from 'lucide-react';

interface CreatePostProps {
  onClose?: () => void;
  roundData?: {
    courseId: string;
    courseName: string;
    totalScore: number;
    par: number;
    date: string;
    highlights: string[];
  };
}

interface PostHighlight {
  type: 'birdie' | 'eagle' | 'chip_in' | 'long_drive' | 'handicap_improvement' | 'hole_in_one';
  holeNumber?: number;
  description: string;
}

export function CreatePost({ onClose, roundData }: CreatePostProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = StorageManager.getUser();

  const [content, setContent] = useState('');
  const [selectedHighlights, setSelectedHighlights] = useState<PostHighlight[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const availableHighlights: PostHighlight[] = [
    { type: 'birdie', description: 'Birdie' },
    { type: 'eagle', description: 'Eagle' },
    { type: 'chip_in', description: 'Chip-in' },
    { type: 'long_drive', description: 'Drive largo' },
    { type: 'hole_in_one', description: 'Hole-in-one' },
    { type: 'handicap_improvement', description: 'Mejora de handicap' },
  ];

  const createPostMutation = useMutation({
    mutationFn: async (postData: FormData) => {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        body: postData,
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/feed'] });
      toast({
        title: "Publicación creada",
        description: "Tu ronda ha sido compartida exitosamente.",
      });
      onClose?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la publicación",
        variant: "destructive",
      });
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Archivo muy grande",
          description: "La imagen debe ser menor a 5MB",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleHighlight = (highlight: PostHighlight) => {
    setSelectedHighlights(prev => {
      const exists = prev.find(h => h.type === highlight.type);
      if (exists) {
        return prev.filter(h => h.type !== highlight.type);
      } else {
        return [...prev, highlight];
      }
    });
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Contenido requerido",
        description: "Escribe algo sobre tu ronda",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    formData.append('visibility', visibility);
    formData.append('highlights', JSON.stringify(selectedHighlights.map(h => h.type)));

    if (roundData) {
      formData.append('courseId', roundData.courseId);
      formData.append('courseName', roundData.courseName);
      formData.append('totalScore', roundData.totalScore.toString());
      formData.append('par', roundData.par.toString());
      formData.append('roundDate', roundData.date);
    }

    if (imageFile) {
      formData.append('image', imageFile);
    }

    createPostMutation.mutate(formData);
  };

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'birdie': return <Target className="h-4 w-4" />;
      case 'eagle': return <Trophy className="h-4 w-4" />;
      case 'chip_in': return <Zap className="h-4 w-4" />;
      case 'long_drive': return <TrendingUp className="h-4 w-4" />;
      case 'hole_in_one': return <Trophy className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getVisibilityIcon = (vis: string) => {
    switch (vis) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'friends': return <UserCheck className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const scoreTopar = roundData ? roundData.totalScore - roundData.par : 0;
  const scoreDisplay = scoreTopar === 0 ? 'E' : scoreTopar > 0 ? `+${scoreTopar}` : `${scoreTopar}`;
  const scoreColor = scoreTopar === 0 ? 'text-gray-400' : scoreTopar > 0 ? 'text-red-400' : 'text-green-400';

  return (
    <Card className="bg-dark-card border-gray-600 max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Compartir Ronda
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Round summary if available */}
        {roundData && (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-white font-medium">{roundData.courseName}</span>
              </div>
              <span className={`font-bold ${scoreColor}`}>
                {scoreDisplay}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(roundData.date).toLocaleDateString()}</span>
              </div>
              <span>Score: {roundData.totalScore}</span>
              <span>Par: {roundData.par}</span>
            </div>
          </div>
        )}

        {/* Content input */}
        <div>
          <Label className="text-white mb-2 block">
            ¿Cómo fue tu ronda?
          </Label>
          <Textarea
            placeholder="Comparte los detalles de tu ronda, momentos destacados, condiciones del campo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
          />
        </div>

        {/* Highlights selection */}
        <div>
          <Label className="text-white mb-3 block">
            Momentos destacados
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableHighlights.map((highlight) => {
              const isSelected = selectedHighlights.some(h => h.type === highlight.type);
              return (
                <Button
                  key={highlight.type}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleHighlight(highlight)}
                  className={`flex items-center space-x-2 ${
                    isSelected 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {getHighlightIcon(highlight.type)}
                  <span className="text-xs">{highlight.description}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Image upload */}
        <div>
          <Label className="text-white mb-2 block">
            Foto (opcional)
          </Label>
          <div className="space-y-3">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="bg-gray-700 border-gray-600 text-white file:bg-green-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
            />
            
            {imagePreview && (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Visibility settings */}
        <div>
          <Label className="text-white mb-2 block">
            Visibilidad
          </Label>
          <Select value={visibility} onValueChange={(value: 'public' | 'friends' | 'private') => setVisibility(value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Público - Todos pueden ver</span>
                </div>
              </SelectItem>
              <SelectItem value="friends">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Amigos - Solo tus amigos</span>
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Privado - Solo tú</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || createPostMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {createPostMutation.isPending ? 'Publicando...' : 'Compartir Ronda'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}