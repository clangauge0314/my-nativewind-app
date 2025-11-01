export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label: string;
}

export interface GlucoseDataPoint extends ChartDataPoint {
  mealType?: string;
  insulinDose?: number;
}

export interface InsulinDataPoint extends ChartDataPoint {
  mealType?: string;
  carbInsulin: number;
  correctionInsulin: number;
}

export interface TrackerStats {
  avgGlucose: number;
  avgInsulin: number;
  totalInjections: number;
  injectedCount: number;
  notInjectedCount: number;
  highGlucoseCount: number;
  lowGlucoseCount: number;
  normalGlucoseCount: number;
  timeInRange: number; // percentage
  avgCarbInsulin: number;
  avgCorrectionInsulin: number;
  mostCommonMealType: string;
}

export interface DailyAggregate {
  date: string;
  avgGlucose: number;
  totalInsulin: number;
  injectionCount: number;
  minGlucose: number;
  maxGlucose: number;
}

export type TimeRange = 'hours' | 'day' | 'week' | 'month' | 'year';

export interface GlucoseRange {
  low: number;    // < 70 mg/dL
  normal: [number, number]; // 70-180 mg/dL
  high: number;   // > 180 mg/dL
}

export const GLUCOSE_RANGES: GlucoseRange = {
  low: 70,
  normal: [70, 180],
  high: 180,
};

