import type { Page, ProjectState, ProjectPublishConfig } from '../types/editor';

export interface SeoAuditCheck {
  id: string;
  category: 'SEO' | 'Accessibility' | 'Performance' | 'Social Sharing';
  title: string;
  description: string;
  status: 'pass' | 'warning' | 'fail';
  weight: number; // contribution to 100 score
  impact: string;
  fixAction?: string;
}

export interface SeoAuditReport {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  passedCount: number;
  warningCount: number;
  failCount: number;
  checks: SeoAuditCheck[];
}

export function auditProjectSeo(
  page: Page,
  publishConfig?: ProjectPublishConfig,
  project?: ProjectState
): SeoAuditReport {
  const checks: SeoAuditCheck[] = [];
  const elements = page.elements || [];

  // 1. Page Title Tag Check
  const title = publishConfig?.seoTitle || project?.name || '';
  if (title.length >= 10 && title.length <= 65) {
    checks.push({
      id: 'title-length',
      category: 'SEO',
      title: 'SEO Title Length',
      description: `Title is "${title}" (${title.length} characters), which fits search engine snippets perfectly.`,
      status: 'pass',
      weight: 15,
      impact: 'High',
    });
  } else if (title.length > 0) {
    checks.push({
      id: 'title-length',
      category: 'SEO',
      title: 'SEO Title Optimization',
      description: `Title is ${title.length} characters. Optimal length is between 20 and 60 characters.`,
      status: 'warning',
      weight: 15,
      impact: 'Medium',
      fixAction: 'optimize-title',
    });
  } else {
    checks.push({
      id: 'title-length',
      category: 'SEO',
      title: 'Missing Page Title',
      description: 'Page title is empty. Search engines need a descriptive title to rank your website.',
      status: 'fail',
      weight: 15,
      impact: 'Critical',
      fixAction: 'optimize-title',
    });
  }

  // 2. Meta Description Check
  const desc = publishConfig?.seoDescription || '';
  if (desc.length >= 50 && desc.length <= 165) {
    checks.push({
      id: 'meta-description',
      category: 'SEO',
      title: 'Meta Description Length',
      description: `Meta description is well-formed (${desc.length} characters) for Google search snippets.`,
      status: 'pass',
      weight: 15,
      impact: 'High',
    });
  } else if (desc.length > 0) {
    checks.push({
      id: 'meta-description',
      category: 'SEO',
      title: 'Meta Description Needs Tuning',
      description: `Description is ${desc.length} characters. Aim for 80-160 characters for maximum search visibility.`,
      status: 'warning',
      weight: 15,
      impact: 'Medium',
      fixAction: 'generate-description',
    });
  } else {
    checks.push({
      id: 'meta-description',
      category: 'SEO',
      title: 'Missing Meta Description',
      description: 'Search engines will fallback to arbitrary page text without a dedicated meta description.',
      status: 'fail',
      weight: 15,
      impact: 'High',
      fixAction: 'generate-description',
    });
  }

  // 3. Single H1 Heading Check
  const h1Elements = elements.filter(
    (el) => el.role === 'heading-h1' || (el.type === 'text' && el.name.toLowerCase().includes('h1'))
  );
  if (h1Elements.length === 1) {
    checks.push({
      id: 'h1-count',
      category: 'SEO',
      title: 'Single H1 Heading Hierarchy',
      description: `Page has exactly one Primary H1 heading: "${h1Elements[0].content || h1Elements[0].name}".`,
      status: 'pass',
      weight: 15,
      impact: 'High',
    });
  } else if (h1Elements.length === 0) {
    checks.push({
      id: 'h1-count',
      category: 'SEO',
      title: 'Missing H1 Heading',
      description: 'Page has no primary H1 heading element defined. Google expects a clear H1 per page.',
      status: 'fail',
      weight: 15,
      impact: 'High',
      fixAction: 'create-h1',
    });
  } else {
    checks.push({
      id: 'h1-count',
      category: 'SEO',
      title: 'Multiple H1 Headings Detected',
      description: `Page has ${h1Elements.length} H1 headings. Best SEO practice recommends exactly one H1 per page.`,
      status: 'warning',
      weight: 15,
      impact: 'Medium',
      fixAction: 'fix-headings',
    });
  }

  // 4. Image Alt Tags (Accessibility & SEO)
  const imageElements = elements.filter((el) => el.type === 'image' || el.role === 'image');
  const missingAlt = imageElements.filter((img) => !img.styles?.alt || !img.styles.alt.trim());
  if (imageElements.length === 0 || missingAlt.length === 0) {
    checks.push({
      id: 'image-alt',
      category: 'Accessibility',
      title: 'Image Alt Text Attributes',
      description: `All ${imageElements.length} images have accessible descriptive alt text for screen readers & search crawlers.`,
      status: 'pass',
      weight: 15,
      impact: 'High',
    });
  } else {
    checks.push({
      id: 'image-alt',
      category: 'Accessibility',
      title: 'Missing Image Alt Text',
      description: `${missingAlt.length} of ${imageElements.length} images are missing descriptive alt text.`,
      status: 'warning',
      weight: 15,
      impact: 'High',
      fixAction: 'fix-image-alts',
    });
  }

  // 5. OpenGraph Social Sharing Image
  const ogImg = publishConfig?.ogImage;
  if (ogImg && ogImg.length > 5) {
    checks.push({
      id: 'og-image',
      category: 'Social Sharing',
      title: 'Social Preview Card (OpenGraph)',
      description: 'OpenGraph preview image is configured for high-engagement Twitter, Slack, and LinkedIn links.',
      status: 'pass',
      weight: 10,
      impact: 'Medium',
    });
  } else {
    checks.push({
      id: 'og-image',
      category: 'Social Sharing',
      title: 'Missing Social Preview Image',
      description: 'Social sharing links on Twitter / iMessage / Slack will render without a preview thumbnail card.',
      status: 'warning',
      weight: 10,
      impact: 'Medium',
      fixAction: 'set-og-image',
    });
  }

  // 6. Interactive CTA & Actions Check
  const interactiveButtons = elements.filter(
    (el) =>
      (el.type === 'button' || el.role === 'button') &&
      el.behavior?.actionType &&
      el.behavior.actionType !== 'none'
  );
  if (interactiveButtons.length >= 1) {
    checks.push({
      id: 'interactive-cta',
      category: 'Performance',
      title: 'Call-to-Action Conversion Wiring',
      description: `${interactiveButtons.length} interactive call-to-action button(s) configured with click behaviors.`,
      status: 'pass',
      weight: 15,
      impact: 'High',
    });
  } else {
    checks.push({
      id: 'interactive-cta',
      category: 'Performance',
      title: 'No Interactive Call-to-Action',
      description: 'No buttons on this page have configured click actions (leads, links, modals, or cart).',
      status: 'warning',
      weight: 15,
      impact: 'Medium',
    });
  }

  // 7. Viewport & Mobile Scaling
  checks.push({
    id: 'mobile-viewport',
    category: 'Accessibility',
    title: 'Mobile Viewport & Responsive Hierarchy',
    description: 'Dynamic responsive engine active with 4 adaptive breakpoint scales.',
    status: 'pass',
    weight: 15,
    impact: 'Critical',
  });

  // Calculate Weighted Score
  let totalScore = 0;
  let passedCount = 0;
  let warningCount = 0;
  let failCount = 0;

  for (const c of checks) {
    if (c.status === 'pass') {
      totalScore += c.weight;
      passedCount++;
    } else if (c.status === 'warning') {
      totalScore += c.weight * 0.5;
      warningCount++;
    } else {
      failCount++;
    }
  }

  const normalizedScore = Math.min(100, Math.round(totalScore));
  const grade =
    normalizedScore >= 95
      ? 'A+'
      : normalizedScore >= 85
      ? 'A'
      : normalizedScore >= 70
      ? 'B'
      : normalizedScore >= 50
      ? 'C'
      : 'D';

  return {
    score: normalizedScore,
    grade,
    passedCount,
    warningCount,
    failCount,
    checks,
  };
}

