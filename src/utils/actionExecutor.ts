import type { ActionType, CanvasElement, ProjectState, Page } from '../types/editor';
import { triggerConfetti, playSound, type SoundEffectType } from './interactiveEffects';
import { executeFormSubmission } from './formSubmitHandler';
import { setCartOpen, addToCart, addProductConfigToCart } from './cartManager';
import { trackAnalyticsEvent } from './analyticsEngine';

export interface ActionDefinition {
  value: ActionType;
  label: string;
  icon: string;
  category: 'Navigation' | 'Interactive' | 'Effects & Audio' | 'Utility' | 'Communication' | 'Advanced';
  description: string;
  payloadLabel?: string;
  payloadPlaceholder?: string;
  payloadType?: 'url' | 'page' | 'elementId' | 'text' | 'phone' | 'email' | 'sound' | 'code' | 'none';
}

export const ACTION_DEFINITIONS: ActionDefinition[] = [
  // General / Default
  {
    value: 'none',
    label: 'No Action (Static)',
    icon: '⊘',
    category: 'Interactive',
    description: 'No click interaction or behavior triggered',
    payloadType: 'none',
  },

  // Navigation
  {
    value: 'navigate-url',
    label: 'Open External URL',
    icon: '↗',
    category: 'Navigation',
    description: 'Open website link with support for opening in a new browser tab',
    payloadLabel: 'Target URL',
    payloadPlaceholder: 'https://example.com or /pricing',
    payloadType: 'url',
  },
  {
    value: 'navigate-page',
    label: 'Switch Canvas Page',
    icon: '📄',
    category: 'Navigation',
    description: 'Instantly transition to another page inside this project',
    payloadLabel: 'Target Page',
    payloadType: 'page',
  },
  {
    value: 'scroll-section',
    label: 'Scroll to Section / Anchor',
    icon: '⚓',
    category: 'Navigation',
    description: 'Smoothly scroll down or up to a specific section element',
    payloadLabel: 'Target Section ID or CSS Selector',
    payloadPlaceholder: '#features or el_12345',
    payloadType: 'elementId',
  },
  {
    value: 'scroll-top',
    label: 'Scroll to Top of Page',
    icon: '↑',
    category: 'Navigation',
    description: 'Smooth scroll viewport and canvas smoothly back to the top',
    payloadType: 'none',
  },
  {
    value: 'scroll-bottom',
    label: 'Scroll to Bottom / Footer',
    icon: '↓',
    category: 'Navigation',
    description: 'Smooth scroll viewport straight down to the bottom / footer',
    payloadType: 'none',
  },
  {
    value: 'back-to-previous',
    label: 'Go Back (History)',
    icon: '←',
    category: 'Navigation',
    description: 'Navigate back to the previous webpage in browser history',
    payloadType: 'none',
  },

  // Interactive & Forms
  {
    value: 'open-modal',
    label: 'Open Modal Dialog',
    icon: '🪟',
    category: 'Interactive',
    description: 'Display an interactive dialog overlay with custom title & message',
    payloadLabel: 'Dialog Message',
    payloadPlaceholder: 'Enter your popup dialog message...',
    payloadType: 'text',
  },
  {
    value: 'toggle-visibility',
    label: 'Toggle Element Visibility',
    icon: '👁️',
    category: 'Interactive',
    description: 'Show or hide a target container or element when clicked',
    payloadLabel: 'Target Element ID',
    payloadPlaceholder: 'e.g. el_pricing_table',
    payloadType: 'elementId',
  },
  {
    value: 'accordion-toggle',
    label: 'Accordion Expand / Collapse',
    icon: '↕️',
    category: 'Interactive',
    description: 'Expand and collapse an FAQ or accordion panel item smoothly',
    payloadLabel: 'Target Content Element ID',
    payloadPlaceholder: 'e.g. el_faq_body_1',
    payloadType: 'elementId',
  },
  {
    value: 'submit-form',
    label: 'Submit Form (Validation & Celebration)',
    icon: '🚀',
    category: 'Interactive',
    description: 'Validate inputs, show submission toast, and trigger celebration chime',
    payloadLabel: 'Success Message',
    payloadPlaceholder: 'Thanks for signing up! We will be in touch shortly.',
    payloadType: 'text',
  },
  {
    value: 'discount-reveal',
    label: 'Reveal Discount Code & Copy',
    icon: '🎁',
    category: 'Interactive',
    description: 'Unlocks a special promotional voucher code, confetti burst & copies to clipboard',
    payloadLabel: 'Discount Code',
    payloadPlaceholder: 'SAVE25 or VIP2026',
    payloadType: 'text',
  },
  {
    value: 'open-cart',
    label: 'Open Shopping Bag / Cart',
    icon: '🛍️',
    category: 'Interactive',
    description: 'Opens slide-out e-commerce shopping bag drawer with order summary and checkout',
    payloadType: 'none',
  },
  {
    value: 'add-to-cart',
    label: 'Add Item to Shopping Bag',
    icon: '🛒',
    category: 'Interactive',
    description: 'Adds configured product item to shopping bag and opens slide-over cart drawer',
    payloadType: 'none',
  },
  {
    value: 'checkout-stripe',
    label: 'Direct Checkout (Stripe / Link)',
    icon: '💳',
    category: 'Interactive',
    description: 'Redirects buyer directly to Stripe Payment Link or Lemon Squeezy checkout',
    payloadLabel: 'Checkout URL (Stripe Payment Link)',
    payloadPlaceholder: 'https://buy.stripe.com/test_...',
    payloadType: 'url',
  },

  // Effects & Audio
  {
    value: 'confetti',
    label: 'Trigger Confetti Burst',
    icon: '🎉',
    category: 'Effects & Audio',
    description: 'Celebratory particle confetti explosion from the click position',
    payloadType: 'none',
  },
  {
    value: 'play-sound',
    label: 'Play Audio Tone',
    icon: '🔊',
    category: 'Effects & Audio',
    description: 'Synthesize a crisp Web Audio chime or feedback sound effect',
    payloadLabel: 'Sound Effect Tone',
    payloadType: 'sound',
  },
  {
    value: 'toggle-dark-mode',
    label: 'Toggle Dark / Light Theme',
    icon: '🌓',
    category: 'Effects & Audio',
    description: 'Switch canvas & page background smoothly between light and dark modes',
    payloadType: 'none',
  },

  // Utility
  {
    value: 'copy-text',
    label: 'Copy Text to Clipboard',
    icon: '📋',
    category: 'Utility',
    description: 'Instantly copy snippet, coupon code, or promo text to user clipboard',
    payloadLabel: 'Text to Copy',
    payloadPlaceholder: 'Text or code to copy...',
    payloadType: 'text',
  },
  {
    value: 'alert',
    label: 'Show Toast Notification',
    icon: '🔔',
    category: 'Utility',
    description: 'Display an animated feedback toast banner on screen',
    payloadLabel: 'Toast Message',
    payloadPlaceholder: 'Action completed successfully!',
    payloadType: 'text',
  },
  {
    value: 'share-page',
    label: 'Share / Copy Page Link',
    icon: '🔗',
    category: 'Utility',
    description: 'Trigger native mobile Web Share sheet or copy URL to desktop clipboard',
    payloadType: 'none',
  },
  {
    value: 'download-file',
    label: 'Download File / Asset',
    icon: '⬇',
    category: 'Utility',
    description: 'Trigger instant browser file download from specified link',
    payloadLabel: 'Download URL / File Link',
    payloadPlaceholder: 'https://example.com/brochure.pdf',
    payloadType: 'url',
  },
  {
    value: 'print-page',
    label: 'Print Page / Save PDF',
    icon: '🖨️',
    category: 'Utility',
    description: 'Opens system browser print dialogue to print or save page as PDF',
    payloadType: 'none',
  },
  {
    value: 'launch-fullscreen',
    label: 'Toggle Fullscreen Mode',
    icon: '⛶',
    category: 'Utility',
    description: 'Enter or exit full-screen view in modern desktop & mobile browsers',
    payloadType: 'none',
  },
  {
    value: 'vibrate-device',
    label: 'Haptic Device Vibration',
    icon: '📳',
    category: 'Utility',
    description: 'Triggers gentle physical haptic feedback pulse on mobile devices',
    payloadType: 'none',
  },
  {
    value: 'reload-page',
    label: 'Reload / Refresh View',
    icon: '🔄',
    category: 'Utility',
    description: 'Refreshes current view or page state',
    payloadType: 'none',
  },

  // Communication
  {
    value: 'whatsapp',
    label: 'Chat on WhatsApp',
    icon: '💬',
    category: 'Communication',
    description: 'Direct 1-click WhatsApp conversation with prefilled message',
    payloadLabel: 'WhatsApp Phone Number & Message',
    payloadPlaceholder: '+14155552671?text=Hello!',
    payloadType: 'phone',
  },
  {
    value: 'email-mailto',
    label: 'Send Email (mailto:)',
    icon: '✉️',
    category: 'Communication',
    description: 'Open default email client with recipient and subject preloaded',
    payloadLabel: 'Email Address / Subject',
    payloadPlaceholder: 'contact@example.com?subject=Inquiry',
    payloadType: 'email',
  },
  {
    value: 'tel-call',
    label: 'Direct Phone Call (tel:)',
    icon: '📞',
    category: 'Communication',
    description: 'Click-to-call direct phone dialer on mobile and supported desktop apps',
    payloadLabel: 'Phone Number',
    payloadPlaceholder: '+14155552671',
    payloadType: 'phone',
  },
  {
    value: 'open-sms',
    label: 'Send SMS Text Message',
    icon: '📱',
    category: 'Communication',
    description: 'Opens native SMS messaging app with pre-filled number and body',
    payloadLabel: 'Phone Number & Text',
    payloadPlaceholder: '+14155552671?body=Hi there',
    payloadType: 'phone',
  },

  // Advanced
  {
    value: 'custom-js',
    label: 'Execute Custom JavaScript',
    icon: '⚡',
    category: 'Advanced',
    description: 'Execute custom JavaScript callback function with element & toast access',
    payloadLabel: 'JavaScript Code',
    payloadPlaceholder: 'toast("Hello from Custom JS!", "success");',
    payloadType: 'code',
  },
];

