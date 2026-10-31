/**
 * Reusable Agricultural Crop Knowledge Base
 * University-verified agronomic data structure for Tomato, Rice/Paddy, Cotton, Banana, and Chilli.
 * Explicitly differentiated as Educational Reference Library from live AI analysis.
 */

export interface GrowthStage {
  stageName: string;
  stageNameTa: string;
  durationDays: string;
  durationDaysTa: string;
  keyActivities: string[];
  keyActivitiesTa: string[];
  waterRequirement: string;
  waterRequirementTa: string;
  icon: string;
}

export interface CropDiseaseInfo {
  id: string;
  name: string;
  nameTa: string;
  pathogen: string;
  imageKey: string;
  symptoms: string[];
  symptomsTa: string[];
  prevention: string[];
  preventionTa: string[];
  treatmentAdvisory: string;
  treatmentAdvisoryTa: string;
  severityLevel: "Low" | "Moderate" | "Severe";
}

export interface SeasonalInfo {
  seasonName: string;
  seasonNameTa: string;
  months: string;
  monthsTa: string;
  description: string;
  descriptionTa: string;
  recommendedVarieties: string[];
}

export interface CropProfile {
  id: string;
  name: string;
  nameTa: string;
  botanicalName: string;
  family: string;
  imageKey: string;
  summary: string;
  summaryTa: string;
  agroClimatic: {
    optimalTemp: string;
    optimalRainfall: string;
    soilType: string;
    soilTypeTa: string;
    soilPh: string;
  };
  growthStages: GrowthStage[];
  commonDiseases: CropDiseaseInfo[];
  wateringAndNutrition: {
    irrigationSchedule: string[];
    irrigationScheduleTa: string[];
    npkBasal: string;
    npkBasalTa: string;
    fertigationPlan: string[];
    fertigationPlanTa: string[];
    microNutrientGuidance: string;
    microNutrientGuidanceTa: string;
  };
  seasonalCalendar: SeasonalInfo[];
  verifiedSource: string;
}

