import { ReportRecord, ReportTimeRange } from '@/types/report';
import firestore from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

const COLLECTION_NAME = 'insulin_records';

export const useReportData = (userId: string | undefined, timeRange: ReportTimeRange) => {
  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTimeRangeFilter = useCallback(() => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '1day':
        startDate.setHours(0, 0, 0, 0);
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

    return startDate;
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
      
      const snapshot = await firestore()
        .collection(COLLECTION_NAME)
        .where('user_id', '==', userId)
        .where('created_at', '>=', firestore.Timestamp.fromDate(startDate))
        .get();

      // 데이터 타입 변환 및 검증, 클라이언트 측 정렬
      const validRecords = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            user_id: data.user_id,
            current_glucose: String(data.current_glucose || '0'),
            carbohydrates: String(data.carbohydrates || '0'),
            target_glucose: String(data.target_glucose || '100'),
            insulin_ratio: String(data.insulin_ratio || '15'),
            correction_factor: String(data.correction_factor || '50'),
            carb_insulin: String(data.carb_insulin || '0'),
            correction_insulin: String(data.correction_insulin || '0'),
            total_insulin: String(data.total_insulin || '0'),
            meal_type: data.meal_type || 'snack',
            notes: data.notes,
            created_at: data.created_at?.toDate()?.toISOString() || new Date().toISOString(),
            updated_at: data.updated_at?.toDate()?.toISOString() || new Date().toISOString(),
            timer_duration_minutes: data.timer_duration_minutes || 0,
            insulin_injected: data.insulin_injected || false,
            injected_at: data.injected_at?.toDate()?.toISOString() || null,
          } as ReportRecord;
        })
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((record, index) => ({
          ...record,
          idx: index,
        }));

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
