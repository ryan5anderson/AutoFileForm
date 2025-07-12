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
      <div style={{
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-4)',
        flexWrap: 'wrap'
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

        {/* Center - Michigan State */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto'
        }}>
          <img
            src={process.env.PUBLIC_URL + '/logo/michiganstatelogo.png'}
            alt="Michigan State University"
            style={{
              height: 'clamp(30px, 5vw, 50px)',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Right side - Ohiopyle81 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flex: '1 1 auto',
          minWidth: 0
        }}>
          <img
            src={process.env.PUBLIC_URL + '/logo/ohiopyle81.png'}
            alt="Ohiopyle81"
            style={{
              height: 'clamp(30px, 5vw, 50px)',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header; 