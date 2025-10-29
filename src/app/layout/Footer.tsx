import React from 'react';

import { asset } from '../../utils/asset';

const Footer: React.FC = () => {
  return (
    <footer style={{
      background: 'var(--color-bg)',
      borderTop: '1px solid var(--color-border)',
      padding: 'var(--space-4)',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-4)',
        flexWrap: 'wrap'
      }}>
        {/* Left side - Ohiopyle81 logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          <img
            src={asset('logo/ohiopyle81.png')}
            alt="Ohiopyle81"
            style={{
              height: '40px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Right side - Contact information */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          fontSize: '0.875rem',
          color: 'var(--color-text)',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: '500' }}>
            Phone: 800.365.7365
          </span>
          <span style={{ fontWeight: '500' }}>
            Email: MyTown@ohiopyleprints.com
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 