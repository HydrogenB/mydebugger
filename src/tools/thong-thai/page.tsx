/**
 * © 2025 MyDebugger Contributors – MIT License
 * Enhanced Thai Flag Creator with Advanced Features
 */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet';

// Types
interface AnimationParameters {
  ampX: number;
  freqX: number;
  ampY: number;
  freqY: number;
  speed: number;
  windStrength: number;
  windDirection: number;
  turbulence: number;
  fabricStiffness: number;
  gravity: number;
}

interface FlagColors {
  red: string;
  white: string;
  blue: string;
}

interface Preset {
  name: string;
  params: Partial<AnimationParameters>;
  description: string;
  icon: string;
}

interface HistoricalFlag {
  name: string;
  year: string;
  colors: FlagColors;
  stripeRatios: number[];
  description: string;
}

// Constants
const ASPECT_RATIO = 3 / 2;
const RECORDING_DURATION = 5000;

const FLAG_COLORS: Record<string, FlagColors> = {
  official: {
    red: '#A51931',
    white: '#FFFFFF',
    blue: '#2D2A4A',
  },
  historical: {
    red: '#EF3340',
    white: '#FFFFFF',
    blue: '#002D72',
  },
  vintage: {
    red: '#B22234',
    white: '#F5F5DC',
    blue: '#3C3B6E',
  },
  modern: {
    red: '#FF0000',
    white: '#FFFFFF',
    blue: '#0000FF',
  },
  royal: {
    red: '#C8102E',
    white: '#FFFFFF',
    blue: '#012169',
  }
};

const HISTORICAL_FLAGS: HistoricalFlag[] = [
  {
    name: 'Current National Flag',
    year: '1917-Present',
    colors: FLAG_COLORS.official,
    stripeRatios: [1, 1, 2, 1, 1],
    description: 'The Trairanga (tricolor) flag adopted in 1917'
  },
  {
    name: 'Pre-1917 Flag',
    year: '1893-1917',
    colors: { red: '#E30A17', white: '#FFFFFF', blue: '#FFFFFF' },
    stripeRatios: [1],
    description: 'Red flag with white elephant'
  },
  {
    name: 'Naval Ensign',
    year: 'Current',
    colors: FLAG_COLORS.official,
    stripeRatios: [1, 1, 2, 1, 1],
    description: 'Thai naval flag with additional emblems'
  }
];

const ANIMATION_PRESETS: Preset[] = [
  {
    name: 'Gentle Breeze',
    params: { ampX: 12, freqX: 0.02, ampY: 9, freqY: 0.01, speed: 1, windStrength: 0.3 },
    description: 'Soft, calming waves',
    icon: '🍃'
  },
  {
    name: 'Moderate Wind',
    params: { ampX: 20, freqX: 0.03, ampY: 15, freqY: 0.015, speed: 1.5, windStrength: 0.6 },
    description: 'Natural outdoor movement',
    icon: '💨'
  },
  {
    name: 'Strong Wind',
    params: { ampX: 35, freqX: 0.04, ampY: 25, freqY: 0.02, speed: 2, windStrength: 0.8 },
    description: 'Vigorous flapping',
    icon: '🌬️'
  },
  {
    name: 'Storm',
    params: { ampX: 50, freqX: 0.05, ampY: 40, freqY: 0.025, speed: 2.5, windStrength: 1, turbulence: 0.8 },
    description: 'Dramatic storm effect',
    icon: '🌪️'
  },
  {
    name: 'Ceremonial',
    params: { ampX: 8, freqX: 0.015, ampY: 6, freqY: 0.008, speed: 0.5, windStrength: 0.2 },
    description: 'Slow, dignified movement',
    icon: '🎌'
  },
  {
    name: 'Victory Celebration',
    params: { ampX: 25, freqX: 0.035, ampY: 20, freqY: 0.018, speed: 1.8, windStrength: 0.7 },
    description: 'Celebratory waving',
    icon: '🎉'
  }
];

