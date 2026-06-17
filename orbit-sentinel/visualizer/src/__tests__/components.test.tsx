import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ImpactCalculator from "../components/ImpactCalculator";
import RealityCheck from "../components/RealityCheck";
import SimulateWebhook from "../components/SimulateWebhook";
import TaglineBanner from "../components/TaglineBanner";

describe("ImpactCalculator", () => {
  it("renders calculator header and sliders", () => {
    render(<ImpactCalculator riskScore={0.55} evidenceCount={4} counterfactuals={[]} />);
    expect(screen.getByText("Impact Calculator")).toBeInTheDocument();
    expect(screen.getByText("MRs per Week")).toBeInTheDocument();
    expect(screen.getByText("Developer $/hr")).toBeInTheDocument();
    expect(screen.getByText("Manual Analysis (h)")).toBeInTheDocument();
  });

  it("renders animated metric cards", () => {
    render(<ImpactCalculator riskScore={0.55} evidenceCount={4} counterfactuals={[]} />);
    expect(screen.getByText("Saved per MR")).toBeInTheDocument();
    expect(screen.getByText("Saved per Year")).toBeInTheDocument();
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
