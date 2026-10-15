/**
 * Gummy Life Engine (gummyEngine.ts)
 * 
 * High-performance, zero-dependency kinetic life engine for Gummy the mascot.
 * Handles:
 * - Real-time cursor gaze tracking (clamped to realistic ocular bounds)
 * - Autonomous idle glances and random blinks
 * - Squash-and-stretch hopping physics
 * - Procedural 360° backflip with multi-stage somersault mechanics
 * - Spontaneous idle wiggles and micro-hops
 * - Respects prefers-reduced-motion
 */

export interface GummyColors {
  bodyGradientStart?: string;
  bodyGradientEnd?: string;
  stroke?: string;
  blush?: string;
  catchlight?: string;
}

export type GummyThemePreset = 'classic' | 'pickle' | 'mint';

export const GUMMY_PRESETS: Record<GummyThemePreset, Required<GummyColors>> = {
  // Classic taupe Kawaii studio palette
  classic: {
    bodyGradientStart: '#b8a18c',
    bodyGradientEnd: '#ab947e',
    stroke: '#593d3b',
    blush: '#c0a692',
    catchlight: '#ffffff',
  },
  // Pickle Studio olive-celadon signature palette
  pickle: {
    bodyGradientStart: '#a4ac86',
    bodyGradientEnd: '#656d4a',
    stroke: '#283618',
    blush: '#b5c99a',
    catchlight: '#fefae0',
  },
  // Fresh mint gumdrop palette
  mint: {
    bodyGradientStart: '#80ed99',
    bodyGradientEnd: '#57cc99',
    stroke: '#22577a',
    blush: '#c7f9cc',
    catchlight: '#ffffff',
  },
};

export interface GummyOptions {
  theme?: GummyThemePreset;
  colors?: GummyColors;
  interactive?: boolean;
  onHop?: (height: number) => void;
  onBackflip?: () => void;
  onQuote?: (quote: string) => void;
}

export class GummyInstance {
  public container: HTMLElement;
  public options: GummyOptions;
  public isDestroyed = false;

  // DOM Elements
  private bodyGroup!: SVGGElement;
  private shadowEl!: SVGEllipseElement;
  private eyesGroup!: SVGGElement;
  private blinkGroup!: SVGGElement;

  // Gaze Tracking
  private eyeX = 0;
  private eyeY = 0;
  private targetEyeX = 0;
  private targetEyeY = 0;
  private lastMouseMoveTime = performance.now();
  private nextIdleGlanceTime = performance.now() + 2000;

  // Blinking State
  private isBlinking = false;
  private nextBlinkTime = performance.now() + 2500;
  private blinkTimeout: number | null = null;

  // Autonomous Behavior
  private nextIdleActionTime = performance.now() + 7000;

  // Animation Control
  public isAnimating = false;
  private animRaf: number | null = null;
  private mainLoopRaf: number | null = null;
  private lastClickTime = 0;
  private clickCount = 0;

  // Bound Handlers
  private boundOnPointerMove: (e: PointerEvent) => void;
  private boundOnClick: (e: MouseEvent) => void;
  private boundOnDblClick: (e: MouseEvent) => void;
  private boundOnMouseEnter: () => void;

