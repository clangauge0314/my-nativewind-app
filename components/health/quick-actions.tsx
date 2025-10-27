import { ThemedText } from '@/components/themed-text';
import { Activity, Droplet, Moon, Plus, TrendingUp, Utensils } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

interface QuickActionsProps {
  onAddBloodGlucose: () => void;
  onAddInsulin: () => void;
  onAddMeal: () => void;
  onAddExercise: () => void;
  onAddSleep: () => void;
}

export function QuickActions({
  onAddBloodGlucose,
  onAddInsulin,
  onAddMeal,
  onAddExercise,
  onAddSleep,
}: QuickActionsProps) {

  const actions = [
    {
      icon: Activity,
      label: 'Blood Glucose',
      color: '#2563eb',
      onPress: onAddBloodGlucose,
    },
    {
      icon: Droplet,
      label: 'Insulin',
      color: '#7c3aed',
      onPress: onAddInsulin,
    },
    {
      icon: Utensils,
      label: 'Meal',
      color: '#059669',
      onPress: onAddMeal,
    },
    {
      icon: TrendingUp,
      label: 'Exercise',
      color: '#dc2626',
      onPress: onAddExercise,
    },
    {
      icon: Moon,
      label: 'Sleep',
      color: '#4f46e5',
      onPress: onAddSleep,
    },
  ];

  return (
    <View
      className="rounded-2xl p-6 mb-6"
      style={{
        backgroundColor: '#ffffff',
        borderWidth: 0,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center mb-6">
        <Plus size={24} color="#2563eb" />
        <ThemedText className="text-xl font-bold ml-3">
          Quick Actions
        </ThemedText>
      </View>

      <View className="flex-row flex-wrap" style={{ gap: 12 }}>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            className="items-center"
            style={({ pressed }) => ({
              width: '30%',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
              style={{ backgroundColor: `${action.color}15` }}
            >
              <action.icon size={28} color={action.color} />
            </View>
            <ThemedText className="text-xs text-center font-medium">
              {action.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

