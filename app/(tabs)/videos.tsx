import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import Toast from 'react-native-toast-message';

const shareVideo = async (video: Video) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const shareContent = {
        title: 'Check out this spiritual video',
        message: `${video.title}\n\nWatch: https://youtube.com/watch?v=${video.youtubeId}`,
        url: `https://youtube.com/watch?v=${video.youtubeId}`,
      };

      // Use React Native's built-in Share API which works across platforms
      await Share.share({
        message: shareContent.message,
        url: shareContent.url,
        title: shareContent.title,
      });

      Toast.show({
        type: 'success',
        text1: 'Shared Successfully',
        text2: 'Video link has been shared',
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Unable to share video',
        visibilityTime: 3000,
      });
    }
  };

  const shareApp = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const shareContent = {
        title: 'Spiritual Wisdom App',
        message: 'Find peace in daily wisdom with this beautiful spiritual app. Download now!',
        url: 'https://your-app-link.com', // Replace with your actual app store link
      };

      // Use React Native's built-in Share API
      await Share.share({
        message: shareContent.message,
        url: shareContent.url,
        title: shareContent.title,
      });

      Toast.show({
        type: 'success',
        text1: 'Shared Successfully',
        text2: 'App link has been shared',
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Unable to share app',
        visibilityTime: 3000,
      });
    }
  };