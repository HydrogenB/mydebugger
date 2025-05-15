/**
 * Helper functions to test edge cases systematically
 */

/**
 * Tests a function with various edge cases and reports any issues
 */
export function testFunctionWithEdgeCases<T, R>(
  fn: (input: T) => R,
  testCases: Array<{
    name: string;
    input: T;
    expectedOutput?: R;
    shouldThrow?: boolean;
    errorMessageContains?: string;
  }>
): { success: boolean; failures: string[] } {
  const failures: string[] = [];
  
  for (const testCase of testCases) {
    try {
      const result = fn(testCase.input);
      
      if (testCase.shouldThrow) {
        failures.push(`${testCase.name}: Expected function to throw but it returned ${JSON.stringify(result)}`);
        continue;
      }
      
      if (testCase.expectedOutput !== undefined) {
        const isEqual = JSON.stringify(result) === JSON.stringify(testCase.expectedOutput);
        if (!isEqual) {
          failures.push(`${testCase.name}: Expected ${JSON.stringify(testCase.expectedOutput)} but got ${JSON.stringify(result)}`);
        }
      }
    } catch (error) {
      if (!testCase.shouldThrow) {
        failures.push(`${testCase.name}: Function threw unexpectedly: ${error instanceof Error ? error.message : String(error)}`);
      } else if (
        testCase.errorMessageContains && 
        !(error instanceof Error && error.message.includes(testCase.errorMessageContains))
      ) {
        failures.push(`${testCase.name}: Error message "${error instanceof Error ? error.message : String(error)}" doesn't contain "${testCase.errorMessageContains}"`);
      }
    }
  }
  
  return {
    success: failures.length === 0,
    failures
  };
}

/**
 * Common edge cases for various types
 */
export const commonEdgeCases = {
  strings: ['', ' ', null, undefined, '0', 'undefined', 'null', '\n', '\t', '🔥', '<script>alert(1)</script>'],
  numbers: [0, -0, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
  arrays: [[], [null], [undefined], [{}, {}, {}], Array(1000).fill(1)],
  objects: [{}, null, { a: null }, { toString: () => 'malicious' }],
  urls: ['https://example.com', 'http://localhost', '', 'invalid', 'file:///etc/passwd', 'javascript:alert(1)']
};

// Test cases for various data types
export const typeTestCases = {
  strings: ['', 'hello', ' ', '123', JSON.stringify({ a: 1 })],
  numbers: [0, 1, -1, 1.5, NaN, Infinity, -Infinity],
  booleans: [true, false],
  arrays: [[], [1, 2], ['a', 'b'], [null], [undefined], [{}]],
  objects: [{}, null, { a: null } as { a: null }, { toString: () => 'malicious' }], // Cast {a: null} to any
  nullOrUndefined: [null, undefined],
  functions: [() => {}, function() {}, jest.fn()],
};

export const edgeCaseValues = {
  strings: ['', ' ', null, undefined, '0', 'undefined', 'null', '\n', '\t', '🔥', '<script>alert(1)</script>'],
  numbers: [0, -0, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
  arrays: [[], [null], [undefined], [{}, {}, {}], Array(1000).fill(1)],
  objects: [{}, null, { a: null } as { a: null }, { toString: () => 'malicious' }],
  urls: ['https://example.com', 'http://localhost', '', 'invalid', 'file:///etc/passwd', 'javascript:alert(1)']
};
