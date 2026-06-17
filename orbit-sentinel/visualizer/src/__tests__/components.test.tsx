import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ImpactMetrics from "../components/ImpactMetrics";
import RealityCheck from "../components/RealityCheck";
import SimulateWebhook from "../components/SimulateWebhook";
import TaglineBanner from "../components/TaglineBanner";

describe("ImpactMetrics", () => {
  it("renders all metric cards", () => {
    render(<ImpactMetrics />);
    expect(screen.getByText("Saved per MR")).toBeInTheDocument();
    expect(screen.getByText("Pattern Accuracy")).toBeInTheDocument();
    expect(screen.getByText("Cross-Reference")).toBeInTheDocument();
    expect(screen.getByText("False Positive Reduction")).toBeInTheDocument();
    expect(screen.getByText("Mitigation Success")).toBeInTheDocument();
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
