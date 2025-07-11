import React from 'react';

const ThankYouPage: React.FC = () => {
  return (
    <div style={{ 
      background: 'var(--color-bg)', 
      minHeight: '100vh', 
      padding: 'var(--space-4)',
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <div style={{ 
        background: 'var(--color-bg)', 
        border: '1px solid var(--color-border)', 
        borderRadius: 'var(--radius-lg)', 
        padding: 'var(--space-6)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: 'var(--space-4)',
          color: 'var(--color-primary)'
        }}>
          ✓
        </div>
        
        <h1 style={{ 
          color: 'var(--color-primary)', 
          marginBottom: 'var(--space-4)', 
          fontSize: '2rem',
          fontWeight: '600'
        }}>
          Thank You!
        </h1>
        
        <p style={{ 
          fontSize: '1.125rem',
          lineHeight: '1.6',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-4)'
        }}>
          Thank you for submitting your order. We have received your request and will be in touch with you shortly to confirm the details.
        </p>
        
        <p style={{ 
          fontSize: '1rem',
          color: 'var(--color-text)',
          opacity: '0.8'
        }}>
          If you have any questions, please don't hesitate to contact us.
        </p>
      </div>
    </div>
  );
};

export default ThankYouPage; 