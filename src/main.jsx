// src/main.jsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { jsPDF } from 'jspdf'; 
import 'jspdf-autotable';
// Import contexts and i18n config
import { AuthProvider } from './context/AuthContext.jsx'; // Assuming you have this
import { ThemeProvider } from './context/ThemeContext.jsx';
import './i18n'; // This line initializes i18next

const root = ReactDOM.createRoot(document.getElementById('root'));

// A simple fallback for Suspense
const loadingMarkup = (
  <div className="flex h-screen items-center justify-center">
    <p>Loading...</p>
  </div>
);

root.render(
  <React.StrictMode>
    {/* Suspense is required by i18next for loading translations */}
    <Suspense fallback={loadingMarkup}>
      {/* Provides authentication state to the app */}
      <AuthProvider> 
        {/* Provides theme (dark/light mode) state to the app */}
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </Suspense>
  </React.StrictMode>
);