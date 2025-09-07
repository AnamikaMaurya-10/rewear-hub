import React from "react";

type Props = {
  children: React.ReactNode;
  onReset?: () => void;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Optional: log to monitoring here
    console.error("ErrorBoundary caught an error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full rounded-lg border border-red-100 bg-red-50 p-6 text-red-700 elevation-1">
          <div className="font-semibold mb-1">Something went wrong while loading items.</div>
          <div className="text-sm opacity-80 mb-4">
            {this.state.error?.message || "Please try again."}
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
