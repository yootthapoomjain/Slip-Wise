---
name: SlipWise Clerk import fix
description: How Clerk publishable key is resolved in the SlipWise frontend
---

`@clerk/react/internal` does not export `publishableKeyFromHost` — the path doesn't exist at all. Use `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY` directly in App.tsx.

**Why:** The design subagent invented a non-existent internal import path. This causes a Vite build error at runtime.

**How to apply:** Any time App.tsx or Clerk setup code references `publishableKeyFromHost`, replace it with `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`.
