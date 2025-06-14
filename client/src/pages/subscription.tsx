import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StorageManager } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { InteractiveBackground } from '@/components/interactive-background';
import { FloatingElement } from '@/components/floating-ui-elements';
import { 
  Crown, 
  Check, 
  X, 
  Users, 
  MapPin, 
  TrendingUp, 
  Zap, 
  Cloud, 
  Award,
  Calendar,
  ArrowLeft,
  CreditCard
} from 'lucide-react';

interface PricingPlan {
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  limitations?: string[];
}

interface SubscriptionInfo {
  type: string;
  isPremium: boolean;
  limits: {
    maxRoundsPerMonth: number;
    maxPlayersPerRound: number;
    availableCourses: string[];
    hasAdvancedBetting: boolean;
    hasMultiplayer: boolean;
    hasAnalytics: boolean;
    hasCloudBackup: boolean;
    hasAdsRemoved: boolean;
  };
  daysUntilExpiry: number | null;
  roundsUsedThisMonth: number;
}

export default function Subscription() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [pricing, setPricing] = useState<{ free: PricingPlan; premium: PricingPlan } | null>(null);

  const user = StorageManager.getUser();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchSubscriptionInfo();
    fetchPricing();
  }, [user, navigate]);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch(`/api/subscription/info/${user?.id}`);
      const data = await response.json();
      setSubscriptionInfo(data);
    } catch (error) {
      console.error('Error fetching subscription info:', error);
    }
  };

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/subscription/pricing');
      const data = await response.json();
      setPricing(data);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/subscription/upgrade/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "¡Suscripción actualizada!",
          description: "Ahora tienes acceso completo a todas las funciones Premium.",
        });
        
        // Refresh subscription info
        await fetchSubscriptionInfo();
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo actualizar la suscripción",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !subscriptionInfo || !pricing) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  const roundsProgress = subscriptionInfo.limits.maxRoundsPerMonth > 0 
    ? (subscriptionInfo.roundsUsedThisMonth / subscriptionInfo.limits.maxRoundsPerMonth) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <InteractiveBackground intensity="low" theme="minimal" />
      
      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:text-golf-green"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Suscripción</h1>
              <p className="text-gray-400">Gestiona tu plan y características</p>
            </div>
          </div>
          
          {subscriptionInfo.isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
              <Crown className="h-4 w-4 mr-2" />
              Premium Activo
            </Badge>
          )}
        </div>

        {/* Current Subscription Status */}
        <FloatingElement delay={0} intensity="subtle">
          <Card className="bg-dark-surface/90 backdrop-blur-md border-gray-700/50 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-3 text-golf-green" />
                Estado Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plan Type */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {subscriptionInfo.isPremium ? 'Pro Golfer' : 'Basic Golf'}
                  </div>
                  <div className="text-gray-400">
                    {subscriptionInfo.isPremium ? 'Plan Premium' : 'Plan Gratuito'}
                  </div>
                </div>

                {/* Rounds Usage */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {subscriptionInfo.roundsUsedThisMonth}
                    {subscriptionInfo.limits.maxRoundsPerMonth > 0 && (
                      <span className="text-lg text-gray-400">
                        /{subscriptionInfo.limits.maxRoundsPerMonth}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 mb-3">Rondas este mes</div>
                  {subscriptionInfo.limits.maxRoundsPerMonth > 0 && (
                    <Progress 
                      value={roundsProgress} 
                      className="h-2"
                    />
                  )}
                </div>

                {/* Expiry */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {subscriptionInfo.daysUntilExpiry 
                      ? `${subscriptionInfo.daysUntilExpiry} días`
                      : '∞'
                    }
                  </div>
                  <div className="text-gray-400">
                    {subscriptionInfo.daysUntilExpiry ? 'Hasta renovación' : 'Sin límite'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FloatingElement>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Free Plan */}
          <FloatingElement delay={200} intensity="moderate">
            <Card className={`bg-dark-surface/90 backdrop-blur-md border-gray-700/50 ${
              !subscriptionInfo.isPremium ? 'ring-2 ring-golf-green' : ''
            }`}>
              <CardHeader>
                <CardTitle className="text-white text-center">
                  {pricing.free.name}
                </CardTitle>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">
                    ${pricing.free.price}
                  </div>
                  <div className="text-gray-400">{pricing.free.period}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {pricing.free.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 mr-3 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {pricing.free.limitations && (
                  <div className="space-y-3 pt-4 border-t border-gray-700">
                    {pricing.free.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center text-gray-500">
                        <X className="h-4 w-4 mr-3 text-red-400 flex-shrink-0" />
                        <span className="text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!subscriptionInfo.isPremium && (
                  <Badge className="w-full justify-center bg-golf-green/20 text-golf-green">
                    Plan Actual
                  </Badge>
                )}
              </CardContent>
            </Card>
          </FloatingElement>

          {/* Premium Plan */}
          <FloatingElement delay={400} intensity="moderate">
            <Card className={`bg-dark-surface/90 backdrop-blur-md border-gray-700/50 ${
              subscriptionInfo.isPremium ? 'ring-2 ring-yellow-400' : ''
            }`}>
              <CardHeader>
                <CardTitle className="text-white text-center flex items-center justify-center">
                  <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                  {pricing.premium.name}
                </CardTitle>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">
                    ${pricing.premium.price}
                  </div>
                  <div className="text-gray-400">por {pricing.premium.period}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {pricing.premium.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 mr-3 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {subscriptionInfo.isPremium ? (
                  <Badge className="w-full justify-center bg-yellow-400/20 text-yellow-400">
                    <Crown className="h-4 w-4 mr-2" />
                    Plan Actual
                  </Badge>
                ) : (
                  <Button
                    onClick={handleUpgrade}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isLoading ? 'Procesando...' : 'Actualizar a Premium'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </FloatingElement>
        </div>

        {/* Feature Comparison */}
        <FloatingElement delay={600} intensity="subtle">
          <Card className="bg-dark-surface/90 backdrop-blur-md border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Comparación de Características</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center text-golf-green mb-3">
                    <Users className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Jugadores</span>
                  </div>
                  <div className="text-gray-300">
                    <div>Gratuito: Hasta 4 jugadores</div>
                    <div>Premium: Hasta 6 jugadores</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-golf-green mb-3">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Campos</span>
                  </div>
                  <div className="text-gray-300">
                    <div>Gratuito: 1 campo</div>
                    <div>Premium: Todos los campos</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-golf-green mb-3">
                    <Zap className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Funciones</span>
                  </div>
                  <div className="text-gray-300">
                    <div>Gratuito: Básicas</div>
                    <div>Premium: Completas</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FloatingElement>
      </div>
    </div>
  );
}