import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import type { Landmark, PostureMetrics } from '../types';

let poseLandmarkerInstance: PoseLandmarker | null = null;
let initPromise: Promise<PoseLandmarker> | null = null;

// Standard MediaPipe Pose connections for upper/full body
const POSE_CONNECTIONS: [number, number][] = [
  // Head & Face
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  // Shoulders & Chest
  [11, 12],
  // Left arm
  [11, 13], [13, 15],
  // Right arm
  [12, 14], [14, 16],
  // Torso / Spine box
  [11, 23], [12, 24], [23, 24],
  // Legs (if visible)
  [23, 25], [25, 27],
  [24, 26], [26, 28],
];

export async function initializePoseLandmarker(): Promise<PoseLandmarker> {
  if (poseLandmarkerInstance) {
    return poseLandmarkerInstance;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'
      );

      // Attempt GPU first, fallback to CPU if GPU delegate unavailable
      try {
        poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      } catch (gpuError) {
        console.warn('GPU delegate failed, falling back to CPU delegate:', gpuError);
        poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }

      return poseLandmarkerInstance;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

/**
 * Draw skeleton connections, glowing joints, and alignment reference guides
 */
export function drawPoseOnCanvas(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[] | null | undefined,
  metrics: PostureMetrics,
  canvasWidth: number,
  canvasHeight: number
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (!landmarks || landmarks.length === 0 || !metrics.isPersonDetected) {
    return;
  }

  // Determine theme color based on the exact core palette
  let strokeColor = '#A8DADC'; // Frosted Blue default
  let glowColor = 'rgba(168, 218, 220, 0.5)';
  if (metrics.overallScore >= 85) {
    strokeColor = '#A8DADC'; // Frosted Blue
    glowColor = 'rgba(168, 218, 220, 0.65)';
  } else if (metrics.overallScore >= 70) {
    strokeColor = '#5a96ba'; // Steel Blue mid-tone
    glowColor = 'rgba(69, 123, 157, 0.6)';
  } else {
    strokeColor = '#457B9D'; // Deep Steel Blue
    glowColor = 'rgba(29, 53, 87, 0.7)';
  }

  ctx.save();

  // 1. Draw Reference Guides (Horizontal Shoulder Level & Vertical Plumb Line)
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  if (leftShoulder && rightShoulder && (leftShoulder.visibility ?? 1) > 0.4) {
    const lsX = leftShoulder.x * canvasWidth;
    const lsY = leftShoulder.y * canvasHeight;
    const rsX = rightShoulder.x * canvasWidth;
    const rsY = rightShoulder.y * canvasHeight;
    const midX = (lsX + rsX) / 2;
    const midY = (lsY + rsY) / 2;

    // Subtle horizontal reference line across shoulders
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(midX - 140, midY);
    ctx.lineTo(midX + 140, midY);
    ctx.stroke();

    // Subtle vertical plumb line from head down through spine
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(midX, midY - 100);
    ctx.lineTo(midX, midY + 180);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 2. Draw Skeletal Connections
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [startIndex, endIndex] of POSE_CONNECTIONS) {
    const p1 = landmarks[startIndex];
    const p2 = landmarks[endIndex];

    if (!p1 || !p2) continue;
    if ((p1.visibility ?? 1) < 0.35 || (p2.visibility ?? 1) < 0.35) continue;

    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.moveTo(p1.x * canvasWidth, p1.y * canvasHeight);
    ctx.lineTo(p2.x * canvasWidth, p2.y * canvasHeight);
    ctx.stroke();
  }

  // 3. Draw Joint Nodes with inner core and outer glow
  for (let i = 0; i < landmarks.length; i++) {
    // Only draw upper body + core hips landmarks to avoid lower leg clutter if cut off
    if (i > 28) continue;

    const lm = landmarks[i];
    if (!lm || (lm.visibility ?? 1) < 0.35) continue;

    const px = lm.x * canvasWidth;
    const py = lm.y * canvasHeight;

    const isKeyJoint = [11, 12, 23, 24, 0, 7, 8].includes(i);
    const radius = isKeyJoint ? 5.5 : 3.5;

    // Outer ring
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, 2 * Math.PI);
    ctx.fillStyle = strokeColor;
    ctx.fill();

    // Inner bright center
    ctx.beginPath();
    ctx.arc(px, py, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#F1FAEE';
    ctx.fill();
  }

  ctx.restore();
}
