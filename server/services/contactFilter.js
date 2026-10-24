/**
 * ChaloBuddy Security Engine: Multi-Layered Contact Information Protection
 * Prevents unauthorized sharing of personal contact details (phone, email, social handles,
 * messaging apps) in travel rooms and direct chats, while safeguarding legitimate
 * travel discussions (prices, flight numbers, train numbers, dates, hotel links).
 */

// Normalized digit dictionary for textual numbers (English & Hindi/Hinglish transliteration)
const WORD_TO_DIGIT = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  shunya: '0',
  ek: '1',
  do: '2',
  teen: '3',
  char: '4',
  paanch: '5',
  chhey: '6',
  saat: '7',
  aath: '8',
  nau: '9',
};

// Recognized airline IATA codes for whitelist protection
const AIRLINE_PREFIXES = [
  'ai', '6e', 'uk', 'sg', 'g8', 'qp', 'ix', 'i5', 'ba', 'ek', 'ey', 'qr', 'sq', 'lh', 'cx', 'af', 'kl'
];

/**
 * Clean & normalize text to defeat common evasion techniques
 */
export function normalizeText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText
    // Remove zero-width & invisible unicode characters
    .replace(/[\u200B-\u200D\uFEFF\u00A0\u200E\u200F]/g, ' ')
    // Normalize unicode NFKD
    .normalize('NFKD')
    // Replace typical evasion brackets
    .replace(/\[\s*(at|dot)\s*\]/gi, (m, p) => (p.toLowerCase() === 'at' ? '@' : '.'))
    .replace(/\(\s*(at|dot)\s*\)/gi, (m, p) => (p.toLowerCase() === 'at' ? '@' : '.'))
    .replace(/\{\s*(at|dot)\s*\}/gi, (m, p) => (p.toLowerCase() === 'at' ? '@' : '.'));

  return text;
}

/**
 * Check if a sequence of digits matches a legitimate travel entity
 */
function isLegitimateTravelToken(candidate, fullText) {
  const lowerText = fullText.toLowerCase();

  // 1. Flight Number check (e.g. 6E 205, AI-102, UK 819)
  for (const prefix of AIRLINE_PREFIXES) {
    const flightRegex = new RegExp(`\\b${prefix}[-\\s]?\\d{3,4}\\b`, 'i');
    if (flightRegex.test(candidate) || flightRegex.test(lowerText)) {
      return true;
    }
  }

  // 2. Train Number check (5 digits in Indian Railways e.g. 12004 Shatabdi, 12951 Rajdhani)
  if (/^\d{5}$/.test(candidate.replace(/\D/g, ''))) {
    if (
      lowerText.includes('train') ||
      lowerText.includes('express') ||
      lowerText.includes('shatabdi') ||
      lowerText.includes('rajdhani') ||
      lowerText.includes('irctc') ||
      lowerText.includes('berth') ||
      lowerText.includes('coach')
    ) {
      return true;
    }
  }

  // 3. Price / Budget format check (e.g. ₹12000, Rs 4500, 25000 INR)
  const priceRegex = /(?:₹|rs\.?|inr|\$|€|£)\s*\d{2,7}|\d{2,7}\s*(?:₹|rs\.?|inr|\$|€|£)/i;
  if (priceRegex.test(lowerText)) {
    return true;
  }

  // 4. Year / Date check (e.g. 2026, 2025, 15-10-2026)
  if (/^(?:19|20)\d{2}$/.test(candidate)) {
    return true;
  }

  return false;
}

/**
 * Primary Filter Evaluator
 */
