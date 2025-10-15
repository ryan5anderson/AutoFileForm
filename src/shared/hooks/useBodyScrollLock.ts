import { useEffect, useRef } from 'react';

interface ScrollLockOptions {
  isLocked: boolean;
  reserveScrollBarGap?: boolean;
}

/**
 * Hook to lock/unlock body scroll, typically used for modals
 */
export function useBodyScrollLock({ isLocked, reserveScrollBarGap = true }: ScrollLockOptions) {
  const originalStyles = useRef<{
    overflow?: string;
    paddingRight?: string;
  }>({});

  useEffect(() => {
    if (!isLocked) return;

    const body = document.body;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Store original styles
    originalStyles.current = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    // Apply scroll lock
    body.style.overflow = 'hidden';
    
    // Reserve space for scrollbar to prevent layout shift
    if (reserveScrollBarGap && scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }

    // Cleanup function
    return () => {
      // Restore original styles
      body.style.overflow = originalStyles.current.overflow || '';
      body.style.paddingRight = originalStyles.current.paddingRight || '';
    };
  }, [isLocked, reserveScrollBarGap]);
}

/**
 * Hook to prevent scroll on specific elements
 */
export function useScrollLock(elementRef: React.RefObject<HTMLElement>, isLocked: boolean) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isLocked) return;

    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    // Prevent scroll events
    element.addEventListener('wheel', preventDefault, { passive: false });
    element.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      element.removeEventListener('wheel', preventDefault);
      element.removeEventListener('touchmove', preventDefault);
    };
  }, [elementRef, isLocked]);
}

/**
 * Hook to manage scroll restoration
 */
export function useScrollRestoration() {
  const scrollPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const saveScrollPosition = () => {
    scrollPosition.current = {
      x: window.scrollX,
      y: window.scrollY,
    };
  };

  const restoreScrollPosition = () => {
    window.scrollTo(scrollPosition.current.x, scrollPosition.current.y);
  };

  return { saveScrollPosition, restoreScrollPosition };
}