---
alwaysApply: true
scene: git_message
---

# Git Commit Message Standards

Generate high-quality, professional Git commit messages strictly following the Conventional Commits 1.0.0 specification.

### 1. Message Format
`<type>(<optional scope>): <imperative summary>`

`[optional body with bullet points explaining "why" and "what", not "how"]`

`[optional footer: BREAKING CHANGE, Closes #issue]`

### 2. Commit Types
- **feat**: A new feature for the user or application.
- **fix**: A bug fix.
- **ui**: UI/UX design, layout improvements, animations, transitions, or styling changes.
- **refactor**: Code restructuring that neither fixes a bug nor adds a feature.
- **perf**: A code change that improves performance.
- **style**: Changes that do not affect the meaning of the code (white-space, formatting).
- **docs**: Documentation updates.
- **chore**: Build process, package dependencies, or tool configurations.

### 3. Subject Line Rules
- Use the imperative, present tense: "add", "fix", "update" (NOT "added", "fixes", "updating").
- Keep the first line under 72 characters.
- Start with a lowercase letter directly after the colon (e.g., `feat(auth): implement google oauth`).
- Do NOT end the subject line with a period (`.`).

### 4. Body & Constraints
- Focus on the motivation behind the change rather than obvious code steps.
- For small changes, provide ONLY the single-line conventional commit message.
- For multi-file or complex changes, add a concise bulleted list separated by an empty line.
- Do NOT include conversational text, preamble, or markdown code blocks (```) in the final output.