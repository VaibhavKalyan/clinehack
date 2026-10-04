import type { Language, LanguageMeta } from './contracts';

/** Language switcher metadata + speech locales. Extend here to add a language. */
export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', native: 'English', speechLocale: 'en-IN' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', speechLocale: 'hi-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', speechLocale: 'te-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', speechLocale: 'ta-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', speechLocale: 'kn-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', speechLocale: 'mr-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', speechLocale: 'bn-IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', speechLocale: 'gu-IN' },
];

/** Every user-facing string. English is complete; others may fall back to it. */
export interface Labels {
  nav: string; how: string; profile: string; profileSub: string; optional: string;
  age: string; state: string; district: string; income: string; occupation: string;
  gender: string; category: string; student: string; land: string; disability: string;
  find: string; reset: string; eyebrow: string; title: string; title2: string; intro: string;
  welcome: string; welcomeSub: string; ask: string; send: string;  
   results: string; resultsSub: string;  
      trace: string;
  demo: string; demoSub: string; privacy: string; warning: string; empty: string; emptySub: string;
  prompts: string[]; documents: string; steps: string; official: string; verified: string;
  unverified: string; likely: string; eligible: string; not_eligible: string; missing: string;
  any: string; error: string; working: string;
  detect: string; detecting: string; locUse: string; locDenied: string; locFailed: string;
  locApprox: string; locPrivacy: string; locManual: string;
  // Account & auth
  greeting: string; name: string; welcomeBack: string; guest: string; guestNote: string;
  signIn: string; signUp: string; signOut: string; email: string; password: string;
  continueGuest: string; authTitleSignIn: string; authTitleSignUp: string; authSub: string;
  authError: string; synced: string; saving: string; authTrust: string;
  saved: string; applied: string; saveForLater: string; markApplied: string;
  savedEmpty: string; appliedEmpty: string;
  accountSettings: string; displayName: string; updateName: string;
  currentPassword: string; newPassword: string; updatePassword: string;
  passwordUpdated: string; nameUpdated: string;
  install: string; installHint: string; offlineReady: string;
  // Microphone diagnostics — specific, actionable failure messages.
     
     
}

const en: Labels = {
  nav: 'Your navigator', how: 'How it works', profile: 'Your profile',
  profileSub: 'A few details open the right doors.', optional: 'Optional details',
  age: 'Age', state: 'State / Union territory', district: 'District', income: 'Annual household income',
  occupation: 'Occupation', gender: 'Gender', category: 'Social category', student: 'I am a student',
  land: 'I own agricultural land', disability: 'I have a disability', find: 'Find my schemes',
  reset: 'Start fresh', eyebrow: 'A LITTLE GUIDANCE. A WORLD OF OPPORTUNITY.', title: 'The right support.',
  title2: 'Closer than you think.',
  intro: 'Discover government schemes that could support you and your family. Just tell us a little about yourself.',
  welcome: 'Hello! I’m Knock, your welfare navigator.',
  welcomeSub: 'Let’s find the support you deserve. Tell me about yourself — your age, where you live, and what you do. We’ll take it one step at a time.',
  ask: 'Ask in your own words…', send: 'Send message', results: 'Your opportunities',
  resultsSub: 'A starting point, not a final eligibility decision.', trace: 'Behind the conversation', demo: 'Demo mode',
  demoSub: 'No API key needed · rules-based guidance',
  privacy: 'Your details stay in this session. No account needed.',
  warning: 'Preliminary guidance only. Some scheme rules are not modeled; confirm eligibility and current details with the official provider.',
  empty: 'Your next opportunity starts here.',
  emptySub: 'Share your details to see relevant schemes, documents, and next steps.',
  prompts: ['I’m a 28-year-old farmer in Telangana', 'I’m a student looking for education support', 'Help me find health coverage'],
  documents: 'Documents to prepare', steps: 'How to apply', official: 'Visit official website',
  verified: 'Source review date', unverified: 'Not verified', likely: 'Potential match',
  eligible: 'Modeled rules met', not_eligible: 'Not a match', missing: 'Details still needed',
  any: 'Select', error: 'We couldn’t complete that request. Please try again.',
  working: 'Finding the right doors for you…',
  detect: 'Detect my location', detecting: 'Detecting your area…', locUse: 'Use this area',
  locDenied: 'Location permission was denied. You can choose your state manually.',
  locFailed: 'We couldn’t detect your area. Please choose it manually.',
  locApprox: 'Approximate area from your network. You can fine-tune it.',
  locPrivacy: 'Used only on this device to pre-fill your area. You can change it anytime.',
  locManual: 'Choose manually',
  greeting: 'Hi', name: 'Your name', welcomeBack: 'Welcome back', guest: 'Guest',
  guestNote: 'You’re exploring without an account — details stay in this session only.',
  signIn: 'Sign in', signUp: 'Create account', signOut: 'Sign out', email: 'Email', password: 'Password',
  continueGuest: 'Explore without an account', authTitleSignIn: 'Welcome back', authTitleSignUp: 'Create your account',
  authSub: 'One account keeps your profile, language and preferences in sync.',
  authError: 'We couldn’t complete that request. Please try again.',
  synced: 'Auto-saved to your account', saving: 'Saving…',
  authTrust: 'Passwords are hashed. Conversation text is never stored.',
  saved: 'Saved', applied: 'Applied', saveForLater: 'Save for later', markApplied: 'Mark as applied',
  savedEmpty: 'Nothing saved yet. Save schemes from the list to find them here.',
  appliedEmpty: 'No applications yet. Mark schemes as applied once you submit them.',
  accountSettings: 'Account settings', displayName: 'Display name', updateName: 'Update name',
  currentPassword: 'Current password', newPassword: 'New password', updatePassword: 'Update password',
  passwordUpdated: 'Password updated', nameUpdated: 'Name updated',
  install: 'Install app',
  installHint: 'Add Knock to your home screen for fast, offline access.',
  offlineReady: 'Ready to work offline.',
  };

