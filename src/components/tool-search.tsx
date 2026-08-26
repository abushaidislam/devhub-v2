"use client";

import { useMemo, useState } from "react";
import { categories, tools } from "@/lib/tools";
import { Badge } from "./ui/badge";
import { SearchInput } from "./ui/search-input";
import { ToolCard } from "./tool-card";

export function ToolSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const filtered = useMemo(
    () =>
      tools.filter(
        (tool) =>
          (category === "All" || tool.category === category) &&
          `${tool.name} ${tool.description} ${tool.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, category],
  );

  return (
    <>
      <div className="tool-controls">
        <SearchInput
          id="tool-search"
          className="tool-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, task or category…"
          aria-label="Search tools"
          clearable
          onClear={() => setQuery("")}
        />
      </div>
      <div className="category-tabs" role="tablist" aria-label="Tool categories">
        {["All", ...categories].map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
            {item === "All" ? <Badge variant="gray" size="sm">{tools.length}</Badge> : null}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className="tools-grid">
          {filtered.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No matching tools</h2>
          <p>Try a broader search or another category.</p>
        </div>
      )}
    </>
  );
}
