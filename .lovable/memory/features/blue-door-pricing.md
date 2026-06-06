---
name: Blue Door Pricing Source of Truth
description: Centralized constant for Blue Door investment price displayed across the site
type: feature
---
`src/config/blueDoor.ts` exports `BLUE_DOOR_PRICE_USD` (number) and `BLUE_DOOR_PRICE_DISPLAY` (formatted "$1,500"). All user-facing price mentions import `BLUE_DOOR_PRICE_DISPLAY` — never hardcode the dollar amount in components, pages, or SEO descriptions. Stripe price ID in `supabase/functions/create-checkout/index.ts` is a separate concern (must match a real Stripe price object); update both when price changes. FAQ answers (EmbodyPathAlt, blue-door/FAQSectionAlt) intentionally omit the dollar figure to stay evergreen.
