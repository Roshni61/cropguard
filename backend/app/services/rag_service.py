import os
from typing import Dict, Any, List, Optional

class RAGAssistantService:
    KNOWLEDGE_BASE_CHUNKS = [
        {
            "crop": "Tomato",
            "topic": "Early Blight",
            "keywords": ["early blight", "concentric", "target", "leaf spot", "alternaria", "புள்ளி", "கரும்புள்ளி", "झुलसा", "अगेती"],
            "content": "Early Blight caused by Alternaria solani produces dark brown concentric spots on older leaves. It thrives in high humidity (above 75%) and warm temperatures. Organic control: Trichoderma viride @ 5g/L. Chemical control: Mancozeb 75% WP @ 2g/L water. Pre-harvest interval (PHI): 7 days.",
            "source": "TNAU Agritech Portal 2026",
            "ta": "தக்காளி இலைப்புள்ளி நோய்க்கு (Early Blight) ட்ரைக்கோடெர்மா விரிடி (5g/L) அல்லது மேன்கோசெப் 75% WP (2g/L) தண்ணீரில் கலந்து தெளிக்கலாம். மழைக்கு முன் மருந்து தெளிக்க வேண்டாம்.",
            "ta_simple": "பாதிக்கப்பட்ட இலைகளை நீக்கிவிட்டு, மேன்கோசெப் மருந்தை 1 லிட்டர் தண்ணீருக்கு 2 கிராம் வீதம் தெளிக்கவும்.",
            "hi": "टमाटर के अगेती झुलसा (Early Blight) के लिए ट्राइकोडर्मा विरिडी (5g/L) या मैंकोजेब 75% WP (2g/L पानी) का छिड़काव करें। बारिश से पहले छिड़काव न करें।",
            "hi_simple": "खराब पत्तियां तोड़ दें और 1 लीटर पानी में 2 ग्राम मैंकोजेब मिलाकर सुबह छिड़कें।",
            "en": "For Tomato Early Blight, remove infected lower leaves. Spray Trichoderma viride @ 5g/L or Mancozeb 75% WP @ 2g/L. Do not spray if rain is expected within 6 hours.",
            "en_simple": "Remove spotted leaves and spray Mancozeb @ 2g per litre of water in clear weather."
        },
        {
            "crop": "Tomato",
            "topic": "Late Blight",
            "keywords": ["late blight", "water-soaked", "white mold", "phytophthora", "கருகல்", "பயிர் கருகல்", "पछेती", "सफेद फफूंद"],
            "content": "Late Blight caused by Phytophthora infestans causes rapid water-soaked brown lesions with white mold on leaf undersides. Destroy infected vines immediately. Spray Copper Oxychloride 50% WP @ 2.5g/L or Metalaxyl-Mancozeb @ 2g/L.",
            "source": "ICAR Tomato Pathology Advisory",
            "ta": "தக்காளி பயிர் கருகல் நோய்க்கு (Late Blight) காப்பர் ஆக்ஸிகுளோரைடு (2.5g/L) தெளிக்கவும். பாதிக்கப்பட்ட செடிகளை உடனே அப்புறப்படுத்தவும்.",
            "ta_simple": "கருகிய செடிகளை அகற்றிவிட்டு, காப்பர் மருந்தை 1 லிட்டருக்கு 2.5 கிராம் வீதம் தெளிக்கவும்.",
            "hi": "पछेती झुलसा (Late Blight) के लिए कॉपर ऑक्सीक्लोराइड (2.5g/L) का छिड़काव करें। संक्रमित पौधों को तुरंत नष्ट करें।",
            "hi_simple": "संक्रमित पत्तियां हटाकर कॉपर ऑक्सीक्लोराइड 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।",
            "en": "For Tomato Late Blight, spray Copper Oxychloride 50% WP @ 2.5g/L. Promptly prune and safely destroy heavily infected branches.",
            "en_simple": "Prune infected vines and spray Copper Oxychloride @ 2.5g per litre immediately."
        },
        {
            "crop": "Tomato",
            "topic": "Pest Management",
            "keywords": ["pest", "insect", "fruit borer", "caterpillar", "worm", "wormhole", "whitefly", "பூச்சி", "புழு", "காய்ப்புழு", "कीट", "सुंडी", "कीड़ा"],
            "content": "Tomato fruit borer (Helicoverpa armigera) bores into fruits. Integrated pest management: Set up yellow sticky traps (12/acre), pheromone traps (5/acre), and spray Neem Oil 5% (5ml/L) preventatively. For severe larvae, use Bacillus thuringiensis (Bt) @ 2g/L.",
            "source": "TNAU Integrated Pest Management Portal",
            "ta": "தக்காளி காய்ப்புழு மற்றும் பூச்சி தாக்குதலுக்கு ஏக்கருக்கு 5 இனக்கவர்ச்சி பொறிகள் வைக்கவும். வேப்ப எண்ணெய் 5% (5ml/L) அல்லது பேசிலஸ் துரிஞ்சியென்சிஸ் (2g/L) தெளிக்கவும்.",
            "ta_simple": "மஞ்சள் நிற ஒட்டும் பொறிகள் வையுங்கள். 1 லிட்டர் தண்ணீருக்கு 5 மில்லி வேப்ப எண்ணெய் கலந்து தெளிக்கவும்.",
            "hi": "टमाटर के फल छेदक कीट (Fruit Borer) के लिए फेरोमोन ट्रैप लगाएं। रोकथाम के लिए नीम का तेल (5ml/L पानी) में मिलाकर छिड़कें।",
            "hi_simple": "खेत में पीली चिपचिपी पट्टी लगाएं और 5ml नीम का तेल प्रति लीटर पानी में मिलाकर छिड़कें।",
            "en": "For tomato fruit borer and whiteflies, install yellow sticky traps and spray Neem Oil 5% (5ml/L water). For active caterpillars, spray Bacillus thuringiensis (Bt) @ 2g/L.",
            "en_simple": "Set up yellow traps and spray organic neem oil @ 5ml per litre of water."
        },
        {
            "crop": "Tomato",
            "topic": "Irrigation & Water Schedule",
            "keywords": ["irrigation", "water", "how much water", "drip", "watering", "பாசனம்", "தண்ணீர்", "சொட்டு நீர்", "सिंचाई", "पानी"],
            "content": "Tomato plants need 2-4 litres of water per plant per day through drip irrigation. Never use overhead sprinklers during flowering/fruiting as wet leaves trigger fungal spores. Maintain uniform moisture to prevent fruit cracking and blossom end rot.",
            "source": "KVK Farm Extension Advisory",
            "ta": "தக்காளிக்கு சொட்டு நீர் பாசனம் மூலமாக செடிக்கு நாள் ஒன்றுக்கு 2 முதல் 4 லிட்டர் தண்ணீர் போதுமானது. இலைகளில் தண்ணீர் படாமல் பாசனம் செய்வது நோயைத் தடுக்கும்.",
            "ta_simple": "சொட்டு நீர் பாசனம் செய்யுங்கள். இலைகளில் தண்ணீர் தேங்காமல் பார்த்துக் கொள்ளுங்கள்.",
            "hi": "टमाटर की फसल में ड्रिप सिंचाई द्वारा प्रति पौधा प्रतिदिन 2 से 4 लीटर पानी दें। पत्तियों पर पानी न डालें ताकि फफूंद न लगे।",
            "hi_simple": "ड्रिप से सिंचाई करें। पौधे की पत्तियों पर पानी जमा न होने दें।",
            "en": "Tomatoes require 2-4 litres of water per plant daily using drip irrigation. Avoid splashing water on leaves to prevent fungal infection.",
            "en_simple": "Provide 2 to 4 litres per plant daily using drip. Keep leaves dry."
        },
        {
            "crop": "General",
            "topic": "Weather & Spray Safety",
            "keywords": ["weather", "rain", "spray today", "can i spray", "safe to spray", "வானிலை", "மழை", "மருந்து அடிக்கலாமா", "தெளிக்கலாமா", "मौसम", "बारिश", "छिड़काव"],
            "content": "Only spray pesticides or bio-fertilizers when rainfall probability is below 40% and wind speed is under 15 km/h. High humidity and rain within 6 hours washes away active chemicals, wasting money and causing environmental contamination.",
            "source": "Tamil Nadu Agricultural Weather Bulletin",
            "ta": "மழை பெய்ய வாய்ப்பு 40% மேல் இருந்தால் இன்று மருந்து தெளிக்க வேண்டாம். காற்று அமைதியாக இருக்கும் காலை வேளையில் (7 AM - 9 AM) மருந்து தெளிப்பதே சிறந்தது.",
            "ta_simple": "இன்று மழை வந்தால் மருந்து அடிக்காதீர்கள். வெயில் இருக்கும் காலை நேரத்தில் தெளிக்கவும்.",
            "hi": "यदि बारिश की संभावना 40% से अधिक हो तो आज छिड़काव न करें। शांत मौसम में सुबह 7 से 9 बजे के बीच छिड़काव करें।",
            "hi_simple": "बारिश की उम्मीद होने पर छिड़काव न करें। दवा धुल जाएगी और पैसे बर्बाद होंगे।",
            "en": "Do not spray pesticides if rain probability exceeds 40% or if wind is high. Best spraying window is calm, clear mornings between 7:00 AM and 9:30 AM.",
            "en_simple": "Never spray before rain. Spray only on calm, sunny mornings."
        },
        {
            "crop": "Tomato",
            "topic": "Soil & Fertilizer Guidance",
            "keywords": ["fertilizer", "manure", "urea", "potash", "npk", "soil", "உரம்", "சாணம்", "சாம்பல்", "போட்டாஷ்", "खाद", "उर्वरक", "मिट्टी"],
            "content": "Apply 10 tonnes of well-rotted Farm Yard Manure (FYM) or 2 tonnes of vermicompost per acre during land preparation. Basal NPK recommendation for hybrid tomato: 100:150:100 kg/acre. Supplement with Calcium Nitrate to prevent Blossom End Rot (black fruit bottoms).",
            "source": "TNAU Crop Production Guide 2026",
            "ta": "தக்காளிக்கு ஏக்கருக்கு 10 டன் மக்கிய தொழு உரம் அல்லது 2 டன் மண்புழு உரம் இடவும். தக்காளி பழங்களின் அடிப்பகுதி கருப்பாக மாறினால் கால்சியம் சத்து பற்றாக்குறை; ஜிப்சம் அல்லது கால்சியம் நைட்ரேட் இடவும்.",
            "ta_simple": "செடிகளுக்கு மண்புழு உரம் இடுங்கள். பழம் கருப்பானால் கால்சியம் உரம் தேவை.",
            "hi": "टमाटर के लिए प्रति एकड़ 10 टन सड़ी गोबर की खाद या 2 टन केंचुआ खाद डालें। फल का निचला हिस्सा काला पड़े तो कैल्शियम की कमी है, जिप्सम डालें।",
            "hi_simple": "खेत में अच्छी सड़ी गोबर खाद या केंचुआ खाद डालें।",
            "en": "Apply 10 tonnes of decomposed FYM or 2 tonnes vermicompost per acre. If fruit bottoms turn black, it is calcium deficiency (blossom end rot); apply Calcium Nitrate @ 5g/L.",
            "en_simple": "Apply vermicompost at the roots. If fruit bottoms turn black, add calcium."
        },
        {
            "crop": "General",
            "topic": "Government Schemes & Subsidies",
            "keywords": ["scheme", "subsidy", "pmfby", "insurance", "loan", "gov", "அரசு", "மானியம்", "காப்பீடு", "திட்டம்", "योजना", "सब्सिडी", "बीमा"],
            "content": "1. Pradhan Mantri Fasal Bima Yojana (PMFBY): Crop insurance covering pest outbreak and natural disaster loss. 2. Tamil Nadu Horticulture Mission: 100% subsidy for small/marginal farmers installing drip irrigation. 3. Kisan Credit Card (KCC) loans at 4% subsidized interest.",
            "source": "Ministry of Agriculture & Farmers Welfare, Govt of India",
            "ta": "பயிர் காப்பீட்டிற்கு PMFBY திட்டத்தில் விண்ணப்பிக்கவும். சொட்டு நீர் பாசனத்திற்கு தமிழ்நாடு தோட்டக்கலைத்துறை மூலம் 100% வரை மானியம் பெறலாம். விபரங்களுக்கு வேளாண் அலுவலரை அணுகவும்.",
            "ta_simple": "சொட்டு நீர் பாசனத்திற்கு 100% அரசு மானியம் உள்ளது. வட்டார வேளாண் அலுவலகத்தை அணுகவும்.",
            "hi": "प्रधानमंत्री फसल बीमा योजना (PMFBY) से फसल बीमा कराएं। ड्रिप सिंचाई के लिए सरकार से 100% तक सब्सिडी प्राप्त करें।",
            "hi_simple": "ड्रिप सिंचाई पर भारी सरकारी सब्सिडी उपलब्ध है। नजदीकी कृषि केंद्र से संपर्क करें।",
            "en": "Farmers can claim crop insurance via PMFBY. Micro-irrigation drip systems offer up to 100% subsidy through the state horticulture department. Kisan Credit Card loans are available at 4% interest.",
            "en_simple": "Apply for 100% drip irrigation subsidy through the local horticulture office."
        }
    ]

    @classmethod
    def answer_farmer_question(
        cls,
        user_query: str,
        language: str = "en",
        field_context: Optional[Dict[str, Any]] = None,
        crop: Optional[str] = None,
        location: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """
        Answers agricultural questions grounded in verified agricultural knowledge base documents
        and enriched by Gemini AI when available.
        Supports Tamil (ta), Hindi (hi), and English (en).
        """
        query_clean = (user_query or "").strip()
        query_lower = query_clean.lower()
        lang_code = "ta" if language == "ta" else "hi" if language == "hi" else "en"

        # 1. Safety Guardrail: Unverified, hazardous, or chemical mixing requests
        hazardous_terms = ["invent", "guess dosage", "secret chemical", "unlabeled mix", "dangerous dose", "overdose", "poison", "illegal pesticide"]
        if any(term in query_lower for term in hazardous_terms):
            if lang_code == "ta":
                refusal = "மன்னிக்கவும், சரிபார்க்கப்பட்ட வேளாண்மை வழிகாட்டுதல்கள் இல்லாமல் பாதுகாப்பற்ற மருந்து அளவுகளை என்னால் பரிந்துரைக்க முடியாது. தயவுசெய்து வட்டார வேளாண் அலுவலரை அணுகவும்."
                simple = "பாதுகாப்பற்ற மருந்துகளை பரிந்துரைக்க முடியாது. அரசு வேளாண் அதிகாரியை அணுகவும்."
            elif lang_code == "hi":
                refusal = "क्षमा करें, बिना आधिकारिक वैज्ञानिक प्रमाणीकरण के खतरनाक या अनुमानित कीटनाशक खुराक की अनुमति नहीं है। कृपया कृषि विशेषज्ञ से परामर्श लें।"
                simple = "असुरक्षित कीटनाशक की सलाह नहीं दी जा सकती। कृषि अधिकारी से संपर्क करें।"
            else:
                refusal = "I don't have enough verified agricultural information to safely recommend unapproved chemical mixtures or speculative doses. Please consult a qualified agricultural extension officer."
                simple = "Unapproved chemical doses cannot be recommended. Please consult an agricultural officer."

            return {
                "answer": refusal,
                "simple_answer": simple,
                "clarification_needed": False,
                "missing_entity": None,
                "suggested_chips": ["Organic Neem Oil", "Local KVK Officer", "TNAU Advisory"],
                "citations": ["TNAU Safety Guidelines", "Central Insecticides Board & Registration Committee"],
                "safe": False,
                "escalate_recommended": True,
                "engine": "grounded_safety_guardrail"
            }

        # 2. Check for missing crop/context in vague queries
        vague_symptom_triggers = ["leaves are yellow", "plant is dying", "black spots", "insects attacking", "what should i spray", "இலை மஞ்சள்", "பூச்சி தாக்குதல்", "மஞ்சள் இலை", "पत्तियां पीली", "कीड़ा लगा है", "क्या छिड़कें"]
        crop_mentions = ["tomato", "paddy", "rice", "cotton", "chilli", "potato", "onion", "banana", "தக்காளி", "நெல்", "மிளகாய்", "பருத்தி", "உருளை", "टमाटर", "धान", "मिर्च", "कपास", "आलू"]

        explicit_crop = crop or (field_context and field_context.get("crop"))
        has_crop = any(c in query_lower for c in crop_mentions) or bool(explicit_crop)
        is_vague = any(trigger in query_lower for trigger in vague_symptom_triggers) and not has_crop

        if is_vague:
            if lang_code == "ta":
                clarification = "நீங்கள் எந்த பயிரைப் பற்றி கேட்கிறீர்கள்? கீழே உள்ள பயிரைத் தேர்ந்தெடுங்கள் அல்லது பெயரைச் சொல்லுங்கள்:"
                simple = "எந்த பயிர் என்று கூறுங்கள்: தக்காளி, நெல், மிளகாய் அல்லது உருளைக்கிழங்கு?"
            elif lang_code == "hi":
                clarification = "आप किस फसल के बारे में पूछ रहे हैं? कृपया नीचे दी गई फसलों में से चुनें या बोलें:"
                simple = "कृपया अपनी फसल बताएं: टमाटर, धान, मिर्च या आलू?"
            else:
                clarification = "Which crop are you asking about? Please tap a crop below or say the crop name:"
                simple = "Which crop are you asking about? Tomato, Paddy, Chilli, or Potato?"

            return {
                "answer": clarification,
                "simple_answer": simple,
                "clarification_needed": True,
                "missing_entity": "crop",
                "suggested_chips": ["🍅 Tomato", "🌾 Paddy", "🌶️ Chilli", "🥔 Potato"],
                "citations": ["CropGuard Clarification Engine"],
                "safe": True,
                "escalate_recommended": False,
                "engine": "clarification_engine"
            }

        # 3. Match knowledge base chunks using keyword scoring
        target_crop_filter = (explicit_crop or "").lower()
        best_chunk = None
        best_score = -1

        for chunk in cls.KNOWLEDGE_BASE_CHUNKS:
            score = 0
            for kw in chunk.get("keywords", []):
                if kw in query_lower:
                    score += 2
            chunk_crop = chunk.get("crop", "").lower()
            if chunk_crop in query_lower:
                score += 2
            if target_crop_filter and target_crop_filter in chunk_crop:
                score += 3
            if chunk.get("topic", "").lower() in query_lower:
                score += 2

            if score > best_score:
                best_score = score
                best_chunk = chunk

        if not best_chunk or best_score <= 0:
            # Default to Early Blight / general crop health if tomato context
            best_chunk = cls.KNOWLEDGE_BASE_CHUNKS[0]

        # 4. Optional Gemini AI enrichment if configured
        gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
        if gemini_key:
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(
                    api_key=gemini_key,
                    http_options=types.HttpOptions(timeout=10000)
                )

                lang_name = "Tamil (தமிழ்)" if lang_code == "ta" else "Hindi (हिन्दी)" if lang_code == "hi" else "English"
                system_instruction = (
                    "You are CropGuard Kural, an empathetic and authoritative agricultural AI assistant for Indian farmers. "
                    "Provide practical, verified farming advice in 2 to 3 concise, clear sentences. "
                    "Always prioritize farmer safety, rain-awareness before spraying, and verified dosage. "
                    f"You MUST respond entirely in {lang_name}. "
                    "Base your advice strictly on the verified agronomy reference provided. "
                    "Do NOT fabricate unapproved chemical dosages or speculative mixtures."
                )

                # Format conversation history if available
                history_str = ""
                if history:
                    history_items = []
                    for h in history[-3:]: # Last 3 turns
                        r = h.get("role", "user")
                        c = h.get("content", "")
                        if c:
                            history_items.append(f"{r.capitalize()}: {c}")
                    if history_items:
                        history_str = "\nRecent Conversation:\n" + "\n".join(history_items)

                prompt = (
                    f"Farmer Question: {query_clean}\n"
                    f"Language: {lang_name}\n"
                    f"Selected Crop: {explicit_crop or best_chunk.get('crop')}\n"
                    f"Farmer Location: {location or (field_context and field_context.get('address')) or 'India'}\n"
                    f"Field Context: {field_context or 'Standard Field'}\n"
                    f"{history_str}\n"
                    f"Verified Agronomy Reference: {best_chunk.get('content')}\n"
                    f"Reference Source: {best_chunk.get('source')}"
                )

                model_name = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config={"system_instruction": system_instruction}
                )

                if response and response.text and response.text.strip():
                    gemini_text = response.text.strip()
                    sentences = [s.strip() for s in gemini_text.replace("\n", " ").split(".") if s.strip()]
                    simple_sentence = sentences[0] + "." if sentences else gemini_text

                    if "blight" in best_chunk.get("topic", "").lower():
                        chips = ["Can I spray today?", "Organic treatment", "Chemical dosage", "Scan another leaf"]
                    elif "pest" in best_chunk.get("topic", "").lower():
                        chips = ["Neem oil preparation", "Yellow sticky traps", "Call Agronomist"]
                    elif "water" in best_chunk.get("topic", "").lower():
                        chips = ["Drip schedule", "Rain forecast", "Soil moisture"]
                    else:
                        chips = ["Say it again", "Check Weather", "Scan Leaf"]

                    return {
                        "answer": gemini_text,
                        "simple_answer": simple_sentence,
                        "clarification_needed": False,
                        "missing_entity": None,
                        "suggested_chips": chips,
                        "citations": [best_chunk.get("source", "TNAU Agritech Portal 2026"), "Gemini Agricultural Intelligence"],
                        "safe": True,
                        "escalate_recommended": False,
                        "engine": "gemini"
                    }
            except Exception as e:
                print(f"[CropGuard Kural] Gemini fallback to verified knowledge base: {e}")

        # 5. Local Verified RAG Fallback
        answer = best_chunk.get(lang_code, best_chunk.get("en", best_chunk["content"]))
        simple = best_chunk.get(f"{lang_code}_simple", best_chunk.get("en_simple", answer))

        if "blight" in best_chunk.get("topic", "").lower():
            chips = ["Can I spray today?", "Organic treatment", "Chemical dosage", "Scan another leaf"]
        elif "pest" in best_chunk.get("topic", "").lower():
            chips = ["Neem oil preparation", "Yellow sticky traps", "Call Agronomist"]
        elif "water" in best_chunk.get("topic", "").lower():
            chips = ["Drip schedule", "Rain forecast", "Soil moisture"]
        else:
            chips = ["Say it again", "Simplify", "Talk to Expert"]

        return {
            "answer": answer,
            "simple_answer": simple,
            "clarification_needed": False,
            "missing_entity": None,
            "suggested_chips": chips,
            "citations": [best_chunk.get("source", "TNAU Agritech Portal 2026")],
            "safe": True,
            "escalate_recommended": False,
            "engine": "grounded_rag_local"
        }
