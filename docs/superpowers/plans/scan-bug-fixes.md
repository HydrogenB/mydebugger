# Plan: Fix all bugs found in the experience + functional scans

## Context

Two scans of `src/tools` produced 18 findings: 8 experience/UX defects and 10 functional
defects. This plan fixes all of them. Every finding was verified by reading the flow end to
end; finding F1 (password strength meter) additionally has an empirical repro.

The repo is a front-end-only, edge-safe, stateless Vite + React 18 + TypeScript app deployed
to Vercel. There is no backend to lean on except the existing `/api/utility-tools` proxy.

## Spec

The scan reports are the authority. Each task below restates its findings in full — the task
text IS the spec for that task. Where a task's text and this plan's Global Constraints
disagree, the Global Constraints win.

## Baseline state

Recorded before any work, on `worktree-fix-scan-bugs` at `b9bcd96a`:

- `pnpm test`: 17 suites fail, 21 pass; 3 individual tests fail, 104 pass.
- 14 of the 17 failures are **pre-existing and out of scope**: orphaned test files importing
  tool paths that no longer exist in `src/` (`api-simulator`, `api-test`, `cache-inspector`,
  `cookie-scope`, `deep-link-chain`, `device-trace/lib/deviceTrace`, `json-compare`,
  `json-converter`, `networksuit`, `storage-sync`, `bson-csv`).
- The other 3 are pre-existing `permission-tester` failures, also out of scope.
- **Every suite covering a file this plan touches currently passes**:
  `tools.csvtomd.test.ts`, `tools.cors-tester.test.ts`, `tools.header-scanner.test.ts`,
  `tools.jwt.analyzer.test.ts`, `tools.random-password-generator.entropy.test.ts`.

Do not fix the pre-existing failures. Do not delete the orphaned test files.

## Global Constraints

1. **Verify with targeted suites, not the full run.** Run `pnpm jest <paths>` for the suites
   covering your task plus any new suite you add. A green targeted run plus an unchanged
   count of pre-existing failures is the bar. Never report "tests pass" from a full-suite run
   that still shows the 17 baseline failures without saying so.
2. **`pnpm typecheck` must stay clean for the files you touch.** The repo has pre-existing
   `typecheck_errors*.txt` artifacts; ignore them, but introduce no new errors.
3. **`pnpm lint` must pass on files you touch** (`--max-warnings 0`, Airbnb TS ESLint,
   Prettier, 2-space indent, 100-char target).
4. **MIT header comment is required at the top of every new TypeScript file**:
   ```ts
   /**
    * © 2025 MyDebugger Contributors – MIT License
    */
   ```
5. **Naming**: PascalCase components, camelCase hooks and utilities, kebab-case tool route
   folders.
6. **Tests assert user-facing behavior** — roles, labels, ARIA attributes — not
   implementation details. Co-locate in `__tests__/` with the `*.test.ts[x]` suffix.
7. **Edge-safe and stateless.** Feature-detect every browser API before use; never assume a
   secure context, a permission grant, or a modern engine.
8. **Fix at the root, not per caller.** If several callers route through one function, the
   guard belongs in that function.
9. **Do not widen scope.** Fix the findings named in your task. If you spot an unrelated
   defect, report it in your report file — do not fix it.
10. **File ownership is exclusive.** Each task lists the files it owns. Do not edit a file
    owned by another task, even to fix something obvious in it. Report it instead.
11. **`src/tools/permission-tester/**` is off-limits to every task.** Its
    `navigator.clipboard` calls are the feature under test, not defects.

## Cross-task interface: the clipboard helper

Task 1 creates `src/shared/utils/clipboard.ts`. Tasks 2, 3, 4, 5, 6, 8, 9, and 10 consume it.
This is the exact signature — do not change it, do not add parameters:

```ts
/**
 * Copy text to the clipboard. Resolves true on success, false on failure.
 * Never throws and never rejects.
 */
export const copyText = (text: string): Promise<boolean>
```

Import it as `import { copyText } from '<relative path>/shared/utils/clipboard';`

---

## Task 1: Shared clipboard helper

