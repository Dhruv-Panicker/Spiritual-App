import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import gurudevHero from '@/assets/gurudev-hero.jpg';
import omSymbol from '@/assets/om-symbol.png';

export const GurudevPage = () => {
  const { toast } = useToast();

  const shareApp = async () => {
    const shareText = "🙏 I've been inspired by the teachings shared in this beautiful spiritual app. Thought you might find it meaningful too!";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meet Our Gurudev',
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
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <img 
          src={gurudevHero} 
          alt="Gurudev" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="text-center">
            <img 
              src={omSymbol} 
              alt="Om Symbol" 
              className="w-12 h-12 mx-auto mb-4 sacred-pulse"
            />
            <h1 className="spiritual-heading text-3xl text-white mb-2">
              Gurudev
            </h1>
            <p className="text-white/90 text-lg">
              A beacon of wisdom and compassion
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 -mt-6 relative z-10">
        <Card className="divine-shadow bg-card/95 backdrop-blur-sm animate-fade-in-up">
          <div className="p-6">
            {/* Drop Cap Introduction */}
            <div className="mb-6">
              <p className="text-lg leading-relaxed">
                <span className="float-left text-6xl font-serif text-primary leading-none mr-2 mt-1">
                  I
                </span>
                <span className="text-foreground">
                  n the sacred tradition of spiritual awakening, our beloved Gurudev stands as a living embodiment of divine wisdom and unconditional love. For over three decades, he has dedicated his life to guiding souls on their journey toward inner peace and self-realization.
                </span>
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-6 text-foreground leading-relaxed">
              <p>
                Born into a family of spiritual seekers, Gurudev's path was illuminated from an early age. His profound understanding of ancient Vedantic teachings, combined with a deep compassion for all beings, has touched millions of hearts across the globe.
              </p>

              <div className="bg-accent/30 rounded-lg p-6 my-6">
                <blockquote className="quote-text text-primary italic">
                  "The purpose of life is not to be happy, but to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well."
                </blockquote>
                <cite className="block text-right text-sm text-muted-foreground mt-3 not-italic">
                  — Gurudev
                </cite>
              </div>

              <p>
                Through his teachings, Gurudev emphasizes the practical application of spiritual principles in daily life. His approach bridges the ancient wisdom of the East with the practical needs of modern living, making profound truths accessible to seekers from all walks of life.
              </p>

              <p>
                His ashram serves as a sanctuary where thousands come seeking solace, wisdom, and spiritual guidance. The transformative power of his presence and teachings continues to inspire a global community of practitioners committed to inner growth and service to humanity.
              </p>

              <div className="bg-gradient-meditation rounded-lg p-6 text-center">
                <img 
                  src={omSymbol} 
                  alt="Om Symbol" 
                  className="w-16 h-16 mx-auto mb-4 sacred-pulse"
                />
                <h3 className="spiritual-heading text-primary-foreground mb-3">
                  Core Teachings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-primary-foreground/90">
                  <div>
                    <h4 className="font-semibold mb-2">Meditation</h4>
                    <p className="text-sm">The path to inner silence and self-discovery</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Service</h4>
                    <p className="text-sm">Selfless action as spiritual practice</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Wisdom</h4>
                    <p className="text-sm">Ancient knowledge for modern living</p>
                  </div>
                </div>
              </div>

              <p>
                Today, Gurudev's mission continues to expand, reaching new generations of seekers through technology while maintaining the timeless essence of spiritual transmission. His message remains simple yet profound: 
                <em className="text-primary font-medium"> "Find the divine within yourself, and you will see it everywhere."</em>
              </p>
            </div>
          </div>
        </Card>

        {/* Share App CTA */}
        <Card className="mt-8 peaceful-shadow bg-gradient-divine">
          <div className="p-6 text-center">
            <h3 className="spiritual-heading text-primary-foreground mb-2">
              Share the Teaching
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