import { supabase } from '@/lib/supabase';
import { InsulinPredictionRecord } from '@/types/health-record';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useHistoryData = (userId: string | undefined) => {
  const [records, setRecords] = useState<InsulinPredictionRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [datesWithRecords, setDatesWithRecords] = useState<Set<string>>(new Set());

  // Fetch all records to mark dates on calendar
  const fetchAllRecordDates = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('insulin_prediction_records')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const dates = new Set(
          data.map((record) => {
            const date = new Date(record.created_at);
            return date.toISOString().split('T')[0];
          })
        );
        setDatesWithRecords(dates);
      }
    } catch (error) {
      console.error('Error fetching record dates:', error);
    }
  }, [userId]);

  // Fetch records for selected date
  const fetchRecordsForDate = useCallback(async (date: string) => {
    if (!userId) return;

    setLoadingRecords(true);
    try {
      // Get start and end of the selected day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('insulin_prediction_records')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecords(data || []);
    } catch (error: any) {
      console.error('Error fetching records:', error);
      Alert.alert('Error', 'Failed to load health records. Please try again.');
    } finally {
      setLoadingRecords(false);
    }
  }, [userId]);

  // Load all record dates when component mounts or user changes
  useEffect(() => {
    if (userId) {
      fetchAllRecordDates();
    }
  }, [userId, fetchAllRecordDates]);

  return {
    records,
    loadingRecords,
    datesWithRecords,
    fetchRecordsForDate,
    fetchAllRecordDates,
    setRecords,
  };
};

