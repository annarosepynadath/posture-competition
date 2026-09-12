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
  Crown,
  Medal,
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
  const sortedPlayers = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const winner = sortedPlayers[0];
  const second = sortedPlayers.length > 1 ? sortedPlayers[1] : null;
  const third = sortedPlayers.length > 2 ? sortedPlayers[2] : null;
  const winnerBadge = getPostureBadge(winner?.score ?? 0);

  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Confetti bursts strictly tuned to the core palette
  useEffect(() => {
    soundManager.playChampionshipFanfare();

    const palette = ['#F4C95D', '#A8DADC', '#F1FAEE', '#457B9D'];

    // 1. Initial center burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.4 },
      colors: palette,
    });

    // 2. Dual cannon crossfire
    const timer1 = setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 65,
        origin: { x: 0.05, y: 0.65 },
        colors: palette,
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 65,
        origin: { x: 0.95, y: 0.65 },
        colors: palette,
      });
    }, 450);

    // 3. Falling gold star shower
    const timer2 = setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 110,
        origin: { y: 0.2 },
        shapes: ['star'],
        colors: ['#F4C95D', '#F1FAEE'],
      });
    }, 950);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const triggerMoreConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 85,
      origin: { y: 0.55 },
      colors: ['#F4C95D', '#A8DADC', '#F1FAEE', '#457B9D'],
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedPlayerId(expandedPlayerId === id ? null : id);
  };

  const handleShare = () => {
    const text = `🏆 Posture Champion Results:\n1st: ${winner?.name} (${winner?.score}%)\nCan you beat their ergonomic score?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Dramatic Winner Announcement Showcase in Deep Space Blue with Gold Border */}
      <div className="w-full card-gold p-8 sm:p-12 rounded-3xl text-center flex flex-col items-center mb-12 relative overflow-hidden animate-in zoom-in-95 duration-700">
        {/* Championship Header Pill in Gold #F4C95D */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1D3557] border-2 border-[#F4C95D] text-[#F4C95D] font-black text-xs uppercase tracking-widest mb-4 shadow-xl">
          <Crown className="w-4 h-4 text-[#F4C95D]" />
          OFFICIAL TOURNAMENT CHAMPION
        </div>

        {/* Dramatic Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-[#F4C95D] font-heading tracking-tight mb-3 drop-shadow-md">
          🏆 POSTURE CHAMPION
        </h1>

        {/* Winner Name & Huge Score */}
        <div className="my-5 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-[#F4C95D] p-1.5 shadow-2xl glow-champion-gold">
              <div className="w-full h-full bg-[#1D3557] rounded-[20px] flex items-center justify-center text-6xl sm:text-7xl shadow-inner border border-[#F4C95D]">
                {winner?.avatar}
              </div>
            </div>
            <span className="absolute -top-3.5 -right-3.5 text-4xl transform rotate-12 drop-shadow-lg">
              👑
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#F1FAEE] font-heading tracking-wide uppercase">
            {winner?.name}
          </h2>

          <div className="mt-2 text-6xl sm:text-8xl font-black font-mono text-[#F4C95D] tracking-tight drop-shadow-md">
            {winner?.score}%
          </div>
        </div>

        <div className="px-5 py-2 rounded-xl bg-[#F4C95D] text-[#1D3557] font-black text-xs uppercase tracking-widest mb-2.5 shadow-md">
          {winnerBadge.title}
        </div>

        <p className="text-xs sm:text-sm font-bold text-[#F1FAEE] max-w-md mb-6 leading-relaxed">
          &ldquo;{winnerBadge.playfulMessage}&rdquo;
        </p>

        <button
          onClick={triggerMoreConfetti}
          className="px-5 py-2.5 rounded-xl bg-[#1D3557] hover:bg-[#457B9D] border-2 border-[#F4C95D] text-[#F4C95D] hover:text-[#F1FAEE] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F4C95D]" />
          Trigger Victory Confetti 🎉
        </button>
      </div>

      {/* Real 3-Tier Olympic / Tournament Podium */}
      {sortedPlayers.length >= 2 && (
        <div className="w-full mb-12">
          <div className="text-center mb-6">
            <span className="text-xs font-black uppercase tracking-widest text-[#A8DADC] block">
              OFFICIAL TOURNAMENT PODIUM
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#F1FAEE] font-heading uppercase">
              CHAMPIONSHIP PODIUM
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-6">
            {/* 2nd Place Podium (Left, Silver Tier in Steel Blue #457B9D) */}
            {second && (
              <div className="card-steel p-4 rounded-2xl flex flex-col items-center text-center border-t-8 border-t-[#A8DADC] h-64 sm:h-72 justify-between shadow-2xl">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#1D3557] border-2 border-[#A8DADC] flex items-center justify-center text-sm font-black text-[#F1FAEE] mb-2">
                    2
                  </div>
                  <div className="text-3xl mb-1">{second.avatar}</div>
                  <span className="text-xs sm:text-sm font-black text-[#F1FAEE] truncate max-w-[90px] sm:max-w-[120px] uppercase font-heading">
                    {second.name}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#F1FAEE] mt-1">
                    {second.score}%
                  </span>
                </div>
                <div className="w-full py-2 rounded-xl bg-[#1D3557] border-2 border-[#A8DADC] text-xs font-black uppercase tracking-wider text-[#A8DADC]">
                  2ND PLACE (SILVER)
                </div>
              </div>
            )}

            {/* 1st Place Podium (Center, Elevated & Gold in Gold #F4C95D) */}
            {winner && (
              <div className="card-gold p-4 sm:p-5 rounded-2xl flex flex-col items-center text-center border-t-8 border-t-[#F4C95D] h-80 sm:h-92 justify-between scale-105 z-10 shadow-2xl">
                <div className="flex flex-col items-center">
                  <div className="text-xs font-black text-[#F4C95D] flex items-center gap-1 uppercase tracking-widest mb-1.5">
                    <Crown className="w-4 h-4" />
                    GOLD WINNER
                  </div>
                  <div className="text-4xl mb-1">{winner.avatar}</div>
                  <span className="text-sm sm:text-base font-black text-[#F1FAEE] truncate max-w-[100px] sm:max-w-[140px] uppercase font-heading">
                    {winner.name}
                  </span>
                  <span className="text-3xl sm:text-5xl font-black font-mono text-[#F4C95D] mt-1">
                    {winner.score}%
                  </span>
                </div>
                <div className="w-full py-2.5 rounded-xl bg-[#F4C95D] text-[#1D3557] text-xs font-black uppercase tracking-wider shadow-xl flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4 fill-[#1D3557]" />
                  1ST PLACE (GOLD)
                </div>
              </div>
            )}

            {/* 3rd Place Podium (Right, Bronze Tier in Steel Blue #457B9D) */}
            {third ? (
              <div className="card-steel p-4 rounded-2xl flex flex-col items-center text-center border-t-8 border-t-[#1D3557] h-56 sm:h-64 justify-between shadow-2xl">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#1D3557] border-2 border-[#A8DADC]/60 flex items-center justify-center text-sm font-black text-[#F1FAEE] mb-2">
                    3
                  </div>
                  <div className="text-3xl mb-1">{third.avatar}</div>
                  <span className="text-xs sm:text-sm font-black text-[#F1FAEE] truncate max-w-[90px] sm:max-w-[120px] uppercase font-heading">
                    {third.name}
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-[#F1FAEE] mt-1">
                    {third.score}%
                  </span>
                </div>
                <div className="w-full py-2 rounded-xl bg-[#1D3557] border-2 border-[#A8DADC]/50 text-xs font-black uppercase tracking-wider text-[#A8DADC]">
                  3RD PLACE (BRONZE)
                </div>
              </div>
            ) : (
              <div className="opacity-0" />
            )}
          </div>
        </div>
      )}

      {/* Full Leaderboard Table in Steel Blue Cards */}
      <div className="w-full card-steel p-6 sm:p-8 rounded-3xl shadow-2xl mb-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#A8DADC]/40">
          <div className="flex items-center gap-2.5">
            <Medal className="w-5 h-5 text-[#F1FAEE]" />
            <h3 className="text-lg font-black uppercase tracking-wider text-[#F1FAEE]">
              Full Leaderboard Telemetry
            </h3>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D3557] hover:bg-[#1D3557]/80 text-[#F1FAEE] border-2 border-[#A8DADC] text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#A8DADC]" /> : <Share2 className="w-3.5 h-3.5 text-[#F1FAEE]" />}
            {copiedLink ? 'Copied!' : 'Share Results'}
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
                className={`rounded-2xl transition-all border-2 ${
                  isWinner
                    ? 'bg-[#1D3557] border-[#F4C95D] shadow-xl'
                    : 'bg-[#1D3557] border-[#A8DADC]/50 hover:border-[#F1FAEE]'
                }`}
              >
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(player.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 flex justify-center shrink-0">
                      {index === 0 ? (
                        <span className="text-2xl">🥇</span>
                      ) : index === 1 ? (
                        <span className="text-2xl">🥈</span>
                      ) : index === 2 ? (
                        <span className="text-2xl">🥉</span>
                      ) : (
                        <span className="w-7 h-7 rounded-lg bg-[#457B9D] text-[#F1FAEE] font-black text-xs flex items-center justify-center border border-[#A8DADC]">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-[#457B9D] border-2 border-[#A8DADC] flex items-center justify-center text-2xl shrink-0">
                      {player.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#F1FAEE] text-base truncate uppercase font-heading">
                          {player.name}
                        </span>
                        {isWinner && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F4C95D] text-[#1D3557] text-[10px] font-black uppercase tracking-wider">
                            Champion
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#A8DADC] font-bold">
                        {getPostureBadge(player.score ?? 0).title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-2xl sm:text-3xl font-black font-mono ${isWinner ? 'text-[#F4C95D]' : 'text-[#F1FAEE]'}`}>
                      {player.score}%
                    </span>

                    <button
                      type="button"
                      className="p-1 text-[#A8DADC] hover:text-[#F1FAEE] transition"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Metrics */}
                {isExpanded && metrics && (
                  <div className="px-4 pb-4 pt-2 border-t-2 border-[#457B9D] grid grid-cols-2 sm:grid-cols-5 gap-2.5 animate-in fade-in duration-200">
                    <div className="p-2.5 rounded-xl bg-[#457B9D] border border-[#A8DADC] text-center">
                      <span className="text-[10px] text-[#F1FAEE] uppercase font-black block">Shoulders</span>
                      <span className="text-sm font-black text-[#A8DADC] font-mono">{metrics.shoulderScore}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#457B9D] border border-[#A8DADC] text-center">
                      <span className="text-[10px] text-[#F1FAEE] uppercase font-black block">Head & Neck</span>
                      <span className="text-sm font-black text-[#A8DADC] font-mono">{metrics.headScore}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#457B9D] border border-[#A8DADC] text-center">
                      <span className="text-[10px] text-[#F1FAEE] uppercase font-black block">Spine/Torso</span>
                      <span className="text-sm font-black text-[#A8DADC] font-mono">{metrics.spineScore}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#457B9D] border border-[#A8DADC] text-center">
                      <span className="text-[10px] text-[#F1FAEE] uppercase font-black block">Hip Balance</span>
                      <span className="text-sm font-black text-[#A8DADC] font-mono">{metrics.hipScore}%</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-[#457B9D] border border-[#A8DADC] text-center">
                      <span className="text-[10px] text-[#F1FAEE] uppercase font-black block">Symmetry</span>
                      <span className="text-sm font-black text-[#A8DADC] font-mono">{metrics.symmetryScore}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Match Rematch Actions in Frosted Blue and Steel Blue */}
      <div className="w-full flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onPlayAgainSame}
          className="flex-1 max-w-md py-4 px-6 rounded-2xl btn-accent font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-2xl cursor-pointer"
        >
          <Play className="w-5 h-5 fill-[#1D3557]" />
          <span>REMATCH (SAME PLAYERS)</span>
        </button>

        <button
          onClick={onNewCompetition}
          className="py-4 px-6 rounded-2xl btn-secondary text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <RotateCcw className="w-4 h-4 text-[#A8DADC]" />
          <span>NEW TOURNAMENT SETUP</span>
        </button>
      </div>
    </div>
  );
};
