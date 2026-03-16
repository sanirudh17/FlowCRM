import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building2, Trash2, Edit2, Users } from 'lucide-react';
import { useCRM } from '../store/CRMContext';
import { useGlobalSearch } from '../store/SearchContext';
import { Company } from '../types';
import { formatDate, getInitials } from '../utils';
import Modal from '../components/Modal';
import DeleteModal from '../components/DeleteModal';
import GlobalSearch from '../components/GlobalSearch';
import styles from './Companies.module.css';

export default function Companies() {
  const { leads, addCompany, updateCompany, deleteCompany } = useCRM();
  const { results, isSearching } = useGlobalSearch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteCompanyItem, setDeleteCompany] = useState<Company | null>(null);
  const [form, setForm] = useState({
    name: '',
    domain: '',
    industry: '',
    size: '',
    phone: '',
    website: '',
  });

  // Filter companies from search results
  const filteredCompanies = results.companies;

  const getCompanyLeads = (companyId: string) => {
    return leads.filter(l => l.companyId === companyId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    if (editingCompany) {
      updateCompany(editingCompany.id, form);
    } else {
      addCompany(form);
    }
    setIsModalOpen(false);
    setEditingCompany(null);
    setForm({ name: '', domain: '', industry: '', size: '', phone: '', website: '' });
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setForm({
      name: company.name,
      domain: company.domain || '',
      industry: company.industry || '',
      size: company.size || '',
      phone: company.phone || '',
      website: company.website || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (company: Company) => {
    setDeleteCompany(company);
  };

  const handleConfirmDelete = () => {
    if (deleteCompanyItem) {
      deleteCompany(deleteCompanyItem.id);
      setDeleteCompany(null);
    }
  };

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <div>
          <h1>Companies</h1>
          <p>{isSearching ? `${filteredCompanies.length} results` : `${results.companies.length} companies`}</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={16} strokeWidth={1.5} />
          Add Company
        </button>
      </div>

      <div className={styles.filters}>
        <GlobalSearch type="companies" />
      </div>

      <div className={styles.grid}>
        {filteredCompanies.map((company, index) => {
          const companyLeads = getCompanyLeads(company.id);
          return (
            <motion.div
              key={company.id}
              className={styles.card}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ y: -2 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {getInitials(company.name)}
                </div>
                <div className={styles.cardInfo}>
                  <h3>{company.name}</h3>
                  {company.domain && <span>{company.domain}</span>}
                </div>
                <div className={styles.cardActions}>
                  <button onClick={() => handleEdit(company)}><Edit2 size={14} /></button>
                  <button onClick={() => handleDeleteClick(company)}><Trash2 size={14} /></button>
                </div>
              </div>
              <div className={styles.cardBody}>
                {company.industry && <span className={styles.tag}>{company.industry}</span>}
                {company.size && <span className={styles.tag}>{company.size} employees</span>}
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.stat}>
                  <Users size={14} />
                  <span>{companyLeads.length} leads</span>
                </div>
                <span className={styles.date}>{formatDate(company.createdAt)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <div className={styles.emptyState}>
          <Building2 size={48} strokeWidth={1} />
          <p>No companies found</p>
          <button onClick={() => setIsModalOpen(true)}>Add your first company</button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCompany(null); }}
        title={editingCompany ? 'Edit Company' : 'Add Company'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Company Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Acme Inc" required />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Domain</label>
              <input value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} placeholder="acme.com" />
            </div>
            <div className={styles.field}>
              <label>Industry</label>
              <input value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} placeholder="Technology" />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Size</label>
              <select value={form.size} onChange={e => setForm({...form, size: e.target.value})}>
                <option value="">Select size</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 555 000 0000" />
            </div>
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingCompany(null); }}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>
              {editingCompany ? 'Save Changes' : 'Add Company'}
            </button>
          </div>
        </form>
      </Modal>

      <DeleteModal
        isOpen={!!deleteCompanyItem}
        onClose={() => setDeleteCompany(null)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this company?"
        itemName={deleteCompanyItem?.name}
      />
    </motion.div>
  );
}
