
import { Share, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface Quote {
  id: string;
  text: string;
  author: string;
  reflection?: string;
}

interface Video {
  id: string;
  title: string;
  youtubeId: string;
}

class ShareService {
  private appName = 'Spiritual Wisdom';
  private appStoreLink = 'https://apps.apple.com/app/spiritual-wisdom';
  private playStoreLink = 'https://play.google.com/store/apps/details?id=com.spiritualwisdom';
  private webAppLink = 'https://spiritualwisdom.app';

  // Spiritual guru images for quote sharing (using proper asset URIs)
  private quoteImages = [
    'https://images.unsplash.com/photo-1593104547216-9a631d0d4eff?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop&crop=center'
  ];

  async shareQuote(quote: Quote, includeImage = true): Promise<void> {
    try {
      if (includeImage) {
        await this.shareQuoteWithImage(quote);
      } else {
        await this.shareQuoteText(quote);
      }
    } catch (error) {
      console.error('Share quote error:', error);
      // Fallback to text sharing
      await this.shareQuoteText(quote);
    }
  }

  private async shareQuoteWithImage(quote: Quote): Promise<void> {
    try {
      // Get mock image for the quote
      const imageUrl = this.getMockImageForQuote(quote.id);
      
      if (Platform.OS === 'web') {
        await this.shareWebQuoteWithImage(quote, imageUrl);
      } else {
        await this.shareMobileQuoteWithImage(quote, imageUrl);
      }
    } catch (error) {
      console.error('Error sharing quote with image:', error);
      throw error;
    }
  }

  private getMockImageForQuote(quoteId: string): string {
    // Use quote ID to consistently pick the same image for the same quote
    const index = parseInt(quoteId) % this.quoteImages.length;
    return this.quoteImages[index];
  }

  private async shareWebQuoteWithImage(quote: Quote, imageUrl: string): Promise<void> {
    // For web, open the image in a new tab and share the text
    window.open(imageUrl, '_blank');
    
    const shareText = this.buildQuoteShareText(quote);
    
    if (navigator.share) {
      await navigator.share({
        title: 'Spiritual Wisdom Quote',
        text: shareText,
        url: imageUrl,
      });
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      alert('Quote text copied to clipboard! Image opened in new tab.');
    }
  }

  private async shareMobileQuoteWithImage(quote: Quote, imageUrl: string): Promise<void> {
    try {
      // Download the image to local storage
      const fileName = `spiritual-quote-${quote.id}-${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      
      if (downloadResult.status !== 200) {
        throw new Error('Failed to download image');
      }

      // Create the message text (reflection + app download) - this will appear under the image
      const messageText = this.buildQuoteShareText(quote);

      // Use React Native Share with both URL and message for proper iMessage/WhatsApp display
      await Share.share({
        title: 'Spiritual Wisdom Quote',
        message: messageText,
        url: Platform.OS === 'ios' ? downloadResult.uri : undefined, // iOS handles URL better
        urls: Platform.OS === 'android' ? [downloadResult.uri] : undefined, // Android uses urls array
      });

      // Clean up temporary file after 10 seconds
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(downloadResult.uri, { idempotent: true });
        } catch (e) {
          console.log('Could not delete temp file:', e);
        }
      }, 10000);

    } catch (error) {
      console.error('Error sharing mobile quote with image:', error);
      // Fallback to text only
      await this.shareQuoteText(quote);
    }
  }

  private async shareQuoteText(quote: Quote): Promise<void> {
    const shareText = this.buildQuoteShareText(quote);
    
    await Share.share({
      title: 'Spiritual Wisdom Quote',
      message: shareText,
    });
  }

  private buildQuoteShareText(quote: Quote): string {
    let text = '';
    
    // Add reflection if available (this will appear under the image in messaging apps)
    if (quote.reflection) {
      text += `💭 ${quote.reflection}\n\n`;
    }
    
    // Add app download message 
    text += `🙏 Discover more spiritual wisdom and daily inspiration in the ${this.appName} app\n`;
    text += `📱 Download now: ${this.getDownloadLink()}`;
    
    return text;
  }

  async shareVideo(video: Video): Promise<void> {
    const youtubeUrl = `https://youtu.be/${video.youtubeId}`;
    const shareText = `🎥 "${video.title}"\n\n${youtubeUrl}\n\n🙏 Discover more spiritual videos in the ${this.appName} app\n📱 Download: ${this.getDownloadLink()}`;

    await Share.share({
      title: video.title,
      message: shareText,
    });
  }

  async shareApp(): Promise<void> {
    const shareText = `🙏 I found this beautiful spiritual app with daily wisdom, inspiring quotes, and sacred teachings. \n\nThought you might find it meaningful too!\n\n📱 Download ${this.appName}: ${this.getDownloadLink()}`;

    await Share.share({
      title: `Share ${this.appName}`,
      message: shareText,
    });
  }

  private getDownloadLink(): string {
    if (Platform.OS === 'ios') {
      return this.appStoreLink;
    } else if (Platform.OS === 'android') {
      return this.playStoreLink;
    } else {
      return this.webAppLink;
    }
  }
}

export const shareService = new ShareService();
