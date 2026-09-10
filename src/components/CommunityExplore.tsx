import React, { useState } from 'react';
import { Generation, ActiveTab } from '../types';
import { ART_STYLES } from '../constants/mockArt';
import { Search, Heart, Sparkles, Compass, Flame, Clock, ThumbsUp, Eye, Share2, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CommunityExploreProps {
  artworks: Generation[];
  onSelectArtwork: (art: Generation) => void;
  onRemixPrompt: (prompt: string, style: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onLikeArtwork: (id: string) => void;
}

export const CommunityExplore: React.FC<CommunityExploreProps> = ({
  artworks,
  onSelectArtwork,
  onRemixPrompt,
  setActiveTab,
  onLikeArtwork,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'trending' | 'latest' | 'top'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = !!likedMap[id];
    setLikedMap((prev) => ({ ...prev, [id]: !isLiked }));
    onLikeArtwork(id);

    if (!isLiked) {
      confetti({
        particleCount: 20,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#ff4d6d', '#ff758f', '#ffffff'],
      });
    }
  };

  // Filter public and curated artworks
  const publicArtworks = artworks.filter((art) => art.isPublic);

  const filtered = publicArtworks.filter((art) => {
    if (selectedStyle !== 'All' && art.style.toLowerCase() !== selectedStyle.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPrompt = art.prompt.toLowerCase().includes(q);
      const matchUser = art.userName.toLowerCase().includes(q);
      const matchStyle = art.style.toLowerCase().includes(q);
      if (!matchPrompt && !matchUser && !matchStyle) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (activeSubTab === 'latest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (activeSubTab === 'top') {
      return (b.likes || 0) - (a.likes || 0);
    }
    // trending (blend of likes + recentness)
    const scoreA = (a.likes || 0) * 2 + (a.views || 0);
    const scoreB = (b.likes || 0) * 2 + (b.views || 0);
    return scoreB - scoreA;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eeece5] border border-[#dedad0] text-xs font-mono text-[#434b58] mb-3">
            <Compass className="w-3.5 h-3.5 text-[#3052ff]" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">Global Exhibition</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#15181e] tracking-tight">
            Explore Community Art
          </h1>
          <p className="text-sm text-[#616b7d] mt-1.5 max-w-xl">
            Discover cutting-edge spatial renders, prompt compositions, and neural artwork created by digital artists worldwide.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('studio')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#181b22] hover:bg-[#282e3b] text-white text-xs font-semibold rounded-full shadow-spatial transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8ca3ff]" />
            <span>Create Artwork</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Subtabs, Search, Style */}
      <div className="mb-8 p-4 rounded-3xl bg-white border border-[#dedad0] shadow-spatial flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Navigation Subtabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f5f4ef] rounded-2xl border border-[#dedad0]">
          <button
            onClick={() => setActiveSubTab('trending')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'trending'
                ? 'bg-white text-[#181b22] shadow-sm'
                : 'text-[#636c7e] hover:text-[#181b22]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Trending</span>
          </button>

          <button
            onClick={() => setActiveSubTab('latest')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'latest'
                ? 'bg-white text-[#181b22] shadow-sm'
                : 'text-[#636c7e] hover:text-[#181b22]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#3052ff]" />
            <span>Latest</span>
          </button>

          <button
            onClick={() => setActiveSubTab('top')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'top'
                ? 'bg-white text-[#181b22] shadow-sm'
                : 'text-[#636c7e] hover:text-[#181b22]'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5 text-rose-500" />
            <span>Most Liked</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a94a5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompt, artist, or style..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#faf9f6] border border-[#dedad0] text-xs text-[#1c2128] placeholder-[#8a94a5] focus:outline-none focus:border-[#3052ff]"
          />
        </div>

        {/* Style Dropdown */}
        <div>
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-[#faf9f6] border border-[#dedad0] text-xs font-medium text-[#363e4b] focus:outline-none cursor-pointer"
          >
            <option value="All">All Aesthetic Styles</option>
            {ART_STYLES.map((st) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Artwork Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {sorted.map((art) => {
            const isLiked = !!likedMap[art.id];
            const currentLikes = (art.likes || 0) + (isLiked ? 1 : 0);

            return (
              <div
                key={art.id}
                className="group relative rounded-3xl overflow-hidden bg-white border border-[#dedad0] shadow-spatial hover:shadow-spatial-lg transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container */}
                <div
                  onClick={() => onSelectArtwork(art)}
                  className="relative aspect-4/3 overflow-hidden bg-[#faf9f6] cursor-pointer"
                >
                  <img
                    src={art.imageUrl}
                    alt={art.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                  />

                  {/* Aesthetic tag */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-mono uppercase bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded font-medium">
                      {art.style}
                    </span>
                  </div>

                  {/* Interactive Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white">
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => handleLike(art.id, e)}
                        className={`p-2 rounded-xl backdrop-blur-md transition-colors cursor-pointer ${
                          isLiked ? 'bg-rose-600 text-white' : 'bg-black/40 hover:bg-black/70 text-white'
                        }`}
                        title="Like Artwork"
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div>
                      <p className="text-xs font-semibold line-clamp-2 drop-shadow-sm mb-1.5">
                        "{art.prompt}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-gray-300 font-mono">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-gray-400" />
                          {art.views || 142} views
                        </span>
                        <span>{art.aspectRatio}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Creator info + Remix CTA */}
                <div className="p-4 bg-white flex items-center justify-between border-t border-[#f0eee7]">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={art.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={art.userName}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-[#16191f]/10"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#181b22]">{art.userName}</div>
                      <div className="text-[10px] text-[#717b8c] font-mono flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                        <span>{currentLikes}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onRemixPrompt(art.prompt, art.style);
                      setActiveTab('studio');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0f4ff] hover:bg-[#e4edff] text-[#3052ff] text-xs font-semibold border border-[#d6e2ff] transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Remix</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-white border border-[#dedad0] shadow-spatial">
          <p className="text-sm text-[#616b7c]">No community creations found for this filter.</p>
        </div>
      )}

    </div>
  );
};
