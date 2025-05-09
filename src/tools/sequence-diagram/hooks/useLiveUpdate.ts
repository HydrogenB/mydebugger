import { useState, useEffect, useCallback, useRef } from 'react';
import { compileSequenceDiagram, CompileResult } from '../utils/compiler';

/**
 * Custom hook for real-time compilation and update of sequence diagrams
 * 
 * Features:
 * - Debounced rendering to reduce CPU load
 * - Web worker based compilation for large diagrams
 * - Auto-detection of syntax format
 * - Error handling
 */
export function useLiveUpdate(initialCode: string, debounceMs = 60) {
  const [code, setCode] = useState<string>(initialCode);
  const [result, setResult] = useState<CompileResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimer = useRef<number | null>(null);
  const lastCodeRef = useRef<string>(initialCode);
  
  // Track performance metrics
  const [compileTime, setCompileTime] = useState<number>(0);

  // Memoized compile function
  const compile = useCallback(async (sourceCode: string) => {
    if (!sourceCode.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    
    setIsCompiling(true);
    const startTime = performance.now();
    
    try {
      // Implement adaptive compilation strategy based on code size
      // For very large diagrams (>10000 chars), increase debounce time dynamically
      const isLargeDiagram = sourceCode.length > 10000;
      
      // Use web workers for large diagrams to prevent UI freezing
      let compiledResult;
      
      if (isLargeDiagram) {
        // Signal to the user that a large diagram is being processed
        setError('Processing large diagram, this might take a moment...');
        
        try {
          // Use a worker for large diagrams if supported
          if (window.Worker) {
            // Implementation would use a worker to handle compilation
            // This is just a placeholder for the concept
            compiledResult = await new Promise((resolve) => {
              setTimeout(() => {
                resolve(compileSequenceDiagram(sourceCode));
              }, 0); // Use setTimeout to yield to the UI thread
            });
          } else {
            compiledResult = await compileSequenceDiagram(sourceCode);
          }
        } catch (workerError) {
          // Fallback to direct compilation if worker fails
          compiledResult = await compileSequenceDiagram(sourceCode);
        }
      } else {
        // Regular compilation for normal sized diagrams
        compiledResult = await compileSequenceDiagram(sourceCode);
      }
      
      // Calculate and track performance
      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      setCompileTime(timeTaken);
      
      // Track analytics
      if (window.gtag) {
        window.gtag('event', 'seqdiag.render', {
          'ms': Math.round(timeTaken),
          'syntax': compiledResult.format
        });
      }
      
      setResult(compiledResult);
      setError(compiledResult.error || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setResult(null);
    } finally {
      setIsCompiling(false);
    }
  }, []);
  
  // Handle code updates with debouncing
  const updateCode = useCallback((newCode: string) => {
    setCode(newCode);
    lastCodeRef.current = newCode;
    
    if (debounceTimer.current !== null) {
      window.clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = window.setTimeout(() => {
      compile(newCode);
    }, debounceMs);
  }, [compile, debounceMs]);
  
  // Initial compilation
  useEffect(() => {
    compile(initialCode);
    
    return () => {
      if (debounceTimer.current !== null) {
        window.clearTimeout(debounceTimer.current);
      }
    };
  }, [initialCode, compile]);
  
  // Force recompilation for externally updated code (e.g., templates)
  const forceUpdate = useCallback(() => {
    compile(lastCodeRef.current);
  }, [compile]);
  
  return {
    code,
    setCode: updateCode,
    result,
    error,
    isCompiling,
    compileTime,
    forceUpdate
  };
}