**Finding (UX #7):** `navigator.clipboard.writeText` is reimplemented at ~40 call sites across
31 files. Only two have a fallback. The rest silently fail on non-secure origins and on older
Safari — every copy button in the suite is dead in those environments, with no error shown.

**Files owned:** `src/shared/utils/clipboard.ts` (new),
`__tests__/shared/clipboard.test.ts` (new).

**This task changes no call sites.** Tasks 2-10 migrate them. Create the helper and its tests
only.

### Requirements

Implement `copyText(text: string): Promise<boolean>` exactly as specified in the Cross-task
interface section above, with this behavior:

1. Try `navigator.clipboard.writeText(text)` first, guarded by feature detection — the whole
   chain (`navigator`, `navigator.clipboard`, `navigator.clipboard.writeText`) may be absent.
2. On absence or on rejection, fall back to the legacy `document.execCommand('copy')` path
   using a temporary off-screen `<textarea>`. Model it on the working implementation at
   `src/tools/random-password-generator/components/GeneratorPanel.tsx:100-108`: set the value,
   mark it `readonly`, position it off-screen, append to `document.body`, `select()`,
   `execCommand('copy')`, then **always remove it** — including when `execCommand` throws.
3. Return `true` only when a path actually reported success. `document.execCommand` returns a
   boolean; honor it. Return `false` otherwise.
4. **Never throw, never reject** — every caller relies on this to decide between a success
   toast and an error toast.
5. Guard for a non-DOM environment: if `document` is undefined and the async path is
   unavailable, resolve `false` rather than throwing. The repo runs jsdom tests and SSR-safe
   code.
6. Copying an empty string is a legitimate call — do not special-case it to `false`.

### Tests (`__tests__/shared/clipboard.test.ts`)

Cover, at minimum:
- async path succeeds → resolves `true`, `writeText` received the exact text
- async path rejects → falls back to `execCommand`; when that returns `true`, resolves `true`
- `navigator.clipboard` entirely absent → uses `execCommand` path
- both paths fail (`execCommand` returns `false`) → resolves `false`, does not throw
- `execCommand` throws → resolves `false`, and the temporary textarea is removed from the DOM
  (assert `document.body` has no leftover `textarea`)

---

## Task 2: csvtomd — five functional defects

**Files owned:** `src/tools/csvtomd/lib/csvtomd.ts`,
`src/tools/csvtomd/hooks/useCsvtomd.ts`, `__tests__/tools.csvtomd.test.ts`.
You may also read `src/tools/csvtomd/components/CsvtomdPanel.tsx` and edit it only if a fix
requires it.

### Finding F2 — the delimiter dropdown does nothing

`useCsvtomd.ts:23-26`:
```ts
const detected = detectDelimiter(csv);
setDelimiter((d) => (d === ',' ? detected : d));
const res = parseCsv(csv, detected);   // always `detected`, never `delimiter`
```
`delimiter` state is display-only, and the effect's deps are `[csv]` so changing the select
never re-parses. `CsvtomdPanel.tsx:58` renders it as a live `SelectInput` with a
"Auto-detected when pasting" hint.

**Required behavior:** auto-detect on new CSV input, but a user's explicit choice must take
effect immediately and must not be clobbered by re-detection while they keep editing the same
CSV. Parse with the delimiter that is actually in effect.

### Finding F3 — the separator row desyncs from the column count

`useCsvtomd.ts:36-38` seeds alignment only `if (alignment.length === 0)`, and `alignment` is
excluded from the effect deps. Paste a 3-column CSV, then edit it to 5 columns: the table gets
5 header cells and 3 separator cells, which is not a valid markdown table. The alignment
buttons at `CsvtomdPanel.tsx:74` also stop corresponding to columns.

**Required behavior:** the alignment array length always equals the current column count.
Preserve the user's existing per-column choices when the count changes; default any new
column to `'left'`. `generateMarkdownTable` must emit exactly one separator cell per header
cell regardless of what it is handed — defend at the root, per Global Constraint 8.

### Finding F4 — headers unescaped, and newlines break the table

`csvtomd.ts:43-45`: row cells go through `escapeMd`, but `headers.join(' | ')` does not, so a
`|` in a header breaks the table. And `escapeMd` only escapes `|`, not newlines — Papa
correctly parses a quoted multi-line cell, then the generator emits a raw newline mid-row and
the table dies.

**Required behavior:** apply the same escaping to headers as to cells. Escaping must also
neutralize CR and LF inside a cell or header so one logical row stays one physical line. A
`<br>` is the conventional markdown-table representation of an in-cell line break; use it.

### Finding F5 — headerless CSV loses its first row

`csvtomd.ts:27` computes `hasHeader` and never uses it; `header: true` is unconditional. A CSV
with no header row silently has its first data row consumed as column names. The dead variable
marks the intended guard.

**Required behavior:** either use the detection to handle headerless input (synthesizing
column names, e.g. `Column 1`, `Column 2`, …) or delete the dead variable. Choose one and say
which in your report. If you keep detection, note that the current expression
`/^[^\n]*[,;\t|].*\n/` tests only that the first line contains a delimiter and something
follows — it does not actually distinguish a header from a data row. A heuristic that cannot
work is worse than none; if you cannot make it decide correctly, delete it and note that
headerless CSV is unsupported.

### Finding F10 — download fails on Firefox

`useCsvtomd.ts:78-87`: `a.click()` without appending the anchor to the document, then a
synchronous `revokeObjectURL`. Firefox requires the anchor to be in the DOM.
`src/tools/img-to-svg/hooks/useImageToSvg.ts:118-127` does this correctly — mirror that
approach (append, click, remove, then revoke).

### Also in this task

- `copyMarkdown` (`useCsvtomd.ts:73-76`) is a bare `await navigator.clipboard.writeText(...)`
  with no try/catch and no copied state. `CsvtomdPanel.tsx:93` wires it to `onClick`, so a
  denied clipboard produces an unhandled promise rejection and zero user feedback. Route it
  through `copyText` from Task 1 and surface success/failure to the user.
- `uploadFile` (`useCsvtomd.ts:54-60`) has no `reader.onerror` — a failed file read shows
  nothing. Set the existing `error` state.

### Tests

Extend `__tests__/tools.csvtomd.test.ts`. One regression test per finding above, minimum:
F2 (explicit delimiter is honored), F3 (column count change keeps separator row aligned),
F4 (`|` in a header is escaped; a multi-line cell stays on one line), F5 (whichever behavior
you chose), F10 (anchor is in the document when `click` fires).

---

## Task 3: Password strength meter reports the wrong number

**Files owned:** `src/tools/random-password-generator/lib/generators.ts`,
`src/tools/random-password-generator/components/GeneratorPanel.tsx`,
`__tests__/tools.random-password-generator.entropy.test.ts`,
`__tests__/tools.random-password-generator.generators.test.ts`.

**Existing test that constrains you:**
`__tests__/tools.random-password-generator.generators.test.ts:39-40` already asserts on
`estimateStrength` — that a shorter password estimates lower entropy than a longer one. That
assertion is correct and must keep passing. If your change breaks it, your change is wrong.
Both rpg suites must be green when you finish.

### Finding F1 — verified with a repro

`generators.ts:207`:
```ts
const isPassphrase = password.length > 20 && (password.includes('-') || password.includes(' ') || password.includes('.'));
```

`SYMBOLS` (`generators.ts:32`) contains `-`, `.` and `_`. So any password of 21+ characters
with symbols enabled takes the **passphrase** branch, where entropy becomes
`separatorCount * 11`. Measured over 200 generations at the panel's own settings
(length 32, all four character classes, `excludeAmbiguous: true`):

```
}@{DUYmUAATC7*7u>7E}f,U[.r;]Fv,C => 22 bits Very weak 22%
!hM,7/C(&vD-*/Qaxuw>CjHM*.H9v{LP => 33 bits Weak 33%
mLRqrk.{<*N*+,3!cLKqTd4-nVWA#_L3 => 44 bits Weak 44%
under-reported /200: 120
```

120 of 200 report under 100 bits; true entropy is ≈200 bits. This is the tool's headline
number, wrong on more than half of its own output, and it actively discourages users from
keeping strong passwords.

**Root cause:** `estimateStrength(options, password)` accepts `options` and ignores it
entirely, guessing the input's type from the string instead. The caller already knows the
type — `GeneratorPanel.tsx:83` calls it only when `mode === 'password'`.

### Requirements

1. Decide the entropy model from the caller's declared type, never by sniffing the string.
   `estimateStrength` must use its `options` argument, or take an explicit type/mode
   parameter. You choose the shape; update the call site at `GeneratorPanel.tsx:83` to match.
2. For a generated password, entropy must be computed from the **pool size the generator
   actually drew from** — the selected character classes with `excludeAmbiguous` applied, or
   `customChars` when set — times the length. Not from character classes observed in the
   output string, which under-counts whenever a class happens not to appear.
3. Keep an observed-character-class fallback for a password whose options are unknown
   (`options === null`), which the current signature permits.
4. The passphrase branch's hardcoded 11 bits per word is also wrong: the wordlist is 2448
   unique words (`log2(2448) ≈ 11.26`). Derive bits per word from `WORDLIST.length` rather
   than hardcoding. Note that `generatePassphrase` and `generatePIN` are currently unreachable
   — the panel offers only `password`, `uuid` and `key` (`GeneratorPanel.tsx:23`). Fix the
   math; do not build UI for them, and do not delete them.
5. Migrate `GeneratorPanel.tsx`'s `copyToClipboard` (line 95-129) to `copyText` from Task 1,
   preserving the existing burst animation and the `copied` reset timer. This site is one of
   the two that already had a working fallback — the helper was modeled on it, so behavior
   must not regress.

### Tests

Extend `__tests__/tools.random-password-generator.entropy.test.ts`:
- **The repro above, as a regression test**: generate at length 32 with all classes enabled
  and assert every result estimates above 100 bits and is labeled `Strong` or `Very strong`.
  Loop enough times (100+) to catch the 60% case; the generator is seeded from
  `crypto.getRandomValues` so a single sample is not enough.
- A password containing `-` and `.` is never classified as a passphrase.
- Entropy scales with length and with the number of enabled classes.
- `excludeAmbiguous: true` yields a smaller pool, and so slightly lower entropy per character,
  than `false` at the same length.
- `options === null` falls back to observed classes without throwing.

---

## Task 4: CORS tester reports the wrong verdict

**Files owned:** `src/tools/cors-tester/lib/cors.ts`,
`src/tools/cors-tester/hooks/useCorsTester.ts`,
`src/tools/cors-tester/components/CorsTesterPanel.tsx`,
`__tests__/tools.cors-tester.test.ts`.

### Finding F6 — the default mode cannot work in a browser

`cors.ts:30-61`, reached whenever `mode === 'browser'`, which is the default
(`useCorsTester.ts:22`). Two independent reasons it cannot report the truth:

1. `Origin` and `Access-Control-Request-Method` / `Access-Control-Request-Headers` are
   **forbidden header names**. `fetch` strips them silently. The Request panel then displays
   `requestHeaders` as though they were sent — they were not.
2. A cross-origin `fetch` response exposes only CORS-safelisted response headers. The four
   `access-control-allow-*` headers are not safelisted, so
   `res.headers.get('access-control-allow-origin')` returns `null`. Every field reads null and
   `analyzeCors` then reports "everything mismatched" for a correctly configured server.

Only `mode: 'server'` — the existing `/api/utility-tools?tool=cors-preflight` proxy — can
actually observe preflight headers.

**Required behavior:** stop presenting unobtainable data as a measurement. Make the tool
honest about what each mode can and cannot see. Both of these are acceptable resolutions;
pick one and justify it in your report:
- default to server mode, and have browser mode state plainly in the UI that it reports only
  whether the browser permitted the request, not the server's preflight headers; or
- keep the browser default but detect the all-null case and render an explicit explanation
  instead of a fabricated mismatch verdict.

Do not display `requestHeaders` as "headers sent" for browser mode when the browser strips
them. Either label them as requested-but-forbidden or omit them.

### Finding F7 — `*` plus credentials is reported as allowed

`cors.ts:125`:
```ts
const originAllowed = allowOrigin === '*' || allowOrigin === origin;
```
This ignores credentials. Per the Fetch spec, `Access-Control-Allow-Origin: *` is invalid when
credentials are sent, and **every** browser blocks it — not just Safari. The code computes
`credentialsNeeded` two lines later (`:130-132`) and never feeds it back into the origin
check. `blockedBrowsers` at `:161-166` pushes only `'Safari'`. The guide string at `:156-157`
already states the rule the check omits.

**Required behavior:** when credentials are needed, a wildcard origin is a mismatch, and the
blocked-browser list must reflect that all major browsers block it. Keep the existing
`mismatches` / `guides` / `blockedBrowsers` shape — `CorsTesterPanel.tsx` consumes it.

### Finding F8 — header list splitting does not trim

`cors.ts:116-121` splits on `/,\s*/`. A response header of `GET , POST` yields `'GET '`, which
never matches. Trim each entry (and drop empties) for both the methods and the headers lists.

### Also in this task

- `generateCurlCommand` (`cors.ts:86-96`) wraps the URL and header values in single quotes
  without escaping. A `'` in either produces a broken command the user copies into a shell.
  Escape it properly.
- Migrate the two `navigator.clipboard.writeText(curlCommand)` call sites in
  `CorsTesterPanel.tsx` to `copyText` from Task 1.

### Tests

Extend `__tests__/tools.cors-tester.test.ts`: wildcard origin plus an `Authorization` header is
a credentials **and** origin mismatch with all major browsers blocked; wildcard origin without
credentials still passes; `'GET , POST'` matches `POST`; a `'` in a header value produces a
correctly escaped curl string; and whichever browser-mode honesty behavior you chose.

---

## Task 5: JWT `alg: none` check is case-sensitive

**Files owned:** all of `src/tools/jwt/**` and `__tests__/tools.jwt.analyzer.test.ts`.

### Finding F9

Four independent exact-case comparisons against the lowercase literal `'none'`, with no
normalization anywhere in the tool:

- `src/tools/jwt/utils/analyzer.ts:42` — `checkNoneAlgorithm`
- `src/tools/jwt/context/JwtContext.tsx:317`
- `src/tools/jwt/JwtDecoder.tsx:89`
- `src/tools/jwt/workers/cryptoWorker.ts:503`

`alg: "None"` and `alg: "NONE"` are the canonical bypass variants precisely because naive
checks are case-sensitive. A token using them gets **no** high-severity "unsigned token"
finding. Worse, `checkAlgVsSignature` (`analyzer.ts:246`) then fires with the misleading
"Missing signature despite algorithm" — so the report is not merely incomplete, it is wrong
about what is happening.

**Signature verification itself is not bypassable.** `cryptoWorker.ts`'s `switch` falls to
`default: throw new Error('Unsupported algorithm: ...')` for `"None"`, so verification
correctly fails. This is a wrong-security-report bug, not a verification bypass. Do not
describe it as a bypass in commits or comments.

### Requirements

1. Normalize `alg` **once**, at a single shared point, and have all four sites read the
   normalized value (Global Constraint 8). A tool-local helper is the right size for this —
   do not add a dependency.
2. Normalization must be case-insensitive for the `none` comparison specifically. Be careful
   with the named algorithms: `HS256` etc. are case-sensitive identifiers in the
   `cryptoWorker` switch and in `checkKid`'s `alg.startsWith('HS')` test
   (`analyzer.ts:208`) — do not lowercase the value used for those lookups and thereby break
   verification. Compare case-insensitively for `none`; keep the original value for
   algorithm dispatch and for display.
3. The finding text must still report the algorithm as the token actually spelled it, so a
   user can see they were sent `"None"`.
4. `checkAlgVsSignature` must not fire its misleading "Missing signature despite algorithm"
   finding for any spelling of `none`.
5. Migrate the four `navigator.clipboard.writeText` sites in `JwtDecoder.tsx`,
   `components/BuilderWizard.tsx`, `components/InspectorPane.tsx` and
   `components/JwksProbe.tsx` to `copyText` from Task 1.

### Tests

Extend `__tests__/tools.jwt.analyzer.test.ts`: `analyzeToken` emits `JWT-NONE-ALG` at `high`
severity for `alg` values `none`, `None`, `NONE` and `nOnE`; none of those also emit
`JWT-MISSING-SIG`; `HS256` still emits its `JWT-WEAK-ALG-HS256` finding and `checkKid` still
skips `HS*` algorithms.

---

## Task 6: Unicode analyzer throws on an unguarded browser API

**Files owned:** `src/tools/unicode-analyzer/lib/analyzer.ts`,
`src/tools/unicode-analyzer/hooks/useUnicodeAnalyzer.ts`,
`src/tools/unicode-analyzer/types/**` (the stats flag below is a type change),
`src/tools/unicode-analyzer/components/AnalyzerView.tsx`, and a new
`__tests__/tools.unicode-analyzer.test.ts` (this tool has no suite yet).

### Finding F11

`analyzer.ts:175` calls `new Intl.Segmenter('en', { granularity: 'grapheme' })` with no
feature detection. On Safari below 16.4 the constructor is absent and `analyzeText` throws, so
the whole tool breaks rather than degrading. Global Constraint 7 and the repo's own
contributor guidelines both require feature detection before using a browser API.

**Required behavior:** detect `Intl.Segmenter` and fall back to a reasonable grapheme
approximation when it is missing — `Array.from(input)` yields code points, which is a correct
per-code-point split and an acceptable degraded grapheme split. The tool must produce results
either way. If the fallback is in use, the result should make that visible to the user rather
than silently reporting a grapheme count that means something different; add a flag to the
returned stats and surface it in the view.

### Also in this task

`useUnicodeAnalyzer.ts:124` is a bare `await navigator.clipboard.writeText(...)` followed by
`setCopied(true)`, with no catch — a denied clipboard leaves the button unchanged with no
error and produces an unhandled rejection. Route it through `copyText` from Task 1 and show
the failure. The view at
`src/tools/unicode-analyzer/components/AnalyzerView.tsx:125` renders the `copied` state; you
own that file for this change only.

### Tests

`analyzeText` with `Intl.Segmenter` present produces correct grapheme clustering for a
multi-code-point emoji (e.g. a ZWJ family sequence counts as one grapheme); with
`Intl.Segmenter` stubbed out as undefined, `analyzeText` does not throw and still reports
correct code point, UTF-16 and UTF-8 byte counts.

---

## Task 7: Image compressor leaks a blob per render and mislabels downloads

**Files owned:** `src/tools/image-compressor/components/ImageCompressorPanel.tsx`,
`src/tools/image-compressor/hooks/useImageCompressor.ts`,
`src/tools/image-compressor/lib/imageCompressor.ts`, and a new or existing
`__tests__/tools.image-compressor.test.tsx`.

### Finding U1 — an object URL created in the render body

`ImageCompressorPanel.tsx:149`:
```tsx
href={URL.createObjectURL(result.blob)}
```
This is in the render body, so every re-render mints a new blob URL and none is ever revoked.
Typing in the target-size field or clicking a format radio leaks another full copy of the
image. This file is one of only four in `src/` that call `createObjectURL` without any
matching `revokeObjectURL`.

**Required behavior:** create the URL once per result and revoke the previous one when the
result changes and on unmount. No `createObjectURL` in a render body.

### Finding U1b — the download extension can contradict the bytes

Still at `:149-150`: `download` builds its extension from the live `mimeType` state, not from
the result. Compress as WebP, then click the PNG radio without recompressing: the file saves
as `compressed.png` containing WebP bytes.

**Required behavior:** the filename extension must derive from the mime type the result was
actually encoded with. `CompressedResult` is declared at
`imageCompressor.ts:19` — carry the mime type on it if it is not there already.

### Finding U2 — number inputs become NaN when cleared

`ImageCompressorPanel.tsx:67` `setTargetSize(parseInt(e.target.value, 10))` and `:99`
`setScale(parseFloat(e.target.value))`. Clearing either field yields `NaN`, which flows into
`value={NaN}` — React warns, the input stops behaving as controlled, and `compress` runs with
`NaN`. Guard both so a cleared or non-numeric field produces a usable number, and so
`compress` cannot run with `NaN`. `min={1}` on target size and the 0.1 step on scale indicate
the intended ranges.

### Tests

A `@testing-library/react` test that clearing the target-size input does not produce a `NaN`
value and does not warn; and that the download anchor's `download` attribute extension matches
the result's own mime type after the format radio is changed without recompressing.

---

## Task 8: header-scanner's copy button sticks, on every row

**Files owned:** `src/tools/header-scanner/hooks/useHeaderScanner.ts`,
`src/tools/header-scanner/components/HeaderScannerPanel.tsx`,
`__tests__/tools.header-scanner.test.ts`.

### Finding U3

`useHeaderScanner.ts:32-39` exposes a single shared `copied` boolean and never resets it —
this is the only file in `src/` that sets a `copied` flag true with no accompanying
`setTimeout`. `HeaderScannerPanel.tsx:97` renders `{copied ? 'Copied' : 'Copy value'}` for
every header row. Clicking one row's copy button therefore flips **all** rows to "Copied", and
they stay that way for the rest of the session.

Its `catch` also sets `copied` to `false` and shows nothing, so a denied clipboard is
indistinguishable from a no-op.
`src/tools/cookie-inspector/hooks/useCookieInspector.ts:73-80` gets this right (toast on both
paths) — follow that shape.

**Required behavior:** copied feedback is per-row, resets automatically after a short delay
(~2s, matching the other tools in the repo), and a failed copy tells the user it failed.
Route the copy through `copyText` from Task 1. Clear any pending timer on unmount so the
timeout cannot fire against an unmounted component.

### Tests

Extend `__tests__/tools.header-scanner.test.ts`: clicking one row's copy button marks only that
row copied; the state clears after the delay (use fake timers); a rejected copy surfaces an
error rather than silently reverting.

---

## Task 9: Four independent small fixes

These are unrelated one- and two-line fixes in four different tools, batched into one task
because each is small and self-contained. Fix all four.

**Files owned:** `src/tools/img-to-svg/hooks/useImageToSvg.ts`,
`src/tools/compass/hooks/useCompass.ts`, `src/tools/thong-thai/page.tsx`,
`src/tools/generate-large-image/hooks/useGenerateLargeImage.ts`, plus any test files you add
for them.

### Finding U4 — img-to-svg's progress interval leaks on error

`useImageToSvg.ts:100-110`: `clearInterval(progressInterval)` sits inside the `try` **after**
the `await`. When `traceImageFromFile` throws, the interval is never cleared: the progress bar
keeps climbing toward 80% next to the error message, and every failed attempt leaves another
orphaned timer running for the rest of the session. Move the clear into `finally` (or hoist
the handle so `catch` can clear it).

While in this file, migrate `copySvg` (`:129-138`) to `copyText` from Task 1 — it already
returns a boolean, so the shapes line up.

### Finding U5 — compass calibration keeps running after stop

`useCompass.ts:279` and `:322` both create a `calibrationInterval` whose handle is never
stored. `stop()` (`:300-309`) clears the animation loop and the sensors but cannot clear these.
So stopping the compass mid-calibration leaves the interval alive; it counts to 100 and then
calls `setState('ACTIVE_TRUSTED')`, leaving the UI showing a live, trusted compass backed by
sensors that were shut down. Unmounting mid-calibration has the same effect.

Store the handle in a ref, clear it in `stop()`, in `requestCalibration()` before starting a
new one, and in an unmount cleanup. Both call sites must share one handle so a second
calibration cannot orphan the first.

### Finding U8 — thong-thai uses a native `alert()`

`thong-thai/page.tsx:505`: `alert("GIF encoding failed. Check console for details.")`. The repo
has a toast system at `src/design-system/context/ToastContext.tsx` (`useToast()` →
`showToast(message, 'success' | 'error' | 'info')`). A blocking native dialog telling the user
to open devtools is not the right failure surface.

**Important:** `useToast` throws when called outside a `ToastProvider`
(`ToastContext.tsx:45-49`). Verify that this page actually renders inside the provider before
using the hook. If it does not, use a local error state rendered in the page instead of adding
a provider — do not introduce a crash to fix a cosmetic issue, and do not restructure the app
shell for this.

### Finding U6 — generate-large-image never revokes its object URLs

`useGenerateLargeImage.ts:45` (`previewUrl`) and `:81` (`outputUrl`) both create object URLs
that are never revoked. Selecting several files, or generating several times, leaks one image
copy per action. Revoke the previous URL when replacing either one, and on unmount.

### Tests

One targeted test for U4 (a throwing trace clears the interval — fake timers, assert progress
stops advancing after the error) and one for U5 (calling `stop()` during calibration leaves the
state `IDLE` and does not later flip to `ACTIVE_TRUSTED`). U6 and U8 do not need tests; say so
in your report.

---

## Task 10: Migrate the remaining clipboard call sites

**Finding (UX #7, remainder).** Task 1 created the helper; Tasks 2-9 migrated the sites inside
their own tools. This task migrates everything left, so that no `navigator.clipboard.writeText`
call remains outside `permission-tester`.

**Files owned** — every remaining `writeText` call site:

- `src/design-system/components/inputs/CodeEditor.tsx`
- `src/layout/Footer.tsx`
- `src/tools/aes-cbc/hooks/useAesCbc.ts`
- `src/tools/aes-cbc/hooks/useCryptoLab.ts` (2 sites)
- `src/tools/artifact-viewer/components/ClientArtifactViewer.tsx`
- `src/tools/clickjacking/ClickJackingValidator.tsx`
- `src/tools/cookie-inspector/hooks/useCookieInspector.ts`
- `src/tools/dynamic-link-probe/components/OneLinkInspector.tsx`
- `src/tools/dynamic-link-probe/hooks/useDynamicLinkProbe.ts`
- `src/tools/fetch-render/components/FetchRenderPanel.tsx`
- `src/tools/fetch-render/hooks/useFetchRender.ts` (2 sites)
- `src/tools/pre-rendering-tester/hooks/usePreRenderingTester.ts` (2 sites)
- `src/tools/push-tester/hooks/usePushTester.ts` (2 sites)
- `src/tools/qrcode/QRCodeGenerator.tsx`
- `src/tools/qrscan/components/ARScannerView.tsx`
- `src/tools/qrscan/components/QRScannerPanel.tsx`
- `src/tools/qrscan/hooks/useQrscan.ts`
- `src/tools/url/UrlEncoder.tsx`
- `src/tools/virtual-card/page.tsx` (3 sites)

### Requirements

1. Replace each `navigator.clipboard.writeText(x)` with `copyText(x)` from Task 1, removing the
   now-redundant local feature detection and `execCommand` fallback where one exists
   (`Footer.tsx`, `ClientArtifactViewer.tsx`, `QRScannerPanel.tsx`, `useQrscan.ts`).
2. **Preserve each site's existing user feedback.** Several already show a toast, set a
   `copied` flag, or log an analytics event — keep all of that, and where a site currently
   distinguishes success from failure, keep the distinction. `copyText` returns a boolean, so
   a site that previously assumed success can now report failure; add that only where the site
   already has a surface for it. Do not invent new UI.
3. **Do not touch `src/tools/permission-tester/**`** (Global Constraint 11).
4. `src/tools/qrscan/components/QRScannerPanelFixed.tsx` also has two `writeText` calls.
   Determine whether anything imports it. If it is dead, leave it untouched and report it as a
   deletion candidate — do not delete it in this task (Global Constraint 9). If it is live,
   migrate it.
5. `navigator.clipboard.readText` sites are out of scope; the helper covers writes only.

### Verification

- `grep -rn "navigator.clipboard.writeText" src` returns hits only under
  `src/tools/permission-tester/` (and `QRScannerPanelFixed.tsx` if you found it dead).
- Every test suite that touches a migrated file still passes. The only suites in the repo that
  mock `navigator.clipboard` are under `__tests__/permission-tester/`, which you do not touch —
  so no mock should need adjusting. If one does, adjust the mock, not the assertion's intent.
- Suites covering migrated files: `tools.aes-cbc.test.ts`, `tools.clickjacking.test.ts`,
  `tools.cookie-inspector.more.test.ts`, `tools.qrcode.more.test.ts`, `tools.qrscan.test.ts`,
  `tools.qrscan.cascade.test.ts`, `tools.qrscan.controller.test.ts`,
  `tools.qrscan.performance.test.ts`, `tools.url.test.ts`, `tools.url.more.test.ts`.
