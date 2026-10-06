import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';

import CollapsibleSidebar from './app/layout/CollapsibleSidebar';
import Header from './app/layout/Header';
import AboutPage from './app/routes/about';
import AdminPage from './app/routes/admin';
import AdminCollegeSelection from './app/routes/adminCollegeSelection';
import AdminCollegeView from './app/routes/adminCollegeView';
import AdminProductDetail from './app/routes/adminProductDetail';
import ContactPage from './app/routes/contact';
import OrderReceiptPage from './app/routes/orderReceipt';
import CollegeRouteWrapper from './components/CollegeRouteWrapper';
import CollegeSelector from './components/CollegeSelector';
import { colleges } from './config';
import { Category } from './types';
import './styles/global.css';
import './styles/tokens.css';
import './styles/components.css';

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </React.StrictMode>
  );
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

  const categories: Category[] = React.useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const maybeCollege = segments[0];
    const config = maybeCollege ? colleges[maybeCollege as keyof typeof colleges] : undefined;
    return config?.categories ?? [];
  }, [location.pathname]);

  const segments = location.pathname.split('/').filter(Boolean);
  const isAdminRoute = segments[0] === 'admin';
  const isAdminCollegeView = isAdminRoute && segments.length === 3 && segments[1] === 'college';
  const isFormRoot =
    segments.length === 1 && colleges[segments[0] as keyof typeof colleges] !== undefined;

  const shouldShowCategories = React.useMemo(() => {
    if (isAdminRoute) return false;
    return segments.length >= 1 && colleges[segments[0] as keyof typeof colleges] !== undefined;
  }, [segments, isAdminRoute]);

  return (
    <>
      <Header />
      {!isFormRoot && !isAdminCollegeView && (
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
        <Route path='/local-schools' element={<Navigate to='/' replace />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path='/admin' element={<AdminPage />} />
        <Route path='/admin/colleges' element={<AdminCollegeSelection />} />
        <Route path='/admin/college/:collegeKey/product/:category/:productId' element={<AdminProductDetail />} />
        <Route path='/admin/college/:collegeKey' element={<AdminCollegeView />} />
        <Route path='/receipt/:orderId' element={<OrderReceiptPage />} />
        <Route path='/:college/*' element={<CollegeRouteWrapper />} />
      </Routes>
    </>
  );
}
