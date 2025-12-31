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
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';
import { useVideos, type Video } from '@/contexts/VideosContext';
import { shareService } from '@/services/shareService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function VideosScreen() {
  const { videos, loading } = useVideos();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideoIndexRef = useRef(0);
  const translateY = useRef(new Animated.Value(0)).current;

  const currentVideo = videos[currentVideoIndex];

  // Keep ref in sync with state
  useEffect(() => {
    currentVideoIndexRef.current = currentVideoIndex;
  }, [currentVideoIndex]);

  // Extract and clean YouTube video ID (handles both ID and full URLs)
  const extractYouTubeId = (input: string): string => {
    if (!input) return '';
    
    // If it's already just an ID (11 characters, alphanumeric + hyphens/underscores)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
      return input.trim();
    }
    
    // Try to extract ID from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If no pattern matches, return the input trimmed (might be invalid)
    return input.trim();
  };

  // Create embedded YouTube player HTML
  const createYouTubeHTML = (videoIdInput: string) => {
    // Clean and extract the YouTube ID
    const cleanVideoId = extractYouTubeId(videoIdInput);
    
    if (!cleanVideoId || cleanVideoId.length !== 11) {
      console.error('Invalid YouTube video ID:', videoIdInput);
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 20px;
                background: #000;
                color: #fff;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: Arial, sans-serif;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div>Invalid video ID. Please check the video URL.</div>
          </body>
        </html>
      `;
    }
    
    // Full screen dimensions for reel-style experience
    const videoWidth = Math.round(screenWidth);
    const videoHeight = Math.round(screenHeight);
    
    // YouTube embed URL with autoplay and loop
    // Note: loop=1 requires playlist parameter with the same video ID
    // The baseUrl in WebView source helps establish proper origin
    const embedUrl = `https://www.youtube-nocookie.com/embed/${cleanVideoId}?autoplay=1&playsinline=1&rel=0&loop=1&playlist=${cleanVideoId}`;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              width: 100%;
              height: 100%;
              overflow: hidden;
              background: #000;
              position: fixed;
            }
            #player {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
            iframe {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border: 0;
            }
          </style>
        </head>
        <body>
          <div id="player">
            <iframe 
              width="100%" 
              height="100%" 
              src="${embedUrl}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen>
            </iframe>
          </div>
        </body>
      </html>
    `;
  };

  // Navigation functions using useCallback to prevent stale closures
  const goToNextVideo = useCallback(() => {
    const current = currentVideoIndexRef.current;
    if (current < videos.length - 1 && videos.length > 0) {
      const nextIndex = current + 1;
      setCurrentVideoIndex(nextIndex);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [videos.length]);

  const goToPreviousVideo = useCallback(() => {
    const current = currentVideoIndexRef.current;
    if (current > 0) {
      const prevIndex = current - 1;
      setCurrentVideoIndex(prevIndex);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, []);

  // Enhanced PanResponder for swipe detection
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical swipes with sufficient movement
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 20;
      },
      onPanResponderGrant: () => {
        translateY.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Allow smooth movement during gesture
        translateY.setValue(gestureState.dy * 0.3);
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Reset transform
        translateY.setValue(0);

        const swipeThreshold = 50;
        const velocityThreshold = 0.3;

        // Check for swipe up (next video)
        if (gestureState.dy < -swipeThreshold || gestureState.vy < -velocityThreshold) {
          goToNextVideo();
        }
        // Check for swipe down (previous video)  
        else if (gestureState.dy > swipeThreshold || gestureState.vy > velocityThreshold) {
          goToPreviousVideo();
        }
      },
    })
  ).current;

  const openInYouTube = async (video: Video) => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;

      // Check if we're on web platform
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.open) {
          window.open(youtubeUrl, '_blank');
          return;
        }
      }

      // Native environment - open in external browser
      const canOpen = await Linking.canOpenURL(youtubeUrl);
      if (canOpen) {
        await Linking.openURL(youtubeUrl);
      }
    } catch (error) {
      console.error('Error opening video:', error);
    }
  };

  const shareVideo = async (video: Video) => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await shareService.shareVideo(video);
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={SPIRITUAL_GRADIENTS.peace} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={SPIRITUAL_COLORS.primary} />
              <Text style={styles.loadingText}>Loading videos...</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={SPIRITUAL_GRADIENTS.peace} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.emptyContainer}>
              <Ionicons name="play-circle-outline" size={64} color={SPIRITUAL_COLORS.textMuted} />
              <Text style={styles.emptyText}>No videos available</Text>
              <Text style={styles.emptySubtext}>Check back later for spiritual content</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

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
        {/* Video Player Area - Full Screen Reel Style */}
        <View style={styles.videoPlayerContainer}>
          <WebView
            key={`${currentVideo.youtubeId}-${currentVideoIndex}`} // Force re-render when video changes
            source={{ 
              html: createYouTubeHTML(currentVideo.youtubeId),
              baseUrl: 'https://www.youtube-nocookie.com'
            }}
            style={styles.webView}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={false}
            bounces={false}
            scrollEnabled={false}
            originWhitelist={['*']}
            allowsFullscreenVideo={true}
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView HTTP error: ', nativeEvent);
            }}
            onLoadEnd={() => {
              console.log('WebView loaded for video:', currentVideo.youtubeId);
            }}
          />
        </View>

            {/* Side Action Buttons */}
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
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.actionButtonText}>Share</Text>
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
                <Text style={styles.actionButtonText}>YouTube</Text>
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
            <Text style={styles.videoCounter}>
              {currentVideoIndex + 1} / {videos.length}
            </Text>
          </View>
        </View>

        {/* Swipe Hint (for first-time users) */}
        {currentVideoIndex === 0 && videos.length > 1 && (
          <View style={styles.swipeHint}>
            <Ionicons name="chevron-up" size={24} color="rgba(255,255,255,0.6)" />
            <Text style={styles.swipeHintText}>Swipe up for next video</Text>
          </View>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000',
  },
  webView: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000',
  },
  sideActionButtons: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
  },
  sideActionButton: {
    marginBottom: 20,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  videoInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
  },
  videoDetails: {
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  videoCounter: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.7,
  },
  swipeHintText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 8,
  },
});
