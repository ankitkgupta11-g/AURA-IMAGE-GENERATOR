import React, { useState } from 'react';
import { Hero3DCanvas } from './Hero3DCanvas';
import { Generation, ActiveTab } from '../types';
import { Sparkles, ArrowRight, Wand2, Eye, Compass, Cpu, Sliders, Shield, Copy, Check, PenTool, Layers, Share2 } from 'lucide-react';
import { safeParseJson } from '../lib/apiUtils';

interface LandingPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  featuredArtworks: Generation[];
  onSelectArtwork: (art: Generation) => void;
  onRemixPrompt: (prompt: string, style: string) => void;
  onStartCreate?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setActiveTab,
  featuredArtworks,
  onSelectArtwork,
  onRemixPrompt,
  onStartCreate,
}) => {
  // Interactive Prompt Enhancer Demo State
  const [demoInput, setDemoInput] = useState('sculptural titanium monolith in nordic fjord');
  const [demoEnhanced, setDemoEnhanced] = useState(
    'A massive sculptural titanium monolith hovering motionless over an icy Nordic fjord at dawn, atmospheric morning mist drifting across glacial waters, minimalist Scandinavian composition, 8k resolution, photorealistic Hasselblad medium format capture, diffuse polar sunlight.'
  );
  const [isEnhancingDemo, setIsEnhancingDemo] = useState(false);
  const [copiedDemo, setCopiedDemo] = useState(false);

  const samplePrompts = [
    { title: 'Nordic Monolith', text: 'sculptural titanium monolith in nordic fjord' },
    { title: 'Liquid Chrome', text: 'editorial portrait draped in liquid chrome silk' },
    { title: 'Prismatic Sculpture', text: 'kinetic glass sculpture with titanium rings in studio' },
    { title: 'Kyoto Teapot', text: 'minimalist wabi-sabi teapot on charcoal slate' },
  ];

  const handleRunDemoEnhancement = async (text: string) => {
    setDemoInput(text);
    setIsEnhancingDemo(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, style: 'Cinematic' }),
      });
      const parsed = await safeParseJson(res);
      const data = parsed.data;
      if (data && data.success && data.data?.enhancedPrompt) {
        setDemoEnhanced(data.data.enhancedPrompt);
      }
    } catch (e) {
      setDemoEnhanced(
        `A pristine, studio-calibrated visual of ${text}, rendered with volumetric lighting, micro-surface reflections, balanced rule-of-thirds composition, and authentic optical lens clarity.`
      );
    } finally {
      setIsEnhancingDemo(false);
    }
  };

  const handleCopyDemo = () => {
    navigator.clipboard.writeText(demoEnhanced);
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-20 md:pt-14 md:pb-28 overflow-hidden">
        {/* Subtle architectural grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#1c2128 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Headline and CTAs */}
            <div className="lg:col-span-6 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eeece5] border border-[#dedad0] text-xs font-mono text-[#434b58] mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3052ff]" />
                <span className="font-semibold tracking-wider text-xs">Generative 3D Studio</span>
                <span className="text-[#a0a8b4]">/</span>
                <span className="text-[#677182] text-xs">v2.4 Spatial Release</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#15181e] tracking-tight leading-[1.08] mb-6">
                Turn imagination <br />
                <span className="text-[#3052ff]">into imagery.</span>
              </h1>

              <p className="text-lg text-[#555e6f] leading-relaxed max-w-xl mb-9 font-normal">
                Create original, high-fidelity visuals from natural language using AI-powered image generation.
                A refined spatial studio crafted for digital artists, designers, and creative directors.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  id="hero-start-creating-btn"
                  onClick={() => {
                    if (onStartCreate) {
                      onStartCreate();
                    } else {
                      setActiveTab('studio');
                    }
                  }}
                  className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#171a21] hover:bg-[#282f3c] text-white text-sm font-semibold rounded-full shadow-spatial hover:shadow-spatial-lg transition-all duration-300 group cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#8ca3ff] group-hover:rotate-12 transition-transform duration-300" />
                  <span>Start Creating</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  id="hero-explore-gallery-btn"
                  onClick={() => setActiveTab('explore')}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent hover:bg-[#eae8e0] text-[#424b5a] hover:text-[#171a21] text-sm font-medium rounded-full border border-[#d5d0c4] transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#5c6577]" />
                  <span>Explore Gallery</span>
                </button>
              </div>

              {/* Studio Metrics / Provenance */}
              <div className="mt-12 pt-8 border-t border-[#1c2128]/8 grid grid-cols-3 gap-6">
                <div>
                  <div className="font-display text-2xl font-bold text-[#171a21]">4K Ultra</div>
                  <div className="text-xs text-[#6e7789] mt-0.5 font-medium">Native Resolution</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-[#171a21]">12+</div>
                  <div className="text-xs text-[#6e7789] mt-0.5 font-medium">Curated Aesthetics</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-[#171a21]">Gemini 3.1</div>
                  <div className="text-xs text-[#6e7789] mt-0.5 font-medium">Spatial Image Engine</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Interactive Spatial Artifact */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="w-full relative">
                {/* 3D WebGL Canvas */}
                <Hero3DCanvas />

                {/* Floating Architectural Spatial Badges */}
                <div className="absolute bottom-4 left-4 p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-[#1c2128]/10 shadow-spatial max-w-xs transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3052ff]" />
                    <span className="text-xs font-semibold text-[#181b22]">Tactile Depth Engine</span>
                  </div>
                  <p className="text-xs text-[#525b6c] leading-relaxed">
                    Interactive perspective cards and WebGL viewport calculate ray-traced spatial depth in real-time.
                  </p>
                </div>

                <div className="absolute top-4 right-4 p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-[#1c2128]/10 shadow-spatial hidden sm:flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#171a21] text-white flex items-center justify-center font-mono text-xs">
                    AI
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#181b22]">Gemini Flash Image</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Online & Ready</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. LIVE AI PROMPT ENHANCER DEMO SECTION */}
      <section className="py-16 md:py-20 bg-[#f0eee7]/60 border-y border-[#dedad0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-xs font-mono font-bold tracking-wider text-[#3052ff] mb-3 inline-block">
              Intelligent Prompt Augmentation
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#15181e] tracking-tight">
              From raw thought to cinematic composition.
            </h2>
            <p className="mt-3 text-base text-[#5a6475]">
              Our built-in Gemini Prompt Director translates concise ideas into multi-layered visual instructions, specifying lighting, optics, materials, and depth.
            </p>
          </div>

          {/* Interactive Card */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#dedad0] shadow-spatial-lg p-6 sm:p-8">
            
            {/* Quick Sample Selector */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#6c7689] font-medium shrink-0">Try an idea:</span>
              <div className="flex flex-wrap items-center gap-2">
                {samplePrompts.map((item) => {
                  const isCurrent = demoInput.toLowerCase() === item.text.toLowerCase();
                  return (
                    <button
                      key={item.title}
                      onClick={() => handleRunDemoEnhancement(item.text)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-[#181b22] text-white border-[#181b22] shadow-xs font-semibold'
                          : 'bg-white hover:bg-[#f0eee7] text-[#343b48] hover:text-[#181b22] border-[#d5d0c4] shadow-xs hover:shadow'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-[#8ca3ff]' : 'bg-[#3052ff]/60'}`} />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Original Raw Prompt */}
              <div className="p-5 rounded-2xl bg-[#faf9f6] border border-[#e8e6df] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#6e7789] font-semibold">
                      Raw User Input
                    </span>
                    <span className="text-xs text-[#8e98aa]">Prompt</span>
                  </div>
                  <p className="text-sm font-medium text-[#1c2128] italic">
                    "{demoInput}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#e8e6df] flex items-center">
                  <button
                    id="enhance-demo-btn"
                    onClick={() => handleRunDemoEnhancement(demoInput)}
                    disabled={isEnhancingDemo}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-transparent hover:bg-[#ebe8e0] text-[#1c2128] border border-[#d5d0c4] text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isEnhancingDemo ? 'animate-spin text-[#3052ff]' : 'text-[#3052ff]'}`} />
                    <span>{isEnhancingDemo ? 'Synthesizing Prompt...' : 'Enhance with Gemini'}</span>
                  </button>
                </div>
              </div>

              {/* Gemini AI Enhanced Output */}
              <div className="p-5 rounded-2xl bg-[#f4f7ff] border border-[#d6e0ff] flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3052ff]" />
                      <span className="text-xs font-mono uppercase tracking-wider text-[#3052ff] font-bold">
                        Enhanced Prompt
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3052ff]/10 text-[#3052ff] font-semibold">
                      Gemini 3.8 Flash
                    </span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-[#202634] leading-relaxed font-normal">
                    {demoEnhanced}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#dce5ff] flex items-center gap-3">
                  <button
                    onClick={() => {
                      onRemixPrompt(demoEnhanced, 'Cinematic');
                      setActiveTab('studio');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#171a21] hover:bg-[#2b323e] text-white text-xs font-semibold rounded-xl shadow-spatial transition-all duration-200 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#8ca3ff]" />
                    <span>Use in Studio</span>
                  </button>

                  <button
                    onClick={handleCopyDemo}
                    className="p-2.5 rounded-xl bg-white hover:bg-[#f0f4ff] border border-[#d6e0ff] text-[#3052ff] transition-colors cursor-pointer"
                    title="Copy Prompt"
                  >
                    {copiedDemo ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#3052ff]" />}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (4 STEPS) */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-mono font-bold tracking-wider text-[#3052ff] mb-3 inline-block">
              Creative Workflow
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#15181e] tracking-tight">
              An intuitive path from vision to masterpiece.
            </h2>
            <p className="mt-3 text-base text-[#5a6475]">
              Four seamless steps that take you from initial raw thought to professional, gallery-grade spatial imagery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white border border-[#dedad0] shadow-spatial hover:shadow-spatial-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-[#f3f1eb] text-[#1c2128] font-mono text-xs font-bold flex items-center justify-center border border-[#dedad0]">
                    01
                  </div>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
                    <PenTool className="w-4 h-4 text-[#717b8c]" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-[#171a21] mb-2">
                  Describe Your Vision
                </h3>
                <p className="text-sm text-[#5d6677] leading-relaxed">
                  Enter your creative concept in natural language, whether a simple noun phrase or a detailed photographic brief.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#f0eee7] flex items-center gap-1.5 text-xs text-[#717b8c] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3052ff]" />
                <span>Text Prompting</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white border border-[#dedad0] shadow-spatial hover:shadow-spatial-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-[#f3f1eb] text-[#1c2128] font-mono text-xs font-bold flex items-center justify-center border border-[#dedad0]">
                    02
                  </div>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
                    <Wand2 className="w-4 h-4 text-[#717b8c]" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-[#171a21] mb-2">
                  Enhance with AI
                </h3>
                <p className="text-sm text-[#5d6677] leading-relaxed">
                  Click Enhance to have Gemini automatically expand your prompt with lighting, framing, lens optics, and rich micro-textures.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#f0eee7] flex items-center gap-1.5 text-xs text-[#717b8c] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3052ff]" />
                <span>Gemini Flash Co-Pilot</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white border border-[#dedad0] shadow-spatial hover:shadow-spatial-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-[#f3f1eb] text-[#1c2128] font-mono text-xs font-bold flex items-center justify-center border border-[#dedad0]">
                    03
                  </div>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-[#717b8c]" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-[#171a21] mb-2">
                  Neural Generation
                </h3>
                <p className="text-sm text-[#5d6677] leading-relaxed">
                  Experience multi-stage progressive generation powered by Gemini Flash Image, outputting up to 4K ultra clarity.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#f0eee7] flex items-center gap-1.5 text-xs text-[#717b8c] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3052ff]" />
                <span>Ultra 4K Synth</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white border border-[#dedad0] shadow-spatial hover:shadow-spatial-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-[#f3f1eb] text-[#1c2128] font-mono text-xs font-bold flex items-center justify-center border border-[#dedad0]">
                    04
                  </div>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-[#717b8c]" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-[#171a21] mb-2">
                  Refine, Upscale & Share
                </h3>
                <p className="text-sm text-[#5d6677] leading-relaxed">
                  Create variations, upscale details, download lossless files, or publish to the curated community showcase.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#f0eee7] flex items-center gap-1.5 text-xs text-[#717b8c] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3052ff]" />
                <span>Lossless Export</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. FEATURE SHOWCASE */}
      <section className="py-20 bg-[#f0eee7]/70 border-t border-[#dedad0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-mono font-bold tracking-wider text-[#3052ff] mb-3 inline-block">
              Engine Capabilities
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#15181e] tracking-tight">
              A studio built without compromise.
            </h2>
            <p className="mt-3 text-base text-[#5d6677]">
              Engineered with an original design language, tactile spatial surfaces, and enterprise-grade generation APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-white border border-[#dedad0] shadow-spatial">
              <div className="w-12 h-12 rounded-2xl bg-[#faf9f6] border border-[#dedad0] flex items-center justify-center text-[#1c2128] mb-6">
                <Cpu className="w-6 h-6 text-[#3052ff]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#171a21] mb-2.5">
                Image-to-Image Synthesis
              </h3>
              <p className="text-sm text-[#5c6577] leading-relaxed">
                Upload reference drawings, sketches, or portraits and guide the transformation into completely new artistic styles with controllable fidelity.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#dedad0] shadow-spatial">
              <div className="w-12 h-12 rounded-2xl bg-[#faf9f6] border border-[#dedad0] flex items-center justify-center text-[#1c2128] mb-6">
                <Sliders className="w-6 h-6 text-[#3052ff]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#171a21] mb-2.5">
                Aspect & Style Presets
              </h3>
              <p className="text-sm text-[#5c6577] leading-relaxed">
                Precise aspect ratio controls (1:1, 4:5, 16:9, 9:16) with 12 studio-curated aesthetics ranging from Architectural brutalism to Dark Fantasy.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#dedad0] shadow-spatial">
              <div className="w-12 h-12 rounded-2xl bg-[#faf9f6] border border-[#dedad0] flex items-center justify-center text-[#1c2128] mb-6">
                <Shield className="w-6 h-6 text-[#3052ff]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#171a21] mb-2.5">
                Private by Default
              </h3>
              <p className="text-sm text-[#5c6577] leading-relaxed">
                Your generations remain exclusively yours in your personal workspace. You choose when and what to publish to the public community showcase.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. CURATED ARTWORK GALLERY PREVIEW */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4 pb-2 border-b border-[#dedad0]/60">
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-[#3052ff] mb-2 inline-block">
                Curated Exhibition
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#15181e] tracking-tight">
                Generated with AURA.
              </h2>
            </div>

            <button
              onClick={() => setActiveTab('explore')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d5d0c4] bg-white hover:bg-[#181b22] text-[#1c2128] hover:text-white text-xs font-semibold shadow-2xs hover:shadow transition-all duration-200 cursor-pointer self-start sm:self-auto mb-1"
            >
              <span>View full community gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {featuredArtworks.slice(0, 6).map((art) => (
              <div
                key={art.id}
                className="group relative rounded-3xl overflow-hidden bg-white border border-[#dedad0] shadow-spatial hover:shadow-spatial-lg transition-all duration-300"
              >
                <div 
                  className="relative aspect-4/3 overflow-hidden cursor-pointer bg-[#eceae3] rounded-t-3xl rounded-b-none"
                  onClick={() => onSelectArtwork(art)}
                >
                  <img
                    src={art.imageUrl}
                    alt={art.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out rounded-t-3xl rounded-b-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                    <div className="text-white">
                      <p className="text-xs font-semibold line-clamp-2">{art.prompt}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded">
                          {art.style}
                        </span>
                        <span className="text-[10px] text-white/80">{art.aspectRatio}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={art.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={art.userName}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-[#2d3442]">{art.userName}</span>
                  </div>

                  <button
                    onClick={() => {
                      onRemixPrompt(art.prompt, art.style);
                      if (onStartCreate) {
                        onStartCreate();
                      } else {
                        setActiveTab('studio');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] text-xs font-semibold text-[#181b22] hover:text-white bg-white hover:bg-[#181b22] border border-[#d5d0c4] hover:border-[#181b22] rounded-full shadow-2xs hover:shadow transition-all duration-200 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#3052ff] group-hover:text-white" />
                    <span>Remix</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. FINAL CTA SECTION */}
      <section className="py-20 bg-[#161920] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-mono font-bold tracking-widest text-[#8ca3ff] uppercase mb-4 inline-block">
            Launch Your Canvas
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Your next idea starts here.
          </h2>
          <p className="text-base sm:text-lg text-[#9ca7ba] max-w-2xl mx-auto mb-10 leading-relaxed">
            Enter the studio and experience spatial AI synthesis with real-time prompt enhancement and high-resolution rendering.
          </p>

          <button
            id="final-start-creating-btn"
            onClick={() => {
              if (onStartCreate) {
                onStartCreate();
              } else {
                setActiveTab('studio');
              }
            }}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-white hover:bg-gray-100 text-[#161920] text-sm font-bold rounded-full shadow-lg transition-transform hover:scale-105 duration-200 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#3052ff]" />
            <span>Start Creating Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
