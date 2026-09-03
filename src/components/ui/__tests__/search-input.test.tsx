import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchInput } from "@/components/ui/search-input";

describe("SearchInput", () => {
  it("renders the input element correctly", () => {
    render(<SearchInput placeholder="Search..." />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("renders a label when the label prop is provided", () => {
    render(<SearchInput id="search" label="Search Label" />);
    expect(screen.getByLabelText("Search Label")).toBeInTheDocument();
  });

  it("shows the clear button when clearable is true, input has value, and onClear is provided", () => {
    const onClear = vi.fn();
    render(
      <SearchInput clearable value="test" onClear={onClear} onChange={() => {}} />
    );
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
  });

  it("does not show the clear button when the input has no value", () => {
    const onClear = vi.fn();
    render(
      <SearchInput clearable value="" onClear={onClear} onChange={() => {}} />
    );
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("calls onClear when the clear button is clicked", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <SearchInput clearable value="test" onClear={onClear} onChange={() => {}} />
    );

    const clearButton = screen.getByRole("button", { name: "Clear search" });
    await user.click(clearButton);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("calls onClear when the Escape key is pressed", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <SearchInput clearable value="test" onClear={onClear} onChange={() => {}} placeholder="Search..." />
    );

    const input = screen.getByPlaceholderText("Search...");
    await user.type(input, "{Escape}");
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("does not call onClear on Escape if clearable is false", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <SearchInput value="test" onClear={onClear} onChange={() => {}} placeholder="Search..." />
    );

    const input = screen.getByPlaceholderText("Search...");
    await user.type(input, "{Escape}");
    expect(onClear).not.toHaveBeenCalled();
  });

  it("renders error messages and sets aria-invalid when the error prop is provided", () => {
    render(<SearchInput id="search" error="Invalid search term" placeholder="Search..." />);

    const input = screen.getByPlaceholderText("Search...");
    expect(input).toHaveAttribute("aria-invalid", "true");

    const errorMessage = screen.getByRole("alert");
    expect(errorMessage).toHaveTextContent("Invalid search term");
    expect(errorMessage).toHaveAttribute("id", "search-error");

    expect(input).toHaveAttribute("aria-describedby", "search-error");
  });
});
