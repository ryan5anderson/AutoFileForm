import { useEffect, useRef } from 'react';

interface FocusTrapOptions {
  isActive: boolean;
  initialFocus?: HTMLElement | null;
  returnFocus?: HTMLElement | null;
}

/**
 * Hook to trap focus within a container element
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>({
  isActive,
  initialFocus,
  returnFocus,
}: FocusTrapOptions) {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    
    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the container
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        'details',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
      ].join(', ');

      return Array.from(container.querySelectorAll(focusableSelectors)).filter(
        (element) => {
          const el = element as HTMLElement;
          return (
            el.offsetWidth > 0 &&
            el.offsetHeight > 0 &&
            !el.hasAttribute('inert') &&
            el.getAttribute('aria-hidden') !== 'true'
          );
        }
      ) as HTMLElement[];
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Set initial focus
    const focusableElements = getFocusableElements();
    if (initialFocus && focusableElements.includes(initialFocus)) {
      initialFocus.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Add event listener
    container.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      
      // Return focus to the previously focused element
      if (returnFocus) {
        returnFocus.focus();
      } else if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, initialFocus, returnFocus]);

  return containerRef;
}

/**
 * Hook to manage focus return when a modal or dialog closes
 */
export function useFocusReturn(isOpen: boolean, triggerElement?: HTMLElement | null) {
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element when opening
      previousFocus.current = document.activeElement as HTMLElement;
    } else if (previousFocus.current) {
      // Return focus when closing
      const elementToFocus = triggerElement || previousFocus.current;
      elementToFocus.focus();
      previousFocus.current = null;
    }
  }, [isOpen, triggerElement]);
}