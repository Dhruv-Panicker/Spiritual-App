
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { useVideos } from '@/hooks/data/useVideos';
import { type Video } from '@/mocks/data/videos';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function VideosScreen() {
  const { videos: spiritualVideos } = useVideos();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideoIndexRef = useRef(0);
  const translateY = useRef(new Animated.Value(0)).current;

  const currentVideo = spiritualVideos[currentVideoIndex];

  // Keep ref in sync with state
  useEffect(() => {
    currentVideoIndexRef.current = currentVideoIndex;
  }, [currentVideoIndex]);

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

  // Navigation functions using useCallback to prevent stale closures
  const goToNextVideo = useCallback(() => {
    const current = currentVideoIndexRef.current;
    console.log('goToNextVideo called, currentIndex:', current, 'maxIndex:', spiritualVideos.length - 1);
    if (current < spiritualVideos.length - 1) {
      const nextIndex = current + 1;
      setCurrentVideoIndex(nextIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('Moving to next video, new index:', nextIndex);
    } else {
      console.log('Already at last video');
    }
  }, []);

  const goToPreviousVideo = useCallback(() => {
    const current = currentVideoIndexRef.current;
    console.log('goToPreviousVideo called, currentIndex:', current);
    if (current > 0) {
      const prevIndex = current - 1;
      setCurrentVideoIndex(prevIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('Moving to previous video, new index:', prevIndex);
    } else {
      console.log('Already at first video');
    }
  }, []);

  // Enhanced PanResponder for better swipe detection
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical swipes with sufficient movement
        const shouldRespond = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 20;
        console.log('Should respond to gesture:', shouldRespond, 'dy:', gestureState.dy, 'dx:', gestureState.dx);
        return shouldRespond;
      },
      onPanResponderGrant: () => {
        console.log('Pan responder granted');
        translateY.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Allow smooth movement during gesture
        translateY.setValue(gestureState.dy * 0.3);
      },
      onPanResponderRelease: (evt, gestureState) => {
        console.log('Pan released - dy:', gestureState.dy, 'vy:', gestureState.vy);
        
        // Reset transform
        translateY.setValue(0);
        
        const swipeThreshold = 50;
        const velocityThreshold = 0.3;
        
        // Check for swipe up (next video)
        if (gestureState.dy < -swipeThreshold || gestureState.vy < -velocityThreshold) {
          console.log('Detected swipe up');
          goToNextVideo();
        }
        // Check for swipe down (previous video)  
        else if (gestureState.dy > swipeThreshold || gestureState.vy > velocityThreshold) {
          console.log('Detected swipe down');
          goToPreviousVideo();
        } else {
          console.log('No significant swipe detected');
        }
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
    <>
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
    </>
  );
}

export default VideosScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000',
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
    paddingBottom: 80, // Reduced space - move text lower
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
