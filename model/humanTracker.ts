/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import * as posenet from '@tensorflow-models/posenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-core';
import { Hands, Results } from '@mediapipe/hands';

export interface HumanModels {
  pose?: posenet.PoseNet;
  people?: cocoSsd.ObjectDetection;
  hands?: Hands;
}

export const loadPoseModel = async (): Promise<posenet.PoseNet> => posenet.load();

export const loadPeopleModel = async (): Promise<cocoSsd.ObjectDetection> => cocoSsd.load();

export const createHandModel = (
  locateFile: (f: string) => string,
): Hands => {
  const hands = new Hands({ locateFile });
  hands.setOptions({ maxNumHands: 2, selfieMode: true });
  return hands;
};

export const detectHands = (
  hands: Hands,
  video: HTMLVideoElement,
): Promise<Results> =>
  new Promise((resolve) => {
    hands.onResults((res) => resolve(res));
    hands.send({ image: video });
  });

export interface DetectionResult {
  pose?: posenet.Pose;
  people?: cocoSsd.DetectedObject[];
  hands?: Results['multiHandLandmarks'];
}

export const detectFrame = async (
  video: HTMLVideoElement,
  models: HumanModels,
): Promise<DetectionResult> => {
  const result: DetectionResult = {};
  if (models.pose) {
    result.pose = await models.pose.estimateSinglePose(video, {
      flipHorizontal: false,
    });
  }
  if (models.people) {
    result.people = await models.people.detect(video);
  }
  if (models.hands) {
    const res = await detectHands(models.hands, video);
    result.hands = res.multiHandLandmarks || [];
  }
  return result;
};
