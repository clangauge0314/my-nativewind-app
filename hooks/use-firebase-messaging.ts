import firestore from '@react-native-firebase/firestore';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';

// 알림 핸들러 설정
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

  // FCM 토큰을 Firestore에 저장
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

  // FCM 토큰 가져오기
  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      setFcmToken(token);
      
      // Firestore에 토큰 저장
      if (userId && userEmail) {
        await saveTokenToFirestore(token, userId, userEmail);
      }
      
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  };

  // 포그라운드 메시지 처리
  const onMessageReceived = async (message: FirebaseMessagingTypes.RemoteMessage) => {
    setNotification(message);
    
    // 포그라운드에서는 수동으로 헤드업 알림 표시
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

  // FCM 알림 권한 요청
  const requestPermission = async () => {
    try {
      // Expo Notifications 권한 요청
      const { status: expoStatus } = await Notifications.requestPermissionsAsync();
      
      if (expoStatus !== 'granted') {
        return false;
      }

      // FCM 권한 요청
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

  // 초기화
  useEffect(() => {
    if (!userId || !userEmail) return;

    // 권한 요청 및 토큰 가져오기
    requestPermission();

    // 포그라운드 메시지 리스너
    const unsubscribeOnMessage = messaging().onMessage(onMessageReceived);

    // 토큰 갱신 리스너
    const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(async (token) => {
      setFcmToken(token);
      await saveTokenToFirestore(token, userId, userEmail);
    });

    // 백그라운드/종료 상태에서 알림 클릭 처리
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          setNotification(remoteMessage);
          setNotificationTapped(remoteMessage);
        }
      });

    // 백그라운드 상태에서 알림 클릭 처리
    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp((remoteMessage) => {
      setNotification(remoteMessage);
      setNotificationTapped(remoteMessage);
    });

    // Cleanup
    return () => {
      unsubscribeOnMessage();
      unsubscribeOnTokenRefresh();
      unsubscribeOnNotificationOpenedApp();
    };
  }, [userId, userEmail]);

  // 특정 주제 구독
  const subscribeToTopic = async (topic: string) => {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  };

  // 특정 주제 구독 해제
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
