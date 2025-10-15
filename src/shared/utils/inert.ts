// Inert utility with tabindex preservation for older browser fallback

interface InertState {
  originalTabIndex: Map<Element, string | null>;
  originalAriaHidden: Map<Element, string | null>;
}

const inertStates = new WeakMap<Element, InertState>();

/**
 * Sets or removes inert state on an element and its children
 * Falls back to tabindex manipulation for older browsers
 */
export function setInert(element: Element, inert: boolean): void {
  if (!element) return;

  // Use native inert if supported
  if ('inert' in element) {
    (element as any).inert = inert;
    return;
  }

  // Fallback for older browsers
  if (inert) {
    makeInert(element);
  } else {
    removeInert(element);
  }
}

function makeInert(element: Element): void {
  if (inertStates.has(element)) return;

  const state: InertState = {
    originalTabIndex: new Map(),
    originalAriaHidden: new Map(),
  };

  // Store original values and make inert
  const focusableElements = element.querySelectorAll(
    'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
  );

  focusableElements.forEach((el) => {
    const currentTabIndex = el.getAttribute('tabindex');
    state.originalTabIndex.set(el, currentTabIndex);
    el.setAttribute('tabindex', '-1');
  });

  // Set aria-hidden on the root element
  const currentAriaHidden = element.getAttribute('aria-hidden');
  state.originalAriaHidden.set(element, currentAriaHidden);
  element.setAttribute('aria-hidden', 'true');

  inertStates.set(element, state);
}

function removeInert(element: Element): void {
  const state = inertStates.get(element);
  if (!state) return;

  // Restore original tabindex values
  state.originalTabIndex.forEach((originalValue, el) => {
    if (originalValue === null) {
      el.removeAttribute('tabindex');
    } else {
      el.setAttribute('tabindex', originalValue);
    }
  });

  // Restore original aria-hidden value
  state.originalAriaHidden.forEach((originalValue, el) => {
    if (originalValue === null) {
      el.removeAttribute('aria-hidden');
    } else {
      el.setAttribute('aria-hidden', originalValue);
    }
  });

  inertStates.delete(element);
}

/**
 * Check if inert is natively supported
 */
export function supportsInert(): boolean {
  return 'inert' in HTMLElement.prototype;
}