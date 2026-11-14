import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unexpected application error' };
  }

  componentDidCatch(error: Error) {
    console.error('Root render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-md shadow-sm p-6 text-center space-y-4">
            <h1 className="text-lg font-extrabold text-[#212121]">ESP Platform — Recovery Mode</h1>
            <p className="text-xs text-[#666666] break-words">{this.state.errorMessage}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('esp_session_user');
                    localStorage.removeItem('esp_session_token');
                  } catch {}
                  window.location.reload();
                }}
                className="bg-[#2874f0] text-white px-4 py-2 rounded-sm text-xs font-bold cursor-pointer"
              >
                Reset & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
