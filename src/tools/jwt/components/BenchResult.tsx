import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Alert, Badge } from '../../../design-system';
import { useJwt } from '../context/JwtContext';

// List of algorithms to benchmark
const ALGORITHMS = [
  'HS256', 'HS384', 'HS512',
  'RS256', 'RS384', 'RS512',
  'ES256', 'ES384', 'ES512',
  'PS256', 'PS384', 'PS512'
];

// Algorithm family descriptions
const algFamilyDescriptions: Record<string, string> = {
  HS: 'HMAC with SHA-2 - Symmetric key signatures using a shared secret',
  RS: 'RSASSA-PKCS1-v1_5 - RSA signatures with PKCS#1 v1.5 padding',
  ES: 'ECDSA - Elliptic Curve Digital Signature Algorithm',
  PS: 'RSASSA-PSS - RSA signatures with Probabilistic Signature Scheme'
};

// Define algorithm color groups
const getAlgorithmColor = (alg: string): string => {
  if (alg.startsWith('HS')) return 'bg-blue-500';
  if (alg.startsWith('RS')) return 'bg-green-500';
  if (alg.startsWith('ES')) return 'bg-purple-500';
  if (alg.startsWith('PS')) return 'bg-orange-500';
  return 'bg-gray-500';
};

// Format numbers for display
const formatNumber = (num: number): string => {
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

interface BenchmarkResult {
  algorithm: string;
  operationsPerSecond: number;
  averageTime: number;
  totalOperations: number;
  color: string;
}

/**
 * JWT Algorithm Benchmark Component
 * Tests the performance of various JWT algorithms in the current browser
 */
export const BenchResult: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [sortBy, setSortBy] = useState<'algorithm' | 'performance'>('performance');
  
  // We'll import the crypto worker directly instead of using it from context
  const benchmarkAlgorithm = useCallback(async (algorithm: string): Promise<BenchmarkResult> => {
    try {
      const start = performance.now();
      const iterations = algorithm.startsWith('ES') ? 50 : 100; // Fewer iterations for slower EC algorithms
      
      // Import crypto worker directly
      const cryptoWorker = await import('../workers/cryptoWorker');
      const opsPerSecond = await cryptoWorker.bench(algorithm);
      
      const end = performance.now();
      const totalTime = end - start;
      
      return {
        algorithm,
        operationsPerSecond: opsPerSecond,
        averageTime: iterations > 0 ? totalTime / iterations : 0,
        totalOperations: iterations,
        color: getAlgorithmColor(algorithm)
      };
    } catch (e) {
      console.error(`Error benchmarking ${algorithm}:`, e);
      return {
        algorithm,
        operationsPerSecond: 0,
        averageTime: 0,
        totalOperations: 0,
        color: getAlgorithmColor(algorithm)
      };
    }
  }, []);

  // Run all benchmarks sequentially
  const runBenchmarks = useCallback(async () => {
    setIsRunning(true);
    setResults([]);
    setError(null);
    setProgress(0);
    
    try {
      const newResults: BenchmarkResult[] = [];
      
      for (let i = 0; i < ALGORITHMS.length; i++) {
        const algorithm = ALGORITHMS[i];
        setCurrentAlgorithm(algorithm);
        
        // Add delay to allow UI updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const result = await benchmarkAlgorithm(algorithm);
        newResults.push(result);
        
        // Update progress
        setProgress(((i + 1) / ALGORITHMS.length) * 100);
      }
      
      // Sort results by operations per second (descending)
      const sortedResults = [...newResults].sort((a, b) => b.operationsPerSecond - a.operationsPerSecond);
      setResults(sortedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during benchmarking');
    } finally {
      setCurrentAlgorithm(null);
      setIsRunning(false);
    }
  }, [benchmarkAlgorithm]);

  // Sort results when sort method changes
  useEffect(() => {
    if (results.length > 0) {
      const sortedResults = [...results].sort((a, b) => {
        if (sortBy === 'algorithm') {
          return a.algorithm.localeCompare(b.algorithm);
        } else {
          return b.operationsPerSecond - a.operationsPerSecond;
        }
      });
      setResults(sortedResults);
    }
  }, [sortBy]);

  // Get the fastest algorithm from results
  const getFastestAlgorithm = useCallback(() => {
    if (results.length === 0) return null;
    return results.reduce((fastest, current) => 
      current.operationsPerSecond > fastest.operationsPerSecond ? current : fastest
    );
  }, [results]);

  // Group results by algorithm family
  const getResultsByFamily = useCallback(() => {
    const families: Record<string, BenchmarkResult[]> = {};
    
    results.forEach(result => {
      const family = result.algorithm.substring(0, 2);
      if (!families[family]) {
        families[family] = [];
      }
      families[family].push(result);
    });
    
    return families;
  }, [results]);

  // Render benchmark chart with scalable bars
  const renderChart = useCallback(() => {
    if (results.length === 0) return null;
    
    const maxOps = Math.max(...results.map(r => r.operationsPerSecond));
    
    return (
      <div className="mt-4">
        {results.map((result, index) => {
          const widthPercentage = (result.operationsPerSecond / maxOps) * 100;
          const isFastest = result.operationsPerSecond === maxOps;
          
          return (
            <div key={result.algorithm} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="font-medium w-16">{result.algorithm}</span>
                  {isFastest && <Badge color="success" className="ml-2">Fastest</Badge>}
                </div>
                <span className="text-sm">{formatNumber(result.operationsPerSecond)} op/s</span>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                <div 
                  className={`h-full ${result.color} transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${widthPercentage}%`,
                    animationDelay: `${index * 0.1}s`,
                    opacity: isRunning ? 0.7 : 1
                  }}
                ></div>
              </div>
              {showDetailedResults && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex justify-between">
                  <span>Avg: {formatNumber(result.averageTime)} ms/op</span>
                  <span>Total: {result.totalOperations} operations</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [results, isRunning, showDetailedResults]);

  // Render family group results
  const renderFamilyGroups = useCallback(() => {
    const families = getResultsByFamily();
    
    return (
      <div className="mt-6 space-y-6">
        {Object.entries(families).map(([family, algResults]) => (
          <div key={family} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h4 className="font-medium mb-2">{family} Family</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {algFamilyDescriptions[family] || 'JWT signature algorithm family'}
            </p>
            
            <div className="space-y-3">
              {algResults.map(result => (
                <div key={result.algorithm} className="flex justify-between items-center">
                  <span>{result.algorithm}</span>
                  <div className="font-mono">
                    {formatNumber(result.operationsPerSecond)} op/s
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }, [getResultsByFamily]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">JWT Algorithm Performance</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Benchmark JWT signing algorithms in your browser to determine the best performance.
        </p>
      </div>

      <Card className="mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Performance Benchmark</h3>
        </div>
        
        <div className="p-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800 mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm flex items-center">
              <span className="mr-2">⚡</span>
              This tool tests JWT algorithm performance in your browser. Results may vary based on device capabilities and browser implementation.
            </p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <Button
              onClick={runBenchmarks}
              variant="primary"
              disabled={isRunning}
            >
              {isRunning ? 'Benchmarking...' : 'Run Benchmark'}
            </Button>
            
            {results.length > 0 && (
              <div className="flex items-center">
                <label className="mr-2 text-sm">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'algorithm' | 'performance')}
                  className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm p-1"
                >
                  <option value="performance">Speed (fastest first)</option>
                  <option value="algorithm">Algorithm name</option>
                </select>
              </div>
            )}
          </div>
          
          {isRunning && currentAlgorithm && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Testing algorithm: <strong>{currentAlgorithm}</strong></span>
                <span className="text-sm">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {error && (
            <Alert type="error" className="mb-4">{error}</Alert>
          )}
          
          {results.length > 0 && (
            <>
              <div className="mb-2 flex justify-between items-center">
                <h4 className="font-medium">Results</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show-details"
                    checked={showDetailedResults}
                    onChange={() => setShowDetailedResults(!showDetailedResults)}
                    className="mr-2"
                  />
                  <label htmlFor="show-details" className="text-sm">Show detailed metrics</label>
                </div>
              </div>
              
              {renderChart()}
              
              {!isRunning && getFastestAlgorithm() && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                  <div className="font-medium text-green-800 dark:text-green-300 mb-1">
                    Performance Summary
                  </div>
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    <span className="font-medium">{getFastestAlgorithm()?.algorithm}</span> is the fastest algorithm in your browser,
                    performing {formatNumber(getFastestAlgorithm()?.operationsPerSecond || 0)} operations per second.
                  </p>
                </div>
              )}
              
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium mb-3">Algorithm Family Comparison</h4>
                {renderFamilyGroups()}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">System:</span>
                    <span className="ml-2 text-sm">{navigator.userAgent}</span>
                  </div>
                  <div>
                    <Badge color="info">
                      {new Date().toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {!isRunning && results.length === 0 && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              Click "Run Benchmark" to test JWT algorithm performance in your browser.
            </div>
          )}
        </div>
      </Card>
      
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">About JWT Algorithms</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Symmetric Algorithms (HS*)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                HMAC with SHA-2 algorithms use a shared secret key for both signing and verification.
                They are typically faster but require secure key distribution.
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>HS256: HMAC using SHA-256</li>
                <li>HS384: HMAC using SHA-384</li>
                <li>HS512: HMAC using SHA-512</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Asymmetric Algorithms (RS*, ES*, PS*)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Asymmetric algorithms use a private key for signing and a public key for verification.
                They are typically slower but provide better security separation.
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>RS256: RSA Signature with SHA-256</li>
                <li>ES256: ECDSA Signature with SHA-256</li>
                <li>PS256: RSA-PSS Signature with SHA-256</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-2">Choosing the Right Algorithm</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              When selecting a JWT signing algorithm, consider these factors:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <span className="font-medium">Performance</span>: HMAC algorithms (HS*) are typically faster 
                than RSA (RS*/PS*) and ECDSA (ES*).
              </li>
              <li>
                <span className="font-medium">Security</span>: ES256 offers similar security to RS256 with 
                smaller signatures and better performance.
              </li>
              <li>
                <span className="font-medium">Key Management</span>: Asymmetric algorithms allow public key 
                distribution without exposing signing capabilities.
              </li>
              <li>
                <span className="font-medium">Standards Compliance</span>: Some standards require specific 
                algorithms (e.g., OIDC prefers RS256).
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};