import React, { useState, useEffect } from 'react';
import { ActiveTab, UserProfile } from '../types';
import { 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Layers,
  ArrowLeft,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { isClerkConfigured } from '../lib/clerkConfig';
import { ClerkAuthView } from './ClerkAuthView';

interface AuthPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
  authNotice?: string | null;
  onOpenDeleteAccount?: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
];

const PRESET_CREATORS = [
  {
    id: 'user-ankit',
    name: 'Ankit Gupta',
    role: 'Creative Director',
    email: 'ankit.gupta@aura.studio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    role: 'Spatial Artist',
    email: 'elena.rostova@aura.studio',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  },
  {
    id: 'user-marcus',
    name: 'Marcus Chen',
    role: 'Visual Architect',
    email: 'marcus.chen@aura.studio',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
];

export const AuthPage: React.FC<AuthPageProps> = ({
  setActiveTab,
  currentUser,
  onLoginSuccess,
  authNotice,
  onOpenDeleteAccount,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState('3D Spatial Artist');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showLegacyLocalForm, setShowLegacyLocalForm] = useState(false);

  // Clear messages on mode switch
  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [authMode]);

  // Handle Sign In submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signInEmail.trim() || !signInPassword) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signInEmail.trim(),
          password: signInPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Authentication failed. Check your email & password.');
      }

      const userData: UserProfile = json.data;
      if (rememberMe) {
        localStorage.setItem('aura_user', JSON.stringify(userData));
        if (userData.token) {
          localStorage.setItem('aura_token', userData.token);
        }
      }

      setSuccessMessage(`Welcome back, ${userData.name}!`);
      setTimeout(() => {
        onLoginSuccess(userData);
        setActiveTab('studio');
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signUpName.trim() || signUpName.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpName.trim(),
          email: signUpEmail.trim(),
          password: signUpPassword,
          role: signUpRole.trim() || 'Digital Creator',
          avatar: selectedAvatar,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Account registration failed.');
      }

      const userData: UserProfile = json.data;
      localStorage.setItem('aura_user', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem('aura_token', userData.token);
      }

      setSuccessMessage('Account created successfully! Preparing your studio workspace...');
      setTimeout(() => {
        onLoginSuccess(userData);
        setActiveTab('studio');
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fast Demo Login
  const handleDemoLogin = async (userId: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Demo login failed');
      }

      const userData: UserProfile = json.data;
      localStorage.setItem('aura_user', JSON.stringify(userData));
      setSuccessMessage(`Logged in as ${userData.name}`);
      setTimeout(() => {
        onLoginSuccess(userData);
        setActiveTab('studio');
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login unavailable');
    } finally {
      setIsLoading(false);
    }
  };

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
          <span>Encrypted Studio Session</span>
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
              {authMode === 'signin' 
                ? 'Welcome back to your creative spatial workspace.' 
                : 'Unlock next-generation visual generation & remixing.'}
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
              Harness Google Gemini 3.1 Flash Image models, dual-tier cloud and local persistence, and prompt director pipelines tailored for digital artists.
            </p>
          </div>

          {/* Center feature highlights */}
          <div className="relative z-10 my-8 space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-[#3052ff]/30 text-[#8ca3ff] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Smart Gemini Prompt Director</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Automated visual expansion, camera lenses, lighting rigs, and styling enhancement.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Cloud Database & Local Storage</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Sync with Neon PostgreSQL online or work completely offline with automatic filesystem storage.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Aura Neural Synthesis Fallback</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Zero quota downtime. Intelligent fallback pipeline guarantees uninterrupted generation.</p>
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
            <span>Client & server encrypted</span>
            <span className="font-mono text-gray-500">v2.4 Production</span>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-[#faf9f6]">
          {isClerkConfigured ? (
            <ClerkAuthView
              authNotice={authNotice}
              onGuestDemoLogin={onLoginSuccess}
            />
          ) : (
            <div className="space-y-6">
              <ClerkAuthView
                authNotice={authNotice}
                onGuestDemoLogin={onLoginSuccess}
              />

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowLegacyLocalForm(!showLegacyLocalForm)}
                  className="text-xs text-[#717d8e] hover:text-[#181b22] font-medium underline cursor-pointer"
                >
                  {showLegacyLocalForm ? '▲ Hide local fallback credentials' : '▼ Or use local fallback credentials'}
                </button>
              </div>

              {showLegacyLocalForm && (
                <div className="pt-6 border-t border-[#dedad0]">
                  {/* Tab Switcher: Sign In vs Sign Up */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#ece8df]">
                    <div>
                      <h2 className="font-display text-lg font-bold text-[#16191f]">
                        {authMode === 'signin' ? 'Local Studio Sign In' : 'Create Local Account'}
                      </h2>
                      <p className="text-xs text-[#6a7485] mt-0.5">
                        Fallback developer credentials stored in Neon / SQLite
                      </p>
                    </div>

                    {/* Toggle Buttons */}
                    <div className="flex p-1 bg-[#edeae1] rounded-xl border border-[#dedad0]">
                      <button
                        type="button"
                        id="tab-btn-signin"
                        onClick={() => setAuthMode('signin')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          authMode === 'signin'
                            ? 'bg-white text-[#16191f] shadow-sm'
                            : 'text-[#626c7d] hover:text-[#16191f]'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        id="tab-btn-signup"
                        onClick={() => setAuthMode('signup')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          authMode === 'signup'
                            ? 'bg-white text-[#16191f] shadow-sm'
                            : 'text-[#626c7d] hover:text-[#16191f]'
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>


          {/* Authentication Prompt Notice (e.g. when redirected from Start Creating) */}
          {authNotice && (
            <div className="mb-6 p-4 rounded-2xl bg-[#eef2ff] border border-[#c7d2fe] text-[#283593] text-xs flex items-start gap-3 shadow-xs">
              <Sparkles className="w-5 h-5 text-[#4338ca] shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-[#1e1b4b] mb-0.5">Authentication Required to Create</strong>
                <p className="leading-relaxed text-[#3730a3]">{authNotice}</p>
              </div>
            </div>
          )}

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
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono font-normal">Active</span>
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
                  <span className="text-[11px] text-[#717c8e]">Account Data & Privacy</span>
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

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form: SIGN IN MODE */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#2d3442] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#828c9e]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="signin-email-input"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="creator@aura.studio"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#dedad0] text-xs text-[#1a1e26] focus:outline-none focus:border-[#3052ff] focus:ring-1 focus:ring-[#3052ff] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#2d3442]">
                    Password
                  </label>
                  <span className="text-[11px] text-[#636f82] font-mono">
                    Demo pass: <strong className="text-[#3052ff]">aura123456</strong>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#828c9e]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signin-password-input"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
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

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#525d6f]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#dedad0] text-[#3052ff] focus:ring-[#3052ff]"
                  />
                  <span>Remember this browser</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-signin-btn"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#181b22] hover:bg-[#2b313d] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Studio Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick One-Click Demo Sign-in */}
              <div className="pt-6 mt-6 border-t border-[#ece8df]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#737f92] font-semibold block mb-2.5">
                  Or Test Instantly with Preset Creators:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESET_CREATORS.map((creator) => (
                    <button
                      key={creator.id}
                      type="button"
                      onClick={() => handleDemoLogin(creator.id)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#dedad0] hover:border-[#3052ff] hover:bg-[#f0f4ff] transition-all text-left group cursor-pointer"
                    >
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-black/5"
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[#1a1e26] truncate group-hover:text-[#3052ff]">
                          {creator.name}
                        </div>
                        <div className="text-[9px] text-[#717c8e] truncate">{creator.role.split(' ')[0]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </form>
          )}

          {/* Form: SIGN UP MODE */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#2d3442] mb-1.5">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#828c9e]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="signup-name-input"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#dedad0] text-xs text-[#1a1e26] focus:outline-none focus:border-[#3052ff] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2d3442] mb-1.5">
                    Creative Discipline / Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#828c9e]">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="signup-role-input"
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value)}
                      placeholder="e.g. 3D Matte Painter"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#dedad0] text-xs text-[#1a1e26] focus:outline-none focus:border-[#3052ff] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2d3442] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#828c9e]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="signup-email-input"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="maya.lin@studio.io"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#dedad0] text-xs text-[#1a1e26] focus:outline-none focus:border-[#3052ff] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2d3442] mb-1.5">
                  Create Password (min. 6 chars)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#828c9e]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password-input"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a secure password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#dedad0] text-xs text-[#1a1e26] focus:outline-none focus:border-[#3052ff] transition-all"
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

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-medium text-[#2d3442] mb-2">
                  Choose Profile Portrait Avatar
                </label>
                <div className="flex items-center gap-3">
                  {AVATAR_PRESETS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Avatar ${i + 1}`}
                      onClick={() => setSelectedAvatar(url)}
                      referrerPolicy="no-referrer"
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer transition-all ${
                        selectedAvatar === url
                          ? 'ring-2 ring-[#3052ff] scale-110 shadow-sm'
                          : 'opacity-70 hover:opacity-100 hover:scale-105 ring-1 ring-black/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-signup-btn"
                disabled={isLoading}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-[#3052ff] hover:bg-[#2542e0] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Creator Account & Launch Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-[#788293] text-center pt-2">
                By creating an account, you agree to Aura's Creative Studio Guidelines and local persistence terms.
              </p>
            </form>
          )}

                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
