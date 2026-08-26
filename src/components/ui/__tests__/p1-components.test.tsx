// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";

describe("P1 UI primitives", () => {
  it("centers icon-only buttons and links without an empty content item", () => {
    render(
      <>
        <Button type="button" aria-label="Add favorite" prefix={<svg data-testid="button-icon" aria-hidden="true" />} />
        <ButtonLink href="/repository" aria-label="Open repository" prefix={<svg data-testid="link-icon" aria-hidden="true" />} />
      </>,
    );

    expect(screen.getByRole("button", { name: "Add favorite" }).querySelectorAll("span")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Open repository" }).querySelectorAll("span")).toHaveLength(1);
  });

  it("keeps a loading button disabled and announces busy state", () => {
    render(<Button loading>Deploy project</Button>);
    const button = screen.getByRole("button", { name: "Loading…" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("clears SearchInput on Escape and through its clear action", async () => {
    const user = userEvent.setup();
    function SearchHarness() {
      const [value, setValue] = React.useState("jwt");
      return (
        <SearchInput
          id="test-search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          clearable
          onClear={() => setValue("")}
          aria-label="Search tools"
        />
      );
    }

    render(<SearchHarness />);
    const input = screen.getByRole("searchbox", { name: "Search tools" });
    expect(input).toHaveValue("jwt");
    await user.click(input);
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("");
  });

  it("renders a semantic badge and labelled status dot", () => {
    render(
      <>
        <Badge variant="green">Local only</Badge>
        <StatusDot status="success" label="Healthy" />
      </>,
    );
    expect(screen.getByText("Local only")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Healthy" })).toBeInTheDocument();
  });

  it("supports an explicit clear button for controlled searches", () => {
    const onClear = vi.fn();
    render(
      <SearchInput
        value="json"
        onChange={() => undefined}
        clearable
        onClear={onClear}
        aria-label="Search tools"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
