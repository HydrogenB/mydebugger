/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export const flattenJSON = (
  obj: Record<string, unknown>,
  prefix = '',
  res: Record<string, unknown> = {},
): Record<string, unknown> => {
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      flattenJSON(value as Record<string, unknown>, newKey, res);
    } else {
      res[newKey] = Array.isArray(value) ? JSON.stringify(value) : value;
    }
  });
  return res;
};

export default flattenJSON;
