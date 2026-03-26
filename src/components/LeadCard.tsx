import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '../types';
import { useCRM } from '../store/CRMContext';
import { getInitials, formatCurrency } from '../utils';
import styles from './LeadCard.module.css';

const AVATAR_COLORS = [
  { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563EB' },
  { bg: 'rgba(139, 92, 246, 0.1)', text: '#7C3AED' },
  { bg: 'rgba(245, 158, 11, 0.1)', text: '#D97706' },
  { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
  { bg: 'rgba(244, 63, 94, 0.1)', text: '#E11D48' },
  { bg: 'rgba(99, 102, 241, 0.1)', text: '#4F46E5' },
  { bg: 'rgba(14, 165, 233, 0.1)', text: '#0284C7' },
  { bg: 'rgba(168, 85, 247, 0.1)', text: '#9333EA' },
];

const getAvatarColor = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

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
        <div className={styles.avatar} style={{ background: getAvatarColor(lead.name).bg, color: getAvatarColor(lead.name).text }}>
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
