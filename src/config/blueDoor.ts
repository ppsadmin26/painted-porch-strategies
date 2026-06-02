// Blue Door launch date — single source of truth for pre/post-launch UI
export const BLUE_DOOR_LAUNCH_DATE = new Date("2026-06-29T00:00:00");

export const isBlueDoorPreLaunch = () => new Date() < BLUE_DOOR_LAUNCH_DATE;
