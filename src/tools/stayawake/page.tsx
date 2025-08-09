/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';

// Types
interface StayAwakeStats {
  todayMs: number;
  weekMs: number;
  lastUsed: string;
}

interface UseStayAwakeReturn {
  supported: boolean;
  running: boolean;
  timeLeft: number;
  duration: number;
  stats: { todayMin: number; weekHr: number; weekMin: number };
  start: (ms: number) => Promise<void>;
  toggle: () => Promise<void>;
  resetStats: () => void;
  error: string | null;
  batteryLevel: number | null;
  isCharging: boolean;
}

// Wake Lock Model Functions
const isWakeLockSupported = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return 'wakeLock' in navigator && 'request' in (navigator as any).wakeLock;
};

const requestWakeLock = async (): Promise<WakeLockSentinel | null> => {
  if (!isWakeLockSupported()) return null;
  try {
    return await (navigator as any).wakeLock.request('screen');
  } catch (err: any) {
    throw new Error(err.message || 'Failed to acquire wake lock');
  }
};

const releaseWakeLock = async (sentinel: WakeLockSentinel | null): Promise<void> => {
  if (sentinel && !sentinel.released) {
    try {
      await sentinel.release();
    } catch (err) {
      console.error('Error releasing wake lock:', err);
    }
  }
};

// Stats Management
const STATS_KEY = 'stayAwakeStats';

const loadStats = (): StayAwakeStats => {
  if (typeof window === 'undefined') {
    return { todayMs: 0, weekMs: 0, lastUsed: new Date().toISOString() };
  }
  
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) {
      return { todayMs: 0, weekMs: 0, lastUsed: new Date().toISOString() };
    }
    
    const stats = JSON.parse(stored);
    const now = new Date();
    const lastUsed = new Date(stats.lastUsed);
    
    // Reset daily stats if it's a new day
    const isNewDay = now.toDateString() !== lastUsed.toDateString();
    
    // Reset weekly stats if it's a new week
    const weekDiff = Math.floor((now.getTime() - lastUsed.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const isNewWeek = weekDiff > 0;
    
    return {
      todayMs: isNewDay ? 0 : stats.todayMs,
      weekMs: isNewWeek ? 0 : stats.weekMs,
      lastUsed: now.toISOString(),
    };
  } catch {
    return { todayMs: 0, weekMs: 0, lastUsed: new Date().toISOString() };
  }
};

const saveStats = (stats: StayAwakeStats): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (err) {
      console.error('Failed to save stats:', err);
    }
  }
};

const addAwakeTime = (ms: number): StayAwakeStats => {
  const stats = loadStats();
  stats.todayMs += ms;
  stats.weekMs += ms;
  stats.lastUsed = new Date().toISOString();
  saveStats(stats);
  return stats;
};

const resetStatsModel = (): void => {
  const newStats = { todayMs: 0, weekMs: 0, lastUsed: new Date().toISOString() };
  saveStats(newStats);
};

