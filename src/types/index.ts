export type Stage = 'lead' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyId?: string;
  position?: string;
  value?: number;
  stage: Stage;
  tags: string[];
  notes?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  address?: string;
  phone?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyId?: string;
  position?: string;
  avatar?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  leadId?: string;
  contactId?: string;
  dueDate?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'note' | 'meeting' | 'task';
  title: string;
  description?: string;
  leadId?: string;
  contactId?: string;
  companyId?: string;
  createdAt: string;
}

export interface PipelineStage {
  id: string;
  label: string;
  color: string;
}

export interface Settings {
  sidebarCollapsed: boolean;
  pipelineStages: PipelineStage[];
}

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: 'lead', label: 'New Lead', color: '#6366F1' },
  { id: 'contacted', label: 'Contacted', color: '#8B5CF6' },
  { id: 'qualified', label: 'Qualified', color: '#EC4899' },
  { id: 'proposal', label: 'Proposal', color: '#F59E0B' },
  { id: 'won', label: 'Won', color: '#10B981' },
  { id: 'lost', label: 'Lost', color: '#EF4444' },
];

export const STAGE_ORDER: Stage[] = ['lead', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
