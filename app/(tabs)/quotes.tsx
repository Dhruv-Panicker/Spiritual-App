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

// mapping of colors to categories
const TAG_COLORS: { bg: string; text: string }[] = [
  { bg: '#c17f3c', text: '#fff' },
  { bg: '#a67c52', text: '#fff' },
  { bg: '#a0522d', text: '#fff' },
  { bg: '#b07d62', text: '#fff' },
  { bg: '#b5651d', text: '#fff' },
  { bg: '#8b6914', text: '#fff' },
  { bg: '#9a7b4f', text: '#fff' },
  { bg: '#5c4033', text: '#fff' },
];

function getTagColor(category: string): { bg: string; text: string } {
  const normalized = (category || 'general').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    //value to signed 32 bit integer
    hash |= 0;
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

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

      {quote.category && (() => {
        const { bg, text } = getTagColor(quote.category);
        return (
          <View style={[styles.categoryBadge, { backgroundColor: bg }]}>
            <Text style={[styles.categoryText, { color: text }]}>{quote.category}</Text>
          </View>
        );
      })()}


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
            source={require('@/assets/images/app-main-icon.png')}
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
