// Blue Door — single source of truth for launch state, launch COPY, and price.
//
// Every Blue Door surface (hero, purchase page, success page, Stripe checkout,
// webhook notes, and the purchase-confirmation email) must pull its launch
// wording from here. Edge functions and email templates cannot import from
// `src/`, so they read the mirrored copy in
// `supabase/functions/_shared/blue-door-copy.ts`. The two files are kept in
// sync by `src/test/blue-door-copy-sync.test.ts` — update both together.

export const BLUE_DOOR_LAUNCH_DATE = new Date("2026-07-31T23:59:59");

export const isBlueDoorPreLaunch = () => new Date() < BLUE_DOOR_LAUNCH_DATE;

/** Numeric price of the Blue Door Organizational Appraisal, in USD. */
export const BLUE_DOOR_PRICE_USD = 1500;

/** Formatted display string (e.g. "$1,500") used across all UI surfaces. */
export const BLUE_DOOR_PRICE_DISPLAY = `$${BLUE_DOOR_PRICE_USD.toLocaleString("en-US")}`;

/**
 * Canonical Blue Door launch copy. No Blue Door surface should hardcode launch
 * wording — add a key here instead.
 */
export const BLUE_DOOR_COPY = {
  /** Short badge / label shown on pre-launch surfaces. */
  label: "Coming Soon",
  /** Badge with the door glyph, used on notice boxes. */
  badge: "🚪 Coming Soon",
  /** Hero note under the reserve button. */
  heroNote: "Purchase now and we'll email your assessment access link on launch day.",
  /** Purchase page pre-launch notice. */
  purchaseNote:
    "Reserve your Blue Door now. On launch day, we'll email you a secure link to access and complete your appraisal.",
  /** Post-purchase success page pre-launch notice. */
  successNote:
    "Your spot is reserved. On launch day, we'll email you a secure access link to begin your Blue Door appraisal.",
  /** Stripe hosted-invoice footer. */
  invoiceFooter:
    "Thank you for opening your Blue Door. Your assessment access link will be emailed on launch day. Questions? explore@onthepaintedporch.com",
  /** GHL note line recorded on purchase. */
  ghlAccessNote: "Access link will be delivered on launch day.",
  /** Confirmation email subject line. */
  emailSubject: "Your Blue Door is reserved — access opens soon",
  /** Confirmation email preview text. */
  emailPreview: "Your Blue Door is reserved. Access opens soon.",
  /** Confirmation email highlight heading. */
  emailHighlight: "📅 Your assessment opens soon",
  /** Confirmation email highlight body. */
  emailHighlightBody:
    "On launch day, we will email you a secure access link from this same address. Open the link, complete the appraisal (less than 30 minutes), and your detailed executive brief will be delivered within 72 business hours.",
  /** Notify-me trigger label. */
  notifyLabel: "Notify me when it launches",
  /** SEO title for the Blue Door landing page while pre-launch. */
  seoTitle:
    "The Blue Door Organizational Appraisal (Coming Soon) | Painted Porch Strategies",
  /** SEO title for the checkout/reserve page while pre-launch. */
  seoTitleCheckout: "Reserve The Blue Door (Coming Soon) | Painted Porch Strategies",
} as const;

/**
 * SEO description for the Blue Door landing page. Leads with "Coming Soon"
 * while pre-launch so search snippets match the on-page messaging.
 */
export const blueDoorSeoDescription = () =>
  isBlueDoorPreLaunch()
    ? `Coming Soon: The Blue Door, a ${BLUE_DOOR_PRICE_DISPLAY} strategic organizational appraisal. Reserve now and we will email your access link on launch day.`
    : `Step through the Blue Door. A ${BLUE_DOOR_PRICE_DISPLAY} organizational appraisal that opens the door to sustainable shIFt, before you commit to a larger engagement.`;

/** SEO description for the Blue Door checkout page. */
export const blueDoorCheckoutSeoDescription = () =>
  isBlueDoorPreLaunch()
    ? `Coming Soon: reserve your ${BLUE_DOOR_PRICE_DISPLAY} Blue Door organizational appraisal today. Your secure access link is emailed on launch day.`
    : `Purchase your ${BLUE_DOOR_PRICE_DISPLAY} Blue Door strategic organizational appraisal and get your executive brief within 72 business hours.`;

/** SEO title for the Blue Door landing page, launch-state aware. */
export const blueDoorSeoTitle = () =>
  isBlueDoorPreLaunch()
    ? BLUE_DOOR_COPY.seoTitle
    : "The Blue Door Organizational Appraisal | Painted Porch Strategies";

/** SEO title for the Blue Door checkout page, launch-state aware. */
export const blueDoorCheckoutSeoTitle = () =>
  isBlueDoorPreLaunch()
    ? BLUE_DOOR_COPY.seoTitleCheckout
    : "Complete Your Blue Door Purchase | Painted Porch Strategies";

/** @deprecated Use BLUE_DOOR_COPY.label. Kept for existing imports. */
export const BLUE_DOOR_LAUNCH_LABEL = BLUE_DOOR_COPY.label;
