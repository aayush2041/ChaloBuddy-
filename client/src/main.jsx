import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StoreProvider } from './context/StoreContext';
import './style.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '40px auto', textAlign: 'center', border: '1px solid #000' }}>
          <h2 style={{ textTransform: 'uppercase', fontWeight: 900 }}>Application Error</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: '16px 0' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => {
              try {
                if ('caches' in window) {
                  caches.keys().then(names => names.forEach(name => caches.delete(name)));
                }
              } catch {}
              window.location.hash = '';
              window.location.href = window.location.pathname + '?v=' + Date.now();
            }}
            style={{ padding: '12px 24px', backgroundColor: '#FF5A1F', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '12px' }}
          >
            Reload ChaloBuddy
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <StoreProvider>
        <App />
      </StoreProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
