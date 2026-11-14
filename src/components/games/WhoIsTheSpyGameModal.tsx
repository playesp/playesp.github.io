import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, Eye, EyeOff, Shield, Skull, Crown, Play, 
  RotateCcw, Volume2, VolumeX, Sparkles, Award, 
  AlertTriangle, Users, MessageSquare, Check, 
  HelpCircle, ChevronRight, Search, Clock, Zap
} from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { AvatarFrame, type FrameVariant } from '../AvatarFrame.tsx';

export interface SpyWordPair {
  id: string;
  civilianWord: string;
  spyWord: string;
  category: string;
  hindiCategory: string;
  civilianHintIdeas: string[];
  spyHintIdeas: string[];
}

export const SPY_WORD_PAIRS: SpyWordPair[] = [
  {
    id: 'w1',
    civilianWord: 'चाय (Tea)',
    spyWord: 'कॉफ़ी (Coffee)',
    category: 'Beverage',
    hindiCategory: 'पेय पदार्थ',
    civilianHintIdeas: ['सुबह-सुबह इसे पीने की आदत है', 'यह कप में गरमा-गरम पी जाती है', 'दूध और पत्ती से बनती है'],
    spyHintIdeas: ['इसे पीने से तुरंत नींद उड़ जाती है', 'कैफ़े में यह बहुत बिकती है', 'इसकी खुशबू बहुत स्ट्रॉन्ग होती है'],
  },
  {
    id: 'w2',
    civilianWord: 'ताजमहल (Taj Mahal)',
    spyWord: 'लाल किला (Red Fort)',
    category: 'Historical Monument',
    hindiCategory: 'ऐतिहासिक स्मारक',
    civilianHintIdeas: ['यह सफेद संगमरमर की बनी दुनिया की धरोहर है', 'यह प्यार की निशानी मानी जाती है', 'यमुना नदी के किनारे स्थित है'],
    spyHintIdeas: ['यहाँ 15 अगस्त को झंडा फहराया जाता है', 'यह दिल्ली के दिल में स्थित है', 'इसकी दीवारें लाल पत्थरों से बनी हैं'],
  },
  {
    id: 'w3',
    civilianWord: 'क्रिकेट (Cricket)',
    spyWord: 'फुटबॉल (Football)',
    category: 'Sports',
    hindiCategory: 'खेल',
    civilianHintIdeas: ['भारत में इसका बहुत ज्यादा क्रेज है', 'इसमें 11 खिलाड़ी और एक बल्ला होता है', 'आईपीएल इसी का सबसे बड़ा त्यौहार है'],
    spyHintIdeas: ['रोनाल्डो और मेस्सी इस खेल के बादशाह हैं', 'इसमें गेंद को पैरों से गोल में मारते हैं', 'यह दुनिया का सबसे लोकप्रिय खेल है'],
  },
  {
    id: 'w4',
    civilianWord: 'समोसा (Samosa)',
    spyWord: 'कचौड़ी (Kachori)',
    category: 'Street Food',
    hindiCategory: 'स्ट्रीट फूड / नाश्ता',
    civilianHintIdeas: ['यह त्रिकोण आकार का तला हुआ नाश्ता है', 'इसके अंदर तीखा आलू भरा होता है', 'हरी और लाल चटनी के साथ खाते हैं'],
    spyHintIdeas: ['यह गोल आकार की खस्ता तली होती है', 'इसमें दाल या प्याज का मसाला भरा होता है', 'जोधपुर और कोटा की बहुत मशहूर है'],
  },
  {
    id: 'w5',
    civilianWord: 'स्मार्टफोन (Smartphone)',
    spyWord: 'लैपटॉप (Laptop)',
    category: 'Gadgets',
    hindiCategory: 'इलेक्ट्रॉनिक गैजेट्स',
    civilianHintIdeas: ['यह हमेशा हमारी जेब में रहता है', 'इसमें टच स्क्रीन और व्हाट्सएप चलता है', 'बिना इसके एक पल भी रहा नहीं जाता'],
    spyHintIdeas: ['इस पर ऑफिस और कोडिंग का काम होता है', 'इसे खोलकर कीबोर्ड पर टाइप करते हैं', 'यह बैग में रखकर ले जाया जाता है'],
  },
  {
    id: 'w6',
    civilianWord: 'सिनेमा (Cinema)',
    spyWord: 'नाटक (Theater Drama)',
    category: 'Entertainment',
    hindiCategory: 'मनोरंजन',
    civilianHintIdeas: ['बड़े पर्दे पर पॉपकॉर्न खाते हुए देखते हैं', 'शुक्रवार को नई रिलीज आती है', 'टिकट बुक करके हॉल में जाते हैं'],
    spyHintIdeas: ['कलाकार मंच पर सीधे आपके सामने अभिनय करते हैं', 'इसमें परदा गिरता और उठता है', 'लाइव डायलॉग डिलीवरी होती है'],
  },
  {
    id: 'w7',
    civilianWord: 'पिज्जा (Pizza)',
    spyWord: 'बर्गर (Burger)',
    category: 'Fast Food',
    hindiCategory: 'फ़ास्ट फ़ूड',
    civilianHintIdeas: ['गोल ब्रेड पर चीज़ और टॉपिंग्स बेक होती हैं', 'इसे स्लाइस में काटकर खाते हैं', 'चीज़ पुल देखने लायक होता है'],
    spyHintIdeas: ['दो गोल बन्स के बीच टिक्की रखी जाती है', 'मैकडॉनल्ड्स का बहुत मशहूर है', 'हाथ से पकड़कर बाइट लेते हैं'],
  },
  {
    id: 'w8',
    civilianWord: 'सूरज (Sun)',
    spyWord: 'चाँद (Moon)',
    category: 'Nature',
    hindiCategory: 'ब्रह्मांड / प्रकृति',
    civilianHintIdeas: ['दिन में आकाश में चमकता है और रोशनी देता है', 'इसके निकलने से सवेरा होता है', 'इससे धूप और विटामिन डी मिलता है'],
    spyHintIdeas: ['रात में शीतल चांदनी बिखेरता है', 'यह अपनी कलाएं बदलता रहता है', 'ईद का त्यौहार इसी के दर्शन से जुड़ा है'],
  },
];