export interface ActionExecutionContext {
  project?: ProjectState;
  activePage?: Page;
  setActivePage?: (pageId: string) => void;
  updatePageSettings?: (pageId: string, settings: Partial<Page>) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  setHiddenElementIds?: React.Dispatch<React.SetStateAction<Set<string>>>;
  setActiveModal?: (modal: { title: string; body: string } | null) => void;
}

/**
 * Centrally executes an element's configured behavior action across Canvas, Preview, and Inspector
 */
export function executeElementAction(
  element: CanvasElement,
  context: ActionExecutionContext,
  e?: React.MouseEvent | MouseEvent
): void {
  const behavior = element.behavior || { actionType: 'none' };
  const { actionType, actionPayload, targetBlank, actionModalTitle, actionModalBody, actionTargetId } =
    behavior;

  if (actionType === 'none') {
    return;
  }

  try {
    trackAnalyticsEvent({
      type: actionType === 'add-to-cart' ? 'cart_add' : actionType === 'checkout-stripe' ? 'checkout' : 'click',
      targetName: element.content || element.name || element.id,
      pageSlug: context.project?.pages.find((p) => p.id === context.project?.activePageId)?.slug || 'home',
      device: typeof window !== 'undefined' && window.innerWidth < 640 ? 'mobile' : typeof window !== 'undefined' && window.innerWidth < 1024 ? 'tablet' : 'desktop',
      revenue: element.productConfig?.price || undefined,
    });
  } catch {}

  if (behavior.actionConfirm && typeof window !== 'undefined') {
    const msg = behavior.actionConfirmText || `Are you sure you want to proceed?`;
    if (!window.confirm(msg)) return;
  }

  if (behavior.actionSound) {
    playSound(behavior.actionSound);
  }

  const payload = actionPayload || '';
  const clientX = e && 'clientX' in e ? e.clientX : typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const clientY = e && 'clientY' in e ? e.clientY : typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

  switch (actionType) {
    case 'navigate-url': {
      if (!payload) {
        context.showToast('Please specify a destination URL for this button', 'warning');
        return;
      }
      if (payload.startsWith('#')) {
        const anchorId = payload.substring(1);
        const targetEl =
          document.getElementById(anchorId) ||
          document.querySelector(`[data-element-id="${anchorId}"]`) ||
          document.querySelector(`.${anchorId}`) ||
          document.querySelector(`.el-${anchorId}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          context.showToast(`Scrolled smoothly to #${anchorId}`, 'info');
        } else {
          context.showToast(`Target section #${anchorId} not found`, 'warning');
        }
        return;
      }
      const url = payload.startsWith('http://') || payload.startsWith('https://') || payload.startsWith('mailto:') || payload.startsWith('tel:')
        ? payload
        : `https://${payload}`;
      window.open(url, targetBlank ? '_blank' : '_self', 'noopener,noreferrer');
      break;
    }

    case 'navigate-page': {
      if (!context.setActivePage || !context.project) return;

      let targetPayload = payload;
      // If payload is an invalid URL leftover or empty, sanitize it to '__next__'
      if (!targetPayload || targetPayload.startsWith('http') || targetPayload === 'none') {
        targetPayload = '__next__';
      }

      if (context.project.pages.length <= 1) {
        context.showToast('This project currently has 1 page. Click "+" by the page name in the header to add more pages!', 'info');
        return;
      }

      let targetPage = context.project.pages.find((p) => p.id === targetPayload || p.slug === targetPayload);
      if (!targetPage && (targetPayload === '__next__' || targetPayload === 'next')) {
        const currIdx = context.project.pages.findIndex((p) => p.id === context.activePage?.id);
        targetPage = context.project.pages[(currIdx + 1) % context.project.pages.length];
      } else if (!targetPage && (targetPayload === '__prev__' || targetPayload === 'prev')) {
        const currIdx = context.project.pages.findIndex((p) => p.id === context.activePage?.id);
        targetPage = context.project.pages[(currIdx - 1 + context.project.pages.length) % context.project.pages.length];
      }

      if (!targetPage) {
        targetPage = context.project.pages.find((p) => p.id !== context.activePage?.id) || context.project.pages[0];
      }

      if (targetPage) {
        context.setActivePage(targetPage.id);
        context.showToast(`Navigated to page: ${targetPage.name}`, 'info');
      } else {
        context.showToast('Add another page in the header to navigate between pages', 'info');
      }
      break;
    }

    case 'scroll-section': {
      const targetId = (payload || actionTargetId || '').replace(/^#/, '');
      if (!targetId) {
        context.showToast('Please specify a target Section ID to scroll to', 'warning');
        return;
      }
      const targetEl =
        document.getElementById(targetId) ||
        document.querySelector(`[data-element-id="${targetId}"]`) ||
        document.querySelector(`.${targetId}`) ||
        document.querySelector(`.el-${targetId}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        context.showToast(`Scrolled smoothly to #${targetId}`, 'info');
      } else {
        context.showToast(`Target section #${targetId} not found in DOM`, 'warning');
      }
      break;
    }

    case 'scroll-top': {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('canvas:scroll-top'));
      const scrollable = document.querySelector('main') || document.querySelector('#canvas-scroll-container');
      if (scrollable) {
        scrollable.scrollTo({ top: 0, behavior: 'smooth' });
      }
      context.showToast('Scrolled back to top', 'info');
      break;
    }

    case 'scroll-bottom': {
      const targetY = typeof document !== 'undefined' ? Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) : 99999;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      const scrollable = document.querySelector('main') || document.querySelector('#canvas-scroll-container');
      if (scrollable) {
        scrollable.scrollTo({ top: scrollable.scrollHeight, behavior: 'smooth' });
      }
      context.showToast('Scrolled to bottom', 'info');
      break;
    }

    case 'back-to-previous': {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
        context.showToast('Navigated back to previous page', 'info');
      } else {
        context.showToast('No previous browser page in history', 'info');
      }
      break;
    }

    case 'open-modal': {
      const title = actionModalTitle || 'Interactive Dialog';
      const body = actionModalBody || payload || 'This is an interactive dialog popup triggered by your button action.';
      if (context.setActiveModal) {
        context.setActiveModal({ title, body });
      } else {
        context.showToast(`🪟 ${title}: ${body}`, 'info');
      }
      break;
    }

    case 'toggle-visibility': {
      const targetId = (actionTargetId || payload).replace(/^#/, '');
      if (!targetId) {
        context.showToast('Please select a target element to toggle', 'warning');
        return;
      }
      if (context.setHiddenElementIds) {
        context.setHiddenElementIds((prev) => {
          const next = new Set(prev);
          const isHidden = next.has(targetId);
          if (isHidden) {
            next.delete(targetId);
            context.showToast(`Element #${targetId} is now visible`, 'info');
          } else {
            next.add(targetId);
            context.showToast(`Element #${targetId} is now hidden`, 'info');
          }
          return next;
        });
      } else {
        const domEl = document.getElementById(targetId) || document.querySelector(`[data-element-id="${targetId}"]`) as HTMLElement;
        if (domEl) {
          domEl.style.display = domEl.style.display === 'none' ? '' : 'none';
          context.showToast(`Toggled visibility of #${targetId}`, 'info');
        } else {
          context.showToast(`Toggled visibility for element #${targetId}`, 'info');
        }
      }
      break;
    }

    case 'accordion-toggle': {
      const targetId = (actionTargetId || payload).replace(/^#/, '');
      const domEl = (targetId ? (document.getElementById(targetId) || document.querySelector(`[data-element-id="${targetId}"]`)) : null) as HTMLElement;
      if (domEl) {
        const isHidden = domEl.style.display === 'none' || domEl.getAttribute('aria-hidden') === 'true';
        domEl.style.display = isHidden ? 'block' : 'none';
        domEl.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
        context.showToast(isHidden ? 'Accordion expanded' : 'Accordion collapsed', 'info');
      } else {
        context.showToast('Accordion panel toggled', 'info');
      }
      break;
    }

    case 'submit-form': {
      playSound('success');
      triggerConfetti(clientX, clientY);
      const defaultMsg = payload || element.formConfig?.successMessage || '🎉 Form submitted successfully!';
      context.showToast(defaultMsg, 'success');

      if (context.activePage) {
        executeFormSubmission(element, context.activePage, context.project, clientX, clientY).then((res) => {
          if (!res.success && res.error) {
            context.showToast(res.error, 'warning');
          }
        });
      }
      break;
    }

    case 'discount-reveal': {
      const code = payload || 'SAVE25';
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(code).catch(() => {});
      }
      triggerConfetti(clientX, clientY);
      playSound('chime');
      context.showToast(`🎁 Promo Code "${code}" unlocked & copied to clipboard!`, 'success');
      break;
    }

    case 'confetti': {
      triggerConfetti(clientX, clientY);
      playSound('success');
      context.showToast('🎉 Confetti Celebration!', 'success');
      break;
    }

    case 'play-sound': {
      const soundType = (payload as SoundEffectType) || 'success';
      playSound(soundType);
      context.showToast(`🔊 Sound effect played: ${soundType}`, 'info');
      break;
    }

    case 'toggle-dark-mode': {
      if (context.activePage && context.updatePageSettings) {
        const bg = context.activePage.backgroundColor.toLowerCase();
        const isDark = bg !== '#ffffff' && bg !== '#f8fafc' && bg !== '#fafaf9';
        const newBg = isDark ? '#ffffff' : '#0c0e14';
        context.updatePageSettings(context.activePage.id, { backgroundColor: newBg });
        context.showToast(`Switched to ${isDark ? 'Light' : 'Dark'} mode`, 'info');
      } else {
        if (typeof document !== 'undefined') {
          const bodyBg = document.body.style.backgroundColor;
          const isDark = bodyBg === 'rgb(12, 14, 20)' || bodyBg === '#0c0e14';
          document.body.style.backgroundColor = isDark ? '#ffffff' : '#0c0e14';
          context.showToast(`Switched to ${isDark ? 'Light' : 'Dark'} theme`, 'info');
        }
      }
      break;
    }

    case 'copy-text': {
      if (!payload) {
        context.showToast('Please enter text to copy in the button payload', 'warning');
        return;
      }
      const doSuccess = () => {
        playSound('pop');
        triggerConfetti(clientX, clientY);
        context.showToast(`📋 Copied to clipboard: "${payload}"`, 'success');
      };
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload).then(doSuccess).catch(() => {
          try {
            const ta = document.createElement('textarea');
            ta.value = payload;
            ta.setAttribute('readonly', '');
            ta.style.position = 'absolute';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            doSuccess();
          } catch {
            context.showToast(`Copied text: "${payload}"`, 'info');
          }
        });
      } else {
        try {
          const ta = document.createElement('textarea');
          ta.value = payload;
          ta.setAttribute('readonly', '');
          ta.style.position = 'absolute';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          doSuccess();
        } catch {
          context.showToast(`Copied text: "${payload}"`, 'info');
        }
      }
      break;
    }

    case 'alert': {
      context.showToast(payload || 'Button clicked! Action triggered successfully.', 'success');
      playSound('bell');
      break;
    }

    case 'share-page': {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator
          .share({
            title: context.project?.name || 'Shared Website',
            url: window.location.href,
          })
          .catch(() => {});
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        context.showToast('Copied page link to clipboard!', 'success');
      }
      break;
    }

    case 'download-file': {
      if (!payload) {
        context.showToast('Please provide a file URL to download', 'warning');
        return;
      }
      const a = document.createElement('a');
      a.href = payload;
      a.download = payload.split('/').pop() || 'download';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      context.showToast(`Downloading: ${payload.split('/').pop() || 'file'}`, 'info');
      break;
    }

    case 'print-page': {
      if (typeof window !== 'undefined') {
        window.print();
        context.showToast('Opening print preview dialog...', 'info');
      }
      break;
    }

    case 'launch-fullscreen': {
      if (typeof document !== 'undefined') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
          context.showToast('Entered full-screen mode', 'info');
        } else {
          document.exitFullscreen?.().catch(() => {});
          context.showToast('Exited full-screen mode', 'info');
        }
      }
      break;
    }

    case 'vibrate-device': {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
        context.showToast('📳 Haptic pulse triggered', 'info');
      } else {
        playSound('pop');
        context.showToast('Vibration not supported on this device; played audio feedback', 'info');
      }
      break;
    }

    case 'reload-page': {
      context.showToast('Page refreshed', 'info');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('editor:refresh'));
      }
      break;
    }

    case 'whatsapp': {
      const clean = payload.replace(/[^0-9]/g, '');
      if (!clean) {
        context.showToast('Please enter a WhatsApp phone number with country code', 'warning');
        return;
      }
      window.open(`https://wa.me/${clean}`, '_blank');
      break;
    }

    case 'email-mailto': {
      const mailto = payload.startsWith('mailto:') ? payload : `mailto:${payload}`;
      window.location.href = mailto;
      context.showToast(`Opening email composer for: ${payload}`, 'info');
      break;
    }

    case 'tel-call': {
      const tel = payload.startsWith('tel:') ? payload : `tel:${payload}`;
      window.location.href = tel;
      context.showToast(`Calling phone number: ${payload}`, 'info');
      break;
    }

    case 'open-sms': {
      const sms = payload.startsWith('sms:') ? payload : `sms:${payload}`;
      window.location.href = sms;
      context.showToast(`Opening SMS composer for: ${payload}`, 'info');
      break;
    }

    case 'custom-js': {
      if (!payload) {
        context.showToast('Please specify JavaScript code to execute', 'warning');
        return;
      }
      try {
        const fn = new Function('element', 'toast', 'playSound', 'confetti', payload);
        fn(element, context.showToast, playSound, triggerConfetti);
        context.showToast('Custom JavaScript executed successfully', 'success');
      } catch (err: any) {
        context.showToast(`JS Error: ${err.message}`, 'warning');
      }
      break;
    }

    case 'open-cart': {
      setCartOpen(true);
      context.showToast('Shopping Bag opened', 'info');
      break;
    }

    case 'add-to-cart': {
      if (element.productConfig) {
        addProductConfigToCart(element.productConfig);
        context.showToast(`Added "${element.productConfig.title}" to Shopping Bag!`, 'success');
      } else {
        addToCart({
          productId: element.id,
          title: element.content || element.name || 'Product Item',
          price: 99,
          currency: '$',
          imageUrl: element.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        });
        context.showToast('Added item to Shopping Bag!', 'success');
      }
      break;
    }

    case 'checkout-stripe': {
      const url = payload || element.productConfig?.checkoutUrl || 'https://checkout.stripe.com/test';
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
      context.showToast('Redirecting to secure Stripe Checkout...', 'info');
      break;
    }

    default:
      context.showToast(`Action "${actionType}" triggered`, 'info');
  }
}
