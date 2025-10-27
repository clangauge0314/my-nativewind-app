import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TimerState {
  // Timer state
  recordId: string | null;
  totalSeconds: number;
  remainingSeconds: number;
  startTime: number | null; // Timestamp when timer started
  isRunning: boolean;
  isCompleted: boolean;
  hasActiveTimer: boolean; // Track if timer was ever started (to prevent false 0:00 notifications)
  
  // Actions
  startTimer: (recordId: string, totalSeconds: number) => void;
  stopTimer: () => void;
  completeTimer: () => void;
  resetTimer: () => void;
  updateRemainingSeconds: () => void;
  clearTimer: () => void;
  syncTimerOnForeground: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // Initial state
      recordId: null,
      totalSeconds: 0,
      remainingSeconds: 0,
      startTime: null,
      isRunning: false,
      isCompleted: false,
      hasActiveTimer: false,

      // Start timer with a record
      startTimer: (recordId: string, totalSeconds: number) => {
        const now = Date.now();
        set({
          recordId,
          totalSeconds,
          remainingSeconds: totalSeconds,
          startTime: now,
          isRunning: true,
          isCompleted: false,
          hasActiveTimer: true,
        });
      },

      // Stop timer (pause)
      stopTimer: () => {
        set({ isRunning: false });
      },

      // Complete timer (insulin injected)
      completeTimer: () => {
        set({
          isRunning: false,
          isCompleted: true,
          remainingSeconds: 0,
        });
      },

      // Reset timer
      resetTimer: () => {
        const state = get();
        set({
          remainingSeconds: state.totalSeconds,
          startTime: Date.now(),
          isRunning: true,
          isCompleted: false,
        });
      },

      // Update remaining seconds based on elapsed time
      updateRemainingSeconds: () => {
        const state = get();
        if (!state.isRunning || !state.startTime) {
          return;
        }

        // Don't update if already completed
        if (state.isCompleted) {
          return;
        }

        const now = Date.now();
        const elapsedSeconds = Math.floor((now - state.startTime) / 1000);
        const remaining = Math.max(0, state.totalSeconds - elapsedSeconds);

        if (remaining === 0) {
          set({
            remainingSeconds: 0,
            isRunning: false,
            isCompleted: true,
          });
        } else {
          set({ remainingSeconds: remaining });
        }
      },

      // Clear timer completely
      clearTimer: () => {
        set({
          recordId: null,
          totalSeconds: 0,
          remainingSeconds: 0,
          startTime: null,
          isRunning: false,
          isCompleted: false,
          hasActiveTimer: false,
        });
      },

      // Sync timer when app returns to foreground
      syncTimerOnForeground: () => {
        const state = get();
        if (!state.isRunning || !state.startTime || state.isCompleted) {
          return;
        }

        const now = Date.now();
        const elapsedSeconds = Math.floor((now - state.startTime) / 1000);
        const remaining = Math.max(0, state.totalSeconds - elapsedSeconds);

        if (remaining === 0) {
          set({
            remainingSeconds: 0,
            isRunning: false,
            isCompleted: true,
          });
        } else {
          set({ remainingSeconds: remaining });
        }
      },
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

