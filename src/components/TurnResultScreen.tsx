import { useEffect, useState } from 'react';
import { ArrowRight, Trophy, BarChart3, Shield, Swords, Sparkles } from 'lucide-react';
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
  const nextPlayer = !isLastPlayer ? allPlayers[playerIndex + 1] : null;

  // Animate score counter upward from 0 to targetScore
  useEffect(() => {
    const duration = 1200; // 1.2s
    const startTime = performance.now();

    const frame = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * targetScore);
      setAnimatedScore(current);

      if (progress < 1) {
        if (current % 3 === 0) {
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

  const completedPlayers = allPlayers
    .filter((p) => p.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const currentRank = completedPlayers.findIndex((p) => p.id === player.id) + 1;

  // Gold accent strictly reserved for top tier results (93+)
  const isExceptionalScore = targetScore >= 93;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
      {/* STRONG TRANSITION BANNER: PLAYER 1 FINISHED → NEXT CHALLENGER → PLAYER 2 in Steel Blue #457B9D */}
      <div className="w-full card-steel p-4 rounded-2xl mb-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1D3557] border-2 border-[#A8DADC] text-[#F1FAEE] flex items-center justify-center font-black text-base shadow-inner">
            #{playerIndex + 1}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A8DADC] block">
              CHALLENGE COMPLETE
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#F1FAEE] uppercase tracking-wide font-heading">
              PLAYER {playerIndex + 1} ({player.name}) FINISHED
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1D3557] border-2 border-[#A8DADC] shadow-md">
          <Swords className="w-4 h-4 text-[#A8DADC]" />
          <span className="text-xs font-black uppercase tracking-widest">
            {isLastPlayer ? (
              <span className="text-[#F4C95D] flex items-center gap-1.5">
                ALL CONTENDERS DONE &bull; PODIUM READY 🏆
              </span>
            ) : (
              <span className="text-[#F1FAEE]">
                NEXT CHALLENGER &rarr; PLAYER {playerIndex + 2} ({nextPlayer?.name})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Main Grid: Score Centerpiece in Steel Blue #457B9D & Biomechanical Report */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Left: Score Visual Centerpiece */}
        <div className={`md:col-span-6 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden ${
          isExceptionalScore ? 'card-gold' : 'card-steel'
        }`}>
          {isExceptionalScore && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#F4C95D] text-[#1D3557] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              ELITE CHAMPION SCORE
            </div>
          )}

          {/* Competitor Avatar & Name */}
          <div className="w-16 h-16 rounded-2xl bg-[#1D3557] border-2 border-[#A8DADC] flex items-center justify-center text-3xl mb-2 shadow-inner">
            {player.avatar}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#F1FAEE] font-heading mb-1">{player.name}</h2>
          <span className="text-[11px] text-[#F1FAEE] uppercase font-black tracking-widest mb-6 bg-[#1D3557] px-3 py-1 rounded-full border border-[#A8DADC]">
            Official Biometric Score
          </span>

          {/* Huge Animated Score Dial Visualization in Frosted Blue */}
          <div className="relative w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="90"
                stroke="currentColor"
                strokeWidth="13"
                className="text-[#1D3557] fill-none"
              />
              <circle
                cx="112"
                cy="112"
                r="90"
                stroke={isExceptionalScore ? '#F4C95D' : '#A8DADC'}
                strokeWidth="13"
                strokeDasharray="565.5"
                strokeDashoffset={565.5 - (565.5 * animatedScore) / 100}
                strokeLinecap="round"
                className="fill-none transition-all duration-75"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className={`text-6xl sm:text-7xl font-black font-mono tracking-tight leading-none ${
                isExceptionalScore ? 'text-[#F4C95D]' : 'text-[#F1FAEE]'
              }`}>
                {animatedScore}%
              </span>
              <span className="text-[11px] uppercase font-black tracking-widest text-[#A8DADC] mt-1.5">
                Calculated Form
              </span>
            </div>
          </div>

          {/* Performance Badge & Humorous Commentary */}
          <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 ${badge.badgeClass}`}>
            <span className="text-base">{badge.emoji}</span>
            <span>{badge.title}</span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-[#F1FAEE] max-w-xs leading-relaxed px-2">
            &ldquo;{badge.playfulMessage}&rdquo;
          </p>

          {/* Standing info */}
          {currentRank > 0 && (
            <div className="mt-6 pt-4 border-t-2 border-[#A8DADC]/40 w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-[#F1FAEE]">
              <Trophy className={`w-4 h-4 ${isExceptionalScore ? 'text-[#F4C95D]' : 'text-[#F1FAEE]'}`} />
              Currently Seed #{currentRank} of {completedPlayers.length} Finished
            </div>
          )}
        </div>

        {/* Right: Detailed Biomechanical Telemetry in Steel Blue #457B9D */}
        <div className="md:col-span-6 card-steel p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b-2 border-[#A8DADC]/40">
              <BarChart3 className="w-5 h-5 text-[#F1FAEE]" />
              <h3 className="text-base font-black uppercase tracking-wider text-[#F1FAEE]">
                Biomechanical Telemetry Report
              </h3>
            </div>

            <div className="space-y-4">
              {/* Shoulder Levelness */}
              <div>
                <div className="flex justify-between text-xs font-black uppercase tracking-wide mb-1.5">
                  <span className="text-[#F1FAEE]">Shoulder Horizontal Level</span>
                  <span className="text-[#A8DADC] font-mono text-sm">{metrics.shoulderScore}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#1D3557] overflow-hidden p-[2px] border border-[#A8DADC]/50">
                  <div
                    className="h-full bg-[#A8DADC] rounded-full transition-all duration-700"
                    style={{ width: `${metrics.shoulderScore}%` }}
                  />
                </div>
              </div>

              {/* Head & Neck Centering */}
              <div>
                <div className="flex justify-between text-xs font-black uppercase tracking-wide mb-1.5">
                  <span className="text-[#F1FAEE]">Head & Neck Alignment</span>
                  <span className="text-[#A8DADC] font-mono text-sm">{metrics.headScore}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#1D3557] overflow-hidden p-[2px] border border-[#A8DADC]/50">
                  <div
                    className="h-full bg-[#A8DADC] rounded-full transition-all duration-700"
                    style={{ width: `${metrics.headScore}%` }}
                  />
                </div>
              </div>

              {/* Spine Uprightness */}
              <div>
                <div className="flex justify-between text-xs font-black uppercase tracking-wide mb-1.5">
                  <span className="text-[#F1FAEE]">Spine & Torso Uprightness</span>
                  <span className="text-[#A8DADC] font-mono text-sm">{metrics.spineScore}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#1D3557] overflow-hidden p-[2px] border border-[#A8DADC]/50">
                  <div
                    className="h-full bg-[#A8DADC] rounded-full transition-all duration-700"
                    style={{ width: `${metrics.spineScore}%` }}
                  />
                </div>
              </div>

              {/* Hip Balance */}
              <div>
                <div className="flex justify-between text-xs font-black uppercase tracking-wide mb-1.5">
                  <span className="text-[#F1FAEE]">Pelvic & Hip Balance</span>
                  <span className="text-[#A8DADC] font-mono text-sm">{metrics.hipScore}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#1D3557] overflow-hidden p-[2px] border border-[#A8DADC]/50">
                  <div
                    className="h-full bg-[#A8DADC] rounded-full transition-all duration-700"
                    style={{ width: `${metrics.hipScore}%` }}
                  />
                </div>
              </div>

              {/* Bilateral Symmetry */}
              <div>
                <div className="flex justify-between text-xs font-black uppercase tracking-wide mb-1.5">
                  <span className="text-[#F1FAEE]">Bilateral Symmetry</span>
                  <span className="text-[#A8DADC] font-mono text-sm">{metrics.symmetryScore}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#1D3557] overflow-hidden p-[2px] border border-[#A8DADC]/50">
                  <div
                    className="h-full bg-[#A8DADC] rounded-full transition-all duration-700"
                    style={{ width: `${metrics.symmetryScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Coaching Note */}
            {metrics.feedback.length > 0 && (
              <div className="mt-6 p-4 rounded-2xl bg-[#1D3557] border-2 border-[#A8DADC] text-xs text-[#F1FAEE] shadow-md">
                <div className="flex items-center gap-1.5 text-[#A8DADC] font-black uppercase tracking-wide mb-1">
                  <Shield className="w-4 h-4 text-[#A8DADC]" />
                  AI Telemetry Coach Observation:
                </div>
                <p className="font-bold">{metrics.feedback[0]}</p>
              </div>
            )}
          </div>

          {/* Action Button in Frosted Blue #A8DADC with Deep Space text */}
          <button
            onClick={onProceedNext}
            className="mt-6 w-full py-4 px-6 rounded-2xl btn-accent font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-2xl cursor-pointer"
          >
            {isLastPlayer ? (
              <>
                <Trophy className="w-5 h-5 fill-[#1D3557]" />
                <span>REVEAL CHAMPIONSHIP PODIUM</span>
              </>
            ) : (
              <>
                <span>NEXT CHALLENGER &rarr; PLAYER {playerIndex + 2}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
