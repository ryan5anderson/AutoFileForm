/**
 * Performance optimization utilities
 */

/**
 * Lazy load images with intersection observer
 */
export function setupLazyLoading(): void {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          // Remove loading attribute to trigger load
          img.removeAttribute('data-loading');
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01
    });
    
    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(): void {
  // Preload critical fonts
  const criticalFonts: string[] = [
    // Add your critical font URLs here
    // '/fonts/inter-var.woff2'
  ];
  
  criticalFonts.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = fontUrl;
    document.head.appendChild(link);
  });
  
  // Preload critical images (LCP candidates)
  const criticalImages = document.querySelectorAll('img[data-critical="true"]');
  criticalImages.forEach(img => {
    const imageElement = img as HTMLImageElement;
    if (imageElement.src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageElement.src;
      if (imageElement.srcset) {
        link.setAttribute('imagesrcset', imageElement.srcset);
      }
      if (imageElement.sizes) {
        link.setAttribute('imagesizes', imageElement.sizes);
      }
      document.head.appendChild(link);
    }
  });
}

/**
 * Optimize animations for performance
 */
export function optimizeAnimations(): void {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Disable or simplify animations
    document.documentElement.style.setProperty('--motion-fast', '0ms');
    document.documentElement.style.setProperty('--motion-normal', '0ms');
    document.documentElement.style.setProperty('--motion-slow', '0ms');
    
    // Add class to disable animations
    document.documentElement.classList.add('reduce-motion');
  }
  
  // Ensure animations use transform/opacity for better performance
  const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
  animatedElements.forEach(element => {
    const el = element as HTMLElement;
    
    // Promote to composite layer for better performance
    if (getComputedStyle(el).transform !== 'none' || 
        getComputedStyle(el).opacity !== '1') {
      el.style.willChange = 'transform, opacity';
    }
  });
}

/**
 * Prevent layout shift with content reservations
 */
export function preventLayoutShift(): void {
  // Reserve space for images without dimensions
  const images = document.querySelectorAll('img:not([width]):not([height]):not([style*="aspect-ratio"])');
  images.forEach(img => {
    const imageElement = img as HTMLImageElement;
    
    // Add aspect ratio based on common image ratios
    if (!imageElement.style.aspectRatio) {
      imageElement.style.aspectRatio = '16 / 9'; // Default aspect ratio
    }
  });
  
  // Reserve space for dynamic content areas
  const dynamicContainers = document.querySelectorAll('[data-dynamic-content]');
  dynamicContainers.forEach(container => {
    const el = container as HTMLElement;
    if (!el.style.minHeight) {
      el.style.minHeight = '200px'; // Minimum height to prevent shift
    }
  });
}

/**
 * Setup performance monitoring
 */
export function setupPerformanceMonitoring(): void {
  // Monitor Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Monitor LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      // Log or send to analytics
      console.log('LCP:', lastEntry.startTime);
      
      // You can send this to your analytics service
      // analytics.track('lcp', { value: lastEntry.startTime });
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    
    // Monitor CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any;
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
      
      console.log('CLS:', clsValue);
      // analytics.track('cls', { value: clsValue });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    
    // Monitor INP (if supported)
    if ('PerformanceEventTiming' in window) {
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const eventEntry = entry as any; // INP is still experimental
          if (eventEntry.processingStart) {
            console.log('INP candidate:', eventEntry.processingStart - entry.startTime);
          }
        });
      });
      inpObserver.observe({ type: 'event', buffered: true });
    }
  }
}

/**
 * Optimize resource loading
 */
export function optimizeResourceLoading(): void {
  // Add resource hints for external domains
  const externalDomains: string[] = [
    // Add your external domains here
    // 'fonts.googleapis.com',
    // 'cdn.example.com'
  ];
  
  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
  
  // Preconnect to critical external resources
  const criticalDomains: string[] = [
    // Add critical external domains here
  ];
  
  criticalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = `//${domain}`;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Setup reduced data support
 */
export function setupReducedDataSupport(): void {
  // Check for reduced data preference (experimental)
  const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
  
  if (prefersReducedData) {
    // Hide non-critical images
    const nonCriticalImages = document.querySelectorAll('img:not([data-critical="true"])');
    nonCriticalImages.forEach(img => {
      const imageElement = img as HTMLImageElement;
      imageElement.style.display = 'none';
    });
    
    // Disable autoplay videos
    const videos = document.querySelectorAll('video[autoplay]');
    videos.forEach(video => {
      const videoElement = video as HTMLVideoElement;
      videoElement.removeAttribute('autoplay');
      videoElement.pause();
    });
    
    // Add class for CSS targeting
    document.documentElement.classList.add('reduced-data');
  }
}

/**
 * Initialize all performance optimizations
 */
export function initializePerformanceOptimizations(): void {
  // Run immediately
  preloadCriticalResources();
  optimizeAnimations();
  preventLayoutShift();
  optimizeResourceLoading();
  setupReducedDataSupport();
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupLazyLoading();
      setupPerformanceMonitoring();
    });
  } else {
    setupLazyLoading();
    setupPerformanceMonitoring();
  }
  
  // Run after page load
  window.addEventListener('load', () => {
    // Additional optimizations after page load
    requestIdleCallback(() => {
      // Cleanup will-change properties after animations
      setTimeout(() => {
        const elementsWithWillChange = document.querySelectorAll('[style*="will-change"]');
        elementsWithWillChange.forEach(el => {
          const element = el as HTMLElement;
          if (!element.matches(':hover, :focus, :active')) {
            element.style.willChange = 'auto';
          }
        });
      }, 1000);
    });
  });
}

/**
 * Utility to measure and log performance metrics
 */
export function measurePerformance(label: string, fn: () => void | Promise<void>): void {
  const start = performance.now();
  
  const finish = () => {
    const end = performance.now();
    console.log(`${label}: ${end - start}ms`);
  };
  
  const result = fn();
  
  if (result instanceof Promise) {
    result.then(finish).catch(finish);
  } else {
    finish();
  }
}

/**
 * Debounce utility for performance-sensitive operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle utility for performance-sensitive operations
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}