import { Tabs, useRouter } from 'expo-router';
import { Activity, History, Home, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/stores/auth-store';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleAddData = () => {
    if (!user) return; // 로그인하지 않은 경우 아무 동작 안 함
    console.log('➕ Navigating to /add-record');
    router.push('/add-record');
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1d4ed8',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false, // Hide tab labels
        // Background color for page transitions (prevents black flash)
        sceneStyle: {
          backgroundColor: '#ffffff',
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
          height: insets.bottom + 68,
          shadowColor: '#fff',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 8,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: '#ffffff' }} />
        ),
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        // Page transition animation
        animation: 'shift',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <History size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color }) => <Activity size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      </Tabs>
      
      {/* Add Information Button - always visible, positioned above tab bar */}
      <View 
        style={{
          position: 'absolute',
          bottom: insets.bottom + 68,
          left: 0,
          right: 0,
          zIndex: 99999,
          height: 70,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: user ? '#2563eb' : '#cbd5e1',
        }}
      >
        <Pressable
          onPress={handleAddData}
          disabled={!user}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
            opacity: user ? 1 : 0.6,
          }}
        >
          <ThemedText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
            Add Insulin Prediction Record
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}