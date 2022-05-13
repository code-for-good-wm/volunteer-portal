/**
 * Capitalize first letter of a string
 * @param {string} string - e.g. 'consumer'
 * @returns {string} - e.g. 'Consumer'
 */
export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
