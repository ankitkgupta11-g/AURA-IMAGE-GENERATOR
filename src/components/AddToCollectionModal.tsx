import React, { useState, useEffect } from 'react';
import { Generation, MoodboardCollection } from '../types';
import {
  getCollections,
  createCollection,
  toggleArtworkInCollection,
} from '../lib/collectionsManager';
import {
  X,
  Plus,
  Check,
  FolderPlus,
  Layers,
  Sparkles,
  Palette,
} from 'lucide-react';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: Generation | null;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  isOpen,
  onClose,
  artwork,
}) => {
  const [collections, setCollections] = useState<MoodboardCollection[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCollections(getCollections());
      setIsCreatingNew(false);
      setNewTitle('');
      setNewDesc('');
    }
  }, [isOpen]);

  if (!isOpen || !artwork) return null;

  const handleToggle = (colId: string) => {
    toggleArtworkInCollection(colId, artwork.id);
    setCollections(getCollections());
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newCol = createCollection(newTitle, newDesc, '#3052ff', artwork.imageUrl);
    toggleArtworkInCollection(newCol.id, artwork.id);
    setCollections(getCollections());
    setIsCreatingNew(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#dedad0] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#dedad0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3052ff]/10 text-[#3052ff] flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#181b22]">
                Save to Moodboard
              </h3>
              <p className="text-[11px] text-[#6d7789]">
                Organize into thematic moodboards and client collections
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#eae7de] text-[#6b7587] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Artwork summary strip */}
        <div className="my-4 p-2.5 rounded-2xl bg-[#faf9f6] border border-[#dedad0] flex items-center gap-3">
          <img
            src={artwork.imageUrl}
            alt={artwork.prompt}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-xl object-cover border border-[#dedad0]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#181b22] truncate">
              {artwork.prompt}
            </p>
            <span className="text-[10px] font-mono text-[#626d7f]">
              {artwork.style} &bull; {artwork.aspectRatio}
            </span>
          </div>
        </div>

        {/* Collections List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {collections.map((col) => {
            const isIncluded = col.generationIds.includes(artwork.id);
            return (
              <div
                key={col.id}
                onClick={() => handleToggle(col.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  isIncluded
                    ? 'bg-[#eff4ff] border-[#3052ff] shadow-xs'
                    : 'bg-white border-[#dedad0] hover:border-[#3052ff]/40 hover:bg-[#faf9f6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 border border-[#dedad0] shrink-0">
                    <img
                      src={col.coverImage || artwork.imageUrl}
                      alt={col.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#181b22]">
                      {col.name}
                    </h4>
                    <span className="text-[10px] text-[#6e788a]">
                      {col.generationIds.length} items
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isIncluded
                      ? 'bg-[#3052ff] border-[#3052ff] text-white'
                      : 'border-[#dedad0] bg-white text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Create new collection block */}
        {!isCreatingNew ? (
          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            className="mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-[#dedad0] hover:border-[#3052ff] text-xs font-semibold text-[#3052ff] hover:bg-[#f0f4ff] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Moodboard</span>
          </button>
        ) : (
          <form onSubmit={handleCreateNew} className="mt-4 p-3 rounded-2xl bg-[#f0f4ff] border border-[#d2e0ff] space-y-2 animate-in fade-in duration-150">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Moodboard name (e.g. Neo-Brutalist Architecture)"
              className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#c5d6ff] focus:outline-none focus:ring-2 focus:ring-[#3052ff]"
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Short description (optional)"
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#c5d6ff] focus:outline-none focus:ring-2 focus:ring-[#3052ff]"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3 py-1.5 text-xs text-[#525f75] hover:text-[#181b22]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#3052ff] hover:bg-[#2040e0] text-white"
              >
                Save & Add
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-[#dedad0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-[#181b22] text-white text-xs font-semibold hover:bg-[#2c3340] cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
