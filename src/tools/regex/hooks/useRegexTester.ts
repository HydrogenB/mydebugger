import { useState, useEffect, useCallback, useMemo } from 'react';
import { RegexMatch, RegexMatchResult, FlagOption, RegexExample } from '../types';
import { testRegex, highlightMatches, getCommonPatterns, getRegexExamples } from '../utils';

/**
 * Custom hook for regex tester functionality
 */
export const useRegexTester = (
  initialPattern: string = '',
  initialInput: string = '',
  initialFlags: string = 'g'
) => {
  // Main state
  const [pattern, setPattern] = useState<string>(initialPattern);
  const [input, setInput] = useState<string>(initialInput);
  const [flags, setFlags] = useState<string>(initialFlags);
  const [error, setError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  
  // Results state
  const [result, setResult] = useState<RegexMatchResult>({
    matches: [],
    executionTime: 0,
    totalMatches: 0
  });
  
  // Common patterns and examples
  const commonPatterns = useMemo(() => getCommonPatterns(), []);
  const regexExamples = useMemo(() => getRegexExamples(), []);

  // Flag options
  const flagOptions: FlagOption[] = useMemo(() => [
    { value: 'g', label: 'Global', description: 'Find all matches rather than stopping after the first match' },
    { value: 'i', label: 'Case-insensitive', description: 'Case-insensitive matching' },
    { value: 'm', label: 'Multiline', description: 'Treat beginning and end characters (^ and $) as working over multiple lines' },
    { value: 's', label: 'Dotall', description: 'Dot (.) matches newline characters (\\n)' },
    { value: 'u', label: 'Unicode', description: 'Treat pattern as a sequence of Unicode code points' },
    { value: 'y', label: 'Sticky', description: 'Matches only from the index indicated by lastIndex property' }
  ], []);
  
  /**
   * Executes the regex test with current pattern, input and flags
   */
  const runTest = useCallback(() => {
    if (!pattern) {
      setError(null);
      setResult({
        matches: [],
        executionTime: 0,
        totalMatches: 0
      });
      return;
    }
    
    try {
      // Validate the regex pattern
      new RegExp(pattern, flags);
      setError(null);
      
      // Run the test
      const testResult = testRegex(pattern, input, flags);
      
      if (testResult.errorMessage) {
        setError(testResult.errorMessage);
      }
      
      setResult(testResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regular expression');
      setResult({
        matches: [],
        executionTime: 0,
        totalMatches: 0
      });
    }
  }, [pattern, input, flags]);
  
  /**
   * Toggles a flag in the flags string
   */
  const toggleFlag = useCallback((flag: string) => {
    setFlags(prevFlags => {
      if (prevFlags.includes(flag)) {
        return prevFlags.replace(flag, '');
      } else {
        return prevFlags + flag;
      }
    });
  }, []);
  
  /**
   * Loads a predefined example
   */
  const loadExample = useCallback((example: RegexExample) => {
    setPattern(example.pattern);
    setInput(example.input);
    setFlags(example.flags);
  }, []);
  
  /**
   * Uses a common pattern
   */
  const useCommonPattern = useCallback((patternStr: string) => {
    setPattern(patternStr);
  }, []);
  
  /**
   * Gets highlighted HTML with matches
   */
  const getHighlightedHtml = useCallback(() => {
    return highlightMatches(input, result.matches);
  }, [input, result.matches]);
  
  /**
   * Reset all fields
   */
  const resetAll = useCallback(() => {
    setPattern('');
    setInput('');
    setFlags('g');
    setError(null);
    setResult({
      matches: [],
      executionTime: 0,
      totalMatches: 0
    });
  }, []);
  
  // Run test whenever pattern, input or flags change
  useEffect(() => {
    runTest();
  }, [pattern, input, flags, runTest]);
  
  return {
    // State
    pattern,
    input,
    flags,
    error,
    result,
    showDebugInfo,
    
    // Reference data
    flagOptions,
    commonPatterns,
    regexExamples,
    
    // Actions
    setPattern,
    setInput,
    setFlags,
    toggleFlag,
    runTest,
    loadExample,
    useCommonPattern,
    getHighlightedHtml,
    resetAll,
    setShowDebugInfo
  };
};
