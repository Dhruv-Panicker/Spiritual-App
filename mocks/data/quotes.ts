
export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  source?: string;
}

export const mockQuotes: Quote[] = [
  {
    id: '1',
    text: 'The soul that sees beauty may sometimes walk alone, but it is never lonely.',
    author: 'Sri Sidheshwar Tirth Brahmarshi Ji',
    category: 'Spiritual Wisdom',
    source: 'Divine Teachings'
  },
  {
    id: '2',
    text: 'In silence, the heart speaks the language of the divine.',
    author: 'Sri Sidheshwar Tirth Brahmarshi Ji',
    category: 'Meditation',
    source: 'Sacred Discourses'
  },
  {
    id: '3',
    text: 'True knowledge is not accumulated but revealed in moments of pure awareness.',
    author: 'Sri Sidheshwar Tirth Brahmarshi Ji',
    category: 'Knowledge',
    source: 'Wisdom Teachings'
  }
];
