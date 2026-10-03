import assert from 'node:assert';
import { createElement } from './src/constants/defaults.ts';
import { parseVideoEmbedUrl } from './src/components/Widgets/InteractiveWidgets.tsx';
import { generateExportHtml } from './src/utils/exportHtml.ts';

console.log('🧪 Running Rich Interactive Widgets Test Suite...');

// 1. Test Element Creation & Defaults for Widgets
console.log('  Testing createElement() defaults for new widgets...');

const accordion = createElement('accordion', 10, 20);
assert.strictEqual(accordion.type, 'accordion', 'Type should be accordion');
assert.ok(accordion.accordionConfig, 'Accordion should have accordionConfig');
assert.ok(Array.isArray(accordion.accordionConfig.items), 'Accordion should have items array');
assert.strictEqual(accordion.accordionConfig.items.length, 3, 'Accordion should have 3 default items');
assert.ok(accordion.accordionConfig.items[0].title.length > 0, 'Accordion item should have title');
assert.ok(accordion.accordionConfig.items[0].content.length > 0, 'Accordion item should have content');

const carousel = createElement('carousel', 50, 60);
assert.strictEqual(carousel.type, 'carousel', 'Type should be carousel');
assert.ok(carousel.carouselConfig, 'Carousel should have carouselConfig');
assert.strictEqual(carousel.carouselConfig.autoplay, true, 'Carousel autoplay default should be true');
assert.strictEqual(carousel.carouselConfig.interval, 4, 'Carousel interval default should be 4s');
assert.strictEqual(carousel.carouselConfig.showDots, true, 'Carousel showDots default should be true');
assert.strictEqual(carousel.carouselConfig.showArrows, true, 'Carousel showArrows default should be true');
assert.strictEqual(carousel.carouselConfig.slides.length, 3, 'Carousel should have 3 default slides');

const video = createElement('video', 100, 100);
assert.strictEqual(video.type, 'video', 'Type should be video');
assert.ok(video.videoConfig, 'Video should have videoConfig');
assert.strictEqual(video.videoConfig.videoType, 'youtube', 'Default videoType should be youtube');
assert.strictEqual(video.videoConfig.controls, true, 'Video controls default should be true');
assert.ok(video.videoConfig.url.includes('youtube.com'), 'Default video URL should be YouTube');

const counter = createElement('counter', 200, 150);
assert.strictEqual(counter.type, 'counter', 'Type should be counter');
assert.ok(counter.counterConfig, 'Counter should have counterConfig');
assert.strictEqual(counter.counterConfig.targetValue, 99.9, 'Counter targetValue default should be 99.9');
assert.strictEqual(counter.counterConfig.prefix, '', 'Counter prefix default check');
assert.strictEqual(counter.counterConfig.suffix, '%', 'Counter suffix default check');
assert.strictEqual(counter.counterConfig.label, 'Uptime Reliability', 'Counter label default check');
assert.strictEqual(counter.counterConfig.duration, 2, 'Counter duration default should be 2s');

console.log('  ✅ Element creation & defaults passed');

// 2. Test Video URL Parsing for Embeds
console.log('  Testing parseVideoEmbedUrl() parser...');

const ytStandard = parseVideoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', false, true, false);
assert.strictEqual(ytStandard.type, 'youtube');
assert.ok(ytStandard.embedUrl.includes('youtube.com/embed/dQw4w9WgXcQ'));
assert.ok(ytStandard.embedUrl.includes('controls=1'));

const ytShort = parseVideoEmbedUrl('https://youtu.be/dQw4w9WgXcQ', true, false, true, true);
assert.strictEqual(ytShort.type, 'youtube');
assert.ok(ytShort.embedUrl.includes('autoplay=1'));
assert.ok(ytShort.embedUrl.includes('mute=1'));

const vimeo = parseVideoEmbedUrl('https://vimeo.com/76979871', false, true, false);
assert.strictEqual(vimeo.type, 'vimeo');
assert.ok(vimeo.embedUrl.includes('player.vimeo.com/video/76979871'));

const mp4Direct = parseVideoEmbedUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
assert.strictEqual(mp4Direct.type, 'mp4');
assert.strictEqual(mp4Direct.embedUrl, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

console.log('  ✅ Video embed URL parsing passed');

// 3. Test Standalone HTML Export Integration
console.log('  Testing generateExportHtml() serialization for interactive widgets...');

const testPage = {
  id: 'page-widgets-test',
  name: 'Interactive Widgets Page',
  elements: [accordion, carousel, video, counter],
};

const mockProject = {
  id: 'proj-1',
  name: 'Widgets Showcase',
  description: 'Testing rich interactive components',
  pages: [testPage],
  activePageId: 'page-widgets-test',
  theme: {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#6366f1',
    backgroundColor: '#ffffff',
  },
};

const exportedHtml = generateExportHtml(mockProject, testPage);

// Check Accordion export
assert.ok(exportedHtml.includes('<details class="accordion-item"'), 'Export HTML must include <details> tag for accordion');
assert.ok(exportedHtml.includes('<summary'), 'Export HTML must include <summary> tag for accordion');
assert.ok(exportedHtml.includes(accordion.accordionConfig.items[0].title), 'Export HTML must include accordion item title');
assert.ok(exportedHtml.includes(accordion.accordionConfig.items[0].content), 'Export HTML must include accordion item content');

// Check Carousel export
assert.ok(exportedHtml.includes('studio-carousel'), 'Export HTML must include studio-carousel container');
assert.ok(exportedHtml.includes('carousel-slide'), 'Export HTML must include carousel-slide elements');
assert.ok(exportedHtml.includes('stepCarouselSlide'), 'Export HTML must include carousel navigation handlers');
assert.ok(exportedHtml.includes('carousel-dots'), 'Export HTML must include carousel dots');
assert.ok(exportedHtml.includes('setCarouselSlide'), 'Export HTML must include carousel slide controller');

// Check Video export
assert.ok(exportedHtml.includes('<iframe'), 'Export HTML must include <iframe> tag for video embed');
assert.ok(exportedHtml.includes('allowfullscreen'), 'Export HTML iframe must have allowfullscreen');

// Check Counter export
assert.ok(exportedHtml.includes('studio-counter'), 'Export HTML must include studio-counter element');
assert.ok(exportedHtml.includes('data-target="99.9"'), 'Export HTML counter must specify data-target');
assert.ok(exportedHtml.includes('Uptime Reliability'), 'Export HTML counter must render label');
assert.ok(exportedHtml.includes('counterObserver'), 'Export HTML must include counter IntersectionObserver animation script');

console.log('  ✅ Export HTML serialization passed');
console.log('🎉 Rich Interactive Widgets Test Suite: ALL TESTS PASSED SUCCESSFULLY!');
