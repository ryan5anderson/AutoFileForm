import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CollegeSelector from './components/CollegeSelector';
import OrderFormPage from './components/OrderFormPage';
import './styles/global.css';
import './styles/tokens.css';
import './styles/components.css';

// GitHub Pages SPA script in index.html handles path redirects

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route path='/' element={<CollegeSelector />} />
          <Route path='/:college' element={<OrderFormPage />} />
          <Route path='/:college/summary' element={<OrderFormPage />} />
          <Route path='/:college/receipt' element={<OrderFormPage />} />
          <Route path='/:college/thankyou' element={<OrderFormPage />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
}
