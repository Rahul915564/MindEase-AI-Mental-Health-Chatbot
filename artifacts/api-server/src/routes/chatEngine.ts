type Language = "hi" | "en";

interface BotResponse {
  text: string;
  followUp?: string;
}

function detectLanguage(text: string): Language {
  const hindiPattern = /[\u0900-\u097F]/;
  if (hindiPattern.test(text)) return "hi";
  const hindiWords = /\b(main|mujhe|mera|meri|hoon|hai|nahi|kya|aur|bahut|thoda|theek|accha|bura|dil|man|tang|pareshan|udaas|dara|khush|thak)\b/i;
  if (hindiWords.test(text)) return "hi";
  return "en";
}

function detectIntent(text: string, lang: Language): string {
  const lower = text.toLowerCase();

  const patterns: Record<string, RegExp[]> = {
    anxious: [
      /\b(anxious|anxiety|anxiet|panic|panicking|worry|worried|worrying|nervous|nerves|fear|scared|afraid|dread|heart racing|chest tight|can't breathe|cant breathe|overwhelm|uneasy)\b/i,
      /\b(ghabra|ghabran|darr|darha|dara|chinta|pareshan|bechaini|dil tez|dil ghabraana)\b/i,
    ],
    stressed: [
      /\b(stress|stressed|stressing|pressure|pressured|tense|tension|burden|overload|too much|can't cope|cant cope|burnt out|burnout|exhausted|no energy|drained)\b/i,
      /\b(stress|takleef|bojh|thak|thaka|thaki|pareshaan|jyaada kaam|haarna|haara)\b/i,
    ],
    sad: [
      /\b(sad|sadness|depressed|depression|cry|crying|tears|empty|hopeless|lonely|alone|miss|missing|grief|grieving|hurt|heartbroken|low|down|gloomy|melanchol)\b/i,
      /\b(udaas|rona|aansu|dukh|tanha|akela|akeli|dard|toota|tooti|mann nahi|bura lag|dil dukh)\b/i,
    ],
    angry: [
      /\b(angry|anger|furious|rage|irritated|irritable|frustrated|frustration|annoyed|mad|hate|fed up|cant stand|can't stand)\b/i,
      /\b(gussa|krodh|chidhchidha|naraaz|tang|nafrat|jhunnjhulaahat)\b/i,
    ],
    overwhelmed: [
      /\b(overwhelm|overwhelmed|too much|can't handle|cant handle|falling apart|breaking down|losing it|can't manage|so much going on|out of control)\b/i,
      /\b(bahut zyaada|sambhal nahi|toot raha|toot rahi|bikhar|haath se nikal|control nahi)\b/i,
    ],
    calm: [
      /\b(calm|peaceful|relaxed|okay|fine|alright|better|good|great|happy|thankful|grateful|content|serene|at peace)\b/i,
      /\b(theek|accha|shant|khush|sukoon|mast|aaram|zyaada better|shukriya|mehsoos theek)\b/i,
    ],
    happy: [
      /\b(happy|joyful|joy|excited|wonderful|amazing|fantastic|great|excellent|elated|cheerful|love|loving|proud)\b/i,
      /\b(khush|mast|zabardast|behtareen|josh|pyaar|umang|prasann|anand)\b/i,
    ],
    sleep: [
      /\b(sleep|sleeping|insomnia|can't sleep|cant sleep|awake|tired|restless|nightmare|night|late night)\b/i,
      /\b(neend|so nahi|jaag|thak|raat ko|neend nahi|sapna|bura sapna)\b/i,
    ],
    breathe: [
      /\b(breath|breathing|breathe|breath exercise|calm down|meditation|meditate|relax|grounding)\b/i,
      /\b(saans|saans lena|dhyan|meditation|shant ho|sukoon chahiye)\b/i,
    ],
    hello: [
      /^(hi|hello|hey|hii|helo|namaste|namaskar|salam|salaam|good morning|good evening|good afternoon|sup|what's up|wassup)\b/i,
      /^(hi|hello|hey|namaste|namaskar|salam|jai hind|pranam|haan|kya haal)\b/i,
    ],
    help: [
      /\b(help|support|advice|guidance|what should i do|what to do|don't know|dont know|lost|confused|need someone|talk to someone)\b/i,
      /\b(madad|sahara|batao|kya karoon|samajh nahi|kho gaya|kho gayi|koi nahi|baat karni|kya karein)\b/i,
    ],
    suicidal: [
      /\b(suicide|suicidal|kill myself|end my life|don't want to live|dont want to live|no reason to live|better off dead|harm myself|self harm|cut myself)\b/i,
      /\b(khatam karna|jeena nahi|marna chahta|marna chahti|zindagi khatam|khud ko hurt)\b/i,
    ],
  };

  for (const [intent, regexList] of Object.entries(patterns)) {
    for (const regex of regexList) {
      if (regex.test(lower)) return intent;
    }
  }

  return "general";
}

const breathingTip = {
  en: `\n\n💨 **Try this breathing exercise:** Breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Repeat 3–4 times. This is called Box Breathing and it activates your body's calm response.`,
  hi: `\n\n💨 **यह श्वास व्यायाम करें:** 4 गिनती तक सांस लें, 4 तक रोकें, 4 तक छोड़ें, 4 तक रुकें। इसे 3-4 बार दोहराएं। इसे बॉक्स ब्रीदिंग कहते हैं — यह आपके दिमाग को शांत करता है।`,
};

const responses: Record<string, Record<Language, BotResponse>> = {
  hello: {
    en: {
      text: `Hello! 😊 I'm so glad you're here. I'm MindEase — your safe space to talk, breathe, and feel better.\n\nHow are you feeling today? You can share anything — I'm here to listen without judgment.`,
    },
    hi: {
      text: `नमस्ते! 😊 मुझे खुशी है कि आप यहाँ आए। मैं MindEase हूँ — आपका एक सुरक्षित साथी।\n\nआज आप कैसा महसूस कर रहे हैं? बेझिझक शेयर करें — मैं बिना किसी निर्णय के सुनने के लिए यहाँ हूँ।`,
    },
  },
  anxious: {
    en: {
      text: `I hear you — anxiety can feel really overwhelming, like your mind won't stop racing. Please know that what you're feeling is valid, and it will pass.\n\nHere are some things that can help right now:\n\n🌿 **Grounding (5-4-3-2-1):** Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This brings your mind back to the present moment.\n\n🤲 **Remind yourself:** "This feeling is temporary. I have gotten through hard moments before."\n\n✍️ **Write it out:** Sometimes jotting down what's worrying you takes the power away from those thoughts.`,
      followUp: breathingTip.en,
    },
    hi: {
      text: `मैं समझ सकता हूँ — घबराहट और चिंता बहुत भारी लग सकती है। आपकी यह भावना बिल्कुल सच्ची है, और यह बीत जाएगी।\n\nअभी इन चीज़ों को आज़माएं:\n\n🌿 **ग्राउंडिंग (5-4-3-2-1):** 5 चीज़ें जो दिख रही हैं, 4 जो छू सकते हैं, 3 जो सुन सकते हैं, 2 जो सूंघ सकते हैं, और 1 जो चख सकते हैं। यह मन को वर्तमान में लाता है।\n\n🤲 **खुद से कहें:** "यह भावना अस्थायी है। मैं पहले भी मुश्किलों से गुज़रा हूँ।"\n\n✍️ **लिखें:** जो बात परेशान कर रही है उसे कागज़ पर उतारें — इससे विचारों की ताकत कम होती है।`,
      followUp: breathingTip.hi,
    },
  },
  stressed: {
    en: {
      text: `Stress is your mind's signal that you're carrying a lot right now — and it sounds like you really are. You deserve rest and care, not just productivity.\n\nHere are some coping strategies:\n\n📋 **Brain dump:** Write down everything on your mind — tasks, worries, thoughts. Getting it out of your head and onto paper helps reduce mental load.\n\n🚶 **Move your body:** Even a 5-minute walk outside can reset your nervous system.\n\n⏱️ **Break it down:** Instead of looking at everything at once, pick just ONE small task to focus on next.`,
      followUp: breathingTip.en,
    },
    hi: {
      text: `तनाव आपके मन का संकेत है कि आप बहुत कुछ उठा रहे हैं — और यह सुनकर लगता है कि वाकई ऐसा है। आपको सिर्फ काम नहीं, आराम और देखभाल भी चाहिए।\n\nकुछ उपाय:\n\n📋 **सब लिख दें:** जो भी मन में चल रहा है — काम, चिंताएं, विचार — सब लिख दें। इससे दिमाग हल्का होता है।\n\n🚶 **थोड़ा चलें:** 5 मिनट बाहर टहलना भी नर्वस सिस्टम को रिसेट कर सकता है।\n\n⏱️ **एक कदम:** सब एक साथ देखने की बजाय, सिर्फ एक छोटा काम चुनें और उस पर ध्यान दें।`,
      followUp: breathingTip.hi,
    },
  },
  sad: {
    en: {
      text: `I'm really sorry you're feeling this way. Sadness is one of the most human experiences, and it's okay to sit with it for a while.\n\nPlease be gentle with yourself today. You don't need to fix everything right now.\n\nSome things that may help:\n\n💙 **Let yourself feel it:** Suppressing sadness often makes it stay longer. It's okay to cry.\n\n🫂 **Reach out:** Even sending a "hey" to a friend can help you feel less alone.\n\n🎵 **Try music or nature:** Gentle music or sitting by a window with natural light can slowly lift your mood.`,
    },
    hi: {
      text: `मुझे सच में दुख है कि आप ऐसा महसूस कर रहे हैं। उदासी एक बहुत मानवीय अनुभव है — इसके साथ थोड़ी देर रहना ठीक है।\n\nआज अपने साथ कोमल रहें। सब कुछ अभी ठीक करने की ज़रूरत नहीं है।\n\nकुछ मददगार बातें:\n\n💙 **महसूस करने दें:** उदासी को दबाने से वह और लंबी रहती है। रोना ठीक है।\n\n🫂 **किसी से बात करें:** किसी दोस्त को बस "हे" भेजना भी अकेलेपन को कम कर सकता है।\n\n🎵 **संगीत या प्रकृति:** हल्का संगीत या खिड़की के पास बैठना धीरे-धीरे मन को हल्का करता है।`,
    },
  },
  angry: {
    en: {
      text: `It makes complete sense to feel angry — your feelings are valid. Anger is often a signal that something important to you has been crossed or ignored.\n\nHere's how to work with anger safely:\n\n🔥 **Release it physically:** Tear paper, do jumping jacks, hold ice in your hands, or go for a brisk walk.\n\n⏸️ **Pause before reacting:** Give yourself 10 minutes before sending that message or making that call.\n\n📝 **Write an unsent letter:** Say everything you want to say — then decide if you want to send it. (Usually helps even without sending.)`,
      followUp: breathingTip.en,
    },
    hi: {
      text: `गुस्सा महसूस होना बिल्कुल स्वाभाविक है — आपकी भावना सही है। गुस्सा अक्सर यह संकेत होता है कि कुछ महत्वपूर्ण अनदेखा हुआ है।\n\nगुस्से को सुरक्षित तरीके से निकालें:\n\n🔥 **शारीरिक रूप से निकालें:** कागज़ फाड़ें, कूदें, बर्फ हाथ में लें, या तेज़ चलें।\n\n⏸️ **प्रतिक्रिया से पहले रुकें:** वो मैसेज या कॉल करने से पहले 10 मिनट रुकें।\n\n📝 **बिना भेजी चिट्ठी:** जो भी कहना है लिखें — फिर सोचें भेजना है या नहीं। (अक्सर बिना भेजे भी मन हल्का होता है।)`,
      followUp: breathingTip.hi,
    },
  },
  overwhelmed: {
    en: {
      text: `When everything feels like too much, it means you're human — not broken. Please take a breath right now. Just one.\n\nYou don't have to handle it all at once.\n\nLet's start small:\n\n🛑 **Stop and pause:** You have permission to stop everything for 5 minutes.\n\n📌 **One thing at a time:** What is the ONE smallest step you could take right now? Just that.\n\n💧 **Water and air:** Drink a glass of water and step outside (or open a window) for fresh air. Your nervous system needs this.`,
      followUp: breathingTip.en,
    },
    hi: {
      text: `जब सब कुछ ज़्यादा लगे, तो इसका मतलब है कि आप इंसान हैं — टूटे हुए नहीं। अभी एक सांस लें। बस एक।\n\nसब कुछ एक साथ संभालने की ज़रूरत नहीं है।\n\nछोटे से शुरू करते हैं:\n\n🛑 **रुकें और सांस लें:** आपको अनुमति है — 5 मिनट के लिए सब कुछ रोकें।\n\n📌 **एक काम:** अभी सिर्फ एक सबसे छोटा काम क्या कर सकते हैं? बस वही।\n\n💧 **पानी और हवा:** एक गिलास पानी पिएं और खिड़की खोलें या बाहर जाएं। आपका नर्वस सिस्टम इसकी ज़रूरत में है।`,
      followUp: breathingTip.hi,
    },
  },
  calm: {
    en: {
      text: `That's wonderful to hear 🌿 A sense of calm is something worth cherishing and protecting.\n\nA few ways to stay in this space:\n\n🧘 **Anchor it:** Notice what helped you feel calm today — write it down so you can return to it.\n\n✨ **Gratitude moment:** Think of 2–3 things, big or small, that you're grateful for right now.\n\nI'm really glad you're feeling okay. Is there anything on your mind you'd like to explore or talk through?`,
    },
    hi: {
      text: `यह सुनकर बहुत अच्छा लगा 🌿 शांति एक बहुमूल्य भावना है — इसे संजोकर रखें।\n\nइस अवस्था में बने रहने के कुछ तरीके:\n\n🧘 **नोट करें:** आज क्या चीज़ ने शांत महसूस कराया — इसे लिखें ताकि ज़रूरत पर वापस आ सकें।\n\n✨ **कृतज्ञता:** 2-3 चीज़ें सोचें जिनके लिए अभी आभारी हैं — छोटी हो या बड़ी।\n\nमुझे खुशी है कि आप ठीक हैं। क्या कोई बात है जो मन में चल रही है जिस पर बात करना चाहेंगे?`,
    },
  },
  happy: {
    en: {
      text: `That's so good to hear! 🌟 Happy moments are important to savour and celebrate.\n\nKeep that energy going:\n\n🗒️ **Capture this moment:** Write down what made today good. On harder days, it'll remind you that good days exist.\n\n🤝 **Share the warmth:** Even a small kind word to someone else today can multiply the good feeling.\n\nIs there something you'd like to reflect on or talk through while you're feeling positive?`,
    },
    hi: {
      text: `बहुत बढ़िया! 🌟 खुशी के पलों को मनाना और उनका आनंद लेना बहुत ज़रूरी है।\n\nइस ऊर्जा को बनाए रखें:\n\n🗒️ **इस पल को नोट करें:** आज क्या अच्छा था लिखें — मुश्किल दिनों में यह याद दिलाएगा कि अच्छे दिन आते हैं।\n\n🤝 **खुशी बांटें:** किसी को एक छोटी अच्छी बात कहना इस खुशी को और बढ़ाता है।\n\nकोई बात है जो आप इस अच्छे मूड में सोचना या समझना चाहते हैं?`,
    },
  },
  sleep: {
    en: {
      text: `Sleep struggles can be exhausting — the cruel irony of being too tired to sleep. You're not alone in this.\n\nThings that can help tonight:\n\n🌙 **Wind-down ritual:** 30 minutes before bed, dim the lights, put your phone face-down, and do something slow (reading, gentle stretching, journaling).\n\n🧊 **Cold water:** Wash your face or hands with cold water — it activates the dive reflex and slows your heart rate.\n\n🎧 **Sleep sounds:** Try rain sounds, brown noise, or a sleep meditation on YouTube.\n\n🛏️ **The 20-minute rule:** If you can't sleep after 20 minutes, get up, do something calm, and try again. Lying awake builds anxiety around sleep.`,
      followUp: breathingTip.en,
    },
    hi: {
      text: `नींद न आना बहुत थका देने वाला होता है — थके होने पर भी नींद न आना सच में कठिन है। आप अकेले नहीं हैं इसमें।\n\nआज रात के लिए कुछ उपाय:\n\n🌙 **सोने से पहले की दिनचर्या:** सोने से 30 मिनट पहले रोशनी कम करें, फोन रख दें, और कुछ शांत करें (पढ़ना, हल्की स्ट्रेचिंग, डायरी लिखना)।\n\n🧊 **ठंडा पानी:** चेहरे या हाथों पर ठंडा पानी डालें — यह दिल की धड़कन धीमी करता है।\n\n🎧 **नींद की आवाज़ें:** बारिश की आवाज़ या ब्राउन नॉइज़ सुनें।\n\n🛏️ **20 मिनट का नियम:** अगर 20 मिनट बाद भी नींद न आए, उठें, शांत कुछ करें, फिर कोशिश करें।`,
      followUp: breathingTip.hi,
    },
  },
  breathe: {
    en: {
      text: `Great idea — breathing exercises are one of the most immediate ways to calm your nervous system. Here are the ones available in MindEase:\n\n🟦 **Box Breathing** — 4 in, 4 hold, 4 out, 4 hold. Great for stress and anxiety.\n\n🌙 **4-7-8 Breathing** — 4 in, 7 hold, 8 out. Especially good for sleep.\n\n🌊 **Belly Breathing** — Deep diaphragmatic breaths that fully engage your lungs.\n\n🌿 **Alternate Nostril** — A yoga technique for balance and focus.\n\nHead to the Breathing section in the app to try any of these with guided animations!`,
    },
    hi: {
      text: `बढ़िया विचार — श्वास व्यायाम नर्वस सिस्टम को शांत करने का सबसे तेज़ तरीका है। MindEase में ये व्यायाम उपलब्ध हैं:\n\n🟦 **बॉक्स ब्रीदिंग** — 4 में, 4 रोकें, 4 बाहर, 4 रोकें। तनाव और घबराहट के लिए बेहतरीन।\n\n🌙 **4-7-8 ब्रीदिंग** — 4 में, 7 रोकें, 8 बाहर। नींद के लिए खास तौर पर अच्छा।\n\n🌊 **पेट से सांस** — गहरी सांस जो पूरे फेफड़ों को काम में लाती है।\n\n🌿 **अनुलोम-विलोम** — संतुलन और ध्यान के लिए एक योग तकनीक।\n\nऐप में ब्रीदिंग सेक्शन में जाएं और गाइडेड एनिमेशन के साथ इन्हें आज़माएं!`,
    },
  },
  help: {
    en: {
      text: `I'm really glad you reached out. That itself takes courage.\n\nI'm here to listen and support you. Here's what I can help with:\n\n💬 **Talk it through** — Share what's on your mind, I'll listen and offer support.\n\n🧘 **Breathing exercises** — To calm anxiety or stress in the moment.\n\n📊 **Mood tracking** — Log how you feel each day to spot patterns over time.\n\n💡 **Coping tips** — Practical strategies for anxiety, stress, sadness, and more.\n\nWhat would you like to start with? Or just tell me how you're feeling right now.`,
    },
    hi: {
      text: `मुझे खुशी है कि आपने यहाँ आने का कदम उठाया। यह खुद में साहस का काम है।\n\nमैं यहाँ सुनने और साथ देने के लिए हूँ। मैं इन चीज़ों में मदद कर सकता हूँ:\n\n💬 **बात करना** — जो मन में है शेयर करें, मैं सुनूंगा और सहयोग दूंगा।\n\n🧘 **श्वास व्यायाम** — तनाव या घबराहट को तुरंत कम करने के लिए।\n\n📊 **मूड ट्रैकिंग** — हर दिन अपना मूड नोट करें और समय के साथ पैटर्न देखें।\n\n💡 **सामना करने के तरीके** — चिंता, तनाव, उदासी के लिए व्यावहारिक सुझाव।\n\nकहाँ से शुरू करना चाहेंगे? या बस बताएं अभी कैसा महसूस हो रहा है।`,
    },
  },
  suicidal: {
    en: {
      text: `I'm so glad you're talking to me right now, and I want you to know that what you're feeling matters deeply.\n\nPlease reach out to a crisis support line immediately — they are trained to help and are available 24/7:\n\n🆘 **iCall (India):** 9152987821\n🆘 **Vandrevala Foundation:** 1860-2662-345 (24/7)\n🆘 **iMind:** 040-39539353\n\nYou are not alone. Please make that call. I'm here with you.`,
    },
    hi: {
      text: `मुझे बहुत खुशी है कि आप अभी मुझसे बात कर रहे हैं। आप जो महसूस कर रहे हैं वह बहुत मायने रखता है।\n\nकृपया तुरंत किसी क्राइसिस हेल्पलाइन से बात करें — वे मदद के लिए प्रशिक्षित हैं और 24/7 उपलब्ध हैं:\n\n🆘 **iCall (India):** 9152987821\n🆘 **Vandrevala Foundation:** 1860-2662-345 (24/7)\n🆘 **iMind:** 040-39539353\n\nआप अकेले नहीं हैं। कृपया यह कॉल करें। मैं आपके साथ हूँ।`,
    },
  },
  general: {
    en: {
      text: `Thank you for sharing that with me. I'm here, and I'm listening.\n\nCould you tell me a little more about how you're feeling? Sometimes putting words to our emotions — even imperfectly — helps us understand what we need.\n\nFor example, are you feeling more anxious, stressed, sad, or overwhelmed? Or something else entirely? There's no wrong answer here.`,
    },
    hi: {
      text: `शेयर करने के लिए शुक्रिया। मैं यहाँ हूँ और सुन रहा हूँ।\n\nक्या आप थोड़ा और बता सकते हैं कि आप कैसा महसूस कर रहे हैं? कभी-कभी भावनाओं को शब्दों में डालने से — भले ही अधूरे शब्दों में — हमें समझ आता है कि हमें क्या चाहिए।\n\nजैसे, क्या आप घबराहट, तनाव, उदासी, या बोझ जैसा महसूस कर रहे हैं? या कुछ और? यहाँ कोई गलत जवाब नहीं है।`,
    },
  },
};

export function generateResponse(userText: string): string {
  const lang = detectLanguage(userText);
  const intent = detectIntent(userText, lang);
  const response = responses[intent]?.[lang] ?? responses.general[lang];
  return response.text + (response.followUp ?? "");
}

export function simulateStream(text: string, onChunk: (chunk: string) => void, onDone: () => void) {
  const words = text.split(/(\s+)/);
  let index = 0;

  const sendNext = () => {
    if (index >= words.length) {
      onDone();
      return;
    }
    const word = words[index++];
    onChunk(word);
    const delay = word.trim().length === 0 ? 10 : Math.floor(Math.random() * 25) + 15;
    setTimeout(sendNext, delay);
  };

  setTimeout(sendNext, 120);
}
