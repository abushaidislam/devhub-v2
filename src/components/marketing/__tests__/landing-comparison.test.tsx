import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingComparison } from "@/components/marketing/landing-comparison";

describe("LandingComparison", () => {
  it("renders architectural comparison with traditional and DevHub columns", () => {
    render(<LandingComparison />);

    expect(screen.getByRole("region", { name: /built different by definition/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /built different by definition/i })).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /cloud-dependent wrappers/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /local-first workbench/i })).toBeInTheDocument();

    // Verify key architectural dimensions
    expect(screen.getByText(/100% in-browser sandbox/i)).toBeInTheDocument();
    expect(screen.getByText(/< 1ms instantaneous/i)).toBeInTheDocument();
    expect(screen.getByText(/zero network egress/i)).toBeInTheDocument();
  });

  it("renders all 5 architectural dimensions", () => {
    render(<LandingComparison />);

    // Verify 5 dimensions are rendered
    expect(screen.getAllByText("Execution Boundary")).toHaveLength(2);
    expect(screen.getAllByText("Performance & Latency")).toHaveLength(2);
    expect(screen.getAllByText("Telemetry & Privacy")).toHaveLength(2);
    expect(screen.getAllByText("Workspace Workflow")).toHaveLength(2);
    expect(screen.getAllByText("Offline Reliability")).toHaveLength(2);
  });

  it("renders correct descriptions for Traditional Web Utilities", () => {
    render(<LandingComparison />);

    expect(screen.getByText("Remote Cloud Servers")).toBeInTheDocument();
    expect(screen.getByText("Data leaves your device and processes on third-party servers.")).toBeInTheDocument();

    expect(screen.getByText("500ms – 2,000ms Overhead")).toBeInTheDocument();
    expect(screen.getByText("Network latency, handshake delays, and remote queue processing.")).toBeInTheDocument();

    expect(screen.getByText("Unverified Data Flow")).toBeInTheDocument();
    expect(screen.getByText("Server logs, cookies, analytics scripts, and potential payload retention.")).toBeInTheDocument();

    expect(screen.getByText("Siloed & Ad-Cluttered")).toBeInTheDocument();
    expect(screen.getByText("Isolated tools requiring copy-pasting across tabs, surrounded by banner ads.")).toBeInTheDocument();

    expect(screen.getByText("Requires Internet")).toBeInTheDocument();
    expect(screen.getByText("Completely non-functional on planes, trains, or unstable networks.")).toBeInTheDocument();
  });

  it("renders correct descriptions for DevHub Toolkit", () => {
    render(<LandingComparison />);

    expect(screen.getByText("100% In-Browser Sandbox")).toBeInTheDocument();
    expect(screen.getByText("Deterministic execution in your browser's V8 engine with pure TypeScript and WebCrypto.")).toBeInTheDocument();

    expect(screen.getByText("< 1ms Instantaneous")).toBeInTheDocument();
    expect(screen.getByText("Sub-millisecond execution with O(1) detection fast guards and instant transformations.")).toBeInTheDocument();

    expect(screen.getByText("Zero Network Egress")).toBeInTheDocument();
    expect(screen.getByText("Zero analytics on payloads, zero tracking cookies, and strictly opt-in bounded history.")).toBeInTheDocument();

    expect(screen.getByText("Composable Pipelines")).toBeInTheDocument();
    expect(screen.getByText("Multi-step recipe chaining, saveable workflows, and distraction-free Geist design.")).toBeInTheDocument();

    expect(screen.getByText("True Offline PWA")).toBeInTheDocument();
    expect(screen.getByText("Precached Service Worker allows you to work seamlessly with no connection.")).toBeInTheDocument();
  });
});
