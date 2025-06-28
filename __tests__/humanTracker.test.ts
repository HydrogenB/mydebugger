import { loadPoseModel, loadPeopleModel, createHandModel, detectHands } from '../model/humanTracker';

jest.mock('@tensorflow-models/posenet', () => ({ load: jest.fn(() => Promise.resolve('pose')) }));
jest.mock('@tensorflow-models/coco-ssd', () => ({ load: jest.fn(() => Promise.resolve('coco')) }));
jest.mock('@mediapipe/hands', () => ({
  Hands: jest.fn().mockImplementation(() => ({
    setOptions: jest.fn(),
    onResults: jest.fn((cb) => cb({ multiHandLandmarks: [[{ x: 0.5, y: 0.5 }]] })),
    send: jest.fn(),
  })),
}));

describe('humanTracker models', () => {
  it('loads pose and people models', async () => {
    const pose = await loadPoseModel();
    const people = await loadPeopleModel();
    expect(pose).toBe('pose');
    expect(people).toBe('coco');
  });

  it('creates hand model and detects', async () => {
    const hands = createHandModel((f) => f);
    const video = {} as HTMLVideoElement;
    const res = await detectHands(hands, video);
    expect(res.multiHandLandmarks).toBeDefined();
  });
});
