import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 h-screen bg-gray-50 text-gray-900 font-mono">
                    <h1 className="text-2xl font-bold text-cdh-red mb-4">Something went wrong.</h1>
                    <div className="p-4 bg-white border border-red-200 rounded shadow-sm text-sm overflow-auto">
                        <details className="whitespace-pre-wrap">
                            <summary className="cursor-pointer font-bold mb-2">Error Details</summary>
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </details>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
