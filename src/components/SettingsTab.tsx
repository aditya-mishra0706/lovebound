import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Edit3, 
  Volume2, 
  Bell, 
  Zap, 
  Globe, 
  LogOut, 
  Unlink, 
  Download, 
  Upload, 
  Check, 
  Layers, 
  Users,
  Moon,
  ShieldCheck,
  Copy
} from 'lucide-react';
import { CoupleSettings, ThemeMode, UserProfile, CelebrationEffect } from '../types';
import { THEMES } from '../utils/theme';
import { sounds } from '../utils/audio';
import { triggerCelebration } from '../utils/confetti';

interface SettingsTabProps {
  settings: CoupleSettings;
  user: UserProfile;
  partner: UserProfile;
  pairingCode: string;
  isPaired: boolean;
  onUpdateSettings: (newSettings: Partial<CoupleSettings>) => void;
  onUpdateUser: (newUser: Partial<UserProfile>) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  onLogout: () => void;
  onPairWithCode?: (code: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  user,
  partner,
  pairingCode,
  isPaired,
  onUpdateSettings,
  onUpdateUser,
  onResetData,
  onExportData,
  onImportData,
  onLogout,
  onPairWithCode,
}) => {
  const [isEditingCouple, setIsEditingCouple] = useState(false);
  const [coupleNameInput, setCoupleNameInput] = useState(settings.coupleName);
  const [dateInput, setDateInput] = useState(settings.togetherSince);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState(user.name);
  const [avatarInput, setAvatarInput] = useState(user.avatar);

  // Calculate days together
  const startDate = new Date(settings.togetherSince);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const daysTogether = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const handleSaveCouple = () => {
    onUpdateSettings({
      coupleName: coupleNameInput,
      togetherSince: dateInput,
    });
    setIsEditingCouple(false);
    sounds.playPop(settings.soundAndHaptics);
  };

  const handleSaveProfile = () => {
    onUpdateUser({
      name: profileNameInput,
      avatar: avatarInput,
    });
    setIsEditingProfile(false);
    sounds.playPop(settings.soundAndHaptics);
  };

  const handleSelectTheme = (themeId: ThemeMode) => {
    onUpdateSettings({ theme: themeId });
    sounds.playPop(settings.soundAndHaptics);
  };

  const handleSelectCelebration = (fx: CelebrationEffect) => {
    onUpdateSettings({ celebrationFx: fx });
    triggerCelebration(fx);
    sounds.playSuccess(settings.soundAndHaptics);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Subtitle Header as in Screenshot 5: "Sweethearts 🍯 · Duo v1.2.0" */}
      <div className="text-center py-1">
        <span className="text-xs font-semibold text-slate-400">
          {settings.coupleName} · Duo v1.2.0
        </span>
      </div>

      {/* User Profile Card (Matches Screenshot 5) */}
      <div className="rounded-3xl p-5 bg-[#171a33]/90 border border-[#272b4f] shadow-lg backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#24284b] border border-[#353b6b] flex items-center justify-center text-3xl shadow-inner">
                {user.avatar}
              </div>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="absolute -bottom-1 -right-1 p-1 rounded-full bg-purple-600 text-white border-2 border-[#171a33] hover:bg-purple-500 cursor-pointer"
                title="Edit profile"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/40 text-[10px] font-bold">
                  {user.streakDays}d day streak 🔥
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user.email} · {user.age} · {user.gender}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {user.focusMinutesToday}m focus today · Live Active
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3.5 flex justify-end">
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-3 py-1.5 rounded-xl bg-[#212547] hover:bg-[#2b315c] text-xs font-semibold text-slate-200 border border-[#353b6b] transition-all cursor-pointer"
          >
            Edit Profile
          </button>
        </div>

        {/* Inline Profile Edit Modal/Form */}
        {isEditingProfile && (
          <div className="mt-4 p-4 rounded-2xl bg-[#1d2140] border border-purple-500/40 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Update Profile
            </h4>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Your Name</label>
              <input
                type="text"
                value={profileNameInput}
                onChange={(e) => setProfileNameInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#14162b] border border-[#2e345e] text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Avatar Emoji</label>
              <div className="flex gap-2">
                {['🦋', '👨‍🎨', '🦊', '🌸', '🚀', '🐱', '🐼', '✨'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarInput(emoji)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base border transition-all ${
                      avatarInput === emoji
                        ? 'border-purple-400 bg-purple-950'
                        : 'border-[#2e345e] bg-[#14162b]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-3 py-1 rounded-xl bg-purple-600 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LOVE & COUPLE Section (Matches Screenshot 5) */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1">
          LOVE & COUPLE
        </span>

        <div className="rounded-3xl bg-[#151728] border border-[#262a4d] divide-y divide-[#222543] overflow-hidden shadow-lg">
          {/* Row 1: Sweethearts Together Since */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">{settings.coupleName}</h4>
                <p className="text-xs text-slate-400">Together since {settings.togetherSince}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditingCouple(!isEditingCouple)}
              className="px-3 py-1 rounded-xl bg-[#1f233f] text-xs font-semibold text-slate-300 border border-[#2e345e] hover:border-purple-500/50 cursor-pointer"
            >
              Edit
            </button>
          </div>

          {/* Edit Couple inputs */}
          {isEditingCouple && (
            <div className="p-4 bg-[#1b1e36] space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Couple Nickname</label>
                <input
                  type="text"
                  value={coupleNameInput}
                  onChange={(e) => setCoupleNameInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#131526] border border-[#2e345e] text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Together Since (Date)</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#131526] border border-[#2e345e] text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingCouple(false)}
                  className="px-3 py-1 rounded-xl text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCouple}
                  className="px-3 py-1 rounded-xl bg-purple-600 text-xs font-bold text-white cursor-pointer"
                >
                  Update
                </button>
              </div>
            </div>
          )}

          {/* Row 2: Days Together Milestone Count */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Days Together</h4>
                <p className="text-xs text-slate-400">
                  Milestone count since you two got together 💕
                </p>
              </div>
            </div>

            <span className="text-sm font-extrabold text-rose-400 whitespace-nowrap">
              {daysTogether} days
            </span>
          </div>

          {/* Row 3: Celebration FX */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Celebration FX</h4>
                  <p className="text-xs text-slate-400">
                    Effect triggered on cheer or task completion
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { id: 'confetti', label: '🎉 Confetti' },
                { id: 'hearts', label: '💖 Floating Hearts' },
                { id: 'fireworks', label: '🎆 Fireworks' },
                { id: 'sparkles', label: '✨ Sparkles' },
              ].map((fx) => (
                <button
                  key={fx.id}
                  onClick={() => handleSelectCelebration(fx.id as CelebrationEffect)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    settings.celebrationFx === fx.id
                      ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-sm'
                      : 'bg-[#1b1e36] border-[#2b3055] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span>{fx.label}</span>
                  {settings.celebrationFx === fx.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* APPEARANCE & THEMES (Matches Screenshot 5 & 4) */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1">
          APPEARANCE & THEMES
        </span>

        <div className="grid grid-cols-2 gap-3">
          {Object.values(THEMES).map((theme) => {
            const isSelected = settings.theme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`relative rounded-3xl p-4 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1b1e36] border-purple-400 ring-2 ring-purple-500/40 shadow-lg'
                    : 'bg-[#151728] border-[#262a4d] hover:border-slate-500'
                }`}
              >
                {theme.badge && (
                  <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-pink-500 text-[9px] font-black tracking-wider text-white uppercase shadow-sm">
                    {theme.badge}
                  </span>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#24284b] text-sm">
                    {theme.id === 'lovey' ? '💕' : theme.id === 'warm' ? '🤍' : theme.id === 'oled' ? '🖤' : theme.id === 'lavender' ? '💜' : '🌙'}
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-bold text-white">{theme.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {theme.tagline}
                </p>

                {/* Color preview dots (as in screenshot 5) */}
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#222543]">
                  {theme.previewDots.map((dotColor, idx) => (
                    <span
                      key={idx}
                      className="w-3 h-3 rounded-full border border-black/30"
                      style={{ backgroundColor: dotColor }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LANGUAGE (Matches Screenshot 4) */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1">
          LANGUAGE
        </span>

        <div className="rounded-3xl p-4 bg-[#151728] border border-[#262a4d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-purple-400" />
            <div>
              <h4 className="text-sm font-bold text-white">Language</h4>
              <p className="text-xs text-slate-400">🇺🇸 English (English)</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-xl bg-[#1e2240] text-xs font-bold text-slate-200 border border-[#2e345e]">
            🇺🇸 English &gt;
          </span>
        </div>
      </div>

      {/* NOTIFICATIONS (Matches Screenshot 4) */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1">
          NOTIFICATIONS
        </span>

        <div className="rounded-3xl bg-[#151728] border border-[#262a4d] divide-y divide-[#222543] overflow-hidden">
          {/* Cheers & Nudges */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-purple-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Cheers & Nudges</h4>
                <p className="text-xs text-slate-400">When partner sends a reaction</p>
              </div>
            </div>

            <button
              onClick={() =>
                onUpdateSettings({ cheersAndNudges: !settings.cheersAndNudges })
              }
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.cheersAndNudges ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  settings.cheersAndNudges ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Partner Activity */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Partner Activity</h4>
                <p className="text-xs text-slate-400">Live alerts when partner finishes tasks</p>
              </div>
            </div>

            <button
              onClick={() =>
                onUpdateSettings({ partnerActivityAlerts: !settings.partnerActivityAlerts })
              }
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.partnerActivityAlerts ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  settings.partnerActivityAlerts ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Sound Effects & Haptics */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-teal-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Sound Effects & Haptics</h4>
                <p className="text-xs text-slate-400">Play playful sounds on cheers and completion</p>
              </div>
            </div>

            <button
              onClick={() => {
                const nextVal = !settings.soundAndHaptics;
                onUpdateSettings({ soundAndHaptics: nextVal });
                if (nextVal) sounds.playPop(true);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.soundAndHaptics ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  settings.soundAndHaptics ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SYNC & PAIRING CODE CARD */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1">
          DEVICE SYNC & PAIRING CODE
        </span>

        <div className="rounded-3xl p-5 bg-[#151728] border border-[#262a4d] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
                YOUR SYNC CODE
              </span>
              <span className="text-2xl font-mono font-black text-white tracking-widest mt-0.5 block">
                {pairingCode}
              </span>
            </div>

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(pairingCode);
                  sounds.playPop(settings.soundAndHaptics);
                  alert(`Copied sync code: ${pairingCode} to clipboard! Share it with your partner.`);
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/45 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Put this code in your partner's Duo app to sync your goals, streak, and photo memories together.
          </p>

          <div className="pt-2 border-t border-[#222543] flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${isPaired ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>Status: <strong className={isPaired ? 'text-emerald-300' : 'text-amber-300'}>{isPaired ? `Paired with ${partner.name}` : 'Waiting for Partner'}</strong></span>
            </span>

            {!isPaired && onPairWithCode && (
              <button
                onClick={() => {
                  const code = prompt("Enter partner's sync code (e.g. DUO-1234):");
                  if (code) onPairWithCode(code);
                }}
                className="text-xs text-purple-400 font-bold hover:underline cursor-pointer"
              >
                Enter Partner Code &gt;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ACCOUNT & SESSION */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase px-1">
          ACCOUNT & SESSION
        </span>

        <div className="rounded-3xl bg-[#151728] border border-[#262a4d] divide-y divide-[#222543] overflow-hidden">
          {/* Partner status row */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{partner.avatar}</span>
              <div>
                <h4 className="text-sm font-bold text-white">{partner.name}</h4>
                <p className="text-xs text-slate-400">
                  {partner.avatar} · Live Syncing · {partner.streakDays} day streak
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-teal-950/60 text-teal-300 border border-teal-800/40 text-[10px] font-bold">
              Live
            </span>
          </div>

          {/* Disconnect Partner */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to unpair device? This will reset local data.')) {
                onResetData();
              }
            }}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1c203b] transition-colors cursor-pointer text-rose-400"
          >
            <div className="flex items-center gap-3">
              <Unlink className="w-4 h-4" />
              <div>
                <h4 className="text-sm font-bold">Disconnect Partner</h4>
                <p className="text-xs text-slate-400">Unpair device and reset sync</p>
              </div>
            </div>

            <span className="text-xs text-slate-400">&gt;</span>
          </button>

          {/* Log Out */}
          <button
            onClick={onLogout}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1c203b] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-rose-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Log Out</h4>
                <p className="text-xs text-slate-400">Signed in as {user.name} · Tap to log out</p>
              </div>
            </div>

            <span className="text-xs text-slate-400">&gt;</span>
          </button>
        </div>
      </div>

      {/* Backup & Export Data */}
      <div className="pt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
        <button
          onClick={onExportData}
          className="flex-1 py-2 px-3 rounded-xl bg-[#1b1e36] hover:bg-[#252a4d] border border-[#2b3055] text-slate-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Backup</span>
        </button>

        <label className="flex-1 py-2 px-3 rounded-xl bg-[#1b1e36] hover:bg-[#252a4d] border border-[#2b3055] text-slate-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          <span>Restore Backup</span>
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                const content = event.target?.result as string;
                if (content) onImportData(content);
              };
              reader.readAsText(file);
            }}
          />
        </label>
      </div>
    </div>
  );
};
