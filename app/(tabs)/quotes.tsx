import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useQuotes, Quote } from '@/contexts/QuotesContext';
import { shareService } from '@/services/shareService';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';

const QuoteCard: React.FC<{ quote: Quote }> = ({ quote }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await shareService.shareQuote(quote);
    } catch (error) {
      console.error('Error sharing quote:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Today';
    }
  };

  return (
    <View style={styles.quoteCard}>
      <View style={styles.quoteHeader}>
        <Image
          source={require('@/assets/images/om_logo_transparent.png')}
          style={styles.omQuoteLogo}
          resizeMode="contain"
        />
        <Text style={styles.date}>{formatDate(quote.dateAdded)}</Text>
      </View>

      <Text style={[styles.quoteText, SPIRITUAL_TYPOGRAPHY.quoteText]}>
        "{quote.text}"
      </Text>
      
      <Text style={[styles.author, SPIRITUAL_TYPOGRAPHY.author]}>
        — {quote.author}
      </Text>

      {quote.category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{quote.category}</Text>
        </View>
      )}

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
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isLiked ? 'heart' : 'heart-outline'} 
            size={20} 
            color={isLiked ? SPIRITUAL_COLORS.primary : SPIRITUAL_COLORS.textMuted} 
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {isLiked ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="share-outline" 
            size={20} 
            color={SPIRITUAL_COLORS.textMuted} 
          />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function QuotesScreen() {
  const { quotes, loading } = useQuotes();

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={SPIRITUAL_GRADIENTS.peace} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={SPIRITUAL_COLORS.primary} />
            <Text style={styles.loadingText}>Loading wisdom...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={SPIRITUAL_GRADIENTS.peace} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/om_logo_transparent.png')}
            style={styles.omHeaderLogo}
            resizeMode="contain"
          />
          <Text style={[styles.headerTitle, SPIRITUAL_TYPOGRAPHY.spiritualHeading]}>
            Daily Wisdom
          </Text>
          <Text style={styles.headerSubtitle}>Find peace in sacred teachings</Text>
        </View>

        {/* Quotes List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {quotes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color={SPIRITUAL_COLORS.textMuted} />
              <Text style={styles.emptyText}>No quotes available</Text>
              <Text style={styles.emptySubtext}>Check back later for new wisdom</Text>
            </View>
          ) : (
            quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))
          )}
        </ScrollView>
      </LinearGradient>
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
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  omHeaderLogo: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 4,
    textAlign: 'center',
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
    paddingTop: 16,
    paddingBottom: 100, // Space for tab bar
  },
  quoteCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...SPIRITUAL_SHADOWS.card,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  omQuoteLogo: {
    width: 32,
    height: 32,
  },
  date: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
  },
  quoteText: {
    marginBottom: 12,
  },
  author: {
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: SPIRITUAL_COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
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
    justifyContent: 'flex-start',
    gap: 12,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
});
