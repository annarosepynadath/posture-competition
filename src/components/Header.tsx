import { useState } from 'react';
import { Trophy, Volume2, VolumeX, RotateCcw, Info } from 'lucide-react';
import { soundManager } from '../services/audioSynth';
import type { GameStage } from '../types';

interface HeaderProps {
  stage: GameStage;
  currentPlayerIndex: number;
  totalPlayers: number;
  onRestart: () => void;
  onOpenRules: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stage,
  currentPlayerIndex,
  totalPlayers,
  onRestart,
  onOpenRules,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const handleToggleMute = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-400 p-[2px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-300">
                POSTURE CHAMPION
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                AI Vision
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Webcam-Powered Biomechanical Battle
            </p>
          </div>
        </div>

        {/* Turn Progress Badge (if in match) */}
        {stage !== 'setup' && stage !== 'leaderboard' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-semibold text-slate-300">
              Player {currentPlayerIndex + 1} of {totalPlayers}
            </span>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenRules}
            title="Posture Scoring Rules & Tips"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {stage !== 'setup' && (
            <button
              onClick={onRestart}
              title="Restart Tournament"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-800/60 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
