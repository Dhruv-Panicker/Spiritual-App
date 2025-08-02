
import { useMemo } from 'react';
import { mockEvents, monthNames, type Event } from '@/mocks/data/events';

export interface MonthData {
  month: string;
  year: number;
  events: Event[];
}

export const useEvents = () => {
  const events = useMemo(() => mockEvents, []);

  const getCurrentMonthEvents = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return events.filter(event => {
      const eventMonth = new Date(event.date).getMonth();
      return eventMonth === currentMonth;
    });
  }, [events]);

  const monthlyData = useMemo((): MonthData[] => {
    return monthNames.map((month, index) => ({
      month,
      year: 2024,
      events: events.filter(event => {
        const eventMonth = new Date(event.date).getMonth();
        return eventMonth === index;
      })
    }));
  }, [events]);

  const getEventTypeColor = (type: Event['type']) => {
    const { SPIRITUAL_COLORS } = require('@/constants/SpiritualColors');
    switch (type) {
      case 'meditation': return SPIRITUAL_COLORS.primary;
      case 'teaching': return SPIRITUAL_COLORS.secondary;
      case 'celebration': return SPIRITUAL_COLORS.spiritualRed;
      case 'retreat': return SPIRITUAL_COLORS.omGold;
      default: return SPIRITUAL_COLORS.textMuted;
    }
  };

  const getEventTypeBadgeStyle = (type: Event['type']) => {
    const color = getEventTypeColor(type);
    return {
      backgroundColor: color,
      color: '#FFFFFF',
    };
  };

  return {
    events,
    getCurrentMonthEvents,
    monthlyData,
    monthNames,
    getEventTypeColor,
    getEventTypeBadgeStyle,
  };
};
