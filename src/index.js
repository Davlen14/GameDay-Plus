import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Safari font loading optimization
const ensureFontLoading = () => {
  // Force font loading in Safari
  if (typeof window !== 'undefined' && 'fonts' in document) {
    // Use Font Loading API if available
    Promise.all([
      document.fonts.load('400 1em Orbitron'),
      document.fonts.load('700 1em Orbitron'),
      document.fonts.load('900 1em Orbitron')
    ]).then(() => {
      document.body.classList.add('font-loaded');
      console.log('✅ Orbitron fonts loaded successfully');
    }).catch((error) => {
      console.warn('⚠️ Font loading failed, using fallbacks:', error);
      document.body.classList.add('font-loaded'); // Still apply loaded class
    });

    // Fallback timeout for Safari
    setTimeout(() => {
      if (!document.body.classList.contains('font-loaded')) {
        document.body.classList.add('font-loaded');
        console.log('⏰ Font loading timeout, applying fallbacks');
      }
    }, 3000);
  } else {
    // Fallback for older browsers
    document.body.classList.add('font-loaded');
  }
};

// Initialize font loading
document.body.classList.add('font-loading');
ensureFontLoading();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
