import { Tabs, useRouter } from 'expo-router';
import { Activity, History, Home, User } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { ThemedText } from '@/components/themed-text';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleAddData = () => {
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
          bottom: 0, // 디바이스 가장 최하단에 붙임
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : insets.bottom + 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? insets.bottom + 88 : insets.bottom + 68,
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
        name="tracker"
        options={{
          title: 'Tracker',
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
          bottom: Platform.OS === 'ios' ? insets.bottom + 88 : insets.bottom + 68,
          left: 0,
          right: 0,
          zIndex: 99999,
          height: 70,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#2563eb',
        }}
      >
        <Pressable
          onPress={handleAddData}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
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