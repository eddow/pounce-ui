import { Component, JSX } from 'pounce-ts'

export interface ErrorBoundaryProps {
	children: JSX.Element | JSX.Element[]
	fallback?: (error: Error, errorInfo: { componentStack: string }) => JSX.Element
	onError?: (error: Error, errorInfo: { componentStack: string }) => void
}

interface ErrorBoundaryState {
	hasError: boolean
	error?: Error
	errorInfo?: { componentStack: string }
}

export const ErrorBoundary = Component<ErrorBoundaryProps, ErrorBoundaryState>((props) => {
	return {
		hasError: false,
		error: undefined,
		errorInfo: undefined,
		
		getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
			return {
				hasError: true,
				error
			}
		},
		
		componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
			// Log error to console in development
			console.error('ErrorBoundary caught an error:', error, errorInfo)
			
			// Call custom error handler if provided
			if (props.onError) {
				props.onError(error, errorInfo)
			}
			
			// Update state with error info
			return {
				hasError: true,
				error,
				errorInfo
			}
		},
		
		render() {
			if (this.hasError && this.error) {
				// Render custom fallback if provided
				if (props.fallback) {
					return props.fallback(this.error, this.errorInfo || { componentStack: '' })
				}
				
				// Default error fallback
				return (
					<div style={{
						padding: '20px',
						border: '1px solid #ff6b6b',
						borderRadius: '4px',
						backgroundColor: '#ffe0e0',
						color: '#d63031',
						margin: '20px'
					}}>
						<h2>Something went wrong</h2>
						<details>
							<summary>Error details</summary>
							<pre style={{
								backgroundColor: '#f8f9fa',
								padding: '10px',
								borderRadius: '4px',
								overflow: 'auto',
								fontSize: '12px'
							}}>
								{this.error.stack}
							</pre>
							{this.errorInfo && (
								<pre style={{
									backgroundColor: '#f8f9fa',
									padding: '10px',
									borderRadius: '4px',
									overflow: 'auto',
									fontSize: '12px',
									marginTop: '10px'
								}}>
									{this.errorInfo.componentStack}
								</pre>
							)}
						</details>
					</div>
				)
			}
			
			return props.children
		}
	}
})

// Production-ready error boundary that doesn't expose error details
export const ProductionErrorBoundary = Component<{ children: JSX.Element | JSX.Element[] }>((props) => {
	return {
		hasError: false,
		
		getDerivedStateFromError(): { hasError: boolean } {
			return { hasError: true }
		},
		
		componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
			// Log error for debugging but don't expose to users
			console.error('ProductionErrorBoundary caught an error:', error, errorInfo)
			
			// Here you could send error to reporting service
			// reportError(error, errorInfo)
		},
		
		render() {
			if (this.hasError) {
				return (
					<div style={{
						padding: '20px',
						textAlign: 'center',
						color: '#666'
					}}>
						<h2>Something went wrong</h2>
						<p>Please refresh the page and try again.</p>
					</div>
				)
			}
			
			return props.children
		}
	}
})
