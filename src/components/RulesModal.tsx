import { X, Award, Crosshair } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">How Scoring Works</h2>
            <p className="text-xs text-slate-400">Authentic Computer Vision Biometrics</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Posture Champion uses <strong>MediaPipe Pose AI</strong> running 100% in your browser. It calculates 33 anatomical landmarks at 30+ frames per second to grade your posture from 0 to 100%. No fake scores!
        </p>

        <div className="space-y-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="text-cyan-400 mt-0.5 font-bold text-sm bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              25%
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Shoulder Levelness</h3>
              <p className="text-xs text-slate-400">
                Measures horizontal angle between left and right shoulders. Keep shoulders even without hiking or dropping either side.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="text-sky-400 mt-0.5 font-bold text-sm bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
              25%
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Head & Neck Alignment</h3>
              <p className="text-xs text-slate-400">
                Detects lateral ear tilt and horizontal offset from shoulders. Keep chin level and head centered over your chest.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="text-indigo-400 mt-0.5 font-bold text-sm bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
              25%
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Torso & Spine Uprightness</h3>
              <p className="text-xs text-slate-400">
                Calculates the vector from hips to shoulders against true vertical (90°). Sit tall and avoid leaning sideways.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="text-amber-400 mt-0.5 font-bold text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              15%
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Hip Alignment</h3>
              <p className="text-xs text-slate-400">
                Checks horizontal pelvic balance. Ensure weight is distributed symmetrically.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="text-emerald-400 mt-0.5 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              10%
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Bilateral Symmetry</h3>
              <p className="text-xs text-slate-400">
                Ensures left and right facial and torso distances match without twisting or turning away from the camera.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-950 border border-cyan-500/20">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Crosshair className="w-3.5 h-3.5" />
            Pro Competition Tips
          </div>
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            <li>Position camera at eye or chest level.</li>
            <li>Make sure your upper torso and head are well lit.</li>
            <li>Roll shoulders back and hold steady for the full 10 seconds!</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
        >
          Got It! Let's Compete
        </button>
      </div>
    </div>
  );
};
