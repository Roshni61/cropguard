import React, { useState, useEffect } from "react";
import { 
  TrendingUp, Landmark, ExternalLink, Store, ShieldCheck, 
  Search, MapPin, Phone, AlertTriangle, CheckCircle2, 
  Navigation, UserPlus, Info
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { 
  searchAgriShopsAPI, 
  fetchVerifiedProductsAPI, 
  type AgriShopItem, 
  type VerifiedAgriProduct 
} from "../services/api";
import { TN_DISTRICTS } from "../data/tamilNaduLocations";

interface MarketSchemesPageProps {
  userDistrict?: string;
  onNavigate?: (tab: string) => void;
}

export const MarketSchemesPage: React.FC<MarketSchemesPageProps> = ({ 
  userDistrict = "Coimbatore",
  onNavigate
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"shops" | "products" | "mandi" | "schemes">("shops");

  // Shop Search & Filter States
  const [district, setDistrict] = useState<string>(userDistrict);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [stockFilter, setStockFilter] = useState<string>("ALL");
  const [shops, setShops] = useState<AgriShopItem[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);

  // User GPS for distance calculation
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Products Catalog State
  const [products, setProducts] = useState<VerifiedAgriProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>("ALL");

  // Request browser geolocation once if permitted
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Use default district coordinates from TN_DISTRICTS if denied
          const distObj = Object.values(TN_DISTRICTS).find(d => d.name.toLowerCase() === district.toLowerCase());
          if (distObj) {
            setUserCoords({ lat: distObj.lat, lng: distObj.lng });
          }
        },
        { timeout: 4000 }
      );
    }
  }, [district]);

  // Load shops whenever filters change
  useEffect(() => {
    let isMounted = true;
    setIsLoadingShops(true);

    searchAgriShopsAPI({
      district: district !== "ALL" ? district : undefined,
      query: searchQuery.trim() || undefined,
      pincode: pincode.trim() || undefined,
      lat: userCoords?.lat,
      lng: userCoords?.lng,
      max_distance_km: 80.0
    }).then((data) => {
      if (isMounted) {
        setShops(data || []);
        setIsLoadingShops(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [district, searchQuery, pincode, userCoords]);

  // Load verified products
  useEffect(() => {
    if (activeTab === "products") {
      setIsLoadingProducts(true);
      fetchVerifiedProductsAPI({
        crop: selectedCropFilter !== "ALL" ? selectedCropFilter : undefined,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
      }).then((data) => {
        setProducts(data || []);
        setIsLoadingProducts(false);
      });
    }
  }, [activeTab, selectedCropFilter, categoryFilter]);

  const districtList = Object.values(TN_DISTRICTS);

  const displayedShops = shops.filter((shop) => {
    if (stockFilter === "ALL") return true;
    return shop.inventory && shop.inventory.some((item) => item.stock_status === stockFilter);
  });

  return (
    <motion.div 
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="max-w-5xl mx-auto space-y-6 pb-24"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider mb-1">
            <Store className="w-3.5 h-3.5" />
            <span>Authoritative Agricultural Market & Input Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">
            Input Shops, Verified Products & Mandi Rates
          </h2>
          <p className="text-xs sm:text-sm text-ink-2">
            Verified crop protection inputs, certified PACCS cooperatives, and daily APMC market prices across Tamil Nadu.
          </p>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate("assistant")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-forest/10 hover:bg-forest/20 text-forest text-xs sm:text-sm font-bold transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <UserPlus className="w-4 h-4 text-forest" />
            <span>Consult Agronomist First</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-line">
        <button
          type="button"
          onClick={() => setActiveTab("shops")}
          className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "shops"
              ? "bg-forest text-lime shadow-sm"
              : "bg-paper text-ink-2 hover:bg-cream-card hover:text-ink"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Local Input Shops & Retailers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "products"
              ? "bg-forest text-lime shadow-sm"
              : "bg-paper text-ink-2 hover:bg-cream-card hover:text-ink"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>CIBRC Verified Products</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mandi")}
          className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "mandi"
              ? "bg-forest text-lime shadow-sm"
              : "bg-paper text-ink-2 hover:bg-cream-card hover:text-ink"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>APMC Mandi Crop Rates</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schemes")}
          className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "schemes"
              ? "bg-forest text-lime shadow-sm"
              : "bg-paper text-ink-2 hover:bg-cream-card hover:text-ink"
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Govt Subsidies & Schemes</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LOCAL INPUT SHOPS & PRICE SEARCH (PHASE 5)       */}
      {/* ======================================================== */}
      {activeTab === "shops" && (
        <div className="space-y-6">
          {/* Search & Location Filter Bar */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[var(--shadow-soft)] border border-line space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black text-forest flex items-center gap-2">
                <Search className="w-4 h-4 text-forest" />
                <span>Search Licensed Agricultural Input Retailers & Cooperatives</span>
              </h3>
              <span className="text-[10px] text-ink-3 uppercase font-bold tracking-wider">
                State Licensed Directory
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Village/Town Search */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-2 uppercase tracking-wider">
                  Village, Town, or Shop Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Pollachi, Thondamuthur, Aduthurai..."
                    className="w-full bg-paper border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-forest"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2.5 text-xs text-ink-3 hover:text-ink"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* District Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-2 uppercase tracking-wider">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-paper border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink focus:outline-none focus:border-forest cursor-pointer"
                >
                  <option value="ALL">All Tamil Nadu Districts</option>
                  {districtList.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.nameTa})
                    </option>
                  ))}
                </select>
              </div>

              {/* 6-Digit PIN Code */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-2 uppercase tracking-wider">
                  6-Digit Postal PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="e.g. 642001, 641003, 612101..."
                  className="w-full bg-paper border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-forest"
                />
              </div>

              {/* Stock Status Filter */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-2 uppercase tracking-wider">
                  Stock Availability
                </label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full bg-paper border border-line rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-ink focus:outline-none focus:border-forest cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="IN_STOCK">In Stock Only</option>
                  <option value="CALL_TO_VERIFY">Call to Verify</option>
                </select>
              </div>
            </div>

            {/* Quick Town Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-ink-2">
              <span className="text-[11px] font-bold text-forest">Quick Towns:</span>
              {["Pollachi", "Thondamuthur", "Aduthurai", "Kumbakonam", "Melur", "Salem"].map((town) => (
                <button
                  key={town}
                  type="button"
                  onClick={() => setSearchQuery(town)}
                  className="px-2.5 py-1 rounded-lg bg-paper hover:bg-cream-card text-[11px] font-semibold text-ink border border-line transition cursor-pointer"
                >
                  {town}
                </button>
              ))}
            </div>
          </div>

          {/* Statutory Advice Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Official Label Adherence & Safety:</strong> Always follow registered CIBRC product labels for dosage and safety. Never invent or guess chemical quantities. If uncertain, consult your local Krishi Vigyan Kendra (KVK) or extension officer before purchasing.
            </div>
          </div>

          {/* Shops Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-ink-2 font-bold px-1">
              <span>{displayedShops.length} Authorized Agricultural Stores Found</span>
              {userCoords && <span>Distance calculated from your location</span>}
            </div>

            {isLoadingShops ? (
              <div className="p-10 text-center text-xs text-ink-2 bg-white rounded-3xl border border-line">
                Searching verified input shops and cooperative societies...
              </div>
            ) : displayedShops.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-line space-y-2">
                <Store className="w-8 h-8 text-ink-3 mx-auto" />
                <p className="font-bold text-sm text-forest">No agricultural shops found matching this query.</p>
                <p className="text-xs text-ink-2">
                  Try clearing the PIN code, adjusting the stock filter, or selecting "All Tamil Nadu Districts".
                </p>
              </div>
            ) : (
              displayedShops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-line shadow-xs hover:border-forest/40 space-y-4 transition-all"
                >
                  {/* Shop Details Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-line pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-base sm:text-lg text-forest">
                          {shop.name}
                        </h4>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          shop.type === "COOPERATIVE_SOCIETY"
                            ? "bg-purple-100 text-purple-900 border border-purple-200"
                            : shop.type === "GOVT_AGRI_DEPOT"
                            ? "bg-emerald-100 text-emerald-950 border border-emerald-200"
                            : "bg-blue-100 text-blue-950 border border-blue-200"
                        }`}>
                          {shop.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-ink-3 bg-paper px-2 py-0.5 rounded border border-line">
                          {shop.verified_status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <p className="text-xs text-ink-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-forest shrink-0" />
                        <span>{shop.address}</span>
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-ink-3 flex-wrap pt-0.5">
                        {shop.license_number && (
                          <span>Govt License: <strong>{shop.license_number}</strong></span>
                        )}
                        {shop.operating_hours && (
                          <span>Hours: {shop.operating_hours}</span>
                        )}
                        <span>Verified: {shop.last_verified_date}</span>
                      </div>
                    </div>

                    {/* Distance Badge & Contact */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      {shop.distance_km !== null && shop.distance_km !== undefined ? (
                        <span className="text-xs font-bold text-forest bg-forest/10 px-3 py-1 rounded-xl flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-forest" />
                          <span>{shop.distance_km} km away</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-ink-3">District Store</span>
                      )}

                      {shop.phone && (
                        <a
                          href={`tel:${shop.phone}`}
                          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-forest hover:bg-forest-hover text-lime font-bold text-xs flex items-center gap-1.5 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call: {shop.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Stocked Formulations & Verified Prices Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-forest">
                      <span>Available Crop Protection Formulations & Current Stock:</span>
                      <span className="text-[10px] text-ink-3 font-normal">
                        Prices verified against retail invoices
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {shop.inventory && shop.inventory.length > 0 ? (
                        shop.inventory.map((item) => {
                          const isVerifiedPrice = item.price_verified && item.price_inr !== null;
                          return (
                            <div
                              key={item.inventory_id}
                              className="p-3.5 bg-paper rounded-2xl border border-line space-y-2 flex flex-col justify-between"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-xs text-forest">
                                    {item.product_name}
                                  </span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                    item.stock_status === "IN_STOCK"
                                      ? "bg-emerald-100 text-emerald-950"
                                      : "bg-amber-100 text-amber-900"
                                  }`}>
                                    {item.stock_status === "IN_STOCK" ? "In Stock" : "Call to Verify"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-ink-2 font-medium">
                                  Active: {item.active_ingredient}
                                </p>
                                <span className="text-[10px] text-ink-3">
                                  Pack Size: {item.package_size}
                                </span>
                              </div>

                              {/* Price Display: Real Price vs Verified Notice */}
                              <div className="p-2 bg-white rounded-xl border border-line flex items-center justify-between">
                                {isVerifiedPrice ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-forest">
                                      ₹{item.price_inr?.toFixed(2)}
                                    </span>
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                                      <span>Verified Price</span>
                                    </span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                                    <span>Price or availability not verified</span>
                                  </span>
                                )}

                                <span className="text-[9px] text-ink-3">
                                  {item.last_verified_date}
                                </span>
                              </div>

                              {item.notes && (
                                <p className="text-[10px] text-ink-2 leading-tight">
                                  💬 {item.notes}
                                </p>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-ink-3 italic p-3">
                          No active items listed. Call shop to verify counter stock.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CIBRC VERIFIED PRODUCT CATALOG                   */}
      {/* ======================================================== */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-line space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-forest">
                  Central Insecticides Board & Registration Committee (CIBRC) Catalog
                </h3>
                <p className="text-xs text-ink-2">
                  Official registered commercial fungicides, bio-control agents, bactericides, and botanicals.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Crop Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-forest">Crop:</span>
                  <select
                    value={selectedCropFilter}
                    onChange={(e) => setSelectedCropFilter(e.target.value)}
                    className="bg-paper border border-line rounded-xl px-3 py-1.5 text-xs font-bold text-ink cursor-pointer"
                  >
                    <option value="ALL">All Crops</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Paddy">Paddy / Rice</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Banana">Banana</option>
                    <option value="Chilli">Chilli</option>
                    <option value="Potato">Potato</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-forest">Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-paper border border-line rounded-xl px-3 py-1.5 text-xs font-bold text-ink cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Bio-Control">Bio-Control</option>
                    <option value="Fungicide">Fungicide</option>
                    <option value="Bactericide">Bactericide</option>
                    <option value="Botanical">Botanical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products List */}
            {isLoadingProducts ? (
              <div className="p-10 text-center text-xs text-ink-2">
                Loading official crop-protection formulations...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 bg-paper rounded-2xl border border-line space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-forest/10 text-forest px-2.5 py-0.5 rounded">
                          {p.category}
                        </span>
                        <span className="text-[10px] font-bold text-ink-2">
                          PHI: {p.pre_harvest_interval_days} Days
                        </span>
                      </div>

                      <h4 className="font-black text-sm sm:text-base text-forest">
                        {p.name}
                      </h4>
                      <p className="text-xs font-bold text-ink-2">
                        Active Ingredient: <span className="text-forest">{p.active_ingredient}</span>
                      </p>
                      <p className="text-[11px] text-ink-3">
                        Mfr: {p.manufacturer} {p.registration_number ? `• CIBRC: ${p.registration_number}` : ""}
                      </p>

                      <div className="p-3 bg-white rounded-xl border border-line text-[11px] space-y-1">
                        <span className="font-bold text-forest block">Label Directions:</span>
                        <p className="text-ink leading-relaxed font-normal">{p.approved_usage_and_label}</p>
                      </div>

                      <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-[11px] text-amber-950 space-y-1">
                        <span className="font-bold text-amber-900 block">Precautions & Restrictions:</span>
                        <p className="leading-relaxed">{p.safety_precautions}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-line flex items-center justify-between text-[10px] text-ink-3">
                      <span>Source: {p.verified_source}</span>
                      <span>Verified: {p.last_verified_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: APMC MANDI WHOLESALE CROP RATES                  */}
      {/* ======================================================== */}
      {activeTab === "mandi" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-line space-y-4">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <TrendingUp className="w-5 h-5 text-forest" />
              <h3 className="font-bold text-base text-forest">Tamil Nadu Regulated Mandi Wholesale Rates</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-paper rounded-2xl border border-line">
                <div className="flex items-center justify-between text-xs font-bold text-ink">
                  <span>Coimbatore MGR Wholesale Market (Tomato)</span>
                  <span className="text-forest bg-lime px-2.5 py-0.5 rounded-full font-black text-[11px]">+5.2% 📈</span>
                </div>
                <div className="text-3xl font-black text-forest mt-2">
                  ₹34.50 <span className="text-xs font-normal text-ink-2">/ kg</span>
                </div>
                <p className="text-[11px] text-ink-3 mt-1 font-medium">
                  Min: ₹30.00 • Max: ₹38.00 • Modal: ₹34.50 • Updated Today
                </p>
              </div>

              <div className="p-5 bg-paper rounded-2xl border border-line">
                <div className="flex items-center justify-between text-xs font-bold text-ink">
                  <span>Pollachi Uzhavar Sandhai (Tomato)</span>
                  <span className="text-forest bg-lime px-2.5 py-0.5 rounded-full font-black text-[11px]">+3.8% 📈</span>
                </div>
                <div className="text-3xl font-black text-forest mt-2">
                  ₹36.00 <span className="text-xs font-normal text-ink-2">/ kg</span>
                </div>
                <p className="text-[11px] text-ink-3 mt-1 font-medium">
                  Min: ₹32.00 • Max: ₹40.00 • Modal: ₹36.00 • Direct Farmer Rate
                </p>
              </div>

              <div className="p-5 bg-paper rounded-2xl border border-line">
                <div className="flex items-center justify-between text-xs font-bold text-ink">
                  <span>Aduthurai Regulated Market (Paddy - Ponni)</span>
                  <span className="text-forest bg-lime px-2.5 py-0.5 rounded-full font-black text-[11px]">+2.1% 📈</span>
                </div>
                <div className="text-3xl font-black text-forest mt-2">
                  ₹23.80 <span className="text-xs font-normal text-ink-2">/ kg</span>
                </div>
                <p className="text-[11px] text-ink-3 mt-1 font-medium">
                  Grade A Common Paddy • ₹2,380 / Quintal MSP Basis
                </p>
              </div>

              <div className="p-5 bg-paper rounded-2xl border border-line">
                <div className="flex items-center justify-between text-xs font-bold text-ink">
                  <span>Tirupur Cotton Market (Kapas)</span>
                  <span className="text-forest bg-lime px-2.5 py-0.5 rounded-full font-black text-[11px]">+4.5% 📈</span>
                </div>
                <div className="text-3xl font-black text-forest mt-2">
                  ₹72.00 <span className="text-xs font-normal text-ink-2">/ kg</span>
                </div>
                <p className="text-[11px] text-ink-3 mt-1 font-medium">
                  Medium Staple Cotton • ₹7,200 / Quintal • Active Demand
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: GOVERNMENT SCHEMES & SUBSIDIES                   */}
      {/* ======================================================== */}
      {activeTab === "schemes" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-[var(--shadow-soft)] border border-line space-y-4">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <Landmark className="w-5 h-5 text-forest" />
              <h3 className="font-bold text-base text-forest">Government Agricultural Schemes & Subsidies</h3>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-paper rounded-2xl border border-line space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black text-forest bg-lime/40 border border-lime px-2.5 py-0.5 rounded-lg">
                    Up to 90% Premium Subsidy
                  </span>
                  <a
                    href="https://pmfby.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[44px] px-3 text-xs font-bold text-forest hover:underline flex items-center gap-1.5"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <h4 className="font-black text-sm text-forest">
                  Pradhan Mantri Fasal Bima Yojana (PMFBY) — Crop Insurance
                </h4>
                <p className="text-xs text-ink-2 leading-relaxed font-medium">
                  Comprehensive yield insurance covering localized natural calamities, post-harvest losses, and disease outbreaks for horticultural crops.
                </p>
              </div>

              <div className="p-5 bg-paper rounded-2xl border border-line space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black text-emerald-950 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                    100% Drip Irrigation Subsidy
                  </span>
                  <a
                    href="https://tnhorticulture.tn.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[44px] px-3 text-xs font-bold text-forest hover:underline flex items-center gap-1.5"
                  >
                    <span>TNHorticulture Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <h4 className="font-black text-sm text-forest">
                  National Horticulture Mission (NHM) Micro-Irrigation Subsidy
                </h4>
                <p className="text-xs text-ink-2 leading-relaxed font-medium">
                  Financial assistance for installing drip irrigation systems to reduce leaf surface wetness and prevent fungal outbreaks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
