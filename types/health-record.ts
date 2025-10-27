export interface InsulinPredictionRecord {
  id: string;
  user_id: string;
  current_glucose: number;
  carbohydrates: number;
  target_glucose: number;
  insulin_ratio: number;
  correction_factor: number;
  carb_insulin: number;
  correction_insulin: number;
  total_insulin: number;
  timer_duration_minutes: number;
  insulin_injected: boolean;
  injected_at?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInsulinPredictionRequest {
  current_glucose: number;
  carbohydrates?: number;
  target_glucose?: number;
  insulin_ratio?: number;
  correction_factor?: number;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  notes?: string;
}

export interface InsulinPredictionFormData {
  currentGlucose: string;
  carbohydrates: string;
  targetGlucose: string;
  insulinRatio: string;
  correctionFactor: string;
  timerDuration: string;
  isCustomTimer: boolean;
  mealType: string;
  notes: string;
}

export const MEAL_TYPES: { value: string; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'other', label: 'Other' },
];

export const TIMER_DURATIONS: { value: number; label: string }[] = [
  { value: 1, label: '1 min' },
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
  { value: 0, label: 'Custom' },
];

export const STRESS_LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);
