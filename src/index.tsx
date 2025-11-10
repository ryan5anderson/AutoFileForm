import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

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
import CollegeRouteWrapper from './components/CollegeRouteWrapper';
import CollegeSelector from './components/CollegeSelector';
import { colleges } from './config';
import { Category } from './types';
import './styles/global.css';
import './styles/tokens.css';
import './styles/components.css';

// HashRouter handles all routing via hash fragments, compatible with GitHub Pages

// eslint-disable-next-line no-console
console.log('React app starting...');
// eslint-disable-next-line no-console
console.log('Current URL:', window.location.href);
// eslint-disable-next-line no-console
console.log('Hash:', window.location.hash);

const root = document.getElementById('root');
// eslint-disable-next-line no-console
console.log('Root element found:', !!root);

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <HashRouter>
        <AppShell />
      </HashRouter>
    </React.StrictMode>
  );
  // eslint-disable-next-line no-console
  console.log('React app rendered');
} else {
  // eslint-disable-next-line no-console
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
  const isAdminRoute = segments[0] === 'admin';
  const isAdminCollegeView = isAdminRoute && segments.length === 3 && segments[1] === 'college';
  const isFormRoot = segments.length === 1 && !(segments[0] === 'about' || segments[0] === 'contact' || segments[0] === 'admin' || segments[0] === 'all-orders');
  
  // Determine if we should show categories in sidebar
  const shouldShowCategories = React.useMemo(() => {
    // Don't show categories in global sidebar for admin routes (they have their own sidebar)
    if (isAdminRoute) return false;
    // Show categories on college routes (form, summary, receipt, thankyou)
    return segments.length >= 1 && (colleges as any)[segments[0]] !== undefined;
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
