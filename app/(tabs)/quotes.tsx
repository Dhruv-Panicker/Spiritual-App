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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';
import { useQuotes, Quote } from '@/contexts/QuotesContext';

export default function QuotesScreen() {
  const { quotes } = useQuotes();
  const [likedQuotes, setLikedQuotes] = useState<Set<string>>(new Set());

  const handleLike = (quoteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newLiked = new Set(likedQuotes);
    if (newLiked.has(quoteId)) {
      newLiked.delete(quoteId);
    } else {
      newLiked.add(quoteId);
    }
    setLikedQuotes(newLiked);
  };

  const handleShare = async (quote: Quote) => {
    try {
      const { shareService } = await import('../../services/shareService');
      await shareService.shareQuote(quote, true); // true = include image
      
      Toast.show({
        type: 'success',
        text1: 'Quote Shared! 🙏',
        text2: 'Image with reflection and app link shared',
      });
    } catch (error) {
      console.error('Share error:', error);
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Unable to share quote at this time.',
      });
    }
  };

  const shareApp = async () => {
    try {
      const { shareService } = await import('../../services/shareService');
      await shareService.shareApp();
      
      Toast.show({
        type: 'success',
        text1: 'App Shared! 🙏',
        text2: 'Help spread the spiritual wisdom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Unable to share app at this time.',
      });
    }
  };

  const QuoteCard = ({ quote }: { quote: Quote }) => {
    const isLiked = likedQuotes.has(quote.id);

    return (
      <View style={[styles.quoteCard, SPIRITUAL_SHADOWS.card]}>
        <View style={styles.quoteHeader}>
          <Image
            source={require('@/assets/images/om-symbol.png')}
            style={styles.omIcon}
            resizeMode="contain"
          />
          <Text style={styles.date}>{quote.date}</Text>
        </View>

        <Text style={[styles.quoteText, SPIRITUAL_TYPOGRAPHY.quoteText]}>
          "{quote.text}"
        </Text>
        <Text style={[styles.author, SPIRITUAL_TYPOGRAPHY.author]}>
          — {quote.author}
        </Text>

        {quote.reflection && (
          <View style={styles.reflectionContainer}>
            <Text style={styles.reflectionLabel}>Reflection:</Text>
            <Text style={[styles.reflectionText, SPIRITUAL_TYPOGRAPHY.reflection]}>
              {quote.reflection}
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, isLiked && styles.likedButton]}
            onPress={() => handleLike(quote.id)}
          >
            <Icon 
              name={isLiked ? 'favorite' : 'favorite-border'} 
              size={20} 
              color={isLiked ? SPIRITUAL_COLORS.primary : SPIRITUAL_COLORS.textMuted} 
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {isLiked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(quote)}
          >
            <Icon name="share" size={20} color={SPIRITUAL_COLORS.textMuted} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={SPIRITUAL_GRADIENTS.peace as any}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/om-symbol.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
            <Text style={[styles.headerTitle, SPIRITUAL_TYPOGRAPHY.spiritualHeading]}>
              Daily Wisdom
            </Text>
            <Text style={styles.headerSubtitle}>Find peace in sacred teachings</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </ScrollView>

          <View style={styles.shareSection}>
            <LinearGradient
              colors={SPIRITUAL_GRADIENTS.divine as any}
              style={styles.shareAppButton}
            >
              <TouchableOpacity 
                style={styles.shareAppButtonInner} 
                onPress={shareApp}
              >
                <Icon name="share" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
                <Text style={styles.shareAppText}>Share this app with others</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const { width } = Dimensions.get('window');

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
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
  },
  headerIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  quoteCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  omIcon: {
    width: 24,
    height: 24,
  },
  date: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
  },
  quoteText: {
    marginBottom: 12,
  },
  author: {
    marginBottom: 16,
  },
  reflectionContainer: {
    backgroundColor: SPIRITUAL_COLORS.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reflectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: SPIRITUAL_COLORS.input,
  },
  likedButton: {
    backgroundColor: '#FFE5D9',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    fontWeight: '500',  
  },
  likedText: {
    color: SPIRITUAL_COLORS.primary,
  },
  shareSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  shareAppButton: {
    borderRadius: 12,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  shareAppButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  shareAppText: {
    marginLeft: 8,
    fontSize: 16,
    color: SPIRITUAL_COLORS.primaryForeground,
    fontWeight: '600',
  },
});

// Export as default for Expo Router
export { QuotesScreen };