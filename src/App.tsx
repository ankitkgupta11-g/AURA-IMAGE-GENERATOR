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
import { Footer } from './components/Footer';
import { INITIAL_GENERATIONS } from './data/mockArt';

const DEFAULT_USER: UserProfile = {
  id: 'user-ankit',
  name: 'Ankit Gupta',
  email: 'ankit.gupta@aura.studio',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  role: 'Creative Director',
  creationsCount: 18,
  favoritesCount: 6,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);
  const [generations, setGenerations] = useState<Generation[]>(INITIAL_GENERATIONS);
  const [selectedArtwork, setSelectedArtwork] = useState<Generation | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Pre-fill state when remixing from gallery/landing to studio
  const [studioPrompt, setStudioPrompt] = useState<string>('');
  const [studioStyle, setStudioStyle] = useState<string>('Cinematic');

  // Fetch initial generations from backend
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setGenerations(json.data);
          }
        }
      } catch (err) {
        console.warn('Using local curated collection:', err);
      }
    };
    fetchGallery();
  }, []);

  // When a new generation is created in studio
  const handleGenerationCreated = (newGen: Generation) => {
    setGenerations((prev) => [newGen, ...prev]);
    setCurrentUser((prev) => ({
      ...prev,
      creationsCount: prev.creationsCount + 1,
    }));
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

  // Remix prompt: loads into studio
  const handleRemixPrompt = (prompt: string, style: string) => {
    setStudioPrompt(prompt);
    setStudioStyle(style);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#191d24] font-sans antialiased flex flex-col selection:bg-[#3052ff]/15 selection:text-[#3052ff]">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            setActiveTab={setActiveTab}
            featuredArtworks={generations}
            onSelectArtwork={setSelectedArtwork}
            onRemixPrompt={handleRemixPrompt}
          />
        )}

        {activeTab === 'studio' && (
          <GenerationStudio
            currentUser={currentUser}
            onGenerationCreated={handleGenerationCreated}
            onOpenDetail={setSelectedArtwork}
            initialPrompt={studioPrompt}
            initialStyle={studioStyle}
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
        onSelectUser={setCurrentUser}
      />

    </div>
  );
}
