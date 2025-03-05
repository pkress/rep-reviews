// utils/dateUtils.js

/**
 * Get the date of the most recent Friday
 * @param {Date} [referenceDate=new Date()] - Optional reference date, defaults to current date
 * @returns {Date} Date object representing last Friday
 */
export const getLastFriday = (referenceDate = new Date()) => {
    const date = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate()));
    const dayOfWeek = date.getUTCDay();
    const diff = dayOfWeek < 5 ? dayOfWeek + 2 : dayOfWeek - 5;
    date.setUTCDate(date.getUTCDate() - diff);
    return date;
  };
  
  /**
   * Get the date of the Friday before last
   * @param {Date} [referenceDate=new Date()] - Optional reference date, defaults to current date
   * @returns {Date} Date object representing the Friday before last
   */
  export const getLastLastFriday = (referenceDate = new Date()) => {
    const lastFriday = getLastFriday(referenceDate);
    lastFriday.setUTCDate(lastFriday.getUTCDate() - 7);
    return lastFriday;
  };
  
  /**
   * Format helpers to get dates in different formats
   */
  export const dateFormatters = {
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
export const isDateInLastWeek = (dateToCheck) => {
  // Convert string to Date if needed
  const inputDate = typeof dateToCheck === 'string' 
  ? new Date(dateToCheck) 
  : dateToCheck;

  // Validate the date
  if (!(inputDate instanceof Date) || isNaN(inputDate.getTime())) {
    console.error('Invalid date provided to isDateInLastWeek:', dateToCheck);
    return false;
  }

  // Now we can safely use Date methods
  const date = new Date(Date.UTC(
    inputDate.getFullYear(), 
    inputDate.getMonth(), 
    inputDate.getDate()
  ));

  const lastFriday = getLastFriday();
  const lastLastFriday = getLastLastFriday();

  return date > lastLastFriday && date <= lastFriday;
}