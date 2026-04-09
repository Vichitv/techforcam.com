const fs = require('fs');
const path = require('path');
const { HtmlValidate } = require('html-validate');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.error(`  FAIL: ${name}`);
    console.error(`        ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ============================================================
console.log('\n=== HTML Structure Tests ===\n');
// ============================================================

test('Has DOCTYPE declaration', () => {
  assert(html.trimStart().startsWith('<!DOCTYPE html>'), 'Missing <!DOCTYPE html>');
});

test('Has <html> tag with lang attribute', () => {
  assert(/<html\s[^>]*lang=/.test(html), 'Missing lang attribute on <html>');
});

test('Has <head> section', () => {
  assert(html.includes('<head>'), 'Missing <head>');
});

test('Has charset meta tag', () => {
  assert(/meta\s+charset/i.test(html), 'Missing charset meta tag');
});

test('Has viewport meta tag', () => {
  assert(/meta\s+name=["']viewport["']/i.test(html), 'Missing viewport meta tag');
});

test('Has <title> tag', () => {
  assert(/<title>.+<\/title>/.test(html), 'Missing or empty <title>');
});

test('Has <body> tag', () => {
  assert(html.includes('<body>'), 'Missing <body>');
});

test('Closing </html> tag present', () => {
  assert(html.includes('</html>'), 'Missing closing </html>');
});

test('Closing </body> tag present', () => {
  assert(html.includes('</body>'), 'Missing closing </body>');
});

// ============================================================
console.log('\n=== Navigation Tests ===\n');
// ============================================================

test('Has navigation bar', () => {
  assert(/<nav\b/.test(html), 'Missing <nav> element');
});

test('Nav contains logo link', () => {
  assert(/class=["']nav-logo["']/.test(html), 'Missing nav-logo');
});

test('Nav contains links section', () => {
  assert(/class=["']nav-links["']/.test(html), 'Missing nav-links');
});

test('Has mobile menu', () => {
  assert(/class=["']mobile-menu["']/.test(html), 'Missing mobile-menu');
});

test('Has burger menu button', () => {
  assert(/class=["']burger["']/.test(html), 'Missing burger menu');
});

// ============================================================
console.log('\n=== Required Sections Tests ===\n');
// ============================================================

const sections = ['home', 'about', 'services', 'why-us', 'industries', 'blog', 'contact'];
sections.forEach(id => {
  test(`Has #${id} section`, () => {
    assert(html.includes(`id="${id}"`), `Missing section with id="${id}"`);
  });
});

test('Has footer', () => {
  assert(/<footer\b/.test(html), 'Missing <footer> element');
});

// ============================================================
console.log('\n=== Internal Links Consistency ===\n');
// ============================================================

