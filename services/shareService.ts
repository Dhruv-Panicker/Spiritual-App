
import { Share, Platform, Image } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';

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

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location?: string;
  type: 'meditation' | 'teaching' | 'celebration' | 'retreat';
}

class ShareService {
  private appName = 'Spiritual Wisdom';
  private appStoreLink = 'https://apps.apple.com/app/spiritual-wisdom';
  private playStoreLink = 'https://play.google.com/store/apps/details?id=com.spiritualwisdom';
  private webAppLink = 'https://spiritualwisdom.app';

  // Local asset mappings - these will be copied to file system on init
  private localAssets = {
    '1': require('../guru-images/guru-image-2.jpg'),
    '2': require('../guru-images/guru-image-4.jpg'), 
    '3': require('../guru-images/guru-image3.jpg'),
    'default': require('../assets/images/om-symbol.png')
  };

  // File URIs after copying to document directory
  private shareableImagePaths: { [key: string]: string } = {};
  private initialized = false;

  async initializeShareableAssets(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('Initializing shareable assets...');
      
      // Copy each asset to document directory
      for (const [key, assetRequire] of Object.entries(this.localAssets)) {
        try {
          // Load the asset
          const asset = Asset.fromModule(assetRequire);
          await asset.downloadAsync();
          
          // Define target path in document directory
          const fileName = `guru_image_${key}.jpg`;
          const targetPath = FileSystem.documentDirectory + fileName;
          
          // Copy asset to document directory
          await FileSystem.copyAsync({
            from: asset.localUri || asset.uri,
            to: targetPath,
          });
          
          // Store the shareable path
          this.shareableImagePaths[key] = targetPath;
          console.log(`✓ Copied ${key} to ${targetPath}`);
          
        } catch (assetError) {
          console.warn(`Failed to copy asset ${key}:`, assetError);
        }
      }
      
      this.initialized = true;
      console.log('✓ All shareable assets initialized');
      
    } catch (error) {
      console.error('Failed to initialize shareable assets:', error);
    }
  }

  async shareQuote(quote: Quote, includeImage = true): Promise<void> {
    try {
      // Ensure assets are initialized
      await this.initializeShareableAssets();
      
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

  private getGuruImagePath(quoteId: string): string {
    // Get the shareable file path for this quote
    const imagePath = this.shareableImagePaths[quoteId] || this.shareableImagePaths['default'];
    return imagePath;
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
      // Get the pre-copied image path
      const imagePath = this.getGuruImagePath(quote.id);
      
      if (!imagePath) {
        console.warn('No image path found, falling back to text sharing');
        await this.shareQuoteText(quote);
        return;
      }

      // Verify the file exists
      const fileInfo = await FileSystem.getInfoAsync(imagePath);
      if (!fileInfo.exists) {
        console.warn('Image file does not exist, falling back to text sharing');
        await this.shareQuoteText(quote);
        return;
      }

      console.log(`Sharing image from: ${imagePath}`);

      // Create the message text (reflection + app download)
      const messageText = this.buildQuoteShareText(quote);

      // Use React Native Share API to combine image and text message
      await Share.share({
        title: 'Spiritual Wisdom Quote',
        message: messageText,
        url: `file://${imagePath}`,
      });
      
      console.log('✓ Successfully shared image with message text');

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
    let text = `"${quote.text}"\n— ${quote.author}\n\n`;

    // Add reflection if available
    if (quote.reflection) {
      text += `💭 Reflection: ${quote.reflection}\n\n`;
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
      text += `💭 Reflection: ${quote.reflection}\n\n`;
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

  async shareEvent(event: Event): Promise<void> {
    const eventDate = new Date(event.date).toLocaleDateString();
    
    let shareText = `📅 ${event.title}\n\n`;
    shareText += `🗓️ Date: ${eventDate}\n`;
    shareText += `🕐 Time: ${event.time}\n`;
    
    if (event.location) {
      shareText += `📍 Location: ${event.location}\n`;
    }
    
    shareText += `\n📝 ${event.description}\n\n`;
    shareText += `🙏 Stay connected with more spiritual events and teachings in the ${this.appName} app\n`;
    shareText += `📱 Download now: ${this.getDownloadLink()}`;

    await Share.share({
      title: event.title,
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
