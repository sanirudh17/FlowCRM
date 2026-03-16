import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import styles from './DeleteModal.module.css';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  itemName?: string;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, title = 'Delete Confirmation', message, itemName }: DeleteModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
          >
            <div className={styles.iconWrapper}>
              <AlertTriangle size={24} />
            </div>
            
            <h2 className={styles.title}>{title}</h2>
            
            <p className={styles.message}>
              {message}
              {itemName && <strong> "{itemName}"</strong>}
            </p>

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button className={styles.deleteBtn} onClick={handleConfirm}>
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
