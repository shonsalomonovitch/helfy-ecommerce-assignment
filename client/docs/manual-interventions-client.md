# Manual Interventions — Helfy E-Commerce Client

Documents changes made outside of AI generation: manual edits, linter auto-fixes, config adjustments, and deliberate overrides.

---

## Linter Auto-Fixes (Prettier)

The project's Prettier config was applied automatically by the IDE after several AI-generated files were saved. The formatting changes were intentional and did not affect logic. Affected files:

- `src/pages/ProductDetailsPage.tsx` — quote style and JSX formatting normalized
- `src/pages/HomePage.tsx` — trailing comma style normalized

No logic was changed. The linter output was accepted as-is.

---

## Notes

- All other changes were made via AI-assisted generation (see `ai-interactions-client.md`).
- No manual SQL was run on the frontend side.
- No `.env.local` file is committed. Developers must copy `.env.example` to `.env.local` before running.
