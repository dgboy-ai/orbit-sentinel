import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";

describe("App", () => {
  it("renders navigation tablist", async () => {
    render(<App />);
    const tabs = await screen.findAllByRole("tab");
    expect(tabs.length).toBeGreaterThanOrEqual(6);
  });

  it("renders export button", async () => {
    render(<App />);
    expect(await screen.findByLabelText("Export report")).toBeInTheDocument();
  });

  it("can dismiss onboarding overlay", async () => {
    render(<App />);
    const skipBtn = await screen.findByText("Skip →");
    expect(skipBtn).toBeInTheDocument();
    skipBtn.click();
    await new Promise(r => setTimeout(r, 400));
    expect(screen.queryByText("Welcome to Orbit Sentinel")).not.toBeInTheDocument();
  });
});
