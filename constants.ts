import { LandRecord, Transaction } from './types';

export const TRANSLATIONS = {
  en: {
    appTitle: "BD LandChain",
    connectWallet: "Connect Wallet",
    disconnect: "Disconnect",
    navHome: "Home",
    navRegister: "Register Land",
    navSearch: "Search Records",
    navAdmin: "Admin Dashboard",
    step1: "Property Details",
    step2: "Owner Information",
    step3: "Document Upload",
    step4: "Review & Submit",
    next: "Next",
    back: "Back",
    submit: "Submit to Blockchain",
    division: "Division",
    district: "District",
    surveyNo: "Survey No (CS/SA/RS)",
    area: "Area Size",
    unit: "Unit",
    lat: "Latitude",
    lng: "Longitude",
    ownerName: "Owner Name",
    nid: "National ID No",
    uploadDeed: "Upload Title Deed (PDF/Image)",
    reviewTitle: "Review Information",
    searchPlaceholder: "Enter Land UID, Owner Address, or Survey No",
    searchButton: "Verify Land",
    verified: "Verified",
    pending: "Pending Verification",
    ownershipHistory: "Ownership History",
    redFlag: "RED FLAG: Suspicious Activity Detected",
    adminQueue: "Verification Queue",
    approve: "Approve",
    reject: "Reject",
    gasFee: "Est. Gas Fee",
  },
  bn: {
    appTitle: "বিডি ল্যান্ডচেইন",
    connectWallet: "ওয়ালেট সংযুক্ত করুন",
    disconnect: "বিচ্ছিন্ন করুন",
    navHome: "হোম",
    navRegister: "জমি নিবন্ধন",
    navSearch: "রেকর্ড অনুসন্ধান",
    navAdmin: "অ্যাডমিন ড্যাশবোর্ড",
    step1: "সম্পত্তির বিবরণ",
    step2: "মালিকের তথ্য",
    step3: "নথি আপলোড",
    step4: "পর্যালোচনা ও জমা দিন",
    next: "পরবর্তী",
    back: "ফিরে যান",
    submit: "ব্লকচেইনে জমা দিন",
    division: "বিভাগ",
    district: "জেলা",
    surveyNo: "খতিয়ান নং (CS/SA/RS)",
    area: "জমির পরিমাণ",
    unit: "একক",
    lat: "অক্ষাংশ",
    lng: "দ্রাঘিমাংশ",
    ownerName: "মালিকের নাম",
    nid: "জাতীয় পরিচয়পত্র নং",
    uploadDeed: "দলিলাদি আপলোড করুন (PDF/Image)",
    reviewTitle: "তথ্য পর্যালোচনা করুন",
    searchPlaceholder: "জমির ইউআইডি, মালিকের ঠিকানা বা খতিয়ান নং",
    searchButton: "যাচাই করুন",
    verified: "যাচাইকৃত",
    pending: "যাচাইকরণ বাকি",
    ownershipHistory: "মালিকানার ইতিহাস",
    redFlag: "সতর্কতা: সন্দেহজনক কার্যকলাপ সনাক্ত হয়েছে",
    adminQueue: "যাচাইকরণ তালিকা",
    approve: "অনুমোদন",
    reject: "প্রত্যাখ্যান",
    gasFee: "আনুমানিক গ্যাস ফি",
  }
};

export const MOCK_LAND_RECORDS: LandRecord[] = [
  {
    landUid: "LND-8829-DHK",
    ownerAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    ownerName: "Rahim Uddin",
    surveyNumber: "CS-1029",
    division: "Dhaka",
    district: "Gulshan",
    area: { value: 5, unit: "katha" },
    gpsCoordinates: { lat: 23.7925, lng: 90.4078 },
    documentHash: "QmHash123...",
    registrationDate: 1672531200000,
    isVerified: true,
    history: [
      { from: "0x000...", to: "0x71C...", date: 1672531200000, hash: "0xTx1..." }
    ]
  },
  {
    landUid: "LND-1102-CTG",
    ownerAddress: "0x32A...",
    ownerName: "Karim Khan",
    surveyNumber: "RS-5541",
    division: "Chittagong",
    district: "Agrabad",
    area: { value: 2, unit: "bigha" },
    gpsCoordinates: { lat: 22.3569, lng: 91.7832 },
    documentHash: "QmHash456...",
    registrationDate: 1680307200000,
    isVerified: false
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    hash: "0xabc...123",
    from: "0xUser1...",
    to: "0xGov...",
    landUid: "LND-NEW-01",
    status: "confirmed",
    timestamp: Date.now() - 50000
  },
  {
    hash: "0xdef...456",
    from: "0xUser2...",
    to: "0xGov...",
    landUid: "LND-NEW-02",
    status: "pending",
    timestamp: Date.now()
  }
];
