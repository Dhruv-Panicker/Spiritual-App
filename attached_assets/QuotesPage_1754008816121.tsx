import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import omSymbol from '@/assets/om-symbol.png';

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
  const { toast } = useToast();

  const handleLike = (quoteId: string) => {
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
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Wisdom',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Quote Copied",
        description: "Quote has been copied to your clipboard."
      });
    }
  };

  const shareApp = async () => {
    const shareText = "🙏 I found this beautiful spiritual app that shares daily wisdom and inspiration. Thought you might find it meaningful too!";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Spiritual Wisdom App',
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
          <img 
            src={omSymbol} 
            alt="Om Symbol" 
            className="w-8 h-8 mx-auto mb-2 sacred-pulse"
          />
          <h1 className="spiritual-heading text-primary mb-2">Daily Wisdom</h1>
          <p className="text-muted-foreground">Spiritual guidance for your journey</p>
        </div>

        <div className="space-y-6">
          {quotes.map((quote, index) => (
            <Card 
              key={quote.id} 
              className="quote-card animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                <div className="absolute top-4 right-4 opacity-10">
                  <img src={omSymbol} alt="" className="w-12 h-12" />
                </div>
                
                <div className="relative z-10">
                  <blockquote className="quote-text mb-4">
                    "{quote.text}"
                  </blockquote>
                  
                  <div className="text-right mb-4">
                    <cite className="text-primary font-medium not-italic">
                      — {quote.author}
                    </cite>
                  </div>
                  
                  {quote.reflection && (
                    <div className="bg-accent/50 rounded-lg p-4 mb-4">
                      <p className="text-sm italic text-accent-foreground">
                        Reflection: {quote.reflection}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(quote.id)}
                        className="sacred-transition"
                      >
                        <Heart 
                          className={`w-4 h-4 mr-1 ${
                            likedQuotes.has(quote.id) 
                              ? 'fill-spiritual-red text-spiritual-red' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                        {likedQuotes.has(quote.id) ? 'Loved' : 'Love'}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(quote)}
                        className="sacred-transition"
                      >
                        <Share className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                    
                    <span className="text-xs text-muted-foreground">
                      {quote.date}
                    </span>
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
              Spread the Light
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