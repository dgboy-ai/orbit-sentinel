import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import ImpactCalculator from "../components/ImpactCalculator";
import RealityCheck from "../components/RealityCheck";
import SimulateWebhook from "../components/SimulateWebhook";
import TaglineBanner from "../components/TaglineBanner";
import PredictionsTracker from "../components/PredictionsTracker";
import SetupWizard from "../components/SetupWizard";
import ImpactReport from "../components/ImpactReport";
import DataModeBanner from "../components/DataModeBanner";
import DigitalTwinGraph from "../components/DigitalTwinGraph";
import OrbitQueryInspector from "../components/OrbitQueryInspector";
import { DEMO_DATA } from "../data/demoData";

describe("ImpactCalculator", () => {
  it("renders calculator header and sliders", () => {
    render(<ImpactCalculator riskScore={0.55} evidenceCount={4} counterfactuals={[]} />);
    expect(screen.getByText("Closed-Loop ROI Calculator")).toBeInTheDocument();
    expect(screen.getByText("MRs per Week")).toBeInTheDocument();
    expect(screen.getByText("Developer $/hr")).toBeInTheDocument();
    expect(screen.getByText("Manual Analysis (h)")).toBeInTheDocument();
  });

  it("renders animated metric cards", () => {
    render(<ImpactCalculator riskScore={0.55} evidenceCount={4} counterfactuals={[]} />);
    expect(screen.getByText("Saved per MR")).toBeInTheDocument();
    expect(screen.getByText("Time Cost Saved / Year")).toBeInTheDocument();
  });
});

describe("RealityCheck", () => {
  it("renders comparison scores", () => {
    render(<RealityCheck />);
    expect(screen.getByText("Traditional CI/CD Misses")).toBeInTheDocument();
    expect(screen.getByText("Orbit Sentinel Advantage")).toBeInTheDocument();
  });

  it("displays the gap analysis rows", () => {
    render(<RealityCheck />);
    expect(screen.getByText("Empty Diff Detected")).toBeInTheDocument();
    expect(screen.getByText("Branch Abandonment Pattern")).toBeInTheDocument();
    expect(screen.getByText("Cross-Query Confidence")).toBeInTheDocument();
  });
});

describe("SimulateWebhook", () => {
  it("renders initial state with run button", () => {
    render(<SimulateWebhook />);
    expect(screen.getByText("Simulate MR Webhook")).toBeInTheDocument();
    expect(screen.getByText("Run Flow")).toBeInTheDocument();
  });

  it("shows description text before running", () => {
    render(<SimulateWebhook />);
    expect(screen.getAllByText(/What happens/i).length).toBeGreaterThan(0);
  });
});

describe("TaglineBanner", () => {
  it("renders the tagline", () => {
    render(<TaglineBanner />);
    expect(screen.getByText("Why This Is Unique")).toBeInTheDocument();
    expect(screen.getByText((content) => content.startsWith("Predicts"))).toBeInTheDocument();
    expect(screen.getByText("consequences")).toBeInTheDocument();
  });
});

describe("PredictionsTracker", () => {
  it("renders accuracy scoreboard and vulnerability section", () => {
    render(<PredictionsTracker />);
    expect(screen.getByText("Prediction Scoreboard")).toBeInTheDocument();
    expect(screen.getByText("Vulnerability-Adjusted Predictions")).toBeInTheDocument();
  });

  it("shows zero state when no predictions exist", () => {
    render(<PredictionsTracker predictions={[]} />);
    expect(screen.getAllByText("0%")[0]).toBeInTheDocument();
    expect(screen.getByText("Total MRs Tracked")).toBeInTheDocument();
  });

  it("shows stats with predictions provided", () => {
    const predictions = [
      { mrIid: 1, title: "Fix auth", predictedRisk: 0.8, predictedLevel: "high", actualOutcome: "verified" as const, actualRisk: 0.2, mergedAt: "2026-06-01", evidence: "verified" },
      { mrIid: 2, title: "Add logging", predictedRisk: 0.3, predictedLevel: "low", actualOutcome: "pending" as const, mergedAt: "2026-06-02" },
    ];
    render(<PredictionsTracker predictions={predictions} />);
    expect(screen.getByText("Total MRs Tracked")).toBeInTheDocument();
    expect(screen.getByText("Stayed Shipped")).toBeInTheDocument();
  });

  it("calls onVerify for prediction with pre-set outcome", async () => {
    vi.useFakeTimers();
    const onVerify = vi.fn();
    const predictions = [
      { mrIid: 5, title: "Update API", predictedRisk: 0.7, predictedLevel: "high", actualOutcome: "failed" as const, actualRisk: 0.9, mergedAt: "2026-06-01", evidence: "failed" },
    ];
    render(<PredictionsTracker predictions={predictions} onVerify={onVerify} />);
    const input = screen.getByPlaceholderText("MR IID (e.g. 42)");
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.click(screen.getByText("✓ Verify MR"));
    act(() => { vi.advanceTimersByTime(1200); });
    expect(onVerify).toHaveBeenCalledWith(5, "failed");
    vi.useRealTimers();
  });
});

