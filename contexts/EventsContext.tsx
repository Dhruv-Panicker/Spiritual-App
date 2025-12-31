import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { googleSheetsService, Event } from '../services/googleSheetsService';

export interface MonthData {
  month: string;
  year: number;
  events: Event[];
}

export const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface EventsContextType {
  events: Event[];
  loading: boolean;
  getCurrentMonthEvents: Event[];
  monthlyData: MonthData[];
  monthNames: string[];
  getEventTypeColor: (type: Event['type']) => string;
  getEventTypeBadgeStyle: (type: Event['type']) => { backgroundColor: string; color: string };
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const loadedEvents = await googleSheetsService.getEvents();
      setEvents(loadedEvents);
      console.log(`📅 Loaded ${loadedEvents.length} events`);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Get current month events
  const getCurrentMonthEvents = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return events.filter(event => {
      try {
        const eventMonth = new Date(event.date).getMonth();
        return eventMonth === currentMonth;
      } catch {
        return false;
      }
    });
  }, [events]);

  // Organize events by month
  const monthlyData = useMemo((): MonthData[] => {
    const currentYear = new Date().getFullYear();
    return monthNames.map((month, index) => ({
      month,
      year: currentYear,
      events: events.filter(event => {
        try {
          const eventMonth = new Date(event.date).getMonth();
          return eventMonth === index;
        } catch {
          return false;
        }
      })
    }));
  }, [events]);

  // Get color for event type
  const getEventTypeColor = (type: Event['type']): string => {
    // Import dynamically to avoid circular dependencies
    const { SPIRITUAL_COLORS } = require('../constants/SpiritualColors');
    switch (type) {
      case 'meditation': return SPIRITUAL_COLORS.primary;
      case 'teaching': return SPIRITUAL_COLORS.secondary;
      case 'celebration': return SPIRITUAL_COLORS.spiritualRed;
      case 'retreat': return SPIRITUAL_COLORS.omGold;
      default: return SPIRITUAL_COLORS.textMuted;
    }
  };

  // Get badge style for event type
  const getEventTypeBadgeStyle = (type: Event['type']) => {
    const color = getEventTypeColor(type);
    return {
      backgroundColor: color,
      color: '#FFFFFF',
    };
  };

  const addEvent = async (newEvent: Omit<Event, 'id'>) => {
    try {
      const addedEvent = await googleSheetsService.addEvent(newEvent);
      setEvents(prev => [addedEvent, ...prev]);
      console.log('✅ Event added successfully');
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const refreshEvents = async () => {
    await loadEvents();
  };

  return (
    <EventsContext.Provider value={{
      events,
      loading,
      getCurrentMonthEvents,
      monthlyData,
      monthNames,
      getEventTypeColor,
      getEventTypeBadgeStyle,
      addEvent,
      refreshEvents
    }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}

export type { Event };

