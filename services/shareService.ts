import { Share, Platform } from 'react-native';
import { Quote } from '../contexts/QuotesContext';
import { Video } from '../contexts/VideosContext';
import { Event } from '../contexts/EventsContext';

class ShareService {
  private appName = 'Spiritual Wisdom';
  private appStoreLink = 'https://apps.apple.com/app/spiritual-wisdom';
  private playStoreLink = 'https://play.google.com/store/apps/details?id=com.spiritualwisdom';
  private webAppLink = 'https://spiritualwisdom.app';

  async shareQuote(quote: Quote): Promise<void> {
    try {
      let shareText = `"${quote.text}"\n— ${quote.author}\n\n`;

      // Add reflection if available
      if (quote.reflection) {
        shareText += `💭 Reflection: ${quote.reflection}\n\n`;
      }

      // Add app download message
      shareText += `🙏 Discover more spiritual wisdom and daily inspiration in the ${this.appName} app\n`;
      shareText += `📱 Download now: ${this.getDownloadLink()}`;

      await Share.share({
        title: 'Spiritual Wisdom Quote',
        message: shareText,
      });
    } catch (error) {
      console.error('Error sharing quote:', error);
      throw error;
    }
  }

  async shareVideo(video: Video): Promise<void> {
    try {
      const youtubeUrl = `https://youtu.be/${video.youtubeId}`;
      const shareText = `🎥 "${video.title}"\n\n${youtubeUrl}\n\n🙏 Discover more spiritual videos in the ${this.appName} app\n📱 Download: ${this.getDownloadLink()}`;

      await Share.share({
        title: video.title,
        message: shareText,
      });
    } catch (error) {
      console.error('Error sharing video:', error);
      throw error;
    }
  }

  async shareEvent(event: Event): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Error sharing event:', error);
      throw error;
    }
  }

  async shareApp(): Promise<void> {
    try {
      const shareText = `🙏 I found this beautiful spiritual app with daily wisdom, inspiring quotes, and sacred teachings.\n\nThought you might find it meaningful too!\n\n📱 Download ${this.appName}: ${this.getDownloadLink()}`;

      await Share.share({
        title: `Share ${this.appName}`,
        message: shareText,
      });
    } catch (error) {
      console.error('Error sharing app:', error);
      throw error;
    }
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

