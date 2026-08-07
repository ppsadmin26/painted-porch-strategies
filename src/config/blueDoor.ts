// Blue Door — single source of truth for launch date AND investment price.
// When the price changes, update BLUE_DOOR_PRICE_USD here. The display string
// is derived automatically so all user-facing surfaces stay in sync.

export const BLUE_DOOR_LAUNCH_DATE = new Date("2026-07-31T23:59:59");

export const isBlueDoorPreLaunch = () => new Date() < BLUE_DOOR_LAUNCH_DATE;

/** Human-facing launch label (e.g., "Coming Soon") shown on pre-launch surfaces. */
export const BLUE_DOOR_LAUNCH_LABEL = "Coming Soon";

/** Numeric price of the Blue Door Organizational Appraisal, in USD. */
export const BLUE_DOOR_PRICE_USD = 1500;

/** Formatted display string (e.g. "$1,500") used across all UI surfaces. */
export const BLUE_DOOR_PRICE_DISPLAY = `$${BLUE_DOOR_PRICE_USD.toLocaleString("en-US")}`;
