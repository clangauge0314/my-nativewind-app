import { ThemedText } from '@/components/themed-text';
import { useHealthStore } from '@/stores/health-store';
import { assessNightHypoRisk, calculateIOB } from '@/utils/diabetes-calculator';
import { AlertTriangle, CheckCircle, Moon } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';

export function NightHypoAlert() {
  const { bloodGlucoseEntries, insulinEntries, exerciseEntries, settings, addAlert } = useHealthStore();
  
  // Get latest bedtime blood glucose (last entry of the day)
  const latestBG = bloodGlucoseEntries[0];
  const isBedtime = latestBG?.type === 'bedtime';
  
  if (!isBedtime || !latestBG) {
    return null;
  }
  
  // Calculate IOB
  const recentInsulin = insulinEntries.filter(
    (entry) => Date.now() - entry.timestamp < entry.duration * 60 * 60 * 1000
  );
  const iobResult = calculateIOB(recentInsulin);
  
  // Check recent exercise (last 6 hours)
  const recentExercise = exerciseEntries.filter(
    (entry) => Date.now() - entry.timestamp < 6 * 60 * 60 * 1000
  );
  const hasRecentExercise = recentExercise.length > 0;
  
  // Assess risk
  const riskAssessment = assessNightHypoRisk(
    latestBG.value,
    iobResult.totalIOB,
    hasRecentExercise,
    settings.nightHypoThreshold
  );
  
  // Add alert if high risk
  useEffect(() => {
    if (riskAssessment.shouldAlert) {
      addAlert({
        type: 'night_hypo',
        severity: 'high',
        title: 'Night Hypoglycemia Risk',
        message: riskAssessment.recommendation,
        timestamp: Date.now(),
        acknowledged: false,
      });
    }
  }, [riskAssessment.shouldAlert]);
  
  const getRiskColor = () => {
    switch (riskAssessment.risk) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };
  
  const getRiskIcon = () => {
    switch (riskAssessment.risk) {
      case 'high':
        return <AlertTriangle size={24} color="#ef4444" />;
      case 'medium':
        return <AlertTriangle size={24} color="#f59e0b" />;
      case 'low':
        return <CheckCircle size={24} color="#10b981" />;
      default:
        return <Moon size={24} color="#6b7280" />;
    }
  };

  return (
    <View
      className="rounded-2xl p-6 mb-6"
      style={{
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: getRiskColor(),
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ 
            backgroundColor: `${getRiskColor()}15`,
          }}
        >
          {getRiskIcon()}
        </View>
        <View className="flex-1">
          <ThemedText className="text-xl font-bold">
            Night Hypo Check
          </ThemedText>
          <ThemedText className="text-xs opacity-60">
            Bedtime safety assessment
          </ThemedText>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getRiskColor()}20` }}
        >
          <ThemedText className="text-xs font-bold" style={{ color: getRiskColor() }}>
            {riskAssessment.risk.toUpperCase()}
          </ThemedText>
        </View>
      </View>

      {/* Blood Glucose */}
      <View
        className="p-4 rounded-xl mb-4"
        style={{ backgroundColor: '#ffffff' }}
      >
        <ThemedText className="text-sm opacity-70 mb-2">
          Bedtime Blood Glucose
        </ThemedText>
        <View className="flex-row items-baseline">
          <ThemedText className="text-3xl font-bold" style={{ color: getRiskColor() }}>
            {latestBG.value}
          </ThemedText>
          <ThemedText className="text-lg ml-2 opacity-70">
            {settings.units}
          </ThemedText>
        </View>
      </View>

      {/* Risk Factors */}
      <View style={{ gap: 8 }} className="mb-4">
        <View className="flex-row items-center">
          <View
            className="w-2 h-2 rounded-full mr-3"
            style={{ backgroundColor: iobResult.totalIOB > 0 ? '#f59e0b' : '#10b981' }}
          />
          <ThemedText className="text-sm flex-1">
            Active Insulin: {iobResult.totalIOB} units
          </ThemedText>
        </View>
        <View className="flex-row items-center">
          <View
            className="w-2 h-2 rounded-full mr-3"
            style={{ backgroundColor: hasRecentExercise ? '#f59e0b' : '#10b981' }}
          />
          <ThemedText className="text-sm flex-1">
            Recent Exercise: {hasRecentExercise ? 'Yes (6h)' : 'No'}
          </ThemedText>
        </View>
      </View>

      {/* Recommendation */}
      <View
        className="p-4 rounded-xl"
        style={{
          backgroundColor: riskAssessment.risk === 'high'
            ? ('#fee2e2')
            : ('#f3f4f6'),
        }}
      >
        <ThemedText
          className="text-sm leading-5"
          style={{
            color: riskAssessment.risk === 'high' ? '#ef4444' : ('#1f2937'),
          }}
        >
          {riskAssessment.recommendation}
        </ThemedText>
      </View>
    </View>
  );
}

