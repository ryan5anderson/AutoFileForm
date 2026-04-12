import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Outlet } from 'react-router-dom';

import CollapsibleSidebar from './app/layout/CollapsibleSidebar';
import Header from './app/layout/Header';
import AboutPage from './app/routes/about';
import AdminPage from './app/routes/admin';
import ApiCollegeProductDetail from './app/routes/ApiCollegeProductDetail';
import ContactPage from './app/routes/contact';
import OrderReceiptPage from './app/routes/orderReceipt';
import TestApiPage from './app/routes/testApi';
import TestApiOrderPage from './app/routes/TestApiOrder';
import TestApiProductDetailPage from './app/routes/TestApiProductDetail';
import ApiCollegeOrderPage from './components/ApiCollegeOrderPage';
import CollegeRouteWrapper from './components/CollegeRouteWrapper';
import CollegeSelector from './components/CollegeSelector';
import { colleges } from './config';
import { ApiCollegeOrderProvider } from './contexts/ApiCollegeOrderContext';
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
    navigate('/', { state: { showApiSchools: true } });
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
  const isApiSchoolRoute = segments[0] === 'api-school';
  const isAdminCollegeView = isAdminRoute && segments.length === 3 && segments[1] === 'college';
  const isFormRoot = segments.length === 1 && !(segments[0] === 'about' || segments[0] === 'contact' || segments[0] === 'admin');
  
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
      {!isFormRoot && !isAdminCollegeView && !isApiSchoolRoute && (
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
        <Route path='/api-school/:orderTemplateId' element={<ApiCollegeOrderProvider><Outlet /></ApiCollegeOrderProvider>}>
          <Route index element={<ApiCollegeOrderPage />} />
          <Route path='summary' element={<ApiCollegeOrderPage />} />
          <Route path='receipt' element={<ApiCollegeOrderPage />} />
          <Route path='thankyou' element={<ApiCollegeOrderPage />} />
          <Route path='product/:productId' element={<ApiCollegeProductDetail />} />
        </Route>
        <Route path='/test-api/:orderTemplateId/product/:itemId' element={<TestApiProductDetailPage />} />
        <Route path='/test-api/:orderTemplateId' element={<TestApiOrderPage />} />
        <Route path='/test-api' element={<TestApiPage />} />
        <Route path='/admin' element={<AdminPage />} />
        <Route path='/receipt/:orderId' element={<OrderReceiptPage />} />
        <Route path='/:college/*' element={<CollegeRouteWrapper />} />
      </Routes>
    </>
  );
}
