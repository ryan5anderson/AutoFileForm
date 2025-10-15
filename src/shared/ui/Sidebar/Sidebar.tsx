import React, { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useModalAccessibility } from '../../hooks/useAccessibility';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement> | null;
  children: React.ReactNode;
  title?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  title = 'Navigation'
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Focus trap for modal behavior
  const containerRef = useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    initialFocus: closeButtonRef.current,
    returnFocus: triggerRef?.current || undefined
  });

  // Body scroll lock when sidebar is open
  useBodyScrollLock({ isLocked: isOpen });

  // Enhanced accessibility for modal behavior
  const { containerRef: modalRef } = useModalAccessibility(isOpen, title);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Prevent rendering when closed for better performance
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={containerRef}
        className={styles.sidebar}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
        aria-describedby="sidebar-description"
      >
        <div className={styles.header}>
          <h2 id="sidebar-title" className={styles.title}>
            {title}
          </h2>
          <p id="sidebar-description" className="visually-hidden">
            Use arrow keys to navigate menu items, Escape to close
          </p>
          <button
            ref={closeButtonRef}
            className={`${styles.closeButton} close-button accessible-button focus-ring`}
            onClick={onClose}
            aria-label="Close navigation"
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className={styles.content} role="navigation" aria-label="Sidebar navigation">
          {children}
        </div>
      </div>
    </>
  );
};

export default Sidebar;