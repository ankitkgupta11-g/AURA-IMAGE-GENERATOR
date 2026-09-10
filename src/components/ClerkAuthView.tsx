import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { isClerkConfigured } from '../lib/clerkConfig';
import { UserProfile } from '../types';
import { 
  ShieldCheck, 
  Key, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Lock,
  Zap,
  Globe,
  Chrome,
  Github,
  Facebook
} from 'lucide-react';

interface ClerkAuthViewProps {
  onGuestDemoLogin?: (user: UserProfile) => void;
  authNotice?: string | null;
}

export const ClerkAuthView: React.FC<ClerkAuthViewProps> = ({
  onGuestDemoLogin,
  authNotice,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  if (isClerkConfigured) {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {authNotice && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-[#eff4ff] border border-[#d2e0ff] text-[#2442d8] text-xs leading-relaxed flex items-start gap-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#3052ff] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Authentication Required</span>
              {authNotice}
            </div>
          </div>
        )}

        {/* Tab switcher between Sign In and Sign Up */}
        <div className="w-full max-w-sm flex p-1 mb-6 bg-[#eae7de] rounded-2xl border border-[#dedad0]">
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white text-[#181b22] shadow-xs'
                : 'text-[#616c7d] hover:text-[#181b22]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white text-[#181b22] shadow-xs'
                : 'text-[#616c7d] hover:text-[#181b22]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Clerk Sign In / Sign Up Card */}
        <div className="w-full flex justify-center clerk-auth-container">
          {authMode === 'signin' ? (
            <SignIn 
              routing="hash"
              signUpUrl="#signup"
            />
          ) : (
            <SignUp 
              routing="hash"
              signInUrl="#signin"
            />
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-[#717d8e]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Powered by Clerk Authentication &bull; Enterprise Grade Security</span>
        </div>
      </div>
    );
  }

  // When VITE_CLERK_PUBLISHABLE_KEY is not yet configured
  return (
    <div className="w-full max-w-lg mx-auto">
      {authNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-[#eff4ff] border border-[#d2e0ff] text-[#2442d8] text-xs leading-relaxed flex items-start gap-3 shadow-xs">
          <Sparkles className="w-4 h-4 text-[#3052ff] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Authentication Required</span>
            {authNotice}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dedad0] shadow-spatial">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f4ff] border border-[#d2e0fc] text-[#3052ff] text-xs font-mono font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Clerk Authentication</span>
          </div>
          <span className="text-[11px] font-mono text-[#788497] bg-[#f5f3ec] px-2.5 py-0.5 rounded-full">
            Ready to Connect
          </span>
        </div>

        <h3 className="font-display text-xl sm:text-2xl font-bold text-[#16191f] tracking-tight mb-2">
          Connect your Clerk Project
        </h3>
        <p className="text-xs sm:text-sm text-[#5a6577] mb-6 leading-relaxed">
          AURA Creative Studio uses <strong>Clerk</strong> for secure, modern identity management supporting Google, GitHub, Facebook, passwordless magic links, and passkeys.
        </p>

        {/* Steps to activate */}
        <div className="space-y-3 mb-6 p-4 rounded-2xl bg-[#faf9f6] border border-[#dedad0]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#737e90] font-semibold block mb-1">
            Setup in 2 Simple Steps:
          </span>

          <div className="flex items-start gap-3 text-xs text-[#2b3341]">
            <div className="w-5 h-5 rounded-full bg-[#3052ff] text-white flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 font-bold">
              1
            </div>
            <div>
              <div className="font-medium text-[#16191f]">Get your Clerk Publishable Key</div>
              <div className="text-[11px] text-[#697587] mt-0.5">
                Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-[#3052ff] underline font-medium inline-flex items-center gap-0.5">Clerk Dashboard <ExternalLink className="w-3 h-3" /></a> &rarr; <strong>API Keys</strong> and copy your key (starts with <code className="bg-[#edeae1] px-1 py-0.2 rounded font-mono text-[10px]">pk_test_...</code>).
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-[#2b3341]">
            <div className="w-5 h-5 rounded-full bg-[#181b22] text-white flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 font-bold">
              2
            </div>
            <div>
              <div className="font-medium text-[#16191f]">Set VITE_CLERK_PUBLISHABLE_KEY</div>
              <div className="text-[11px] text-[#697587] mt-0.5">
                In project settings or environment variables, set <code className="bg-[#edeae1] px-1.5 py-0.5 rounded font-mono text-[10px]">VITE_CLERK_PUBLISHABLE_KEY</code>.
              </div>
            </div>
          </div>
        </div>

        {/* Available Providers once activated */}
        <div className="mb-6">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#737e90] font-semibold block mb-2.5">
            Supported SSO & Social Logins with Clerk:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-[#faf9f6] border border-[#dedad0] flex items-center justify-center gap-2 text-xs text-[#2b3341] font-medium">
              <Chrome className="w-4 h-4 text-[#ea4335]" />
              <span>Google</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#faf9f6] border border-[#dedad0] flex items-center justify-center gap-2 text-xs text-[#2b3341] font-medium">
              <Github className="w-4 h-4 text-[#24292f]" />
              <span>GitHub</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#faf9f6] border border-[#dedad0] flex items-center justify-center gap-2 text-xs text-[#2b3341] font-medium">
              <Facebook className="w-4 h-4 text-[#1877f2]" />
              <span>Facebook</span>
            </div>
          </div>
        </div>

        {/* Quick Sandbox / Instant Demo Access Button */}
        {onGuestDemoLogin && (
          <div className="pt-4 border-t border-[#ede9e0]">
            <button
              type="button"
              id="clerk-instant-demo-btn"
              onClick={() => {
                onGuestDemoLogin({
                  id: 'usr-clerk-demo-01',
                  name: 'Ankit Gupta',
                  email: 'ankitkgupta1123@gmail.com',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                  role: 'AURA Creative Architect',
                  creationsCount: 12,
                  favoritesCount: 7,
                  provider: 'clerk-sandbox',
                  isGuest: false,
                });
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#181b22] hover:bg-[#2b313d] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#8ca3ff]" />
              <span>Test Studio with Demo Account (Ankit Gupta)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center text-[#7e8a9d] mt-2">
              Allows immediate exploration while configuring your Clerk Dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
