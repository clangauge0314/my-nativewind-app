import {
  DailySummary,
  GLUCOSE_TARGET_RANGE,
  MealTypeSummary,
  MonthlySummary,
  PeriodSummary,
  QuarterlySummary,
  ReportRecord,
  WeeklySummary,
} from '@/types/report';

/**
 * 예상 당화혈색소(eA1C) 계산
 * 공식: (평균 혈당 + 46.7) / 28.7
 */
export const calculateEA1C = (avgGlucose: number): number => {
  return Math.round(((avgGlucose + 46.7) / 28.7) * 10) / 10;
};

/**
 * 문자열 값을 숫자로 안전하게 변환
 */
const toNumber = (value: string | number): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

/**
 * 날짜 문자열을 Date 객체로 변환
 */
const parseDate = (dateStr: string): Date => {
  return new Date(dateStr);
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * 시간을 HH:MM 형식으로 포맷
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

/**
 * 일별 데이터 그룹화
 */
export const groupByDay = (records: ReportRecord[]): Map<string, ReportRecord[]> => {
  const grouped = new Map<string, ReportRecord[]>();
  
  records.forEach(record => {
    const date = formatDate(parseDate(record.created_at));
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(record);
  });
  
  return grouped;
};

/**
 * 일별 요약 계산
 */
export const calculateDailySummary = (records: ReportRecord[]): DailySummary[] => {
  const grouped = groupByDay(records);
  const summaries: DailySummary[] = [];
  
  grouped.forEach((dayRecords, date) => {
    const glucoseValues = dayRecords.map(r => toNumber(r.current_glucose));
    const totalInsulin = dayRecords.reduce((sum, r) => sum + toNumber(r.total_insulin), 0);
    const totalCarbs = dayRecords.reduce((sum, r) => sum + toNumber(r.carbohydrates), 0);
    
    summaries.push({
      date,
      avgGlucose: Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length),
      maxGlucose: Math.max(...glucoseValues),
      minGlucose: Math.min(...glucoseValues),
      totalInsulin: Math.round(totalInsulin * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      recordCount: dayRecords.length,
    });
  });
  
  return summaries.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * 식사 유형별 요약 계산
 */
export const calculateMealTypeSummary = (records: ReportRecord[]): MealTypeSummary[] => {
  const grouped = new Map<string, ReportRecord[]>();
  
  records.forEach(record => {
    const mealType = record.meal_type;
    if (!grouped.has(mealType)) {
      grouped.set(mealType, []);
    }
    grouped.get(mealType)!.push(record);
  });
  
  const totalInsulinAll = records.reduce((sum, r) => sum + toNumber(r.total_insulin), 0);
  const summaries: MealTypeSummary[] = [];
  
  grouped.forEach((mealRecords, mealType) => {
    const totalInsulin = mealRecords.reduce((sum, r) => sum + toNumber(r.total_insulin), 0);
    const totalCarbs = mealRecords.reduce((sum, r) => sum + toNumber(r.carbohydrates), 0);
    const avgGlucose = mealRecords.reduce((sum, r) => sum + toNumber(r.current_glucose), 0) / mealRecords.length;
    
    summaries.push({
      mealType,
      totalInsulin: Math.round(totalInsulin * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      avgGlucose: Math.round(avgGlucose),
      count: mealRecords.length,
      percentage: Math.round((totalInsulin / totalInsulinAll) * 100),
    });
  });
  
  return summaries.sort((a, b) => b.totalInsulin - a.totalInsulin);
};

/**
 * 주간 요약 계산 (요일별)
 */
export const calculateWeeklySummary = (records: ReportRecord[]): WeeklySummary[] => {
  const grouped = new Map<number, ReportRecord[]>();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  records.forEach(record => {
    const date = parseDate(record.created_at);
    const dayOfWeek = date.getDay();
    if (!grouped.has(dayOfWeek)) {
      grouped.set(dayOfWeek, []);
    }
    grouped.get(dayOfWeek)!.push(record);
  });
  
  const summaries: WeeklySummary[] = [];
  
  for (let i = 0; i < 7; i++) {
    const dayRecords = grouped.get(i) || [];
    if (dayRecords.length === 0) continue;
    
    const avgGlucose = dayRecords.reduce((sum, r) => sum + toNumber(r.current_glucose), 0) / dayRecords.length;
    const totalInsulin = dayRecords.reduce((sum, r) => sum + toNumber(r.total_insulin), 0);
    
    summaries.push({
      weekLabel: weekDays[i],
      avgGlucose: Math.round(avgGlucose),
      totalInsulin: Math.round(totalInsulin * 10) / 10,
      recordCount: dayRecords.length,
    });
  }
  
  return summaries;
};

/**
 * 주차별 요약 계산
 */
export const calculateWeeklyPeriodSummary = (records: ReportRecord[]): WeeklySummary[] => {
  const grouped = new Map<string, ReportRecord[]>();
  
  records.forEach(record => {
    const date = parseDate(record.created_at);
    const weekNumber = Math.ceil(date.getDate() / 7);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const weekLabel = `Week ${weekNumber} (${monthYear})`;
    
    if (!grouped.has(weekLabel)) {
      grouped.set(weekLabel, []);
    }
    grouped.get(weekLabel)!.push(record);
  });
  
  const summaries: WeeklySummary[] = [];
  
  grouped.forEach((weekRecords, weekLabel) => {
    const avgGlucose = weekRecords.reduce((sum, r) => sum + toNumber(r.current_glucose), 0) / weekRecords.length;
    const totalInsulin = weekRecords.reduce((sum, r) => sum + toNumber(r.total_insulin), 0);
    
    summaries.push({
      weekLabel,
      avgGlucose: Math.round(avgGlucose),
      totalInsulin: Math.round(totalInsulin * 10) / 10,
      recordCount: weekRecords.length,
    });
  });
  
  return summaries;
};

/**
 * 월별 요약 계산
 */
export const calculateMonthlySummary = (records: ReportRecord[]): MonthlySummary[] => {
  const grouped = new Map<string, ReportRecord[]>();
  
  records.forEach(record => {
    const date = parseDate(record.created_at);
    const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!grouped.has(month)) {
      grouped.set(month, []);
    }
    grouped.get(month)!.push(record);
  });
  
  const summaries: MonthlySummary[] = [];
  
  grouped.forEach((monthRecords, month) => {
    const avgGlucose = monthRecords.reduce((sum, r) => sum + toNumber(r.current_glucose), 0) / monthRecords.length;
    const totalInsulin = monthRecords.reduce((sum, r) => sum + toNumber(r.total_insulin), 0);
    
    summaries.push({
      month,
      avgGlucose: Math.round(avgGlucose),
      totalInsulin: Math.round(totalInsulin * 10) / 10,
      recordCount: monthRecords.length,
      eA1C: calculateEA1C(avgGlucose),
    });
  });
  
  return summaries.sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });
};

