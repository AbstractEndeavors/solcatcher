export function minutesSince(date: Date | string): number {
  return (Date.now() - new Date(date).getTime()) / 60000;
}

