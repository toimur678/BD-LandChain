import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { NeoCard, NeoButton, NeoBadge } from './NeoComponents';
import { Search, ChevronLeft, ChevronRight, MapPin, User, FileText, X } from 'lucide-react';
import { LandRecord } from '../types';

const GovtRecords: React.FC = () => {
  const { language, landRecords, isLoading, refreshRecords } = useApp();
  const t = TRANSLATIONS[language];
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(5);
  const [selectedRecord, setSelectedRecord] = useState<LandRecord | null>(null);

  // Filter records
  const filteredRecords = landRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.landUid.toLowerCase().includes(searchLower) ||
      record.ownerName.toLowerCase().includes(searchLower) ||
      record.division.toLowerCase().includes(searchLower) ||
      record.district.toLowerCase().includes(searchLower) ||
      record.ownerAddress.toLowerCase().includes(searchLower)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

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

       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-black uppercase text-black">
            {language === 'en' ? 'Government Contract Records' : 'Resmi Sözleşme Kayıtları'}
        </h2>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder={language === 'en' ? 'Search records...' : 'Kayıtları ara...'}
                    className="w-full border-2 border-black p-2 pl-8 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-y-0.5 focus:shadow-none transition-all"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                    }}
                />
                <Search size={16} className="absolute left-2 top-3 text-gray-500" />
            </div>
            <NeoButton variant="secondary" onClick={refreshRecords}>
                {isLoading ? '...' : (language === 'en' ? 'Refresh' : 'Yenile')}
            </NeoButton>
        </div>
      </div>

      <NeoCard className="p-0 overflow-hidden min-h-[400px]">
        <div className="p-4 border-b-2 border-black bg-neo-bg flex justify-between items-center">
             <div className="font-black uppercase flex items-center gap-2">
                <FileText size={20} />
                {language === 'en' ? `Total Records: ${filteredRecords.length}` : `Toplam Kayıt: ${filteredRecords.length}`}
             </div>
             <div className="text-sm font-bold text-gray-600">
                Page {currentPage} of {totalPages === 0 ? 1 : totalPages}
             </div>
        </div>

        <div className="divide-y-2 divide-black">
            {currentItems.length === 0 ? (
                <div className="p-10 text-center font-bold text-gray-500 uppercase">
                    {language === 'en' ? 'No records found matching your criteria.' : 'Kriterlerinize uygun kayıt bulunamadı.'}
                </div>
            ) : (
                currentItems.map((record) => (
                    <div 
                        key={record.landUid} 
                        onClick={() => setSelectedRecord(record)}
                        className="p-4 hover:bg-yellow-50 transition-colors cursor-pointer"
                    >
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-black bg-black text-white px-2 py-0.5 text-sm">{record.landUid}</span>
                                    {record.isVerified ? (
                                        <NeoBadge variant="success">{t.verified}</NeoBadge>
                                    ) : (
                                        <NeoBadge variant="warning">{t.pending}</NeoBadge>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2 font-bold text-gray-700">
                                        <User size={14} /> 
                                        {record.ownerName} ({record.ownerAddress.substring(0, 6)}...{record.ownerAddress.substring(38)})
                                    </div>
                                    <div className="flex items-center gap-2 font-bold text-gray-700">
                                        <MapPin size={14} /> 
                                        {record.division}, {record.district}, {record.surveyNumber}
                                    </div>
                                </div>
                                <div className="text-xs font-mono text-gray-500 truncate">
                                    Doc Hash: {record.documentHash}
                                </div>
                            </div>
                            
                            <div className="flex flex-col justify-center items-end min-w-[120px] text-right">
                                <div className="font-black text-xl">
                                    {record.area.value} <span className="text-sm font-bold text-gray-600">{record.area.unit}</span>
                                </div>
                                <div className="text-xs font-bold text-gray-500">
                                    {new Date(record.registrationDate).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="p-4 border-t-2 border-black bg-gray-50 flex justify-center items-center gap-4">
                <button 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border-2 border-black hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-black transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                
                <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 font-bold border-2 border-black transition-all ${
                                currentPage === page 
                                ? 'bg-neo-primary text-white' 
                                : 'hover:bg-black hover:text-white'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border-2 border-black hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-black transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}
      </NeoCard>
    </div>
  );
};

export default GovtRecords;
