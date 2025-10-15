import React from 'react';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message?: string;
  children?: React.ReactNode;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, children, className }) => {
  const content = message || children;
  
  return (
    <div className={`${styles.errorMessage} ${className || ''}`}>
      <span className={styles.icon}>⚠️</span>
      <span className={styles.text}>{content}</span>
    </div>
  );
};

export default ErrorMessage;