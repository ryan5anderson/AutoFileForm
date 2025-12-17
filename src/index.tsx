import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import CollapsibleSidebar from './app/layout/CollapsibleSidebar';
import Header from './app/layout/Header';
import AboutPage from './app/routes/about';
import AdminPage from './app/routes/admin';
import AdminCollegeSelection from './app/routes/adminCollegeSelection';
import AdminCollegeView from './app/routes/adminCollegeView';
import AdminProductDetail from './app/routes/adminProductDetail';
import AllOrdersPage from './app/routes/allOrders';
import ContactPage from './app/routes/contact';
import OrderReceiptPage from './app/routes/orderReceipt';
import TestApiPage from './app/routes/testApi';
import TestApiOrderPage from './app/routes/TestApiOrder';
import TestApiProductDetailPage from './app/routes/TestApiProductDetail';
import CollegeRouteWrapper from './components/CollegeRouteWrapper';
import CollegeSelector from './components/CollegeSelector';
import { colleges } from './config';
import { Category } from './types';
import './styles/global.css';
import './styles/tokens.css';
import './styles/components.css';

// BrowserRouter for clean URLs - Vercel handles client-side routing via rewrites

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

  // Provide categories when on a college route; otherwise empty
  const categories: Category[] = React.useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const maybeCollege = segments[0];
    const config = maybeCollege ? colleges[maybeCollege as keyof typeof colleges] : undefined;
    return config?.categories ?? [];
  }, [location.pathname]);

  // Avoid rendering global sidebar on the form root where the page has its own sidebar
  const segments = location.pathname.split('/').filter(Boolean);
  const isAdminRoute = segments[0] === 'admin';
  const isAdminCollegeView = isAdminRoute && segments.length === 3 && segments[1] === 'college';
  const isFormRoot = segments.length === 1 && !(segments[0] === 'about' || segments[0] === 'contact' || segments[0] === 'admin' || segments[0] === 'all-orders');
  
  // Determine if we should show categories in sidebar
  const shouldShowCategories = React.useMemo(() => {
    // Don't show categories in global sidebar for admin routes (they have their own sidebar)
    if (isAdminRoute) return false;
    // Show categories on college routes (form, summary, receipt, thankyou)
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
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path='/test-api/:orderTemplateId/product/:itemId' element={<TestApiProductDetailPage />} />
        <Route path='/test-api/:orderTemplateId' element={<TestApiOrderPage />} />
        <Route path='/test-api' element={<TestApiPage />} />
        <Route path='/admin' element={<AdminPage />} />
        <Route path='/admin/colleges' element={<AdminCollegeSelection />} />
        <Route path='/admin/college/:collegeKey/product/:category/:productId' element={<AdminProductDetail />} />
        <Route path='/admin/college/:collegeKey' element={<AdminCollegeView />} />
        <Route path='/all-orders' element={<AllOrdersPage />} />
        <Route path='/receipt/:orderId' element={<OrderReceiptPage />} />
        <Route path='/:college/*' element={<CollegeRouteWrapper />} />
      </Routes>
    </>
  );
}
