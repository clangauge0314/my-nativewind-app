import { GuestWelcome } from '@/components/home/guest-welcome';
import { PageLoader } from '@/components/page-loader';
import { DiabetesSettingsCard } from '@/components/profile/DiabetesSettingsCard';
import { HealthGoalsCard } from '@/components/profile/HealthGoalsCard';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { SettingsMenuItem } from '@/components/profile/SettingsMenuItem';
import { StatsOverview } from '@/components/profile/StatsOverview';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useHealthStore } from '@/stores/health-store';
import { useFocusEffect } from '@react-navigation/native';
import {
  Bell,
  FileText,
  HelpCircle,
  Lock,
  LogOut,
  Moon,
  Shield,
  User
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
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

  // Fetch user statistics
  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id]);

  const fetchUserStats = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('insulin_prediction_records')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      if (data && data.length > 0) {
        const totalRecords = data.length;
        const avgGlucose = Math.round(
          data.reduce((sum, r) => sum + (parseFloat(r.current_glucose) || 0), 0) / totalRecords
        );
        const totalInsulin =
          data.reduce((sum, r) => sum + (parseFloat(r.total_insulin) || 0), 0);
        
        // Calculate unique days
        const uniqueDays = new Set(
          data.map(r => new Date(r.created_at).toISOString().split('T')[0])
        );
        const daysActive = uniqueDays.size;

        // Calculate time in range (70-180 mg/dL)
        const inRange = data.filter(r => {
          const glucose = parseFloat(r.current_glucose);
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
    toast.info(`${item} feature coming soon!`);
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
              icon={<User size={20} color="#3b82f6" />}
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => handleMenuItem('Edit Profile')}
              color="#3b82f6"
            />

            <SettingsMenuItem
              icon={<Bell size={20} color="#8b5cf6" />}
              title="Notifications"
              subtitle="Manage your notification preferences"
              onPress={() => handleMenuItem('Notifications')}
              color="#8b5cf6"
            />

            <SettingsMenuItem
              icon={<Lock size={20} color="#06b6d4" />}
              title="Privacy & Security"
              subtitle="Control your data and security"
              onPress={() => handleMenuItem('Privacy')}
              color="#06b6d4"
            />

            <SettingsMenuItem
              icon={<Moon size={20} color="#f59e0b" />}
              title="Appearance"
              subtitle="Customize your app theme"
              onPress={() => handleMenuItem('Appearance')}
              color="#f59e0b"
            />

            <SettingsMenuItem
              icon={<FileText size={20} color="#10b981" />}
              title="Export Data"
              subtitle="Download your health records"
              onPress={() => handleMenuItem('Export Data')}
              color="#10b981"
            />

            <SettingsMenuItem
              icon={<HelpCircle size={20} color="#6366f1" />}
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => handleMenuItem('Help & Support')}
              color="#6366f1"
            />

            <SettingsMenuItem
              icon={<Shield size={20} color="#ec4899" />}
              title="Terms & Privacy"
              subtitle="Read our terms and privacy policy"
              onPress={() => handleMenuItem('Terms')}
              color="#ec4899"
            />

            <SettingsMenuItem
              icon={<LogOut size={20} color="#dc2626" />}
              title="Logout"
              subtitle="Sign out of your account"
              onPress={handleLogout}
              dangerous
            />
          </ThemedView>

          {/* App Info */}
          <View
            className="rounded-2xl p-4 mb-6"
            style={{
              backgroundColor: '#f9fafb',
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <ThemedText
              className="text-center"
              style={{
                fontSize: 12,
                color: '#6b7280',
              }}
            >
              Diabetes Management App
            </ThemedText>
            <ThemedText
              className="text-center font-semibold"
              style={{
                fontSize: 11,
                color: '#9ca3af',
                marginTop: 2,
              }}
            >
              Version 1.0.0 • Made with ❤️ for better health
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </PageLoader>
  );
}
