import React from 'react';
import styles from './Field.module.css';

interface FieldProps {
  label?: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  htmlFor?: string;
}

const Field: React.FC<FieldProps> = ({ 
  label, 
  children, 
  error, 
  required, 
  className,
  htmlFor
}) => {
  return (
    <div className={`${styles.field} ${className || ''}`}>
      {label && (
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {children}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Field;