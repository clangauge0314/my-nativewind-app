export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
export type RepeatDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

// Database schema (snake_case)
export interface Alarm {
  id: string;
  user_id: string;
  alarm_time: string; // "HH:MM:SS" format
  meal_type: MealType;
  alarm_label: string;
  is_enabled: boolean;
  repeat_days: RepeatDay[]; // ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
  notification_title?: string;
  notification_body?: string;
  created_at: string;
  updated_at: string;
}

// For creating alarms (camelCase for easier use in components)
export interface CreateAlarmInput {
  alarmTime: string;
  mealType: MealType;
  alarmLabel?: string;
  isEnabled: boolean;
  repeatDays?: RepeatDay[];
  notificationTitle?: string;
  notificationBody?: string;
}

export interface UpdateAlarmInput extends Partial<CreateAlarmInput> {
  id: string;
}

export const MEAL_TYPE_INFO = {
  breakfast: { label: 'Breakfast', icon: '🌅', color: '#fbbf24' },
  lunch: { label: 'Lunch', icon: '☀️', color: '#60a5fa' },
  dinner: { label: 'Dinner', icon: '🌙', color: '#f472b6' },
  snack: { label: 'Snack', icon: '🍎', color: '#818cf8' },
  other: { label: 'Other', icon: '⏰', color: '#9ca3af' },
} as const;

export const DAY_LABELS = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
} as const;

