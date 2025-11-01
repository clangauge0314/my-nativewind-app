import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// 알림 채널 생성 (Android)
export function useNotificationChannel() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      createNotificationChannel();
    }
  }, []);

  const createNotificationChannel = async () => {
    try {
      // 기본 채널 (expo-notifications용)
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        description: 'Default notification channel',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
        enableLights: true,
        lightColor: '#2563eb',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        showBadge: true,
      });

      // 식사 알람 채널 (헤드업 알림)
      await Notifications.setNotificationChannelAsync('meal_alarms', {
        name: 'Meal Alarms',
        description: 'Important meal time reminders - shows on screen',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
        enableLights: true,
        lightColor: '#2563eb',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        showBadge: true,
      });
    } catch (error) {
      console.error('Error creating notification channel:', error);
    }
  };
}

