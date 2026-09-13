import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { FirebaseAuthView } from './FirebaseAuthView';

interface AuthPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
  authNotice?: string | null;
  onOpenDeleteAccount?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  setActiveTab,
  currentUser,
  onLoginSuccess,
  authNotice,
  onOpenDeleteAccount,
}) => {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      
      {/* Top Breadcrumb Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setActiveTab('landing')}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#636f82] hover:text-[#181c24] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#525d6f]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Firebase &amp; Firestore Zero-Trust Auth</span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white border border-[#dedad0] shadow-spatial-lg overflow-hidden">
        
        {/* Left Side: Creative Identity & Showcase Feature Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#181b22] via-[#212631] to-[#121419] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle geometric ambient accents */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#3052ff]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#6c5ce7]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-gray-200">AURA Studio Platform</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Production Identity &amp; Role-Based Access Control
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
              Secure Cloud Firestore real-time sync with strict zero-leak credentials and dual authentication: Google 1-Click Popup or Email &amp; Password.
            </p>
          </div>

          {/* Center feature highlights */}
          <div className="relative z-10 my-8 space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-[#3052ff]/30 text-[#8ca3ff] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">RBAC Hierarchy</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Owner / Admin privileges for designated owner accounts; Student / Learner access for all other creators.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Cloud Firestore Database</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Real-time database sync for creations, model preferences, and personal creative asset libraries.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Zero-Leak Security</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Direct Firebase SDK token exchanges with zero sensitive passwords leaked in client bundles.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
            <span>Firebase Auth SDK &bull; Firestore</span>
            <span className="font-mono text-gray-500">v3.0 Production</span>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-[#faf9f6]">
          {/* Active Logged In Session Card */}
          {currentUser && !currentUser.isGuest && currentUser.email && (
            <div className="mb-6 p-4 rounded-2xl bg-white border border-[#dedad0] shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-black/10"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#181c24] flex items-center gap-1.5">
                      <span>{currentUser.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-medium">
                        {currentUser.role || 'Active'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#616c7f]">{currentUser.email}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('studio')}
                  className="px-4 py-2 rounded-xl bg-[#181b22] hover:bg-[#2b313d] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Launch Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {onOpenDeleteAccount && (
                <div className="mt-3 pt-3 border-t border-[#f0eee7] flex items-center justify-between">
                  <span className="text-[11px] text-[#717c8e]">Account Data &amp; Privacy</span>
                  <button
                    type="button"
                    onClick={onOpenDeleteAccount}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Primary Firebase Authentication */}
          <FirebaseAuthView
            authNotice={authNotice}
            onLoginSuccess={(user) => {
              onLoginSuccess(user);
              setActiveTab('studio');
            }}
          />
        </div>

      </div>

    </div>
  );
};
