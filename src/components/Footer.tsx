import React from 'react';
import { ActiveTab } from '../types';
import { Sparkles, Compass, Grid, Layers, Heart } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="w-full bg-[#eeece5] border-t border-[#dedad0] text-[#3e4654] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
              <div className="w-7 h-7 rounded-lg bg-[#181b22] text-white flex items-center justify-center font-extrabold text-xs">
                A
              </div>
              <span className="font-display text-lg font-bold text-[#161920]">AURA STUDIO</span>
            </div>
            <p className="text-xs text-[#626c7e] max-w-sm leading-relaxed mb-4">
              A high-precision 3D generative AI creative platform designed for digital artists, architectural visualization, and editorial spatial design.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-[#5b6576]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Gemini 3.1 Flash Spatial Engine Operational</span>
            </div>
          </div>

          {/* Col 2: Studio Navigation */}
          <div className="md:col-span-1.5 md:pl-2">
            <span className="text-xs font-mono uppercase font-bold text-[#1c2128] tracking-wider block mb-3">
              Platform
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('studio')}
                  className="hover:text-[#3052ff] transition-colors cursor-pointer"
                >
                  Generation Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="hover:text-[#3052ff] transition-colors cursor-pointer"
                >
                  Community Exhibition
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className="hover:text-[#3052ff] transition-colors cursor-pointer"
                >
                  Personal Archive
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="hover:text-[#3052ff] transition-colors cursor-pointer"
                >
                  Creative Space
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('auth')}
                  className="hover:text-[#3052ff] font-semibold text-[#3052ff] transition-colors cursor-pointer"
                >
                  Sign In / Create Account
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Research & Major Project */}
          <div className="md:col-span-1.5 md:pl-2">
            <span className="text-xs font-mono uppercase font-bold text-[#1c2128] tracking-wider block mb-3">
              Project Provenance
            </span>
            <ul className="space-y-2 text-xs text-[#5e6777]">
              <li>B.Tech Major Capstone Project</li>
              <li>Full-Stack Express & Vite</li>
              <li>WebGL Three.js Spatial UI</li>
              <li>Google GenAI SDK (Server-Side)</li>
              <li>Zero-Slop Architectural Design</li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-[#dedad0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#707a8b] gap-4">
          <div>
            © {new Date().getFullYear()} AURA 3D AI Creative Studio. Crafted for portfolio and production deployment.
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>Designed with</span>
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500 mx-0.5" />
            <span>and mathematical optical hierarchy</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
