import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, UserCircle, Trash2, Edit2, X, Mail, Phone, Building } from 'lucide-react';
import { useCRM } from '../store/CRMContext';
import { Contact } from '../types';
import { formatDate, getInitials } from '../utils';
import Modal from '../components/Modal';
import DeleteModal from '../components/DeleteModal';
import styles from './Contacts.module.css';

export default function Contacts() {
  const { contacts, companies, leads, addContact, updateContact, deleteContact } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteContactItem, setDeleteContact] = useState<Contact | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyId: '',
    position: '',
  });

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return null;
    return companies.find(c => c.id === companyId)?.name;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    if (editingContact) {
      updateContact(editingContact.id, form);
    } else {
      addContact(form);
    }
    setIsModalOpen(false);
    setEditingContact(null);
    setForm({ name: '', email: '', phone: '', companyId: '', position: '' });
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setForm({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      companyId: contact.companyId || '',
      position: contact.position || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (contact: Contact) => {
    setDeleteContact(contact);
  };

  const handleConfirmDelete = () => {
    if (deleteContactItem) {
      deleteContact(deleteContactItem.id);
      setDeleteContact(null);
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
          <h1>Contacts</h1>
          <p>{contacts.length} contacts</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={16} strokeWidth={1.5} />
          Add Contact
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={16} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Contact</th>
              <th>Company</th>
              <th>Position</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact, index) => (
              <motion.tr
                key={contact.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <td>
                  <div className={styles.contactCell}>
                    <div className={styles.avatar}>{getInitials(contact.name)}</div>
                    <div className={styles.contactInfo}>
                      <span className={styles.name}>{contact.name}</span>
                      <span className={styles.email}>{contact.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.company}>{getCompanyName(contact.companyId) || '—'}</span>
                </td>
                <td><span>{contact.position || '—'}</span></td>
                <td><span className={styles.date}>{formatDate(contact.createdAt)}</span></td>
                <td>
                  <div className={styles.actions}>
                    <button onClick={() => handleEdit(contact)}><Edit2 size={14} /></button>
                    <button onClick={() => handleDeleteClick(contact)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredContacts.length === 0 && (
        <div className={styles.emptyState}>
          <UserCircle size={48} strokeWidth={1} />
          <p>No contacts found</p>
          <button onClick={() => setIsModalOpen(true)}>Add your first contact</button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingContact(null); }}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
          </div>
          <div className={styles.field}>
            <label>Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" required />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 555 000 0000" />
            </div>
            <div className={styles.field}>
              <label>Position</label>
              <input value={form.position} onChange={e => setForm({...form, position: e.target.value})} placeholder="CEO" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Company</label>
            <select value={form.companyId} onChange={e => setForm({...form, companyId: e.target.value})}>
              <option value="">Select company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingContact(null); }}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>{editingContact ? 'Save Changes' : 'Add Contact'}</button>
          </div>
        </form>
      </Modal>

      <DeleteModal
        isOpen={!!deleteContactItem}
        onClose={() => setDeleteContact(null)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this contact?"
        itemName={deleteContactItem?.name}
      />
    </motion.div>
  );
}
