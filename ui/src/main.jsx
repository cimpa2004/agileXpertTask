import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';
import './styles.css';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7dd3fc'
    },
    secondary: {
      main: '#f9a8d4'
    },
    background: {
      default: '#08111f',
      paper: 'rgba(15, 23, 42, 0.82)'
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h1: {
      fontFamily: 'Space Grotesk, Inter, system-ui, sans-serif'
    },
    h2: {
      fontFamily: 'Space Grotesk, Inter, system-ui, sans-serif'
    },
    h3: {
      fontFamily: 'Space Grotesk, Inter, system-ui, sans-serif'
    },
    h4: {
      fontFamily: 'Space Grotesk, Inter, system-ui, sans-serif'
    }
  },
  shape: {
    borderRadius: 18
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
