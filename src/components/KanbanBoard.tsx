import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Lead, Stage } from '../types';
import { useCRM } from '../store/CRMContext';
import { LeadCard } from './LeadCard';
import LeadModal from './LeadModal';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
  leads: Lead[];
  searchQuery?: string;
  isSearching?: boolean;
}

function DroppableColumn({ 
  children, 
  stageId, 
  isOver,
  onDragOver 
}: { 
  children: React.ReactNode; 
  stageId: string;
  isOver: boolean;
  onDragOver: (stageId: string) => void;
}) {
  const { setNodeRef } = useSortable({ id: stageId });
  
  return (
    <div 
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.columnOver : ''}`}
      data-stage-id={stageId}
      onMouseEnter={() => onDragOver(stageId)}
    >
      {children}
    </div>
  );
}

export default function KanbanBoard({ leads, searchQuery = '', isSearching = false }: KanbanBoardProps) {
  const { moveLead, settings, companies } = useCRM();
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [activeOverColumn, setActiveOverColumn] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const stages = settings.pipelineStages;
  const stageIds = useMemo(() => stages.map(s => s.id), [stages]);

  const getLeadsByStage = useCallback((stageId: string) => {
    let stageLeads = leads.filter((lead) => lead.stage === stageId);
    
    // When searching, filter leads that match the search query
    if (isSearching && searchQuery) {
      const query = searchQuery.toLowerCase();
      stageLeads = stageLeads.filter(lead => {
        const company = companies.find(c => c.id === lead.companyId);
        return (
          lead.name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.tags.some(tag => tag.toLowerCase().includes(query)) ||
          company?.name.toLowerCase().includes(query)
        );
      });
    }
    
    return stageLeads;
  }, [leads, isSearching, searchQuery, companies]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const lead = leads.find((l) => l.id === event.active.id);
    if (lead) {
      setActiveLead(lead);
      // Set initial over column to the lead's current stage
      setActiveOverColumn(lead.stage);
    }
  }, [leads]);

  // Handle drag over - this is critical for bi-directional drops
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    
    if (!over) return;

    const overId = over.id as string;
    
    // Case 1: Dropped directly on a column (empty column or column header)
    if (stageIds.includes(overId)) {
      setActiveOverColumn(overId);
      return;
    }
    
    // Case 2: Dropped on a card - find which column that card is in
    const overLead = leads.find((l) => l.id === overId);
    if (overLead) {
      setActiveOverColumn(overLead.stage);
      return;
    }
    
    // Case 3: Check if overId matches any stage
    if (stageIds.includes(overId)) {
      setActiveOverColumn(overId);
    }
  }, [leads, stageIds]);

  // Handle drag end - complete the drop
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);
    setActiveOverColumn(null);

    if (!over) return;

    const leadId = active.id as string;
    const overId = over.id as string;

    let targetStage: Stage | null = null;

    // Determine target stage from drop
    if (stageIds.includes(overId)) {
      // Dropped directly on column
      targetStage = overId as Stage;
    } else {
      // Dropped on a card - get that card's stage
      const overLead = leads.find((l) => l.id === overId);
      if (overLead) {
        targetStage = overLead.stage;
      }
    }

    if (targetStage) {
      const lead = leads.find((l) => l.id === leadId);
      if (lead && lead.stage !== targetStage) {
        moveLead(leadId, targetStage);
      }
    }
  }, [leads, stageIds, moveLead]);

  const handleCardClick = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  }, []);

  const handleAddLead = useCallback((stageId: string) => {
    setEditingLead(null);
    setIsModalOpen(true);
  }, []);

  const handleDragOverColumn = useCallback((stageId: string) => {
    setActiveOverColumn(stageId);
  }, []);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board}>
          {stages.map((stage) => {
            const stageLeads = getLeadsByStage(stage.id as Stage);
            const isOver = activeOverColumn === stage.id;

            return (
              <DroppableColumn
                key={stage.id}
                stageId={stage.id}
                isOver={isOver}
                onDragOver={handleDragOverColumn}
              >
                <div className={styles.columnHeader}>
                  <div className={styles.columnTitle}>
                    <span
                      className={styles.columnDot}
                      style={{ background: stage.color }}
                    />
                    <span>{stage.label}</span>
                    <span className={styles.columnCount}>{stageLeads.length}</span>
                  </div>
                  <button
                    className={styles.addBtn}
                    onClick={() => handleAddLead(stage.id)}
                  >
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                </div>

                <SortableContext
                  items={stageLeads.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <motion.div
                    className={styles.columnContent}
                    layout
                  >
                    <AnimatePresence mode="popLayout">
                      {stageLeads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onClick={() => handleCardClick(lead)}
                          onDelete={() => {}}
                        />
                      ))}
                    </AnimatePresence>

                    {stageLeads.length === 0 && (
                      <motion.div
                        className={styles.emptyState}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <span>Drop leads here</span>
                      </motion.div>
                    )}
                  </motion.div>
                </SortableContext>
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className={styles.dragOverlay}>
              <LeadCard
                lead={activeLead}
                onClick={() => {}}
                onDelete={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLead(null);
        }}
        lead={editingLead}
      />
    </>
  );
}
