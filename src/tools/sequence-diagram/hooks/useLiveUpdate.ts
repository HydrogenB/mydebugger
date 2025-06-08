import { useState, useEffect } from 'react';

// Simplified hook that doesn't depend on external libraries
export const useLiveUpdate = (initialCode: string, debounceMs = 500) => {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<{ svg: string; code: string }>({ svg: '', code: '' });
  const [error, setError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  // Store last value for our own debounce implementation
  const [timer, setTimer] = useState<number | null>(null);
  const [lastExec, setLastExec] = useState(0);
  const [debouncedCode, setDebouncedCode] = useState(code);
  
  // Basic debounce implementation
  useEffect(() => {
    const now = Date.now();
    if (now - lastExec > debounceMs) {
      setDebouncedCode(code);
      setLastExec(now);
    } else {
      if (timer) clearTimeout(timer);
      const newTimer = window.setTimeout(() => {
        setDebouncedCode(code);
        setLastExec(Date.now());
      }, debounceMs);
      setTimer(newTimer);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [code, debounceMs, lastExec, timer]);
  
  // Simplified compile function that generates a basic SVG
  const compile = async (source: string) => {
    if (!source) {
      setResult({ svg: '', code: '' });
      return;
    }
    
    setIsCompiling(true);
    setError(null);
    
    try {
      // Simulate compilation delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Create a very simple SVG representation
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
        <rect width="100%" height="100%" fill="white"/>
        <text x="20" y="20" font-family="monospace">Sequence Diagram Preview</text>
        <text x="20" y="40" font-family="monospace">(Simplified placeholder)</text>
        <line x1="50" y1="60" x2="350" y2="60" stroke="black" stroke-width="1"/>
        <text x="50" y="80" font-family="monospace">A</text>
        <text x="350" y="80" font-family="monospace">B</text>
        <line x1="50" y1="60" x2="50" y2="180" stroke="black" stroke-width="1"/>
        <line x1="350" y1="60" x2="350" y2="180" stroke="black" stroke-width="1"/>
        <line x1="50" y1="100" x2="350" y2="100" stroke="black" stroke-width="1" marker-end="url(#arrow)"/>
        <text x="150" y="95" font-family="monospace">message</text>
      </svg>`;
      
      setResult({
        svg,
        code: source
      });
      
    } catch (err: any) {
      console.error('Diagram compilation error:', err);
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setIsCompiling(false);
    }
  };
  
  // Run compilation when debounced code changes
  useEffect(() => {
    compile(debouncedCode);
  }, [debouncedCode]);
  
  return {
    code,
    setCode,
    result,
    error,
    isCompiling
  };
};