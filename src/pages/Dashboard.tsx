import { useState } from 'react';
import { motion, type Variants, type Easing } from 'framer-motion';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight,
  Clock,
  Target,
  Zap,
  Phone,
  Mail,
  FileText,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCRM } from '../store/CRMContext';
import { formatCurrency, formatDate, getInitials } from '../utils';
import { Stage, Lead, Activity as ActivityType } from '../types';
import Modal from '../components/Modal';
import styles from './Dashboard.module.css';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const ease: Easing = [0.16, 1, 0.3, 1];

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease,
    },
  },
};

export default function Dashboard() {
  const { leads, companies, settings, activities, getLeadActivities } = useCRM();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return undefined;
    return companies.find(c => c.id === companyId)?.name;
  };

  const totalLeads = leads.length;
  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const wonLeads = leads.filter((l) => l.stage === 'won').length;
  const wonValue = leads.filter((l) => l.stage === 'won').reduce((sum, l) => sum + (l.value || 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const activeDeals = leads.filter((l) => !['won', 'lost'].includes(l.stage)).length;

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const stats = [
    {
      label: 'Total Leads',
      value: totalLeads,
      icon: Users,
      color: '#6366F1',
      bg: 'rgba(99, 102, 241, 0.12)',
    },
    {
      label: 'Pipeline Value',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)',
    },
    {
      label: 'Won Value',
      value: formatCurrency(wonValue),
      icon: Target,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.12)',
    },
    {
      label: 'Active Deals',
      value: activeDeals,
      icon: Zap,
      color: '#EC4899',
      bg: 'rgba(236, 72, 153, 0.12)',
    },
  ];

  const handleActivityClick = (activity: ActivityType) => {
    if (activity.leadId) {
      const lead = leads.find(l => l.id === activity.leadId);
      if (lead) {
        setSelectedLead(lead);
        setShowActivityModal(true);
      }
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'note': return FileText;
      case 'meeting': return Calendar;
      case 'task': return Target;
      default: return Activity;
    }
  };

  return (
    <motion.div
      className={styles.dashboard}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.header} variants={itemVariants}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening with your leads.</p>
        </div>
      </motion.div>

      <motion.div className={styles.statsGrid} variants={itemVariants}>
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            className={styles.statCard}
            variants={itemVariants}
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
              <stat.icon size={18} strokeWidth={1.5} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className={styles.mainGrid}>
        <motion.div className={styles.section} variants={itemVariants}>
          <div className={styles.sectionHeader}>
            <h2>Recent Leads</h2>
            <Link to="/leads" className={styles.viewAll}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className={styles.leadList}>
            {recentLeads.map((lead, index) => (
              <motion.div
                key={lead.id}
                className={styles.leadItem}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <div className={styles.leadAvatar}>
                  {lead.avatar ? (
                    <img src={lead.avatar} alt={lead.name} />
                  ) : (
                    <span>{getInitials(lead.name)}</span>
                  )}
                </div>
                <div className={styles.leadInfo}>
                  <span className={styles.leadName}>{lead.name}</span>
                  <span className={styles.leadCompany}>{getCompanyName(lead.companyId) || lead.email}</span>
                </div>
                <div className={styles.leadMeta}>
                  <StageBadge stage={lead.stage} />
                  <span className={styles.leadDate}>{formatDate(lead.createdAt)}</span>
                </div>
              </motion.div>
            ))}
            {recentLeads.length === 0 && (
              <div className={styles.emptyState}>
                <Users size={32} strokeWidth={1} />
                <p>No leads yet</p>
                <Link to="/leads" className={styles.emptyAction}>Add your first lead</Link>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div className={styles.section} variants={itemVariants}>
          <div className={styles.sectionHeader}>
            <h2>Recent Activity</h2>
          </div>
          <div className={styles.activityList}>
            {recentActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const lead = activity.leadId ? leads.find(l => l.id === activity.leadId) : null;
              
              return (
                <motion.div
                  key={activity.id}
                  className={styles.activityItem}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  onClick={() => handleActivityClick(activity)}
                  style={{ cursor: activity.leadId ? 'pointer' : 'default' }}
                >
                  <div className={styles.activityIcon}>
                    <Icon size={13} strokeWidth={1.5} />
                  </div>
                  <div className={styles.activityContent}>
                    <span className={styles.activityText}>
                      <strong>{activity.title}</strong>
                    </span>
                    {lead && (
                      <span className={styles.activityLead}>{lead.name}</span>
                    )}
                    <span className={styles.activityTime}>
                      <Clock size={11} /> {formatDate(activity.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            {recentActivities.length === 0 && (
              <div className={styles.emptyState}>
                <Activity size={32} strokeWidth={1} />
                <p>No activity yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div className={styles.pipelineSection} variants={itemVariants}>
        <div className={styles.sectionHeader}>
          <h2>Pipeline Overview</h2>
          <Link to="/pipeline" className={styles.viewAll}>
            View pipeline <ArrowRight size={13} />
          </Link>
        </div>
        <div className={styles.pipelineGrid}>
          {settings.pipelineStages.map((stage, idx) => {
            const count = leads.filter((l) => l.stage === stage.id).length;
            const value = leads.filter((l) => l.stage === stage.id).reduce((sum, l) => sum + (l.value || 0), 0);
            return (
              <motion.div
                key={stage.id}
                className={styles.pipelineCard}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={styles.pipelineCardHeader}>
                  <span className={styles.pipelineDot} style={{ background: stage.color }} />
                  <span className={styles.pipelineLabel}>{stage.label}</span>
                </div>
                <div className={styles.pipelineCardStats}>
                  <span className={styles.pipelineCount}>{count} leads</span>
                  <span className={styles.pipelineValue}>{formatCurrency(value)}</span>
                </div>
                <div className={styles.pipelineBar}>
                  <motion.div
                    className={styles.pipelineProgress}
                    style={{ background: stage.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${totalLeads > 0 ? (count / totalLeads) * 100 : 0}%` }}
                    transition={{ duration: 0.5, delay: 0.2 + idx * 0.05 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Activity Detail Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title={selectedLead?.name || 'Lead Details'}
        size="md"
      >
        {selectedLead && (
          <div className={styles.modalBodyContent}>
            <div className={styles.modalHeaderContent}>
              <div className={styles.leadAvatarLarge}>
                {selectedLead.avatar ? (
                  <img src={selectedLead.avatar} alt={selectedLead.name} />
                ) : (
                  <span>{getInitials(selectedLead.name)}</span>
                )}
              </div>
              <div>
                <h3>{selectedLead.name}</h3>
                <p>{selectedLead.position} {getCompanyName(selectedLead.companyId) ? `at ${getCompanyName(selectedLead.companyId)}` : ''}</p>
              </div>
            </div>
            
            <div className={styles.detailSection}>
              <h4>Contact Info</h4>
              <div className={styles.detailRow}>
                <Mail size={14} />
                <span>{selectedLead.email}</span>
              </div>
              {selectedLead.phone && (
                <div className={styles.detailRow}>
                  <Phone size={14} />
                  <span>{selectedLead.phone}</span>
                </div>
              )}
            </div>

            <div className={styles.detailSection}>
              <h4>Deal Info</h4>
              <div className={styles.detailRow}>
                <Target size={14} />
                <span>Stage: <StageBadge stage={selectedLead.stage} /></span>
              </div>
              {selectedLead.value && (
                <div className={styles.detailRow}>
                  <DollarSign size={14} />
                  <span>{formatCurrency(selectedLead.value)}</span>
                </div>
              )}
            </div>

            <div className={styles.detailSection}>
              <h4>Activity History</h4>
              <div className={styles.activityTimeline}>
                {getLeadActivities(selectedLead.id).map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className={styles.timelineItem}>
                      <div className={styles.timelineIcon}>
                        <Icon size={12} />
                      </div>
                      <div className={styles.timelineContent}>
                        <span className={styles.timelineTitle}>{activity.title}</span>
                        {activity.description && (
                          <span className={styles.timelineDesc}>{activity.description}</span>
                        )}
                        <span className={styles.timelineDate}>{formatDate(activity.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
                {getLeadActivities(selectedLead.id).length === 0 && (
                  <p className={styles.noActivity}>No activity recorded yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

function StageBadge({ stage }: { stage: Stage }) {
  const stageConfig: Record<Stage, { label: string; color: string }> = {
    lead: { label: 'Lead', color: '#6366F1' },
    contacted: { label: 'Contacted', color: '#8B5CF6' },
    qualified: { label: 'Qualified', color: '#EC4899' },
    proposal: { label: 'Proposal', color: '#F59E0B' },
    won: { label: 'Won', color: '#10B981' },
    lost: { label: 'Lost', color: '#EF4444' },
  };

  const config = stageConfig[stage];

  return (
    <span
      className={styles.stageBadge}
      style={{ background: `${config.color}15`, color: config.color }}
    >
      {config.label}
    </span>
  );
}
