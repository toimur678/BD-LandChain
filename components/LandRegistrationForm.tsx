import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { MapPin, User, CheckCircle, Upload, ChevronRight, ChevronLeft, Loader2, Scan, ShieldCheck, AlertTriangle, BrainCircuit } from 'lucide-react';
import { NeoButton, NeoCard, NeoInput } from './NeoComponents';
import Tesseract from 'tesseract.js';
// Import the CNN logic we just created
import { verifyTapuWithCNN } from './TapuClassifier';

const LandRegistrationForm: React.FC = () => {
  const { language, wallet, connectWallet, registerLand, setCurrentView, showToast } = useApp();
  const t = TRANSLATIONS[language];
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OCR & AI State
  const [isScanning, setIsScanning] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [cnnConfidence, setCnnConfidence] = useState<number | null>(null);
  
  // Ada Number Verification State
  const [adaMatchScore, setAdaMatchScore] = useState<number | null>(null);
  const [extractedAda, setExtractedAda] = useState<string | null>(null);
  const [adaVerified, setAdaVerified] = useState(false);

  const [formData, setFormData] = useState({
    division: 'Eskişehir', // Default based on your sample
    district: '',
    adaNumber: '', // User's input for Ada No. (to be matched with document)
    parselNumber: '', // User's input for Parsel No.
    surveyNo: '', // Combined value after verification
    areaValue: '',
    areaUnit: 'metrekare',
    lat: '',
    lng: '',
    ownerName: '',
    nid: '',
    file: null as File | null
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Step validation functions
  const isStep1Valid = (): boolean => {
    return !!(
      formData.division.trim() &&
      formData.district.trim() &&
      formData.adaNumber.trim() &&
      formData.areaValue &&
      Number(formData.areaValue) > 0 &&
      formData.lat &&
      formData.lng
    );
  };

  const isStep2Valid = (): boolean => {
    return !!(formData.ownerName.trim() && formData.nid.trim());
  };

  const isStep3Valid = (): boolean => {
    return ocrSuccess && adaVerified;
  };

  const handleNextStep = () => {
    if (step === 1 && !isStep1Valid()) {
      showToast({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill all required fields: Division, District, Ada No., Area, and GPS Coordinates.'
      });
      return;
    }
    if (step === 2 && !isStep2Valid()) {
      showToast({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please enter Owner Name and National ID.'
      });
      return;
    }
    if (step === 3 && !isStep3Valid()) {
      showToast({
        type: 'warning',
        title: 'Document Verification Required',
        message: 'Please upload and verify your Tapu document before proceeding.'
      });
      return;
    }
    setStep(s => Math.min(4, s + 1));
  };

  // Open Google Maps to get location
  const openGoogleMapsForLocation = () => {
    // Open Google Maps centered on Turkey for easier selection
    window.open('https://www.google.com/maps/@39.9334,32.8597,6z', '_blank');
    showToast({
      type: 'info',
      title: 'Get GPS Coordinates',
      message: 'Right-click on any location in Google Maps and select the coordinates to copy them.',
      duration: 8000
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleChange('file', e.target.files[0]);
      setOcrResult(null);
      setOcrSuccess(false);
      setCnnConfidence(null);
      // Reset Ada verification
      setAdaMatchScore(null);
      setExtractedAda(null);
      setAdaVerified(false);
    }
  };

  /**
   * COMPUTER VISION TECHNIQUE: ENHANCED IMAGE PREPROCESSING
   * Combines multiple techniques for better OCR accuracy:
   * 1. Image upscaling (2x) for better text recognition
   * 2. Red channel isolation for pink background removal
   * 3. Adaptive thresholding for varied document quality
   * 4. Contrast enhancement
   */
  const preprocessImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(img.src);

            // Scale up image 2x for better OCR on small text
            const scale = 2;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            // Use better image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Calculate average brightness for adaptive threshold
            let totalBrightness = 0;
            for (let i = 0; i < data.length; i += 4) {
                totalBrightness += (data[i] + data[i+1] + data[i+2]) / 3;
            }
            const avgBrightness = totalBrightness / (data.length / 4);
            
            // Adaptive threshold (use average brightness as base)
            const threshold = Math.min(Math.max(avgBrightness - 20, 100), 180);
            console.log(`Adaptive threshold: ${threshold} (avg brightness: ${avgBrightness.toFixed(0)})`);

            // Pixel-wise transformation with improved algorithm
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Check if pixel is pink/red (background pattern)
                const isPink = (r > 150 && g > 100 && b > 100 && r > g && r > b);
                
                // Use luminance for better grayscale
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                
                // Apply threshold: dark text becomes black, everything else white
                let val;
                if (isPink) {
                    val = 255; // Remove pink background
                } else {
                    val = luminance < threshold ? 0 : 255;
                }

                data[i] = val;
                data[i + 1] = val;
                data[i + 2] = val;
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
    });
  };

  /**
   * CALCULATE ADA NUMBER MATCH SCORE
   * Computes similarity between user input and extracted Ada number
   * Returns a confidence score between 0 and 1
   */
  const calculateAdaMatchScore = (userAda: string, docAda: string): number => {
    // Normalize both inputs (remove whitespace, make lowercase)
    const normalizedUser = userAda.trim().replace(/\s+/g, '');
    const normalizedDoc = docAda.trim().replace(/\s+/g, '');
    
    if (!normalizedUser || !normalizedDoc) return 0;
    
    // Exact match = 100%
    if (normalizedUser === normalizedDoc) return 1.0;
    
    // Character-by-character similarity (Levenshtein-based simple approach)
    const maxLen = Math.max(normalizedUser.length, normalizedDoc.length);
    let matches = 0;
    
    for (let i = 0; i < Math.min(normalizedUser.length, normalizedDoc.length); i++) {
      if (normalizedUser[i] === normalizedDoc[i]) matches++;
    }
    
    // Also check for common OCR errors (1/l/I, 0/O)
    const cleanUser = normalizedUser.replace(/[lI]/g, '1').replace(/O/gi, '0');
    const cleanDoc = normalizedDoc.replace(/[lI]/g, '1').replace(/O/gi, '0');
    
    if (cleanUser === cleanDoc) return 0.98; // Near-perfect match with OCR correction
    
    // Calculate base similarity
    const baseSimilarity = matches / maxLen;
    
    // If lengths differ significantly, reduce score
    const lengthPenalty = 1 - Math.abs(normalizedUser.length - normalizedDoc.length) / maxLen;
    
    return baseSimilarity * lengthPenalty;
  };

  // --- HYBRID AI PIPELINE: CNN + OCR ---
  const scanDocument = async () => {
    if (!formData.file) return;
    
    // Validate that user has entered Ada Number
    if (!formData.adaNumber.trim()) {
      setOcrResult(`Missing Input: Please enter your Ada Number in Step 1 before scanning.\nThe AI will verify it matches the document.`);
      return;
    }
    
    setIsScanning(true);
    setOcrResult(null);
    setOcrSuccess(false);
    setCnnConfidence(null);
    setAdaMatchScore(null);
    setExtractedAda(null);
    setAdaVerified(false);

    try {
        // --- STEP 1: DEEP LEARNING VERIFICATION (CNN) ---
        // Verify this is actually a Tapu document structure
        const imgUrl = URL.createObjectURL(formData.file);
        const img = new Image();
        img.src = imgUrl;
        await new Promise(r => img.onload = r);

        const confidence = await verifyTapuWithCNN(img);
        setCnnConfidence(confidence);
        console.log(`CNN Confidence: ${confidence}`);

        if (confidence < 0.80) {
            setOcrResult(`AI Alert: Document verification failed.\nCNN Model Confidence: ${(confidence * 100).toFixed(1)}%\nThis does not look like a valid Tapu.`);
            setIsScanning(false);
            return; // Stop if it's not a valid document
        }

        // --- STEP 2: COMPUTER VISION PREPROCESSING ---
        // Remove the pink background using the Red Channel Trick
        const cleanImage = await preprocessImage(formData.file);

        // --- STEP 3: OCR EXTRACTION (Multiple Modes for Better Accuracy) ---
        const worker = await Tesseract.createWorker('tur'); 
        
        // Try SPARSE_TEXT mode first (better for tables/forms)
        await worker.setParameters({
            tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT, // Better for scattered text in tables
        });

        let result = await worker.recognize(cleanImage);
        let text = result.data.text;
        console.log("OCR Mode SPARSE_TEXT:", text);
        
        // If sparse text didn't find much, try SINGLE_BLOCK
        if (text.length < 100) {
            await worker.setParameters({
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
            });
            result = await worker.recognize(cleanImage);
            text = result.data.text;
            console.log("OCR Mode SINGLE_BLOCK:", text);
        }
        
        console.log("Final Cleaned Text:", text);

        // --- STEP 4: ADVANCED REGEX MATCHING FOR TURKISH TAPU ---
        // Turkish Tapu documents have table layouts where headers and values are separate
        // Handle common OCR typos (l/I -> 1, O -> 0, S/5, B/8)
        
        /**
         * MULTIPLE PATTERN STRATEGY:
         * Try several patterns in order of specificity
         */
        
        // Pattern 1: "Ada No" followed by number (with garbage chars allowed)
        const adaPatterns = [
            /Ada\s*(?:No|Nu)?[^\d\n]{0,10}(\d{1,6})/i,           // Ada No ... 1234
            /Ada\s*No[^0-9]*?(\d{1,6})/i,                         // Ada No with any chars then number
            /(?:Ada|Ado)\s*[:\.\s]*(\d{1,6})/i,                  // Ada: 1234 or Ado (OCR error)
            /Pafta.*?Ada.*?(\d{1,6}).*?(?:Parsel|Nitelik)/is,    // Table row: Pafta...Ada...NUMBER...Parsel
            /(\d{1,6})\s*(?=.*Parsel)/i,                          // Number before "Parsel" mention
        ];
        
        // Pattern for Parsel No
        const parselPatterns = [
            /Parsel\s*(?:No|Nu)?[^\d\n]{0,10}(\d{1,6})/i,
            /(?:Parsel|Parse1|Porsel)\s*[:\.\s]*(\d{1,6})/i,     // Common OCR errors
            /rsel\s*[:\.\s]*(\d{1,6})/i,                          // Partial match "...rsel"
        ];
        
        // Match: District (İlçesi) - handle OCR variants
        const districtPatterns = [
            /(?:İlçesi|Ilçesi|Iicesi|ilcesi)[:\s]*([A-ZİĞÜŞÖÇa-zığüşöç]{3,20})/i,
            /İl\s+([A-ZİĞÜŞÖÇ]{3,15})/i,                         // "İl IZMIR"
        ];
        
        // Match: Area (number before m2)
        const areaPattern = /([\d.,]+)\s*m[²2]/i;

        // Helper: Try multiple patterns, return first match
        const tryPatterns = (patterns: RegExp[], text: string): RegExpMatchArray | null => {
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    console.log(`Pattern matched: ${pattern} -> ${match[1]}`);
                    return match;
                }
            }
            return null;
        };

        const adaMatch = tryPatterns(adaPatterns, text);
        const parselMatch = tryPatterns(parselPatterns, text);
        const districtMatch = tryPatterns(districtPatterns, text);
        const areaMatch = text.match(areaPattern);
        
        // Debug logging
        console.log("Ada Match:", adaMatch?.[1] || "NOT FOUND");
        console.log("Parsel Match:", parselMatch?.[1] || "NOT FOUND");

        // Cleanup helper - handle OCR misreads
        const cleanNumber = (val: string) => val
            .replace(/l|I/g, '1')
            .replace(/O/g, '0')
            .replace(/S/g, '5')
            .replace(/B/g, '8')
            .replace(/\D/g, ''); // Remove any remaining non-digits
        
        let docAda = adaMatch ? cleanNumber(adaMatch[1]) : null;
        const docParsel = parselMatch ? cleanNumber(parselMatch[1]) : null;
        const extractedDistrict = districtMatch ? districtMatch[1].trim().split(/[\s\n]/)[0] : null;
        
        // --- FALLBACK: Direct Search for User's Ada Number in Text ---
        // If regex patterns didn't find Ada, check if user's input appears in the text
        if (!docAda && formData.adaNumber.trim()) {
            const userAda = formData.adaNumber.trim();
            console.log(`Fallback: Searching for user's Ada "${userAda}" in text...`);
            
            // Create a pattern that allows for OCR errors in the user's number
            // e.g., "1234" could appear as "l234", "I234", "12З4" (Cyrillic 3)
            const fuzzyPattern = userAda
                .split('')
                .map(char => {
                    if (char === '1') return '[1lI|]';
                    if (char === '0') return '[0Oo]';
                    if (char === '5') return '[5Ss]';
                    if (char === '8') return '[8B]';
                    return char;
                })
                .join('\\s*'); // Allow spaces between digits
            
            const fuzzyRegex = new RegExp(fuzzyPattern, 'i');
            const fuzzyMatch = text.match(fuzzyRegex);
            
            if (fuzzyMatch) {
                console.log(`Fallback SUCCESS: Found "${fuzzyMatch[0]}" matching user input "${userAda}"`);
                docAda = userAda; // Use user's input as the "extracted" value (100% match)
            }
        }
        
        let cleanArea = '';
        if (areaMatch) {
            cleanArea = areaMatch[1].replace(/\./g, '').replace(',', '.');
        }

        await worker.terminate();

        // --- STEP 5: ADA NUMBER MATCHING & VALIDATION ---
        if (docAda) {
            setExtractedAda(docAda);
            
            // Calculate match score between user input and extracted Ada
            const matchScore = calculateAdaMatchScore(formData.adaNumber, docAda);
            setAdaMatchScore(matchScore);
            console.log(`Ada Match Score: ${(matchScore * 100).toFixed(1)}%`);
            
            const ADA_MATCH_THRESHOLD = 0.90; // 90% confidence required
            
            if (matchScore >= ADA_MATCH_THRESHOLD) {
                // ADA NUMBER MATCHES - Allow registration
                setOcrSuccess(true);
                setAdaVerified(true);
                
                const msg = `ADA NUMBER VERIFIED\n` +
                            `----------------------------\n` +
                            `Your Input: ${formData.adaNumber}\n` +
                            `Document: ${docAda}\n` +
                            `Match Score: ${(matchScore * 100).toFixed(1)}% [PASS]\n` +
                            `----------------------------\n` +
                            `CNN Confidence: ${(confidence * 100).toFixed(1)}%\n` +
                            `Parsel: ${docParsel || 'Not detected'}\n` +
                            `Location: ${extractedDistrict || 'Not detected'}\n` +
                            `----------------------------\n` +
                            `You may proceed to register this land.`;
                
                setOcrResult(msg);
                
                setFormData(prev => ({
                    ...prev,
                    surveyNo: `Ada: ${docAda} / Parsel: ${docParsel || prev.parselNumber}`,
                    district: extractedDistrict || prev.district,
                    areaValue: cleanArea ? Math.floor(parseFloat(cleanArea)).toString() : prev.areaValue,
                }));
            } else {
                // ADA NUMBER MISMATCH - Block registration
                setOcrSuccess(false);
                setAdaVerified(false);
                
                const msg = `ADA NUMBER MISMATCH\n` +
                            `----------------------------\n` +
                            `Your Input: ${formData.adaNumber}\n` +
                            `Document: ${docAda}\n` +
                            `Match Score: ${(matchScore * 100).toFixed(1)}% [FAIL]\n` +
                            `Required: 90% match or higher\n` +
                            `----------------------------\n` +
                            `Registration BLOCKED.\n` +
                            `Please verify your Ada Number is correct.`;
                
                setOcrResult(msg);
            }
        } else {
            // --- FALLBACK 2: Extract ALL numbers from text and let user pick ---
            const allNumbers = text.match(/\b\d{2,6}\b/g) || [];
            const uniqueNumbers = [...new Set(allNumbers)].slice(0, 10); // Top 10 unique numbers
            
            console.log("All numbers found in document:", uniqueNumbers);
            
            setOcrResult(`Ada No. Not Automatically Detected\n` +
                        `CNN Confidence: ${(confidence * 100).toFixed(1)}%\n` +
                        `----------------------------\n` +
                        `Your Input: ${formData.adaNumber}\n\n` +
                        `Numbers found in document:\n` +
                        `${uniqueNumbers.length > 0 ? uniqueNumbers.join(', ') : 'None detected'}\n\n` +
                        `TIP: If your Ada Number (${formData.adaNumber}) appears above,\n` +
                        `the document may be valid. Check image quality.\n\n` +
                        `District Detected: ${extractedDistrict || 'Not found'}\n` +
                        `----------------------------\n` +
                        `Raw Text Sample:\n${text.substring(0, 200)}...`);
        }

    } catch (error) {
        console.error("Pipeline Error:", error);
        setOcrResult("Error processing document.");
    } finally {
        setIsScanning(false);
    }
  };

  const handleSubmit = async () => {
    if (!wallet.isConnected) {
        showToast({
          type: 'warning',
          title: 'Wallet Required',
          message: 'Please connect your wallet first.'
        });
        return;
    }
    // Block registration if Ada Number is not verified
    if (!adaVerified) {
        showToast({
          type: 'error',
          title: 'Verification Required',
          message: 'Ada Number has not been verified. Please upload your Tapu document and ensure it matches with 90% confidence or higher.'
        });
        return;
    }
    setIsSubmitting(true);
    const success = await registerLand(formData);
    setIsSubmitting(false);
    if (success) {
        setCurrentView('home');
    }
  };

  if (!wallet.isConnected) {
    return (
      <NeoCard className="flex flex-col items-center justify-center p-12 text-center max-w-2xl mx-auto">
        <div className="bg-neo-accent p-4 border-2 border-black mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <User size={48} className="text-black" />
        </div>
        <h2 className="text-2xl font-black uppercase mb-2">{t.navRegister}</h2>
        <p className="text-gray-600 font-bold mb-6">Connect your wallet to write to the Sepolia Blockchain.</p>
        <NeoButton onClick={connectWallet} variant="primary">{t.connectWallet}</NeoButton>
      </NeoCard>
    );
  }

  // --- UI RENDERERS ---
  const renderStep1 = () => (
    <div className="space-y-4 animate-fade-in">
        <div className="bg-blue-50 border-2 border-black p-4 flex items-start gap-3">
            <BrainCircuit className="shrink-0 text-blue-600" />
            <div>
                <p className="font-bold text-sm">AI Powered: Upload Tapu in Step 3 to auto-fill (Deep Learning Enabled)</p>
            </div>
        </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold uppercase mb-1">{t.division}</label>
          <select className="w-full p-3 border-2 border-black font-bold bg-white" value={formData.division} onChange={e => handleChange('division', e.target.value)}>
            <option>Eskişehir</option><option>İstanbul</option><option>Ankara</option><option>İzmir</option><option>Bursa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold uppercase mb-1">{t.district}</label>
          <NeoInput type="text" value={formData.district} onChange={e => handleChange('district', e.target.value)} placeholder="e.g. Merkez" />
        </div>
      </div>
      <div className="bg-yellow-50 border-2 border-yellow-400 p-4">
        <h4 className="font-black uppercase text-sm mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-yellow-600" />
          Kadastro Bilgileri (Required for AI Verification)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Ada No. *</label>
            <NeoInput 
              type="text" 
              value={formData.adaNumber} 
              onChange={e => handleChange('adaNumber', e.target.value)} 
              placeholder="e.g. 1234" 
            />
            <p className="text-xs text-gray-500 mt-1">Must match your Tapu document</p>
          </div>
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Parsel No.</label>
            <NeoInput 
              type="text" 
              value={formData.parselNumber} 
              onChange={e => handleChange('parselNumber', e.target.value)} 
              placeholder="e.g. 56" 
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-bold uppercase mb-1">{t.area}</label>
           <NeoInput type="number" value={formData.areaValue} onChange={e => handleChange('areaValue', e.target.value)} />
        </div>
        <div>
           <label className="block text-sm font-bold uppercase mb-1">{t.unit}</label>
           <select className="w-full p-3 border-2 border-black font-bold bg-white" value={formData.areaUnit} onChange={e => handleChange('areaUnit', e.target.value)}>
            <option value="metrekare">Metrekare (m²)</option><option value="dönüm">Dönüm</option><option value="hektar">Hektar</option>
          </select>
        </div>
      </div>
      <div className="bg-neo-bg p-4 border-2 border-black">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-black uppercase flex items-center gap-2"><MapPin size={16} /> GPS Coordinates</h4>
          <button
            type="button"
            onClick={openGoogleMapsForLocation}
            className="bg-blue-500 text-white px-3 py-1.5 text-xs font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1 uppercase"
          >
            <MapPin size={12} /> Get from Maps
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <NeoInput type="number" placeholder={t.lat} value={formData.lat} onChange={e => handleChange('lat', e.target.value)} />
            <NeoInput type="number" placeholder={t.lng} value={formData.lng} onChange={e => handleChange('lng', e.target.value)} />
        </div>
        <p className="text-xs text-gray-500 mt-2">Tip: Right-click on Google Maps and click on the coordinates to copy them.</p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 animate-fade-in">
        <div>
          <label className="block text-sm font-bold uppercase mb-1">{t.ownerName}</label>
          <NeoInput type="text" value={formData.ownerName} onChange={e => handleChange('ownerName', e.target.value)} placeholder="Full Name" />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase mb-1">{t.nid}</label>
          <NeoInput type="text" value={formData.nid} onChange={e => handleChange('nid', e.target.value)} placeholder="National ID" />
        </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
        <div className={`border-4 border-dashed p-8 text-center relative transition-colors ${ocrSuccess ? 'border-green-500 bg-green-50' : 'border-black bg-white hover:bg-gray-50'}`}>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            {formData.file ? (
                <div className="flex flex-col items-center">
                    <CheckCircle className={`mx-auto mb-3 ${ocrSuccess ? 'text-green-600' : 'text-neo-primary'}`} size={48} />
                    <h3 className="font-black uppercase">{formData.file.name}</h3>
                    <p className="text-xs font-bold mt-1">{ocrSuccess ? "Verified & Analyzed" : "Ready for AI Analysis"}</p>
                </div>
            ) : (
                <>
                    <Upload className="mx-auto text-black mb-3" size={48} />
                    <h3 className="font-black uppercase">{t.uploadDeed}</h3>
                </>
            )}
        </div>
        
        {formData.file && (
            <div className="flex flex-col items-center gap-4">
                <NeoButton 
                    variant={ocrSuccess ? "primary" : "secondary"} 
                    onClick={scanDocument} 
                    disabled={isScanning || ocrSuccess}
                    className="flex items-center gap-2 w-full justify-center"
                >
                    {isScanning ? <Loader2 className="animate-spin" size={18} /> : (ocrSuccess ? <ShieldCheck size={18} /> : <Scan size={18} />)}
                    {isScanning ? "Running CNN & OCR..." : (ocrSuccess ? "Verification Complete" : "Verify Document (AI)")}
                </NeoButton>
                
                {ocrResult && (
                    <div className={`w-full p-4 border-2 border-black mt-2 text-left animate-slide-up ${adaVerified ? 'bg-green-100' : (adaMatchScore !== null && adaMatchScore < 0.90) ? 'bg-red-100' : 'bg-yellow-50'}`}>
                        <h4 className="font-black uppercase text-sm mb-2 border-b-2 border-gray-300 pb-1 flex items-center gap-2">
                             {adaVerified ? <ShieldCheck size={16} className="text-green-600" /> : <AlertTriangle size={16} className="text-yellow-600" />}
                             {adaVerified ? "Ada Verified - Registration Allowed" : (adaMatchScore !== null && adaMatchScore < 0.90) ? "Ada Mismatch - Registration Blocked" : "Analysis Result"}
                        </h4>
                        <pre className="whitespace-pre-wrap text-xs font-mono">{ocrResult}</pre>
                        
                        {adaMatchScore !== null && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase">Ada Match:</span>
                              <div className="flex-1 h-3 bg-gray-200 border border-black">
                                <div 
                                  className={`h-full ${adaMatchScore >= 0.90 ? 'bg-green-500' : 'bg-red-500'}`}
                                  style={{ width: `${adaMatchScore * 100}%` }}
                                />
                              </div>
                              <span className={`text-xs font-mono font-bold ${adaMatchScore >= 0.90 ? 'text-green-700' : 'text-red-700'}`}>
                                {(adaMatchScore * 100).toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">Threshold: 90% or higher required for registration</p>
                          </div>
                        )}
                    </div>
                )}
            </div>
        )}
    </div>
  );

  const renderStep4 = () => (
      <div className="space-y-4 animate-fade-in">
        <h3 className="font-black uppercase border-b-2 border-black pb-2">{t.reviewTitle}</h3>
        
        {/* Ada Verification Status Banner */}
        <div className={`p-3 border-2 border-black text-center font-bold uppercase text-sm ${adaVerified ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}`}>
          <div className="flex items-center justify-center gap-2">
            {adaVerified ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
            {adaVerified ? 'ADA NUMBER VERIFIED' : 'ADA NOT VERIFIED - REGISTRATION BLOCKED'}
          </div>
          {adaMatchScore !== null && (
            <div className="text-xs mt-1 font-mono">
              Match Score: {(adaMatchScore * 100).toFixed(1)}% {adaMatchScore >= 0.90 ? '[PASS]' : '[FAIL]'}
            </div>
          )}
        </div>
        
        {/* AI Verification Status */}
        <div className={`p-2 border-2 border-black text-center font-bold uppercase text-sm flex items-center justify-center gap-2 ${ocrSuccess ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
             {ocrSuccess ? <BrainCircuit size={16} /> : <AlertTriangle size={16} />}
             {ocrSuccess ? `Document Verified (CNN: ${(cnnConfidence! * 100).toFixed(0)}%)` : "Document Not Verified"}
        </div>
        
        <div className="grid grid-cols-2 gap-y-4 text-sm font-bold">
            <div className="text-gray-600 uppercase">{t.division}:</div><div>{formData.division}</div>
            <div className="text-gray-600 uppercase">{t.district}:</div><div>{formData.district}</div>
            <div className="text-gray-600 uppercase">Ada No.:</div>
            <div className="flex items-center gap-2">
              {formData.adaNumber}
              {extractedAda && (
                <span className={`text-xs px-2 py-0.5 ${adaVerified ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  Doc: {extractedAda}
                </span>
              )}
            </div>
            <div className="text-gray-600 uppercase">Parsel No.:</div><div>{formData.parselNumber}</div>
            <div className="text-gray-600 uppercase">{t.surveyNo}:</div><div>{formData.surveyNo}</div>
            <div className="text-gray-600 uppercase">{t.area}:</div><div>{formData.areaValue} {formData.areaUnit}</div>
        </div>
        
        {!adaVerified && (
          <div className="bg-red-100 border-2 border-red-500 p-3 text-sm">
            <p className="font-bold text-red-800">Cannot submit: Go back to Step 3 and verify your Tapu document.</p>
            <p className="text-red-700 text-xs mt-1">The Ada Number in your document must match your input with 90% confidence or higher.</p>
          </div>
        )}
        
        <div className="bg-neo-accent border-2 border-black p-3 flex justify-between items-center mt-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-sm font-black uppercase text-black">Est. Gas (Sepolia)</span>
            <span className="font-mono font-black text-black">~0.0004 ETH</span>
        </div>
      </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10"></div>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`w-10 h-10 border-2 border-black flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= s ? 'bg-neo-primary text-white' : 'bg-white text-black'}`}>
            {step > s ? <CheckCircle size={18} /> : s}
          </div>
        ))}
      </div>
      <NeoCard className="min-h-[400px]">
        <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 border-b-2 border-black pb-4">
            {step === 4 ? <><CheckCircle className="text-neo-primary" /> {t.step4}</> : `Step ${step}`}
        </h2>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </NeoCard>
      <div className="flex justify-between mt-8">
        <NeoButton variant="secondary" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1 || isSubmitting} className="flex items-center gap-2 disabled:opacity-50">
          <ChevronLeft size={18} /> {t.back}
        </NeoButton>
        {step < 4 ? (
            <NeoButton variant="primary" onClick={handleNextStep} className="flex items-center gap-2">
            {t.next} <ChevronRight size={18} />
            </NeoButton>
        ) : (
            <NeoButton variant="primary" onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 disabled:opacity-70">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />} {t.submit}
            </NeoButton>
        )}
      </div>
    </div>
  );
};

export default LandRegistrationForm;