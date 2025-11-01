// 리포트 데이터 타입 정의
export interface ReportRecord {
  idx: number;
  id: string;
  user_id: string;
  current_glucose: string;
  carbohydrates: string;
  target_glucose: string;
  insulin_ratio: string;
  correction_factor: string;
  carb_insulin: string;
  correction_insulin: string;
  total_insulin: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes: string | null;
  created_at: string;
  updated_at: string;
  timer_duration_minutes: number;
  insulin_injected: boolean;
  injected_at: string | null;
}

export type ReportTimeRange = '1day' | '1week' | '1month' | '3months' | '1year';

// 일별 요약 데이터
export interface DailySummary {
  date: string;
  avgGlucose: number;
  maxGlucose: number;
  minGlucose: number;
  totalInsulin: number;
  totalCarbs: number;
  recordCount: number;
}

// 식사 유형별 요약
export interface MealTypeSummary {
  mealType: string;
  totalInsulin: number;
  totalCarbs: number;
  avgGlucose: number;
  count: number;
  percentage: number;
}

// 주간 요약
export interface WeeklySummary {
  weekLabel: string;
  avgGlucose: number;
  totalInsulin: number;
  recordCount: number;
}

// 월별 요약
export interface MonthlySummary {
  month: string;
  avgGlucose: number;
  totalInsulin: number;
  recordCount: number;
  eA1C: number;
}

// 분기별 요약
export interface QuarterlySummary {
  quarter: string;
  avgGlucose: number;
  totalInsulin: number;
  eA1C: number;
  recordCount: number;
}

// 전체 기간 요약
export interface PeriodSummary {
  avgGlucose: number;
  maxGlucose: number;
  minGlucose: number;
  totalInsulin: number;
  totalCarbs: number;
  avgDailyInsulin: number;
  eA1C: number;
  recordCount: number;
  daysInRange: number; // 목표 범위 내 일수
  timeInRange: number; // 목표 범위 내 비율 (%)
}

// 차트 데이터 포인트
export interface ChartDataPoint {
  value: number;
  label: string;
  dataPointText?: string;
  frontColor?: string;
  labelTextStyle?: any;
  date?: string;
  time?: string;
}

// 라인 차트 데이터 포인트
export interface LineChartDataPoint {
  value: number;
  label?: string;
  dataPointText?: string;
  labelComponent?: () => JSX.Element;
  customDataPoint?: () => JSX.Element;
  date?: string;
  time?: string;
}

// 파이 차트 데이터
export interface PieChartData {
  value: number;
  color: string;
  text: string;
  label: string;
}

// 혈당 범위
export const GLUCOSE_TARGET_RANGE = {
  min: 70,
  max: 180,
  target: 100,
};

// 식사 유형별 색상
export const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: '#f59e0b',
  lunch: '#3b82f6',
  dinner: '#8b5cf6',
  snack: '#ec4899',
};

// 차트 색상 팔레트
export const CHART_COLORS = {
  glucose: '#3b82f6',
  insulin: '#9333ea',
  carbs: '#f59e0b',
  inRange: '#22c55e',
  high: '#dc2626',
  low: '#ea580c',
  background: '#f3f4f6',
  grid: '#e5e7eb',
  text: '#6b7280',
};

