import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Clock, XCircle, ExternalLink, X } from 'lucide-react';

const TransactionStatus: React.FC = () => {
  const { recentTransactions } = useApp();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const latestTx = recentTransactions[0];
  
  // Reset dismissed state when a new transaction comes in
  useEffect(() => {
    if (latestTx && latestTx.hash !== lastTxHash) {
      setLastTxHash(latestTx.hash);
      setDismissed(prev => prev.filter(h => h !== latestTx.hash));
    }
  }, [latestTx, lastTxHash]);

  // Only show pending transactions that haven't been dismissed
  // Don't show confirmed/failed as those are handled by Toast now
  if (!latestTx || latestTx.status !== 'pending' || dismissed.includes(latestTx.hash)) {
    return null;
  }

  // Only show if transaction is recent (within 5 minutes for pending)
  if (Date.now() - latestTx.timestamp > 300000) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(prev => [...prev, latestTx.hash]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="mt-1 border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Clock className="text-black animate-pulse" size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-black uppercase text-sm">Transaction Pending</h4>
            <button 
              onClick={handleDismiss}
              className="p-1 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all flex-shrink-0"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-xs font-bold text-gray-600 mt-1 font-mono truncate">{latestTx.hash}</p>
          <div className="mt-2 flex items-center justify-between">
             <span className="text-xs font-black uppercase text-gray-800">
               Land UID: {latestTx.landUid}
             </span>
             <a 
               href={`https://sepolia.etherscan.io/tx/${latestTx.hash}`}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline uppercase"
             >
               View <ExternalLink size={10} />
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;
