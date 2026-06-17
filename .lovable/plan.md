## Newsletter Signup in Footer

### Goal
Add an email newsletter signup form to the site footer, styled to match the existing navy footer theme.

### Where
`src/components/pps/PPSFooter.tsx` — add the form inside the existing 4-column grid layout (likely within or beside the "Get In Touch" column).

### What to Build
1. **UI:** Email `<input>` + submit `<button>` inside the footer.
   - Input: white text on dark/navy styling, rounded corners, placeholder text.
   - Button: label like "Subscribe" or "Join the List", styled with the brand teal or gold accent.
   - Layout: stacked (input above button) or inline depending on column width.

2. **Client Logic:**
   - React state for `email`, `loading`, `success`, and `error`.
   - Basic email validation before submit.
   - Call the existing `submit-newsletter-optin` Supabase Edge Function via `supabase.functions.invoke()`.
   - Show a brief success message (e.g., "You're on the list!") or inline error on failure.

3. **Styling Constraints:**
   - Light-mode only project; footer background is navy (`bg-navy`).
   - Use existing semantic tokens and Tailwind utilities (`text-white`, `border-white/30`, `bg-teal` or `bg-gold`, `hover:bg-white`, etc.).
   - Keep it compact so the footer grid doesn't break on mobile.

### Technical Details
- Backend: reuse `supabase/functions/submit-newsletter-optin/index.ts` (already creates/updates GHL contacts with newsletter tags).
- No new database tables or edge functions needed.
- No marketing-email infrastructure changes needed.

### Acceptance Criteria
- [ ] Footer renders an email input and submit button.
- [ ] Valid email submits successfully via the existing Edge Function.
- [ ] Invalid email shows an inline error without page reload.
- [ ] Success state replaces the form with a confirmation message.
- [ ] Mobile and desktop layouts remain intact.