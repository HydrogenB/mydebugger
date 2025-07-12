/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Shared export utilities to eliminate code duplication across tools
 * This centralized approach ensures consistent export behavior and reduces maintenance burden
 */

export interface ExportOptions {
  filename?: string;
  timestamp?: boolean;
  format?: 'json' | 'csv' | 'env' | 'markdown' | 'html';
}

export interface ExportData {
  data: any;
  type: string;
  extension: string;
}

/**
 * Central export function that handles all export types
 * Eliminates the repetitive blob creation and download logic across tools
 */
export const exportData = (data: any, options: ExportOptions = {}): void => {
  const {
    filename = 'export',
    timestamp = true,
    format = 'json'
  } = options;

  const exportData = prepareExportData(data, format);
  const finalFilename = generateFilename(filename, format, timestamp);
  
  downloadFile(exportData.data, exportData.type, finalFilename);
};

/**
 * Prepare data for export based on format
 */
const prepareExportData = (data: any, format: string): ExportData => {
  switch (format) {
    case 'json':
      return {
        data: JSON.stringify(data, null, 2),
        type: 'application/json',
        extension: 'json'
      };
    
    case 'csv':
      return {
        data: convertToCSV(data),
        type: 'text/csv',
        extension: 'csv'
      };
    
    case 'env':
      return {
        data: convertToEnv(data),
        type: 'text/plain',
        extension: 'env'
      };
    
    case 'markdown':
      return {
        data: convertToMarkdown(data),
        type: 'text/markdown',
        extension: 'md'
      };
    
    case 'html':
      return {
        data: data.toString(),
        type: 'text/html',
        extension: 'html'
      };
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Generate filename with optional timestamp
 */
const generateFilename = (base: string, format: string, includeTimestamp: boolean): string => {
  const timestamp = includeTimestamp ? `-${new Date().toISOString().split('T')[0]}` : '';
  return `${base}${timestamp}.${getExtensionForFormat(format)}`;
};

/**
 * Get file extension for format
 */
const getExtensionForFormat = (format: string): string => {
  const extensions: Record<string, string> = {
    json: 'json',
    csv: 'csv',
    env: 'env',
    markdown: 'md',
    html: 'html'
  };
  return extensions[format] || 'txt';
};

/**
 * Download file to user's device
 */
const downloadFile = (content: string, mimeType: string, filename: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Convert array of objects to CSV format
 */
const convertToCSV = (data: any[]): string => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]?.toString() || '';
        // Escape quotes and wrap in quotes if contains comma/quote
        return value.includes(',') || value.includes('"') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
};

/**
 * Convert object to .env format
 */
const convertToEnv = (data: Record<string, any>): string => {
  return Object.entries(data)
    .map(([key, value]) => `${key.toUpperCase()}=${value}`)
    .join('\n');
};

/**
 * Convert data to markdown format
 */
const convertToMarkdown = (data: any): string => {
  if (Array.isArray(data)) {
    return data.map((item, index) => `- [${index + 1}] ${item.url || item.name || JSON.stringify(item)}`).join('\n');
  }
  
  if (typeof data === 'object') {
    return Object.entries(data)
      .map(([key, value]) => `**${key}**: ${value}`)
      .join('\n\n');
  }
  
  return data.toString();
};

/**
 * Copy data to clipboard
 */
export const copyToClipboard = async (data: any, format: 'json' | 'text' = 'json'): Promise<void> => {
  const content = format === 'json' ? JSON.stringify(data, null, 2) : data.toString();
  
  try {
    await navigator.clipboard.writeText(content);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = content;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

/**
 * Format export filename with hostname (useful for cache/storage tools)
 */
export const formatExportFilename = (hostname: string, prefix = '', suffix = ''): string => {
  const cleanHostname = hostname.replace(/[^a-zA-Z0-9-]/g, '_');
  return `${prefix}${cleanHostname}${suffix}`;
};
/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Shared export utilities to eliminate code duplication across tools
 * This centralized approach ensures consistent export behavior and reduces maintenance burden
 */

export interface ExportOptions {
  filename?: string;
  timestamp?: boolean;
  format?: 'json' | 'csv' | 'env' | 'markdown' | 'html';
}

export interface ExportData {
  data: any;
  type: string;
  extension: string;
}

/**
 * Central export function that handles all export types
 * Eliminates the repetitive blob creation and download logic across tools
 */
export const exportData = (data: any, options: ExportOptions = {}): void => {
  const {
    filename = 'export',
    timestamp = true,
    format = 'json'
  } = options;

  const exportData = prepareExportData(data, format);
  const finalFilename = generateFilename(filename, format, timestamp);
  
  downloadFile(exportData.data, exportData.type, finalFilename);
};

/**
 * Prepare data for export based on format
 */
const prepareExportData = (data: any, format: string): ExportData => {
  switch (format) {
    case 'json':
      return {
        data: JSON.stringify(data, null, 2),
        type: 'application/json',
        extension: 'json'
      };
    
    case 'csv':
      return {
        data: convertToCSV(data),
        type: 'text/csv',
        extension: 'csv'
      };
    
    case 'env':
      return {
        data: convertToEnv(data),
        type: 'text/plain',
        extension: 'env'
      };
    
    case 'markdown':
      return {
        data: convertToMarkdown(data),
        type: 'text/markdown',
        extension: 'md'
      };
    
    case 'html':
      return {
        data: data.toString(),
        type: 'text/html',
        extension: 'html'
      };
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Generate filename with optional timestamp
 */
const generateFilename = (base: string, format: string, includeTimestamp: boolean): string => {
  const timestamp = includeTimestamp ? `-${new Date().toISOString().split('T')[0]}` : '';
  return `${base}${timestamp}.${getExtensionForFormat(format)}`;
};

/**
 * Get file extension for format
 */
const getExtensionForFormat = (format: string): string => {
  const extensions: Record<string, string> = {
    json: 'json',
    csv: 'csv',
    env: 'env',
    markdown: 'md',
    html: 'html'
  };
  return extensions[format] || 'txt';
};

/**
 * Download file to user's device
 */
const downloadFile = (content: string, mimeType: string, filename: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Convert array of objects to CSV format
 */
const convertToCSV = (data: any[]): string => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]?.toString() || '';
        // Escape quotes and wrap in quotes if contains comma/quote
        return value.includes(',') || value.includes('"') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
};

/**
 * Convert object to .env format
 */
const convertToEnv = (data: Record<string, any>): string => {
  return Object.entries(data)
    .map(([key, value]) => `${key.toUpperCase()}=${value}`)
    .join('\n');
};

/**
 * Convert data to markdown format
 */
const convertToMarkdown = (data: any): string => {
  if (Array.isArray(data)) {
    return data.map((item, index) => `- [${index + 1}] ${item.url || item.name || JSON.stringify(item)}`).join('\n');
  }
  
  if (typeof data === 'object') {
    return Object.entries(data)
      .map(([key, value]) => `**${key}**: ${value}`)
      .join('\n\n');
  }
  
  return data.toString();
};

/**
 * Copy data to clipboard
 */
export const copyToClipboard = async (data: any, format: 'json' | 'text' = 'json'): Promise<void> => {
  const content = format === 'json' ? JSON.stringify(data, null, 2) : data.toString();
  
  try {
    await navigator.clipboard.writeText(content);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = content;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

/**
 * Format export filename with hostname (useful for cache/storage tools)
 */
export const formatExportFilename = (hostname: string, prefix = '', suffix = ''): string => {
  const cleanHostname = hostname.replace(/[^a-zA-Z0-9-]/g, '_');
  return `${prefix}${cleanHostname}${suffix}`;
};
