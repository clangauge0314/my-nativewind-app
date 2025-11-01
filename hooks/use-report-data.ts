import { supabase } from '@/lib/supabase';
import { ReportRecord, ReportTimeRange } from '@/types/report';
import { useCallback, useEffect, useState } from 'react';

export const useReportData = (userId: string | undefined, timeRange: ReportTimeRange) => {
  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTimeRangeFilter = useCallback(() => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '1day':
        startDate.setHours(0, 0, 0, 0); // 오늘 00:00:00
        break;
      case '1week':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return startDate.toISOString();
  }, [timeRange]);

  const fetchReportData = useCallback(async () => {
    if (!userId) {
      setRecords([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDate = getTimeRangeFilter();

      const { data, error: fetchError } = await supabase
        .from('insulin_prediction_records')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // 데이터 타입 변환 및 검증
      const validRecords = (data || []).map((record, index) => ({
        idx: index,
        id: record.id,
        user_id: record.user_id,
        current_glucose: String(record.current_glucose || '0'),
        carbohydrates: String(record.carbohydrates || '0'),
        target_glucose: String(record.target_glucose || '100'),
        insulin_ratio: String(record.insulin_ratio || '15'),
        correction_factor: String(record.correction_factor || '50'),
        carb_insulin: String(record.carb_insulin || '0'),
        correction_insulin: String(record.correction_insulin || '0'),
        total_insulin: String(record.total_insulin || '0'),
        meal_type: record.meal_type || 'snack',
        notes: record.notes,
        created_at: record.created_at,
        updated_at: record.updated_at,
        timer_duration_minutes: record.timer_duration_minutes || 0,
        insulin_injected: record.insulin_injected || false,
        injected_at: record.injected_at,
      })) as ReportRecord[];

      setRecords(validRecords);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [userId, getTimeRangeFilter]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  return {
    records,
    loading,
    error,
    refetch: fetchReportData,
  };
};

