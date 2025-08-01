
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';

import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';

const { width: screenWidth } = Dimensions.get('window');

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeId: string;
  duration: string;
  description: string;
}

const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Morning Meditation Practice',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '10:30',
    description: 'Start your day with peace and mindfulness'
  },
  {
    id: '2', 
    title: 'The Power of Gratitude',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '15:45',
    description: 'Transform your life through grateful awareness'
  },
  {
    id: '3',
    title: 'Finding Inner Peace',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '20:15',
    description: 'Discover the sanctuary within your own heart'
  },
  {
    id: '4',
    title: 'Chakra Alignment Journey',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '25:00',
    description: 'Balance your energy centers with guided meditation'
  },
  {
    id: '5',
    title: 'Sacred Mantras for Peace',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '12:15',
    description: 'Ancient chants to calm the mind and open the heart'
  }
];

export default function VideosPage() {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  const handlePlayVideo = async (video: Video) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
    
    try {
      await Linking.openURL(youtubeUrl);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to open YouTube video',
      });
    }
  };

  const handleShareVideo = async (video: Video) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const shareText = `🎥 ${video.title}\n\n${video.description}\n\nWatch on YouTube: https://youtube.com/watch?v=${video.youtubeId}`;
    
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareText);
      } else {
        // Fallback to native share on web
        if (navigator.share) {
          await navigator.share({
            title: 'Sacred Video',
            text: shareText,
          });
        } else {
          Toast.show({
            type: 'info',
            text1: 'Share',
            text2: 'Copy link to share this video',
          });
        }
      }
    } catch (error) {
      // User cancelled sharing
    }
  };

  const openInYouTube = async (video: Video) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const youtubeUrl = Platform.select({
      ios: `youtube://www.youtube.com/watch?v=${video.youtubeId}`,
      android: `intent://youtube.com/watch?v=${video.youtubeId}#Intent;package=com.google.android.youtube;scheme=https;end`,
      default: `https://youtube.com/watch?v=${video.youtubeId}`
    });

    try {
      await Linking.openURL(youtubeUrl);
    } catch (error) {
      // Fallback to web URL
      await Linking.openURL(`https://youtube.com/watch?v=${video.youtubeId}`);
    }
  };

  const shareApp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const shareText = "🙏 Check out these inspiring spiritual videos! This app has been such a source of peace and wisdom for me.";
    
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareText);
      } else {
        // Fallback to native share on web
        if (navigator.share) {
          await navigator.share({
            title: 'Spiritual Wisdom App',
            text: shareText,
          });
        } else {
          Toast.show({
            type: 'info',
            text1: 'Share App',
            text2: 'Copy this text to share the app',
          });
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Unable to share app at this time.',
      });
    }
  };

  const VideoCard = ({ video }: { video: Video }) => (
    <View style={styles.videoCard}>
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: video.thumbnail }} 
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        {/* Play Button Overlay */}
        <TouchableOpacity 
          style={styles.playButtonOverlay}
          onPress={() => handlePlayVideo(video)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={SPIRITUAL_GRADIENTS.divine}
            style={styles.playButton}
          >
            <Ionicons name="play" size={32} color={SPIRITUAL_COLORS.primaryForeground} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Duration Badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{video.title}</Text>
        <Text style={styles.videoDescription}>{video.description}</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShareVideo(video)}
          >
            <Ionicons name="share-outline" size={18} color={SPIRITUAL_COLORS.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openInYouTube(video)}
          >
            <Ionicons name="logo-youtube" size={18} color={SPIRITUAL_COLORS.spiritualRed} />
            <Text style={styles.actionButtonText}>YouTube</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={SPIRITUAL_GRADIENTS.peace}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/om-symbol.png')}
              style={styles.omIcon}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Sacred Videos</Text>
            <Text style={styles.headerSubtitle}>Wisdom teachings and guided practices</Text>
          </View>

          {/* Videos List */}
          <View style={styles.videosContainer}>
            {mockVideos.map((video, index) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </View>

          {/* Share App CTA */}
          <View style={styles.shareAppContainer}>
            <LinearGradient
              colors={SPIRITUAL_GRADIENTS.divine}
              style={styles.shareAppCard}
            >
              <Image
                source={require('@/assets/images/om-symbol.png')}
                style={styles.shareOmIcon}
                resizeMode="contain"
              />
              <Text style={styles.shareAppTitle}>Share the Wisdom</Text>
              <Text style={styles.shareAppDescription}>
                Share this app with someone who might find it meaningful
              </Text>
              <TouchableOpacity 
                style={styles.shareAppButton}
                onPress={shareApp}
              >
                <Ionicons name="share" size={20} color={SPIRITUAL_COLORS.primary} />
                <Text style={styles.shareAppButtonText}>Share App</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>

      <Toast />
    </View>
  );
}

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
    paddingBottom: 100, // Extra space for tab bar
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  omIcon: {
    width: 40,
    height: 40,
    marginBottom: 10,
    tintColor: SPIRITUAL_COLORS.primary,
  },
  headerTitle: {
    ...SPIRITUAL_TYPOGRAPHY.spiritualHeading,
    fontSize: 28,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
  videosContainer: {
    paddingHorizontal: 16,
  },
  videoCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    ...SPIRITUAL_SHADOWS.card,
  },
  thumbnailContainer: {
    position: 'relative',
    aspectRatio: 16/9,
    backgroundColor: SPIRITUAL_COLORS.border,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    ...SPIRITUAL_SHADOWS.divine,
  },
  durationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
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
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: SPIRITUAL_COLORS.accent,
    borderRadius: 20,
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
  },
  shareAppContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  shareAppCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  shareOmIcon: {
    width: 32,
    height: 32,
    marginBottom: 12,
    tintColor: SPIRITUAL_COLORS.primaryForeground,
  },
  shareAppTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.primaryForeground,
    marginBottom: 8,
  },
  shareAppDescription: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.primaryForeground,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    opacity: 0.9,
  },
  shareAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SPIRITUAL_COLORS.primaryForeground,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  shareAppButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primary,
  },
});
