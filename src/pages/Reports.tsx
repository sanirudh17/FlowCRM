import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, TrendingUp, TrendingDown, Users, DollarSign, Target, BarChart2, ArrowUpRight } from 'lucide-react';
import { useCRM } from '../store/CRMContext';
import { formatCurrency } from '../utils';
import styles from './Reports.module.css';

export default function Reports() {
  const { leads, activities, settings } = useCRM();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFontSize(24);
      doc.setTextColor(99, 102, 241);
      doc.text('FlowCRM Report', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
      
      let yPos = 45;
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Pipeline Summary', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      stats.forEach(stat => {
        doc.text(`${stat.label}: ${stat.value}`, 14, yPos);
        yPos += 7;
      });
      
      doc.save('flowcrm-report.pdf');
    } catch (error) {
      console.error('PDF export failed:', error);
    }
    
    setIsExporting(false);
  };

  const totalLeads = leads.length;
  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const wonLeads = leads.filter(l => l.stage === 'won');
  const wonValue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
  const lostLeads = leads.filter(l => l.stage === 'lost');
  const lostValue = lostLeads.reduce((sum, l) => sum + (l.value || 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads.length / (wonLeads.length + lostLeads.length)) * 100) : 0;
  const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.stage));
  
  const avgDealSize = totalLeads > 0 ? Math.round(totalValue / totalLeads) : 0;

  const stageStats = settings.pipelineStages.map(stage => {
    const stageLeads = leads.filter(l => l.stage === stage.id);
    const value = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
    return { ...stage, count: stageLeads.length, value };
  });

  const stats = [
    { label: 'Total Pipeline Value', value: formatCurrency(totalValue) },
    { label: 'Won Revenue', value: formatCurrency(wonValue) },
    { label: 'Conversion Rate', value: `${conversionRate}%` },
    { label: 'Avg Deal Size', value: formatCurrency(avgDealSize) },
  ];

  const topDeals = [...leads]
    .filter(l => l.value && l.value > 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 5);

  return (
    <motion.div className={styles.page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className={styles.header}>
        <div>
          <h1>Reports</h1>
          <p>Analytics and insights for your sales pipeline</p>
        </div>
        <button className={styles.exportBtn} onClick={handleExportPDF} disabled={isExporting}>
          {isExporting ? <Loader2 size={16} className={styles.spinner} /> : <Download size={16} strokeWidth={1.5} />}
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      <div className={styles.grid}>
        {/* Pipeline Funnel - Top Left */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <BarChart2 size={18} />
            <h3>Pipeline Funnel</h3>
          </div>
          <div className={styles.funnel}>
            {stageStats.map((stage) => {
              const maxCount = Math.max(...stageStats.map(s => s.count), 1);
              const percent = (stage.count / maxCount) * 100;
              return (
                <div key={stage.id} className={styles.funnelItem}>
                  <div className={styles.funnelDot} style={{ background: stage.color }} />
                  <span className={styles.funnelLabel}>{stage.label}</span>
                  <div className={styles.funnelBarContainer}>
                    <div className={styles.funnelBar} style={{ width: `${Math.max(percent, 5)}%`, background: stage.color }} />
                  </div>
                  <span className={styles.funnelCount}>{stage.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Metrics - Top Right */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Target size={18} />
            <h3>Key Metrics</h3>
          </div>
          <div className={styles.metricsGrid}>
            <div className={styles.metricItem}>
              <div className={styles.metricIcon} style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <DollarSign size={18} color="#8B5CF6" />
              </div>
              <div className={styles.metricContent}>
                <span className={styles.metricValue}>{formatCurrency(totalValue)}</span>
                <span className={styles.metricLabel}>Pipeline Value</span>
              </div>
            </div>
            
            <div className={styles.metricItem}>
              <div className={styles.metricIcon} style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <Users size={18} color="#8B5CF6" />
              </div>
              <div className={styles.metricContent}>
                <span className={styles.metricValue}>{activeLeads.length}</span>
                <span className={styles.metricLabel}>Active Leads</span>
              </div>
            </div>
            
            <div className={styles.metricItem}>
              <div className={styles.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                <TrendingUp size={18} color="#10B981" />
              </div>
              <div className={styles.metricContent}>
                <span className={styles.metricValue}>{wonLeads.length}</span>
                <span className={styles.metricLabel}>Won</span>
              </div>
            </div>
            
            <div className={styles.metricItem}>
              <div className={styles.metricIcon} style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                <TrendingDown size={18} color="#EF4444" />
              </div>
              <div className={styles.metricContent}>
                <span className={styles.metricValue}>{lostLeads.length}</span>
                <span className={styles.metricLabel}>Lost</span>
              </div>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricIcon} style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <Target size={18} color="#8B5CF6" />
              </div>
              <div className={styles.metricContent}>
                <span className={styles.metricValue}>{formatCurrency(avgDealSize)}</span>
                <span className={styles.metricLabel}>Avg Deal</span>
              </div>
            </div>
            
            <div className={styles.metricItem}>
              <div className={styles.metricIcon} style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <BarChart2 size={18} color="#8B5CF6" />
              </div>
              <div className={styles.metricContent}>
                <span className={styles.metricValue}>{conversionRate}%</span>
                <span className={styles.metricLabel}>Conversion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Deals Table - Bottom Full Width */}
        <div className={styles.cardFull}>
          <div className={styles.cardHeader}>
            <ArrowUpRight size={18} />
            <h3>Top Deals</h3>
          </div>
          <div className={styles.topDealsTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Lead</th>
                  <th>Company</th>
                  <th>Stage</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {topDeals.map((deal, idx) => {
                  const stageInfo = settings.pipelineStages.find(s => s.id === deal.stage);
                  const company = leads.find(l => l.id === deal.id);
                  return (
                    <tr key={deal.id}>
                      <td className={styles.rankCell}>
                        <span className={styles.rankBadge} style={{ background: stageInfo?.color || '#8B5CF6' }}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className={styles.leadCell}>
                        <span className={styles.leadName}>{deal.name}</span>
                        <span className={styles.leadEmail}>{deal.email}</span>
                      </td>
                      <td className={styles.companyCell}>
                        {deal.companyId ? leads.find(l => l.id === deal.companyId)?.email?.split('@')[1] || '-' : '-'}
                      </td>
                      <td className={styles.stageCell}>
                        <span className={styles.stageBadge} style={{ background: `${stageInfo?.color}20`, color: stageInfo?.color }}>
                          {stageInfo?.label || deal.stage}
                        </span>
                      </td>
                      <td className={styles.valueCell}>
                        {formatCurrency(deal.value || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
