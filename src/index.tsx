import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import OrderFormPage from './components/OrderFormPage';
import './styles/global.css';
import './styles/tokens.css';

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route path='/:college' element={<OrderFormPage />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
}
