import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { useCRM } from '../store/CRMContext';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { settings } = useCRM();
  const collapsed = settings.sidebarCollapsed;

  return (
    <div className={styles.layout}>
      <Sidebar />
      <motion.main
        className={styles.main}
        animate={{
          marginLeft: collapsed ? 72 : 260,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
