import React from "react";

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 12, height: "100%", color: "var(--text-secondary)",
        }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Something went wrong</div>
          <div style={{ fontSize: 12, maxWidth: 400, textAlign: "center", lineHeight: 1.5 }}>
            {this.state.error?.message ?? "An unexpected error occurred"}
          </div>
          <button onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{
              marginTop: 8, padding: "6px 16px", fontSize: 12, fontWeight: 600,
              border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer",
              background: "transparent", color: "var(--text-primary)",
            }}
          >Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
