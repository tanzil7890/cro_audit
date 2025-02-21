'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Something went wrong</h2>
          <p className="text-red-600 text-sm">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export function IframeErrorBoundary({ url, className }: { url: string; className?: string }) {
  const [hasError, setHasError] = React.useState(false);

  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="text-center p-4">
            <p className="text-gray-500 mb-2">Failed to load preview</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm"
            >
              Open website in new tab
            </a>
          </div>
        </div>
      }
    >
      <iframe
        src={url}
        className={className}
        sandbox="allow-same-origin allow-scripts"
        onError={() => setHasError(true)}
        onLoad={(e) => {
          try {
            // Try to access iframe content to check if it loaded
            const iframe = e.target as HTMLIFrameElement;
            if (iframe.contentWindow) {
              iframe.contentWindow.document;
            }
          } catch (error) {
            setHasError(true);
          }
        }}
      />
    </ErrorBoundary>
  );
} 