/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import moment from 'moment';

export const flattenJSON = (
  obj: Record<string, unknown>,
  prefix = '',
  res: Record<string, unknown> = {},
  dateFormat?: string,
): Record<string, unknown> => {
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      flattenJSON(value as Record<string, unknown>, newKey, res, dateFormat);
    } else {
      let val: unknown = value;
      if (
        dateFormat &&
        typeof value === 'string' &&
        moment(value, moment.ISO_8601, true).isValid()
      ) {
        val = moment(value).format(dateFormat);
      }
      res[newKey] = Array.isArray(val) ? JSON.stringify(val) : val;
    }
  });
  return res;
};

export default flattenJSON;
