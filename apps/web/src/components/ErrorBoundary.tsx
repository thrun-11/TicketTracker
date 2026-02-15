import React, { ReactNode, ErrorInfo } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ((props: ErrorFallbackProps) => ReactNode) | ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return (this.props.fallback as (props: ErrorFallbackProps) => ReactNode)({
            error: this.state.error!,
            resetError: this.handleReset,
          })
        }
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto max-w-md w-full p-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-destructive/10 rounded-full p-3">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              Something went wrong
            </h1>

            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            <div className="bg-destructive/10 border-destructive/20 rounded-lg p-4 mb-6 text-left">
              <h2 className="text-sm font-semibold text-destructive-foreground mb-2">
                What happened?
              </h2>
              <p className="text-xs text-destructive-foreground/70 mb-4">
                {this.state.error?.message}
              </p>
              {this.state.error?.stack && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-xs font-semibold text-destructive hover:text-destructive/90 flex items-center gap-2">
                    <span>View error details</span>
                    <span className="text-destructive-foreground/50 text-xs">(development only)</span>
                  </summary>
                  <div className="mt-3 p-4 bg-destructive/5 rounded-md overflow-auto max-h-64">
                    <pre className="text-xs text-left text-destructive-foreground whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
              >
                <Home className="h-4 w-4" />
                Go to dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
