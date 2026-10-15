import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GummyInstance, type GummyThemePreset, type GummyColors } from './gummyEngine';
import { playSound, triggerConfetti } from '../../utils/interactiveEffects';
import './GummyMascot.css';

export interface GummyMascotProps {
  id?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  colorTheme?: GummyThemePreset;
  colors?: GummyColors;
  interactive?: boolean;
  showSpeech?: boolean;
  speechBubbleText?: string;
  enableSound?: boolean;
  enableConfetti?: boolean;
  floatingDock?: boolean;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onBackflip?: () => void;
}

const DEFAULT_LORE_QUOTES = [
  'Appointed to management!',
  'Paid strictly in favors.',
  '0% AI slop. 100% human taste.',
  'Double-click me to backflip! 🤸‍♂️',
  'Cash declined: $0.00 invoices.',
  'No monthly retainers allowed!',
  'Azan & Thanvi say hi! 👋',
  'Flat mint gumdrop on duty.',
  'Pure vector perfection.',
  'Wheeeee! ✨',
];

export const GummyMascot: React.FC<GummyMascotProps> = ({
  id,
  size = 'md',
  colorTheme = 'classic',
  colors,
  interactive = true,
  showSpeech = false,
  speechBubbleText,
  enableSound = true,
  enableConfetti = true,
  floatingDock = false,
  title = 'Poke me, click me, or double-click to backflip!',
  className = '',
  style,
  onClick,
  onBackflip,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<GummyInstance | null>(null);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [speechVisible, setSpeechVisible] = useState(showSpeech);
  const [isDockMinimized, setIsDockMinimized] = useState(false);

  const activeQuote = speechBubbleText || DEFAULT_LORE_QUOTES[quoteIndex % DEFAULT_LORE_QUOTES.length];

  const cycleQuote = useCallback(() => {
    setQuoteIndex((prev) => prev + 1);
    if (enableSound) {
      playSound('pop');
    }
  }, [enableSound]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Instantiate Gummy kinetic life engine
    const instance = new GummyInstance(mountRef.current, {
      theme: colorTheme,
      colors,
      interactive,
      onHop: (h) => {
        if (enableSound && h > 20) {
          playSound('pop');
        }
        onClick?.();
      },
      onBackflip: () => {
        if (enableSound) {
          playSound('chime');
        }
        if (enableConfetti && mountRef.current) {
          const rect = mountRef.current.getBoundingClientRect();
          triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        // Advance speech quote on celebratory backflip
        setQuoteIndex((prev) => prev + 1);
        onBackflip?.();
      },
    });

    instanceRef.current = instance;

    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
  }, [colorTheme, colors, interactive, enableSound, enableConfetti, onClick, onBackflip]);

  // Size styling helper
  const getSizeStyle = (): React.CSSProperties => {
    if (typeof size === 'number') {
      return { width: size, height: size * (52 / 110) };
    }
    return {};
  };

  const sizeClass = typeof size === 'string' ? `gummy-size-${size}` : '';

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (e.shiftKey) {
        instanceRef.current?.backflip();
      } else {
        instanceRef.current?.hop(60, 560);
      }
    }
  };

  const content = (
    <div
      className={`gummy-mascot-container ${className}`}
      style={{ ...style }}
    >
      {/* Optional Speech Bubble */}
      {speechVisible && (
        <button
          type="button"
          className="gummy-speech-bubble"
          onClick={cycleQuote}
          title="Click to cycle mascot quotes"
          aria-label={`Gummy mascot says: ${activeQuote}. Click to cycle.`}
        >
          <span>{activeQuote}</span>
          <span className="gummy-speech-hint">click to cycle</span>
        </button>
      )}

      {/* Main Vector Mount Container */}
      <div
        id={id}
        ref={mountRef}
        className={`gummy-wrap ${sizeClass}`}
        style={getSizeStyle()}
        title={title}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        aria-label="Gummy: animated studio companion mascot"
        onKeyDown={interactive ? handleKeyDown : undefined}
      />
    </div>
  );

  if (floatingDock) {
    return (
      <aside className="gummy-floating-dock" aria-label="Gummy Mascot Studio Dock">
        <div className="gummy-dock-bar">
          <span className="gummy-dock-title">Gummy</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              type="button"
              className="gummy-dock-btn"
              onClick={() => setSpeechVisible((prev) => !prev)}
              title={speechVisible ? 'Hide speech bubble' : 'Show speech bubble'}
            >
              💬
            </button>
            <button
              type="button"
              className="gummy-dock-btn"
              onClick={() => setIsDockMinimized((prev) => !prev)}
              title={isDockMinimized ? 'Expand mascot' : 'Minimize mascot'}
            >
              {isDockMinimized ? '▲' : '▼'}
            </button>
          </div>
        </div>
        {!isDockMinimized && content}
      </aside>
    );
  }

  return content;
};

// Re-export GummyInstance for vanilla JS usage as well
export { GummyInstance };
