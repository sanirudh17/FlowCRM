import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Users, Building2, Tag } from 'lucide-react';
import { useGlobalSearch } from '../store/SearchContext';
import { useCRM } from '../store/CRMContext';
import styles from './GlobalSearch.module.css';

interface GlobalSearchProps {
  type: 'pipeline' | 'companies';
}

export default function GlobalSearch({ type }: GlobalSearchProps) {
  const { query, setQuery, clearSearch, results, isSearching } = useGlobalSearch();
  const { leads, companies } = useCRM();
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter results based on type
  const displayLeads = type === 'pipeline' ? results.leads : [];
  const displayCompanies = type === 'companies' ? results.companies : [];

  const total = type === 'pipeline' ? leads.length : companies.length;
  const filtered = type === 'pipeline' ? displayLeads.length : displayCompanies.length;

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return '';
    return companies.find(c => c.id === companyId)?.name || '';
  };

  const getCompany = (companyId?: string) => {
    if (!companyId) return null;
    return companies.find(c => c.id === companyId) || null;
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle click on result - select it
  const handleResultClick = (leadId: string) => {
    setShowResults(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.searchBox}>
        <Search size={16} strokeWidth={1.5} className={styles.searchIcon} />
        <input
          type="text"
          placeholder={`Search leads, companies, tags...`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className={styles.input}
        />
        {query && (
          <button className={styles.clearBtn} onClick={clearSearch}>
            <X size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {isSearching && (
        <div className={styles.resultsCount}>
          Found {filtered} {type === 'pipeline' ? 'leads' : 'companies'} matching "{query}"
        </div>
      )}

      <AnimatePresence>
        {showResults && isSearching && (
          <motion.div
            className={styles.results}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {type === 'pipeline' && displayLeads.length > 0 && (
              <div className={styles.resultSection}>
                <div className={styles.resultSectionHeader}>
                  <Users size={14} />
                  <span>Leads ({displayLeads.length})</span>
                </div>
                {displayLeads.map((lead: any) => (
                  <div 
                    key={lead.id} 
                    className={styles.resultItem}
                    onClick={() => handleResultClick(lead.id)}
                  >
                    <div className={styles.resultAvatar}>
                      {lead.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className={styles.resultInfo}>
                      <span className={styles.resultName}>{lead.name}</span>
                      <span className={styles.resultMeta}>
                        {getCompanyName(lead.companyId) || lead.email}
                      </span>
                    </div>
                    {lead.tags.length > 0 && (
                      <div className={styles.resultTags}>
                        {lead.tags.map((tag: string) => (
                          <span key={tag} className={styles.tag}>
                            <Tag size={10} />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {type === 'companies' && displayCompanies.length > 0 && (
              <div className={styles.resultSection}>
                <div className={styles.resultSectionHeader}>
                  <Building2 size={14} />
                  <span>Companies ({displayCompanies.length})</span>
                </div>
                {displayCompanies.map((company: any) => (
                  <div 
                    key={company.id} 
                    className={styles.resultItem}
                    onClick={() => handleResultClick(company.id)}
                  >
                    <div className={styles.resultAvatar} style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
                      {company.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className={styles.resultInfo}>
                      <span className={styles.resultName}>{company.name}</span>
                      <span className={styles.resultMeta}>
                        {company.domain} {company.industry && `• ${company.industry}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {displayLeads.length === 0 && displayCompanies.length === 0 && (
              <div className={styles.noResults}>
                <Search size={24} strokeWidth={1} />
                <p>No results for "{query}"</p>
                <span>Try searching for tags like "tech", "enterprise", or company names</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
