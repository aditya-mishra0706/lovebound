import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Image as ImageIcon, Upload, Lock, Sparkles, Heart } from 'lucide-react';
import { PhotoMemory } from '../types';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: Omit<PhotoMemory, 'id' | 'likesCount' | 'cherishedBy'>) => void;
}

const PRESET_PHOTOS = [
  {
    name: 'Sunset Beach',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cozy Morning Coffee',
    url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Stargazing Camp',
    url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cute Fur Baby',
    url: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Kyoto Walk',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Kitchen Feast',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  },
];

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0].url);
  const [caption, setCaption] = useState('');
  const [secretNote, setSecretNote] = useState('');
  const [tagsInput, setTagsInput] = useState('Date, Romance');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      title: title.trim(),
      date,
      location: location.trim() || 'Our Special Spot',
      imageUrl,
      caption: caption.trim(),
      secretNote: secretNote.trim() || undefined,
      tags: tags.length > 0 ? tags : ['Love'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#151728] border border-[#2e345e] shadow-2xl p-5"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-[#1e2240] text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Save Private Photo Memory</h3>
            <p className="text-xs text-slate-400">Lock in a cherished couple moment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Photo Preview & Upload */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Memory Photo
            </label>
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 border border-[#2e345e] mb-2">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex-1 py-2 px-3 rounded-xl bg-[#1e2240] hover:bg-[#282d52] border border-[#2e345e] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-pink-400" />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Presets selection */}
            <div className="mt-2">
              <span className="text-[10px] text-slate-400 block mb-1 font-medium">
                Or pick a couple preset:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {PRESET_PHOTOS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border shrink-0 transition-all ${
                      imageUrl === p.url ? 'border-rose-400 ring-2 ring-rose-500/50 scale-105' : 'border-[#2e345e] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Memory Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Ice Cream Run, First Sunset..."
              className="w-full px-3 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kyoto, Central Park"
                className="w-full px-3 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Sweet Caption / Story
            </label>
            <textarea
              rows={2}
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What happened on this day? Write what you felt..."
              className="w-full px-3 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white placeholder-slate-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-rose-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-rose-400" />
                <span>Secret Partner Love Note (Encrypted)</span>
              </label>
              <span className="text-[10px] text-slate-400">Optional</span>
            </div>
            <textarea
              rows={2}
              value={secretNote}
              onChange={(e) => setSecretNote(e.target.value)}
              placeholder="A sweet secret note only revealed when partner taps unlock..."
              className="w-full px-3 py-2 rounded-xl bg-[#1b1e36] border border-rose-500/30 text-xs text-rose-100 placeholder-slate-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Travel, Sunset, Date Night"
              className="w-full px-3 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
            >
              Save Memory
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
