import React, { useState } from "react";
import { TN_DISTRICTS, type TNDistrict, type VillageTown, getAllTNDistricts } from "../data/tamilNaduLocations";
import { MapPin, X, Check, Compass } from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDistrictId: string;
  currentTownName?: string;
  onSelectLocation: (district: TNDistrict, town: VillageTown) => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentDistrictId,
  currentTownName,
  onSelectLocation,
}) => {
  const { language } = useTranslation();
  const districts = getAllTNDistricts();

  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(currentDistrictId || "coimbatore");
  const activeDistrict: TNDistrict = TN_DISTRICTS[selectedDistrictId] || TN_DISTRICTS.coimbatore;
  const [selectedTown, setSelectedTown] = useState<VillageTown>(() => {
    const matched = activeDistrict.townsAndVillages.find(t => t.name === currentTownName);
    return matched || activeDistrict.townsAndVillages[0];
  });

  if (!isOpen) return null;

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    const newDist = TN_DISTRICTS[distId] || TN_DISTRICTS.coimbatore;
    setSelectedTown(newDist.townsAndVillages[0]);
  };

  const handleApply = () => {
    onSelectLocation(activeDistrict, selectedTown);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-line space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-forest text-lime flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-lg text-forest">
                {language === "ta" ? "இருப்பிடத்தை தேர்ந்தெடுக்கவும்" : "Select Your Tamil Nadu Location"}
              </h3>
              <p className="text-xs text-ink-2">
                {language === "ta" ? "துல்லியமான உள்ளூர் வானிலை மற்றும் விரிவாக்க சேவைகள்" : "District and block for localized weather and advisory"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-paper hover:bg-line text-ink-2 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* District Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-forest uppercase tracking-wider">
            {language === "ta" ? "1. மாவட்டம் (District):" : "1. Select District:"}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {districts.map((d) => {
              const isSelected = d.id === selectedDistrictId;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleDistrictChange(d.id)}
                  className={`p-3 rounded-2xl text-left border transition text-xs flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "bg-forest text-white border-forest shadow-xs ring-2 ring-lime/40"
                      : "bg-paper text-ink hover:border-forest/40 border-line"
                  }`}
                >
                  <span className={`font-black ${isSelected ? "text-lime" : "text-forest"}`}>
                    {d.name}
                  </span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? "text-white/80" : "text-ink-3"}`}>
                    {d.nameTa}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Village / Town / Taluk Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-forest uppercase tracking-wider">
            {language === "ta" ? "2. வட்டம் / ஊர் (Taluk / Village / Town):" : `2. Select Town / Village in ${activeDistrict.name}:`}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activeDistrict.townsAndVillages.map((t) => {
              const isSelected = selectedTown.name === t.name;
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedTown(t)}
                  className={`p-2.5 rounded-xl text-left border transition text-xs flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-emerald-700 text-white border-emerald-800 shadow-xs ring-1 ring-emerald-400 font-bold"
                      : "bg-white text-ink-2 hover:border-forest/30 border-line"
                  }`}
                >
                  <div className="truncate">
                    <span className="block font-bold text-[11px] truncate">{t.name}</span>
                    <span className={`text-[9px] block ${isSelected ? "text-emerald-200" : "text-ink-3"}`}>
                      {t.nameTa}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-lime" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Summary Card */}
        <div className="p-3.5 bg-paper rounded-2xl border border-line text-xs space-y-1">
          <div className="flex items-center gap-2 text-forest font-bold">
            <MapPin className="w-4 h-4 text-forest-2" />
            <span>
              {selectedTown.name}, {activeDistrict.name} ({activeDistrict.zone})
            </span>
          </div>
          <p className="text-[11px] text-ink-2">
            Coordinates: {activeDistrict.lat.toFixed(4)}°N, {activeDistrict.lng.toFixed(4)}°E • Primary crops: {activeDistrict.primaryCrops.join(", ")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-line text-xs font-semibold text-ink-2 hover:bg-paper cursor-pointer"
          >
            {language === "ta" ? "ரத்து செய்" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-hover text-cream text-xs font-bold shadow-md border border-lime/30 flex items-center gap-2 cursor-pointer transition active:scale-95"
          >
            <Check className="w-4 h-4 text-lime" />
            <span>{language === "ta" ? "இருப்பிடத்தை உறுதி செய்" : "Apply Location"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
