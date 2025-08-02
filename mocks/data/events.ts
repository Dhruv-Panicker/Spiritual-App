
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location?: string;
  type: 'meditation' | 'teaching' | 'celebration' | 'retreat';
}

export const mockEvents: Event[] = [
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
  },
  {
    id: '4',
    title: 'Silent Retreat Weekend',
    date: '2024-03-20',
    time: '9:00 AM',
    description: 'A transformative weekend of silence, meditation, and inner reflection. Disconnect from the world and reconnect with your true self.',
    location: 'Retreat Center',
    type: 'retreat'
  },
  {
    id: '5',
    title: 'Spring Equinox Ceremony',
    date: '2024-03-20',
    time: '6:00 PM',
    description: 'Celebrate the balance of day and night with a special ceremony honoring the arrival of spring and new beginnings.',
    location: 'Outdoor Garden',
    type: 'celebration'
  },
  {
    id: '6',
    title: 'Karma Yoga Workshop',
    date: '2024-04-10',
    time: '2:00 PM',
    description: 'Learn the path of selfless service and how to transform daily actions into spiritual practice through Karma Yoga principles.',
    location: 'Workshop Room',
    type: 'teaching'
  },
  {
    id: '7',
    title: 'Full Moon Meditation Circle',
    date: '2024-08-05',
    time: '7:30 PM',
    description: 'Join us for a powerful full moon meditation to harness the lunar energy for spiritual transformation and inner healing.',
    location: 'Meditation Hall',
    type: 'meditation'
  },
  {
    id: '8',
    title: 'Bhagavad Gita Study Group',
    date: '2024-08-12',
    time: '6:00 PM',
    description: 'Deep dive into the sacred teachings of the Bhagavad Gita and explore its practical wisdom for modern spiritual seekers.',
    location: 'Study Room',
    type: 'teaching'
  },
  {
    id: '9',
    title: 'Krishna Janmashtami Celebration',
    date: '2024-08-26',
    time: '5:00 PM',
    description: 'Celebrate the birth of Lord Krishna with devotional singing, traditional dance, and spiritual discourse on divine love.',
    location: 'Main Temple',
    type: 'celebration'
  },
  {
    id: '10',
    title: 'Mindfulness & Meditation Workshop',
    date: '2024-08-18',
    time: '10:00 AM',
    description: 'Learn practical techniques for cultivating mindfulness in daily life and developing a consistent meditation practice.',
    location: 'Workshop Hall',
    type: 'teaching'
  }
];

export const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
