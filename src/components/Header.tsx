import React from 'react';

const Header: React.FC = () => {
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
        {/* Left side - Campus Traditions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flex: '1 1 auto',
          minWidth: 0
        }}>
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