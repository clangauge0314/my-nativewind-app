import { supabase } from '@/lib/supabase';
import { InsulinPredictionRecord } from '@/types/health-record';
import {
  DailyAggregate,
  GLUCOSE_RANGES,
  TimeRange,
  TrackerStats
} from '@/types/tracker';
import { useCallback, useEffect, useState } from 'react';

export const useTrackerData = (userId: string | undefined, timeRange: TimeRange) => {
  const [dailyAggregates, setDailyAggregates] = useState<DailyAggregate[]>([]);
  const [stats, setStats] = useState<TrackerStats | null>(null);
  const [loading, setLoading] = useState(false);

  const getTimeRangeFilter = useCallback(() => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case 'hours':
        startDate.setHours(now.getHours() - 24);
        break;
      case 'day':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return startDate.toISOString();
  }, [timeRange]);

  const calculateStats = useCallback((records: InsulinPredictionRecord[]): TrackerStats => {
    if (records.length === 0) {
      return {
        avgGlucose: 0,
        avgInsulin: 0,
        totalInjections: 0,
        injectedCount: 0,
        notInjectedCount: 0,
        highGlucoseCount: 0,
        lowGlucoseCount: 0,
        normalGlucoseCount: 0,
        timeInRange: 0,
        avgCarbInsulin: 0,
        avgCorrectionInsulin: 0,
        mostCommonMealType: 'N/A',
      };
    }

    const totalGlucose = records.reduce((sum, r) => sum + r.current_glucose, 0);
    const totalInsulin = records.reduce((sum, r) => sum + r.total_insulin, 0);
    const totalCarbInsulin = records.reduce((sum, r) => sum + r.carb_insulin, 0);
    const totalCorrectionInsulin = records.reduce((sum, r) => sum + r.correction_insulin, 0);

    const injectedCount = records.filter(r => r.insulin_injected).length;
    const notInjectedCount = records.length - injectedCount;

    const highGlucoseCount = records.filter(r => r.current_glucose > GLUCOSE_RANGES.high).length;
    const lowGlucoseCount = records.filter(r => r.current_glucose < GLUCOSE_RANGES.low).length;
    const normalGlucoseCount = records.filter(
      r => r.current_glucose >= GLUCOSE_RANGES.normal[0] && r.current_glucose <= GLUCOSE_RANGES.normal[1]
    ).length;

    const timeInRange = (normalGlucoseCount / records.length) * 100;

    // Find most common meal type
    const mealTypeCounts: Record<string, number> = {};
    records.forEach(r => {
      mealTypeCounts[r.meal_type] = (mealTypeCounts[r.meal_type] || 0) + 1;
    });
    const mostCommonMealType = Object.entries(mealTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      avgGlucose: Math.round(totalGlucose / records.length),
      avgInsulin: Math.round((totalInsulin / records.length) * 10) / 10,
      totalInjections: records.length,
      injectedCount,
      notInjectedCount,
      highGlucoseCount,
      lowGlucoseCount,
      normalGlucoseCount,
      timeInRange: Math.round(timeInRange),
      avgCarbInsulin: Math.round((totalCarbInsulin / records.length) * 10) / 10,
      avgCorrectionInsulin: Math.round((totalCorrectionInsulin / records.length) * 10) / 10,
      mostCommonMealType: mostCommonMealType.charAt(0).toUpperCase() + mostCommonMealType.slice(1),
    };
  }, []);


  const processDailyAggregates = useCallback((records: InsulinPredictionRecord[]): DailyAggregate[] => {
    const dailyMap = new Map<string, InsulinPredictionRecord[]>();

    records.forEach(record => {
      const date = new Date(record.created_at).toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, []);
      }
      dailyMap.get(date)!.push(record);
    });

    const aggregates: DailyAggregate[] = [];
    dailyMap.forEach((dayRecords, date) => {
      // Filter valid glucose values
      const glucoseValues = dayRecords
        .map(r => r.current_glucose)
        .filter(v => v != null && !isNaN(v) && isFinite(v));
      
      // Filter valid insulin values
      const insulinValues = dayRecords
        .map(r => r.total_insulin)
        .filter(v => v != null && !isNaN(v) && isFinite(v));

      if (glucoseValues.length === 0) return; // Skip if no valid data

      const totalInsulin = insulinValues.reduce((sum, v) => sum + v, 0);
      const avgGlucose = glucoseValues.reduce((sum, v) => sum + v, 0) / glucoseValues.length;

      aggregates.push({
        date,
        avgGlucose: Math.round(avgGlucose),
        totalInsulin: Math.round(totalInsulin * 10) / 10,
        injectionCount: dayRecords.length,
        minGlucose: Math.min(...glucoseValues),
        maxGlucose: Math.max(...glucoseValues),
      });
    });

    return aggregates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

  const fetchTrackerData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const startDate = getTimeRangeFilter();

      const { data, error } = await supabase
        .from('insulin_prediction_records')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setDailyAggregates(processDailyAggregates(data));
        setStats(calculateStats(data));
      } else {
        setDailyAggregates([]);
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching tracker data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, getTimeRangeFilter, processDailyAggregates, calculateStats]);

  useEffect(() => {
    fetchTrackerData();
  }, [fetchTrackerData]);

  return {
    dailyAggregates,
    stats,
    loading,
    refetch: fetchTrackerData,
  };
};

