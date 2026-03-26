import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  User,
  Database,
  Download,
  Trash2,
  Check,
  Plus,
  GripVertical,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useCRM } from '../store/CRMContext';
import { PipelineStage } from '../types';
import styles from './Settings.module.css';

const STORAGE_KEY = 'flowcrm_profile';

interface Profile {
  displayName: string;
  email: string;
}

interface SortableStageProps {
  stage: PipelineStage;
  index: number;
  total: number;
  onUpdate: (index: number, field: keyof PipelineStage, value: string) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

function SortableStage({ stage, index, total, onUpdate, onRemove, onMove }: SortableStageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={styles.stageItem}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className={styles.stageDrag} {...attributes} {...listeners}>
        <GripVertical size={14} strokeWidth={1.5} />
      </div>
      <div className={styles.stageColorWrapper}>
        <input
          type="color"
          value={stage.color}
          onChange={(e) => onUpdate(index, 'color', e.target.value)}
          className={styles.colorInput}
        />
        <div className={styles.stageColor} style={{ background: stage.color }} />
      </div>
      <input
        type="text"
        value={stage.label}
        onChange={(e) => onUpdate(index, 'label', e.target.value)}
        className={styles.stageInput}
      />
      <div className={styles.stageActions}>
        <button
          onClick={() => onMove(index, 'up')}
          disabled={index === 0}
          className={styles.moveBtn}
        >
          ↑
        </button>
        <button
          onClick={() => onMove(index, 'down')}
          disabled={index === total - 1}
          className={styles.moveBtn}
        >
          ↓
        </button>
        <button
          onClick={() => onRemove(index)}
          disabled={total <= 1}
          className={styles.removeBtn}
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default function Settings() {
  const { leads, settings, updateSettings } = useCRM();
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    displayName: 'Admin',
    email: 'admin@flowcrm.com',
  });
  const [showClearWarning, setShowClearWarning] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const savedProfile = localStorage.getItem(STORAGE_KEY);
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch {
        // Use defaults
      }
    }
  }, []);

  const handleExportData = () => {
    const data = JSON.stringify({ leads, settings, profile }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowcrm-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    setShowClearWarning(true);
  };

  const confirmClearData = () => {
    localStorage.removeItem('flowcrm_data');
    window.location.reload();
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleStageChange = (index: number, field: keyof PipelineStage, value: string) => {
    const newStages = [...settings.pipelineStages];
    newStages[index] = { ...newStages[index], [field]: value };
    updateSettings({ pipelineStages: newStages });
  };

  const handleAddStage = () => {
    const colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#6366F1', '#10B981', '#EF4444', '#F43F5E', '#0EA5E9'];
    const usedColors = settings.pipelineStages.map(s => s.color);
    const availableColor = colors.find(c => !usedColors.includes(c)) || '#3B82F6';
    
    const newStage: PipelineStage = {
      id: `stage_${Date.now()}` as any,
      label: 'New Stage',
      color: availableColor,
    };
    updateSettings({ pipelineStages: [...settings.pipelineStages, newStage] });
  };

  const handleRemoveStage = (index: number) => {
    if (settings.pipelineStages.length <= 1) return;
    const newStages = settings.pipelineStages.filter((_, i) => i !== index);
    updateSettings({ pipelineStages: newStages });
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === settings.pipelineStages.length - 1)
    ) {
      return;
    }
    
    const newStages = [...settings.pipelineStages];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newStages[index], newStages[newIndex]] = [newStages[newIndex], newStages[index]];
    updateSettings({ pipelineStages: newStages });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = settings.pipelineStages.findIndex(s => s.id === active.id);
    const newIndex = settings.pipelineStages.findIndex(s => s.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newStages = [...settings.pipelineStages];
      const [movedItem] = newStages.splice(oldIndex, 1);
      newStages.splice(newIndex, 0, movedItem);
      updateSettings({ pipelineStages: newStages });
    }
  };

  return (
    <motion.div
      className={styles.settings}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your CRM preferences</p>
      </div>

      <div className={styles.sections}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <User size={18} strokeWidth={1.5} />
            </div>
            <div>
              <h2>Profile</h2>
              <p>Your personal information</p>
            </div>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.profileRow}>
              <div className={styles.avatarLarge}>
                {profile.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className={styles.profileFields}>
                <div className={styles.field}>
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div>
              <h2>Pipeline Stages</h2>
              <p>Customize your sales pipeline stages</p>
            </div>
          </div>
          <div className={styles.sectionContent}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={settings.pipelineStages.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className={styles.stagesList}>
                  {settings.pipelineStages.map((stage, index) => (
                    <SortableStage
                      key={stage.id}
                      stage={stage}
                      index={index}
                      total={settings.pipelineStages.length}
                      onUpdate={handleStageChange}
                      onRemove={handleRemoveStage}
                      onMove={handleMoveStage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <button className={styles.addStageBtn} onClick={handleAddStage}>
              <Plus size={14} strokeWidth={1.5} />
              Add Stage
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <Database size={18} strokeWidth={1.5} />
            </div>
            <div>
              <h2>Data Management</h2>
              <p>Export or clear your CRM data</p>
            </div>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.dataStats}>
              <div className={styles.dataStat}>
                <span className={styles.dataStatValue}>{leads.length}</span>
                <span className={styles.dataStatLabel}>Total Leads</span>
              </div>
              <div className={styles.dataStat}>
                <span className={styles.dataStatValue}>
                  {leads.filter((l) => l.stage === 'won').length}
                </span>
                <span className={styles.dataStatLabel}>Won Deals</span>
              </div>
              <div className={styles.dataStat}>
                <span className={styles.dataStatValue}>
                  {leads.reduce((sum, l) => sum + (l.value || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                </span>
                <span className={styles.dataStatLabel}>Total Value</span>
              </div>
            </div>
            <div className={styles.dataActions}>
              <button className={styles.exportBtn} onClick={handleExportData}>
                <Download size={15} strokeWidth={1.5} />
                Export Data
              </button>
              <button className={styles.clearBtn} onClick={handleClearData}>
                <Trash2 size={15} strokeWidth={1.5} />
                Clear All Data
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.footer}>
        <button className={styles.saveBtn} onClick={handleSave}>
          {saved ? (
            <>
              <Check size={16} strokeWidth={1.5} />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      <AnimatePresence>
        {showClearWarning && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowClearWarning(false)}
          >
            <motion.div
              className={styles.warningModal}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.warningIcon}>
                <AlertTriangle size={24} strokeWidth={1.5} />
              </div>
              <h3>Clear All Data?</h3>
              <p>This will permanently delete all your leads, settings, and profile data. This action cannot be undone.</p>
              <div className={styles.warningActions}>
                <button onClick={() => setShowClearWarning(false)}>Cancel</button>
                <button className={styles.dangerBtn} onClick={confirmClearData}>
                  Delete Everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
