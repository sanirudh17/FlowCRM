import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '../types';
import { useCRM } from '../store/CRMContext';
import { getInitials, formatCurrency } from '../utils';
import styles from './LeadCard.module.css';

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  onDelete: () => void;
  highlighted?: boolean;
}

export function LeadCard({ lead, onClick, highlighted = false }: LeadCardProps) {
  const { companies } = useCRM();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const companyName = lead.companyId 
    ? companies.find(c => c.id === lead.companyId)?.name 
    : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ''} ${highlighted ? styles.highlighted : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      layout
      {...attributes}
      {...listeners}
    >
      <div className={styles.header}>
        <div className={styles.avatar}>
          {lead.avatar ? (
            <img src={lead.avatar} alt={lead.name} />
          ) : (
            <span>{getInitials(lead.name)}</span>
          )}
        </div>
        <div className={styles.info}>
          <h4 className={styles.name}>{lead.name}</h4>
          {companyName && <span className={styles.company}>{companyName}</span>}
        </div>
      </div>

      {lead.value && (
        <div className={styles.value}>
          {formatCurrency(lead.value)}
        </div>
      )}

      {lead.tags.length > 0 && (
        <div className={styles.tags}>
          {lead.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
          {lead.tags.length > 2 && (
            <span className={styles.tagMore}>+{lead.tags.length - 2}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
