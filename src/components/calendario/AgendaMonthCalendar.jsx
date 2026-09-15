import { Link } from "react-router-dom";
import {
  getAgendaDateKey,
  getAgendaMonthDays,
  getEventDateKeys,
  getMonthCalendarDays,
  isDateInSelectedMonth,
  isTodayAgendaDate,
  parseAgendaDate,
} from "@/lib/agendaDates";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MAX_EVENTS_PER_DAY = 3;

export default function AgendaMonthCalendar({ eventos, selectedMonth }) {
  const calendarDays = getMonthCalendarDays(selectedMonth);
  const monthDays = getAgendaMonthDays(selectedMonth);
  const eventsByDay = buildEventsByDay(eventos);
  const hasEvents = eventos.length > 0;

  return (
    <div className="space-y-4" data-agenda-month-calendar>
      {!hasEvents && (
        <div className="rounded-3xl border border-white/60 bg-white/60 px-5 py-4 text-center text-sm font-semibold text-slate-600 shadow-md backdrop-blur-xl">
          No hay eventos para este mes con los filtros seleccionados.
        </div>
      )}

      <div
        className="hidden overflow-hidden rounded-3xl border border-white/60 bg-white/65 shadow-xl backdrop-blur-xl md:block"
        data-agenda-calendar-grid
      >
        <div className="grid grid-cols-7 border-b border-white/70 bg-white/55">
          {WEEKDAY_LABELS.map((dayLabel) => (
            <div
              key={dayLabel}
              className="px-3 py-3 text-center text-xs font-extrabold uppercase text-slate-500"
            >
              {dayLabel}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day) => (
            <CalendarDayCell
              key={getAgendaDateKey(day)}
              day={day}
              eventos={eventsByDay.get(getAgendaDateKey(day)) || []}
              inSelectedMonth={isDateInSelectedMonth(day, selectedMonth)}
              isToday={isTodayAgendaDate(day)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 md:hidden" data-agenda-calendar-list>
        {monthDays.map((day) => (
          <MobileDayRow
            key={getAgendaDateKey(day)}
            day={day}
            eventos={eventsByDay.get(getAgendaDateKey(day)) || []}
            isToday={isTodayAgendaDate(day)}
          />
        ))}
      </div>
    </div>
  );
}

function CalendarDayCell({ day, eventos, inSelectedMonth, isToday }) {
  const visibleEvents = eventos.slice(0, MAX_EVENTS_PER_DAY);
  const remainingCount = eventos.length - visibleEvents.length;

  return (
    <div
      className={`min-h-36 border-b border-r border-white/60 p-2 text-left ${
        inSelectedMonth ? "bg-white/45" : "bg-white/20 text-slate-400"
      }`}
      data-agenda-calendar-day={getAgendaDateKey(day)}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-extrabold ${
            isToday
              ? "bg-indigo-600 text-white shadow-md"
              : inSelectedMonth
                ? "text-slate-800"
                : "text-slate-400"
          }`}
        >
          {day.getDate()}
        </span>
      </div>

      {visibleEvents.length > 0 && (
        <div className="space-y-1.5">
          {visibleEvents.map((evento) => (
            <CompactEventLink key={getEventInstanceKey(evento, day)} evento={evento} />
          ))}
        </div>
      )}

      {remainingCount > 0 && (
        <div className="mt-1.5 rounded-xl bg-slate-900/5 px-2 py-1 text-xs font-bold text-slate-500">
          +{remainingCount} más
        </div>
      )}
    </div>
  );
}

function MobileDayRow({ day, eventos, isToday }) {
  const visibleEvents = eventos.slice(0, MAX_EVENTS_PER_DAY);
  const remainingCount = eventos.length - visibleEvents.length;

  return (
    <div
      className="rounded-3xl border border-white/60 bg-white/65 p-4 text-left shadow-md backdrop-blur-xl"
      data-agenda-calendar-day={getAgendaDateKey(day)}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-400">
            {formatMobileWeekday(day)}
          </p>
          <p className="text-lg font-extrabold text-slate-900">{day.getDate()}</p>
        </div>

        {isToday && (
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            Hoy
          </span>
        )}
      </div>

      {visibleEvents.length > 0 && (
        <div className="space-y-2">
          {visibleEvents.map((evento) => (
            <CompactEventLink key={getEventInstanceKey(evento, day)} evento={evento} />
          ))}
        </div>
      )}

      {remainingCount > 0 && (
        <div className="mt-2 rounded-xl bg-slate-900/5 px-3 py-2 text-xs font-bold text-slate-500">
          +{remainingCount} más
        </div>
      )}
    </div>
  );
}

function CompactEventLink({ evento }) {
  const destacado = Number(evento.destacado) === 1;

  return (
    <Link
      to={`/agenda-ia/${evento.id}`}
      className={`block rounded-xl border px-2.5 py-2 text-xs font-bold leading-snug shadow-sm transition hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        destacado
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-indigo-100 bg-white/85 text-slate-700 hover:bg-white"
      }`}
      title={evento.titulo || "Evento"}
      data-agenda-event-link
    >
      <span className="flex items-start gap-1.5">
        {destacado && (
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
        )}
        <span className="truncate">{evento.titulo || "Evento sin título"}</span>
      </span>
    </Link>
  );
}

function buildEventsByDay(eventos) {
  const eventsByDay = new Map();

  eventos.forEach((evento) => {
    getEventDateKeys(evento).forEach((dateKey) => {
      const events = eventsByDay.get(dateKey) || [];
      events.push(evento);
      eventsByDay.set(dateKey, events);
    });
  });

  eventsByDay.forEach((events, dateKey) => {
    eventsByDay.set(dateKey, sortEventsForDay(events));
  });

  return eventsByDay;
}

function sortEventsForDay(eventos) {
  return [...eventos].sort((a, b) => {
    const destacadoA = Number(a.destacado) === 1 ? 0 : 1;
    const destacadoB = Number(b.destacado) === 1 ? 0 : 1;

    if (destacadoA !== destacadoB) return destacadoA - destacadoB;

    const dateA = parseAgendaDate(a.fecha_inicio)?.getTime() ?? Infinity;
    const dateB = parseAgendaDate(b.fecha_inicio)?.getTime() ?? Infinity;

    if (dateA !== dateB) return dateA - dateB;

    return String(a.titulo || "").localeCompare(String(b.titulo || ""), "es-MX");
  });
}

function getEventInstanceKey(evento, day) {
  return `${evento.id ?? evento.titulo}-${getAgendaDateKey(day)}`;
}

function formatMobileWeekday(day) {
  return new Intl.DateTimeFormat("es-MX", { weekday: "long" }).format(day);
}
