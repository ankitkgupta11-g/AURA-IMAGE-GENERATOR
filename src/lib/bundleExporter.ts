import JSZip from 'jszip';
import { Generation } from '../types';

/**
 * Downloads a single image file to the user's browser.
 */
export const downloadSingleImage = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Creates and downloads a complete Creative Bundle (.zip):
 * - High-res image file (PNG / WebP)
 * - metadata.json (Prompt, Enhanced Prompt, Negative Prompt, Seed, Style, Quality, Aspect Ratio, AI Engine)
 * - README_LICENSE.txt (Commercial rights & spatial attribution)
 */
export const exportCreativeBundle = async (
  artwork: Generation,
  onProgress?: (msg: string) => void
): Promise<void> => {
  if (onProgress) onProgress('Preparing creative metadata bundle...');
  const zip = new JSZip();

  const baseFileName = `aura-${artwork.style.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${artwork.id}`;

  // 1. Comprehensive Metadata JSON
  const metadata = {
    schemaVersion: '2.0.0',
    artworkId: artwork.id,
    title: artwork.prompt.slice(0, 60),
    creationTimestamp: artwork.createdAt,
    creator: {
      id: artwork.userId,
      name: artwork.userName,
    },
    synthesisConfig: {
      prompt: artwork.prompt,
      enhancedPrompt: artwork.enhancedPrompt || artwork.prompt,
      negativePrompt: artwork.negativePrompt || 'None specified',
      stylePreset: artwork.style,
      aspectRatio: artwork.aspectRatio,
      qualityPreset: artwork.quality,
      sourceType: artwork.sourceType,
      provider: artwork.provider || 'AURA Spatial Engine (Google Gemini 3.1 Flash Image)',
    },
    metrics: {
      views: artwork.views || 1,
      likes: artwork.likes || 0,
      isPublic: artwork.isPublic,
    },
    exportDate: new Date().toISOString(),
    rights: 'Generated via AURA Creative Studio. Full commercial and personal rights granted to creator.',
  };

  zip.file(`${baseFileName}-metadata.json`, JSON.stringify(metadata, null, 2));

  // 2. Attribution & License text
  const licenseText = `=====================================================
AURA CREATIVE STUDIO - PRODUCTION ARTIFACT BUNDLE
=====================================================

Artwork ID: ${artwork.id}
Created: ${artwork.createdAt}
Style Preset: ${artwork.style}
Aspect Ratio: ${artwork.aspectRatio}
Model Engine: ${artwork.provider || 'Google Gemini 3.1 Flash Image / Neural Synthesis'}

PRIMARY PROMPT:
${artwork.prompt}

ENHANCED PROMPT:
${artwork.enhancedPrompt || artwork.prompt}

NEGATIVE PROMPT:
${artwork.negativePrompt || 'N/A'}

COMMERCIAL & ARTISTIC RIGHTS:
Full usage, modification, and reproduction rights belong to ${artwork.userName}.
Preserve metadata for verifiable spatial provenance.
https://ai.studio/build
=====================================================`;

  zip.file('README_PROVENANCE.txt', licenseText);

  // 3. Fetch image binary and include in ZIP
  try {
    if (onProgress) onProgress('Bundling high-res artwork binary...');
    if (artwork.imageUrl.startsWith('data:image/')) {
      const parts = artwork.imageUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      const ext = mime.includes('webp') ? 'webp' : 'png';
      zip.file(`${baseFileName}.${ext}`, parts[1], { base64: true });
    } else {
      const response = await fetch(artwork.imageUrl);
      const blob = await response.blob();
      const ext = artwork.imageUrl.endsWith('.webp') ? 'webp' : 'png';
      zip.file(`${baseFileName}.${ext}`, blob);
    }
  } catch (err) {
    console.warn('Direct binary bundle error, adding reference locator:', err);
    zip.file('IMAGE_LOCATOR_URL.txt', `Artwork URL: ${artwork.imageUrl}\nGenerated: ${artwork.createdAt}`);
  }

  if (onProgress) onProgress('Compressing archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // 4. Trigger download
  const blobUrl = URL.createObjectURL(zipBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = `${baseFileName}-bundle.zip`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(blobUrl);

  if (onProgress) onProgress('Download complete!');
};
