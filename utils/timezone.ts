/**
 * Timezone utility functions
 * Default timezone: Asia/Bangkok (Thailand, UTC+7)
 */

const DEFAULT_TIMEZONE = 'Asia/Bangkok';

/**
 * Get current date string in specified timezone (YYYY-MM-DD format)
 */
export const getTodayInTimezone = (timezone: string = DEFAULT_TIMEZONE): string => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  // en-CA format gives us YYYY-MM-DD
  return formatter.format(now);
};

/**
 * Convert Date to date string in specified timezone (YYYY-MM-DD format)
 */
export const getDateStringInTimezone = (date: Date, timezone: string = DEFAULT_TIMEZONE): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  return formatter.format(date);
};

/**
 * Get start and end of day in specified timezone
 * Returns Date objects in UTC that represent the start and end of the day in the target timezone
 */
export const getDayBoundsInTimezone = (dateString: string, timezone: string = DEFAULT_TIMEZONE) => {
  // Parse date string (YYYY-MM-DD)
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Thailand (UTC+7) offset in milliseconds
  // For other timezones, this would need to be calculated dynamically
  const THAILAND_OFFSET_HOURS = 7;
  
  // Create start of day: YYYY-MM-DD 00:00:00 in Thailand
  // In UTC, this is YYYY-MM-DD-1 17:00:00 (subtract 7 hours)
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0 - THAILAND_OFFSET_HOURS, 0, 0, 0));
  
  // Create end of day: YYYY-MM-DD 23:59:59 in Thailand
  // In UTC, this is YYYY-MM-DD 16:59:59 (23:59:59 - 7 hours)
  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23 - THAILAND_OFFSET_HOURS, 59, 59, 999));
  
  return { startOfDay, endOfDay };
};

/**
 * Format date for display in specified timezone
 */
export const formatDateInTimezone = (date: Date, timezone: string = DEFAULT_TIMEZONE): string => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return formatter.format(date);
};

/**
 * Format time for display in specified timezone
 */
export const formatTimeInTimezone = (date: Date, timezone: string = DEFAULT_TIMEZONE): string => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  
  return formatter.format(date);
};

