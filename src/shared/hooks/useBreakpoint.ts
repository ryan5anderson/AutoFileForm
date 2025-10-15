import { useState, useEffect } from 'react';

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';

interface BreakpointContextValue {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentBreakpoint: Breakpoint;
}

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * SSR-safe breakpoint hook that uses matchMedia
 */
export function useBreakpoint(): BreakpointContextValue {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('sm');

  useEffect(() => {
    // Skip on server-side rendering
    if (typeof window === 'undefined') return;

    const mediaQueries = {
      xl: window.matchMedia(`(min-width: ${breakpoints.xl}px)`),
      lg: window.matchMedia(`(min-width: ${breakpoints.lg}px)`),
      md: window.matchMedia(`(min-width: ${breakpoints.md}px)`),
      sm: window.matchMedia(`(min-width: ${breakpoints.sm}px)`),
    };

    const updateBreakpoint = () => {
      if (mediaQueries.xl.matches) {
        setBreakpoint('xl');
      } else if (mediaQueries.lg.matches) {
        setBreakpoint('lg');
      } else if (mediaQueries.md.matches) {
        setBreakpoint('md');
      } else {
        setBreakpoint('sm');
      }
    };

    // Set initial value
    updateBreakpoint();

    // Add listeners
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updateBreakpoint);
    });

    // Cleanup
    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updateBreakpoint);
      });
    };
  }, []);

  return {
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl'].includes(breakpoint),
    currentBreakpoint: breakpoint,
  };
}

/**
 * Hook to check if a specific breakpoint is active
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}