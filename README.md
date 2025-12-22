# LandChain 🏡⛓️

A decentralized land registry system powered by blockchain technology, featuring dual-language support (English/Turkish), wallet integration, OCR document scanning, and fraud detection capabilities.

## 🌟 Features

### Core Functionality
- **Blockchain Integration**: Built on Ethereum (Sepolia testnet) using Ethers.js
- **Land Registration**: Register land parcels with detailed property information
- **Ownership Verification**: Search and verify land ownership on the blockchain
- **Government Dashboard**: Admin panel for verifying and managing land records
- **Transaction Tracking**: Real-time transaction status monitoring

### User Experience
- **Dual Language Support**: Seamless switching between English and Turkish
- **Neo-Brutalism UI**: Modern, bold design with Tailwind CSS
- **Wallet Integration**: MetaMask wallet connectivity
- **OCR Document Scanning**: Extract text from land documents using Tesseract.js
- **Responsive Design**: Works on desktop and mobile devices

### Security & Access Control
- **Role-Based Access**: Separate interfaces for citizens and government officials
- **Fraud Detection**: Red flag system for suspicious activities
- **Immutable Records**: All land records stored on blockchain
- **Document Hashing**: IPFS-style document verification

## 🛠️ Tech Stack

- **Frontend**: React 19.2.3 + TypeScript
- **Build Tool**: Vite 6.2.0
- **Blockchain**: Ethers.js 6.16.0 (Ethereum/Sepolia)
- **UI Framework**: Tailwind CSS (CDN)
- **Icons**: Lucide React
- **OCR**: Tesseract.js 7.0.0
- **Charts**: Recharts 3.6.0

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **MetaMask** browser extension installed
- **Sepolia ETH** (free testnet tokens for transactions)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/toimur678/LandChain.git
cd LandChain
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment (Optional)
If you need to use Gemini API for AI features, create a `.env` file:
```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Smart Contract Configuration
The project is pre-configured with a deployed smart contract on Sepolia:
- **Contract Address**: `0xfc1975B18A2905B18f1dC297D4236A61470e874E`
- **Network**: Sepolia Testnet
- Configuration file: `src/contractConfig.ts`

### 5. Run the Development Server
```bash
npm run dev
```

The application will start at `http://localhost:3000`

### 6. Build for Production
```bash
npm run build
```

### 7. Preview Production Build
```bash
npm run preview
```

## 🔧 Configuration

### MetaMask Setup
1. Install MetaMask browser extension
2. Switch to **Sepolia Test Network**
3. Get free Sepolia ETH from a faucet (e.g., https://sepoliafaucet.com)
4. Click "Connect Wallet" in the app

### Government Access
To access admin features, use the configured government wallet:
- **Address**: `0xa8E7dF4749Eb12fD056C4D256D01D6f1933655fE` or use your own.

## 📁 Project Structure

```
LandChain/
├── components/           # React components
│   ├── AdminDashboard.tsx
│   ├── GovtRecords.tsx
│   ├── LandRegistrationForm.tsx
│   ├── LandSearch.tsx
│   ├── NeoComponents.tsx
│   ├── TransactionStatus.tsx
│   └── WalletConnect.tsx
├── context/
│   └── AppContext.tsx    # Global state management
├── src/
│   └── contractConfig.ts # Smart contract ABI & address
├── images/               # Static assets
├── App.tsx              # Main application component
├── constants.ts         # Translations & mock data
├── types.ts            # TypeScript interfaces
├── index.tsx           # Application entry point
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```

## 🎯 Usage

### For Citizens
1. **Connect Wallet**: Click "Çüzdan Bağla" / "Connect Wallet"
2. **Register Land**: Navigate to "Arazi Kaydı" / "Register Land"
   - Fill in property details (location, area, GPS coordinates)
   - Add owner information
   - Upload land deed documents (optional OCR scanning)
   - Review and submit to blockchain
3. **Track Transactions**: View real-time transaction status

### For Government Officials
1. **Connect Government Wallet**: Use the authorized government address
2. **View All Records**: Access "Tüm Kayıtlar" / "All Records"
3. **Search Records**: Use "Kayıt Ara" / "Search Records" to verify ownership
4. **Verify Land**: Approve pending registrations from the admin dashboard

## 🌍 Supported Languages

- 🇬🇧 English
- 🇹🇷 Türkçe (Turkish)

Toggle between languages using the language switcher in the navigation bar.

## 📊 Land Area Units

The system supports Turkish land measurement units:
- **Metrekare (m²)**: Square meters
- **Dönüm**: Traditional Turkish unit (~1,000 m²)
- **Hektar**: Hectares (10,000 m²)

## 🔐 Smart Contract Functions

- `registerLand()`: Register a new land parcel
- `verifyLand()`: Government verification of land records
- `getLandCount()`: Get total number of registered lands
- `getLandByIndex()`: Retrieve land record by index

## 🐛 Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed and unlocked
- Switch to Sepolia Test Network
- Refresh the page and try reconnecting

### Transaction Failures
- Check you have sufficient Sepolia ETH
- Ensure all required fields are filled
- Verify you're on the correct network

### Gas Limit Errors
The app uses manual gas limits (500,000) to prevent estimation errors.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- **Repository**: https://github.com/toimur678/LandChain
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Contract Address**: `0xfc1975B18A2905B18f1dC297D4236A61470e874E` or use your own.

## 👨‍💻 Developer

**Toimur678**
- GitHub: [@toimur678](https://github.com/toimur678)

---

Built with ❤️ using React, TypeScript, and Blockchain Technology
