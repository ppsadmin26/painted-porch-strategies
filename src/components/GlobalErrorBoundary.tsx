import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-lg w-full text-center space-y-6">
            {/* Error Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                An unexpected error occurred. We apologize for the inconvenience.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={this.handleReload} className="gap-2 w-full sm:w-auto">
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="gap-2 w-full sm:w-auto"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </Button>
            </div>

            {/* Error Details Toggle */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={this.toggleDetails}
                className="gap-2 text-muted-foreground"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide Technical Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show Technical Details
                  </>
                )}
              </Button>

              {showDetails && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left overflow-auto max-h-64">
                  <div className="text-sm font-mono space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Error Message
                      </p>
                      <p className="text-destructive font-medium break-words">
                        {error?.message || 'Unknown error'}
                      </p>
                    </div>

                    {error?.stack && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Stack Trace
                        </p>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                          {error.stack.split('\n').slice(0, 8).join('\n')}
                        </pre>
                      </div>
                    )}

                    {errorInfo?.componentStack && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Component Stack
                        </p>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                          {errorInfo.componentStack.split('\n').slice(0, 6).join('\n')}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Support Info */}
            <p className="text-xs text-muted-foreground">
              If this problem persists, please contact support with the error details above.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
