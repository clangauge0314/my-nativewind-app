// Blood Glucose Entry
export interface BloodGlucoseEntry {
  id: string;
  userId: string;
  value: number; // mg/dL or mmol/L
  timestamp: number;
  type: 'fasting' | 'before_meal' | 'after_meal' | 'bedtime' | 'random';
  notes?: string;
  tags?: string[];
}

// Insulin Entry
export interface InsulinEntry {
  id: string;
  userId: string;
  units: number;
  type: 'rapid' | 'short' | 'intermediate' | 'long';
  timestamp: number;
  duration: number; // hours - how long this insulin type lasts
  notes?: string;
  relatedMealId?: string;
}

// Meal Entry
export interface MealEntry {
  id: string;
  userId: string;
  carbs: number; // grams
  timestamp: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
  photoUrl?: string;
}

// Exercise Entry
export interface ExerciseEntry {
  id: string;
  userId: string;
  type: string; // 'cardio', 'strength', 'walking', etc.
  duration: number; // minutes
  intensity: 'low' | 'moderate' | 'high';
  timestamp: number;
  notes?: string;
}

// Sleep Entry
export interface SleepEntry {
  id: string;
  userId: string;
  startTime: number;
  endTime: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
}

// Menstrual Cycle Entry
export interface MenstrualCycleEntry {
  id: string;
  userId: string;
  startDate: number;
  endDate?: number;
  flow: 'light' | 'medium' | 'heavy';
  symptoms?: string[];
}

// User Settings
export interface UserSettings {
  insulinSensitivityFactor: number; // ISF (mg/dL per unit)
  carbRatio: number; // I:C ratio (grams per unit)
  targetBloodGlucose: number; // mg/dL
  insulinDuration: number; // hours
  nightHypoThreshold: number; // mg/dL
  units: 'mg/dL' | 'mmol/L';
}

// Bolus Calculator Input
export interface BolusCalculatorInput {
  currentBloodGlucose: number;
  targetBloodGlucose: number;
  carbs: number;
  insulinSensitivityFactor: number;
  carbRatio: number;
  activeInsulin?: number; // IOB
}

// Bolus Calculator Result
export interface BolusCalculatorResult {
  correctionDose: number; // units for high blood sugar
  carbDose: number; // units for carbs
  totalDose: number; // total recommended units
  iobAdjustment: number; // units to subtract due to IOB
  finalRecommendation: number; // final dose after IOB
  warning?: string;
}

// IOB (Insulin On Board) Calculation
export interface IOBResult {
  totalIOB: number; // units
  entries: {
    insulinEntry: InsulinEntry;
    remainingUnits: number;
    hoursRemaining: number;
  }[];
}

// Alert/Warning
export interface HealthAlert {
  id: string;
  type: 'night_hypo' | 'high_bg' | 'low_bg' | 'missed_insulin' | 'exercise_warning';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

