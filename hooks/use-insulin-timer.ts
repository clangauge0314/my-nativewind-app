import { supabase } from '@/lib/supabase';
import { useTimerStore } from '@/stores/timer-store';
import { InsulinPredictionRecord } from '@/types/health-record';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';

export const useInsulinTimer = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [latestRecord, setLatestRecord] = useState<InsulinPredictionRecord | null>(null);
  const [notificationSent, setNotificationSent] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use global timer store
  const {
    recordId,
    totalSeconds,
    remainingSeconds,
    isRunning,
    isCompleted,
    hasActiveTimer,
    startTimer: startGlobalTimer,
    stopTimer: stopGlobalTimer,
    completeTimer: completeGlobalTimer,
    resetTimer: resetGlobalTimer,
    updateRemainingSeconds,
    clearTimer,
    syncTimerOnForeground,
  } = useTimerStore();

  // Fetch latest insulin prediction record from Supabase
  const fetchLatestRecord = useCallback(async (showAlert: boolean = false) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('insulin_prediction_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setLatestRecord(data);
        
        console.log('📋 fetchLatestRecord - data:', {
          dataId: data.id,
          recordId,
          insulinInjected: data.insulin_injected,
          timerDuration: data.timer_duration_minutes,
          isCompleted,
          totalSeconds,
        });
        
        // Only start timer if insulin hasn't been injected yet
        if (!data.insulin_injected) {
          const timerDuration = data.timer_duration_minutes || 60;
          const timerSeconds = timerDuration * 60;
          
          // Check if this is the same record as the one currently in the timer
          if (recordId !== data.id) {
            // New record, start fresh timer
            console.log('🆕 New record detected, starting timer');
            startGlobalTimer(data.id, timerSeconds);
          } else {
            // Same record - check if we need to restart timer
            if (totalSeconds !== timerSeconds) {
              // Duration changed, restart timer with new duration
              console.log('⏱️ Duration changed, restarting timer');
              startGlobalTimer(data.id, timerSeconds);
            } else if (isCompleted) {
              // Timer was completed but record was edited (insulin_injected is still false)
              // Restart the timer
              console.log('🔄 Timer completed but record edited, restarting timer');
              startGlobalTimer(data.id, timerSeconds);
            } else {
              console.log('✅ Same record, timer already running');
            }
          }
        } else {
          // Insulin already injected, mark as completed
          console.log('💉 Insulin already injected');
          if (recordId === data.id) {
            completeGlobalTimer();
          }
        }
        
        setNotificationSent(false);
      }
    } catch (error) {
      console.error('Error fetching latest record:', error);
      if (showAlert) {
        Alert.alert(
          'Network Error',
          'Failed to fetch your latest insulin prediction record. Please check your internet connection and try again.',
          [
            {
              text: 'Retry',
              onPress: () => fetchLatestRecord(true),
            },
            {
              text: 'Close',
              style: 'cancel',
            },
          ]
        );
      }
    }
  }, [userId, recordId, isRunning, isCompleted, totalSeconds, hasActiveTimer, startGlobalTimer, completeGlobalTimer, updateRemainingSeconds]);

  // AppState listener - sync timer when app returns to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App returned to foreground - sync timer
        syncTimerOnForeground();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [syncTimerOnForeground]);

  // Timer countdown logic - updates remaining seconds every second
  useEffect(() => {
    if (!isRunning || isCompleted) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const interval = setInterval(() => {
      updateRemainingSeconds();
    }, 1000);

    timerRef.current = interval;

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, isCompleted, updateRemainingSeconds]);

  // Reset timer
  const resetTimer = useCallback(() => {
    resetGlobalTimer();
    setNotificationSent(false);
  }, [resetGlobalTimer]);

  // Stop timer
  const stopTimer = useCallback(() => {
    stopGlobalTimer();
  }, [stopGlobalTimer]);

  // Mark insulin as injected and complete timer
  const markInsulinInjected = useCallback(async () => {
    if (!latestRecord || !userId) return;

    try {
      const { error } = await supabase
        .from('insulin_prediction_records')
        .update({
          insulin_injected: true,
          injected_at: new Date().toISOString(),
        })
        .eq('id', latestRecord.id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating insulin injection status:', error);
        Alert.alert('Error', 'Failed to update injection status.');
        return;
      }

      // Update local state
      setLatestRecord(prev => prev ? { ...prev, insulin_injected: true, injected_at: new Date().toISOString() } : null);
      
      // Complete timer in global store
      completeGlobalTimer();
    } catch (error) {
      console.error('Error marking insulin as injected:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  }, [latestRecord, userId, completeGlobalTimer]);

  return {
    isLoading,
    latestRecord,
    totalSeconds,
    remainingSeconds,
    notificationSent,
    isRunning,
    isCompleted,
    hasActiveTimer,
    fetchLatestRecord,
    resetTimer,
    stopTimer,
    markInsulinInjected,
    setNotificationSent,
    setIsLoading,
  };
};
