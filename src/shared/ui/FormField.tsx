import React from 'react';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  id?: string;
  htmlFor?: string;
  helpText?: string;
  error?: string;
  inline?: boolean;
  align?: 'start' | 'end';
  className?: string;
  required?: boolean;
  stickyLabel?: boolean;
  style?: React.CSSProperties;
}

interface ResponsiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: boolean;
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal' | 'search';
  style?: React.CSSProperties;
}

interface ResponsiveTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  error?: boolean;
  autoResize?: boolean;
  style?: React.CSSProperties;
}

interface ResponsiveSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  className?: string;
  error?: boolean;
  style?: React.CSSProperties;
}

// Helper function to build CSS class names
const buildFormFieldClassName = (className?: string): string => {
  const classes = [styles.formField];
  
  if (className) {
    classes.push(className);
  }
  
  return classes.join(' ');
};

const FormField: React.FC<FormFieldProps> & {
  Input: React.FC<ResponsiveInputProps>;
  Textarea: React.FC<ResponsiveTextareaProps>;
  Select: React.FC<ResponsiveSelectProps>;
} = ({ 
  label, 
  children, 
  id,
  htmlFor, 
  helpText, 
  error, 
  inline = false, 
  align = 'start',
  className = '',
  required = false,
  stickyLabel = false,
  style
}) => {
  const fieldId = id || htmlFor;
  const helpTextId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;

  return (
    <div 
      className={buildFormFieldClassName(className)}
      data-inline={inline}
      data-align={align}
      data-has-error={!!error}
      data-sticky-label={stickyLabel}
      style={style}
      id={fieldId}
    >
      <label 
        className={styles.formFieldLabel}
        htmlFor={htmlFor}
        data-inline={inline}
        data-required={required}
        data-sticky={stickyLabel}
      >
        {label}
      </label>
      <div className={styles.formFieldControl}>
        {React.isValidElement(children) ? 
          React.cloneElement(children as React.ReactElement<any>, {
            'aria-describedby': error ? errorId : helpText ? helpTextId : undefined,
            'aria-invalid': error ? 'true' : undefined,
            error: !!error
          }) : children
        }
        {helpText && !error && (
          <div className={styles.formFieldHelpText} id={helpTextId}>
            {helpText}
          </div>
        )}
        {error && (
          <div className={styles.formFieldErrorText} id={errorId} role="alert" aria-live="polite">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to build input class names
const buildInputClassName = (className?: string): string => {
  const classes = [styles.formInput];
  
  if (className) {
    classes.push(className);
  }
  
  return classes.join(' ');
};

// Helper function to build textarea class names
const buildTextareaClassName = (className?: string): string => {
  const classes = [styles.formTextarea];
  
  if (className) {
    classes.push(className);
  }
  
  return classes.join(' ');
};

// Helper function to build select class names
const buildSelectClassName = (className?: string): string => {
  const classes = [styles.formSelect];
  
  if (className) {
    classes.push(className);
  }
  
  return classes.join(' ');
};

const FormInput: React.FC<ResponsiveInputProps> = ({ 
  className = '', 
  error, 
  inputMode,
  type = 'text',
  style,
  ...props 
}) => {
  // Set appropriate inputMode based on type if not explicitly provided
  const getInputMode = () => {
    if (inputMode) return inputMode;
    
    switch (type) {
      case 'email': return 'email';
      case 'tel': return 'tel';
      case 'url': return 'url';
      case 'number': return 'numeric';
      case 'search': return 'search';
      default: return 'text';
    }
  };

  return (
    <input 
      className={buildInputClassName(className)}
      data-error={error}
      type={type}
      inputMode={getInputMode()}
      style={style}
      {...props}
    />
  );
};

const FormTextarea: React.FC<ResponsiveTextareaProps> = ({ 
  className = '', 
  error, 
  autoResize = false,
  style,
  ...props 
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize functionality
  React.useEffect(() => {
    if (!autoResize || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener('input', adjustHeight);
    adjustHeight(); // Initial adjustment

    return () => textarea.removeEventListener('input', adjustHeight);
  }, [autoResize]);

  return (
    <textarea 
      ref={textareaRef}
      className={buildTextareaClassName(className)}
      data-error={error}
      data-auto-resize={autoResize}
      style={style}
      {...props}
    />
  );
};

const FormSelect: React.FC<ResponsiveSelectProps> = ({ 
  children, 
  className = '', 
  error, 
  style,
  ...props 
}) => {
  return (
    <select 
      className={buildSelectClassName(className)}
      data-error={error}
      style={style}
      {...props}
    >
      {children}
    </select>
  );
};

FormField.Input = FormInput;
FormField.Textarea = FormTextarea;
FormField.Select = FormSelect;

export default FormField;