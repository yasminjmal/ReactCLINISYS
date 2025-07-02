// src/main.jsx

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

const loadingMarkup = (
    <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
    </div>
);

// main.jsx est maintenant très simple. Il ne fait que rendre le composant App.
root.render(
    <React.StrictMode>
        <Suspense fallback={loadingMarkup}>
            <App />
        </Suspense>
    </React.StrictMode>
);