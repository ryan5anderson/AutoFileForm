import React, { useEffect } from 'react';
import '../../styles/modal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
  error?: string | null;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isProcessing = false,
  error = null
}) => {
  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen || isProcessing) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isProcessing, onCancel]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
    >
      <div className="modal-container">
        <div 
          className="modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-message"
        >
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <p id="modal-message" className="modal-message">
            {message}
          </p>
          
          {error && (
            <div className="modal-error" role="alert">
              {error}
            </div>
          )}
          
          {isProcessing && (
            <div className="modal-loading">
              <div className="modal-spinner" aria-label="Processing" />
              <span>Processing...</span>
            </div>
          )}
          
          <div className="modal-actions">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="modal-button modal-button--cancel"
              aria-label={cancelText}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing}
              className="modal-button modal-button--confirm"
              aria-label={confirmText}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
