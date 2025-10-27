import { TimeDisplay } from '@/types/insulin-timer';

export const formatHMS = (sec: number): string => {
  const clamped = Math.max(0, Math.floor(sec));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const formatTime = (sec: number): TimeDisplay => {
  const clamped = Math.max(0, Math.floor(sec));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  
  if (h > 0) {
    return {
      hours: h.toString(),
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0')
    };
  }
  return {
    hours: null,
    minutes: m.toString(),
    seconds: String(s).padStart(2, '0')
  };
};

export const formatDate = (dateString?: string): string | null => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    
    // Format: YYYY-MM-DD HH:MM:SS
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return null;
  }
};

export const calculateInsulinData = (
  carbohydrates: number,
  insulinRatio: number,
  bloodGlucose: number,
  targetGlucose: number,
  correctionFactor: number
) => {
  const carbInsulin = carbohydrates / insulinRatio;
  const correctionInsulin = Math.max(0, (bloodGlucose - targetGlucose) / correctionFactor);
  const totalInsulin = carbInsulin + correctionInsulin;
  
  return {
    carbInsulin: Math.round(carbInsulin * 10) / 10,
    correctionInsulin: Math.round(correctionInsulin * 10) / 10,
    totalInsulin: Math.round(totalInsulin * 10) / 10
  };
};

export const getStatusData = (isCompleted: boolean, isCritical: boolean, isWarning: boolean) => {
  const getStatusColor = () => {
    if (isCompleted) return '#2563eb';
    if (isCritical) return '#dc2626';
    if (isWarning) return '#f59e0b';
    return '#2563eb';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isCritical) return 'Critical';
    if (isWarning) return 'Warning';
    return 'Active';
  };

  const getStatusGradient = () => {
    if (isCompleted) return ['#3b82f6', '#2563eb'];
    if (isCritical) return ['#ef4444', '#dc2626'];
    if (isWarning) return ['#fbbf24', '#f59e0b'];
    return ['#60a5fa', '#3b82f6'];
  };

  return {
    color: getStatusColor(),
    text: getStatusText(),
    gradient: getStatusGradient()
  };
};

