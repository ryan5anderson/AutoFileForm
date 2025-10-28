import React from 'react';
import { Link } from 'react-router-dom';

import { asset } from '../../utils/asset';

interface HeaderProps {
  showSidebarToggle?: boolean;
  onSidebarToggle?: () => void;
  showBackButton?: boolean; // Legacy prop for backward compatibility
}

const Header: React.FC<HeaderProps> = ({ 
  showSidebarToggle = false, 
  onSidebarToggle,
  showBackButton = false 
}) => {
  // Root-level header; hamburger toggles global sidebar
  const handleHamburger = () => {
    window.dispatchEvent(new CustomEvent('global-sidebar-toggle'));
  };

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid var(--color-border)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--space-4)',
      width: '100%',
      boxSizing: 'border-box',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      {/* Left: Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
        <button
          onClick={handleHamburger}
          aria-label="Open menu"
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            width: 40,
            height: 40,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          ☰
        </button>
      </div>

      {/* Center: Logos */}
      <div style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', pointerEvents: 'none' }}>
        <img src={asset('logo/campustraditions.png')} alt="Campus Traditions" style={{ height: 32, width: 'auto' }} />
        <img src={asset('logo/opi-logo-no-bg.png')} alt="Ohiopyle Prints" style={{ height: 28, width: 'auto' }} />
      </div>

      {/* Right: Nav links - Hidden on mobile */}
      <nav aria-label="Primary" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link to="/about" className="desktop-nav-link" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>About Us</Link>
        <Link to="/contact" className="desktop-nav-link" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Contact Us</Link>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav-link {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header; 