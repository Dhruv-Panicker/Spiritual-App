import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location?: string;
  image?: string;
  type: 'meditation' | 'teaching' | 'celebration' | 'retreat';
}

interface MonthData {
  month: string;
  year: number;
  events: Event[];
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'New Moon Meditation',
    date: '2024-01-15',
    time: '7:00 PM',
    description: 'Join us for a powerful new moon meditation to set intentions for the lunar cycle ahead. We will practice breath awareness and silent contemplation.',
    location: 'Main Hall',
    type: 'meditation'
  },
  {
    id: '2',
    title: 'Vedanta Philosophy Talk',
    date: '2024-01-22',
    time: '6:30 PM', 
    description: 'Explore the profound teachings of Vedanta philosophy and its practical applications in daily life. Discover the nature of reality and consciousness.',
    location: 'Teaching Hall',
    type: 'teaching'
  },
  {
    id: '3',
    title: 'Diwali Celebration',
    date: '2024-02-14',
    time: '5:00 PM',
    description: 'Celebrate the festival of lights with traditional prayers, music, and community feast. Join us in spreading joy and divine light.',
    location: 'Community Center',
    type: 'celebration'
  }
];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarPage = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Group events by month
  const monthlyData: MonthData[] = monthNames.map((month, index) => ({
    month,
    year: 2024,
    events: mockEvents.filter(event => {
      const eventMonth = new Date(event.date).getMonth();
      return eventMonth === index;
    })
  }));

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'meditation': return 'bg-primary text-primary-foreground';
      case 'teaching': return 'bg-secondary text-secondary-foreground';
      case 'celebration': return 'bg-spiritual-red text-spiritual-red-foreground';
      case 'retreat': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const shareEvent = async (event: Event) => {
    const shareText = `📅 ${event.title}\n📍 ${event.location}\n🕐 ${event.time}\n\n${event.description}\n\nFrom our Spiritual Wisdom calendar`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Event Details Copied",
        description: "Event details have been copied to your clipboard."
      });
    }
  };

  const shareApp = async () => {
    const shareText = "🗓️ Stay connected with upcoming spiritual events and teachings through this beautiful app!";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Spiritual Calendar',
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
          <h1 className="spiritual-heading text-primary mb-2">Sacred Calendar</h1>
          <p className="text-muted-foreground">Upcoming events and teachings</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {monthlyData.map((monthData, index) => (
            <Card 
              key={monthData.month}
              className="p-4 peaceful-shadow cursor-pointer sacred-transition hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="text-center">
                <h3 className="font-semibold text-primary mb-2">{monthData.month}</h3>
                <div className="text-sm text-muted-foreground mb-3">{monthData.year}</div>
                
                {monthData.events.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-center items-center space-x-1 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{monthData.events.length} events</span>
                    </div>
                    
                    <div className="space-y-1">
                      {monthData.events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-2 rounded bg-accent/50 cursor-pointer hover:bg-accent"
                          onClick={() => handleEventClick(event)}
                        >
                          {event.title}
                        </div>
                      ))}
                      {monthData.events.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{monthData.events.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No events</div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Upcoming Events List */}
        <div className="space-y-4">
          <h2 className="spiritual-heading text-lg text-primary">Upcoming Events</h2>
          {mockEvents.map((event, index) => (
            <Card 
              key={event.id}
              className="p-4 peaceful-shadow cursor-pointer sacred-transition hover:shadow-divine animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleEventClick(event)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-foreground">{event.title}</h3>
                <Badge className={getEventTypeColor(event.type)}>
                  {event.type}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                {event.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            </Card>
          ))}
        </div>
        
        {/* Share App CTA */}
        <Card className="mt-8 peaceful-shadow bg-gradient-divine">
          <div className="p-6 text-center">
            <h3 className="spiritual-heading text-primary-foreground mb-2">
              Stay Connected
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

      {/* Event Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md mx-auto peaceful-shadow">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="spiritual-heading text-primary">
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge className={getEventTypeColor(selectedEvent.type)}>
                    {selectedEvent.type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => shareEvent(selectedEvent)}
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{selectedEvent.time}</span>
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};