import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { asset } from '../../shared/utils/asset';
import styles from '../../shared/ui/Header.module.css';

interface HeaderProps {
  showSidebarToggle?: boolean;
  onSidebarToggle?: () => void;
  showBackButton?: boolean; // Legacy prop for backward compatibility
  onMenuToggle?: (triggerRef: React.RefObject<HTMLElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  showSidebarToggle = false, 
  onSidebarToggle,
  showBackButton = false,
  onMenuToggle
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle hamburger menu toggle
  const handleHamburger = () => {
    if (onMenuToggle) {
      // Use new responsive pattern
      setIsMenuOpen(prev => !prev);
      onMenuToggle(menuButtonRef as React.RefObject<HTMLElement>);
    } else {
      // Fallback to legacy pattern
      window.dispatchEvent(new CustomEvent('global-sidebar-toggle'));
    }
  };

  // Handle Escape key for menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isMenuOpen]);

  return (
    <header 
      role="banner"
      className={styles.header}
    >
      {/* Left: Hamburger */}
      <div className={styles.leftSection}>
        <button
          ref={menuButtonRef}
          onClick={handleHamburger}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="main-nav"
          className={styles.menuButton}
          type="button"
        >
          <span className="visually-hidden">Menu</span>
          <span aria-hidden="true">☰</span>
        </button>
      </div>

      {/* Center: Logos */}
      <div className={styles.centerSection}>
        <Link 
          to="/" 
          className={styles.logoLink}
          aria-label="Go to homepage"
        >
          <img 
            src={asset('logo/campustraditions.png')} 
            alt="Campus Traditions" 
            className={styles.logo}
          />
          <img 
            src={asset('logo/opi-logo-no-bg.png')} 
            alt="Ohiopyle Prints" 
            className={styles.logoSecondary}
          />
        </Link>
      </div>

      {/* Right: Nav links - Hidden on mobile, shown on desktop */}
      <nav 
        id="main-nav"
        role="navigation"
        aria-label="Primary navigation"
        className={styles.rightSection}
      >
        <Link 
          to="/about" 
          className={styles.navLink}
        >
          About Us
        </Link>
        <Link 
          to="/contact" 
          className={styles.navLink}
        >
          Contact Us
        </Link>
      </nav>
    </header>
  );
};

export default Header; 