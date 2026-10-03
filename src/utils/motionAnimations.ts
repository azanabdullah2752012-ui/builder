import type { ElementStyles, CanvasElement } from '../types/editor';

export type MotionAnimationName =
  | 'none'
  | 'fadeIn'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'popIn'
  | 'bounce'
  | 'flipUp'
  | 'float'
  | 'pulse'
  | 'shimmer'
  | 'spin'
  | 'blurIn';

export type MotionTrigger = 'entrance' | 'scroll' | 'hover';

export interface MotionPreset {
  id: MotionAnimationName;
  label: string;
  category: 'entrance' | 'attention' | 'ambient';
  description: string;
  defaultDuration: number;
  defaultIteration: '1' | 'infinite';
  defaultTiming: string;
}

export const MOTION_PRESETS: MotionPreset[] = [
  { id: 'none', label: 'None', category: 'entrance', description: 'Static element without motion', defaultDuration: 0, defaultIteration: '1', defaultTiming: 'ease' },
  { id: 'fadeIn', label: 'Fade In', category: 'entrance', description: 'Smooth progressive opacity entrance', defaultDuration: 0.6, defaultIteration: '1', defaultTiming: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { id: 'slideUp', label: 'Slide Up', category: 'entrance', description: 'Smooth upward translate entrance', defaultDuration: 0.7, defaultIteration: '1', defaultTiming: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { id: 'slideDown', label: 'Slide Down', category: 'entrance', description: 'Smooth downward translate entrance', defaultDuration: 0.7, defaultIteration: '1', defaultTiming: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { id: 'slideLeft', label: 'Slide Left', category: 'entrance', description: 'Smooth slide entrance from right to left', defaultDuration: 0.7, defaultIteration: '1', defaultTiming: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { id: 'slideRight', label: 'Slide Right', category: 'entrance', description: 'Smooth slide entrance from left to right', defaultDuration: 0.7, defaultIteration: '1', defaultTiming: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { id: 'zoomIn', label: 'Zoom In', category: 'entrance', description: 'Expands from 85% scale to full size', defaultDuration: 0.6, defaultIteration: '1', defaultTiming: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { id: 'zoomOut', label: 'Zoom Out', category: 'entrance', description: 'Contracts gracefully from 115% scale', defaultDuration: 0.6, defaultIteration: '1', defaultTiming: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { id: 'blurIn', label: 'Blur In', category: 'entrance', description: 'Cinematic un-blur from 10px focus', defaultDuration: 0.8, defaultIteration: '1', defaultTiming: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { id: 'popIn', label: 'Pop In (Spring)', category: 'attention', description: 'High-energy spring overshoot entrance', defaultDuration: 0.5, defaultIteration: '1', defaultTiming: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  { id: 'bounce', label: 'Bounce', category: 'attention', description: 'Rhythmic tactile vertical bounce', defaultDuration: 1.2, defaultIteration: 'infinite', defaultTiming: 'ease-in-out' },
  { id: 'flipUp', label: '3D Flip Up', category: 'attention', description: 'Dynamic 3D perspective card tilt', defaultDuration: 0.7, defaultIteration: '1', defaultTiming: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { id: 'float', label: 'Ambient Float', category: 'ambient', description: 'Gentle, floating hovering motion', defaultDuration: 3.0, defaultIteration: 'infinite', defaultTiming: 'ease-in-out' },
  { id: 'pulse', label: 'Pulse Glow', category: 'ambient', description: 'Breathing rhythmic scale oscillation', defaultDuration: 2.0, defaultIteration: 'infinite', defaultTiming: 'ease-in-out' },
  { id: 'shimmer', label: 'Shimmer Sweep', category: 'ambient', description: 'Luminous brightness shimmer sweep', defaultDuration: 2.2, defaultIteration: 'infinite', defaultTiming: 'ease-in-out' },
  { id: 'spin', label: 'Continuous Spin', category: 'ambient', description: 'Smooth 360-degree rotation loop', defaultDuration: 4.0, defaultIteration: 'infinite', defaultTiming: 'linear' },
];

export const EASING_PRESETS = [
  { label: 'Snappy Ease-Out', value: 'cubic-bezier(0.16, 1, 0.3, 1)', hint: 'Modern responsive entrance' },
  { label: 'Tactile Spring', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', hint: 'Playful bouncy physics' },
  { label: 'Standard Smooth', value: 'cubic-bezier(0.4, 0, 0.2, 1)', hint: 'Gentle natural motion' },
  { label: 'Ease-In-Out', value: 'cubic-bezier(0.65, 0, 0.35, 1)', hint: 'Smooth symmetrical curve' },
  { label: 'Linear', value: 'linear', hint: 'Constant velocity for rotations' },
];

/**
 * Computes CSS animation string for an element based on its styles
 */
export function getComputedAnimationCss(styles: ElementStyles): string | undefined {
  const name = styles.animationName;
  if (!name || name === 'none') return undefined;

  const duration = styles.animationDuration || 0.7;
  const delay = styles.animationDelay || 0;
  const timing = styles.animationTimingFunction || 'cubic-bezier(0.16, 1, 0.3, 1)';
  const iteration = styles.animationIterationCount || '1';

  return `${name} ${duration}s ${timing} ${delay}s ${iteration} both`;
}

/**
 * Generates all CSS @keyframes needed for both runtime preview and static HTML export
 */
export function generateMotionKeyframesCss(): string {
  return `
/* Motion Animation Keyframes Engine */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-28px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideLeft {
  from { opacity: 0; transform: translateX(28px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideRight {
  from { opacity: 0; transform: translateX(-28px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes zoomOut {
  from { opacity: 0; transform: scale(1.15); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes blurIn {
  from { opacity: 0; filter: blur(10px); }
  to { opacity: 1; filter: blur(0); }
}

@keyframes popIn {
  0% { opacity: 0; transform: scale(0.65); }
  70% { transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}

@keyframes flipUp {
  from { opacity: 0; transform: perspective(800px) rotateX(25deg); }
  to { opacity: 1; transform: perspective(800px) rotateX(0deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

@keyframes shimmer {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.28); }
  100% { filter: brightness(1); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Scroll Trigger Initial & Active States */
[data-motion-scroll="true"] {
  opacity: 0;
  transition: opacity 0.1s ease;
}

[data-motion-scroll="true"].is-in-view {
  opacity: 1;
}
`;
}

/**
 * Returns vanilla zero-dependency client script for scroll-triggered animations
 */
export function generateScrollObserverScript(): string {
  return `
<script>
(function() {
  if (typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('[data-motion-scroll="true"]').forEach(function(el) {
      el.classList.add('is-in-view');
    });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in-view');
        // Unobserve once animated
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  });

  document.querySelectorAll('[data-motion-scroll="true"]').forEach(function(el) {
    observer.observe(el);
  });
})();
</script>
`;
}

/**
 * Automatically staggers animation delays on child elements of a container/section
 */
export function computeStaggeredChildDelays(
  childrenElements: CanvasElement[],
  baseDelay = 0.1,
  step = 0.12
): Map<string, number> {
  const delayMap = new Map<string, number>();
  childrenElements.forEach((child, index) => {
    delayMap.set(child.id, Number((baseDelay + index * step).toFixed(2)));
  });
  return delayMap;
}
