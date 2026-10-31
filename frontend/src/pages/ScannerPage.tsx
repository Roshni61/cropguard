import React, { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Camera, Upload, AlertTriangle, Sparkles, Sprout,
  Sun, Focus, Maximize2, History, RotateCcw, Check,
  MapPin, Layers, Calendar, ChevronRight, FileText
} from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { analyzeCropImageAPI, fetchUserScansHistoryAPI, fetchScanByIdAPI } from "../services/api";
import { LeafScanner, SCAN_STAGES } from "../components/LeafScanner";
import { TN_DISTRICTS } from "../data/tamilNaduLocations";

interface ScannerPageProps {
  onDiagnosisComplete: (resultData: any) => void;
  selectedSample?: string | null;
  initialDistrict?: string;
}

const CROPS = [
  { id: "Tomato", label: "Tomato", icon: "🍅", ta: "தக்காளி", hi: "टमाटर" },
  { id: "Paddy", label: "Paddy (Rice)", icon: "🌾", ta: "நெல்", hi: "धान" },
  { id: "Cotton", label: "Cotton", icon: "🌱", ta: "பருத்தி", hi: "कपास" },
  { id: "Banana", label: "Banana", icon: "🍌", ta: "வாழை", hi: "केला" },
  { id: "Chilli", label: "Chilli", icon: "🌶️", ta: "மிளகாய்", hi: "मिर्च" },
  { id: "Potato", label: "Potato", icon: "🥔", ta: "உருளைக்கிழங்கு", hi: "आलू" },
  { id: "Auto-Detect", label: "Auto-Detect", icon: "🔍", ta: "பயிரை கண்டறி", hi: "फसल पहचानें" }
];

const GROWTH_STAGES = [
  { id: "Seedling", label: "Seedling / Nursery", ta: "முளைப்பருவம்" },
  { id: "Vegetative", label: "Vegetative Growth", ta: "வளர்ச்சிப் பருவம்" },
  { id: "Flowering", label: "Flowering Stage", ta: "பூக்கும் பருவம்" },
  { id: "Fruiting", label: "Fruiting / Pod Formation", ta: "காய்க்கும் பருவம்" },
  { id: "Maturity", label: "Maturity / Pre-Harvest", ta: "முதிர்ச்சிப் பருவம்" }
];

const DEFAULT_FIELDS = [
  { id: "fld-01", name: "Field 1 - North Acre (Main Plot)" },
  { id: "fld-02", name: "Field 2 - Riverside Plot" },
  { id: "fld-03", name: "Field 3 - Polyhouse Nursery" },
  { id: "fld-general", name: "Home Garden / Experimental" }
];

const BENCHMARK_SAMPLES: [string, string, string, string][] = [
  ["early_blight", "Early Blight (Tomato)", "early_blight_tomato.jpg", "Tomato"],
  ["late_blight", "Late Blight (Severe)", "late_blight_tomato.jpg", "Tomato"],
  ["healthy", "Healthy Leaf (Tomato)", "healthy_tomato.jpg", "Tomato"],
  ["paddy_blast", "Rice Blast (Paddy)", "blast_paddy.jpg", "Paddy"],
  ["cotton_blight", "Bacterial Blight (Cotton)", "bacterial_blight_cotton.jpg", "Cotton"],
  ["banana_sigatoka", "Sigatoka Leaf Spot (Banana)", "sigatoka_banana.jpg", "Banana"],
  ["chilli_rot", "Anthracnose (Chilli)", "dieback_chilli.jpg", "Chilli"],
  ["blurry", "Blurry Photo (Quality Check)", "blurry_leaf.jpg", "Tomato"],
  ["dark", "Dark Photo (Lighting Check)", "dark_leaf.jpg", "Tomato"],
  ["lowconf", "Ambiguous Leaf (42% Conf)", "lowconf_unclear.jpg", "Tomato"]
];

