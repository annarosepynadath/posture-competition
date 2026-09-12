import { Camera, AlertCircle, RefreshCw, X } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  errorMsg: string;
  onRetry: () => void;
  onClose: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  errorMsg,
  onRetry,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D3557]/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#1D3557] border-3 border-[#A8DADC] rounded-3xl shadow-2xl p-6 sm:p-7 text-[#F1FAEE]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#A8DADC] hover:text-[#F1FAEE] bg-[#457B9D] hover:bg-[#457B9D]/80 transition cursor-pointer border border-[#A8DADC]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-[#457B9D] text-[#F1FAEE] border-2 border-[#A8DADC]">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#F1FAEE] uppercase tracking-wide font-heading">
              Camera Permission Required
            </h2>
            <p className="text-xs text-[#A8DADC] font-bold">Webcam Sensor Access Blocked</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#457B9D] border-2 border-[#A8DADC] text-[#F1FAEE] text-xs mb-4 flex items-start gap-2.5 shadow-md">
          <AlertCircle className="w-4 h-4 text-[#F1FAEE] shrink-0 mt-0.5" />
          <span className="font-bold">{errorMsg || 'Could not access your webcam. Please check browser permissions.'}</span>
        </div>

        <div className="space-y-2 text-xs text-[#F1FAEE] mb-6 bg-[#457B9D] p-4 rounded-2xl border-2 border-[#A8DADC] shadow-md">
          <p className="font-black text-[#F1FAEE] uppercase tracking-wide">How to enable camera access:</p>
          <ol className="list-decimal list-inside space-y-1.5 font-bold">
            <li>Click the camera icon or padlock in your browser address bar.</li>
            <li>Change the camera permission setting to <strong>Allow</strong>.</li>
            <li>Ensure no other app (Zoom, Teams, Meet) is currently locking the camera.</li>
            <li>Click <strong>Try Again</strong> below.</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-2xl btn-accent font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-2xl btn-secondary text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
