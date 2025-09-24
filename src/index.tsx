import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import CollegeSelector from './components/CollegeSelector';
import OrderFormPage from './components/OrderFormPage';
import AboutPage from './app/routes/about';
import ContactPage from './app/routes/contact';
import Header from './app/layout/Header';
import CollapsibleSidebar from './app/layout/CollapsibleSidebar';
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
  const subRoute = segments[1];
  const isFormRoot = segments.length === 1 && !(segments[0] === 'about' || segments[0] === 'contact');
  
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
        <Route path='/:college' element={<OrderFormPage />} />
        <Route path='/:college/summary' element={<OrderFormPage />} />
        <Route path='/:college/receipt' element={<OrderFormPage />} />
        <Route path='/:college/thankyou' element={<OrderFormPage />} />
      </Routes>
    </>
  );
}
