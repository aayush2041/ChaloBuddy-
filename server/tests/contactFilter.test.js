import { evaluateMessage } from '../services/contactFilter.js';
import assert from 'assert';

console.log('🧪 Running ChaloBuddy Contact Information Protection Filter Tests...\n');

let total = 0;
let passed = 0;

function test(description, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ ${description}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    ${err.message}`);
  }
}

// 1. Standard Indian Phone Numbers
test('blocks 10-digit Indian phone number', () => {
  const result = evaluateMessage('Hey, call me directly at 9876543210 to discuss the trip.');
  assert.strictEqual(result.isAllowed, false);
  assert.strictEqual(result.violationType, 'PHONE_NUMBER_DETECTED');
});

test('blocks Indian phone with +91 prefix and spaces', () => {
  const result = evaluateMessage('My mobile is +91 98765 43210 ping me');
  assert.strictEqual(result.isAllowed, false);
  assert.strictEqual(result.violationType, 'PHONE_NUMBER_DETECTED');
});

test('blocks Indian phone with dashes', () => {
  const result = evaluateMessage('Reach out at +91-98765-43210');
  assert.strictEqual(result.isAllowed, false);
});

test('blocks Indian phone with 0 prefix', () => {
  const result = evaluateMessage('Contact number is 09876543210');
  assert.strictEqual(result.isAllowed, false);
});

// 2. Spaced & Obfuscated Numbers
test('blocks spaced-out digits', () => {
  const result = evaluateMessage('Number is 9 8 7 6 5 4 3 2 1 0');
  assert.strictEqual(result.isAllowed, false);
});

test('blocks words-spelled phone numbers', () => {
  const result = evaluateMessage('call me on nine eight seven six five four three two one zero ok');
  assert.strictEqual(result.isAllowed, false);
  assert.strictEqual(result.violationType, 'WORD_PHONE_NUMBER_DETECTED');
});

// 3. International Numbers
test('blocks international phone formats', () => {
  const result = evaluateMessage('Call my US line at +1 (415) 555-2671');
  assert.strictEqual(result.isAllowed, false);
});

// 4. Email Addresses
test('blocks standard email addresses', () => {
  const result = evaluateMessage('Send the details to traveler@gmail.com please');
  assert.strictEqual(result.isAllowed, false);
  assert.strictEqual(result.violationType, 'EMAIL_DETECTED');
});

test('blocks obfuscated bracketed email addresses', () => {
  const result = evaluateMessage('My email is traveler [at] domain [dot] com');
  assert.strictEqual(result.isAllowed, false);
});

test('blocks spelled-out email addresses', () => {
  const result = evaluateMessage('Email me at traveler at yahoo dot com');
  assert.strictEqual(result.isAllowed, false);
});

// 5. Social Media & Messaging Handles
test('blocks WhatsApp links and redirects', () => {
  const result = evaluateMessage('Join our personal group wa.me/919876543210');
  assert.strictEqual(result.isAllowed, false);
  assert.strictEqual(result.violationType, 'WHATSAPP_LINK');
});

test('blocks Telegram links', () => {
  const result = evaluateMessage('Ping me on t.me/traveler123 for secret chat');
  assert.strictEqual(result.isAllowed, false);
});

test('blocks Instagram handle requests', () => {
  const result = evaluateMessage('My insta is @wandering_soul_26 follow me');
  assert.strictEqual(result.isAllowed, false);
});

// 6. Legitimate Travel Discussion Preservation (Zero False Positives)
test('allows flight numbers (e.g. 6E-205, AI-102)', () => {
  const result = evaluateMessage('I booked flight 6E-205 from Delhi to Kullu, arriving at 09:30 AM.');
  assert.strictEqual(result.isAllowed, true);
});

test('allows train numbers and railway berths', () => {
  const result = evaluateMessage('We are boarding Train 12004 Shatabdi Express in coach B3.');
  assert.strictEqual(result.isAllowed, true);
});

test('allows trip budgets, costs, and prices in INR & USD', () => {
  const result = evaluateMessage('Total package is ₹12,500 per person and food allowance is Rs. 4500.');
  assert.strictEqual(result.isAllowed, true);
});

test('allows travel dates and durations', () => {
  const result = evaluateMessage('Departure is on 15 Oct 2026 for a 4 days 3 nights itinerary.');
  assert.strictEqual(result.isAllowed, true);
});

test('allows legitimate travel booking links', () => {
  const result = evaluateMessage('Check this hotel on https://makemytrip.com/hotels/gokarna');
  assert.strictEqual(result.isAllowed, true);
});

console.log(`\n========================================`);
console.log(`Contact Filter Tests: ${passed}/${total} passed`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
