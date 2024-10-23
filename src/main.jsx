import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider } from 'next-themes';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <NextUIProvider>
        <ThemeProvider attribute='class'>
          <App />
        </ThemeProvider>
      </NextUIProvider>
    </Router>
  </StrictMode>,
)
