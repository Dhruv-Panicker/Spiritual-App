
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Share } from 'react-native';
import Toast from 'react-native-toast-message';

import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeId: string;
  duration: string;
  description: string;
}

const spiritualVideos: Video[] = [
  {
    id: '1',
    title: 'श्री सिधेश्वर तीर्थ ब्रह्मर्षि जी महाराज के दर्शन',
    thumbnail: 'https://img.youtube.com/vi/gOBXF8ntsWY/hqdefault.jpg',
    youtubeId: 'gOBXF8ntsWY',
    duration: '0:59',
    description: 'पवित्र ब्रह्मर्षि जी के दिव्य दर्शन और आशीर्वाद'
  },
  {
    id: '2',
    title: 'ब्रह्मर्षि जी का आध्यात्मिक उपदेश',
    thumbnail: 'https://img.youtube.com/vi/VzHQG7bJzqE/hqdefault.jpg',
    youtubeId: 'VzHQG7bJzqE',
    duration: '0:52',
    description: 'आत्मा की शुद्धता और परमात्मा से मिलन का मार्ग'
  },
  {
    id: '3',
    title: 'श्री गुरुदेव का दिव्य संदेश',
    thumbnail: 'https://img.youtube.com/vi/2wGfQKwgvqc/hqdefault.jpg',
    youtubeId: '2wGfQKwgvqc',
    duration: '1:15',
    description: 'जीवन में शांति और आनंद पाने के लिए गुरु के उपदेश'
  },
  {
    id: '4',
    title: 'ब्रह्मर्षि जी की पावन वाणी',
    thumbnail: 'https://img.youtube.com/vi/8hKRzpY5Zj4/hqdefault.jpg',
    youtubeId: '8hKRzpY5Zj4',
    duration: '0:48',
    description: 'मोक्ष प्राप्ति के लिए साधना और भक्ति का महत्व'
  },
  {
    id: '5',
    title: 'गुरु शिष्य परंपरा का महत्व',
    thumbnail: 'https://img.youtube.com/vi/Lk9dHrKgxsM/hqdefault.jpg',
    youtubeId: 'Lk9dHrKgxsM',
    duration: '1:08',
    description: 'सच्चे गुरु की पहचान और शिष्य के कर्तव्य'
  }
];

export function VideosScreen() {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  const shareVideo = async (video: Video) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const shareContent = {
        title: 'Check out this spiritual video',
        message: `🕉️ ${video.title}\n\n${video.description}\n\nWatch: https://youtube.com/watch?v=${video.youtubeId}`,
        url: `https://youtube.com/watch?v=${video.youtubeId}`,
      };

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

  const openInYouTube = async (video: Video) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const url = `https://youtube.com/watch?v=${video.youtubeId}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Cannot Open YouTube',
          text2: 'YouTube app is not available',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to open YouTube',
        visibilityTime: 3000,
      });
    }
  };

  const handlePlayVideo = async (video: Video) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCurrentVideo(video);
    openInYouTube(video);
  };

  const shareApp = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const shareContent = {
        title: 'Spiritual Wisdom App',
        message: '🙏 Find peace in daily wisdom with this beautiful spiritual app. These videos have brought such tranquility to my life! Download now and start your journey to inner peace.',
        url: 'https://your-app-link.com',
      };

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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={SPIRITUAL_GRADIENTS.peace}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[SPIRITUAL_TYPOGRAPHY.spiritualHeading, styles.headerTitle]}>
              Spiritual Shorts
            </Text>
            <Text style={styles.headerSubtitle}>
              Divine wisdom from Sri Sidheshwar Tirth Brahmrishi
            </Text>
          </View>

          {/* Video Cards */}
          {spiritualVideos.map((video, index) => (
            <View
              key={video.id}
              style={[
                styles.videoCard,
                SPIRITUAL_SHADOWS.peaceful,
                { opacity: 1 - (index * 0.02) } // Subtle fade effect
              ]}
            >
              {/* Thumbnail Container */}
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: video.thumbnail }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                
                {/* Play Button Overlay */}
                <View style={styles.playOverlay}>
                  <TouchableOpacity
                    style={[styles.playButton, SPIRITUAL_SHADOWS.divine]}
                    onPress={() => handlePlayVideo(video)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={SPIRITUAL_GRADIENTS.divine}
                      style={styles.playButtonGradient}
                    >
                      <Ionicons
                        name="play"
                        size={32}
                        color={SPIRITUAL_COLORS.primaryForeground}
                        style={styles.playIcon}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Duration Badge */}
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>
              </View>

              {/* Video Info */}
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoDescription}>{video.description}</Text>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, SPIRITUAL_SHADOWS.card]}
                    onPress={() => shareVideo(video)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="share-outline"
                      size={20}
                      color={SPIRITUAL_COLORS.primary}
                    />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, SPIRITUAL_SHADOWS.card]}
                    onPress={() => openInYouTube(video)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="open-outline"
                      size={20}
                      color={SPIRITUAL_COLORS.primary}
                    />
                    <Text style={styles.actionButtonText}>YouTube</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* Share App CTA */}
          <LinearGradient
            colors={SPIRITUAL_GRADIENTS.divine}
            style={[styles.shareAppCard, SPIRITUAL_SHADOWS.divine]}
          >
            <Text style={styles.shareAppTitle}>Share Divine Wisdom</Text>
            <Text style={styles.shareAppSubtitle}>
              Share these sacred teachings with seekers on the spiritual path
            </Text>
            <TouchableOpacity
              style={styles.shareAppButton}
              onPress={shareApp}
              activeOpacity={0.8}
            >
              <Ionicons
                name="share"
                size={20}
                color={SPIRITUAL_COLORS.primary}
                style={styles.shareAppIcon}
              />
              <Text style={styles.shareAppButtonText}>Share App</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Bottom spacing for tab navigation */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>
      <Toast />
    </SafeAreaView>
  );
}

export default VideosScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    color: SPIRITUAL_COLORS.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
  videoCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  playButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    marginLeft: 4, // Slight offset for visual centering
  },
  durationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SPIRITUAL_COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 0.4,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: SPIRITUAL_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  shareAppCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  shareAppTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.primaryForeground,
    marginBottom: 8,
    textAlign: 'center',
  },
  shareAppSubtitle: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.primaryForeground,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 20,
  },
  shareAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SPIRITUAL_COLORS.primaryForeground,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareAppIcon: {
    marginRight: 8,
  },
  shareAppButtonText: {
    color: SPIRITUAL_COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100, // Space for tab navigation
  },
});
