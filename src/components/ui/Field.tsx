import React from 'react';

interface FieldProps {
  label: string;
  children: React.ReactNode;
  id?: string;
  htmlFor?: string;
  helpText?: string;
  error?: string;
  inline?: boolean;
  align?: 'start' | 'end';
  className?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  className?: string;
}

const Field: React.FC<FieldProps> & {
  Input: React.FC<InputProps>;
  Select: React.FC<SelectProps>;
} = ({ 
  label, 
  children, 
  id,
  htmlFor, 
  helpText, 
  error, 
  inline = false, 
  align = 'start',
  className = '' 
}) => {
  const fieldClasses = [
    'field',
    inline && 'field--inline',
    align === 'end' && 'field--align-end',
    error && 'field--error',
    className
  ].filter(Boolean).join(' ');

  const fieldId = id || htmlFor;

  return (
    <div className={fieldClasses} id={fieldId}>
      <label className="field__label" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="field__control">
        {children}
      </div>
      {helpText && !error && (
        <div className="field__help" id={`${fieldId}-help`}>
          {helpText}
        </div>
      )}
      {error && (
        <div className="field__error" id={`${fieldId}-error`} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

const FieldInput: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`field__input ${className}`}
      {...props}
    />
  );
};

const FieldSelect: React.FC<SelectProps> = ({ children, className = '', ...props }) => {
  return (
    <select 
      className={`field__select ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

Field.Input = FieldInput;
Field.Select = FieldSelect;

export default Field;
