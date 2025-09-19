/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl text-red-900 dark:text-red-100">
                Something went wrong
              </CardTitle>
              <CardDescription>
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-mono text-red-600 dark:text-red-400">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => window.location.href = '/'}
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary