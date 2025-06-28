/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface ParsedHttpCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}

/**
 * Parse a curl command containing an HTTP request.
 * Supports -X, -H and -d/--data flags using single or double quotes.
 */
export const parseCurl = (curlText: string): ParsedHttpCurl => {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < curlText.length; i += 1) {
    const ch = curlText[i];
    if (quote) {
      if (ch === '\\' && curlText[i + 1] === quote) {
        current += quote;
        i += 1;
      } else if (ch === quote) {
        tokens.push(current);
        current = '';
        quote = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (/\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  if (tokens[0] !== 'curl') {
    throw new Error('Invalid curl command: must start with curl');
  }

  let method = 'GET';
  let url = '';
  const headers: Record<string, string> = {};
  let body: string | null = null;

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i];
    switch (token) {
      case '-X':
        method = tokens[i + 1]
          ? tokens[i + 1].replace(/^['"]|['"]$/g, '').toUpperCase()
          : 'GET';
        i += 1;
        break;
      case '-H': {
        const header = tokens[i + 1];
        i += 1;
        if (header) {
          const clean = header.replace(/^['"]|['"]$/g, '');
          const [key, ...rest] = clean.split(':');
          headers[key.trim()] = rest.join(':').trim();
        }
        break;
      }
      case '-d':
      case '--data':
      case '--data-raw':
      case '--data-binary':
        body = tokens[i + 1]
          ? tokens[i + 1].replace(/^['"]|['"]$/g, '').replace(/\\"/g, '"')
          : null;
        i += 1;
        break;
      default:
        if (!token.startsWith('-') && !url) {
          url = token.replace(/^['"]|['"]$/g, '');
        }
    }
  }

  if (!url) throw new Error('Invalid curl command: missing URL');
  return { method, url, headers, body };
};

export const exportLogs = (logs: string[]): void => {
  const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `api_log_${new Date().toISOString()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

