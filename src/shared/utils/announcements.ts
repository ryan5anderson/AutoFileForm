/**
 * Utility functions for managing screen reader announcements
 */

/**
 * Announce a message to screen readers using live regions
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const regionId = priority === 'assertive' ? 'alert-region' : 'live-region';
  const region = document.getElementById(regionId);

  if (!region) {
    console.warn(`Live region with id "${regionId}" not found`);
    return;
  }

  // Clear the region first to ensure the message is announced
  region.textContent = '';

  // Use a small delay to ensure screen readers pick up the change
  setTimeout(() => {
    region.textContent = message;
  }, 100);

  // Clear the message after a delay to prevent it from being read again
  setTimeout(() => {
    region.textContent = '';
  }, 1000);
}

/**
 * Announce an error message with assertive priority
 */
export function announceError(message: string): void {
  announce(message, 'assertive');
}

/**
 * Announce a success message with polite priority
 */
export function announceSuccess(message: string): void {
  announce(message, 'polite');
}

/**
 * Announce navigation changes
 */
export function announceNavigation(pageName: string): void {
  announce(`Navigated to ${pageName}`, 'polite');
}

/**
 * Announce form validation results
 */
export function announceFormValidation(errors: string[], fieldCount: number): void {
  if (errors.length === 0) {
    announceSuccess('Form is valid and ready to submit');
  } else {
    const errorCount = errors.length;
    const message = `Form has ${errorCount} error${errorCount > 1 ? 's' : ''} in ${fieldCount} field${fieldCount > 1 ? 's' : ''}. ${errors.join('. ')}`;
    announceError(message);
  }
}

/**
 * Announce loading states
 */
export function announceLoading(isLoading: boolean, context?: string): void {
  if (isLoading) {
    announce(`Loading${context ? ` ${context}` : ''}...`, 'polite');
  } else {
    announce(`${context ? `${context} ` : ''}Loading complete`, 'polite');
  }
}

/**
 * Announce modal/dialog state changes
 */
export function announceModal(isOpen: boolean, title?: string): void {
  if (isOpen) {
    announce(`${title || 'Dialog'} opened`, 'polite');
  } else {
    announce(`${title || 'Dialog'} closed`, 'polite');
  }
}

/**
 * Announce dynamic content updates
 */
export function announceContentUpdate(description: string): void {
  announce(`Content updated: ${description}`, 'polite');
}