const hi: Partial<Labels> = {
  nav: 'आपका मार्गदर्शक', how: 'यह कैसे काम करता है', profile: 'आपकी प्रोफ़ाइल',
  profileSub: 'कुछ जानकारी से सही सहायता खोजें।', optional: 'वैकल्पिक जानकारी',
  age: 'उम्र', state: 'राज्य / केंद्र शासित प्रदेश', district: 'ज़िला', income: 'परिवार की वार्षिक आय',
  occupation: 'पेशा', gender: 'लिंग', category: 'सामाजिक वर्ग', student: 'मैं विद्यार्थी हूँ',
  land: 'मेरे पास कृषि भूमि है', disability: 'मुझे दिव्यांगता है', find: 'मेरी योजनाएँ खोजें',
  reset: 'नई शुरुआत', eyebrow: 'थोड़ा मार्गदर्शन। ढेर सारे अवसर।', title: 'सही सहायता।', title2: 'आपके और करीब।',
  intro: 'अपने और अपने परिवार के लिए सरकारी योजनाएँ खोजें। बस अपने बारे में थोड़ा बताएं।',
  welcome: 'नमस्ते! मैं Knock, आपका कल्याण मार्गदर्शक हूँ।',
  welcomeSub: 'आइए आपके लिए सहायता खोजें। अपनी उम्र, राज्य और काम के बारे में बताएं। हम एक-एक कदम आगे बढ़ेंगे।',
  ask: 'अपने शब्दों में पूछें…', send: 'संदेश भेजें', results: 'आपके अवसर',
  resultsSub: 'शुरुआती मार्गदर्शन, अंतिम पात्रता निर्णय नहीं।', trace: 'बातचीत के पीछे', demo: 'डेमो मोड', demoSub: 'API कुंजी की जरूरत नहीं · नियम-आधारित मार्गदर्शन',
  privacy: 'जानकारी केवल इस सत्र में रहती है। खाता जरूरी नहीं।',
  warning: 'केवल प्रारंभिक मार्गदर्शन। कुछ नियम शामिल नहीं हैं; पात्रता और नवीनतम जानकारी आधिकारिक प्रदाता से जाँचें।',
  empty: 'आपका अगला अवसर यहाँ से शुरू होता है।', emptySub: 'संबंधित योजनाएँ और अगले कदम देखने के लिए जानकारी साझा करें।',
  prompts: ['मैं तेलंगाना का 28 साल का किसान हूँ', 'मैं विद्यार्थी हूँ, शिक्षा सहायता चाहिए', 'स्वास्थ्य सहायता खोजने में मदद करें'],
  documents: 'ज़रूरी दस्तावेज़', steps: 'आवेदन कैसे करें', official: 'आधिकारिक वेबसाइट', verified: 'स्रोत समीक्षा तिथि',
  unverified: 'सत्यापित नहीं', likely: 'संभावित पात्रता', eligible: 'मॉडल किए नियम पूरे', not_eligible: 'मेल नहीं',
  missing: 'अभी आवश्यक जानकारी', any: 'चुनें', error: 'अनुरोध पूरा नहीं हुआ। फिर कोशिश करें।', working: 'आपके लिए सहायता खोज रहे हैं…',
  detect: 'मेरा स्थान पहचानें', detecting: 'आपका क्षेत्र पहचान रहे हैं…', locUse: 'यह क्षेत्र उपयोग करें',
  locDenied: 'स्थान की अनुमति नहीं मिली। आप राज्य खुद चुन सकते हैं।', locFailed: 'क्षेत्र पहचान नहीं हो सका। कृपया खुद चुनें।',
  locApprox: 'नेटवर्क से अनुमानित क्षेत्र। आप इसे बदल सकते हैं।', locPrivacy: 'केवल इस डिवाइस पर क्षेत्र भरने के लिए। आप कभी बदल सकते हैं।',
  locManual: 'खुद चुनें', greeting: 'नमस्ते', name: 'आपका नाम', welcomeBack: 'वापसी पर स्वागत है', guest: 'मेहमान',
  guestNote: 'आप बिना खाते देख रहे हैं — जानकारी केवल इस सत्र में रहेगी।',
  signIn: 'साइन इन करें', signUp: 'खाता बनाएं', signOut: 'साइन आउट', email: 'ईमेल', password: 'पासवर्ड',
  continueGuest: 'बिना खाते देखें', authTitleSignIn: 'वापसी पर स्वागत है', authTitleSignUp: 'अपना खाता बनाएं',
  authSub: 'एक खाता आपकी प्रोफ़ाइल, भाषा और सेटिंग्स सिंक रखता है।',
  authError: 'अनुरोध पूरा नहीं हुआ। फिर कोशिश करें।',
  synced: 'आपके खाते में स्वतः सहेजा गया', saving: 'सहेज रहे हैं…',
  authTrust: 'पासवर्ड हैश किए जाते हैं। बातचीत कभी सहेजी नहीं जाती।',
  saved: 'सहेजा गया', applied: 'आवेदन किया', saveForLater: 'बाद के लिए सहेजें', markApplied: 'आवेदन चिह्नित करें',
  savedEmpty: 'अभी कुछ सहेजा नहीं गया। सूची से योजनाएँ सहेजें, वे यहाँ दिखेंगी।',
  appliedEmpty: 'अभी कोई आवेदन नहीं। आवेदन जमा करने के बाद योजनाएँ चिह्नित करें।',
  accountSettings: 'खाता सेटिंग', displayName: 'प्रदर्शित नाम', updateName: 'नाम अपडेट करें',
  currentPassword: 'वर्तमान पासवर्ड', newPassword: 'नया पासवर्ड', updatePassword: 'पासवर्ड अपडेट करें',
  passwordUpdated: 'पासवर्ड अपडेट हो गया', nameUpdated: 'नाम अपडेट हो गया',
  install: 'ऐप इंस्टॉल करें', installHint: 'तेज़, ऑफ़लाइन उपयोग के लिए Knock को होम स्क्रीन पर जोड़ें।', offlineReady: 'ऑफ़लाइन काम करने के लिए तैयार।',
};
const te: Partial<Labels> = {
  nav: 'మీ మార్గదర్శి', how: 'ఇది ఎలా పనిచేస్తుంది', profile: 'మీ ప్రొఫైల్',
  profileSub: 'కొన్ని వివరాలు సరైన తలుపులు తెరుస్తాయి.', optional: 'ఐచ్ఛిక వివరాలు',
  age: 'వయస్సు', state: 'రాష్ట్రం / కేంద్ర పాలిత ప్రాంతం', district: 'జిల్లా', income: 'కుటుంబ వార్షిక ఆదాయం',
  occupation: 'వృత్తి', gender: 'లింగం', category: 'సామాజిక వర్గం', student: 'నేను విద్యార్థిని',
  land: 'నా వద్ద వ్యవసాయ భూమి ఉంది', disability: 'నాకు వికలాంగత్వం ఉంది', find: 'నా పథకాలు కనుగొనండి',
  reset: 'కొత్తగా ప్రారంభించండి', eyebrow: 'కొంచెం మార్గదర్శనం. అనేక అవకాశాలు.', title: 'సరైన సహాయం.', title2: 'మీకు మరింత దగ్గరగా.',
  intro: 'మీ కుటుంబానికి సహాయపడే ప్రభుత్వ పథకాలను కనుగొనండి. మీ గురించి కొంచెం చెప్పండి.',
  welcome: 'నమస్కారం! నేను Knock, మీ సంక్షేమ మార్గదర్శిని.',
  welcomeSub: 'మీకు అర్హమైన సహాయం కనుగొందాం. మీ వయస్సు, నివాసం, వృత్తి గురించి చెప్పండి. మేము ఒక్కో అడుగు ముందుకు వేస్తాము.',
  ask: 'మీ మాటల్లో అడగండి…', send: 'సందేశం పంపండి', results: 'మీ అవకాశాలు',
  resultsSub: 'ప్రారంభ మార్గదర్శనం, తుది అర్హత నిర్ణయం కాదు.', trace: 'సంభాషణ వెనుక', demo: 'డెమో మోడ్', demoSub: 'API కీ అవసరం లేదు · నియమ-ఆధారిత మార్గదర్శనం',
  privacy: 'సమాచారం ఈ సెషన్‌లోనే ఉంటుంది. ఖాతా అవసరం లేదు.',
  warning: 'ప్రాథమిక మార్గదర్శనం మాత్రమే. కొన్ని నియమాలు చేర్చబడలేదు; అర్హత మరియు తాజా వివరాలు అధికారిక ప్రదాతతో ధృవీకరించండి.',
  empty: 'మీ తదుపరి అవకాశం ఇక్కడ మొదలవుతుంది.', emptySub: 'సంబంధిత పథకాలు, పత్రాలు, తదుపరి అడుగులు చూడటానికి వివరాలు పంచుకోండి.',
  prompts: ['నేను తెలంగాణలో 28 ఏళ్ల రైతును', 'నేను విద్యార్థిని, విద్యా సహాయం కావాలి', 'ఆరోగ్య సహాయం కనుగొనడంలో సహాయపడండి'],
  documents: 'అవసరమైన పత్రాలు', steps: 'దరఖాస్తు ఎలా చేయాలి', official: 'అధికారిక వెబ్‌సైట్', verified: 'మూలం సమీక్ష తేదీ',
  unverified: 'ధృవీకరించబడలేదు', likely: 'సంభావ్య అర్హత', eligible: 'నమూనా నియమాలు నెరవేర్చారు', not_eligible: 'సరిపోలడం లేదు',
  missing: 'ఇంకా అవసరమైన వివరాలు', any: 'ఎంచుకోండి', error: 'అభ్యర్థన పూర్తికాలేదు. మళ్లీ ప్రయత్నించండి.', working: 'మీ కోసం సహాయం వెతుకుతున్నాము…',
  detect: 'నా స్థానం గుర్తించండి', detecting: 'మీ ప్రాంతం గుర్తిస్తున్నాము…', locUse: 'ఈ ప్రాంతం వాడండి',
  locDenied: 'స్థాన అనుమతి నిరాకరించబడింది. మీరు రాష్ట్రం ఎంచుకోవచ్చు.', locFailed: 'ప్రాంతం గుర్తించలేకపోయాము. దయచేసి మీరే ఎంచుకోండి.',
  locApprox: 'నెట్‌వర్క్ నుండి అంచనా ప్రాంతం. మీరు మార్చవచ్చు.', locPrivacy: 'ఈ పరికరంలో ప్రాంతం నింపడానికి మాత్రమే. మీరు ఎప్పుడైనా మార్చవచ్చు.',
  locManual: 'మీరే ఎంచుకోండి', greeting: 'నమస్కారం', name: 'మీ పేరు', welcomeBack: 'తిరిగి స్వాగతం', guest: 'అతిథి',
  guestNote: 'మీరు ఖాతా లేకుండా చూస్తున్నారు — వివరాలు ఈ సెషన్‌లోనే ఉంటాయి.',
  signIn: 'సైన్ ఇన్', signUp: 'ఖాతా తెరవండి', signOut: 'సైన్ అవుట్', email: 'ఇమెయిల్', password: 'పాస్‌వర్డ్',
  continueGuest: 'ఖాతా లేకుండా చూడండి', authTitleSignIn: 'తిరిగి స్వాగతం', authTitleSignUp: 'మీ ఖాతా తెరవండి',
  authSub: 'ఒక ఖాతా మీ ప్రొఫైల్, భాష, సెట్టింగ్‌లను సింక్‌లో ఉంచుతుంది.',
  authError: 'అభ్యర్థన పూర్తికాలేదు. మళ్లీ ప్రయత్నించండి.',
  synced: 'మీ ఖాతాలో స్వయంగా సేవ్ చేయబడింది', saving: 'సేవ్ చేస్తున్నాము…',
  authTrust: 'పాస్‌వర్డ్‌లు హాష్ చేయబడతాయి. సంభాషణ ఎప్పుడూ నిల్వ ఉండదు.',
  saved: 'సేవ్ చేయబడింది', applied: 'దరఖాస్తు చేయబడింది', saveForLater: 'తర్వాత కోసం సేవ్ చేయండి', markApplied: 'దరఖాస్తుగా గుర్తించండి',
  savedEmpty: 'ఇంకా ఏమీ సేవ్ చేయలేదు. జాబితా నుంచి పథకాలను సేవ్ చేయండి, అవి ఇక్కడ కనిపిస్తాయి.',
  appliedEmpty: 'ఇంకా దరఖాస్తులు లేవు. దరఖాస్తు చేసిన తర్వాత పథకాలను గుర్తించండి.',
  accountSettings: 'ఖాతా సెట్టింగ్‌లు', displayName: 'ప్రదర్శిత పేరు', updateName: 'పేరు అప్డేట్ చేయండి',
  currentPassword: 'ప్రస్తుత పాస్‌వర్డ్', newPassword: 'కొత్త పాస్‌వర్డ్', updatePassword: 'పాస్‌వర్డ్ అప్డేట్ చేయండి',
  passwordUpdated: 'పాస్‌వర్డ్ అప్డేట్ అయింది', nameUpdated: 'పేరు అప్డేట్ అయింది',
  install: 'యాప్ ఇన్‌స్టాల్ చేయండి', installHint: 'వేగవంతమైన, ఆఫ్‌లైన్ ఉపయోగం కోసం Knock ను హోమ్ స్క్రీన్‌కు జోడించండి.', offlineReady: 'ఆఫ్‌లైన్‌లో పనిచేయడానికి సిద్ధం.',
};
const ta: Partial<Labels> = {
  nav: 'உங்கள் வழிகாட்டி', how: 'இது எப்படி செயல்படுகிறது', profile: 'உங்கள் சுயவிவரம்',
  profileSub: 'சில விவரங்கள் சரியான கதவுகளைத் திறக்கும்.', optional: 'விருப்ப விவரங்கள்',
  age: 'வயது', state: 'மாநிலம் / யூனியன் பிரதேசம்', district: 'மாவட்டம்', income: 'குடும்ப ஆண்டு வருமானம்',
  occupation: 'தொழில்', gender: 'பாலினம்', category: 'சமூகப் பிரிவு', student: 'நான் மாணவன்/மாணவி',
  land: 'என்னிடம் விவசாய நிலம் உள்ளது', disability: 'எனக்கு மாற்றுத்திறன் உள்ளது', find: 'என் திட்டங்களைக் கண்டறி',
  reset: 'புதிதாகத் தொடங்கு', eyebrow: 'சிறிது வழிகாட்டுதல். ஏராளமான வாய்ப்புகள்.', title: 'சரியான உதவி.', title2: 'உங்களுக்கு மேலும் நெருக்கமாக.',
  intro: 'உங்கள் குடும்பத்திற்கு உதவும் அரசு திட்டங்களைக் கண்டறியுங்கள். உங்களைப் பற்றி சிறிது சொல்லுங்கள்.',
  welcome: 'வணக்கம்! நான் Knock, உங்கள் நல வழிகாட்டி.',
  welcomeSub: 'உங்களுக்கு உரிய உதவியைக் கண்டறிவோம். உங்கள் வயது, இருப்பிடம், தொழில் பற்றிச் சொல்லுங்கள்.',
  ask: 'உங்கள் சொற்களில் கேளுங்கள்…', send: 'செய்தி அனுப்பு', results: 'உங்கள் வாய்ப்புகள்',
  resultsSub: 'தொடக்க வழிகாட்டுதல், இறுதித் தகுதி முடிவு அல்ல.', documents: 'தேவையான ஆவணங்கள்', steps: 'விண்ணப்பிக்கும் முறை', official: 'அதிகாரப்பூர்வ இணையதளம்',
  verified: 'மூல மதிப்பாய்வு தேதி', unverified: 'சரிபார்க்கப்படவில்லை', likely: 'சாத்தியமான பொருத்தம்',
  eligible: 'மாதிரி விதிகள் பூர்த்தி', not_eligible: 'பொருந்தவில்லை', missing: 'இன்னும் தேவையான விவரங்கள்',
  any: 'தேர்ந்தெடு', error: 'கோரிக்கையை முடிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', working: 'உங்களுக்கான உதவியைத் தேடுகிறோம்…',
  detect: 'என் இடத்தைக் கண்டறி', detecting: 'உங்கள் பகுதியைக் கண்டறிகிறோம்…', locUse: 'இந்தப் பகுதியைப் பயன்படுத்து',
  locDenied: 'இட அனுமதி மறுக்கப்பட்டது. நீங்கள் மாநிலத்தைத் தேர்ந்தெடுக்கலாம்.',
  locFailed: 'பகுதியைக் கண்டறிய முடியவில்லை. தயவுசெய்து நீங்களே தேர்ந்தெடுக்கவும்.',
  greeting: 'வணக்கம்', name: 'உங்கள் பெயர்', signIn: 'உள்நுழை', signUp: 'கணக்கை உருவாக்கு', signOut: 'வெளியேறு',
  email: 'மின்னஞ்சல்', password: 'கடவுச்சொல்', continueGuest: 'கணக்கு இல்லாமல் தொடரவும்',
  saved: 'சேமிக்கப்பட்டது', applied: 'விண்ணப்பிக்கப்பட்டது',
  install: 'செயலியை நிறுவு', installHint: 'வேகமான, ஆஃப்லைன் அணுகலுக்கு Knock ஐ முகப்புத் திரையில் சேர்க்கவும்.',
};
const kn: Partial<Labels> = {
  nav: 'ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶಿ', how: 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', profile: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್',
  profileSub: 'ಕೆಲವು ವಿವರಗಳು ಸರಿಯಾದ ಬಾಗಿಲುಗಳನ್ನು ತೆರೆಯುತ್ತವೆ.', optional: 'ಐಚ್ಛಿಕ ವಿವರಗಳು',
  age: 'ವಯಸ್ಸು', state: 'ರಾಜ್ಯ / ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶ', district: 'ಜಿಲ್ಲೆ', income: 'ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ',
  occupation: 'ಉದ್ಯೋಗ', gender: 'ಲಿಂಗ', category: 'ಸಾಮಾಜಿಕ ವರ್ಗ', student: 'ನಾನು ವಿದ್ಯಾರ್ಥಿ',
  land: 'ನನ್ನ ಬಳಿ ಕೃಷಿ ಭೂಮಿ ಇದೆ', disability: 'ನನಗೆ ಅಂಗವೈಕಲ್ಯ ಇದೆ', find: 'ನನ್ನ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ',
  reset: 'ಹೊಸದಾಗಿ ಪ್ರಾರಂಭಿಸಿ', eyebrow: 'ಸ್ವಲ್ಪ ಮಾರ್ಗದರ್ಶನ. ಅನೇಕ ಅವಕಾಶಗಳು.', title: 'ಸರಿಯಾದ ಸಹಾಯ.', title2: 'ನಿಮಗೆ ಇನ್ನಷ್ಟು ಹತ್ತಿರ.',
  intro: 'ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಸಹಾಯ ಮಾಡುವ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ. ನಿಮ್ಮ ಬಗ್ಗೆ ಸ್ವಲ್ಪ ಹೇಳಿ.',
  welcome: 'ನಮಸ್ಕಾರ! ನಾನು Knock, ನಿಮ್ಮ ಕಲ್ಯಾಣ ಮಾರ್ಗದರ್ಶಿ.',
  welcomeSub: 'ನಿಮಗೆ ಅರ್ಹವಾದ ಸಹಾಯವನ್ನು ಹುಡುಕೋಣ. ನಿಮ್ಮ ವಯಸ್ಸು, ವಾಸಸ್ಥಳ, ಉದ್ಯೋಗದ ಬಗ್ಗೆ ಹೇಳಿ.',
  ask: 'ನಿಮ್ಮ ಮಾತುಗಳಲ್ಲಿ ಕೇಳಿ…', send: 'ಸಂದೇಶ ಕಳುಹಿಸಿ', results: 'ನಿಮ್ಮ ಅವಕಾಶಗಳು',
  resultsSub: 'ಆರಂಭಿಕ ಮಾರ್ಗದರ್ಶನ, ಅಂತಿಮ ಅರ್ಹತಾ ನಿರ್ಧಾರವಲ್ಲ.', documents: 'ಬೇಕಾದ ದಾಖಲೆಗಳು', steps: 'ಅರ್ಜಿ ಹಾಕುವುದು ಹೇಗೆ', official: 'ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್',
  verified: 'ಮೂಲ ಪರಿಶೀಲನಾ ದಿನಾಂಕ', unverified: 'ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ', likely: 'ಸಾಧ್ಯವಾದ ಹೊಂದಾಣಿಕೆ',
  eligible: 'ಮಾದರಿ ನಿಯಮಗಳು ಪೂರ್ಣ', not_eligible: 'ಹೊಂದುತ್ತಿಲ್ಲ', missing: 'ಇನ್ನೂ ಬೇಕಾದ ವಿವರಗಳು',
  any: 'ಆಯ್ಕೆಮಾಡಿ', error: 'ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', working: 'ನಿಮಗಾಗಿ ಸಹಾಯ ಹುಡುಕುತ್ತಿದ್ದೇವೆ…',
  detect: 'ನನ್ನ ಸ್ಥಳ ಪತ್ತೆಮಾಡಿ', detecting: 'ನಿಮ್ಮ ಪ್ರದೇಶ ಪತ್ತೆಮಾಡುತ್ತಿದ್ದೇವೆ…', locUse: 'ಈ ಪ್ರದೇಶ ಬಳಸಿ',
  locDenied: 'ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ನೀವು ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಬಹುದು.',
  locFailed: 'ಪ್ರದೇಶ ಪತ್ತೆಮಾಡಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನೀವೇ ಆಯ್ಕೆಮಾಡಿ.',
  greeting: 'ನಮಸ್ಕಾರ', name: 'ನಿಮ್ಮ ಹೆಸರು', signIn: 'ಸೈನ್ ಇನ್', signUp: 'ಖಾತೆ ತೆರೆಯಿರಿ', signOut: 'ಸೈನ್ ಔಟ್',
  email: 'ಇಮೇಲ್', password: 'ಪಾಸ್ವರ್ಡ್', continueGuest: 'ಖಾತೆ ಇಲ್ಲದೆ ಮುಂದುವರಿಸಿ',
  saved: 'ಉಳಿಸಿದ', applied: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ',
  install: 'ಆಪ್ ಸ್ಥಾಪಿಸಿ', installHint: 'ವೇಗವಾದ, ಆಫ್‌ಲೈನ್ ಬಳಕೆಗಾಗಿ Knock ಅನ್ನು ಮುಖಪುಟಕ್ಕೆ ಸೇರಿಸಿ.',
};
const mr: Partial<Labels> = {
  nav: 'तुमचा मार्गदर्शक', how: 'हे कसे काम करते', profile: 'तुमचे प्रोफाइल',
  profileSub: 'काही माहितीने योग्य दारे उघडतात.', optional: 'पर्यायी माहिती',
  age: 'वय', state: 'राज्य / केंद्रशासित प्रदेश', district: 'जिल्हा', income: 'कुटुंबाचे वार्षिक उत्पन्न',
  occupation: 'व्यवसाय', gender: 'लिंग', category: 'सामाजिक प्रवर्ग', student: 'मी विद्यार्थी आहे',
  land: 'माझ्याकडे शेती जमीन आहे', disability: 'मला दिव्यांगता आहे', find: 'माझ्या योजना शोधा',
  reset: 'नवीन सुरुवात', eyebrow: 'थोडे मार्गदर्शन. अनेक संधी.', title: 'योग्य मदत.', title2: 'तुम्हाला अजून जवळ.',
  intro: 'तुमच्या आणि कुटुंबासाठी मदत करणाऱ्या सरकारी योजना शोधा. तुमच्याबद्दल थोडे सांगा.',
  welcome: 'नमस्कार! मी Knock, तुमचा कल्याण मार्गदर्शक.',
  welcomeSub: 'तुम्हाला मिळणारी मदत शोधूया. तुमचे वय, राहण्याचे ठिकाण, व्यवसाय सांगा.',
  ask: 'तुमच्या शब्दांत विचारा…', send: 'संदेश पाठवा', results: 'तुमच्या संधी',
  resultsSub: 'सुरुवातीचे मार्गदर्शन, अंतिम पात्रता निर्णय नाही.', documents: 'लागणारे कागदपत्रे', steps: 'अर्ज कसा करावा', official: 'अधिकृत वेबसाइट',
  verified: 'स्रोत पडताळणी दिनांक', unverified: 'पडताळले नाही', likely: 'संभाव्य जुळणार',
  eligible: 'नमुना नियम पूर्ण', not_eligible: 'जुळत नाही', missing: 'अजून लागणारी माहिती',
  any: 'निवडा', error: 'विनंती पूर्ण करता आली नाही. पुन्हा प्रयत्न करा.', working: 'तुमच्यासाठी मदत शोधत आहोत…',
  detect: 'माठे ठिकाण ओळखा', detecting: 'तुमचे क्षेत्र ओळखत आहोत…', locUse: 'हे क्षेत्र वापरा',
  locDenied: 'स्थान परवानगी नाकारली. तुम्ही राज्य निवडू शकता.',
  locFailed: 'क्षेत्र ओळखता आले नाही. कृपया स्वतः निवडा.',
  greeting: 'नमस्कार', name: 'तुमचे नाव', signIn: 'साइन इन', signUp: 'खाते तयार करा', signOut: 'साइन आउट',
  email: 'ईमेल', password: 'पासवर्ड', continueGuest: 'खात्याशिवाय पुढे जा',
  saved: 'जतन केले', applied: 'अर्ज केला',
  install: 'अ‍ॅप इन्स्टॉल करा', installHint: 'जलद, ऑफलाइन वापरासाठी Knock होम स्क्रीनवर जोडा.',
};
const bn: Partial<Labels> = {
  nav: 'আপনার পথপ্রদর্শক', how: 'এটি কীভাবে কাজ করে', profile: 'আপনার প্রোফাইল',
  profileSub: 'কিছু তথ্য সঠিক দরজা খুলে দেয়।', optional: 'ঐচ্ছিক তথ্য',
  age: 'বয়স', state: 'রাজ্য / কেন্দ্রশাসিত অঞ্চল', district: 'জেলা', income: 'পরিবারের বার্ষিক আয়',
  occupation: 'পেশা', gender: 'লিঙ্গ', category: 'সামাজিক বিভাগ', student: 'আমি শিক্ষার্থী',
  land: 'আমার কাছে কৃষিজমি আছে', disability: 'আমার প্রতিবন্ধিতা আছে', find: 'আমার প্রকল্পগুলো খুঁজুন',
  reset: 'নতুন করে শুরু', eyebrow: 'সামান্য নির্দেশনা। বহু সুযোগ।', title: 'সঠিক সহায়তা।', title2: 'আপনার আরও কাছে।',
  intro: 'আপনার ও পরিবারের সহায়ক সরকারি প্রকল্প খুঁজুন। নিজের সম্পর্কে সামান্য বলুন।',
  welcome: 'নমস্কার! আমি Knock, আপনার কল্যাণ পথপ্রদর্শক।',
  welcomeSub: 'আপনার প্রাপ্য সহায়তা খুঁজে নিই। আপনার বয়স, ঠিকানা, পেশা বলুন।',
  ask: 'নিজের ভাষায় জিজ্ঞাসা করুন…', send: 'বার্তা পাঠান', results: 'আপনার সুযোগ',
  resultsSub: 'প্রাথমিক নির্দেশনা, চূড়ান্ত যোগ্যতার সিদ্ধান্ত নয়।', documents: 'প্রয়োজনীয় কাগজপত্র', steps: 'আবেদন পদ্ধতি', official: 'সরকারি ওয়েবসাইট',
  verified: 'উৎস পর্যালোচনার তারিখ', unverified: 'যাচাই হয়নি', likely: 'সম্ভাব্য মিল',
  eligible: 'মডেল নিয়ম পূর্ণ', not_eligible: 'মেলে না', missing: 'এখনও প্রয়োজনীয় তথ্য',
  any: 'নির্বাচন করুন', error: 'অনুরোধ সম্পন্ন হয়নি। আবার চেষ্টা করুন।', working: 'আপনার জন্য সহায়তা খুঁজছি…',
  detect: 'আমার অবস্থান শনাক্ত করুন', detecting: 'আপনার এলাকা শনাক্ত করছি…', locUse: 'এই এলাকা ব্যবহার করুন',
  locDenied: 'অবস্থানের অনুমতি দেওয়া হয়নি। আপনি রাজ্য বেছে নিতে পারেন।',
  locFailed: 'এলাকা শনাক্ত করা যায়নি। অনুগ্রহ করে নিজে বেছে নিন।',
  greeting: 'নমস্কার', name: 'আপনার নাম', signIn: 'সাইন ইন', signUp: 'অ্যাকাউন্ট তৈরি করুন', signOut: 'সাইন আউট',
  email: 'ইমেইল', password: 'পাসওয়ার্ড', continueGuest: 'অ্যাকাউন্ট ছাড়াই এগিয়ে যান',
  saved: 'সংরক্ষিত', applied: 'আবেদন করা হয়েছে',
  install: 'অ্যাপ ইনস্টল করুন', installHint: 'দ্রুত, অফলাইন ব্যবহারের জন্য Knock হোম স্ক্রিনে যোগ করুন।',
};
const gu: Partial<Labels> = {
  nav: 'તમારો માર્ગદર્શક', how: 'આ કેવી રીતે કામ કરે છે', profile: 'તમારી પ્રોફાઇલ',
  profileSub: 'થોડી માહિતી યોગ્ય દરવાજા ખોલે છે.', optional: 'વૈકલ્પિક માહિતી',
  age: 'ઉંમર', state: 'રાજ્ય / કેન્દ્રશાસિત પ્રદેશ', district: 'જિલ્લો', income: 'કુટુંબની વાર્ષિક આવક',
  occupation: 'વ્યવસાય', gender: 'લિંગ', category: 'સામાજિક વર્ગ', student: 'હું વિદ્યાર્થી છું',
  land: 'મારી પાસે ખેતીની જમીન છે', disability: 'મને અપંગતા છે', find: 'મારી યોજનાઓ શોધો',
  reset: 'નવી શરૂઆત', eyebrow: 'થોડું માર્ગદર્શન. અનેક તકો.', title: 'યોગ્ય મદદ.', title2: 'તમને વધુ નજીક.',
  intro: 'તમારા અને કુટુંબ માટે મદદરૂપ સરકારી યોજનાઓ શોધો. તમારા વિશે થોડું કહો.',
  welcome: 'નમસ્કાર! હું Knock, તમારો કલ્યાણ માર્ગદર્શક.',
  welcomeSub: 'તમને મળવાપાત્ર મદદ શોધીએ. તમારી ઉંમર, રહેઠાણ, વ્યવસાય કહો.',
  ask: 'તમારા શબ્દોમાં પૂછો…', send: 'સંદેશ મોકલો', results: 'તમારી તકો',
  resultsSub: 'પ્રારંભિક માર્ગદર્શન, અંતિમ પાત્રતાનો નિર્ણય નહીં.', documents: 'જરૂરી દસ્તાવેજો', steps: 'અરજી કેવી રીતે કરવી', official: 'સત્તાવાર વેબસાઇટ',
  verified: 'સ્રોત સમીક્ષા તારીખ', unverified: 'ચકાસાયેલ નથી', likely: 'સંભવિત મેળ',
  eligible: 'મોડેલ નિયમો પૂર્ણ', not_eligible: 'મેળ ખાતું નથી', missing: 'હજી જરૂરી માહિતી',
  any: 'પસંદ કરો', error: 'વિનંતી પૂર્ણ થઈ શકી નથી. ફરી પ્રયાસ કરો.', working: 'તમારા માટે મદદ શોધી રહ્યા છીએ…',
  detect: 'મારું સ્થાન ઓળખો', detecting: 'તમારો વિસ્તાર ઓળખી રહ્યા છીએ…', locUse: 'આ વિસ્તાર વાપરો',
  locDenied: 'સ્થાનની પરવાનગી નામંજૂર થઈ. તમે રાજ્ય પસંદ કરી શકો છો.',
  locFailed: 'વિસ્તાર ઓળખી શકાયો નથી. કૃપા કરીને તમે પસંદ કરો.',
  greeting: 'નમસ્કાર', name: 'તમારું નામ', signIn: 'સાઇન ઇન', signUp: 'ખાતું બનાવો', signOut: 'સાઇન આઉટ',
  email: 'ઇમેઇલ', password: 'પાસવર્ડ', continueGuest: 'ખાતા વિના આગળ વધો',
  saved: 'સાચવેલું', applied: 'અરજી કરેલું',
  install: 'એપ ઇન્સ્ટોલ કરો', installHint: 'ઝડપી, ઑફલાઇન ઉપયોગ માટે Knock ને હોમ સ્ક્રીન પર ઉમેરો.',
};

const dictionaries: Record<Language, Partial<Labels>> = { en, hi, te, ta, kn, mr, bn, gu };

/** Merge the active language over the complete English base (English fallback). */
export function getLabels(lang: Language): Labels {
  return { ...en, ...(dictionaries[lang] ?? {}) };
}

/** English name of a language, used in the LLM system prompt. */
export function languageName(lang: Language): string {
  return LANGUAGES.find(l => l.code === lang)?.name ?? 'English';
}

/** BCP-47 locale for speech synthesis / recognition. */
export function speechLocale(lang: Language): string {
  return LANGUAGES.find(l => l.code === lang)?.speechLocale ?? 'en-IN';
}