import React, { useState, useEffect, useRef } from 'react';
import { Generation, AspectRatio, ImageQuality, UserProfile } from '../types';
import { ART_STYLES, SAMPLE_PROMPT_IDEAS } from '../data/mockArt';
import {
  Sparkles,
  Wand2,
  Download,
  Heart,
  Share2,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  X,
  UploadCloud,
  Maximize2,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Copy,
  Layers,
  ZoomIn,
  LogIn,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GenerationStudioProps {
  currentUser: UserProfile;
  onGenerationCreated: (gen: Generation) => void;
  onOpenDetail: (gen: Generation) => void;
  initialPrompt?: string;
  initialStyle?: string;
  onRequireAuth?: () => void;
}

export const GenerationStudio: React.FC<GenerationStudioProps> = ({
  currentUser,
  onGenerationCreated,
  onOpenDetail,
  initialPrompt = '',
  initialStyle = 'Cinematic',
  onRequireAuth,
}) => {
  // Input states
  const [prompt, setPrompt] = useState(initialPrompt);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showNegative, setShowNegative] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [quality, setQuality] = useState<ImageQuality>('Ultra');
  const [selectedStyle, setSelectedStyle] = useState(initialStyle);
  const [numImages, setNumImages] = useState<number>(1);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceStrength, setReferenceStrength] = useState<number>(70);

  // Enhancement states
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showEnhancementComparison, setShowEnhancementComparison] = useState(false);
  const [copiedEnhanced, setCopiedEnhanced] = useState(false);

  // Generation process states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(null);
  const [generatedBatch, setGeneratedBatch] = useState<Generation[]>([]);
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);
  const [isUpscaled, setIsUpscaled] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stages = [
    { title: 'Understanding Prompt', desc: 'Analyzing artistic direction & compositional semantics...' },
    { title: 'Composing Spatial Geometry', desc: 'Constructing camera perspective, lighting angles, and depth...' },
    { title: 'Synthesizing Neural Details', desc: 'Rendering micro-surfaces, optics, and material shaders...' },
    { title: 'Finishing High-Res Imagery', desc: 'Applying chromatic balance, tone-mapping, and sharpening...' },
  ];

  // Sync initial props if changed
  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
    if (initialStyle) setSelectedStyle(initialStyle);
  }, [initialPrompt, initialStyle]);

  // Handle Gemini Prompt Enhancement
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: selectedStyle }),
      });
      const data = await res.json();
      if (data.success && data.data?.enhancedPrompt) {
        setEnhancedPrompt(data.data.enhancedPrompt);
        setShowEnhancementComparison(true);
      }
    } catch (err) {
      console.error('Enhancement error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApplyEnhancedPrompt = () => {
    if (enhancedPrompt) {
      setPrompt(enhancedPrompt);
      setShowEnhancementComparison(false);
    }
  };

  // Keyboard shortcut (Cmd+Enter or Ctrl+Enter to generate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!isGenerating && prompt.trim()) {
          handleGenerate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prompt, enhancedPrompt, negativePrompt, aspectRatio, quality, selectedStyle, numImages, referenceImage, isGenerating]);

  // Main Generation Handler
  const handleGenerate = async () => {
    if (currentUser.isGuest || !currentUser.email) {
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }

    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setGenerationStage(0);
    setIsUpscaled(false);

    // Multi-stage visual progress simulator
    const stageTimer1 = setTimeout(() => setGenerationStage(1), 1200);
    const stageTimer2 = setTimeout(() => setGenerationStage(2), 2600);
    const stageTimer3 = setTimeout(() => setGenerationStage(3), 4200);

    try {
      const payload = {
        prompt: prompt.trim(),
        enhancedPrompt: enhancedPrompt.trim() || undefined,
        negativePrompt: negativePrompt.trim() || undefined,
        aspectRatio,
        quality,
        style: selectedStyle,
        numImages,
        referenceImage: referenceImage || undefined,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Generation failed. Please try again.');
      }

      if (json.quotaNotice) {
        setQuotaNotice(json.quotaNotice);
      } else {
        setQuotaNotice(null);
      }

      const result = json.data;
      if (Array.isArray(result)) {
        setGeneratedBatch(result);
        setSelectedBatchIndex(0);
        setCurrentGeneration(result[0]);
        setIsFavorite(result[0].isFavorite);
        setIsPublic(result[0].isPublic);
        result.forEach((g) => onGenerationCreated(g));
      } else {
        setGeneratedBatch([result]);
        setSelectedBatchIndex(0);
        setCurrentGeneration(result);
        setIsFavorite(result.isFavorite);
        setIsPublic(result.isPublic);
        onGenerationCreated(result);
      }

      // Small confetti trigger for successful generation
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3052ff', '#8ca3ff', '#ffffff'],
      });
    } catch (err: any) {
      console.error('Generation failure:', err);
      setErrorMsg(err.message || 'Something went wrong while generating your image. Please try again.');
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setIsGenerating(false);
    }
  };

  // Create Variation Handler
  const handleCreateVariation = async () => {
    if (!currentGeneration || isGenerating) return;
    setIsGenerating(true);
    setGenerationStage(1);
    try {
      const res = await fetch('/api/variation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentGeneration.id }),
      });
      const data = await res.json();
      if (data.quotaNotice) {
        setQuotaNotice(data.quotaNotice);
      }
      if (data.success && data.data) {
        const newGen = data.data;
        setCurrentGeneration(newGen);
        setGeneratedBatch([newGen, ...generatedBatch]);
        setSelectedBatchIndex(0);
        onGenerationCreated(newGen);
      }
    } catch (err) {
      console.error('Variation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!currentGeneration) return;
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentGeneration.id }),
      });
      currentGeneration.isFavorite = nextState;
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  // Toggle Publish / Share to Community
  const handleTogglePublish = async () => {
    if (!currentGeneration) return;
    const nextState = !isPublic;
    setIsPublic(nextState);
    try {
      await fetch('/api/gallery/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentGeneration.id, isPublic: nextState }),
      });
      currentGeneration.isPublic = nextState;
      if (nextState) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Publish toggle error:', err);
    }
  };

  // Download image
  const handleDownload = () => {
    if (!currentGeneration) return;
    const link = document.createElement('a');
    link.href = currentGeneration.imageUrl;
    link.download = `aura-${currentGeneration.style.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File picker handler for Image-to-Image
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPEG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setReferenceImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // Aspect ratio css sizing
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square max-w-[500px]';
      case '4:5':
        return 'aspect-4/5 max-w-[440px]';
      case '16:9':
        return 'aspect-16/9 max-w-[620px]';
      case '9:16':
        return 'aspect-9/16 max-w-[360px]';
      default:
        return 'aspect-square max-w-[500px]';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#dedad0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#15181e] tracking-tight">
              Creative Studio
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f1efe9] text-[#4f5767] border border-[#dedad0] font-semibold">
              Live Canvas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#677182] mt-1 font-normal">
            Compose prompts, guide neural style synthesis, and generate studio-grade visuals in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentGeneration && (
            <button
              onClick={() => onOpenDetail(currentGeneration)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#faf9f6] text-xs font-semibold text-[#1c2128] border border-[#dedad0] shadow-sm transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#5e6777]" />
              <span>Inspect Metadata</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ======================================================== */}
        {/* LEFT / CENTER: GENERATION CANVAS VIEWPORT (7 COLS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6c7688] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3052ff]" />
              Spatial Viewport ({aspectRatio})
            </span>

            {currentGeneration && (
              <span className="text-xs text-[#717b8c] font-medium font-mono">
                {currentGeneration.style} • {currentGeneration.quality}
              </span>
            )}
          </div>

          {/* Main Visual Stage Frame */}
          <div className="w-full flex items-center justify-center p-4 sm:p-6 rounded-3xl bg-[#efeee8] border border-[#dedad0] shadow-spatial min-h-[480px]">
            
            <div className={`relative w-full ${getAspectRatioClasses()} rounded-2xl overflow-hidden bg-[#faf9f6] border border-[#dedad0] shadow-spatial transition-all duration-300 flex items-center justify-center`}>
              
              {/* STATE 1: GENERATING STATE */}
              {isGenerating && (
                <div className="absolute inset-0 bg-[#f7f6f2] z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                  {/* Subtle 3D pulsating visual indicator */}
                  <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl bg-[#3052ff]/10 animate-ping" />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1c2128] to-[#3052ff] flex items-center justify-center shadow-spatial text-white">
                      <Wand2 className="w-7 h-7 animate-pulse text-[#b6c6ff]" />
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#161920] mb-2">
                    {stages[generationStage]?.title || 'Building image...'}
                  </h3>

                  <p className="text-xs text-[#5d6677] max-w-xs mb-6 leading-relaxed">
                    {stages[generationStage]?.desc || 'Processing neural spatial parameters...'}
                  </p>

                  {/* Multi-step progressive progress bar */}
                  <div className="w-48 h-1.5 bg-[#e3e0d5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3052ff] transition-all duration-700 ease-out"
                      style={{ width: `${((generationStage + 1) / stages.length) * 100}%` }}
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#788293]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Gemini 3.1 Flash Image Active</span>
                  </div>
                </div>
              )}

              {/* STATE 2: ERROR STATE */}
              {errorMsg && !isGenerating && (
                <div className="p-8 text-center max-w-md">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-display text-base font-bold text-[#1a1d24] mb-2">Generation Failed</h4>
                  <p className="text-xs text-[#636c7e] leading-relaxed mb-6">{errorMsg}</p>
                  <button
                    onClick={handleGenerate}
                    className="px-5 py-2.5 bg-[#191d24] hover:bg-[#2c3340] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* STATE 3: GENERATED IMAGE */}
              {currentGeneration && !isGenerating && !errorMsg && (
                <div className="relative w-full h-full group overflow-hidden">
                  <img
                    src={currentGeneration.imageUrl}
                    alt={currentGeneration.prompt}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      isUpscaled ? 'contrast-105 brightness-102' : ''
                    }`}
                  />

                  {/* Upscaled indicator */}
                  {isUpscaled && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-white font-semibold">
                      2X UPSCALED
                    </div>
                  )}

                  {/* On-image Quick Action Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onOpenDetail(currentGeneration)}
                        className="p-2 rounded-xl bg-white/80 hover:bg-white text-[#191d24] backdrop-blur-md transition-colors cursor-pointer"
                        title="View Full Detail"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <p className="text-white text-xs font-medium line-clamp-2 drop-shadow-sm mb-2">
                        {currentGeneration.prompt}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 4: EMPTY CANVAS STATE */}
              {!currentGeneration && !isGenerating && !errorMsg && (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl bg-[#f0eee7] border border-[#dedad0] flex items-center justify-center text-[#3052ff] mb-4 shadow-sm">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#191d24] mb-1.5">
                    Your canvas is waiting.
                  </h3>
                  <p className="text-xs text-[#6a7485] max-w-sm mb-6 leading-relaxed">
                    Enter an idea on the right, enhance with AI, and experience high-fidelity neural image synthesis.
                  </p>

                  <div className="w-full max-w-sm">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#8b95a5] block mb-2 font-medium">
                      Inspiration prompts
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {SAMPLE_PROMPT_IDEAS.slice(0, 3).map((idea, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPrompt(idea)}
                          className="text-left text-xs p-2.5 rounded-xl bg-white hover:bg-[#f6f5f1] border border-[#dedad0] text-[#373e4b] truncate transition-colors cursor-pointer"
                        >
                          "{idea}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Action Toolbar below viewport when generated */}
          {currentGeneration && !isGenerating && (
            <div className="w-full mt-4 p-3 rounded-2xl bg-white border border-[#dedad0] shadow-spatial flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#191d24] hover:bg-[#2c3340] text-white text-xs font-semibold transition-colors cursor-pointer"
                  title="Download Image"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isFavorite
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-[#faf9f6] border-[#dedad0] text-[#485161] hover:bg-[#f3f1ec]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-rose-600' : ''}`} />
                  <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
                </button>

                <button
                  onClick={() => setIsUpscaled(!isUpscaled)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isUpscaled
                      ? 'bg-[#3052ff]/10 border-[#3052ff]/30 text-[#3052ff]'
                      : 'bg-[#faf9f6] border-[#dedad0] text-[#485161] hover:bg-[#f3f1ec]'
                  }`}
                  title="2X Clarity Enhancement"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isUpscaled ? 'Upscaled (2X)' : 'Upscale'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateVariation}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#faf9f6] hover:bg-[#f3f1ec] text-xs font-semibold text-[#485161] border border-[#dedad0] transition-colors cursor-pointer"
                  title="Generate alternative visual angle"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Create Variation</span>
                </button>

                <button
                  onClick={handleTogglePublish}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isPublic
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-[#faf9f6] border-[#dedad0] text-[#485161] hover:bg-[#f3f1ec]'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isPublic ? 'Public in Gallery' : 'Publish to Explore'}</span>
                </button>
              </div>

            </div>
          )}

          {/* Multiple image thumbnails row if batch > 1 */}
          {generatedBatch.length > 1 && (
            <div className="w-full mt-4 flex items-center gap-3 overflow-x-auto pb-2">
              <span className="text-xs font-mono text-[#6c7688] font-semibold whitespace-nowrap">
                Variations ({generatedBatch.length}):
              </span>
              {generatedBatch.map((gen, idx) => (
                <button
                  key={gen.id}
                  onClick={() => {
                    setSelectedBatchIndex(idx);
                    setCurrentGeneration(gen);
                    setIsFavorite(gen.isFavorite);
                    setIsPublic(gen.isPublic);
                  }}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedBatchIndex === idx ? 'border-[#3052ff] scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={gen.imageUrl}
                    alt={gen.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* RIGHT: GENERATION CONTROLS DRAWER (5 COLS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Guest User Authentication Requirement Banner */}
          {(currentUser.isGuest || !currentUser.email) && (
            <div className="p-4 rounded-3xl bg-[#eff3ff] border border-[#c7d5fd] flex items-start gap-3 shadow-xs">
              <Sparkles className="w-5 h-5 text-[#3052ff] shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-bold text-[#1a2560]">Sign in required to create art</div>
                <p className="text-[11px] text-[#3e4f9b] mt-0.5 leading-relaxed">
                  Sign in or create an account to start generating visual art and save your creations to your private gallery.
                </p>
                {onRequireAuth && (
                  <button
                    type="button"
                    onClick={onRequireAuth}
                    className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#3052ff] hover:bg-[#2040e0] text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In / Create Account</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 1. Prompt Composer Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#dedad0] shadow-spatial">
            
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="prompt-input" className="text-xs font-mono uppercase tracking-wider text-[#636d7e] font-semibold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#3052ff]" />
                Prompt Composer
              </label>

              <div className="flex items-center gap-2">
                {prompt && (
                  <button
                    onClick={() => {
                      setPrompt('');
                      setEnhancedPrompt('');
                      setShowEnhancementComparison(false);
                    }}
                    className="text-[11px] text-[#7d8798] hover:text-[#1c2128] transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <span className="text-[11px] font-mono text-[#8d96a7]">
                  {prompt.length}/1000
                </span>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="relative">
              <textarea
                id="prompt-input"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What would you like to create? (e.g. Sculptural titanium monolith in Scandinavian fjord at dawn, atmospheric mist...)"
                className="w-full p-4 rounded-2xl bg-[#faf9f6] border border-[#dedad0] text-sm text-[#191d24] placeholder-[#8c96a7] focus:outline-none focus:ring-2 focus:ring-[#3052ff]/20 focus:border-[#3052ff] resize-none leading-relaxed transition-all"
              />
            </div>

            {/* Prompt Enhancer Action Button */}
            <div className="mt-3 flex items-center justify-between">
              <button
                id="enhance-prompt-btn"
                onClick={handleEnhancePrompt}
                disabled={!prompt.trim() || isEnhancing}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f0f4ff] hover:bg-[#e4edff] disabled:opacity-50 text-[#3052ff] text-xs font-semibold border border-[#d6e2ff] transition-all cursor-pointer"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Directing...' : 'Enhance with Gemini AI'}</span>
              </button>

              <span className="text-[11px] text-[#848e9f]">
                {selectedStyle} Preset
              </span>
            </div>

            {/* Enhancement Comparison Modal / Drawer inside Composer */}
            {showEnhancementComparison && enhancedPrompt && (
              <div className="mt-4 p-4 rounded-2xl bg-[#f5f8ff] border border-[#d4e1ff] animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-[#3052ff] font-bold">
                    Enhanced by Gemini Director
                  </span>
                  <button
                    onClick={() => setShowEnhancementComparison(false)}
                    className="text-[#7d8fa9] hover:text-[#1c2128]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[#283244] leading-relaxed mb-3">
                  {enhancedPrompt}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyEnhancedPrompt}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#3052ff] text-white text-xs font-semibold hover:bg-[#2040e0] transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply This Prompt</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(enhancedPrompt);
                      setCopiedEnhanced(true);
                      setTimeout(() => setCopiedEnhanced(false), 2000);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-white border border-[#d4e1ff] text-xs text-[#3052ff] hover:bg-[#f0f4ff] transition-colors cursor-pointer"
                  >
                    {copiedEnhanced ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* 2. Image-to-Image Reference Dropzone */}
          <div className="p-5 rounded-3xl bg-white border border-[#dedad0] shadow-spatial">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-[#636d7e] font-semibold flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-[#3052ff]" />
                Image-to-Image Guidance
              </span>
              <span className="text-[11px] text-[#8690a2]">Optional</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />

            {!referenceImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-2xl border-2 border-dashed border-[#dedad0] hover:border-[#3052ff]/50 bg-[#faf9f6] hover:bg-[#f3f1eb] text-center cursor-pointer transition-all duration-200"
              >
                <UploadCloud className="w-6 h-6 text-[#727c8e] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#1c2128]">
                  Upload reference image or portrait
                </p>
                <p className="text-[11px] text-[#798394] mt-0.5">
                  Drag & drop or click (PNG, JPG up to 10MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf9f6] border border-[#dedad0]">
                <img
                  src={referenceImage}
                  alt="Reference preview"
                  className="w-14 h-14 rounded-xl object-cover border border-[#dedad0]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1c2128]">Reference Active</span>
                    <button
                      onClick={() => setReferenceImage(null)}
                      className="text-[#7d8798] hover:text-red-600 transition-colors p-1"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#717b8c]">Will guide composition and palette</p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Generation Settings (Aspect, Quality, Style, Count) */}
          <div className="p-5 rounded-3xl bg-white border border-[#dedad0] shadow-spatial flex flex-col gap-4">
            
            {/* Aspect Ratio */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#636d7e] font-semibold">
                  Aspect Ratio
                </span>
                <span className="text-xs font-mono text-[#3052ff] font-medium">{aspectRatio}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(['1:1', '4:5', '16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      aspectRatio === ratio
                        ? 'bg-[#191d24] text-white border-[#191d24] shadow-sm'
                        : 'bg-[#faf9f6] text-[#424b5a] border-[#dedad0] hover:bg-[#f3f1eb]'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Curated Aesthetic Style Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#636d7e] font-semibold">
                  Aesthetic Style
                </span>
                <span className="text-xs text-[#6e7889] font-medium">{selectedStyle}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {ART_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      selectedStyle === style.id
                        ? 'bg-[#3052ff] text-white border-[#3052ff] shadow-sm'
                        : 'bg-[#faf9f6] text-[#363e4d] border-[#dedad0] hover:bg-[#f3f1eb]'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality & Batch Count */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#f0eee7]">
              <div>
                <label className="text-[11px] font-mono uppercase text-[#636d7e] font-semibold block mb-1.5">
                  Resolution
                </label>
                <div className="flex rounded-xl bg-[#faf9f6] p-1 border border-[#dedad0]">
                  {(['Standard', 'High', 'Ultra'] as ImageQuality[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                        quality === q
                          ? 'bg-white text-[#191d24] shadow-xs'
                          : 'text-[#6d7789] hover:text-[#191d24]'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#636d7e] font-semibold block mb-1.5">
                  Variations
                </label>
                <div className="flex rounded-xl bg-[#faf9f6] p-1 border border-[#dedad0]">
                  {[1, 2, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNumImages(num)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                        numImages === num
                          ? 'bg-white text-[#191d24] shadow-xs'
                          : 'text-[#6d7789] hover:text-[#191d24]'
                      }`}
                    >
                      {num} {num === 1 ? 'img' : 'imgs'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Collapsible Negative Prompt */}
            <div className="pt-2 border-t border-[#f0eee7]">
              <button
                onClick={() => setShowNegative(!showNegative)}
                className="w-full flex items-center justify-between text-xs text-[#636d7e] font-medium hover:text-[#1c2128] transition-colors py-1 cursor-pointer"
              >
                <span>Negative Prompt (Exclude attributes)</span>
                {showNegative ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showNegative && (
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="e.g. blurry, distorted face, low quality, artifacts..."
                  className="mt-2 w-full p-2.5 rounded-xl bg-[#faf9f6] border border-[#dedad0] text-xs text-[#1c2128] placeholder-[#8d97a8] focus:outline-none focus:border-[#3052ff]"
                />
              )}
            </div>

          </div>

          {/* Notices & Banners */}
          {quotaNotice && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex items-start justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5 text-amber-950">Free Tier Neural Synthesis Active</span>
                  <span className="text-amber-800/90 leading-relaxed block">{quotaNotice}</span>
                </div>
              </div>
              <button
                onClick={() => setQuotaNotice(null)}
                className="text-amber-700 hover:text-amber-950 text-xs p-1 cursor-pointer"
                aria-label="Dismiss notice"
              >
                ✕
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-rose-600 hover:text-rose-900 text-xs p-1 cursor-pointer"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          {/* 4. MASTER GENERATE ACTION BUTTON */}
          <button
            id="generate-action-btn"
            onClick={handleGenerate}
            disabled={currentUser.isGuest ? false : (!prompt.trim() || isGenerating)}
            className="relative w-full py-4 px-6 rounded-2xl bg-[#171a21] hover:bg-[#272e3b] disabled:opacity-50 text-white font-display text-base font-bold shadow-spatial-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer overflow-hidden"
          >
            {/* Shimmer animation */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {currentUser.isGuest ? (
              <>
                <LogIn className="w-5 h-5 text-[#8ca3ff] group-hover:scale-110 transition-transform" />
                <span>Sign In to Start Creating</span>
              </>
            ) : (
              <>
                <Sparkles className={`w-5 h-5 text-[#8ca3ff] ${isGenerating ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                <span>{isGenerating ? 'Synthesizing Visual...' : 'Generate Image'}</span>

                <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded bg-white/15 text-gray-200">
                  ⌘ + ↵
                </span>
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
};
