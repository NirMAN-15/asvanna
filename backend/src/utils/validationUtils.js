/**
 * Validation utilities for ASVANNA Backend
 * Sri Lankan NIC, Phone, and Strong Password Verification
 */

function validateNIC(nic) {
  if (!nic || typeof nic !== 'string') {
    return { isValid: false, message: 'NIC is required.' };
  }
  const clean = nic.trim().toUpperCase();
  const oldNicRegex = /^[0-9]{9}[VX]$/;
  const newNicRegex = /^[0-9]{12}$/;

  if (oldNicRegex.test(clean) || newNicRegex.test(clean)) {
    return { isValid: true, message: '', clean };
  }

  return {
    isValid: false,
    message: 'Please enter a valid Sri Lankan NIC (e.g. 198512345678 or 851234567V).'
  };
}

function validatePhone(phone) {
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
  if (nineDigitRegex.test(clean)) {
    const normalized = '0' + clean;
    return { isValid: true, message: '', clean: normalized };
  }

  return {
    isValid: false,
    message: 'Please enter a valid Sri Lankan phone number (e.g. 0771234567).'
  };
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      score: 0,
      hasLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false,
      message: 'Password is required (min 8 characters).'
    };
  }

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[\W_]/.test(password);

  const checks = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial];
  const score = checks.filter(Boolean).length;
  const isValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;

  let message = '';
  if (!hasLength) message = 'Password must be at least 8 characters long.';
  else if (!hasUpper) message = 'Password must contain at least one uppercase letter (A-Z).';
  else if (!hasLower) message = 'Password must contain at least one lowercase letter (a-z).';
  else if (!hasNumber) message = 'Password must contain at least one number (0-9).';
  else if (!hasSpecial) message = 'Password must contain at least one special character (!@#$%^&*...).';

  return {
    isValid,
    score,
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    message
  };
}

module.exports = {
  validateNIC,
  validatePhone,
  validatePassword
};
