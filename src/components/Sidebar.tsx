import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Building2,
  UserCircle,
  CheckSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
} from 'lucide-react';
import { useCRM } from '../store/CRMContext';
import { useAuth } from '../store/AuthContext';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/pipeline', icon: GitBranch, label: 'Pipeline' },
  { path: '/leads', icon: Users, label: 'Leads' },
  { path: '/companies', icon: Building2, label: 'Companies' },
  { path: '/contacts', icon: UserCircle, label: 'Contacts' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
];

const bottomNavItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { settings, updateSettings } = useCRM();
  const { signOut } = useAuth();
  const location = useLocation();
  const collapsed = settings.sidebarCollapsed;

  return (
    <motion.aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.logo}>
        <motion.div
          className={styles.logoIcon}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap size={24} strokeWidth={1.5} />
        </motion.div>
        {!collapsed && (
          <motion.span
            className={styles.logoText}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            FlowCRM
          </motion.span>
        )}
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              {isActive && (
                <motion.div
                  className={styles.activeIndicator}
                  layoutId="activeNav"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon size={20} strokeWidth={1.5} />
              <motion.span
                className={styles.navLabel}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -10 : 0 }}
                transition={{ delay: 0.1 }}
                style={{ display: collapsed ? 'none' : 'block' }}
              >
                {item.label}
              </motion.span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.bottomNav}>
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              {isActive && (
                <motion.div
                  className={styles.activeIndicator}
                  layoutId="activeNav"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon size={20} strokeWidth={1.5} />
              <motion.span
                className={styles.navLabel}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -10 : 0 }}
                transition={{ delay: 0.1 }}
                style={{ display: collapsed ? 'none' : 'block' }}
              >
                {item.label}
              </motion.span>
            </NavLink>
          );
        })}

        <button
          className={styles.navItem}
          onClick={() => signOut()}
          style={{ width: '100%', border: 'none', background: 'none' }}
        >
          <LogOut size={20} strokeWidth={1.5} />
          <motion.span
            className={styles.navLabel}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -10 : 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: collapsed ? 'none' : 'block' }}
          >
            Sign Out
          </motion.span>
        </button>

        <button
          className={styles.collapseBtn}
          onClick={() => updateSettings({ sidebarCollapsed: !collapsed })}
        >
          {collapsed ? (
            <ChevronRight size={18} strokeWidth={1.5} />
          ) : (
            <ChevronLeft size={18} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