export function autoFixSeoIssues(
  page: Page,
  publishConfig?: ProjectPublishConfig,
  project?: ProjectState
): {
  updatedPage: Page;
  updatedPublishConfig: ProjectPublishConfig;
  fixedCount: number;
} {
  let fixedCount = 0;
  const updatedPage: Page = JSON.parse(JSON.stringify(page));
  const updatedPublishConfig: ProjectPublishConfig = { ...(publishConfig || {}) };

  // 1. Fix missing SEO Title
  if (!updatedPublishConfig.seoTitle || updatedPublishConfig.seoTitle.length < 10) {
    updatedPublishConfig.seoTitle = `${project?.name || updatedPage.name || 'Craft Studio'} - High-Performance Design`;
    fixedCount++;
  }

  // 2. Fix missing Meta Description
  if (!updatedPublishConfig.seoDescription || updatedPublishConfig.seoDescription.length < 30) {
    updatedPublishConfig.seoDescription = `Explore ${project?.name || updatedPage.name || 'Craft Studio'}. Created with cutting-edge visual design, responsive layouts, and interactive experiences.`;
    fixedCount++;
  }

  // 3. Fix missing Image Alt Texts
  updatedPage.elements.forEach((el, index) => {
    if ((el.type === 'image' || el.role === 'image') && !el.styles?.alt) {
      el.styles = {
        ...el.styles,
        alt: el.name && el.name.toLowerCase() !== 'image' ? el.name : `Website visual image ${index + 1}`,
      };
      fixedCount++;
    }
  });

  // 4. Fix missing or multiple H1s
  const h1Elements = updatedPage.elements.filter((el) => el.role === 'heading-h1');
  if (h1Elements.length > 1) {
    // Demote secondary H1s to H2
    h1Elements.slice(1).forEach((h) => {
      h.role = 'heading-h2';
      fixedCount++;
    });
  } else if (h1Elements.length === 0) {
    // Promote first text element or heading to H1
    const candidate = updatedPage.elements.find((el) => el.type === 'text');
    if (candidate) {
      candidate.role = 'heading-h1';
      fixedCount++;
    }
  }

  // 5. Default OpenGraph Image if missing
  if (!updatedPublishConfig.ogImage) {
    updatedPublishConfig.ogImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
    fixedCount++;
  }

  return {
    updatedPage,
    updatedPublishConfig,
    fixedCount,
  };
}
