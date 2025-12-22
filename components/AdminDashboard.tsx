// src/components/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { ShieldCheck, FileText, RefreshCw, X, MapPin } from 'lucide-react';
import { NeoButton, NeoCard, NeoBadge } from './NeoComponents';
import { LandRecord } from '../types';

const AdminDashboard: React.FC = () => {
  const { language, landRecords, verifyRecord, refreshRecords, isLoading, wallet } = useApp();
  const t = TRANSLATIONS[language];
  const [selectedRecord, setSelectedRecord] = useState<LandRecord | null>(null);
  
  // Only show unverified records
  const pendingRecords = landRecords.filter(r => !r.isVerified);

  return (
    <div className="space-y-8 animate-fade-in relative">
        {/* Modal for Detailed View */}
       {selectedRecord && (
        <div 
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedRecord(null)}
        >
            <div 
                className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-2xl w-full relative max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => setSelectedRecord(null)}
                    className="absolute top-4 right-4 p-2 bg-white hover:bg-red-100 border-2 border-black hover:border-red-500 transition-all z-10"
                    title="Close"
                >
                    <X size={24} />
                </button>

                <h3 className="text-2xl font-black uppercase mb-6 border-b-2 border-black pb-2 pr-10">
                    {language === 'en' ? 'Record Details' : 'Kayıt Detayları'}
                </h3>

                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 border-2 border-black">
                        <div className="text-sm font-bold text-gray-500 uppercase mb-1">Land UID</div>
                        <div className="text-xl font-black font-mono select-all">{selectedRecord.landUid}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-gray-500 uppercase">Owner Name</div>
                            <div className="font-bold text-lg">{selectedRecord.ownerName}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-gray-500 uppercase">Owner Address</div>
                            <div className="font-mono text-sm break-all">{selectedRecord.ownerAddress}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-gray-500 uppercase">Location</div>
                            <div className="font-bold">{selectedRecord.division}, {selectedRecord.district}</div>
                        </div>
                        <div className="space-y-1">
                             <div className="text-xs font-bold text-gray-500 uppercase">Survey No.</div>
                             <div className="font-bold">{selectedRecord.surveyNumber}</div>
                        </div>
                         <div className="space-y-1">
                             <div className="text-xs font-bold text-gray-500 uppercase">Area</div>
                             <div className="font-bold">{selectedRecord.area.value} {selectedRecord.area.unit}</div>
                        </div>
                         <div className="space-y-1">
                             <div className="text-xs font-bold text-gray-500 uppercase">Registration Date</div>
                             <div className="font-bold">{new Date(selectedRecord.registrationDate).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-xs font-bold text-gray-500 uppercase">GPS Coordinates</div>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-4 font-mono text-sm bg-gray-100 p-2 border border-black inline-block">
                                <span>Lat: {selectedRecord.gpsCoordinates.lat}</span>
                                <span>Lng: {selectedRecord.gpsCoordinates.lng}</span>
                            </div>
                            <a 
                                href={`https://maps.google.com/maps?q=${selectedRecord.gpsCoordinates.lat},${selectedRecord.gpsCoordinates.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white px-3 py-1.5 text-xs font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1 uppercase"
                            >
                                <MapPin size={14} /> Gmaps
                            </a>
                        </div>
                    </div>

                    <div className="space-y-2">
                         <div className="text-xs font-bold text-gray-500 uppercase">Document Hash</div>
                         <div className="font-mono text-xs break-all bg-gray-100 p-2 border border-black">
                            {selectedRecord.documentHash}
                         </div>
                    </div>

                     <div className="pt-4 border-t-2 border-dashed border-gray-300 flex justify-between items-center">
                        <div className="text-xs font-bold text-gray-500 uppercase">Status</div>
                         {selectedRecord.isVerified ? (
                            <NeoBadge variant="success">{t.verified}</NeoBadge>
                        ) : (
                            <NeoBadge variant="warning">{t.pending}</NeoBadge>
                        )}
                    </div>
                </div>
            </div>
        </div>
       )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase text-black">Government Dashboard (Sepolia)</h2>
        <NeoButton 
            onClick={refreshRecords} 
            variant="secondary"
            className="flex items-center gap-2"
        >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} /> Refresh Data
        </NeoButton>
      </div>

      <NeoCard className="p-0 overflow-hidden">
            <div className="p-6 border-b-2 border-black bg-neo-bg flex justify-between items-center">
                <h3 className="font-black uppercase flex items-center gap-2"><FileText size={20} /> Verification Queue</h3>
                <NeoBadge variant="warning">{pendingRecords.length} Pending</NeoBadge>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
                {pendingRecords.length === 0 ? (
                    <div className="p-8 text-center text-gray-600 font-bold uppercase">No pending verifications found on blockchain.</div>
                ) : (
                    pendingRecords.map((record) => (
                        <div 
                            key={record.landUid} 
                            onClick={() => setSelectedRecord(record)}
                            className="p-4 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center cursor-pointer hover:bg-yellow-50 transition-colors"
                        >
                            <div>
                                <p className="font-black uppercase">{record.landUid}</p>
                                <p className="text-xs font-bold text-gray-600">{record.district}, {record.division} | Owner: {record.ownerAddress.substring(0,6)}...</p>
                            </div>
                            <NeoButton 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    verifyRecord(record.landUid);
                                }}
                                variant="primary"
                                className="bg-neo-primary hover:bg-neo-primary-hover text-white px-4 py-2 text-sm flex items-center gap-1"
                            >
                                <ShieldCheck size={16} /> Approve
                            </NeoButton>
                        </div>
                    ))
                )}
            </div>
      </NeoCard>
    </div>
  );
};

export default AdminDashboard;