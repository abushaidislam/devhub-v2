/**
 * Typed value system for the DevHub tool pipeline (ADR-018).
 *
 * A ToolValue carries both a type tag and the string representation of the
 * value. Engines declare which types they accept and produce so a future
 * workflow runner can validate step compatibility before execution.
 */
export type ToolValueType = "text" | "json" | "binary" | "image";

export type ToolValue = {
	type: ToolValueType;
	value: string;
};

export type ToolResult = {
	output: ToolValue;
	/** Structured metadata about the result (e.g. { description: "Valid JSON" }). */
	meta?: Record<string, string | number | boolean>;
	/** Human-readable warnings that do not block the result. */
	warnings?: string[];
};

export type ToolEngine = {
	/** Matches the slug in the tool registry. */
	id: string;
	/** Value types this engine can process. */
	accepts: ToolValueType[];
	/** Value type this engine produces. */
	produces: ToolValueType;
	/** Processing boundary: "local" | "network" | "ai". */
	sensitivity: "local" | "network" | "ai";
	/**
	 * Execute the engine.
	 * Throws an Error with a safe user-facing message on invalid input.
	 */
	run(input: ToolValue, options?: unknown): Promise<ToolResult>;
};
