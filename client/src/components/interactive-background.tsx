import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  type: 'ball' | 'flag' | 'tee' | 'dot';
  rotation: number;
  rotationSpeed: number;
}

interface InteractiveBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  theme?: 'golf' | 'minimal' | 'celebration';
}

export function InteractiveBackground({ 
  intensity = 'medium', 
  theme = 'golf' 
}: InteractiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  // Golf-themed colors
  const colors = {
    golf: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
    flag: ['#ef4444', '#dc2626', '#b91c1c'],
    accent: ['#3b82f6', '#1d4ed8', '#1e40af'],
    white: ['#ffffff', '#f8fafc', '#f1f5f9']
  };

  const particleCount = {
    low: 20,
    medium: 35,
    high: 50
  }[intensity];

  const createParticle = (): Particle => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as Particle;

    const types: Particle['type'][] = theme === 'golf' 
      ? ['ball', 'flag', 'tee', 'dot']
      : ['dot'];

    const type = types[Math.floor(Math.random() * types.length)];
    let color = colors.golf[Math.floor(Math.random() * colors.golf.length)];
    
    if (type === 'ball') {
      color = colors.white[Math.floor(Math.random() * colors.white.length)];
    } else if (type === 'flag') {
      color = colors.flag[Math.floor(Math.random() * colors.flag.length)];
    } else if (type === 'tee') {
      color = colors.accent[Math.floor(Math.random() * colors.accent.length)];
    }

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * (type === 'ball' ? 8 : type === 'flag' ? 12 : 6) + 2,
      opacity: Math.random() * 0.6 + 0.2,
      color,
      type,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    };
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.globalAlpha = particle.opacity;
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);

    switch (particle.type) {
      case 'ball':
        // Golf ball with dimples
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Dimples
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * particle.size * 0.3;
          const y = Math.sin(angle) * particle.size * 0.3;
          ctx.beginPath();
          ctx.arc(x, y, particle.size * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'flag':
        // Golf flag
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size * 0.5, -particle.size * 0.3, particle.size, particle.size * 0.6);
        
        // Flag pole
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(particle.size * 0.5, -particle.size * 0.5, 2, particle.size);
        break;

      case 'tee':
        // Golf tee
        ctx.fillStyle = particle.color;
        ctx.fillRect(-1, -particle.size * 0.5, 2, particle.size * 0.8);
        ctx.beginPath();
        ctx.arc(0, -particle.size * 0.5, particle.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'dot':
      default:
        // Simple dot
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  };

  const updateParticle = (particle: Particle, canvas: HTMLCanvasElement) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.rotation += particle.rotationSpeed;

    // Mouse interaction
    const dx = mouseRef.current.x - particle.x;
    const dy = mouseRef.current.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 100) {
      const force = (100 - distance) / 100;
      particle.vx -= (dx / distance) * force * 0.01;
      particle.vy -= (dy / distance) * force * 0.01;
    }

    // Boundary wrapping
    if (particle.x < -particle.size) particle.x = canvas.width + particle.size;
    if (particle.x > canvas.width + particle.size) particle.x = -particle.size;
    if (particle.y < -particle.size) particle.y = canvas.height + particle.size;
    if (particle.y > canvas.height + particle.size) particle.y = -particle.size;

    // Subtle opacity animation
    particle.opacity += Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.002;
    particle.opacity = Math.max(0.1, Math.min(0.8, particle.opacity));
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !isVisible) return;

    // Clear canvas with subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.02)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current.forEach(particle => {
      updateParticle(particle, canvas);
      drawParticle(ctx, particle);
    });

    // Draw connection lines between nearby particles
    if (theme === 'golf') {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.globalAlpha = (150 - distance) / 150 * 0.3;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleMouseMove = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reinitialize particles for new canvas size
    particlesRef.current = Array.from({ length: particleCount }, createParticle);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    handleResize();
    
    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, createParticle);
    
    // Start animation
    animate();
    
    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Visibility API to pause animation when tab is not visible
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [particleCount, theme]);

  useEffect(() => {
    if (isVisible && !animationRef.current) {
      animate();
    }
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      style={{ 
        background: 'transparent',
        mixBlendMode: 'normal'
      }}
    />
  );
}