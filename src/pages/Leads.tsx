import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Upload,
  MoreHorizontal,
  Trash2,
  Edit2,
  X,
  Users,
} from 'lucide-react';
import { useCRM } from '../store/CRMContext';
import { Lead, Stage } from '../types';
import { formatCurrency, formatDate, getInitials, parseCSV } from '../utils';
import LeadModal from '../components/LeadModal';
import styles from './Leads.module.css';

const AVATAR_COLORS = [
  { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563EB' },
  { bg: 'rgba(139, 92, 246, 0.1)', text: '#7C3AED' },
  { bg: 'rgba(245, 158, 11, 0.1)', text: '#D97706' },
  { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
  { bg: 'rgba(244, 63, 94, 0.1)', text: '#E11D48' },
  { bg: 'rgba(99, 102, 241, 0.1)', text: '#4F46E5' },
];

const getAvatarColor = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const STAGES: { id: Stage; label: string; color: string }[] = [
  { id: 'lead', label: 'New Lead', color: '#3B82F6' },
  { id: 'contacted', label: 'Contacted', color: '#8B5CF6' },
  { id: 'qualified', label: 'Qualified', color: '#F59E0B' },
  { id: 'proposal', label: 'Proposal', color: '#6366F1' },
  { id: 'won', label: 'Won', color: '#10B981' },
  { id: 'lost', label: 'Lost', color: '#EF4444' },
];

export default function Leads() {
  const { leads, companies, deleteLead, importLeads } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<Stage | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return '';
    return companies.find(c => c.id === companyId)?.name || '';
  };

  const filteredLeads = leads.filter((lead) => {
    const companyName = getCompanyName(lead.companyId);
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = selectedStage === 'all' || lead.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const handleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedLeads.size} selected leads?`)) {
      selectedLeads.forEach((id) => deleteLead(id));
      setSelectedLeads(new Set());
    }
  };

  const handleDeleteLead = (id: string) => {
    if (confirm('Delete this lead?')) {
      deleteLead(id);
    }
    setOpenMenuId(null);
  };

  const handleImport = () => {
    try {
      const parsed = parseCSV(importData);
      if (parsed.length > 0) {
        importLeads(parsed);
        setImportData('');
        setShowImport(false);
      }
    } catch {
      alert('Invalid CSV format');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportData(event.target?.result as string);
        setShowImport(true);
      };
      reader.readAsText(file);
    }
  };

  return (
    <motion.div
      className={styles.leads}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <div>
          <h1>Leads</h1>
          <p>{leads.length} total leads</p>
        </div>
        <div className={styles.actions}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            style={{ display: 'none' }}
          />
          <button className={styles.importBtn} onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} strokeWidth={1.5} />
            Import CSV
          </button>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={16} strokeWidth={1.5} />
            Add Lead
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={16} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.stageTabs}>
          <button
            className={`${styles.stageTab} ${selectedStage === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedStage('all')}
          >
            All
          </button>
          {STAGES.map((stage) => (
            <button
              key={stage.id}
              className={`${styles.stageTab} ${selectedStage === stage.id ? styles.active : ''}`}
              onClick={() => setSelectedStage(stage.id)}
            >
              <span className={styles.stageDot} style={{ background: stage.color }} />
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      {selectedLeads.size > 0 && (
        <motion.div
          className={styles.bulkActions}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>{selectedLeads.size} selected</span>
          <button onClick={handleDeleteSelected}>
            <Trash2 size={14} />
            Delete
          </button>
          <button onClick={() => setSelectedLeads(new Set())}>
            <X size={14} />
            Clear
          </button>
        </motion.div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkCol}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Lead</th>
              <th>Company</th>
              <th>Stage</th>
              <th>Value</th>
              <th>Created</th>
              <th className={styles.actionCol}></th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead, index) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={selectedLeads.has(lead.id) ? styles.rowSelected : ''}
              >
                <td className={styles.checkCol}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectedLeads.has(lead.id)}
                    onChange={() => handleSelectLead(lead.id)}
                  />
                </td>
                <td>
                  <div className={styles.leadCell}>
                    <div className={styles.avatar} style={{ background: getAvatarColor(lead.name).bg, color: getAvatarColor(lead.name).text }}>
                      {lead.avatar ? (
                        <img src={lead.avatar} alt={lead.name} />
                      ) : (
                        <span>{getInitials(lead.name)}</span>
                      )}
                    </div>
                    <div className={styles.leadInfo}>
                      <span className={styles.leadName}>{lead.name}</span>
                      <span className={styles.leadEmail}>{lead.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.companyCell}>
                    {getCompanyName(lead.companyId) || '—'}
                  </span>
                </td>
                <td>
                  <StageBadge stage={lead.stage} />
                </td>
                <td>
                  <span className={styles.valueCell}>
                    {lead.value ? formatCurrency(lead.value) : '—'}
                  </span>
                </td>
                <td>
                  <span className={styles.dateCell}>{formatDate(lead.createdAt)}</span>
                </td>
                <td className={styles.actionCol}>
                  <div className={styles.actionCell}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => {
                        setEditingLead(lead);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDeleteLead(lead.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className={styles.emptyState}>
            <Users size={40} strokeWidth={1} />
            <p>No leads found</p>
            <button onClick={() => setIsModalOpen(true)}>Add your first lead</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showImport && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImport(false)}
          >
            <motion.div
              className={styles.importModal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>Import Leads</h3>
                <button onClick={() => setShowImport(false)}>
                  <X size={18} />
                </button>
              </div>
              <p>Paste your CSV data below (name, email, phone, company, position, value, stage, tags)</p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="name,email,phone,company,position,value,stage,tags&#10;John Doe,john@acme.com,+1234567890,Acme Inc,CEO,50000,lead,enterprise"
                rows={8}
              />
              <div className={styles.importActions}>
                <button className={styles.cancelBtn} onClick={() => setShowImport(false)}>
                  Cancel
                </button>
                <button className={styles.importConfirm} onClick={handleImport}>
                  Import {importData ? parseCSV(importData).length : 0} leads
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLead(null);
        }}
        lead={editingLead}
      />
    </motion.div>
  );
}

function StageBadge({ stage }: { stage: Stage }) {
  const stageConfig = STAGES.find((s) => s.id === stage);
  if (!stageConfig) return null;

  return (
    <span
      className={styles.stageBadge}
      style={{ background: `${stageConfig.color}15`, color: stageConfig.color }}
    >
      <span className={styles.stageDot} style={{ background: stageConfig.color }} />
      {stageConfig.label}
    </span>
  );
}
