import { generateExportHtml } from './src/utils/exportHtml.js';

console.log('🧪 Starting Interactive Element States (Hover, Active, Focus) Test Suite...\n');

// Mock project and activePage
const project = {
  name: 'States Demo',
  pages: [
    {
      name: 'Home',
      slug: '/',
      backgroundColor: '#09090b',
      canvasWidth: 1200,
      canvasHeight: 800,
      elements: [
        {
          id: 'btn_interactive_1',
          name: 'Interactive CTA Button',
          type: 'button',
          x: 100,
          y: 100,
          width: 200,
          height: 50,
          content: 'Sign Up Free',
          styles: {
            backgroundColor: '#6366f1',
            color: '#ffffff',
            borderRadius: 8,
            fontSize: 15,
          },
          behavior: {
            actionType: 'open-modal',
            hoverStyles: {
              backgroundColor: '#4f46e5',
              scale: 1.05,
              translateY: -4,
              boxShadow: '0 12px 24px -4px rgba(0,0,0,0.5)',
            },
            activeStyles: {
              backgroundColor: '#4338ca',
              scale: 0.96,
              translateY: 2,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
            },
            focusStyles: {
              outlineColor: '#6366f1',
              outlineWidth: 2,
              borderColor: '#818cf8',
              boxShadow: '0 0 0 3px rgba(99,102,241,0.35)',
            },
          },
        },
      ],
    },
  ],
};

const exportedHtml = generateExportHtml(project, project.pages[0]);

// Test 1: Verify :hover pseudo-class generation
console.log('Test 1: Verify :hover pseudo-class in exported CSS...');
if (
  exportedHtml.includes('.el-btn_interactive_1:hover') &&
  exportedHtml.includes('background-color: #4f46e5;') &&
  exportedHtml.includes('transform: translateY(-4px) scale(1.05);')
) {
  console.log('✅ Passed: :hover CSS rule with background-color and compound transform generated.');
} else {
  console.error('❌ Failed: :hover CSS missing or malformed.');
  process.exit(1);
}

// Test 2: Verify :active pseudo-class generation
console.log('\nTest 2: Verify :active pseudo-class in exported CSS...');
if (
  exportedHtml.includes('.el-btn_interactive_1:active') &&
  exportedHtml.includes('background-color: #4338ca;') &&
  exportedHtml.includes('transform: translateY(2px) scale(0.96);')
) {
  console.log('✅ Passed: :active CSS rule with press transform and depressed background generated.');
} else {
  console.error('❌ Failed: :active CSS missing or malformed.');
  process.exit(1);
}

// Test 3: Verify :focus pseudo-class generation
console.log('\nTest 3: Verify :focus / :focus-visible pseudo-class in exported CSS...');
if (
  exportedHtml.includes('.el-btn_interactive_1:focus, .el-btn_interactive_1:focus-visible') &&
  exportedHtml.includes('outline: 2px solid #6366f1;') &&
  exportedHtml.includes('border-color: #818cf8;')
) {
  console.log('✅ Passed: :focus outline and border ring generated.');
} else {
  console.error('❌ Failed: :focus CSS missing or malformed.');
  process.exit(1);
}

console.log('\n🎉 ALL ELEMENT STATE TESTS PASSED WITH 100% SUCCESS!\n');
