import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginContextProvider } from './context/LoginContext';
import AppContent from './components/AppContent';



const queryClient = new QueryClient();
const container = document.getElementById('root');

if (!container) {
  throw new Error("Root container not found. Ensure there is a div with id='root' in your index.html.");
}

const root = ReactDOM.createRoot(container);
root.render(
    <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <LoginContextProvider>
          <App />
        </LoginContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);