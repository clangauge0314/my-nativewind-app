import { supabase } from '@/lib/supabase';
import type { Alarm, CreateAlarmInput, UpdateAlarmInput } from '@/types/alarm';
import { useCallback, useEffect, useState } from 'react';

export function useAlarms(userId?: string) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all alarms for the user
  const fetchAlarms = useCallback(async () => {
    if (!userId) {
      setAlarms([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('meal_alarms')
        .select('*')
        .eq('user_id', userId)
        .order('alarm_time', { ascending: true });

      if (fetchError) throw fetchError;

      setAlarms(data || []);
    } catch (err) {
      console.error('Error fetching alarms:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch alarms');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create a new alarm
  const createAlarm = useCallback(
    async (input: CreateAlarmInput) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      try {
        setLoading(true);
        setError(null);

        const newAlarm = {
          user_id: userId,
          alarm_time: input.alarmTime,
          meal_type: input.mealType,
          alarm_label: input.alarmLabel,
          is_enabled: input.isEnabled,
          repeat_days: input.repeatDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        };

        const { data, error: createError } = await supabase
          .from('meal_alarms')
          .insert([newAlarm])
          .select()
          .single();

        if (createError) throw createError;

        // Refresh alarms list
        await fetchAlarms();

        return data;
      } catch (err) {
        console.error('Error creating alarm:', err);
        setError(err instanceof Error ? err.message : 'Failed to create alarm');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchAlarms]
  );

  // Update an existing alarm
  const updateAlarm = useCallback(
    async (input: UpdateAlarmInput) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      try {
        setLoading(true);
        setError(null);

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (input.alarmTime !== undefined) updateData.alarm_time = input.alarmTime;
        if (input.mealType !== undefined) updateData.meal_type = input.mealType;
        if (input.alarmLabel !== undefined) updateData.alarm_label = input.alarmLabel;
        if (input.isEnabled !== undefined) updateData.is_enabled = input.isEnabled;
        if (input.repeatDays !== undefined) updateData.repeat_days = input.repeatDays;

        const { data, error: updateError } = await supabase
          .from('meal_alarms')
          .update(updateData)
          .eq('id', input.id)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) throw updateError;

        // Refresh alarms list
        await fetchAlarms();

        return data;
      } catch (err) {
        console.error('Error updating alarm:', err);
        setError(err instanceof Error ? err.message : 'Failed to update alarm');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchAlarms]
  );

  // Delete an alarm
  const deleteAlarm = useCallback(
    async (alarmId: string) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      try {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
          .from('meal_alarms')
          .delete()
          .eq('id', alarmId)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        // Refresh alarms list
        await fetchAlarms();
      } catch (err) {
        console.error('Error deleting alarm:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete alarm');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchAlarms]
  );

  // Toggle alarm enabled status
  const toggleAlarm = useCallback(
    async (alarmId: string, isEnabled: boolean) => {
      return updateAlarm({ id: alarmId, isEnabled });
    },
    [updateAlarm]
  );

  // Get next upcoming alarm
  const getNextAlarm = useCallback(() => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const enabledAlarms = alarms.filter((alarm) => alarm.isEnabled);
    if (enabledAlarms.length === 0) return null;

    // Find the next alarm today or tomorrow
    let nextAlarm = enabledAlarms.find((alarm) => {
      const [hours, minutes] = alarm.alarmTime.split(':').map(Number);
      const alarmTime = hours * 60 + minutes;
      return alarmTime > currentTime;
    });

    // If no alarm found today, get the first alarm of tomorrow
    if (!nextAlarm && enabledAlarms.length > 0) {
      nextAlarm = enabledAlarms[0];
    }

    return nextAlarm || null;
  }, [alarms]);

  // Fetch alarms on mount and when userId changes
  useEffect(() => {
    fetchAlarms();
  }, [fetchAlarms]);

  return {
    alarms,
    loading,
    error,
    fetchAlarms,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    getNextAlarm,
  };
}

