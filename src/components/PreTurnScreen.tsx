import { useState, useEffect } from 'react';
import { Play, Sparkles, Check, ArrowRight } from 'lucide-react';
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
        // count === 0 ("GO!")
        timer = setTimeout(() => {
          onCountdownComplete();
        }, 600);
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
    <div className="w-full max-w-2xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[75vh]">
      {!isCountingDown ? (
        <div className="w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-700/60 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
          {/* Player Banner */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Turn {playerIndex + 1} of {totalPlayers}
          </div>

          {/* Player Avatar */}
          <div className="relative mb-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-amber-400 p-1 shadow-2xl shadow-cyan-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-5xl sm:text-6xl">
                {player.avatar}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 font-black text-xs shadow-lg">
              #{playerIndex + 1}
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Pass Webcam to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">{player.name}</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-md mb-8">
            Take the hot seat! You will have 10 seconds to showcase your best ergonomic posture for the AI.
          </p>

          {/* Quick Checklist */}
          <div className="w-full max-w-md bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5 mb-8">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Center your head, shoulders and chest in front of the camera</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Roll shoulders back and keep them level</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Elongate your spine and hold steady during the 10-second timer</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleStartCountdown}
            className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-lg tracking-wide shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            I'M READY - START COUNTDOWN
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* Dramatic 3-2-1 Countdown Overlay */
        <div className="flex flex-col items-center justify-center text-center animate-in zoom-in-75 duration-300">
          <div className="text-cyan-400 font-extrabold text-sm uppercase tracking-widest mb-6">
            Get In Position, {player.name}!
          </div>

          {/* Circular Countdown Ring */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* Outer spinning aura */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: '8s' }} />
            
            {/* Inner pulsing glow circle */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-500/10 to-transparent backdrop-blur-xl border border-cyan-400/30 shadow-2xl shadow-cyan-500/40" />

            {/* Huge Number */}
            <span
              key={count}
              className="relative text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-500 animate-in zoom-in-50 duration-300 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]"
            >
              {count === 0 ? 'GO!' : count}
            </span>
          </div>

          <p className="mt-8 text-slate-300 font-bold text-base sm:text-lg animate-pulse">
            {count === 0 ? 'Challenge starting now!' : 'Hold your posture tall...'}
          </p>
        </div>
      )}
    </div>
  );
};
