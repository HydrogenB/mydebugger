import React from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import { Card } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';
import { useRegexTester } from './hooks';
import { 
  RegexPatternInput,
  TestInput,
  MatchesDisplay,
  ExamplesAndPatterns
} from './components';

/**
 * Regular Expression Tester Tool
 * Tests and validates regex patterns with visual results display
 */
const RegexTester: React.FC = () => {
  const tool = getToolByRoute('/regex');
  
  // Use our custom hook for all functionality  const {
    pattern,
    input,
    flags,
    error,
    result,
    showDebugInfo,
    flagOptions,
    commonPatterns,
    regexExamples,
    setPattern,
    setInput,
    setFlags,
    toggleFlag,
    getHighlightedHtml,
    loadExample,
    useCommonPattern,
    resetAll,
    setShowDebugInfo,
    runTest
  } = useRegexTester();

  return (
    <>
      <Helmet>
        <title>Regex Tester | MyDebugger</title>
        <meta name="description" content="Test and debug regular expressions with real-time matching." />
      </Helmet>
      
      <ToolLayout tool={tool!}>
        <div className="space-y-6">
          {/* Pattern Input Component */}
          <Card isElevated>
            <RegexPatternInput 
              pattern={pattern} 
              onPatternChange={setPattern} 
              flags={flags} 
              flagOptions={flagOptions}
              onToggleFlag={toggleFlag}
              error={error}
            />
            
            {/* Test String Input Component */}
            <TestInput 
              input={input} 
              onInputChange={setInput} 
            />
              {/* Matches Display Component */}
            <MatchesDisplay 
              result={result}
              showDebugInfo={showDebugInfo}
              highlightedHtml={getHighlightedHtml(input, result)}
            />
            
            <div className="mt-4 flex justify-end space-x-3">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={resetAll}
              >
                Clear All
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={runTest}
              >
                Test Regex
              </Button>
            </div>
          </Card>
          
          {/* Examples & Patterns Component */}
          <ExamplesAndPatterns 
            examples={regexExamples}
            commonPatterns={commonPatterns}
            onLoadExample={loadExample}
            onUsePattern={useCommonPattern}
          />
        </div>
      </ToolLayout>
    </>
  );
};

export default RegexTester;
