import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { TRANSLATIONS } from './constants';
import WalletConnect from './components/WalletConnect';
import LandRegistrationForm from './components/LandRegistrationForm';
import LandSearch from './components/LandSearch';
import AdminDashboard from './components/AdminDashboard';
import GovtRecords from './components/GovtRecords';
import TransactionStatus from './components/TransactionStatus';
import ToastContainer from './components/ToastContainer';
import { Home, PlusCircle, Search, Settings, Lock, Database } from 'lucide-react';
import logo from './images/logo.png';
import { ViewState } from './types';
import { NeoButton } from './components/NeoComponents';

const GOVT_ADDRESS = "0xa8E7dF4749Eb12fD056C4D256D01D6f1933655fE";

const AppContent: React.FC = () => {
  const { language, toggleLanguage, currentView, setCurrentView, wallet } = useApp();
  const t = TRANSLATIONS[language];

  const isGovt = wallet.address?.toLowerCase() === GOVT_ADDRESS.toLowerCase();
  
  // Redirect non-govt users if they try to access restricted views
  useEffect(() => {
    if (!isGovt && (currentView === 'admin' || currentView === 'search' || currentView === 'govt_records')) {
        // If they are on a restricted view, force them to register or home
        setCurrentView('register');
    }
  }, [currentView, isGovt, setCurrentView]);

  const renderView = () => {
    switch (currentView) {
      case 'register':
        return isGovt ? <AccessDenied /> : <LandRegistrationForm />;
      case 'search':
        return isGovt ? <LandSearch /> : <AccessDenied />;
      case 'admin':
        return isGovt ? <AdminDashboard /> : <AccessDenied />;
      case 'govt_records':
        return isGovt ? <GovtRecords /> : <AccessDenied />;
      case 'home':
      default:
        return (
          <div className="text-center py-20 space-y-8 animate-fade-in">
             <h1 className="text-5xl md:text-7xl font-black leading-none uppercase tracking-tighter">
               {language === 'en' ? 'Secure Land Registry' : 'Güvenli Arazi Kayıt Sistemi'}
             </h1>
             <p className="text-xl max-w-2xl mx-auto font-bold">
               <span className="bg-black text-white inline-block p-2">
               {language === 'en' 
                 ? "First decentralized land registry powered by BlockChain."
                 : "Blockchain teknolojisi ile güçlendirilmiş merkezi olmayan arazi kayıt sistemi."}
               </span>
             </p>
             <div className="flex justify-center gap-4 pt-8">
               {isGovt ? (
                 <>
                   <NeoButton 
                     variant="secondary"
                     onClick={() => setCurrentView('search')}
                     className="flex items-center gap-2"
                   >
                     <Search size={20} /> {t.navSearch}
                   </NeoButton>
                   <NeoButton 
                     variant="primary"
                     onClick={() => setCurrentView('govt_records')}
                     className="flex items-center gap-2"
                   >
                     <Database size={20} /> {t.navGovtRecords}
                   </NeoButton>
                 </>
               ) : (
                 <NeoButton 
                   variant="primary"
                   onClick={() => setCurrentView('register')}
                   className="flex items-center gap-2"
                 >
                   <PlusCircle size={20} /> {t.navRegister}
                 </NeoButton>
               )}
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neo-bg text-black">
      {/* Navbar */}
      <nav className="bg-white border-b-4 border-black p-4 mb-8 sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentView('home')}
          >
            {/* <img src={logo} alt="logo" className="w-16 h-16" /> */}
            <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter hidden md:block">
              LandChain
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <NavLink active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<Home size={18} />}>{t.navHome}</NavLink>
            
            {!isGovt && (
                <NavLink active={currentView === 'register'} onClick={() => setCurrentView('register')} icon={<PlusCircle size={18} />}>{t.navRegister}</NavLink>
            )}
            
            {/* Restricted Links */}
            {isGovt && (
                <>
                    <NavLink active={currentView === 'govt_records'} onClick={() => setCurrentView('govt_records')} icon={<Database size={18} />}>{t.navGovtRecords}</NavLink>
                    <NavLink active={currentView === 'search'} onClick={() => setCurrentView('search')} icon={<Search size={18} />}>{t.navSearch}</NavLink>
                    <NavLink active={currentView === 'admin'} onClick={() => setCurrentView('admin')} icon={<Settings size={18} />}>{t.navAdmin}</NavLink>
                </>
            )}
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={toggleLanguage}
               className="font-bold text-sm border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-colors uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
             >
               {language === 'en' ? 'TR' : 'EN'}
             </button>
             <WalletConnect />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderView()}
      </main>

      {/* Floating Elements */}
      <TransactionStatus />
      <ToastContainer />
    </div>
  );
};

const AccessDenied: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock size={64} className="mb-4 text-red-500" />
        <h2 className="text-3xl font-black uppercase">Access Denied</h2>
        <p className="font-bold">You do not have permission to view this page.</p>
    </div>
);

const NavLink: React.FC<{ children: React.ReactNode, active: boolean, onClick: () => void, icon: React.ReactNode }> = ({ children, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 font-bold uppercase tracking-wide border-b-2 transition-all ${
      active ? 'border-neo-primary text-neo-primary' : 'border-transparent hover:border-black'
    }`}
  >
    {icon}
    {children}
  </button>
);

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
