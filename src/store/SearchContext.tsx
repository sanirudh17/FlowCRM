import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useCRM } from './CRMContext';

interface SearchState {
  query: string;
  setQuery: (query: string) => void;
  clearSearch: () => void;
  results: {
    leads: any[];
    companies: any[];
  };
  isSearching: boolean;
}

const SearchContext = createContext<SearchState | undefined>(undefined);

const STORAGE_KEY = 'flowcrm_search';

export function SearchProvider({ children }: { children: ReactNode }) {
  const { leads, companies } = useCRM();
  const [query, setQueryState] = useState('');

  // Load saved search from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setQueryState(saved);
      } catch {
        // Use empty
      }
    }
  }, []);

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    localStorage.setItem(STORAGE_KEY, newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQueryState('');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Semantic search - fuzzy matching
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    
    if (!q) {
      return { leads, companies };
    }

    // Tokenize query for multi-term matching
    const tokens = q.split(/\s+/).filter(Boolean);
    
    // Search leads
    const filteredLeads = leads.filter(lead => {
      const company = companies.find(c => c.id === lead.companyId);
      const searchableText = [
        lead.name,
        lead.email,
        lead.position,
        company?.name || '',
        company?.domain || '',
        company?.industry || '',
        ...lead.tags,
      ].join(' ').toLowerCase();
      
      // Match all tokens (AND logic)
      return tokens.every(token => 
        searchableText.includes(token) ||
        fuzzyMatch(token, searchableText)
      );
    });

    // Search companies
    const filteredCompanies = companies.filter(company => {
      const searchableText = [
        company.name,
        company.domain,
        company.industry,
        company.size,
      ].join(' ').toLowerCase();
      
      return tokens.every(token => 
        searchableText.includes(token) ||
        fuzzyMatch(token, searchableText)
      );
    });

    return { leads: filteredLeads, companies: filteredCompanies };
  }, [query, leads, companies]);

  const isSearching = query.length > 0;

  return (
    <SearchContext.Provider value={{ query, setQuery, clearSearch, results, isSearching }}>
      {children}
    </SearchContext.Provider>
  );
}

// Fuzzy match helper - allows for typos
function fuzzyMatch(query: string, text: string): boolean {
  if (text.includes(query)) return true;
  
  // Check if all characters of query appear in order in text
  let queryIndex = 0;
  for (const char of text) {
    if (char === query[queryIndex]) {
      queryIndex++;
      if (queryIndex === query.length) return true;
    }
  }
  return queryIndex === query.length;
}

export function useGlobalSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useGlobalSearch must be used within SearchProvider');
  }
  return context;
}