/**
 * 분기별 요약 계산
 */
export const calculateQuarterlySummary = (records: ReportRecord[]): QuarterlySummary[] => {
  const grouped = new Map<string, ReportRecord[]>();
  
  records.forEach(record => {
    const date = parseDate(record.created_at);
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const year = date.getFullYear();
    const quarterLabel = `Q${quarter} ${year}`;
    
    if (!grouped.has(quarterLabel)) {
      grouped.set(quarterLabel, []);
    }
    grouped.get(quarterLabel)!.push(record);
  });
  
  const summaries: QuarterlySummary[] = [];
  
  grouped.forEach((quarterRecords, quarter) => {
    const avgGlucose = quarterRecords.reduce((sum, r) => sum + toNumber(r.current_glucose), 0) / quarterRecords.length;
    const totalInsulin = quarterRecords.reduce((sum, r) => sum + toNumber(r.total_insulin), 0);
    
    summaries.push({
      quarter,
      avgGlucose: Math.round(avgGlucose),
      totalInsulin: Math.round(totalInsulin * 10) / 10,
      eA1C: calculateEA1C(avgGlucose),
      recordCount: quarterRecords.length,
    });
  });
  
  return summaries.sort((a, b) => a.quarter.localeCompare(b.quarter));
};

/**
 * 전체 기간 요약 계산
 */
export const calculatePeriodSummary = (records: ReportRecord[]): PeriodSummary => {
  if (records.length === 0) {
    return {
      avgGlucose: 0,
      maxGlucose: 0,
      minGlucose: 0,
      totalInsulin: 0,
      totalCarbs: 0,
      avgDailyInsulin: 0,
      eA1C: 0,
      recordCount: 0,
      daysInRange: 0,
      timeInRange: 0,
    };
  }
  
  const glucoseValues = records.map(r => toNumber(r.current_glucose));
  const avgGlucose = glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length;
  const totalInsulin = records.reduce((sum, r) => sum + toNumber(r.total_insulin), 0);
  const totalCarbs = records.reduce((sum, r) => sum + toNumber(r.carbohydrates), 0);
  
  // 목표 범위 내 기록 수
  const inRangeCount = glucoseValues.filter(
    g => g >= GLUCOSE_TARGET_RANGE.min && g <= GLUCOSE_TARGET_RANGE.max
  ).length;
  
  // 일별 데이터로 일수 계산
  const uniqueDays = new Set(records.map(r => formatDate(parseDate(r.created_at))));
  const dayCount = uniqueDays.size;
  
  return {
    avgGlucose: Math.round(avgGlucose),
    maxGlucose: Math.max(...glucoseValues),
    minGlucose: Math.min(...glucoseValues),
    totalInsulin: Math.round(totalInsulin * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    avgDailyInsulin: Math.round((totalInsulin / dayCount) * 10) / 10,
    eA1C: calculateEA1C(avgGlucose),
    recordCount: records.length,
    daysInRange: dayCount,
    timeInRange: Math.round((inRangeCount / records.length) * 100),
  };
};

/**
 * 시간대별 데이터 그룹화 (1일 차트용)
 */
export const groupByHour = (records: ReportRecord[]): Map<number, ReportRecord[]> => {
  const grouped = new Map<number, ReportRecord[]>();
  
  for (let i = 0; i < 24; i++) {
    grouped.set(i, []);
  }
  
  records.forEach(record => {
    const date = parseDate(record.created_at);
    const hour = date.getHours();
    grouped.get(hour)!.push(record);
  });
  
  return grouped;
};

