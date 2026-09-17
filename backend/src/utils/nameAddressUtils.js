/**
 * Name and Address Splitting & Formatting Utilities
 * ASVANNA Agricultural Intelligence Platform
 */

/**
 * Split a full name string into first_name, middle_name, last_name
 * Examples:
 * - "nirman achintha wedikkara" -> { first_name: "Nirman", middle_name: "Achintha", last_name: "Wedikkara" }
 * - "Kapila Bandara" -> { first_name: "Kapila", middle_name: null, last_name: "Bandara" }
 * - "W. M. Bandara (DO Officer)" -> { first_name: "W.", middle_name: "M.", last_name: "Bandara" }
 * - "Bandarawela Traders" -> { first_name: "Bandarawela", middle_name: null, last_name: "Traders" }
 */
function splitFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { first_name: '', middle_name: null, last_name: '' };
  }

  // Remove role/status tags in parentheses if present, e.g. "(DO Officer)", "(Farmer)", "(Buyer)"
  const cleanName = fullName.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { first_name: '', middle_name: null, last_name: '' };
  }

  if (parts.length === 1) {
    return {
      first_name: parts[0],
      middle_name: null,
      last_name: ''
    };
  }

  if (parts.length === 2) {
    return {
      first_name: parts[0],
      middle_name: null,
      last_name: parts[1]
    };
  }

  if (parts.length === 3) {
    return {
      first_name: parts[0],
      middle_name: parts[1],
      last_name: parts[2]
    };
  }

  // 4 or more parts
  return {
    first_name: parts[0],
    middle_name: parts.slice(1, -1).join(' '),
    last_name: parts[parts.length - 1]
  };
}

/**
 * Combine first_name, middle_name, last_name into full_name
 */
function formatFullName(firstName, middleName, lastName) {
  const parts = [firstName, middleName, lastName]
    .map(p => (p && typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean);
  return parts.join(' ');
}

/**
 * Split an address string into address_line1, address_line2, city, postal_code
 * Handles common Sri Lankan address formats:
 * - "No 45, Temple Road, Bindunuwewa, Bandarawela, 90100"
 * - "Main Street, Welimada"
 * - "Hilltop Farm, Haputale Road, Bandarawela"
 */
function splitAddress(address, defaultCity = 'Bandarawela', defaultPostal = '90100') {
  if (!address || typeof address !== 'string') {
    return {
      address_line1: null,
      address_line2: null,
      city: defaultCity,
      postal_code: defaultPostal
    };
  }

  const parts = address.split(',').map(s => s.trim()).filter(Boolean);

  if (parts.length === 0) {
    return {
      address_line1: null,
      address_line2: null,
      city: defaultCity,
      postal_code: defaultPostal
    };
  }

  if (parts.length === 1) {
    return {
      address_line1: parts[0],
      address_line2: null,
      city: defaultCity,
      postal_code: defaultPostal
    };
  }

  if (parts.length === 2) {
    return {
      address_line1: parts[0],
      address_line2: null,
      city: parts[1] || defaultCity,
      postal_code: defaultPostal
    };
  }

  if (parts.length === 3) {
    // Check if parts[2] is a postal code
    const isPostal = /^\d{4,5}$/.test(parts[2]);
    return {
      address_line1: parts[0],
      address_line2: parts[1],
      city: isPostal ? defaultCity : parts[2],
      postal_code: isPostal ? parts[2] : defaultPostal
    };
  }

  // 4 or more parts: e.g. "No 45, Temple Road, Bindunuwewa, Bandarawela, 90100"
  let postal_code = defaultPostal;
  let city = defaultCity;
  let line2EndIndex = parts.length;

  const lastPart = parts[parts.length - 1];
  if (/^\d{4,5}$/.test(lastPart)) {
    postal_code = lastPart;
    city = parts[parts.length - 2] || defaultCity;
    line2EndIndex = parts.length - 2;
  } else {
    city = lastPart || defaultCity;
    line2EndIndex = parts.length - 1;
  }

  const line2Parts = parts.slice(1, line2EndIndex);

  return {
    address_line1: parts[0],
    address_line2: line2Parts.length > 0 ? line2Parts.join(', ') : null,
    city: city || defaultCity,
    postal_code: postal_code || defaultPostal
  };
}

/**
 * Combine address components into formatted address string
 */
function formatAddress(addressLine1, addressLine2, city, postalCode) {
  const parts = [addressLine1, addressLine2, city, postalCode]
    .map(p => (p && typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean);
  return parts.join(', ');
}

module.exports = {
  splitFullName,
  formatFullName,
  splitAddress,
  formatAddress
};
