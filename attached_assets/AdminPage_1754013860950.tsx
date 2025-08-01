import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Send, Calendar, MessageCircle, Save } from 'lucide-react';

export const AdminPage = () => {
  const [quoteForm, setQuoteForm] = useState({
    text: '',
    author: '',
    reflection: ''
  });
  
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    type: 'meditation'
  });

  const { toast } = useToast();

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Quote Published",
      description: "The quote has been added to the daily feed and will be sent as a push notification."
    });
    
    setQuoteForm({ text: '', author: '', reflection: '' });
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Event Created",
      description: "The event has been added to the calendar and users will be notified."
    });
    
    setEventForm({
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      type: 'meditation'
    });
  };

  const sendPushNotification = async () => {
    // Simulate push notification
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({
      title: "Notification Sent",
      description: "Push notification sent to all users with today's quote."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-peace pb-20">
      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="spiritual-heading text-primary mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage quotes, events, and notifications</p>
        </div>

        <Tabs defaultValue="quotes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="quotes" className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Quotes</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Notify</span>
            </TabsTrigger>
          </TabsList>

          {/* Quotes Management */}
          <TabsContent value="quotes">
            <Card className="divine-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Add New Quote</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quote-text">Quote Text</Label>
                    <Textarea
                      id="quote-text"
                      placeholder="Enter the inspirational quote..."
                      value={quoteForm.text}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, text: e.target.value }))}
                      className="min-h-24 resize-none"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quote-author">Author</Label>
                    <Input
                      id="quote-author"
                      placeholder="e.g., Gurudev, Buddha, Rumi..."
                      value={quoteForm.author}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, author: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quote-reflection">Reflection Question (Optional)</Label>
                    <Input
                      id="quote-reflection"
                      placeholder="A question to help users reflect on the quote..."
                      value={quoteForm.reflection}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, reflection: e.target.value }))}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full sacred-transition">
                    <Save className="w-4 h-4 mr-2" />
                    Publish Quote
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Management */}
          <TabsContent value="events">
            <Card className="divine-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create New Event</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEventSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input
                      id="event-title"
                      placeholder="e.g., Morning Meditation, Vedanta Talk..."
                      value={eventForm.title}
                      onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Date</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="event-time">Time</Label>
                      <Input
                        id="event-time"
                        type="time"
                        value={eventForm.time}
                        onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-location">Location</Label>
                    <Input
                      id="event-location"
                      placeholder="e.g., Main Hall, Online, Community Center..."
                      value={eventForm.location}
                      onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-type">Event Type</Label>
                    <select 
                      id="event-type"
                      value={eventForm.type}
                      onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="meditation">Meditation</option>
                      <option value="teaching">Teaching</option>
                      <option value="celebration">Celebration</option>
                      <option value="retreat">Retreat</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      placeholder="Describe the event, what participants can expect..."
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-24 resize-none"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full sacred-transition">
                    <Save className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <div className="space-y-4">
              <Card className="divine-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Send Push Notification</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Send today's quote as a push notification to all app users.
                  </p>
                  <Button 
                    onClick={sendPushNotification}
                    className="w-full sacred-transition"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Daily Quote Notification
                  </Button>
                </CardContent>
              </Card>

              <Card className="peaceful-shadow">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Quote published: "The mind is everything..."</span>
                      <span className="text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span>Event created: New Moon Meditation</span>
                      <span className="text-muted-foreground">1 day ago</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span>Push notification sent to 1,247 users</span>
                      <span className="text-muted-foreground">2 days ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};