import { useEffect, useState } from 'react';
import { ArrowRight, Trophy, Sparkles, BarChart3 } from 'lucide-react';
import type { Player, PostureMetrics } from '../types';
import { getPostureBadge } from '../services/postureScorer';
import { soundManager } from '../services/audioSynth';

interface TurnResultScreenProps {
  player: Player;
  playerIndex: number;
  totalPlayers: number;
  allPlayers: Player[];
  onProceedNext: () => void;
}

export const TurnResultScreen: React.FC<TurnResultScreenProps> = ({
  player,
  playerIndex,
  totalPlayers,
  allPlayers,
  onProceedNext,
}) => {
  const targetScore = player.score ?? 0;
  const metrics: PostureMetrics = player.metricsBreakdown ?? {
    headScore: 0,
    shoulderScore: 0,
    spineScore: 0,
    hipScore: 0,
    symmetryScore: 0,
    overallScore: 0,
    feedback: [],
    isWellAligned: false,
    isPersonDetected: false,
  };

  const badge = getPostureBadge(targetScore);
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const isLastPlayer = playerIndex >= totalPlayers - 1;

  // Animate score counter from 0 to targetScore
  useEffect(() => {
    const duration = 1200; // 1.2s
    const startTime = performance.now();

    const frame = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * targetScore);
      setAnimatedScore(current);

      if (progress < 1) {
        if (current % 4 === 0) {
          soundManager.playTick();
        }
        requestAnimationFrame(frame);
      } else {
        setAnimatedScore(targetScore);
      }
    };

    const animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [targetScore]);

  // Calculate current standing among completed players
  const completedPlayers = allPlayers
    .filter((p) => p.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const currentRank = completedPlayers.findIndex((p) => p.id === player.id) + 1;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Top Banner */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in">
        <Sparkles className="w-4 h-4" />
        Turn {playerIndex + 1} of {totalPlayers} Complete
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Big Animated Score Card */}
        <div className="md:col-span-6 glass-panel-glow p-8 rounded-3xl flex flex-col items-center justify-center text-center">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl mb-3 shadow-inner">
            {player.avatar}
          </div>
          <h2 className="text-2xl font-black text-white mb-1">{player.name}</h2>
          <p className="text-xs text-slate-400 mb-6">10-Second Posture Score</p>

          {/* Animated Circular Score Ring */}
          <div className="relative w-44 h-44 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="72"
                stroke="currentColor"
                strokeWidth="12"
                className="text-slate-800 fill-none"
              />
              <circle
                cx="88"
                cy="88"
                r="72"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                strokeDasharray="452.4"
                strokeDashoffset={452.4 - (452.4 * animatedScore) / 100}
                strokeLinecap="round"
                className="fill-none transition-all duration-75"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-black text-white font-mono tracking-tight">
                {animatedScore}%
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-cyan-400">
                Overall Rating
              </span>
            </div>
          </div>

          {/* Posture Badge */}
          <div className={`px-4 py-2 rounded-xl bg-gradient-to-r border text-xs font-black shadow-lg mb-4 flex items-center gap-2 ${badge.badgeClass}`}>
            <span className="text-base">{badge.emoji}</span>
            <span>{badge.title}</span>
          </div>
          <p className="text-xs text-slate-400">{badge.subtitle}</p>

          {/* Current Rank callout */}
          {currentRank > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-800 w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              Currently ranked #{currentRank} of {completedPlayers.length}
            </div>
          )}
        </div>

        {/* Right Column: Biomechanical Metrics Breakdown */}
        <div className="md:col-span-6 glass-panel p-6 sm:p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Biomechanical Breakdown</h3>
            </div>

            <div className="space-y-4">
              {/* Shoulder Levelness */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Shoulder Levelness</span>
                  <span className="text-cyan-400 font-mono">{metrics.shoulderScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${metrics.shoulderScore}%` }}
                  />
                </div>
              </div>

              {/* Head & Neck Centering */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Head & Neck Alignment</span>
                  <span className="text-sky-400 font-mono">{metrics.headScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full transition-all duration-700"
                    style={{ width: `${metrics.headScore}%` }}
                  />
                </div>
              </div>

              {/* Spine Uprightness */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Spine & Torso Uprightness</span>
                  <span className="text-indigo-400 font-mono">{metrics.spineScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full transition-all duration-700"
                    style={{ width: `${metrics.spineScore}%` }}
                  />
                </div>
              </div>

              {/* Hip Alignment */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Hip Balance</span>
                  <span className="text-amber-400 font-mono">{metrics.hipScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{ width: `${metrics.hipScore}%` }}
                  />
                </div>
              </div>

              {/* Bilateral Symmetry */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Bilateral Symmetry</span>
                  <span className="text-emerald-400 font-mono">{metrics.symmetryScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${metrics.symmetryScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Performance Summary Feedback */}
            {metrics.feedback.length > 0 && (
              <div className="mt-6 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-cyan-400 block mb-1">AI Observation:</span>
                <p>{metrics.feedback[0]}</p>
              </div>
            )}
          </div>

          {/* Proceed Button */}
          <button
            onClick={onProceedNext}
            className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-base tracking-wide shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
          >
            {isLastPlayer ? (
              <>
                <Trophy className="w-5 h-5 fill-slate-950" />
                REVEAL FINAL CHAMPION
              </>
            ) : (
              <>
                PASS TO NEXT PLAYER
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
