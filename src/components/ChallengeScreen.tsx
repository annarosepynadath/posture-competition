import { useEffect, useRef, useState, useCallback } from 'react';
import { Timer, AlertTriangle, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import type { Player, PostureMetrics, Landmark } from '../types';
import { initializePoseLandmarker, drawPoseOnCanvas } from '../services/poseLandmarker';
import { calculatePostureScore } from '../services/postureScorer';
import { soundManager } from '../services/audioSynth';

interface ChallengeScreenProps {
  player: Player;
  playerIndex: number;
  totalPlayers: number;
  onChallengeComplete: (finalMetrics: PostureMetrics) => void;
  onCameraError: (err: string) => void;
}

const CHALLENGE_DURATION_SECONDS = 10;

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({
  player,
  playerIndex,
  totalPlayers,
  onChallengeComplete,
  onCameraError,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(CHALLENGE_DURATION_SECONDS);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [liveFeedback, setLiveFeedback] = useState<string>('Aligning with camera...');
  const [isPersonDetected, setIsPersonDetected] = useState<boolean>(true);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Store frames for computing average aggregate score
  const samplesRef = useRef<PostureMetrics[]>([]);
  const hasPlayedChimeRef = useRef<boolean>(false);
  const startTimeRef = useRef<number | null>(null);

  const onChallengeCompleteRef = useRef(onChallengeComplete);
  const onCameraErrorRef = useRef(onCameraError);

  useEffect(() => {
    onChallengeCompleteRef.current = onChallengeComplete;
    onCameraErrorRef.current = onCameraError;
  }, [onChallengeComplete, onCameraError]);

  const finishChallenge = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    soundManager.playTurnComplete();

    // Compute average score over the challenge duration
    const validSamples = samplesRef.current;
    if (validSamples.length === 0) {
      // Out of frame entire turn
      onChallengeCompleteRef.current({
        headScore: 0,
        shoulderScore: 0,
        spineScore: 0,
        hipScore: 0,
        symmetryScore: 0,
        overallScore: 0,
        feedback: ['No valid body landmarks detected during the turn.'],
        isWellAligned: false,
        isPersonDetected: false,
      });
      return;
    }

    // Discard initial 0.5s settling frames if sufficient samples exist
    const scoredSamples = validSamples.length > 15 ? validSamples.slice(10) : validSamples;

    const avgHead = Math.round(
      scoredSamples.reduce((acc, s) => acc + s.headScore, 0) / scoredSamples.length
    );
    const avgShoulder = Math.round(
      scoredSamples.reduce((acc, s) => acc + s.shoulderScore, 0) / scoredSamples.length
    );
    const avgSpine = Math.round(
      scoredSamples.reduce((acc, s) => acc + s.spineScore, 0) / scoredSamples.length
    );
    const avgHip = Math.round(
      scoredSamples.reduce((acc, s) => acc + s.hipScore, 0) / scoredSamples.length
    );
    const avgSymmetry = Math.round(
      scoredSamples.reduce((acc, s) => acc + s.symmetryScore, 0) / scoredSamples.length
    );
    const avgOverall = Math.round(
      scoredSamples.reduce((acc, s) => acc + s.overallScore, 0) / scoredSamples.length
    );

    const finalMetrics: PostureMetrics = {
      headScore: avgHead,
      shoulderScore: avgShoulder,
      spineScore: avgSpine,
      hipScore: avgHip,
      symmetryScore: avgSymmetry,
      overallScore: avgOverall,
      feedback: scoredSamples[scoredSamples.length - 1].feedback,
      isWellAligned: avgOverall >= 85,
      isPersonDetected: true,
    };

    onChallengeCompleteRef.current(finalMetrics);
  }, []);

  const finishChallengeRef = useRef(finishChallenge);

  useEffect(() => {
    finishChallengeRef.current = finishChallenge;
  }, [finishChallenge]);

  useEffect(() => {
    let isCancelled = false;

    const startChallenge = async () => {
      try {
        setIsLoadingCamera(true);

        // 1. Get webcam stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // 2. Initialize MediaPipe PoseLandmarker
        const landmarker = await initializePoseLandmarker();
        if (isCancelled) return;

        setIsLoadingCamera(false);
        startTimeRef.current = performance.now();

        // 3. Vision tracking loop
        let lastVideoTime = -1;

        const loop = (currentTime: number) => {
          if (isCancelled) return;

          // Timer calculations
          if (startTimeRef.current !== null) {
            const elapsed = (currentTime - startTimeRef.current) / 1000;
            const remaining = Math.max(0, CHALLENGE_DURATION_SECONDS - elapsed);
            setTimeLeft(Number(remaining.toFixed(1)));

            if (remaining <= 0) {
              finishChallengeRef.current();
              return;
            }
          }

          const video = videoRef.current;
          const canvas = canvasRef.current;

          if (video && canvas && !video.paused && !video.ended && video.readyState >= 2) {
            if (video.currentTime !== lastVideoTime) {
              lastVideoTime = video.currentTime;

              try {
                const results = landmarker.detectForVideo(video, performance.now());

                if (results && results.landmarks && results.landmarks.length > 0) {
                  const landmarks = results.landmarks[0] as unknown as Landmark[];
                  const metrics = calculatePostureScore(landmarks);

                  setIsPersonDetected(metrics.isPersonDetected);
                  if (metrics.isPersonDetected) {
                    setCurrentScore(metrics.overallScore);
                    setLiveFeedback(metrics.feedback[0] || 'Holding strong posture!');
                    samplesRef.current.push(metrics);

                    if (metrics.overallScore >= 90 && !hasPlayedChimeRef.current) {
                      soundManager.playAlignmentChime();
                      hasPlayedChimeRef.current = true;
                    } else if (metrics.overallScore < 85) {
                      hasPlayedChimeRef.current = false;
                    }
                  } else {
                    setLiveFeedback('Step into frame so your upper body is visible');
                  }

                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    drawPoseOnCanvas(ctx, landmarks, metrics, canvas.width, canvas.height);
                  }
                } else {
                  setIsPersonDetected(false);
                  setLiveFeedback('No person detected. Face the camera directly.');
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                  }
                }
              } catch {
                // Drop frame silently
              }
            }
          }

          animFrameId.current = requestAnimationFrame(loop);
        };

        animFrameId.current = requestAnimationFrame(loop);
      } catch (err: unknown) {
        setIsLoadingCamera(false);
        const error = err as Error;
        onCameraErrorRef.current(error?.message || 'Could not start webcam for challenge.');
      }
    };

    startChallenge();

    return () => {
      isCancelled = true;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const progressPercent = Math.min(100, Math.max(0, (timeLeft / CHALLENGE_DURATION_SECONDS) * 100));

  // Score color badge
  const getScoreColor = (score: number) => {
    if (score >= 88) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
      {/* Top Status Bar: Player info & 10s Timer */}
      <div className="w-full glass-panel p-4 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-4 border-slate-700/80">
        {/* Competitor banner */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
            {player.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">{player.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                Player {playerIndex + 1}/{totalPlayers}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Real-time biomechanics tracking active
            </p>
          </div>
        </div>

        {/* 10-Second Timer Ring & Counter */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Time Remaining
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
              {timeLeft.toFixed(1)}s
            </span>
          </div>

          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-800 fill-none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * progressPercent) / 100}
                strokeLinecap="round"
                className="text-cyan-400 fill-none transition-all duration-100"
              />
            </svg>
            <Timer className="w-5 h-5 text-cyan-400 absolute" />
          </div>
        </div>
      </div>

      {/* Main Webcam & Overlay Display */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[64vh] rounded-3xl overflow-hidden bg-slate-950 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-950/50 flex items-center justify-center">
        {/* Loading Spinner */}
        {isLoadingCamera && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <p className="text-sm font-bold text-slate-300">Starting Camera & AI Models...</p>
          </div>
        )}

        {/* Mirrored Video Stream */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
        />

        {/* Mirrored Canvas Overlay for Pose Landmarks */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none z-10"
        />

        {/* Live Score HUD Overlay (Top Right) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <div
            className={`px-4 py-2 rounded-2xl backdrop-blur-md border shadow-xl flex items-center gap-3 transition-colors ${getScoreColor(
              currentScore
            )}`}
          >
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                Live Posture
              </div>
              <div className="text-3xl font-black font-mono leading-none">
                {isPersonDetected ? `${currentScore}%` : '--'}
              </div>
            </div>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Out-of-frame warning alert */}
        {!isPersonDetected && !isLoadingCamera && (
          <div className="absolute inset-x-4 top-4 z-20 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-2.5 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
              <span>Body out of view! Step back so your head and chest are visible.</span>
            </div>
          </div>
        )}

        {/* Real-time Dynamic Coaching Feedback Banner (Bottom) */}
        <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none flex justify-center">
          <div className="max-w-xl w-full px-4 py-3 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Live AI Coaching Tip
              </span>
              <p className="text-xs sm:text-sm font-semibold text-white truncate">
                {liveFeedback}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Progress Bar */}
      <div className="w-full mt-4 h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 transition-all duration-100 ease-linear"
          style={{ width: `${100 - progressPercent}%` }}
        />
      </div>
    </div>
  );
};