const navHrefs = [...html.matchAll(/href=["'](#[\w-]+)["']/g)].map(m => m[1]);
const uniqueAnchors = [...new Set(navHrefs)];

uniqueAnchors.forEach(anchor => {
  const id = anchor.slice(1);
  test(`Anchor ${anchor} has matching id`, () => {
    assert(
      html.includes(`id="${id}"`) || id === '',
      `No element with id="${id}" found for anchor ${anchor}`
    );
  });
});

// ============================================================
console.log('\n=== Content Tests ===\n');
// ============================================================

test('Hero section has heading', () => {
  assert(/<section[^>]*id=["']home["'][^>]*>[\s\S]*?<h1/.test(html), 'Hero missing <h1>');
});

test('Hero section has CTA buttons', () => {
  assert(/class=["']hero-btns/.test(html), 'Hero missing CTA buttons');
});

test('Services section has service cards', () => {
  assert(/class=["']services-grid/.test(html), 'Missing services grid');
  const cardCount = (html.match(/class=["']service-card["']/g) || []).length;
  assert(cardCount >= 3, `Expected at least 3 service cards, found ${cardCount}`);
});

test('Contact section has form inputs', () => {
  assert(html.includes('id="fname"'), 'Missing name input');
  assert(html.includes('id="femail"'), 'Missing email input');
  assert(html.includes('id="fmessage"'), 'Missing message input');
});

test('Contact section has submit button', () => {
  assert(html.includes('id="contactBtn"'), 'Missing contact submit button');
});

test('Footer has copyright notice', () => {
  assert(/©/.test(html), 'Missing copyright notice');
});

// ============================================================
console.log('\n=== Admin Panel Tests ===\n');
// ============================================================

test('Has admin overlay', () => {
  assert(html.includes('id="adminOverlay"'), 'Missing admin overlay');
});

test('Has login screen', () => {
  assert(html.includes('id="loginScreen"'), 'Missing login screen');
});

test('Has admin dashboard', () => {
  assert(html.includes('id="adminDash"'), 'Missing admin dashboard');
});

test('Login has username and password fields', () => {
  assert(html.includes('id="loginUser"'), 'Missing login username input');
  assert(html.includes('id="loginPass"'), 'Missing login password input');
});

// ============================================================
console.log('\n=== JavaScript Integrity Tests ===\n');
// ============================================================

test('Has script tag', () => {
  assert(/<script>/.test(html), 'Missing <script> tag');
});

test('Google Sheets config present', () => {
  assert(/SHEET_ID/.test(html), 'Missing SHEET_ID config');
  assert(/APPS_SCRIPT_URL/.test(html), 'Missing APPS_SCRIPT_URL config');
});

const requiredFunctions = [
  'toggleMenu', 'closeMenu', 'showAdmin', 'hideAdmin', 'doLogin', 'doLogout',
  'sendForm', 'loadAllData', 'fetchSheetCSV', 'renderDashboard',
  'renderPublicBlog', 'switchTab'
];
requiredFunctions.forEach(fn => {
  test(`Function ${fn}() is defined`, () => {
    assert(
      new RegExp(`function\\s+${fn}\\b`).test(html),
      `Missing function definition: ${fn}`
    );
  });
});

// ============================================================
console.log('\n=== CSS Tests ===\n');
// ============================================================

test('Has embedded stylesheet', () => {
  assert(/<style>/.test(html), 'Missing <style> tag');
});

test('Uses CSS custom properties', () => {
  assert(/:root\s*\{/.test(html), 'Missing :root CSS custom properties');
});

test('Has responsive media queries', () => {
  const mediaCount = (html.match(/@media/g) || []).length;
  assert(mediaCount >= 2, `Expected at least 2 media queries, found ${mediaCount}`);
});

test('Has animation keyframes', () => {
  assert(/@keyframes/.test(html), 'Missing @keyframes animation');
});

// ============================================================
console.log('\n=== HTML Validation ===\n');
// ============================================================

const htmlvalidate = new HtmlValidate({
  extends: ["html-validate:recommended"],
  rules: {
    "no-inline-style": "off",
    "no-trailing-whitespace": "off",
    "no-raw-characters": "off",
    "tel-non-breaking": "off",
    "long-title": "off",
    "wcag/h30": "off",
    "wcag/h36": "off",
    "wcag/h67": "off",
    "wcag/h71": "off",
    "attribute-boolean-style": "off",
    "element-permitted-content": "off",
    "no-implicit-button-type": "off",
    "script-element": "off",
    "unique-landmark": "off"
  }
});
const report = htmlvalidate.validateStringSync(html);
const errors = report.results.flatMap(r => r.messages.filter(m => m.severity === 2));
const warnings = report.results.flatMap(r => r.messages.filter(m => m.severity === 1));

test(`HTML validation errors: ${errors.length} (threshold: 5)`, () => {
  if (errors.length > 5) {
    const top5 = errors.slice(0, 5).map(e => `  Line ${e.line}: ${e.message}`).join('\n');
    assert(false, `Found ${errors.length} validation error(s), exceeds threshold of 5:\n${top5}`);
  }
});

if (errors.length > 0) {
  console.log(`  INFO: ${errors.length} validation error(s) (within threshold)`);
  errors.slice(0, 5).forEach(e => console.log(`        Line ${e.line}: ${e.message}`));
}

console.log(`  INFO: ${warnings.length} validation warning(s)`);
if (warnings.length > 0) {
  warnings.slice(0, 5).forEach(w => console.log(`        Line ${w.line}: ${w.message}`));
}

// ============================================================
console.log('\n=== Results ===\n');
// ============================================================

console.log(`  Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}\n`);
process.exit(failed > 0 ? 1 : 0);
