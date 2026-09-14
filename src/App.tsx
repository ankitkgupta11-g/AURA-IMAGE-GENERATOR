import React, { useState, useEffect } from 'react';
import { ActiveTab, Generation, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { GenerationStudio } from './components/GenerationStudio';
import { PersonalGallery } from './components/PersonalGallery';
import { CommunityExplore } from './components/CommunityExplore';
import { DashboardView } from './components/DashboardView';
import { ImageDetailModal } from './components/ImageDetailModal';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { Footer } from './components/Footer';
import { ClerkSyncBridge } from './components/ClerkWrapper';
import { INITIAL_GENERATIONS } from './constants/mockArt';
import { 
  subscribeToAuthChanges, 
  subscribeToUserGenerations, 
  logoutFirebase, 
  saveGenerationToFirestore 
} from './lib/authService';
import { safeParseJson } from './lib/apiUtils';

const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Guest Explorer',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  role: 'Guest Creator',
  creationsCount: 0,
  favoritesCount: 0,
  isGuest: true,
};

const getStoredUser = (): UserProfile => {
  try {
    const savedUser = localStorage.getItem('aura_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed && parsed.id && parsed.name) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not restore user session:', e);
  }
  return GUEST_USER;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredUser);
  const [generations, setGenerations] = useState<Generation[]>(INITIAL_GENERATIONS);
  const [selectedArtwork, setSelectedArtwork] = useState<Generation | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Pre-fill state when remixing from gallery/landing to studio
  const [studioPrompt, setStudioPrompt] = useState<string>('');
  const [studioStyle, setStudioStyle] = useState<string>('Cinematic');

  // Fetch initial generations from backend
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery');
        const parsed = await safeParseJson(res);
        const json = parsed.data;
        if (parsed.ok && json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setGenerations(json.data);
        }
      } catch (err) {
        console.warn('Using local curated collection:', err);
      }
    };
    fetchGallery();
  }, []);

  // Real-time Firebase Authentication State Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        setCurrentUser(user);
        try {
          localStorage.setItem('aura_user', JSON.stringify(user));
        } catch {
          // ignore
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for personal creations
  useEffect(() => {
    if (!currentUser || currentUser.isGuest || !currentUser.id) return;

    const unsubscribe = subscribeToUserGenerations(currentUser.id, (userGens) => {
      if (userGens.length > 0) {
        setGenerations((prev) => {
          const existingIds = new Set(userGens.map((g) => g.id));
          const otherGens = prev.filter((g) => !existingIds.has(g.id));
          return [...userGens, ...otherGens];
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser?.id, currentUser?.isGuest]);

  // Handler for Start Creating action (auth-gated)
  const handleStartCreate = () => {
    if (currentUser.isGuest || !currentUser.email) {
      setAuthNotice('Please sign in or create an account to start creating artwork in the Studio. Your creations will be saved to your private gallery.');
      setActiveTab('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab('studio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle Sign Out
  const handleLogout = async () => {
    try {
      await logoutFirebase();
      localStorage.removeItem('aura_user');
      localStorage.removeItem('aura_token');
    } catch (e) {
      // ignore
    }
    setCurrentUser(GUEST_USER);
    setAuthNotice(null);
    setActiveTab('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Account Deletion Success
  const handleDeleteAccountSuccess = async () => {
    try {
      await logoutFirebase();
      localStorage.removeItem('aura_user');
      localStorage.removeItem('aura_token');
    } catch (e) {
      // ignore
    }
    setCurrentUser(GUEST_USER);
    setIsDeleteModalOpen(false);
    setAuthNotice(null);
    setActiveTab('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When a new user logs in or registers successfully
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('aura_user', JSON.stringify(user));
    } catch (e) {
      // ignore
    }
    setAuthNotice(null);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When a new generation is created in studio
  const handleGenerationCreated = (newGen: Generation) => {
    setGenerations((prev) => [newGen, ...prev]);
    setCurrentUser((prev) => ({
      ...prev,
      creationsCount: (prev.creationsCount || 0) + 1,
    }));

    // Persist real-time to Cloud Firestore
    if (currentUser && !currentUser.isGuest && currentUser.id) {
      saveGenerationToFirestore(newGen, currentUser.id).catch((err) => {
        console.warn('Could not sync creation to Firestore:', err);
      });
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (id: string) => {
    setGenerations((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const nextState = !g.isFavorite;
          return { ...g, isFavorite: nextState };
        }
        return g;
      })
    );

    if (selectedArtwork && selectedArtwork.id === id) {
      setSelectedArtwork((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }

    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Failed to sync favorite with server:', err);
    }
  };

  // Toggle publish
  const handleTogglePublish = async (id: string, isPublic: boolean) => {
    setGenerations((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isPublic } : g))
    );

    if (selectedArtwork && selectedArtwork.id === id) {
      setSelectedArtwork((prev) => (prev ? { ...prev, isPublic } : null));
    }

    try {
      await fetch('/api/gallery/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPublic }),
      });
    } catch (err) {
      console.error('Failed to sync publish with server:', err);
    }
  };

  // Delete generation
  const handleDeleteGeneration = async (id: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id));
    if (selectedArtwork && selectedArtwork.id === id) {
      setSelectedArtwork(null);
    }
    try {
      await fetch('/api/gallery/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Failed to delete generation:', err);
    }
  };

  // Like artwork in community
  const handleLikeArtwork = async (id: string) => {
    setGenerations((prev) =>
      prev.map((g) => (g.id === id ? { ...g, likes: (g.likes || 0) + 1 } : g))
    );
    try {
      await fetch('/api/gallery/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Failed to like artwork on server:', err);
    }
  };

  // Remix prompt: loads into studio (auth-checked)
  const handleRemixPrompt = (prompt: string, style: string) => {
    setStudioPrompt(prompt);
    setStudioStyle(style);
    if (currentUser.isGuest || !currentUser.email) {
      setAuthNotice('Please sign in or create an account to start creating artwork in the Studio. Your selected prompt is ready to remix!');
      setActiveTab('auth');
    } else {
      setActiveTab('studio');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#191d24] font-sans antialiased flex flex-col selection:bg-[#3052ff]/15 selection:text-[#3052ff]">
      {/* Clerk User Synchronization Bridge */}
      <ClerkSyncBridge
        currentUser={currentUser}
        onSyncUser={handleLoginSuccess}
        onLogout={handleLogout}
      />
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenDeleteAccount={() => setIsDeleteModalOpen(true)}
        onStartCreate={handleStartCreate}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            setActiveTab={setActiveTab}
            featuredArtworks={generations}
            onSelectArtwork={setSelectedArtwork}
            onRemixPrompt={handleRemixPrompt}
            onStartCreate={handleStartCreate}
          />
        )}

        {activeTab === 'auth' && (
          <AuthPage
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            authNotice={authNotice}
            onOpenDeleteAccount={() => setIsDeleteModalOpen(true)}
          />
        )}

        {activeTab === 'studio' && (
          <GenerationStudio
            currentUser={currentUser}
            onGenerationCreated={handleGenerationCreated}
            onOpenDetail={setSelectedArtwork}
            initialPrompt={studioPrompt}
            initialStyle={studioStyle}
            onRequireAuth={handleStartCreate}
          />
        )}

        {activeTab === 'gallery' && (
          <PersonalGallery
            generations={generations}
            onSelectArtwork={setSelectedArtwork}
            onToggleFavorite={handleToggleFavorite}
            onDeleteGeneration={handleDeleteGeneration}
            onTogglePublish={handleTogglePublish}
            onRemixPrompt={handleRemixPrompt}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'explore' && (
          <CommunityExplore
            artworks={generations}
            onSelectArtwork={setSelectedArtwork}
            onRemixPrompt={handleRemixPrompt}
            setActiveTab={setActiveTab}
            onLikeArtwork={handleLikeArtwork}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            generations={generations}
            onSelectArtwork={setSelectedArtwork}
            onRemixPrompt={handleRemixPrompt}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* Modals */}
      <ImageDetailModal
        artwork={selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        onToggleFavorite={handleToggleFavorite}
        onTogglePublish={handleTogglePublish}
        onRemixPrompt={handleRemixPrompt}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSelectUser={(user) => {
          handleLoginSuccess(user);
        }}
        onNavigateToAuth={() => {
          setIsAuthOpen(false);
          setActiveTab('auth');
        }}
        onOpenDeleteAccount={() => {
          setIsAuthOpen(false);
          setIsDeleteModalOpen(true);
        }}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        currentUser={currentUser}
        onAccountDeleted={handleDeleteAccountSuccess}
      />

    </div>
  );
}
