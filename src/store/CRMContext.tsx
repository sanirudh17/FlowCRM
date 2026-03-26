import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Lead, Company, Contact, Task, Activity, Stage, Settings, DEFAULT_PIPELINE_STAGES } from '../types';

interface CRMContextType {
  leads: Lead[];
  companies: Company[];
  contacts: Contact[];
  tasks: Task[];
  activities: Activity[];
  settings: Settings;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLead: (id: string, stage: Stage) => void;
  importLeads: (leads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  deleteActivity: (id: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  getLeadActivities: (leadId: string) => Activity[];
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

// Helpers to map camelCase <-> snake_case
const toCamelCompany = (d: any): Company => ({ ...d, createdAt: d.created_at, updatedAt: d.updated_at });
const toCamelContact = (d: any): Contact => ({ ...d, companyId: d.company_id, createdAt: d.created_at, updatedAt: d.updated_at });
const toCamelLead = (d: any): Lead => ({ ...d, companyId: d.company_id, createdAt: d.created_at, updatedAt: d.updated_at });
const toCamelTask = (d: any): Task => ({ ...d, leadId: d.lead_id, contactId: d.contact_id, dueDate: d.due_date, createdAt: d.created_at, updatedAt: d.updated_at });
const toCamelActivity = (d: any): Activity => ({ ...d, leadId: d.lead_id, contactId: d.contact_id, companyId: d.company_id, createdAt: d.created_at });

export function CRMProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<Settings>({
    sidebarCollapsed: false,
    pipelineStages: DEFAULT_PIPELINE_STAGES,
  });

  const loadData = async () => {
    if (!session?.user) return;
    
    const [cRes, cnRes, lRes, tRes, aRes, sRes] = await Promise.all([
      supabase.from('companies').select('*'),
      supabase.from('contacts').select('*'),
      supabase.from('leads').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('activities').select('*'),
      supabase.from('settings').select('*').eq('user_id', session.user.id).single()
    ]);

    if (cRes.data) setCompanies(cRes.data.map(toCamelCompany));
    if (cnRes.data) setContacts(cnRes.data.map(toCamelContact));
    if (lRes.data) setLeads(lRes.data.map(toCamelLead));
    if (tRes.data) setTasks(tRes.data.map(toCamelTask));
    if (aRes.data) setActivities(aRes.data.map(toCamelActivity));
    
    if (sRes.data) {
      setSettings({
        sidebarCollapsed: sRes.data.sidebar_collapsed,
        pipelineStages: sRes.data.pipeline_stages
      });
    } else {
      // Create initial settings
      await supabase.from('settings').insert({
        user_id: session.user.id,
        sidebar_collapsed: false,
        pipeline_stages: DEFAULT_PIPELINE_STAGES
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [session]);

  // Lead operations
  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = uuidv4();
    const newLead = { ...lead, id: newId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setLeads([newLead, ...leads]);
    
    await supabase.from('leads').insert({
      id: newId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company_id: lead.companyId,
      position: lead.position,
      value: lead.value,
      stage: lead.stage,
      tags: lead.tags,
      notes: lead.notes,
      avatar: lead.avatar
    });
    
    addActivity({
      type: 'note',
      title: 'Lead created',
      description: `Created new lead: ${lead.name}`,
      leadId: newId,
    });
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    setLeads(leads.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
    const payload: any = { ...updates };
    if (payload.companyId !== undefined) { payload.company_id = payload.companyId; delete payload.companyId; }
    await supabase.from('leads').update(payload).eq('id', id);
  };

  const deleteLead = async (id: string) => {
    setLeads(leads.filter((lead) => lead.id !== id));
    await supabase.from('leads').delete().eq('id', id);
  };

  const moveLead = (id: string, stage: Stage) => {
    const lead = leads.find(l => l.id === id);
    const oldStage = lead?.stage;
    updateLead(id, { stage });
    if (oldStage !== stage) {
      addActivity({ type: 'note', title: 'Stage changed', description: `Moved from ${oldStage} to ${stage}`, leadId: id });
    }
  };

  const importLeads = async (newLeads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const imported = newLeads.map((lead) => ({ ...lead, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    setLeads((prev) => [...imported, ...prev]);
    const payload = imported.map((l: any) => ({
      id: l.id, name: l.name, email: l.email, phone: l.phone, company_id: l.companyId,
      position: l.position, value: l.value, stage: l.stage, tags: l.tags, notes: l.notes, avatar: l.avatar
    }));
    await supabase.from('leads').insert(payload);
  };

  // Company operations
  const addCompany = async (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = uuidv4();
    const newCompany = { ...company, id: newId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setCompanies([newCompany, ...companies]);
    await supabase.from('companies').insert({ id: newId, ...company });
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    await supabase.from('companies').update({ ...updates }).eq('id', id);
  };

  const deleteCompany = async (id: string) => {
    setCompanies(companies.filter((company) => company.id !== id));
    await supabase.from('companies').delete().eq('id', id);
  };

  // Contact operations
  const addContact = async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = uuidv4();
    const newContact = { ...contact, id: newId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setContacts([newContact, ...contacts]);
    await supabase.from('contacts').insert({
      id: newId, name: contact.name, email: contact.email, phone: contact.phone, 
      company_id: contact.companyId, position: contact.position, avatar: contact.avatar, notes: contact.notes
    });
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    const payload: any = { ...updates };
    if (payload.companyId !== undefined) { payload.company_id = payload.companyId; delete payload.companyId; }
    await supabase.from('contacts').update(payload).eq('id', id);
  };

  const deleteContact = async (id: string) => {
    setContacts(contacts.filter((contact) => contact.id !== id));
    await supabase.from('contacts').delete().eq('id', id);
  };

  // Task operations
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = uuidv4();
    const newTask = { ...task, id: newId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setTasks([newTask, ...tasks]);
    await supabase.from('tasks').insert({
      id: newId, title: task.title, description: task.description, lead_id: task.leadId,
      contact_id: task.contactId, due_date: task.dueDate, completed: task.completed, priority: task.priority
    });
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    const payload: any = { ...updates };
    if (payload.leadId !== undefined) { payload.lead_id = payload.leadId; delete payload.leadId; }
    if (payload.contactId !== undefined) { payload.contact_id = payload.contactId; delete payload.contactId; }
    if (payload.dueDate !== undefined) { payload.due_date = payload.dueDate; delete payload.dueDate; }
    await supabase.from('tasks').update(payload).eq('id', id);
  };

  const deleteTask = async (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  };

  // Activity operations
  const addActivity = async (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const newId = uuidv4();
    const newActivity = { ...activity, id: newId, createdAt: new Date().toISOString() };
    setActivities([newActivity, ...activities]);
    await supabase.from('activities').insert({
      id: newId, type: activity.type, title: activity.title, description: activity.description,
      lead_id: activity.leadId, contact_id: activity.contactId, company_id: activity.companyId
    });
  };

  const deleteActivity = async (id: string) => {
    setActivities(activities.filter((activity) => activity.id !== id));
    await supabase.from('activities').delete().eq('id', id);
  };

  const getLeadActivities = (leadId: string) => {
    return activities.filter(a => a.leadId === leadId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    const payload: any = {};
    if (updates.sidebarCollapsed !== undefined) payload.sidebar_collapsed = updates.sidebarCollapsed;
    if (updates.pipelineStages !== undefined) payload.pipeline_stages = updates.pipelineStages;
    if (session?.user) {
      await supabase.from('settings').update(payload).eq('user_id', session.user.id);
    }
  };

  return (
    <CRMContext.Provider
      value={{
        leads, companies, contacts, tasks, activities, settings,
        addLead, updateLead, deleteLead, moveLead, importLeads,
        addCompany, updateCompany, deleteCompany,
        addContact, updateContact, deleteContact,
        addTask, updateTask, deleteTask,
        addActivity, deleteActivity,
        updateSettings, getLeadActivities,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within CRMProvider');
  }
  return context;
}
