import React from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  // Show back button if legacy prop is used and no sidebar toggle is provided
  const shouldShowBackButton = showBackButton && !showSidebarToggle;
  return (
    <header style={{
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      padding: 'var(--space-4)',
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Logo Section */}
      <div style={{
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-4)',
        flexWrap: 'wrap',
        marginBottom: 'var(--space-3)'
      }}>
        {/* Left side - Sidebar Toggle and Campus Traditions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flex: '1 1 auto',
          minWidth: 0,
          gap: 'var(--space-3)'
        }}>
          {showSidebarToggle && (
            <button
              onClick={onSidebarToggle}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: 'var(--space-2) var(--space-3)',
                cursor: 'pointer',
                color: 'var(--color-text)',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                transition: 'all 0.2s ease',
                minWidth: '44px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-primary)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--color-text)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
              aria-label="Open navigation menu"
            >
              ☰
            </button>
          )}
          {shouldShowBackButton && (
            <button
              onClick={handleBackClick}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: 'var(--space-2) var(--space-3)',
                cursor: 'pointer',
                color: 'var(--color-text)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-primary)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--color-text)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              ← Back to Colleges
            </button>
          )}
          <img
            src={process.env.PUBLIC_URL + '/logo/campustraditions.png'}
            alt="Campus Traditions"
            style={{
              height: 'clamp(30px, 5vw, 50px)',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Right side - OPI Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flex: '1 1 auto',
          minWidth: 0
        }}>
          <img
            src={process.env.PUBLIC_URL + '/logo/opi-logo-no-bg.png'}
            alt="OPI"
            style={{
              height: 'clamp(30px, 5vw, 50px)',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>

      {/* Contact Information Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'var(--space-4)',
        fontSize: '0.875rem',
        color: 'var(--color-text)',
        flexWrap: 'wrap',
        textAlign: 'center'
      }}>
        <div style={{ fontWeight: '600' }}>
          Dana Anderson
        </div>
        <div>
          Collegiate Representative
        </div>
        <div>
          <a href="mailto:Dana@ohiopyleprints.com" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            Dana@ohiopyleprints.com
          </a>
        </div>
        <div>
          <a href="tel:724-562-2764" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            724-562-2764
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header; 