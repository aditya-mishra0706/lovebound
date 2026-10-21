import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Heart, Upload, Lock } from 'lucide-react';
import { PhotoMemory } from '../types';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: Omit<PhotoMemory, 'id' | 'likesCount' | 'cherishedBy'>) => void;
}

const PRESET_PHOTOS = [
  {
    name: 'Sunset Beach',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cozy Coffee',
    url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cherry Blossoms',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Starry Campfire',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
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
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl theme-card border theme-border shadow-2xl p-5"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full theme-card-subtle theme-text-muted hover:opacity-80 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <h3 className="text-base font-bold theme-text">Save Private Photo Memory</h3>
            <p className="text-xs theme-text-muted">Lock in a cherished couple moment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Photo Preview & Upload */}
          <div>
            <label className="text-[11px] font-semibold theme-text block mb-1">
              Memory Photo
            </label>
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 border theme-border mb-2">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex-1 py-2 px-3 rounded-xl theme-card-subtle border theme-border theme-text text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-80 transition-colors">
                <Upload className="w-3.5 h-3.5 text-pink-500" />
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
              <span className="text-[10px] theme-text-muted block mb-1 font-medium">
                Or pick a couple preset:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {PRESET_PHOTOS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                      imageUrl === p.url ? 'border-rose-500 ring-2 ring-rose-500/50 scale-105' : 'theme-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold theme-text block mb-1">
              Memory Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Ice Cream Run, First Sunset..."
              className="w-full px-3 py-2 rounded-xl theme-input border theme-border text-xs theme-text placeholder:theme-text-muted focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold theme-text block mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl theme-input border theme-border text-xs theme-text"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold theme-text block mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kyoto, Central Park"
                className="w-full px-3 py-2 rounded-xl theme-input border theme-border text-xs theme-text placeholder:theme-text-muted"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold theme-text block mb-1">
              Sweet Caption / Story
            </label>
            <textarea
              rows={2}
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What happened on this day? Write what you felt..."
              className="w-full px-3 py-2 rounded-xl theme-input border theme-border text-xs theme-text placeholder:theme-text-muted"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-rose-400" />
                <span>Secret Partner Love Note (Encrypted)</span>
              </label>
              <span className="text-[10px] theme-text-muted">Optional</span>
            </div>
            <textarea
              rows={2}
              value={secretNote}
              onChange={(e) => setSecretNote(e.target.value)}
              placeholder="A sweet secret note only revealed when partner taps unlock..."
              className="w-full px-3 py-2 rounded-xl theme-input border border-rose-500/30 text-xs theme-text placeholder:theme-text-muted"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold theme-text block mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Travel, Sunset, Date Night"
              className="w-full px-3 py-2 rounded-xl theme-input border theme-border text-xs theme-text"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs theme-text-muted hover:opacity-80 cursor-pointer"
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
