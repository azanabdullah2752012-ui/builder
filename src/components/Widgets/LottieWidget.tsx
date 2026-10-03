import React, { useState } from 'react';
import type { CanvasElement } from '../../types/editor';

export const LOTTIE_PRESETS = [
  {
    id: 'confetti',
    name: 'Party Confetti',
    url: 'https://assets2.lottiefiles.com/packages/lf20_u4yrau.json',
  },
  {
    id: 'success',
    name: 'Checkmark Success',
    url: 'https://assets9.lottiefiles.com/packages/lf20_jbrw3hcz.json',
  },
  {
    id: 'rocket',
    name: 'Rocket Launch',
    url: 'https://assets5.lottiefiles.com/packages/lf20_6wutsrox.json',
  },
  {
    id: 'loading',
    name: 'Infinity Pulse',
    url: 'https://assets10.lottiefiles.com/packages/lf20_usmfx6bp.json',
  },
];

interface LottieWidgetProps {
  element: CanvasElement;
  isInteractive?: boolean;
}

export const LottieWidget: React.FC<LottieWidgetProps> = ({
  element,
  isInteractive = true,
}) => {
  const config = element.lottieConfig || {
    url: 'https://assets2.lottiefiles.com/packages/lf20_u4yrau.json',
    autoplay: true,
    loop: true,
    speed: 1,
    trigger: 'autoplay',
  };

  const [isHovered, setIsHovered] = useState(false);
  const s = element.styles || {};
  const animationUrl = config.url || LOTTIE_PRESETS[0].url;

  // We embed using an interactive, isolated player
  const playerHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; }
          lottie-player { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <lottie-player
          src="${animationUrl}"
          background="transparent"
          speed="${config.speed || 1}"
          style="width: 100%; height: 100%;"
          ${config.loop ? 'loop' : ''}
          ${config.autoplay || (config.trigger === 'hover' && isHovered) ? 'autoplay' : ''}
        ></lottie-player>
      </body>
    </html>
  `;

  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderRadius: s.borderRadius ? `${s.borderRadius}px` : '12px',
        backgroundColor: s.backgroundColor || 'transparent',
      }}
    >
      <iframe
        srcDoc={playerHtml}
        title="Lottie Animation"
        className="w-full h-full border-0 pointer-events-none"
        sandbox="allow-scripts allow-same-origin"
      />

      {/* Canvas Mode Click Shield */}
      {!isInteractive && (
        <div className="absolute inset-0 bg-transparent z-10 cursor-move" />
      )}
    </div>
  );
};
