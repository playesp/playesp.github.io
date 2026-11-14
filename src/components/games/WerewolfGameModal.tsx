import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, Moon, Sun, Shield, Eye, Skull, 
  Crown, Play, RotateCcw, Volume2, Sparkles, 
  Award, AlertTriangle, Users, HeartHandshake
} from 'lucide-react';
import type { UserProfile, WerewolfPlayer } from '../../types/index.ts';
import { AvatarFrame } from '../AvatarFrame.tsx';

interface WerewolfGameModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateUserCoins: (newCoins: number, newCharms: number) => void;
}

export const WerewolfGameModal: React.FC<WerewolfGameModalProps> = ({
  user,
  onClose,
  onUpdateUserCoins,
}) => {
  type GamePhase = 'role_reveal' | 'night' | 'day_discussion' | 'voting' | 'verdict' | 'game_over';

  const [phase, setPhase] = useState<GamePhase>('role_reveal');
  const [roundNumber, setRoundNumber] = useState(1);
  const [roleRevealed, setRoleRevealed] = useState(false);
  const [narratorText, setNarratorText] = useState('🐺 आपका स्वागत है ESP PLAY भेड़िया (Werewolf) गेम में! पत्ते बंट रहे हैं...');

  // Players
  const [players, setPlayers] = useState<WerewolfPlayer[]>([
    {
      id: user.userId,
      name: `${user.fullName} (आप)`,
      isBot: false,
      avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`,
      role: 'seer', // Default role for player, randomized on start
      isAlive: true,
      votesReceived: 0,
    },
    {
      id: 'BOT-JUDGE',
      name: '⚖️ न्यायाधीश (Judge Bot)',
      isBot: true,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=JudgeNyayadhish99',
      role: 'doctor',
      isAlive: true,
      votesReceived: 0,
    },
    {
      id: 'BOT-BHAI',
      name: '🤝 We Bhai (वी भाई)',
      isBot: true,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=WeBhaiBhojpuriBrother',
      role: 'villager',
      isAlive: true,
      votesReceived: 0,
    },
    {
      id: 'BOT-CHAT',
      name: '💬 We Chat AI',
      isBot: true,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=WeChatCompanionPoet',
      role: 'werewolf',
      isAlive: true,
      votesReceived: 0,
    },
    {
      id: 'BOT-SIMRAN',
      name: '🌸 Simran (सिमरन)',
      isBot: true,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SimranPlayer',
      role: 'villager',
      isAlive: true,
      votesReceived: 0,
    },
    {
      id: 'BOT-KABIR',
      name: '⚡ Kabir (कबीर)',
      isBot: true,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=KabirGamer',
      role: 'villager',
      isAlive: true,
      votesReceived: 0,
    },
  ]);

  const [inspectedPlayerId, setInspectedPlayerId] = useState<string | null>(null);
  const [nightTargetId, setNightTargetId] = useState<string | null>(null);
  const [protectedId, setProtectedId] = useState<string | null>(null);
  const [selectedVoteTargetId, setSelectedVoteTargetId] = useState<string | null>(null);
  const [lastNightEliminated, setLastNightEliminated] = useState<string | null>(null);
  const [winnerTeam, setWinnerTeam] = useState<'villagers' | 'werewolves' | null>(null);

  const myPlayer = players.find(p => p.id === user.userId)!;

  // Initialize random roles
  const startNewGame = () => {
    const roles: ('werewolf' | 'seer' | 'doctor' | 'villager')[] = [
      'werewolf',
      'seer',
      'doctor',
      'villager',
      'villager',
      'villager'
    ];
    // Shuffle roles
    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);

    const newPlayers: WerewolfPlayer[] = players.map((p, idx) => ({
      ...p,
      role: shuffledRoles[idx],
      isAlive: true,
      votesReceived: 0,
    }));

    setPlayers(newPlayers);
    setPhase('role_reveal');
    setRoleRevealed(false);
    setRoundNumber(1);
    setInspectedPlayerId(null);
    setNightTargetId(null);
    setProtectedId(null);
    setSelectedVoteTargetId(null);
    setLastNightEliminated(null);
    setWinnerTeam(null);
    setNarratorText('🐺 पत्ते बंट चुके हैं! अपना गुप्त कार्ड पलटें और अपनी भूमिका जानें।');
  };

  useEffect(() => {
    startNewGame();
  }, []);

  // Move from Role Reveal to Night
  const proceedToNight = () => {
    setPhase('night');
    setNarratorText('🌙 रात हो चुकी है... पूरे गांव में सन्नाटा छा गया है। सभी आंखें बंद करें!');
  };

  // Night Action (Seer inspect or Wolf hunt)
  const handleNightAction = (targetId: string) => {
    if (myPlayer.role === 'seer') {
      setInspectedPlayerId(targetId);
      const target = players.find(p => p.id === targetId);
      setNarratorText(`🔮 आपकी दिव्य दृष्टि ने देखा: ${target?.name} की असली पहचान है [${
        target?.role === 'werewolf' ? '🐺 भेड़िया (WEREWOLF)' : '🧑‍🌾 गांव वाला / रक्षक'
      }]!`);
    } else if (myPlayer.role === 'werewolf') {
      setNightTargetId(targetId);
      setNarratorText('🐺 आपने शिकार चुन लिया है! पूर्णिमा की रात रंग लाएगी...');
    } else if (myPlayer.role === 'doctor') {
      setProtectedId(targetId);
      setNarratorText('💉 आपने सुरक्षा कवच लगा दिया है!');
    }
  };

  // Advance Night to Day
  const advanceToDay = () => {
    // Determine night elimination
    let victimId: string | null = null;
    if (myPlayer.role === 'werewolf' && nightTargetId) {
      victimId = nightTargetId;
    } else {
      // AI werewolf chooses
      const aliveNonWolves = players.filter(p => p.isAlive && p.role !== 'werewolf');
      if (aliveNonWolves.length > 0) {
        const randomVictim = aliveNonWolves[Math.floor(Math.random() * aliveNonWolves.length)];
        victimId = randomVictim.id;
      }
    }

    // AI doctor saves someone randomly
    const doc = players.find(p => p.role === 'doctor' && p.isAlive);
    let docSaveId: string | null = null;
    if (doc) {
      if (!doc.isBot && protectedId) {
        docSaveId = protectedId;
      } else {
        const alivePlayers = players.filter(p => p.isAlive);
        docSaveId = alivePlayers[Math.floor(Math.random() * alivePlayers.length)].id;
      }
    }

    let killedName: string | null = null;
    let updatedPlayers = [...players];

    if (victimId && victimId !== docSaveId) {
      updatedPlayers = updatedPlayers.map(p => p.id === victimId ? { ...p, isAlive: false } : p);
      const dead = players.find(p => p.id === victimId);
      killedName = dead ? dead.name : 'एक ग्रामीण';
      setLastNightEliminated(killedName);
    } else {
      setLastNightEliminated(null);
    }

    setPlayers(updatedPlayers);
    setPhase('day_discussion');

    if (killedName) {
      setNarratorText(`☀️ सुबह हो चुकी है! दुखद समाचार: रात के अंधेरे में भेड़ियों ने ${killedName} का शिकार कर लिया!`);
    } else {
      setNarratorText('☀️ सुबह हो चुकी है! डॉक्टर की सतर्कता से आज रात सभी सुरक्षित रहे! कोई हताहत नहीं!');
    }

    checkWinCondition(updatedPlayers);
  };

  // Start Voting
  const startVoting = () => {
    setPhase('voting');
    setNarratorText('🗳️ पंचायत शुरू! सभी गांव वाले चर्चा करें और संदिग्ध पर वोट डालें!');
  };

  // Cast vote
  const handleCastVote = (targetId: string) => {
    setSelectedVoteTargetId(targetId);

    // AI players randomly or smartly vote
    const alivePlayers = players.filter(p => p.isAlive);
    const voteCounts: { [key: string]: number } = {};
    alivePlayers.forEach(p => { voteCounts[p.id] = 0; });

    // User's vote
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;

    // AI bots vote
    alivePlayers.forEach(p => {
      if (p.isBot) {
        // AI might vote for suspect
        const candidates = alivePlayers.filter(c => c.id !== p.id);
        const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
        if (randomCandidate) {
          voteCounts[randomCandidate.id] = (voteCounts[randomCandidate.id] || 0) + 1;
        }
      }
    });

    // Find highest voted
    let maxVotes = -1;
    let expelledId: string | null = null;
    Object.keys(voteCounts).forEach(id => {
      if (voteCounts[id] > maxVotes) {
        maxVotes = voteCounts[id];
        expelledId = id;
      }
    });

    const updatedPlayers = players.map(p => ({
      ...p,
      votesReceived: voteCounts[p.id] || 0,
      isAlive: p.id === expelledId ? false : p.isAlive,
    }));

    setPlayers(updatedPlayers);
    setPhase('verdict');
    const expelledPerson = players.find(p => p.id === expelledId);

    setNarratorText(`⚖️ पंचायत का फैसला: सबसे ज्यादा वोटों के साथ ${expelledPerson?.name} को गांव से निष्कासित कर दिया गया! इनकी भूमिका थी [${
      expelledPerson?.role === 'werewolf' ? '🐺 भेड़िया' : '🧑‍🌾 निर्दोष ग्रामीण'
    }]!`);

    checkWinCondition(updatedPlayers);
  };

  // Check Win Condition
  const checkWinCondition = (currentPlayers: WerewolfPlayer[]) => {
    const aliveWerewolves = currentPlayers.filter(p => p.isAlive && p.role === 'werewolf');
    const aliveVillagers = currentPlayers.filter(p => p.isAlive && p.role !== 'werewolf');

    if (aliveWerewolves.length === 0) {
      setWinnerTeam('villagers');
      setPhase('game_over');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      const newCoins = (user.coins || 0) + 200;
      const newCharms = (user.charms || 0) + 50;
      onUpdateUserCoins(newCoins, newCharms);
      setNarratorText('🏆 बधाई! सभी भेड़ियों का सफाया हो गया! गांव वालों की ऐतिहासिक जीत हुई! (+200 Coins & +50 Charms)');
    } else if (aliveWerewolves.length >= aliveVillagers.length) {
      setWinnerTeam('werewolves');
      setPhase('game_over');
      setNarratorText('🐺 भेड़ियों की तादाद गांव वालों के बराबर हो गई! भेड़ियों का पूरे गांव पर राज हो गया!');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'werewolf': return { label: '🐺 भेड़िया (Werewolf)', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
      case 'seer': return { label: '🔮 ज्योतिषी (Seer)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'doctor': return { label: '💉 डॉक्टर (Doctor)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      default: return { label: '🧑‍🌾 ग्रामीण (Villager)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-md max-w-2xl w-full shadow-2xl relative text-[#212121] my-auto max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="bg-[#2874f0] px-4 sm:px-6 py-3.5 flex items-center justify-between text-white sticky top-0 z-20">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-sm bg-white/15 text-[#ffe500]">
              <Moon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                ESP PLAY भेड़िया (Werewolf) गेम
              </h3>
              <p className="text-[11px] text-blue-100">
                संचालक: 🐺 Werewolf Bot & ⚖️ न्यायाधीश | राउंड #{roundNumber}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-sm bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Wolf Narrator Dialogue Banner */}
          <div className="p-3.5 rounded-sm bg-[#f5f8ff] border border-blue-200 flex items-center space-x-3">
            <AvatarFrame
              src="https://api.dicebear.com/7.x/bottts/svg?seed=WerewolfHostWolf"
              size="md"
              frameType="wolf-night"
              level={75}
              isSpeaking={true}
            />
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2874f0]">
                🐺 भेड़िया सूत्रधार (Game Master):
              </span>
              <p className="text-xs text-[#212121] font-semibold mt-0.5 leading-snug">
                {narratorText}
              </p>
            </div>
          </div>

          {/* PHASE 1: ROLE REVEAL */}
          {phase === 'role_reveal' && (
            <div className="text-center py-4 space-y-4">
              <div className="inline-block p-1 rounded-md bg-gradient-to-r from-[#2874f0] via-purple-600 to-[#fb641b] shadow-lg">
                <div 
                  onClick={() => setRoleRevealed(true)}
                  className={`w-64 h-80 rounded-sm flex flex-col items-center justify-center p-6 text-center transition-all duration-500 cursor-pointer ${
                    roleRevealed 
                       ? 'bg-white text-[#212121]' 
                       : 'bg-gradient-to-b from-purple-700 to-indigo-800 text-white hover:scale-[1.02]'
                  }`}
                >
                  {!roleRevealed ? (
                    <div className="space-y-3">
                      <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center mx-auto animate-pulse">
                        <Sparkles className="w-10 h-10 text-[#ffe500]" />
                      </div>
                      <h4 className="text-base font-black text-white">आपका गुप्त कार्ड</h4>
                      <p className="text-xs text-purple-100">कार्ड पलटने के लिए टैप करें</p>
                      <span className="inline-block px-3 py-1 rounded-sm bg-[#ffe500] text-[#212121] text-[10px] font-black">
                        ESP PLAY Secret Card
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="text-5xl">
                        {myPlayer.role === 'werewolf' ? '🐺' : myPlayer.role === 'seer' ? '🔮' : myPlayer.role === 'doctor' ? '💉' : '🧑‍🌾'}
                      </div>
                      <h4 className="text-lg font-black text-[#212121] capitalize">
                        {getRoleBadge(myPlayer.role).label}
                      </h4>
                      <p className="text-xs text-[#878787] leading-relaxed">
                        {myPlayer.role === 'werewolf' 
                          ? 'रात को भेड़ियों के साथ मिलकर शिकार चुनें और दिन में गांव वालों को चकमा दें!'
                          : myPlayer.role === 'seer'
                          ? 'हर रात किसी एक खिलाड़ी की असली पहचान जानने के लिए अपनी दिव्य दृष्टि का उपयोग करें!'
                          : myPlayer.role === 'doctor'
                          ? 'हर रात एक इंसान को सुरक्षा कवच दें ताकि भेड़ियों के हमले से वह बच सके!'
                          : 'अपनी सूझबूझ और वोटिंग से भेड़ियों को पहचानें और गांव से खदेड़ें!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {roleRevealed && (
                <div>
                  <button
                    onClick={proceedToNight}
                    className="px-6 py-2.5 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-sm shadow-sm cursor-pointer transition"
                  >
                    रात शुरू करें (Proceed to Night) 🌙
                  </button>
                </div>
              )}
            </div>
          )}

        {/* 6-PLAYERS ARENA BOARD */}
        {phase !== 'role_reveal' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#212121] px-1">
              <span>गांव के 6 खिलाड़ी (Village Roster)</span>
              <span className="text-[#2874f0]">
                {phase === 'night' ? '🌙 रात्रि चरण (Night)' : phase === 'voting' ? '🗳️ मतदान चरण (Voting)' : '☀️ दिवस चरण (Day)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {players.map((p) => {
                const isMe = p.id === user.userId;
                const isSelected = selectedVoteTargetId === p.id || nightTargetId === p.id;
                const isInspected = inspectedPlayerId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!p.isAlive) return;
                      if (phase === 'night' && !isMe) {
                        handleNightAction(p.id);
                      } else if (phase === 'voting' && !isMe) {
                        handleCastVote(p.id);
                      }
                    }}
                    className={`p-3 rounded-sm border transition relative overflow-hidden flex flex-col items-center text-center space-y-1.5 ${
                      !p.isAlive
                        ? 'bg-rose-50 border-rose-200 opacity-60 grayscale'
                        : isSelected
                        ? 'bg-[#f5f8ff] border-[#2874f0] ring-2 ring-[#2874f0]/40 cursor-pointer'
                        : 'bg-[#f9fafb] border-slate-200 hover:border-[#2874f0] cursor-pointer'
                    }`}
                  >
                    {!p.isAlive && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
                        <span className="px-2 py-0.5 rounded-sm bg-rose-600 text-white text-[9px] font-black uppercase flex items-center gap-1">
                          <Skull className="w-3 h-3" /> निष्कासित (Dead)
                        </span>
                      </div>
                    )}

                    <AvatarFrame
                      src={p.avatar}
                      size="md"
                      level={isMe ? (user.gameLevel || 5) : 50}
                    />

                    <div className="w-full">
                      <span className="text-xs font-black text-[#212121] truncate block">
                        {p.name}
                      </span>
                      {isMe ? (
                        <span className="text-[10px] font-bold text-[#2874f0] block">
                          {getRoleBadge(p.role).label}
                        </span>
                      ) : isInspected ? (
                        <span className="text-[10px] font-black text-amber-600 block animate-pulse">
                          👁️ {p.role === 'werewolf' ? 'भेड़िया' : 'निर्दोष'}
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#878787] block">
                          {p.isAlive ? 'जीवित नागरिक' : 'शहीद'}
                        </span>
                      )}

                      {phase === 'verdict' && p.votesReceived > 0 && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded-sm bg-[#ffe500] text-[#212121] text-[9px] font-black">
                          {p.votesReceived} वोट
                        </span>
                      )}
                    </div>

                    {/* Action button hint */}
                    {p.isAlive && !isMe && (
                      <span className="text-[9px] text-[#2874f0] font-bold underline">
                        {phase === 'night' && myPlayer.role === 'seer' && 'जांचें (Inspect)'}
                        {phase === 'night' && myPlayer.role === 'werewolf' && 'शिकार करें (Hunt)'}
                        {phase === 'night' && myPlayer.role === 'doctor' && 'बचाएं (Protect)'}
                        {phase === 'voting' && 'वोट दें (Vote)'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Phase Action Bar */}
            <div className="pt-2">
              {phase === 'night' && (
                <button
                  onClick={advanceToDay}
                  className="w-full py-2.5 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Sun className="w-4 h-4" />
                  <span>सुबह का सूरज उगाएं (Advance to Day)</span>
                </button>
              )}

              {phase === 'day_discussion' && (
                <button
                  onClick={startVoting}
                  className="w-full py-2.5 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-black text-xs flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>पंचायत वोटिंग शुरू करें (Start Village Vote)</span>
                </button>
              )}

              {phase === 'verdict' && (
                <button
                  onClick={() => {
                    setRoundNumber(prev => prev + 1);
                    setPhase('night');
                    setNarratorText(`🌙 राउंड ${roundNumber + 1} की रात शुरू! सभी गांव वाले पुनः सो जाएं...`);
                  }}
                  className="w-full py-2.5 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-black text-xs flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Moon className="w-4 h-4" />
                  <span>अगली रात पर जाएं (Next Night Phase)</span>
                </button>
              )}

              {phase === 'game_over' && (
                <button
                  onClick={startNewGame}
                  className="w-full py-2.5 rounded-sm bg-[#388e3c] hover:bg-[#2e7d32] text-white font-black text-xs flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>नया Werewolf गेम शुरू करें (Play Again)</span>
                </button>
              )}
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};
