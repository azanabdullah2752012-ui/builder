import React from 'react';

export interface PickleCorpLogoProps {
  /**
   * 'badge': Authentic cream card/badge matching the official physical logo card
   * 'full': Torch mark + PICKLE CORP™ wordmark (transparent)
   * 'torch': Standalone torch emblem with the electric blue flame
   * 'wordmark': Just the bold PICKLE CORP™ typography
   */
  variant?: 'badge' | 'full' | 'torch' | 'wordmark';
  /**
   * Color theme for torch metal and text:
   * 'light': Dark ink (#121011) for light surfaces
   * 'dark': Soft ivory (#f4f1ea) for dark obsidian UI
   * 'cream': Uses the official warm cream backdrop (#f1ede4)
   */
  theme?: 'light' | 'dark' | 'cream' | 'auto';
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

/**
 * Official Torch Emblem SVG with Blue Flame
 */
export const PickleTorchSvg: React.FC<{
  size?: number | string;
  theme?: 'light' | 'dark' | 'cream';
  className?: string;
  style?: React.CSSProperties;
}> = ({ size = 28, theme = 'dark', className = '', style = {} }) => {
  const metalColor = theme === 'dark' ? '#f4f1ea' : '#121011';
  const accentColor = theme === 'dark' ? '#121011' : '#f1ede4';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="Pickle Corp™ Torch"
    >
      {/* Outer Electric Blue Flame */}
      <path
        d="M 41 71 C 36 67 29 55 29 44 C 29 36 34 30 38 25 C 38.8 28.5 41 33 44 34.5 C 43 27 45 15 54 8 C 55 12 56 16.5 58 19.5 C 60.5 13 65 9 67 6 C 68 14 71 21 78 26 C 75.5 28.5 73.5 32 73.5 36 C 78.5 32 84 32.5 87 35.5 C 92 40.5 92 50 88 59 C 85 65 79 70 73 71 Z"
        fill="#1076fc"
      />
      {/* Inner Flame Negative Space Cutout */}
      <path
        d="M 49 71 C 45 66 43 59 45 52 C 47 46 51 40 52 34 C 54.5 40 58 45 61 51 C 64 57 65 64 63 71 Z"
        fill={accentColor}
      />
      {/* Torch Cup / Top Rim */}
      <path
        d="M 23 73 H 97 C 98.6 73 100 74.4 99.8 76 L 96.5 86 C 96.2 87.2 95.1 88 93.8 88 H 26.2 C 24.9 88 23.8 87.2 23.5 86 L 20.2 76 C 20 74.4 21.4 73 23 73 Z"
        fill={metalColor}
      />
      {/* Torch Rim Highlight Slit */}
      <rect x="33" y="78" width="20" height="3.5" rx="1.75" fill={accentColor} />
      {/* Torch Tapered Cone Handle */}
      <path
        d="M 32 92 L 44 140 C 44.5 142.5 46.5 144 49 144 H 71 C 73.5 144 75.5 142.5 76 140 L 88 92 Z"
        fill={metalColor}
      />
      {/* Torch Handle Slit */}
      <path
        d="M 40 98 L 47 132 C 47.3 133.5 48.7 134.5 50.2 134.5 C 51.8 134.5 53.1 133.2 52.8 131.6 L 46 98 C 45.7 96.5 44.3 95.5 42.8 95.5 C 41.2 95.5 39.9 96.8 40.2 98.4 Z"
        fill={accentColor}
      />
    </svg>
  );
};

export const PickleCorpLogo: React.FC<PickleCorpLogoProps> = ({
  variant = 'badge',
  theme = 'auto',
  height = 36,
  className = '',
  style = {},
  title = 'Pickle Corp™',
}) => {
  // If badge variant: renders authentic cream badge card with high craft
  if (variant === 'badge') {
    return (
      <div
        className={`pickle-corp-badge-wrapper ${className}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1ede4',
          borderRadius: 14,
          padding: '16px 20px 14px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(0, 0, 0, 0.15)',
          userSelect: 'none',
          ...style,
        }}
        title={title}
      >
        <PickleTorchSvg size={54} theme="light" />
        <div
          style={{
            marginTop: 8,
            fontFamily: 'var(--font-display, "Cabinet Grotesk", sans-serif)',
            fontWeight: 900,
            fontSize: 16,
            letterSpacing: '0.04em',
            color: '#121011',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            lineHeight: 1,
          }}
        >
          <span>PICKLE CORP</span>
          <span style={{ fontSize: 8, fontWeight: 700, marginTop: -2 }}>TM</span>
        </div>
      </div>
    );
  }

  // Standalone Torch
  if (variant === 'torch') {
    return <PickleTorchSvg size={height} theme={theme === 'light' ? 'light' : 'dark'} className={className} style={style} />;
  }

  // Wordmark only
  if (variant === 'wordmark') {
    const textColor = theme === 'light' ? '#121011' : '#f4f1ea';
    return (
      <span
        className={`pickle-corp-wordmark ${className}`}
        style={{
          fontFamily: 'var(--font-display, "Cabinet Grotesk", sans-serif)',
          fontWeight: 900,
          fontSize: typeof height === 'number' ? height * 0.45 : '15px',
          letterSpacing: '0.04em',
          color: textColor,
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'flex-start',
          gap: 2,
          lineHeight: 1,
          ...style,
        }}
      >
        <span>PICKLE CORP</span>
        <span style={{ fontSize: '0.55em', fontWeight: 700, marginTop: '-0.15em' }}>TM</span>
      </span>
    );
  }

  // Full horizontal or lockup variant
  const textColor = theme === 'light' ? '#121011' : '#f4f1ea';
  const numericHeight = typeof height === 'number' ? height : 32;

  return (
    <div
      className={`pickle-corp-full ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.max(6, Math.round(numericHeight * 0.25)),
        userSelect: 'none',
        ...style,
      }}
      title={title}
    >
      <PickleTorchSvg size={numericHeight} theme={theme === 'light' ? 'light' : 'dark'} />
      <div
        style={{
          fontFamily: 'var(--font-display, "Cabinet Grotesk", sans-serif)',
          fontWeight: 900,
          fontSize: Math.round(numericHeight * 0.46),
          letterSpacing: '0.04em',
          color: textColor,
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'flex-start',
          gap: 2,
          lineHeight: 1,
        }}
      >
        <span>PICKLE CORP</span>
        <span style={{ fontSize: '0.55em', fontWeight: 700, marginTop: '-0.2em' }}>TM</span>
      </div>
    </div>
  );
};
