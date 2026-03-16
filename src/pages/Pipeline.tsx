import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Plus, ChevronDown } from 'lucide-react';
import { useCRM } from '../store/CRMContext';
import { useGlobalSearch } from '../store/SearchContext';
import KanbanBoard from '../components/KanbanBoard';
import LeadModal from '../components/LeadModal';
import GlobalSearch from '../components/GlobalSearch';
import { Stage } from '../types';
import styles from './Pipeline.module.css';

export default function Pipeline() {
  const { leads, companies, settings } = useCRM();
  const { results, isSearching, query } = useGlobalSearch();
  const [filterStage, setFilterStage] = useState<Stage | 'all'>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterValue, setFilterValue] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return '';
    return companies.find(c => c.id === companyId)?.name || '';
  };

  const allTags = [...new Set(leads.flatMap((l) => l.tags))];

  // Get search results and apply additional filters
  const filteredLeads = useMemo(() => {
    let baseLeads = isSearching ? results.leads : leads;
    
    return baseLeads.filter((lead) => {
      const queryLower = query.toLowerCase();
      const companyName = getCompanyName(lead.companyId);
      
      // If searching, we already have filtered results from context
      // If not searching, apply search filter here
      const matchesSearch = !isSearching || 
        lead.name.toLowerCase().includes(queryLower) ||
        lead.email.toLowerCase().includes(queryLower) ||
        companyName.toLowerCase().includes(queryLower) ||
        lead.tags.some((tag: string) => tag.toLowerCase().includes(queryLower));
      
      const matchesStage = filterStage === 'all' || lead.stage === filterStage;
      const matchesTag = filterTag === 'all' || lead.tags.includes(filterTag);
      const matchesValue =
        filterValue === 'all' ||
        (filterValue === 'low' && lead.value && lead.value < 5000) ||
        (filterValue === 'mid' && lead.value && lead.value >= 5000 && lead.value < 25000) ||
        (filterValue === 'high' && lead.value && lead.value >= 25000) ||
        (filterValue === 'none' && !lead.value);
      
      return matchesSearch && matchesStage && matchesTag && matchesValue;
    });
  }, [results, leads, isSearching, query, filterStage, filterTag, filterValue, companies]);

  const activeFilterCount = [filterStage !== 'all', filterTag !== 'all', filterValue !== 'all'].filter(Boolean).length;

  return (
    <motion.div
      className={styles.pipeline}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <div>
          <h1>Pipeline</h1>
          <p>Manage your leads through the sales pipeline</p>
        </div>
        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
            <GlobalSearch type="pipeline" />
          </div>
          
          <div className={styles.filterWrapper} ref={filterRef}>
            <button 
              className={`${styles.filterBtn} ${activeFilterCount > 0 ? styles.filterActive : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} strokeWidth={1.5} />
              Filter
              {activeFilterCount > 0 && (
                <span className={styles.filterBadge}>{activeFilterCount}</span>
              )}
              <ChevronDown size={14} />
            </button>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className={styles.filterDropdown}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className={styles.filterSection}>
                    <label>Stage</label>
                    <select value={filterStage} onChange={(e) => setFilterStage(e.target.value as Stage | 'all')}>
                      <option value="all">All Stages</option>
                      {settings.pipelineStages.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={styles.filterSection}>
                    <label>Tag</label>
                    <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
                      <option value="all">All Tags</option>
                      {allTags.map((tag) => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={styles.filterSection}>
                    <label>Value</label>
                    <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
                      <option value="all">Any Value</option>
                      <option value="none">No Value</option>
                      <option value="low">&lt; $5,000</option>
                      <option value="mid">$5,000 - $25,000</option>
                      <option value="high">&gt; $25,000</option>
                    </select>
                  </div>
                  
                  <button 
                    className={styles.clearFilters}
                    onClick={() => {
                      setFilterStage('all');
                      setFilterTag('all');
                      setFilterValue('all');
                    }}
                  >
                    Clear Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={16} strokeWidth={1.5} />
            Add Lead
          </button>
        </div>
      </div>

      <KanbanBoard 
        leads={filteredLeads} 
        searchQuery={query}
        isSearching={isSearching}
      />

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
}
