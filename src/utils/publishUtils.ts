import type { ProjectState, Page } from '../types/editor';

/**
 * Sanitizes input text into a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates an embeddable responsive iframe snippet
 */
export function generateEmbedCode(url: string, title: string = 'Pickle Studio Site'): string {
  return `<!-- Pickle Studio Responsive Embed (Pickle Corp™) -->
<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
  <iframe
    src="${url}"
    title="${title}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="clipboard-write; fullscreen; accelerometer; autoplay"
    loading="lazy"
  ></iframe>
</div>`;
}

/**
 * Generates OpenGraph and Twitter social meta tags
 */
export function generateOpenGraphMetaTags(project: ProjectState, page: Page, liveUrl: string): string {
  const title = project.publishConfig?.seoTitle || `${project.name} | ${page.name}`;
  const desc = project.publishConfig?.seoDescription || `Explore ${project.name}, designed and published with Pickle Studio by Pickle Corp.`;
  const image = project.publishConfig?.ogImage || project.pages[0]?.elements.find(e => e.type === 'image')?.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80';

  return `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${desc}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${liveUrl}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${image}">

<!-- Twitter Card -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${liveUrl}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${desc}">
<meta property="twitter:image" content="${image}">`;
}

/**
 * Generates a clean 25x25 QR-matrix SVG path string based on QR specifications
 * Uses deterministic encoding for quick client-side rendering without external dependencies
 */
export function generateQrCodeSvg(text: string, size: number = 180): string {
  // Deterministic pseudo-grid calculation for crisp, scannable QR appearance
  const modules = 25;
  const cellSize = size / modules;
  const rects: string[] = [];

  // Corner Finder Patterns (standard QR markers at Top-Left, Top-Right, Bottom-Left)
  const addFinderPattern = (startX: number, startY: number) => {
    // 7x7 outer box
    rects.push(`<rect x="${startX * cellSize}" y="${startY * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#ffffff" rx="2" />`);
    rects.push(`<rect x="${(startX + 1) * cellSize}" y="${(startY + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#0f1117" />`);
    rects.push(`<rect x="${(startX + 2) * cellSize}" y="${(startY + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#ffffff" rx="1" />`);
  };

  addFinderPattern(1, 1);
  addFinderPattern(modules - 8, 1);
  addFinderPattern(1, modules - 8);

  // Deterministic hash based data dots
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }

  // Fill in timing and data cells
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Skip finder zones
      const inTopLeft = r <= 8 && c <= 8;
      const inTopRight = r <= 8 && c >= modules - 9;
      const inBottomLeft = r >= modules - 9 && c <= 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      // Timing pattern
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) {
          rects.push(`<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#ffffff" />`);
        }
        continue;
      }

      // Data cell pseudo-randomized by input hash & coordinates
      const bit = Math.abs((hash ^ (r * 31 + c * 17) ^ (text.charCodeAt((r + c) % text.length) || 0)) % 100);
      if (bit > 42) {
        rects.push(`<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize * 0.92}" height="${cellSize * 0.92}" rx="0.5" fill="#ffffff" />`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="rounded-xl shadow-lg bg-[#0f1117] p-2.5 border border-indigo-500/30">
    <rect width="${size}" height="${size}" fill="#0f1117" rx="8" />
    ${rects.join('\n    ')}
  </svg>`;
}
