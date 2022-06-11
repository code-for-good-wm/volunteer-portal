/**
 * Test email for validity
 * @param {string} email 
 * @returns {boolean}
 */
export const testEmail = (email: string) => {
  const emailRegEx = /^[^@]+@[^@.]+\..{2,}$/;
  return emailRegEx.test(email);
};

/**
 * Test password for validity
 * @param {string} password 
 * @returns {boolean}
 */
export const testPassword = (password: string) => {
  if (password.length < 6) {
    return false;
  } else {
    return true;
  }
};

/**
 * Test phone for validity
 * @param {string} phone 
 * @returns {boolean}
 */
export const testPhone = (phone: string) => {
  const phoneRegEx = /^[0-9]{10}$/;
  return phoneRegEx.test(phone);
};