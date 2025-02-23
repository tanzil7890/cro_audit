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

export function IframeErrorBoundary({ url }: { url: string }) {
  const [previewMode, setPreviewMode] = React.useState<'loading' | 'iframe' | 'screenshot' | 'error'>('iframe');
  const [screenshotUrl, setScreenshotUrl] = React.useState<string | null>(null);
  const [isLoadingScreenshot, setIsLoadingScreenshot] = React.useState(false);
  const [websiteMetadata, setWebsiteMetadata] = React.useState<{
    title: string;
    description: string;
    favicon: string;
    isSecure: boolean;
  } | null>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handlePreviewError = async () => {
    setPreviewMode('error');
    if (!screenshotUrl) {
      await captureScreenshot();
    }
  };

  const sanitizeUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      return `https://${url}`;
    }
  };

  const captureScreenshot = async () => {
    try {
      setIsLoadingScreenshot(true);
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sanitizeUrl(url) })
      });

      const result = await response.json();
      if (result.success && result.data.screenshot) {
        setScreenshotUrl(result.data.screenshot);
        setPreviewMode('screenshot');
      } else {
        throw new Error(result.error?.message || 'Failed to capture screenshot');
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      setPreviewMode('error');
    } finally {
      setIsLoadingScreenshot(false);
    }
  };

  const fetchWebsiteMetadata = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sanitizeUrl(url) })
      });

      const result = await response.json();
      if (result.success && result.data.websiteInfo) {
        const urlObj = new URL(sanitizeUrl(url));
        setWebsiteMetadata({
          title: result.data.websiteInfo.title || 'Unknown Title',
          description: result.data.websiteInfo.description || 'No description available',
          favicon: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}`,
          isSecure: urlObj.protocol === 'https:'
        });
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    }
  };

  React.useEffect(() => {
    const loadPreview = async () => {
      setPreviewMode('iframe');
      setScreenshotUrl(null);
      await fetchWebsiteMetadata();
    };

    loadPreview();
  }, [url]);

  const handleIframeLoad = () => {
    try {
      if (iframeRef.current?.contentWindow) {
        void iframeRef.current.contentWindow.document;
        setPreviewMode('iframe');
      }
    } catch {
      handlePreviewError();
    }
  };

  const handleIframeError = () => {
    handlePreviewError();
  };

  const renderPreview = () => {
    switch (previewMode) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-orange-500"></div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-center">
              <p className="text-gray-900 font-medium">Loading website preview...</p>
              <p className="text-gray-500 text-sm">This may take a few moments</p>
            </div>
          </div>
        );

      case 'iframe':
        return (
          <div className="relative w-full h-full bg-white">
            <div className="absolute inset-0">
              <iframe
                ref={iframeRef}
                src={sanitizeUrl(url)}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                referrerPolicy="no-referrer"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <a
                href={sanitizeUrl(url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in New Tab
              </a>
            </div>
          </div>
        );
      
      case 'screenshot':
        return (
          <div className="relative w-full h-full">
            {isLoadingScreenshot ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Capturing website preview...</p>
              </div>
            ) : screenshotUrl ? (
              <>
                <img 
                  src={screenshotUrl}
                  alt="Website Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                  <a
                    href={sanitizeUrl(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in New Tab
                  </a>
                </div>
              </>
            ) : (
              renderError()
            )}
          </div>
        );

      case 'error':
      default:
        return renderError();
    }
  };

  const renderError = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-6 space-y-4">
      <div className="text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-2">Preview not available due to website security settings</p>
        <p className="text-sm text-gray-500 mb-4">This is normal and won&apos;t affect the optimization process</p>
        <div className="space-y-2">
          <a
            href={sanitizeUrl(url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Open Website in New Tab
          </a>
          {previewMode === 'error' && !isLoadingScreenshot && (
            <button
              onClick={captureScreenshot}
              className="block w-full px-4 py-2 text-blue-500 hover:text-blue-600 transition-colors"
              disabled={isLoadingScreenshot}
            >
              {isLoadingScreenshot ? 'Capturing...' : 'Try Screenshot View'}
            </button>
          )}
        </div>
      </div>
      
      {websiteMetadata && (
        <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-4 mt-4">
          <div className="flex items-center gap-3 mb-3">
            {websiteMetadata.favicon && (
              <img 
                src={websiteMetadata.favicon} 
                alt="Website Icon" 
                className="w-6 h-6"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{websiteMetadata.title}</h3>
              {websiteMetadata.isSecure && (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4" />
                </svg>
              )}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">{websiteMetadata.description}</p>
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                Note: Many modern websites restrict iframe embedding for security. 
                This doesn&apos;t affect our ability to analyze and optimize your site.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ErrorBoundary fallback={renderError()}>
      <div className="w-full h-full relative">
        {renderPreview()}
      </div>
    </ErrorBoundary>
  );
} 