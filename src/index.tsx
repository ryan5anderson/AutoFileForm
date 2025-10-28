import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import CollapsibleSidebar from './app/layout/CollapsibleSidebar';
import Header from './app/layout/Header';
import AboutPage from './app/routes/about';
import AdminPage from './app/routes/admin';
import AllOrdersPage from './app/routes/allOrders';
import ContactPage from './app/routes/contact';
import CollegeRouteWrapper from './components/CollegeRouteWrapper';
import CollegeSelector from './components/CollegeSelector';
import { colleges } from './config';
import { Category } from './types';
import './styles/global.css';
import './styles/tokens.css';
import './styles/components.css';

// HashRouter handles all routing via hash fragments, compatible with GitHub Pages

console.log('React app starting...');
console.log('Current URL:', window.location.href);
console.log('Hash:', window.location.hash);

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

  const toggleSidebar = React.useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleBackToColleges = React.useCallback(() => {
    setIsSidebarOpen(false);
    navigate('/');
  }, [navigate]);

  // Provide categories when on a college route; otherwise empty
  const categories: Category[] = React.useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const maybeCollege = segments[0];
    const config = maybeCollege ? (colleges as any)[maybeCollege] : undefined;
    return config?.categories ?? [];
  }, [location.pathname]);

  // Avoid rendering global sidebar on the form root where the page has its own sidebar
  const segments = location.pathname.split('/').filter(Boolean);
  const isFormRoot = segments.length === 1 && !(segments[0] === 'about' || segments[0] === 'contact' || segments[0] === 'admin' || segments[0] === 'all-orders');
  
  // Determine if we should show categories in sidebar
  const shouldShowCategories = React.useMemo(() => {
    // Show categories on college routes (form, summary, receipt, thankyou)
    return segments.length >= 1 && (colleges as any)[segments[0]] !== undefined;
  }, [segments]);

  return (
    <>
      <Header />
      {!isFormRoot && (
        <CollapsibleSidebar
          categories={categories}
          activeSection={''}
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          onBackToColleges={handleBackToColleges}
          showCategories={shouldShowCategories}
        />
      )}
      <Routes>
        <Route path='/' element={<CollegeSelector />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path='/admin' element={<AdminPage />} />
        <Route path='/all-orders' element={<AllOrdersPage />} />
        <Route path='/:college/*' element={<CollegeRouteWrapper />} />
      </Routes>
    </>
  );
}
