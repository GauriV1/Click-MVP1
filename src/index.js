import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/App.css';
import App from './App';

// Configure future flags for React Router
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter future={router.future}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
); 