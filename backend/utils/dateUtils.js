// utils/dateUtils.js

/**
 * Get the date of the most recent Friday
 * @param {Date} [referenceDate=new Date()] - Optional reference date, defaults to current date
 * @returns {Date} Date object representing last Friday
 */
const getLastFriday = (referenceDate = new Date()) => {
    const date = new Date(referenceDate);
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek < 5 ? dayOfWeek + 2 : dayOfWeek - 5;
    date.setDate(date.getDate() - diff);
    return date;
  };
  
  /**
   * Get the date of the Friday before last
   * @param {Date} [referenceDate=new Date()] - Optional reference date, defaults to current date
   * @returns {Date} Date object representing the Friday before last
   */
  const getLastLastFriday = (referenceDate = new Date()) => {
    const lastFriday = getLastFriday(referenceDate);
    lastFriday.setDate(lastFriday.getDate() - 7);
    return lastFriday;
  };
  
  /**
   * Format helpers to get dates in different formats
   */
  const dateFormatters = {
    /**
     * Get date as ISO string (YYYY-MM-DD)
     */
    toISOString: (date) => date.toISOString().split('T')[0],
    
    /**
     * Get date as locale string (e.g., "Fri Dec 15 2023")
     */
    toDateString: (date) => date.toDateString(),
    
    /**
     * Get full ISO string for database queries
     */
    toFullISOString: (date) => date.toISOString()
  };
  
  /**
   * Check if a date falls between last Friday and the Friday before
   * @param {Date} dateToCheck - The date to validate
   * @returns {boolean} True if date is valid
   */
  const isDateInLastWeek = (dateToCheck) => {
    const date = new Date(dateToCheck);
    const lastFriday = getLastFriday();
    const lastLastFriday = getLastLastFriday();
    
    return date > lastLastFriday && date <= lastFriday;
  };
  
  module.exports = {
    getLastFriday,
    getLastLastFriday,
    dateFormatters,
    isDateInLastWeek
  };