// Main Component
const EnhancedThaiFlag: React.FC = () => {
  // State Management
  const [height, setHeight] = useState(600);
  const [width, setWidth] = useState(Math.round(600 * ASPECT_RATIO));
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [colorScheme, setColorScheme] = useState('official');
  const [customColors, setCustomColors] = useState<FlagColors>(FLAG_COLORS.official);
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [selectedHistoricalFlag, setSelectedHistoricalFlag] = useState(HISTORICAL_FLAGS[0]);
  
  // Animation Parameters
  const [animationParams, setAnimationParams] = useState<AnimationParameters>({
    ampX: 12,
    freqX: 0.02,
    ampY: 9,
    freqY: 0.01,
    speed: 1,
    windStrength: 0.3,
    windDirection: 0,
    turbulence: 0,
    fabricStiffness: 0.5,
    gravity: 0.1
  });
  
  // Visual Effects
  const [hasShadowEffect, setHasShadowEffect] = useState(true);
  const [hasGlowEffect, setHasGlowEffect] = useState(false);
  const [has3DEffect, setHas3DEffect] = useState(false);
  const [fabricTexture, setFabricTexture] = useState('silk');
  const [lightingAngle, setLightingAngle] = useState(45);
  const [lightingIntensity, setLightingIntensity] = useState(0.5);
  
  // Recording & Export
  const [isRecording, setIsRecording] = useState(false);
  const [exportFormat, setExportFormat] = useState<'gif' | 'webm' | 'mp4' | 'png' | 'svg'>('gif');
  const [exportQuality, setExportQuality] = useState('high');
  const [exportResolution, setExportResolution] = useState({ width: 1920, height: 1280 });
  
  // View Options
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'flag' | 'pole' | 'indoor' | 'outdoor'>('flag');
  const [showGrid, setShowGrid] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Particle System for ambient effects
  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
    
    constructor(canvasWidth: number, canvasHeight: number) {
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * canvasHeight;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.size = Math.random() * 3 + 1;
      this.opacity = Math.random() * 0.5 + 0.5;
      this.color = '#ffffff';
    }
    
    update(canvasWidth: number, canvasHeight: number, windStrength: number) {
      this.x += this.vx + windStrength * 5;
      this.y += this.vy;
      
      if (this.x > canvasWidth) this.x = 0;
      if (this.x < 0) this.x = canvasWidth;
      if (this.y > canvasHeight) this.y = 0;
      if (this.y < 0) this.y = canvasHeight;
      
      this.opacity = Math.sin(Date.now() * 0.001 + this.x) * 0.5 + 0.5;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.globalAlpha = this.opacity * 0.3;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  // Initialize particles
  useEffect(() => {
    if (showStats) {
      particlesRef.current = Array.from({ length: 50 }, () => 
        new Particle(width, height)
      );
    }
  }, [showStats, width, height]);
  
  // Enhanced flag drawing with physics simulation
  const drawFlag = useCallback((ctx: CanvasRenderingContext2D, time: number, drawWidth: number, drawHeight: number) => {
    const colors = colorScheme === 'custom' ? customColors : FLAG_COLORS[colorScheme] || FLAG_COLORS.official;
    const { ampX, freqX, ampY, freqY, speed, windStrength, windDirection, turbulence, fabricStiffness, gravity } = animationParams;
    
    // Clear canvas
    ctx.clearRect(0, 0, drawWidth, drawHeight);
    
    // Background
    if (viewMode === 'outdoor') {
      // Sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, drawHeight);
      gradient.addColorStop(0, theme === 'dark' ? '#0f1419' : '#87CEEB');
      gradient.addColorStop(1, theme === 'dark' ? '#1a1a2e' : '#98D8F4');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, drawWidth, drawHeight);
      
      // Sun/Moon
      if (theme === 'light') {
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 50;
        ctx.beginPath();
        ctx.arc(drawWidth * 0.8, drawHeight * 0.2, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.save();
        ctx.fillStyle = '#F0F0F0';
        ctx.shadowColor = '#F0F0F0';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(drawWidth * 0.8, drawHeight * 0.2, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      // Clouds
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        const cloudX = (time * 10 + i * 200) % (drawWidth + 100) - 50;
        const cloudY = 50 + i * 40;
        
        // Draw cloud shape
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 25, 0, Math.PI * 2);
        ctx.arc(cloudX + 25, cloudY, 35, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, cloudY, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, drawWidth, drawHeight);
    }
    
    // Draw pole if needed
    if (viewMode === 'pole' || viewMode === 'outdoor') {
      ctx.save();
      // Pole
      const poleGradient = ctx.createLinearGradient(20, 0, 40, 0);
      poleGradient.addColorStop(0, '#8B7355');
      poleGradient.addColorStop(0.5, '#D2B48C');
      poleGradient.addColorStop(1, '#8B7355');
      ctx.fillStyle = poleGradient;
      ctx.fillRect(20, 0, 20, drawHeight);
      
      // Pole top ornament
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(30, 10, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Rope
      ctx.strokeStyle = '#8B7355';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 30);
      ctx.lineTo(60, 35 + Math.sin(time) * 5);
      ctx.stroke();
      ctx.restore();
    }
    
    // Calculate flag position offset for pole mode
    const flagOffsetX = (viewMode === 'pole' || viewMode === 'outdoor') ? 60 : 0;
    const flagWidth = drawWidth - flagOffsetX;
    
    // Set up effects
    if (hasShadowEffect) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 10;
      ctx.shadowOffsetY = 15;
    }
    
    if (hasGlowEffect) {
      ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
      ctx.shadowBlur = 30;
    }
    
    // Draw flag stripes with enhanced physics
    const stripeRatios = selectedHistoricalFlag.stripeRatios;
    const totalRatio = stripeRatios.reduce((a, b) => a + b, 0);
    const stripeColors = stripeRatios.length === 1 ? 
      [colors.red] : 
      [colors.red, colors.white, colors.blue, colors.white, colors.red];
    
    let currentY = 0;
    
    for (let i = 0; i < stripeColors.length; i++) {
      const stripeHeight = (drawHeight / totalRatio) * stripeRatios[i];
      
      ctx.save();
      ctx.fillStyle = stripeColors[i];
      
      // Apply fabric texture
      if (fabricTexture !== 'none') {
        ctx.globalAlpha = 0.95;
        
        // Create fabric pattern
        const pattern = ctx.createPattern(createFabricTexture(ctx, fabricTexture), 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
        }
      }
      
      ctx.beginPath();
      
      // Enhanced wave physics
      for (let x = 0; x <= flagWidth; x += 5) {
        const relX = x / flagWidth;
        const relY = (currentY + stripeHeight / 2) / drawHeight;
        
        // Multi-layered wave calculation
        const primaryWave = Math.sin(relX * freqX * 100 + time * speed) * ampX;
        const secondaryWave = Math.cos(relX * freqY * 50 + time * speed * 0.7) * ampY;
        const turbulenceWave = turbulence * Math.sin(relX * 10 + time * 3) * 10;
        
        // Wind effect
        const windEffect = windStrength * Math.sin(relX * Math.PI) * 30 * 
                          Math.cos(windDirection * Math.PI / 180);
        
        // Gravity effect
        const gravityEffect = gravity * relY * 20;
        
        // Fabric stiffness
        const stiffnessModifier = 1 - fabricStiffness * 0.5;
        
        const totalWave = (primaryWave + secondaryWave + turbulenceWave + windEffect) * 
                         stiffnessModifier + gravityEffect;
        
        const y = currentY + (x === 0 ? 0 : totalWave);
        
        if (x === 0) {
          ctx.moveTo(flagOffsetX, y);
        } else {
          ctx.lineTo(flagOffsetX + x, y);
        }
      }
      
      // Complete the stripe
      for (let x = flagWidth; x >= 0; x -= 5) {
        const relX = x / flagWidth;
        const relY = (currentY + stripeHeight) / drawHeight;
        
        const primaryWave = Math.sin(relX * freqX * 100 + time * speed) * ampX;
        const secondaryWave = Math.cos(relX * freqY * 50 + time * speed * 0.7) * ampY;
        const turbulenceWave = turbulence * Math.sin(relX * 10 + time * 3) * 10;
        const windEffect = windStrength * Math.sin(relX * Math.PI) * 30 * 
                          Math.cos(windDirection * Math.PI / 180);
        const gravityEffect = gravity * relY * 20;
        const stiffnessModifier = 1 - fabricStiffness * 0.5;
        
        const totalWave = (primaryWave + secondaryWave + turbulenceWave + windEffect) * 
                         stiffnessModifier + gravityEffect;
        
        const y = currentY + stripeHeight + (x === 0 ? 0 : totalWave);
        ctx.lineTo(flagOffsetX + x, y);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Apply lighting effect
      if (lightingIntensity > 0) {
        const lightGradient = ctx.createLinearGradient(
          flagOffsetX, 
          currentY,
          flagOffsetX + flagWidth * Math.cos(lightingAngle * Math.PI / 180),
          currentY + stripeHeight * Math.sin(lightingAngle * Math.PI / 180)
        );
        lightGradient.addColorStop(0, `rgba(255, 255, 255, ${lightingIntensity * 0.3})`);
        lightGradient.addColorStop(0.5, `rgba(255, 255, 255, 0)`);
        lightGradient.addColorStop(1, `rgba(0, 0, 0, ${lightingIntensity * 0.2})`);
        
        ctx.fillStyle = lightGradient;
        ctx.fill();
      }
      
      ctx.restore();
      currentY += stripeHeight;
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Draw particles
    if (showStats && particlesRef.current.length > 0) {
      particlesRef.current.forEach(particle => {
        particle.update(drawWidth, drawHeight, windStrength);
        particle.draw(ctx);
      });
    }
    
    // Draw grid overlay
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x < drawWidth; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, drawHeight);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < drawHeight; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(drawWidth, y);
        ctx.stroke();
      }
      ctx.restore();
    }
    
    // Draw statistics overlay
    if (showStats) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 250, 150);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '14px monospace';
      ctx.fillText(`FPS: ${(1000 / 16).toFixed(0)}`, 20, 30);
      ctx.fillText(`Wind: ${(windStrength * 100).toFixed(0)}%`, 20, 50);
      ctx.fillText(`Turbulence: ${(turbulence * 100).toFixed(0)}%`, 20, 70);
      ctx.fillText(`Animation Speed: ${speed.toFixed(1)}x`, 20, 90);
      ctx.fillText(`Resolution: ${drawWidth}x${drawHeight}`, 20, 110);
      ctx.fillText(`Time: ${time.toFixed(2)}s`, 20, 130);
      ctx.fillText(`Particles: ${particlesRef.current.length}`, 20, 150);
      ctx.restore();
    }
    
    // 3D effect post-processing
    if (has3DEffect) {
      const imageData = ctx.getImageData(0, 0, drawWidth, drawHeight);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % drawWidth;
        const y = Math.floor((i / 4) / drawWidth);
        
        // Create depth effect
        const depth = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 10;
        const offset = Math.round(depth);
        
        if (offset > 0 && i + offset * 4 < data.length) {
          data[i] = data[i + offset * 4];
          data[i + 1] = data[i + offset * 4 + 1];
          data[i + 2] = data[i + offset * 4 + 2];
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
  }, [animationParams, colorScheme, customColors, backgroundColor, hasShadowEffect, hasGlowEffect, 
      has3DEffect, fabricTexture, lightingAngle, lightingIntensity, viewMode, showGrid, 
      showStats, theme, selectedHistoricalFlag]);
  
  // Create fabric texture
  const createFabricTexture = (ctx: CanvasRenderingContext2D, type: string): HTMLCanvasElement => {
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 100;
    textureCanvas.height = 100;
    const textureCtx = textureCanvas.getContext('2d')!;
    
    switch (type) {
      case 'silk':
        // Silk texture
        for (let i = 0; i < 100; i++) {
          textureCtx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
          textureCtx.beginPath();
          textureCtx.moveTo(Math.random() * 100, 0);
          textureCtx.lineTo(Math.random() * 100, 100);
          textureCtx.stroke();
        }
        break;
        
      case 'cotton':
        // Cotton texture
        for (let i = 0; i < 500; i++) {
          textureCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
          textureCtx.fillRect(Math.random() * 100, Math.random() * 100, 2, 2);
        }
        break;
        
      case 'satin':
        // Satin texture
        const gradient = textureCtx.createLinearGradient(0, 0, 100, 100);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        textureCtx.fillStyle = gradient;
        textureCtx.fillRect(0, 0, 100, 100);
        break;
    }
    
    return textureCanvas;
  };
  
  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      if (!isPaused || isRecording) {
        timeRef.current += 0.016; // 60 FPS
      }
      
      const displayWidth = isFullscreen ? window.innerWidth : width;
      const displayHeight = isFullscreen ? window.innerHeight : height;
      
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      drawFlag(ctx, timeRef.current, displayWidth, displayHeight);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, isPaused, isRecording, isFullscreen, drawFlag]);
  
  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);
  
  // Export functions
  const exportImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = exportResolution.width;
    tempCanvas.height = exportResolution.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      drawFlag(tempCtx, timeRef.current, exportResolution.width, exportResolution.height);
      
      tempCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `thai-flag-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png', exportQuality === 'high' ? 1.0 : 0.8);
    }
  }, [drawFlag, exportResolution, exportQuality]);
  
  // Generate sound effect for wind
  const playWindSound = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 100 + Math.random() * 50;
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(animationParams.windStrength * 0.1, ctx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1);
  }, [animationParams.windStrength]);
  
  // UI Components
  const bgGradient = theme === 'dark' 
    ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)'
    : 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)';
  
  const cardBg = theme === 'dark' ? '#1e1e30' : '#ffffff';
  const textColor = theme === 'dark' ? '#f0f0f0' : '#333333';
  
  return (
    <>
      <Helmet>
        <title>Thai Flag Creator - Advanced Animation Studio</title>
        <meta name="description" content="Create stunning animated Thai flags with physics simulation and professional export options" />
      </Helmet>
      
      <div style={{
        minHeight: '100vh',
        background: bgGradient,
        color: textColor,
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              🇹🇭 Thai Flag Animation Studio
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
              Create professional animated Thai flags with advanced physics and effects
            </p>
          </div>
          
          {/* Main Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem' }}>
            {/* Control Panel */}
            <div style={{ 
              background: cardBg, 
              borderRadius: '20px', 
              padding: '2rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                Control Panel
              </h2>
              
              {/* Quick Presets */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.9 }}>
                  Quick Presets
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {ANIMATION_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => setAnimationParams(prev => ({ ...prev, ...preset.params }))}
                      style={{
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'transform 0.2s',
                        fontSize: '0.85rem'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{preset.icon}</span>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Dimensions */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.9 }}>
                  Dimensions
                </h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Height: {height}px
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    value={height}
                    onChange={e => setHeight(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={isAspectRatioLocked}
                      onChange={e => setIsAspectRatioLocked(e.target.checked)}
                    />
                    Lock Aspect Ratio (3:2)
                  </label>
                </div>
                {!isAspectRatioLocked && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      Width: {width}px
                    </label>
                    <input
                      type="range"
                      min="150"
                      max="3000"
                      value={width}
                      onChange={e => setWidth(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
              
              {/* Animation Parameters */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.9 }}>
                  Animation Physics
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Wind Strength: {(animationParams.windStrength * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={animationParams.windStrength}
                    onChange={e => setAnimationParams(prev => ({ ...prev, windStrength: Number(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Wind Direction: {animationParams.windDirection}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={animationParams.windDirection}
                    onChange={e => setAnimationParams(prev => ({ ...prev, windDirection: Number(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Turbulence: {(animationParams.turbulence * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={animationParams.turbulence}
                    onChange={e => setAnimationParams(prev => ({ ...prev, turbulence: Number(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Animation Speed: {animationParams.speed.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={animationParams.speed}
                    onChange={e => setAnimationParams(prev => ({ ...prev, speed: Number(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Fabric Stiffness: {(animationParams.fabricStiffness * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={animationParams.fabricStiffness}
                    onChange={e => setAnimationParams(prev => ({ ...prev, fabricStiffness: Number(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              
              {/* Visual Effects */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.9 }}>
                  Visual Effects
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={hasShadowEffect}
                      onChange={e => setHasShadowEffect(e.target.checked)}
                    />
                    Shadow Effect
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={hasGlowEffect}
                      onChange={e => setHasGlowEffect(e.target.checked)}
                    />
                    Glow Effect
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={has3DEffect}
                      onChange={e => setHas3DEffect(e.target.checked)}
                    />
                    3D Depth Effect
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={e => setShowGrid(e.target.checked)}
                    />
                    Show Grid
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={showStats}
                      onChange={e => setShowStats(e.target.checked)}
                    />
                    Show Statistics
                  </label>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Fabric Texture
                  </label>
                  <select
                    value={fabricTexture}
                    onChange={e => setFabricTexture(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      background: theme === 'dark' ? '#2a2a3e' : '#f0f0f0',
                      color: textColor,
                      border: '1px solid #444'
                    }}
                  >
                    <option value="none">None</option>
                    <option value="silk">Silk</option>
                    <option value="cotton">Cotton</option>
                    <option value="satin">Satin</option>
                  </select>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    View Mode
                  </label>
                  <select
                    value={viewMode}
                    onChange={e => setViewMode(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      background: theme === 'dark' ? '#2a2a3e' : '#f0f0f0',
                      color: textColor,
                      border: '1px solid #444'
                    }}
                  >
                    <option value="flag">Flag Only</option>
                    <option value="pole">With Pole</option>
                    <option value="outdoor">Outdoor Scene</option>
                    <option value="indoor">Indoor</option>
                  </select>
                </div>
              </div>
              
              {/* Color Scheme */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.9 }}>
                  Color Scheme
                </h3>
                <select
                  value={colorScheme}
                  onChange={e => setColorScheme(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    background: theme === 'dark' ? '#2a2a3e' : '#f0f0f0',
                    color: textColor,
                    border: '1px solid #444',
                    marginBottom: '1rem'
                  }}
                >
                  <option value="official">Official Colors</option>
                  <option value="historical">Historical</option>
                  <option value="vintage">Vintage</option>
                  <option value="modern">Modern</option>
                  <option value="royal">Royal</option>
                  <option value="custom">Custom</option>
                </select>
                
                {colorScheme === 'custom' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={customColors.red}
                      onChange={e => setCustomColors(prev => ({ ...prev, red: e.target.value }))}
                      style={{ width: '60px', height: '40px' }}
                    />
                    <input
                      type="color"
                      value={customColors.white}
                      onChange={e => setCustomColors(prev => ({ ...prev, white: e.target.value }))}
                      style={{ width: '60px', height: '40px' }}
                    />
                    <input
                      type="color"
                      value={customColors.blue}
                      onChange={e => setCustomColors(prev => ({ ...prev, blue: e.target.value }))}
                      style={{ width: '60px', height: '40px' }}
                    />
                  </div>
                )}
              </div>
              
              {/* Export Options */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.9 }}>
                  Export Options
                </h3>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: isPaused ? '#10b981' : '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    {isPaused ? '▶ Play' : '⏸ Pause'}
                  </button>
                  
                  <button
                    onClick={exportImage}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    📸 Export Image
                  </button>
                </div>
                
                <button
                  onClick={playWindSound}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  🔊 Play Wind Sound
                </button>
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: theme === 'dark' ? '#f0f0f0' : '#333333',
                  color: theme === 'dark' ? '#333333' : '#f0f0f0',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
            
            {/* Canvas Container */}
            <div
              ref={containerRef}
              style={{
                background: cardBg,
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
                onClick={toggleFullscreen}
              />
              
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.5rem',
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                {isFullscreen ? '✕' : '⛶'}
              </button>
            </div>
          </div>
          
          {/* Historical Flags Section */}
          <div style={{
            marginTop: '2rem',
            background: cardBg,
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
              Historical Thai Flags
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {HISTORICAL_FLAGS.map(flag => (
                <div
                  key={flag.name}
                  onClick={() => setSelectedHistoricalFlag(flag)}
                  style={{
                    padding: '1rem',
                    background: selectedHistoricalFlag.name === flag.name 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : theme === 'dark' ? '#2a2a3e' : '#f0f0f0',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    color: selectedHistoricalFlag.name === flag.name ? 'white' : textColor,
                    transition: 'all 0.3s'
                  }}
                >
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{flag.name}</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{flag.year}</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{flag.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Handle aspect ratio
const ThaiFlag: React.FC = () => {
  const [height, setHeight] = useState(600);
  const [width, setWidth] = useState(900);
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState(true);

  useEffect(() => {
    if (isAspectRatioLocked) {
      setWidth(Math.round(height * ASPECT_RATIO));
    }
  }, [height, isAspectRatioLocked]);

  return (
    <EnhancedThaiFlag />
  );
};

export default ThaiFlag;