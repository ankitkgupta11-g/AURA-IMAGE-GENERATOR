import React, { useState, useEffect } from 'react';
import { ActiveTab, UserProfile, UserCredits } from '../types';
import { Sparkles, Layers, Compass, Grid, User, ChevronDown, Check, Zap, LogOut, LogIn, Trash2, RefreshCw, Home } from 'lucide-react';
import { isClerkConfigured } from '../lib/clerkConfig';
import { ClerkUserNav } from './ClerkUserNav';
import { getUserCredits, refillCredits } from '../lib/creditsManager';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  onOpenAuth: () => void;
  onLogout?: () => void;
  onOpenDeleteAccount?: () => void;
  onStartCreate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenDeleteAccount,
  onStartCreate,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreditsMenu, setShowCreditsMenu] = useState(false);
  const [credits, setCredits] = useState<UserCredits>(getUserCredits());

  useEffect(() => {
    const handleCredits = (e: any) => {
      if (e.detail) setCredits(e.detail);
    };
    window.addEventListener('aura:credits_updated', handleCredits);
    return () => window.removeEventListener('aura:credits_updated', handleCredits);
  }, []);

  const navItems = [
    { id: 'landing' as ActiveTab, label: 'Overview', icon: Home },
    { id: 'studio' as ActiveTab, label: 'Studio', icon: Sparkles, badge: 'AI' },
    { id: 'explore' as ActiveTab, label: 'Explore', icon: Compass },
    { id: 'gallery' as ActiveTab, label: 'My Gallery', icon: Grid },
    { id: 'dashboard' as ActiveTab, label: 'Space', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#f7f6f2]/85 border-b border-[#1c2128]/8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo with 3D aesthetic */}
        <div 
          id="brand-logo"
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a1f2c] via-[#2c3444] to-[#12151b] flex items-center justify-center text-white shadow-spatial group-hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0.5 rounded-[10px] border border-white/20" />
            <span className="font-display text-base font-extrabold tracking-wider bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">A</span>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#4361ee] rounded-full ring-2 ring-[#f7f6f2]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-[#16191f]">AURA</span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#e8e6df] text-[#555d6b] font-semibold border border-[#dcd9d0]">
                3D Spatial AI
              </span>
            </div>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-[#eeece5]/80 rounded-full border border-[#dedad0]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  if (item.id === 'studio' && onStartCreate) {
                    onStartCreate();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`relative flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 leading-normal ${
                  isActive
                    ? 'bg-white text-[#16191f] shadow-sm font-semibold'
                    : 'text-[#5d6675] hover:text-[#16191f] hover:bg-white/50'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#3052ff]' : 'text-[#7e889b]'}`} />}
                <span className="leading-none">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-[#3052ff]/10 text-[#3052ff] font-bold leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Creator Credits Token Badge */}
          <div className="relative">
            <button
              onClick={() => setShowCreditsMenu(!showCreditsMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#faf8f4] hover:bg-[#edeae1] border border-[#dedad0] text-xs font-mono transition-colors cursor-pointer leading-none"
              title="Creator Generation Credits"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              <span className="font-bold text-[#181b22]">{credits.remaining}</span>
              <span className="text-[#8b95a5]">/{credits.totalDaily}</span>
            </button>

            {showCreditsMenu && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-[#dedad0] shadow-spatial-lg p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#f1efe9]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Zap className="w-3.5 h-3.5 fill-amber-500" />
                    </div>
                    <span className="text-xs font-bold text-[#181b22]">Creator Fast Tokens</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0f4ff] text-[#3052ff] font-semibold">
                    {credits.tier}
                  </span>
                </div>

                <div className="py-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6c7689]">Remaining Today:</span>
                    <span className="font-mono font-bold text-[#181b22]">{credits.remaining} Generations</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#f0eee7] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-[#3052ff] rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (credits.remaining / credits.totalDaily) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#525b6c]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono text-[11px]">Gemini 3.1 Flash</span>
                    </div>
                    <span className="text-[11px] text-[#788293]">Daily Reset</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#f1efe9] flex items-center justify-between">
                  <button
                    onClick={() => {
                      refillCredits();
                      setShowCreditsMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#181b22] hover:bg-[#2c3340] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Instant Credit Refill</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Create Studio CTA */}
          {activeTab !== 'studio' && (
            <button
              id="header-create-btn"
              onClick={() => {
                if (onStartCreate) {
                  onStartCreate();
                } else {
                  setActiveTab('studio');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#191d24] hover:bg-[#2b323e] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8ca3ff]" />
              <span>Create</span>
            </button>
          )}

          {/* Profile & Auth Section */}
          {isClerkConfigured ? (
            <ClerkUserNav
              currentUser={currentUser}
              onOpenAuth={() => setActiveTab('auth')}
              onLogout={onLogout || (() => {})}
            />
          ) : currentUser.isGuest ? (
            <button
              onClick={() => setActiveTab('auth')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#3052ff] hover:bg-[#2040e0] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            /* User Profile dropdown */
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full bg-[#f0eee7] hover:bg-[#e7e4dc] border border-[#dedad0] transition-colors cursor-pointer"
              >
                <span className="text-xs font-medium text-[#2d3442] hidden sm:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-[#16191f]/10"
                />
                <ChevronDown className="w-3.5 h-3.5 text-[#6c7689]" />
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#16191f]/10 shadow-spatial-lg p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2.5 border-b border-[#f1efe9]">
                    <p className="text-xs font-semibold text-[#16191f]">{currentUser.name}</p>
                    <p className="text-[11px] text-[#717b8c] truncate">{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-[#f3f1ec] text-[#4f5869] px-2 py-0.5 rounded font-medium">
                        {currentUser.role}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">Active Studio</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#2c3340] hover:bg-[#f6f5f1] rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Grid className="w-3.5 h-3.5 text-[#6d778a]" />
                        My Creations
                      </span>
                      <span className="text-[11px] font-mono text-[#7b8597]">{currentUser.creationsCount}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#2c3340] hover:bg-[#f6f5f1] rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-[#6d778a]" />
                        Creative Space
                      </span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[#f1efe9] space-y-0.5">
                    <button
                      onClick={() => setActiveTab('auth')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#3052ff] hover:bg-[#f0f4ff] font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#3052ff]" />
                      Account Settings
                    </button>

                    <button
                      onClick={onOpenAuth}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#525d70] hover:text-[#16191f] hover:bg-[#f6f5f1] rounded-lg transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-[#6d778a]" />
                      Switch Creator Profile
                    </button>

                    {onLogout && (
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#525d70] hover:bg-[#f6f5f1] rounded-lg transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-[#6d778a]" />
                        Sign Out
                      </button>
                    )}

                    {onOpenDeleteAccount && (
                      <button
                        onClick={onOpenDeleteAccount}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        Delete Account
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Mobile navigation bottom bar */}
      <div className="md:hidden flex items-center justify-around py-2 px-3 bg-[#f7f6f2] border-t border-[#1c2128]/8">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon || Layers;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'studio' && onStartCreate) {
                  onStartCreate();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] ${
                isActive ? 'text-[#16191f] font-semibold' : 'text-[#6f788a]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#3052ff]' : 'text-[#8792a6]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
