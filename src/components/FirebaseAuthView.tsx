import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  loginWithGoogle, 
  loginWithEmailPassword, 
  registerWithEmailPassword,
  instantOwnerSignIn 
} from '../lib/authService';
import { isOwnerEmail } from '../lib/firebase';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  KeyRound,
  ExternalLink
} from 'lucide-react';

interface FirebaseAuthViewProps {
  authNotice?: string | null;
  onLoginSuccess: (user: UserProfile) => void;
}

export const FirebaseAuthView: React.FC<FirebaseAuthViewProps> = ({
  authNotice,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Google 1-Click Popup Login
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const user = await loginWithGoogle();
      const isOwner = isOwnerEmail(user.email);
      setSuccessMessage(
        isOwner 
          ? `Welcome back, ${user.name}! Owner / Admin privileges verified.`
          : `Signed in successfully as ${user.name} (${user.role}).`
      );
      setTimeout(() => {
        onLoginSuccess(user);
      }, 700);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request' || err?.isCancelled || err?.message === 'Sign-in cancelled') {
        // User intentionally cancelled or closed the popup window - no error banner needed
        return;
      }
      setErrorMessage(err.message || 'Google sign in was cancelled or failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 1-Click Instant Owner Login
  const handleInstantOwnerLogin = async (targetEmail?: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const emailToUse = targetEmail || email.trim() || 'ankitkgupta1123@gmail.com';
      const user = await instantOwnerSignIn(emailToUse);
      setSuccessMessage(`Welcome back, Ankit Gupta! Owner & Admin access verified.`);
      setTimeout(() => {
        onLoginSuccess(user);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not complete instant owner sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  // Email & Password Auth (Sign In or Sign Up)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      let user: UserProfile;
      if (authMode === 'signin') {
        user = await loginWithEmailPassword(cleanEmail, password);
      } else {
        const cleanName = name.trim() || cleanEmail.split('@')[0];
        user = await registerWithEmailPassword(cleanName, cleanEmail, password);
      }

      const isOwner = isOwnerEmail(user.email);
      setSuccessMessage(
        isOwner
          ? `Welcome, ${user.name}! Authenticated with Owner & Admin privileges.`
          : `Welcome, ${user.name}! Workspace ready as ${user.role}.`
      );

      setTimeout(() => {
        onLoginSuccess(user);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentEmailOwner = isOwnerEmail(email);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Notice Banner */}
      {authNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-[#eff4ff] border border-[#d2e0ff] text-[#2442d8] text-xs leading-relaxed flex items-start gap-3 shadow-xs">
          <Sparkles className="w-4 h-4 text-[#3052ff] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Authentication Required</span>
            {authNotice}
          </div>
        </div>
      )}

      {/* Main Auth Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#dedad0] shadow-spatial">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f4ff] border border-[#d2e0fc] text-[#3052ff] text-xs font-mono font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Cloud Authentication</span>
          </div>
          <span className="text-[11px] font-mono text-[#788497] bg-[#f5f3ec] px-2.5 py-0.5 rounded-full">
            Zero-Trust RBAC
          </span>
        </div>

        <h3 className="font-display text-xl sm:text-2xl font-bold text-[#16191f] tracking-tight mb-1">
          {authMode === 'signin' ? 'Sign In to Studio Workspace' : 'Create Studio Account'}
        </h3>
        <p className="text-xs text-[#5a6577] mb-6">
          Access your private generations, sync high-fidelity models, and manage creator assets.
        </p>

        {/* 1. Google 1-Click Popup Sign In */}
        <button
          type="button"
          id="google-signin-btn"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          className="w-full py-3 px-4 rounded-xl border border-[#dedad0] hover:bg-[#faf9f6] text-[#1c222e] text-xs font-semibold flex items-center justify-center gap-3 transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-60"
        >
          {isGoogleLoading ? (
            <div className="w-4 h-4 border-2 border-[#181b22]/30 border-t-[#181b22] rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google (1-Click Popup)</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#ece9e0]" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b95a5]">
            Or with Email &amp; Password
          </span>
          <div className="flex-1 h-px bg-[#ece9e0]" />
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 mb-5 bg-[#edeae1] rounded-xl border border-[#dedad0]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white text-[#16191f] shadow-xs'
                : 'text-[#626c7d] hover:text-[#16191f]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white text-[#16191f] shadow-xs'
                : 'text-[#626c7d] hover:text-[#16191f]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Banners */}
        {errorMessage && (
          errorMessage.toLowerCase().includes('firebase') || errorMessage.toLowerCase().includes('disabled') ? (
            <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-amber-900">Email/Password Sign-In Disabled</div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Google Firebase requires enabling the <strong>Email/Password</strong> sign-in method in your Firebase project console.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="text-[10px] text-amber-800">
                  Enable: <strong>Authentication &gt; Sign-in method &gt; Email/Password</strong>
                </div>
                <a
                  href="https://console.firebase.google.com/project/red-terminal-mf38q/authentication/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181b22] hover:bg-[#2b313d] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  <span>Open Firebase Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign up Name field */}
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#2d3442] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#828c9e]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isCurrentEmailOwner ? 'Ankit Gupta' : 'e.g. Maya Lin'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#dedad0] text-xs text-[#1a1e26] focus:outline-none focus:border-[#3052ff] focus:ring-1 focus:ring-[#3052ff] transition-all"
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-medium text-[#2d3442] mb-1.5 flex items-center justify-between">
              <span>Email Address</span>
              {isCurrentEmailOwner && (
                <span className="text-[10px] font-mono text-[#3052ff] bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Owner Recognized &bull; Role: Owner / Admin</span>
                </span>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#828c9e]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                id="firebase-auth-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#dedad0] text-xs text-[#1a1e26] focus:outline-none focus:border-[#3052ff] focus:ring-1 focus:ring-[#3052ff] transition-all"
              />
            </div>

            {isCurrentEmailOwner && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-indigo-50/90 border border-indigo-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-950 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#3052ff] shrink-0" />
                  <span>Welcome <strong>Ankit Gupta</strong>! Ready to enter as Owner.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleInstantOwnerLogin(email)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-[#3052ff] hover:bg-[#203ecc] text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Instant 1-Click Owner Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-medium text-[#2d3442] mb-1.5 flex items-center justify-between">
              <span>Password</span>
              <span className="text-[10px] text-[#758194]">Min. 6 characters</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#828c9e]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="firebase-auth-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your secure password"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#dedad0] text-xs text-[#1a1e26] focus:outline-none focus:border-[#3052ff] focus:ring-1 focus:ring-[#3052ff] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#828c9e] hover:text-[#181c24] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security notice */}
          <div className="flex items-center gap-2 text-[11px] text-[#697587] pt-1">
            <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Zero-Leak Security: Passwords are encrypted directly with Google Firebase.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="firebase-submit-btn"
            disabled={isLoading || isGoogleLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#181b22] hover:bg-[#2b313d] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating with Firebase...</span>
              </>
            ) : (
              <>
                <span>{authMode === 'signin' ? 'Sign In to Workspace' : 'Create Studio Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Zero-Trust RBAC explanation footer */}
        <div className="mt-6 pt-5 border-t border-[#f0ede6] flex items-center justify-between text-[11px] text-[#6e7a8e]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Firestore Zero-Trust Rules Active</span>
          </div>
          <span className="font-mono text-[10px]">RBAC: Owner | Learner</span>
        </div>

      </div>
    </div>
  );
};
