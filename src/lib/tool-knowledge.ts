export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolKnowledge {
  features: string[];
  useCases: string[];
  howTo: string[];
  faqs: ToolFaq[];
}

export const toolKnowledgeBase: Record<string, ToolKnowledge> = {
  "json-formatter": {
    features: [
      "Pretty-prints messy JSON with clean, configurable 2-space indentation",
      "Validates JSON syntax and highlights parsing errors with line and column precision",
      "Instant minification to strip whitespace and optimize payload sizes",
      "Runs entirely in-memory using the native browser JSON engine"
    ],
    useCases: [
      "Cleaning and inspecting raw API response payloads from tools like Postman or network tabs",
      "Validating configuration files such as package.json, tsconfig.json, or manifests before deployment",
      "Preparing readable JSON snippets for technical documentation and code reviews"
    ],
    howTo: [
      "Paste your raw, unformatted, or minified JSON text into the input field",
      "View the automatically formatted and syntax-validated output instantly",
      "Use the minify or indent controls to adjust formatting according to your project conventions",
      "Click copy to clipboard to use the cleaned JSON directly in your editor"
    ],
    faqs: [
      {
        question: "Is my JSON payload sent to a remote server?",
        answer: "No. All JSON formatting, syntax validation, and minification happen strictly inside your browser using client-side JavaScript. Your data never leaves your device."
      },
      {
        question: "Can this tool handle large JSON datasets?",
        answer: "Yes, standard JSON payloads up to several megabytes format smoothly in real-time. Extremely large files are bounded only by your browser tab's available memory."
      },
      {
        question: "Does it support JSON with comments (JSONC)?",
        answer: "Standard JSON does not permit comments. If invalid syntax or comments are detected, the parser pinpoints the exact position so you can correct it."
      }
    ]
  },
  base64: {
    features: [
      "Bidirectional Base64 encoding and decoding for arbitrary text strings",
      "Full UTF-8 support handling emojis, multi-byte international characters, and symbols",
      "Live preview and instant error detection for invalid Base64 sequences",
      "Local browser execution without network calls"
    ],
    useCases: [
      "Decoding authorization headers (e.g. Basic auth credentials) during API debugging",
      "Encoding data fragments or SVG icons for data URI embedding in CSS or HTML",
      "Inspecting encoded webhook payloads and message queue event bodies"
    ],
    howTo: [
      "Select either Encode or Decode mode depending on your desired operation",
      "Enter or paste the string into the input area",
      "Inspect the converted output generated immediately in the result panel",
      "Copy the converted string with a single click"
    ],
    faqs: [
      {
        question: "Is Base64 encoding a form of encryption?",
        answer: "No. Base64 is a binary-to-text encoding format designed to safely transmit data across systems. It provides zero cryptographic security and can be decoded by anyone."
      },
      {
        question: "How does this tool handle Unicode and emojis?",
        answer: "DevHub uses a compliant UTF-8 binary stream encoder/decoder, ensuring characters outside ASCII (like emojis or non-Latin alphabets) are accurately preserved without garbled artifacts."
      }
    ]
  },
  "jwt-decoder": {
    features: [
      "Parses and displays JWT Header and Payload JSON structures with syntax highlighting",
      "Automatically decodes standard timestamps (iat, exp, nbf) into human-readable local dates",
      "Calculates real-time token expiration status (active, expiring soon, or expired)",
      "Displays raw signature segment without executing insecure network verification"
    ],
    useCases: [
      "Verifying OAuth2 and OpenID Connect claims such as scopes, user IDs, roles, and issuer URLs",
      "Debugging authentication issues by confirming token expiration times and audience parameters",
      "Inspecting custom JWT claims injected by identity providers like Auth0, Firebase, or Supabase"
    ],
    howTo: [
      "Paste your three-part JSON Web Token (separated by dots) into the input box",
      "Review the parsed Header to check the algorithm and key identifiers",
      "Examine the Payload section for decoded claims, subject identities, and validity timestamps",
      "Check the expiration banner to confirm if the token is currently valid or expired"
    ],
    faqs: [
      {
        question: "Does this tool verify the cryptographic signature of the token?",
        answer: "No. DevHub inspects and decodes the token claims purely in the client browser. It does not verify signatures against public keys or secret keys, and should never be used as a backend authentication gate."
      },
      {
        question: "Is it safe to paste production or confidential tokens here?",
        answer: "Yes, because DevHub processes the entire token locally in your browser with zero network requests. However, you should still avoid sharing sensitive tokens across public communication channels."
      }
    ]
  },
  "uuid-generator": {
    features: [
      "Generates RFC 4122 compliant version 4 (UUID v4) identifiers",
      "Cryptographically secure randomness powered by the Web Crypto API (`crypto.randomUUID`)",
      "Bulk generation with customizable count (1 to 100 UUIDs in one click)",
      "Optional uppercase, lowercase, and hyphens removal formatting"
    ],
    useCases: [
      "Creating unique primary keys for database seeds, test fixtures, and mock datasets",
      "Generating correlation IDs and idempotency keys for distributed microservice requests",
      "Creating non-colliding file names or resource identifiers in frontend state"
    ],
    howTo: [
      "Specify the number of UUIDs you want to generate using the count input",
      "Click Generate or adjust formatting options (case, hyphens)",
      "Copy individual UUIDs or copy the full list to your clipboard"
    ],
    faqs: [
      {
        question: "Are the generated UUIDs truly unique and cryptographically secure?",
        answer: "Yes. They are generated using the browser's native Web Crypto API (crypto.randomUUID), which sources entropy from your operating system's cryptographic random number generator."
      },
      {
        question: "Does DevHub save or log the generated UUIDs?",
        answer: "Never. Identifiers are generated directly in-memory and are not stored in any database or transmitted anywhere."
      }
    ]
  },
  "regex-tester": {
    features: [
      "Real-time regular expression matching against test strings",
      "Interactive match highlighting, captured group extraction, and index breakdown",
      "Full support for standard JavaScript regex flags (g, i, m, s, u)",
      "Built-in catastrophic backtracking guard to prevent browser tab freezes"
    ],
    useCases: [
      "Testing email, phone number, and password validation patterns before writing frontend code",
      "Building and fine-tuning extraction rules for log parsing and text cleanup scripts",
      "Verifying regex replace rules and capture groups before running batch migrations"
    ],
    howTo: [
      "Enter your regular expression pattern in the pattern input along with desired flags",
      "Type or paste sample text into the test string pane",
      "Examine highlighted matches, total match counts, and capture group indices in real time"
    ],
    faqs: [
      {
        question: "Which regular expression engine is used?",
        answer: "It uses your browser's native ECMAScript RegExp engine, ensuring full compatibility with modern JavaScript and TypeScript regex syntax."
      },
      {
        question: "Can complex expressions crash my browser tab?",
        answer: "DevHub implements execution boundaries and input safeguards to minimize the risk of exponential catastrophic backtracking (ReDoS)."
      }
    ]
  },
  "qr-generator": {
    features: [
      "Generates crisp, high-resolution QR codes from arbitrary text, URLs, or data",
      "Downloadable image formats (PNG) for seamless asset export",
      "Configurable error correction levels (Low, Medium, Quartile, High)",
      "Completely local rendering using client-side canvas generation"
    ],
    useCases: [
      "Creating scannable links for staging environments, mobile testing, and app downloads",
      "Generating WiFi access, vCard contact cards, and event registration codes",
      "Embedding QR codes in presentation slides, marketing collateral, and print documents"
    ],
    howTo: [
      "Type or paste your destination URL or text into the input field",
      "Adjust the error correction level if you expect the code to be printed or partially obscured",
      "Scan the preview with a smartphone camera to test readability",
      "Download the generated PNG image or copy it directly"
    ],
    faqs: [
      {
        question: "Do generated QR codes expire?",
        answer: "No. These are direct static QR codes. The encoded text or URL is permanently etched into the pattern without redirect servers, so they never expire."
      },
      {
        question: "Is there any limit to the amount of text I can encode?",
        answer: "Standard QR specifications support up to ~3,000 alphanumeric characters, though shorter URLs are recommended for easier camera scanning."
      }
    ]
  },
  "color-converter": {
    features: [
      "Instant bidirectional conversion across HEX, RGB, RGBA, HSL, and HSLA formats",
      "Live interactive visual color swatch preview",
      "Normalized CSS code snippets ready to copy into Tailwind, CSS variables, or stylesheets",
      "Validates 3, 6, and 8-character HEX codes with transparency channels"
    ],
    useCases: [
      "Translating Figma or design token values into CSS variables and theme configurations",
      "Adjusting hue, saturation, and lightness channels for accessible UI color palettes",
      "Converting legacy hex colors into modern rgb() or hsl() functional notations"
    ],
    howTo: [
      "Enter a color in any format (e.g. #3b82f6, rgb(59, 130, 246), or hsl(217, 91%, 60%))",
      "View the visual swatch and automatically converted equivalent representations",
      "Click on any formatted value to copy it immediately"
    ],
    faqs: [
      {
        question: "Does it support alpha transparency channels?",
        answer: "Yes, 8-digit HEX codes (e.g. #3b82f680) and rgba/hsla notations with opacity values between 0 and 1 are fully supported."
      }
    ]
  },
  "markdown-preview": {
    features: [
      "Split-screen live Markdown editor and synchronized rendered HTML preview",
      "Supports CommonMark and GitHub Flavored Markdown (GFM) including tables, task lists, and code blocks",
      "Sanitizes unsafe HTML and scripts to ensure safe local preview rendering",
      "One-click HTML export and plain text copy"
    ],
    useCases: [
      "Drafting and reviewing repository README.md, CONTRIBUTING.md, and release notes",
      "Authoring documentation pages, technical blog drafts, and changelogs",
      "Testing table layouts and markdown syntax before publishing to GitHub or static sites"
    ],
    howTo: [
      "Write or paste Markdown content in the left editor panel",
      "Inspect the live rendered output on the right panel",
      "Copy the rendered HTML or source Markdown as needed"
    ],
    faqs: [
      {
        question: "Does this preview execute embedded JavaScript or load remote tracker pixels?",
        answer: "No. All rendered output is sanitized locally. Script execution and external network tracking requests are disabled for security."
      }
    ]
  },
  "hash-generator": {
    features: [
      "Generates SHA-1, SHA-256, SHA-384, and SHA-512 cryptographic digests",
      "Powered by the browser native Web Crypto API for hardware-accelerated performance",
      "Upper and lower-case hexadecimal output formatting",
      "Zero server latency and client-side privacy guarantee"
    ],
    useCases: [
      "Verifying file checksums and artifact integrity during downloads or builds",
      "Generating deterministic cache keys and content hashes for assets",
      "Testing hashing logic and fixture data during backend development"
    ],
    howTo: [
      "Enter or paste the string you wish to hash into the input area",
      "Select the desired hashing algorithm (e.g. SHA-256)",
      "Copy the computed hex digest from the result card"
    ],
    faqs: [
      {
        question: "Can this tool be used for password hashing?",
        answer: "No. SHA algorithms are fast message digests, not password hashes. For passwords, you should use salted, computationally expensive algorithms like Argon2 or bcrypt on your server."
      }
    ]
  },
  "sql-formatter": {
    features: [
      "Formats unindented SQL statements into clean, hierarchically indented queries",
      "Standardizes keywords in uppercase (SELECT, FROM, WHERE, JOIN, GROUP BY)",
      "Supports standard ANSI SQL, PostgreSQL, MySQL, and SQLite dialects",
      "Minification option to flatten formatted queries into single-line statements"
    ],
    useCases: [
      "Beautifying raw queries captured from ORM logs (Prisma, Drizzle, Hibernate)",
      "Formatting complex analytical queries with multiple JOINs and subqueries for code review",
      "Standardizing database migration scripts before committing to version control"
    ],
    howTo: [
      "Paste your unformatted SQL query into the input editor",
      "Review the auto-indented, syntax-highlighted SQL in the output area",
      "Adjust case preferences or copy the formatted query to your clipboard"
    ],
    faqs: [
      {
        question: "Does this tool execute or test the query against a database?",
        answer: "No. DevHub is purely a static text formatter. It does not connect to any database or validate table existence."
      }
    ]
  },
  "cron-parser": {
    features: [
      "Translates 5-field standard cron expressions into natural English descriptions",
      "Calculates upcoming scheduled execution dates and times",
      "Explains minute, hour, day-of-month, month, and day-of-week breakdown",
      "Validates syntax and detects invalid range or step values"
    ],
    useCases: [
      "Verifying automated CI/CD schedules, GitHub Actions triggers, and cron jobs",
      "Designing background worker schedules for database backups and batch processing",
      "Preventing scheduling bugs caused by confusing 0-indexed vs 1-indexed cron fields"
    ],
    howTo: [
      "Enter a standard five-field cron expression (e.g. `*/15 * * * *` or `0 2 * * 1-5`)",
      "Read the plain English explanation of when the schedule will trigger",
      "Check the next scheduled run times to verify intended behavior"
    ],
    faqs: [
      {
        question: "Does it support 6-field cron expressions with seconds?",
        answer: "DevHub's parser focuses on the universal standard 5-field format used by Linux crontab, AWS EventBridge, and GitHub Actions."
      }
    ]
  },
  "url-encoder": {
    features: [
      "Encodes special characters, spaces, and symbols into standard RFC 3986 percent-encoding",
      "Decodes complex percent-encoded strings back into readable UTF-8 text",
      "Differentiates between full URI encoding and URI component encoding",
      "Instant, deterministic client-side transformation"
    ],
    useCases: [
      "Encoding URL query parameters to avoid breaking links with ampersands and question marks",
      "Decoding redirect URLs and OAuth state parameters during debugging",
      "Preparing safe callback URLs and deep links for mobile and web applications"
    ],
    howTo: [
      "Choose Encode or Decode mode depending on your workflow",
      "Enter the URL or string fragment in the input area",
      "Copy the correctly percent-encoded or decoded output instantly"
    ],
    faqs: [
      {
        question: "What is the difference between encodeURI and encodeURIComponent?",
        answer: "encodeURI preserves URL structure characters like / and : while encodeURIComponent encodes everything except alphanumeric characters and -_.!~*'(), making it ideal for query parameter values."
      }
    ]
  },
  "timestamp-converter": {
    features: [
      "Bidirectional conversion between Unix timestamps (seconds & milliseconds) and ISO 8601 dates",
      "Live 'current timestamp' counter with one-click capture",
      "Displays dates in both UTC and your browser's local time zone with relative time signals",
      "Handles negative timestamps for historical dates prior to 1970"
    ],
    useCases: [
      "Converting database epoch timestamps found in server logs and API responses",
      "Debugging JWT expiration (exp) and issued-at (iat) timestamp claims",
      "Constructing date filters and query ranges for time-series metrics and analytics"
    ],
    howTo: [
      "Enter a 10-digit (seconds) or 13-digit (milliseconds) Unix timestamp or an ISO date string",
      "Review the corresponding UTC date, local time, and elapsed relative duration",
      "Click to copy any converted format directly"
    ],
    faqs: [
      {
        question: "How does the tool know if a timestamp is in seconds or milliseconds?",
        answer: "Timestamps with 10 digits are automatically detected as seconds, while 13-digit numbers are treated as milliseconds."
      }
    ]
  },
  "case-converter": {
    features: [
      "Converts strings between camelCase, snake_case, kebab-case, PascalCase, UPPER_CASE, and Title Case",
      "Smart delimiter parsing supporting spaces, hyphens, underscores, and camel transitions",
      "Batch line-by-line conversion mode for lists of variables or keys",
      "Deterministic local text manipulation without remote API calls"
    ],
    useCases: [
      "Refactoring database column names (snake_case) into TypeScript interface keys (camelCase)",
      "Normalizing REST API response keys to match frontend variable naming conventions",
      "Converting titles into kebab-case CSS classes or file names"
    ],
    howTo: [
      "Enter or paste the text or list of identifier names in the input area",
      "Click your target casing button (e.g. camelCase, snake_case)",
      "Copy the transformed text directly into your project"
    ],
    faqs: [
      {
        question: "Can it handle lists with multiple lines?",
        answer: "Yes, the case converter processes each line independently, allowing you to convert dozens of variable names in a single step."
      }
    ]
  },
  "slug-generator": {
    features: [
      "Converts article titles and headings into clean, SEO-friendly URL slugs",
      "Strips punctuation, special characters, and non-URL-safe symbols",
      "Supports configurable word separators (hyphens or underscores)",
      "Transliterates common accented characters to ASCII equivalents"
    ],
    useCases: [
      "Generating route paths and permalinks for blog posts, documentation, and product catalogs",
      "Creating branch names or clean anchor tags from design briefs and tickets",
      "Standardizing content slugs in Headless CMS platforms"
    ],
    howTo: [
      "Type or paste your headline or page title into the input box",
      "Customize separator preferences (default is hyphens)",
      "Copy the generated URL slug for your route or markdown file"
    ],
    faqs: [
      {
        question: "Are capital letters removed automatically?",
        answer: "Yes, all characters are normalized to lowercase to prevent duplicate content and URL routing discrepancies."
      }
    ]
  },
  "text-diff": {
    features: [
      "Line-by-line and word-level diffing between two text versions",
      "Clear visual indicators for added, removed, and modified lines",
      "Side-by-side or unified view options for easy readability",
      "Runs strictly in-memory without uploading your proprietary code or text"
    ],
    useCases: [
      "Comparing environment variable files (.env.example vs .env) to spot missing variables",
      "Reviewing edits made to configuration files, prompts, or legal copy before deployment",
      "Checking changes between two API payload versions or SQL schema migrations"
    ],
    howTo: [
      "Paste the original text into the 'Original' panel",
      "Paste the modified version into the 'Modified' panel",
      "Review highlighted additions (green) and deletions (red) in real time"
    ],
    faqs: [
      {
        question: "Are my diff inputs saved or stored on DevHub?",
        answer: "No. Unlike hosted diff websites that create shareable links on public servers, DevHub diffs exclusively in your browser memory. Nothing is stored."
      }
    ]
  },
  "text-stats": {
    features: [
      "Real-time counts for characters, words, sentences, lines, and paragraphs",
      "Estimated reading and speaking time metrics based on standard cadence",
      "Character count breakdowns with and without whitespace",
      "Lightweight, instant calculation with zero network overhead"
    ],
    useCases: [
      "Optimizing SEO meta title (under 60 chars) and meta description (under 160 chars) lengths",
      "Ensuring documentation and blog articles hit target word counts and reading times",
      "Checking character limits for database varchar columns, SMS, and push notifications"
    ],
    howTo: [
      "Type or paste your text into the editor",
      "Inspect the dynamically updated counter badges for characters, words, and reading time",
      "Refine your text to meet required limits"
    ],
    faqs: [
      {
        question: "What reading speed is used for the reading time estimate?",
        answer: "DevHub uses a standard reading cadence of 200 words per minute (WPM), the typical average for technical and non-technical readers."
      }
    ]
  },
  "json-to-csv": {
    features: [
      "Flattens JSON arrays of objects into structured, delimiter-separated CSV rows",
      "Automatically extracts object keys to form the header row",
      "Handles nested objects and arrays with clean JSON stringification",
      "Exports downloadable `.csv` files directly from the browser"
    ],
    useCases: [
      "Exporting API database responses into spreadsheets for reporting and stakeholder review",
      "Preparing test data fixtures from JSON mocks into CSV files for load testing tools",
      "Quickly importing JSON-formatted customer or product records into Excel or Google Sheets"
    ],
    howTo: [
      "Paste your JSON array of objects (e.g. `[{ \"id\": 1, \"name\": \"Alex\" }]`) into the input field",
      "Check the generated CSV table preview and raw text output",
      "Copy the raw CSV or download it as a .csv file"
    ],
    faqs: [
      {
        question: "What if objects have different keys or missing properties?",
        answer: "The converter aggregates all unique keys across all objects to create the header row, placing empty values where keys are missing in specific items."
      }
    ]
  },
  "csv-to-json": {
    features: [
      "Parses delimited CSV text into structured JSON arrays of objects",
      "Uses the first row as property keys for subsequent data rows",
      "Automatic type inference for numbers and booleans",
      "Supports comma, semicolon, and tab delimiters"
    ],
    useCases: [
      "Importing spreadsheet exports into MongoDB, PostgreSQL JSONB, or frontend mock stores",
      "Converting CSV datasets into JSON fixtures for automated testing",
      "Transforming tabular product data into headless CMS payloads"
    ],
    howTo: [
      "Paste your CSV text including headers into the input area",
      "Verify the automatically parsed JSON output in the right panel",
      "Copy the formatted JSON array with one click"
    ],
    faqs: [
      {
        question: "Does it support quoted fields containing commas?",
        answer: "Yes, standard RFC 4180 CSV rules are observed, allowing commas inside double-quoted text without breaking column alignment."
      }
    ]
  },
  "json-to-yaml": {
    features: [
      "Converts valid JSON objects and arrays into clean, indented YAML syntax",
      "Supports nested objects, arrays, numbers, booleans, and null values",
      "Configurable 2-space indentation adhering to YAML best practices",
      "Real-time syntax validation with detailed JSON error messages"
    ],
    useCases: [
      "Translating JSON configurations into Kubernetes manifests or Helm values files",
      "Converting Docker compose or GitHub Actions definitions between formats",
      "Creating readable YAML documentation examples from JSON API responses"
    ],
    howTo: [
      "Paste valid JSON into the input editor",
      "View the automatically converted YAML output instantly",
      "Copy the YAML output or tweak the source JSON"
    ],
    faqs: [
      {
        question: "Can I convert the YAML back into JSON?",
        answer: "Yes, you can use DevHub's complementary YAML to JSON converter (`/tools/yaml-to-json`) for seamless round-trip transformations."
      }
    ]
  },
  "number-base": {
    features: [
      "Simultaneous bidirectional conversion between Decimal, Hexadecimal, Octal, and Binary",
      "Supports large integers and standard bit representations",
      "Live updating as you type into any base field",
      "Pure client-side calculation with zero network latency"
    ],
    useCases: [
      "Debugging low-level bitmasks, flags, and memory addresses in systems programming",
      "Translating Unix file permissions between octal and binary representations",
      "Inspecting byte values and network packet headers"
    ],
    howTo: [
      "Type a value into any input field (Decimal, Hex, Octal, or Binary)",
      "Watch the other three fields update immediately with corresponding values",
      "Copy the required representation to your clipboard"
    ],
    faqs: [
      {
        question: "Does it support hexadecimal prefixes like '0x'?",
        answer: "Yes, prefixes like 0x (hex), 0b (binary), and 0o (octal) are accepted and stripped cleanly during calculation."
      }
    ]
  },
  "html-entities": {
    features: [
      "Encodes reserved HTML characters (&, <, >, \", ') into safe HTML entities",
      "Decodes named and numeric HTML entities back into plain characters",
      "Supports common HTML5 named entities as well as decimal and hexadecimal codes",
      "Prevents XSS vulnerabilities when inserting untrusted text into HTML templates"
    ],
    useCases: [
      "Escaping user-generated content or code snippets before rendering in HTML documentation",
      "Decoding garbled API strings containing entities like &amp;, &quot;, or &#39;",
      "Sanitizing text for inclusion in XML feeds, RSS feeds, or SVG markup"
    ],
    howTo: [
      "Choose Encode or Decode mode depending on your task",
      "Enter your markup or plain text into the editor",
      "Copy the safe escaped entity output instantly"
    ],
    faqs: [
      {
        question: "Does this render the HTML or execute script tags?",
        answer: "No. The tool performs purely textual string replacements and never evaluates or executes markup."
      }
    ]
  },
  "query-parser": {
    features: [
      "Deconstructs URL query parameter strings into structured, readable key-value tables and JSON",
      "Decodes percent-encoded query parameter keys and values automatically",
      "Properly groups repeated parameter keys into arrays",
      "Analyzes full URLs or isolated query strings without making network requests"
    ],
    useCases: [
      "Inspecting complex UTM campaign parameters and tracking query strings",
      "Debugging OAuth redirect URLs, state parameters, and authorization code flows",
      "Extracting search filters and pagination parameters from logged backend request URLs"
    ],
    howTo: [
      "Paste a full URL or just the query string portion (after the `?`)",
      "Examine the parsed parameters in a clean table and JSON view",
      "Copy individual values or the entire parsed JSON object"
    ],
    faqs: [
      {
        question: "Does this tool visit or fetch the URL entered?",
        answer: "Never. Only the string itself is parsed locally in JavaScript; no HTTP request or DNS lookup is performed."
      }
    ]
  },
  "password-generator": {
    features: [
      "Generates strong, high-entropy random passwords and secrets",
      "Powered by the browser's native Web Crypto API for cryptographically secure randomness",
      "Configurable length and character sets (uppercase, lowercase, numbers, symbols)",
      "Real-time entropy and password strength indicators"
    ],
    useCases: [
      "Generating secure database credentials, API secret keys, and JWT signing secrets for local development",
      "Creating robust passwords for testing user onboarding and authentication flows",
      "Generating unique encryption passphrases and environment secrets"
    ],
    howTo: [
      "Adjust the slider to your desired password length (12 to 64+ characters)",
      "Toggle character set checkboxes to include or exclude symbols or numbers",
      "Click Generate to create a new password and copy it to your clipboard"
    ],
    faqs: [
      {
        question: "Is this password generator cryptographically safe?",
        answer: "Yes. It uses crypto.getRandomValues, drawing from OS-level cryptographic entropy, making it suitable for production secrets."
      },
      {
        question: "Are generated passwords saved anywhere?",
        answer: "No. The passwords exist only in your browser tab's volatile memory and vanish when you close or refresh the page."
      }
    ]
  },
  "yaml-formatter": {
    features: [
      "Formats unindented or misaligned YAML documents into standard 2-space indentation",
      "Validates YAML syntax and catches missing colons, tabs, and indentation mismatches",
      "Preserves comments and multi-line strings cleanly",
      "In-browser validation with helpful error location pointers"
    ],
    useCases: [
      "Fixing indentation errors in GitHub Actions workflow files and GitLab CI pipelines",
      "Formatting Kubernetes pod manifests, service definitions, and Helm values",
      "Reviewing and standardizing Docker Compose and OpenAPI YAML specifications"
    ],
    howTo: [
      "Paste your YAML configuration into the editor",
      "Check the formatted output or review reported syntax warnings",
      "Copy the cleaned, valid YAML to your clipboard"
    ],
    faqs: [
      {
        question: "Why does YAML fail when using tab characters?",
        answer: "The YAML specification strictly forbids tab characters for indentation. DevHub automatically detects tabs and converts them to spaces."
      }
    ]
  },
  "xml-formatter": {
    features: [
      "Pretty-prints XML documents with clean, hierarchical indentation",
      "Validates well-formed XML syntax and detects unclosed or mismatched tags",
      "Minification mode to strip comments and redundant whitespace",
      "Does not resolve external entity references (safe against XXE attacks)"
    ],
    useCases: [
      "Formatting SOAP API responses, SAML assertions, and XML configuration files",
      "Beautifying SVG graphics code and Android layout XML files",
      "Inspecting sitemap.xml and RSS/Atom feeds for syntax errors"
    ],
    howTo: [
      "Paste raw XML text into the input panel",
      "Inspect the beautifully indented and syntax-validated XML tree",
      "Copy the formatted XML or download it for your project"
    ],
    faqs: [
      {
        question: "Is this tool safe against XML External Entity (XXE) attacks?",
        answer: "Yes. DevHub uses safe client-side DOM parsing that completely ignores and disables external DTDs and entity expansion."
      }
    ]
  },
  "markdown-linter": {
    features: [
      "Analyzes Markdown text against common structural and style best practices",
      "Checks for proper heading hierarchy (e.g. no skipping from H1 to H3)",
      "Detects empty links, broken image tags, missing alt text, and unclosed code blocks",
      "Displays actionable findings with line numbers and severity levels"
    ],
    useCases: [
      "Validating documentation files and READMEs before opening pull requests",
      "Ensuring accessibility standards (like non-empty image alt text) in technical documentation",
      "Standardizing style across open source contributions and markdown-based blogs"
    ],
    howTo: [
      "Paste your Markdown content into the editor",
      "Review the findings list for suggestions and structural warnings",
      "Click on findings to identify the exact line requiring adjustment"
    ],
    faqs: [
      {
        question: "Does the linter change my Markdown automatically?",
        answer: "No. The linter acts as an advisory tool, highlighting issues with line numbers so you retain complete control over your content."
      }
    ]
  },
  "url-parser": {
    features: [
      "Breaks any URL into its constituent RFC components: protocol, host, port, path, query, and hash",
      "Expands search parameters into structured key-value listings with array handling",
      "Identifies username and password credentials if embedded in the URL",
      "Completely local parsing using the browser's native URL API without network requests"
    ],
    useCases: [
      "Debugging deep links, OAuth callbacks, and complex API endpoints",
      "Auditing tracking parameters and analytics tags attached to inbound campaign URLs",
      "Validating URL structures before storing them in databases or calling webhooks"
    ],
    howTo: [
      "Paste any URL into the input bar",
      "View the breakdown of origin, pathname, search params, and hash segments",
      "Copy individual components or the full parameter dictionary"
    ],
    faqs: [
      {
        question: "Will entering a URL trigger an HTTP request or visit the site?",
        answer: "No. DevHub only inspects the string using standard string parsing algorithms; no network connection to the domain is initiated."
      }
    ]
  },
  "gitignore-generator": {
    features: [
      "Combines proven .gitignore ignore rules for common stacks (Node.js, Next.js, Python, macOS, Windows, VS Code)",
      "Automatically deduplicates conflicting or overlapping ignore patterns",
      "Includes helpful category comments and standard environment file exclusions",
      "One-click file download or clipboard copy"
    ],
    useCases: [
      "Bootstrapping new repositories with complete, secure ignore patterns",
      "Preventing sensitive .env files, build artifacts, and OS temp files from being committed",
      "Updating legacy projects with modern framework-specific ignore rules"
    ],
    howTo: [
      "Select your technologies and operating systems from the template list",
      "Review the combined and deduplicated .gitignore output in the preview panel",
      "Copy the text or save it directly as `.gitignore` in your repository root"
    ],
    faqs: [
      {
        question: "Does it exclude .env files containing secrets?",
        answer: "Yes, standard environment patterns (.env, .env.local, .env.*.local) are included by default to prevent accidental credential leaks."
      }
    ]
  },
  "json-to-typescript": {
    features: [
      "Infers strict TypeScript interfaces from arbitrary JSON sample objects",
      "Recursively handles nested objects, arrays of objects, and union types",
      "Generates clean, readable exported interface declarations",
      "Detects optional and nullable fields across object collections"
    ],
    useCases: [
      "Rapidly typing API responses when integrating third-party REST or GraphQL services",
      "Creating frontend type contracts from raw JSON fixtures or Postman payloads",
      "Speeding up migration from plain JavaScript to strict TypeScript"
    ],
    howTo: [
      "Paste your sample JSON object or array into the input editor",
      "Review the inferred TypeScript interfaces generated on the right",
      "Copy the interfaces directly into your `.ts` or `.tsx` file"
    ],
    faqs: [
      {
        question: "What interface name does it give the root object?",
        answer: "It defaults to RootObject or a configurable name, and generates semantic sub-interface names for nested objects."
      }
    ]
  },
  "curl-converter": {
    features: [
      "Converts raw cURL commands into clean, idiomatic code for Fetch, Axios, Python Requests, Go, and Node.js",
      "Extracts HTTP methods, request headers, query parameters, basic auth, and JSON bodies",
      "Supports multi-line cURL commands with backslash escapes",
      "Deterministic local conversion without sending network requests"
    ],
    useCases: [
      "Translating 'Copy as cURL' requests from browser DevTools into application code",
      "Converting documentation API snippets into modern async/await JavaScript or Python scripts",
      "Debugging API calls across multiple backend and frontend languages"
    ],
    howTo: [
      "Right-click any network request in browser DevTools and select 'Copy as cURL'",
      "Paste the command into the input editor",
      "Select your desired target language (e.g. JavaScript Fetch, Axios, or Python)",
      "Copy the production-ready code snippet into your application"
    ],
    faqs: [
      {
        question: "Are authentication tokens or secrets in my cURL command uploaded?",
        answer: "No. The parsing and code generation run 100% locally in your browser. No headers, tokens, or endpoints are sent to any server."
      },
      {
        question: "Does it support data-raw and JSON payloads?",
        answer: "Yes, standard cURL flags like -d, --data, --data-raw, and -H headers are accurately parsed and structured."
      }
    ]
  },
  "yaml-to-json": {
    features: [
      "Converts YAML files into structured, syntax-highlighted JSON",
      "Properly transforms nested mappings, sequences, numbers, booleans, and nulls",
      "Option to format with 2-space indentation or minify output",
      "Instant syntax validation with clear error indicators"
    ],
    useCases: [
      "Converting Kubernetes YAML manifests into JSON for schema validation and programmatic analysis",
      "Translating GitHub Actions or CI configs for consumption in JavaScript tools",
      "Transforming YAML API definitions into JSON payloads"
    ],
    howTo: [
      "Paste your YAML configuration into the input editor",
      "Review the parsed and formatted JSON in the result panel",
      "Copy the formatted JSON or download it"
    ],
    faqs: [
      {
        question: "Does it support multiple YAML documents separated by '---'?",
        answer: "The parser focuses on single-document configurations; multi-document streams will parse the primary document."
      }
    ]
  },
  "lorem-ipsum": {
    features: [
      "Generates placeholder dummy text by paragraphs, sentences, or word counts",
      "Option to start with the classic Cicero passage ('Lorem ipsum dolor sit amet...')",
      "Deterministic and instant local generation without external API dependencies",
      "Clean plain-text output ready to paste into mockups and prototypes"
    ],
    useCases: [
      "Filling wireframes, component layouts, and card prototypes with realistic text length",
      "Testing typography, line heights, and font scaling in design systems",
      "Populating database seed data and UI stress tests with varying sentence lengths"
    ],
    howTo: [
      "Select the generation unit (Paragraphs, Sentences, or Words)",
      "Set your desired quantity using the counter",
      "Toggle whether to begin with the classic 'Lorem ipsum' opening",
      "Copy the generated text to your clipboard"
    ],
    faqs: [
      {
        question: "Is this text copyrighted or subject to licensing?",
        answer: "No. Lorem ipsum is public domain placeholder text adapted from classical Latin literature by Cicero (de Finibus Bonorum et Malorum)."
      }
    ]
  },
  "chmod-calculator": {
    features: [
      "Bidirectional conversion between octal permissions (e.g. 755, 644) and symbolic notation (-rwxr-xr-x)",
      "Interactive permission checkboxes for Owner, Group, and Public/Others across Read, Write, and Execute",
      "Generates ready-to-run terminal `chmod` command lines",
      "Provides plain English explanations of effective access permissions"
    ],
    useCases: [
      "Configuring web server permissions for Nginx, Apache, or SSH key files (chmod 600 or 700)",
      "Setting script executable flags (`chmod +x` / 755) in Dockerfiles and CI/CD pipelines",
      "Auditing file security on Linux and macOS environments"
    ],
    howTo: [
      "Enter a 3-digit octal permission or check the Read/Write/Execute boxes for each user group",
      "Review the corresponding symbolic notation, binary representation, and English breakdown",
      "Copy the generated `chmod` command directly into your terminal"
    ],
    faqs: [
      {
        question: "What does chmod 755 mean in practice?",
        answer: "755 gives the file Owner full read, write, and execute permissions (7), while Group members (5) and Everyone else (5) can read and execute the file but cannot modify it."
      },
      {
        question: "What permission is required for an SSH private key?",
        answer: "SSH strictly requires your private key (e.g. id_rsa or id_ed25519) to be accessible only by the owner, which corresponds to `chmod 600` (read and write for owner only)."
      }
    ]
  },
  "html-formatter": {
    features: [
      "Beautifies unindented or messy HTML markup with consistent 2-space indentation",
      "Respects void tags, doctype declarations, script blocks, and inline styles",
      "High-speed minification mode to strip unnecessary whitespace and comments for production",
      "Local browser execution without sending HTML or markup to remote servers"
    ],
    useCases: [
      "Formatting raw HTML emails, templates, and component markups for readability",
      "Minifying HTML snippets before embedding in scripts or storage to reduce payload size",
      "Cleaning messy markup exported from rich text editors or third-party web scrapers"
    ],
    howTo: [
      "Paste your raw or minified HTML into the editor",
      "Select 'Format' for pretty-printed 2-space indentation, or 'Minify' to compress",
      "Copy the cleaned HTML markup directly to your clipboard"
    ],
    faqs: [
      {
        question: "Does this formatter validate HTML5 syntax rules?",
        answer: "It checks tag matching and structure for formatting purposes, but is not a full W3C validator."
      },
      {
        question: "Does it alter inline SVG or script content?",
        answer: "Script tags, style tags, and SVG blocks are preserved while maintaining clean outer document indentation."
      }
    ]
  }
};

export function getToolKnowledge(slug: string): ToolKnowledge {
  return (
    toolKnowledgeBase[slug] ?? {
      features: ["Deterministic local transformation", "Runs 100% in browser memory"],
      useCases: ["Everyday software development workflows"],
      howTo: ["Enter input data into the panel", "View the instant transformed result"],
      faqs: [
        {
          question: "Is data sent to any server?",
          answer: "No. All operations run locally inside your browser runtime."
        }
      ]
    }
  );
}
