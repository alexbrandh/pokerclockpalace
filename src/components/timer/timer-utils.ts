export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getTimerColor = (isBreak: boolean, lastMinuteAlert: boolean, timeRemaining: number): string => {
  if (isBreak) return '#D4AF37'; // gold for breaks
  if (lastMinuteAlert) return '#EF4444'; // red-500
  if (timeRemaining <= 300) return '#F59E0B'; // amber-500
  return '#D4AF37'; // gold
};

export const shouldPulse = (timeRemaining: number, lastMinuteAlert: boolean, isBreak: boolean): boolean => {
  return timeRemaining <= 60 || lastMinuteAlert || isBreak;
};

export const getCircleCalculations = (progress: number) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return { radius, circumference, strokeDasharray, strokeDashoffset };
};