import type { ExperienceEntry, Language } from "@/data/profile";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-04" → months since year 0, so ranges are simple subtraction. */
export const monthIndex = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  return year * 12 + (month - 1);
};

export const currentMonthIndex = (now = new Date()) => now.getFullYear() * 12 + now.getMonth();

export const formatMonth = (value: string) => {
  const index = monthIndex(value);
  return `${MONTHS[index % 12]} ${Math.floor(index / 12)}`;
};

export const formatRange = (entry: Pick<ExperienceEntry, "start" | "end">) =>
  `${formatMonth(entry.start)} — ${entry.end ? formatMonth(entry.end) : "Present"}`;

export const isOngoing = (entry: Pick<ExperienceEntry, "end">) => !entry.end;

export const languageCode = (language: Language) => {
  const code = language.code?.trim();
  if (code) return code;
  const letters = language.name.replace(/[^A-Za-z+#]/g, "");
  return letters.slice(0, 1).toUpperCase() + letters.slice(1, 2).toLowerCase();
};

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/**
 * Lays roles out on a shared month axis: a little room before the earliest
 * start, and a couple of months past today so ongoing bars visibly run on.
 */
export function timeline(entries: ExperienceEntry[], now = currentMonthIndex()) {
  if (!entries.length) return { bars: [], ticks: [], nowAt: 0 };
  const from = Math.min(...entries.map((entry) => monthIndex(entry.start))) - 1;
  const to = Math.max(now, ...entries.map((entry) => (entry.end ? monthIndex(entry.end) : now))) + 2;
  const span = to - from;
  const at = (month: number) => ((month - from) / span) * 100;
  const bars = entries.map((entry) => {
    const start = monthIndex(entry.start);
    // Ongoing roles stop exactly on the "Now" marker.
    const end = entry.end ? monthIndex(entry.end) + 1 : now + 0.5;
    return { entry, left: at(start), width: Math.max(at(end) - at(start), 1.5) };
  });
  const ticks: { at: number; label?: string }[] = [];
  for (let month = from + 1; month < to; month++) {
    const m = month % 12;
    ticks.push({ at: at(month), label: m === 0 ? String(month / 12) : m === 6 ? "Jul" : undefined });
  }
  return { bars, ticks, nowAt: at(now + 0.5) };
}
