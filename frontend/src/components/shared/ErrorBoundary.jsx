import { Component } from 'react';

// Error Boundaries MUST be class components (as of React 18)
// React hasn't added a hook equivalent for componentDidCatch yet
// This is one of the few cases where you NEED a class component

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // State tracks whether an error has occurred
    this.state = {
      hasError: false,
      error: null,
    };
  }

  // This lifecycle method is called when a child component throws
  // It receives the error and returns new state
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  // This lifecycle method is called after an error is caught
  // Use it for logging (but not for rendering fallback UI)
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            {/* Error icon */}
            <div className="text-6xl mb-4">⚠️</div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>

            <p className="text-gray-500 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>

            {/* Show error message in development */}
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-sm bg-red-50 text-red-700 p-4 rounded-lg mb-6 overflow-auto">
                {this.state.error.message}
              </pre>
            )}

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;