const MIN_FILE_SIZE = 1024; // 1 KB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ScannerPage: React.FC<ScannerPageProps> = ({ 
  onDiagnosisComplete, 
  selectedSample,
  initialDistrict = "Coimbatore"
}) => {
  const { t, language } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Flow State: 'select' | 'preview' | 'analyzing'
  const [selectedCrop, setSelectedCrop] = useState<string>("Tomato");
  const [district, setDistrict] = useState<string>(initialDistrict);
  const [fieldId, setFieldId] = useState<string>("fld-01");
  const [growthStage, setGrowthStage] = useState<string>("Vegetative");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSampleScan, setIsSampleScan] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);

  const [qualityError, setQualityError] = useState<{ code: string; message: string; guidance?: string } | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [loadingScanId, setLoadingScanId] = useState<string | null>(null);

  const shouldReduceMotion = useReducedMotion();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview && !preview.startsWith("data:") && !preview.startsWith("/images/")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const loadHistory = async () => {
    setShowHistoryModal(true);
    setIsLoadingHistory(true);
    try {
      const list = await fetchUserScansHistoryAPI(12);
      setRecentScans(list || []);
    } catch {
      setRecentScans([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectHistoryScan = async (scan: any) => {
    try {
      setLoadingScanId(scan.id);
      const fullScan = await fetchScanByIdAPI(scan.id);
      setShowHistoryModal(false);
      onDiagnosisComplete(fullScan);
    } catch {
      // Fallback to basic scan object if detailed fetch fails
      setShowHistoryModal(false);
      onDiagnosisComplete(scan);
    } finally {
      setLoadingScanId(null);
    }
  };

  // Validate File (Format & Size)
  const validateImageFile = (file: File): string | null => {
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      return "Unsupported file format. Please upload or capture an image in JPG, PNG, or WebP format.";
    }
    if (file.size < MIN_FILE_SIZE) {
      return "The selected image file is too small or corrupt (minimum 1 KB required).";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "The image exceeds 10 MB. Please choose or capture a photo under 10 MB.";
    }
    return null;
  };

  // Handle file chosen from device or camera
  const handleFileChosen = (file: File) => {
    setQualityError(null);
    const validationError = validateImageFile(file);
    if (validationError) {
      setQualityError({
        code: "INVALID_FILE",
        message: validationError,
        guidance: "Use your device camera or gallery to select a clear leaf photo under 10 MB."
      });
      return;
    }

    if (preview && !preview.startsWith("data:") && !preview.startsWith("/images/")) {
      URL.revokeObjectURL(preview);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreview(objectUrl);
    setIsSampleScan(false);
  };

  // Reset image selection to retake
  const handleRetake = () => {
    if (preview && !preview.startsWith("data:") && !preview.startsWith("/images/")) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
    setIsSampleScan(false);
    setQualityError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Run the full crop disease analysis
  const executeAnalysis = async (fileToAnalyze: File, isSample = false, overrideCrop?: string) => {
    setQualityError(null);
    setIsAnalyzing(true);
    setStage(0);

    const activeCrop = overrideCrop || selectedCrop;

    // Progressive stage advancement animation
    const tick = setInterval(() => {
      setStage(s => Math.min(s + 1, SCAN_STAGES.length - 1));
    }, 600);

    const formData = new FormData();
    formData.append("file", fileToAnalyze);
    formData.append("crop", activeCrop);
    formData.append("district", district);
    formData.append("growth_stage", growthStage);
    formData.append("field_id", fieldId);
    formData.append("client_scan_id", `scan-${Date.now()}`);

    try {
      const [res] = await Promise.all([
        analyzeCropImageAPI(formData),
        new Promise(r => setTimeout(r, 2200)) // Guarantee smooth scanning UI
      ]);

      clearInterval(tick);
      setStage(SCAN_STAGES.length);
      await new Promise(r => setTimeout(r, 250));
      setIsAnalyzing(false);

      if (res && res.success && res.data) {
        onDiagnosisComplete({
          ...res.data,
          crop: activeCrop,
          district: district,
          growth_stage: growthStage,
          field_id: fieldId,
          is_demo_sample: isSample,
          captured_image_url: preview || res.data.image_url
        });
      } else if (res && res.quality && res.quality.status !== "GOOD") {
        setQualityError({
          code: res.quality.status,
          message: res.quality.reasons?.[0] || "Image quality is insufficient for accurate clinical diagnosis.",
          guidance: res.quality.guidance || "Please position the affected leaf under natural daylight (15–20 cm) and hold steady."
        });
      } else {
        setQualityError({
          code: "QUALITY_REJECTED",
          message: "Unable to identify leaf symptoms with sufficient certainty.",
          guidance: "Hold your device 15–20 cm away from a single affected leaf in daylight and retake the photo."
        });
      }
    } catch {
      clearInterval(tick);
      setIsAnalyzing(false);
      setQualityError({
        code: "ANALYSIS_ERROR",
        message: "Diagnostic service connection failed.",
        guidance: "Please check your network connection and try again."
      });
    }
  };

  // Trigger sample if selected externally
  useEffect(() => {
    if (selectedSample) {
      const match = BENCHMARK_SAMPLES.find(s => s[0] === selectedSample);
      if (match) {
        setSelectedCrop(match[3]);
        const sampleFile = new File(["demo"], match[2], { type: "image/jpeg" });
        setSelectedFile(sampleFile);
        setPreview(`/images/${match[2]}`);
        setIsSampleScan(true);
        executeAnalysis(sampleFile, true, match[3]);
      }
    }
  }, [selectedSample]);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileChosen(f);
  };

  const districtList = Object.values(TN_DISTRICTS);

  return (
    <motion.div 
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] as const }} 
      className="mx-auto max-w-3xl space-y-6 pt-4 sm:pt-6 pb-20"
    >
      {/* 1. Header Bar with Recent History Button */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
            <Sprout className="w-3.5 h-3.5" />
            <span>AI Crop Doctor Vision Scanner</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">
            {t("scanMyCrop")}
          </h2>
          <p className="text-xs sm:text-sm text-ink-2">
            Image-based pathology inspection grounded in TNAU & ICAR agricultural research.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHistory}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-paper text-forest font-bold text-xs border border-line shadow-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <History className="w-4 h-4 text-forest" />
          <span>Scan History</span>
        </button>
      </header>

      {/* 2. Photo Quality Warning Banner */}
      {qualityError && (
        <motion.div 
          role="alert" 
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="animate-shake flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/95 p-4 text-amber-950 shadow-sm"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-black text-amber-950">
                Photo Quality Alert: Unsuitable for Diagnostic Accuracy
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded-md text-amber-900">
                {qualityError.code}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 font-semibold leading-relaxed">
              {qualityError.message}
            </p>
            {qualityError.guidance && (
              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 leading-normal">
                💡 <strong>Agronomist Guidance:</strong> {qualityError.guidance}
              </div>
            )}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest text-lime text-xs font-bold hover:bg-forest-hover transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Clearer Photo</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Progressive Scanning Overlay while analyzing */}
      {isAnalyzing && (
        <div className="space-y-4">
          <LeafScanner src={preview} stage={stage} active={isAnalyzing} />
        </div>
      )}

      {/* 4. WORKFLOW STAGES */}
      {!isAnalyzing && (
        <>
          {/* STEP 1: PREVIEW & FIELD ATTRIBUTES (Shown when photo selected) */}
          {preview ? (
            <motion.div 
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-line shadow-xs space-y-5"
            >
              {/* Header of Preview */}
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-base sm:text-lg text-forest">
                    Review Photo & Field Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper hover:bg-cream-card text-ink-2 hover:text-ink text-xs font-bold border border-line transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Photo</span>
                </button>
              </div>

              {/* Photo Preview Box */}
              <div className="relative aspect-video max-h-72 w-full overflow-hidden rounded-2xl bg-black/40 border border-line farm-gradient-fallback">
                <img 
                  src={preview} 
                  alt="Leaf specimen preview" 
                  className="h-full w-full object-contain"
                />
                <div className="absolute bottom-2.5 left-2.5 rounded-xl bg-forest/90 backdrop-blur-md px-3 py-1.5 text-[11px] text-lime font-bold border border-lime/30 shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-lime" />
                  <span>Selected Leaf Specimen</span>
                </div>
              </div>

              {/* Field Metadata Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Crop Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-forest tracking-wider flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-forest" />
                    <span>Target Crop</span>
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full bg-paper border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink focus:outline-none focus:border-forest cursor-pointer"
                  >
                    {CROPS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label} {c.ta ? `(${c.ta})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-forest tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-forest" />
                    <span>Tamil Nadu District</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-paper border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink focus:outline-none focus:border-forest cursor-pointer"
                  >
                    {districtList.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.nameTa}) — {d.zone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-forest tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-forest" />
                    <span>Field / Plot</span>
                  </label>
                  <select
                    value={fieldId}
                    onChange={(e) => setFieldId(e.target.value)}
                    className="w-full bg-paper border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink focus:outline-none focus:border-forest cursor-pointer"
                  >
                    {DEFAULT_FIELDS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Growth Stage Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-forest tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-forest" />
                    <span>Crop Growth Stage</span>
                  </label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    className="w-full bg-paper border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink focus:outline-none focus:border-forest cursor-pointer"
                  >
                    {GROWTH_STAGES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label} ({g.ta})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => selectedFile && executeAnalysis(selectedFile, isSampleScan)}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-full bg-forest hover:bg-forest-hover font-bold text-cream text-sm sm:text-base shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0 border border-lime/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-lime" />
                  <span>Analyze Leaf Health</span>
                  <ChevronRight className="w-4 h-4 text-lime" />
                </button>

                <button
                  type="button"
                  onClick={handleRetake}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-full border border-line bg-paper hover:bg-cream-card text-ink font-semibold text-xs sm:text-sm transition cursor-pointer"
                >
                  Cancel / Choose Another
                </button>
              </div>
            </motion.div>
          ) : (
            /* STEP 0: INITIAL IMAGE CAPTURE SCREEN */
            <div className="space-y-6">
              {/* Step 1: Crop Selection Bar */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-line shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-forest tracking-wider">
                    Step 1: Select Your Crop
                  </span>
                  <span className="text-[11px] text-ink-3">
                    {selectedCrop === "Auto-Detect" ? "AI will auto-identify crop" : `Active: ${selectedCrop}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {CROPS.map((c) => {
                    const isSelected = selectedCrop === c.id;
                    const displayLabel = language === "ta" ? c.ta : language === "hi" ? c.hi : c.label;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCrop(c.id)}
                        className={`min-h-[48px] p-2 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-forest text-lime border-forest shadow-sm"
                            : "bg-paper hover:bg-cream-card text-ink border-line hover:border-forest-2"
                        }`}
                      >
                        <span className="text-base">{c.icon}</span>
                        <span className="truncate">{displayLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Photography Guidance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-paper p-3.5 rounded-2xl border border-line flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-forest">Natural Daylight</p>
                    <p className="text-ink-2 text-[11px]">Avoid dark shadows & midday flash glare.</p>
                  </div>
                </div>

                <div className="bg-paper p-3.5 rounded-2xl border border-line flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Focus className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-forest">Sharp Focus (15–20 cm)</p>
                    <p className="text-ink-2 text-[11px]">Hold camera steady, tap lesion to focus.</p>
                  </div>
                </div>

                <div className="bg-paper p-3.5 rounded-2xl border border-line flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-forest">Single Affected Leaf</p>
                    <p className="text-ink-2 text-[11px]">Frame one leaf clearly in the center.</p>
                  </div>
                </div>
              </div>

              {/* Primary Capture Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button 
                  type="button"
                  onClick={() => cameraInputRef.current?.click()} 
                  className="flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-forest hover:bg-forest-hover font-bold text-cream text-sm sm:text-base shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:translate-y-0 border border-lime/30 transition-all cursor-pointer"
                >
                  <Camera className="h-5 w-5 text-lime" aria-hidden /> 
                  <span>{t("takePhoto")} (Camera)</span>
                </button>

                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex min-h-14 items-center justify-center gap-2.5 rounded-full border border-line bg-white hover:bg-paper font-bold text-forest text-sm sm:text-base shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <Upload className="h-5 w-5 text-forest" aria-hidden /> 
                  <span>{t("uploadGallery")} (Upload File)</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Hidden Inputs for Desktop & Mobile Camera */}
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={onFileInputChange} 
        accept="image/jpeg,image/png,image/webp" 
        capture="environment" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileInputChange} 
        accept="image/jpeg,image/png,image/webp" 
        className="hidden" 
      />

      {/* Benchmark Reference Samples (Test Cases) */}
      {isDemoMode && !isAnalyzing && (
        <section className="rounded-3xl border border-line bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-2">
              <Sparkles className="h-4 w-4 text-forest" aria-hidden /> 
              <span>Reference Benchmark Suite (Verification Samples)</span>
            </div>
            <span className="text-[10px] bg-paper px-2 py-0.5 rounded text-ink-3">
              Tagged as Demo Benchmark
            </span>
          </div>

          <p className="text-[11px] text-ink-3">
            Pre-calibrated test leaves for testing edge-cases: healthy leaves, severe blights, cotton blight, banana sigatoka, paddy blast, blurry rejection, and low-confidence handling.
          </p>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {BENCHMARK_SAMPLES.map(([key, label, file, crop]) => (
              <button 
                key={key} 
                disabled={isAnalyzing} 
                onClick={() => {
                  setSelectedCrop(crop);
                  const sampleFile = new File(["demo"], file, { type: "image/jpeg" });
                  setSelectedFile(sampleFile);
                  setPreview(`/images/${file}`);
                  setIsSampleScan(true);
                  executeAnalysis(sampleFile, true, crop);
                }} 
                className="min-h-12 rounded-2xl border border-line p-2.5 text-xs font-semibold text-ink transition-all hover:border-forest-2 hover:bg-paper hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer text-left flex flex-col justify-between"
              >
                <span className="font-bold text-forest leading-snug">{label}</span>
                <div className="flex items-center justify-between mt-1 text-[10px] text-ink-3">
                  <span>{crop}</span>
                  <span className="font-bold text-lime bg-forest px-1.5 py-0.2 rounded">Test</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recent Scan History Modal */}
      {showHistoryModal && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-line space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-forest" />
                <h3 className="font-black text-lg text-forest">Your Saved Field Scans</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="min-h-[44px] min-w-[44px] p-2 text-ink-2 hover:text-ink rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {isLoadingHistory ? (
                <div className="text-center py-8 text-xs text-ink-2">Loading saved scans...</div>
              ) : recentScans.length === 0 ? (
                <p className="text-center py-8 text-xs text-ink-3">
                  No scans saved yet. Snap a photo to create your first report.
                </p>
              ) : (
                recentScans.map((s, idx) => (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => handleSelectHistoryScan(s)}
                    disabled={loadingScanId === s.id}
                    className="w-full text-left p-3.5 rounded-2xl bg-paper hover:bg-cream-card border border-line text-xs space-y-1.5 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between font-bold text-forest">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-forest" />
                        <span>{s.crop ? `${s.crop}: ` : ""}{s.disease_name || "Crop Scan"}</span>
                      </span>
                      <span className="text-[11px] font-normal text-ink-3">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : "Recent"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ink-2">
                      <div className="flex items-center gap-2">
                        <span>Confidence: {Math.round((s.confidence || 0) * 100)}%</span>
                        <span>•</span>
                        <span>Severity: {s.severity || "Moderate"}</span>
                        {s.district && <span>• {s.district}</span>}
                      </div>
                      <span className="text-forest font-bold group-hover:underline">
                        {loadingScanId === s.id ? "Loading..." : "Open Report →"}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
