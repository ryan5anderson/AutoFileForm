import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import '../../styles/college-pages.css';

const ThankYouPage: React.FC = () => {
  return (
    <div className="thank-you-container">
      <div className="college-page-header">
        <Header showBackButton={false} />
      </div>
      
      <div className="thank-you-card">
        <div style={{
          fontSize: '3rem',
          marginBottom: 'var(--space-4)',
          color: 'var(--color-primary)'
        }}>
          ✓
        </div>
        
        <h1>Thank You!</h1>
        
        <p>
          Thank you for submitting your order. We have received your request and will be in touch with you shortly to confirm the details.
        </p>
        
        <p>
          If you have any questions, please don't hesitate to contact us.
        </p>
        
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--space-4)',
          marginTop: 'var(--space-4)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-3)'
          }}>
            Contact Information
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            fontSize: '1rem',
            color: 'var(--color-text)'
          }}>
            <div style={{ fontWeight: '600' }}>
              Dana Anderson
            </div>
            <div>
              Collegiate Representative
            </div>
            <div>
              <a href="mailto:Dana@ohiopyleprints.com" style={{ 
                color: 'var(--color-primary)', 
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Dana@ohiopyleprints.com
              </a>
            </div>
            <div>
              <a href="tel:724-562-2764" style={{ 
                color: 'var(--color-primary)', 
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                724-562-2764
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ThankYouPage; 