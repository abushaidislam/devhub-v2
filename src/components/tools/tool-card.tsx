import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Tool } from "@/lib/tools";
import { Badge } from "../ui/badge";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;

  return (
    <Link href={`/tools/${tool.slug}`} className="tool-card">
      <div className="tool-icon"><Icon size={19} /></div>
      <div className="tool-copy">
        <div className="tool-title-row">
          <h3>{tool.name}</h3>
          {tool.status === "soon" ? <Badge variant="amber" size="sm">Soon</Badge> : null}
        </div>
        <p>{tool.description}</p>
        <span className="tool-meta">{tool.category}</span>
      </div>
      <ArrowUpRight className="tool-arrow" size={17} aria-hidden="true" />
    </Link>
  );
}
