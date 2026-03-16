import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, CheckSquare, Trash2, Edit2, X, Calendar, Flag, Circle, CheckCircle2 } from 'lucide-react';
import { useCRM } from '../store/CRMContext';
import { Task } from '../types';
import { formatDate, getInitials } from '../utils';
import Modal from '../components/Modal';
import DeleteModal from '../components/DeleteModal';
import styles from './Tasks.module.css';

export default function Tasks() {
  const { tasks, leads, addTask, updateTask, deleteTask } = useCRM();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    leadId: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime();
  });

  const getLeadName = (leadId?: string) => {
    if (!leadId) return null;
    return leads.find(l => l.id === leadId)?.name;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    const taskData = {
      ...form,
      completed: false,
      dueDate: form.dueDate || undefined,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setIsModalOpen(false);
    setEditingTask(null);
    setForm({ title: '', description: '', leadId: '', dueDate: '', priority: 'medium' });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      leadId: task.leadId || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority,
    });
    setIsModalOpen(true);
  };

  const handleToggleComplete = (task: Task) => {
    updateTask(task.id, { completed: !task.completed });
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#8A8A8D';
    }
  };

  return (
    <motion.div className={styles.page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className={styles.header}>
        <div>
          <h1>Tasks</h1>
          <p>{tasks.filter(t => !t.completed).length} pending, {tasks.filter(t => t.completed).length} completed</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={16} strokeWidth={1.5} />
          Add Task
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterTabs}>
          <button className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`${styles.filterTab} ${filter === 'pending' ? styles.active : ''}`} onClick={() => setFilter('pending')}>Pending</button>
          <button className={`${styles.filterTab} ${filter === 'completed' ? styles.active : ''}`} onClick={() => setFilter('completed')}>Completed</button>
        </div>
      </div>

      <div className={styles.taskList}>
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <button className={styles.checkbox} onClick={() => handleToggleComplete(task)}>
              {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>
            <div className={styles.taskContent}>
              <div className={styles.taskHeader}>
                <span className={styles.taskTitle}>{task.title}</span>
                <Flag size={12} style={{ color: getPriorityColor(task.priority) }} />
              </div>
              {task.description && <p className={styles.taskDesc}>{task.description}</p>}
              <div className={styles.taskMeta}>
                {task.leadId && <span className={styles.lead}><span className={styles.dot} />{getLeadName(task.leadId)}</span>}
                {task.dueDate && <span className={styles.dueDate}><Calendar size={12} />{formatDate(task.dueDate)}</span>}
              </div>
            </div>
            <div className={styles.taskActions}>
              <button onClick={() => handleEdit(task)}><Edit2 size={14} /></button>
              <button onClick={() => handleDeleteClick(task)}><Trash2 size={14} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className={styles.emptyState}>
          <CheckSquare size={48} strokeWidth={1} />
          <p>No tasks found</p>
          <button onClick={() => setIsModalOpen(true)}>Create your first task</button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        title={editingTask ? 'Edit Task' : 'Add Task'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Follow up with..." required />
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Add details..." rows={3} />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Lead</label>
              <select value={form.leadId} onChange={e => setForm({...form, leadId: e.target.value})}>
                <option value="">Select lead</option>
                {leads.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Priority</label>
            <div className={styles.priorityOptions}>
              {(['low', 'medium', 'high'] as const).map(p => (
                <button key={p} type="button" className={`${styles.priorityBtn} ${form.priority === p ? styles.active : ''}`} onClick={() => setForm({...form, priority: p})}>
                  <Flag size={12} style={{ color: getPriorityColor(p) }} />{p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingTask(null); }}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>{editingTask ? 'Save Changes' : 'Add Task'}</button>
          </div>
        </form>
      </Modal>

      <DeleteModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this task?"
        itemName={taskToDelete?.title}
      />
    </motion.div>
  );
}
