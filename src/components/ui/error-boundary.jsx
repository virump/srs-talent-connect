'use client'
import { Component } from 'react'
import { Button } from './button'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Auth Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-600 mb-4">{this.state.error?.message}</p>
          <Button 
            onClick={() => {
              this.setState({ hasError: false })
              window.location.reload()
            }}
          >
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
