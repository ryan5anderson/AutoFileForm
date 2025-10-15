import React from 'react';
import styles from './FormContainer.module.css';

interface FormContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({ children, title, className }) => {
  return (
    <div className={`${styles.formContainer} ${className || ''}`}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default FormContainer;