export function evaluateMessage(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return { isAllowed: true, reason: null, violationType: null };
  }

  const normalized = normalizeText(rawMessage);
  const lower = normalized.toLowerCase();

  // ==========================================
  // Layer 1: Email Address Detection
  // ==========================================
  // Standard and bracketed emails: user@domain.com, user at domain dot com
  const standardEmailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
  if (standardEmailRegex.test(normalized)) {
    return {
      isAllowed: false,
      reason: 'Personal contact details (email addresses) cannot be shared in travel chats for member safety.',
      violationType: 'EMAIL_DETECTED',
    };
  }

  const spelledEmailRegex = /[a-zA-Z0-9._%+-]+\s*(?:@|\bat\b)\s*[a-zA-Z0-9.-]+\s*(?:\.|\bdot\b)\s*(?:com|in|org|net|co|io|edu|gov)\b/i;
  if (spelledEmailRegex.test(lower)) {
    return {
      isAllowed: false,
      reason: 'Personal contact details (email addresses) cannot be shared in travel chats for member safety.',
      violationType: 'OBFUSCATED_EMAIL_DETECTED',
    };
  }

  // ==========================================
  // Layer 2: Social Media & Messaging Handles
  // ==========================================
  const socialPatterns = [
    { regex: /(?:wa\.me|api\.whatsapp\.com)\/\S+/i, type: 'WHATSAPP_LINK' },
    { regex: /(?:t\.me|telegram\.me)\/\S+/i, type: 'TELEGRAM_LINK' },
    { regex: /(?:instagram\.com|instagr\.am)\/[a-zA-Z0-9._]+/i, type: 'INSTAGRAM_LINK' },
    { regex: /(?:snapchat\.com\/add)\/[a-zA-Z0-9._]+/i, type: 'SNAPCHAT_LINK' },
    { regex: /\b(?:whatsapp|wa)\s*(?:me|pe|number|no\.?|call|msg)?\s*(?:at|on|is|:)?\s*[\d\s+-]{6,}/i, type: 'WHATSAPP_PROMPT' },
    { regex: /\b(?:my\s+)?(?:insta|ig|telegram|tg|snapchat|snap)\s*(?:id|handle|username|is|:)?\s*@?([a-zA-Z0-9._]{4,30})\b/i, type: 'SOCIAL_HANDLE' },
    { regex: /(?:ping|dm|reach)\s+me\s+on\s+(?:insta|ig|whatsapp|wa|telegram|tg|snap)/i, type: 'EXTERNAL_APP_REDIRECT' },
  ];

  for (const { regex, type } of socialPatterns) {
    if (regex.test(lower)) {
      return {
        isAllowed: false,
        reason: 'External messaging handles or social links are restricted. Please communicate safely within ChaloBuddy.',
        violationType: type,
      };
    }
  }

  // ==========================================
  // Layer 3: Phone Number Detection
  // ==========================================
  // A. Indian Phone Numbers (10 digits starting with 6, 7, 8, or 9)
  // Handles +91, 091, 91 prefix, spaces, dashes, dots: e.g. +91 98765 43210, 98765-43210, 9876543210
  const indianPhoneRegex = /(?:\+?91[\s.-]?)?(?:0)?([6-9](?:[\s.-]?\d){9})\b/;
  const indianMatch = normalized.match(indianPhoneRegex);
  if (indianMatch) {
    const rawMatch = indianMatch[0];
    const digitsOnly = rawMatch.replace(/\D/g, '');
    const candidateDigits = digitsOnly.startsWith('91') && digitsOnly.length === 12
      ? digitsOnly.slice(2)
      : digitsOnly.startsWith('0') && digitsOnly.length === 11
      ? digitsOnly.slice(1)
      : digitsOnly;

    if (candidateDigits.length === 10 && /^[6-9]/.test(candidateDigits)) {
      if (!isLegitimateTravelToken(rawMatch, normalized)) {
        return {
          isAllowed: false,
          reason: 'Phone numbers cannot be shared in public or private chats. Contact details are kept private to protect traveler security.',
          violationType: 'PHONE_NUMBER_DETECTED',
        };
      }
    }
  }

  // B. Spaced-out Phone Numbers: e.g. "9 8 7 6 5 4 3 2 1 0" or "98 76 54 32 10"
  const spacedDigitsMatch = normalized.match(/\b(?:\d[\s.-]){9,13}\d\b/);
  if (spacedDigitsMatch) {
    const digits = spacedDigitsMatch[0].replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 13) {
      if (!isLegitimateTravelToken(spacedDigitsMatch[0], normalized)) {
        return {
          isAllowed: false,
          reason: 'Phone numbers cannot be shared in chats.',
          violationType: 'SPACED_PHONE_NUMBER_DETECTED',
        };
      }
    }
  }

  // C. Spelled-out Numbers: e.g. "nine eight seven six five four three two one zero"
  let words = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  let consecutiveNumberWords = '';
  for (const w of words) {
    if (WORD_TO_DIGIT[w]) {
      consecutiveNumberWords += WORD_TO_DIGIT[w];
    } else if (/^\d+$/.test(w)) {
      consecutiveNumberWords += w;
    } else {
      if (consecutiveNumberWords.length >= 10) {
        break;
      }
      consecutiveNumberWords = '';
    }
  }

  if (consecutiveNumberWords.length >= 10) {
    const candidate = consecutiveNumberWords.slice(0, 10);
    if (/^[6-9]/.test(candidate)) {
      return {
        isAllowed: false,
        reason: 'Contact numbers written in words or obfuscated formats are prohibited.',
        violationType: 'WORD_PHONE_NUMBER_DETECTED',
      };
    }
  }

  // ==========================================
  // Layer 4: International Phone Formats
  // ==========================================
  // e.g. +1 (555) 234-5678, +44 20 7946 0958
  const intlPhoneRegex = /\+\d{1,3}[\s.-]?(?:\(\d{1,4}\)|\d{1,4})[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/;
  const intlMatch = normalized.match(intlPhoneRegex);
  if (intlMatch && !isLegitimateTravelToken(intlMatch[0], normalized)) {
    const intlDigits = intlMatch[0].replace(/\D/g, '');
    if (intlDigits.length >= 10 && intlDigits.length <= 15) {
      return {
        isAllowed: false,
        reason: 'International phone numbers cannot be shared in chat.',
        violationType: 'INTL_PHONE_DETECTED',
      };
    }
  }

  return { isAllowed: true, reason: null, violationType: null };
}

export default {
  evaluateMessage,
  normalizeText,
};
