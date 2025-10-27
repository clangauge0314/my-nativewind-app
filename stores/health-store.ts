import {
    BloodGlucoseEntry,
    ExerciseEntry,
    HealthAlert,
    InsulinEntry,
    MealEntry,
    MenstrualCycleEntry,
    SleepEntry,
    UserSettings,
} from '@/types/health';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface HealthState {
  // Blood Glucose
  bloodGlucoseEntries: BloodGlucoseEntry[];
  addBloodGlucose: (entry: Omit<BloodGlucoseEntry, 'id' | 'userId'>) => void;
  
  // Insulin
  insulinEntries: InsulinEntry[];
  addInsulin: (entry: Omit<InsulinEntry, 'id' | 'userId'>) => void;
  getRecentInsulin: (hours: number) => InsulinEntry[];
  
  // Meals
  mealEntries: MealEntry[];
  addMeal: (entry: Omit<MealEntry, 'id' | 'userId'>) => void;
  
  // Exercise
  exerciseEntries: ExerciseEntry[];
  addExercise: (entry: Omit<ExerciseEntry, 'id' | 'userId'>) => void;
  getRecentExercise: (hours: number) => ExerciseEntry[];
  
  // Sleep
  sleepEntries: SleepEntry[];
  addSleep: (entry: Omit<SleepEntry, 'id' | 'userId'>) => void;
  getLastSleep: () => SleepEntry | null;
  
  // Menstrual Cycle
  menstrualCycles: MenstrualCycleEntry[];
  addMenstrualCycle: (entry: Omit<MenstrualCycleEntry, 'id' | 'userId'>) => void;
  getCurrentCycleDays: () => number | null;
  
  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Alerts
  alerts: HealthAlert[];
  addAlert: (alert: Omit<HealthAlert, 'id'>) => void;
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      bloodGlucoseEntries: [],
      insulinEntries: [],
      mealEntries: [],
      exerciseEntries: [],
      sleepEntries: [],
      menstrualCycles: [],
      alerts: [],
      
      settings: {
        insulinSensitivityFactor: 50,
        carbRatio: 10,
        targetBloodGlucose: 100,
        insulinDuration: 4,
        nightHypoThreshold: 70,
        units: 'mg/dL',
      },
      
      // Blood Glucose
      addBloodGlucose: (entry) => {
        const newEntry: BloodGlucoseEntry = {
          ...entry,
          id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'local',
        };
        
        set((state) => ({
          bloodGlucoseEntries: [...state.bloodGlucoseEntries, newEntry].sort(
            (a, b) => b.timestamp - a.timestamp
          ),
        }));
      },
      
      // Insulin
      addInsulin: (entry) => {
        const newEntry: InsulinEntry = {
          ...entry,
          id: `insulin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'local',
        };
        
        set((state) => ({
          insulinEntries: [...state.insulinEntries, newEntry].sort(
            (a, b) => b.timestamp - a.timestamp
          ),
        }));
      },
      
      getRecentInsulin: (hours) => {
        const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
        return get().insulinEntries.filter((entry) => entry.timestamp >= cutoffTime);
      },
      
      // Meals
      addMeal: (entry) => {
        const newEntry: MealEntry = {
          ...entry,
          id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'local',
        };
        
        set((state) => ({
          mealEntries: [...state.mealEntries, newEntry].sort(
            (a, b) => b.timestamp - a.timestamp
          ),
        }));
      },
      
      // Exercise
      addExercise: (entry) => {
        const newEntry: ExerciseEntry = {
          ...entry,
          id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'local',
        };
        
        set((state) => ({
          exerciseEntries: [...state.exerciseEntries, newEntry].sort(
            (a, b) => b.timestamp - a.timestamp
          ),
        }));
      },
      
      getRecentExercise: (hours) => {
        const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
        return get().exerciseEntries.filter((entry) => entry.timestamp >= cutoffTime);
      },
      
      // Sleep
      addSleep: (entry) => {
        const newEntry: SleepEntry = {
          ...entry,
          id: `sleep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'local',
        };
        
        set((state) => ({
          sleepEntries: [...state.sleepEntries, newEntry].sort(
            (a, b) => b.startTime - a.startTime
          ),
        }));
      },
      
      getLastSleep: () => {
        const entries = get().sleepEntries;
        return entries.length > 0 ? entries[0] : null;
      },
      
      // Menstrual Cycle
      addMenstrualCycle: (entry) => {
        const newEntry: MenstrualCycleEntry = {
          ...entry,
          id: `cycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'local',
        };
        
        set((state) => ({
          menstrualCycles: [...state.menstrualCycles, newEntry].sort(
            (a, b) => b.startDate - a.startDate
          ),
        }));
      },
      
      getCurrentCycleDays: () => {
        const cycles = get().menstrualCycles;
        if (cycles.length === 0) return null;
        
        const lastCycle = cycles[0];
        const daysSinceStart = Math.floor(
          (Date.now() - lastCycle.startDate) / (1000 * 60 * 60 * 24)
        );
        
        return daysSinceStart;
      },
      
      // Settings
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      
      // Alerts
      addAlert: (alert) => {
        const newAlert: HealthAlert = {
          ...alert,
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          alerts: [newAlert, ...state.alerts],
        }));
      },
      
      acknowledgeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === id ? { ...alert, acknowledged: true } : alert
          ),
        }));
      },
      
      clearAlerts: () => {
        set({ alerts: [] });
      },
    }),
    {
      name: 'health-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

