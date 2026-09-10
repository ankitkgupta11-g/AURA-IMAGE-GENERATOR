import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Check, User, Sparkles, Trash2, ShieldCheck } from 'lucide-react';
import { isClerkConfigured } from '../lib/clerkConfig';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  onNavigateToAuth?: () => void;
  onOpenDeleteAccount?: () => void;
}

const PRESET_USERS: UserProfile[] = [
  {
    id: 'user-ankit',
    name: 'Ankit Gupta',
    email: 'ankit.gupta@aura.studio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'Creative Director',
    creationsCount: 18,
    favoritesCount: 6,
  },
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    email: 'elena.rostova@aura.studio',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    role: 'Spatial Artist',
    creationsCount: 24,
    favoritesCount: 11,
  },
  {
    id: 'user-marcus',
    name: 'Marcus Chen',
    email: 'marcus.chen@aura.studio',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'Visual Architect',
    creationsCount: 31,
    favoritesCount: 14,
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onNavigateToAuth,
  onOpenDeleteAccount,
}) => {
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('Digital Creator');

  if (!isOpen) return null;

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: customName.trim(),
      email: `${customName.toLowerCase().replace(/\s+/g, '.')}@creator.io`,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      role: customRole,
      creationsCount: 0,
      favoritesCount: 0,
    };
    onSelectUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-spatial-lg border border-[#dedad0]">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#7d8798] hover:text-[#181b22] hover:bg-[#f3f1ec] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#181b22] text-white flex items-center justify-center font-bold text-xs">
            A
          </div>
          <h3 className="font-display text-lg font-bold text-[#16191f]">
            Studio Workspace Account
          </h3>
        </div>

        <p className="text-xs text-[#636d7e] mb-4">
          Switch creator profiles, create a custom profile, or access full authentication.
        </p>

        {/* Clerk Authentication Action */}
        {onNavigateToAuth && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-[#f0f4ff] border border-[#d2defc] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#2845d6]">
              <ShieldCheck className="w-4 h-4 text-[#3052ff]" />
              <div>
                <span className="font-semibold block">Clerk Authentication</span>
                <span className="text-[11px] text-[#4f67e0]">
                  {isClerkConfigured ? 'Ready & Connected' : 'Google, GitHub & Email SSO'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigateToAuth();
              }}
              className="py-1.5 px-3 rounded-xl bg-[#3052ff] hover:bg-[#2040e0] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Open Auth
            </button>
          </div>
        )}

        {/* Preset profiles */}
        <div className="flex flex-col gap-2.5 mb-6">
          <span className="text-[11px] font-mono uppercase text-[#737e90] font-semibold">
            Select Active Profile
          </span>
          {PRESET_USERS.map((user) => {
            const isSelected = currentUser.id === user.id;
            return (
              <div
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#f0f4ff] border-[#3052ff] shadow-sm'
                    : 'bg-[#faf9f6] border-[#dedad0] hover:bg-[#f3f1ec]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-[#16191f]/10"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#171a21]">{user.name}</div>
                    <div className="text-[11px] text-[#6e7789]">{user.role}</div>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-[#3052ff]" />}
              </div>
            );
          })}
        </div>

        {/* Custom Creator Option */}
        <form onSubmit={handleCreateCustom} className="pt-4 border-t border-[#f0eee7]">
          <span className="text-[11px] font-mono uppercase text-[#737e90] font-semibold block mb-3">
            Or Create Custom Studio Identity
          </span>

          <div className="flex flex-col gap-2 mb-4">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Your Full Name"
              className="w-full p-2.5 rounded-xl bg-[#faf9f6] border border-[#dedad0] text-xs text-[#1c2128] focus:outline-none focus:border-[#3052ff]"
            />
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Title / Discipline (e.g. 3D Matte Painter)"
              className="w-full p-2.5 rounded-xl bg-[#faf9f6] border border-[#dedad0] text-xs text-[#1c2128] focus:outline-none focus:border-[#3052ff]"
            />
          </div>

          <button
            type="submit"
            disabled={!customName.trim()}
            className="w-full py-2.5 rounded-xl bg-[#181b22] hover:bg-[#282e3b] disabled:opacity-40 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Activate Custom Identity
          </button>
        </form>

        {/* Delete Account Option */}
        {onOpenDeleteAccount && !currentUser.isGuest && currentUser.email && (
          <div className="mt-6 pt-4 border-t border-[#ece8df] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#16191f]">Account Data & Removal</div>
              <div className="text-[11px] text-[#717c8d]">Permanently delete profile and records</div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDeleteAccount();
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
