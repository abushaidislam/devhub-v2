# Safe recipe transfer

## Decision

Saved recipes can be shared only through an explicit local JSON file export/import flow. The version-1 format is named `devhub-recipe` and contains one validated recipe definition. It does not contain a saved-record ID, browser timestamps, built-in examples, runtime input, runtime output, execution results, clipboard data, or analytics data.

A file declares `containsUserInputs: false`. Imports reject files that omit or contradict that declaration. Export and import are bounded to 32,000 UTF-8 bytes and use the existing recipe schema and full-chain compatibility validator before a definition can be downloaded or written to IndexedDB.

## File contract

```json
{
  "format": "devhub-recipe",
  "version": 1,
  "exportedAt": "2026-07-28T00:00:00.000Z",
  "containsUserInputs": false,
  "recipe": {
    "name": "Base64 then URL encode",
    "description": "Encode text as Base64, then make it URL-safe.",
    "inputType": "text",
    "sourceRecipeId": "base64-url-encode",
    "workflow": {
      "version": 1,
      "steps": [
        { "engineId": "base64", "options": { "mode": "encode" } },
        { "engineId": "url-encoder", "options": { "mode": "encode" } }
      ]
    }
  }
}
```

## Safety properties

- Export requires an explicit action on one saved recipe.
- Import requires an explicit local file selection.
- Files are processed in the browser; there is no upload, server storage, share service, analytics event, or new network path.
- Imported IDs and timestamps are ignored because they are outside the transfer contract.
- Imported definitions are schema-validated and compatibility-validated before storage.
- Import adds one recipe and never deletes or overwrites another recipe.
- Imported recipes still require an explicit Run action and compatibility preflight before execution.
- The UI discloses that transfer files contain definitions only and tells users to review imported definitions before running them.

## Validation

Pure tests cover round-trip behavior, payload exclusion, invalid JSON, wrong formats, unsupported versions, payload-bearing declarations, incompatible workflows, oversized files, and safe filenames. Component tests cover local download, validated import, invalid-file rejection, storage-unavailable behavior, and payload exclusion.
