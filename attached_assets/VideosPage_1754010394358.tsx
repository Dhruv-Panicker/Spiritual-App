import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Share, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeId: string;
  duration: string;
  description: string;
}

const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Morning Meditation Practice',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '10:30',
    description: 'Start your day with peace and mindfulness'
  },
  {
    id: '2', 
    title: 'The Power of Gratitude',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '15:45',
    description: 'Transform your life through grateful awareness'
  },
  {
    id: '3',
    title: 'Finding Inner Peace',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '20:15',
    description: 'Discover the sanctuary within your own heart'
  }
];

export const VideosPage = () => {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const handlePlayVideo = (video: Video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
  };

  const handleShareVideo = async (video: Video) => {
    const shareText = `🎥 ${video.title}\n\n${video.description}\n\nWatch on our Spiritual Wisdom app`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: shareText,
          url: `https://youtube.com/watch?v=${video.youtubeId}`
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n\nhttps://youtube.com/watch?v=${video.youtubeId}`);
      toast({
        title: "Video Link Copied",
        description: "Video link has been copied to your clipboard."
      });
    }
  };

  const openInYouTube = (video: Video) => {
    window.open(`https://youtube.com/watch?v=${video.youtubeId}`, '_blank');
  };

  const shareApp = async () => {
    const shareText = "🙏 Check out these inspiring spiritual videos! This app has been such a source of peace and wisdom for me.";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Spiritual Wisdom Videos',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
      toast({
        title: "App Link Copied",
        description: "App link has been copied to your clipboard."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-peace pb-20">
      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="spiritual-heading text-primary mb-2">Sacred Videos</h1>
          <p className="text-muted-foreground">Wisdom teachings and guided practices</p>
        </div>

        {currentVideo && isPlaying && (
          <Card className="mb-6 overflow-hidden divine-shadow">
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1`}
                title={currentVideo.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{currentVideo.title}</h3>
              <p className="text-sm text-muted-foreground">{currentVideo.description}</p>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {mockVideos.map((video, index) => (
            <Card 
              key={video.id} 
              className="overflow-hidden peaceful-shadow animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Button
                      size="lg"
                      onClick={() => handlePlayVideo(video)}
                      className="rounded-full w-16 h-16 p-0 sacred-transition hover:scale-110"
                    >
                      <Play className="w-6 h-6 ml-1" />
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {video.duration}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{video.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShareVideo(video)}
                        className="sacred-transition"
                      >
                        <Share className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openInYouTube(video)}
                        className="sacred-transition"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        YouTube
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Share App CTA */}
        <Card className="mt-8 peaceful-shadow bg-gradient-divine">
          <div className="p-6 text-center">
            <h3 className="spiritual-heading text-primary-foreground mb-2">
              Share the Wisdom
            </h3>
            <p className="text-primary-foreground/90 mb-4">
              Share this app with someone who might find it meaningful
            </p>
            <Button 
              variant="secondary"
              onClick={shareApp}
              className="sacred-transition"
            >
              <Share className="w-4 h-4 mr-2" />
              Share App
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};