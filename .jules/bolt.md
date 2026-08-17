## 2025-05-18 - Fast Guards for Real-Time Input Detection
**Learning:** Running heavy WHATWG `new URL()` parsing, unbounded `split(/\s+/)`, or greedy regexes on every keystroke against text inputs up to 100,000 characters blocks the main thread (~17.6ms per keystroke). Adding fast string/length guards (`value.includes()`, `value.length`, `/^https?:\/\//i`, `/\s/`) short-circuits heavy operations in O(1) time.
**Action:** Always place lightweight substring or length pre-checks before executing full object parsers or complex multiline regexes in real-time input listeners.
