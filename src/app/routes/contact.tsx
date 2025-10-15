import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import styles from './Contact.module.css';

const ContactPage: React.FC = () => {
  return (
    <div className="summary-page-container">
      <div className="college-page-header">
        <Header />
      </div>
      <main className={`summary-page-main ${styles.main}`}>
        <h1 className={styles.title}>Contact Us</h1>
        <div className={`summary-card ${styles.card}`}>
          <h2 className={styles.sectionTitle}>Representative</h2>
          <p><strong>Dana Anderson</strong><br />Collegiate Representative</p>
          <p>
            <a href="mailto:Dana@ohiopyleprints.com">Dana@ohiopyleprints.com</a><br />
            <a href="tel:7245622764">724-562-2764</a>
          </p>
        </div>
        <div className="summary-card">
          <h2 className={styles.sectionTitle}>General Contact</h2>
          <p>
            <a href="tel:18008297460">1-800-829-7460</a><br />
            <a href="mailto:MyTown@ohiopyleprints.com">MyTown@ohiopyleprints.com</a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;


