import React, { useEffect, useState } from 'react';
import { 
  Card,
  Badge,
  Button,
  LoadingSpinner
} from '../../../design-system';
import * as cryptoWorker from '../workers/cryptoWorker';

interface BenchResultProps {
  onRun?: () => void;
}

interface BenchmarkResult {
  algorithm: string;
  opsPerSecond: number;
  error?: string;
  category: 'sign' | 'verify';
}

/**
 * JWT Algorithm Benchmark component - performs speed testing on JWT algorithms
 */
export const BenchResult: React.FC<BenchResultProps> = ({ onRun }) => {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Define algorithms to benchmark
  const algorithms = [
    { name: 'HS256', category: 'sign' },
    { name: 'HS384', category: 'sign' },
    { name: 'HS512', category: 'sign' },
    { name: 'RS256', category: 'sign' },
    { name: 'RS384', category: 'sign' },
    { name: 'RS512', category: 'sign' },
    { name: 'ES256', category: 'sign' },
    { name: 'ES384', category: 'sign' },
    { name: 'ES512', category: 'sign' }
  ] as const;
  
  const runBenchmark = async () => {
    setIsRunning(true);
    setError(null);
    setResults([]);
    
    try {
      const benchResults: BenchmarkResult[] = [];
      
      // Simple test data
      const testHeader = { alg: 'none', typ: 'JWT' };
      const testPayload = { sub: '1234567890', name: 'John Doe', iat: 1516239022 };
      
      // Run benchmarks sequentially
      for (const algo of algorithms) {
        try {
          // Fix: Pass only the algorithm name to the bench function
          const opsPerSecond = await cryptoWorker.bench(algo.name as any);
          
          benchResults.push({
            algorithm: algo.name,
            opsPerSecond: opsPerSecond,
            category: algo.category as 'sign' | 'verify'
          });
        } catch (e) {
          benchResults.push({
            algorithm: algo.name,
            opsPerSecond: 0,
            error: e instanceof Error ? e.message : String(e),
            category: algo.category as 'sign' | 'verify'
          });
        }
        
        // Update with partial results to provide feedback during the test
        setResults([...benchResults]);
      }
    } catch (e) {
      setError(`Benchmark error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsRunning(false);
    }
    
    if (onRun) {
      onRun();
    }
  };
  
  // Get the maximum ops/second for scaling the chart
  const maxOpsPerSecond = Math.max(...results.map(r => r.opsPerSecond), 100);
  
  // Group results by category
  const signResults = results.filter(r => r.category === 'sign');
  const verifyResults = results.filter(r => r.category === 'verify');
  
  return (
    <Card>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold">JWT Algorithm Benchmark</h3>
        <Button
          variant="primary"
          onClick={runBenchmark}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Running...
            </>
          ) : (
            'Run Benchmark'
          )}
        </Button>
      </div>
      
      <div className="p-4">
        {error && (
          <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        {isRunning && !results.length && (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <LoadingSpinner size="lg" className="mb-4" />
            <p>Initializing benchmark tests...</p>
            <p className="text-sm mt-1">This may take a few moments</p>
          </div>
        )}
        
        {results.length > 0 && (
          <div>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Results show operations per second. Higher is better. Tests run in this browser.
            </p>
            
            <h4 className="font-semibold mb-2">Signing Performance</h4>
            <div className="mb-6">
              {signResults.map((result, index) => (
                <div key={index} className="mb-3">
                  <div className="flex items-center mb-1">
                    <span className="w-16 font-medium">{result.algorithm}</span>
                    <div className="flex-grow">
                      <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden">
                        <div 
                          className={`h-full ${result.error ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${(result.opsPerSecond / maxOpsPerSecond) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-2 w-24 text-right font-mono text-sm">
                      {result.error ? 'Error' : Math.round(result.opsPerSecond).toLocaleString()}
                    </span>
                  </div>
                  {result.error && (
                    <p className="text-red-600 dark:text-red-400 text-xs ml-16">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
            
            {verifyResults.length > 0 && (
              <>
                <h4 className="font-semibold mb-2">Verification Performance</h4>
                <div>
                  {verifyResults.map((result, index) => (
                    <div key={index} className="mb-3">
                      <div className="flex items-center mb-1">
                        <span className="w-16 font-medium">{result.algorithm}</span>
                        <div className="flex-grow">
                          <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden">
                            <div 
                              className={`h-full ${result.error ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: `${(result.opsPerSecond / maxOpsPerSecond) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="ml-2 w-24 text-right font-mono text-sm">
                          {result.error ? 'Error' : Math.round(result.opsPerSecond).toLocaleString()}
                        </span>
                      </div>
                      {result.error && (
                        <p className="text-red-600 dark:text-red-400 text-xs ml-16">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
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
        )}
        
        {!isRunning && results.length === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Click "Run Benchmark" to test JWT algorithm performance in your browser.
          </div>
        )}
      </div>
    </Card>
  );
};