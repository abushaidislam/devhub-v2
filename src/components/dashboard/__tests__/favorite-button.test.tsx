import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FavoriteButton } from "@/components/dashboard/favorite-button";

describe("FavoriteButton", () => {
  it("adds and removes a tool with an accessible pressed state", async () => {
    const user = userEvent.setup();
    render(<FavoriteButton slug="json-formatter" />);

    const button = screen.getByRole("button", { name: /add to favorites/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button.querySelector("svg")).toHaveAttribute("fill", "none");

    await user.click(button);

    const activeButton = screen.getByRole("button", { name: /favorited/i });
    expect(activeButton).toHaveAttribute("aria-pressed", "true");
    expect(activeButton.querySelector("svg")).toHaveAttribute("fill", "currentColor");
    expect(JSON.parse(localStorage.getItem("devhub:favorites") ?? "[]")).toEqual(["json-formatter"]);

    await user.click(activeButton);
    const inactiveButton = screen.getByRole("button", { name: /add to favorites/i });
    expect(inactiveButton).toHaveAttribute("aria-pressed", "false");
    expect(inactiveButton.querySelector("svg")).toHaveAttribute("fill", "none");
  });
});
