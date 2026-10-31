import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck, AlertTriangle, Store, Phone, Clock, ExternalLink,
  Info, UserPlus, CheckCircle2, MapPin, Navigation, X
} from "lucide-react";
import { 
  fetchVerifiedProductsAPI, 
  fetchProductAvailabilityAPI, 
  type VerifiedAgriProduct, 
  type ProductAvailabilityItem 
} from "../services/api";

interface VerifiedProductsModuleProps {
  crop?: string;
  disease?: string;
  district?: string;
  onAskExpert?: (productName: string, activeIngredient: string) => void;
  compact?: boolean;
}

export const VerifiedProductsModule: React.FC<VerifiedProductsModuleProps> = ({
  crop,
  disease,
  district = "Coimbatore",
  onAskExpert,
  compact = false,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [products, setProducts] = useState<VerifiedAgriProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Availability modal state
  const [selectedProductForShops, setSelectedProductForShops] = useState<VerifiedAgriProduct | null>(null);
  const [shopAvailability, setShopAvailability] = useState<ProductAvailabilityItem[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchVerifiedProductsAPI({
      crop: crop && crop.toLowerCase() !== "auto-detect" ? crop : undefined,
      disease: disease && !disease.toLowerCase().includes("healthy") ? disease : undefined,
      category: selectedCategory !== "ALL" ? selectedCategory : undefined,
    }).then((list) => {
      if (isMounted) {
        setProducts(list || []);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [crop, disease, selectedCategory]);

  const handleOpenShops = async (product: VerifiedAgriProduct) => {
    setSelectedProductForShops(product);
    setIsLoadingShops(true);
    setShopAvailability([]);

    try {
      const res = await fetchProductAvailabilityAPI(product.id, { district });
      if (res && res.availability) {
        setShopAvailability(res.availability);
      }
    } catch {
      setShopAvailability([]);
    } finally {
      setIsLoadingShops(false);
    }
  };

  const categories = [
    { id: "ALL", label: "All Categories" },
    { id: "Fungicide", label: "Fungicides" },
    { id: "Bio-Control", label: "Bio-Control" },
    { id: "Bactericide", label: "Bactericides" },
    { id: "Botanical", label: "Botanical Neem" },
  ];

  return (
    <div className="space-y-4">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-forest" />
            <h4 className="font-black text-base sm:text-lg text-forest tracking-tight">
              Eligible CIBRC-Approved Treatment Products
            </h4>
          </div>
          <p className="text-xs text-ink-2 mt-0.5">
            Registered commercial formulations verified against authoritative Central Insecticides Board labels.
          </p>
        </div>

        <span className="text-[10px] font-bold text-forest bg-forest/10 px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
          {district} Extension District
        </span>
      </div>

      {/* Category Filter Chips */}
      {!compact && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === c.id
                  ? "bg-forest text-lime shadow-xs"
                  : "bg-paper hover:bg-cream-card text-ink-2 border border-line"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-ink-2 bg-paper rounded-2xl border border-line">
          Loading verified crop-protection formulations...
        </div>
      ) : products.length === 0 ? (
        <div className="p-6 text-center text-xs text-ink-2 bg-paper rounded-2xl border border-line space-y-1">
          <p className="font-bold text-forest">No registered synthetic treatments for this condition.</p>
          <p className="text-[11px]">
            Follow safe cultural practices and organic bio-control agents, or consult your local KVK extension officer.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => {
            const isBio = p.category === "Bio-Control" || p.category === "Botanical";
            return (
              <motion.div
                key={p.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 border border-line shadow-xs hover:border-forest/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
              >
                {/* Top Header: Brand & Active Ingredient */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                      isBio
                        ? "bg-emerald-100 text-emerald-950 border border-emerald-200"
                        : "bg-blue-100 text-blue-950 border border-blue-200"
                    }`}>
                      {p.category}
                    </span>
                    <span className="text-[10px] text-ink-3 font-semibold">
                      PHI: {p.pre_harvest_interval_days} Days
                    </span>
                  </div>

                  <h5 className="font-black text-sm sm:text-base text-forest leading-snug">
                    {p.name}
                  </h5>

                  <p className="text-xs font-bold text-ink-2">
                    Active: <span className="text-forest font-semibold">{p.active_ingredient}</span>
                  </p>

                  <p className="text-[11px] text-ink-3">
                    Mfr: {p.manufacturer} {p.registration_number ? `• CIBRC: ${p.registration_number}` : ""}
                  </p>
                </div>

                {/* Approved Usage and Label Directions */}
                <div className="p-3 bg-paper rounded-xl border border-line text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-forest text-[11px] uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-forest" />
                    <span>Approved Label Directions:</span>
                  </div>
                  <p className="text-ink leading-relaxed font-normal text-[11px]">
                    {p.approved_usage_and_label}
                  </p>
                </div>

                {/* Safety Precautions & Restrictions */}
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[10px] uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Safety Precautions & Restrictions:</span>
                  </div>
                  <p className="leading-relaxed">
                    {p.safety_precautions}
                  </p>
                </div>

                {/* Source & Last Verified Date */}
                <div className="flex items-center justify-between text-[10px] text-ink-3 border-t border-line pt-2">
                  <span>Source: {p.verified_source}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Verified: {p.last_verified_date}</span>
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenShops(p)}
                    className="py-2.5 px-3 rounded-xl bg-forest hover:bg-forest-hover text-cream font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Store className="w-3.5 h-3.5 text-lime" />
                    <span>Find in Local Shops</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onAskExpert) {
                        onAskExpert(p.name, p.active_ingredient);
                      }
                    }}
                    className="py-2.5 px-3 rounded-xl bg-paper hover:bg-cream-card text-forest font-bold text-xs border border-line flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-forest" />
                    <span>Ask Expert First</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Local Shop Availability Modal */}
      {selectedProductForShops && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-line space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-line">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest/10 text-forest text-[11px] font-bold uppercase tracking-wider mb-1">
                  <Store className="w-3.5 h-3.5" />
                  <span>Local Agricultural Retailers • {district}</span>
                </div>
                <h3 className="font-black text-lg text-forest">
                  Availability for {selectedProductForShops.name}
                </h3>
                <p className="text-xs text-ink-2 font-medium">
                  Active Ingredient: {selectedProductForShops.active_ingredient}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProductForShops(null)}
                className="p-2 text-ink-2 hover:text-ink rounded-xl cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Retailers List */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {isLoadingShops ? (
                <div className="py-10 text-center text-xs text-ink-2">
                  Searching authorized input retailers in {district}...
                </div>
              ) : shopAvailability.length === 0 ? (
                <div className="p-8 text-center bg-paper rounded-2xl border border-line space-y-2">
                  <p className="font-bold text-xs text-forest">
                    No authorized stores in {district} have live inventory logged for this formulation.
                  </p>
                  <p className="text-[11px] text-ink-2 leading-relaxed">
                    Contact your local Primary Agricultural Cooperative Credit Society (PACCS) or Block Agricultural Extension Depot directly.
                  </p>
                </div>
              ) : (
                shopAvailability.map((shop, idx) => {
                  const isVerifiedPrice = shop.price_verified && shop.price_inr !== null;
                  return (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-paper border border-line space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-forest">{shop.shop_name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-line text-ink-2">
                              {shop.shop_type.replace("_", " ")}
                            </span>
                            {shop.license_number && (
                              <span className="text-[10px] text-ink-3">
                                Lic: {shop.license_number}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-ink-2 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-forest shrink-0" />
                            <span>{shop.address}</span>
                          </p>
                        </div>

                        {shop.distance_km !== null && shop.distance_km !== undefined && (
                          <span className="text-xs font-bold text-forest bg-forest/10 px-2.5 py-1 rounded-xl flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-forest" />
                            <span>{shop.distance_km} km away</span>
                          </span>
                        )}
                      </div>

                      {/* Package & Pricing Bar */}
                      <div className="p-3 bg-white rounded-xl border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase text-ink-3 tracking-wider">
                            Package Size: {shop.package_size}
                          </span>
                          <div className="flex items-center gap-2">
                            {isVerifiedPrice ? (
                              <>
                                <span className="text-base font-black text-forest">
                                  ₹{shop.price_inr?.toFixed(2)}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                  <span>Verified Retail Price</span>
                                </span>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                                <span>Price or availability not verified</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stock Status Badge */}
                        <div className="text-right">
                          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg inline-block ${
                            shop.stock_status === "IN_STOCK"
                              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                              : "bg-amber-50 text-amber-900 border border-amber-200"
                          }`}>
                            {shop.stock_status === "IN_STOCK" ? "✓ In Stock" : "⚠️ Call to Verify"}
                          </span>
                          <span className="block text-[10px] text-ink-3 mt-0.5">
                            Verified: {shop.last_verified_date}
                          </span>
                        </div>
                      </div>

                      {shop.notes && (
                        <p className="text-[11px] text-ink-2 bg-paper/60 px-2 py-1 rounded">
                          💡 <strong>Note:</strong> {shop.notes}
                        </p>
                      )}

                      {/* Contact Options */}
                      <div className="flex items-center gap-3 pt-1">
                        {shop.phone && (
                          <a
                            href={`tel:${shop.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest text-lime font-bold text-xs hover:bg-forest-hover transition"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Shop: {shop.phone}</span>
                          </a>
                        )}
                        {shop.whatsapp && (
                          <a
                            href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, "")}?text=Hello,%20is%20${encodeURIComponent(selectedProductForShops.name)}%20available%20in%20stock?`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                          >
                            <span>WhatsApp Inquiry</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-line flex items-center justify-between text-xs text-ink-2">
              <span className="text-[11px]">
                Always follow registered CIBRC label directions.
              </span>
              <button
                type="button"
                onClick={() => setSelectedProductForShops(null)}
                className="px-4 py-2 bg-paper hover:bg-cream-card text-forest font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
