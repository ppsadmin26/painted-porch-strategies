// Blue Door launch copy — backend mirror of `src/config/blueDoor.ts`.
//
// Edge functions and email templates cannot import from `src/`, so this file
// mirrors the `BLUE_DOOR_COPY` block. Keep both in sync; the sync is enforced
// by `src/test/blue-door-copy-sync.test.ts`.

export const BLUE_DOOR_COPY = {
  label: "Coming Soon",
  badge: "🚪 Coming Soon",
  heroNote: "Purchase now and we'll email your assessment access link on launch day.",
  purchaseNote:
    "Reserve your Blue Door now. On launch day, we'll email you a secure link to access and complete your appraisal.",
  successNote:
    "Your spot is reserved. On launch day, we'll email you a secure access link to begin your Blue Door appraisal.",
  invoiceFooter:
    "Thank you for opening your Blue Door. Your assessment access link will be emailed on launch day. Questions? explore@onthepaintedporch.com",
  ghlAccessNote: "Access link will be delivered on launch day.",
  emailSubject: "Your Blue Door is reserved — access opens soon",
  emailPreview: "Your Blue Door is reserved. Access opens soon.",
  emailHighlight: "📅 Your assessment opens soon",
  emailHighlightBody:
    "On launch day, we will email you a secure access link from this same address. Open the link, complete the appraisal (less than 30 minutes), and your detailed executive brief will be delivered within 72 business hours.",
  notifyLabel: "Notify me when it launches",
} as const;
