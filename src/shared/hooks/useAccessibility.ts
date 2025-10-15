import { useEffect, useRef, useCallback } from 'react';
import { announce, announceError, announceSuccess } from '../utils/announcements';

interface UseAccessibilityOptions {
  announcePageChanges?: boolean;
  manageFocus?: boolean;
  trapFocus?: boolean;
}

/**
 * Comprehensive accessibility hook for managing focus, announcements, and ARIA states
 */
export function useAccessibility(options: UseAccessibilityOptions = {}) {
  const {
    announcePageChanges = true,
    manageFocus = true,
    trapFocus = false
  } = options;

  const previousFocus = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  // Store focus when component mounts
  useEffect(() => {
    if (manageFocus) {
      previousFocus.current = document.activeElement as HTMLElement;
    }
  }, [manageFocus]);

  // Focus management utilities
  const focusFirst = useCallback((container?: HTMLElement) => {
    const element = container || containerRef.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0] as HTMLElement;
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }, []);

  const focusLast = useCallback((container?: HTMLElement) => {
    const element = container || containerRef.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
    if (lastFocusable) {
      lastFocusable.focus();
    }
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocus.current && document.contains(previousFocus.current)) {
      previousFocus.current.focus();
    }
  }, []);

  // Announcement utilities
  const announceMessage = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, priority);
  }, []);

  const announceErrorMessage = useCallback((message: string) => {
    announceError(message);
  }, []);

  const announceSuccessMessage = useCallback((message: string) => {
    announceSuccess(message);
  }, []);

  // ARIA state management
  const setAriaExpanded = useCallback((element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString());
  }, []);

  const setAriaSelected = useCallback((element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString());
  }, []);

  const setAriaPressed = useCallback((element: HTMLElement, pressed: boolean) => {
    element.setAttribute('aria-pressed', pressed.toString());
  }, []);

  const setAriaHidden = useCallback((element: HTMLElement, hidden: boolean) => {
    if (hidden) {
      element.setAttribute('aria-hidden', 'true');
    } else {
      element.removeAttribute('aria-hidden');
    }
  }, []);

  // Keyboard navigation handler
  const handleKeyNavigation = useCallback((
    event: KeyboardEvent,
    options: {
      onEscape?: () => void;
      onEnter?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onArrowLeft?: () => void;
      onArrowRight?: () => void;
      onHome?: () => void;
      onEnd?: () => void;
    } = {}
  ) => {
    const {
      onEscape,
      onEnter,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onHome,
      onEnd
    } = options;

    switch (event.key) {
      case 'Escape':
        onEscape?.();
        break;
      case 'Enter':
        onEnter?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowRight?.();
        break;
      case 'Home':
        event.preventDefault();
        onHome?.();
        break;
      case 'End':
        event.preventDefault();
        onEnd?.();
        break;
    }
  }, []);

  // Focus trap for modals/dialogs
  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const container = containerRef.current;
    
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [trapFocus]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    restoreFocus,
    announceMessage,
    announceErrorMessage,
    announceSuccessMessage,
    setAriaExpanded,
    setAriaSelected,
    setAriaPressed,
    setAriaHidden,
    handleKeyNavigation
  };
}

/**
 * Hook for managing form accessibility
 */
export function useFormAccessibility() {
  const announceValidationErrors = useCallback((errors: Record<string, string>) => {
    const errorMessages = Object.values(errors);
    if (errorMessages.length > 0) {
      const message = `Form has ${errorMessages.length} error${errorMessages.length > 1 ? 's' : ''}: ${errorMessages.join(', ')}`;
      announceError(message);
    }
  }, []);

  const announceFieldError = useCallback((fieldName: string, error: string) => {
    announceError(`${fieldName}: ${error}`);
  }, []);

  const announceFormSuccess = useCallback((message: string = 'Form submitted successfully') => {
    announceSuccess(message);
  }, []);

  const setFieldError = useCallback((fieldElement: HTMLElement, error: string, errorId: string) => {
    fieldElement.setAttribute('aria-invalid', 'true');
    fieldElement.setAttribute('aria-describedby', errorId);
    
    // Find or create error element
    let errorElement = document.getElementById(errorId);
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'error-region';
      errorElement.setAttribute('role', 'alert');
      fieldElement.parentNode?.insertBefore(errorElement, fieldElement.nextSibling);
    }
    
    errorElement.textContent = error;
    errorElement.setAttribute('aria-hidden', 'false');
  }, []);

  const clearFieldError = useCallback((fieldElement: HTMLElement, errorId: string) => {
    fieldElement.removeAttribute('aria-invalid');
    fieldElement.removeAttribute('aria-describedby');
    
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.setAttribute('aria-hidden', 'true');
      errorElement.textContent = '';
    }
  }, []);

  return {
    announceValidationErrors,
    announceFieldError,
    announceFormSuccess,
    setFieldError,
    clearFieldError
  };
}

/**
 * Hook for managing modal/dialog accessibility
 */
export function useModalAccessibility(isOpen: boolean, title?: string) {
  const { containerRef, focusFirst, restoreFocus, announceMessage } = useAccessibility({
    trapFocus: isOpen,
    manageFocus: true
  });

  useEffect(() => {
    if (isOpen) {
      announceMessage(`${title || 'Dialog'} opened`);
      // Focus the first element in the modal after a brief delay
      setTimeout(() => focusFirst(), 100);
    } else {
      announceMessage(`${title || 'Dialog'} closed`);
      restoreFocus();
    }
  }, [isOpen, title, announceMessage, focusFirst, restoreFocus]);

  return { containerRef };
}