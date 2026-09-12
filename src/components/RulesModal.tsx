import { X, Award, Crosshair } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D3557]/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#1D3557] border-3 border-[#A8DADC] rounded-3xl shadow-2xl p-6 sm:p-8 text-[#F1FAEE]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#A8DADC] hover:text-[#F1FAEE] bg-[#457B9D] hover:bg-[#457B9D]/80 transition cursor-pointer border border-[#A8DADC]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-[#A8DADC]/40">
          <div className="p-3 rounded-2xl bg-[#457B9D] text-[#F1FAEE] border-2 border-[#A8DADC]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#F1FAEE] uppercase tracking-wide font-heading">
              Tournament Scoring Criteria
            </h2>
            <p className="text-xs text-[#A8DADC] font-bold">Measurable Computer Vision Biometrics</p>
          </div>
        </div>

        <p className="text-sm text-[#F1FAEE] leading-relaxed mb-6 font-bold">
          Posture Champion runs <strong>MediaPipe Pose Vision AI</strong> 100% locally in your browser. It measures 33 anatomical landmarks across 5 key ergonomic factors:
        </p>

        <div className="space-y-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-[#457B9D] border-2 border-[#A8DADC] flex items-start gap-3 shadow-md">
            <div className="text-[#1D3557] font-black text-xs bg-[#A8DADC] px-2.5 py-1 rounded-md shrink-0">
              25%
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F1FAEE]">Shoulder Levelness</h3>
              <p className="text-xs text-[#F1FAEE] mt-0.5 font-semibold">
                Measures horizontal angle between shoulders. Keep both shoulders level and relaxed without hiking.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#457B9D] border-2 border-[#A8DADC] flex items-start gap-3 shadow-md">
            <div className="text-[#1D3557] font-black text-xs bg-[#A8DADC] px-2.5 py-1 rounded-md shrink-0">
              25%
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F1FAEE]">Head & Neck Alignment</h3>
              <p className="text-xs text-[#F1FAEE] mt-0.5 font-semibold">
                Evaluates lateral ear tilt and centering directly over your chest without tilting or forward lean.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#457B9D] border-2 border-[#A8DADC] flex items-start gap-3 shadow-md">
            <div className="text-[#1D3557] font-black text-xs bg-[#A8DADC] px-2.5 py-1 rounded-md shrink-0">
              25%
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F1FAEE]">Spine & Torso Uprightness</h3>
              <p className="text-xs text-[#F1FAEE] mt-0.5 font-semibold">
                Calculates the vector from hips to shoulders against vertical (90°). Sit or stand tall without sideways slouch.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#457B9D] border-2 border-[#A8DADC] flex items-start gap-3 shadow-md">
            <div className="text-[#1D3557] font-black text-xs bg-[#A8DADC] px-2.5 py-1 rounded-md shrink-0">
              15%
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F1FAEE]">Hip Balance</h3>
              <p className="text-xs text-[#F1FAEE] mt-0.5 font-semibold">
                Detects pelvic tilt and ensures equal weight distribution.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#457B9D] border-2 border-[#A8DADC] flex items-start gap-3 shadow-md">
            <div className="text-[#1D3557] font-black text-xs bg-[#A8DADC] px-2.5 py-1 rounded-md shrink-0">
              10%
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F1FAEE]">Bilateral Symmetry</h3>
              <p className="text-xs text-[#F1FAEE] mt-0.5 font-semibold">
                Verifies facial and torso distances are balanced symmetrically facing the camera directly.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#457B9D] border-2 border-[#A8DADC] mb-6 shadow-md">
          <div className="flex items-center gap-2 text-[#F1FAEE] text-xs font-black uppercase tracking-wider mb-1.5">
            <Crosshair className="w-4 h-4 text-[#A8DADC]" />
            Competitive Pro Tips
          </div>
          <ul className="text-xs text-[#F1FAEE] space-y-1 list-disc list-inside font-bold">
            <li>Position your webcam at upper-chest or eye level.</li>
            <li>Roll your shoulder blades gently back and down.</li>
            <li>Hold steady throughout the entire 10-second timer!</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl btn-accent font-black text-sm uppercase tracking-wider shadow-xl transition cursor-pointer"
        >
          Understood &bull; Return to Arena
        </button>
      </div>
    </div>
  );
};
