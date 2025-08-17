
import { Share, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { imageGenerationService } from './imageGenerationService';

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
  private appStoreLink = 'https://apps.apple.com/app/spiritual-wisdom'; // Replace with actual link
  private playStoreLink = 'https://play.google.com/store/apps/details?id=com.spiritualwisdom'; // Replace with actual link
  private webAppLink = 'https://spiritualwisdom.app'; // Replace with your actual web app link

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
      // Generate quote image
      const imageDataUrl = await imageGenerationService.generateQuoteImage({
        quote,
        includeReflection: !!quote.reflection,
        theme: 'gradient'
      });

      if (Platform.OS === 'web') {
        await this.shareWebQuoteWithImage(quote, imageDataUrl);
      } else {
        await this.shareMobileQuoteWithImage(quote, imageDataUrl);
      }
    } catch (error) {
      console.error('Error sharing quote with image:', error);
      throw error;
    }
  }

  private async shareWebQuoteWithImage(quote: Quote, imageDataUrl: string): Promise<void> {
    // For web, we'll create a downloadable image and share text
    const link = document.createElement('a');
    link.download = `spiritual-quote-${quote.id}.png`;
    link.href = imageDataUrl;
    link.click();

    // Also share text
    const shareText = this.buildQuoteShareText(quote);
    
    if (navigator.share) {
      await navigator.share({
        title: 'Spiritual Wisdom Quote',
        text: shareText,
      });
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      alert('Quote text copied to clipboard! Image downloaded separately.');
    }
  }

  private async shareMobileQuoteWithImage(quote: Quote, imageDataUrl: string): Promise<void> {
    try {
      // Save image to device temporarily
      const fileName = `spiritual-quote-${quote.id}-${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Convert data URL to file
      await FileSystem.writeAsStringAsync(fileUri, imageDataUrl.split(',')[1], {
        encoding: FileSystem.EncodingType.Base64,
      });

      const shareText = this.buildQuoteShareText(quote);

      // Use Expo Sharing for better image + text sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: shareText,
        });
      } else {
        // Fallback to React Native Share
        await Share.share({
          title: 'Spiritual Wisdom Quote',
          message: shareText,
          url: fileUri,
        });
      }

      // Clean up temporary file
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
        } catch (e) {
          console.log('Could not delete temp file:', e);
        }
      }, 5000);

    } catch (error) {
      console.error('Error sharing mobile quote with image:', error);
      throw error;
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
    let text = `"${quote.text}" - ${quote.author}\n\n`;
    
    if (quote.reflection) {
      text += `💭 ${quote.reflection}\n\n`;
    }
    
    text += `🙏 Find more wisdom & inspiration in the ${this.appName} app\n`;
    text += `📱 Download: ${this.getDownloadLink()}`;
    
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
