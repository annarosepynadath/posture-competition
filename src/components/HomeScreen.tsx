import { useState, useEffect, useRef } from 'react';
import { Users, Play, Video, CameraOff, CheckCircle2, AlertCircle, Trophy, Swords } from 'lucide-react';
import type { Player, Landmark } from '../types';
import { initializePoseLandmarker, drawPoseOnCanvas } from '../services/poseLandmarker';
import { calculatePostureScore } from '../services/postureScorer';

interface HomeScreenProps {
  onStartGame: (players: Player[]) => void;
  onOpenRules: () => void;
  onCameraError: (err: string) => void;
}

const AVATAR_EMOJIS = ['🦁', '🦊', '🐼', '🦅', '🐺', '🐯', '🦄', '🐨', '🐬', '🦉'];

interface TournamentPreset {
  label: string;
  count: number;
  sub: string;
}

const TOURNAMENT_PRESETS: TournamentPreset[] = [
  { label: '2P DUEL', count: 2, sub: 'Head-to-Head' },
  { label: '4P SQUAD', count: 4, sub: 'Party Battle' },
  { label: '8P BRACKET', count: 8, sub: 'Full Tournament' },
  { label: '10P ROYALE', count: 10, sub: 'Grand Championship' },
];

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
      const landmarker = await initializePoseLandmarker();
      setIsAiLoading(false);

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
            // drop frame silently
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
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
      {/* Hero Championship Header */}
      <div className="text-center max-w-3xl mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#457B9D] border-2 border-[#A8DADC] text-[#F1FAEE] text-xs font-black uppercase tracking-widest mb-4 shadow-lg">
          <Trophy className="w-4 h-4 text-[#F4C95D]" />
          <span>Esports Championship</span>
          <span className="w-2 h-2 rounded-full bg-[#A8DADC]" />
          <span className="text-[#A8DADC]">Webcam Battle Arena</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black text-[#F1FAEE] tracking-tight font-heading leading-none mb-3 drop-shadow-lg">
          POSTURE CHAMPION
        </h1>

        <p className="text-[#A8DADC] text-base sm:text-xl max-w-xl mx-auto font-bold leading-relaxed">
          The definitive multiplayer test of ergonomic supremacy. Don&rsquo;t slouch or pay the price.
        </p>
      </div>

      {/* Main Tournament Setup Grid: Noticeable Steel Blue Cards against Deep Space Background */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Match Format & Roster Entry */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-steel p-6 sm:p-8 rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-[#A8DADC]/40">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-[#F1FAEE]" />
                <h2 className="text-xl font-black text-[#F1FAEE] uppercase tracking-wider font-heading">
                  Match Roster Setup
                </h2>
              </div>
              <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-[#1D3557] text-[#A8DADC] border-2 border-[#A8DADC] uppercase tracking-wider">
                {playerCount} Players Active
              </span>
            </div>

            {/* Quick Format Presets */}
            <div className="mb-5">
              <label className="text-xs font-black text-[#F1FAEE] uppercase tracking-widest block mb-2">
                Tournament Format Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TOURNAMENT_PRESETS.map((preset) => {
                  const isSelected = playerCount === preset.count;
                  return (
                    <button
                      key={preset.count}
                      type="button"
                      onClick={() => handlePlayerCountChange(preset.count)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#A8DADC] border-[#F1FAEE] text-[#1D3557] shadow-lg scale-[1.02]'
                          : 'bg-[#1D3557] hover:bg-[#1D3557]/80 border-[#A8DADC]/40 text-[#F1FAEE]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black tracking-wider">
                          {preset.label}
                        </span>
                        {isSelected && <Swords className="w-3.5 h-3.5 text-[#1D3557]" />}
                      </div>
                      <span className={`text-[10px] font-bold block mt-0.5 ${isSelected ? 'text-[#1D3557]/80' : 'text-[#A8DADC]'}`}>
                        {preset.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Numeric Player Stepper (2 to 10) */}
            <div className="mb-6">
              <label className="text-xs font-black text-[#F1FAEE] uppercase tracking-widest block mb-2">
                Custom Player Count (2&ndash;10)
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isCur = playerCount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handlePlayerCountChange(num)}
                      className={`h-11 rounded-xl font-black text-sm transition-all cursor-pointer flex items-center justify-center border-2 ${
                        isCur
                          ? 'bg-[#A8DADC] border-[#F1FAEE] text-[#1D3557] shadow-md scale-105'
                          : 'bg-[#1D3557] hover:bg-[#1D3557]/80 border-[#A8DADC]/40 text-[#F1FAEE]'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Competitor Roster Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-[#F1FAEE] uppercase tracking-widest">
                  Competitor Seed Registrations
                </span>
                <span className="text-xs text-[#A8DADC] font-bold">
                  Editable Names
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {Array.from({ length: playerCount }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#1D3557] border-2 border-[#A8DADC]/50 focus-within:border-[#F1FAEE] transition-all shadow-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#457B9D] border border-[#A8DADC] flex items-center justify-center text-xl shrink-0 shadow-inner">
                      {AVATAR_EMOJIS[idx % AVATAR_EMOJIS.length]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        maxLength={18}
                        value={playerNames[idx]}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        placeholder={`Player ${idx + 1}`}
                        className="w-full bg-transparent text-sm font-black text-[#F1FAEE] placeholder-[#A8DADC]/60 focus:outline-none"
                      />
                      <span className="text-[10px] text-[#A8DADC] font-black uppercase tracking-wider">
                        Seed #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LARGE PROMINENT START COMPETITION BUTTON */}
          <button
            onClick={handleStart}
            className="w-full py-5 px-8 rounded-2xl btn-accent font-black text-xl tracking-wider uppercase flex items-center justify-center gap-3 shadow-2xl cursor-pointer"
          >
            <Play className="w-6 h-6 fill-[#1D3557]" />
            <span>START COMPETITION ({playerCount} PLAYERS)</span>
          </button>
        </div>

        {/* Right Column: Camera Calibration Viewport in Steel Blue */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-steel p-6 sm:p-7 rounded-3xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#A8DADC]/40">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#F1FAEE]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-[#F1FAEE]">
                  Camera Calibration
                </h3>
              </div>

              {!isPreviewActive ? (
                <button
                  type="button"
                  onClick={startCameraPreview}
                  disabled={isAiLoading}
                  className="px-4 py-1.5 rounded-xl btn-accent text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  {isAiLoading ? 'Loading AI...' : 'Test Camera'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCameraPreview}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1D3557] hover:bg-[#1D3557]/80 text-[#F1FAEE] border-2 border-[#A8DADC] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CameraOff className="w-3.5 h-3.5 text-[#A8DADC]" />
                  Turn Off
                </button>
              )}
            </div>

            {/* Calibration Viewport */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#1D3557] border-2 border-[#A8DADC] flex items-center justify-center shadow-inner">
              {/* Corner reticle brackets for telemetry framing */}
              <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-[#A8DADC] pointer-events-none z-10" />
              <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-[#A8DADC] pointer-events-none z-10" />
              <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-[#A8DADC] pointer-events-none z-10" />
              <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-[#A8DADC] pointer-events-none z-10" />

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
                <div className="text-center p-6 space-y-3 z-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#457B9D] border-2 border-[#A8DADC] flex items-center justify-center mx-auto text-[#F1FAEE] shadow-md">
                    <Video className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#F1FAEE] uppercase tracking-wide">
                      Pre-Match Camera Calibration
                    </h4>
                    <p className="text-xs text-[#A8DADC] max-w-xs mt-1 font-bold">
                      Verify your webcam framing and test the AI pose landmark tracker before entering the tournament.
                    </p>
                  </div>
                  <button
                    onClick={startCameraPreview}
                    disabled={isAiLoading}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-black text-[#F1FAEE] hover:text-[#A8DADC] underline cursor-pointer uppercase tracking-wider"
                  >
                    {isAiLoading ? 'Initializing MediaPipe AI Engine...' : 'Calibrate Webcam Feed →'}
                  </button>
                </div>
              )}

              {/* Status HUD when camera is active */}
              {isPreviewActive && (
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
                  {isPersonDetected ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1D3557] border-2 border-[#A8DADC] text-[#F1FAEE] text-[11px] font-black uppercase tracking-wider shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#A8DADC]" />
                      Biometrics Locked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1D3557] border-2 border-[#457B9D] text-[#A8DADC] text-[11px] font-black uppercase tracking-wider shadow-md">
                      <AlertCircle className="w-3.5 h-3.5 text-[#A8DADC]" />
                      Stand In View
                    </span>
                  )}

                  {currentScorePreview !== null && (
                    <span className="px-3 py-1 rounded-lg bg-[#1D3557] border-2 border-[#A8DADC] text-[#A8DADC] text-[11px] font-mono font-black shadow-md">
                      Live Form: {currentScorePreview}%
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#A8DADC]/40 flex items-center justify-between">
              <span className="text-xs text-[#F1FAEE] font-black uppercase tracking-wider">
                Biomechanics Guide
              </span>
              <button
                onClick={onOpenRules}
                className="text-xs font-black text-[#A8DADC] hover:text-[#F1FAEE] underline cursor-pointer uppercase tracking-wider"
              >
                Rules & Scoring &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
