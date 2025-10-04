import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { googleSheetsService } from '../services/googleSheetsService';

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  dateAdded: string;
  reflection?: string;
}

interface QuotesContextType {
  quotes: Quote[];
  loading: boolean;
  addQuote: (quote: Omit<Quote, 'id' | 'dateAdded'>) => Promise<void>;
  removeQuote: (id: string) => Promise<void>;
  updateQuote: (id: string, quote: Partial<Quote>) => Promise<void>;
}

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

export function QuotesProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  // Load quotes from local storage
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        await googleSheetsService.initializeWithSampleData();
        const loadedQuotes = await googleSheetsService.getQuotes();
        setQuotes(loadedQuotes);
        console.log(`📚 Loaded ${loadedQuotes.length} quotes from local storage`);
      } catch (error) {
        console.error('Error loading quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, []);

  const addQuote = async (newQuote: Omit<Quote, 'id' | 'dateAdded'>) => {
    console.log('🎯 QuotesContext.addQuote() called with:', newQuote);
    
    try {
      console.log('📞 Calling googleSheetsService.addQuote...');
      const addedQuote = await googleSheetsService.addQuote(newQuote);
      console.log('📝 Received quote from service:', addedQuote);
      
      if (addedQuote) {
        console.log('✅ Adding quote to local state');
        setQuotes(prev => [addedQuote, ...prev]);
        console.log('🔄 Quote added to local state, triggering re-render');
      } else {
        console.log('⚠️ No quote returned from service');
      }
    } catch (error) {
      console.error('❌ Error in QuotesContext.addQuote:', error);
      console.error('❌ Error stack:', (error as Error).stack);
    }
  };

  const removeQuote = async (id: string) => {
    try {
      const success = await googleSheetsService.removeQuote(id);
      if (success) {
        setQuotes(prev => prev.filter(q => q.id !== id));
      }
    } catch (error) {
      console.error('Error removing quote:', error);
    }
  };

  const updateQuote = async (id: string, updatedQuote: Partial<Quote>) => {
    try {
      const updated = await googleSheetsService.updateQuote(id, updatedQuote);
      if (updated) {
        setQuotes(prev => prev.map(q => q.id === id ? updated : q));
      }
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  return (
    <QuotesContext.Provider value={{
      quotes,
      loading,
      addQuote,
      removeQuote,
      updateQuote
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