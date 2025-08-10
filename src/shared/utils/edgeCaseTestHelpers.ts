export interface EdgeCaseInput<T> {
  name: string;
  input: T;
}

export async function testFunctionWithEdgeCases<T, R>(
  fn: (input: T) => Promise<R> | R,
  cases: EdgeCaseInput<T>[]
): Promise<Array<{ name: string; result: R | { error: string } }>> {
  const results: Array<{ name: string; result: R | { error: string } }> = [];
  for (const testCase of cases) {
    try {
      const res = await fn(testCase.input);
      results.push({ name: testCase.name, result: res });
    } catch (err) {
      results.push({
        name: testCase.name,
        result: { error: err instanceof Error ? err.message : 'Unknown error' },
      });
    }
  }
  return results;
}



