import { renderHook, act } from '@testing-library/react';
import useApiRepeater from '../src/tools/api-test/hooks/useApiRepeater';
import * as model from '../src/tools/api-test/lib/apiRepeater';

beforeEach(() => {
  jest.useFakeTimers();
  (global.fetch as any) = jest.fn(() => Promise.resolve({
    status: 200,
    text: () => Promise.resolve('ok'),
  }));
  localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
  jest.resetAllMocks();
});

test('start sends repeated requests', async () => {
  const { result } = renderHook(() => useApiRepeater());
  act(() => {
    result.current.setCurl("curl 'https://api.example.com'");
    result.current.setDelay(100);
  });
  act(() => {
    result.current.parse();
    result.current.start();
  });

  await act(async () => {
    jest.advanceTimersByTime(100);
  });
  await act(async () => {
    await Promise.resolve();
  });

  expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
  expect(result.current.reqLogs.length).toBe(1);
  expect(result.current.resLogs.length).toBe(1);

  act(() => result.current.stop());
  await act(async () => {
    jest.advanceTimersByTime(200);
  });
  expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
});

test('saveProfile stores curl and delay', () => {
  const { result } = renderHook(() => useApiRepeater());
  act(() => {
    result.current.setCurl('curl https://a.com');
    result.current.setDelay(50);
  });
  act(() => {
    result.current.saveProfile();
  });
  const stored = JSON.parse(localStorage.getItem('api-repeater-profile') || '{}');
  expect(stored).toEqual({ curl: 'curl https://a.com', delay: 50 });
});

test('exportLogFile delegates to model', () => {
  const spy = jest.spyOn(model, 'exportLogs').mockImplementation(() => {});
  const { result } = renderHook(() => useApiRepeater());
  act(() => {
    result.current.exportLogFile();
  });
  expect(spy).toHaveBeenCalled();
});

