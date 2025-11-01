export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export interface Alarm {
  id: string;
  userId: string;
  alarmTime: string; // "HH:MM:SS" format
  mealType: MealType;
  alarmLabel: string;
  isEnabled: boolean;
  repeatDays: string[]; // ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlarmInput {
  alarmTime: string;
  mealType: MealType;
  alarmLabel: string;
  isEnabled: boolean;
  repeatDays?: string[];
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

