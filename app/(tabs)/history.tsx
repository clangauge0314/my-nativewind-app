import { AddBloodGlucose } from '@/components/health/add-blood-glucose';
import { AddInsulin } from '@/components/health/add-insulin';
import { QuickActions } from '@/components/health/quick-actions';
import { RecentHistory } from '@/components/health/recent-history';
import { PageLoader } from '@/components/page-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/stores/auth-store';
import { useFocusEffect } from '@react-navigation/native';
import { History } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const insets = useSafeAreaInsets();

  const [showAddBG, setShowAddBG] = useState(false);
  const [showAddInsulin, setShowAddInsulin] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showAddSleep, setShowAddSleep] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    }, [])
  );

  const androidNavBarHeight = Platform.OS === 'android' ? (insets.bottom > 0 ? insets.bottom : 48) : 0;
  const tabBarHeight = (Platform.OS === 'ios' ? 88 : 68) + androidNavBarHeight;

  if (!user) {
    return (
      <PageLoader isLoading={isLoading} minDuration={500}>
        <ThemedView className="flex-1 justify-center items-center p-8" style={{ paddingBottom: tabBarHeight + 20 }}>
          <History size={64} color={'#9ca3af'} />
          <ThemedText className="text-xl font-bold mt-6 text-center">
            Health History
          </ThemedText>
          <ThemedText className="text-center mt-3 opacity-70">
            Log in to view your health history and track your progress
          </ThemedText>
        </ThemedView>
      </PageLoader>
    );
  }

  return (
    <PageLoader isLoading={isLoading} minDuration={500}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView className="flex-1 px-8" style={{ paddingTop: insets.top + 20 }}>
          <View className="mb-6">
            <ThemedText className="text-3xl font-bold">
              Health History
            </ThemedText>
            <ThemedText className="text-sm opacity-60 mt-2">
              Track your health progress and manage your schedule
            </ThemedText>
          </View>

          {/* Calendar - Hidden for now */}
          {/* <View className="mb-6 p-6 bg-white rounded-2xl border border-gray-200">
            <ThemedText className="text-xl font-bold mb-4">Calendar</ThemedText>
            <View className="flex-row justify-between">
              <ThemedText className="text-sm text-gray-600">Today: {new Date().toLocaleDateString()}</ThemedText>
              <ThemedText className="text-sm text-blue-600">
                {selectedDate ? `Selected: ${selectedDate}` : 'No date selected'}
              </ThemedText>
            </View>
            <SimpleCalendar onDateSelect={setSelectedDate} selectedDate={selectedDate} />
          </View> */}
          
          {/* History Section */}
          <View className="mb-6 p-6 bg-white rounded-2xl border border-gray-200">
            <ThemedText className="text-xl font-bold mb-4">History</ThemedText>
            <View className="p-4 bg-gray-50 rounded-lg">
              <ThemedText className="text-center text-gray-600">
                Your health history will appear here
              </ThemedText>
            </View>
          </View>

          <View className="my-6">
            <ThemedText className="text-xl font-bold mb-4">
              Quick Actions
            </ThemedText>
            <QuickActions
              onAddBloodGlucose={() => setShowAddBG(true)}
              onAddInsulin={() => setShowAddInsulin(true)}
              onAddMeal={() => setShowAddMeal(true)}
              onAddExercise={() => setShowAddExercise(true)}
              onAddSleep={() => setShowAddSleep(true)}
            />
          </View>

          <View className="my-6">
            <ThemedText className="text-xl font-bold mb-4">
              Recent History
            </ThemedText>
            <RecentHistory />
          </View>
        </ThemedView>
      </ScrollView>

      <AddBloodGlucose
        visible={showAddBG}
        onClose={() => setShowAddBG(false)}
      />
      <AddInsulin
        visible={showAddInsulin}
        onClose={() => setShowAddInsulin(false)}
      />
      
    </PageLoader>
  );
}

 
