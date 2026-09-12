import { useState, useEffect } from 'react';
import { Play, Check, ArrowRight, Swords } from 'lucide-react';
import type { Player } from '../types';
import { soundManager } from '../services/audioSynth';

interface PreTurnScreenProps {
  player: Player;
  playerIndex: number;
  totalPlayers: number;
  onCountdownComplete: () => void;
}

export const PreTurnScreen: React.FC<PreTurnScreenProps> = ({
  player,
  playerIndex,
  totalPlayers,
  onCountdownComplete,
}) => {
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isCountingDown) {
      soundManager.playCountdown(count);

      if (count > 0) {
        timer = setTimeout(() => {
          setCount((prev) => prev - 1);
        }, 1000);
      } else {
        // count === 0 ("POSTURE!")
        timer = setTimeout(() => {
          onCountdownComplete();
        }, 800);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCountingDown, count, onCountdownComplete]);

  const handleStartCountdown = () => {
    setIsCountingDown(true);
    setCount(3);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[75vh]">
      {!isCountingDown ? (
        /* Card in Steel Blue #457B9D with Frosted Blue #A8DADC Border */
        <div className="w-full card-steel p-8 sm:p-12 rounded-3xl text-center flex flex-col items-center animate-in zoom-in-95 duration-500 relative overflow-hidden shadow-2xl">
          {/* Match Round Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1D3557] border-2 border-[#A8DADC] text-[#A8DADC] text-xs font-black uppercase tracking-widest mb-6 shadow-md">
            <Swords className="w-3.5 h-3.5 text-[#F1FAEE]" />
            MATCH {playerIndex + 1} OF {totalPlayers} &bull; INCOMING CONTENDER
          </div>

          {/* Dramatic Player Callout in Honeydew #F1FAEE & Frosted Blue #A8DADC */}
          <div className="mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#F1FAEE] block mb-1">
              CONTENDER SPOTLIGHT
            </span>
            <h1 className="text-5xl sm:text-7xl font-black text-[#F1FAEE] font-heading tracking-tight leading-none">
              PLAYER {playerIndex + 1}
            </h1>
            <h2 className="text-2xl sm:text-4xl font-black text-[#A8DADC] font-heading tracking-wider uppercase mt-2">
              GET READY
            </h2>
          </div>

          {/* Competitor Card in Deep Space Blue #1D3557 */}
          <div className="my-6 flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#1D3557] border-2 border-[#A8DADC] shadow-xl max-w-sm w-full">
            <div className="w-16 h-16 rounded-2xl bg-[#457B9D] border-2 border-[#A8DADC] flex items-center justify-center text-4xl shrink-0 shadow-inner">
              {player.avatar}
            </div>
            <div className="text-left min-w-0 flex-1">
              <span className="text-[10px] text-[#A8DADC] font-black uppercase tracking-wider block">
                Official Contender
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#F1FAEE] truncate block">
                {player.name}
              </span>
              <span className="text-[10px] text-[#A8DADC] font-bold uppercase tracking-widest">
                Seed #{playerIndex + 1 < 10 ? `0${playerIndex + 1}` : playerIndex + 1}
              </span>
            </div>
          </div>

          <p className="text-[#F1FAEE] text-sm sm:text-base max-w-md mb-8 font-bold">
            Pass the webcam to <strong className="text-[#A8DADC]">{player.name}</strong>. Step into position facing the camera for the 10-second posture battle.
          </p>

          {/* Directives in Deep Space Blue #1D3557 */}
          <div className="w-full max-w-md bg-[#1D3557] border-2 border-[#A8DADC]/60 rounded-2xl p-4 text-left space-y-2.5 mb-8 shadow-inner">
            <div className="flex items-center gap-3 text-xs text-[#F1FAEE] font-bold">
              <div className="w-5 h-5 rounded-full bg-[#A8DADC] text-[#1D3557] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Center head, chest, and shoulders in camera frame</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#F1FAEE] font-bold">
              <div className="w-5 h-5 rounded-full bg-[#A8DADC] text-[#1D3557] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Roll shoulders back and keep them horizontally level</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#F1FAEE] font-bold">
              <div className="w-5 h-5 rounded-full bg-[#A8DADC] text-[#1D3557] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Hold completely steady throughout the 10-second scan</span>
            </div>
          </div>

          {/* CTA Tactile Button in Frosted Blue #A8DADC */}
          <button
            onClick={handleStartCountdown}
            className="w-full max-w-md py-4 px-6 rounded-2xl btn-accent font-black text-lg tracking-wider uppercase flex items-center justify-center gap-3 shadow-2xl cursor-pointer"
          >
            <Play className="w-5 h-5 fill-[#1D3557]" />
            <span>I&rsquo;M IN POSITION &bull; START</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* Dramatic Countdown: 3 → 2 → 1 → POSTURE! */
        <div className="flex flex-col items-center justify-center text-center animate-in zoom-in-75 duration-300">
          <div className="text-xs font-black uppercase tracking-widest text-[#F1FAEE] mb-2 px-5 py-1.5 rounded-full bg-[#457B9D] border-2 border-[#A8DADC] shadow-md">
            Player {playerIndex + 1}: {player.name}
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-[#F1FAEE] font-heading uppercase tracking-widest mb-8">
            LOCK YOUR POSTURE
          </h3>

          {/* Countdown Ring */}
          <div className="relative w-60 h-60 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Outer spinning radar tick marks */}
            <div
              className="absolute inset-0 rounded-full border-4 border-dashed border-[#A8DADC] animate-spin"
              style={{ animationDuration: '8s' }}
            />

            {/* Inner glass core in Steel Blue #457B9D */}
            <div className="absolute inset-4 rounded-full bg-[#457B9D] border-4 border-[#A8DADC] shadow-2xl flex items-center justify-center" />

            {/* Countdown Text */}
            <span
              key={count}
              className={`relative font-black font-heading animate-in zoom-in-50 duration-300 drop-shadow-xl ${
                count === 0
                  ? 'text-4xl sm:text-6xl text-[#F1FAEE] tracking-tight'
                  : 'text-8xl sm:text-9xl text-[#F1FAEE]'
              }`}
            >
              {count === 0 ? 'POSTURE!' : count}
            </span>
          </div>

          <p className="mt-8 text-sm sm:text-lg font-black text-[#A8DADC] tracking-wider uppercase animate-pulse">
            {count === 0 ? 'Biometric scan starting now!' : 'Hold your spine tall and shoulders level...'}
          </p>
        </div>
      )}
    </div>
  );
};
