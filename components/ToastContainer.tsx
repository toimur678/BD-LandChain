import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, ExternalLink } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => hideToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    txHash?: string;
  };
  onDismiss: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const config = getToastConfig(toast.type);

  return (
    <div 
      className={`pointer-events-auto bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 animate-slide-in-right`}
      style={{ borderLeftColor: config.borderColor, borderLeftWidth: '6px' }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 p-1.5 border-2 border-black ${config.iconBg}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black uppercase text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="text-xs font-bold text-gray-600 mt-1 break-words">{toast.message}</p>
          )}
          {toast.txHash && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500 truncate max-w-[180px]">
                {toast.txHash.substring(0, 10)}...{toast.txHash.substring(toast.txHash.length - 8)}
              </span>
              <a 
                href={`https://sepolia.etherscan.io/tx/${toast.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline uppercase flex-shrink-0"
              >
                View <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>
        <button 
          onClick={onDismiss}
          className="flex-shrink-0 p-1 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const getToastConfig = (type: 'success' | 'error' | 'warning' | 'info') => {
  switch (type) {
    case 'success':
      return {
        icon: <CheckCircle2 size={20} className="text-green-600" />,
        iconBg: 'bg-green-100',
        borderColor: '#22c55e'
      };
    case 'error':
      return {
        icon: <XCircle size={20} className="text-red-600" />,
        iconBg: 'bg-red-100',
        borderColor: '#ef4444'
      };
    case 'warning':
      return {
        icon: <AlertTriangle size={20} className="text-yellow-600" />,
        iconBg: 'bg-yellow-100',
        borderColor: '#eab308'
      };
    case 'info':
    default:
      return {
        icon: <Info size={20} className="text-blue-600" />,
        iconBg: 'bg-blue-100',
        borderColor: '#3b82f6'
      };
  }
};

export default ToastContainer;
