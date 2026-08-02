"use client";
import React, { Component, type ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { error: Error | null; errorInfo: string | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo: errorInfo.componentStack ?? "" });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#080706] p-8 text-center">
          <div className="max-w-md rounded-3xl border border-red-500/20 bg-[#0e0d0b] p-8 shadow-2xl">
            <span className="mb-4 block text-5xl">⚠</span>
            <h2 className="mb-2 text-lg font-bold text-red-300">Something went wrong</h2>
            <p className="mb-4 text-sm text-[#8d8674]">
              The Realm has encountered an unexpected error. Your progress has been saved locally.
            </p>
            <details className="mb-4 rounded-xl bg-white/3 p-3 text-left text-xs text-[#bbb5a0]">
              <summary className="cursor-pointer text-[11px] font-semibold text-red-300">Error details</summary>
              <p className="mt-2 break-all">{this.state.error.message}</p>
              {this.state.errorInfo && <pre className="mt-2 whitespace-pre-wrap text-[10px] text-[#8d8674]">{this.state.errorInfo}</pre>}
            </details>
            <button
              onClick={() => { this.setState({ error: null, errorInfo: null }); window.location.reload(); }}
              className="rounded-xl bg-[#c8a84e] px-8 py-3 text-sm font-bold text-[#1a1611] transition hover:brightness-110"
            >
              Reload the Realm
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
