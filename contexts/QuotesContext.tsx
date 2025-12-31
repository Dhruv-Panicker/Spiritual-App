import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { googleSheetsService, Quote } from '../services/googleSheetsService';

interface QuotesContextType {
  quotes: Quote[];
  loading: boolean;
  addQuote: (quote: Omit<Quote, 'id' | 'dateAdded'>) => Promise<void>;
  refreshQuotes: () => Promise<void>;
}

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

export function QuotesProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const loadedQuotes = await googleSheetsService.getQuotes();
      setQuotes(loadedQuotes);
      console.log(`📚 Loaded ${loadedQuotes.length} quotes`);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load quotes on mount
  useEffect(() => {
    loadQuotes();
  }, []);

  const addQuote = async (newQuote: Omit<Quote, 'id' | 'dateAdded'>) => {
    try {
      const addedQuote = await googleSheetsService.addQuote(newQuote);
      setQuotes(prev => [addedQuote, ...prev]);
      console.log('✅ Quote added successfully');
    } catch (error) {
      console.error('Error adding quote:', error);
      throw error;
    }
  };

  const refreshQuotes = async () => {
    await loadQuotes();
  };

  return (
    <QuotesContext.Provider value={{
      quotes,
      loading,
      addQuote,
      refreshQuotes
    }}>
      {children}
    </QuotesContext.Provider>
  );
}

export function useQuotes() {
  const context = useContext(QuotesContext);
  if (context === undefined) {
    throw new Error('useQuotes must be used within a QuotesProvider');
  }
  return context;
}

export type { Quote };

