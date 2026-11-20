const shortDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" });
const longDate = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});
const weekdayDate = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Europe/Istanbul",
});

const toDate = (value: string | Date) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00+03:00`) : new Date(value);

export const formatShortDate = (value: string | Date) => shortDate.format(toDate(value));

const isoDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" });

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatDueDate(dueDate: string) {
  const today = isoDate.format(new Date());
  if (dueDate === today) return "Bugün";
  if (dueDate === addDays(today, 1)) return "Yarın";
  return formatShortDate(dueDate);
}
export const formatLongDate = (value: string | Date) => longDate.format(toDate(value));
export const formatToday = () => weekdayDate.format(new Date());

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toLocaleUpperCase("tr-TR"))
    .join("");
}

export function greeting(date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat("tr-TR", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Istanbul" }).format(date));
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}
