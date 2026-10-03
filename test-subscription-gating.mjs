import assert from 'node:assert';
import {
  normalizeSubscriptionTier,
  checkPlanQuota,
  PLAN_CONFIGS,
} from './src/types/subscription.ts';

console.log('🧪 Starting Subscription & Pricing Tier Gating Test Suite...\n');

// Test 1: Plan Tier Normalization
console.log('Test 1: Plan Tier Normalization...');
assert.strictEqual(normalizeSubscriptionTier('Free Starter'), 'free');
assert.strictEqual(normalizeSubscriptionTier('free'), 'free');
assert.strictEqual(normalizeSubscriptionTier(null), 'free');
assert.strictEqual(normalizeSubscriptionTier(undefined), 'free');
assert.strictEqual(normalizeSubscriptionTier('Free (All Features Unlocked)'), 'free');
assert.strictEqual(normalizeSubscriptionTier('Pro Studio'), 'pro');
assert.strictEqual(normalizeSubscriptionTier('pro'), 'pro');
assert.strictEqual(normalizeSubscriptionTier('PRO'), 'pro');
assert.strictEqual(normalizeSubscriptionTier('Studio Enterprise'), 'enterprise');
assert.strictEqual(normalizeSubscriptionTier('enterprise'), 'enterprise');
console.log('✅ Passed: Subscription tiers normalized accurately across all formats.\n');

// Test 2: Plan Quota Configurations
console.log('Test 2: Plan Quota Configurations...');
const freeQuotas = PLAN_CONFIGS.free.quotas;
const proQuotas = PLAN_CONFIGS.pro.quotas;
const entQuotas = PLAN_CONFIGS.enterprise.quotas;

assert.strictEqual(freeQuotas.maxProjects, 2, 'Free plan should allow up to 2 projects');
assert.strictEqual(freeQuotas.maxPagesPerProject, 1, 'Free plan should allow 1 page');
assert.strictEqual(freeQuotas.canExportZip, false, 'Free plan cannot export ZIP');
assert.strictEqual(freeQuotas.canRemoveWatermark, false, 'Free plan cannot remove watermark');

assert.strictEqual(proQuotas.maxProjects, Infinity, 'Pro plan has unlimited projects');
assert.strictEqual(proQuotas.maxPagesPerProject, Infinity, 'Pro plan has unlimited pages');
assert.strictEqual(proQuotas.canExportZip, true, 'Pro plan can export ZIP');
assert.strictEqual(proQuotas.canRemoveWatermark, true, 'Pro plan can remove watermark');

assert.strictEqual(entQuotas.canUseTeamCollab, true, 'Enterprise plan includes team collaboration');
assert.strictEqual(entQuotas.cloudStorageMb, 51200, 'Enterprise includes 50GB storage');
console.log('✅ Passed: Plan tier quotas verified.\n');

// Test 3: Quota Guard Checks
console.log('Test 3: Quota Guard Checks...');
function canCreateProject(userPlan, currentProjectCount) {
  const max = checkPlanQuota(userPlan, 'maxProjects');
  return currentProjectCount < max;
}

function canAddPage(userPlan, currentPageCount) {
  const max = checkPlanQuota(userPlan, 'maxPagesPerProject');
  return currentPageCount < max;
}

function canExportZip(userPlan) {
  return checkPlanQuota(userPlan, 'canExportZip');
}

function canRemoveWatermark(userPlan) {
  return checkPlanQuota(userPlan, 'canRemoveWatermark');
}

// Free Plan Gating
assert.strictEqual(canCreateProject('free', 0), true);
assert.strictEqual(canCreateProject('free', 1), true);
assert.strictEqual(canCreateProject('free', 2), false, '3rd project should be blocked on free tier');

assert.strictEqual(canAddPage('free', 0), true);
assert.strictEqual(canAddPage('free', 1), false, '2nd page should be blocked on free tier');

assert.strictEqual(canExportZip('free'), false);
assert.strictEqual(canRemoveWatermark('free'), false);

// Pro Plan Gating
assert.strictEqual(canCreateProject('pro', 2), true);
assert.strictEqual(canCreateProject('pro', 99), true);
assert.strictEqual(canAddPage('pro', 1), true);
assert.strictEqual(canAddPage('pro', 20), true);
assert.strictEqual(canExportZip('pro'), true);
assert.strictEqual(canRemoveWatermark('pro'), true);

// Enterprise Plan Gating
assert.strictEqual(canCreateProject('enterprise', 999), true);
assert.strictEqual(canExportZip('enterprise'), true);
assert.strictEqual(canRemoveWatermark('enterprise'), true);
console.log('✅ Passed: Feature gating logic and quota boundaries enforced accurately.\n');

// Test 4: Pricing Model Integrity
console.log('Test 4: Pricing & Discount Model Integrity...');
assert.strictEqual(PLAN_CONFIGS.pro.monthlyPrice, 19);
assert.strictEqual(PLAN_CONFIGS.pro.annualPrice, 15);
assert.strictEqual(PLAN_CONFIGS.enterprise.monthlyPrice, 49);
assert.strictEqual(PLAN_CONFIGS.enterprise.annualPrice, 39);

// Verify Annual Savings (15 * 12 = 180 vs 19 * 12 = 228 -> 21% savings)
const proAnnualTotal = PLAN_CONFIGS.pro.annualPrice * 12;
const proMonthlyTotal = PLAN_CONFIGS.pro.monthlyPrice * 12;
assert.ok(proAnnualTotal < proMonthlyTotal, 'Annual pricing must yield a discount');

console.log('✅ Passed: Pricing and discount models validated.\n');

console.log('🎉 ALL SUBSCRIPTION & PLAN GATING TESTS PASSED WITH 100% SUCCESS!');