export const CROPS_KNOWLEDGE_BASE: Record<string, CropProfile> = {
  tomato: {
    id: "tomato",
    name: "Tomato",
    nameTa: "தக்காளி",
    botanicalName: "Solanum lycopersicum",
    family: "Solanaceae",
    imageKey: "healthy_tomato",
    summary: "One of the most widely cultivated commercial vegetable crops across Tamil Nadu. Highly responsive to drip irrigation and integrated pest management.",
    summaryTa: "தமிழகத்தின் அனைத்து மாவட்டங்களிலும் பரவலாக சாகுபடி செய்யப்படும் முதன்மை தோட்டக்கலை பணப்பயிர். சொட்டு நீர் பாசனத்திற்கு மிக உகந்தது.",
    agroClimatic: {
      optimalTemp: "21°C – 28°C",
      optimalRainfall: "600 – 800 mm",
      soilType: "Well-drained red loam or black sandy clay loam rich in organic matter",
      soilTypeTa: "நல்ல வடிகால் வசதியுள்ள செம்மண் அல்லது வண்டல் கலந்த மண்",
      soilPh: "6.0 – 7.0"
    },
    growthStages: [
      {
        stageName: "Nursery & Germination",
        stageNameTa: "நாற்றங்கால் மற்றும் முளைப்பு",
        durationDays: "0 – 25 Days",
        durationDaysTa: "0 – 25 நாட்கள்",
        keyActivities: [
          "Raise nursery in pro-trays using sterilized coco-peat",
          "Seed treatment with Trichoderma viride @ 4g/kg seed",
          "Harden seedlings 5 days before transplanting with reduced watering"
        ],
        keyActivitiesTa: [
          "குழித்தட்டுக்களில் கிருமி நீக்கம் செய்யப்பட்ட தென்னை நார் கழிவில் நாற்று வளர்த்தல்",
          "1 கிலோ விதைக்கு 4 கிராம் ட்ரைக்கோடெர்மா விரிடி கொண்டு விதை நேர்த்தி",
          "நடவிற்கு 5 நாட்களுக்கு முன் பாசனத்தை குறைத்து நாற்றுகளை கடினப்படுத்துதல்"
        ],
        waterRequirement: "Light fine misting twice daily; prevent saturation",
        waterRequirementTa: "தினமும் இருமுறை பூவாளி கொண்டு மிதமான நீர் தெளிப்பு",
        icon: "🌱"
      },
      {
        stageName: "Vegetative & Branching",
        stageNameTa: "வளர்ச்சி மற்றும் கிளைத்தல் பருவம்",
        durationDays: "26 – 45 Days",
        durationDaysTa: "26 – 45 நாட்கள்",
        keyActivities: [
          "Transplant 25-day seedlings at 60 x 45 cm spacing on raised beds",
          "Install silver-black polythene mulch to suppress weed germination",
          "Erect bamboo stakes for indeterminate varieties (trellising)"
        ],
        keyActivitiesTa: [
          "உயரமான பாத்திகளில் 60 x 45 செ.மீ இடைவெளியில் நாற்றுகளை நடுதல்",
          "களைகளை கட்டுப்படுத்த வெள்ளி-கருப்பு நிற மூடாக்கு தாள்களை அமைத்தல்",
          "செடிகள் சாய்ந்து விடாமல் இருக்க மூங்கில் கம்புகள் ஊன்றி கட்டுதல்"
        ],
        waterRequirement: "2 to 3 Litres per plant every alternative day via drip",
        waterRequirementTa: "சொட்டு நீர் மூலம் ஒரு நாள் விட்டு ஒரு நாள் செடிக்கு 2 முதல் 3 லிட்டர்",
        icon: "🌿"
      },
      {
        stageName: "Flowering & Fruit Setting",
        stageNameTa: "பூக்கும் மற்றும் பிஞ்சு பிடிக்கும் பருவம்",
        durationDays: "46 – 75 Days",
        durationDaysTa: "46 – 75 நாட்கள்",
        keyActivities: [
          "Apply Boron 20% foliar spray @ 1g/L to prevent blossom drop",
          "Maintain uniform soil moisture; avoid water stress during petal drop",
          "Scout twice weekly for whiteflies and early fungal target spots"
        ],
        keyActivitiesTa: [
          "பூக்கள் உதிர்வதை தடுக்க 1 லிட்டர் தண்ணீருக்கு 1 கிராம் போரான் தெளித்தல்",
          "மண் ஈரப்பதத்தை சீராக பராமரித்தல்; பூக்கும் போது வறட்சி ஏற்படக்கூடாது",
          "வெள்ளை ஈக்கள் மற்றும் இலைப்புள்ளி அறிகுறிகளை வாரம் இருமுறை கண்காணித்தல்"
        ],
        waterRequirement: "3 to 4 Litres per plant daily during peak flowering",
        waterRequirementTa: "பூக்கும் உச்ச தருணத்தில் செடிக்கு நாள் ஒன்றுக்கு 3 முதல் 4 லிட்டர்",
        icon: "🌼"
      },
      {
        stageName: "Fruit Maturity & Harvesting",
        stageNameTa: "காய் முதிர்ச்சி மற்றும் அறுவடை",
        durationDays: "76 – 120 Days",
        durationDaysTa: "76 – 120 நாட்கள்",
        keyActivities: [
          "Harvest at breaker stage for distant markets; red-ripe for local mandi",
          "Harvest during cool morning hours with clean sanitized crates",
          "Maintain strict pre-harvest interval (PHI) for any approved sprays"
        ],
        keyActivitiesTa: [
          "தொலைதூர சந்தைகளுக்கு நிறம் மாறும் நிலையிலும், உள்ளூர் சந்தைக்கு சிவந்த பழங்களாகவும் பறித்தல்",
          "காலை வேளையில் சுத்தமான கூடைகளில் பழங்களை சேதமின்றி அறுவடை செய்தல்",
          "பறிப்பதற்கு முன் மருந்து தெளிப்பின் பாதுகாப்பு இடைவெளியை கடைபிடித்தல்"
        ],
        waterRequirement: "2 to 2.5 Litres per plant daily; reduce 3 days before major picking",
        waterRequirementTa: "நாள் ஒன்றுக்கு 2 முதல் 2.5 லிட்டர்; பறிப்பிற்கு 3 நாட்களுக்கு முன் குறைக்கவும்",
        icon: "🍅"
      }
    ],
    commonDiseases: [
      {
        id: "early_blight",
        name: "Early Blight (Alternaria solani)",
        nameTa: "அசாத்திய இலைப்புள்ளி நோய்",
        pathogen: "Alternaria solani (Fungus)",
        imageKey: "tomato_early_blight",
        symptoms: [
          "Concentric dark brown rings resembling target boards on mature leaves",
          "Yellow chlorotic halos surrounding lesions",
          "Premature defoliation starting from the lower canopy upwards"
        ],
        symptomsTa: [
          "முதிர்ந்த கீழ் இலைகளில் இலக்கு பலகை போன்ற வளைய வடிவ பழுப்பு நிற புள்ளிகள்",
          "புள்ளிகளை சுற்றி மஞ்சள் நிற வளையங்கள் தோன்றுதல்",
          "கீழ் இலைகள் காய்ந்து முன்கூட்டியே உதிர்தல்"
        ],
        prevention: [
          "Crop rotation with non-solanaceous crops (maize, pulses) for 2 seasons",
          "Mulching around plant stems to prevent soil-splash pathogens",
          "Drip irrigation strictly at root zone; never wet the canopy foliage"
        ],
        preventionTa: [
          "தக்காளி அல்லாத மக்காச்சோளம், பயறு வகைகளுடன் 2 பருவ சுழற்சி செய்தல்",
          "மண்ணில் உள்ள வித்துக்கள் தெறிக்காமல் இருக்க மூடாக்கு அமைத்தல்",
          "இலைகள் நனையாமல் சொட்டு நீர் பாசனம் மூலம் வேர்ப்பகுதிக்கு மட்டும் நீர் பாய்ச்சுதல்"
        ],
        treatmentAdvisory: "Foliar spray of Trichoderma viride 1% @ 5g/L as preventative. For confirmed outbreaks, spray Mancozeb 75% WP @ 2.0g/L during clear morning weather.",
        treatmentAdvisoryTa: "தடுப்பு முறையாக 1 லிட்டருக்கு 5 கிராம் ட்ரைக்கோடெர்மா விரிடி தெளிக்கவும். தீவிரம் அதிகமானால் மேன்கோசெப் 75% WP மருந்தை லிட்டருக்கு 2 கிராம் வீதம் காலை தெளிக்கவும்.",
        severityLevel: "Moderate"
      },
      {
        id: "late_blight",
        name: "Late Blight (Phytophthora infestans)",
        nameTa: "பிற்கால கருகல் நோய்",
        pathogen: "Phytophthora infestans (Oomycete)",
        imageKey: "tomato_late_blight",
        symptoms: [
          "Irregular, water-soaked blackish lesions expanding rapidly on leaves and stems",
          "White cottony fungal down on leaf undersides in humid mornings",
          "Brown, greasy firm decay on infected fruit shoulders"
        ],
        symptomsTa: [
          "இலை மற்றும் தண்டுகளில் வேகமாக பரவும் நீர் கசிவு போன்ற கரும்பழுப்பு புள்ளிகள்",
          "அதிக ஈரப்பதமான காலையில் இலையின் அடியில் வெள்ளை நிற பஞ்சு போன்ற பூஞ்சை வளர்ச்சி",
          "பழங்களின் தோள்பட்டையில் கடினமான பழுப்பு நிற கருகல் அழுகல்"
        ],
        prevention: [
          "Plant certified tolerant hybrid varieties (e.g. Arka Rakshak, Co-3)",
          "Maintain wide row spacing (75 cm) for excellent cross-ventilation",
          "Immediately rogue out and destroy severely blighted plants away from farm"
        ],
        preventionTa: [
          "நோய் எதிர்ப்பு திறன் கொண்ட வீரிய ஒட்டு ரகங்களை (அர்கா ரக்ஷக்) நடுதல்",
          "காற்றோட்டத்தை அதிகரிக்க 75 செ.மீ இடைவெளி விட்டு நடுதல்",
          "கடுமையாக பாதிக்கப்பட்ட செடிகளை உடனே பிடுங்கி தீயிட்டு அழித்தல்"
        ],
        treatmentAdvisory: "Spray Copper Oxychloride 50% WP @ 2.5g/L. If severe, consult the local KVK extension officer for systemic dimethomorph or metalaxyl scheduling.",
        treatmentAdvisoryTa: "காப்பர் ஆக்சிகுளோரைடு 50% WP மருந்தை லிட்டருக்கு 2.5 கிராம் வீதம் தெளிக்கவும். தீவிரமாக பரவினால் உடனடியாக வட்டார வேளாண் அதிகாரியை அணுகவும்.",
        severityLevel: "Severe"
      },
      {
        id: "bacterial_spot",
        name: "Bacterial Spot (Xanthomonas vesicatoria)",
        nameTa: "பாக்டீரியா இலைப்புள்ளி நோய்",
        pathogen: "Xanthomonas vesicatoria (Bacteria)",
        imageKey: "tomato_bacterial_spot",
        symptoms: [
          "Small (1–3 mm), dark brown angular water-soaked leaf spots",
          "Center of lesions dries up and tears easily, giving a shot-hole appearance",
          "Small raised blister-like scabs on green tomato fruit"
        ],
        symptomsTa: [
          "1 முதல் 3 மிமீ அளவுள்ள சிறிய கோண வடிவ நீர்க்கசிவு போன்ற கரும்புள்ளிகள்",
          "புள்ளிகளின் மையம் காய்ந்து ஓட்டைகளாக மாறி இலை கிழிந்து போதல்",
          "பச்சை தக்காளியின் மீது சிறு கொப்புளங்கள் போன்ற மேடான புள்ளிகள் தோன்றுதல்"
        ],
        prevention: [
          "Hot water seed treatment at 50°C for 25 minutes prior to sowing",
          "Avoid sprinkler irrigation or handling plants while foliage is wet",
          "Disinfect shears and pruning knives with 10% sodium hypochlorite"
        ],
        preventionTa: [
          "விதைகளை 50 டிகிரி செல்சியஸ் சுடுநீரில் 25 நிமிடங்கள் ஊறவைத்து நேர்த்தி செய்தல்",
          "இலைகள் ஈரமாக இருக்கும் போது செடிகளை தொடுவதையோ களையெடுப்பதையோ தவிர்க்கவும்",
          "கவாத்து கத்திகளை 10% கிருமி நாசினி கொண்டு சுத்தம் செய்தல்"
        ],
        treatmentAdvisory: "Spray Streptocycline @ 0.1g/L combined with Copper Hydroxide @ 2g/L of water. Repeat after 12 days if humid cloudy weather continues.",
        treatmentAdvisoryTa: "1 லிட்டர் தண்ணீருக்கு 0.1 கிராம் ஸ்ட்ரெப்டோமைசின் மற்றும் 2 கிராம் காப்பர் ஹைட்ராக்சைடு கலந்து தெளிக்கவும்.",
        severityLevel: "Moderate"
      }
    ],
    wateringAndNutrition: {
      irrigationSchedule: [
        "Transplanting stage: Immediate light irrigation followed by life irrigation on 3rd day",
        "Vegetative stage: Drip irrigate 2.0 to 2.5 L/plant every alternate morning",
        "Peak flowering & fruiting: Maintain uniform moisture @ 3.5 to 4.0 L/plant/day; fluctuation causes fruit cracking",
        "Harvest stage: Reduce watering by 25% to enhance fruit firmness and TSS (Brix)"
      ],
      irrigationScheduleTa: [
        "நடவு பருவம்: நட்டவுடன் முதல் தண்ணீர், 3-ம் நாள் உயிர்த் தண்ணீர் பாய்ச்சுதல்",
        "வளர்ச்சி பருவம்: ஒரு நாள் விட்டு ஒரு நாள் செடிக்கு 2 முதல் 2.5 லிட்டர் நீர்",
        "பூ மற்றும் காய் பருவம்: செடிக்கு 3.5 முதல் 4 லிட்டர்; ஈரப்பதம் மாறினால் பழம் வெடிக்கும்",
        "அறுவடை பருவம்: பழத்தின் உறுதித்தன்மையை அதிகரிக்க நீரின் அளவை 25% குறைக்கவும்"
      ],
      npkBasal: "Basal Dose: 25 tonnes FYM + 75 kg N, 100 kg P2O5, 50 kg K2O per hectare.",
      npkBasalTa: "அடி உரம்: ஹெக்டேருக்கு 25 டன் மக்கிய தொழு உரம் + 75 கிலோ தழைச்சத்து, 100 கிலோ மணிச்சத்து, 50 கிலோ சாம்பல் சத்து.",
      fertigationPlan: [
        "Days 10–30: Water soluble 19:19:19 @ 3 kg/acre weekly via venturi drip",
        "Days 31–60: Calcium Nitrate @ 2.5 kg/acre + 13:0:45 @ 3 kg/acre weekly to prevent Blossom End Rot",
        "Days 61–100: 0:0:50 (Potassium Sulphate) @ 4 kg/acre to boost fruit shine, weight and shelf life"
      ],
      fertigationPlanTa: [
        "10–30 நாட்கள்: வாரத்திற்கு ஏக்கருக்கு 3 கிலோ 19:19:19 உரத்தை சொட்டு நீர் மூலம் அளிக்கவும்",
        "31–60 நாட்கள்: பழத்தின் அடிப்பகுதி அழுகலை தடுக்க கால்சியம் நைட்ரேட் மற்றும் 13:0:45 உரம்",
        "61–100 நாட்கள்: பழத்தின் எடை மற்றும் பளபளப்பை கூட்ட பொட்டாசியம் சல்பேட் (0:0:50) 4 கிலோ"
      ],
      microNutrientGuidance: "Foliar spray of TNAU Vegetable Special @ 5g/L at 30, 45, and 60 days after transplanting enhances yield by 15–20%.",
      microNutrientGuidanceTa: "நடவு செய்த 30, 45, 60-ம் நாட்களில் தமிழ்நாடு வேளாண் பல்கலை காய்கறி நுண்ணூட்ட கலவையை லிட்டருக்கு 5 கிராம் தெளிக்கவும்."
    },
    seasonalCalendar: [
      {
        seasonName: "Adipattam (Late Monsoon)",
        seasonNameTa: "ஆடிப்பட்டம் (முன் பருவமழை)",
        months: "July – August sowing",
        monthsTa: "ஜூலை – ஆகஸ்ட் விதைப்பு",
        description: "Best season for high yields with moderate temperature and good market demand.",
        descriptionTa: "அதிக மகசூல் மற்றும் நல்ல சந்தை விலை கிடைக்கக்கூடிய முதன்மையான பருவம்.",
        recommendedVarieties: ["Arka Rakshak", "PKM-1", "Co-3", "Shivaji Hybrid"]
      },
      {
        seasonName: "Purattasipattam (Winter)",
        seasonNameTa: "புரட்டாசிப்பட்டம் (குளிர்காலம்)",
        months: "October – November sowing",
        monthsTa: "அக்டோபர் – நவம்பர் விதைப்பு",
        description: "Requires careful monitoring for Late Blight due to North-East monsoon dew and humidity.",
        descriptionTa: "வடகிழக்கு பருவமழையால் பனி மற்றும் ஈரப்பதம் கூடுவதால் கருகல் நோயை கண்காணிக்க வேண்டும்.",
        recommendedVarieties: ["Arka Abhed", "Arka Saurabh", "Co-3"]
      },
      {
        seasonName: "Chithiraipattam (Summer)",
        seasonNameTa: "சித்திரைப்பட்டம் (கோடை பருவம்)",
        months: "March – April sowing",
        monthsTa: "மார்ச் – ஏப்ரல் விதைப்பு",
        description: "Demands mulch and shade protection against leaf curl virus transmitted by whiteflies.",
        descriptionTa: "வெள்ளை ஈக்களால் பரவும் இலைச்சுருட்டு நோயை தடுக்க மூடாக்கு மற்றும் வலை அமைத்தல் அவசியம்.",
        recommendedVarieties: ["Arka Vishesh", "Pusa Ruby", "Lakshmi Hybrid"]
      }
    ],
    verifiedSource: "TNAU Agritech Portal Horticultural Crop Guide & ICAR IIHR Protocols"
  },

  rice: {
    id: "rice",
    name: "Paddy / Rice",
    nameTa: "நெல்",
    botanicalName: "Oryza sativa",
    family: "Poaceae",
    imageKey: "healthy_paddy",
    summary: "The staple cereal crop of Tamil Nadu, extensively cultivated in the Cauvery Delta, Thanjavur, and river basins with mechanized direct seeding and SRI practices.",
    summaryTa: "தமிழகத்தின் முதன்மை உணவு தானியப் பயிர். காவிரி டெல்டா, தஞ்சாவூர் மற்றும் ஆற்றுப்படுகைகளில் பரவலாக சாகுபடி செய்யப்படுகிறது.",
    agroClimatic: {
      optimalTemp: "22°C – 32°C",
      optimalRainfall: "1000 – 1500 mm",
      soilType: "Heavy clayey loams and alluvial delta soils with good water-holding capacity",
      soilTypeTa: "நீர் தேக்கும் திறன் கொண்ட களிமண் மற்றும் வண்டல் மண்",
      soilPh: "5.5 – 6.5"
    },
    growthStages: [
      {
        stageName: "Nursery & Seedling",
        stageNameTa: "நாற்றங்கால் பருவம்",
        durationDays: "0 – 20 Days",
        durationDaysTa: "0 – 20 நாட்கள்",
        keyActivities: [
          "Mat nursery for mechanical transplanting or modified dapog bed",
          "Seed treatment with Pseudomonas fluorescens @ 10g/kg seed",
          "Maintain thin layer of water (1 cm) on nursery bed"
        ],
        keyActivitiesTa: [
          "இயந்திர நடவிற்கு ஏற்ற பாய் நாற்றங்கால் தயாரித்தல்",
          "1 கிலோ விதைக்கு 10 கிராம் சூடோமோனாஸ் கொண்டு விதை நேர்த்தி",
          "நாற்றங்காலில் 1 செ.மீ அளவு மெல்லிய நீர் நிறுத்துதல்"
        ],
        waterRequirement: "Saturated soil bed without submergence",
        waterRequirementTa: "நாற்று மூழ்காமல் சேற்று மண்ணில் ஈரப்பதம்",
        icon: "🌱"
      },
      {
        stageName: "Tillering Stage",
        stageNameTa: "தூர் கட்டும் பருவம்",
        durationDays: "21 – 50 Days",
        durationDaysTa: "21 – 50 நாட்கள்",
        keyActivities: [
          "Transplant 14–18 day single seedlings under System of Rice Intensification (SRI)",
          "Operate rotary cono-weeder twice at 10-day intervals for root aeration",
          "Apply first top dressing of nitrogenous fertilizer"
        ],
        keyActivitiesTa: [
          "செம்மை நெல் சாகுபடி (SRI) முறையில் 14 நாள் இள நாற்றுகளை நடுதல்",
          "வேர்களுக்கு காற்றோட்டம் கிடைக்க கோனோவீடர் மூலம் 10 நாள் இடைவெளியில் களையெடுத்தல்",
          "முதல் தவணை தழைச்சத்து உரம் இடுதல்"
        ],
        waterRequirement: "Alternate wetting and drying (AWD) irrigation saves 30% water",
        waterRequirementTa: "காய்ச்சலும் பாய்ச்சலுமாக நீர் மேலாண்மை (AWD முறை)",
        icon: "🌾"
      },
      {
        stageName: "Panicle Initiation & Flowering",
        stageNameTa: "கதிர் உருவாகும் மற்றும் பூக்கும் பருவம்",
        durationDays: "51 – 85 Days",
        durationDaysTa: "51 – 85 நாட்கள்",
        keyActivities: [
          "Ensure continuous standing water (2.5 cm) during anthesis",
          "Scout for neck blast lesions on flag leaf junction",
          "Foliar spray of 1% Potassium Chloride to strengthen grain filling"
        ],
        keyActivitiesTa: [
          "பூக்கும் பருவத்தில் வயலில் 2.5 செ.மீ நீர் தொடர்ந்து இருக்குமாறு பார்த்தல்",
          "கொடி இலையில் குலைநோய் புள்ளிகள் உள்ளதா என ஆய்வு செய்தல்",
          "மணி பிடிக்கும் திறனை கூட்ட 1% பொட்டாசியம் குளோரைடு தெளித்தல்"
        ],
        waterRequirement: "2.5 cm standing water without drying",
        waterRequirementTa: "வயலில் 2.5 செ.மீ நீர் கட்டாயம் நிற்க வேண்டும்",
        icon: "🌾"
      },
      {
        stageName: "Grain Hardening & Harvesting",
        stageNameTa: "பால் பிடிக்கும் பருவம் மற்றும் அறுவடை",
        durationDays: "86 – 125 Days",
        durationDaysTa: "86 – 125 நாட்கள்",
        keyActivities: [
          "Drain water completely 10 days before harvest for machine accessibility",
          "Harvest when 85% of panicles turn golden yellow",
          "Dry paddy to 12–14% moisture for safe procurement at regulated mandi"
        ],
        keyActivitiesTa: [
          "அறுவடை இயந்திரங்கள் இறங்க வசதியாக அறுவடைக்கு 10 நாட்களுக்கு முன் நீரை வடித்தல்",
          "85% நெற்கதிர்கள் பொன் நிறமாக மாறும் போது அறுவடை செய்தல்",
          "அரசு கொள்முதல் நிலையத்திற்கு 12-14% ஈரப்பதத்திற்கு காயவைத்தல்"
        ],
        waterRequirement: "Completely drained 10 days prior to harvest",
        waterRequirementTa: "அறுவடைக்கு 10 நாட்களுக்கு முன் முழுமையாக வடிக்கப்பட வேண்டும்",
        icon: "🚜"
      }
    ],
    commonDiseases: [
      {
        id: "paddy_blast",
        name: "Paddy Blast (Magnaporthe oryzae)",
        nameTa: "நெல் குலைநோய்",
        pathogen: "Magnaporthe oryzae (Fungus)",
        imageKey: "healthy_paddy",
        symptoms: [
          "Spindle-shaped eye lesions with greyish center and dark brown margin on leaves",
          "Blackened neck nodes causing panicle breakage (Neck Blast)",
          "Empty and chaffy white grains resulting in massive yield loss"
        ],
        symptomsTa: [
          "இலைகளில் கண் வடிவில் நடுவில் சாம்பல் நிறமும் விளிம்பில் பழுப்பு நிறமும் கொண்ட புள்ளிகள்",
          "கதிர் காம்பு கருப்பாக மாறி முறிந்து தொங்குதல் (கழுத்து குலைநோய்)",
          "மணிகள் பிடிக்காமல் பதராக மாறுதல்"
        ],
        prevention: [
          "Avoid excessive nitrogenous fertilizer application in split doses",
          "Seed treatment with Tricyclazole 75% WP @ 2g/kg seed",
          "Maintain bund cleanliness and remove collateral weed hosts"
        ],
        preventionTa: [
          "ஒரே நேரத்தில் அதிகப்படியான யூரியா இடுவதை தவிர்த்து பிரித்து இடுதல்",
          "1 கிலோ விதைக்கு 2 கிராம் டிரைசைக்ளசோல் கொண்டு விதை நேர்த்தி",
          "வரப்புகளில் உள்ள களைகளை சுத்தமாக வைத்திருத்தல்"
        ],
        treatmentAdvisory: "Spray Tricyclazole 75% WP @ 1g/L or Isoprothiolane 40% EC @ 1.5 ml/L at boot leaf stage upon noticing initial eye spots.",
        treatmentAdvisoryTa: "குலைநோய் அறிகுறி தென்பட்டவுடன் டிரைசைக்ளசோல் 75% WP மருந்தை 1 லிட்டருக்கு 1 கிராம் வீதம் தெளிக்கவும்.",
        severityLevel: "Severe"
      }
    ],
    wateringAndNutrition: {
      irrigationSchedule: [
        "Transplanting to tillering: 2 cm shallow water depth",
        "Tillering to panicle initiation: Alternate wetting and drying method",
        "Flowering to milk stage: Maintain 3 to 5 cm standing water",
        "Dough stage to harvest: Gradual drying, stop water 10 days before harvest"
      ],
      irrigationScheduleTa: [
        "நடவு முதல் தூர் கட்டும் வரை: 2 செ.மீ ஆழத்தில் நீர்",
        "தூர் முதல் கதிர் பருவம் வரை: காய்ச்சலும் பாய்ச்சலுமான முறை",
        "பூக்கும் பருவம் முதல் பால் பிடிக்கும் வரை: 3 முதல் 5 செ.மீ நீர் நிறுத்துதல்",
        "முதிர்ச்சி பருவம்: அறுவடைக்கு 10 நாள் முன் நீரை முழுமையாக வடித்தல்"
      ],
      npkBasal: "Basal: 50 kg N, 50 kg P2O5, 25 kg K2O + 25 kg Zinc Sulphate per hectare.",
      npkBasalTa: "அடி உரம்: ஹெக்டேருக்கு 50 கிலோ தழை, 50 கிலோ மணி, 25 கிலோ சாம்பல் சத்து + 25 கிலோ ஜிங்க் சல்பேட்.",
      fertigationPlan: [
        "Tillering stage (20–25 DAT): 25 kg N + 12.5 kg K2O top dressing",
        "Panicle Initiation (40–45 DAT): 25 kg N + 12.5 kg K2O final split",
        "Boot leaf stage: Foliar spray of 2% DAP or TNAU Pulse Wonder to improve grain filling"
      ],
      fertigationPlanTa: [
        "தூர் கட்டும் போது: 25 கிலோ யூரியா + 12.5 கிலோ பொட்டாஷ்",
        "கதிர் உருவாகும் போது: 25 கிலோ யூரியா + 12.5 கிலோ பொட்டாஷ்",
        "கதிர் வெளிவரும் போது: 2% டி.ஏ.பி அல்லது தமிழ்நாடு வேளாண் பல்கலை நுண்ணூட்டம்"
      ],
      microNutrientGuidance: "Apply 25 kg Zinc Sulphate mixed with 50 kg sand per hectare as basal. Do not mix Zinc Sulphate directly with DAP.",
      microNutrientGuidanceTa: "ஹெக்டேருக்கு 25 கிலோ ஜிங்க் சல்பேட்டை மணலுடன் கலந்து இடவும். இதை டி.ஏ.பி உரத்துடன் ஒன்றாக கலக்கக் கூடாது."
    },
    seasonalCalendar: [
      {
        seasonName: "Kuruvai (Early Summer Crop)",
        seasonNameTa: "குறுவை பருவம்",
        months: "June – July sowing",
        monthsTa: "ஜூன் – ஜூலை விதைப்பு",
        description: "Short duration varieties (105–115 days) in Cauvery delta reliant on canal water release.",
        descriptionTa: "காவிரி நீர் திறப்பை அடிப்படையாகக் கொண்ட குறுகிய கால ரகங்கள் (105-115 நாட்கள்).",
        recommendedVarieties: ["ADT-43", "ADT-53", "Co-51", "TPS-5"]
      },
      {
        seasonName: "Samba (Main Monsoon Season)",
        seasonNameTa: "சம்பா பருவம்",
        months: "August – September sowing",
        monthsTa: "ஆகஸ்ட் – செப்டம்பர் விதைப்பு",
        description: "Medium to long duration varieties (130–150 days) taking advantage of North-East monsoon rains.",
        descriptionTa: "வடகிழக்கு பருவமழையை நம்பிய நடுத்தர மற்றும் நீண்ட கால முதன்மை சம்பா ரகங்கள்.",
        recommendedVarieties: ["CR-1009 Sub-1", "ADT-46", "BPT-5204 (Andhra Ponni)", "Co-52"]
      },
      {
        seasonName: "Navarai (Winter/Spring)",
        seasonNameTa: "நவரை பருவம்",
        months: "December – January sowing",
        monthsTa: "டிசம்பர் – ஜனவரி விதைப்பு",
        description: "Irrigated short duration crop suited for northern and western districts.",
        descriptionTa: "வட மற்றும் மேற்கு மாவட்டங்களுக்கு ஏற்ற குறுகிய கால பாசன நெல் பயிர்.",
        recommendedVarieties: ["Co-51", "ADT-37", "ASD-16"]
      }
    ],
    verifiedSource: "TNAU Tamil Nadu Rice Research Institute (TRRI) Aduthurai"
  },

  cotton: {
    id: "cotton",
    name: "Cotton",
    nameTa: "பருத்தி",
    botanicalName: "Gossypium hirsutum",
    family: "Malvaceae",
    imageKey: "healthy_cotton",
    summary: "Crucial commercial cash crop in Coimbatore, Salem, Dharmapuri, and Southern drylands. Famous as the raw material powering Tamil Nadu's spinning mills.",
    summaryTa: "கோயம்புத்தூர், சேலம், தருமபுரி மற்றும் தென் மாவட்டங்களின் முதன்மை வணிக பணப்பயிர். தமிழக நூற்பாலைகளின் ஆதாரம்.",
    agroClimatic: {
      optimalTemp: "25°C – 35°C",
      optimalRainfall: "500 – 750 mm",
      soilType: "Deep black cotton soils (Vertisols) and fertile clay loams",
      soilTypeTa: "ஆழமான கரிசல் மண் மற்றும் வண்டல் மண்",
      soilPh: "7.0 – 8.5"
    },
    growthStages: [
      {
        stageName: "Germination & Square Formation",
        stageNameTa: "முளைப்பு மற்றும் பூ மொட்டு பருவம்",
        durationDays: "0 – 45 Days",
        durationDaysTa: "0 – 45 நாட்கள்",
        keyActivities: [
          "Dibble acid-delinted seeds at 90 x 45 cm spacing on ridges",
          "Gap filling on 10th day and thinning leaving one seedling per hill on 15th day",
          "Nip terminal buds at 75–80 cm height to promote lateral sympodial branches"
        ],
        keyActivitiesTa: [
          "90 x 45 செ.மீ இடைவெளியில் பார் பாத்திகளில் அமில நேர்த்தி செய்த விதைகளை ஊன்றுதல்",
          "10-ம் நாள் இடைவெளி நிரப்புதல், 15-ம் நாள் ஒரு குழிக்கு ஒரு செடி வீதம் கலைத்தல்",
          "கிளைகளை பெருக்க 75-80 செ.மீ உயரத்தில் செடியின் நுனியை கிள்ளி விடுதல்"
        ],
        waterRequirement: "Light irrigation at sowing; avoid water-logging in black soil",
        waterRequirementTa: "விதைத்தவுடன் மிதமான தண்ணீர்; கரிசல் மண்ணில் நீர் தேங்கக்கூடாது",
        icon: "🌱"
      },
      {
        stageName: "Flowering & Boll Formation",
        stageNameTa: "பூத்தல் மற்றும் காய் பிடிக்கும் பருவம்",
        durationDays: "46 – 100 Days",
        durationDaysTa: "46 – 100 நாட்கள்",
        keyActivities: [
          "Spray NAA (Planofix) @ 4 ml per 10 L water to check flower and square shedding",
          "Install pheromone traps (5 per acre) for pink bollworm monitoring",
          "Foliar spray of 1% Magnesium Sulphate + 1% Urea to prevent leaf reddening"
        ],
        keyActivitiesTa: [
          "பூக்கள் மற்றும் பிஞ்சுகள் உதிர்வதை தடுக்க 10 லிட்டருக்கு 4 மி.லி பிளனோபிக்ஸ் தெளித்தல்",
          "இளஞ்சிவப்பு காய்ப்புழுவை கண்காணிக்க ஏக்கருக்கு 5 இனக்கவர்ச்சி பொறிகள் வைத்தல்",
          "இலைகள் சிவப்பாவதை தடுக்க 1% மெக்னீசியம் சல்பேட் + 1% யூரியா தெளித்தல்"
        ],
        waterRequirement: "Critical water stage: Irrigate every 10–12 days in red soils; 15 days in black soil",
        waterRequirementTa: "காய்கள் உருவாகும் முக்கிய பருவம்: 10 முதல் 12 நாட்களுக்கு ஒருமுறை பாசனம்",
        icon: "🌸"
      },
      {
        stageName: "Boll Bursting & Picking",
        stageNameTa: "காய் வெடித்தல் மற்றும் பஞ்சு எடுத்தல்",
        durationDays: "101 – 150 Days",
        durationDaysTa: "101 – 150 நாட்கள்",
        keyActivities: [
          "Withhold irrigation during boll bursting to ensure clean spotless cotton",
          "Pick clean opened bolls in dry morning hours after dew has evaporated",
          "Sort stained and damaged cotton separately in clean cotton cloth bags"
        ],
        keyActivitiesTa: [
          "பஞ்சு கறைபடாமல் தூய்மையாக இருக்க காய் வெடிக்கும் போது பாசனத்தை நிறுத்தவும்",
          "பனி காய்ந்த பின் காலை வெயிலில் விரிந்த காய்களில் இருந்து பஞ்சை எடுத்தல்",
          "கறைபட்ட பஞ்சுகளை தனியாக தரம் பிரித்து பருத்தி பைகளில் சேகரித்தல்"
        ],
        waterRequirement: "Zero irrigation during mature boll bursting",
        waterRequirementTa: "பஞ்சு வெடிக்கும் போது நீர் பாய்ச்சுவதை முற்றிலுமாக நிறுத்தவும்",
        icon: "☁️"
      }
    ],
    commonDiseases: [
      {
        id: "cotton_leaf_spot",
        name: "Cercospora Leaf Spot & Blight",
        nameTa: "செர்கோஸ்போரா இலைப்புள்ளி நோய்",
        pathogen: "Cercospora gossypina (Fungus)",
        imageKey: "healthy_cotton",
        symptoms: [
          "Small circular brown spots with purple margins expanding on leaf lamina",
          "Premature defoliation resulting in improper boll development"
        ],
        symptomsTa: [
          "இலையின் பரப்பில் ஊதா நிற விளிம்புகளுடன் கூடிய பழுப்பு நிற வட்டப் புள்ளிகள்",
          "இலைகள் உதிர்ந்து காய்களின் வளர்ச்சி குன்றுதல்"
        ],
        prevention: [
          "Seed treatment with Thiram @ 3g/kg seed",
          "Crop sanitation and burning of stubbles post harvest"
        ],
        preventionTa: [
          "1 கிலோ விதைக்கு 3 கிராம் திரம் கொண்டு விதை நேர்த்தி",
          "அறுவடைக்கு பின் பருத்தி சருகுகளை அப்புறப்படுத்தி சுத்தப்படுத்துதல்"
        ],
        treatmentAdvisory: "Spray Mancozeb 75% WP @ 2.0g/L or Copper Oxychloride @ 2.5g/L during early square phase.",
        treatmentAdvisoryTa: "மேன்கோசெப் 75% WP மருந்தை லிட்டருக்கு 2 கிராம் வீதம் தெளிக்கவும்.",
        severityLevel: "Moderate"
      }
    ],
    wateringAndNutrition: {
      irrigationSchedule: [
        "Sowing to emergence: 1 light soaking irrigation",
        "Vegetative: Irrigate at 15–18 day intervals based on soil cracking",
        "Flowering and boll development: Sensitive stage requiring moisture every 10–12 days",
        "Boll opening: Completely cease irrigation to avoid fiber discoloration"
      ],
      irrigationScheduleTa: [
        "விதைப்பு முதல் முளைப்பு வரை: முதல் நீர் மற்றும் உயிர்த் தண்ணீர்",
        "வளர்ச்சி பருவம்: மண் வெடிப்புக்கு ஏற்ப 15 நாட்களுக்கு ஒருமுறை",
        "காய் பிடிக்கும் பருவம்: 10 முதல் 12 நாட்களுக்கு ஒருமுறை கட்டாய பாசனம்",
        "வெடிக்கும் பருவம்: பஞ்சின் நிறம் மாறாமல் இருக்க பாசனத்தை நிறுத்தவும்"
      ],
      npkBasal: "Basal: 40 kg N, 40 kg P2O5, 40 kg K2O per hectare.",
      npkBasalTa: "அடி உரம்: ஹெக்டேருக்கு 40 கிலோ தழை, 40 கிலோ மணி, 40 கிலோ சாம்பல் சத்து.",
      fertigationPlan: [
        "30th day: Top dress 20 kg Nitrogen",
        "60th day (Squaring): Top dress 20 kg Nitrogen + 20 kg Potassium",
        "Foliar spray of 1% DAP + 1% Potassium Chloride at 70 and 90 days"
      ],
      fertigationPlanTa: [
        "30-ம் நாள்: 20 கிலோ யூரியா மேல் உரம்",
        "60-ம் நாள் (பூக்கும் போது): 20 கிலோ யூரியா + 20 கிலோ பொட்டாஷ்",
        "70 மற்றும் 90-ம் நாட்களில் 1% டி.ஏ.பி + 1% பொட்டாஷ் இலை வழி தெளிப்பு"
      ],
      microNutrientGuidance: "Apply TNAU Cotton Plus @ 2.5 kg/acre in 200 L water at flowering and boll bursting to prevent boll shedding and increase fiber elongation.",
      microNutrientGuidanceTa: "பூக்கும் மற்றும் காய் பிடிக்கும் போது தமிழ்நாடு வேளாண் பல்கலை காட்டன் பிளஸ் கலவையை ஏக்கருக்கு 2.5 கிலோ தெளிக்கவும்."
    },
    seasonalCalendar: [
      {
        seasonName: "Karthigaipattam (Winter Irrigated)",
        seasonNameTa: "கார்த்திகைப் பட்டம் (குளிர்கால பாசனம்)",
        months: "August – September sowing",
        monthsTa: "ஆகஸ்ட் – செப்டம்பர் விதைப்பு",
        description: "Primary cotton season in western and southern Tamil Nadu.",
        descriptionTa: "மேற்கு மற்றும் தென் மாவட்டங்களின் முதன்மை குளிர்கால பருத்தி பருவம்.",
        recommendedVarieties: ["MCU-5", "Suraj", "Co-14", "SVPR-2"]
      },
      {
        seasonName: "Thai Pattam (Summer Irrigated)",
        seasonNameTa: "தைப்பட்டம் (கோடை பாசனம்)",
        months: "February – March sowing",
        monthsTa: "பிப்ரவரி – மார்ச் விதைப்பு",
        description: "Grown in rice fallows and garden lands of delta and western tracts.",
        descriptionTa: "டெல்டா மற்றும் மேற்கு மாவட்டங்களின் நெல் தரிசு மற்றும் தோட்டக்கால் பருத்தி.",
        recommendedVarieties: ["MCU-7", "SVPR-4", "KC-3"]
      }
    ],
    verifiedSource: "ICAR Central Institute for Cotton Research (CICR) & TNAU Cotton Department"
  },

  banana: {
    id: "banana",
    name: "Banana",
    nameTa: "வாழை",
    botanicalName: "Musa acuminata",
    family: "Musaceae",
    imageKey: "healthy_banana",
    summary: "Heavy biomass commercial fruit crop grown year-round along the Cauvery belt, Trichy, Theni, and Coimbatore. High water and potassium demanding crop.",
    summaryTa: "காவிரி படுகை, திருச்சி, தேனி, கோவை மாவட்டங்களில் ஆண்டு முழுவதும் விளையும் முதன்மை பழப்பயிர். அதிக நீர் மற்றும் சாம்பல் சத்து தேவைப்படும்.",
    agroClimatic: {
      optimalTemp: "25°C – 35°C",
      optimalRainfall: "1500 – 2000 mm (Requires regular irrigation)",
      soilType: "Deep, rich, well-drained loamy soil with high organic matter",
      soilTypeTa: "ஆழமான, சத்துமிக்க, நீர் தேங்காத செழுமையான வண்டல் மண்",
      soilPh: "6.5 – 7.5"
    },
    growthStages: [
      {
        stageName: "Planting & Vegetative",
        stageNameTa: "நடவு மற்றும் வளர்ச்சி பருவம்",
        durationDays: "0 – 5 Months",
        durationDaysTa: "0 – 5 மாதங்கள்",
        keyActivities: [
          "Plant sword suckers (1.5–2.0 kg) or certified tissue culture plantlets",
          "Dip suckers in Pseudomonas fluorescens slurry before planting",
          "Remove unwanted water suckers keeping only mother pseudostem"
        ],
        keyActivitiesTa: [
          "1.5-2 கிலோ எடையுள்ள வாள் கன்றுகள் அல்லது திசு வளர்ப்பு நாற்றுகளை நடுதல்",
          "கன்றுகளை நடுவதற்கு முன் சூடோமோனாஸ் கரைசலில் நனைத்து நேர்த்தி செய்தல்",
          "தாய்க் கன்றை மட்டும் விட்டுவிட்டு தேவையற்ற பக்கக் கன்றுகளை வெட்டி அகற்றுதல்"
        ],
        waterRequirement: "15 to 20 Litres per plant daily via drip in first 3 months",
        waterRequirementTa: "முதல் 3 மாதங்களில் சொட்டு நீர் மூலம் நாள் ஒன்றுக்கு 15 முதல் 20 லிட்டர்",
        icon: "🌱"
      },
      {
        stageName: "Shooting & Bunch Emergence",
        stageNameTa: "வாழைத்தார் வெளிவரும் பருவம்",
        durationDays: "6 – 9 Months",
        durationDaysTa: "6 – 9 மாதங்கள்",
        keyActivities: [
          "Provide prop support with double bamboo poles to prevent wind breakage",
          "Denaveling (removal of male flower bud) immediately after fruit hands open",
          "Cover bunches with 6% perforated blue polythene sleeves"
        ],
        keyActivitiesTa: [
          "காற்றுக்கு மரம் சாயாமல் இருக்க இரட்டை மூங்கில் கம்புகள் கொண்டு முட்டு கொடுத்தல்",
          "கடைசி சீப்பு விரிந்தவுடன் ஆண் பூ மொட்டை (வாழைப்பூ) ஒடித்து விடுதல்",
          "தாரை 6% துளையிடப்பட்ட நீல நிற பாலித்தீன் உறை கொண்டு மூடி பாதுகாத்தல்"
        ],
        waterRequirement: "Peak requirement: 25 to 30 Litres per plant daily",
        waterRequirementTa: "உச்ச நீர் தேவை: செடி ஒன்றுக்கு தினமும் 25 முதல் 30 லிட்டர்",
        icon: "🍌"
      },
      {
        stageName: "Bunch Maturation & Harvest",
        stageNameTa: "காய் முதிர்ச்சி மற்றும் அறுவடை",
        durationDays: "10 – 12 Months",
        durationDaysTa: "10 – 12 மாதங்கள்",
        keyActivities: [
          "Harvest bunches when fingers lose their angularity and become round",
          "Leave 30 cm peduncle handle for easy carrying and transit",
          "Clean and store bunches under cool shade"
        ],
        keyActivitiesTa: [
          "காய்களின் முனைகள் வட்டமாக உருண்டையாக மாறும் போது தாரை அறுவடை செய்தல்",
          "தூக்கி செல்ல வசதியாக 30 செ.மீ நீள காம்பை விட்டு வெட்டுதல்",
          "வெயிலில் வைக்காமல் குளிர்ந்த நிழலில் பாதுகாப்பாக வைத்தல்"
        ],
        waterRequirement: "20 Litres daily; discontinue 7 days prior to harvest",
        waterRequirementTa: "அறுவடைக்கு ஒரு வாரம் முன் பாசனத்தை நிறுத்தவும்",
        icon: "🍌"
      }
    ],
    commonDiseases: [
      {
        id: "sigatoka_leaf_spot",
        name: "Yellow & Black Sigatoka (Mycosphaerella musicola)",
        nameTa: "சிகடோகா இலைப்புள்ளி கருகல் நோய்",
        pathogen: "Mycosphaerella musicola (Fungus)",
        imageKey: "healthy_banana",
        symptoms: [
          "Yellow streaks parallel to leaf veins turning into elliptical dark spots",
          "Centers of spots dry to ash grey with dark brown border",
          "Extensive premature leaf desiccation leaving fewer than 4 functional leaves at harvest"
        ],
        symptomsTa: [
          "இலை நரம்புகளுக்கு இணையாக மஞ்சள் கோடுகள் தோன்றி பழுப்பு நிற புள்ளிகளாக மாறுதல்",
          "புள்ளிகளின் மையம் சாம்பல் நிறமாகி இலைகள் கருகி போதல்",
          "அறுவடைக்கு முன் மரம் முழுவதும் இலைகள் காய்ந்து தார் வளர்ச்சி பாதிக்கப்படுதல்"
        ],
        prevention: [
          "Remove and safely burn heavily diseased dried leaves (de-trashing)",
          "Maintain good drainage to avoid prolonged standing water around roots",
          "Keep plantation free from weeds to reduce microclimate humidity"
        ],
        preventionTa: [
          "காய்ந்த பாதிக்கப்பட்ட இலைகளை வெட்டி தோட்டத்திற்கு வெளியே தீயிட்டு அழித்தல்",
          "வேர்ப்பகுதியில் நீர் தேங்காதவாறு வடிகால் வாய்க்கால்களை அமைத்தல்",
          "தோட்டத்தில் களைகள் இல்லாமல் தூய்மையாக பராமரித்தல்"
        ],
        treatmentAdvisory: "Spray Carbendazim 50% WP @ 1g/L or Propiconazole 25% EC @ 1 ml/L mixed with 1% mineral oil during initial symptom development.",
        treatmentAdvisoryTa: "ஆரம்ப அறிகுறி தெரிந்தவுடன் 1 லிட்டர் தண்ணீருக்கு 1 கிராம் கார்பென்டாசிம் அல்லது 1 மி.லி புரோப்பிகோனசோல் மருந்தை தெளிக்கவும்.",
        severityLevel: "Severe"
      }
    ],
    wateringAndNutrition: {
      irrigationSchedule: [
        "1st to 4th month: 15–20 L/plant/day",
        "5th to 8th month: 20–25 L/plant/day",
        "9th to 11th month (Shooting): 25–30 L/plant/day (peak period)",
        "Pre-harvest week: Stop irrigation"
      ],
      irrigationScheduleTa: [
        "1 முதல் 4 மாதங்கள்: நாள் ஒன்றுக்கு 15 முதல் 20 லிட்டர்",
        "5 முதல் 8 மாதங்கள்: நாள் ஒன்றுக்கு 20 முதல் 25 லிட்டர்",
        "9 முதல் 11 மாதங்கள்: நாள் ஒன்றுக்கு 25 முதல் 30 லிட்டர்",
        "அறுவடைக்கு முன்: ஒரு வாரம் பாசனத்தை நிறுத்தவும்"
      ],
      npkBasal: "Basal: 10 kg FYM + 250g Neem cake + 50g single super phosphate per planting pit.",
      npkBasalTa: "அடி உரம்: குழிக்கு 10 கிலோ மக்கிய எரு + 250 கிராம் வேப்பம் புண்ணாக்கு + 50 கிராம் சூப்பர் பாஸ்பேட்.",
      fertigationPlan: [
        "Fertigate with 200g N, 60g P, and 300g K per plant split across 30 weekly fertigations",
        "Higher potassium (K2O) from 5th month onwards is crucial for heavy bunch weight and sugar content"
      ],
      fertigationPlanTa: [
        "ஒரு மரத்திற்கு 200 கிராம் தழை, 60 கிராம் மணி, 300 கிராம் சாம்பல் சத்தை 30 வாரங்களாக பிரித்து அளித்தல்",
        "5-ம் மாதத்திற்கு பின் பொட்டாஷ் சத்தை அதிகரிப்பது தாரின் எடையை கூட்டும்"
      ],
      microNutrientGuidance: "Foliar spray of TNAU Banana Special @ 5g/L with surfactant at 5th, 7th, and 9th months after planting boosts bunch yield by 18%.",
      microNutrientGuidanceTa: "5, 7, 9-ம் மாதங்களில் தமிழ்நாடு வேளாண் பல்கலைக்கழக பனானா ஸ்பெஷல் நுண்ணூட்ட கலவையை லிட்டருக்கு 5 கிராம் தெளிக்கவும்."
    },
    seasonalCalendar: [
      {
        seasonName: "Karthigaipattam (Winter Planting)",
        seasonNameTa: "கார்த்திகைப் பட்டம் (குளிர்கால நடவு)",
        months: "October – November planting",
        monthsTa: "அக்டோபர் – நவம்பர் நடவு",
        description: "Ideal for Grand Naine and Poovan in the Cauvery delta with good availability of canal water.",
        descriptionTa: "காவிரி பாசனப் படுகைக்கு ஏற்ற முதன்மை நடவு பருவம்.",
        recommendedVarieties: ["Grand Naine (G9)", "Poovan", "Rasthali", "Nendran"]
      },
      {
        seasonName: "Chithiraipattam (Summer Planting)",
        seasonNameTa: "சித்திரைப் பட்டம் (கோடை நடவு)",
        months: "March – April planting",
        monthsTa: "மார்ச் – ஏப்ரல் நடவு",
        description: "Suited for drip-irrigated hill banana (Sirumalai) and Red Banana in western districts.",
        descriptionTa: "மேற்கு மாவட்டங்களில் சொட்டு நீர் பாசனம் கொண்ட செவ்வாழை மற்றும் மலை வாழைக்கு ஏற்றது.",
        recommendedVarieties: ["Red Banana (செவ்வாழை)", "Karpooravalli", "Nendran"]
      }
    ],
    verifiedSource: "ICAR National Research Centre for Banana (NRCB) Tiruchirappalli & TNAU"
  }
};

export const getAllCrops = (): CropProfile[] => {
  return Object.values(CROPS_KNOWLEDGE_BASE);
};

export const getCropById = (id: string): CropProfile => {
  return CROPS_KNOWLEDGE_BASE[id.toLowerCase()] || CROPS_KNOWLEDGE_BASE.tomato;
};

