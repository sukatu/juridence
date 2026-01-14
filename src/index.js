import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Configure Chart.js with Filler plugin
import { Chart, registerables } from 'chart.js';
import { Filler } from 'chart.js';

// Register all Chart.js components and the Filler plugin
Chart.register(Filler, ...registerables);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
