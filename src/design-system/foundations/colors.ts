// Design system color tokens
export const colors = {
  primary: {
    50: '#e6f1fe',
    100: '#cce3fd',
    200: '#99c7fb',
    300: '#66aaf9',
    400: '#338ef7',
    500: '#0072f5', // Primary color
    600: '#005bc4',
    700: '#004493',
    800: '#002e62',
    900: '#001731',
  },
  secondary: {
    50: '#edf2ff',
    100: '#dbe6ff',
    200: '#b7ccff',
    300: '#93b2ff',
    400: '#6f99ff',
    500: '#4b7fff', // Secondary color
    600: '#3c66cc',
    700: '#2d4c99',
    800: '#1e3366',
    900: '#0f1933',
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