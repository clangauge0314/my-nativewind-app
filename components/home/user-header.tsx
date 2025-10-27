import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'expo-router';
import { Bell, LogIn, Settings } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SettingsDropdown } from './settings-dropdown';

export const UserHeader = React.memo(function UserHeader() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const settingsButtonRef = useRef<View>(null);

  const handleLoginPress = useCallback(() => {
    router.push('/login');
  }, [router]);

  const displayName = useMemo(() => 
    user ? ((user as any).displayName || user.email?.split('@')[0] || 'User') : 'User', 
    [user]
  );

  const handleSettingsPress = useCallback(() => {
    settingsButtonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setDropdownPosition({
        top: pageY + height + 8,
        right: 16,
      });
      setShowSettings(true);
    });
  }, []);

  if (!user) {
    return (
      <View className="mb-0 mt-4">
        <Pressable 
          onPress={handleLoginPress}
          className="rounded-2xl p-6"
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
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mr-4"
                style={{ 
                  backgroundColor: '#eff6ff',
                  borderWidth: 0,
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <LogIn size={25} color={'#2563eb'} />
              </View>

              <View className="flex-1">
                <ThemedText 
                  className="font-medium mb-1"
                  style={{ color: '#6b7280', fontSize: 13 }}
                >
                  Welcome to Diabetes Tracker
                </ThemedText>
                <ThemedText 
                  className="font-bold"
                  style={{ color: '#000', fontSize: 19 }}
                >
                  Please Log In
                </ThemedText>
              </View>
            </View>

          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="mb-0 mt-4">
      {/* Card Container */}
      <View 
        className="rounded-2xl p-6"
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
        <View className="flex-row items-center justify-between">
          {/* Profile Section */}
          <View className="flex-row items-center flex-1">
            <View 
              className="w-16 h-16 rounded-full items-center justify-center mr-4"
              style={{ 
                backgroundColor: '#eff6ff',
                borderWidth: 0,
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <ThemedText 
                className="font-bold"
                style={{ color: '#2563eb', fontSize: 22 }}
              >
                {displayName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>

            <View className="flex-1">
              <ThemedText 
                className="font-medium mb-1"
                style={{ color: '#6b7280', fontSize: 13 }}
              >
                Hello, Welcome Back
              </ThemedText>
              <ThemedText 
                className="font-bold"
                style={{ fontSize: 19 }}
              >
                {displayName}
              </ThemedText>
            </View>
          </View>

          {/* Action Icons */}
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <Pressable 
              className="w-12 h-12 rounded-full items-center justify-center relative"
              style={({ pressed }) => ({ 
                backgroundColor: pressed 
                  ? ('#e5e7eb')
                  : ('#f3f4f6'),
                transform: [{ scale: pressed ? 0.95 : 1 }]
              })}
            >
              <Bell size={21} color={'#6b7280'} />
              <View 
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: '#ef4444' }}
              />
            </Pressable>
            <Pressable 
              ref={settingsButtonRef}
              onPress={handleSettingsPress}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={({ pressed }) => ({ 
                backgroundColor: pressed 
                  ? ('#e5e7eb')
                  : ('#f3f4f6'),
                transform: [{ scale: pressed ? 0.95 : 1 }]
              })}
            >
              <Settings size={21} color={'#6b7280'} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Settings Dropdown */}
      <SettingsDropdown 
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        anchorPosition={dropdownPosition}
      />
    </View>
  );
});

