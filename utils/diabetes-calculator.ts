import { BolusCalculatorInput, BolusCalculatorResult, InsulinEntry, IOBResult } from '@/types/health';

/**
 * Bolus Calculator - 인슐린 주사량 자동 계산
 */
export const calculateBolusInsulin = (input: BolusCalculatorInput): BolusCalculatorResult => {
  const {
    currentBloodGlucose,
    targetBloodGlucose,
    carbs,
    insulinSensitivityFactor,
    carbRatio,
    activeInsulin = 0,
  } = input;

  // 1. Correction dose (혈당 교정용)
  const bgDifference = currentBloodGlucose - targetBloodGlucose;
  const correctionDose = bgDifference > 0 ? bgDifference / insulinSensitivityFactor : 0;

  // 2. Carb dose (탄수화물 처리용)
  const carbDose = carbs / carbRatio;

  // 3. Total before IOB adjustment
  const totalDose = correctionDose + carbDose;

  // 4. IOB adjustment
  const iobAdjustment = activeInsulin;
  
  // 5. Final recommendation
  let finalRecommendation = Math.max(0, totalDose - iobAdjustment);
  
  // Round to 0.5 units (실제 인슐린 펜 단위)
  finalRecommendation = Math.round(finalRecommendation * 2) / 2;

  // Warning messages
  let warning: string | undefined;
  
  if (currentBloodGlucose < 70) {
    warning = '⚠️ Low blood sugar! Do not take insulin. Consume 15g fast carbs.';
  } else if (finalRecommendation > 15) {
    warning = '⚠️ High dose detected. Please consult your doctor.';
  } else if (activeInsulin > 5) {
    warning = '⚠️ High insulin on board. Risk of hypoglycemia.';
  } else if (currentBloodGlucose < 100 && carbs < 20) {
    warning = '⚠️ Low carb meal with borderline BG. Monitor closely.';
  }

  return {
    correctionDose: Math.round(correctionDose * 10) / 10,
    carbDose: Math.round(carbDose * 10) / 10,
    totalDose: Math.round(totalDose * 10) / 10,
    iobAdjustment: Math.round(iobAdjustment * 10) / 10,
    finalRecommendation,
    warning,
  };
};

/**
 * IOB (Insulin On Board) Calculator - 체내 잔여 인슐린량 계산
 * Linear decay model 사용
 */
export const calculateIOB = (insulinEntries: InsulinEntry[], currentTime: number = Date.now()): IOBResult => {
  const activeEntries: IOBResult['entries'] = [];
  let totalIOB = 0;

  insulinEntries.forEach((entry) => {
    const hoursElapsed = (currentTime - entry.timestamp) / (1000 * 60 * 60);
    
    // 인슐린이 아직 작용 중인지 확인
    if (hoursElapsed < entry.duration) {
      // Linear decay: 시간이 지날수록 선형적으로 감소
      const percentRemaining = (entry.duration - hoursElapsed) / entry.duration;
      const remainingUnits = entry.units * percentRemaining;
      const hoursRemaining = entry.duration - hoursElapsed;

      activeEntries.push({
        insulinEntry: entry,
        remainingUnits: Math.round(remainingUnits * 10) / 10,
        hoursRemaining: Math.round(hoursRemaining * 10) / 10,
      });

      totalIOB += remainingUnits;
    }
  });

  return {
    totalIOB: Math.round(totalIOB * 10) / 10,
    entries: activeEntries.sort((a, b) => b.remainingUnits - a.remainingUnits),
  };
};

/**
 * Night Hypo Risk Assessment - 야간 저혈당 위험도 평가
 */
export const assessNightHypoRisk = (
  bedtimeBloodGlucose: number,
  activeInsulin: number,
  recentExercise: boolean,
  threshold: number = 70
): {
  risk: 'low' | 'medium' | 'high';
  recommendation: string;
  shouldAlert: boolean;
} => {
  let risk: 'low' | 'medium' | 'high' = 'low';
  let recommendation = '';
  let shouldAlert = false;

  // Risk factors
  const isLowBG = bedtimeBloodGlucose < threshold;
  const isBorderlineBG = bedtimeBloodGlucose >= threshold && bedtimeBloodGlucose < 100;
  const hasHighIOB = activeInsulin > 2;

  if (isLowBG || (isBorderlineBG && hasHighIOB) || (isBorderlineBG && recentExercise)) {
    risk = 'high';
    shouldAlert = true;
    
    if (isLowBG) {
      recommendation = '⚠️ CRITICAL: Blood sugar is low! Consume 15-20g fast carbs immediately. Recheck in 15 minutes.';
    } else if (hasHighIOB && recentExercise) {
      recommendation = '⚠️ High risk: Low BG + active insulin + recent exercise. Have a snack (15g carbs) and set alarm.';
    } else if (hasHighIOB) {
      recommendation = '⚠️ Warning: Active insulin detected. Consider a small snack before bed.';
    } else if (recentExercise) {
      recommendation = '⚠️ Warning: Exercise can lower BG overnight. Have a snack and set alarm.';
    }
  } else if (isBorderlineBG || activeInsulin > 1) {
    risk = 'medium';
    recommendation = 'ℹ️ Borderline BG. Consider a small snack if concerned. Set alarm for midnight check.';
  } else {
    risk = 'low';
    recommendation = '✅ Blood sugar is in safe range for bedtime.';
  }

  return { risk, recommendation, shouldAlert };
};

/**
 * Exercise Impact Calculator - 운동이 혈당에 미치는 영향 계산
 */
export const calculateExerciseImpact = (
  intensity: 'low' | 'moderate' | 'high',
  duration: number // minutes
): {
  insulinReduction: number; // percentage
  carbsNeeded: number; // grams
  monitoringHours: number; // how long to monitor after
} => {
  let insulinReduction = 0;
  let carbsNeeded = 0;
  let monitoringHours = 2;

  switch (intensity) {
    case 'low':
      insulinReduction = duration > 30 ? 10 : 5;
      carbsNeeded = Math.floor(duration / 30) * 10;
      monitoringHours = 2;
      break;
    case 'moderate':
      insulinReduction = duration > 30 ? 20 : 10;
      carbsNeeded = Math.floor(duration / 30) * 15;
      monitoringHours = 4;
      break;
    case 'high':
      insulinReduction = duration > 30 ? 30 : 15;
      carbsNeeded = Math.floor(duration / 20) * 15;
      monitoringHours = 6;
      break;
  }

  return {
    insulinReduction: Math.min(insulinReduction, 50), // Cap at 50%
    carbsNeeded,
    monitoringHours,
  };
};

/**
 * Menstrual Cycle Impact - 생리 주기가 인슐린 필요량에 미치는 영향
 */
export const getMenstrualCycleImpact = (
  daysIntoCycle: number
): {
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  insulinAdjustment: number; // percentage change
  note: string;
} => {
  if (daysIntoCycle <= 5) {
    return {
      phase: 'menstrual',
      insulinAdjustment: -10,
      note: 'Insulin sensitivity may be higher. Monitor for low blood sugar.',
    };
  } else if (daysIntoCycle <= 13) {
    return {
      phase: 'follicular',
      insulinAdjustment: 0,
      note: 'Stable insulin needs. Normal monitoring recommended.',
    };
  } else if (daysIntoCycle <= 16) {
    return {
      phase: 'ovulation',
      insulinAdjustment: 5,
      note: 'Slight increase in insulin resistance. Monitor blood sugar closely.',
    };
  } else {
    return {
      phase: 'luteal',
      insulinAdjustment: 15,
      note: 'Insulin resistance increases. May need 10-20% more insulin.',
    };
  }
};

