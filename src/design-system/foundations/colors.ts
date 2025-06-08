// Design system color tokens
export const colors = {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Primary color (aligned with tailwind config)
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  secondary: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280', // Secondary color (aligned with tailwind config)
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  success: {
    50: '#e6f8e6',
    100: '#cdf1cd',
    200: '#9ae49a',
    300: '#68d668',
    400: '#35c935',
    500: '#03bc03', // Success color
    600: '#029602',
    700: '#027102',
    800: '#014b01',
    900: '#012601',
  },
  warning: {
    50: '#fef8e6',
    100: '#fdf1cd',
    200: '#fbe39a',
    300: '#f9d568',
    400: '#f7c735',
    500: '#f5b903', // Warning color
    600: '#c49402',
    700: '#936f02',
    800: '#624a01',
    900: '#312501',
  },
  error: {
    50: '#fee6e6',
    100: '#fdcece',
    200: '#fb9d9d',
    300: '#f96c6c',
    400: '#f73a3a',
    500: '#f50909', // Error color
    600: '#c40707',
    700: '#930505',
    800: '#620404',
    900: '#310202',
  },
  neutral: {
    50: '#f8f9fa',
    100: '#e9ecef',
    200: '#dee2e6',
    300: '#ced4da',
    400: '#adb5bd',
    500: '#6c757d',
    600: '#495057',
    700: '#343a40',
    800: '#212529',
    900: '#121416',
  },
};

// Export utility functions
export const getColor = (colorPath: string): string => {
  const parts = colorPath.split('.');
  let result: any = colors;
  
  for (const part of parts) {
    if (result[part] === undefined) {
      console.error(`Color path "${colorPath}" is invalid`);
      return '#000000';
    }
    result = result[part];
  }
  
  return typeof result === 'string' ? result : result['500'] || '#000000';
};