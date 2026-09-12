import { useState, useEffect, useRef } from 'react';
import { Users, Play, Sparkles, CheckCircle2, Video, CameraOff, AlertTriangle } from 'lucide-react';
import type { Player, Landmark } from '../types';
import { initializePoseLandmarker, drawPoseOnCanvas } from '../services/poseLandmarker';
import { calculatePostureScore } from '../services/postureScorer';

interface HomeScreenProps {
  onStartGame: (players: Player[]) => void;
  onOpenRules: () => void;
  onCameraError: (err: string) => void;
}

const AVATAR_EMOJIS = ['🦁', '🦊', '🐼', '🦅', '🐺', '🐯', '🦄', '🐨', '🐬', '🦉'];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onOpenRules,
  onCameraError,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [playerNames, setPlayerNames] = useState<string[]>([
    'Player 1',
    'Player 2',
    'Player 3',
    'Player 4',
    'Player 5',
    'Player 6',
    'Player 7',
    'Player 8',
    'Player 9',
    'Player 10',
  ]);

  // Webcam test state
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPersonDetected, setIsPersonDetected] = useState(false);
  const [currentScorePreview, setCurrentScorePreview] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);

  const handlePlayerCountChange = (count: number) => {
    if (count >= 2 && count <= 10) {
      setPlayerCount(count);
    }
  };

  const handleNameChange = (index: number, newName: string) => {
    const updated = [...playerNames];
    updated[index] = newName;
    setPlayerNames(updated);
  };

  // Start preview camera
  const startCameraPreview = async () => {
    try {
      setIsAiLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsPreviewActive(true);

      // Initialize pose landmarker
      const landmarker = await initializePoseLandmarker();
      setIsAiLoading(false);

      // Detection loop for test preview
      let lastVideoTime = -1;
      const processLoop = () => {
        if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
          animFrameId.current = requestAnimationFrame(processLoop);
          return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
          lastVideoTime = video.currentTime;

          try {
            const results = landmarker.detectForVideo(video, performance.now());
            if (results && results.landmarks && results.landmarks.length > 0) {
              const landmarks = results.landmarks[0] as unknown as Landmark[];
              const metrics = calculatePostureScore(landmarks);

              setIsPersonDetected(metrics.isPersonDetected);
              setCurrentScorePreview(metrics.overallScore);

              if (ctx) {
                drawPoseOnCanvas(ctx, landmarks, metrics, canvas.width, canvas.height);
              }
            } else {
              setIsPersonDetected(false);
              setCurrentScorePreview(null);
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
            }
          } catch {
            // ignore preview frame dropped errors
          }
        }

        animFrameId.current = requestAnimationFrame(processLoop);
      };

      animFrameId.current = requestAnimationFrame(processLoop);
    } catch (err: unknown) {
      setIsAiLoading(false);
      setIsPreviewActive(false);
      const error = err as Error;
      onCameraError(error?.message || 'Failed to access camera');
    }
  };

  const stopCameraPreview = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsPreviewActive(false);
    setIsPersonDetected(false);
    setCurrentScorePreview(null);
  };

  useEffect(() => {
    return () => {
      stopCameraPreview();
    };
  }, []);

  const handleStart = () => {
    stopCameraPreview();
    const players: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: `player-${i + 1}`,
        name: playerNames[i].trim() || `Player ${i + 1}`,
        avatar: AVATAR_EMOJIS[i % AVATAR_EMOJIS.length],
        score: null,
        metricsBreakdown: null,
        completed: false,
      });
    }
    onStartGame(players);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Hero Badge & Title */}
      <div className="text-center max-w-2xl mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Multiplayer Pass & Play Webcam Battle
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-3">
          Crown the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300">Posture Champion</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Gather 2 to 10 players around one screen. Each competitor faces a 10-second posture challenge analyzed in real-time by MediaPipe AI biometrics.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Game Setup */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            {/* Player Count Selector */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">How many players?</h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                2 to 10 players
              </span>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 mb-6">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePlayerCountChange(num)}
                  className={`h-11 rounded-xl font-bold text-sm transition-all ${
                    playerCount === num
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 scale-105 ring-2 ring-cyan-300'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Player Names Configuration */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Player Names & Avatars
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {Array.from({ length: playerCount }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800 focus-within:border-cyan-500/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-lg shrink-0 shadow-inner">
                      {AVATAR_EMOJIS[idx % AVATAR_EMOJIS.length]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        maxLength={18}
                        value={playerNames[idx]}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        placeholder={`Player ${idx + 1}`}
                        className="w-full bg-transparent text-sm font-semibold text-white placeholder-slate-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 font-medium">
                        Player {idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-lg tracking-wide shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            START COMPETITION ({playerCount} PLAYERS)
          </button>
        </div>

        {/* Right Column: Camera Test & Live Vision Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-cyan-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Camera & Pose Test</h3>
              </div>

              {!isPreviewActive ? (
                <button
                  type="button"
                  onClick={startCameraPreview}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {isAiLoading ? 'Loading AI...' : 'Test Camera'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCameraPreview}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  Turn Off
                </button>
              )}
            </div>

            {/* Video Preview Box */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                  isPreviewActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none ${
                  isPreviewActive ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {!isPreviewActive && (
                <div className="text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Video className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Test your webcam before starting to ensure smooth tracking.
                  </p>
                  <button
                    onClick={startCameraPreview}
                    disabled={isAiLoading}
                    className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 underline"
                  >
                    {isAiLoading ? 'Initializing AI Engine...' : 'Check webcam & framing →'}
                  </button>
                </div>
              )}

              {/* Status overlay on active preview */}
              {isPreviewActive && (
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  {isPersonDetected ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold backdrop-blur-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Body Tracked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px] font-bold backdrop-blur-sm">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Step into frame
                    </span>
                  )}

                  {currentScorePreview !== null && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-black backdrop-blur-sm">
                      Live Form: {currentScorePreview}%
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Need to know how scores work?
              </span>
              <button
                onClick={onOpenRules}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                View Rules & Weights →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
