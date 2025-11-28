import firestore from '@react-native-firebase/firestore';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useFirebaseMessaging(userId?: string, userEmail?: string) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<FirebaseMessagingTypes.RemoteMessage | null>(null);
  const [notificationTapped, setNotificationTapped] = useState<FirebaseMessagingTypes.RemoteMessage | null>(null);

  const saveTokenToFirestore = async (token: string, userId: string, userEmail: string) => {
    try {
      await firestore()
        .collection('fcm_tokens')
        .doc(userEmail)
        .set({
          token,
          user_id: userId,
          updated_at: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  };

  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      setFcmToken(token);
      if (userId && userEmail) {
        await saveTokenToFirestore(token, userId, userEmail);
      }
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  };

  const onMessageReceived = async (message: FirebaseMessagingTypes.RemoteMessage) => {
    setNotification(message);
    if (Platform.OS === 'android') {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'asset:/alarm_sound.mp3' },
          { shouldPlay: true, volume: 1.0 }
        );
      } catch (error) {
        console.error('Error playing custom sound:', error);
      }
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.notification?.title || (message.data?.title as string) || 'Notification',
          body: message.notification?.body || (message.data?.body as string) || '',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          categoryIdentifier: 'meal_alarm',
          sticky: false,
          autoDismiss: true,
          data: message.data ? Object.fromEntries(
            Object.entries(message.data).map(([key, value]) => [key, String(value)])
          ) : {},
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const { status: expoStatus } = await Notifications.requestPermissionsAsync();
      if (expoStatus !== 'granted') {
        return false;
      }
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        await getToken();
      }
      return enabled;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  useEffect(() => {
    if (!userId || !userEmail) return;

    requestPermission();

    const unsubscribeOnMessage = messaging().onMessage(onMessageReceived);

    const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(async (token) => {
      setFcmToken(token);
      await saveTokenToFirestore(token, userId, userEmail);
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          setNotification(remoteMessage);
          setNotificationTapped(remoteMessage);
        }
      });

    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp((remoteMessage) => {
      setNotification(remoteMessage);
      setNotificationTapped(remoteMessage);
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnTokenRefresh();
      unsubscribeOnNotificationOpenedApp();
    };
  }, [userId, userEmail]);

  const subscribeToTopic = async (topic: string) => {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  };

  const unsubscribeFromTopic = async (topic: string) => {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  };

  return {
    fcmToken,
    notification,
    notificationTapped,
    requestPermission,
    subscribeToTopic,
    unsubscribeFromTopic,
  };
}
