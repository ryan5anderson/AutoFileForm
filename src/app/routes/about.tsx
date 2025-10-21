import React from 'react';
import Footer from '../layout/Footer';
import clsx from 'clsx';
import styles from './About.module.css';

const AboutPage: React.FC = () => {
  return (
    <div className="summary-page-container">
      <main className={clsx('summary-page-main', styles.main)}>

        <div className={clsx('summary-card', styles.card)}>
          <h2 className={styles.sectionTitle}>Campus Traditions Guaranteed Program</h2>
          <p>
            Campus Traditions partners with Ohiopyle Prints to provide a curated program of collegiate merchandise
            backed by dependable service and quality. Our streamlined process helps stores order confidently.
          </p>
        </div>
        
        <div className={clsx('summary-card', styles.card)}>
          <h3>Why this online order form?</h3>
          <p>
            This form supports multiple colleges, simplifies product selection, and ensures accuracy from store to production.
            Orders are grouped by product to make it easy to review and submit.
          </p>
        </div>
        
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;


