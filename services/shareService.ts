import { Share, Platform } from 'react-native';
import { Quote } from '../contexts/QuotesContext';
import { Video } from '../contexts/VideosContext';
import { Event } from '../contexts/EventsContext';
import { env } from '@/config/env';

class ShareService {
  private get appName(): string {
    return env.appName || 'Siddhguru';
  }
  private get appStoreLink(): string {
    return env.appStoreLink || 'https://apps.apple.com/app/siddhguru/id6761345708';
  }
  private get playStoreLink(): string {
    return env.playStoreLink || 'https://play.google.com/store/apps/details?id=com.spiritualwisdom';
  }
  private get webAppLink(): string {
    return env.webAppLink || 'https://spiritualwisdom.app';
  }

  async shareQuote(quote: Quote): Promise<void> {
    try {
      let shareText = `"${quote.text}"\n— ${quote.author}\n\n`;

      // Add reflection if available
      if (quote.reflection) {
        shareText += `Reflection: ${quote.reflection}\n\n`;
      }

      // Add app download message
      shareText += `🪷 Find more to pause and reflect on in the ${this.appName} app.\n`;
      shareText += `📱 ${this.getDownloadLink()}`;

      await Share.share({
        title: 'Quote',
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
      const shareText = `🎥 "${video.title}"\n\n${youtubeUrl}\n\n🪷 Find more to watch and sit with in the ${this.appName} app.\n📱 ${this.getDownloadLink()}`;

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
      shareText += `🪷 Find more ways to show up and connect in the ${this.appName} app.\n`;
      shareText += `📱 ${this.getDownloadLink()}`;

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
      const shareText = `🪷 Find a gentle space for daily quotes, videos, and events, something to return to.\n\n📱 ${this.getDownloadLink()}`;

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

