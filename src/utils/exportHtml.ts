import type { CanvasElement } from '../types/editor';
import { computeResponsiveLayout } from './responsiveLayout';
import { SHAPE_DEFINITIONS, getShapeSvgNode } from './shapeDefinitions';
import { getButtonIconSvg } from './buttonStyles';
import { generateMotionKeyframesCss, generateScrollObserverScript } from './motionAnimations';

export function generateExportHtml(
  project: {
    name: string;
    pages: {
      name: string;
      slug?: string;
      backgroundColor?: string;
      canvasWidth: number;
      canvasHeight: number;
      elements: CanvasElement[];
    }[];
  },
  activePage: {
    name: string;
    slug?: string;
    backgroundColor?: string;
    canvasWidth: number;
    canvasHeight: number;
    elements: CanvasElement[];
  }
): string {
  const page = activePage;
  const baseW = page.canvasWidth || 1200;
  const baseH = page.canvasHeight || 800;

  // Helper to generate desktop base CSS for an element
  const generateElementCss = (el: CanvasElement) => {
    const s = el.styles || {};
    const h = el.behavior?.hoverStyles;
    const l = el.layout;
    const isSticky = s.isSticky;

    let css = `  .el-${el.id} {
    position: ${isSticky ? 'sticky' : 'absolute'};
    left: ${el.x}px;
    top: ${isSticky ? (s.stickyTop ?? 0) : el.y}px;
    width: ${el.width}px;
    height: ${el.height}px;
    z-index: ${isSticky ? 40 : (el.zIndex || (el.type === 'section' ? 0 : 1))};
    box-sizing: border-box;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
`;
    if (s.backgroundColor && el.type !== 'shape') css += `    background-color: ${s.backgroundColor};\n`;
    if (s.color) css += `    color: ${s.color};\n`;
    if (s.fontSize) css += `    font-size: ${s.fontSize}px;\n`;
    if (s.fontWeight) css += `    font-weight: ${s.fontWeight};\n`;
    if (s.fontFamily) css += `    font-family: ${s.fontFamily};\n`;
    if (s.textAlign) css += `    text-align: ${s.textAlign};\n`;
    if (s.lineHeight) css += `    line-height: ${s.lineHeight};\n`;
    if (s.borderRadius && el.type !== 'shape') css += `    border-radius: ${s.borderRadius}px;\n`;
    if (s.borderWidth && s.borderStyle && s.borderStyle !== 'none' && el.type !== 'shape') {
      css += `    border: ${s.borderWidth}px ${s.borderStyle} ${s.borderColor || 'transparent'};\n`;
    }
    if (s.boxShadow && el.type !== 'shape') css += `    box-shadow: ${s.boxShadow};\n`;
    if (s.opacity !== undefined) css += `    opacity: ${s.opacity};\n`;
    if (s.objectFit) css += `    object-fit: ${s.objectFit};\n`;

    // Flex layout support for Section and Container
    if (el.type === 'section' || el.type === 'container' || l) {
      const dir = l?.direction || 'column';
      const gap = l?.gap !== undefined ? l.gap : 16;
      const pad = l?.padding || { top: 20, right: 20, bottom: 20, left: 20 };
      const align = l?.align || l?.alignItems || 'start';
      const justify = l?.justify || l?.justifyContent || 'start';
      css += `    display: flex;\n    flex-direction: ${dir};\n    gap: ${gap}px;\n    padding: ${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px;\n    align-items: ${align};\n    justify-content: ${justify};\n`;
    }

    if (el.role === 'button' || el.role === 'link' || el.type === 'button') {
      css += `    cursor: pointer;\n    display: inline-flex;\n    align-items: center;\n    gap: 8px;\n    justify-content: ${s.textAlign === 'left' ? 'flex-start' : s.textAlign === 'right' ? 'flex-end' : 'center'};\n    text-decoration: none;\n`;
    }

    // Motion Animation Styling (Entrance / Hover / Scroll)
    if (s.animationName && s.animationName !== 'none') {
      const duration = s.animationDuration || 0.7;
      const timing = s.animationTimingFunction || 'cubic-bezier(0.16, 1, 0.3, 1)';
      const delay = s.animationDelay || 0;
      const iteration = s.animationIterationCount || '1';
      const animRule = `${s.animationName} ${duration}s ${timing} ${delay}s ${iteration} both`;

      if (s.animationTrigger === 'entrance' || !s.animationTrigger) {
        css += `    animation: ${animRule};\n`;
      }
    }
    css += `  }\n`;

    // Scroll-triggered animation class
    if (s.animationName && s.animationName !== 'none' && s.animationTrigger === 'scroll') {
      const duration = s.animationDuration || 0.7;
      const timing = s.animationTimingFunction || 'cubic-bezier(0.16, 1, 0.3, 1)';
      const delay = s.animationDelay || 0;
      const iteration = s.animationIterationCount || '1';
      css += `  .el-${el.id}.is-in-view {\n    animation: ${s.animationName} ${duration}s ${timing} ${delay}s ${iteration} both;\n  }\n`;
    }

    // Hover-triggered animation
    if (s.animationName && s.animationName !== 'none' && s.animationTrigger === 'hover') {
      const duration = s.animationDuration || 0.7;
      const timing = s.animationTimingFunction || 'cubic-bezier(0.16, 1, 0.3, 1)';
      const delay = s.animationDelay || 0;
      const iteration = s.animationIterationCount || '1';
      css += `  .el-${el.id}:hover {\n    animation: ${s.animationName} ${duration}s ${timing} ${delay}s ${iteration} both;\n  }\n`;
    }

    if (h) {
      css += `  .el-${el.id}:hover {\n`;
      if (h.backgroundColor) css += `    background-color: ${h.backgroundColor};\n`;
      if (h.color) css += `    color: ${h.color};\n`;
      if (h.borderColor) css += `    border-color: ${h.borderColor};\n`;
      if (h.boxShadow) css += `    box-shadow: ${h.boxShadow};\n`;
      if (h.opacity !== undefined) css += `    opacity: ${h.opacity};\n`;
      const trans: string[] = [];
      if (h.translateY !== undefined) trans.push(`translateY(${h.translateY}px)`);
      if (h.scale !== undefined) trans.push(`scale(${h.scale})`);
      if (trans.length > 0) css += `    transform: ${trans.join(' ')};\n`;
      css += `  }\n`;
    }

    const act = el.behavior?.activeStyles;
    if (act) {
      css += `  .el-${el.id}:active {\n`;
      if (act.backgroundColor) css += `    background-color: ${act.backgroundColor};\n`;
      if (act.color) css += `    color: ${act.color};\n`;
      if (act.borderColor) css += `    border-color: ${act.borderColor};\n`;
      if (act.boxShadow) css += `    box-shadow: ${act.boxShadow};\n`;
      if (act.opacity !== undefined) css += `    opacity: ${act.opacity};\n`;
      const trans: string[] = [];
      if (act.translateY !== undefined) trans.push(`translateY(${act.translateY}px)`);
      if (act.scale !== undefined) trans.push(`scale(${act.scale})`);
      if (trans.length > 0) css += `    transform: ${trans.join(' ')};\n`;
      css += `  }\n`;
    }

    const foc = el.behavior?.focusStyles;
    if (foc) {
      css += `  .el-${el.id}:focus, .el-${el.id}:focus-visible {\n`;
      if (foc.outlineColor) css += `    outline: ${foc.outlineWidth || 2}px solid ${foc.outlineColor};\n    outline-offset: 2px;\n`;
      if (foc.borderColor) css += `    border-color: ${foc.borderColor};\n`;
      if (foc.boxShadow) css += `    box-shadow: ${foc.boxShadow};\n`;
      if (foc.backgroundColor) css += `    background-color: ${foc.backgroundColor};\n`;
      if (foc.color) css += `    color: ${foc.color};\n`;
      css += `  }\n`;
    }

    return css;
  };

  // Build element tree for hierarchical HTML generation
  const elementMap = new Map<string, CanvasElement>();
  const childrenMap = new Map<string, CanvasElement[]>();
  const rootElements: CanvasElement[] = [];

  for (const el of page.elements) {
    elementMap.set(el.id, el);
  }

  for (const el of page.elements) {
    if (el.parentId && elementMap.has(el.parentId)) {
      const list = childrenMap.get(el.parentId) || [];
      list.push(el);
      childrenMap.set(el.parentId, list);
    } else {
      rootElements.push(el);
    }
  }

  // Sort children based on parent children array order
  childrenMap.forEach((children, parentId) => {
    const parent = elementMap.get(parentId);
    if (parent?.children && parent.children.length > 0) {
      children.sort((a, b) => {
        const idxA = parent.children!.indexOf(a.id);
        const idxB = parent.children!.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return a.y - b.y;
      });
    }
  });

  // Recursive HTML generator that preserves hierarchy
  const renderElementTree = (el: CanvasElement, indentLevel = 2): string => {
    const indent = '  '.repeat(indentLevel);
    const children = childrenMap.get(el.id) || [];
    const childrenHtml = children.map((c) => renderElementTree(c, indentLevel + 1)).join('\n');

    const role = el.role;
    const text = el.content || '';
    const beh = el.behavior || { actionType: 'none' };
    const action = beh.actionType;
    const payload = beh.actionPayload || '';
    let clickAttr = '';

    if (action === 'navigate-url' && payload) {
      if (payload.startsWith('#')) {
        const target = payload.slice(1);
        clickAttr = ` onclick="document.querySelector('#${target}, .el-${target}')?.scrollIntoView({behavior: 'smooth'})"`;
      } else {
        if (role === 'link') {
          return `${indent}<a href="${payload}" target="${beh.targetBlank ? '_blank' : '_self'}" class="el-${el.id}">${text}</a>`;
        }
        clickAttr = ` onclick="window.open('${payload}', '${beh.targetBlank ? '_blank' : '_self'}')"`;
      }
    } else if (action === 'navigate-page' && payload) {
      const targetPage = project.pages?.find(
        (p: any) => p.id === payload || p.slug === payload || p.name?.toLowerCase() === payload?.toLowerCase()
      );
      const targetSlug = targetPage?.slug || targetPage?.name?.toLowerCase().replace(/\s+/g, '-') || 'index';
      const targetFile = targetPage
        ? (targetSlug === '/' || targetSlug === 'index' ? 'index.html' : `${targetSlug.replace(/^\//, '')}.html`)
        : (payload === '/' ? 'index.html' : `${payload.replace(/^\//, '')}.html`);
      clickAttr = ` onclick="window.location.href='${targetFile}'"`;
    } else if (action === 'scroll-section') {
      const target = (payload || '').replace(/^#/, '');
      clickAttr = ` onclick="document.querySelector('#${target}, .el-${target}')?.scrollIntoView({behavior: 'smooth'})"`;
    } else if (action === 'scroll-top') {
      clickAttr = ` onclick="window.scrollTo({top: 0, behavior: 'smooth'})"`;
    } else if (action === 'scroll-bottom') {
      clickAttr = ` onclick="window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})"`;
    } else if (action === 'back-to-previous') {
      clickAttr = ` onclick="window.history.back()"`;
    } else if (action === 'print-page') {
      clickAttr = ` onclick="window.print()"`;
    } else if (action === 'launch-fullscreen') {
      clickAttr = ` onclick="if(!document.fullscreenElement){document.documentElement.requestFullscreen()}else{document.exitFullscreen()}"`;
    } else if (action === 'vibrate-device') {
      clickAttr = ` onclick="if(navigator.vibrate)navigator.vibrate([100,50,100])"`;
    } else if (action === 'reload-page') {
      clickAttr = ` onclick="window.location.reload()"`;
    } else if (action === 'open-sms') {
      clickAttr = ` onclick="window.location.href='sms:${payload}'"`;
    } else if (action === 'discount-reveal') {
      clickAttr = ` onclick="navigator.clipboard.writeText('${payload || 'SAVE25'}');alert('🎉 Promo Code &quot;${payload || 'SAVE25'}&quot; copied to clipboard!')"`;
    } else if (action === 'submit-form') {
      const successMsg = (payload || el.formConfig?.successMessage || 'Form submitted successfully! Thank you.').replace(/'/g, "\\'");
      clickAttr = ` onclick="submitStudioLead(this, '${successMsg}')"`;
    } else if (action === 'accordion-toggle') {
      const target = (beh.actionTargetId || payload || '').replace(/^#/, '');
      clickAttr = ` onclick="const t=document.querySelector('#${target}, .el-${target}');if(t){t.style.display=t.style.display==='none'?'block':'none'}"`;
    } else if (action === 'open-modal') {
      const modalTitle = (beh.actionModalTitle || 'Notification').replace(/'/g, "\\'");
      const modalBody = (beh.actionModalBody || payload || '').replace(/'/g, "\\'");
      clickAttr = ` onclick="alert('${modalTitle}\\n\\n${modalBody}')"`;
    } else if (action === 'toggle-visibility') {
      const targetId = (beh.actionTargetId || payload || '').replace(/^#/, '');
      clickAttr = ` onclick="const target=document.querySelector('#${targetId}, .el-${targetId}');if(target){target.style.display=target.style.display==='none'?'flex':'none'}"`;
    } else if (action === 'copy-text' && payload) {
      clickAttr = ` onclick="navigator.clipboard.writeText('${payload.replace(/'/g, "\\'")}').then(()=>alert('Copied to clipboard!'))"`;
    } else if (action === 'alert' && payload) {
      clickAttr = ` onclick="alert('${payload.replace(/'/g, "\\'")}')"`;
    } else if (action === 'email-mailto' && payload) {
      const mailto = payload.startsWith('mailto:') ? payload : `mailto:${payload}`;
      clickAttr = ` onclick="window.location.href='${mailto}'"`;
    } else if (action === 'tel-call' && payload) {
      const tel = payload.startsWith('tel:') ? payload : `tel:${payload}`;
      clickAttr = ` onclick="window.location.href='${tel}'"`;
    } else if (action === 'download-file' && payload) {
      clickAttr = ` onclick="const a=document.createElement('a');a.href='${payload}';a.download='';a.click();"`;
    } else if (action === 'custom-js' && payload) {
      clickAttr = ` onclick="${payload.replace(/"/g, '&quot;')}"`;
    } else if (action === 'confetti') {
      clickAttr = ` onclick="alert('🎉 Confetti Celebration!')"`;
    } else if (action === 'play-sound') {
      clickAttr = ` onclick="try{const c=new(window.AudioContext||window.webkitAudioContext)();const o=c.createOscillator();const g=c.createGain();o.frequency.value=520;o.connect(g);g.connect(c.destination);o.start();g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.3);o.stop(c.currentTime+0.3);}catch(e){}"`;
    } else if (action === 'toggle-dark-mode') {
      clickAttr = ` onclick="document.body.style.backgroundColor = document.body.style.backgroundColor === 'rgb(12, 14, 20)' ? '#ffffff' : '#0c0e14'"`;
    } else if (action === 'whatsapp' && payload) {
      clickAttr = ` onclick="window.open('https://wa.me/${payload.replace(/[^0-9]/g, '')}', '_blank')"`;
    } else if (action === 'share-page') {
      clickAttr = ` onclick="if(navigator.share){navigator.share({title:document.title,url:window.location.href})}else{navigator.clipboard.writeText(window.location.href);alert('Link copied to clipboard!')}"`;
    } else if (action === 'open-cart') {
      clickAttr = ` onclick="studioToggleCart(true)"`;
    } else if (action === 'add-to-cart') {
      const pTitle = (el.productConfig?.title || el.content || el.name || 'Store Item').replace(/'/g, "\\'");
      const pPrice = el.productConfig?.price || 99;
      const pCurr = (el.productConfig?.currency || '$').replace(/'/g, "\\'");
      const pImg = (el.productConfig?.imageUrl || el.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80').replace(/'/g, "\\'");
      clickAttr = ` onclick="studioAddToCart('${el.id}', '${pTitle}', ${pPrice}, '${pCurr}', '${pImg}')"`;
    } else if (action === 'checkout-stripe') {
      const checkoutUrl = payload || el.productConfig?.checkoutUrl || 'https://checkout.stripe.com/test';
      clickAttr = ` onclick="window.open('${checkoutUrl}', '_blank')"`;
    }

    // Scroll motion attribute
    if (el.styles?.animationName && el.styles.animationName !== 'none' && el.styles.animationTrigger === 'scroll') {
      clickAttr += ' data-motion-scroll="true"';
    }

    // Image element (or semantic image role)
    if (el.type === 'image' || role === 'image') {
      const imgSrc =
        el.imageUrl ||
        el.content ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
      const altText = el.styles?.alt || el.name || 'Image';
      return `${indent}<img class="el-${el.id}" id="${el.id}" src="${imgSrc}" alt="${altText.replace(/"/g, '&quot;')}"${clickAttr} />`;
    }

    // Shape tag
    if (el.type === 'shape') {
      const shapeKind = el.styles.shapeKind || 'circle';
      const def = SHAPE_DEFINITIONS[shapeKind] || SHAPE_DEFINITIONS.circle;
      const fill = el.styles.gradient || el.styles.backgroundColor || def.defaultColor;
      const stroke = el.styles.borderColor || 'none';
      const strokeW = el.styles.borderWidth || 0;
      const svgNode = getShapeSvgNode(shapeKind, fill, stroke, strokeW);
      let svgInner = '';
      if (svgNode.tag === 'circle') svgInner = `<circle cx="50" cy="50" r="47" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />`;
      else if (svgNode.tag === 'rect') svgInner = `<rect x="2" y="2" width="96" height="96" rx="${shapeKind === 'pill' ? 36 : shapeKind === 'rounded-rect' ? 16 : 0}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />`;
      else if (svgNode.tag === 'polygon') svgInner = `<polygon points="${(svgNode.props as any).points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />`;
      else if (svgNode.tag === 'path') svgInner = `<path d="${(svgNode.props as any).d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />`;

      return `${indent}<div class="el-${el.id}" id="${el.id}"${clickAttr}>\n${indent}  <svg viewBox="${def.viewBox}" style="width:100%;height:100%;" preserveAspectRatio="none">${svgInner}</svg>\n${indent}</div>`;
    }

    // Section tag
    if (el.type === 'section') {
      if (childrenHtml) {
        return `${indent}<section class="el-${el.id}" id="${el.id}"${clickAttr}>\n${childrenHtml}\n${indent}</section>`;
      }
      return `${indent}<section class="el-${el.id}" id="${el.id}"${clickAttr}>${text ? `\n${indent}  ${text}\n${indent}` : ''}</section>`;
    }

    // Container tag (or semantic container)
    if (el.type === 'container' || role === 'container') {
      if (childrenHtml) {
        return `${indent}<div class="el-${el.id}" id="${el.id}"${clickAttr}>\n${childrenHtml}\n${indent}</div>`;
      }
      return `${indent}<div class="el-${el.id}" id="${el.id}"${clickAttr}>${text ? `<div>${text}</div>` : ''}</div>`;
    }

    // Native interactive form inputs
    if (el.type === 'input' || role === 'input') {
      const inputType =
        el.formConfig?.inputType ||
        (el.name.toLowerCase().includes('email')
          ? 'email'
          : el.name.toLowerCase().includes('password')
          ? 'password'
          : 'text');
      const placeholder = (el.formConfig?.placeholder || text || `Enter ${el.name || 'text'}...`).replace(/"/g, '&quot;');
      const req = el.formConfig?.required ? ' required' : '';
      const fName = (el.formConfig?.fieldName || el.name || 'field').replace(/"/g, '&quot;');
      return `${indent}<input class="el-${el.id}" id="${el.id}" type="${inputType}" name="${fName}" placeholder="${placeholder}"${req}${clickAttr} />`;
    }

    if (el.type === 'textarea') {
      const placeholder = (el.formConfig?.placeholder || text || `Enter ${el.name || 'message'}...`).replace(/"/g, '&quot;');
      const req = el.formConfig?.required ? ' required' : '';
      const fName = (el.formConfig?.fieldName || el.name || 'message').replace(/"/g, '&quot;');
      return `${indent}<textarea class="el-${el.id}" id="${el.id}" name="${fName}" placeholder="${placeholder}" rows="3"${req}${clickAttr}></textarea>`;
    }

    if (el.type === 'select') {
      const options = el.formConfig?.options || ['Option 1', 'Option 2', 'Option 3'];
      const req = el.formConfig?.required ? ' required' : '';
      const fName = (el.formConfig?.fieldName || el.name || 'select').replace(/"/g, '&quot;');
      const optHtml = options.map((opt) => `\n${indent}  <option value="${opt.replace(/"/g, '&quot;')}">${opt}</option>`).join('');
      return `${indent}<select class="el-${el.id}" id="${el.id}" name="${fName}"${req}${clickAttr}>${optHtml}\n${indent}</select>`;
    }

    if (el.type === 'checkbox') {
      const checked = el.formConfig?.checked ? ' checked' : '';
      const labelText = text || 'I agree';
      const fName = (el.formConfig?.fieldName || el.name || 'checkbox').replace(/"/g, '&quot;');
      return `${indent}<label class="el-${el.id}" id="${el.id}" style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" name="${fName}"${checked}${clickAttr} /> <span>${labelText}</span></label>`;
    }

    if (el.type === 'accordion') {
      const items = el.accordionConfig?.items || [
        { id: '1', title: 'How does it work?', content: 'Everything runs in real-time in the browser and cloud.', isOpen: true },
      ];
      const itemsHtml = items.map((it) => {
        const openAttr = it.isOpen ? ' open' : '';
        return `\n${indent}  <details class="accordion-item"${openAttr} style="border-bottom: 1px solid rgba(255,255,255,0.1); padding: 12px 16px;">
${indent}    <summary style="font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; list-style: none;">
${indent}      <span>${it.title.replace(/"/g, '&quot;')}</span>
${indent}      <span style="font-size: 14px; opacity: 0.7;">▼</span>
${indent}    </summary>
${indent}    <div style="padding-top: 8px; font-size: 13px; line-height: 1.6; opacity: 0.85;">${it.content}</div>
${indent}  </details>`;
      }).join('');
      return `${indent}<div class="el-${el.id}" id="${el.id}" style="overflow-y:auto;"${clickAttr}>${itemsHtml}\n${indent}</div>`;
    }

    if (el.type === 'carousel') {
      const slides = el.carouselConfig?.slides || [
        { id: '1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80', caption: 'Creative Flow' },
      ];
      const slidesHtml = slides.map((sl, i) => `\n${indent}    <img class="carousel-slide ${i === 0 ? 'active' : ''}" src="${sl.url}" alt="${(sl.caption || 'Slide').replace(/"/g, '&quot;')}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: ${i === 0 ? '1' : '0'}; transition: opacity 0.5s ease;" />`).join('');
      const dotsHtml = (el.carouselConfig?.showDots ?? true) && slides.length > 1
        ? `\n${indent}  <div class="carousel-dots" style="position: absolute; bottom: 12px; inset-x: 0; display: flex; justify-content: center; gap: 6px;">` +
          slides.map((_, i) => `<span class="dot" data-index="${i}" onclick="setCarouselSlide('${el.id}', ${i})" style="width: 8px; height: 8px; border-radius: 50%; background: ${i === 0 ? '#fff' : 'rgba(255,255,255,0.4)'}; cursor: pointer; transition: all 0.2s;"></span>`).join('') +
          `</div>`
        : '';
      const arrowsHtml = (el.carouselConfig?.showArrows ?? true) && slides.length > 1
        ? `\n${indent}  <button type="button" onclick="stepCarouselSlide('${el.id}', -1)" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.6); color: white; border: none; cursor: pointer;">❮</button>
${indent}  <button type="button" onclick="stepCarouselSlide('${el.id}', 1)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.6); color: white; border: none; cursor: pointer;">❯</button>`
        : '';
      return `${indent}<div class="el-${el.id} studio-carousel" id="${el.id}" data-autoplay="${el.carouselConfig?.autoplay ?? true}" data-interval="${el.carouselConfig?.interval || 4}" style="position: relative; overflow: hidden;"${clickAttr}>\n${indent}  <div class="carousel-track" style="position: absolute; inset: 0;">${slidesHtml}\n${indent}  </div>${arrowsHtml}${dotsHtml}\n${indent}</div>`;
    }

    if (el.type === 'video') {
      const rawUrl = el.videoConfig?.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const autoplay = el.videoConfig?.autoplay ?? false;
      const controls = el.videoConfig?.controls ?? true;
      const loop = el.videoConfig?.loop ?? false;
      const muted = el.videoConfig?.muted ?? false;
      
      const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (ytMatch && ytMatch[1]) {
        const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&rel=0`;
        return `${indent}<div class="el-${el.id}" id="${el.id}" style="overflow: hidden;"${clickAttr}><iframe src="${embedUrl}" style="width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
      }
      return `${indent}<div class="el-${el.id}" id="${el.id}" style="overflow: hidden;"${clickAttr}><video src="${rawUrl}" style="width:100%;height:100%;object-fit:cover;"${controls ? ' controls' : ''}${autoplay ? ' autoplay' : ''}${loop ? ' loop' : ''}${muted ? ' muted' : ''}></video></div>`;
    }

    if (el.type === 'counter') {
      const target = el.counterConfig?.targetValue ?? 99.9;
      const prefix = el.counterConfig?.prefix || '';
      const suffix = el.counterConfig?.suffix || '%';
      const label = el.counterConfig?.label || 'Uptime Guarantee';
      const duration = el.counterConfig?.duration || 2;
      const decimals = el.counterConfig?.decimals ?? (target % 1 !== 0 ? 1 : 0);
      return `${indent}<div class="el-${el.id} studio-counter" id="${el.id}" data-target="${target}" data-duration="${duration}" data-decimals="${decimals}" data-prefix="${prefix}" data-suffix="${suffix}" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;"${clickAttr}>
${indent}  <div class="counter-number" style="font-size: 2.2em; font-weight: 800; line-height: 1;">${prefix}${target}${suffix}</div>
${indent}  <div class="counter-label" style="font-size: 0.8em; opacity: 0.7; margin-top: 4px;">${label}</div>
${indent}</div>`;
    }

    if (el.type === 'product-card') {
      const cfg = el.productConfig || {
        title: 'Product Item',
        price: 199,
        compareAtPrice: 249,
        currency: '$',
        badge: 'BEST SELLER',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        buttonText: 'Add to Bag',
        variants: ['Default'],
      };
      const titleEsc = (cfg.title || 'Product Item').replace(/"/g, '&quot;');
      const curr = cfg.currency || '$';
      const badgeHtml = cfg.badge
        ? `<div style="position: absolute; top: 12px; left: 12px; padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; box-shadow: 0 4px 12px rgba(37,99,235,0.4);">${cfg.badge}</div>`
        : '';
      const compareHtml = cfg.compareAtPrice && cfg.compareAtPrice > cfg.price
        ? `<span style="font-size: 0.8em; opacity: 0.5; text-decoration: line-through; margin-left: 6px;">${curr}${cfg.compareAtPrice}</span>`
        : '';
      const variantsHtml = cfg.variants && cfg.variants.length > 1
        ? `<div style="display: flex; gap: 6px; margin: 8px 0; flex-wrap: wrap;">` +
          cfg.variants.map((v, i) => `<span style="font-size: 11px; padding: 2px 8px; border-radius: 6px; background: ${i === 0 ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.06)'}; border: 1px solid ${i === 0 ? '#3b82f6' : 'rgba(255,255,255,0.1)'};">${v}</span>`).join('') +
          `</div>`
        : '';

      return `${indent}<div class="el-${el.id} studio-product-card" id="${el.id}" style="display: flex; flex-direction: column; overflow: hidden; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: #121520; color: #ffffff;"${clickAttr}>
${indent}  <div style="position: relative; width: 100%; height: 50%; overflow: hidden; background: #000;">
${indent}    <img src="${cfg.imageUrl}" alt="${titleEsc}" style="width: 100%; height: 100%; object-fit: cover;" />
${indent}    ${badgeHtml}
${indent}  </div>
${indent}  <div style="padding: 16px; display: flex; flex-direction: column; justify-content: space-between; flex: 1;">
${indent}    <div>
${indent}      <div style="font-weight: 600; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${titleEsc}</div>
${indent}      <div style="display: flex; align-items: baseline; margin-top: 4px;">
${indent}        <span style="font-size: 18px; font-weight: 700;">${curr}${cfg.price}</span>
${indent}        ${compareHtml}
${indent}      </div>
${indent}      ${variantsHtml}
${indent}    </div>
${indent}    <button type="button" onclick="studioAddToCart('${el.id}', '${cfg.title.replace(/'/g, "\\'")}', ${cfg.price}, '${curr.replace(/'/g, "\\'")}', '${cfg.imageUrl.replace(/'/g, "\\'")}')" style="width: 100%; padding: 10px 14px; border-radius: 10px; font-weight: 600; font-size: 12px; border: none; cursor: pointer; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.3); transition: transform 0.15s ease;">
${indent}      🛍️ ${cfg.buttonText || 'Add to Bag'}
${indent}    </button>
${indent}  </div>
${indent}</div>`;
    }

    if (el.type === 'lottie') {
      const url = el.lottieConfig?.url || 'https://assets2.lottiefiles.com/packages/lf20_u4yrau.json';
      const loop = el.lottieConfig?.loop ?? true;
      const autoplay = el.lottieConfig?.autoplay ?? true;
      const speed = el.lottieConfig?.speed || 1;
      return `${indent}<div class="el-${el.id} studio-lottie" id="${el.id}" style="overflow: hidden; display: flex; align-items: center; justify-content: center;"${clickAttr}>
${indent}  <lottie-player src="${url}" background="transparent" speed="${speed}" style="width: 100%; height: 100%;"${loop ? ' loop' : ''}${autoplay ? ' autoplay' : ''}></lottie-player>
${indent}</div>`;
    }

    if (el.type === 'button' || role === 'button') {
      const icon = el.behavior?.buttonIcon || 'none';
      const iconPos = el.behavior?.buttonIconPosition || 'right';
      const iconSvg = getButtonIconSvg(icon);
      const inner =
        iconPos === 'left'
          ? `${iconSvg ? `${iconSvg} ` : ''}<span>${text || 'Button'}</span>`
          : `<span>${text || 'Button'}</span>${iconSvg ? ` ${iconSvg}` : ''}`;
      return `${indent}<button class="el-${el.id}" id="${el.id}" role="button"${clickAttr}>${inner}</button>`;
    }

    switch (role) {
      case 'heading-h1':
        return `${indent}<h1 class="el-${el.id}" id="${el.id}"${clickAttr}>${text}</h1>`;
      case 'heading-h2':
        return `${indent}<h2 class="el-${el.id}" id="${el.id}"${clickAttr}>${text}</h2>`;
      case 'heading-h3':
        return `${indent}<h3 class="el-${el.id}" id="${el.id}"${clickAttr}>${text}</h3>`;
      case 'blockquote':
        return `${indent}<blockquote class="el-${el.id}" id="${el.id}"${clickAttr}>${text}</blockquote>`;
      case 'badge':
        return `${indent}<span class="el-${el.id}" id="${el.id}" role="status"${clickAttr}>${text}</span>`;
      case 'header':
        return `${indent}<header class="el-${el.id}" id="${el.id}" role="banner"${clickAttr}>${text ? `<div>${text}</div>` : ''}${childrenHtml ? `\n${childrenHtml}\n${indent}` : ''}</header>`;
      case 'footer':
        return `${indent}<footer class="el-${el.id}" id="${el.id}" role="contentinfo"${clickAttr}>${text ? `<div>${text}</div>` : ''}${childrenHtml ? `\n${childrenHtml}\n${indent}` : ''}</footer>`;
      case 'main':
        return `${indent}<main class="el-${el.id}" id="${el.id}" role="main"${clickAttr}>${text ? `<div>${text}</div>` : ''}${childrenHtml ? `\n${childrenHtml}\n${indent}` : ''}</main>`;
      case 'aside':
        return `${indent}<aside class="el-${el.id}" id="${el.id}" role="complementary"${clickAttr}>${text ? `<div>${text}</div>` : ''}${childrenHtml ? `\n${childrenHtml}\n${indent}` : ''}</aside>`;
      case 'form':
        return `${indent}<form class="el-${el.id}" id="${el.id}" onsubmit="event.preventDefault();"${clickAttr}>${text ? `<div>${text}</div>` : ''}${childrenHtml ? `\n${childrenHtml}\n${indent}` : ''}</form>`;
      case 'dialog':
        return `${indent}<div class="el-${el.id}" id="${el.id}" role="dialog" aria-modal="true"${clickAttr}>${text ? `<div>${text}</div>` : ''}${childrenHtml ? `\n${childrenHtml}\n${indent}` : ''}</div>`;
      case 'link':
        return `${indent}<a class="el-${el.id}" id="${el.id}" href="${payload || '#'}"${clickAttr}>${text}</a>`;
      case 'navigation':
        return `${indent}<nav class="el-${el.id}" id="${el.id}" role="navigation">${text ? `<span>${text}</span>` : ''}${childrenHtml ? `\n${childrenHtml}\n${indent}` : ''}</nav>`;
      case 'card':
        return `${indent}<article class="el-${el.id}" id="${el.id}">${text ? `<div>${text}</div>` : ''}${childrenHtml ? `\n${childrenHtml}\n${indent}` : ''}</article>`;
      case 'text':
      case 'none':
      default:
        if (el.type === 'text') {
          const lines = text.split('\n').map((l) => `<span>${l}</span>`).join('<br/>');
          return `${indent}<div class="el-${el.id}" id="${el.id}">${lines}</div>`;
        }
        if (el.type === 'divider') {
          return `${indent}<hr class="el-${el.id}" id="${el.id}" />`;
        }
        if (childrenHtml) {
          return `${indent}<div class="el-${el.id}" id="${el.id}"${clickAttr}>\n${childrenHtml}\n${indent}</div>`;
        }
        return `${indent}<div class="el-${el.id}" id="${el.id}"${clickAttr}>${text}</div>`;
    }
  };

  // Compute automatic and user-configured responsive layouts
  const laptopLayout = computeResponsiveLayout(page.elements, 'laptop', baseW, baseH);
  const tabletLayout = computeResponsiveLayout(page.elements, 'tablet', baseW, baseH);
  const mobileLayout = computeResponsiveLayout(page.elements, 'mobile', baseW, baseH);

  const generateResponsiveRules = (elements: CanvasElement[], bp: 'laptop' | 'tablet' | 'mobile') => {
    return elements
      .map((el) => {
        const bpSetting = el.responsive?.[bp];
        if (bpSetting?.mode === 'hide' || bpSetting?.visible === false) {
          return `    .el-${el.id} { display: none !important; }`;
        }

        let rule = `    .el-${el.id} { left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px;`;
        if (el.styles.fontSize) {
          rule += ` font-size: ${el.styles.fontSize}px;`;
        }
        if (bpSetting?.mode === 'full-width') {
          rule += ` width: 100% !important;`;
        }
        const dir = bpSetting?.direction || (bp === 'mobile' ? 'column' : undefined);
        if (el.type === 'section' || el.type === 'container') {
          if (dir) {
            rule += ` flex-direction: ${dir} !important;`;
          }
        }
        rule += ` }`;
        return rule;
      })
      .join('\n');
  };

  const desktopCss = page.elements.map(generateElementCss).join('\n');
  const laptopCss = generateResponsiveRules(laptopLayout.elements, 'laptop');
  const tabletCss = generateResponsiveRules(tabletLayout.elements, 'tablet');
  const mobileCss = generateResponsiveRules(mobileLayout.elements, 'mobile');
  const htmlBody = rootElements.map((r) => renderElementTree(r, 2)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} - ${page.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #f1f5f9;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      justify-content: center;
      min-height: 100vh;
      padding: 30px 16px;
    }
    .page-canvas {
      position: relative;
      width: 100%;
      max-width: ${baseW}px;
      min-height: ${baseH}px;
      background-color: ${page.backgroundColor || '#ffffff'};
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
${desktopCss}

    /* Auto Responsive Layout: Laptops (max-width: 1024px) */
    @media (max-width: 1024px) {
      .page-canvas {
        max-width: 1024px;
        min-height: ${laptopLayout.canvasHeight}px;
      }
${laptopCss}
    }

    /* Auto Responsive Layout: Tablets (max-width: 768px) */
    @media (max-width: 768px) {
      .page-canvas {
        max-width: 100%;
        width: 100%;
        min-height: ${tabletLayout.canvasHeight}px;
      }
${tabletCss}
    }

    /* Auto Responsive Layout: Mobile Phones (max-width: 480px) */
    @media (max-width: 480px) {
      body {
        padding: 12px 6px;
      }
      .page-canvas {
        max-width: 100%;
        width: 100%;
        min-height: ${mobileLayout.canvasHeight}px;
        border-radius: 20px;
      }
${mobileCss}
    }

${generateMotionKeyframesCss()}
  </style>
</head>
<body>
${(page as any).showScrollProgress ? `  <!-- Scroll-Linked Reading Progress Bar -->
  <div id="studio-scroll-progress" style="position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 99990; pointer-events: none;">
    <div id="studio-scroll-bar" style="height: 100%; width: 0%; background: ${(page as any).scrollProgressColor || 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)'}; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); transition: width 0.1s ease-out;"></div>
  </div>\n` : ''}  <main class="page-canvas">
${htmlBody}
  </main>

  <!-- E-Commerce Floating Cart Trigger -->
  <button id="studio-cart-badge" onclick="studioToggleCart()" style="position: fixed; bottom: 24px; right: 24px; z-index: 99998; width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 25px rgba(37,99,235,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; transition: transform 0.2s;">
    🛍️
    <span id="studio-cart-count" style="position: absolute; top: -4px; right: -4px; background: #ef4444; color: #fff; font-size: 11px; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: none; align-items: center; justify-content: center; border: 2px solid #0f121d;">0</span>
  </button>

  <!-- E-Commerce Slide-out Cart Drawer -->
  <div id="studio-cart-drawer" style="position: fixed; inset: 0; z-index: 99999; display: none;">
    <div onclick="studioToggleCart(false)" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);"></div>
    <div style="position: absolute; top: 0; right: 0; bottom: 0; width: 100%; max-width: 420px; background: #0f121d; border-left: 1px solid #262f44; color: #fff; display: flex; flex-direction: column; z-index: 1; box-shadow: -10px 0 30px rgba(0,0,0,0.5);">
      <div style="padding: 20px; border-bottom: 1px solid #262f44; display: flex; justify-content: space-between; align-items: center; background: #141827;">
        <div style="font-weight: 700; font-size: 16px; display: flex; align-items: center; gap: 8px;">🛍️ Shopping Bag</div>
        <button onclick="studioToggleCart(false)" style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✕</button>
      </div>
      <div id="studio-cart-items" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px;"></div>
      <div style="padding: 20px; border-top: 1px solid #262f44; background: #141827;">
        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; margin-bottom: 16px;">
          <span>Total</span>
          <span id="studio-cart-total" style="color: #60a5fa;">$0.00</span>
        </div>
        <button onclick="studioCheckout()" style="width: 100%; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.4);">
          💳 Checkout with Stripe
        </button>
      </div>
    </div>
  </div>
${generateScrollObserverScript()}
  <script>
    function submitStudioLead(btn, customMsg) {
      const container = (btn && btn.closest) ? (btn.closest('form') || btn.closest('.page-canvas') || document.body) : document.body;
      const inputs = container.querySelectorAll('input, textarea, select');
      const data = {};
      let hasError = false;

      inputs.forEach(function(input) {
        if (input.type === 'button' || input.type === 'submit') return;
        const name = input.name || input.id || 'field';
        if (input.required && !input.value.trim()) {
          input.style.outline = '2px solid #ef4444';
          hasError = true;
        } else {
          input.style.outline = '';
        }
        if (input.type === 'checkbox') {
          data[name] = input.checked;
        } else {
          data[name] = input.value;
        }
      });

      if (hasError) {
        alert('Please fill in all required fields.');
        return;
      }

      try {
        fetch('/api/database/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: '${project.name.replace(/'/g, "\\'")}',
            formType: 'Lead Form',
            leadEmail: data.email || data['lead-email'] || '',
            leadName: data.name || data['lead-name'] || '',
            data: data
          })
        }).catch(function() {});
      } catch (e) {}

      const msg = customMsg || '🎉 Form submitted successfully! Thank you.';
      alert(msg);
      inputs.forEach(function(input) {
        if (input.type !== 'submit' && input.type !== 'button') {
          if (input.type === 'checkbox') input.checked = false;
          else input.value = '';
        }
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function (e) {
        const hash = this.getAttribute('href');
        if (hash && hash.length > 1) {
          const targetId = hash.slice(1);
          const target = document.getElementById(targetId) || document.querySelector('.el-' + targetId);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Carousel Navigation
    function setCarouselSlide(carouselId, index) {
      const carousel = document.getElementById(carouselId);
      if (!carousel) return;
      const slides = carousel.querySelectorAll('.carousel-slide');
      const dots = carousel.querySelectorAll('.dot');
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      carousel.dataset.currentIndex = index;
      slides.forEach(function(sl, i) {
        sl.style.opacity = i === index ? '1' : '0';
      });
      dots.forEach(function(dot, i) {
        dot.style.background = i === index ? '#fff' : 'rgba(255,255,255,0.4)';
      });
    }

    function stepCarouselSlide(carouselId, step) {
      const carousel = document.getElementById(carouselId);
      if (!carousel) return;
      const current = parseInt(carousel.dataset.currentIndex || '0', 10);
      setCarouselSlide(carouselId, current + step);
    }

    document.querySelectorAll('.studio-carousel').forEach(function(carousel) {
      if (carousel.dataset.autoplay === 'true') {
        const sec = parseFloat(carousel.dataset.interval || '4');
        setInterval(function() {
          stepCarouselSlide(carousel.id, 1);
        }, sec * 1000);
      }
    });

    // Stat Counter Animation
    if ('IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var target = parseFloat(el.dataset.target || '0');
            var duration = parseFloat(el.dataset.duration || '2') * 1000;
            var decimals = parseInt(el.dataset.decimals || '0', 10);
            var prefix = el.dataset.prefix || '';
            var suffix = el.dataset.suffix || '';
            var numEl = el.querySelector('.counter-number');
            if (numEl && !el.dataset.animated) {
              el.dataset.animated = 'true';
              var startTime = null;
              function tick(timestamp) {
                if (!startTime) startTime = timestamp;
                var p = Math.min((timestamp - startTime) / duration, 1);
                var ease = 1 - Math.pow(1 - p, 3);
                var current = target * ease;
                numEl.textContent = prefix + current.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
                if (p < 1) requestAnimationFrame(tick);
                else numEl.textContent = prefix + target.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
              }
              requestAnimationFrame(tick);
            }
          }
        });
      }, { threshold: 0.2 });
      document.querySelectorAll('.studio-counter').forEach(function(c) { counterObserver.observe(c); });
    }

    // E-Commerce Shopping Bag Client Runtime
    var studioCart = JSON.parse(localStorage.getItem('studio_cart_export') || '[]');

    function saveStudioCart() {
      localStorage.setItem('studio_cart_export', JSON.stringify(studioCart));
      renderStudioCart();
    }

    function studioToggleCart(forceOpen) {
      var drawer = document.getElementById('studio-cart-drawer');
      if (!drawer) return;
      if (typeof forceOpen === 'boolean') {
        drawer.style.display = forceOpen ? 'block' : 'none';
      } else {
        drawer.style.display = drawer.style.display === 'block' ? 'none' : 'block';
      }
    }

    function studioAddToCart(id, title, price, currency, img) {
      var item = studioCart.find(function(it) { return it.id === id; });
      if (item) {
        item.qty += 1;
      } else {
        studioCart.push({ id: id, title: title, price: price, currency: currency, img: img, qty: 1 });
      }
      saveStudioCart();
      studioToggleCart(true);
    }

    function studioUpdateQty(id, delta) {
      var idx = studioCart.findIndex(function(it) { return it.id === id; });
      if (idx === -1) return;
      studioCart[idx].qty += delta;
      if (studioCart[idx].qty <= 0) studioCart.splice(idx, 1);
      saveStudioCart();
    }

    function renderStudioCart() {
      var container = document.getElementById('studio-cart-items');
      var totalEl = document.getElementById('studio-cart-total');
      var countBadge = document.getElementById('studio-cart-count');
      if (!container || !totalEl) return;

      var total = 0;
      var count = 0;
      var curr = '$';

      if (studioCart.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px 0; color: #64748b; font-size: 13px;">Your shopping bag is empty.</div>';
      } else {
        var html = '';
        studioCart.forEach(function(it) {
          curr = it.currency || '$';
          total += it.price * it.qty;
          count += it.qty;
          html += '<div style="display: flex; gap: 12px; padding: 12px; border-radius: 10px; background: #14192b; border: 1px solid #222a3f;">' +
            '<img src="' + it.img + '" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" />' +
            '<div style="flex: 1; min-width: 0;">' +
              '<div style="font-weight: 600; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + it.title + '</div>' +
              '<div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">' + curr + it.price.toFixed(2) + '</div>' +
              '<div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">' +
                '<button onclick="studioUpdateQty(\'' + it.id + '\', -1)" style="width: 22px; height: 22px; border-radius: 4px; background: #1e293b; color: #fff; border: 1px solid #334155; cursor: pointer;">-</button>' +
                '<span style="font-size: 12px; font-weight: 600;">' + it.qty + '</span>' +
                '<button onclick="studioUpdateQty(\'' + it.id + '\', 1)" style="width: 22px; height: 22px; border-radius: 4px; background: #1e293b; color: #fff; border: 1px solid #334155; cursor: pointer;">+</button>' +
              '</div>' +
            '</div>' +
            '<div style="font-weight: 700; font-size: 13px;">' + curr + (it.price * it.qty).toFixed(2) + '</div>' +
          '</div>';
        });
        container.innerHTML = html;
      }

      totalEl.textContent = curr + total.toFixed(2);
      if (countBadge) {
        if (count > 0) {
          countBadge.style.display = 'flex';
          countBadge.textContent = count;
        } else {
          countBadge.style.display = 'none';
        }
      }
    }

    function studioCheckout() {
      if (studioCart.length === 0) return alert('Your shopping bag is empty!');
      alert('🎉 Simulated Stripe Checkout triggered! Total: ' + document.getElementById('studio-cart-total').textContent);
      studioCart = [];
      saveStudioCart();
      studioToggleCart(false);
    }

    // Reading Progress Bar Listener
    window.addEventListener('scroll', function() {
      var bar = document.getElementById('studio-scroll-bar');
      if (!bar) return;
      var total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (total <= 0) return;
      var progress = (window.scrollY / total) * 100;
      bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    });

    renderStudioCart();
  </script>
</body>
</html>`;
}
