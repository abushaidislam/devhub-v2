# Release runbook

## Release model

The repository uses Release Please on `main`. Conventional Commit messages determine the semantic version bump and changelog entries:

- `fix:` creates a patch release.
- `feat:` creates a minor release.
- `!` or a `BREAKING CHANGE:` footer creates a major release.
- Other commit types are included when relevant but do not force a version bump.

After eligible work lands on `main`, the release workflow opens or refreshes a release pull request. That pull request updates `package.json`, `.release-please-manifest.json`, and `CHANGELOG.md`. Merging it creates the version tag and GitHub release. The release event then runs the full quality gate and attaches the npm package tarball to the GitHub release.

The application remains `private: true`; automation creates a GitHub release artifact and does not publish to the npm registry.

## Release credential

Release Please authenticates with the repository Actions secret `RELEASE_PAT`. Use a dedicated fine-grained personal access token restricted to this repository with:

- Contents: Read and write
- Pull requests: Read and write
- Metadata: Read

The workflow fails early with a clear message when `RELEASE_PAT` is absent. Never put the token value in a workflow, repository file, issue, pull request, log, or chat. Rotate the credential immediately if it is exposed, and document the owner and expiration date outside the repository.

The workflow-level `GITHUB_TOKEN` permission remains read-only because release writes are performed only through the scoped secret.

## Pre-merge dry run

Every pull request runs:

```bash
npm run release:validate
npm pack --dry-run --ignore-scripts
npm run typecheck
npm run lint
npm run test
npm run build
```

The metadata validator confirms that package identity, semantic version, manifest version, license, repository, issue tracker, and release strategy agree. The pack dry run proves that the package can be assembled without publishing it.

## Expected tagged-release artifacts

A successful release has:

1. A `v<major>.<minor>.<patch>` tag.
2. A GitHub release whose notes come from the generated changelog.
3. GitHub-provided source archives.
4. A `devhub-toolkit-v2-<version>.tgz` artifact attached by the release-artifacts workflow.

## Failure and rollback

If preparation fails, confirm `RELEASE_PAT` exists, has not expired, is authorized for this repository, and has Contents and Pull requests read/write permissions. Then rerun the failed workflow. No tag or public release exists yet.

If artifact creation fails after the release is published, keep the tag, fix the workflow on `main`, and rerun the failed job. The upload uses `--clobber`, so retrying replaces a partial artifact safely.

If the tagged source itself is invalid:

1. Mark the GitHub release as a draft or delete the release entry so users do not consume it.
2. Revert the faulty change through a reviewed pull request.
3. Merge the generated follow-up release pull request to create a new patch version.
4. Never move or reuse an existing semantic-version tag.

Because the package is not published to npm, rollback does not require `npm deprecate` or unpublish operations. Vercel deployment rollback is independent of the GitHub release and should be handled from the Vercel deployment history.
