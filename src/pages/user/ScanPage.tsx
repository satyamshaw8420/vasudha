import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { 
  Camera, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Zap,
  ArrowRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeWaste } from '../../lib/gemini';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Button } from '../../components/ui/button';

export default function ScanPage() {
  const webcamRef = useRef<Webcam>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);
    setIsAnalyzing(true);
    setError(null);

    try {
      // Base64 cleaning for Gemini
      const base64Data = imageSrc.split(',')[1];
      const analysis = await analyzeWaste(base64Data);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError("Failed to identify waste. Please try again with better lighting.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [webcamRef]);

  const handleLogWaste = async () => {
    if (!result || !user || !profile) return;

    try {
      // 1. Create Waste Log
      await addDoc(collection(db, 'wasteLogs'), {
        userId: user.uid,
        materialType: result.materialType,
        confidence: result.confidence,
        isRecyclable: result.isRecyclable,
        creditsAwarded: result.credits,
        co2SavedKg: result.co2SavedKg,
        imageUrl: capturedImage, // In production, upload to Firebase Storage
        status: 'logged',
        createdAt: serverTimestamp(),
      });

      // 2. Update User Stats
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        totalCredits: increment(result.credits),
        totalKgRecycled: increment(0.5), // Estimate weight or use AI weight
      });

      navigate(ROUTES.USER.DASHBOARD);
    } catch (err) {
      console.error(err);
      setError("Failed to save log. Please check your connection.");
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-1000">
      {/* Background Camera View */}
      <div className="absolute inset-0 z-0 bg-[#0c0f0e] rounded-[3rem] overflow-hidden border border-[rgb(var(--outline-rgb)/0.1)] shadow-2xl">
        {!capturedImage ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'environment' }}
            className="w-full h-full object-cover opacity-90 transition-opacity duration-700"
          />
        ) : (
          <img src={capturedImage} className="w-full h-full object-cover opacity-70 grayscale-[0.1] transition-opacity duration-700" alt="Captured waste" />
        )}

        {/* HUD Scanning Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanning Box Corners - Organic Style */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-2 border-[rgb(var(--brand-secondary-rgb)/0.15)] rounded-[3rem]">
             <div className="absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8 border-[var(--brand-secondary)] rounded-tl-[2.5rem] shadow-[0_0_20px_var(--brand-secondary)]" />
             <div className="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 border-[var(--brand-secondary)] rounded-tr-[2.5rem] shadow-[0_0_20px_var(--brand-secondary)]" />
             <div className="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 border-[var(--brand-secondary)] rounded-bl-[2.5rem] shadow-[0_0_20px_var(--brand-secondary)]" />
             <div className="absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8 border-[var(--brand-secondary)] rounded-br-[2.5rem] shadow-[0_0_20px_var(--brand-secondary)]" />
          </div>

          {/* Molecular Pulse Animation */}
          {!capturedImage && (
            <motion.div 
              animate={{ 
                top: ['30%', '70%', '30%'],
                scaleX: [0.8, 1, 0.8],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute left-[calc(50%-144px)] w-72 h-[4px] bg-gradient-to-r from-transparent via-[var(--brand-secondary)] to-transparent shadow-[0_0_30px_var(--brand-secondary)]"
            />
          )}

          {/* Bioluminescent Particles (Aesthetic) */}
          <AnimatePresence>
            {!capturedImage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--brand-secondary)_0%,_transparent_100%)]"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* UI Controls Overlay */}
      <div className="relative z-10 w-full max-w-lg mt-auto pb-10 px-8">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="glass-card p-10 flex flex-col items-center text-center space-y-6 glow-sage"
            >
              <div className="relative h-24 w-24 flex items-center justify-center">
                <Loader2 size={100} className="text-[var(--brand-secondary)] animate-spin-slow opacity-20 absolute" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Zap size={48} className="text-[var(--brand-secondary)] bioluminescent-glow" />
                </motion.div>
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-[var(--brand-primary)]">Analyzing Molecular Signature</h3>
                <p className="text-[var(--on-surface-variant)] text-sm mt-3 font-medium tracking-wide">Vasu AI is mapping material composition...</p>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 space-y-8 glow-sage"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-3xl bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)] bioluminescent-glow">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--brand-primary)]">{result.materialType}</h3>
                    <p className="text-xs font-bold text-[var(--brand-secondary)] uppercase tracking-[0.2em]">{result.confidence} Match</p>
                  </div>
                </div>
                <button onClick={reset} className="p-3 text-[var(--on-surface-variant)] hover:text-[var(--brand-primary)] bg-[rgb(var(--brand-primary-rgb)/0.03)] rounded-full transition-all duration-500">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/40 p-6 rounded-[2rem] border border-[var(--outline)]/5 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--on-surface-variant)]">Impact Potential</p>
                  <p className="text-xl font-bold text-[var(--brand-primary)]">+{result.credits} Credits</p>
                </div>
                <div className="bg-white/40 p-6 rounded-[2rem] border border-[var(--outline)]/5 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--on-surface-variant)]">CO2 Recovery</p>
                  <p className="text-xl font-bold text-[var(--brand-secondary)]">{result.co2SavedKg}kg saved</p>
                </div>
              </div>

              <div className="bg-[rgb(var(--brand-secondary-rgb)/0.05)] p-6 rounded-[2rem] border border-[var(--brand-secondary)]/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-45 transition-transform duration-1000">
                   <Zap size={60} />
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand-secondary)] mb-2 uppercase tracking-widest">
                  <Zap size={18} /> Vasu AI Insight
                </div>
                <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed font-medium">
                  {result.action}.
                  {result.credits > 0 && (
                    <> Logging this waste will contribute <span className="text-[var(--brand-secondary)] font-bold">0.5kg</span> towards your weekly sustainability milestone.</>
                  )}
                </p>
              </div>

              <Button 
                onClick={handleLogWaste}
                disabled={result.credits === 0}
                className={`w-full h-16 shadow-xl rounded-full text-lg font-bold group transition-all duration-500 ${
                  result.credits > 0
                    ? 'bg-[var(--brand-primary)] text-white shadow-[rgb(var(--brand-primary-rgb)/0.2)] hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-[var(--outline)]/10 text-[var(--outline)] hover:scale-100 cursor-not-allowed'
                }`}
              >
                {result.credits > 0 ? (
                  <>
                    Log to Vasudha <ArrowRight size={22} className="ml-3 group-hover:translate-x-1.5 transition-transform duration-500" />
                  </>
                ) : (
                  'No Recyclable Material'
                )}
              </Button>
            </motion.div>
          ) : error ? (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-card p-10 border-red-500/10 text-center space-y-6"
            >
              <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertCircle size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-500 tracking-tight">Analysis Interrupted</h3>
                <p className="text-sm font-medium text-[var(--on-surface-variant)] mt-3 leading-relaxed">{error}</p>
              </div>
              <Button onClick={reset} variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/5 rounded-full px-8 py-6 h-auto">
                <RotateCcw size={20} className="mr-3" /> Re-initialize Scan
              </Button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              <div className="text-center space-y-2">
                 <h2 className="text-2xl font-bold text-white tracking-tight">Align Waste in Frame</h2>
                 <p className="text-white/60 text-sm font-medium tracking-wide">Vasu AI is ready to detect molecular patterns</p>
              </div>
              <button 
                onClick={capture}
                className="h-24 w-24 rounded-full border-4 border-white/30 p-2 group transition-all duration-500 active:scale-95 hover:border-white/50"
              >
                <div className="h-full w-full rounded-full bg-white group-hover:bg-[var(--brand-secondary)] flex items-center justify-center transition-all duration-500 shadow-2xl group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                  <Camera size={38} className="text-[#0c0f0e] group-hover:text-white transition-all duration-500" />
                </div>
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Module Metadata Overlay */}
      <div className="absolute top-12 left-12 pointer-events-none md:block hidden animate-in fade-in slide-in-from-left duration-1000">
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em]">Subsystem: VASU_VISION_2.0</p>
        <p className="text-[10px] text-[var(--brand-secondary)] font-bold uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)] animate-pulse" /> Status: Operational
        </p>
      </div>
    </div>
  );
}
