import assert from 'node:assert';
import { isInputElement, executeFormSubmission } from './src/utils/formSubmitHandler.ts';
import { databaseService } from './src/services/databaseService.ts';
import { generateExportHtml } from './src/utils/exportHtml.ts';
import { createElement } from './src/constants/defaults.ts';

console.log('🧪 Running Functional Websites & Form Submissions Test Suite...');

// Mock browser window and document for headless node testing
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
  };
}
if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, eventInitDict) {
      this.type = type;
      this.detail = eventInitDict?.detail;
    }
  };
}

// 1. Test Input Element Detection
console.log('  Testing isInputElement detection heuristics...');
const inputEl = createElement('input', 0, 0, 1);
const textareaEl = createElement('textarea', 0, 0, 2);
const selectEl = createElement('select', 0, 0, 3);
const checkboxEl = createElement('checkbox', 0, 0, 4);
const buttonEl = createElement('button', 0, 0, 5);
const genericTextEl = createElement('text', 0, 0, 6);
const smartEmailContainer = createElement('container', 0, 0, { name: 'User Email Input' });

assert.strictEqual(isInputElement(inputEl), true, 'inputEl must be identified as input');
assert.strictEqual(isInputElement(textareaEl), true, 'textareaEl must be identified as input');
assert.strictEqual(isInputElement(selectEl), true, 'selectEl must be identified as input');
assert.strictEqual(isInputElement(checkboxEl), true, 'checkboxEl must be identified as input');
assert.strictEqual(isInputElement(smartEmailContainer), true, 'name heuristic must detect email input container');
assert.strictEqual(isInputElement(buttonEl), false, 'button must not be identified as input');
assert.strictEqual(isInputElement(genericTextEl), false, 'generic text must not be identified as input');
console.log('  ✅ Input Element Detection passed');

// 2. Test Form Structure & Submission Execution
console.log('  Testing form discovery and submission flow...');
const formContainer = createElement('form', 0, 0, 10);
const nameInput = createElement('input', 20, 20, {
  parentId: formContainer.id,
  name: 'Full Name',
  content: 'Alex Rivera',
  formConfig: {
    inputType: 'text',
    fieldName: 'leadName',
    required: true,
  },
});
const emailInput = createElement('input', 20, 80, {
  parentId: formContainer.id,
  name: 'Email Address',
  content: 'alex@example.com',
  formConfig: {
    inputType: 'email',
    fieldName: 'leadEmail',
    required: true,
  },
});
const submitBtn = createElement('button', 20, 150, {
  parentId: formContainer.id,
  content: 'Join Waitlist',
  behavior: {
    actionType: 'submit-form',
    actionPayload: 'Welcome aboard! Check your inbox soon.',
  },
});

const mockPage = {
  id: 'page_1',
  name: 'Home',
  slug: 'home',
  elements: [formContainer, nameInput, emailInput, submitBtn],
};

const mockProject = {
  id: 'proj_test_1',
  name: 'SaaS Launchpad',
  pages: [mockPage],
};

// Execute Form Submission
const subResult = await executeFormSubmission(submitBtn, mockPage, mockProject);
assert.strictEqual(subResult.success, true, 'Form submission should succeed');
assert.ok(subResult.message?.includes('Welcome aboard!'), 'Custom action payload message returned');

// 3. Verify Database Persistence
console.log('  Testing Lead Persistence in Database...');
const submissions = await databaseService.getSubmissions();
assert.ok(Array.isArray(submissions), 'Submissions must be an array');
const foundLead = submissions.find(
  (s) => s.email === 'alex@example.com' || s.name === 'Alex Rivera'
);
assert.ok(foundLead, 'Submitted lead must be persisted in database submissions');
assert.strictEqual(foundLead?.page_slug, 'home', 'Submission page_slug matches active page');
console.log('  ✅ Lead Persistence verified');

// 4. Test CSV Export Logic
console.log('  Testing CSV Export Formatting...');
const escapeCsv = (val) => {
  const str = String(val ?? '').replace(/"/g, '""');
  return `"${str}"`;
};
const headers = ['ID', 'Date', 'Page', 'Form Type', 'Lead Name', 'Lead Email', 'Custom Data'];
const rows = [
  [
    foundLead.id,
    new Date(foundLead.created_at).toLocaleString(),
    foundLead.page_slug,
    foundLead.form_type,
    foundLead.name,
    foundLead.email,
    JSON.stringify(foundLead.data),
  ],
];
const csvContent = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');

assert.ok(csvContent.includes('"alex@example.com"'), 'CSV contains lead email');
assert.ok(csvContent.includes('"Alex Rivera"'), 'CSV contains lead name');
assert.ok(csvContent.includes('"Page"'), 'CSV contains Page header');
console.log('  ✅ CSV Export Formatting passed');

// 5. Test Export HTML Semantic Output & Script
console.log('  Testing HTML Export Generation with interactive forms & anchor scroll...');
const exportedHtml = generateExportHtml(
  { name: 'Test App', pages: [mockPage] },
  mockPage
);

assert.ok(exportedHtml.includes('<input'), 'Exported HTML must contain <input> elements');
assert.ok(exportedHtml.includes('submitStudioLead'), 'Exported HTML must include submitStudioLead script');
assert.ok(exportedHtml.includes('a[href^="#"]'), 'Exported HTML must support smooth anchor navigation');
console.log('  ✅ HTML Export Semantic Output passed');

console.log('\n🎉 ALL FUNCTIONAL FORMS & WEBSITES TESTS PASSED (5/5)');
