import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { Language, WalletState, LandRecord, Transaction, ViewState } from '../types';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../src/contractConfig';

interface AppContextType {
  language: Language;
  toggleLanguage: () => void;
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  landRecords: LandRecord[];
  refreshRecords: () => Promise<void>;
  registerLand: (data: any) => Promise<boolean>;
  verifyRecord: (uid: string) => Promise<boolean>;
  isLoading: boolean;
  recentTransactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  addLandRecord: (record: LandRecord) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [landRecords, setLandRecords] = useState<LandRecord[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: '0',
    isConnected: false
  });

  // Check for existing wallet connection
  useEffect(() => {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length > 0) connectWallet();
            else disconnectWallet();
        });
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        
        setWallet({
            address,
            balance: ethers.formatEther(balance).substring(0, 6),
            isConnected: true
        });
        await refreshRecords();
    } catch (error) {
        console.error("Connection failed", error);
    }
  };

  const disconnectWallet = () => {
    setWallet({ address: null, balance: '0', isConnected: false });
  };

  // Fetch all records from Blockchain
  const refreshRecords = async () => {
    if (!window.ethereum) return;
    setIsLoading(true);
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        const count = await contract.getLandCount();
        const records: LandRecord[] = [];

        // Loop through all records
        for (let i = 0; i < Number(count); i++) {
            const record = await contract.getLandByIndex(i);
            records.push({
                landUid: record.landUid,
                ownerAddress: record.owner,
                ownerName: "Blockchain User", 
                surveyNumber: record.surveyNumber,
                division: record.division,
                district: record.district,
                area: { value: Number(record.areaValue), unit: record.areaUnit as any },
                gpsCoordinates: { 
                    lat: Number(record.gpsCoordinates.split(',')[0]), 
                    lng: Number(record.gpsCoordinates.split(',')[1]) 
                },
                documentHash: record.documentHash,
                registrationDate: Number(record.registrationDate) * 1000,
                isVerified: record.isVerified
            });
        }
        setLandRecords(records);
    } catch (error) {
        console.error("Error fetching records:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const registerLand = async (data: any): Promise<boolean> => {
    if (!wallet.isConnected) return false;
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const gpsString = `${data.lat},${data.lng}`;
        const mockIpfsHash = "Qm" + Math.random().toString(36).substring(7);

        const tx = await contract.registerLand(
            data.division,
            data.district,
            data.surveyNo,
            Number(data.areaValue),
            data.areaUnit,
            gpsString,
            mockIpfsHash
        );
        
        // Add pending transaction to UI immediately
        addTransaction({
            hash: tx.hash,
            from: wallet.address!,
            to: CONTRACT_ADDRESS,
            landUid: "Pending...",
            status: 'pending',
            timestamp: Date.now()
        });

        await tx.wait(); // Wait for mining
        await refreshRecords();
        return true;
    } catch (error) {
        console.error("Registration failed:", error);
        alert("Transaction Failed! See console for details.");
        return false;
    }
  };

  const verifyRecord = async (uid: string): Promise<boolean> => {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const tx = await contract.verifyLand(uid);
        await tx.wait();
        await refreshRecords();
        return true;
    } catch (error) {
        console.error("Verification failed:", error);
        alert("Verification Failed. Only the 'Govt' wallet can verify records.");
        return false;
    }
  };

  // Helpers for compatibility with existing components
  const addTransaction = (tx: Transaction) => setRecentTransactions(prev => [tx, ...prev]);
  const addLandRecord = (record: LandRecord) => setLandRecords(prev => [record, ...prev]);

  return (
    <AppContext.Provider value={{
      language, toggleLanguage, wallet, connectWallet, disconnectWallet,
      currentView, setCurrentView, landRecords, refreshRecords,
      registerLand, verifyRecord, isLoading, recentTransactions, addTransaction, addLandRecord
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};