import { GuestWelcome } from '@/components/home/guest-welcome';
import { PageLoader } from '@/components/page-loader';
import { DiabetesSettingsCard } from '@/components/profile/DiabetesSettingsCard';
import { HealthGoalsCard } from '@/components/profile/HealthGoalsCard';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { SettingsMenuItem } from '@/components/profile/SettingsMenuItem';
import { StatsOverview } from '@/components/profile/StatsOverview';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/stores/auth-store';
import { useHealthStore } from '@/stores/health-store';
import { InsulinPredictionRecord } from '@/types/health-record';
import { getDateStringInTimezone } from '@/utils/timezone';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import {
  Brain,
  LogOut
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

interface UserStats {
  totalRecords: number;
  avgGlucose: number;
  totalInsulin: number;
  daysActive: number;
  timeInRange: number;
}

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const { signOut } = useAuthStore();
  const { settings } = useHealthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalRecords: 0,
    avgGlucose: 0,
    totalInsulin: 0,
    daysActive: 0,
    timeInRange: 0,
  });
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user?.uid) {
      fetchUserStats();
    }
  }, [user?.uid]);

  const fetchUserStats = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const snapshot = await firestore()
        .collection('insulin_records')
        .where('user_id', '==', user?.uid)
        .where('created_at', '>=', firestore.Timestamp.fromDate(thirtyDaysAgo))
        .get();

      if (!snapshot.empty) {
        const data: InsulinPredictionRecord[] = snapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            created_at: docData.created_at?.toDate()?.toISOString() || new Date().toISOString(),
            updated_at: docData.updated_at?.toDate()?.toISOString() || new Date().toISOString(),
          } as InsulinPredictionRecord;
        });

        const totalRecords = data.length;
        const avgGlucose = Math.round(
          data.reduce((sum, r) => sum + (r.current_glucose || 0), 0) / totalRecords
        );
        const totalInsulin =
          data.reduce((sum, r) => sum + (r.total_insulin || 0), 0);
        
        // Calculate unique days (Thailand timezone)
        const uniqueDays = new Set(
          data.map(r => getDateStringInTimezone(new Date(r.created_at), 'Asia/Bangkok'))
        );
        const daysActive = uniqueDays.size;

        // Calculate time in range (70-180 mg/dL)
        const inRange = data.filter(r => {
          const glucose = r.current_glucose;
          return glucose >= 70 && glucose <= 180;
        }).length;
        const timeInRange = Math.round((inRange / totalRecords) * 100);

        setStats({
          totalRecords,
          avgGlucose,
          totalInsulin: Math.round(totalInsulin * 10) / 10,
          daysActive,
          timeInRange,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

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

  const handleEditSettings = () => {
    toast.info('Edit settings feature coming soon!');
  };

  const handleMenuItem = (item: string) => {
    if (item === 'Quiz') {
      router.push('/quiz');
    } else {
      toast.info(`${item} feature coming soon!`);
    }
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

  const tabBarHeight = insets.bottom + 68;

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
        <ThemedView className="flex-1 px-6" style={{ paddingTop: insets.top + 20 }}>
          {/* Profile Card */}
          <ProfileCard
            email={user.email || 'user@example.com'}
            name={user.user_metadata?.name}
          />

          {/* Statistics Overview */}
          <StatsOverview
            totalRecords={stats.totalRecords}
            avgGlucose={stats.avgGlucose}
            totalInsulin={stats.totalInsulin}
            daysActive={stats.daysActive}
          />

          {/* Health Goals */}
          <HealthGoalsCard
            targetGlucose={settings.targetBloodGlucose}
            currentAvg={stats.avgGlucose}
            timeInRange={stats.timeInRange}
          />

          {/* Diabetes Settings */}
          <DiabetesSettingsCard
            isf={settings.insulinSensitivityFactor}
            icRatio={settings.carbRatio}
            targetGlucose={settings.targetBloodGlucose}
            onEdit={handleEditSettings}
          />

          {/* Settings Menu */}
          <ThemedView className="mb-6">
            <ThemedText className="font-bold mb-3 px-1" style={{ fontSize: 18 }}>
              Account & Settings
            </ThemedText>

            <SettingsMenuItem
              icon={<Brain size={20} color="#8b5cf6" />}
              title="Quiz"
              subtitle="Test your diabetes knowledge"
              onPress={() => handleMenuItem('Quiz')}
              color="#8b5cf6"
            />

            <SettingsMenuItem
              icon={<LogOut size={20} color="#dc2626" />}
              title="Logout"
              subtitle="Sign out of your account"
              onPress={handleLogout}
              dangerous
            />
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </PageLoader>
  );
}
