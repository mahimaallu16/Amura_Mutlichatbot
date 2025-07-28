import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

function Main() {
  const [mode, setMode] = useState('light');
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      secondary: { main: '#9c27b0' },
      ...(mode === 'dark' ? {
        background: {
          default: '#181A20',
          paper: '#23262F',
        },
        text: {
          primary: '#F3F6F9',
          secondary: '#B0B8C1',
        },
        divider: '#23262F',
      } : {
        background: {
          default: '#f7f8fa',
          paper: '#fff',
        },
        text: {
          primary: '#222',
          secondary: '#555',
        },
        divider: '#e3e6ec',
      })
    },
    shape: { borderRadius: 12 },
    typography: { fontFamily: 'Inter, Segoe UI, Arial, sans-serif' },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background 0.3s, color 0.3s',
          },
        },
      },
    },
  }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App mode={mode} setMode={setMode} />
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

reportWebVitals();
