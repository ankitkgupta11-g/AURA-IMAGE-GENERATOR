import React, { useState, useEffect } from 'react';
import { Generation, UserProfile } from '../types';
import {
  X,
  Download,
  Heart,
  Share2,
  Sparkles,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  RefreshCw,
  Cpu,
  Layers,
  Archive,
  Brush,
  Image as ImageIcon,
} from 'lucide-react';
import { exportCreativeBundle } from '../lib/bundleExporter';
import { AddToCollectionModal } from './AddToCollectionModal';
import { InpaintModal } from './InpaintModal';

interface ImageDetailModalProps {
  artwork: Generation | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onTogglePublish: (id: string, isPublic: boolean) => void;
  onRemixPrompt: (prompt: string, style: string, referenceImage?: string) => void;
  currentUser?: UserProfile;
  onInpaintSuccess?: (newGen: Generation) => void;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  artwork,
  onClose,
  onToggleFavorite,
  onTogglePublish,
  onRemixPrompt,
  currentUser = { id: 'usr-1', name: 'Creator', email: '', avatar: '', role: '', creationsCount: 0, favoritesCount: 0 },
  onInpaintSuccess,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedEnhanced, setCopiedEnhanced] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isExportingBundle, setIsExportingBundle] = useState(false);
  const [exportProgressMsg, setExportProgressMsg] = useState('');
  const [showMoodboardModal, setShowMoodboardModal] = useState(false);
  const [showInpaintModal, setShowInpaintModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!artwork) return null;

  const handleCopy = (text: string, isEnhanced: boolean) => {
    navigator.clipboard.writeText(text);
    if (isEnhanced) {
      setCopiedEnhanced(true);
      setTimeout(() => setCopiedEnhanced(false), 2000);
    } else {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = artwork.imageUrl;
    link.download = `aura-${artwork.style.toLowerCase().replace(/\s+/g, '-')}-${artwork.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportZipBundle = async () => {
    try {
      setIsExportingBundle(true);
      await exportCreativeBundle(artwork, (msg) => setExportProgressMsg(msg));
    } catch (err) {
      console.error('Export bundle error:', err);
    } finally {
      setIsExportingBundle(false);
      setExportProgressMsg('');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-[#191d24] shadow-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: High-Res Image Display */}
        <div className="relative flex-1 bg-[#15181f] flex items-center justify-center p-4 sm:p-8 min-h-[360px] md:min-h-[500px]">
          <div className="relative max-w-full max-h-[75vh] flex items-center justify-center">
            <img
              src={artwork.imageUrl}
              alt={artwork.prompt}
              referrerPolicy="no-referrer"
              className={`max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 ${
                isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </div>

          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="absolute bottom-4 left-4 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {isZoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isZoomed ? 'Fit Screen' : 'Zoom in'}</span>
          </button>
        </div>

        {/* Right: Detailed Metadata & Action Controls */}
        <div className="w-full md:w-96 p-6 overflow-y-auto max-h-[92vh] flex flex-col justify-between bg-white">
          <div>
            
            {/* Creator profile */}
            <div className="flex items-center gap-3 pb-5 border-b border-[#f0eee7]">
              <img
                src={artwork.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={artwork.userName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-1 ring-[#16191f]/10"
              />
              <div>
                <div className="text-sm font-bold text-[#16191f]">{artwork.userName}</div>
                <div className="text-[11px] text-[#717b8c] font-mono">
                  {new Date(artwork.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Prompt details */}
            <div className="py-4 border-b border-[#f0eee7]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono uppercase text-[#697486] font-semibold">
                  Generation Prompt
                </span>
                <button
                  onClick={() => handleCopy(artwork.prompt, false)}
                  className="text-xs text-[#3052ff] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-[#1e2430] leading-relaxed font-normal bg-[#faf9f6] p-3 rounded-xl border border-[#dedad0]">
                "{artwork.prompt}"
              </p>
            </div>

            {/* Enhanced Prompt (if available) */}
            {artwork.enhancedPrompt && (
              <div className="py-4 border-b border-[#f0eee7]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono uppercase text-[#3052ff] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Enhanced Prompt
                  </span>
                  <button
                    onClick={() => handleCopy(artwork.enhancedPrompt!, true)}
                    className="text-xs text-[#3052ff] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedEnhanced ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEnhanced ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-[#2b3342] leading-relaxed bg-[#f0f4ff] p-3 rounded-xl border border-[#d6e2ff]">
                  {artwork.enhancedPrompt}
                </p>
              </div>
            )}

            {/* Technical Specifications */}
            <div className="py-4 border-b border-[#f0eee7]">
              <span className="text-xs font-mono uppercase text-[#697486] font-semibold block mb-3">
                Technical Specifications
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#faf9f6] border border-[#dedad0]">
                  <span className="text-[#7c8697] block text-[10px]">Aesthetic Style</span>
                  <span className="font-semibold text-[#181b22]">{artwork.style}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#faf9f6] border border-[#dedad0]">
                  <span className="text-[#7c8697] block text-[10px]">Aspect Ratio</span>
                  <span className="font-semibold text-[#181b22]">{artwork.aspectRatio}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#faf9f6] border border-[#dedad0]">
                  <span className="text-[#7c8697] block text-[10px]">Quality</span>
                  <span className="font-semibold text-[#181b22]">{artwork.quality}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#faf9f6] border border-[#dedad0]">
                  <span className="text-[#7c8697] block text-[10px]">AI Engine</span>
                  <span className="font-semibold text-emerald-700">Gemini Flash</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Button Row */}
          <div className="pt-4 flex flex-col gap-2">
            {/* Export Bundle & Download */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#191d24] hover:bg-[#2c3340] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG Image</span>
              </button>

              <button
                onClick={handleExportZipBundle}
                disabled={isExportingBundle}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#282e3c] hover:bg-[#394254] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Export high-res image + metadata.json bundle"
              >
                <Archive className="w-3.5 h-3.5 text-[#8ca3ff]" />
                <span>{isExportingBundle ? 'Bundling...' : 'Export ZIP'}</span>
              </button>
            </div>

            {exportProgressMsg && (
              <div className="text-[10px] font-mono text-center text-[#3052ff] animate-pulse">
                {exportProgressMsg}
              </div>
            )}

            {/* Favorite & Publish */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onToggleFavorite(artwork.id)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  artwork.isFavorite
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-[#dedad0] text-[#444d5c] hover:bg-[#faf9f6]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${artwork.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{artwork.isFavorite ? 'Favorited' : 'Favorite'}</span>
              </button>

              <button
                onClick={() => onTogglePublish(artwork.id, !artwork.isPublic)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  artwork.isPublic
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-[#dedad0] text-[#444d5c] hover:bg-[#faf9f6]'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{artwork.isPublic ? 'Unpublish' : 'Publish'}</span>
              </button>
            </div>

            {/* Inpaint & Moodboard Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowInpaintModal(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Brush className="w-3.5 h-3.5 text-amber-700" />
                <span>Canvas Inpaint</span>
              </button>

              <button
                onClick={() => setShowMoodboardModal(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#f5f3ff] hover:bg-[#ece7ff] text-[#7c3aed] border border-[#ddd6fe] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#7c3aed]" />
                <span>Moodboard</span>
              </button>
            </div>

            {/* Studio Remix (Prompt + Visual Reference) */}
            <button
              onClick={() => {
                onRemixPrompt(artwork.prompt, artwork.style, artwork.imageUrl);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#f0f4ff] hover:bg-[#e4edff] text-[#3052ff] border border-[#d6e2ff] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Remix in Studio (With Reference)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Moodboard Collection Modal */}
      {showMoodboardModal && (
        <AddToCollectionModal
          isOpen={showMoodboardModal}
          onClose={() => setShowMoodboardModal(false)}
          artwork={artwork}
        />
      )}

      {/* Inpainting Canvas Modal */}
      {showInpaintModal && (
        <InpaintModal
          isOpen={showInpaintModal}
          onClose={() => setShowInpaintModal(false)}
          baseArtwork={artwork}
          currentUser={currentUser}
          onInpaintSuccess={(newGen) => {
            if (onInpaintSuccess) onInpaintSuccess(newGen);
            setShowInpaintModal(false);
          }}
        />
      )}
    </div>
  );
};
