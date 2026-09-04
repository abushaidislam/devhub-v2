import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DualWorkbench } from "../dual-workbench";

describe("DualWorkbench", () => {
  it("renders Dual Workbench with Left and Right panes and default tools", async () => {
    render(<DualWorkbench />);

    expect(screen.getByText("Dual Split Workbench")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Left Tool Pane" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Right Tool Pane" })).toBeInTheDocument();

    const leftSelect = screen.getByRole("combobox", { name: "Select left tool" });
    const rightSelect = screen.getByRole("combobox", { name: "Select right tool" });

    expect(leftSelect).toHaveValue("curl-converter");
    expect(rightSelect).toHaveValue("json-to-typescript");
  });

  it("executes Left tool and produces output", async () => {
    const user = userEvent.setup();
    render(<DualWorkbench />);

    const runLeftBtn = await screen.findByRole("button", { name: "Run Left" });
    await user.click(runLeftBtn);

    await waitFor(() => {
      const leftOutput = screen.getByLabelText("Left tool output");
      expect(leftOutput).toBeInTheDocument();
      expect(leftOutput.textContent).toContain("fetch");
    });
  });

  it("pipes Left output into Right pane manually", async () => {
    const user = userEvent.setup();
    render(<DualWorkbench />);

    const leftInput = screen.getByRole("textbox", { name: "Left tool input" });
    await user.clear(leftInput);
    await user.type(leftInput, "curl https://api.test.com/data");

    const runLeftBtn = await screen.findByRole("button", { name: "Run Left" });
    await user.click(runLeftBtn);

    await waitFor(() => {
      expect(screen.getByLabelText("Left tool output")).toBeInTheDocument();
    });

    const pipeBtn = screen.getByRole("button", { name: "Pipe Left Output to Right Input" });
    await user.click(pipeBtn);

    const rightInput = screen.getByRole("textbox", { name: "Right tool input" });
    expect(rightInput).not.toHaveValue("");
  });

  it("swaps Left and Right panes when Swap sides is clicked", async () => {
    const user = userEvent.setup();
    render(<DualWorkbench />);

    const leftSelect = screen.getByRole("combobox", { name: "Select left tool" });
    const rightSelect = screen.getByRole("combobox", { name: "Select right tool" });

    expect(leftSelect).toHaveValue("curl-converter");
    expect(rightSelect).toHaveValue("json-to-typescript");

    const swapBtn = screen.getByRole("button", { name: "Swap sides" });
    await user.click(swapBtn);

    expect(leftSelect).toHaveValue("json-to-typescript");
    expect(rightSelect).toHaveValue("curl-converter");
  });

  it("applies a preset and switches tools", async () => {
    const user = userEvent.setup();
    render(<DualWorkbench />);

    const presetBtn = screen.getByRole("button", { name: /Base64 → JSON Formatter/i });
    await user.click(presetBtn);

    const leftSelect = screen.getByRole("combobox", { name: "Select left tool" });
    const rightSelect = screen.getByRole("combobox", { name: "Select right tool" });

    expect(leftSelect).toHaveValue("base64");
    expect(rightSelect).toHaveValue("json-formatter");

    await waitFor(() => {
      const leftOutput = screen.getByLabelText("Left tool output");
      expect(leftOutput.textContent).toContain("DevHub");
    });
  });

  it("adjusts split percent with keyboard arrows on the splitter", async () => {
    const user = userEvent.setup();
    render(<DualWorkbench />);

    const splitter = screen.getByRole("separator", { name: "Resize dual panes" });
    expect(splitter).toHaveAttribute("aria-valuenow", "50");

    splitter.focus();
    await user.keyboard("{ArrowLeft}");
    expect(splitter).toHaveAttribute("aria-valuenow", "45");

    await user.keyboard("{ArrowRight}");
    expect(splitter).toHaveAttribute("aria-valuenow", "50");
  });
});
