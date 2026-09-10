export type AspectRatio = '1:1' | '4:5' | '16:9' | '9:16';
export type ImageQuality = 'Standard' | 'High' | 'Ultra';
export type GenerationStatus = 'pending' | 'generating' | 'completed' | 'failed';
export type SourceType = 'text-to-image' | 'image-to-image' | 'variation';

export interface Generation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  prompt: string;
  enhancedPrompt?: string;
  negativePrompt?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  style: string;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  status: GenerationStatus;
  provider: string;
  createdAt: string;
  isFavorite: boolean;
  isPublic: boolean;
  likes: number;
  views: number;
  sourceType: SourceType;
  sourceImage?: string;
  variations?: string[];
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  creationsCount: number;
  favoritesCount: number;
  joinedDate?: string;
  token?: string;
  isGuest?: boolean;
  provider?: string;
}

export interface GenerationConfig {
  prompt: string;
  enhancedPrompt?: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  style: string;
  numImages: number;
  referenceImage?: string; // base64 or URL
  strength?: number;
}

export interface GenerationStage {
  id: number;
  title: string;
  description: string;
}

export interface PromptVersion {
  id: string;
  timestamp: string;
  prompt: string;
  enhancedPrompt?: string;
  negativePrompt?: string;
  style: string;
  aspectRatio: AspectRatio;
  resultImageUrl?: string;
  sourceType?: SourceType;
  referenceImagePreview?: string;
}

export interface MoodboardCollection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  colorTheme?: string;
  generationIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface UserCredits {
  remaining: number;
  totalDaily: number;
  lastRefreshed: string;
  tier: 'Creator Free' | 'Pro Studio' | 'Enterprise';
}

export interface InpaintParams {
  originalImageUrl: string;
  maskDataUrl: string;
  inpaintPrompt: string;
  style?: string;
  userId?: string;
  userName?: string;
}

export type ActiveTab = 'landing' | 'studio' | 'gallery' | 'explore' | 'dashboard' | 'features' | 'about' | 'auth';
