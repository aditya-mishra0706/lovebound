import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { Milestone } from '../types';

interface AddMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (milestone: Omit<Milestone, 'id' | 'completed'>) => void;
}

export const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<Milestone['category']>('anniversary');
  const [icon, setIcon] = useState('💕');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      date,
      category,
      icon,
      description: description.trim(),
    });
    onClose();
  };

  const ICONS = ['💕', '💍', '✈️', '🏡', '🍾', '🌟', '🎓', '👶', '🐾', '🎂'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md rounded-3xl theme-card border theme-border shadow-2xl p-5 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full theme-card-subtle theme-text-muted hover:opacity-80 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-pink-600/20 text-pink-400 border border-pink-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold theme-text">Add Relationship Milestone</h3>
            <p className="text-xs theme-text-muted">Mark an anniversary or shared life event</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-semibold theme-text block mb-1">
              Milestone Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 500 Days Together, Moved In Together, Engaged..."
              className="w-full px-3 py-2 rounded-xl theme-input border theme-border text-xs theme-text focus:outline-none placeholder:theme-text-muted"
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
                className="w-full px-3 py-2 rounded-xl theme-input border theme-border text-xs theme-text focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold theme-text block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Milestone['category'])}
                className="w-full px-3 py-2 rounded-xl theme-input border theme-border text-xs theme-text focus:outline-none"
              >
                <option value="anniversary">Anniversary 💕</option>
                <option value="travel">Travel ✈️</option>
                <option value="life">Life Event 🌟</option>
                <option value="achievement">Achievement 🏆</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold theme-text block mb-1">
              Choose Icon
            </label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all cursor-pointer ${
                    icon === ic
                      ? 'border-pink-500 bg-pink-500/20 shadow-sm'
                      : 'theme-border theme-card-subtle hover:opacity-80'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold theme-text block mb-1">
              Description / Memory Note
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this day so special..."
              className="w-full px-3 py-2 rounded-xl theme-input border theme-border text-xs theme-text placeholder:theme-text-muted"
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 cursor-pointer"
            >
              Save Milestone
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
