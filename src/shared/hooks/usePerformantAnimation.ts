import { useEffect, useRef, useCallback, useState } from 'react';

interface UsePerformantAnimationOptions {
  duration?: number;
  easing?: string;
  respectReducedMotion?: boolean;
  useCompositeLayer?: boolean;
  cleanupWillChange?: boolean;
}

/**
 * Hook for performance-optimized animations that respect user preferences
 */
export function usePerformantAnimation(options: UsePerformantAnimationOptions = {}) {
  const {
    duration = 250,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    respectReducedMotion = true,
    useCompositeLayer = true,
    cleanupWillChange = true
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Animate function that respects performance best practices
  const animate = useCallback((
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    animationOptions?: KeyframeAnimationOptions
  ) => {
    const element = elementRef.current;
    if (!element) return null;

    // Skip animation if reduced motion is preferred
    if (respectReducedMotion && prefersReducedMotion) {
      // Apply final state immediately
      if (Array.isArray(keyframes) && keyframes.length > 0) {
        const finalFrame = keyframes[keyframes.length - 1];
        Object.assign(element.style, finalFrame);
      }
      return null;
    }

    setIsAnimating(true);

    // Promote to composite layer for better performance
    if (useCompositeLayer) {
      element.style.willChange = 'transform, opacity';
    }

    const animation = element.animate(keyframes, {
      duration,
      easing,
      fill: 'forwards',
      ...animationOptions
    });

    animation.addEventListener('finish', () => {
      setIsAnimating(false);
      
      // Clean up will-change property
      if (cleanupWillChange && useCompositeLayer) {
        element.style.willChange = 'auto';
      }
    });

    animation.addEventListener('cancel', () => {
      setIsAnimating(false);
      
      if (cleanupWillChange && useCompositeLayer) {
        element.style.willChange = 'auto';
      }
    });

    return animation;
  }, [duration, easing, respectReducedMotion, prefersReducedMotion, useCompositeLayer, cleanupWillChange]);

  // Fade in animation
  const fadeIn = useCallback((animationOptions?: KeyframeAnimationOptions) => {
    return animate([
      { opacity: '0' },
      { opacity: '1' }
    ], animationOptions);
  }, [animate]);

  // Fade out animation
  const fadeOut = useCallback((animationOptions?: KeyframeAnimationOptions) => {
    return animate([
      { opacity: 1 },
      { opacity: 0 }
    ], animationOptions);
  }, [animate]);

  // Slide up animation
  const slideUp = useCallback((distance: number = 20, animationOptions?: KeyframeAnimationOptions) => {
    return animate([
      { transform: `translateY(${distance}px)`, opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ], animationOptions);
  }, [animate]);

  // Slide down animation
  const slideDown = useCallback((distance: number = 20, animationOptions?: KeyframeAnimationOptions) => {
    return animate([
      { transform: 'translateY(0)', opacity: 1 },
      { transform: `translateY(${distance}px)`, opacity: 0 }
    ], animationOptions);
  }, [animate]);

  // Scale animation
  const scale = useCallback((
    fromScale: number = 0.95, 
    toScale: number = 1, 
    animationOptions?: KeyframeAnimationOptions
  ) => {
    return animate([
      { transform: `scale(${fromScale})`, opacity: 0 },
      { transform: `scale(${toScale})`, opacity: 1 }
    ], animationOptions);
  }, [animate]);

  return {
    elementRef,
    isAnimating,
    prefersReducedMotion,
    animate,
    fadeIn,
    fadeOut,
    slideUp,
    slideDown,
    scale
  };
}

/**
 * Hook for intersection observer-based animations
 */
export function useIntersectionAnimation(
  animationFn: () => Animation | null,
  options: IntersectionObserverInit = {}
) {
  const elementRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          animationFn();
          setHasAnimated(true);
          observer.unobserve(element);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [animationFn, hasAnimated, options]);

  return { elementRef, hasAnimated };
}

/**
 * Hook for staggered animations
 */
export function useStaggeredAnimation(
  items: any[],
  animationFn: (element: HTMLElement, index: number) => Animation | null,
  staggerDelay: number = 100
) {
  const containerRef = useRef<HTMLElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const startStaggeredAnimation = useCallback(() => {
    const container = containerRef.current;
    if (!container || isAnimating) return;

    setIsAnimating(true);
    const children = Array.from(container.children) as HTMLElement[];
    let completedAnimations = 0;

    children.forEach((child, index) => {
      setTimeout(() => {
        const animation = animationFn(child, index);
        
        if (animation) {
          animation.addEventListener('finish', () => {
            completedAnimations++;
            if (completedAnimations === children.length) {
              setIsAnimating(false);
            }
          });
        } else {
          completedAnimations++;
          if (completedAnimations === children.length) {
            setIsAnimating(false);
          }
        }
      }, index * staggerDelay);
    });
  }, [animationFn, staggerDelay, isAnimating, items]);

  return {
    containerRef,
    isAnimating,
    startStaggeredAnimation
  };
}

/**
 * Hook for performance-aware scroll animations
 */
export function useScrollAnimation() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let ticking = false;

    const updateScrollY = () => {
      setScrollY(window.scrollY);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollY);
        ticking = true;
      }

      setIsScrolling(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { scrollY, isScrolling };
}