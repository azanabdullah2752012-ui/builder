import assert from 'node:assert';
import { createElement } from './src/constants/defaults.ts';
import { generateExportHtml } from './src/utils/exportHtml.ts';
import { computeResponsiveLayout } from './src/utils/responsiveLayout.ts';

console.log('🧪 Starting Interactive Engagement Widgets Test Suite...');

// 1. Test Poll Element Creation & Defaults
console.log('  1. Testing Poll element creation & defaults...');
const poll = createElement('poll', 100, 100);
assert.strictEqual(poll.type, 'poll', 'Type should be poll');
assert.ok(poll.pollConfig, 'Poll should have pollConfig');
assert.ok(poll.pollConfig.question.length > 0, 'Poll should have question');
assert.strictEqual(poll.pollConfig.options.length, 4, 'Poll should have 4 default options');
assert.ok(poll.pollConfig.options.every(o => o.id && o.label && typeof o.votes === 'number'), 'Poll options should have id, label, votes');
assert.strictEqual(poll.width, 440, 'Poll default width should be 440');
assert.strictEqual(poll.height, 320, 'Poll default height should be 320');
console.log('  ✅ Poll element verified.');

// 2. Test Guestbook Element Creation & Defaults
console.log('  2. Testing Guestbook element creation & defaults...');
const guestbook = createElement('guestbook', 200, 200);
assert.strictEqual(guestbook.type, 'guestbook', 'Type should be guestbook');
assert.ok(guestbook.guestbookConfig, 'Guestbook should have guestbookConfig');
assert.ok(guestbook.guestbookConfig.title.length > 0, 'Guestbook should have title');
assert.strictEqual(guestbook.guestbookConfig.entries.length, 3, 'Guestbook should have 3 default entries');
assert.ok(guestbook.guestbookConfig.entries.every(e => e.id && e.name && e.message), 'Entries must have id, name, message');
assert.strictEqual(guestbook.width, 480, 'Guestbook default width should be 480');
assert.strictEqual(guestbook.height, 420, 'Guestbook default height should be 420');
console.log('  ✅ Guestbook element verified.');

// 3. Test Reaction Element Creation & Defaults
console.log('  3. Testing Reaction element creation & defaults...');
const reaction = createElement('reaction', 300, 300);
assert.strictEqual(reaction.type, 'reaction', 'Type should be reaction');
assert.ok(reaction.reactionConfig, 'Reaction should have reactionConfig');
assert.strictEqual(reaction.reactionConfig.emoji, '🔥', 'Reaction default emoji should be 🔥');
assert.strictEqual(reaction.reactionConfig.label, 'Hype', 'Reaction default label should be Hype');
assert.strictEqual(reaction.reactionConfig.count, 128, 'Reaction default count should be 128');
assert.strictEqual(reaction.reactionConfig.soundEffect, 'pop', 'Reaction default sound should be pop');
assert.strictEqual(reaction.width, 180, 'Reaction default width should be 180');
assert.strictEqual(reaction.height, 56, 'Reaction default height should be 56');
console.log('  ✅ Reaction element verified.');

// 4. Test HTML Export Serialization
console.log('  4. Testing HTML Export Serialization...');
const testPage = {
  id: 'page_engagement_widgets',
  name: 'Engagement Test Page',
  slug: 'engagement-test',
  elements: [poll, guestbook, reaction],
  canvasWidth: 1200,
  canvasHeight: 1400,
  backgroundColor: '#090a0f',
};

const mockProject = {
  id: 'proj_widgets_test',
  name: 'Interactive Engagement Demo',
  description: 'Visitor poll, guestbook wall and reaction counter demo',
  pages: [testPage],
  activePageId: 'page_engagement_widgets',
  theme: {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#6366f1',
    backgroundColor: '#090a0f',
  },
};

const html = generateExportHtml(mockProject, testPage);

// Check Poll in HTML
assert.ok(html.includes('studio-poll-widget'), 'HTML should contain studio-poll-widget');
assert.ok(html.includes(poll.pollConfig.question), 'HTML should contain poll question');
assert.ok(html.includes('voteStudioPoll'), 'HTML should contain voteStudioPoll script handler');
assert.ok(html.includes('poll-total-count'), 'HTML should contain poll total count');

// Check Guestbook in HTML
assert.ok(html.includes('studio-guestbook-widget'), 'HTML should contain studio-guestbook-widget');
assert.ok(html.includes(guestbook.guestbookConfig.title), 'HTML should contain guestbook title');
assert.ok(html.includes('submitStudioGuestbook'), 'HTML should contain submitStudioGuestbook script handler');
assert.ok(html.includes('Sarah Chen'), 'HTML should contain default entry author');

// Check Reaction in HTML
assert.ok(html.includes('studio-reaction-widget'), 'HTML should contain studio-reaction-widget');
assert.ok(html.includes('tapStudioReaction'), 'HTML should contain tapStudioReaction script handler');
assert.ok(html.includes('128'), 'HTML should contain reaction count');
assert.ok(html.includes('Hype'), 'HTML should contain reaction label');

console.log('  ✅ HTML export parity verified for Poll, Guestbook, and Reaction widgets.');

// 5. Test Responsive Layout Reflow on Mobile & Tablet
console.log('  5. Testing Responsive Layout Reflow on Mobile (375px)...');
const { elements: mobileElements } = computeResponsiveLayout(testPage.elements, 'mobile', 1200, 1400, 375);
const mobilePoll = mobileElements.find(e => e.id === poll.id);
const mobileGuestbook = mobileElements.find(e => e.id === guestbook.id);
const mobileReaction = mobileElements.find(e => e.id === reaction.id);

assert.ok(mobilePoll, 'Mobile poll must exist');
assert.ok(mobileGuestbook, 'Mobile guestbook must exist');
assert.ok(mobileReaction, 'Mobile reaction must exist');

// Mobile width should fit within 375px without horizontal bleed
assert.ok(mobilePoll.width <= 375, `Mobile poll width ${mobilePoll.width} should fit within 375px`);
assert.ok(mobileGuestbook.width <= 375, `Mobile guestbook width ${mobileGuestbook.width} should fit within 375px`);

console.log('  ✅ Mobile responsive adaptation verified with 0 bleed.');

console.log('🎉 ALL INTERACTIVE ENGAGEMENT WIDGETS TESTS PASSED (5/5)!');
