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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-2xl shadow-2xl p-6 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Camera Access Needed</h2>
            <p className="text-xs text-rose-400">Webcam Permission Error</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-200 text-xs mb-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg || 'Could not access your webcam. Please check your browser settings.'}</span>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300 mb-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <p className="font-semibold text-slate-200">How to allow camera access:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
            <li>Click the camera icon or padlock in your browser's address bar.</li>
            <li>Select <strong>Allow</strong> for camera access.</li>
            <li>Make sure no other app (like Zoom, Teams, or Meet) is using the camera.</li>
            <li>Click <strong>Try Again</strong> below.</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
