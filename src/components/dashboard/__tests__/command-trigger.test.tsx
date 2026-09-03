import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CommandTrigger } from "@/components/dashboard/command-trigger";

describe("CommandTrigger", () => {
  it("renders search variant by default with tool count and className", () => {
    render(<CommandTrigger count={42} className="custom-trigger-class" />);

    const button = screen.getByRole("button", { name: "Search developer tools" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("custom-trigger-class");
    expect(button).toHaveTextContent("Search 42 tools…");
    expect(button).toHaveTextContent("⌘K");
  });

  it("renders command variant when kind is 'command'", () => {
    render(<CommandTrigger count={10} kind="command" />);

    const button = screen.getByRole("button", { name: "Open command menu" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Command menu");
    expect(button).toHaveTextContent("⌘K");
  });

  it("dispatches 'devhub:command' event on window when clicked", async () => {
    const user = userEvent.setup();
    const eventListener = vi.fn();

    window.addEventListener("devhub:command", eventListener);

    render(<CommandTrigger count={15} />);

    const button = screen.getByRole("button", { name: "Search developer tools" });
    await user.click(button);

    expect(eventListener).toHaveBeenCalledTimes(1);

    window.removeEventListener("devhub:command", eventListener);
  });
});
