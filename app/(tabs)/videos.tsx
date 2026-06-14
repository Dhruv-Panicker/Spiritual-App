import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
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
import { useFocusEffect } from 'expo-router';

import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS } from '@/constants/SpiritualColors';
import { styles } from '@/styles/videos.styles';
import { useVideos, type Video } from '@/contexts/VideosContext';
import { shareService } from '@/services/shareService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function VideosScreen() {
  const { videos, loading, liveStatus } = useVideos();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideoIndexRef = useRef(0);
  const translateY = useRef(new Animated.Value(0)).current;
  // Bumped each time the tab regains focus to force the player to remount and
  // auto-resume (the YouTube iframe only autoplays on load, not on revisit).
  const [focusKey, setFocusKey] = useState(0);
  const isInitialFocus = useRef(true);

  // Live slot occupies index 0 when the channel is currently broadcasting.
  const liveAvailable = liveStatus.isLive && !!liveStatus.liveVideoId;
  const totalSlots = (liveAvailable ? 1 : 0) + videos.length;
  const isLiveSlot = liveAvailable && currentVideoIndex === 0;
  const regularVideoIndex = liveAvailable ? currentVideoIndex - 1 : currentVideoIndex;
  const currentVideo = !isLiveSlot ? videos[regularVideoIndex] : undefined;

  // Keep ref in sync with state
  useEffect(() => {
    currentVideoIndexRef.current = currentVideoIndex;
  }, [currentVideoIndex]);

  // Clamp the index if the total slot count shrinks (e.g. live stream ends).
  useEffect(() => {
    if (totalSlots > 0 && currentVideoIndex >= totalSlots) {
      setCurrentVideoIndex(totalSlots - 1);
    }
  }, [totalSlots, currentVideoIndex]);

  // When returning to the videos tab, remount the player so the current reel
  // autoplays again. Skip the very first focus so the initial load isn't doubled.
  useFocusEffect(
    useCallback(() => {
      if (isInitialFocus.current) {
        isInitialFocus.current = false;
        return;
      }
      setFocusKey((k) => k + 1);
    }, [])
  );

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
    const embedUrl = `https://www.youtube-nocookie.com/embed/${cleanVideoId}?autoplay=1&playsinline=1&rel=0&loop=1&playlist=${cleanVideoId}&controls=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1`;
    
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

  // Landscape 16:9 embed for the live stream slot. Controls stay visible so the
  // user can adjust volume / go fullscreen on the actual broadcast.
  const createLiveStreamHTML = (videoId: string) => {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body {
              width: 100vw;
              height: 100vh;
              background: #000;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .wrapper {
              width: 100vw;
              height: 56.25vw;
              max-height: 100vh;
            }
            iframe { width: 100%; height: 100%; border: 0; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <iframe src="${embedUrl}"
              frameborder="0"
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
              allowfullscreen></iframe>
          </div>
        </body>
      </html>
    `;
  };

  const openLiveChannel = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const channelUrl = liveStatus.channelUrl || `https://www.youtube.com/watch?v=${liveStatus.liveVideoId}`;
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.open) {
        window.open(channelUrl, '_blank');
        return;
      }
      const canOpen = await Linking.canOpenURL(channelUrl);
      if (canOpen) await Linking.openURL(channelUrl);
    } catch (error) {
      console.error('Error opening live channel:', error);
    }
  };

  // Navigation functions using useCallback to prevent stale closures
  const goToNextVideo = useCallback(() => {
    const current = currentVideoIndexRef.current;
    if (current < totalSlots - 1 && totalSlots > 0) {
      const nextIndex = current + 1;
      setCurrentVideoIndex(nextIndex);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [totalSlots]);

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

  if (totalSlots === 0) {
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
        {/* Live badge - top left, above the video */}
        {isLiveSlot && (
          <View style={styles.liveTopBadge}>
            <View style={styles.liveBadgeDot} />
            <Text style={styles.liveBadgeText}>LIVE NOW</Text>
          </View>
        )}

        {/* Video Player Area - Full Screen Reel Style (or landscape live stream) */}
        <View style={styles.videoPlayerContainer}>
          <WebView
            key={`${isLiveSlot ? `live-${liveStatus.liveVideoId}` : `${currentVideo!.youtubeId}-${currentVideoIndex}`}-${focusKey}`}
            source={{
              html: isLiveSlot
                ? createLiveStreamHTML(liveStatus.liveVideoId!)
                : createYouTubeHTML(currentVideo!.youtubeId),
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
              console.log('WebView loaded:', isLiveSlot ? `live-${liveStatus.liveVideoId}` : currentVideo?.youtubeId);
            }}
          />
        </View>

            {/* Side Action Buttons */}
            <View style={styles.sideActionButtons}>
              {!isLiveSlot && (
                <TouchableOpacity
                  style={styles.sideActionButton}
                  onPress={() => shareVideo(currentVideo!)}
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
              )}

              <TouchableOpacity
                style={styles.sideActionButton}
                onPress={() => (isLiveSlot ? openLiveChannel() : openInYouTube(currentVideo!))}
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
            {isLiveSlot ? (
              <>
                {!!liveStatus.liveTitle && (
                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {liveStatus.liveTitle}
                  </Text>
                )}
                <Text style={styles.videoDescription} numberOfLines={2}>
                  Tap the YouTube icon to watch on the channel
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {currentVideo!.title}
                </Text>
                <Text style={styles.videoDescription} numberOfLines={2}>
                  {currentVideo!.description}
                </Text>
                <Text style={styles.videoCounter}>
                  {regularVideoIndex + 1} / {videos.length}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Swipe Hint (for first-time users) */}
        {currentVideoIndex === 0 && totalSlots > 1 && (
          <View style={styles.swipeHint}>
            <Ionicons name="chevron-up" size={24} color="rgba(255,255,255,0.6)" />
            <Text style={styles.swipeHintText}>
              {isLiveSlot ? 'Swipe up for videos' : 'Swipe up for next video'}
            </Text>
          </View>
        )}
      </Animated.View>
    </>
  );
}
