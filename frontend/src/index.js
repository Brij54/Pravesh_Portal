import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';



const queryClient = new QueryClient();
const container = document.getElementById('root');

if (!container) {
  throw new Error("Root container not found. Ensure there is a div with id='root' in your index.html.");
}

const root = ReactDOM.createRoot(container);
root.render(
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>

      <App />
    </QueryClientProvider>
    </BrowserRouter>
);