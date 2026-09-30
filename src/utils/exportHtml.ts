import type { CanvasElement } from '../types/editor';
import { computeResponsiveLayout } from './responsiveLayout';
import { SHAPE_DEFINITIONS, getShapeSvgNode } from './shapeDefinitions';

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
    const s = el.styles;
    const h = el.behavior.hoverStyles;
    const l = el.layout;

    let css = `  .el-${el.id} {
    position: absolute;
    left: ${el.x}px;
    top: ${el.y}px;
    width: ${el.width}px;
    height: ${el.height}px;
    z-index: ${el.zIndex || (el.type === 'section' ? 0 : 1)};
    box-sizing: border-box;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
`;
    if (s.backgroundColor) css += `    background-color: ${s.backgroundColor};\n`;
    if (s.color) css += `    color: ${s.color};\n`;
    if (s.fontSize) css += `    font-size: ${s.fontSize}px;\n`;
    if (s.fontWeight) css += `    font-weight: ${s.fontWeight};\n`;
    if (s.fontFamily) css += `    font-family: ${s.fontFamily};\n`;
    if (s.textAlign) css += `    text-align: ${s.textAlign};\n`;
    if (s.lineHeight) css += `    line-height: ${s.lineHeight};\n`;
    if (s.borderRadius) css += `    border-radius: ${s.borderRadius}px;\n`;
    if (s.borderWidth && s.borderStyle && s.borderStyle !== 'none') {
      css += `    border: ${s.borderWidth}px ${s.borderStyle} ${s.borderColor || 'transparent'};\n`;
    }
    if (s.boxShadow) css += `    box-shadow: ${s.boxShadow};\n`;
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

    if (el.role === 'button' || el.role === 'link') {
      css += `    cursor: pointer;\n    display: inline-flex;\n    align-items: center;\n    justify-content: ${s.textAlign === 'left' ? 'flex-start' : s.textAlign === 'right' ? 'flex-end' : 'center'};\n    text-decoration: none;\n`;
    }
    css += `  }\n`;

    if (h) {
      css += `  .el-${el.id}:hover {\n`;
      if (h.backgroundColor) css += `    background-color: ${h.backgroundColor};\n`;
      if (h.color) css += `    color: ${h.color};\n`;
      if (h.borderColor) css += `    border-color: ${h.borderColor};\n`;
      if (h.boxShadow) css += `    box-shadow: ${h.boxShadow};\n`;
      if (h.opacity !== undefined) css += `    opacity: ${h.opacity};\n`;
      if (h.scale) css += `    transform: scale(${h.scale});\n`;
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
    const action = el.behavior.actionType;
    const payload = el.behavior.actionPayload || '';
    let clickAttr = '';

    if (action === 'navigate-url' && payload) {
      if (role === 'link') {
        return `${indent}<a href="${payload}" target="${el.behavior.targetBlank ? '_blank' : '_self'}" class="el-${el.id}">${text}</a>`;
      }
      clickAttr = ` onclick="window.open('${payload}', '${el.behavior.targetBlank ? '_blank' : '_self'}')"`;
    } else if (action === 'navigate-page' && payload) {
      clickAttr = ` onclick="window.location.hash='${payload}'"`;
    } else if (action === 'scroll-section') {
      const target = (payload || '').replace(/^#/, '');
      clickAttr = ` onclick="document.querySelector('#${target}, .el-${target}')?.scrollIntoView({behavior: 'smooth'})"`;
    } else if (action === 'scroll-top') {
      clickAttr = ` onclick="window.scrollTo({top: 0, behavior: 'smooth'})"`;
    } else if (action === 'open-modal') {
      const modalTitle = (el.behavior.actionModalTitle || 'Notification').replace(/'/g, "\\'");
      const modalBody = (el.behavior.actionModalBody || payload || '').replace(/'/g, "\\'");
      clickAttr = ` onclick="alert('${modalTitle}\\n\\n${modalBody}')"`;
    } else if (action === 'toggle-visibility') {
      const targetId = (el.behavior.actionTargetId || payload || '').replace(/^#/, '');
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
      case 'button':
        return `${indent}<button class="el-${el.id}" id="${el.id}" role="button"${clickAttr}>${text}</button>`;
      case 'link':
        return `${indent}<a class="el-${el.id}" id="${el.id}" href="${payload || '#'}"${clickAttr}>${text}</a>`;
      case 'input':
        return `${indent}<input class="el-${el.id}" id="${el.id}" type="text" placeholder="${text || 'Enter text...'}" />`;
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
        max-width: 768px;
        min-height: ${tabletLayout.canvasHeight}px;
      }
${tabletCss}
    }

    /* Auto Responsive Layout: Mobile Phones (max-width: 480px) */
    @media (max-width: 480px) {
      body {
        padding: 12px 8px;
      }
      .page-canvas {
        max-width: 390px;
        min-height: ${mobileLayout.canvasHeight}px;
        border-radius: 24px;
      }
${mobileCss}
    }
  </style>
</head>
<body>
  <main class="page-canvas">
${htmlBody}
  </main>
</body>
</html>`;
}
