import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Lead, Stage } from '../types';
import { useCRM } from '../store/CRMContext';
import Modal from './Modal';
import DeleteModal from './DeleteModal';
import styles from './LeadModal.module.css';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
}

const initialForm = {
  name: '',
  email: '',
  phone: '',
  companyId: '',
  position: '',
  value: '',
  stage: 'lead' as Stage,
  tags: '',
  notes: '',
};

export default function LeadModal({ isOpen, onClose, lead }: LeadModalProps) {
  const { addLead, updateLead, deleteLead, settings, companies } = useCRM();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        companyId: lead.companyId || '',
        position: lead.position || '',
        value: lead.value?.toString() || '',
        stage: lead.stage,
        tags: lead.tags.join(', '),
        notes: lead.notes || '',
      });
    } else {
      setForm(initialForm);
    }
  }, [lead, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    setIsSubmitting(true);

    const leadData = {
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      companyId: form.companyId || undefined,
      position: form.position || undefined,
      value: form.value ? parseInt(form.value, 10) : undefined,
      stage: form.stage,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      notes: form.notes || undefined,
    };

    if (lead) {
      updateLead(lead.id, leadData);
    } else {
      addLead(leadData);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (lead) {
      deleteLead(lead.id);
      onClose();
    }
  };

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lead ? 'Edit Lead' : 'New Lead'}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>
          <div className={styles.field}>
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@company.com"
              required
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className={styles.field}>
            <label>Company</label>
            <select
              value={form.companyId}
              onChange={(e) => setForm({ ...form, companyId: e.target.value })}
            >
              <option value="">Select company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Position</label>
            <input
              type="text"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              placeholder="CEO"
            />
          </div>
          <div className={styles.field}>
            <label>Value ($)</label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="10000"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Stage</label>
          <select
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
          >
            {settings.pipelineStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Tags</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="enterprise, hot, referral (comma separated)"
          />
        </div>

        <div className={styles.field}>
          <label>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Add notes about this lead..."
            rows={3}
          />
        </div>

        <div className={styles.actions}>
          {lead && (
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
          <div className={styles.rightActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 size={16} className={styles.spinner} />
              ) : lead ? (
                'Save Changes'
              ) : (
                'Create Lead'
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>

    <DeleteModal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      onConfirm={confirmDelete}
      title="Delete Lead"
      message="Are you sure you want to delete this lead? This action cannot be undone."
      itemName={lead?.name}
    />
    </>
  );
}
