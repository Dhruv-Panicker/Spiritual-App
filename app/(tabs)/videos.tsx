
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  StatusBar,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Share } from 'react-native';
import Toast from 'react-native-toast-message';
import { WebView } from 'react-native-webview';

import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

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
    title: 'श्री सिधेश्वर तीर्थ ब्रह्मर्षि जी के दिव्य दर्शन',
    thumbnail: 'https://img.youtube.com/vi/TIQUPpiEvS0/hqdefault.jpg',
    youtubeId: 'TIQUPpiEvS0',
    duration: '0:59',
    description: 'श्री गुरुदेव के पावन दर्शन और आध्यात्मिक आशीर्वाद'
  },
  {
    id: '2',
    title: 'ब्रह्मर्षि जी का आध्यात्मिक संदेश',
    thumbnail: 'https://img.youtube.com/vi/5aCB-_iAf8A/hqdefault.jpg',
    youtubeId: '5aCB-_iAf8A',
    duration: '0:45',
    description: 'आत्मा की शुद्धता और परमात्मा प्राप्ति के उपाय'
  },
  {
    id: '3',
    title: 'गुरु शिष्य परंपरा का महत्व',
    thumbnail: 'https://img.youtube.com/vi/udVQ9H_O_44/hqdefault.jpg',
    youtubeId: 'udVQ9H_O_44',
    duration: '1:02',
    description: 'सच्चे गुरु की पहचान और शिष्य के कर्तव्य'
  },
  {
    id: '4',
    title: 'मोक्ष प्राप्ति का मार्ग',
    thumbnail: 'https://img.youtube.com/vi/wR3rDGkpTCM/hqdefault.jpg',
    youtubeId: 'wR3rDGkpTCM',
    duration: '0:38',
    description: 'जीवन-मुक्ति के लिए साधना और भक्ति'
  },
  {
    id: '5',
    title: 'श्री गुरुदेव की पावन वाणी',
    thumbnail: 'https://img.youtube.com/vi/TIQUPpiEvS0/hqdefault.jpg',
    youtubeId: 'TIQUPpiEvS0',
    duration: '0:52',
    description: 'आंतरिक शांति और आनंद के लिए गुरु उपदेश'
  }
];

export function VideosScreen() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentVideo = spiritualVideos[currentVideoIndex];

  // Create embedded YouTube player HTML with autoplay
  const createYouTubeHTML = (videoId: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #000;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              overflow: hidden;
            }
            iframe {
              border: none;
            }
          </style>
        </head>
        <body>
          <iframe 
            width="${screenWidth}" 
            height="${screenHeight}" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&showinfo=0&fs=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&disablekb=1&mute=0&loop=1&playlist=${videoId}"
            frameborder="0" 
            allowfullscreen
            allow="autoplay; encrypted-media">
          </iframe>
        </body>
      </html>
    `;
  };

  // Navigation functions
  const goToNextVideo = () => {
    if (currentVideoIndex < spiritualVideos.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentVideoIndex(currentVideoIndex + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Reset transition state after animation
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentVideoIndex(currentVideoIndex - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Reset transition state after animation
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Enhanced PanResponder for better swipe detection
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical swipes
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        translateY.setOffset(translateY._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Limit the movement to create resistance at boundaries
        let limitedDy = gestureState.dy;
        
        if (currentVideoIndex === 0 && gestureState.dy > 0) {
          // At first video, resist downward swipe
          limitedDy = gestureState.dy * 0.3;
        } else if (currentVideoIndex === spiritualVideos.length - 1 && gestureState.dy < 0) {
          // At last video, resist upward swipe
          limitedDy = gestureState.dy * 0.3;
        }
        
        translateY.setValue(limitedDy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        translateY.flattenOffset();
        
        const swipeThreshold = 50;
        const velocityThreshold = 0.3;
        
        if (gestureState.dy > swipeThreshold || gestureState.vy > velocityThreshold) {
          // Swiped down - go to previous video
          goToPreviousVideo();
        } else if (gestureState.dy < -swipeThreshold || gestureState.vy < -velocityThreshold) {
          // Swiped up - go to next video
          goToNextVideo();
        }
        
        // Animate back to center
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const shareVideo = async (video: Video) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const shareContent = {
        title: 'Check out this spiritual video',
        message: `🕉️ ${video.title}\n\n${video.description}\n\nWatch: https://youtube.com/shorts/${video.youtubeId}`,
        url: `https://youtube.com/shorts/${video.youtubeId}`,
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

      const browserUrl = `https://www.youtube.com/shorts/${video.youtubeId}`;

      // Check if we're on web platform
      if (typeof window !== 'undefined' && window.open) {
        window.open(browserUrl, '_blank');
        return;
      }

      // Native environment - open in external browser
      const { Linking } = require('react-native');
      await Linking.openURL(browserUrl);
    } catch (error) {
      console.error('Error opening video:', error);
      Toast.show({
        type: 'error',
        text1: 'Error Opening Video',
        text2: 'Please try again or check your internet connection',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <Animated.View 
        {...panResponder.panHandlers}
        style={[
          styles.videoContainer,
          {
            transform: [{ translateY }]
          }
        ]}
      >
        {/* Video Player Area - Full Screen */}
        <View style={styles.videoPlayerContainer}>
          <WebView
            key={`${currentVideo.youtubeId}-${currentVideoIndex}`} // Force re-render when video changes
            source={{ html: createYouTubeHTML(currentVideo.youtubeId) }}
            style={styles.webView}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            scalesPageToFit
            bounces={false}
            scrollEnabled={false}
          />
        </View>

        {/* Side Action Buttons - Instagram Reels Style */}
        <View style={styles.sideActionButtons}>
          <TouchableOpacity
            style={styles.sideActionButton}
            onPress={() => shareVideo(currentVideo)}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons
                name="share-outline"
                size={28}
                color="#fff"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideActionButton}
            onPress={() => openInYouTube(currentVideo)}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons
                name="logo-youtube"
                size={28}
                color="#ff0000"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Video Info Overlay - Bottom */}
        <View style={styles.videoInfoOverlay}>
          <View style={styles.videoDetails}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {currentVideo.title}
            </Text>
            <Text style={styles.videoDescription} numberOfLines={2}>
              {currentVideo.description}
            </Text>
          </View>
          
          {/* Progress Indicators */}
          <View style={styles.progressIndicators}>
            {spiritualVideos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentVideoIndex && styles.progressDotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* Swipe Hint (for first-time users) */}
        {currentVideoIndex === 0 && (
          <View style={styles.swipeHint}>
            <Ionicons name="chevron-up" size={24} color="rgba(255,255,255,0.6)" />
            <Text style={styles.swipeHintText}>Swipe up for next video</Text>
          </View>
        )}
      </Animated.View>

      <Toast />
    </SafeAreaView>
  );
}

export default VideosScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  sideActionButtons: {
    position: 'absolute',
    right: 15,
    bottom: 200,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 999,
  },
  sideActionButton: {
    marginBottom: 20,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  videoInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 60, // Leave space for side buttons
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for tab bar
    paddingTop: 20,
  },
  videoDetails: {
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  videoDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 3,
  },
  progressDotActive: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  swipeHint: {
    position: 'absolute',
    top: '50%',
    right: 20,
    alignItems: 'center',
    zIndex: 999,
    opacity: 0.7,
  },
  swipeHintText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    writingDirection: 'ltr',
  },
});
