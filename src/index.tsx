import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import CollegeSelector from './shared/ui/CollegeSelector';
import CollegeRouteWrapper from './shared/ui/CollegeRouteWrapper';
import AboutPage from './app/routes/about';
import ContactPage from './app/routes/contact';
import Header from './app/layout/Header';

import Sidebar from './shared/ui/Sidebar';
import { colleges } from './config';
import { Category } from './shared/types';
import { setInert } from './shared/utils/inert';
import { initializePerformanceOptimizations } from './shared/utils/performance';
import navigationStyles from './shared/styles/navigation.module.css';
import './shared/styles/global.css';
import './shared/styles/tokens.css';
import './shared/styles/components.css';

// HashRouter handles all routing via hash fragments, compatible with GitHub Pages

console.log('React app starting...');
console.log('Current URL:', window.location.href);
console.log('Hash:', window.location.hash);

// Initialize performance optimizations
initializePerformanceOptimizations();

const root = document.getElementById('root');
console.log('Root element found:', !!root);

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <HashRouter>
        <AppShell />
      </HashRouter>
    </React.StrictMode>
  );
  console.log('React app rendered');
} else {
  console.error('Root element not found!');
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [sidebarTriggerRef, setSidebarTriggerRef] = React.useState<React.RefObject<HTMLElement> | undefined>(undefined);

  const toggleSidebar = React.useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarClose = React.useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleBackToColleges = React.useCallback(() => {
    setIsSidebarOpen(false);
    navigate('/');
  }, [navigate]);

  const handleMenuToggle = React.useCallback((triggerRef: React.RefObject<HTMLElement>) => {
    setSidebarTriggerRef(triggerRef);
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Handle inert background when sidebar is open
  React.useEffect(() => {
    const main = document.getElementById('main');
    if (main) {
      setInert(main, isSidebarOpen);
    }
  }, [isSidebarOpen]);

  // Provide categories when on a college route; otherwise empty
  const categories: Category[] = React.useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const maybeCollege = segments[0];
    const config = maybeCollege ? (colleges as any)[maybeCollege] : undefined;
    return config?.categories ?? [];
  }, [location.pathname]);

  const segments = location.pathname.split('/').filter(Boolean);
  
  // Determine if we should show categories in sidebar
  const shouldShowCategories = React.useMemo(() => {
    // Show categories on college routes (form, summary, receipt, thankyou)
    return segments.length >= 1 && (colleges as any)[segments[0]] !== undefined;
  }, [segments]);

  // Create sidebar content based on current route
  const sidebarContent = React.useMemo(() => {
    const navigationLinks = (
      <div className={navigationStyles.navigationSection}>
        <h3 className={navigationStyles.navigationTitle}>
          Navigation
        </h3>
        <ul className={navigationStyles.navigationList}>
          <li className={navigationStyles.navigationItem}>
            <Link
              to="/about"
              onClick={handleSidebarClose}
              className={navigationStyles.navigationLink}
            >
              About Us
            </Link>
          </li>
          <li className={navigationStyles.navigationItem}>
            <Link
              to="/contact"
              onClick={handleSidebarClose}
              className={navigationStyles.navigationLink}
            >
              Contact Us
            </Link>
          </li>
        </ul>
      </div>
    );

    if (!shouldShowCategories) {
      return (
        <nav aria-label="Main navigation">
          <button
            onClick={handleBackToColleges}
            className={navigationStyles.backButton}
          >
            <span>←</span>
            <span>Back to Colleges</span>
          </button>
          {navigationLinks}
        </nav>
      );
    }

    return (
      <nav aria-label="Main navigation">
        <button
          onClick={handleBackToColleges}
          className={navigationStyles.backButton}
        >
          <span>←</span>
          <span>Back to Colleges</span>
        </button>
        
        {navigationLinks}
        
        {categories.length > 0 && (
          <div>
            <h3 className={navigationStyles.navigationTitle}>
              Categories
            </h3>
            <ul className={navigationStyles.navigationList}>
              {categories.map((category) => {
                const sectionId = category.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
                return (
                  <li key={category.name} className={navigationStyles.navigationItem}>
                    <button
                      onClick={() => {
                        const element = document.getElementById(sectionId);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          // Close sidebar on mobile after navigation
                          if (window.innerWidth <= 768) {
                            handleSidebarClose();
                          }
                        }
                      }}
                      className={navigationStyles.categoryButton}
                    >
                      {category.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>
    );
  }, [categories, shouldShowCategories, handleBackToColleges, handleSidebarClose]);

  return (
    <>
      {/* Global skip link - first focusable element */}
      <a className="skip-link" href="#main">Skip to content</a>
      
      <Header onMenuToggle={handleMenuToggle} />
      
      {/* New responsive Sidebar component */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        triggerRef={sidebarTriggerRef}
        title="Navigation"
      >
        {sidebarContent}
      </Sidebar>


      
      <main id="main" role="main">
        <Routes>
          <Route path='/' element={<CollegeSelector />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/contact' element={<ContactPage />} />
          <Route path='/:college/*' element={<CollegeRouteWrapper />} />
        </Routes>
      </main>

      {/* Live region for dynamic announcements */}
      <div 
        id="live-region" 
        className="live-region" 
        aria-live="polite" 
        aria-atomic="true"
      ></div>

      {/* Alert region for urgent announcements */}
      <div 
        id="alert-region" 
        className="live-region" 
        role="alert" 
        aria-live="assertive"
      ></div>
    </>
  );
}
