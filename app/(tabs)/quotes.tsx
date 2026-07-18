import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useQuotes, Quote } from '@/contexts/QuotesContext';
import { shareService } from '@/services/shareService';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';
import { styles } from '@/styles/quotes.styles';

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
          source={require('@/assets/images/app-main-icon.png')}
          style={styles.omQuoteLogo}
          resizeMode="contain"
        />
        <Text style={styles.date}>{formatDate(quote.dateAdded)}</Text>
      </View>

      {quote.imageUrl ? (
        <Image
          source={{ uri: quote.imageUrl }}
          style={styles.quoteImage}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.quoteText, SPIRITUAL_TYPOGRAPHY.quoteText]}>
          "{quote.text}"
        </Text>
      )}

      {!quote.imageUrl && (
        <Text style={[styles.author, SPIRITUAL_TYPOGRAPHY.author]}>
          — {quote.author}
        </Text>
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
        {/* Quotes List — header scrolls away with content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/app-main-icon.png')}
              style={styles.omHeaderLogo}
              resizeMode="contain"
            />
            <Text style={[styles.headerTitle, SPIRITUAL_TYPOGRAPHY.spiritualHeading]}>
              Daily Wisdom
            </Text>
            <Text style={styles.headerSubtitle}>Find peace in sacred teachings</Text>
          </View>
          <View style={styles.headerDivider}>
            <View style={styles.headerDividerLine} />
            <Text style={styles.headerDividerStar}>✦</Text>
            <View style={styles.headerDividerLine} />
          </View>

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
          <View style={styles.footerDivider}>
            <View style={styles.footerDividerLine} />
            <Text style={styles.footerDividerStar}>✦</Text>
            <View style={styles.footerDividerLine} />
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
