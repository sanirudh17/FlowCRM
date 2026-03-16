import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
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

const STORAGE_KEY = 'flowcrm_data';

const generateSampleData = () => {
  const now = new Date();
  
  const companies: Company[] = [
    {
      id: uuidv4(),
      name: 'TechStart',
      domain: 'techstart.io',
      industry: 'Technology',
      size: '10-50',
      phone: '+1 (555) 100-0001',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'GrowthLabs',
      domain: 'growthlabs.com',
      industry: 'Marketing',
      size: '50-200',
      phone: '+1 (555) 100-0002',
      createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'DesignCo',
      domain: 'designco.io',
      industry: 'Design',
      size: '1-10',
      phone: '+1 (555) 100-0003',
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'InnovateTech',
      domain: 'innovate.tech',
      industry: 'Technology',
      size: '201-500',
      phone: '+1 (555) 100-0004',
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'CloudNine',
      domain: 'cloudnine.io',
      industry: 'SaaS',
      size: '11-50',
      phone: '+1 (555) 100-0005',
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'FinTech Pro',
      domain: 'fintechpro.com',
      industry: 'Finance',
      size: '50-200',
      phone: '+1 (555) 100-0006',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  const leads: Lead[] = [
    {
      id: uuidv4(),
      name: 'Sarah Chen',
      email: 'sarah@techstart.io',
      phone: '+1 (555) 123-4567',
      companyId: companies[0].id,
      position: 'CEO',
      value: 25000,
      stage: 'lead',
      tags: ['enterprise', 'hot'],
      notes: 'Interested in enterprise plan',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Marcus Johnson',
      email: 'marcus@growthlabs.com',
      phone: '+1 (555) 234-5678',
      companyId: companies[1].id,
      position: 'VP Sales',
      value: 45000,
      stage: 'contacted',
      tags: ['startup', 'qualified'],
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Emily Rodriguez',
      email: 'emily@designco.io',
      phone: '+1 (555) 345-6789',
      companyId: companies[2].id,
      position: 'Founder',
      value: 15000,
      stage: 'qualified',
      tags: ['creative', 'hot'],
      notes: 'Demo scheduled for next week',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'David Kim',
      email: 'david@innovate.tech',
      companyId: companies[3].id,
      position: 'CTO',
      value: 75000,
      stage: 'proposal',
      tags: ['enterprise', 'vip'],
      notes: 'Sent custom proposal',
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Lisa Thompson',
      email: 'lisa@enterprise.com',
      position: 'Procurement Manager',
      value: 120000,
      stage: 'won',
      tags: ['enterprise', 'closed'],
      notes: 'Contract signed!',
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'James Wilson',
      email: 'james@startupxyz.com',
      position: 'CEO',
      value: 8000,
      stage: 'lost',
      tags: ['startup', 'cold'],
      notes: 'Budget constraints',
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Anna Martinez',
      email: 'anna@cloudnine.io',
      phone: '+1 (555) 456-7890',
      companyId: companies[4].id,
      position: 'Head of Operations',
      value: 35000,
      stage: 'lead',
      tags: ['saas', 'warm'],
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Michael Brown',
      email: 'michael@fintechpro.com',
      companyId: companies[5].id,
      position: 'CFO',
      value: 95000,
      stage: 'qualified',
      tags: ['fintech', 'enterprise'],
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Jennifer Lee',
      email: 'jennifer@techstart.io',
      phone: '+1 (555) 567-8901',
      companyId: companies[0].id,
      position: 'Product Manager',
      value: 18000,
      stage: 'contacted',
      tags: ['product', 'warm'],
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Robert Taylor',
      email: 'robert@growthlabs.com',
      phone: '+1 (555) 678-9012',
      companyId: companies[1].id,
      position: 'Marketing Director',
      value: 22000,
      stage: 'lead',
      tags: ['marketing', 'new'],
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  const contacts: Contact[] = [
    {
      id: uuidv4(),
      name: 'Sarah Chen',
      email: 'sarah@techstart.io',
      phone: '+1 (555) 123-4567',
      companyId: companies[0].id,
      position: 'CEO',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Marcus Johnson',
      email: 'marcus@growthlabs.com',
      phone: '+1 (555) 234-5678',
      companyId: companies[1].id,
      position: 'VP Sales',
      createdAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Emily Rodriguez',
      email: 'emily@designco.io',
      phone: '+1 (555) 345-6789',
      companyId: companies[2].id,
      position: 'Founder',
      createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'David Kim',
      email: 'david@innovate.tech',
      companyId: companies[3].id,
      position: 'CTO',
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Lisa Thompson',
      email: 'lisa@enterprise.com',
      companyId: undefined,
      position: 'Procurement Manager',
      createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Anna Martinez',
      email: 'anna@cloudnine.io',
      phone: '+1 (555) 456-7890',
      companyId: companies[4].id,
      position: 'Head of Operations',
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Michael Brown',
      email: 'michael@fintechpro.com',
      companyId: companies[5].id,
      position: 'CFO',
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Jennifer Lee',
      email: 'jennifer@techstart.io',
      phone: '+1 (555) 567-8901',
      companyId: companies[0].id,
      position: 'Product Manager',
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Robert Taylor',
      email: 'robert@growthlabs.com',
      phone: '+1 (555) 678-9012',
      companyId: companies[1].id,
      position: 'Marketing Director',
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Amanda White',
      email: 'amanda@cloudnine.io',
      phone: '+1 (555) 789-0123',
      companyId: companies[4].id,
      position: 'Sales Rep',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Kevin Park',
      email: 'kevin@fintechpro.com',
      phone: '+1 (555) 890-1234',
      companyId: companies[5].id,
      position: 'VP Engineering',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  const tasks: Task[] = [
    {
      id: uuidv4(),
      title: 'Follow up with Sarah',
      description: 'Send enterprise pricing',
      leadId: leads[0].id,
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      priority: 'high',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Prepare demo for Emily',
      description: 'Customize dashboard demo',
      leadId: leads[2].id,
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      priority: 'medium',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Send proposal to David',
      leadId: leads[3].id,
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      completed: true,
      priority: 'high',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Schedule call with Marcus',
      description: 'Discuss renewal options',
      leadId: leads[1].id,
      dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      priority: 'medium',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Send invoice to Lisa',
      description: 'For the enterprise contract',
      leadId: leads[4].id,
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completed: true,
      priority: 'high',
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Follow up with Anna',
      description: 'Check if they need more info',
      leadId: leads[6].id,
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      priority: 'low',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Prepare case study',
      description: 'For Michael - fintech use case',
      leadId: leads[7].id,
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      priority: 'medium',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Review contract terms',
      description: 'Legal review for TechStart',
      leadId: leads[0].id,
      dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      priority: 'high',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  const activities: Activity[] = [
    {
      id: uuidv4(),
      type: 'call',
      title: 'Discovery call with Sarah',
      description: 'Discussed enterprise requirements',
      leadId: leads[0].id,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      type: 'email',
      title: 'Sent pricing to Marcus',
      description: 'Standard pricing deck attached',
      leadId: leads[1].id,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      type: 'note',
      title: 'Demo feedback from Emily',
      description: 'Loved the UI, wants custom branding',
      leadId: leads[2].id,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      type: 'meeting',
      title: 'Proposal review with David',
      description: 'Wants to discuss customization options',
      leadId: leads[3].id,
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      type: 'email',
      title: 'Contract sent to Lisa',
      description: 'Waiting for legal review',
      leadId: leads[4].id,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      type: 'call',
      title: 'Follow up call with Anna',
      leadId: leads[6].id,
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return { leads, companies, contacts, tasks, activities };
};

export function CRMProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<Settings>({
    sidebarCollapsed: false,
    pipelineStages: DEFAULT_PIPELINE_STAGES,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setLeads(data.leads || []);
        setCompanies(data.companies || []);
        setContacts(data.contacts || []);
        setTasks(data.tasks || []);
        setActivities(data.activities || []);
        setSettings(data.settings || { sidebarCollapsed: false, pipelineStages: DEFAULT_PIPELINE_STAGES });
      } catch {
        const sample = generateSampleData();
        setLeads(sample.leads);
        setCompanies(sample.companies);
        setContacts(sample.contacts);
        setTasks(sample.tasks);
        setActivities(sample.activities);
      }
    } else {
      const sample = generateSampleData();
      setLeads(sample.leads);
      setCompanies(sample.companies);
      setContacts(sample.contacts);
      setTasks(sample.tasks);
      setActivities(sample.activities);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        leads, companies, contacts, tasks, activities, settings 
      }));
    }
  }, [leads, companies, contacts, tasks, activities, settings, isLoaded]);

  // Lead operations
  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    
    // Add activity
    addActivity({
      type: 'note',
      title: 'Lead created',
      description: `Created new lead: ${newLead.name}`,
      leadId: newLead.id,
    });
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
          : lead
      )
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  };

  const moveLead = (id: string, stage: Stage) => {
    const lead = leads.find(l => l.id === id);
    const oldStage = lead?.stage;
    updateLead(id, { stage });
    
    if (oldStage !== stage) {
      addActivity({
        type: 'note',
        title: 'Stage changed',
        description: `Moved from ${oldStage} to ${stage}`,
        leadId: id,
      });
    }
  };

  const importLeads = (newLeads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const imported = newLeads.map((lead) => ({
      ...lead,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setLeads((prev) => [...imported, ...prev]);
  };

  // Company operations
  const addCompany = (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCompany: Company = {
      ...company,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCompanies((prev) => [newCompany, ...prev]);
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === id
          ? { ...company, ...updates, updatedAt: new Date().toISOString() }
          : company
      )
    );
  };

  const deleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((company) => company.id !== id));
  };

  // Contact operations
  const addContact = (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContact: Contact = {
      ...contact,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setContacts((prev) => [newContact, ...prev]);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id
          ? { ...contact, ...updates, updatedAt: new Date().toISOString() }
          : contact
      )
    );
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  // Task operations
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Activity operations
  const addActivity = (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const newActivity: Activity = {
      ...activity,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
  };

  const getLeadActivities = (leadId: string) => {
    return activities.filter(a => a.leadId === leadId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        companies,
        contacts,
        tasks,
        activities,
        settings,
        addLead,
        updateLead,
        deleteLead,
        moveLead,
        importLeads,
        addCompany,
        updateCompany,
        deleteCompany,
        addContact,
        updateContact,
        deleteContact,
        addTask,
        updateTask,
        deleteTask,
        addActivity,
        deleteActivity,
        updateSettings,
        getLeadActivities,
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
