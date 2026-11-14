import React, { useState } from 'react';
import { X, ShieldAlert, FileText, Lock, Eye, AlertTriangle } from 'lucide-react';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'disclaimer';
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'disclaimer'>(initialTab);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="relative max-w-3xl w-full bg-white text-[#212121] rounded-md border border-slate-200 shadow-xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#2874f0] p-4 sm:p-6 flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-white text-[#2874f0] flex items-center justify-center shadow-2xs font-bold text-xl">
              ⚖️
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffe500]">
                Legal &amp; Compliance Documents • कानूनी नीतियां
              </span>
              <h3 className="text-base sm:text-xl font-bold text-white">
                गोपनीयता नीति, नियम एवं अस्वीकरण
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-sm bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#f9fafb] border-b border-slate-200 p-2 gap-1.5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-sm text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'privacy' 
                ? 'bg-[#2874f0] text-white shadow-2xs' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>गोपनीयता नीति (Privacy)</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-sm text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'terms' 
                ? 'bg-[#2874f0] text-white shadow-2xs' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>नियम व शर्तें (Terms)</span>
          </button>

          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-sm text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'disclaimer' 
                ? 'bg-[#fb641b] text-white shadow-2xs' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>अस्वीकरण (Disclaimer)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs sm:text-sm leading-relaxed text-slate-700">
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900">
                <strong>Google AdSense एवं Digital Personal Data Protection Act (DPDP) अनुपालन:</strong> यह नीति बताती है कि आपकी व्यक्तिगत जानकारी कैसे सुरक्षित रखी जाती है और स्क्रीन पर विज्ञापन कैसे दिखाए जाते हैं।
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-[#212121] text-sm">1. हम कौन सा डेटा इकट्ठा करते हैं?</h5>
                <p>
                  जब आप ESP प्लेटफॉर्म पर पंजीकरण या उपयोग करते हैं, तो हम निम्नलिखित आवश्यक डेटा एकत्र करते हैं:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li><strong>व्यक्तिगत पहचान:</strong> आपका नाम, मोबाइल/व्हाट्सएप नंबर और ईमेल आईडी।</li>
                  <li><strong>भुगतान डेटा:</strong> निकासी (Withdrawal) भेजने हेतु आपका UPI ID और जॉइनिंग वेरिफिकेशन हेतु 12-अंक UTR नंबर।</li>
                  <li><strong>डिवाइस और उपस्थिति सत्र:</strong> मल्टी-डिवाइस सिक्योरिटी और ऑनलाइन टाइम ट्रैकिंग हेतु डिवाइस का प्रकार (Mobile/Desktop), ऑपरेटिंग सिस्टम, ब्राउज़र और सक्रिय सत्र।</li>
                  <li><strong>गेमप्ले और कॉइन लेजर:</strong> निष्पक्ष खेल ऑडिट हेतु खेले गए खेल और कॉइन ट्रांजेक्शन।</li>
                </ul>

                <h5 className="font-bold text-[#212121] text-sm">2. कुकीज़ (Cookies) और Google AdSense विज्ञापन</h5>
                <p>
                  ESP प्लेटफॉर्म उपयोगकर्ताओं के अनुभव को बेहतर बनाने हेतु कुकीज़ का उपयोग करता है। Google AdSense और अन्य तृतीय-पक्ष विज्ञापनदाता आपकी स्क्रीन पर प्रासंगिक विज्ञापन दिखाने के लिए कुकीज़ (जैसे DoubleClick DART कुकी) का उपयोग कर सकते हैं। ये कुकीज़ आपके ब्राउज़िंग व्यवहार के आधार पर विज्ञापन प्रदर्शित करती हैं, लेकिन इनमें आपका पासवर्ड, यूपीआई पिन या गोपनीय निजी डेटा कभी शामिल नहीं होता। उपयोगकर्ता अपने ब्राउज़र सेटिंग्स से कुकीज़ को बंद या कस्टमाइज़ कर सकते हैं।
                </p>

                <h5 className="font-bold text-[#212121] text-sm">3. डेटा सुरक्षा और गोपनीयता नियंत्रण</h5>
                <p>
                  हम किसी भी तृतीय पक्ष को उपयोगकर्ता डेटा बेचते या किराए पर नहीं देते हैं। सार्वजनिक प्रोफ़ाइल (स्पॉन्सर विवरण) में आपके फ़ोन नंबर और ईमेल को डिफ़ॉल्ट रूप से मास्क (***) करके सुरक्षित रखा जाता है।
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900">
                <strong>नियम और शर्तें (Terms of Service):</strong> ESP प्लेटफॉर्म का उपयोग करने से पहले कृपया इन नियमों को ध्यानपूर्वक पढ़ें।
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-[#212121] text-sm">1. उपयोगकर्ता पात्रता और खाता सुरक्षा</h5>
                <p>
                  प्रत्येक व्यक्ति को केवल एक प्राथमिक खाता रखने की अनुमति है। एक ही डिवाइस से दुर्भावनापूर्ण या बोट-आधारित कई फर्जी खाते बनाना प्रतिबंधित है और पाए जाने पर खाता स्थायी रूप से ब्लॉक किया जा सकता है।
                </p>

                <h5 className="font-bold text-[#212121] text-sm">2. जॉइनिंग शुल्क और डिजिटल सेवाएं</h5>
                <p>
                  बिजनेस प्लान के तहत दिया गया न्यूनतम शुल्क (₹10+) डिजिटल एसेट्स, ई-लर्निंग टूल्स और प्लेटफॉर्म एक्सेस हेतु है। सभी भुगतान 12-अंक बैंक UTR के आधार पर एडमिन द्वारा वेरिफाई किए जाते हैं।
                </p>

                <h5 className="font-bold text-[#212121] text-sm">3. वॉइस रूम और गेमिंग आचार संहिता</h5>
                <p>
                  ESP PLAY वॉइस रूम में किसी भी प्रकार की गाली-गलौज, अभद्र भाषा, अश्लीलता या अन्य सदस्यों को परेशान करना सख्त मना है। ऐसा करने पर स्टेज होस्ट या सिस्टम द्वारा रूम से किक या म्यूट किया जा सकता है।
                </p>

                <h5 className="font-bold text-[#212121] text-sm">4. निकासी एवं भुगतान नियम</h5>
                <p>
                  निकासी अनुरोध केवल उपयोगकर्ता के वैध यूपीआई पते पर ही भेजे जाते हैं। यदि कोई सदस्य गलत यूपीआई देता है, तो उसकी जिम्मेदारी उपयोगकर्ता की होगी।
                </p>
              </div>
            </div>
          )}

          {activeTab === 'disclaimer' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900">
                <strong>कानूनी अस्वीकरण (Legal Disclaimer):</strong> Prize Chits Act 1978 एवं BUDS Act 2019 के अंतर्गत सूचना।
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-[#212121] text-sm">1. कौशल आधारित गेमिंग (Skill-Based Games)</h5>
                <p>
                  ESP PLAY पर उपलब्ध गेम्स कौशल, बुद्धिमत्ता और व्यक्तिगत रणनीति पर आधारित हैं। खेल के परिणाम उपयोगकर्ता की चालों और निष्पक्ष रैंडमनेस पर निर्भर करते हैं।
                </p>

                <h5 className="font-bold text-[#212121] text-sm">2. कोई निश्चित रिटर्न या जमा योजना नहीं (No Fixed ROI)</h5>
                <p>
                  ESP कोई बैंक, चिट फंड या गैर-विनियमित जमा योजना (Unregulated Deposit Scheme) नहीं है। हम किसी को बिना काम किए जादुई फिक्स ब्याज या गारंटीड लाभ का वादा नहीं करते। सभी आय वास्तविक प्रदर्शन, टास्क, डिजिटल सेवाओं और एफिलिएट कमीशन पर निर्भर करती है।
                </p>

                <h5 className="font-bold text-[#212121] text-sm">3. वित्तीय सतर्कता</h5>
                <p>
                  उपयोगकर्ता अपनी स्वेच्छा और समझदारी से प्लेटफॉर्म का उपयोग करें। प्लेटफॉर्म केवल वास्तविक सेवाओं और मनोरंजन के लिए बनाया गया है।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f9fafb] border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-sm font-bold text-xs bg-[#388e3c] hover:bg-[#2e7d32] text-white transition cursor-pointer"
          >
            स्वीकार करें / Agree &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
