import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import styles from './About.module.css';

const AboutPage: React.FC = () => {
  return (
    <div className="summary-page-container">
      <div className="college-page-header">
        <Header />
      </div>
      <main className={`summary-page-main ${styles.main}`}>
        <h1 className={styles.title}>About Us</h1>
        <div className="summary-card">
          <h2 className={styles.sectionTitle}>Campus Traditions Guaranteed Program</h2>
          <p>
            Campus Traditions partners with Ohiopyle Prints to provide a curated program of collegiate merchandise
            backed by dependable service and quality. Our streamlined process helps stores order confidently.
          </p>
          <h3>Why this online order form?</h3>
          <p>
            This form supports multiple colleges, simplifies product selection, and ensures accuracy from store to production.
            Orders are grouped by product to make it easy to review and submit.
          </p>
          <h3>Packs of 7</h3>
          <p>
            Many garments are ordered in packs of 7 to optimize printing and inventory. The form guides you to valid pack totals.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;


