import React, { useState } from 'react';
import { X, ChevronDown, HelpCircle, CheckCircle2, Search } from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FaqItem {
  q: string;
  a: string;
  category: 'joining' | 'earning' | 'gaming' | 'legal' | 'payout';
}

const FAQ_LIST: FaqItem[] = [
  {
    category: 'joining',
    q: '1. ESP (Earning System Platform) क्या है और यह कैसे काम करता है?',
    a: 'ESP भारत का एक आधुनिक डिजिटल प्लेटफॉर्म है जहां उपयोगकर्ता ₹10 के न्यूनतम शुल्क से डिजिटल सर्विसेज (EMO, MMO, SWIS, TWIS आदि) प्राप्त करते हैं, डिजिटल आईडी कार्ड पाते हैं और एफिलिएट मार्केटिंग व स्किल-बेस्ड गेमिंग के माध्यम से सुरक्षित आमदनी करते हैं।'
  },
  {
    category: 'joining',
    q: '2. क्या ₹10 की जॉइनिंग में सच में डिजिटल आईडी कार्ड मिलता है?',
    a: 'जी हाँ! रजिस्ट्रेशन के बाद जब आप ₹10 का भुगतान कर 12-अंकों का यूपीआई UTR सबमिट करते हैं, तो एडमिन द्वारा वेरिफाई होते ही आपके डैशबोर्ड में आपका स्थायी रोल नंबर और क्यूआर कोड युक्त वेरिफाइड डिजिटल आईडी कार्ड डाउनलोड हेतु उपलब्ध हो जाता है।'
  },
  {
    category: 'payout',
    q: '3. पैसे निकालने (Withdrawal) के नियम क्या हैं और कितना समय लगता है?',
    a: 'न्यूनतम निकासी सीमा मात्र ₹50 है। आप सीधे अपने किसी भी बैंक से जुड़े UPI ID (PhonePe, Google Pay, Paytm, BHIM) पर विड्रॉल लगा सकते हैं। सभी सही विड्रॉल रिक्वेस्ट 1 से 24 घंटे के अंदर बिना किसी अतिरिक्त कटौती के प्रोसेस कर दी जाती हैं।'
  },
  {
    category: 'gaming',
    q: '4. ESP GAMING TIME और वॉइस स्टेज रूम क्या है?',
    a: 'ESP PLAY वॉइस रूम एक रियल-टाइम इंटरैक्टिव कम्युनिटी स्पेस है जहां आप माइक सीट पर बैठकर बातें कर सकते हैं, लूडो, डाइस, कार्ड गेम्स खेल सकते हैं। माइक सीट पर बैठने से हर मिनट +5 कॉइन्स का रियल-टाइम सीट रिवॉर्ड भी मिलता है, जिसे गिफ्ट कार्ड्स में रिडीम किया जा सकता है।'
  },
  {
    category: 'gaming',
    q: '5. क्या मुझे पैकेज में असली गिफ्ट कार्ड (Gift Card Voucher) मिलेंगे?',
    a: 'हाँ! हमारे कॉइन स्टोर में अब वर्चुअल गिफ्ट्स के स्थान पर अमेजन पे (Amazon Pay), फ्लिपकार्ट (Flipkart), गूगल प्ले (Google Play) और यूपीआई कैश वाउचर्स उपलब्ध हैं, जिनमें तुरंत वाउचर कोड और पिन मिलता है।'
  },
  {
    category: 'earning',
    q: '6. अपने खास दोस्तों को इनवाइट करने पर क्या फायदा होगा?',
    a: 'यह एक नया और फ्रेश प्लेटफॉर्म है जहां अभी भारी भीड़ नहीं है। अपने खास दोस्तों को आमंत्रित करने पर आप उनके साथ बिना किसी शोरगुल के प्राइवेट रूम में क्वालिटी समय बिता सकते हैं, और वे जब भी प्लेटफॉर्म पर जॉइन करेंगे तो आपको 40% से 50% तक सीधा रेफरल बोनस मिलेगा।'
  },
  {
    category: 'legal',
    q: '7. क्या यह प्लेटफॉर्म भारतीय कानून व नियमों के तहत वैध है?',
    a: 'हाँ! ESP प्लेटफॉर्म Consumer Protection (Direct Selling) Rules, 2021 और Banning of Unregulated Deposit Schemes Act, 2019 (BUDS Act) के पूर्ण नियमों का पालन करता है। यहाँ कोई गैर-कानूनी पोंजी या फिक्स इंटरेस्ट स्कीम नहीं है, बल्कि डिजिटल सर्विसेज और मेहनत पर आधारित कमीशन है।'
  },
  {
    category: 'earning',
    q: "8. 'बिजनेस प्लान' और 'गेमर अकाउंट' में क्या अंतर है?",
    a: 'ESP ने दो तरह के रजिस्ट्रेशन दिए हैं: 1. बिजनेस प्लान: जो ₹10 से शुरू होता है और इसमें डिजिटल आईडी कार्ड, एफिलिएट कमीशन और विड्रॉल मिलता है। 2. गेमर अकाउंट: जो 100% मुफ्त है, जिसमें तुरंत 500 वेलकम कॉइन्स मिलते हैं ताकि आप बिना पेमेंट के तुरंत वॉइस रूम व गेम्स खेल सकें।'
  },
];

export const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredFaqs = FAQ_LIST.filter(f => 
    f.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="relative max-w-2xl w-full bg-white text-[#212121] rounded-md border border-slate-200 shadow-xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#2874f0] p-4 sm:p-6 flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-white text-[#2874f0] flex items-center justify-center shadow-2xs font-bold text-xl">
              ❓
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffe500]">
                Help &amp; Answers • सहायता एवं समाधान
              </span>
              <h3 className="text-base sm:text-xl font-bold text-white">
                अक्सर पूछे जाने वाले सवाल (FAQ)
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

        {/* Search Input */}
        <div className="p-3 sm:p-4 bg-[#f9fafb] border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="सवालों में खोजें (e.g. ₹10, विड्रॉल, गेम्स, गिफ्ट कार्ड)..."
              className="w-full pl-9 pr-3 py-2 rounded-sm bg-white border border-slate-300 text-xs text-[#212121] placeholder-slate-400 focus:outline-none focus:border-[#2874f0]"
            />
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto text-xs sm:text-sm">
          {filteredFaqs.length === 0 ? (
            <p className="text-center py-8 text-slate-500">कोई सवाल नहीं मिला। कृपया अन्य शब्द खोजें।</p>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpenItem = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-md border transition-all duration-200 overflow-hidden ${
                    isOpenItem 
                      ? 'bg-[#f5f8ff] border-[#2874f0] shadow-2xs' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpenItem ? null : idx)}
                    className="w-full p-3.5 sm:p-4 text-left font-bold text-xs sm:text-sm flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className={isOpenItem ? 'text-[#2874f0]' : 'text-[#212121]'}>
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                        isOpenItem ? 'rotate-180 text-[#2874f0]' : ''
                      }`}
                    />
                  </button>

                  {isOpenItem && (
                    <div className="px-3.5 pb-4 pt-2 sm:px-4 text-slate-700 text-xs leading-relaxed border-t border-blue-200/70 animate-fadeIn">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f9fafb] border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-600">
            कोई अन्य सवाल है? टेलीग्राम या हेल्पलाइन पर संपर्क करें।
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-sm font-bold text-xs bg-[#2874f0] hover:bg-[#1e60d5] text-white transition cursor-pointer"
          >
            बंद करें / Close
          </button>
        </div>
      </div>
    </div>
  );
};
