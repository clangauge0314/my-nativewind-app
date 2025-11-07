import { InsulinPredictionRecord } from '@/types/health-record';
import { getDateStringInTimezone, getDayBoundsInTimezone } from '@/utils/timezone';
import firestore from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

const COLLECTION_NAME = 'insulin_records';

export const useHistoryData = (userId: string | undefined) => {
  const [records, setRecords] = useState<InsulinPredictionRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [datesWithRecords, setDatesWithRecords] = useState<Map<string, number>>(new Map());

  // Fetch all records to mark dates on calendar (날짜별 개수 포함)
  const fetchAllRecordDates = useCallback(async () => {
    if (!userId) return;

    try {
      const snapshot = await firestore()
        .collection(COLLECTION_NAME)
        .where('user_id', '==', userId)
        .get();

      // 날짜별 레코드 개수 계산
      const dateCountMap = new Map<string, number>();
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const date = data.created_at?.toDate() || new Date();
        // Convert to Thailand timezone date string
        const dateString = getDateStringInTimezone(date, 'Asia/Bangkok');
        
        const currentCount = dateCountMap.get(dateString) || 0;
        dateCountMap.set(dateString, currentCount + 1);
      });
      
      setDatesWithRecords(dateCountMap);
    } catch (error) {
      console.error('Error fetching record dates:', error);
    }
  }, [userId]);

  // Fetch records for selected date
  const fetchRecordsForDate = useCallback(async (date: string) => {
    if (!userId) return;

    setLoadingRecords(true);
    try {
      // Get start and end of the selected day in Thailand timezone
      const { startOfDay, endOfDay } = getDayBoundsInTimezone(date, 'Asia/Bangkok');

      const snapshot = await firestore()
        .collection(COLLECTION_NAME)
        .where('user_id', '==', userId)
        .where('created_at', '>=', firestore.Timestamp.fromDate(startOfDay))
        .where('created_at', '<=', firestore.Timestamp.fromDate(endOfDay))
        .get();

      const fetchedRecords: InsulinPredictionRecord[] = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate()?.toISOString() || new Date().toISOString(),
            updated_at: data.updated_at?.toDate()?.toISOString() || new Date().toISOString(),
            injected_at: data.injected_at?.toDate()?.toISOString() || null,
          } as InsulinPredictionRecord;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRecords(fetchedRecords);
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
