import React from 'react';
import { asset } from '../../shared/utils/asset';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Left side - Ohiopyle81 logo */}
        <div className={styles.logoSection}>
          <img
            src={asset('logo/ohiopyle81.png')}
            alt="Ohiopyle81"
            className={styles.logo}
          />
        </div>

        {/* Right side - Contact information */}
        <div className={styles.contactSection}>
          <span className={styles.contactInfo}>
            Phone: 800.365.7365
          </span>
          <span className={styles.contactInfo}>
            Email: MyTown@ohiopyleprints.com
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 