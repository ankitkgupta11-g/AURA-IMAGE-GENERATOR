import React, { useState, useRef, useEffect } from 'react';
import { Generation, UserProfile } from '../types';
import {
  X,
  Brush,
  Eraser,
  RotateCcw,
  Sparkles,
  Sliders,
  AlertCircle,
  Check,
  Wand2,
  ZoomIn,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface InpaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseArtwork: Generation | null;
  currentUser: UserProfile;
  onInpaintSuccess: (newGen: Generation) => void;
}

export const InpaintModal: React.FC<InpaintModalProps> = ({
  isOpen,
  onClose,
  baseArtwork,
  currentUser,
  onInpaintSuccess,
}) => {
  const [brushSize, setBrushSize] = useState<number>(35);
  const [toolMode, setToolMode] = useState<'brush' | 'eraser'>('brush');
  const [inpaintPrompt, setInpaintPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPainted, setHasPainted] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const baseImageRef = useRef<HTMLImageElement | null>(null);

  const SAMPLE_INPAINT_IDEAS = [
    'Add futuristic neon visor with amber reflection',
    'Replace sky with dramatic aurora borealis',
    'Add volumetric glowing particles and atmospheric mist',
    'Change background to minimalist concrete museum',
  ];

  // Initialize Canvas when modal opens or baseArtwork changes
  useEffect(() => {
    if (!isOpen || !baseArtwork) return;
    setInpaintPrompt('');
    setErrorMsg(null);
    setHasPainted(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = baseArtwork.imageUrl;
    img.onload = () => {
      baseImageRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fit display size
      const maxWidth = Math.min(window.innerWidth - 80, 720);
      const maxHeight = Math.min(window.innerHeight - 300, 520);
      let targetW = img.naturalWidth || 800;
      let targetH = img.naturalHeight || 800;

      const scale = Math.min(maxWidth / targetW, maxHeight / targetH, 1);
      canvas.width = Math.round(targetW * scale);
      canvas.height = Math.round(targetH * scale);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [isOpen, baseArtwork]);

  if (!isOpen || !baseArtwork) return null;

  // Drawing event handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    draw(e);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (toolMode === 'brush') {
      ctx.strokeStyle = 'rgba(234, 67, 53, 0.65)'; // Translucent Red Mask
      ctx.fillStyle = 'rgba(234, 67, 53, 0.65)';
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      setHasPainted(true);
    } else {
      // Eraser: redraw underlying base image segment in that area
      if (baseImageRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(baseImageRef.current, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    }
  };

  // Reset entire mask
  const handleResetMask = () => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImageRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImageRef.current, 0, 0, canvas.width, canvas.height);
    setHasPainted(false);
  };

  // Generate Inpaint Execution
  const handleRunInpaint = async () => {
    if (!inpaintPrompt.trim()) {
      setErrorMsg('Please describe what to paint into the masked area.');
      return;
    }
    if (!hasPainted) {
      setErrorMsg('Please paint over an area of the canvas to indicate the edit mask.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const canvas = canvasRef.current;
      const maskDataUrl = canvas ? canvas.toDataURL('image/png') : '';

      const res = await fetch('/api/inpaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalImageUrl: baseArtwork.imageUrl,
          maskDataUrl,
          inpaintPrompt: inpaintPrompt.trim(),
          style: baseArtwork.style,
          userId: currentUser.id,
          userName: currentUser.name,
          aspectRatio: baseArtwork.aspectRatio,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to synthesize inpainting modification.');
      }

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3052ff', '#ea4335', '#ffffff'],
      });

      onInpaintSuccess(json.data);
      onClose();
    } catch (err: any) {
      console.error('Inpaint error:', err);
      setErrorMsg(err.message || 'Inpainting failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[95vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dedad0] bg-[#faf9f6]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#3052ff]/10 text-[#3052ff] flex items-center justify-center font-bold">
              <Brush className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-bold text-[#181b22]">
                  Canvas Inpainting & Selective Editing
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3052ff]/10 text-[#3052ff] font-semibold">
                  Spatial Brush
                </span>
              </div>
              <p className="text-xs text-[#6e7889]">
                Paint a red mask over any area, describe what to synthesize, and regenerate only that section.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#eae7de] text-[#6b7587] hover:text-[#181b22] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center bg-[#13161d]">
          {/* Canvas Wrapper */}
          <div className="relative border-2 border-dashed border-white/20 rounded-2xl overflow-hidden shadow-2xl bg-black flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair block max-h-[50vh] object-contain select-none"
            />
          </div>

          {/* Floating Canvas Brush Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 p-2 bg-[#202530] border border-white/10 rounded-2xl text-white text-xs shadow-lg">
            {/* Tool Mode: Brush vs Eraser */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setToolMode('brush')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  toolMode === 'brush' ? 'bg-[#3052ff] text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Brush className="w-3.5 h-3.5" />
                <span>Mask Brush</span>
              </button>
              <button
                type="button"
                onClick={() => setToolMode('eraser')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  toolMode === 'eraser' ? 'bg-[#3052ff] text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Eraser</span>
              </button>
            </div>

            {/* Brush Size Slider */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl">
              <Sliders className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] text-gray-300">Size: {brushSize}px</span>
              <input
                type="range"
                min={10}
                max={90}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24 accent-[#3052ff] cursor-pointer"
              />
            </div>

            {/* Reset Mask */}
            <button
              type="button"
              onClick={handleResetMask}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Mask</span>
            </button>
          </div>
        </div>

        {/* Bottom Inpaint Action Panel */}
        <div className="p-4 sm:p-6 bg-[#faf9f6] border-t border-[#dedad0]">
          {errorMsg && (
            <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Idea Pills */}
          <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[10px] font-mono uppercase text-[#7a8496] whitespace-nowrap font-semibold">
              Ideas:
            </span>
            {SAMPLE_INPAINT_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInpaintPrompt(idea)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-[#dedad0] hover:border-[#3052ff] text-[#3e4757] whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                + {idea}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                id="inpaint-prompt-input"
                value={inpaintPrompt}
                onChange={(e) => setInpaintPrompt(e.target.value)}
                placeholder="What should be painted inside the red mask? (e.g. Glowing neon cyberpunk goggles, golden sunrise light...)"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#dedad0] text-xs sm:text-sm text-[#181b22] placeholder-[#7d8798] focus:outline-none focus:ring-2 focus:ring-[#3052ff]/20 focus:border-[#3052ff]"
              />
            </div>

            <button
              type="button"
              id="submit-inpaint-btn"
              onClick={handleRunInpaint}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#3052ff] hover:bg-[#2040e0] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              {isProcessing ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Inpaint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Regenerate Masked Area</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
