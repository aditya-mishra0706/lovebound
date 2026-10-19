import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Plus, 
  MapPin, 
  Calendar, 
  Lock, 
  Unlock, 
  Eye, 
  Sparkles, 
  Image as ImageIcon,
  Share2,
  Trash2,
  X
} from 'lucide-react';
import { PhotoMemory } from '../types';
import { triggerCelebration } from '../utils/confetti';
import { sounds } from '../utils/audio';

interface MemoriesTabProps {
  memories: PhotoMemory[];
  onAddMemory: () => void;
  onLikeMemory: (memoryId: string) => void;
  onDeleteMemory: (memoryId: string) => void;
  activeUserId: string;
  soundEnabled: boolean;
}

export const MemoriesTab: React.FC<MemoriesTabProps> = ({
  memories,
  onAddMemory,
  onLikeMemory,
  onDeleteMemory,
  activeUserId,
  soundEnabled,
}) => {
  const [selectedMemory, setSelectedMemory] = useState<PhotoMemory | null>(null);
  const [revealedNotes, setRevealedNotes] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const toggleRevealNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedNotes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    sounds.playPop(soundEnabled);
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeMemory(id);
    sounds.playHeartCheer(soundEnabled);
    triggerCelebration('hearts');
  };

  // Collect all unique tags
  const allTags = ['all', ...Array.from(new Set(memories.flatMap((m) => m.tags)))];

  const filteredMemories = memories.filter((m) => {
    if (activeFilter === 'all') return true;
    return m.tags.includes(activeFilter);
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Header Banner */}
      <div className="rounded-3xl p-5 bg-gradient-to-r from-rose-900/60 via-purple-900/40 to-indigo-900/50 border border-rose-500/30 shadow-lg relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-300">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Private Vault</span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-0.5">
              Our Photo Memories
            </h3>
            <p className="text-xs text-rose-200/80 mt-1">
              Encrypted intimate moments, love notes, and milestones
            </p>
          </div>

          <button
            onClick={onAddMemory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Filter Tags */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setActiveFilter(tag);
              sounds.playPop(soundEnabled);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === tag
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-[#181a2e] text-slate-400 hover:text-slate-200 border border-[#262a4d]'
            }`}
          >
            {tag === 'all' ? 'All Memories' : `#${tag}`}
          </button>
        ))}
      </div>

      {/* Grid of Polaroid Photo Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMemories.map((mem) => {
          const isCherished = mem.cherishedBy.includes(activeUserId);
          const isNoteRevealed = !!revealedNotes[mem.id];

          return (
            <motion.div
              key={mem.id}
              layout
              onClick={() => setSelectedMemory(mem)}
              className="group rounded-3xl bg-[#151728] border border-[#262a4d] overflow-hidden shadow-lg hover:border-pink-500/40 transition-all cursor-pointer"
            >
              {/* Photo Frame */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                <img
                  src={mem.imageUrl}
                  alt={mem.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#151728] via-transparent to-black/30 pointer-events-none" />

                {/* Date & Location Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-white border border-white/10">
                  <Calendar className="w-3 h-3 text-pink-400" />
                  <span>{mem.date}</span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-white border border-white/10">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{mem.location}</span>
                </div>

                {/* Cherish / Like heart button */}
                <button
                  onClick={(e) => handleLike(mem.id, e)}
                  className={`absolute bottom-3 right-3 p-2.5 rounded-full backdrop-blur-md border transition-all active:scale-90 cursor-pointer ${
                    isCherished
                      ? 'bg-rose-500/90 border-rose-400 text-white shadow-lg shadow-rose-500/40'
                      : 'bg-black/50 border-white/20 text-slate-300 hover:text-white hover:bg-black/70'
                  }`}
                  title="Cherish this memory"
                >
                  <Heart className={`w-4 h-4 ${isCherished ? 'fill-current text-white' : ''}`} />
                </button>
              </div>

              {/* Memory Details */}
              <div className="p-4">
                <h4 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                  {mem.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {mem.caption}
                </p>

                {/* Secret Note Container */}
                {mem.secretNote && (
                  <div
                    onClick={(e) => toggleRevealNote(mem.id, e)}
                    className="mt-3 p-3 rounded-2xl bg-[#1d1f3b] border border-pink-500/20 hover:border-pink-500/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-pink-300">
                      <span className="flex items-center gap-1.5">
                        {isNoteRevealed ? (
                          <Unlock className="w-3.5 h-3.5 text-pink-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-pink-400" />
                        )}
                        <span>{isNoteRevealed ? 'Secret Love Note Revealed 💌' : 'Locked Partner Secret Note'}</span>
                      </span>
                      <span className="text-[10px] text-pink-400/80 font-normal">
                        {isNoteRevealed ? 'Tap to hide' : 'Tap to reveal'}
                      </span>
                    </div>

                    {isNoteRevealed && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-rose-200 italic mt-2 pt-2 border-t border-pink-500/20 leading-relaxed font-serif"
                      >
                        “{mem.secretNote}”
                      </motion.p>
                    )}
                  </div>
                )}

                {/* Tags and Likes */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#232747] text-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {mem.tags.map((t) => (
                      <span key={t} className="text-slate-400 font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-rose-500" />
                    {mem.likesCount} loves
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {memories.length === 0 && (
        <div className="text-center py-10 px-4 rounded-3xl bg-[#151728] border border-[#262a4d] text-slate-400 space-y-2 mt-2">
          <ImageIcon className="w-10 h-10 mx-auto text-pink-400/60" />
          <h4 className="text-sm font-bold text-white">Private Photo Memories</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Upload your first romantic selfie, date night snapshot, or travel memory to keep safely here.
          </p>
          <button
            onClick={onAddMemory}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload First Memory</span>
          </button>
        </div>
      )}

      {/* Memory Detail Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#151728] border border-[#2e345e] shadow-2xl p-5"
            >
              <button
                onClick={() => setSelectedMemory(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="rounded-2xl overflow-hidden aspect-[4/3] w-full bg-black">
                <img
                  src={selectedMemory.imageUrl}
                  alt={selectedMemory.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {selectedMemory.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-pink-400" />
                    {selectedMemory.date}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mt-2">{selectedMemory.title}</h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{selectedMemory.caption}</p>

                {selectedMemory.secretNote && (
                  <div className="mt-4 p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 mb-1">
                      <Heart className="w-3.5 h-3.5 fill-rose-400" />
                      <span>Partner Note</span>
                    </div>
                    <p className="text-xs text-rose-100 italic font-serif leading-relaxed">
                      “{selectedMemory.secretNote}”
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#262a4d]">
                  <button
                    onClick={() => {
                      onDeleteMemory(selectedMemory.id);
                      setSelectedMemory(null);
                      sounds.playPop(soundEnabled);
                    }}
                    className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>

                  <button
                    onClick={(e) => handleLike(selectedMemory.id, e)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-md shadow-rose-600/30"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Cherish ({selectedMemory.likesCount})</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
