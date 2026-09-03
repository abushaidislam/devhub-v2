import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button, ButtonLink } from "@/components/ui/button";

describe("Button component", () => {
  it("renders with default props and children", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("applies variant, size, shape, and custom className", () => {
    render(
      <Button
        variant="secondary"
        size="large"
        shape="circle"
        className="custom-class"
      >
        Styled Button
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Styled Button" });
    expect(button.className).toContain("secondary");
    expect(button.className).toContain("large");
    expect(button.className).toContain("circle");
    expect(button.className).toContain("custom-class");
  });

  it("handles loading state correctly replacing children with Loading… text", () => {
    render(<Button loading>Submit</Button>);
    const button = screen.getByRole("button", { name: "Loading…" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
  });

  it("handles loading state without explicit children", () => {
    render(<Button loading aria-label="Loading action" />);
    const button = screen.getByRole("button", { name: "Loading action" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders prefix and suffix icons with aria-hidden", () => {
    render(
      <Button
        prefix={<svg data-testid="prefix-icon" />}
        suffix={<svg data-testid="suffix-icon" />}
      >
        Next
      </Button>,
    );
    expect(screen.getByTestId("prefix-icon")).toBeInTheDocument();
    expect(screen.getByTestId("suffix-icon")).toBeInTheDocument();
    expect(screen.getByTestId("prefix-icon").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByTestId("suffix-icon").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("triggers onClick when clicked and not disabled/loading", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    await user.click(screen.getByRole("button", { name: "Clickable" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not trigger onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Disabled Button" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("forwards ref to the underlying HTML button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe("Ref Test");
  });

  it("renders icon-only button without content span when no children provided", () => {
    render(
      <Button
        aria-label="Settings"
        prefix={<svg data-testid="settings-icon" />}
      />,
    );
    const button = screen.getByRole("button", { name: "Settings" });
    expect(button.querySelectorAll("span")).toHaveLength(1);
  });
});

describe("ButtonLink component", () => {
  it("renders an anchor element with href and children", () => {
    render(<ButtonLink href="/dashboard">Go to Dashboard</ButtonLink>);
    const link = screen.getByRole("link", { name: "Go to Dashboard" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("applies variant, size, shape, and custom className", () => {
    render(
      <ButtonLink
        href="/profile"
        variant="tertiary"
        size="small"
        shape="rounded"
        className="custom-link-class"
      >
        Profile
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "Profile" });
    expect(link.className).toContain("tertiary");
    expect(link.className).toContain("small");
    expect(link.className).toContain("rounded");
    expect(link.className).toContain("custom-link-class");
  });

  it("renders prefix and suffix icons in ButtonLink", () => {
    render(
      <ButtonLink
        href="/docs"
        prefix={<svg data-testid="link-prefix" />}
        suffix={<svg data-testid="link-suffix" />}
      >
        Documentation
      </ButtonLink>,
    );
    expect(screen.getByTestId("link-prefix")).toBeInTheDocument();
    expect(screen.getByTestId("link-suffix")).toBeInTheDocument();
  });

  it("renders icon-only link without content span when children is omitted", () => {
    render(
      <ButtonLink
        href="/home"
        aria-label="Home"
        prefix={<svg data-testid="home-icon" />}
      />,
    );
    const link = screen.getByRole("link", { name: "Home" });
    expect(link.querySelectorAll("span")).toHaveLength(1);
  });
});
