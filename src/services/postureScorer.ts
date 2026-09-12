import type { Landmark, PostureMetrics } from '../types';

// MediaPipe landmark indices
const NOSE = 0;
const LEFT_EAR = 7;
const RIGHT_EAR = 8;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;

export function calculatePostureScore(landmarks: Landmark[] | null | undefined): PostureMetrics {
  if (!landmarks || landmarks.length < 25) {
    return {
      headScore: 0,
      shoulderScore: 0,
      spineScore: 0,
      hipScore: 0,
      symmetryScore: 0,
      overallScore: 0,
      feedback: ['Step back so your head, shoulders and upper body are visible'],
      isWellAligned: false,
      isPersonDetected: false,
    };
  }

  const nose = landmarks[NOSE];
  const leftEar = landmarks[LEFT_EAR];
  const rightEar = landmarks[RIGHT_EAR];
  const leftShoulder = landmarks[LEFT_SHOULDER];
  const rightShoulder = landmarks[RIGHT_SHOULDER];
  const leftHip = landmarks[LEFT_HIP];
  const rightHip = landmarks[RIGHT_HIP];

  // Visibility confidence check
  const minKeyVis = Math.min(
    leftShoulder.visibility ?? 1,
    rightShoulder.visibility ?? 1,
    nose.visibility ?? 1
  );

  if (minKeyVis < 0.4) {
    return {
      headScore: 0,
      shoulderScore: 0,
      spineScore: 0,
      hipScore: 0,
      symmetryScore: 0,
      overallScore: 0,
      feedback: ['Make sure you are facing the camera with good lighting'],
      isWellAligned: false,
      isPersonDetected: false,
    };
  }

  const feedback: string[] = [];

  // 1. SHOULDER ALIGNMENT (Weight: 25%)
  // Shoulder tilt angle against horizontal
  const shoulderDy = rightShoulder.y - leftShoulder.y;
  const shoulderDx = rightShoulder.x - leftShoulder.x;
  const rawShoulderAngle = Math.abs(Math.atan2(shoulderDy, shoulderDx) * (180 / Math.PI));
  const shoulderTilt = Math.min(
    Math.abs(rawShoulderAngle - 0),
    Math.abs(rawShoulderAngle - 180)
  );

  // 0-2 deg = 100, 5 deg = 80, 10 deg = 50, 15+ deg = 15
  const shoulderScore = Math.max(
    0,
    Math.min(100, Math.round(100 - Math.pow(shoulderTilt, 1.35) * 5.2))
  );

  if (shoulderTilt > 3.5) {
    if (shoulderDy > 0.02) {
      feedback.push('Raise your right shoulder or lower your left shoulder');
    } else if (shoulderDy < -0.02) {
      feedback.push('Raise your left shoulder or lower your right shoulder');
    } else {
      feedback.push('Level your shoulders');
    }
  }

  // 2. HEAD & NECK ALIGNMENT (Weight: 25%)
  // Lateral ear tilt
  const earDy = rightEar.y - leftEar.y;
  const earDx = rightEar.x - leftEar.x;
  const rawEarAngle = Math.abs(Math.atan2(earDy, earDx) * (180 / Math.PI));
  const earTilt = Math.min(
    Math.abs(rawEarAngle - 0),
    Math.abs(rawEarAngle - 180)
  );
  const earTiltScore = Math.max(0, Math.min(100, 100 - Math.pow(earTilt, 1.3) * 5.0));

  // Head centering over shoulders
  const earMidX = (leftEar.x + rightEar.x) / 2;
  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderWidth = Math.max(
    0.1,
    Math.hypot(rightShoulder.x - leftShoulder.x, rightShoulder.y - leftShoulder.y)
  );
  const headOffsetRatio = Math.abs(earMidX - shoulderMidX) / shoulderWidth;
  const headCenteringScore = Math.max(0, Math.min(100, 100 - headOffsetRatio * 220));

  const headScore = Math.round(earTiltScore * 0.55 + headCenteringScore * 0.45);

  if (earTilt > 4.0) {
    if (earDy > 0.02) {
      feedback.push('Tilt head upright (head is leaning right)');
    } else {
      feedback.push('Tilt head upright (head is leaning left)');
    }
  } else if (headOffsetRatio > 0.12) {
    feedback.push('Center your head directly over your chest');
  }

  // 3. TORSO / SPINE UPRIGHTNESS (Weight: 25%)
  const hasHips = (leftHip.visibility ?? 1) > 0.4 && (rightHip.visibility ?? 1) > 0.4;
  let spineScore = 100;

  if (hasHips) {
    const hipMidX = (leftHip.x + rightHip.x) / 2;
    const hipMidY = (leftHip.y + rightHip.y) / 2;
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;

    const spineDx = shoulderMidX - hipMidX;
    const spineDy = hipMidY - shoulderMidY; // Dy upwards
    const spineAngle = Math.abs(Math.atan2(spineDy, spineDx) * (180 / Math.PI));
    const spineLean = Math.abs(spineAngle - 90);

    spineScore = Math.max(0, Math.min(100, Math.round(100 - Math.pow(spineLean, 1.35) * 5.0)));

    if (spineLean > 4.0) {
      if (spineDx > 0.03) {
        feedback.push('Spine is leaning left - sit or stand upright');
      } else if (spineDx < -0.03) {
        feedback.push('Spine is leaning right - sit or stand upright');
      } else {
        feedback.push('Straighten your torso and sit tall');
      }
    }
  } else {
    // Upper body fallback when seated close to camera
    const noseToShoulderMidX = Math.abs(nose.x - shoulderMidX);
    const upperTorsoLeanRatio = noseToShoulderMidX / shoulderWidth;
    spineScore = Math.max(0, Math.min(100, Math.round(100 - upperTorsoLeanRatio * 250)));
    if (upperTorsoLeanRatio > 0.14) {
      feedback.push('Straighten your back and sit tall');
    }
  }

  // 4. HIP ALIGNMENT (Weight: 15% or adapted)
  let hipScore = 100;
  if (hasHips) {
    const hipDy = rightHip.y - leftHip.y;
    const hipDx = rightHip.x - leftHip.x;
    const rawHipAngle = Math.abs(Math.atan2(hipDy, hipDx) * (180 / Math.PI));
    const hipTilt = Math.min(
      Math.abs(rawHipAngle - 0),
      Math.abs(rawHipAngle - 180)
    );
    hipScore = Math.max(0, Math.min(100, Math.round(100 - Math.pow(hipTilt, 1.3) * 5.0)));
    if (hipTilt > 5.0) {
      feedback.push('Even out your hips (weight is uneven)');
    }
  } else {
    // If hips are obscured, use shoulder-spine stability
    hipScore = Math.round((shoulderScore + spineScore) / 2);
  }

  // 5. BILATERAL SYMMETRY (Weight: 10%)
  const distNoseLeftShoulder = Math.hypot(nose.x - leftShoulder.x, nose.y - leftShoulder.y);
  const distNoseRightShoulder = Math.hypot(nose.x - rightShoulder.x, nose.y - rightShoulder.y);
  const noseShoulderDiff =
    Math.abs(distNoseLeftShoulder - distNoseRightShoulder) /
    Math.max(distNoseLeftShoulder, distNoseRightShoulder, 0.01);

  const distEarLeftShoulder = Math.hypot(leftEar.x - leftShoulder.x, leftEar.y - leftShoulder.y);
  const distEarRightShoulder = Math.hypot(rightEar.x - rightShoulder.x, rightEar.y - rightShoulder.y);
  const earShoulderDiff =
    Math.abs(distEarLeftShoulder - distEarRightShoulder) /
    Math.max(distEarLeftShoulder, distEarRightShoulder, 0.01);

  const avgAsymmetry = (noseShoulderDiff + earShoulderDiff) / 2;
  const symmetryScore = Math.max(
    0,
    Math.min(100, Math.round((1 - avgAsymmetry * 2.3) * 100))
  );

  if (symmetryScore < 75 && feedback.length < 2) {
    feedback.push('Square your chest directly toward the camera');
  }

  // WEIGHTED OVERALL SCORE
  let overallScore = 0;
  if (hasHips) {
    overallScore = Math.round(
      shoulderScore * 0.25 +
      headScore * 0.25 +
      spineScore * 0.25 +
      hipScore * 0.15 +
      symmetryScore * 0.10
    );
  } else {
    // Redistribute hips weight
    overallScore = Math.round(
      shoulderScore * 0.30 +
      headScore * 0.30 +
      spineScore * 0.30 +
      symmetryScore * 0.10
    );
  }

  overallScore = Math.max(0, Math.min(100, overallScore));

  if (feedback.length === 0) {
    feedback.push('Incredible posture! Keep holding steady!');
  }

  const isWellAligned = overallScore >= 85;

  return {
    headScore,
    shoulderScore,
    spineScore,
    hipScore,
    symmetryScore,
    overallScore,
    feedback: feedback.slice(0, 2),
    isWellAligned,
    isPersonDetected: true,
  };
}

