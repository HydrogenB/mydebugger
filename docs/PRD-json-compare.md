## Product Requirements Document — JSON Compare Tool

### Overview
Add a new tool module at route `/json-compare` to compare two JSON inputs and summarize differences. The UI must strictly match the provided design: two side-by-side editors for "Original JSON" (left) and "Comparison JSON" (right), with a top control bar and status counters.

### Goals
- Parse and compare two JSON documents entirely client-side.
- Show counts for Added, Removed, and Modified keys.
- Provide actions: Compare JSON, Format, Clear, Export.
- Provide file upload for each editor. Left side also includes a Sample button.
- No external dependencies; use existing design system components.

### Non-Goals
- Rich code-editor features (Monaco) or inline diff highlighting.
- Schema-aware comparisons.

### User Journeys
- Paste or upload two JSON files, click Compare to see Added/Removed/Modified counts.
- Click Format to pretty-print valid JSON in both editors; show inline error if invalid.
- Click Clear to reset both editors.
- Click Export to download a JSON diff report.

### UI Spec
- Top bar (left to right):
  - Primary button: "Compare JSON"
  - Secondary buttons: "Format", "Clear"
  - Ghost button: "Export"
  - Counters (right-aligned):
    - Added (green dot) with count
    - Removed (red dot) with count
    - Modified (amber dot) with count
- Two columns beneath:
  - Left panel header: "Original JSON" with buttons: Upload, Sample
  - Right panel header: "Comparison JSON" with button: Upload
  - Large textarea editors with monospaced font and line wrapping.
  - Error state: show small red message under the respective editor if JSON is invalid.

### Functional Spec
- Input handling
  - Text input via textarea for each side.
  - Upload buttons accept a `.json` file and load text into the corresponding editor.
  - Sample button (left only) loads built-in sample pair (left and right); right editor also populated accordingly.
- Compare behavior
  - On click Compare: parse JSON; if either side invalid, show error and do nothing else.
  - Compute diff with types: added, removed, modified.
  - Arrays are compared index-by-index; length deltas become added/removed; element changes become modified.
  - Produce summary counts and a detailed report of changes including JSON pointer-like paths.
- Format behavior
  - Pretty-print valid JSON in both editors with 2-space indentation. If invalid, show error for that side and skip formatting for it.
- Clear behavior
  - Reset both editors and counters to zero.
- Export behavior
  - Download a file named `json-compare-diff.json` containing the full diff report and summary.

### Data Model
```
type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

interface DiffEntry {
  path: string;         // e.g., /users/0/name
  type: DiffType;       // added | removed | modified
  left?: unknown;       // value in original
  right?: unknown;      // value in comparison
}

interface DiffSummary {
  added: number;
  removed: number;
  modified: number;
}

interface DiffReport {
  summary: DiffSummary;
  changes: DiffEntry[];
}
```

### Accessibility
- Labels for editors and buttons.
- Keyboard operable controls.

### Performance
- Handle JSON up to ~2MB per side smoothly.

### Telemetry/Analytics
- None for this iteration.

### Testing
- Unit tests for `compareJson` to cover primitives, objects, arrays, and nested changes.