export interface SpyPlayer {
  id: string;
  name: string;
  isBot: boolean;
  avatar: string;
  role: 'civilian' | 'spy' | 'blank';
  word: string;
  isAlive: boolean;
  votesReceived: number;
  lastClue?: string;
  level: number;
  frameType: FrameVariant;
}

interface WhoIsTheSpyGameModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateUserCoins: (newCoins: number, newCharms: number) => void;
}

export const WhoIsTheSpyGameModal: React.FC<WhoIsTheSpyGameModalProps> = ({
  user,
  onClose,
  onUpdateUserCoins,
}) => {
  type GamePhase = 
    | 'card_reveal'       // Players check secret word
    | 'clue_giving'       // Turn by turn clue giving
    | 'discussion_voting' // Discussion & casting votes
    | 'elimination'       // Suspect unmasked & eliminated
    | 'spy_guess_comeback'// Spy gets 1 last chance to guess civilian word
    | 'game_over';        // Final victory & rewards

  const [phase, setPhase] = useState<GamePhase>('card_reveal');
  const [roundNumber, setRoundNumber] = useState(1);
  const [currentWordPair, setCurrentWordPair] = useState<SpyWordPair>(SPY_WORD_PAIRS[0]);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [activeTurnPlayerIndex, setActiveTurnPlayerIndex] = useState(0);
  const [myClueInput, setMyClueInput] = useState('');
  const [selectedVoteTargetId, setSelectedVoteTargetId] = useState<string | null>(null);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<SpyPlayer | null>(null);
  const [winningTeam, setWinningTeam] = useState<'civilians' | 'spy' | null>(null);
  const [spyGuessWordInput, setSpyGuessWordInput] = useState('');
  const [spyGuessFeedback, setSpyGuessFeedback] = useState<string | null>(null);
  const [narratorMessage, setNarratorMessage] = useState<string>('🕵️ कार्ड पर टैप करके अपना गुप्त शब्द देखें!');
  const [chatLog, setChatLog] = useState<Array<{ sender: string; text: string; isBot?: boolean; isSystem?: boolean }>>([]);
  const [timerSeconds, setTimerSeconds] = useState(25);
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(true);

  // 6 Players lineup matching WePlay bots + Real user
  const [players, setPlayers] = useState<SpyPlayer[]>([]);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Initialize players and assign random roles
  const initializeNewGame = () => {
    // Pick random word pair
    const pair = SPY_WORD_PAIRS[Math.floor(Math.random() * SPY_WORD_PAIRS.length)];
    setCurrentWordPair(pair);

    // Pick 1 random spy index among the 6 players
    const spyIndex = Math.floor(Math.random() * 6);

    const initialPlayersList: SpyPlayer[] = [
      {
        id: user.userId,
        name: `${user.fullName} (आप)`,
        isBot: false,
        avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`,
        role: spyIndex === 0 ? 'spy' : 'civilian',
        word: spyIndex === 0 ? pair.spyWord : pair.civilianWord,
        isAlive: true,
        votesReceived: 0,
        level: user.gameLevel || 5,
        frameType: (user.frameType as FrameVariant) || 'standard',
      },
      {
        id: 'SHARMA-JI-VIP',
        name: '👑 शर्मा जी (Grand Emperor)',
        isBot: true,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaJiEmperor99',
        role: spyIndex === 1 ? 'spy' : 'civilian',
        word: spyIndex === 1 ? pair.spyWord : pair.civilianWord,
        isAlive: true,
        votesReceived: 0,
        level: 99,
        frameType: 'royal-dragon-crown',
      },
      {
        id: 'BOT-JUDGE',
        name: '⚖️ न्यायाधीश (Judge Nyayadhish)',
        isBot: true,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=JudgeNyayadhish99',
        role: spyIndex === 2 ? 'spy' : 'civilian',
        word: spyIndex === 2 ? pair.spyWord : pair.civilianWord,
        isAlive: true,
        votesReceived: 0,
        level: 45,
        frameType: 'judge-justice',
      },
      {
        id: 'BOT-BHAI',
        name: '🤝 We Bhai (वी भाई)',
        isBot: true,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=WeBhaiBhojpuriBrother',
        role: spyIndex === 3 ? 'spy' : 'civilian',
        word: spyIndex === 3 ? pair.spyWord : pair.civilianWord,
        isAlive: true,
        votesReceived: 0,
        level: 30,
        frameType: 'vip-gold',
      },
      {
        id: 'BOT-CHAT',
        name: '💬 We Chat AI (वी चैट)',
        isBot: true,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=WeChatCompanionPoet',
        role: spyIndex === 4 ? 'spy' : 'civilian',
        word: spyIndex === 4 ? pair.spyWord : pair.civilianWord,
        isAlive: true,
        votesReceived: 0,
        level: 38,
        frameType: 'cosmic-neon',
      },
      {
        id: 'BOT-SIMRAN',
        name: '🌸 Simran (सिमरन)',
        isBot: true,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SimranPlayer',
        role: spyIndex === 5 ? 'spy' : 'civilian',
        word: spyIndex === 5 ? pair.spyWord : pair.civilianWord,
        isAlive: true,
        votesReceived: 0,
        level: 25,
        frameType: 'wolf-night',
      },
    ];

    setPlayers(initialPlayersList);
    setPhase('card_reveal');
    setRoundNumber(1);
    setIsCardFlipped(false);
    setActiveTurnPlayerIndex(0);
    setMyClueInput('');
    setSelectedVoteTargetId(null);
    setEliminatedPlayer(null);
    setWinningTeam(null);
    setSpyGuessFeedback(null);
    setSpyGuessWordInput('');
    setNarratorMessage('🕵️ कार्ड पर टैप करके अपना गुप्त शब्द देखें! ध्यान रहे, जासूस भी हमारे बीच है!');
    setChatLog([
      {
        sender: 'SYSTEM',
        text: `🎮 नया गेम शुरू हुआ! विषय: "${pair.hindiCategory}" (${pair.category})। कार्ड पलटें और अपना शब्द देखें।`,
        isSystem: true,
      },
    ]);
  };

  useEffect(() => {
    initializeNewGame();
  }, []);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollTop = chatBottomRef.current.scrollHeight;
    }
  }, [chatLog]);

  const myPlayer = players.find(p => p.id === user.userId) || players[0];

  // Synthesize Sound Effects
  const playSound = (type: 'flip' | 'win' | 'elim' | 'vote' | 'turn') => {
    try {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioClass) return;
      const ctx = new AudioClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'flip') {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'elim') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {}
  };

  // Text to Speech announcement
  const speakText = (text: string) => {
    if (!isSpeakingVoice) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
      const utter = new SpeechSynthesisUtterance(clean);
      utter.rate = 1.05;
      utter.pitch = 1.0;
      window.speechSynthesis.speak(utter);
    }
  };

  // Card Reveal Done -> Start Description Clue Phase
  const handleStartCluesPhase = () => {
    playSound('flip');
    setPhase('clue_giving');
    setActiveTurnPlayerIndex(0);
    setNarratorMessage(`🎤 राउंड ${roundNumber}: सभी खिलाड़ी बारी-बारी से अपने शब्द का 1 संकेत देंगे।`);
    speakText(`राउंड ${roundNumber}: संकेत का दौर शुरू हो चुका है।`);
  };

  // Handle active turn in Clue Phase
  useEffect(() => {
    if (phase !== 'clue_giving') return;

    const alivePlayers = players.filter(p => p.isAlive);
    if (activeTurnPlayerIndex >= alivePlayers.length) {
      // All alive players gave clues -> Move to Voting
      setTimeout(() => {
        setPhase('discussion_voting');
        setTimerSeconds(30);
        setNarratorMessage('🗳️ मतदान का समय! आपस में चर्चा करें और उस खिलाड़ी को वोट करें जो जासूस लग रहा है।');
        speakText('चर्चा व मतदान का समय! वोट दें कि जासूस कौन है।');
      }, 1500);
      return;
    }

    const currentTurnPlayer = alivePlayers[activeTurnPlayerIndex];
    if (currentTurnPlayer.isBot) {
      // Bot generates smart contextual clue based on role
      const isSpy = currentTurnPlayer.role === 'spy';
      const hintsPool = isSpy ? currentWordPair.spyHintIdeas : currentWordPair.civilianHintIdeas;
      const chosenHint = hintsPool[Math.floor(Math.random() * hintsPool.length)];

      const botDelay = setTimeout(() => {
        playSound('turn');
        setPlayers(prev => prev.map(p => p.id === currentTurnPlayer.id ? { ...p, lastClue: chosenHint } : p));
        setChatLog(prev => [
          ...prev,
          { sender: currentTurnPlayer.name, text: chosenHint, isBot: true },
        ]);
        setActiveTurnPlayerIndex(prev => prev + 1);
      }, 2000);

      return () => clearTimeout(botDelay);
    } else {
      // Real player's turn: waiting for user input
      setNarratorMessage('👉 आपकी बारी है! नीचे दिए गए बॉक्स में अपने शब्द का एक संकेत लिखें या सुझाव चुनें।');
    }
  }, [phase, activeTurnPlayerIndex, players]);

  // Submit User Clue
  const handleSubmitMyClue = (clueText: string) => {
    const text = clueText.trim();
    if (!text) return;

    playSound('turn');
    setPlayers(prev => prev.map(p => p.id === user.userId ? { ...p, lastClue: text } : p));
    setChatLog(prev => [
      ...prev,
      { sender: `${user.fullName} (आप)`, text },
    ]);
    setMyClueInput('');
    setActiveTurnPlayerIndex(prev => prev + 1);
  };

  // Handle Voting Timer Countdown
  useEffect(() => {
    if (phase !== 'discussion_voting') return;

    if (timerSeconds <= 0) {
      executeVoteTally();
      return;
    }

    const timer = setInterval(() => {
      setTimerSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timerSeconds]);

  // Execute Vote Tally & Elimination
  const executeVoteTally = () => {
    const alivePlayers = players.filter(p => p.isAlive);
    const voteCounts: Record<string, number> = {};
    alivePlayers.forEach(p => { voteCounts[p.id] = 0; });

    // 1. User vote
    if (selectedVoteTargetId && voteCounts[selectedVoteTargetId] !== undefined) {
      voteCounts[selectedVoteTargetId]++;
    } else {
      // Random default vote from user if missed
      const possibleTargets = alivePlayers.filter(p => p.id !== user.userId);
      if (possibleTargets.length > 0) {
        const rand = possibleTargets[Math.floor(Math.random() * possibleTargets.length)].id;
        voteCounts[rand]++;
      }
    }

    // 2. Bot votes
    // Bots vote with higher likelihood against players who gave mismatched/spy clues
    alivePlayers.filter(p => p.isBot).forEach(bot => {
      const isBotSpy = bot.role === 'spy';
      let targetId = '';
      if (isBotSpy) {
        // Spy bot votes against an innocent civilian to deflect
        const civilians = alivePlayers.filter(p => p.role === 'civilian' && p.id !== bot.id);
        targetId = civilians[Math.floor(Math.random() * civilians.length)]?.id || user.userId;
      } else {
        // Civilian bot votes with 65% probability against the real spy, or random
        const spyPlayer = alivePlayers.find(p => p.role === 'spy');
        if (spyPlayer && Math.random() < 0.65) {
          targetId = spyPlayer.id;
        } else {
          const others = alivePlayers.filter(p => p.id !== bot.id);
          targetId = others[Math.floor(Math.random() * others.length)]?.id || user.userId;
        }
      }
      if (voteCounts[targetId] !== undefined) {
        voteCounts[targetId]++;
      }
    });

    // Determine highest voted player
    let maxVotes = -1;
    let eliminatedId = '';
    Object.entries(voteCounts).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedId = id;
      }
    });

    const targetToEliminate = players.find(p => p.id === eliminatedId);
    if (!targetToEliminate) return;

    playSound('elim');
    setEliminatedPlayer(targetToEliminate);

    // Update players state
    setPlayers(prev => prev.map(p => {
      if (p.id === targetToEliminate.id) {
        return { ...p, isAlive: false, votesReceived: voteCounts[p.id] || 0 };
      }
      return { ...p, votesReceived: voteCounts[p.id] || 0 };
    }));

    setChatLog(prev => [
      ...prev,
      {
        sender: 'VERDICT',
        text: `⚖️ मतदान समाप्त! ${targetToEliminate.name} को सबसे अधिक ${maxVotes} वोट मिले और वे निष्कासित होते हैं!`,
        isSystem: true,
      },
    ]);

    // Check Win/Loss conditions
    if (targetToEliminate.role === 'spy') {
      // Spy was caught!
      // Give Spy 1 final chance to guess the civilian word
      setPhase('spy_guess_comeback');
      setNarratorMessage(`🚨 जासूस पकड़ा गया! ${targetToEliminate.name} ही जासूस था! क्या जासूस सही शब्द का अनुमान लगाकर जीत छीन सकता है?`);
      speakText(`जासूस पकड़ा गया! क्या जासूस नागरिकों का शब्द पहचान पाएगा?`);
    } else {
      // An innocent civilian was eliminated
      setPhase('elimination');
      setNarratorMessage(`❌ अफ़सोस! ${targetToEliminate.name} एक निर्दोष नागरिक था! जासूस अभी भी खेल में सक्रिय है!`);
      speakText(`निर्दोष नागरिक मारा गया! जासूस अभी भी आज़ाद है!`);

      // Check if spy outnumbers civilians
      const remainingAlive = players.filter(p => p.isAlive && p.id !== targetToEliminate.id);
      const remainingCivilians = remainingAlive.filter(p => p.role === 'civilian');
      const spyAlive = remainingAlive.find(p => p.role === 'spy');

      if (remainingCivilians.length <= 1 && spyAlive) {
        // Spy Wins!
        setTimeout(() => {
          setWinningTeam('spy');
          setPhase('game_over');
          setNarratorMessage(`🕵️ जासूस की महा-जीत! जासूस (${spyAlive.name}) ने सभी नागरिकों को चकमा देकर जीत हासिल की!`);
          speakText(`जासूस की शानदार जीत!`);
        }, 3000);
      }
    }
  };

  // Continue to Next Round if game not over
  const handleNextRound = () => {
    setRoundNumber(prev => prev + 1);
    setPhase('clue_giving');
    setActiveTurnPlayerIndex(0);
    setSelectedVoteTargetId(null);
    setEliminatedPlayer(null);
    setNarratorMessage(`🎤 राउंड ${roundNumber + 1}: बचे हुए खिलाड़ी नया संकेत दें!`);
    speakText(`राउंड ${roundNumber + 1} शुरू!`);
  };

  // Handle Spy Final Guess
  const handleSpyGuessSubmit = (guessWord: string) => {
    const cleanGuess = guessWord.trim().toLowerCase();
    const cleanCivilian = currentWordPair.civilianWord.toLowerCase();

    // Check if guess is correct
    const isCorrect = cleanCivilian.includes(cleanGuess) || cleanGuess.includes(cleanCivilian.split(' ')[0]);

    if (isCorrect) {
      playSound('win');
      setSpyGuessFeedback(`🔥 सही अनुमान! जासूस ने नागरिकों का शब्द पहचान लिया!`);
      setWinningTeam('spy');
      setPhase('game_over');
      confetti({ particleCount: 100, spread: 70 });
    } else {
      playSound('win');
      setSpyGuessFeedback(`❌ गलत अनुमान! नागरिकों का सही शब्द "${currentWordPair.civilianWord}" था!`);
      setWinningTeam('civilians');
      setPhase('game_over');
      confetti({ particleCount: 120, spread: 80 });

      // Award coins to user if user was civilian or alive
      const rewardCoins = 150;
      const rewardCharms = 25;
      onUpdateUserCoins((user.coins || 0) + rewardCoins, (user.charms || 150) + rewardCharms);
    }
  };

  // Auto handle Spy bot guess if eliminated spy is a bot
  useEffect(() => {
    if (phase !== 'spy_guess_comeback' || !eliminatedPlayer) return;

    if (eliminatedPlayer.isBot) {
      const timer = setTimeout(() => {
        // Bot has 30% chance of guessing correctly
        const willGuessRight = Math.random() < 0.3;
        if (willGuessRight) {
          handleSpyGuessSubmit(currentWordPair.civilianWord);
        } else {
          handleSpyGuessSubmit('गिलास'); // Wrong guess
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, eliminatedPlayer]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-4xl shadow-2xl relative text-[#212121] max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-[#2874f0] px-4 sm:px-6 py-3.5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-sm bg-white/15 flex items-center justify-center text-2xl">
              🕵️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-base sm:text-lg text-white tracking-wide">
                  जासूस कौन है? (Who is the Spy?)
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[#ffe500] text-[#212121]">
                  ROUND {roundNumber}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 flex items-center gap-1.5">
                <span>विषय: <strong>{currentWordPair.hindiCategory}</strong></span>
                <span>•</span>
                <span>4 नागरिक, 1 जासूस</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSpeakingVoice(!isSpeakingVoice)}
              className={`p-2 rounded-sm text-xs font-bold transition cursor-pointer ${
                isSpeakingVoice 
                  ? 'bg-white/20 text-[#ffe500]' 
                  : 'bg-white/10 text-white/60'
              }`}
              title="Voice Narration Toggle"
            >
              {isSpeakingVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white rounded-sm bg-white/15 hover:bg-white/25 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1 flex flex-col overflow-hidden">
          {/* Narrator Banner */}
          <div className="mb-3 p-3 rounded-sm bg-[#f5f8ff] border border-blue-200 flex items-center justify-between text-xs sm:text-sm font-bold text-[#212121] shrink-0">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#2874f0] animate-pulse shrink-0" />
              <span>{narratorMessage}</span>
            </div>

            {phase === 'discussion_voting' && (
              <div className="flex items-center space-x-1 font-mono text-[#212121] font-black bg-[#ffe500] px-2.5 py-1 rounded-sm border border-amber-400">
                <Clock className="w-3.5 h-3.5 animate-spin text-[#fb641b]" />
                <span>{timerSeconds}s</span>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
            
            {/* PHASE 1: SECRET WORD CARD REVEAL */}
            {phase === 'card_reveal' && (
              <div className="py-6 flex flex-col items-center justify-center text-center animate-fadeIn">
                <p className="text-xs text-[#878787] font-semibold mb-3">
                  अपना गुप्त शब्द देखने के लिए कार्ड पर क्लिक करें। अपने शब्द को किसी को न बताएं!
                </p>

                {/* 3D Flip Card */}
                <div 
                  onClick={() => {
                    setIsCardFlipped(!isCardFlipped);
                    playSound('flip');
                  }}
                  className="w-64 h-80 rounded-md cursor-pointer perspective-1000 group transition-transform duration-300 hover:scale-105"
                >
                  <div className={`relative w-full h-full duration-500 transform-style-3d transition-all rounded-md shadow-xl border-2 ${
                    isCardFlipped 
                      ? 'bg-white border-[#2874f0] text-[#212121]' 
                      : 'bg-gradient-to-br from-[#2874f0] to-indigo-700 border-blue-400 text-white'
                  } flex flex-col items-center justify-center p-6 text-center select-none`}>
                    
                    {isCardFlipped ? (
                      <div className="space-y-3 animate-fadeIn">
                        <div className="w-16 h-16 rounded-full mx-auto bg-[#f5f8ff] border border-blue-200 flex items-center justify-center text-3xl">
                          🔍
                        </div>
                        <div className="text-[11px] font-black uppercase tracking-widest text-[#2874f0]">
                          आपका गुप्त शब्द (Your Secret Word)
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-[#212121] px-4 py-2 bg-[#ffe500] rounded-sm border border-amber-400 shadow-xs">
                          {myPlayer.word}
                        </div>
                        <p className="text-[10px] text-[#878787] font-bold">
                          श्रेणी: {currentWordPair.hindiCategory}
                        </p>
                        <div className="pt-2 text-[9px] text-[#2874f0] font-semibold italic">
                          (नागरिकों का शब्द और जासूस का शब्द एक-दूसरे से मिलता-जुलता है!)
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-full mx-auto bg-white/15 border border-white/40 flex items-center justify-center text-3xl animate-bounce">
                          ❓
                        </div>
                        <div className="text-sm font-black uppercase text-white">
                          गुप्त पहचान कार्ड
                        </div>
                        <div className="text-xs text-blue-100">
                          कार्ड पलटने के लिए टैप करें
                        </div>
                        <div className="text-[10px] text-[#212121] font-black bg-[#ffe500] px-3 py-1 rounded-sm">
                          🔒 Confidential
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isCardFlipped && (
                  <button
                    onClick={handleStartCluesPhase}
                    className="mt-6 bg-[#fb641b] hover:bg-[#e8550f] px-8 py-3 rounded-sm font-black text-sm text-white flex items-center space-x-2 shadow-md animate-pulse cursor-pointer transition"
                  >
                    <span>संकेत दौर शुरू करें (Start Clue Round)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* PLAYERS GRID (Always visible during gameplay) */}
            {phase !== 'card_reveal' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#212121]">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#2874f0]" />
                    <span>खिलाड़ी स्टेज (6 Players):</span>
                  </span>
                  <span className="text-[10px] text-[#388e3c] font-mono font-bold">
                    {players.filter(p => p.isAlive).length} खिलाड़ी जीवित
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {players.map((p) => {
                    const isAlive = p.isAlive;
                    const isTurn = phase === 'clue_giving' && players.filter(pl => pl.isAlive)[activeTurnPlayerIndex]?.id === p.id;
                    const isSelectedForVote = selectedVoteTargetId === p.id;

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (phase === 'discussion_voting' && isAlive && p.id !== user.userId) {
                            setSelectedVoteTargetId(p.id);
                            playSound('vote');
                          }
                        }}
                        className={`relative flex flex-col items-center p-2.5 rounded-sm border transition-all text-center ${
                          !isAlive 
                            ? 'bg-rose-50 border-rose-200 opacity-60 grayscale'
                            : isTurn
                            ? 'bg-[#f5f8ff] border-[#2874f0] shadow-sm scale-102 ring-2 ring-[#2874f0]'
                            : isSelectedForVote
                            ? 'bg-rose-50 border-rose-500 shadow-sm scale-102 ring-2 ring-rose-500 cursor-pointer'
                            : phase === 'discussion_voting' && p.id !== user.userId
                            ? 'bg-white border-slate-300 hover:border-[#2874f0] cursor-pointer'
                            : 'bg-[#f9fafb] border-slate-200'
                        }`}
                      >
                        {/* Avatar with speaking frame */}
                        <div className="relative">
                          <AvatarFrame
                            src={p.avatar}
                            alt={p.name}
                            size="md"
                            frameType={p.frameType}
                            level={p.level}
                            showCrown={p.id === 'SHARMA-JI-VIP'}
                            isSpeaking={isTurn}
                          />
                          {!isAlive && (
                            <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                              <Skull className="w-5 h-5 text-rose-600" />
                            </div>
                          )}
                        </div>

                        <div className="mt-1 font-bold text-[11px] text-[#212121] truncate max-w-[100px]">
                          {p.name}
                        </div>

                        <div className="text-[9px] text-[#2874f0] font-mono font-bold">
                          Lvl {p.level}
                        </div>

                        {/* Display player's last clue */}
                        {p.lastClue && (
                          <div className="mt-1 p-1 rounded-sm bg-white border border-slate-200 text-[9px] text-[#212121] line-clamp-2 w-full text-left">
                            💬 "{p.lastClue}"
                          </div>
                        )}

                        {/* Vote indicator badge */}
                        {phase === 'discussion_voting' && p.votesReceived > 0 && (
                          <div className="mt-1 px-1.5 py-0.5 rounded-sm bg-rose-600 text-white text-[9px] font-black">
                            {p.votesReceived} Votes
                          </div>
                        )}

                        {/* Voting Radio Button */}
                        {phase === 'discussion_voting' && isAlive && p.id !== user.userId && (
                          <button className={`mt-1.5 w-full py-1 rounded-sm text-[9px] font-black transition cursor-pointer ${
                            isSelectedForVote 
                              ? 'bg-rose-600 text-white' 
                              : 'bg-slate-200 text-[#212121] hover:bg-slate-300'
                          }`}>
                            {isSelectedForVote ? '✓ चयनित (Voted)' : 'वोट दें (Vote)'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CLUE GIVING INPUT PANEL (When it's User's Turn) */}
            {phase === 'clue_giving' && players.filter(p => p.isAlive)[activeTurnPlayerIndex]?.id === user.userId && (
              <div className="bg-[#f5f8ff] p-4 rounded-sm border-2 border-[#2874f0] shadow-sm space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-[#2874f0] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#2874f0]" />
                    <span>आपकी बारी है! अपना संकेत (Clue) दर्ज करें:</span>
                  </span>
                  <span className="text-xs font-mono text-[#212121] font-black bg-[#ffe500] px-2 py-0.5 rounded-sm border border-amber-400">
                    गुप्त शब्द: {myPlayer.word}
                  </span>
                </div>

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {(myPlayer.role === 'spy' ? currentWordPair.spyHintIdeas : currentWordPair.civilianHintIdeas).map((hint, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmitMyClue(hint)}
                      className="px-2.5 py-1 rounded-sm bg-white hover:bg-blue-50 border border-blue-200 text-[10px] text-[#2874f0] font-semibold transition text-left cursor-pointer"
                    >
                      💡 "{hint}"
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="अपने शब्द के बारे में 1 लाइन का संकेत लिखें..."
                    value={myClueInput}
                    onChange={e => setMyClueInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSubmitMyClue(myClueInput);
                    }}
                    className="flex-1 bg-white border border-slate-300 rounded-sm px-3.5 py-2 text-xs text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                  <button
                    onClick={() => handleSubmitMyClue(myClueInput)}
                    className="bg-[#fb641b] hover:bg-[#e8550f] px-4 py-2 rounded-sm text-xs font-bold text-white shrink-0 cursor-pointer transition"
                  >
                    संकेत भेजें
                  </button>
                </div>
              </div>
            )}

            {/* VOTING CONFIRMATION ACTION (During Discussion & Voting) */}
            {phase === 'discussion_voting' && (
              <div className="bg-rose-50 p-4 rounded-sm border border-rose-200 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                <div>
                  <div className="text-xs font-black text-rose-700">
                    {selectedVoteTargetId 
                      ? `चुना गया संदेही: ${players.find(p => p.id === selectedVoteTargetId)?.name}`
                      : 'किसी भी संदेही खिलाड़ी के कार्ड पर क्लिक करके अपना वोट दें'}
                  </div>
                  <div className="text-[10px] text-[#878787]">
                    समय समाप्त होते ही वोटों की गिनती होगी और सबसे अधिक वोट वाले खिलाड़ी को निष्कासित किया जाएगा।
                  </div>
                </div>

                <button
                  onClick={executeVoteTally}
                  className="bg-rose-600 hover:bg-rose-700 px-5 py-2 rounded-sm text-xs font-black text-white shrink-0 shadow-sm cursor-pointer transition"
                >
                  वोट लॉक करें (Submit Vote)
                </button>
              </div>
            )}

            {/* ELIMINATION INTERMISSION (When an Innocent Civilian is Eliminated) */}
            {phase === 'elimination' && eliminatedPlayer && (
              <div className="bg-rose-50 p-4 rounded-sm border-2 border-rose-300 text-center space-y-3 animate-fadeIn">
                <div className="text-sm font-black text-rose-700 flex items-center justify-center gap-1.5">
                  <Skull className="w-5 h-5 text-rose-600" />
                  <span>निष्कासन फैसला: {eliminatedPlayer.name} बाहर हुए!</span>
                </div>
                <p className="text-xs text-[#212121]">
                  उनकी पहचान: <strong className="text-[#388e3c] uppercase">आम नागरिक (Innocent Civilian)</strong> थी!
                  असली जासूस अभी भी चुपचाप खेल रहा है!
                </p>

                <button
                  onClick={handleNextRound}
                  className="bg-[#2874f0] hover:bg-[#1c62d6] px-6 py-2.5 rounded-sm text-xs font-black text-white cursor-pointer transition"
                >
                  राउंड {roundNumber + 1} जारी रखें ➔
                </button>
              </div>
            )}

            {/* SPY GUESS COMEBACK PHASE (Caught Spy gets 1 last chance!) */}
            {phase === 'spy_guess_comeback' && eliminatedPlayer && (
              <div className="bg-amber-50 p-4 rounded-sm border-2 border-amber-300 space-y-3 animate-fadeIn">
                <div className="text-sm font-black text-amber-800 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 text-[#fb641b] animate-bounce" />
                  <span>जासूस का अंतिम दांव (Spy's Last Chance Guess)</span>
                </div>
                <p className="text-xs text-center text-[#212121]">
                  जासूस ({eliminatedPlayer.name}) पकड़ा गया! यदि जासूस नागरिकों का गुप्त शब्द सही पहचान लेता है, तो जासूस जीत जाएगा!
                </p>

                {eliminatedPlayer.id === user.userId ? (
                  <div className="max-w-md mx-auto space-y-2">
                    <div className="text-xs font-bold text-amber-900">
                      आप जासूस थे! नागरिकों के शब्द का अनुमान लगाएं:
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="उदा. चाय, ताजमहल, क्रिकेट..."
                        value={spyGuessWordInput}
                        onChange={e => setSpyGuessWordInput(e.target.value)}
                        className="flex-1 bg-white border border-amber-300 rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
                      />
                      <button
                        onClick={() => handleSpyGuessSubmit(spyGuessWordInput)}
                        className="bg-[#fb641b] hover:bg-[#e8550f] px-4 py-2 rounded-sm text-xs font-black text-white cursor-pointer"
                      >
                        अनुमान लगाएं
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-center text-[#2874f0] font-mono font-bold animate-pulse">
                    जासूस बॉट नागरिकों के गुप्त शब्द का अनुमान लगा रहा है...
                  </div>
                )}
              </div>
            )}

            {/* GAME OVER & FINAL RESULTS */}
            {phase === 'game_over' && (
              <div className="bg-[#f5f8ff] p-6 rounded-md border-2 border-[#2874f0] shadow-md text-center space-y-4 animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-[#ffe500] mx-auto flex items-center justify-center text-3xl shadow-md">
                  {winningTeam === 'civilians' ? '🏆' : '🕵️'}
                </div>

                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-[#388e3c]">
                    {winningTeam === 'civilians' ? 'नागरिकों की शानदार जीत!' : 'जासूस की महा-जीत!'}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#212121] mt-1">
                    {winningTeam === 'civilians' ? 'Civilians Victory! 🎉' : 'Spy Infiltration Victory! 👑'}
                  </h2>
                </div>

                {/* Reveal All Words Table */}
                <div className="p-3 bg-white rounded-sm border border-slate-200 text-xs text-left space-y-1.5 max-w-md mx-auto">
                  <div className="font-bold text-[#878787] mb-1">गुप्त शब्दों का खुलासा:</div>
                  <div className="flex justify-between text-[#2874f0] font-semibold">
                    <span>नागरिकों का शब्द:</span>
                    <span className="font-black text-[#212121]">{currentWordPair.civilianWord}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>जासूस का शब्द:</span>
                    <span className="font-black text-[#212121]">{currentWordPair.spyWord}</span>
                  </div>
                  <div className="flex justify-between text-amber-700 font-semibold pt-1 border-t border-slate-200">
                    <span>असली जासूस था:</span>
                    <span className="font-black text-[#212121]">
                      {players.find(p => p.role === 'spy')?.name}
                    </span>
                  </div>
                </div>

                {winningTeam === 'civilians' && (
                  <div className="p-3 bg-emerald-50 text-[#388e3c] border border-emerald-200 rounded-sm text-xs font-bold inline-block">
                    ✨ जीत का पुरस्कार: +150 Coins, +50 XP, +25 Charms वॉलेट में जोड़े गए!
                  </div>
                )}

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={initializeNewGame}
                    className="bg-[#fb641b] hover:bg-[#e8550f] px-6 py-2.5 rounded-sm font-black text-xs text-white flex items-center space-x-1.5 cursor-pointer transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>नया गेम खेलें (Play Again)</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-[#212121] transition cursor-pointer"
                  >
                    बंद करें (Exit)
                  </button>
                </div>
              </div>
            )}

            {/* ROOM CHAT & CLUES LOG */}
            <div className="bg-[#f9fafb] p-3 rounded-sm border border-slate-200 space-y-2">
              <div className="text-[10px] text-[#878787] font-bold flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[#2874f0]" />
                  <span>गेम संदेश व सुराग लॉग (Clues & Game Log):</span>
                </span>
                <span className="font-mono text-[#2874f0]">{chatLog.length} संदेश</span>
              </div>

              <div 
                ref={chatBottomRef}
                className="max-h-32 overflow-y-auto space-y-1 text-xs pr-1 scrollbar-none font-sans"
              >
                {chatLog.map((c, i) => (
                  <div key={i} className={`p-1.5 rounded-sm text-[11px] ${
                    c.isSystem 
                      ? 'bg-[#f5f8ff] text-[#2874f0] font-semibold border border-blue-100' 
                      : c.isBot 
                      ? 'bg-white text-[#212121] border border-slate-200' 
                      : 'bg-amber-50 text-[#212121] font-bold border border-amber-200'
                  }`}>
                    <span className="font-extrabold text-[#fb641b] mr-1.5">{c.sender}:</span>
                    <span>{c.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
