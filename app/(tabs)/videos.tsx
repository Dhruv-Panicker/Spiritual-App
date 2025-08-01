
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
  Dimensions,
  Linking,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';

const { width, height } = Dimensions.get('window');

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
    thumbnail: 'https://img.youtube.com/vi/ZwdjklJGi80/maxresdefault.jpg',
    youtubeId: 'ZwdjklJGi80',
    duration: '10:30',
    description: 'Start your day with peace and mindfulness through guided meditation'
  },
  {
    id: '2',
    title: 'The Power of Gratitude',
    thumbnail: 'https://img.youtube.com/vi/WPPPFqsECz0/maxresdefault.jpg',
    youtubeId: 'WPPPFqsECz0',
    duration: '15:45',
    description: 'Transform your life through grateful awareness and appreciation'
  },
  {
    id: '3',
    title: 'Finding Inner Peace',
    thumbnail: 'https://img.youtube.com/vi/inpok4MKVLM/maxresdefault.jpg',
    youtubeId: 'inpok4MKVLM',
    duration: '20:15',
    description: 'Discover the sanctuary within your own heart through spiritual practice'
  },
  {
    id: '4',
    title: 'Chakra Healing Journey',
    thumbnail: 'https://img.youtube.com/vi/StrbppmsZJw/maxresdefault.jpg',
    youtubeId: 'StrbppmsZJw',
    duration: '25:00',
    description: 'Balance your energy centers for spiritual awakening and healing'
  },
  {
    id: '5',
    title: 'Sacred Mantras for Peace',
    thumbnail: 'https://img.youtube.com/vi/F8nkyljZj0w/maxresdefault.jpg',
    youtubeId: 'F8nkyljZj0w',
    duration: '12:30',
    description: 'Ancient Sanskrit mantras to elevate consciousness and find tranquility'
  },
  {
    id: '6',
    title: 'Breathwork for Clarity',
    thumbnail: 'https://img.youtube.com/vi/tybOi4hjZFQ/maxresdefault.jpg',
    youtubeId: 'tybOi4hjZFQ',
    duration: '18:20',
    description: 'Sacred breathing techniques to clear mind and awaken spirit'
  }
];

const VideoCard: React.FC<{ video: Video; onPlayVideo: (video: Video) => void }> = ({ video, onPlayVideo }) => {
  const handleShareVideo = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const shareText = `🎥 ${video.title}\n\n${video.description}\n\nWatch on our Spiritual Wisdom app`;
    
    try {
      await Share.share({
        title: video.title,
        message: `${shareText}\n\nhttps://youtube.com/watch?v=${video.youtubeId}`,
        url: `https://youtube.com/watch?v=${video.youtubeId}`,
      });
    } catch (error) {
      Toast.show({
        type: 'info',
        text1: 'Video Link Ready',
        text2: 'Share this inspiring video with others!',
        visibilityTime: 3000,
      });
    }
  };

  const openInYouTube = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const youtubeUrl = `https://youtube.com/watch?v=${video.youtubeId}`;
    
    try {
      const supported = await Linking.canOpenURL(youtubeUrl);
      if (supported) {
        await Linking.openURL(youtubeUrl);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Cannot Open YouTube',
          text2: 'Please install the YouTube app or try again later.',
          visibilityTime: 4000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error Opening Video',
        text2: 'Please try again later.',
        visibilityTime: 3000,
      });
    }
  };

  const handlePlayVideo = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPlayVideo(video);
  };

  return (
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
          onPress={handlePlayVideo}
          activeOpacity={0.8}
        >
          <View style={styles.playButton}>
            <IconSymbol name="play.fill" size={32} color={SPIRITUAL_COLORS.primaryForeground} />
          </View>
        </TouchableOpacity>
        
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
            style={styles.actionButton}
            onPress={handleShareVideo}
            activeOpacity={0.7}
          >
            <IconSymbol name="square.and.arrow.up" size={16} color={SPIRITUAL_COLORS.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={openInYouTube}
            activeOpacity={0.7}
          >
            <IconSymbol name="link" size={16} color={SPIRITUAL_COLORS.primary} />
            <Text style={styles.actionButtonText}>YouTube</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function VideosScreen() {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  const handlePlayVideo = (video: Video) => {
    setCurrentVideo(video);
    // In a real app, you'd navigate to a video player or open YouTube
    Toast.show({
      type: 'success',
      text1: '🎥 Opening Video',
      text2: `Now playing: ${video.title}`,
      visibilityTime: 3000,
    });
  };

  const shareApp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const shareText = "🙏 Check out these inspiring spiritual videos! This app has been such a source of peace and wisdom for me.";
    
    try {
      await Share.share({
        title: 'Spiritual Wisdom Videos',
        message: shareText,
      });
    } catch (error) {
      Toast.show({
        type: 'info',
        text1: 'Share the Wisdom',
        text2: 'Spread peace and mindfulness with others!',
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sacred Videos</Text>
          <Text style={styles.headerSubtitle}>Wisdom teachings and guided practices</Text>
        </View>

        {/* Videos ScrollView */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {mockVideos.map((video, index) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              onPlayVideo={handlePlayVideo}
            />
          ))}
          
          {/* Share App CTA */}
          <View style={styles.shareSection}>
            <LinearGradient
              colors={SPIRITUAL_GRADIENTS.divine}
              style={styles.shareCard}
            >
              <Text style={styles.shareSectionTitle}>Share the Wisdom</Text>
              <Text style={styles.shareSectionDescription}>
                Share this app with someone who might find it meaningful
              </Text>
              <TouchableOpacity
                style={styles.shareAppButton}
                onPress={shareApp}
                activeOpacity={0.8}
              >
                <IconSymbol name="square.and.arrow.up" size={20} color={SPIRITUAL_COLORS.secondaryForeground} />
                <Text style={styles.shareAppText}>Share App</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    ...SPIRITUAL_TYPOGRAPHY.spiritualHeading,
    fontSize: 28,
    marginBottom: 8,
    color: SPIRITUAL_COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
    width: '100%',
    height: 220,
    backgroundColor: SPIRITUAL_COLORS.accent,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SPIRITUAL_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  durationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 20,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
    lineHeight: 24,
  },
  videoDescription: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: SPIRITUAL_COLORS.accent,
    borderRadius: 20,
    flex: 0.48,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primary,
    marginLeft: 6,
  },
  shareSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  shareCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...SPIRITUAL_SHADOWS.divine,
  },
  shareSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.primaryForeground,
    marginBottom: 8,
    textAlign: 'center',
  },
  shareSectionDescription: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.primaryForeground,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
    lineHeight: 22,
  },
  shareAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SPIRITUAL_COLORS.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  shareAppText: {
    fontSize: 16,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.secondaryForeground,
    marginLeft: 8,
  },
});