describe("SetupWizard", () => {
  it("renders setup steps and problem section", () => {
    render(<SetupWizard />);
    expect(screen.getByText("The Problem")).toBeInTheDocument();
    expect(screen.getByText("The Mission")).toBeInTheDocument();
  });
});

describe("ImpactReport", () => {
  it("renders export dropdown button", () => {
    render(<ImpactReport data={DEMO_DATA} />);
    expect(screen.getByLabelText("Export report")).toBeInTheDocument();
    expect(screen.getByLabelText("Print report")).toBeInTheDocument();
  });
});

describe("DataModeBanner", () => {
  it("renders live mode", () => {
    render(<DataModeBanner mode="live" />);
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Real-time data from Orbit engine")).toBeInTheDocument();
  });

  it("renders demo mode", () => {
    render(<DataModeBanner mode="demo" />);
    expect(screen.getByText("Demo")).toBeInTheDocument();
    expect(screen.getByText("Representative scenario — engine live via Analyze button")).toBeInTheDocument();
  });

  it("renders loading mode with animation", () => {
    render(<DataModeBanner mode="loading" />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("renders connecting mode", () => {
    render(<DataModeBanner mode="connecting" />);
    expect(screen.getByText("Connecting")).toBeInTheDocument();
  });

  it("renders degraded mode", () => {
    render(<DataModeBanner mode="degraded" />);
    expect(screen.getByText("Degraded")).toBeInTheDocument();
    expect(screen.getByText("Orbit unavailable — using file analysis fallback")).toBeInTheDocument();
  });

  it("renders error mode with message and retry button", () => {
    const onRetry = vi.fn();
    render(<DataModeBanner mode="error" errorMessage="Network failure" onRetry={onRetry} />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Network failure")).toBeInTheDocument();
    const retry = screen.getByText("Retry");
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe("DigitalTwinGraph", () => {
  it("renders sample twin fallback with warning when graph has no nodes", () => {
    const { container } = render(<DigitalTwinGraph graph={{ nodes: [], links: [] }} />);
    expect(container.textContent).toContain("Showing sample twin");
  });
});

describe("OrbitQueryInspector", () => {
  const sampleEvidence = [
    { queryType: "NEIGHBORS", queryName: "Blast Radius", result: "→ Nodes: 12, Edges: 34\n→ 3 affected files" },
    { queryType: "AGGREGATION", queryName: "Pipeline Failure Rate", result: "→ 5 pipelines found\n→ 0 failures" },
  ];

  const sampleTimings = [
    { queryType: "NEIGHBORS", queryName: "Blast Radius", durationMs: 120, nodeCount: 12, edgeCount: 34, status: "success" as const },
    { queryType: "AGGREGATION", queryName: "Pipeline Failure Rate", durationMs: 450, nodeCount: 0, edgeCount: 0, status: "success" as const },
  ];

  it("renders empty state when no evidence", () => {
    render(<OrbitQueryInspector evidence={[]} />);
    expect(screen.getByText("No Orbit query data available")).toBeInTheDocument();
  });

  it("renders query types from evidence", () => {
    render(<OrbitQueryInspector evidence={sampleEvidence} />);
    expect(screen.getByText("NEIGHBORS")).toBeInTheDocument();
    expect(screen.getByText("AGGREGATION")).toBeInTheDocument();
    expect(screen.getByText("Orbit Query Inspector")).toBeInTheDocument();
  });

  it("shows parsed node/edge metrics inline", () => {
    render(<OrbitQueryInspector evidence={sampleEvidence} />);
    expect(screen.getByText("12n · 34e")).toBeInTheDocument();
  });

  it("shows timing badge when timings provided", () => {
    render(<OrbitQueryInspector evidence={sampleEvidence} timings={sampleTimings} />);
    expect(screen.getByText("120ms")).toBeInTheDocument();
    expect(screen.getByText("450ms")).toBeInTheDocument();
  });

  it("expands a query row on click", () => {
    render(<OrbitQueryInspector evidence={sampleEvidence} />);
    const btn = screen.getByText("NEIGHBORS").closest("button")!;
    fireEvent.click(btn);
    expect(screen.getByText(/3 affected files/)).toBeInTheDocument();
  });

  it("toggles Raw JSON view when row is expanded", () => {
    render(<OrbitQueryInspector evidence={sampleEvidence} />);
    // First expand a row
    fireEvent.click(screen.getByText("Blast Radius"));
    // Then click Raw JSON toggle
    fireEvent.click(screen.getByText("Raw JSON"));
    // Raw JSON shows the evidence object keys
    expect(screen.getByText(/"queryType"/)).toBeInTheDocument();
    expect(screen.getByText(/"NEIGHBORS"/)).toBeInTheDocument();
  });
});
