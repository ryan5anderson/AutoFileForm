import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CollegeSelector from './components/CollegeSelector';
import OrderFormPage from './components/OrderFormPage';
import AboutPage from './app/routes/about';
import ContactPage from './app/routes/contact';
import Header from './app/layout/Header';
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
        <Header />
        <Routes>
          <Route path='/' element={<CollegeSelector />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/contact' element={<ContactPage />} />
          <Route path='/:college' element={<OrderFormPage />} />
          <Route path='/:college/summary' element={<OrderFormPage />} />
          <Route path='/:college/receipt' element={<OrderFormPage />} />
          <Route path='/:college/thankyou' element={<OrderFormPage />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
  console.log('React app rendered');
} else {
  console.error('Root element not found!');
}
