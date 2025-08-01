// React Native version of QuotesPage.tsx
import React, { useState, useEffect } from 'react';
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
import HapticFeedback from 'react-native-haptic-feedback';

interface Quote {
  id: string;
  text: string;
  author: string;
  reflection?: string;
  date: string;
}

const mockQuotes: Quote[] = [
  {
    id: '1',
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
    reflection: "How can you cultivate positive thoughts today?",
    date: new Date().toDateString()
  },
  {
    id: '2', 
    text: "In the depth of silence is the voice of God.",
    author: "Gurudev",
    reflection: "Take a moment to sit in silence and listen within.",
    date: new Date().toDateString()
  },
  {
    id: '3',
    text: "When you realize there is nothing lacking, the whole world belongs to you.",
    author: "Lao Tzu",
    reflection: "What abundance already exists in your life?",
    date: new Date().toDateString()
  }
];

export const QuotesPage = () => {
  const [quotes] = useState<Quote[]>(mockQuotes);
  const [likedQuotes, setLikedQuotes] = useState<Set<string>>(new Set());

  const handleLike = (quoteId: string) => {
    HapticFeedback.trigger('impactLight');
    const newLiked = new Set(likedQuotes);
    if (newLiked.has(quoteId)) {
      newLiked.delete(quoteId);
    } else {
      newLiked.add(quoteId);
    }
    setLikedQuotes(newLiked);
  };

  const handleShare = async (quote: Quote) => {
    const shareText = `"${quote.text}" - ${quote.author}\n\nShared from our Spiritual Wisdom app`;
    
    try {
      await Share.share({
        message: shareText,
        title: 'Daily Wisdom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Unable to share quote at this time.',
      });
    }
  };

  const shareApp = async () => {
    const shareText = "🙏 I found this beautiful spiritual app that shares daily wisdom and inspiration. Thought you might find it meaningful too!";
    
    try {
      await Share.share({
        message: shareText,
        title: 'Spiritual Wisdom App',
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
      <View style={styles.quoteCard}>
        <View style={styles.quoteHeader}>
          <Image
            source={require('@/assets/om-symbol.png')}
            style={styles.omIcon}
            resizeMode="contain"
          />
          <Text style={styles.date}>{quote.date}</Text>
        </View>

        <Text style={styles.quoteText}>"{quote.text}"</Text>
        <Text style={styles.author}>— {quote.author}</Text>

        {quote.reflection && (
          <View style={styles.reflectionContainer}>
            <Text style={styles.reflectionLabel}>Reflection:</Text>
            <Text style={styles.reflectionText}>{quote.reflection}</Text>
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
              color={isLiked ? '#FF6B35' : '#8E6A5B'} 
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {isLiked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(quote)}
          >
            <Icon name="share" size={20} color="#8E6A5B" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/om-symbol.png')}
          style={styles.headerIcon}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Daily Wisdom</Text>
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
        <TouchableOpacity style={styles.shareAppButton} onPress={shareApp}>
          <Icon name="share" size={20} color="#FEFCF8" />
          <Text style={styles.shareAppText}>Share this app with others</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F3',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#FEFCF8',
  },
  headerIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E6A5B',
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
    backgroundColor: '#FEFCF8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
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
    color: '#8E6A5B',
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#2D1810',
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
  },
  author: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 16,
  },
  reflectionContainer: {
    backgroundColor: '#F4E4C1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reflectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 14,
    color: '#5D4037',
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
    backgroundColor: '#F9F3E9',
  },
  likedButton: {
    backgroundColor: '#FFE5D9',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8E6A5B',
    fontWeight: '500',
  },
  likedText: {
    color: '#FF6B35',
  },
  shareSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FEFCF8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8D5B7',
  },
  shareAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  shareAppText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FEFCF8',
    fontWeight: '600',
  },
});
