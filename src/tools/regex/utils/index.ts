import { RegexMatch, RegexMatchResult } from '../types';

/**
 * Tests a regex pattern against an input string
 * 
 * @param pattern The regex pattern to test
 * @param input The input string to match against
 * @param flags The regex flags to apply
 * @returns Object containing matches, execution time, and total match count
 */
export const testRegex = (
  pattern: string,
  input: string,
  flags: string
): RegexMatchResult => {
  // Default result
  const result: RegexMatchResult = {
    matches: [],
    executionTime: 0,
    totalMatches: 0
  };
  
  if (!pattern || !input) {
    return result;
  }
  
  try {
    // Measure execution time
    const startTime = performance.now();
    
    // Create the regex object
    const regex = new RegExp(pattern, flags);
    
    // Find all matches
    const matches: RegexMatch[] = [];
    
    if (flags.includes('g')) {
      // Global flag - find all matches
      let match;
      while ((match = regex.exec(input)) !== null) {
        matches.push({
          index: match.index,
          match: match[0],
          groups: match.slice(1)
        });
        
        // Avoid infinite loops with empty matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    } else {
      // Non-global - only first match
      const match = regex.exec(input);
      if (match) {
        matches.push({
          index: match.index,
          match: match[0],
          groups: match.slice(1)
        });
      }
    }
    
    const executionTime = performance.now() - startTime;
    
    return {
      matches,
      executionTime,
      totalMatches: matches.length
    };
  } catch (error) {
    return {
      matches: [],
      executionTime: 0,
      totalMatches: 0,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Highlights regex matches in the input text
 * 
 * @param input The original input text
 * @param matches Array of regex matches
 * @returns HTML markup for highlighted text
 */
export const highlightMatches = (
  input: string,
  matches: RegexMatch[]
): string => {
  if (!matches.length) return input;
  
  let result = '';
  let lastIndex = 0;
  
  // Sort matches by index to ensure proper order
  const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
  
  sortedMatches.forEach((match) => {
    // Add text before the match
    result += input.substring(lastIndex, match.index);
    
    // Add the highlighted match
    result += `<mark class="bg-yellow-200 dark:bg-yellow-700">${input.substr(match.index, match.match.length)}</mark>`;
    
    // Update the last index
    lastIndex = match.index + match.match.length;
  });
  
  // Add any remaining text after the last match
  result += input.substring(lastIndex);
  
  return result;
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 * 
 * @param html The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Gets common regex patterns with descriptions
 * 
 * @returns Array of common regex patterns with descriptions
 */
export const getCommonPatterns = (): { name: string; pattern: string; description: string }[] => {
  return [
    {
      name: 'Email',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      description: 'Validates email addresses'
    },
    {
      name: 'URL',
      pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
      description: 'Matches URLs (http or https)'
    },
    {
      name: 'Phone Number',
      pattern: '\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}',
      description: 'Matches various phone number formats'
    },
    {
      name: 'IP Address',
      pattern: '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
      description: 'Matches IPv4 addresses'
    },
    {
      name: 'Date (YYYY-MM-DD)',
      pattern: '\\d{4}-\\d{2}-\\d{2}',
      description: 'Matches dates in YYYY-MM-DD format'
    }
  ];
};

/**
 * Gets predefined regex examples
 * 
 * @returns Array of regex examples
 */
export const getRegexExamples = () => [
  { 
    name: 'Email validation',
    pattern: '[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    input: 'Contact us at info@example.com or support@mydebugger.dev',
    flags: 'g'
  },
  { 
    name: 'Phone number extraction',
    pattern: '\\(\\d{3}\\)\\s\\d{3}-\\d{4}|\\d{3}-\\d{3}-\\d{4}',
    input: 'Call us at (555) 123-4567 or 555-987-6543 for customer support',
    flags: 'g'
  },
  { 
    name: 'URL matching',
    pattern: 'https?://[\\w\\.-]+\\.\\w{2,}[\\w\\.-/]*',
    input: 'Visit our website at https://www.example.com or http://mydebugger.dev/tools',
    flags: 'g'
  },
  { 
    name: 'HTML tag extraction',
    pattern: '<([a-z][a-z0-9]*)\\b[^>]*>(.*?)</\\1>',
    input: '<div class="container">This is a <span>nested</span> element</div>',
    flags: 'g'
  },
  { 
    name: 'CSS color codes',
    pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})',
    input: 'The colors are #FFF, #123456, and #00AABB for the theme.',
    flags: 'g'
  }
];
