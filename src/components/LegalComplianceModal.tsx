import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  FileText, 
  ExternalLink, 
  Lock, 
  X,
  Award,
  Zap,
  Building,
  HelpCircle
} from 'lucide-react';

interface LegalComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-[#212121] rounded-md max-w-3xl w-full max-h-[92vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden my-auto animate-slide-in-right">
        
        {/* Top Header - Flipkart Blue Official Banner */}
        <div className="bg-[#2874f0] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-md bg-white text-[#2874f0] flex items-center justify-center font-bold shadow-2xs shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-[#ffe500] text-[#212121] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                  Govt of India Compliance Audit
                </span>
                <span className="text-[10px] text-blue-100 font-bold">100% Legal &amp; Safe</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                सरकारी नियम व कानूनी सुरक्षा रिपोर्ट (Legal Validity)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-sm bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-[#212121]">
          
          {/* Executive Summary Card */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-md p-4 text-emerald-950 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-emerald-900 text-base">
              <ShieldCheck className="w-5 h-5 text-[#388e3c]" />
              <span>ऑडिट परिणाम: ESP की सभी सक्रिय सेवाएं 100% भारत सरकार नियमानुकूल हैं</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900 font-medium">
              उपभोक्ता मामले मंत्रालय (Ministry of Consumer Affairs) के <strong>Direct Selling Rules 2021</strong> और <strong>Prize Chits and Money Circulation Schemes (Banning) Act 1978</strong> के अनुसार, किसी भी प्लेटफॉर्म पर केवल नए लोगों को जोड़कर बिना किसी वास्तविक सेवा या उत्पाद के पैसा बांटना (Ponzi / Money Circulation) गैर-कानूनी है। ESP में प्रत्येक सेवा के बदले वास्तविक डिजिटल सेवाएं, सॉफ्टवेयर टूल्स, और यूटिलिटी कमीशन दिए जाते हैं।
            </p>
          </div>

          {/* Action Taken: Illegal Service Removed / Restructured */}
          <div className="border border-rose-200 bg-rose-50/70 rounded-md p-4 space-y-3">
            <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>कानून के तहत कौन सी सेवा हटाई/बदली गई? (Removed / Restructured Service)</span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="bg-white p-3 rounded-md border border-rose-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700">❌ हटाई गई व्यवस्था: NWI ऑटो-पूल ("बिना काम किए राष्ट्रीय जॉइनिंग से पैसा")</span>
                  <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-sm text-[10px] font-bold">गैर-कानूनी जोखिम</span>
                </div>
                <p className="text-slate-600">
                  <strong>कारण:</strong> <em>Prize Chits and Money Circulation Act 1978</em> की धारा 2(c) और <em>Direct Selling Rules 2021</em> के नियम 5(1) के तहत बिना कार्य या वास्तविक बिक्री के केवल नए सदस्यों की जॉइनिंग फीस घुमाना (Money Circulation) पूर्णतः प्रतिबंधित व संज्ञेय अपराध है। यह सिस्टम लंबे समय तक नहीं चल सकता।
                </p>
                <div className="bg-emerald-50 p-2.5 rounded-sm border border-emerald-200 text-emerald-900 mt-2">
                  <strong className="text-[#388e3c]">✅ वैध समाधान (100% Legal Restructure):</strong> 
                  <span className="ml-1">
                    इसे <strong>"LRP - लॉयल्टी रिवॉर्ड पूल"</strong> में बदला गया है, जहाँ लाभांश किसी नए सदस्य की जॉइनिंग फीस से नहीं, बल्कि प्लेटफॉर्म के वास्तविक <strong>पार्टनर मर्चेंट विज्ञापनों और मोबाइल/यूटिलिटी रिचार्ज मार्जिन</strong> से वैध रूप से साझा किया जाता है।
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-md border border-amber-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-800">⚠️ संशोधित दावा: "1 घंटे में ₹3499 गारंटीड नकद वेलकम बोनस"</span>
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-sm text-[10px] font-bold">भ्रामक विज्ञापन सुधार</span>
                </div>
                <p className="text-slate-600">
                  <strong>कारण:</strong> <em>Consumer Protection Act 2019</em> के तहत बिना वास्तविक सेवा के तुरंत नकद लौटाने का दावा भ्रामक विज्ञापन (Misleading Ads) माना जाता है।
                </p>
                <div className="bg-emerald-50 p-2.5 rounded-sm border border-emerald-200 text-emerald-900 mt-2">
                  <strong className="text-[#388e3c]">✅ वैध समाधान:</strong>
                  <span className="ml-1">
                    जॉइनिंग पर सदस्य को तुरंत <strong>₹1,500+ मूल्य की वास्तविक डिजिटल स्टार्टर किट</strong> (सोशल मीडिया ग्राफिक्स, AI प्रॉम्प्ट्स, वीडियो क्रिएशन गाइड्स) और पारदर्शी एफिलिएट कमीशन दिया जाता है।
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Indian Acts ESP Complies With */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#212121] flex items-center space-x-2">
              <Building className="w-5 h-5 text-[#2874f0]" />
              <span>भारत सरकार के 5 प्रमुख अधिनियम जिनके तहत ESP 100% सुरक्षित है:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-[#212121]">
                  <CheckCircle2 className="w-4 h-4 text-[#388e3c] shrink-0" />
                  <span>1. Direct Selling Rules, 2021 (Rule 5)</span>
                </div>
                <p className="text-slate-600">
                  पिरामिड व मनी सर्कुलेशन स्कीम का पूर्णतः निषेध। हर शुल्क के बदले ठोस डिजिटल सॉफ्टवेयर व यूटिलिटी सर्विस।
                </p>
              </div>

              <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-[#212121]">
                  <CheckCircle2 className="w-4 h-4 text-[#388e3c] shrink-0" />
                  <span>2. Prize Chits Act, 1978 (Sec 2c)</span>
                </div>
                <p className="text-slate-600">
                  सदस्यों की जॉइनिंग फीस से स्वतः लॉटरी या चिट बांटने पर रोक। ESP में केवल वास्तविक काम व एफिलिएट मार्जिन का भुगतान।
                </p>
              </div>

              <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-[#212121]">
                  <CheckCircle2 className="w-4 h-4 text-[#388e3c] shrink-0" />
                  <span>3. BUDS Act, 2019 (अनियमित जमा योजनाएं)</span>
                </div>
                <p className="text-slate-600">
                  ESP कोई निवेश या ब्याज गारंटी नहीं देता। यह एक फ्रीलांस, एफिलिएट और यूटिलिटी रिचार्ज प्लेटफॉर्म है।
                </p>
              </div>

              <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-[#212121]">
                  <CheckCircle2 className="w-4 h-4 text-[#388e3c] shrink-0" />
                  <span>4. IT Act 2000 &amp; Data Privacy</span>
                </div>
                <p className="text-slate-600">
                  सदस्यों का फोन नंबर व निजी जानकारी डिफ़ॉल्ट रूप से मास्क (छिपी) रहती है। मल्टी-डिवाइस ट्रैकिंग से सुरक्षा।
                </p>
              </div>

              <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3 space-y-1 md:col-span-2">
                <div className="flex items-center space-x-1.5 font-bold text-[#212121]">
                  <CheckCircle2 className="w-4 h-4 text-[#388e3c] shrink-0" />
                  <span>5. BBPS एवं टेलिकॉम रीसेलर नियमावली (SWIS &amp; TWIS)</span>
                </div>
                <p className="text-slate-600">
                  मोबाइल व DTH रिचार्ज पर मिलने वाला 1% से 25% कमीशन टेलिकॉम ऑपरेटर और यूटिलिटी मार्जिन से प्राप्त होता है, जो 100% वैध व स्थायी है।
                </p>
              </div>

            </div>
          </div>

          {/* User Checklist */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-xs space-y-2 text-amber-950">
            <h4 className="font-bold text-amber-900 text-sm flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>छात्रों व सदस्यों के लिए महत्वपूर्ण सलाह:</span>
            </h4>
            <ul className="space-y-1 list-disc list-inside text-slate-700">
              <li>किसी भी ऐसे प्लेटफॉर्म से बचें जो "बिना काम किए करोड़पति बनने" या "ऑटो पूल से रोज हजारों रुपए" का झूठा वादा करता हो।</li>
              <li>ESP आपको वास्तविक डिजिटल कौशल, विज्ञापन कार्य और रिचार्ज सर्विस के जरिए सुरक्षित व निरंतर कमाई का माध्यम प्रदान करता है।</li>
              <li>प्रत्येक जॉइनिंग पर आपको अपना वेरिफाइड रोल नंबर और डिजिटल आईडी कार्ड प्राप्त होता है।</li>
            </ul>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-[#f9fafb] p-3 sm:p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-600 font-semibold">
            हेल्पलाइन: WhatsApp +91 8877490845 (Santosh Ji / Vikas Ji)
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-sm text-xs font-bold bg-[#2874f0] hover:bg-[#1e60d5] text-white transition cursor-pointer shadow-2xs"
          >
            समझ गया, धन्यवाद (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
