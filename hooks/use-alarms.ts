import type { Alarm, CreateAlarmInput, UpdateAlarmInput } from '@/types/alarm';
import firestore from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

const COLLECTION_NAME = 'meal_alarms';

export function useAlarms(userId?: string, username?: string) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all alarms for the user
  const fetchAlarms = useCallback(async () => {
    if (!userId || !username) {
      setAlarms([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const snapshot = await firestore()
        .collection(COLLECTION_NAME)
        .doc(username)
        .collection('alarms')
        .get();

      const userAlarms: Alarm[] = snapshot.docs
        .map(doc => ({
          id: doc.id,
          user_id: userId,
          ...doc.data(),
        } as Alarm))
        .sort((a, b) => {
          // 시간 순으로 정렬 (HH:MM:SS)
          const timeA = a.alarm_time.split(':').slice(0, 2).join(':');
          const timeB = b.alarm_time.split(':').slice(0, 2).join(':');
          return timeA.localeCompare(timeB);
        });

      setAlarms(userAlarms);
    } catch (err) {
      console.error('Error fetching alarms:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch alarms');
    } finally {
      setLoading(false);
    }
  }, [userId, username]);

  // Create a new alarm
  const createAlarm = useCallback(
    async (input: CreateAlarmInput) => {
      if (!userId || !username) {
        throw new Error('User ID and username are required');
      }

      try {
        setLoading(true);
        setError(null);

        // Check for duplicate alarm time
        const snapshot = await firestore()
          .collection(COLLECTION_NAME)
          .doc(username)
          .collection('alarms')
          .get();

        const existingAlarms = snapshot.docs.map(doc => doc.data());
        const isDuplicate = existingAlarms.some(alarm => alarm.alarm_time === input.alarmTime);

        if (isDuplicate) {
          const error = new Error('An alarm with this time already exists');
          setError(error.message);
          throw error;
        }

        const newAlarmData = {
          alarm_time: input.alarmTime,
          meal_type: input.mealType,
          alarm_label: input.alarmLabel || '',
          is_enabled: input.isEnabled,
          repeat_days: input.repeatDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
          notification_title: input.notificationTitle || '',
          notification_body: input.notificationBody || '',
          created_at: firestore.FieldValue.serverTimestamp(),
          updated_at: firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await firestore()
          .collection(COLLECTION_NAME)
          .doc(username)
          .collection('alarms')
          .add(newAlarmData);

        // Get the created document
        const docSnapshot = await docRef.get();
        const newAlarm: Alarm = {
          id: docRef.id,
          user_id: userId,
          ...docSnapshot.data(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Alarm;

        // Refresh alarms list
        await fetchAlarms();

        return newAlarm;
      } catch (err) {
        console.error('Error creating alarm:', err);
        setError(err instanceof Error ? err.message : 'Failed to create alarm');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, username, fetchAlarms]
  );

  // Update an existing alarm
  const updateAlarm = useCallback(
    async (input: UpdateAlarmInput) => {
      if (!userId || !username) {
        throw new Error('User ID and username are required');
      }

      try {
        setLoading(true);
        setError(null);

        // Check for duplicate alarm time (only if time is being changed)
        if (input.alarmTime !== undefined) {
          const snapshot = await firestore()
            .collection(COLLECTION_NAME)
            .doc(username)
            .collection('alarms')
            .get();

          const existingAlarms = snapshot.docs
            .filter(doc => doc.id !== input.id) // Exclude current alarm
            .map(doc => doc.data());
          
          const isDuplicate = existingAlarms.some(alarm => alarm.alarm_time === input.alarmTime);

          if (isDuplicate) {
            const error = new Error('An alarm with this time already exists');
            setError(error.message);
            throw error;
          }
        }

        const updateData: any = {
          updated_at: firestore.FieldValue.serverTimestamp(),
        };

        if (input.alarmTime !== undefined) updateData.alarm_time = input.alarmTime;
        if (input.mealType !== undefined) updateData.meal_type = input.mealType;
        if (input.alarmLabel !== undefined) updateData.alarm_label = input.alarmLabel;
        if (input.isEnabled !== undefined) updateData.is_enabled = input.isEnabled;
        if (input.repeatDays !== undefined) updateData.repeat_days = input.repeatDays;
        if (input.notificationTitle !== undefined) updateData.notification_title = input.notificationTitle;
        if (input.notificationBody !== undefined) updateData.notification_body = input.notificationBody;

        await firestore()
          .collection(COLLECTION_NAME)
          .doc(username)
          .collection('alarms')
          .doc(input.id)
          .update(updateData);

        // Get the updated document
        const docSnapshot = await firestore()
          .collection(COLLECTION_NAME)
          .doc(username)
          .collection('alarms')
          .doc(input.id)
          .get();

        const updatedAlarm: Alarm = {
          id: input.id,
          user_id: userId,
          ...docSnapshot.data(),
        } as Alarm;

        // Refresh alarms list
        await fetchAlarms();

        return updatedAlarm;
      } catch (err) {
        console.error('Error updating alarm:', err);
        setError(err instanceof Error ? err.message : 'Failed to update alarm');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, username, fetchAlarms]
  );

  // Delete an alarm
  const deleteAlarm = useCallback(
    async (alarmId: string) => {
      if (!userId || !username) {
        throw new Error('User ID and username are required');
      }

      try {
        setLoading(true);
        setError(null);

        await firestore()
          .collection(COLLECTION_NAME)
          .doc(username)
          .collection('alarms')
          .doc(alarmId)
          .delete();

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
    [userId, username, fetchAlarms]
  );

  // Toggle alarm enabled status
  const toggleAlarm = useCallback(
    async (alarmId: string, isEnabled: boolean) => {
      return updateAlarm({ id: alarmId, isEnabled });
    },
    [updateAlarm]
  );

  // Get next upcoming alarm (가장 가까운 다음 알람)
  const getNextAlarm = useCallback(() => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const enabledAlarms = alarms.filter((alarm) => alarm.is_enabled);
    if (enabledAlarms.length === 0) return null;

    // 오늘 남은 알람 찾기
    const todayFutureAlarms = enabledAlarms.filter((alarm) => {
      const [hours, minutes] = alarm.alarm_time.split(':').map(Number);
      const alarmTime = hours * 60 + minutes;
      return alarmTime > currentTime;
    });

    // 오늘 남은 알람이 있으면 가장 가까운 것 반환
    if (todayFutureAlarms.length > 0) {
      const nextAlarm = todayFutureAlarms[0];
      return {
        alarmTime: nextAlarm.alarm_time,
        mealType: nextAlarm.meal_type,
        alarmLabel: nextAlarm.alarm_label,
      };
    }

    // 오늘 남은 알람 없으면 내일의 첫 번째 알람 반환
    if (enabledAlarms.length > 0) {
      const nextAlarm = enabledAlarms[0];
      return {
        alarmTime: nextAlarm.alarm_time,
        mealType: nextAlarm.meal_type,
        alarmLabel: nextAlarm.alarm_label,
      };
    }

    return null;
  }, [alarms]);

  // Get the alarm after the next one (그 다음 알람)
  const getSecondNextAlarm = useCallback(() => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const enabledAlarms = alarms.filter((alarm) => alarm.is_enabled);
    if (enabledAlarms.length === 0) return null;

    // 오늘 남은 알람 찾기
    const todayFutureAlarms = enabledAlarms.filter((alarm) => {
      const [hours, minutes] = alarm.alarm_time.split(':').map(Number);
      const alarmTime = hours * 60 + minutes;
      return alarmTime > currentTime;
    });

    // 오늘 남은 알람이 2개 이상: 두 번째 알람 반환
    if (todayFutureAlarms.length >= 2) {
      const secondAlarm = todayFutureAlarms[1];
      return {
        alarmTime: secondAlarm.alarm_time,
        mealType: secondAlarm.meal_type,
        alarmLabel: secondAlarm.alarm_label,
      };
    }

    // 오늘 남은 알람이 1개: 내일의 첫 번째 알람 반환
    if (todayFutureAlarms.length === 1 && enabledAlarms.length >= 1) {
      // 다음 알람을 찾아서 그 다음 것 반환
      const currentNextAlarm = todayFutureAlarms[0];
      const nextIndex = enabledAlarms.findIndex(a => a.id === currentNextAlarm.id);
      const secondIndex = (nextIndex + 1) % enabledAlarms.length;
      const secondAlarm = enabledAlarms[secondIndex];
      
      return {
        alarmTime: secondAlarm.alarm_time,
        mealType: secondAlarm.meal_type,
        alarmLabel: secondAlarm.alarm_label,
      };
    }

    // 오늘 남은 알람 없음: 내일의 두 번째 알람 반환
    if (todayFutureAlarms.length === 0 && enabledAlarms.length >= 2) {
      const secondAlarm = enabledAlarms[1];
      return {
        alarmTime: secondAlarm.alarm_time,
        mealType: secondAlarm.meal_type,
        alarmLabel: secondAlarm.alarm_label,
      };
    }

    // 알람이 1개뿐이면 null 반환
    return null;
  }, [alarms]);

  // Fetch alarms on mount and when userId/username changes
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
    getSecondNextAlarm,
  };
}
