import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ethers } from 'ethers';
import { Language, WalletState, LandRecord, Transaction, ViewState } from '../types';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../src/contractConfig';

// Toast types for notifications
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  txHash?: string;
  duration?: number;
}

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
  updateTransactionStatus: (hash: string, status: 'confirmed' | 'failed', landUid?: string) => void;
  addLandRecord: (record: LandRecord) => void;
  // Toast system
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  hideToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [landRecords, setLandRecords] = useState<LandRecord[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: '0',
    isConnected: false
  });

  // Toast functions
  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after duration (default 5 seconds, 8 for success with tx)
    const duration = toast.duration || (toast.txHash ? 8000 : 5000);
    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Check for existing wallet connection
  useEffect(() => {
    if (window.ethereum) {
        connectWallet(); // Force connect on launch
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length > 0) connectWallet();
            else disconnectWallet();
        });
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'tr' : 'en');
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
        showToast({
          type: 'error',
          title: 'MetaMask Required',
          message: 'Please install MetaMask browser extension to continue.'
        });
        return;
    }
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Check if we're on Sepolia network (Chain ID: 11155111)
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        
        // If not on Sepolia, request network switch
        if (chainId !== 11155111) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
                });
                showToast({
                    type: 'success',
                    title: 'Network Switched',
                    message: 'Connected to Sepolia Test Network'
                });
            } catch (switchError: any) {
                // This error code indicates that the chain has not been added to MetaMask
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0xaa36a7',
                                chainName: 'Sepolia test network',
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: ['https://sepolia.infura.io/v3/'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io']
                            }]
                        });
                    } catch (addError) {
                        showToast({
                            type: 'error',
                            title: 'Network Error',
                            message: 'Please add Sepolia network to MetaMask manually.'
                        });
                        return;
                    }
                } else {
                    showToast({
                        type: 'warning',
                        title: 'Wrong Network',
                        message: 'Please switch to Sepolia Test Network in MetaMask.'
                    });
                    return;
                }
            }
        }
        
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
    
    // 1. Validation: Ensure Area is greater than 0 to prevent contract reverts
    if (!data.areaValue || Number(data.areaValue) <= 0) {
        showToast({
          type: 'error',
          title: 'Validation Error',
          message: 'Please enter a valid area size.'
        });
        return false;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Verify we're on Sepolia before attempting transaction
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== 11155111) {
            showToast({
                type: 'error',
                title: 'Wrong Network',
                message: 'Please switch to Sepolia Test Network in MetaMask before submitting.'
            });
            return false;
        }
        
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const gpsString = `${data.lat},${data.lng}`;
        // Generate a random IPFS hash if one wasn't provided (for demo purposes)
        const mockIpfsHash = "Qm" + Math.random().toString(36).substring(7);
        
        // Add a unique timestamp suffix to surveyNo to allow multiple registrations
        // of the same land by different owners (same property can be sold to multiple people)
        const uniqueSurveyNo = `${data.surveyNo}-${Date.now().toString(36)}`;

        // 2. THE FIX: Add Manual Gas Limit
        // We force the gas limit to 500,000 (standard write is ~200k) to prevent 
        // MetaMask from failing the estimation.
        const tx = await contract.registerLand(
            data.division,
            data.district,
            uniqueSurveyNo,
            Number(data.areaValue), // Ensure this is not 0
            data.areaUnit,
            gpsString,
            mockIpfsHash,
            { 
              gasLimit: 500000 // <--- THIS SOLVES THE "INSUFFICIENT FUNDS" ERROR
            }
        );

        addTransaction({
            hash: tx.hash,
            from: wallet.address!,
            to: CONTRACT_ADDRESS,
            landUid: "Pending...",
            status: 'pending',
            timestamp: Date.now()
        });

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        
        // Update transaction status to confirmed
        updateTransactionStatus(tx.hash, 'confirmed');
        
        await refreshRecords();
        
        // Show success toast
        showToast({
          type: 'success',
          title: 'Land Registered Successfully',
          message: 'Your land registration has been confirmed on the blockchain.',
          txHash: tx.hash
        });
        
        return true;
    } catch (error: any) {
        console.error("Registration failed:", error);
        
        // Update transaction status to failed if we have a hash
        const errorMessage = error?.reason || error?.message || 'Transaction failed. Please try again.';
        
        showToast({
          type: 'error',
          title: 'Registration Failed',
          message: errorMessage.length > 100 ? errorMessage.substring(0, 100) + '...' : errorMessage
        });
        return false;
    }
  };

  const verifyRecord = async (uid: string): Promise<boolean> => {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const tx = await contract.verifyLand(uid);
        
        showToast({
          type: 'info',
          title: 'Verification Pending',
          message: `Verifying land record ${uid}...`,
          txHash: tx.hash
        });
        
        await tx.wait();
        await refreshRecords();
        
        showToast({
          type: 'success',
          title: 'Verification Complete',
          message: `Land record ${uid} has been verified successfully.`,
          txHash: tx.hash
        });
        
        return true;
    } catch (error: any) {
        console.error("Verification failed:", error);
        
        const errorMessage = error?.reason || 'Only the Government wallet can verify records.';
        
        showToast({
          type: 'error',
          title: 'Verification Failed',
          message: errorMessage
        });
        return false;
    }
  };

  // Helpers for compatibility with existing components
  const addTransaction = (tx: Transaction) => setRecentTransactions(prev => [tx, ...prev]);
  
  const updateTransactionStatus = (hash: string, status: 'confirmed' | 'failed', landUid?: string) => {
    setRecentTransactions(prev => 
      prev.map(tx => 
        tx.hash === hash 
          ? { ...tx, status, ...(landUid ? { landUid } : {}) }
          : tx
      )
    );
  };
  
  const addLandRecord = (record: LandRecord) => setLandRecords(prev => [record, ...prev]);

  return (
    <AppContext.Provider value={{
      language, toggleLanguage, wallet, connectWallet, disconnectWallet,
      currentView, setCurrentView, landRecords, refreshRecords,
      registerLand, verifyRecord, isLoading, recentTransactions, addTransaction, updateTransactionStatus, addLandRecord,
      toasts, showToast, hideToast
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