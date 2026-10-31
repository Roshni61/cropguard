import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CROPS_KNOWLEDGE_BASE, type CropProfile, getAllCrops } from "../data/cropKnowledge";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { useTranslation } from "../i18n/I18nContext";
import { 
  Sprout, Droplets, Calendar, ShieldAlert, Sparkles, 
  Camera, CheckCircle2, BookOpen, Layers
} from "lucide-react";

interface CropGuidePageProps {
  onScanCrop?: (cropName: string) => void;
  initialCropId?: string;
}

export const CropGuidePage: React.FC<CropGuidePageProps> = ({ onScanCrop, initialCropId = "tomato" }) => {
  const { language } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCropId);
  const [activeTab, setActiveTab] = useState<"stages" | "diseases" | "nutrition" | "seasons">("stages");

  const cropList = getAllCrops();
  const crop: CropProfile = CROPS_KNOWLEDGE_BASE[selectedCropId] || CROPS_KNOWLEDGE_BASE.tomato;

  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-16 max-w-5xl mx-auto"
    >
      {/* 1. Clear Educational Banner Distinguishing Library from Live Analysis */}
      <motion.div
        variants={itemVariants}
        className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center justify-between gap-3 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded-full">
                Educational Agronomy Reference
              </span>
              <span className="text-[10px] text-emerald-700 font-bold hidden sm:inline">
                TNAU & ICAR Aligned
              </span>
            </div>
            <p className="text-xs text-emerald-900 font-medium mt-0.5">
              {language === "ta" 
                ? "இது கல்வி மற்றும் சாகுபடி வழிகாட்டுதலுக்கான தகவல் களஞ்சியம். நேரடி AI நோய் ஆய்வுக்கு 'ஸ்கேன் செய்' பொத்தானை அழுத்தவும்."
                : "Curated reference knowledge for cultivation and disease prevention. For live leaf diagnosis, use the 'Scan My Crop' camera analysis."}
            </p>
          </div>
        </div>

        {onScanCrop && (
          <button
            onClick={() => onScanCrop(crop.name)}
            className="px-4 py-2 bg-forest hover:bg-forest-hover text-cream text-xs font-bold rounded-2xl shadow-sm border border-lime/30 flex items-center gap-2 transition cursor-pointer shrink-0"
          >
            <Camera className="w-4 h-4 text-lime" />
            <span>{language === "ta" ? "நேரடி AI ஸ்கேன்" : `Scan ${crop.name}`}</span>
          </button>
        )}
      </motion.div>

      {/* 2. Crop Selector Chips */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {cropList.map((c) => {
          const isSelected = c.id === selectedCropId;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCropId(c.id)}
              className={`min-h-[44px] px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-forest text-lime shadow-md border-2 border-forest ring-2 ring-lime/40 font-black"
                  : "bg-white text-ink-2 hover:text-ink border border-line hover:border-forest/30"
              }`}
            >
              <span>{c.growthStages[0]?.icon || "🌱"}</span>
              <span>{language === "ta" ? c.nameTa : c.name}</span>
            </button>
          );
        })}
      </motion.div>

      {/* 3. Hero Crop Profile Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-line overflow-hidden relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Crop Image */}
          <div className="md:col-span-1">
            <ImageWithFallback
              imageKey={crop.imageKey}
              alt={language === "ta" ? `${crop.nameTa} பயிர்` : `Healthy ${crop.name} plant`}
              aspectRatioClass="aspect-[4/3]"
              language={language}
              showCredit={true}
              className="rounded-2xl shadow-sm"
            />
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[11px] font-bold text-ink-3 uppercase tracking-wider">
                  {crop.family} • <em>{crop.botanicalName}</em>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-forest">
                  {language === "ta" ? crop.nameTa : crop.name}
                  <span className="text-base font-normal text-ink-2 ml-2">({crop.name})</span>
                </h2>
              </div>
              <span className="text-xs bg-lime/20 text-forest font-bold px-3 py-1 rounded-full border border-lime/40">
                Tamil Nadu Cultivar
              </span>
            </div>

            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              {language === "ta" ? crop.summaryTa : crop.summary}
            </p>

            {/* Quick Climate Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-line text-[11px]">
              <div className="p-2.5 bg-paper rounded-xl border border-line">
                <span className="text-ink-3 block">Optimal Temp</span>
                <span className="font-bold text-forest">{crop.agroClimatic.optimalTemp}</span>
              </div>
              <div className="p-2.5 bg-paper rounded-xl border border-line">
                <span className="text-ink-3 block">Annual Rain</span>
                <span className="font-bold text-forest">{crop.agroClimatic.optimalRainfall}</span>
              </div>
              <div className="p-2.5 bg-paper rounded-xl border border-line">
                <span className="text-ink-3 block">Soil Reaction</span>
                <span className="font-bold text-forest">pH {crop.agroClimatic.soilPh}</span>
              </div>
              <div className="p-2.5 bg-paper rounded-xl border border-line">
                <span className="text-ink-3 block">Soil Type</span>
                <span className="font-bold text-forest line-clamp-1">{language === "ta" ? crop.agroClimatic.soilTypeTa : crop.agroClimatic.soilType}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("stages")}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "stages"
              ? "bg-forest text-white shadow-xs font-black"
              : "bg-paper text-ink-2 hover:text-ink"
          }`}
        >
          <Layers className="w-4 h-4 text-lime" />
          <span>{language === "ta" ? "வளர்ச்சி நிலைகள்" : "Growth Stages"}</span>
        </button>

        <button
          onClick={() => setActiveTab("diseases")}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "diseases"
              ? "bg-forest text-white shadow-xs font-black"
              : "bg-paper text-ink-2 hover:text-ink"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>{language === "ta" ? "நோய்கள் & அறிகுறிகள்" : "Diseases & Symptoms"}</span>
        </button>

        <button
          onClick={() => setActiveTab("nutrition")}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "nutrition"
              ? "bg-forest text-white shadow-xs font-black"
              : "bg-paper text-ink-2 hover:text-ink"
          }`}
        >
          <Droplets className="w-4 h-4 text-blue-400" />
          <span>{language === "ta" ? "பாசனம் & ஊட்டச்சத்து" : "Water & Nutrition"}</span>
        </button>

        <button
          onClick={() => setActiveTab("seasons")}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "seasons"
              ? "bg-forest text-white shadow-xs font-black"
              : "bg-paper text-ink-2 hover:text-ink"
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>{language === "ta" ? "பருவ கால அட்டவணை" : "Seasonal Calendar"}</span>
        </button>
      </div>

      {/* 5. Tab Content Panes */}

      {/* TAB A: GROWTH STAGES */}
      {activeTab === "stages" && (
        <motion.div variants={containerVariants} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crop.growthStages.map((stage, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-5 shadow-[var(--shadow-soft)] border border-line space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{stage.icon}</span>
                    <div>
                      <h4 className="font-black text-sm text-forest">
                        {language === "ta" ? stage.stageNameTa : stage.stageName}
                      </h4>
                      <span className="text-[10px] font-bold text-lime-900 bg-lime/30 px-2 py-0.5 rounded-full inline-block">
                        {language === "ta" ? stage.durationDaysTa : stage.durationDays}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-ink-3">Stage {idx + 1}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-bold text-ink block text-[11px] uppercase tracking-wider">
                    {language === "ta" ? "முக்கிய சாகுபடி நடவடிக்கைகள்:" : "Key Field Actions:"}
                  </span>
                  <ul className="space-y-1.5 text-ink-2 pl-4 list-disc marker:text-forest">
                    {(language === "ta" ? stage.keyActivitiesTa : stage.keyActivities).map((act, aIdx) => (
                      <li key={aIdx}>{act}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-line text-xs flex items-center gap-2 text-blue-700 bg-blue-50/60 p-2.5 rounded-xl">
                  <Droplets className="w-4 h-4 shrink-0 text-blue-600" />
                  <span className="font-medium text-[11px]">
                    <strong>Water:</strong> {language === "ta" ? stage.waterRequirementTa : stage.waterRequirement}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB B: COMMON DISEASES & SYMPTOMS */}
      {activeTab === "diseases" && (
        <motion.div variants={containerVariants} className="space-y-4">
          <div className="space-y-4">
            {crop.commonDiseases.map((dis) => (
              <div key={dis.id} className="bg-white rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-line space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3 flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-ink-3">
                      Pathogen: <em>{dis.pathogen}</em>
                    </span>
                    <h3 className="text-lg font-black text-forest">
                      {language === "ta" ? dis.nameTa : dis.name}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    dis.severityLevel === "Severe" 
                      ? "bg-red-100 text-red-900 border border-red-200" 
                      : "bg-amber-100 text-amber-900 border border-amber-200"
                  }`}>
                    {dis.severityLevel} Threat
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Genuine Pathology Photo */}
                  <div className="md:col-span-1">
                    <ImageWithFallback
                      imageKey={dis.imageKey}
                      alt={language === "ta" ? `${dis.nameTa} அறிகுறி` : `${dis.name} symptoms`}
                      aspectRatioClass="aspect-video"
                      language={language}
                      showCaption={true}
                      className="rounded-2xl"
                    />
                  </div>

                  {/* Symptoms & Prevention */}
                  <div className="md:col-span-2 space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-red-800 uppercase tracking-wider block mb-1">
                        {language === "ta" ? "நோய்க்கான முக்கிய அறிகுறிகள்:" : "Diagnostic Symptoms:"}
                      </span>
                      <ul className="space-y-1 text-ink-2 pl-4 list-disc marker:text-red-500">
                        {(language === "ta" ? dis.symptomsTa : dis.symptoms).map((sym, sIdx) => (
                          <li key={sIdx}>{sym}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                        {language === "ta" ? "இயற்கை மற்றும் தடுப்பு முறைகள்:" : "Cultural & Biological Prevention:"}
                      </span>
                      <ul className="space-y-1 text-ink-2 pl-4 list-disc marker:text-emerald-500">
                        {(language === "ta" ? dis.preventionTa : dis.prevention).map((prev, pIdx) => (
                          <li key={pIdx}>{prev}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Treatment Box */}
                <div className="bg-paper p-3.5 rounded-2xl border border-line text-xs space-y-1">
                  <span className="font-bold text-forest uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-leaf" />
                    <span>{language === "ta" ? "பல்கலைக்கழக பரிந்துரைத்த சிகிச்சை:" : "University Verified Treatment Protocol:"}</span>
                  </span>
                  <p className="text-ink-2 leading-relaxed">
                    {language === "ta" ? dis.treatmentAdvisoryTa : dis.treatmentAdvisory}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB C: WATER & NUTRITION MANAGEMENT */}
      {activeTab === "nutrition" && (
        <motion.div variants={containerVariants} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Irrigation Schedule */}
            <div className="bg-white rounded-3xl p-5 shadow-[var(--shadow-soft)] border border-line space-y-3">
              <div className="flex items-center gap-2 border-b border-line pb-2.5">
                <Droplets className="w-5 h-5 text-blue-600" />
                <h4 className="font-black text-sm text-forest">
                  {language === "ta" ? "சொட்டு நீர் பாசன வழிகாட்டுதல்" : "Irrigation Management"}
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-ink-2 pl-4 list-disc marker:text-blue-500">
                {(language === "ta" ? crop.wateringAndNutrition.irrigationScheduleTa : crop.wateringAndNutrition.irrigationSchedule).map((ir, iIdx) => (
                  <li key={iIdx}>{ir}</li>
                ))}
              </ul>
            </div>

            {/* Basal & Fertigation */}
            <div className="bg-white rounded-3xl p-5 shadow-[var(--shadow-soft)] border border-line space-y-3">
              <div className="flex items-center gap-2 border-b border-line pb-2.5">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <h4 className="font-black text-sm text-forest">
                  {language === "ta" ? "அடி உரம் மற்றும் மேலுர அட்டவணை" : "NPK Basal & Fertigation Schedule"}
                </h4>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
                <span className="font-bold text-emerald-900 block mb-0.5">Basal Nutrition:</span>
                <p className="text-emerald-800">
                  {language === "ta" ? crop.wateringAndNutrition.npkBasalTa : crop.wateringAndNutrition.npkBasal}
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-forest text-[11px] uppercase tracking-wider block">
                  {language === "ta" ? "சொட்டு நீர் வழியே உரம் (Fertigation):" : "Split Fertigation Doses:"}
                </span>
                <ul className="space-y-1.5 text-ink-2 pl-4 list-disc marker:text-emerald-500">
                  {(language === "ta" ? crop.wateringAndNutrition.fertigationPlanTa : crop.wateringAndNutrition.fertigationPlan).map((fert, fIdx) => (
                    <li key={fIdx}>{fert}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Micronutrient Advisory */}
          <div className="bg-amber-50/80 rounded-3xl p-4 border border-amber-200 text-xs flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950 uppercase tracking-wider block text-[11px]">
                {language === "ta" ? "நுண்ணூட்டச்சத்து மேலாண்மை:" : "Micronutrient Management Guidance:"}
              </span>
              <p className="text-amber-900 mt-1 leading-relaxed">
                {language === "ta" ? crop.wateringAndNutrition.microNutrientGuidanceTa : crop.wateringAndNutrition.microNutrientGuidance}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB D: TAMIL NADU SEASONAL CALENDAR */}
      {activeTab === "seasons" && (
        <motion.div variants={containerVariants} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {crop.seasonalCalendar.map((season, sIdx) => (
              <div key={sIdx} className="bg-white rounded-3xl p-5 shadow-[var(--shadow-soft)] border border-line flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-forest mb-1">
                    <Calendar className="w-4 h-4 text-forest-2" />
                    <span className="text-xs font-black">
                      {language === "ta" ? season.seasonNameTa : season.seasonName}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-lime-900 bg-lime/30 px-2 py-0.5 rounded-full inline-block">
                    {language === "ta" ? season.monthsTa : season.months}
                  </span>
                  <p className="text-xs text-ink-2 mt-2 leading-relaxed">
                    {language === "ta" ? season.descriptionTa : season.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-line text-[11px]">
                  <span className="font-bold text-forest block mb-1">Recommended Varieties:</span>
                  <div className="flex flex-wrap gap-1">
                    {season.recommendedVarieties.map((v, vIdx) => (
                      <span key={vIdx} className="px-2 py-0.5 bg-paper rounded-md border border-line text-ink font-medium">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
