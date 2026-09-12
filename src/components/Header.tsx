import { useState } from 'react';
import { Trophy, Volume2, VolumeX, RotateCcw, Info, Activity } from 'lucide-react';
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
    <header className="w-full border-b-2 border-[#A8DADC] bg-[#1D3557] sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Tournament Brand Crest */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#457B9D] p-[2px] shadow-lg border-2 border-[#A8DADC] flex items-center justify-center">
            <div className="w-full h-full bg-[#1D3557] rounded-[8px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#F4C95D] drop-shadow-md" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-xl text-[#F1FAEE] font-heading leading-none">
                POSTURE CHAMPION
              </span>
              <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#A8DADC] text-[#1D3557]">
                ARENA
              </span>
            </div>
            <p className="text-[11px] text-[#A8DADC] hidden sm:flex items-center gap-1.5 font-bold uppercase tracking-wider mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#A8DADC] animate-pulse" />
              Client-Side Vision AI Tournament
            </p>
          </div>
        </div>

        {/* Live Match Stage Badge */}
        {stage !== 'setup' && stage !== 'leaderboard' && (
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#457B9D] border-2 border-[#A8DADC] shadow-md">
            <Activity className="w-3.5 h-3.5 text-[#F1FAEE] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-[#F1FAEE]">
              ROUND {currentPlayerIndex + 1 < 10 ? `0${currentPlayerIndex + 1}` : currentPlayerIndex + 1} / {totalPlayers < 10 ? `0${totalPlayers}` : totalPlayers}
            </span>
          </div>
        )}

        {/* Esports Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenRules}
            title="Tournament Rules & Scoring Guide"
            className="p-2.5 rounded-xl bg-[#457B9D] hover:bg-[#1D3557] text-[#F1FAEE] border-2 border-[#A8DADC] transition-all cursor-pointer shadow-md"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Arena Audio' : 'Mute Arena Audio'}
            className="p-2.5 rounded-xl bg-[#457B9D] hover:bg-[#1D3557] text-[#F1FAEE] border-2 border-[#A8DADC] transition-all cursor-pointer shadow-md"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#A8DADC]" /> : <Volume2 className="w-4 h-4 text-[#F1FAEE]" />}
          </button>

          {stage !== 'setup' && (
            <button
              onClick={onRestart}
              title="Reset Tournament"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#457B9D] hover:bg-[#1D3557] text-[#F1FAEE] border-2 border-[#A8DADC] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#A8DADC]" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
