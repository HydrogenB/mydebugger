import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import ToolLayout from '../components/ToolLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import InputOutput from '../components/InputOutput';

interface RegexMatch {
  index: number;
  match: string;
  groups: string[];
}

const RegexTester: React.FC = () => {
  const tool = getToolByRoute('/regex');
  
  const [pattern, setPattern] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [flags, setFlags] = useState<string>('g');
  const [error, setError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  
  // Common regex flag options
  const flagOptions = [
    { value: 'g', label: 'Global', description: 'Find all matches rather than stopping after the first match' },
    { value: 'i', label: 'Case-insensitive', description: 'Case-insensitive matching' },
    { value: 'm', label: 'Multiline', description: 'Treat beginning and end characters (^ and $) as working over multiple lines' },
    { value: 's', label: 'Dotall', description: 'Dot (.) matches newline characters (\\n)' },
    { value: 'u', label: 'Unicode', description: 'Treat pattern as a sequence of Unicode code points' },
    { value: 'y', label: 'Sticky', description: 'Matches only from the index indicated by lastIndex property' }
  ];

  // Examples for the user to try
  const examples = [
    { 
      name: 'Email validation',
      pattern: '[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      input: 'Contact us at info@example.com or support@mydebugger.dev',
      flags: 'g'
    },
    { 
      name: 'URL extraction',
      pattern: 'https?://[\\w-]+(\\.[\\w-]+)+([\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?',
      input: 'Visit our website at https://mydebugger.dev or http://example.com/page',
      flags: 'g'
    },
    { 
      name: 'Date parsing (MM/DD/YYYY)',
      pattern: '(0?[1-9]|1[0-2])\\/(0?[1-9]|[12]\\d|3[01])\\/(19|20)\\d{2}',
      input: 'Important dates: 12/25/2023 and 01/15/2024',
      flags: 'g'
    }
  ];
  
  // Parse the regex and find matches
  const regexResults = useMemo(() => {
    if (!pattern || !input) {
      return null;
    }
    
    setError(null);
    
    try {
      const regex = new RegExp(pattern, flags);
      const matches: RegexMatch[] = [];
      let match;
      
      // Reset lastIndex if 'g' flag is used
      if (regex.global) {
        regex.lastIndex = 0;
      }
      
      // Find all matches
      while ((match = regex.exec(input)) !== null) {
        matches.push({
          index: match.index,
          match: match[0],
          groups: match.slice(1)
        });
        
        // Prevent infinite loops for empty matches
        if (match[0] === '' && regex.global) {
          regex.lastIndex++;
        }
        
        // Break if not global
        if (!regex.global) {
          break;
        }
      }
      
      return {
        pattern,
        flags,
        matches,
        totalMatches: matches.length
      };
    } catch (err) {
      setError(`Invalid regular expression: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [pattern, input, flags]);
  
  // Highlighted output with matched sections
  const highlightedOutput = useMemo(() => {
    if (!regexResults || !regexResults.matches.length) {
      return input;
    }
    
    let result = '';
    let lastIndex = 0;
    
    // Sort matches by index to ensure proper rendering
    const sortedMatches = [...regexResults.matches].sort((a, b) => a.index - b.index);
    
    sortedMatches.forEach((match) => {
      // Add text before match
      result += input.substring(lastIndex, match.index);
      // Add highlighted match
      result += `<mark class="bg-green-200 dark:bg-green-800 px-1 rounded">${match.match}</mark>`;
      lastIndex = match.index + match.match.length;
    });
    
    // Add remaining text
    result += input.substring(lastIndex);
    
    return result;
  }, [input, regexResults]);
  
  const applyExample = (example: typeof examples[0]) => {
    setPattern(example.pattern);
    setInput(example.input);
    setFlags(example.flags);
  };
  
  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Regex Tester | MyDebugger</title>
        <meta name="description" content="Test and debug regular expressions with real-time matching." />
        <meta property="og:title" content="Regex Tester | MyDebugger" />
        <meta property="og:description" content="Test and debug regular expressions with real-time matching." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/regex" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Regex Tester | MyDebugger" />
        <meta name="twitter:description" content="Test and debug regular expressions with real-time matching." />
        <link rel="canonical" href="https://mydebugger.vercel.app/regex" />
      </Helmet>
      <ToolLayout tool={tool!}>
        <div className="space-y-6">
          <Card isElevated>
            <div className="space-y-6">
              {/* Regex Pattern Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="pattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Regular Expression
                  </label>
                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="flex-shrink-0 text-gray-500 dark:text-gray-400 font-mono">/</div>
                  <input
                    id="pattern"
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    placeholder="Enter regex pattern..."
                  />
                  <div className="flex-shrink-0 text-gray-500 dark:text-gray-400 font-mono">/</div>
                  <input
                    type="text"
                    value={flags}
                    onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))}
                    className="w-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    placeholder="flags"
                    maxLength={6}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {flagOptions.map((flag) => (
                    <button
                      key={flag.value}
                      type="button"
                      onClick={() => toggleFlag(flag.value)}
                      className={`inline-flex items-center px-2.5 py-1 border text-xs font-medium rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                        flags.includes(flag.value) 
                          ? 'bg-primary-100 border-primary-200 text-primary-800 dark:bg-primary-900 dark:border-primary-700 dark:text-primary-200' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
                      }`}
                      title={flag.description}
                    >
                      {flag.label} ({flag.value})
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Test String Input */}
              <div>
                <label htmlFor="input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test String
                </label>
                <textarea
                  id="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm h-40"
                  placeholder="Enter text to test against your regex..."
                />
              </div>
              
              {/* Results Output */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Results</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {regexResults ? `${regexResults.totalMatches} matches` : 'No matches'}
                    </span>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => setShowDebugInfo(!showDebugInfo)}
                    >
                      {showDebugInfo ? 'Hide Details' : 'Show Details'}
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                  {regexResults && regexResults.matches.length > 0 ? (
                    <>
                      <div 
                        className="font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap" 
                        dangerouslySetInnerHTML={{ __html: highlightedOutput }}
                      />
                      
                      {showDebugInfo && (
                        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Match Details</h4>
                          <div className="space-y-3">
                            {regexResults.matches.map((match, index) => (
                              <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Match {index + 1}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Index: {match.index}</span>
                                </div>
                                <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-900 rounded font-mono text-sm text-gray-800 dark:text-gray-200">
                                  {match.match}
                                </div>
                                {match.groups.length > 0 && (
                                  <div className="mt-2">
                                    <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Capture Groups</h5>
                                    <div className="space-y-1">
                                      {match.groups.map((group, groupIndex) => (
                                        <div key={groupIndex} className="flex">
                                          <span className="text-xs text-gray-500 dark:text-gray-400 w-8">#{groupIndex + 1}</span>
                                          <span className="text-xs font-mono text-gray-800 dark:text-gray-200">{group}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 italic">
                      No matches found. Try adjusting your regular expression or input text.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Examples Section */}
          <Card title="Examples" isElevated>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click on any example to use it in the regex tester above.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {examples.map((example, index) => (
                  <div 
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                    onClick={() => applyExample(example)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white mb-1">{example.name}</div>
                    <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-1">/{example.pattern}/{example.flags}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      Sample: "{example.input.substring(0, 30)}{example.input.length > 30 ? '...' : ''}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          {/* Regex Reference */}
          <Card title="Regex Quick Reference" isElevated>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Character Classes</h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">\d</code> - Matches any digit</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">\w</code> - Matches any alphanumeric character</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">\s</code> - Matches any whitespace</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">[abc]</code> - Matches any of a, b, or c</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">[^abc]</code> - Matches anything except a, b, or c</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Quantifiers</h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">*</code> - 0 or more times</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">+</code> - 1 or more times</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">?</code> - 0 or 1 time</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{n}"}</code> - Exactly n times</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{n,m}"}</code> - Between n and m times</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Anchors & Boundaries</h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">^</code> - Start of line</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">$</code> - End of line</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">\b</code> - Word boundary</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">\B</code> - Not a word boundary</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </ToolLayout>
    </>
  );
};

export default RegexTester;