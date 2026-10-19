import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Target, Calendar, DollarSign, Tag, Sparkles } from 'lucide-react';
import { CoupleGoal } from '../types';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<CoupleGoal, 'id' | 'completed'>) => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CoupleGoal['category']>('travel');
  const [targetAmount, setTargetAmount] = useState<number>(1000);
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [unit, setUnit] = useState('$');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState<CoupleGoal['assignedTo']>('together');
  const [icon, setIcon] = useState('✈️');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      category,
      targetAmount: Number(targetAmount) || 1,
      currentAmount: Number(currentAmount) || 0,
      unit,
      deadline,
      notes: notes.trim(),
      assignedTo,
      icon,
    });
    onClose();
  };

  const CATEGORY_ICONS: Record<CoupleGoal['category'], string> = {
    travel: '✈️',
    romance: '💖',
    home: '🏡',
    wellness: '🧘',
    finance: '💰',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md rounded-3xl bg-[#151728] border border-[#2e345e] shadow-2xl p-5 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#1e2240] text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Create Couple Goal</h3>
            <p className="text-xs text-slate-400">Track a shared dream together</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Goal Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kyoto Cherry Blossom Trip, Down Payment Fund..."
              className="w-full px-3 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white focus:outline-none focus:border-purple-400 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value as CoupleGoal['category'];
                  setCategory(val);
                  setIcon(CATEGORY_ICONS[val] || '🎯');
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white focus:outline-none focus:border-purple-400"
              >
                <option value="travel">✈️ Travel</option>
                <option value="romance">💖 Romance</option>
                <option value="home">🏡 Home</option>
                <option value="wellness">🧘 Wellness</option>
                <option value="finance">💰 Finance</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Assigned
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value as CoupleGoal['assignedTo'])}
                className="w-full px-3 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white focus:outline-none focus:border-purple-400"
              >
                <option value="together">Together 👫</option>
                <option value="me">Me 🦋</option>
                <option value="partner">Partner 👨‍🎨</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Target
              </label>
              <input
                type="number"
                min="1"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Current
              </label>
              <input
                type="number"
                min="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="$, dates, books"
                className="w-full px-2.5 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Target Deadline
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Sweet Note / Motivation
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why this goal matters to us..."
              className="w-full px-3 py-2 rounded-xl bg-[#1b1e36] border border-[#2e345e] text-xs text-white placeholder-slate-400"
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              Save Couple Goal
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
