import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Download, 
  Share2, 
  Sparkles, 
  Store, 
  GraduationCap, 
  Smartphone, 
  LayoutGrid, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import type { UserProfile, PlatformSettings } from '../types/index.ts';

type PosterType = 'business' | 'shubhkamna' | 'status' | 'shop' | 'student';

interface PromotionalPosterProps {
  user: UserProfile;
  settings?: PlatformSettings;
}

export const PromotionalPoster: React.FC<PromotionalPosterProps> = ({ user }) => {
  const [selectedType, setSelectedType] = useState<PosterType>('business');
  const [customBusinessName, setCustomBusinessName] = useState<string>(`${user.fullName} डिजिटल एंड बिज़नेस केंद्र`);
  const [customOfferOrGreeting, setCustomOfferOrGreeting] = useState<string>(
    'सभी ग्राहक व साथियों को हमारी शुभकामनाएँ! ऑनलाइन रिचार्ज, डिजिटल सर्विस और घर बैठे कमाई के लिए जुड़ें।'
  );
  const [customContact, setCustomContact] = useState<string>(user.phone || '');
  const [includeEspDetails, setIncludeEspDetails] = useState<boolean>(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${user.userId}`
    : `https://esp.platform/?ref=${user.userId}`;

  useEffect(() => {
    QRCode.toDataURL(referralUrl, {
      width: 250,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error(err));
  }, [referralUrl]);

  // High Quality Multi-Type Canvas Poster Generator
  const downloadPoster = () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setDownloading(false);
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
    if (selectedType === 'business') {
      gradient.addColorStop(0, '#0F172A');
      gradient.addColorStop(0.5, '#312E81');
      gradient.addColorStop(1, '#064E3B');
    } else if (selectedType === 'shubhkamna') {
      gradient.addColorStop(0, '#450A0A');
      gradient.addColorStop(0.5, '#78350F');
      gradient.addColorStop(1, '#1E1B4B');
    } else if (selectedType === 'shop') {
      gradient.addColorStop(0, '#0F172A');
      gradient.addColorStop(0.5, '#1E293B');
      gradient.addColorStop(1, '#064E3B');
    } else if (selectedType === 'student') {
      gradient.addColorStop(0, '#0B0F19');
      gradient.addColorStop(0.5, '#1E1B4B');
      gradient.addColorStop(1, '#022C22');
    } else {
      gradient.addColorStop(0, '#090D16');
      gradient.addColorStop(0.4, '#0F172A');
      gradient.addColorStop(1, '#06281E');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1350);

    // Header Badge
    ctx.fillStyle = selectedType === 'shubhkamna' ? '#FBBF24' : '#10B981';
    ctx.fillRect(80, 60, 340, 48);
    ctx.fillStyle = '#061C14';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(
      selectedType === 'business'
        ? 'BUSINESS & SERVICE AD'
        : selectedType === 'shubhkamna'
        ? 'शुभकामना / बधाई संदेश'
        : 'GOVT REG. CONCEPT',
      100,
      92
    );

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(includeEspDetails ? 'CO-BRANDED WITH ESP PLATFORM' : 'OFFICIAL PROMOTION POSTER', 450, 93);

    // Headlines
    if (selectedType === 'business') {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 52px sans-serif';
      ctx.fillText((customBusinessName || 'आपका बिज़नेस विज्ञापन').slice(0, 34), 80, 195);

      ctx.fillStyle = '#34D399';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText('विश्वसनीय उत्पाद, दुकान एवं डिजिटल सेवाएं', 80, 260);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '26px sans-serif';
      ctx.fillText((customOfferOrGreeting || '').slice(0, 62), 80, 320);
    } else if (selectedType === 'shubhkamna') {
      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 56px sans-serif';
      ctx.fillText('हार्दिक शुभकामनाएँ एवं बधाई!', 80, 195);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 46px sans-serif';
      ctx.fillText((customBusinessName || user.fullName).slice(0, 34), 80, 265);

      ctx.fillStyle = '#FDE68A';
      ctx.font = '26px sans-serif';
      ctx.fillText((customOfferOrGreeting || '').slice(0, 62), 80, 325);
    } else if (selectedType === 'shop') {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 54px sans-serif';
      ctx.fillText('यहाँ ऑनलाइन वर्क फ्रॉम होम', 80, 200);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 62px sans-serif';
      ctx.fillText('रजिस्ट्रेशन केंद्र उपलब्ध है', 80, 275);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '26px sans-serif';
      ctx.fillText('दुकानदार / साइबर कैफे / ग्राहक - मात्र ₹10 से शुरू करें डिजिटल कमाई', 80, 330);
    } else if (selectedType === 'student') {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 54px sans-serif';
      ctx.fillText('विद्यार्थी पढ़ाई के साथ-साथ', 80, 200);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 62px sans-serif';
      ctx.fillText('पार्ट-टाइम मोबाइल से कमाएं', 80, 275);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '26px sans-serif';
      ctx.fillText('Student Special Pocket Money Plan - शुरुआत मात्र ₹10 से', 80, 330);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 56px sans-serif';
      ctx.fillText('घर बैठे मोबाइल से रोजाना कमाएं', 80, 200);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText('₹500 - ₹2,000 / प्रतिदिन', 80, 280);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '26px sans-serif';
      ctx.fillText('Work From Home Social Media Networking & AI Micro-Tasks', 80, 335);
    }

    // Bullets Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, 380, 920, 440, 24);
    ctx.fill();
    ctx.stroke();

    const bullets =
      selectedType === 'business'
        ? [
            `🏪 बिज़नेस / सर्विस: ${(customBusinessName || user.fullName).slice(0, 32)}`,
            '✨ ग्राहकों के लिए उच्च गुणवत्ता उत्पाद एवं पारदर्शी डिजिटल सेवाएं',
            ...(includeEspDetails
              ? [
                  '💼 ESP प्लेटफॉर्म के साथ 10 ऑनलाइन अर्निंग और रिचार्ज सेवाएं',
                  '📲 3.3% स्पेशल रिचार्ज ऐप एवं इंस्टेंट UPI पेआउट सुविधा',
                  `🆔 आधिकारिक स्पॉन्सर रोल नंबर: ${user.userId}`,
                ]
              : [
                  '✅ त्वरित संपर्क और ग्राहक संतुष्टि हमारी पहली प्राथमिकता',
                  '✅ घर बैठे ऑनलाइन बुकिंग व डिजिटल सहायता उपलब्ध',
                  '✅ विशेष ऑफर एवं फेस्टिवल डिस्काउंट की सुविधा',
                ]),
            `📞 सीधा संपर्क: +91 ${customContact || user.phone}`,
          ]
        : selectedType === 'shubhkamna'
        ? [
            '🪔 आप सभी को परिवार सहित मंगलमय और समृद्ध भविष्य की शुभकामनाएँ!',
            `🙏 निवेदक: ${(customBusinessName || user.fullName).slice(0, 34)}`,
            ...(includeEspDetails
              ? [
                  '🌟 EARNING SYSTEM PLATFORM (ESP) परिवार की ओर से विशेष बधाई',
                  '💼 अपने व्यापार को डिजिटल बनाएं एवं रोजगार के नए अवसर पाएं',
                  `🆔 स्पॉन्सर कोड: ${user.userId} (QR स्कैन कर जुड़ें)`,
                ]
              : [
                  '🌟 आपका विश्वास और स्नेह ही हमारी सबसे बड़ी पूंजी है',
                  '🤝 हमेशा सर्वोत्तम सेवा और सहयोग के लिए तत्पर',
                  '💐 जीवन में सुख, शांति और प्रगति की कामना',
                ]),
            `📞 संपर्क सूत्र: +91 ${customContact || user.phone}`,
          ]
        : selectedType === 'shop'
        ? [
            '🏪 सभी ग्राहकों एवं युवाओं के लिए आसान ऑनलाइन कमाई अवसर',
            '⚡ मात्र ₹10 की छोटी शुरुआत से 10 तरह की सर्विसेज उपलब्ध',
            '📱 किसी स्पेशल अनुभव की आवश्यकता नहीं - 100% मोबाइल से काम',
            '🏦 तुरंत UPI द्वारा डेली पेआउट (Google Pay / PhonePe)',
            '🆔 हर मेंबर को तुरंत आधिकारिक वेरिफाइड डिजिटल ID कार्ड',
            '🤝 फुल ट्रेनिंग एवं 24x7 ऑनलाइन WhatsApp सहायता',
          ]
        : selectedType === 'student'
        ? [
            '🎓 कॉलेज व स्कूल छात्रों के लिए सुरक्षित पार्ट-टाइम इनकम',
            '⚡ जेब खर्च मात्र ₹10 से शुरुआत - कोई बड़ा रिस्क नहीं',
            '💰 EMO, MMO, MOM एवं रियल 3-लेवल टीम पैसिव इनकम',
            '🏦 सीधे अपने UPI ID में तुरंत बैंक ट्रांसफर प्राप्त करें',
            '🆔 स्टूडेंट के लिए अधिकृत ESP वेरिफाइड मेंबर ID कार्ड',
            '🤝 100% सुरक्षित और वेरीफाइड डिजिटल प्लेटफॉर्म',
          ]
        : [
            '⚡ मात्र ₹10 की छोटी सी शुरुआत से 10 तरह की इनकम',
            '📱 100% मोबाइल फोन द्वारा वर्क फ्रॉम होम जॉब अवसर',
            '💰 EMO, MMO, MOM, SWI 3.3% ऐप एवं टीम रेफरल बोनस',
            '🏦 तुरंत UPI द्वारा डेली पेआउट (Google Pay / PhonePe)',
            '🆔 हर मेंबर को आधिकारिक वेरिफाइड डिजिटल ID कार्ड',
            '🤝 फुल ट्रेनिंग एवं 24x7 व्हाट्सएप सपोर्ट',
          ];

    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#F8FAFC';
    bullets.forEach((b, i) => {
      ctx.fillText(b, 115, 455 + i * 62);
    });

    // Sponsor & ESP Footer Box
    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(80, 850, 920, 380, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(includeEspDetails ? 'OFFICIAL PARTNER & ESP SPONSOR DETAILS' : 'BUSINESS CONTACT CARD', 120, 910);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(user.fullName, 120, 970);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '26px sans-serif';
    ctx.fillText(includeEspDetails ? 'ESP Sponsor Roll Number:' : 'Verified Business Partner:', 120, 1025);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 46px monospace';
    ctx.fillText(user.userId, 120, 1080);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '26px sans-serif';
    ctx.fillText(`WhatsApp / Contact: +91 ${customContact || user.phone}`, 120, 1140);

    if (qrDataUrl) {
      const qrImage = new Image();
      qrImage.onload = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(700, 890, 260, 260, 16);
        ctx.fill();

        ctx.drawImage(qrImage, 715, 905, 230, 230);

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SCAN TO JOIN DIRECTLY', 830, 1175);
        ctx.textAlign = 'left';

        ctx.fillStyle = '#94A3B8';
        ctx.font = '20px sans-serif';
        ctx.fillText('Official Platform: EARNING SYSTEM PLATFORM (ESP) | Support: ioisplatform@gmail.com', 80, 1280);

        const link = document.createElement('a');
        link.download = `ESP_${selectedType.toUpperCase()}_Poster_${user.userId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setDownloading(false);
      };
      qrImage.src = qrDataUrl;
    } else {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    let caption = '';
    if (selectedType === 'business') {
      caption = `📢 *${customBusinessName || user.fullName}*\n${customOfferOrGreeting}\n\n`;
      if (includeEspDetails) {
        caption += `🌟 *EARNING SYSTEM PLATFORM (ESP) के साथ आधिकारिक साझेदारी!*\n`;
      }
    } else if (selectedType === 'shubhkamna') {
      caption = `💐 *हार्दिक शुभकामनाएँ एवं बधाई!*\n🙏 *निवेदक:* ${customBusinessName || user.fullName}\n✨ ${customOfferOrGreeting}\n\n`;
    } else if (selectedType === 'shop') {
      caption = `🏪 *दुकानदार / साइबर कैफे / कस्टमर्स के लिए विशेष अवसर!*\n*EARNING SYSTEM PLATFORM (ESP)*\nयहाँ ऑनलाइन वर्क फ्रॉम होम रजिस्ट्रेशन उपलब्ध है।\n\n`;
    } else if (selectedType === 'student') {
      caption = `🎓 *विद्यार्थियों के लिए पढ़ाई के साथ मोबाइल से कमाने का सुनहरा अवसर!*\n*EARNING SYSTEM PLATFORM (ESP)*\nबिना किसी बड़े निवेश के शुरुआत सिर्फ ₹10 से।\n\n`;
    } else {
      caption = `🔥 *घर बैठे मोबाइल से रोजाना ₹500 - ₹2000 कमाने का मौका!*\n*EARNING SYSTEM PLATFORM (ESP)*\n100% सुरक्षित और वेरिफाइड डिजिटल आईडी कार्ड के साथ।\n\n`;
    }

    if (includeEspDetails || (selectedType !== 'business' && selectedType !== 'shubhkamna')) {
      caption += `✅ शुरुआत मात्र ₹10 से\n` +
        `✅ 10 सर्विसेज (EMO, MMO, MOM, SWI 3.3% ऐप, NWI 3-लेवल टीम)\n` +
        `✅ तुरंत UPI में बैंक ट्रांसफर\n\n` +
        `👉 *जॉइन करने के लिए लिंक पर क्लिक करें:*\n${referralUrl}\n\n`;
    }

    caption += `👤 *Name:* ${user.fullName}\n` +
      `🆔 *Sponsor Roll No:* ${user.userId}\n` +
      `📞 *Contact:* +91 ${customContact || user.phone}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-md p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#212121] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2874f0]" />
            <span>Business Promotion, Banner & Shubhkamna Poster Studio</span>
          </h3>
          <p className="text-xs text-slate-600">
            अपने खुद के बिज़नेस, दुकान, सर्विस का प्रचार बैनर या त्योहार/शुभकामना कार्ड बनाएं — ESP प्लेटफॉर्म डिटेल्स व QR के साथ!
          </p>
        </div>

        {/* Poster Category Switcher */}
        <div className="flex flex-wrap gap-1.5 bg-[#f1f3f6] p-1 rounded-sm border border-slate-200">
          <button
            onClick={() => setSelectedType('business')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              selectedType === 'business' ? 'bg-[#2874f0] text-white shadow-xs' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Own Business Ad</span>
          </button>

          <button
            onClick={() => setSelectedType('shubhkamna')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              selectedType === 'shubhkamna' ? 'bg-[#fb641b] text-white shadow-xs' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>शुभकामना कार्ड</span>
          </button>

          <button
            onClick={() => setSelectedType('status')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              selectedType === 'status' ? 'bg-[#388e3c] text-white shadow-xs' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>WhatsApp Status</span>
          </button>

          <button
            onClick={() => setSelectedType('shop')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              selectedType === 'shop' ? 'bg-[#ffe500] text-[#212121] shadow-xs' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Shop / Print Flyer</span>
          </button>

          <button
            onClick={() => setSelectedType('student')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              selectedType === 'student' ? 'bg-[#2874f0] text-white shadow-xs' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Special</span>
          </button>
        </div>
      </div>

      {/* Custom Business / Greeting Inputs when Business or Shubhkamna selected */}
      {(selectedType === 'business' || selectedType === 'shubhkamna') && (
        <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {selectedType === 'business' ? 'अपना बिज़नेस / दुकान / सर्विस नाम' : 'निवेदक / दुकान / संस्था का नाम'}
              </label>
              <input
                type="text"
                value={customBusinessName}
                onChange={e => setCustomBusinessName(e.target.value)}
                placeholder="जैसे: राहुल कंप्यूटर एंड ऑनलाइन केंद्र"
                className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded px-3 py-2 text-xs text-[#212121] outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                संपर्क मोबाइल नंबर (Poster पर दिखाने के लिए)
              </label>
              <input
                type="text"
                value={customContact}
                onChange={e => setCustomContact(e.target.value)}
                placeholder="10 अंक मोबाइल नंबर"
                className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded px-3 py-2 text-xs text-[#212121] font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {selectedType === 'business' ? 'आपका मुख्य ऑफर / सेवा विवरण' : 'शुभकामना / पर्व / बधाई संदेश'}
            </label>
            <input
              type="text"
              value={customOfferOrGreeting}
              onChange={e => setCustomOfferOrGreeting(e.target.value)}
              placeholder="अपना ऑफर या शुभकामना संदेश लिखें"
              className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded px-3 py-2 text-xs text-[#212121] outline-none"
            />
          </div>

          <label className="flex items-center space-x-2 text-xs text-[#2874f0] font-semibold cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={includeEspDetails}
              onChange={e => setIncludeEspDetails(e.target.checked)}
              className="rounded border-slate-300 accent-[#2874f0]"
            />
            <span>पोस्टर में ESP प्लेटफॉर्म डिटेल्स, 10 सेवाएं एवं मेरा स्पॉन्सर QR कोड शामिल करें</span>
          </label>
        </div>
      )}

      {/* Visual Poster Preview */}
      <div
        className={`relative rounded-2xl overflow-hidden border p-5 sm:p-6 text-white shadow-2xl ${
          selectedType === 'shubhkamna'
            ? 'border-amber-400/50 bg-gradient-to-br from-rose-950 via-amber-950 to-slate-950'
            : selectedType === 'business'
            ? 'border-indigo-400/40 bg-gradient-to-br from-slate-950 via-indigo-950 to-emerald-950'
            : 'border-emerald-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded">
              {selectedType === 'business'
                ? 'BUSINESS PROMO'
                : selectedType === 'shubhkamna'
                ? 'शुभकामना कार्ड'
                : 'GOVT REG. CONCEPT'}
            </span>
            <span className="text-amber-400 text-xs font-bold tracking-wider">
              {includeEspDetails ? 'EARNING SYSTEM PLATFORM (ESP)' : customBusinessName}
            </span>
          </div>
          <div className="flex items-center text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 mr-1" /> 100% VERIFIED
          </div>
        </div>

        {/* Dynamic Heading */}
        <div className="mb-4 space-y-1">
          {selectedType === 'business' ? (
            <>
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                {customBusinessName || `${user.fullName} बिज़नेस केंद्र`}
              </h2>
              <p className="text-xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                सर्वश्रेष्ठ उत्पाद, दुकान व डिजिटल सेवाएं
              </p>
              <p className="text-xs text-slate-200">{customOfferOrGreeting}</p>
            </>
          ) : selectedType === 'shubhkamna' ? (
            <>
              <h2 className="text-lg sm:text-2xl font-black text-amber-300 leading-tight">
                हार्दिक शुभकामनाएँ एवं मंगलमय बधाई!
              </h2>
              <p className="text-xl sm:text-3xl font-black text-white tracking-tight">
                {customBusinessName || user.fullName}
              </p>
              <p className="text-xs text-amber-100">{customOfferOrGreeting}</p>
            </>
          ) : selectedType === 'shop' ? (
            <>
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                यहाँ ऑनलाइन वर्क फ्रॉम होम
              </h2>
              <p className="text-xl sm:text-3xl font-black text-amber-400 tracking-tight">
                रजिस्ट्रेशन केंद्र उपलब्ध है
              </p>
              <p className="text-xs text-slate-300">दुकानदार / साइबर कैफे / ग्राहक - मात्र ₹10 से शुरू करें डिजिटल कमाई</p>
            </>
          ) : selectedType === 'student' ? (
            <>
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                विद्यार्थी पढ़ाई के साथ-साथ
              </h2>
              <p className="text-xl sm:text-3xl font-black text-teal-400 tracking-tight">
                पार्ट-टाइम मोबाइल से कमाएं
              </p>
              <p className="text-xs text-slate-300">Student Special Pocket Money Plan - शुरुआत मात्र ₹10 से</p>
            </>
          ) : (
            <>
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                घर बैठे मोबाइल से रोजाना कमाएं
              </h2>
              <p className="text-xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                ₹500 - ₹2,000 / Day
              </p>
              <p className="text-xs text-slate-300">Work From Home Social Media Networking & Digital Tasks</p>
            </>
          )}
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-5">
          {selectedType === 'business' || selectedType === 'shubhkamna' ? (
            <>
              <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{selectedType === 'shubhkamna' ? 'आपकी खुशियों व प्रगति की मंगलकामना' : 'विश्वसनीय दुकान, उत्पाद व ऑनलाइन सेवा'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{includeEspDetails ? 'ESP 10 अर्निंग व 3.3% रिचार्ज ऐप पार्टनर' : 'ग्राहक सेवा व विशेष ऑफर उपलब्ध'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>तुरंत UPI व डिजिटल वेरिफाइड सहायता</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>सीधा संपर्क: +91 {customContact || user.phone}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>शुरुआत मात्र ₹10 से (10 सर्विसेज उपलब्ध)</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>EMO, MMO, MOM, SWI 3.3% ऐप & NWI 3-लेवल टीम</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>रोजाना तुरंत UPI द्वारा भुगतान (Google Pay / PhonePe)</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>वेरिफाइड डिजिटल ID कार्ड तुरंत प्राप्त करें</span>
              </div>
            </>
          )}
        </div>

        {/* Sponsor Banner Inside Poster */}
        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">
              {includeEspDetails ? 'OFFICIAL ESP SPONSOR DETAILS' : 'BUSINESS PARTNER DETAILS'}
            </p>
            <p className="text-sm sm:text-base font-bold text-white">{user.fullName}</p>
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="text-xs text-slate-300">Sponsor Code:</span>
              <span className="font-mono font-extrabold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded text-sm">
                {user.userId}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">WhatsApp: +91 {customContact || user.phone}</p>
          </div>

          {qrDataUrl && (
            <div className="flex flex-col items-center shrink-0">
              <div className="bg-white p-1 rounded-lg shadow-md">
                <img src={qrDataUrl} alt="Join QR" className="w-18 h-18 sm:w-20 sm:h-20" />
              </div>
              <span className="text-[9px] text-slate-300 mt-1 font-semibold">स्कैन करके जॉइन करें</span>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={downloadPoster}
          disabled={downloading}
          className="flex-1 min-w-[180px] flex items-center justify-center space-x-2 bg-[#2874f0] hover:bg-[#1e60d5] text-white font-bold py-2.5 px-4 rounded-sm text-xs transition shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Generating HD Poster...' : `Download ${selectedType.toUpperCase()} Poster (PNG)`}</span>
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="flex-1 min-w-[180px] flex items-center justify-center space-x-2 bg-[#388e3c] hover:bg-[#2e7d32] text-white font-bold py-2.5 px-4 rounded-sm text-xs transition shadow-2xs cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share to WhatsApp / Status</span>
        </button>
      </div>
    </div>
  );
};
