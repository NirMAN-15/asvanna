/**
 * Sri Lankan NIC & Phone Number Validation Utilities
 * Supports National Identity Cards (old & new), phone numbers, and Business Registrations.
 */

/**
 * Validates Sri Lankan National Identity Card (NIC).
 * - Old NIC: 9 digits followed by 'V' or 'X' (e.g. 851234567V, 123456789X)
 * - New NIC: 12 digits (e.g. 198512345678, 200134567890)
 */
export const validateNIC = (nic) => {
  if (!nic || typeof nic !== 'string') {
    return { isValid: false, message: 'NIC number is required.' };
  }
  const clean = nic.trim().toUpperCase();
  const oldNicRegex = /^[0-9]{9}[VX]$/;
  const newNicRegex = /^[0-9]{12}$/;

  if (oldNicRegex.test(clean) || newNicRegex.test(clean)) {
    return { isValid: true, message: '', clean };
  }

  return {
    isValid: false,
    message: 'Please enter a valid Sri Lankan NIC (e.g. 198512345678 or 851234567V).',
  };
};

/**
 * Validates Sri Lankan Phone Number.
 * - Standard 10 digits starting with 0 (e.g. 0771234567, 0572222222)
 * - International format: +947XXXXXXXX or 947XXXXXXXX
 * - 9-digit format: e.g. 712345678 (when prefixed with +94 in UI)
 */
export const validatePhone = (phone, allow9Digits = true) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, message: 'Phone number is required.' };
  }
  const clean = phone.trim().replace(/[\s\-()]/g, '');

  const tenDigitRegex = /^0[0-9]{9}$/;
  const intlRegex = /^(?:\+94|94)[0-9]{9}$/;
  const nineDigitRegex = /^[1-9][0-9]{8}$/;

  if (tenDigitRegex.test(clean)) {
    return { isValid: true, message: '', clean };
  }

  if (intlRegex.test(clean)) {
    const normalized = '0' + clean.replace(/^\+?94/, '');
    return { isValid: true, message: '', clean: normalized };
  }

  if (allow9Digits && nineDigitRegex.test(clean)) {
    const normalized = '0' + clean;
    return { isValid: true, message: '', clean: normalized };
  }

  return {
    isValid: false,
    message: 'Please enter a valid Sri Lankan phone number (e.g. 0771234567 or 0572222222).',
  };
};

/**
 * Validates Business Registration (BR) or Owner NIC for Buyer.
 * Accepts valid Sri Lankan NIC or BR alphanumeric format (e.g. PV-88341, W/12345).
 */
export const validateBuyerNicOrBr = (value) => {
  if (!value || typeof value !== 'string') {
    return { isValid: false, message: 'Business Registration or NIC is required.' };
  }
  const clean = value.trim().toUpperCase();

  const nicResult = validateNIC(clean);
  if (nicResult.isValid) {
    return { isValid: true, message: '', clean, type: 'NIC' };
  }

  const brRegex = /^[A-Z0-9\/\-\. ]{4,25}$/;
  if (brRegex.test(clean) && /[0-9]/.test(clean)) {
    return { isValid: true, message: '', clean, type: 'BR' };
  }

  return {
    isValid: false,
    message: 'Please enter a valid NIC (e.g. 198512345678) or Business Reg. (e.g. PV-88341).',
  };
};

/**
 * Validates Login Identifier (Phone Number, NIC, or Email).
 */
export const validateLoginIdentifier = (identifier) => {
  if (!identifier || typeof identifier !== 'string') {
    return { isValid: false, message: 'Please enter your phone number, NIC, or email.' };
  }
  const clean = identifier.trim();

  // Phone check
  const phoneRes = validatePhone(clean, true);
  if (phoneRes.isValid) {
    return { isValid: true, message: '', type: 'PHONE', clean: phoneRes.clean };
  }

  // NIC check
  const nicRes = validateNIC(clean);
  if (nicRes.isValid) {
    return { isValid: true, message: '', type: 'NIC', clean: nicRes.clean };
  }

  // Email check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(clean)) {
    return { isValid: true, message: '', type: 'EMAIL', clean };
  }

  return {
    isValid: false,
    message: 'Please enter a valid phone number (e.g. 0771234567) or NIC (e.g. 198512345678 / 851234567V).',
  };
};
