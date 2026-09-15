const DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MONTH_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  month: "long",
  year: "numeric",
});
const COMPACT_DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const COMPACT_DAY_MONTH_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
});
const COMPACT_DAY_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
});
const COMPACT_MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  month: "short",
  year: "numeric",
});

export function parseAgendaDate(dateString) {
  if (!dateString || typeof dateString !== "string") return null;

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatAgendaDate(dateString, fallback = "Fecha por confirmar") {
  const date = parseAgendaDate(dateString);
  return date ? DATE_FORMATTER.format(date) : fallback;
}

export function formatAgendaDateRange(evento, fallback = "Fecha por confirmar") {
  const { start, end } = getEventDateRange(evento);

  if (!start || !end) return fallback;
  if (isSameAgendaDay(start, end)) return formatCompactDate(start);

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${COMPACT_DAY_FORMATTER.format(start)}-${formatCompactDate(end)}`;
  }

  if (sameYear) {
    return `${formatCompactDayMonth(start)} - ${formatCompactDate(end)}`;
  }

  return `${formatCompactDate(start)} - ${formatCompactDate(end)}`;
}

export function getEffectiveEndDate(evento) {
  return parseAgendaDate(evento?.fecha_fin) || parseAgendaDate(evento?.fecha_inicio);
}

export function getEventDateRange(evento) {
  const start = parseAgendaDate(evento?.fecha_inicio);
  const end = getEffectiveEndDate(evento);

  if (!start || !end) {
    return { start, end };
  }

  return end < start ? { start, end: start } : { start, end };
}

export function getEventTemporalStatus(evento, referenceDate = new Date()) {
  const { start, end } = getEventDateRange(evento);
  const today = parseAgendaDate(toAgendaDateKey(referenceDate));

  if (!start || !end || !today) return "upcoming";
  if (end < today) return "past";
  if (start > today) return "upcoming";

  return "ongoing";
}

export function sortEventsChronologically(eventos) {
  return [...eventos].sort((a, b) => {
    const dateA = parseAgendaDate(a?.fecha_inicio)?.getTime() ?? Infinity;
    const dateB = parseAgendaDate(b?.fecha_inicio)?.getTime() ?? Infinity;

    if (dateA !== dateB) return dateA - dateB;

    const idA = String(a?.id ?? "");
    const idB = String(b?.id ?? "");
    return idA.localeCompare(idB, "es-MX", { numeric: true });
  });
}

export function sortEventsReverseChronologically(eventos) {
  return [...eventos].sort((a, b) => {
    const dateA = getEventDateRange(a).start?.getTime() ?? -Infinity;
    const dateB = getEventDateRange(b).start?.getTime() ?? -Infinity;

    if (dateA !== dateB) return dateB - dateA;

    return String(a?.titulo || "").localeCompare(String(b?.titulo || ""), "es-MX");
  });
}

export function eventBelongsToMonth(evento, monthKey) {
  if (!monthKey || monthKey === "todos") return true;

  return getEventDateKeys(evento).some((dateKey) => dateKey.startsWith(monthKey));
}

export function getEventDateKeys(evento) {
  const { start, end } = getEventDateRange(evento);
  if (!start || !end) return [];

  const keys = [];
  const current = new Date(start);

  while (current <= end) {
    keys.push(toAgendaDateKey(current));
    current.setTime(current.getTime() + DAY_IN_MS);
  }

  return keys;
}

export function getEventMonthKeys(evento) {
  return [...new Set(getEventDateKeys(evento).map((dateKey) => dateKey.slice(0, 7)))];
}

export function getAgendaMonthDate(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

export function addAgendaMonths(monthDate, amount) {
  const base = getAgendaMonthDate(monthDate);
  return new Date(base.getFullYear(), base.getMonth() + amount, 1, 12, 0, 0, 0);
}

export function getAgendaMonthKey(monthDate) {
  const date = getAgendaMonthDate(monthDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function formatAgendaMonth(monthDate) {
  const date = getAgendaMonthDate(monthDate);
  const label = MONTH_FORMATTER.format(date).replace(" de ", " ");

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getAgendaDateKey(date) {
  return toAgendaDateKey(date);
}

export function getAgendaMonthDays(monthDate) {
  const monthStart = getAgendaMonthDate(monthDate);
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const days = [];
  const current = new Date(year, month, 1, 12, 0, 0, 0);

  while (current.getMonth() === month) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function getMonthCalendarDays(monthDate) {
  const monthStart = getAgendaMonthDate(monthDate);
  const gridStart = new Date(monthStart);
  const mondayBasedWeekday = (gridStart.getDay() + 6) % 7;

  gridStart.setDate(gridStart.getDate() - mondayBasedWeekday);

  const monthEnd = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0,
    12,
    0,
    0,
    0
  );
  const gridEnd = new Date(monthEnd);
  const daysUntilSunday = 6 - ((gridEnd.getDay() + 6) % 7);

  gridEnd.setDate(gridEnd.getDate() + daysUntilSunday);

  const days = [];
  const current = new Date(gridStart);

  while (current <= gridEnd) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function isSameAgendaDay(dateA, dateB) {
  return getAgendaDateKey(dateA) === getAgendaDateKey(dateB);
}

export function isTodayAgendaDate(date, referenceDate = new Date()) {
  return isSameAgendaDay(date, referenceDate);
}

export function isDateInSelectedMonth(date, monthDate) {
  const selectedMonth = getAgendaMonthDate(monthDate);

  return (
    date.getFullYear() === selectedMonth.getFullYear() &&
    date.getMonth() === selectedMonth.getMonth()
  );
}

export function groupEventsByStartMonth(eventos) {
  const groups = new Map();

  eventos.forEach((evento) => {
    const start = parseAgendaDate(evento?.fecha_inicio);
    const monthKey = start ? getAgendaMonthKey(start) : "sin-fecha";
    const monthLabel = start ? formatAgendaMonth(start) : "Fecha por confirmar";
    const group = groups.get(monthKey) || { monthKey, monthLabel, eventos: [] };

    group.eventos.push(evento);
    groups.set(monthKey, group);
  });

  return [...groups.values()];
}

function toAgendaDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCompactDate(date) {
  return COMPACT_DATE_FORMATTER.format(date).replace(".", "");
}

function formatCompactDayMonth(date) {
  return COMPACT_DAY_MONTH_FORMATTER.format(date).replace(".", "");
}
