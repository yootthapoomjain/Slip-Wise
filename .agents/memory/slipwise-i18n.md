---
name: SlipWise i18n + preferences architecture
description: How Thai/English i18n, currency, and calendar era are managed in SlipWise
---

**Architecture:**
- `src/i18n/translations.ts` — complete Thai + English string maps (type `Translations`)
- `src/contexts/PreferencesContext.tsx` — `language`, `currency`, `calendarEra`, `dateFormat` persisted in localStorage under key `slipwise-prefs`; hook: `usePreferences()` returns `{ t, language, setLanguage, currency, setCurrency, calendarEra, setCalendarEra }`
- `src/lib/format.ts` — `formatCurrency(amount, currency)`, `formatDate(date, opts)`, `parseThaiOcr(text)` for Thai bank slip parsing

**Defaults:** language=`"th"`, currency=`"THB"`, calendarEra=`"buddhist"` (พ.ศ. = Gregorian + 543)

**DB categories:** Thai emoji categories seeded lazily on first `/api/categories` GET. If old English categories exist, run `DELETE FROM categories WHERE is_default = true` to force Thai re-seed on next request.

**Why:** App targets Thai users; THB and Buddhist Era are the correct defaults for the Thai market.