  constructor(container: HTMLElement | string, options: GummyOptions = {}) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) {
      throw new Error(`[GummyInstance] Container element not found: ${container}`);
    }
    this.container = el;
    this.options = options;

    this.boundOnPointerMove = (e: PointerEvent) => this.handlePointerMove(e);
    this.boundOnClick = (e: MouseEvent) => this.handleClick(e);
    this.boundOnDblClick = (e: MouseEvent) => this.handleDblClick(e);
    this.boundOnMouseEnter = () => this.handleMouseEnter();

    this.renderDOM();
    this.bindEvents();
    this.startMainLoop();
  }

  /**
   * Builds and mounts the vector SVG DOM structure with unique gradient IDs.
   */
  private renderDOM(): void {
    const preset = this.options.theme ? GUMMY_PRESETS[this.options.theme] : GUMMY_PRESETS.classic;
    const colors: Required<GummyColors> = {
      bodyGradientStart: this.options.colors?.bodyGradientStart || preset.bodyGradientStart,
      bodyGradientEnd: this.options.colors?.bodyGradientEnd || preset.bodyGradientEnd,
      stroke: this.options.colors?.stroke || preset.stroke,
      blush: this.options.colors?.blush || preset.blush,
      catchlight: this.options.colors?.catchlight || preset.catchlight,
    };

    const uid = 'gm_' + Math.random().toString(36).substring(2, 9);
    const gradBodyId = `${uid}_body`;
    const gradShadowId = `${uid}_sh`;

    this.container.innerHTML = `
      <div class="gummy-wrap" style="width:100%;height:100%;position:relative;display:flex;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none;cursor:grab;overflow:visible;">
        <svg viewBox="0 0 110 52" width="100%" height="100%" aria-hidden="true" style="overflow:visible;display:block;">
          <defs>
            <radialGradient id="${gradShadowId}" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="${colors.stroke}" stop-opacity="0.32" />
              <stop offset="65%" stop-color="${colors.stroke}" stop-opacity="0.09" />
              <stop offset="100%" stop-color="${colors.stroke}" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="${gradBodyId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="${colors.bodyGradientStart}" />
              <stop offset="100%" stop-color="${colors.bodyGradientEnd}" />
            </linearGradient>
          </defs>
          <!-- Dynamic ground shadow -->
          <ellipse class="gummy-shadow" cx="55" cy="44.5" rx="44" ry="3.8" fill="url(#${gradShadowId})" style="transform-origin: 55px 44.5px; transition: transform 0.05s linear;" />
          <!-- Animated body group -->
          <g class="gummy-body-group" style="transform-origin: 55px 44px; will-change: transform;">
            <path class="gummy-body-shape"
                  d="M 15,44 C 9,44 6.5,39.5 9,34 C 13.5,23.5 26,12 44,8.5 C 50,7.2 60,7.2 66,8.5 C 84,12 96.5,23.5 101,34 C 103.5,39.5 101,44 95,44 Z"
                  fill="url(#${gradBodyId})"
                  stroke="${colors.stroke}"
                  stroke-width="3.4"
                  stroke-linejoin="round"
                  stroke-linecap="round" />
            <!-- Cheeks -->
            <ellipse cx="36" cy="30" rx="4.6" ry="2.3" fill="${colors.blush}" opacity="0.9" />
            <ellipse cx="74" cy="30" rx="4.6" ry="2.3" fill="${colors.blush}" opacity="0.9" />
            <!-- Open Eyes -->
            <g class="gummy-eyes-group" style="will-change: transform; transition: opacity 0.08s ease;">
              <g class="gummy-eye-left">
                <circle cx="46" cy="26" r="3.3" fill="${colors.stroke}" />
                <circle cx="44.8" cy="24.8" r="1.1" fill="${colors.catchlight}" />
              </g>
              <g class="gummy-eye-right">
                <circle cx="64" cy="26" r="3.3" fill="${colors.stroke}" />
                <circle cx="62.8" cy="24.8" r="1.1" fill="${colors.catchlight}" />
              </g>
            </g>
            <!-- Closed Happy Blink Eyes (⌒ ⌒) -->
            <g class="gummy-eyes-blink" style="opacity: 0; pointer-events: none; transition: opacity 0.08s ease;">
              <path d="M 42.5,27 Q 46,24 49.5,27" fill="none" stroke="${colors.stroke}" stroke-width="2.2" stroke-linecap="round" />
              <path d="M 60.5,27 Q 64,24 67.5,27" fill="none" stroke="${colors.stroke}" stroke-width="2.2" stroke-linecap="round" />
            </g>
            <!-- Mouth -->
            <path class="gummy-mouth" d="M 52.4,27.8 Q 55,30.2 57.6,27.8" fill="none" stroke="${colors.stroke}" stroke-width="2" stroke-linecap="round" />
          </g>
        </svg>
      </div>
    `;

    this.bodyGroup = this.container.querySelector('.gummy-body-group') as SVGGElement;
    this.shadowEl = this.container.querySelector('.gummy-shadow') as SVGEllipseElement;
    this.eyesGroup = this.container.querySelector('.gummy-eyes-group') as SVGGElement;
    this.blinkGroup = this.container.querySelector('.gummy-eyes-blink') as SVGGElement;
  }

  /**
   * Connects DOM event listeners.
   */
  private bindEvents(): void {
    if (this.options.interactive !== false) {
      this.container.addEventListener('mouseenter', this.boundOnMouseEnter);
      this.container.addEventListener('click', this.boundOnClick);
      this.container.addEventListener('dblclick', this.boundOnDblClick);
    }
    window.addEventListener('pointermove', this.boundOnPointerMove, { passive: true });
  }

  /**
   * Tracks cursor position and computes gaze vector clamped within realistic eye movement.
   */
  private handlePointerMove(e: PointerEvent): void {
    this.lastMouseMoveTime = performance.now();
    this.trackGaze(e.clientX, e.clientY);
  }

  public trackGaze(clientX: number, clientY: number): void {
    if (!this.container || this.isDestroyed) return;
    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height * 0.58;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    // Normalized falloff with 300px radius
    const maxRadius = 320;
    const intensity = Math.min(1, distance / maxRadius);
    const angle = Math.atan2(dy, dx);

    // Clamped travel: max 1.8px X, 1.4px Y
    this.targetEyeX = Math.cos(angle) * (1.8 * intensity);
    this.targetEyeY = Math.sin(angle) * (1.4 * intensity);
  }

  private handleMouseEnter(): void {
    if (this.isAnimating) return;
    // Gentle cheerful greeting hop
    this.hop(32, 480);
  }

  private handleClick(e: MouseEvent): void {
    e.stopPropagation();
    const now = performance.now();
    const diff = now - this.lastClickTime;
    this.lastClickTime = now;

    // Detect rapid double click (within 380ms)
    if (diff < 380) {
      this.clickCount++;
      if (this.clickCount >= 2) {
        this.clickCount = 0;
        this.backflip();
        return;
      }
    } else {
      this.clickCount = 1;
    }

    // Single click: deep squash compression followed by a 62px high hop
    this.hop(62, 580);
  }

  private handleDblClick(e: MouseEvent): void {
    e.stopPropagation();
    this.backflip();
  }

  /**
   * Core Squash & Stretch Hop Animation
   */
  public hop(height = 42, duration = 540, onComplete?: () => void): void {
    if (this.isAnimating || this.isDestroyed) return;
    this.isAnimating = true;
    this.options.onHop?.(height);

    // Check prefers-reduced-motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.bodyGroup.style.transform = 'scale(1.05, 0.96)';
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.bodyGroup.style.transform = '';
          this.isAnimating = false;
          onComplete?.();
        }
      }, 300);
      return;
    }

    const start = performance.now();

    const anim = (now: number) => {
      if (this.isDestroyed) return;
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);

      let translateY = 0;
      let scaleX = 1;
      let scaleY = 1;
      let shadowScale = 1;
      let shadowOpacity = 1;

      if (progress < 0.15) {
        // Phase 1: Pre-jump squash anticipation
        const p = progress / 0.15;
        const squash = Math.sin(p * Math.PI * 0.5);
        scaleX = 1 + 0.22 * squash;
        scaleY = 1 - 0.22 * squash;
        translateY = 2 * squash;
        shadowScale = 1 + 0.08 * squash;
        shadowOpacity = 1;
      } else if (progress < 0.80) {
        // Phase 2: Aerial flight trajectory
        const p = (progress - 0.15) / 0.65;
        const arc = Math.sin(p * Math.PI);
        translateY = -arc * height;
        // Aerodynamic stretch
        scaleX = 1 - 0.12 * arc;
        scaleY = 1 + 0.18 * arc;
        shadowScale = Math.max(0.2, 1 - arc * 0.68);
        shadowOpacity = Math.max(0.1, 1 - arc * 0.78);
      } else if (progress < 0.92) {
        // Phase 3: Touchdown pancake cushion
        const p = (progress - 0.80) / 0.12;
        const cushion = Math.sin(p * Math.PI);
        scaleX = 1 + 0.20 * cushion;
        scaleY = 1 - 0.20 * cushion;
        translateY = 1.6 * cushion;
        shadowScale = 1 + 0.12 * cushion;
        shadowOpacity = 1;
      } else {
        // Phase 4: Elastic spring recovery
        const p = (progress - 0.92) / 0.08;
        const settle = Math.sin(p * Math.PI) * 0.06;
        scaleX = 1 - settle;
        scaleY = 1 + settle;
        translateY = 0;
        shadowScale = 1;
        shadowOpacity = 1;
      }

      this.bodyGroup.style.transform = `translateY(${translateY.toFixed(2)}px) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
      this.shadowEl.style.transform = `scale(${shadowScale.toFixed(3)})`;
      this.shadowEl.style.opacity = `${shadowOpacity.toFixed(3)}`;

      if (progress < 1) {
        this.animRaf = requestAnimationFrame(anim);
      } else {
        this.bodyGroup.style.transform = '';
        this.shadowEl.style.transform = '';
        this.shadowEl.style.opacity = '';
        this.isAnimating = false;
        onComplete?.();
      }
    };

    this.animRaf = requestAnimationFrame(anim);
  }

  /**
   * Procedural 360° Backflip (1100ms multi-stage somersault)
   */
  public backflip(duration = 1100, onComplete?: () => void): void {
    if (this.isAnimating || this.isDestroyed) return;
    this.isAnimating = true;
    this.options.onBackflip?.();

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.hop(50, 600, onComplete);
      return;
    }

    const start = performance.now();
    const apexHeight = 58;

    const anim = (now: number) => {
      if (this.isDestroyed) return;
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);

      let translateY = 0;
      let rotation = 0;
      let scaleX = 1;
      let scaleY = 1;
      let shadowScale = 1;
      let shadowOpacity = 1;

      if (progress < 0.14) {
        // 0–14%: Anticipation crouch into the floor
        const p = progress / 0.14;
        const t = Math.sin(p * Math.PI * 0.5);
        scaleX = 1 + 0.28 * t;
        scaleY = 1 - 0.28 * t;
        translateY = 3 * t;
        shadowScale = 1.15;
        shadowOpacity = 1;
        this.bodyGroup.style.transformOrigin = '55px 44px';
      } else if (progress < 0.78) {
        // 14–78%: Aerial liftoff, apex (-58px), and full -360° backward rotation around center of mass (55px 26px)
        const p = (progress - 0.14) / 0.64;
        const arc = Math.sin(p * Math.PI);
        translateY = -arc * apexHeight;
        rotation = -360 * p;
        scaleX = 0.90;
        scaleY = 1.14;
        shadowScale = Math.max(0.18, 1 - arc * 0.75);
        shadowOpacity = Math.max(0.1, 1 - arc * 0.85);
        this.bodyGroup.style.transformOrigin = '55px 26px';
      } else if (progress < 0.90) {
        // 78–90%: Touchdown pancake impact
        const p = (progress - 0.78) / 0.12;
        const cushion = Math.sin(p * Math.PI);
        scaleX = 1 + 0.32 * cushion;
        scaleY = 1 - 0.32 * cushion;
        translateY = 2 * cushion;
        rotation = 0;
        shadowScale = 1 + 0.18 * cushion;
        shadowOpacity = 1;
        this.bodyGroup.style.transformOrigin = '55px 44px';
      } else {
        // 90–100%: Elastic spring settle
        const p = (progress - 0.90) / 0.10;
        const settle = Math.sin(p * Math.PI) * 0.08;
        scaleX = 1 - settle;
        scaleY = 1 + settle;
        translateY = 0;
        rotation = 0;
        shadowScale = 1;
        shadowOpacity = 1;
        this.bodyGroup.style.transformOrigin = '55px 44px';
      }

      this.bodyGroup.style.transform = `translateY(${translateY.toFixed(2)}px) rotate(${rotation.toFixed(1)}deg) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
      this.shadowEl.style.transform = `scale(${shadowScale.toFixed(3)})`;
      this.shadowEl.style.opacity = `${shadowOpacity.toFixed(3)}`;

      if (progress < 1) {
        this.animRaf = requestAnimationFrame(anim);
      } else {
        this.bodyGroup.style.transformOrigin = '55px 44px';
        this.bodyGroup.style.transform = '';
        this.shadowEl.style.transform = '';
        this.shadowEl.style.opacity = '';
        this.isAnimating = false;
        onComplete?.();
      }
    };

    this.animRaf = requestAnimationFrame(anim);
  }

  /**
   * Curious spontaneous wiggle
   */
  public wiggle(duration = 420): void {
    if (this.isAnimating || this.isDestroyed) return;
    this.isAnimating = true;

    const start = performance.now();
    const anim = (now: number) => {
      if (this.isDestroyed) return;
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);

      // Wobble wave
      const wave = Math.sin(progress * Math.PI * 4) * (1 - progress);
      const angle = wave * 3.5;
      const scaleX = 1 + wave * 0.06;
      const scaleY = 1 - wave * 0.06;

      this.bodyGroup.style.transform = `rotate(${angle.toFixed(1)}deg) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;

      if (progress < 1) {
        this.animRaf = requestAnimationFrame(anim);
      } else {
        this.bodyGroup.style.transform = '';
        this.isAnimating = false;
      }
    };

    this.animRaf = requestAnimationFrame(anim);
  }

  /**
   * High Super Jump (105px)
   */
  public superJump(): void {
    this.hop(105, 820);
  }

  /**
   * Main kinetic loop for eye tracking interpolation, blinking & idle behavior
   */
  private startMainLoop(): void {
    const loop = (time: number) => {
      if (this.isDestroyed) return;
      this.tick(time);
      this.mainLoopRaf = requestAnimationFrame(loop);
    };
    this.mainLoopRaf = requestAnimationFrame(loop);
  }

  private tick(time: number): void {
    // 1. Smooth eye gaze interpolation (lerp factor 0.16)
    this.eyeX += (this.targetEyeX - this.eyeX) * 0.16;
    this.eyeY += (this.targetEyeY - this.eyeY) * 0.16;
    this.eyesGroup.setAttribute('transform', `translate(${this.eyeX.toFixed(2)}, ${this.eyeY.toFixed(2)})`);

    // 2. Idle Glances (if mouse inactive for > 1.4s)
    if (time - this.lastMouseMoveTime > 1400 && time > this.nextIdleGlanceTime) {
      this.targetEyeX = (Math.random() - 0.5) * 2.2;
      this.targetEyeY = (Math.random() - 0.5) * 1.4;
      this.nextIdleGlanceTime = time + 2000 + Math.random() * 2500;
      // Return gaze to center after a short hold
      window.setTimeout(() => {
        if (!this.isDestroyed && performance.now() - this.lastMouseMoveTime > 1400) {
          this.targetEyeX = 0;
          this.targetEyeY = 0;
        }
      }, 750);
    }

    // 3. Natural Blinking (every 2.5–6.5s)
    if (!this.isBlinking && time > this.nextBlinkTime) {
      this.isBlinking = true;
      this.eyesGroup.style.opacity = '0';
      this.blinkGroup.style.opacity = '1';

      this.blinkTimeout = window.setTimeout(() => {
        if (!this.isDestroyed) {
          this.eyesGroup.style.opacity = '1';
          this.blinkGroup.style.opacity = '0';
          this.isBlinking = false;
          this.nextBlinkTime = performance.now() + 2500 + Math.random() * 4000;
        }
      }, 150);
    }

    // 4. Autonomous Idles (spontaneous tiny hops or wiggles every 7–12s)
    if (!this.isAnimating && time > this.nextIdleActionTime) {
      this.nextIdleActionTime = time + 7000 + Math.random() * 5000;
      if (Math.random() > 0.45) {
        this.wiggle();
      } else {
        this.hop(15, 380);
      }
    }
  }

  /**
   * Clean unmount of all listeners and timers
   */
  public destroy(): void {
    this.isDestroyed = true;
    if (this.mainLoopRaf) cancelAnimationFrame(this.mainLoopRaf);
    if (this.animRaf) cancelAnimationFrame(this.animRaf);
    if (this.blinkTimeout) clearTimeout(this.blinkTimeout);

    window.removeEventListener('pointermove', this.boundOnPointerMove);
    this.container.removeEventListener('mouseenter', this.boundOnMouseEnter);
    this.container.removeEventListener('click', this.boundOnClick);
    this.container.removeEventListener('dblclick', this.boundOnDblClick);
  }
}
