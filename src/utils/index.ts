import { Lead, Stage } from '../types';

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getLeadsByStage(leads: Lead[], stage: Stage): Lead[] {
  return leads.filter((lead) => lead.stage === stage);
}

export function getTotalValue(leads: Lead[]): number {
  return leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
}

export function getConversionRate(leads: Lead[]): number {
  const total = leads.filter((l) => l.stage === 'won' || l.stage === 'lost').length;
  const won = leads.filter((l) => l.stage === 'won').length;
  return total === 0 ? 0 : Math.round((won / total) * 100);
}

export function parseCSV(csvText: string): Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].toLowerCase().split(',').map((h) => h.trim());
  
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const lead: Record<string, string | string[] | number | undefined> = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      if (header === 'tags') {
        lead[header] = value ? value.split(';').map((t) => t.trim()) : [];
      } else if (header === 'value') {
        lead[header] = value ? parseInt(value, 10) : undefined;
      } else if (header === 'stage') {
        lead[header] = value as Stage || 'lead';
      } else {
        lead[header] = value || undefined;
      }
    });
    
    return {
      name: lead.name as string || 'Unknown',
      email: lead.email as string || '',
      phone: lead.phone as string | undefined,
      company: lead.company as string | undefined,
      position: lead.position as string | undefined,
      value: lead.value as number | undefined,
      stage: (lead.stage as Stage) || 'lead',
      tags: (lead.tags as string[]) || [],
      notes: lead.notes as string | undefined,
    };
  }).filter((lead) => lead.email);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
