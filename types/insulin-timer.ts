export interface InsulinTimerProps {
  totalSeconds: number; 
  remainingSeconds: number;
  hasActiveTimer?: boolean;
  width?: number; 
  height?: number; 
  trackColor?: string;
  progressColor?: string;
  onEdit?: () => void;
  onInsulinInjected?: () => void;
  bloodGlucose?: number;
  carbohydrates?: number;
  insulinRatio?: number;
  correctionFactor?: number;
  targetGlucose?: number;
  createdAt?: string;
  insulinInjected?: boolean;
}

export interface InsulinData {
  carbInsulin: number;
  correctionInsulin: number;
  totalInsulin: number;
}

export interface StatusData {
  color: string;
  text: string;
  gradient: string[];
}

export interface TimeDisplay {
  hours: string | null;
  minutes: string;
  seconds: string;
}

