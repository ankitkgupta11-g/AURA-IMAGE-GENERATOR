import React, { useState, useEffect } from 'react';
import { PromptVersion, AspectRatio } from '../types';
import { getPromptHistory, clearPromptHistory } from '../lib/promptHistoryManager';
import {
  X,
  History,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Clock,
  Trash2,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface PromptHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion: (version: PromptVersion) => void;
}

export const PromptHistoryDrawer: React.FC<PromptHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onRestoreVersion,
}) => {
  const [history, setHistory] = useState<PromptVersion[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHistory(getPromptHistory());
    }

    const handleUpdate = (e: any) => {
      if (e.detail) setHistory(e.detail);
    };
    window.addEventListener('aura:prompt_history_updated', handleUpdate);
    return () => window.removeEventListener('aura:prompt_history_updated', handleUpdate);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Clear all recorded prompt versions for this studio session?')) {
      clearPromptHistory();
      setHistory([]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-full bg-[#faf9f6] shadow-2xl flex flex-col border-l border-[#dedad0] animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#dedad0] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3052ff]/10 text-[#3052ff] flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#181b22]">
                Prompt Evolution & History
              </h3>
              <p className="text-[11px] text-[#6d7789]">
                {history.length} versions tracked in this workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg text-[#7c8798] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6d7789] hover:text-[#181b22] hover:bg-[#edeae1] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Versions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#757f92]">
              <History className="w-10 h-10 text-[#a3adbf] mb-3 opacity-60" />
              <p className="text-xs font-semibold text-[#181b22] mb-1">
                No prompt history yet
              </p>
              <p className="text-[11px] leading-relaxed max-w-xs">
                As you generate or enhance prompts in the Studio, every variation and parameter branch will be recorded here for instant rewind.
              </p>
            </div>
          ) : (
            history.map((ver, idx) => (
              <div
                key={ver.id}
                className="p-3.5 rounded-2xl bg-white border border-[#dedad0] hover:border-[#3052ff]/40 shadow-xs transition-all flex flex-col gap-2.5 group"
              >
                {/* Version Title & Time */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#7a8496]">
                  <span className="font-bold text-[#3052ff] bg-[#3052ff]/10 px-2 py-0.5 rounded-md">
                    v{history.length - idx} &bull; {ver.style}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Prompt Text preview */}
                <p className="text-xs text-[#1e232d] leading-relaxed line-clamp-3">
                  {ver.prompt}
                </p>

                {/* Tags & Thumbnail if available */}
                <div className="flex items-center justify-between pt-1 border-t border-[#f1efe9]">
                  <div className="flex items-center gap-2">
                    {ver.resultImageUrl && (
                      <img
                        src={ver.resultImageUrl}
                        alt="Thumbnail"
                        className="w-8 h-8 rounded-lg object-cover border border-[#dedad0]"
                      />
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#626d7f]">
                      <span className="px-1.5 py-0.5 bg-[#f4f2ec] rounded">
                        {ver.aspectRatio}
                      </span>
                      {ver.sourceType && (
                        <span className="px-1.5 py-0.5 bg-[#eff4ff] text-[#3052ff] rounded font-semibold">
                          {ver.sourceType}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(ver.id, ver.prompt)}
                      className="p-1 rounded bg-[#faf9f6] hover:bg-[#edeae1] text-[#636e80] text-[11px] transition-colors cursor-pointer"
                      title="Copy prompt"
                    >
                      {copiedId === ver.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => {
                        onRestoreVersion(ver);
                        onClose();
                      }}
                      className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[#3052ff] hover:bg-[#2040e0] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-white border-t border-[#dedad0] text-center text-[11px] text-[#717b8c]">
          <span>Click <strong>Restore</strong> to load prompt and style directly into Studio.</span>
        </div>

      </div>
    </div>
  );
};
