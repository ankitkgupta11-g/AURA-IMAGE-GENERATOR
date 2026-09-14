import React, { useEffect } from 'react';
import { ClerkProvider, useUser, useClerk } from '@clerk/clerk-react';
import { CLERK_PUBLISHABLE_KEY, isClerkConfigured } from '../lib/clerkConfig';
import { UserProfile } from '../types';
import { safeParseJson } from '../lib/apiUtils';

interface ClerkWrapperProps {
  children: React.ReactNode;
}

interface ClerkSyncProps {
  currentUser: UserProfile;
  onSyncUser: (user: UserProfile) => void;
  onLogout: () => void;
}

export const ClerkSyncBridge: React.FC<ClerkSyncProps> = ({
  currentUser,
  onSyncUser,
  onLogout,
}) => {
  if (!isClerkConfigured) {
    return null;
  }
  return <ClerkSyncBridgeInner currentUser={currentUser} onSyncUser={onSyncUser} onLogout={onLogout} />;
};

const ClerkSyncBridgeInner: React.FC<ClerkSyncProps> = ({
  currentUser,
  onSyncUser,
  onLogout,
}) => {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress || '';
      const name = user.fullName || user.username || email.split('@')[0] || 'AURA Creator';
      const avatar = user.imageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

      // Check if already synced
      if (currentUser.id === user.id && currentUser.email === email) {
        return;
      }

      // Sync with backend database to retrieve creations count & persist user
      const syncWithDb = async () => {
        try {
          const res = await fetch('/api/auth/social-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'clerk',
              email: email || `${user.id}@clerk.user`,
              name,
              avatar,
              role: 'Clerk Verified Creator',
            }),
          });

          const parsed = await safeParseJson(res);
          const data = parsed.data;
          if (parsed.ok && data && data.success && data.data) {
            const fullProfile: UserProfile = {
              ...data.data,
              id: user.id, // Keep Clerk user id
              provider: 'clerk',
              isGuest: false,
            };
            onSyncUser(fullProfile);
            return;
          }
        } catch (err) {
          console.warn('Could not sync Clerk user with backend database:', err);
        }

        // Fallback local sync if server unreachable
        const fallbackProfile: UserProfile = {
          id: user.id,
          name,
          email,
          avatar,
          role: 'Clerk Verified Creator',
          creationsCount: currentUser.creationsCount || 0,
          favoritesCount: currentUser.favoritesCount || 0,
          provider: 'clerk',
          isGuest: false,
        };
        onSyncUser(fallbackProfile);
      };

      syncWithDb();
    } else if (!isSignedIn && currentUser.provider === 'clerk') {
      onLogout();
    }
  }, [isLoaded, isSignedIn, user?.id]);

  return null;
};

export const ClerkWrapper: React.FC<ClerkWrapperProps> = ({ children }) => {
  if (!isClerkConfigured) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#3052ff',
          colorText: '#181b22',
          borderRadius: '1rem',
          fontFamily: 'inherit',
        },
        elements: {
          card: 'shadow-spatial rounded-3xl border border-[#dedad0] bg-white',
          formButtonPrimary: 'bg-[#181b22] hover:bg-[#2c3340] text-white rounded-xl text-xs font-semibold py-2.5',
          headerTitle: 'font-display text-[#16191f] font-bold text-xl',
          headerSubtitle: 'text-xs text-[#525d6f]',
          socialButtonsBlockButton: 'rounded-xl border border-[#dedad0] hover:bg-[#f6f5f0] text-xs font-medium',
          dividerLine: 'bg-[#dedad0]',
          dividerText: 'text-[10px] font-mono text-[#8a95a6] uppercase tracking-wider',
          formFieldInput: 'rounded-xl border-[#dedad0] focus:border-[#3052ff] text-xs',
          formFieldLabel: 'text-xs font-medium text-[#2d3442]',
          footerActionLink: 'text-[#3052ff] hover:underline text-xs font-medium',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
};
