// src/components/AdminDashboard.tsx
import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { ShieldCheck, FileText, RefreshCw } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { language, landRecords, verifyRecord, refreshRecords, isLoading, wallet } = useApp();
  const t = TRANSLATIONS[language];
  
  // Only show unverified records
  const pendingRecords = landRecords.filter(r => !r.isVerified);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Government Dashboard (Sepolia)</h2>
        <button onClick={refreshRecords} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b bg-gray-50 flex justify-between">
                <h3 className="font-bold text-gray-700 flex items-center gap-2"><FileText size={20} /> Verification Queue</h3>
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-bold">{pendingRecords.length} Pending</span>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {pendingRecords.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No pending verifications found on blockchain.</div>
                ) : (
                    pendingRecords.map((record) => (
                        <div key={record.landUid} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-800">{record.landUid}</p>
                                <p className="text-xs text-gray-500">{record.district}, {record.division} | Owner: {record.ownerAddress.substring(0,6)}...</p>
                            </div>
                            <button 
                                onClick={() => verifyRecord(record.landUid)}
                                className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
                            >
                                <ShieldCheck size={16} /> Approve
                            </button>
                        </div>
                    ))
                )}
            </div>
      </div>
    </div>
  );
};

export default AdminDashboard;