import React from 'react';
import { Generation, UserProfile, ActiveTab } from '../types';
import { Sparkles, Heart, Layers, Eye, Grid, ArrowRight, Share2, Clock } from 'lucide-react';

interface DashboardViewProps {
  currentUser: UserProfile;
  generations: Generation[];
  onSelectArtwork: (art: Generation) => void;
  onRemixPrompt: (prompt: string, style: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  generations,
  onSelectArtwork,
  onRemixPrompt,
  setActiveTab,
}) => {
  const userGenerations = generations.filter((g) => g.userId === currentUser.id);
  const favorites = userGenerations.filter((g) => g.isFavorite);
  const publicCount = userGenerations.filter((g) => g.isPublic).length;
  const totalViews = userGenerations.reduce((sum, g) => sum + (g.views || 0), 0);

  // Recent prompts list
  const recentPrompts = Array.from(new Set(userGenerations.map((g) => g.prompt))).slice(0, 4);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* User Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#dedad0] shadow-spatial mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#3052ff]/20 shadow-spatial"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#15181e] tracking-tight">
                {currentUser.name}
              </h1>
              <span className="text-[10px] font-mono uppercase bg-[#3052ff]/10 text-[#3052ff] px-2 py-0.5 rounded font-bold border border-[#3052ff]/20">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-[#636c7c] mt-1 font-normal">
              {currentUser.email} • Creative Studio Member
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('studio')}
            className="flex items-center gap-2 px-5 py-3 bg-[#181b22] hover:bg-[#282e3b] text-white text-xs font-semibold rounded-full shadow-spatial transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#8ca3ff]" />
            <span>Launch New Creation</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
        <div className="p-5 rounded-3xl bg-white border border-[#dedad0] shadow-spatial">
          <div className="flex items-center justify-between text-[#687284] mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Creations</span>
            <Grid className="w-4 h-4 text-[#3052ff]" />
          </div>
          <div className="font-display text-3xl font-extrabold text-[#15181e]">
            {userGenerations.length}
          </div>
          <p className="text-[11px] text-[#717b8c] mt-1">Generated this month</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#dedad0] shadow-spatial">
          <div className="flex items-center justify-between text-[#687284] mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Favorites</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-display text-3xl font-extrabold text-[#15181e]">
            {favorites.length}
          </div>
          <p className="text-[11px] text-[#717b8c] mt-1">Starred masterpieces</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#dedad0] shadow-spatial">
          <div className="flex items-center justify-between text-[#687284] mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Public</span>
            <Share2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display text-3xl font-extrabold text-[#15181e]">
            {publicCount}
          </div>
          <p className="text-[11px] text-[#717b8c] mt-1">In community gallery</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#dedad0] shadow-spatial">
          <div className="flex items-center justify-between text-[#687284] mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Audience</span>
            <Eye className="w-4 h-4 text-[#3052ff]" />
          </div>
          <div className="font-display text-3xl font-extrabold text-[#15181e]">
            {totalViews}
          </div>
          <p className="text-[11px] text-[#717b8c] mt-1">Total artwork impressions</p>
        </div>
      </div>

      {/* Recent Generations Strip */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-[#15181e]">
            Recent Generations
          </h2>
          <button
            onClick={() => setActiveTab('gallery')}
            className="text-xs font-semibold text-[#3052ff] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all in gallery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {userGenerations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {userGenerations.slice(0, 4).map((gen) => (
              <div
                key={gen.id}
                onClick={() => onSelectArtwork(gen)}
                className="group relative rounded-2xl overflow-hidden bg-white border border-[#dedad0] shadow-spatial cursor-pointer"
              >
                <div className="aspect-square overflow-hidden bg-[#faf9f6]">
                  <img
                    src={gen.imageUrl}
                    alt={gen.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 bg-white">
                  <p className="text-xs font-medium text-[#1c2128] truncate">{gen.prompt}</p>
                  <p className="text-[10px] font-mono text-[#737d8e] mt-0.5">{gen.style}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-white border border-[#dedad0]">
            <p className="text-xs text-[#6e7788]">No generations yet. Start in the Studio!</p>
          </div>
        )}
      </div>

      {/* Recently Used Prompts */}
      {recentPrompts.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-[#dedad0] shadow-spatial">
          <h3 className="font-display text-base font-bold text-[#15181e] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#3052ff]" />
            <span>Recently Composed Prompts</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentPrompts.map((p, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#dedad0] flex items-center justify-between gap-3"
              >
                <p className="text-xs text-[#2c3340] italic line-clamp-2">"{p}"</p>
                <button
                  onClick={() => {
                    onRemixPrompt(p, 'Cinematic');
                    setActiveTab('studio');
                  }}
                  className="shrink-0 p-2 rounded-xl bg-white hover:bg-[#f0f4ff] border border-[#dedad0] text-[#3052ff] transition-colors cursor-pointer"
                  title="Generate again"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
