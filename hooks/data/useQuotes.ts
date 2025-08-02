
import { useMemo } from 'react';
import { mockQuotes, type Quote } from '@/mocks/data/quotes';

export const useQuotes = () => {
  const quotes = useMemo(() => mockQuotes, []);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  const getQuotesByCategory = (category: string) => {
    return quotes.filter(quote => quote.category === category);
  };

  return {
    quotes,
    getRandomQuote,
    getQuotesByCategory,
  };
};
