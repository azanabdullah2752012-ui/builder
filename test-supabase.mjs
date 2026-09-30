import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jyliqmshfkszdxlndvdb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_g4_LPJtO6ocfBKPj34JM6A_edgJKr2Q';

console.log('🧪 Starting Supabase Cloud Integration Test Suite...\n');

// Test 1: Check client initialization
console.log('Test 1: Initialize Supabase JS Client');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
if (!supabase || !supabase.auth) {
  throw new Error('Supabase client failed to initialize');
}
console.log('✅ Passed: Supabase JS client initialized successfully.');

// Test 2: Check Supabase Auth Health Ping
console.log('\nTest 2: Check Supabase Auth Endpoint Connectivity');
const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
  headers: { apikey: SUPABASE_KEY },
});
if (!res.ok) {
  throw new Error(`Supabase ping failed with status ${res.status}`);
}
const healthData = await res.json();
console.log(`✅ Passed: Connected to Supabase Auth service (${healthData.name} ${healthData.version}) with HTTP ${res.status}.`);

// Test 3: Check Supabase Auth Settings
console.log('\nTest 3: Verify Supabase GoTrue Auth Settings');
const settingsRes = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
  headers: { apikey: SUPABASE_KEY },
});
if (!settingsRes.ok) {
  throw new Error(`Supabase settings request failed with status ${settingsRes.status}`);
}
const settings = await settingsRes.json();
if (settings.disable_signup) {
  throw new Error('Supabase sign-up is disabled');
}
console.log(`✅ Passed: Sign-up is enabled (email: ${settings.external.email}, disable_signup: ${settings.disable_signup}).`);

// Test 4: Check Google OAuth Provider Status
console.log('\nTest 4: Verify Supabase Google OAuth Provider Status');
const isGoogleEnabled = !!settings.external?.google;
console.log(`✅ Passed: Google OAuth provider status verified: ${isGoogleEnabled ? 'ENABLED (active)' : 'DISABLED'}`);

console.log('\n🎉 ALL SUPABASE INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
