import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Zap, Award, TrendingUp, Users, Wifi } from 'lucide-react';

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  intensity?: 'subtle' | 'moderate' | 'dynamic';
}

interface FloatingIconProps {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  position: { x: number; y: number };
  delay?: number;
}

export function FloatingElement({ 
  children, 
  delay = 0, 
  duration = 3, 
  intensity = 'moderate' 
}: FloatingElementProps) {
  const getAnimationValues = () => {
    switch (intensity) {
      case 'subtle':
        return { y: [-2, 2, -2], x: [-1, 1, -1], scale: [1, 1.02, 1] };
      case 'moderate':
        return { y: [-5, 5, -5], x: [-3, 3, -3], scale: [1, 1.05, 1] };
      case 'dynamic':
        return { y: [-8, 8, -8], x: [-5, 5, -5], scale: [1, 1.08, 1] };
      default:
        return { y: [-5, 5, -5], x: [-3, 3, -3], scale: [1, 1.05, 1] };
    }
  };

  const animation = getAnimationValues();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: animation.y,
        x: animation.x,
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: { 
          duration, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: delay + 0.5
        },
        x: { 
          duration: duration * 1.2, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: delay + 0.7
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function FloatingIcon({ 
  icon: Icon, 
  color, 
  size = 'md', 
  position, 
  delay = 0 
}: FloatingIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <motion.div
      className={`absolute ${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ 
        opacity: [0, 1, 0.8, 1],
        scale: [0, 1.2, 1],
        rotate: [0, 360],
        y: [-10, 10, -10]
      }}
      transition={{
        opacity: { duration: 2, delay },
        scale: { duration: 1, delay },
        rotate: { duration: 3, delay: delay + 1, repeat: Infinity, ease: "linear" },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay + 2 }
      }}
    >
      <Icon className={`${iconSizes[size]} text-white`} />
    </motion.div>
  );
}

export function ConnectionPulse({ isConnected }: { isConnected: boolean }) {
  return (
    <motion.div
      className="absolute top-4 right-4 flex items-center space-x-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-400' : 'bg-red-400'
        }`}
        animate={isConnected ? {
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1]
        } : {
          scale: [1, 0.8, 1],
          opacity: [1, 0.5, 1]
        }}
        transition={{
          duration: isConnected ? 2 : 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.span 
        className={`text-sm font-medium ${
          isConnected ? 'text-green-400' : 'text-red-400'
        }`}
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isConnected ? 'En línea' : 'Desconectado'}
      </motion.span>
    </motion.div>
  );
}

export function LobbyAmbientEffects() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const floatingIcons = [
    { icon: Trophy, color: '#fbbf24', position: { x: 15, y: 20 }, delay: 0 },
    { icon: Target, color: '#10b981', position: { x: 85, y: 15 }, delay: 0.5 },
    { icon: Zap, color: '#3b82f6', position: { x: 10, y: 70 }, delay: 1 },
    { icon: Award, color: '#8b5cf6', position: { x: 90, y: 75 }, delay: 1.5 },
    { icon: TrendingUp, color: '#ef4444', position: { x: 50, y: 10 }, delay: 2 },
    { icon: Users, color: '#06b6d4', position: { x: 5, y: 45 }, delay: 2.5 }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {floatingIcons.map((item, index) => (
        <FloatingIcon
          key={index}
          icon={item.icon}
          color={item.color}
          position={item.position}
          delay={item.delay}
          size={Math.random() > 0.5 ? 'md' : 'sm'}
        />
      ))}
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)',
          left: '20%',
          top: '30%'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 360]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute w-48 h-48 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          right: '15%',
          bottom: '25%'
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.1, 0.2],
          rotate: [360, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}

export function RoomCodeAnimation({ code }: { code: string }) {
  const [displayedCode, setDisplayedCode] = useState('');
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= code.length) {
        setDisplayedCode(code.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [code]);

  return (
    <motion.div
      className="font-mono text-2xl font-bold text-white tracking-wider"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", damping: 15, stiffness: 300 }}
    >
      {displayedCode.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function PlayerJoinedAnimation({ playerName }: { playerName: string }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.8 }}
        transition={{ type: "spring", damping: 15, stiffness: 300 }}
      >
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span className="font-semibold">{playerName} se unió!</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}