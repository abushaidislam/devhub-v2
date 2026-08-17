/**
 * Versioned workflow definition for local tool chains.
 *
 * Workflow definitions contain engine identities and serializable options only.
 * User input and engine output are runtime values and are never part of this
 * schema.
 */
export const WORKFLOW_SCHEMA_VERSION = 1 as const;
export const MAX_WORKFLOW_STEPS = 50;

export type WorkflowSchemaVersion = typeof WORKFLOW_SCHEMA_VERSION;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type WorkflowStep = {
  engineId: string;
  options?: JsonObject;
};

export type Workflow = {
  version: WorkflowSchemaVersion;
  steps: WorkflowStep[];
};
