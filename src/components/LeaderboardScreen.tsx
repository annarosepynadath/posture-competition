import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  Share2,
  Check,
} from 'lucide-react';
import type { Player } from '../types';
import { getPostureBadge } from '../services/postureScorer';
import { soundManager } from '../services/audioSynth';

interface LeaderboardScreenProps {
  players: Player[];
  onPlayAgainSame: () => void;
  onNewCompetition: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  players,
  onPlayAgainSame,
  onNewCompetition,
}) => {
  // Sort players descending by score
  const sortedPlayers = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const winner = sortedPlayers[0];
  const winnerBadge = getPostureBadge(winner?.score ?? 0);

  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Trigger grand celebration confetti and fanfare on mount
  useEffect(() => {
    soundManager.playChampionshipFanfare();

    // 1. Initial center burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#06b6d4', '#f59e0b', '#10b981', '#a855f7', '#ffffff'],
    });

    // 2. Left and right cannons
    const timer1 = setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.65 },
        colors: ['#f59e0b', '#fbbf24', '#ffffff', '#38bdf8'],
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.65 },
        colors: ['#f59e0b', '#fbbf24', '#ffffff', '#38bdf8'],
      });
    }, 400);

    // 3. Falling gold star shower
    const timer2 = setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { y: 0.2 },
        shapes: ['star'],
        colors: ['#fbbf24', '#f59e0b', '#ffffff'],
      });
    }, 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const triggerMoreConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#f59e0b', '#10b981', '#e11d48'],
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedPlayerId(expandedPlayerId === id ? null : id);
  };

  const handleShare = () => {
    const text = `🏆 Posture Champion Leaderboard:\n1st: ${winner?.name} (${winner?.score}%)\nCan you beat their posture?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getRankMedal = (index: number) => {
    switch (index) {
      case 0:
        return <span className="text-2xl">🥇</span>;
      case 1:
        return <span className="text-2xl">🥈</span>;
      case 2:
        return <span className="text-2xl">🥉</span>;
      default:
        return (
          <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-700">
            #{index + 1}
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Grand Champion Hero Card */}
      <div className="w-full relative glass-panel-glow p-8 sm:p-10 rounded-3xl text-center flex flex-col items-center mb-10 overflow-hidden animate-in zoom-in-95 duration-700">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Winner Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 font-black text-xs uppercase tracking-widest mb-4 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          OFFICIAL TOURNAMENT WINNER
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 tracking-tight mb-2 drop-shadow-md">
          POSTURE CHAMPION 🏆
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-lg mb-6">
          Supreme ergonomic alignment achieved through real-time MediaPipe AI biomechanics analysis!
        </p>

        {/* Champion Avatar & Score */}
        <div className="relative mb-6">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1.5 shadow-2xl shadow-amber-500/40 glow-champion">
            <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-6xl sm:text-7xl">
              {winner?.avatar}
            </div>
          </div>
          <div className="absolute -top-4 -right-3 text-4xl transform rotate-12 drop-shadow-md">
            👑
          </div>
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-base shadow-xl border border-yellow-200">
            {winner?.score}%
          </div>
        </div>

        <h2 className="text-3xl font-black text-white mb-2">{winner?.name}</h2>
        <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider mb-2 border ${winnerBadge.badgeClass}`}>
          {winnerBadge.emoji} {winnerBadge.title}
        </div>
        <p className="text-xs text-slate-400">{winnerBadge.subtitle}</p>

        {/* Confetti re-trigger button */}
        <button
          onClick={triggerMoreConfetti}
          className="mt-6 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-2 transition shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Celebrate More 🎉
        </button>
      </div>

      {/* Full Leaderboard Standings Table */}
      <div className="w-full glass-panel p-6 sm:p-8 rounded-3xl border-slate-800 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Full Leaderboard Rankings</h3>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {copiedLink ? 'Copied!' : 'Share'}
          </button>
        </div>

        <div className="space-y-3">
          {sortedPlayers.map((player, index) => {
            const isWinner = index === 0;
            const isExpanded = expandedPlayerId === player.id;
            const metrics = player.metricsBreakdown;

            return (
              <div
                key={player.id}
                className={`rounded-2xl transition-all border ${
                  isWinner
                    ? 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                }`}
              >
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(player.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 flex justify-center shrink-0">
                      {getRankMedal(index)}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                      {player.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base truncate">
                          {player.name}
                        </span>
                        {isWinner && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                            Champion
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {getPostureBadge(player.score ?? 0).title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black font-mono text-white">
                        {player.score}%
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-white transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Metrics */}
                {isExpanded && metrics && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-2.5 animate-in fade-in duration-200">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Shoulders</span>
                      <span className="text-sm font-black text-cyan-400 font-mono">{metrics.shoulderScore}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Head & Neck</span>
                      <span className="text-sm font-black text-sky-400 font-mono">{metrics.headScore}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Spine/Torso</span>
                      <span className="text-sm font-black text-indigo-400 font-mono">{metrics.spineScore}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Hip Balance</span>
                      <span className="text-sm font-black text-amber-400 font-mono">{metrics.hipScore}%</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Symmetry</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">{metrics.symmetryScore}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Match Restart Actions */}
      <div className="w-full flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onPlayAgainSame}
          className="flex-1 max-w-md py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          REMATCH (SAME PLAYERS)
        </button>

        <button
          onClick={onNewCompetition}
          className="py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-base border border-slate-800 flex items-center justify-center gap-2 transition"
        >
          <RotateCcw className="w-4 h-4" />
          NEW TOURNAMENT SETUP
        </button>
      </div>
    </div>
  );
};
