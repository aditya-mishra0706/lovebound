import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  KeyRound,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Search,
  Users,
  Calendar,
  Lock
} from 'lucide-react';
import { UserProfile } from '../types';
import { generatePairingCode, DEMO_USERS, DEMO_TASKS, DEMO_GOALS, DEMO_MILESTONES, DEMO_MEMORIES } from '../utils/storage';
import { triggerCelebration } from '../utils/confetti';
import { sounds } from '../utils/audio';
import { syncManager } from '../utils/syncChannel';
import { syncService, CheckCodeResult } from '../utils/syncService';

interface LoginCompletePayload {
  user: Partial<UserProfile>;
  partner: Partial<UserProfile>;
  coupleName: string;
  togetherSince: string;
  pairingCode: string;
  userRole: 'creator' | 'partner';
  isPaired: boolean;
  sharedTasks?: any[];
  goals?: any[];
  milestones?: any[];
  memories?: any[];
  tree?: any;
}

interface LoginPageProps {
  onLoginComplete: (data: LoginCompletePayload) => void;
  onExploreDemo: () => void;
  initialCode?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginComplete,
  onExploreDemo,
  initialCode,
}) => {
  // Mode: 'choose' | 'create_code' | 'enter_code' | 'code_waiting'
  const [view, setView] = useState<'choose' | 'create_code' | 'enter_code' | 'code_waiting'>('choose');

  // Creator Form Details (Partner 1)
  const [creatorName, setCreatorName] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [creatorAvatar, setCreatorAvatar] = useState('🦋');
  const [coupleName, setCoupleName] = useState('Sweethearts 🍯');
  const [togetherSince, setTogetherSince] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [myCode, setMyCode] = useState<string>(() => initialCode || generatePairingCode());
  const [isCopied, setIsCopied] = useState(false);
  const [partnerConnectedName, setPartnerConnectedName] = useState<string | null>(null);

  // Joiner Form Details (Partner 2)
  const [joinCode, setJoinCode] = useState('');
  const [joinerName, setJoinerName] = useState('');
  const [joinerAvatar, setJoinerAvatar] = useState('🌸');
  const [joinerEmail, setJoinerEmail] = useState('');
  const [codeCheckResult, setCodeCheckResult] = useState<CheckCodeResult | null>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Array<{ code: string; coupleName: string; creatorName: string }>>([]);

  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const AVATAR_OPTIONS = ['🦋', '🌸', '👨‍🎨', '🦊', '🐱', '🐼', '✨', '🍓', '🚀', '🦁', '🌿', '💎'];

  // Load available rooms on server when entering join view
  useEffect(() => {
    if (view === 'enter_code') {
      syncService.getActiveRooms().then((rooms) => {
        setAvailableRooms(rooms);
      });
    }
  }, [view]);

  // Listen to live partner connections when waiting on Phone 1
  useEffect(() => {
    if (view !== 'code_waiting') return;

    syncService.init(myCode, 'creator');
    syncService.setListeners(
      (serverState) => {
        if (serverState.partner && serverState.partner.name) {
          setPartnerConnectedName(serverState.partner.name);
          triggerCelebration('hearts');
          sounds.playHeartCheer(true);
        }
      },
      () => {}
    );

    const unsubscribe = syncManager.subscribe((msg) => {
      if (msg.type === 'PAIR_REQUEST' && msg.targetCode === myCode) {
        setPartnerConnectedName(msg.senderName);
        triggerCelebration('hearts');
        sounds.playSuccess(true);
      }
    });

    return () => {
      unsubscribe();
      syncService.stop();
    };
  }, [view, myCode, creatorName]);

  // Automatic code verification with debounce as the user types
  useEffect(() => {
    if (view !== 'enter_code') return;

    const trimmed = joinCode.trim().toUpperCase();
    if (trimmed.length < 3) {
      setCodeCheckResult(null);
      setJoinError(null);
      setIsCheckingCode(false);
      return;
    }

    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);

    setIsCheckingCode(true);
    setJoinError(null);

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await syncService.checkCode(trimmed);
        setCodeCheckResult(res);
        if (!res.valid) {
          setJoinError(res.error || `Code "${trimmed}" not found. Please double check with your partner.`);
        } else {
          setJoinError(null);
          sounds.playPop(true);
        }
      } catch {
        setJoinError('Could not reach sync server to verify code.');
      } finally {
        setIsCheckingCode(false);
      }
    }, 400);

    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [joinCode, view]);

  // Handle Partner 1 Form Submit (Register couple & show sync code)
  const handleCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName.trim()) return;

    try {
      await syncService.registerCouple(
        myCode,
        {
          name: creatorName.trim(),
          avatar: creatorAvatar,
          email: creatorEmail.trim(),
          streakDays: 1,
          statusText: 'In flow & in love',
          isDeepWork: false,
          focusMinutesToday: 0,
        },
        coupleName.trim() || `${creatorName.trim()}'s Couple 🍯`,
        togetherSince,
        {
          // Clean initial arrays - ZERO DUMMY DATA
          goals: [],
          sharedTasks: [],
          milestones: [],
          memories: [],
        }
      );
      sounds.playSuccess(true);
      triggerCelebration('confetti');
      setView('code_waiting');
    } catch (err: any) {
      alert(`Could not register couple session: ${err.message}`);
    }
  };

  // Handle Partner 2 Submit (Join existing couple with verified code)
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError('Please enter your partner’s pairing code.');
      return;
    }
    if (!joinerName.trim()) {
      setJoinError('Please enter your name so your partner knows who joined.');
      return;
    }

    setIsSubmittingJoin(true);
    setJoinError(null);

    try {
      const response = await syncService.joinCouple(cleanCode, {
        name: joinerName.trim(),
        avatar: joinerAvatar,
        email: joinerEmail.trim(),
        streakDays: 1,
        statusText: 'Connected & ready',
        isDeepWork: false,
        focusMinutesToday: 0,
        tasks: [],
      });

      if (!response.success || !response.couple) {
        throw new Error(response.error || 'Pairing failed. Please verify the code.');
      }

      const serverCouple = response.couple;
      triggerCelebration('fireworks');
      sounds.playHeartCheer(true);

      // Pass REAL couple data returned by server (NO DUMMY DATA)
      onLoginComplete({
        user: {
          name: joinerName.trim(),
          avatar: joinerAvatar,
          email: joinerEmail.trim(),
          streakDays: 1,
          statusText: 'Connected & in love',
          isDeepWork: false,
          focusMinutesToday: 0,
        },
        partner: {
          name: serverCouple.creator.name,
          avatar: serverCouple.creator.avatar,
          email: serverCouple.creator.email || '',
          streakDays: serverCouple.creator.streakDays || 1,
          statusText: serverCouple.creator.statusText || 'Connected & in love',
          isDeepWork: serverCouple.creator.isDeepWork || false,
          focusMinutesToday: serverCouple.creator.focusMinutesToday || 0,
        },
        coupleName: serverCouple.shared.coupleName || 'Sweethearts 🍯',
        togetherSince: serverCouple.shared.togetherSince || togetherSince,
        pairingCode: serverCouple.code || cleanCode,
        userRole: 'partner',
        isPaired: true,
        sharedTasks: serverCouple.shared.sharedTasks || [],
        goals: serverCouple.shared.goals || [],
        milestones: serverCouple.shared.milestones || [],
        memories: serverCouple.shared.memories || [],
        tree: serverCouple.shared.tree || undefined,
      });
    } catch (err: any) {
      setJoinError(err.message || `Failed to connect with code "${cleanCode}".`);
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  const handleFinishCreatorFlow = () => {
    onLoginComplete({
      user: {
        name: creatorName.trim() || 'You',
        email: creatorEmail.trim(),
        avatar: creatorAvatar,
        streakDays: 1,
        statusText: 'Connected & in love',
        isDeepWork: false,
        focusMinutesToday: 0,
      },
      partner: {
        name: partnerConnectedName || 'My Partner',
        avatar: '🌸',
        email: '',
        streakDays: 1,
        statusText: partnerConnectedName ? 'Paired & online' : 'Waiting for partner to join',
        isDeepWork: false,
        focusMinutesToday: 0,
      },
      coupleName: coupleName.trim() || `${creatorName.trim() || 'Our'}'s Couple 🍯`,
      togetherSince,
      pairingCode: myCode,
      userRole: 'creator',
      isPaired: !!partnerConnectedName,
      sharedTasks: [],
      goals: [],
      milestones: [],
      memories: [],
    });
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(myCode);
      setIsCopied(true);
      sounds.playPop(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c16] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      {/* Background glow orbs */}
      <div className="fixed -top-24 -left-24 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-80 h-80 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[36px] bg-[#141629]/95 border border-[#272b52] shadow-2xl p-6 sm:p-7 relative overflow-hidden backdrop-blur-xl"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-400 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center"
          >
            <div className="w-full h-full bg-[#121424] rounded-[22px] flex items-center justify-center">
              <Heart className="w-8 h-8 fill-pink-500 text-pink-400" />
            </div>
          </motion.div>

          <h1 className="text-2xl font-black text-white tracking-tight mt-3">
            Duo
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Real couple goals, shared milestones & private photo memories for two
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* SCREEN 1: CHOOSE PATH */}
          {view === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-white">How would you like to connect?</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connect 2 separate phones with a private sync code
                </p>
              </div>

              {/* Option A: I am the First Partner (Create Code) */}
              <button
                onClick={() => setView('create_code')}
                className="w-full p-4 rounded-3xl bg-[#1b1e38] hover:bg-[#232749] border-2 border-[#2e345e] hover:border-purple-500/50 transition-all text-left flex items-start gap-3.5 group cursor-pointer shadow-md"
              >
                <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    I'm the first partner
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Set up your real couple space and generate a private code for your partner's phone.
                  </p>
                </div>
              </button>

              {/* Option B: I have my partner's code */}
              <button
                onClick={() => {
                  setView('enter_code');
                  setCodeCheckResult(null);
                  setJoinError(null);
                }}
                className="w-full p-4 rounded-3xl bg-[#1b1e38] hover:bg-[#232749] border-2 border-[#2e345e] hover:border-pink-500/50 transition-all text-left flex items-start gap-3.5 group cursor-pointer shadow-md"
              >
                <div className="p-3 rounded-2xl bg-pink-600/20 text-pink-400 border border-pink-500/30 shrink-0 group-hover:scale-105 transition-transform">
                  <KeyRound className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                    I have my partner's code
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Enter the code shown on your partner's screen. We'll verify it live before you join!
                  </p>
                </div>
              </button>

              {/* Option C: Demo Explore */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onExploreDemo}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 cursor-pointer"
                >
                  Explore pre-filled demo mode
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 2: PARTNER 1 DETAILS (GENERATE CODE) */}
          {view === 'create_code' && (
            <motion.form
              key="create_code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleCreatorSubmit}
              className="space-y-3.5"
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-base font-bold text-white">Create Couple Room</h2>
                  <p className="text-xs text-slate-400">Step 1 of 2: Your profile details</p>
                </div>
                <button
                  type="button"
                  onClick={() => setView('choose')}
                  className="text-xs text-purple-400 hover:underline cursor-pointer"
                >
                  Back
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Your Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1b1e38] border border-[#2e345e] text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                  Choose Your Avatar
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {AVATAR_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setCreatorAvatar(em)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border shrink-0 transition-all cursor-pointer ${
                        creatorAvatar === em
                          ? 'border-purple-400 bg-purple-950/80 scale-105 shadow-sm'
                          : 'border-[#2e345e] bg-[#1a1d35]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Couple Nickname
                  </label>
                  <input
                    type="text"
                    value={coupleName}
                    onChange={(e) => setCoupleName(e.target.value)}
                    placeholder="Sweethearts 🍯"
                    className="w-full px-3 py-2 rounded-xl bg-[#1b1e38] border border-[#2e345e] text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Anniversary Date
                  </label>
                  <input
                    type="date"
                    value={togetherSince}
                    onChange={(e) => setTogetherSince(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1b1e38] border border-[#2e345e] text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>Generate Sync Code for Partner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}

          {/* SCREEN 3: CODE DISPLAY & LIVE WAITING */}
          {view === 'code_waiting' && (
            <motion.div
              key="code_waiting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 text-center"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Ready to Sync
                </span>
                <h2 className="text-xl font-black text-white mt-0.5">
                  Your Couple Pairing Code
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Have your partner open Duo on their phone, choose "I have my partner's code", and enter:
                </p>
              </div>

              {/* Glowing Code Card */}
              <div className="relative p-5 rounded-3xl bg-gradient-to-b from-[#1c1f3b] to-[#15172b] border-2 border-purple-500/50 shadow-2xl overflow-hidden">
                <span className="text-[10px] font-bold tracking-widest text-purple-300 uppercase block mb-1">
                  OFFICIAL PAIRING CODE
                </span>

                <div className="flex items-center justify-center gap-3 my-2">
                  <span className="text-4xl font-mono font-black tracking-widest text-white selection:bg-purple-500">
                    {myCode}
                  </span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Code Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Code to Send to Partner</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Connection Status Banner */}
              <div className="p-3.5 rounded-2xl bg-[#171a33] border border-[#272b50] flex items-center justify-between text-xs text-left">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${partnerConnectedName ? 'bg-emerald-400' : 'bg-pink-400'} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${partnerConnectedName ? 'bg-emerald-500' : 'bg-pink-500'}`} />
                  </span>
                  <div>
                    <span className="font-bold text-white block">
                      {partnerConnectedName ? `Paired with ${partnerConnectedName}! 💕` : 'Waiting for partner to enter code...'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {partnerConnectedName
                        ? 'Your partner is now connected! Live two-way synchronization is active.'
                        : 'Your screen will automatically update the instant your partner types this code.'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleFinishCreatorFlow}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>{partnerConnectedName ? 'Open Synced Couple Space' : 'Enter My Couple Space'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 4: ENTER PARTNER'S CODE (REAL LIVE VALIDATION & ZERO DUMMY DATA) */}
          {view === 'enter_code' && (
            <motion.form
              key="enter_code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleJoinSubmit}
              className="space-y-3.5"
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-base font-bold text-white">Join Partner's Room</h2>
                  <p className="text-xs text-slate-400">We verify your partner's code live in real-time</p>
                </div>
                <button
                  type="button"
                  onClick={() => setView('choose')}
                  className="text-xs text-purple-400 hover:underline cursor-pointer"
                >
                  Back
                </button>
              </div>

              {/* Partner Code Input with Live Status */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Partner's Pairing Code <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setJoinCode(val);
                    }}
                    placeholder="e.g. DUO-TEST1"
                    className="w-full px-3.5 py-3 rounded-2xl bg-[#1b1e38] border-2 border-purple-500/40 text-center font-mono text-lg font-black tracking-widest text-white uppercase placeholder-slate-400 focus:outline-none focus:border-pink-400"
                    autoFocus
                  />
                  {isCheckingCode && (
                    <div className="absolute right-3.5 top-3.5">
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* LIVE CODE VERIFICATION CARD */}
              {codeCheckResult && codeCheckResult.valid && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-xs text-emerald-200 space-y-1.5 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-white">Code Verified & Room Found!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300 border-t border-emerald-800/40">
                    <div>
                      <span className="text-emerald-400 font-semibold block">Couple:</span>
                      <strong className="text-white">{codeCheckResult.coupleName}</strong>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-semibold block">Created By:</span>
                      <strong className="text-white">{codeCheckResult.creatorAvatar} {codeCheckResult.creatorName}</strong>
                    </div>
                  </div>
                  {codeCheckResult.alreadyHasPartner && (
                    <p className="text-[10px] text-amber-300 pt-1">
                      Note: You are linking with {codeCheckResult.creatorName}'s couple room.
                    </p>
                  )}
                </motion.div>
              )}

              {/* REAL ERROR MESSAGE (Clear explanation if invalid) */}
              {joinError && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-xs text-rose-200 space-y-1.5 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="font-bold text-white">Incorrect or Missing Code</span>
                  </div>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed">
                    {joinError}
                  </p>
                  {availableRooms.length > 0 && (
                    <div className="pt-2 border-t border-rose-800/40">
                      <span className="text-[10px] text-slate-300 block mb-1 font-semibold">
                        Active couple rooms on server:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableRooms.map((r) => (
                          <button
                            key={r.code}
                            type="button"
                            onClick={() => setJoinCode(r.code)}
                            className="px-2 py-0.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/40 text-[10px] font-mono text-purple-200 cursor-pointer"
                          >
                            {r.code} ({r.creatorName})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Partner 2 Details */}
              <div className="pt-2 border-t border-[#222543] space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Your Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={joinerName}
                    onChange={(e) => setJoinerName(e.target.value)}
                    placeholder="e.g. Jordan"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1b1e38] border border-[#2e345e] text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                    Your Avatar Emoji
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {AVATAR_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setJoinerAvatar(em)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border shrink-0 transition-all cursor-pointer ${
                          joinerAvatar === em
                            ? 'border-pink-400 bg-pink-950/80 scale-105 shadow-sm'
                            : 'border-[#2e345e] bg-[#1a1d35]'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Join Button */}
              <button
                type="submit"
                disabled={isSubmittingJoin || (codeCheckResult !== null && !codeCheckResult.valid)}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmittingJoin ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting with Partner...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Pair with Partner & Sync Real Data</span>
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
