import React, { useState } from 'react';
import { Generation, ActiveTab } from '../types';
import { ART_STYLES } from '../data/mockArt';
import { Search, Heart, Download, Maximize2, Sparkles, Filter, Trash2, Share2 } from 'lucide-react';

interface PersonalGalleryProps {
  generations: Generation[];
  onSelectArtwork: (art: Generation) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteGeneration: (id: string) => void;
  onTogglePublish: (id: string, isPublic: boolean) => void;
  onRemixPrompt: (prompt: string, style: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const PersonalGallery: React.FC<PersonalGalleryProps> = ({
  generations,
  onSelectArtwork,
  onToggleFavorite,
  onDeleteGeneration,
  onTogglePublish,
  onRemixPrompt,
  setActiveTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'text-to-image' | 'image-to-image'>('all');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest');

  // Filter and sort items
  const filtered = generations.filter((gen) => {
    if (filterType === 'favorites' && !gen.isFavorite) return false;
    if (filterType === 'text-to-image' && gen.sourceType !== 'text-to-image') return false;
    if (filterType === 'image-to-image' && gen.sourceType !== 'image-to-image') return false;
    if (selectedStyle !== 'All' && gen.style.toLowerCase() !== selectedStyle.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inPrompt = gen.prompt.toLowerCase().includes(q);
      const inEnhanced = gen.enhancedPrompt?.toLowerCase().includes(q);
      const inStyle = gen.style.toLowerCase().includes(q);
      if (!inPrompt && !inEnhanced && !inStyle) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'likes') {
      return (b.likes || 0) - (a.likes || 0);
    }
    // newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#15181e] tracking-tight">
              Personal Gallery
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#f1efe9] text-[#555d6c] border border-[#dedad0] font-semibold">
              {generations.length} Works
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6c7688] mt-1">
            Your private creative archive. Hover any artwork to inspect, favorite, or publish to the community showcase.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('studio')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-[#181b22] hover:bg-[#282e3b] text-white text-xs font-semibold rounded-full shadow-sm transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8ca3ff]" />
          <span>New Creation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 p-4 rounded-3xl bg-white border border-[#dedad0] shadow-spatial flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b95a6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your generations by prompt or style..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#faf9f6] border border-[#dedad0] text-xs text-[#1c2128] placeholder-[#8b95a6] focus:outline-none focus:border-[#3052ff]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'favorites', label: 'Favorites' },
            { id: 'text-to-image', label: 'Text-to-Image' },
            { id: 'image-to-image', label: 'Image-to-Image' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[#181b22] text-white'
                  : 'bg-[#faf9f6] text-[#555d6c] hover:bg-[#f0eee7] border border-[#dedad0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Style selector & Sort */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#faf9f6] border border-[#dedad0] text-xs text-[#333a46] focus:outline-none cursor-pointer"
          >
            <option value="All">All Styles</option>
            {ART_STYLES.map((st) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-[#faf9f6] border border-[#dedad0] text-xs text-[#333a46] focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>

      </div>

      {/* Artwork Grid (Masonry-like) */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((gen) => (
            <div
              key={gen.id}
              className="group relative rounded-3xl overflow-hidden bg-white border border-[#dedad0] shadow-spatial hover:shadow-spatial-lg transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Box */}
              <div
                onClick={() => onSelectArtwork(gen)}
                className="relative aspect-square overflow-hidden bg-[#faf9f6] cursor-pointer"
              >
                <img
                  src={gen.imageUrl}
                  alt={gen.prompt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                />

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded font-medium">
                    {gen.style}
                  </span>
                  {gen.isPublic && (
                    <span className="text-[10px] font-mono bg-emerald-600/85 backdrop-blur-md text-white px-2 py-0.5 rounded font-medium">
                      Public
                    </span>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(gen.id);
                      }}
                      className="p-2 rounded-xl bg-black/40 hover:bg-black/70 backdrop-blur-md transition-colors"
                      title="Favorite"
                    >
                      <Heart className={`w-4 h-4 ${gen.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectArtwork(gen);
                      }}
                      className="p-2 rounded-xl bg-black/40 hover:bg-black/70 backdrop-blur-md transition-colors"
                      title="Inspect Details"
                    >
                      <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div>
                    <p className="text-xs font-medium line-clamp-2 drop-shadow-sm mb-1">
                      {gen.prompt}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-gray-300 font-mono">
                      <span>{gen.aspectRatio} • {gen.quality}</span>
                      <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Bar */}
              <div className="p-3.5 bg-white border-t border-[#f0eee7] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTogglePublish(gen.id, !gen.isPublic)}
                    className={`text-[11px] font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      gen.isPublic
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-[#faf9f6] border-[#dedad0] text-[#555f70] hover:bg-[#f3f1ec]'
                    }`}
                  >
                    <Share2 className="w-3 h-3" />
                    <span>{gen.isPublic ? 'Unpublish' : 'Publish'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onRemixPrompt(gen.prompt, gen.style);
                      setActiveTab('studio');
                    }}
                    className="p-1.5 rounded-lg text-[#3052ff] hover:bg-[#f0f4ff] transition-colors cursor-pointer"
                    title="Remix Prompt in Studio"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Delete this artwork from your personal archive?')) {
                        onDeleteGeneration(gen.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-[#828d9e] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete generation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 text-center rounded-3xl bg-white border border-[#dedad0] shadow-spatial flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#faf9f6] border border-[#dedad0] flex items-center justify-center text-[#3052ff] mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#171a21] mb-2">
            No creations match your filter.
          </h3>
          <p className="text-xs sm:text-sm text-[#6d7789] max-w-sm mb-6">
            Try resetting your search query or generate your next masterpiece in the studio.
          </p>
          <button
            onClick={() => setActiveTab('studio')}
            className="px-6 py-3 bg-[#191d24] hover:bg-[#2c3340] text-white text-xs font-semibold rounded-full shadow-sm transition-colors cursor-pointer"
          >
            Open Creative Studio
          </button>
        </div>
      )}

    </div>
  );
};
