import React from 'react';
import { UserButton, useUser, useClerk } from '@clerk/clerk-react';
import { isClerkConfigured } from '../lib/clerkConfig';
import { UserProfile } from '../types';
import { LogIn, Sparkles, User, ChevronDown } from 'lucide-react';

interface ClerkUserNavProps {
  currentUser: UserProfile;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const ClerkUserNav: React.FC<ClerkUserNavProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  if (!isClerkConfigured) {
    return null;
  }
  return <ClerkUserNavInner currentUser={currentUser} onOpenAuth={onOpenAuth} onLogout={onLogout} />;
};

const ClerkUserNavInner: React.FC<ClerkUserNavProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#e8e6df] animate-pulse" />
    );
  }

  if (isSignedIn && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#2d3442] hidden sm:inline">
          {user.fullName || user.firstName || 'Creator'}
        </span>
        <div className="rounded-full ring-2 ring-[#3052ff]/20">
          <UserButton 
            afterSignOutUrl="/" 
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-8 h-8 rounded-full',
              }
            }}
          />
        </div>
      </div>
    );
  }

  // If signed in locally (e.g. demo) while Clerk is configured
  if (!currentUser.isGuest) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#2d3442] hidden sm:inline">
          {currentUser.name.split(' ')[0]}
        </span>
        <button
          onClick={onLogout}
          className="p-1 rounded-full bg-[#f0eee7] border border-[#dedad0] hover:bg-[#e7e4dc] text-xs text-[#525e70] px-2.5 py-1"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Not signed in
  return (
    <button
      onClick={onOpenAuth}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#3052ff] hover:bg-[#2040e0] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
    >
      <LogIn className="w-3.5 h-3.5" />
      <span>Sign In</span>
    </button>
  );
};
