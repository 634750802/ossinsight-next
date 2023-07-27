export function parseTimeZone(zone: string): number {
  const parsed = Number(zone);
  if (isFinite(parsed) && Number.isSafeInteger(parsed)) {
    return parsed;
  }
  throw new Error(`${zone} is not a valid zone`);
}

export function parseTimePeriod(period: string): string {
  const parsed = String(period).trim();
  if (parsed.length > 0) {
    return parsed;
  }
  throw new Error(`${period} is not a valid period`);
}
