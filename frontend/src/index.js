import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import your main CSS file (with Tailwind directives)
import App from './App';
import reportWebVitals from './reportWebVitals'; // Create React App default

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();




