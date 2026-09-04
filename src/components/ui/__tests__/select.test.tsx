import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select, type SelectOption } from "../select";

const TEST_OPTIONS: SelectOption[] = [
  { value: "json", label: "JSON Formatter", group: "Formatters" },
  { value: "yaml", label: "YAML Formatter", group: "Formatters" },
  { value: "base64", label: "Base64", group: "Converters" },
  { value: "jwt", label: "JWT Decoder", group: "Converters" },
  { value: "curl", label: "cURL Converter", group: "Converters" },
  { value: "diff", label: "Text Diff", group: "Utilities" },
  { value: "cron", label: "Cron Parser", group: "Utilities" },
  { value: "uuid", label: "UUID Generator", group: "Generators" },
];

describe("Select component", () => {
  it("renders trigger with selected value and underlying combobox", () => {
    const handleChange = vi.fn();
    render(
      <Select
        value="json"
        onChange={handleChange}
        options={TEST_OPTIONS}
        aria-label="Tool Selector"
      />,
    );

    const combobox = screen.getByRole("combobox", { name: "Tool Selector" });
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveValue("json");

    const trigger = screen.getByRole("button", { name: "Tool Selector" });
    expect(trigger).toHaveTextContent("JSON Formatter");
  });

  it("opens popover on trigger click and displays options and search input", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select
        value="json"
        onChange={handleChange}
        options={TEST_OPTIONS}
        aria-label="Tool Selector"
      />,
    );

    const trigger = screen.getByRole("button", { name: "Tool Selector" });
    await user.click(trigger);

    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();

    expect(within(listbox).getByText("Converters")).toBeInTheDocument();
    expect(within(listbox).getByText("Formatters")).toBeInTheDocument();
    expect(within(listbox).getByText("Generators")).toBeInTheDocument();
  });

  it("selects an option when clicked in popover", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select
        value="json"
        onChange={handleChange}
        options={TEST_OPTIONS}
        aria-label="Tool Selector"
      />,
    );

    const trigger = screen.getByRole("button", { name: "Tool Selector" });
    await user.click(trigger);

    const listbox = screen.getByRole("listbox");
    const curlOption = within(listbox).getByRole("option", { name: /cURL Converter/i });
    await user.click(curlOption);

    expect(handleChange).toHaveBeenCalledWith("curl");
  });

  it("filters options dynamically when typing in search input", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select
        value="json"
        onChange={handleChange}
        options={TEST_OPTIONS}
        aria-label="Tool Selector"
      />,
    );

    const trigger = screen.getByRole("button", { name: "Tool Selector" });
    await user.click(trigger);

    const searchInput = screen.getByPlaceholderText("Search…");
    await user.type(searchInput, "diff");

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Text Diff")).toBeInTheDocument();
    expect(within(listbox).queryByText("Base64")).not.toBeInTheDocument();
  });

  it("navigates and selects option via keyboard arrows and enter", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select
        value="json"
        onChange={handleChange}
        options={TEST_OPTIONS}
        aria-label="Tool Selector"
      />,
    );

    const trigger = screen.getByRole("button", { name: "Tool Selector" });
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(handleChange).toHaveBeenCalledWith("yaml");
  });

  it("closes popover when Escape is pressed", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select
        value="json"
        onChange={handleChange}
        options={TEST_OPTIONS}
        aria-label="Tool Selector"
      />,
    );

    const trigger = screen.getByRole("button", { name: "Tool Selector" });
    await user.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("supports user.selectOptions directly on the combobox for test compatibility", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select
        value="json"
        onChange={handleChange}
        options={TEST_OPTIONS}
        aria-label="Tool Selector"
      />,
    );

    const combobox = screen.getByRole("combobox", { name: "Tool Selector" });
    await user.selectOptions(combobox, "base64");

    expect(handleChange).toHaveBeenCalledWith("base64");
  });
});
