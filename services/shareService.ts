import { Share, Platform, Image } from 'react-native';
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

  // Array of spiritual guru images - using bundled local assets and Object Storage URLs
  private guruImages = {
    '1': 'https://storage.googleapis.com/replit-objstore-74e3c4b0-bc72-4d55-9558-dc44b7baae09/guru-images/guru-image-2.jpg', // First quote uses guru-image-2
    '2': 'https://storage.googleapis.com/replit-objstore-74e3c4b0-bc72-4d55-9558-dc44b7baae09/guru-images/guru-image-4.jpg', // Second quote uses guru-image-4  
    '3': 'https://storage.googleapis.com/replit-objstore-74e3c4b0-bc72-4d55-9558-dc44b7baae09/guru-images/guru-image3.jpg', // Third quote uses guru-image3 (note: no dash)
  };

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
      if (Platform.OS === 'web') {
        await this.shareWebQuoteWithImage(quote);
      } else {
        await this.shareMobileQuoteWithImage(quote);
      }
    } catch (error) {
      console.error('Error sharing quote with image:', error);
      throw error;
    }
  }

  private getGuruImageForQuote(quoteId: string): any {
    // Use the quote ID directly to get the corresponding guru image
    const guruImage = this.guruImages[quoteId];
    return guruImage || require('../assets/images/om-symbol.png'); // Default to om-symbol if no mapping
  }

  private async shareWebQuoteWithImage(quote: Quote): Promise<void> {
    // For web, we'll share just the text since local images are harder to handle
    const shareText = this.buildQuoteShareText(quote);

    if (navigator.share) {
      await navigator.share({
        title: 'Spiritual Wisdom Quote',
        text: shareText,
      });
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      alert('Quote text copied to clipboard!');
    }
  }

  private async shareMobileQuoteWithImage(quote: Quote): Promise<void> {
    try {
      // Get guru image for this specific quote
      const imageAsset = this.getGuruImageForQuote(quote.id);

      let imageUri: string;

      if (typeof imageAsset === 'string') {
        // It's a URL from Object Storage - download it first
        try {
          const response = await fetch(imageAsset);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          
          const blob = await response.blob();
          const base64 = await this.blobToBase64(blob);
          
          // Save to temporary file
          const fileName = `spiritual_image_${Date.now()}.jpg`;
          const fileUri = FileSystem.documentDirectory + fileName;
          
          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          imageUri = fileUri;
        } catch (downloadError) {
          console.warn('Failed to download remote image, falling back to text sharing:', downloadError);
          await this.shareQuoteText(quote);
          return;
        }
      } else {
        // It's a local asset, resolve it using Image.resolveAssetSource
        try {
          const resolvedAsset = Image.resolveAssetSource(imageAsset);
          imageUri = resolvedAsset.uri;
        } catch (resolveError) {
          console.warn('Could not resolve asset source, falling back to text sharing:', resolveError);
          await this.shareQuoteText(quote);
          return;
        }
      }

      // Create the message text (reflection + app download)
      const messageText = this.buildQuoteShareText(quote);

      // Use Expo Sharing for better image sharing support
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(imageUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Share Spiritual Wisdom',
          UTI: 'public.jpeg',
        });
      } else {
        // Fallback to basic sharing without image
        await Share.share({
          title: 'Spiritual Wisdom Quote',
          message: messageText,
        });
      }

    } catch (error) {
      console.error('Error sharing mobile quote with image:', error);
      // Fallback to text only
      await this.shareQuoteText(quote);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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

  private buildCompleteQuoteShareText(quote: Quote): string {
    let text = `"${quote.text}"\n— ${quote.author}\n\n`;

    // Add reflection if available
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