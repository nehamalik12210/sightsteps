import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './accessibility.css';

// When a new PWA service worker takes control, reload the page once so an
// already-open tab does not keep rendering stale layout/assets indefinitely.
if ('serviceWorker' in navigator) {
  let isReloadingForServiceWorkerUpdate = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (isReloadingForServiceWorkerUpdate) return;
    isReloadingForServiceWorkerUpdate = true;
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
