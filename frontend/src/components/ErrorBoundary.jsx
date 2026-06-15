import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-error/10 text-error p-4 rounded-full mb-6 flex items-center justify-center w-20 h-20 mx-auto">
            <span className="material-symbols-outlined text-5xl">warning</span>
          </div>
          <h1 className="text-headline-lg font-bold text-accent mb-3">Something went wrong</h1>
          <p className="text-body-md text-text-muted max-w-md mx-auto mb-8">
            An unexpected error occurred in the application. Don't worry, your data is safe. Please refresh the page or return to the home screen.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Refresh Page
            </button>
            <a href="/" className="btn-ghost flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">home</span>
              Go to Homepage
            </a>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <div className="mt-12 text-left max-w-2xl bg-surface-hover-high p-4 rounded-xl overflow-x-auto text-xs text-error">
              <p className="font-bold mb-2">{this.state.error.toString()}</p>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children; 
  }
}
