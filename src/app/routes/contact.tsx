import React from 'react';

import Footer from '../layout/Footer';
import Header from '../layout/Header';

const ContactPage: React.FC = () => {
  return (
    <div className="summary-page-container">
      <div className="college-page-header">
        <Header />
      </div>
      <main className="summary-page-main" style={{ maxWidth: 800 }}>
        <h1 style={{ color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>Contact Us</h1>
        <div className="summary-card" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 style={{ marginTop: 0 }}>Representative</h2>
          <p><strong>Dana Anderson</strong><br />Collegiate Representative</p>
          <p>
            <a href="mailto:Dana@ohiopyleprints.com">Dana@ohiopyleprints.com</a><br />
            <a href="tel:7245622764">724-562-2764</a>
          </p>
        </div>
        <div className="summary-card">
          <h2 style={{ marginTop: 0 }}>General Contact</h2>
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


