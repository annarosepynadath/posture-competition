import { useEffect, useRef, useState, useCallback } from 'react';
import { Timer, AlertCircle, Shield, Activity, Crosshair } from 'lucide-react';
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
  const [liveFeedback, setLiveFeedback] = useState<string>('Analyzing biomechanics...');
  const [isPersonDetected, setIsPersonDetected] = useState<boolean>(true);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);

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

    const validSamples = samplesRef.current;
    if (validSamples.length === 0) {
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

        const landmarker = await initializePoseLandmarker();
        if (isCancelled) return;

        setIsLoadingCamera(false);
        startTimeRef.current = performance.now();

        let lastVideoTime = -1;

        const loop = (currentTime: number) => {
          if (isCancelled) return;

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
                    setLiveFeedback(metrics.feedback[0] || 'Holding solid form!');
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
                // frame drop safety
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

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex flex-col items-center">
      {/* Broadcast Header in Steel Blue #457B9D with Frosted Blue #A8DADC Border */}
      <div className="w-full card-steel p-3.5 sm:p-4 rounded-2xl mb-3 flex items-center justify-between gap-2 sm:gap-4 shadow-xl">
        {/* Contender Identification */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-[#1D3557] border-2 border-[#A8DADC] flex items-center justify-center text-2xl shrink-0 shadow-inner">
            {player.avatar}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1D3557] text-[#A8DADC] border border-[#A8DADC] shrink-0">
                PLAYER {playerIndex + 1}/{totalPlayers}
              </span>
              <h2 className="text-base sm:text-lg font-black text-[#F1FAEE] truncate font-heading uppercase">
                {player.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-[#A8DADC] font-bold uppercase tracking-widest flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-[#F1FAEE] animate-pulse" />
                Live Telemetry Active
              </span>
            </div>
          </div>
        </div>

        {/* Large Digital Countdown Timer HUD */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A8DADC]">
              Hold Posture
            </span>
            <span className="text-2xl sm:text-4xl font-black font-mono text-[#F1FAEE] leading-none tracking-tight">
              {timeLeft.toFixed(1)}s
            </span>
          </div>

          <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                className="text-[#1D3557] fill-none"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="#A8DADC"
                strokeWidth="4"
                strokeDasharray="138.2"
                strokeDashoffset={138.2 - (138.2 * progressPercent) / 100}
                strokeLinecap="round"
                className="fill-none transition-all duration-100"
              />
            </svg>
            <Timer className="w-5 h-5 text-[#F1FAEE] absolute" />
          </div>
        </div>
      </div>

      {/* Main Focus: Dominant Webcam Frame with High-Contrast Reticles */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[68vh] rounded-3xl overflow-hidden bg-[#1D3557] border-3 border-[#A8DADC] shadow-2xl flex items-center justify-center">
        {/* Reticles with Coordinates */}
        <div className="absolute top-3 left-3 flex items-center gap-1 text-[#A8DADC] pointer-events-none z-20 font-black">
          <div className="w-6 h-6 border-t-3 border-l-3 border-[#A8DADC]" />
          <span className="text-[10px] font-mono tracking-widest bg-[#1D3557] px-1 py-0.5 rounded">POS_01</span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[#A8DADC] pointer-events-none z-20 font-black">
          <span className="text-[10px] font-mono tracking-widest bg-[#1D3557] px-1 py-0.5 rounded">CAM_LIVE</span>
          <div className="w-6 h-6 border-t-3 border-r-3 border-[#A8DADC]" />
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[#A8DADC] pointer-events-none z-20 font-black">
          <div className="w-6 h-6 border-b-3 border-l-3 border-[#A8DADC]" />
          <span className="text-[10px] font-mono tracking-widest bg-[#1D3557] px-1 py-0.5 rounded">AI_VISION</span>
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[#A8DADC] pointer-events-none z-20 font-black">
          <span className="text-[10px] font-mono tracking-widest bg-[#1D3557] px-1 py-0.5 rounded">30_FPS</span>
          <div className="w-6 h-6 border-b-3 border-r-3 border-[#A8DADC]" />
        </div>

        {/* Center Target Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 z-10">
          <Crosshair className="w-24 h-24 text-[#A8DADC]" strokeWidth={1.5} />
        </div>

        {/* Animated Radar Sweep */}
        <div className="absolute inset-x-0 h-1 bg-[#A8DADC]/40 pointer-events-none z-15 animate-radar-sweep shadow-[0_0_12px_#A8DADC]" />

        {/* Loading Spinner */}
        {isLoadingCamera && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#1D3557] gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-[#457B9D] border-t-[#A8DADC] animate-spin" />
            <p className="text-sm font-black text-[#F1FAEE] uppercase tracking-wider">
              CALIBRATING BIOMETRIC VISION...
            </p>
          </div>
        )}

        {/* Mirrored Webcam Video */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
        />

        {/* Mirrored Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none z-10"
        />

        {/* Live Form HUD Gauge in Steel Blue #457B9D (Top Right) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <div className="px-4 py-2 rounded-2xl bg-[#457B9D] border-2 border-[#A8DADC] shadow-2xl flex items-center gap-3">
            <div>
              <div className="text-[10px] uppercase font-black tracking-widest text-[#F1FAEE]">
                Live Form Score
              </div>
              <div className="text-2xl sm:text-4xl font-black font-mono text-[#F1FAEE] leading-none">
                {isPersonDetected ? `${currentScore}%` : '--'}
              </div>
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#A8DADC] animate-ping" />
          </div>
        </div>

        {/* Out-of-frame Alert Notification */}
        {!isPersonDetected && !isLoadingCamera && (
          <div className="absolute inset-x-4 top-4 z-20 flex justify-center pointer-events-none animate-in fade-in">
            <div className="px-4 py-2.5 rounded-xl bg-[#1D3557] border-2 border-[#A8DADC] text-[#F1FAEE] text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-2xl">
              <AlertCircle className="w-5 h-5 text-[#A8DADC] animate-bounce" />
              <span>Step into frame &bull; Position head and shoulders in view</span>
            </div>
          </div>
        )}

        {/* Dynamic AI Coaching Teleprompter in Deep Space Blue #1D3557 (Bottom Center) */}
        <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none flex justify-center">
          <div className="max-w-lg w-full px-4 py-2.5 rounded-2xl bg-[#1D3557] border-2 border-[#A8DADC] shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#457B9D] text-[#F1FAEE] flex items-center justify-center shrink-0 border border-[#A8DADC]">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#A8DADC] block">
                Live AI Coaching Analysis
              </span>
              <p className="text-xs sm:text-sm font-black text-[#F1FAEE] truncate">
                {liveFeedback}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Time Progress Bar in Frosted Blue */}
      <div className="w-full mt-3 h-2.5 rounded-full bg-[#1D3557] border-2 border-[#A8DADC] overflow-hidden p-[1px]">
        <div
          className="h-full bg-[#A8DADC] transition-all duration-100 ease-linear rounded-full"
          style={{ width: `${100 - progressPercent}%` }}
        />
      </div>
    </div>
  );
};