// Custom Hook
const useStayAwake = (): UseStayAwakeReturn => {
  const [supported, setSupported] = useState(false);
  const [sentinel, setSentinel] = useState<WakeLockSentinel | null>(null);
  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [stats, setStats] = useState(loadStats());
  const [error, setError] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  
  const intervalRef = useRef<number>();
  const statsIntervalRef = useRef<number>();
  const visibilityRef = useRef<boolean>(true);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Battery monitoring
  useEffect(() => {
    const checkBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);
          
          const onLevelChange = () => {
            setBatteryLevel(Math.round(battery.level * 100));
          };
          const onChargingChange = () => {
            setIsCharging(battery.charging);
          };
          
          battery.addEventListener('levelchange', onLevelChange);
          battery.addEventListener('chargingchange', onChargingChange);
          
          // Cleanup listeners when component unmounts
          return () => {
            try {
              battery.removeEventListener('levelchange', onLevelChange);
              battery.removeEventListener('chargingchange', onChargingChange);
            } catch {}
          };
        } catch (err) {
          console.log('Battery API not available');
        }
      }
    };
    
    let cleanup: (() => void) | undefined;
    checkBattery().then((fn) => {
      if (typeof fn === 'function') cleanup = fn;
    });
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      visibilityRef.current = !document.hidden;
      
      if (document.hidden && sentinel) {
        // Page is hidden, wake lock might be released
        pausedTimeRef.current = Date.now();
      } else if (!document.hidden && running && sentinel) {
        // Page is visible again, reacquire wake lock if needed
        if (pausedTimeRef.current > 0) {
          const pausedDuration = Date.now() - pausedTimeRef.current;
          startTimeRef.current += pausedDuration;
          pausedTimeRef.current = 0;
        }
        
        // Reacquire wake lock
        acquire();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [running, sentinel]);

  const acquire = useCallback(async () => {
    if (!supported) {
      setError('Wake Lock API is not supported in this browser');
      return;
    }
    
    try {
      setError(null);
      const s = await requestWakeLock();
      
      if (s) {
        s.addEventListener('release', () => {
          console.log('Wake lock released');
          if (running) {
            // Try to reacquire if still running
            setTimeout(() => {
              if (running && visibilityRef.current) {
                acquire();
              }
            }, 1000);
          }
        });
        
        setSentinel(s);
      } else {
        setError('Failed to acquire wake lock');
      }
    } catch (err: any) {
      console.error('Wake lock error:', err);
      setError(err.message || 'Failed to acquire wake lock');
      setSentinel(null);
    }
  }, [supported, running]);

  const release = useCallback(async () => {
    await releaseWakeLock(sentinel);
    setSentinel(null);
  }, [sentinel]);

  const stop = useCallback(async () => {
    clearInterval(intervalRef.current);
    clearInterval(statsIntervalRef.current);
    intervalRef.current = undefined;
    statsIntervalRef.current = undefined;
    setRunning(false);
    setTimeLeft(0);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
    await release();
  }, [release]);

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, duration - elapsed);
      
      if (remaining <= 0) {
        stop();
        // Show notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Screen Stay Awake', {
            body: 'Timer completed! Screen will now sleep normally.',
            icon: '⏰',
          });
        }
        return 0;
      }
      
      return remaining;
    });
  }, [duration, stop]);

  const updateStats = useCallback(() => {
    const updated = addAwakeTime(1000);
    setStats(updated);
  }, []);

  const start = useCallback(
    async (ms: number) => {
      if (ms <= 0) {
        setError('Please select a valid duration');
        return;
      }
      
      if (ms > 24 * 60 * 60 * 1000) {
        setError('Maximum duration is 24 hours');
        return;
      }
      
      clearInterval(intervalRef.current);
      clearInterval(statsIntervalRef.current);
      
      setDuration(ms);
      setTimeLeft(ms);
      setRunning(true);
      setError(null);
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      
      await acquire();
      
      intervalRef.current = window.setInterval(tick, 100); // Update every 100ms for smoother display
      statsIntervalRef.current = window.setInterval(updateStats, 1000); // Update stats every second
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    },
    [acquire, tick, updateStats]
  );

  const toggle = useCallback(async () => {
    if (running) {
      await stop();
    } else {
      await start(duration || 30 * 60 * 1000);
    }
  }, [running, start, stop, duration]);

  const resetStats = useCallback(() => {
    resetStatsModel();
    setStats(loadStats());
  }, []);

  useEffect(() => {
    setSupported(isWakeLockSupported());
  }, []);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(statsIntervalRef.current);
      releaseWakeLock(sentinel);
    };
  }, [sentinel]);

  const statsView = {
    todayMin: Math.round(stats.todayMs / 60000),
    weekHr: Math.floor(stats.weekMs / 3600000),
    weekMin: Math.round((stats.weekMs % 3600000) / 60000),
  };

  return { 
    supported, 
    running, 
    timeLeft, 
    duration, 
    start, 
    toggle, 
    stats: statsView, 
    resetStats,
    error,
    batteryLevel,
    isCharging
  };
};

