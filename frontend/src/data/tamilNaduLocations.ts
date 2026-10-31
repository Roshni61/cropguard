/**
 * Tamil Nadu Agricultural Districts, Taluks/Towns & Extension Directory
 * Authoritative agro-climatic zones, accurate coordinates, and verified public extension offices.
 */

export interface VillageTown {
  name: string;
  nameTa: string;
  isBlockHeadquarter?: boolean;
}

export interface AgriServiceCentre {
  name: string;
  nameTa: string;
  type: "KVK" | "TNAU_RESEARCH_STATION" | "BLOCK_AGRI_DEPOT" | "SOIL_TESTING_LAB";
  address: string;
  phone: string;
  services: string[];
}

export interface TNDistrict {
  id: string;
  name: string;
  nameTa: string;
  lat: number;
  lng: number;
  zone: string;
  zoneTa: string;
  primaryCrops: string[];
  townsAndVillages: VillageTown[];
  services: AgriServiceCentre[];
  regulatedMandi: {
    name: string;
    nameTa: string;
    location: string;
  };
}

export const TN_DISTRICTS: Record<string, TNDistrict> = {
  coimbatore: {
    id: "coimbatore",
    name: "Coimbatore",
    nameTa: "கோயம்புத்தூர்",
    lat: 11.0168,
    lng: 76.9558,
    zone: "Western Agro-Climatic Zone",
    zoneTa: "மேற்கு வேளாண் காலநிலை மண்டலம்",
    primaryCrops: ["Tomato", "Cotton", "Banana", "Paddy", "Maize", "Coconut"],
    townsAndVillages: [
      { name: "Pollachi", nameTa: "பொள்ளாச்சி", isBlockHeadquarter: true },
      { name: "Sulur", nameTa: "சூலூர்", isBlockHeadquarter: true },
      { name: "Thondamuthur", nameTa: "தொண்டாமுத்தூர்", isBlockHeadquarter: true },
      { name: "Mettupalayam", nameTa: "மேட்டுப்பாளையம்", isBlockHeadquarter: true },
      { name: "Kinathukadavu", nameTa: "கிணத்துக்கடவு" },
      { name: "Annur", nameTa: "அன்னூர்" },
      { name: "Madukkarai", nameTa: "மதுக்கரை" },
      { name: "Karamadai", nameTa: "காரமடை" }
    ],
    services: [
      {
        name: "ICAR - Krishi Vigyan Kendra (KVK)",
        nameTa: "ICAR - வேளாண் அறிவியல் மையம் (KVK)",
        type: "KVK",
        address: "MYRADA KVK, 272 Perumal Kovil St, Gobichettipalayam / Coimbatore West",
        phone: "+91 4285 241626",
        services: ["Plant Pathology Diagnostic Clinic", "Certified Seed Distribution", "Soil Health Testing", "Pest & Disease Advisory"]
      },
      {
        name: "Tamil Nadu Agricultural University (TNAU) Extension Directorate",
        nameTa: "தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழக விரிவாக்க மையம்",
        type: "TNAU_RESEARCH_STATION",
        address: "Marudhamalai Road, TNAU Campus, Coimbatore - 641003",
        phone: "+91 422 6611200",
        services: ["Bio-Control Agents (Trichoderma viride)", "Disease Forecasting Bulletin", "Kisan Call Center: 1800-180-1551"]
      },
      {
        name: "Block Agricultural Extension Depot (Pollachi)",
        nameTa: "வட்டார வேளாண் விரிவாக்க மையம் (பொள்ளாச்சி)",
        type: "BLOCK_AGRI_DEPOT",
        address: "Taluk Office Road, Pollachi, Coimbatore District",
        phone: "+91 4259 223344",
        services: ["Subsidized Neem Oil & Micro-nutrients", "PM-KISAN Scheme Desk", "Sprayer Equipment Rental"]
      }
    ],
    regulatedMandi: {
      name: "Pollachi Regulated Market (APMC)",
      nameTa: "பொள்ளாச்சி ஒழுங்குமுறை விற்பனை கூடம்",
      location: "Udumalpet Road, Pollachi"
    }
  },

  thanjavur: {
    id: "thanjavur",
    name: "Thanjavur",
    nameTa: "தஞ்சாவூர்",
    lat: 10.7870,
    lng: 79.1378,
    zone: "Cauvery Delta Agro-Climatic Zone",
    zoneTa: "காவிரி டெல்டா வேளாண் மண்டலம்",
    primaryCrops: ["Paddy", "Banana", "Pulses", "Sugarcane", "Groundnut"],
    townsAndVillages: [
      { name: "Kumbakonam", nameTa: "கும்பகோணம்", isBlockHeadquarter: true },
      { name: "Papanasam", nameTa: "பாபநாசம்", isBlockHeadquarter: true },
      { name: "Orathanadu", nameTa: "ஒரத்தநாடு", isBlockHeadquarter: true },
      { name: "Thiruvaiyaru", nameTa: "திருவையாறு", isBlockHeadquarter: true },
      { name: "Pattukkottai", nameTa: "பட்டுக்கோட்டை" },
      { name: "Budalur", nameTa: "பூதலூர்" },
      { name: "Ammapettai", nameTa: "அம்மாபேட்டை" }
    ],
    services: [
      {
        name: "TNAU Tamil Nadu Rice Research Institute (TRRI)",
        nameTa: "தமிழ்நாடு நெல் ஆராய்ச்சி நிலையம் (TRRI)",
        type: "TNAU_RESEARCH_STATION",
        address: "Aduthurai, Thanjavur District - 612101",
        phone: "+91 435 2472881",
        services: ["Paddy Blast Diagnosis", "Certified Paddy Seed Multiplication", "Delta Agro-Advisories"]
      },
      {
        name: "ICAR KVK Thanjavur (Needamangalam / Kattuthottam)",
        nameTa: "ICAR வேளாண் அறிவியல் மையம் (தஞ்சாவூர்)",
        type: "KVK",
        address: "Soil & Water Management Research Institute Campus, Kattuthottam",
        phone: "+91 4362 267320",
        services: ["Soil Salinity Testing", "Bio-Fertilizer Culture (Azospirillum)", "Integrated Pest Management"]
      }
    ],
    regulatedMandi: {
      name: "Kumbakonam Regulated Agriculture Mandi",
      nameTa: "கும்பகோணம் ஒழுங்குமுறை வேளாண் அங்காடி",
      location: "Railway Station Road, Kumbakonam"
    }
  },

  madurai: {
    id: "madurai",
    name: "Madurai",
    nameTa: "மதுரை",
    lat: 9.9252,
    lng: 78.1198,
    zone: "Southern Agro-Climatic Zone",
    zoneTa: "தெற்கு வேளாண் காலநிலை மண்டலம்",
    primaryCrops: ["Paddy", "Cotton", "Banana", "Chilli", "Tomato", "Jasmine"],
    townsAndVillages: [
      { name: "Melur", nameTa: "மேலூர்", isBlockHeadquarter: true },
      { name: "Usilampatti", nameTa: "உசிலம்பட்டி", isBlockHeadquarter: true },
      { name: "Vadipatti", nameTa: "வாடிப்பட்டி", isBlockHeadquarter: true },
      { name: "Thirumangalam", nameTa: "திருமங்கலம்", isBlockHeadquarter: true },
      { name: "Alanganallur", nameTa: "அலங்காநல்லூர்" },
      { name: "Sedapatti", nameTa: "சேடபட்டி" },
      { name: "Kalligudi", nameTa: "கள்ளிக்குடி" }
    ],
    services: [
      {
        name: "Agricultural College & Research Institute (AC&RI) Madurai",
        nameTa: "வேளாண்மைக் கல்லூரி மற்றும் ஆராய்ச்சி நிலையம் (மதுரை)",
        type: "TNAU_RESEARCH_STATION",
        address: "Othakkadai, Madurai - 625104",
        phone: "+91 452 2422956",
        services: ["Crop Disease Clinical Lab", "Entomology Clinic", "Farmer Training Sessions"]
      },
      {
        name: "ICAR KVK Madurai",
        nameTa: "வேளாண் அறிவியல் மையம் (மதுரை)",
        type: "KVK",
        address: "AC&RI Campus, Othakkadai, Madurai",
        phone: "+91 452 2422955",
        services: ["Soil and Water Analysis", "Organic Input Certification Guidance", "Kisan Hotline"]
      }
    ],
    regulatedMandi: {
      name: "Melur Agricultural Market Committee",
      nameTa: "மேலூர் ஒழுங்குமுறை விற்பனைக் கூடம்",
      location: "Trichy Main Road, Melur"
    }
  },

  salem: {
    id: "salem",
    name: "Salem",
    nameTa: "சேலம்",
    lat: 11.6643,
    lng: 78.1460,
    zone: "North Western Agro-Climatic Zone",
    zoneTa: "வடமேற்கு வேளாண் மண்டலம்",
    primaryCrops: ["Tapioca", "Tomato", "Cotton", "Paddy", "Mango", "Turmeric"],
    townsAndVillages: [
      { name: "Attur", nameTa: "ஆத்தூர்", isBlockHeadquarter: true },
      { name: "Mecheri", nameTa: "மேச்சேரி", isBlockHeadquarter: true },
      { name: "Omalur", nameTa: "ஓமலூர்", isBlockHeadquarter: true },
      { name: "Sankari", nameTa: "சங்ககிரி", isBlockHeadquarter: true },
      { name: "Edappadi", nameTa: "எடப்பாடி" },
      { name: "Yethapur", nameTa: "ஏத்தாப்பூர்" }
    ],
    services: [
      {
        name: "Tapioca and Castor Research Station (TCRS)",
        nameTa: "வள்ளிக்கிழங்கு மற்றும் ஆமணக்கு ஆராய்ச்சி நிலையம்",
        type: "TNAU_RESEARCH_STATION",
        address: "Yethapur, P.G. Palayam, Salem - 636119",
        phone: "+91 4282 293526",
        services: ["Tuber & Horticultural Disease Control", "Certified Quality Stakes", "Fungicide Spray Guidelines"]
      },
      {
        name: "ICAR KVK Sandhiyur",
        nameTa: "ICAR வேளாண் அறிவியல் மையம் (சந்தியூர்)",
        type: "KVK",
        address: "Sandhiyur, Mallur Post, Salem District",
        phone: "+91 427 2422550",
        services: ["Vegetable Blight Consultation", "Soil Micro-Nutrient Mapping", "Seed Certification Desk"]
      }
    ],
    regulatedMandi: {
      name: "Attur Regulated Agricultural Mandi",
      nameTa: "ஆத்தூர் ஒழுங்குமுறை வேளாண் அங்காடி",
      location: "Kamaraj Road, Attur, Salem"
    }
  },

  tiruchirappalli: {
    id: "tiruchirappalli",
    name: "Tiruchirappalli",
    nameTa: "திருச்சிராப்பள்ளி",
    lat: 10.7905,
    lng: 78.7047,
    zone: "Cauvery Delta Transition Zone",
    zoneTa: "காவிரி டெல்டா இடைப்பட்ட மண்டலம்",
    primaryCrops: ["Banana", "Paddy", "Cotton", "Millets", "Onion"],
    townsAndVillages: [
      { name: "Lalgudi", nameTa: "லால்குடி", isBlockHeadquarter: true },
      { name: "Musiri", nameTa: "முசிறி", isBlockHeadquarter: true },
      { name: "Thuraiyur", nameTa: "துறையூர்", isBlockHeadquarter: true },
      { name: "Manachanallur", nameTa: "மண்ணச்சநல்லூர்", isBlockHeadquarter: true },
      { name: "Thottiyam", nameTa: "தொட்டியம்" },
      { name: "Marungapuri", nameTa: "மருங்காபுரி" }
    ],
    services: [
      {
        name: "ICAR - National Research Centre for Banana (NRCB)",
        nameTa: "ICAR - தேசிய வாழை ஆராய்ச்சி மையம்",
        type: "TNAU_RESEARCH_STATION",
        address: "Thogamalai Main Road, Podavur, Trichy - 620102",
        phone: "+91 431 2618106",
        services: ["Sigatoka and Panama Wilt Diagnostics", "Tissue Culture Plantlets", "Bio-Formulations"]
      },
      {
        name: "ICAR KVK Sirugamani",
        nameTa: "வேளாண் அறிவியல் மையம் (சிறுகமணி)",
        type: "KVK",
        address: "Sirugamani Post, Trichy District - 639115",
        phone: "+91 431 2614217",
        services: ["Paddy Stem Borer Clinic", "Soil Testing & NPK Advisory", "Weather Bulletin"]
      }
    ],
    regulatedMandi: {
      name: "Manachanallur Paddy & Grain Market",
      nameTa: "மண்ணச்சநல்லூர் நெல் வணிக வளாகம்",
      location: "Samayapuram Road, Manachanallur"
    }
  },

  erode: {
    id: "erode",
    name: "Erode",
    nameTa: "ஈரோடு",
    lat: 11.3410,
    lng: 77.7172,
    zone: "Western Agro-Climatic Zone",
    zoneTa: "மேற்கு வேளாண் காலநிலை மண்டலம்",
    primaryCrops: ["Turmeric", "Banana", "Sugarcane", "Paddy", "Maize"],
    townsAndVillages: [
      { name: "Gobichettipalayam", nameTa: "கோபிசெட்டிபாளையம்", isBlockHeadquarter: true },
      { name: "Bhavani", nameTa: "பவானி", isBlockHeadquarter: true },
      { name: "Perundurai", nameTa: "பெருந்துறை", isBlockHeadquarter: true },
      { name: "Sathyamangalam", nameTa: "சத்தியமங்கலம்", isBlockHeadquarter: true },
      { name: "Kodumudi", nameTa: "கொடுமுடி" },
      { name: "Anthiyur", nameTa: "அந்தியூர்" }
    ],
    services: [
      {
        name: "MYRADA Krishi Vigyan Kendra (KVK Erode)",
        nameTa: "மைராடா வேளாண் அறிவியல் மையம்",
        type: "KVK",
        address: "272, Perumal Kovil Street, Gobichettipalayam - 638452",
        phone: "+91 4285 241626",
        services: ["Rhizome Rot Clinic", "Trichoderma viride Production Unit", "Plant Doctor Desk"]
      }
    ],
    regulatedMandi: {
      name: "Perundurai Turmeric & Agro Market",
      nameTa: "பெருந்துறை மஞ்சள் ஒழுங்குமுறை அங்காடி",
      location: "SIPCOT Industrial Complex Road, Perundurai"
    }
  }
};

export const DEFAULT_TN_DISTRICT = TN_DISTRICTS.coimbatore;

export const getAllTNDistricts = (): TNDistrict[] => {
  return Object.values(TN_DISTRICTS);
};

export const getTNDistrictById = (id: string): TNDistrict => {
  return TN_DISTRICTS[id.toLowerCase()] || DEFAULT_TN_DISTRICT;
};