export function getPostureBadge(score: number) {
  if (score >= 93) {
    return {
      title: 'Posture Royalty',
      subtitle: 'Flawless Ergonomic Form',
      emoji: '👑',
      badgeClass: 'from-amber-400 to-yellow-500 text-slate-950 border-amber-300',
      textColor: 'text-amber-400',
    };
  }
  if (score >= 85) {
    return {
      title: 'Spine Warrior',
      subtitle: 'Superior Alignment & Strength',
      emoji: '🥋',
      badgeClass: 'from-emerald-400 to-teal-500 text-slate-950 border-emerald-300',
      textColor: 'text-emerald-400',
    };
  }
  if (score >= 75) {
    return {
      title: 'Ergo Champion',
      subtitle: 'Solid Natural Balance',
      emoji: '🧘',
      badgeClass: 'from-cyan-400 to-blue-500 text-slate-950 border-cyan-300',
      textColor: 'text-cyan-400',
    };
  }
  if (score >= 60) {
    return {
      title: 'Steady Stander',
      subtitle: 'Decent Form with Room to Rise',
      emoji: '🌱',
      badgeClass: 'from-purple-400 to-indigo-500 text-slate-950 border-purple-300',
      textColor: 'text-purple-400',
    };
  }
  return {
    title: 'Slouch Detective',
    subtitle: 'Time to Stretch & Align',
    emoji: '🕵️',
    badgeClass: 'from-rose-400 to-pink-500 text-slate-950 border-rose-300',
    textColor: 'text-rose-400',
  };
}