// View Component
const StayAwakeView: React.FC<UseStayAwakeReturn> = ({
  supported,
  running,
  timeLeft,
  duration,
  toggle,
  start,
  stats,
  resetStats,
  error,
  batteryLevel,
  isCharging
}) => {
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [showCustom, setShowCustom] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Auto-detect theme
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const formatTime = (ms: number): string => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const presetDurations = [
    { label: '5 min', value: 5 * 60 * 1000 },
    { label: '15 min', value: 15 * 60 * 1000 },
    { label: '30 min', value: 30 * 60 * 1000 },
    { label: '1 hour', value: 60 * 60 * 1000 },
    { label: '2 hours', value: 2 * 60 * 60 * 1000 },
    { label: '4 hours', value: 4 * 60 * 60 * 1000 },
  ];

  const handleCustomStart = () => {
    const ms = (customHours * 60 + customMinutes) * 60 * 1000;
    start(ms);
    setShowCustom(false);
  };

  const bgGradient = theme === 'dark' 
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)';

  const cardBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const textColor = theme === 'dark' ? '#f1f5f9' : '#1e293b';
  const mutedText = theme === 'dark' ? '#94a3b8' : '#64748b';

  if (!supported) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: bgGradient,
        padding: '1rem'
      }}>
        <div style={{
          background: cardBg,
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '400px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: textColor, marginBottom: '1rem' }}>Browser Not Supported</h2>
          <p style={{ color: mutedText, lineHeight: 1.6 }}>
            The Wake Lock API is not supported in this browser. 
            Please use a modern browser like Chrome, Edge, or Safari on mobile.
          </p>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: theme === 'dark' ? '#0f172a' : '#f1f5f9', borderRadius: '0.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: mutedText }}>
              Supported browsers: Chrome 84+, Edge 84+, Safari 16.4+ (iOS/iPadOS)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Stay Awake - Keep Your Screen On</title>
        <meta name="description" content="Prevent your screen from sleeping with adjustable timer. Perfect for reading, presentations, and monitoring." />
      </Helmet>
      
      <div style={{ 
        minHeight: '100vh',
        background: bgGradient,
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '120%',
          height: '120%',
          opacity: 0.05,
          pointerEvents: 'none',
          background: `radial-gradient(circle at 20% 50%, ${theme === 'dark' ? '#3b82f6' : '#0ea5e9'} 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${theme === 'dark' ? '#8b5cf6' : '#a78bfa'} 0%, transparent 50%),
                       radial-gradient(circle at 40% 20%, ${theme === 'dark' ? '#ec4899' : '#f472b6'} 0%, transparent 50%)`,
          filter: 'blur(60px)',
          animation: 'float 20s ease-in-out infinite'
        }} />

        {/* Main Container */}
        <div style={{ 
          maxWidth: '500px', 
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              Stay Awake
            </h1>
            <p style={{ color: mutedText, fontSize: '1.1rem' }}>
              Keep your screen on while you need it
            </p>
          </div>

          {/* Battery Status */}
          {batteryLevel !== null && (
            <div style={{
              background: cardBg,
              borderRadius: '1rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{isCharging ? '🔌' : '🔋'}</span>
                <span style={{ color: textColor, fontWeight: '500' }}>
                  Battery: {batteryLevel}%
                </span>
              </div>
              {batteryLevel < 20 && !isCharging && (
                <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                  Low battery warning
                </span>
              )}
            </div>
          )}

          {/* Main Card */}
          <div style={{
            background: cardBg,
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            {/* Timer Circle */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginBottom: '2rem',
              position: 'relative'
            }}>
              <button
                onClick={toggle}
                style={{
                  position: 'relative',
                  width: '200px',
                  height: '200px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                aria-label="Toggle stay awake"
              >
                <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
                    strokeWidth="12"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke={running ? '#10b981' : '#3b82f6'}
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                      transition: 'stroke-dashoffset 0.3s ease',
                    }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  {running ? (
                    <>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: textColor }}>
                        {formatTime(timeLeft)}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: mutedText, marginTop: '0.25rem' }}>
                        Tap to stop
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                        {theme === 'dark' ? '🌙' : '☀️'}
                      </div>
                      <div style={{ fontSize: '1rem', color: mutedText }}>
                        Tap to start
                      </div>
                    </>
                  )}
                </div>
                {running && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '220px',
                    height: '220px',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                    animation: 'pulse 2s ease-in-out infinite'
                  }} />
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#991b1b',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Quick Duration Buttons */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                color: mutedText, 
                fontSize: '0.85rem', 
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
                textAlign: 'center'
              }}>
                Quick Start
              </h3>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem'
              }}>
                {presetDurations.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => start(preset.value)}
                    disabled={running}
                    style={{
                      padding: '0.75rem',
                      background: running ? (theme === 'dark' ? '#334155' : '#e2e8f0') : 'transparent',
                      border: `2px solid ${running ? 'transparent' : (theme === 'dark' ? '#334155' : '#e2e8f0')}`,
                      borderRadius: '0.75rem',
                      color: running ? mutedText : textColor,
                      fontWeight: '500',
                      cursor: running ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: running ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!running) {
                        e.currentTarget.style.background = theme === 'dark' ? '#334155' : '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!running) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Duration */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowCustom(!showCustom)}
                disabled={running}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  cursor: running ? 'not-allowed' : 'pointer',
                  opacity: running ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                ⚙️ Custom Duration
              </button>
              
              {showCustom && !running && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={customHours}
                    onChange={(e) => setCustomHours(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                    style={{
                      width: '60px',
                      padding: '0.5rem',
                      border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                      borderRadius: '0.5rem',
                      background: cardBg,
                      color: textColor,
                      textAlign: 'center'
                    }}
                  />
                  <span style={{ color: mutedText }}>h</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    style={{
                      width: '60px',
                      padding: '0.5rem',
                      border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                      borderRadius: '0.5rem',
                      background: cardBg,
                      color: textColor,
                      textAlign: 'center'
                    }}
                  />
                  <span style={{ color: mutedText }}>m</span>
                  <button
                    onClick={handleCustomStart}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      marginLeft: '0.5rem'
                    }}
                  >
                    Start
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div style={{
            background: cardBg,
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ color: textColor, fontSize: '1.1rem', fontWeight: '600' }}>
                📊 Usage Statistics
              </h3>
              <button
                onClick={resetStats}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'transparent',
                  border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '0.5rem',
                  color: mutedText,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {stats.todayMin}
                </div>
                <div style={{ fontSize: '0.85rem', color: mutedText }}>
                  Minutes Today
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {stats.weekHr}h {stats.weekMin}m
                </div>
                <div style={{ fontSize: '0.85rem', color: mutedText }}>
                  This Week
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: cardBg,
            borderRadius: '1rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ color: textColor, fontSize: '1rem', marginBottom: '0.75rem' }}>
              💡 How it works
            </h3>
            <ul style={{ 
              color: mutedText, 
              fontSize: '0.9rem',
              lineHeight: 1.6,
              paddingLeft: '1.5rem'
            }}>
              <li>Uses the Screen Wake Lock API to prevent screen timeout</li>
              <li>Works even when browser is in background</li>
              <li>Automatically stops when timer expires</li>
              <li>Battery-friendly with low power consumption</li>
            </ul>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: cardBg,
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.1; transform: translate(-50%, -50%) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(20px) rotate(240deg); }
        }
      `}</style>
    </>
  );
};

// Main Page Component
const StayAwakePage: React.FC = () => {
  const vm = useStayAwake();
  
  return <StayAwakeView {...vm} />;
};

export default StayAwakePage;