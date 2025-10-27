import { SettingsPanel } from '@/components/health/settings-panel';
import { GuestWelcome } from '@/components/home/guest-welcome';
import { PageLoader } from '@/components/page-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/stores/auth-store';
import { useFocusEffect } from '@react-navigation/native';
import { LogOut } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const { signOut } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            toast.success('Logged out successfully');
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    }, [])
  );

  // Tab bar + navigation bar height
  const androidNavBarHeight = Platform.OS === 'android' ? (insets.bottom > 0 ? insets.bottom : 48) : 0;
  const tabBarHeight = (Platform.OS === 'ios' ? 88 : 68) + androidNavBarHeight;

  if (!user) {
    return (
      <PageLoader isLoading={isLoading} minDuration={500}>
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView className="flex-1 px-8" style={{ paddingTop: insets.top + 20 }}>
            <GuestWelcome />
          </ThemedView>
        </ScrollView>
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
          {/* Header */}
          <View className="mb-6">
            <ThemedText className="text-3xl font-bold">
              Profile
            </ThemedText>
            <ThemedText className="text-sm opacity-60 mt-2">
              Manage your account and diabetes settings
            </ThemedText>
          </View>

          <SettingsPanel />

          {/* Logout Button */}
          <View className="mt-8 mb-6">
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 px-6 bg-red-50 rounded-xl border border-red-200"
              onPress={handleLogout}
            >
              <LogOut size={20} color="#dc2626" />
              <ThemedText className="text-red-600 font-semibold ml-2">
                Logout
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View
            className="rounded-3xl p-6 mb-6"
            style={{
              backgroundColor: '#f8fafc',
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <ThemedText className="text-lg font-bold mb-4">
              📚 Understanding Your Settings
            </ThemedText>
            
            <View style={{ gap: 16 }}>
              <View>
                <ThemedText className="font-semibold mb-1">
                  ISF (Insulin Sensitivity Factor)
                </ThemedText>
                <ThemedText className="text-sm opacity-70">
                  Also called "correction factor." Tells how much 1 unit of insulin lowers your blood glucose. Example: ISF of 50 means 1 unit drops BG by 50 mg/dL.
                </ThemedText>
              </View>

              <View>
                <ThemedText className="font-semibold mb-1">
                  I:C Ratio (Insulin to Carb)
                </ThemedText>
                <ThemedText className="text-sm opacity-70">
                  How many grams of carbs are covered by 1 unit of insulin. Example: I:C of 10 means 1 unit covers 10g of carbs.
                </ThemedText>
              </View>

              <View>
                <ThemedText className="font-semibold mb-1">
                  Target Blood Glucose
                </ThemedText>
                <ThemedText className="text-sm opacity-70">
                  Your ideal blood sugar level. The Bolus Calculator aims for this number. Common range: 80-120 mg/dL.
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </PageLoader>
  );
}
 