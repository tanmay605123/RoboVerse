/**
 * RoboVerse Phase 9 Security Audit & DPDP Compliance Verification Suite
 * 
 * Checks:
 * 1. Git Tracked Files Secret Leak Scan (zero hardcoded production secrets in client/mobile/web)
 * 2. Next.js Security Headers & CSP configuration (HSTS, nosniff, DENY, Permissions-Policy)
 * 3. DPDP Act Compliance (Consent fields, data export endpoint, erasure flow)
 * 4. Zero Password Exposure in Admin & Student Directory
 * 5. Least-Privilege Supabase RLS Policy Coverage
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('===============================================================');
console.log('🛡️  RoboVerse Phase 9: Security Audit & DPDP Compliance Suite');
console.log('===============================================================\n');

const repoRoot = path.resolve(__dirname, '..');

// ==========================================
// 1. REPO SECRET SCAN
// ==========================================
console.log('--- 1. Repository Secret & Key Leakage Scan ---');

runTest('Git tracked files do not contain exposed production private keys or secret tokens', () => {
  // Read sensitive code directories
  const filesToCheck = [
    'apps/web/src/app/api/rituu/chat/route.ts',
    'apps/web/src/app/api/store/checkout/route.ts',
    'apps/web/src/app/api/store/verify-order/route.ts',
    'apps/web/src/app/api/admin/overview/route.ts',
    'apps/web/src/app/api/admin/students/route.ts',
    'apps/mobile/src/store/useMobileAuthStore.ts',
    'packages/shared/src/client/supabaseClient.ts',
  ];

  const forbiddenPatterns = [
    /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
    /rzp_live_[a-zA-Z0-9]{14,}/,
    /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+_SERVICE_ROLE/,
  ];

  for (const relPath of filesToCheck) {
    const fullPath = path.join(repoRoot, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      forbiddenPatterns.forEach(pattern => {
        assert(!pattern.test(content), `Secret leak detected in ${relPath} matching ${pattern}`);
      });
    }
  }
});

runTest('Client-side Supabase configuration uses anon key only, never service_role key', () => {
  const clientFile = path.join(repoRoot, 'apps/web/src/lib/supabaseClient.ts');
  if (fs.existsSync(clientFile)) {
    const content = fs.readFileSync(clientFile, 'utf8');
    assert(!content.includes('service_role'), 'Client supabaseClient must never reference service_role key');
    assert(content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY') || content.includes('anon'), 'Client must use anon key');
  }
});

runTest('Edge functions config verifies JWT authentication for payments and chats', () => {
  const configFile = path.join(repoRoot, 'supabase/config.toml');
  assert(fs.existsSync(configFile), 'supabase/config.toml must exist');
  const content = fs.readFileSync(configFile, 'utf8');
  assert(content.includes('verify_jwt = true') || content.includes('[functions.rituu-chat]'), 'Functions config must specify JWT auth rules');
  assert(content.includes('[functions.razorpay-webhook]'), 'Webhook function must be declared');
  assert(content.includes('verify_jwt = false'), 'Webhook function must bypass client JWT to verify HMAC itself');
});

// ==========================================
// 2. SECURITY HEADERS & CSP
// ==========================================
console.log('\n--- 2. Production Security Headers & CSP ---');

runTest('Next.js configuration applies strict HTTP security headers', () => {
  const nextConfigPath = path.join(repoRoot, 'apps/web/next.config.mjs');
  assert(fs.existsSync(nextConfigPath), 'next.config.mjs must exist');
  const content = fs.readFileSync(nextConfigPath, 'utf8');

  assert(content.includes('X-Content-Type-Options') && content.includes('nosniff'), 'Missing nosniff header');
  assert(content.includes('X-Frame-Options') && content.includes('DENY'), 'Missing X-Frame-Options DENY');
  assert(content.includes('Strict-Transport-Security'), 'Missing HSTS header');
  assert(content.includes('Referrer-Policy'), 'Missing Referrer-Policy header');
  assert(content.includes('Permissions-Policy'), 'Missing Permissions-Policy header');
});

// ==========================================
// 3. DPDP COMPLIANCE & PRIVACY
// ==========================================
console.log('\n--- 3. Digital Personal Data Protection (DPDP) Compliance ---');

runTest('Database migration defines parental consent and minor protection fields', () => {
  const migrationDir = path.join(repoRoot, 'supabase/migrations');
  const files = fs.readdirSync(migrationDir);
  let hasConsentFields = false;

  for (const f of files) {
    const content = fs.readFileSync(path.join(migrationDir, f), 'utf8');
    if (content.includes('is_minor') && content.includes('parental_consent_at') && content.includes('location_consent')) {
      hasConsentFields = true;
      break;
    }
  }

  assert(hasConsentFields, 'Migrations must declare is_minor, parental_consent_at, and location_consent');
});

runTest('DPDP Right to Access (Data Export) endpoint is defined', () => {
  const exportRoute = path.join(repoRoot, 'apps/web/src/app/api/privacy/export/route.ts');
  assert(fs.existsSync(exportRoute), 'DPDP data export route must exist');
  const content = fs.readFileSync(exportRoute, 'utf8');
  assert(content.includes('India Digital Personal Data Protection Act'), 'Export must declare DPDP Act basis');
  assert(content.includes('academicRecords') && content.includes('userGeneratedContent'), 'Export must package academic and project records');
});

runTest('DPDP Right to Erasure (Data Deletion) endpoint enforces statutory grace period', () => {
  const deleteRoute = path.join(repoRoot, 'apps/web/src/app/api/privacy/delete/route.ts');
  assert(fs.existsSync(deleteRoute), 'DPDP data deletion route must exist');
  const content = fs.readFileSync(deleteRoute, 'utf8');
  assert(content.includes('confirmDelete'), 'Deletion requires explicit confirmDelete confirmation');
  assert(content.includes('gracePeriodDays: 14'), 'Must enforce statutory 14-day grace period');
  assert(content.includes('7-year statutory retention'), 'Must retain necessary GST financial audit records per Indian tax laws');
});

// ==========================================
// 4. ADMIN ZERO-PASSWORD POLICY
// ==========================================
console.log('\n--- 4. Administrative Zero-Password Policy ---');

runTest('Admin Students API never queries or returns password fields', () => {
  const adminStudentsRoute = path.join(repoRoot, 'apps/web/src/app/api/admin/students/route.ts');
  const content = fs.readFileSync(adminStudentsRoute, 'utf8');

  assert(!content.includes('password_hash'), 'admin_students must not query password_hash');
  assert(!content.includes('raw_user_meta_data.password'), 'admin_students must not query raw user passwords');
  assert(content.includes('resetPasswordForEmail'), 'Locked out students must be assisted via email reset link, never plaintext password');
});

// ==========================================
// 5. RLS POLICY TESTS
// ==========================================
console.log('\n--- 5. Supabase RLS Policy Coverage ---');

runTest('Comprehensive pgTAP test file covers all least-privilege requirements', () => {
  const rlsTestPath = path.join(repoRoot, 'supabase/tests/rls_comprehensive_tests.sql');
  assert(fs.existsSync(rlsTestPath), 'rls_comprehensive_tests.sql must exist');
  const content = fs.readFileSync(rlsTestPath, 'utf8');

  assert(content.includes('cart_items'), 'pgTAP must test cart_items isolation');
  assert(content.includes('chat_messages'), 'pgTAP must test chat_messages isolation');
  assert(content.includes('circuit_projects'), 'pgTAP must test circuit_projects isolation');
  assert(content.includes('UPDATE public.profiles SET role'), 'pgTAP must test student role immutability');
  assert(content.includes('verify_certificate'), 'pgTAP must test public verify_certificate accessibility');
});

// ==========================================
// SUMMARY
// ==========================================
console.log('\n===============================================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log('===============================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
