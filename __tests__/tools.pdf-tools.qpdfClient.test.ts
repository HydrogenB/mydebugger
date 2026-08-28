/**
 * © 2026 MyDebugger Contributors – MIT License
 */

jest.mock('../src/tools/pdf-tools/workers/createQpdfWorker', () => ({
  createQpdfWorker: jest.fn(),
}));

import { createQpdfWorker } from '../src/tools/pdf-tools/workers/createQpdfWorker';
import { unlockPdf, terminateQpdfWorker } from '../src/tools/pdf-tools/lib/qpdfClient';

interface FakeWorker {
  postMessage: jest.Mock;
  terminate: jest.Mock;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: unknown) => void) | null;
}

const makeFakeWorker = (): FakeWorker => ({
  postMessage: jest.fn(),
  terminate: jest.fn(),
  onmessage: null,
  onerror: null,
});

describe('qpdfClient', () => {
  afterEach(() => {
    terminateQpdfWorker();
    jest.clearAllMocks();
  });

  test('resolves ok:true when the worker responds with unlocked bytes', async () => {
    const fakeWorker = makeFakeWorker();
    (createQpdfWorker as jest.Mock).mockReturnValue(fakeWorker);

    const resultPromise = unlockPdf(new Uint8Array([1, 2, 3]), 'secret');

    expect(fakeWorker.postMessage).toHaveBeenCalledTimes(1);
    const [request] = fakeWorker.postMessage.mock.calls[0];
    fakeWorker.onmessage?.({ data: { id: request.id, ok: true, bytes: new Uint8Array([9, 9]) } } as MessageEvent);

    const result = await resultPromise;
    expect(result).toEqual({ ok: true, bytes: new Uint8Array([9, 9]) });
  });

  test('resolves ok:false with reason wrong-password', async () => {
    const fakeWorker = makeFakeWorker();
    (createQpdfWorker as jest.Mock).mockReturnValue(fakeWorker);

    const resultPromise = unlockPdf(new Uint8Array([1]), 'bad-password');
    const [request] = fakeWorker.postMessage.mock.calls[0];
    fakeWorker.onmessage?.({
      data: { id: request.id, ok: false, reason: 'wrong-password', message: 'Incorrect password' },
    } as MessageEvent);

    const result = await resultPromise;
    expect(result).toEqual({ ok: false, reason: 'wrong-password', message: 'Incorrect password' });
  });

  test('reuses the same worker instance across calls', async () => {
    const fakeWorker = makeFakeWorker();
    (createQpdfWorker as jest.Mock).mockReturnValue(fakeWorker);

    const first = unlockPdf(new Uint8Array([1]), '');
    fakeWorker.onmessage?.({
      data: { id: fakeWorker.postMessage.mock.calls[0][0].id, ok: true, bytes: new Uint8Array([1]) },
    } as MessageEvent);
    await first;

    const second = unlockPdf(new Uint8Array([2]), '');
    fakeWorker.onmessage?.({
      data: { id: fakeWorker.postMessage.mock.calls[1][0].id, ok: true, bytes: new Uint8Array([2]) },
    } as MessageEvent);
    await second;

    expect(createQpdfWorker).toHaveBeenCalledTimes(1);
  });
});
