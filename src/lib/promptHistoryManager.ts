import { PromptVersion, AspectRatio, SourceType } from '../types';

const PROMPT_HISTORY_KEY = 'aura_prompt_version_history_v1';

export const getPromptHistory = (): PromptVersion[] => {
  try {
    const raw = localStorage.getItem(PROMPT_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return [];
};

export const savePromptHistory = (history: PromptVersion[]) => {
  try {
    localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    window.dispatchEvent(new CustomEvent('aura:prompt_history_updated', { detail: history }));
  } catch (e) {
    // ignore
  }
};

export const recordPromptVersion = (entry: {
  prompt: string;
  enhancedPrompt?: string;
  negativePrompt?: string;
  style: string;
  aspectRatio: AspectRatio;
  resultImageUrl?: string;
  sourceType?: SourceType;
  referenceImagePreview?: string;
}): PromptVersion => {
  const current = getPromptHistory();
  const newVersion: PromptVersion = {
    id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  savePromptHistory([newVersion, ...current]);
  return newVersion;
};

export const clearPromptHistory = () => {
  savePromptHistory([]);
};
