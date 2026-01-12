"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

type DayItem = {
  day: string;
  date: number;
  iso: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  time: string;
  assignee: string;
  tag: string;
  startsAt: string;
};

type FocusItem = {
  label: string;
  count: number;
};

type MeetingItem = {
  id: string;
  title: string;
  time: string;
};

const weekDayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const weekDayFull = [
  "Domingo",
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabado",
];

const toLocalDateString = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
};

const getWeekStart = (baseDate: Date) => {
  const start = new Date(baseDate);
  const dayIndex = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayIndex);
  return start;
};

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

const formatTime = (raw: string | null | undefined) => {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CalendarioPage() {
  const [days, setDays] = useState<DayItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [focusDays, setFocusDays] = useState<FocusItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [monthLabel, setMonthLabel] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [meetingStartsAt, setMeetingStartsAt] = useState("");
  const [meetingEndsAt, setMeetingEndsAt] = useState("");
  const [isMeetingSaving, setIsMeetingSaving] = useState(false);
  const [meetingError, setMeetingError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCalendar = async () => {
      setIsLoading(true);
      setMessage(null);

      const today = new Date();
      const baseDate = new Date(today);
      baseDate.setDate(today.getDate() + weekOffset * 7);
      const weekStart = getWeekStart(baseDate);
      const weekItems: DayItem[] = Array.from({ length: 7 }).map((_, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        return {
          day: weekDayLabels[date.getDay()],
          date: date.getDate(),
          iso: toLocalDateString(date),
        };
      });

      if (isMounted) {
        setDays(weekItems);
        setMonthLabel(getMonthLabel(weekStart));
      }

      let client;
      try {
        client = getSupabaseClient();
      } catch {
        if (isMounted) {
          setMessage("Supabase nao configurado.");
          setIsLoading(false);
        }
        return;
      }

      const { data: authData, error: authError } =
        await client.auth.getUser();
      const currentUser = authData?.user;

      if (authError || !currentUser) {
        if (isMounted) {
          setMessage("E necessario estar logado para ver o calendario.");
          setIsLoading(false);
        }
        return;
      }

      const { data: membership } = await client
        .from("household_members")
        .select("household_id")
        .eq("user_id", currentUser.id)
        .eq("ativo", true)
        .maybeSingle();

      const householdId = membership?.household_id ?? null;
      if (!householdId) {
        if (isMounted) {
          setMessage("Voce ainda nao esta vinculado a um lar.");
          setIsLoading(false);
        }
        return;
      }

      const weekStartStr = weekItems[0]?.iso;
      const weekEndStr = weekItems[6]?.iso;

      const { data: assignedTasks } = await client
        .from("task_assignees")
        .select("task:tasks(id,titulo,proxima_execucao_em)")
        .eq("user_id", currentUser.id)
        .gte("task.proxima_execucao_em", weekStartStr)
        .lte("task.proxima_execucao_em", weekEndStr);

      const tasks = (assignedTasks ?? [])
        .flatMap((item) => item.task ?? [])
        .filter(
          (task): task is { id: string; titulo: string; proxima_execucao_em: string } =>
            !!task?.id && !!task?.titulo && !!task?.proxima_execucao_em,
        );

      const assigneeCounts = new Map<string, number>();
      if (tasks.length > 0) {
        const { data: assignees } = await client
          .from("task_assignees")
          .select("task_id")
          .in(
            "task_id",
            tasks.map((task) => task.id),
          );

        (assignees ?? []).forEach((item) => {
          assigneeCounts.set(
            item.task_id,
            (assigneeCounts.get(item.task_id) ?? 0) + 1,
          );
        });
      }

      const todayStr = toLocalDateString(today);
      const eventsList: CalendarEvent[] = tasks.map((task) => {
        const date = new Date(`${task.proxima_execucao_em}T00:00:00`);
        const dayLabel = weekDayLabels[date.getDay()];
        const tag = task.proxima_execucao_em === todayStr ? "Hoje" : dayLabel;
        const assigneeCount = assigneeCounts.get(task.id) ?? 1;
        return {
          id: task.id,
          title: task.titulo,
          time: "Sem horario",
          assignee: assigneeCount > 1 ? `${assigneeCount} pessoas` : "Voce",
          tag,
          startsAt: `${task.proxima_execucao_em}T00:00:00`,
        };
      });

      const { data: meetingsData, error: meetingsError } = await client
        .from("meetings")
        .select("id,titulo,inicia_em")
        .eq("household_id", householdId)
        .gte("inicia_em", `${weekItems[0].iso}T00:00:00`)
        .lte("inicia_em", `${weekItems[6].iso}T23:59:59`)
        .order("inicia_em", { ascending: true });

      if (meetingsError && isMounted) {
        setMessage("Nao foi possivel carregar reunioes.");
      }

      const meetingsEvents: CalendarEvent[] = (meetingsData ?? []).map(
        (meeting) => {
          const date = new Date(meeting.inicia_em);
          const dayLabel = weekDayLabels[date.getDay()];
          const tag =
            toLocalDateString(date) === todayStr ? "Hoje" : dayLabel;
          return {
            id: meeting.id,
            title: meeting.titulo,
            time: date.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            assignee: "Lar",
            tag,
            startsAt: meeting.inicia_em,
          };
        },
      );

      const focusMap = new Map<number, number>();
      tasks.forEach((task) => {
        const date = new Date(`${task.proxima_execucao_em}T00:00:00`);
        const dayIndex = date.getDay();
        focusMap.set(dayIndex, (focusMap.get(dayIndex) ?? 0) + 1);
      });

      const focusList = Array.from(focusMap.entries())
        .map(([dayIndex, count]) => ({
          label: weekDayFull[dayIndex],
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 2);

      if (isMounted) {
        const combinedEvents = [...eventsList, ...meetingsEvents].sort((a, b) =>
          a.startsAt.localeCompare(b.startsAt),
        );
        setEvents(combinedEvents);
        setFocusDays(focusList);
        setMeetings(
          (meetingsData ?? []).map((meeting) => ({
            id: meeting.id,
            title: meeting.titulo,
            time: formatTime(meeting.inicia_em),
          })),
        );
        setIsLoading(false);
      }
    };

    loadCalendar();

    return () => {
      isMounted = false;
    };
  }, [weekOffset, refreshKey]);

  const focusFallback = useMemo(
    () => [
      { label: "Nenhum pico de tarefas", count: 0 },
      { label: "Semana leve", count: 0 },
    ],
    [],
  );

  const resetMeetingForm = () => {
    setMeetingTitle("");
    setMeetingDescription("");
    setMeetingStartsAt("");
    setMeetingEndsAt("");
    setMeetingError(null);
  };

  const openMeetingModal = () => {
    resetMeetingForm();
    setIsMeetingOpen(true);
  };

  const closeMeetingModal = () => {
    setIsMeetingOpen(false);
  };

  const handleCreateMeeting = async () => {
    if (!meetingTitle.trim()) {
      setMeetingError("Informe o titulo da reuniao.");
      return;
    }
    if (!meetingStartsAt) {
      setMeetingError("Escolha o dia e horario da reuniao.");
      return;
    }

    let client;
    try {
      client = getSupabaseClient();
    } catch {
      setMeetingError("Supabase nao configurado.");
      return;
    }

    const { data: authData, error: authError } =
      await client.auth.getUser();
    const currentUser = authData?.user;

    if (authError || !currentUser) {
      setMeetingError("E necessario estar logado para criar reunioes.");
      return;
    }

    const { data: membership } = await client
      .from("household_members")
      .select("household_id")
      .eq("user_id", currentUser.id)
      .eq("ativo", true)
      .maybeSingle();

    const householdId = membership?.household_id ?? null;
    if (!householdId) {
      setMeetingError("Voce ainda nao esta vinculado a um lar.");
      return;
    }

    setIsMeetingSaving(true);
    setMeetingError(null);

    const { error } = await client.from("meetings").insert({
      household_id: householdId,
      titulo: meetingTitle.trim(),
      descricao: meetingDescription.trim() || null,
      inicia_em: new Date(meetingStartsAt).toISOString(),
      termina_em: meetingEndsAt ? new Date(meetingEndsAt).toISOString() : null,
      criado_por: currentUser.id,
    });

    if (error) {
      setMeetingError("Nao foi possivel criar a reuniao.");
      setIsMeetingSaving(false);
      return;
    }

    setIsMeetingSaving(false);
    setIsMeetingOpen(false);
    setMessage("Reuniao criada com sucesso.");
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,107,74,0.16),_transparent_60%)] px-4 py-8 sm:px-6 sm:py-10">
      <main className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#e6d3c5] bg-white/80 p-6 shadow-[0_24px_60px_rgba(28,26,22,0.12)] backdrop-blur md:flex-row md:items-center md:justify-between sm:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#8c3b1c]">
              Gestao do Lar
            </p>
            <h1 className="font-display text-2xl text-[#1c1a16] sm:text-3xl">
              Calendario
            </h1>
            <p className="text-sm text-[#6c6055]">
              Visao semanal das tarefas e reunioes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full border border-[#ead6c9] bg-white px-4 py-2 text-xs font-semibold text-[#6c6055] sm:text-sm">
              {monthLabel || "Calendario"}
            </button>
            <button
              type="button"
              onClick={openMeetingModal}
              className="rounded-full border border-[#c86b4a] bg-white px-4 py-2 text-xs font-semibold text-[#8c3b1c] sm:text-sm"
            >
              Nova reuniao
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset((current) => current - 1)}
              className="rounded-full border border-[#ead6c9] bg-white px-4 py-2 text-xs font-semibold text-[#6c6055] sm:text-sm"
            >
              Semana anterior
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="rounded-full bg-[#c86b4a] px-4 py-2 text-xs font-semibold text-white sm:text-sm"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset((current) => current + 1)}
              className="rounded-full border border-[#ead6c9] bg-white px-4 py-2 text-xs font-semibold text-[#6c6055] sm:text-sm"
            >
              Proxima semana
            </button>
          </div>
        </header>

        {message ? (
          <div className="rounded-2xl border border-[#f1b6a3] bg-[#fde6de] px-4 py-3 text-sm text-[#8c3b1c]">
            {message}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] uppercase text-[#a09286] sm:text-xs">
              {days.map((item) => (
                <div
                  key={item.iso}
                  className="rounded-2xl border border-transparent py-2"
                >
                  <p>{item.day}</p>
                  <p className="mt-1 text-sm font-semibold text-[#1c1a16]">
                    {item.date}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4">
              {isLoading ? (
                <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                  Carregando tarefas da semana...
                </div>
              ) : events.length === 0 ? (
                <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                  Nenhuma tarefa agendada para esta semana.
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1c1a16]">
                        {event.title}
                      </p>
                      <p className="text-xs text-[#6c6055]">
                        {event.time} · {event.assignee}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#fde6de] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                      {event.tag}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Pontos de foco
              </h2>
              <p className="mt-2 text-sm text-[#6c6055]">
                Dias com maior carga de tarefas.
              </p>
              <div className="mt-4 space-y-3 text-sm text-[#6c6055]">
                {(focusDays.length ? focusDays : focusFallback).map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                  >
                    <span>{item.label}</span>
                    <span className="rounded-full bg-[#f9d7c7] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                      {item.count} tarefa{item.count === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Proximas reunioes
              </h2>
              <div className="mt-4 space-y-3">
                {isLoading ? (
                  <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    Carregando reunioes...
                  </div>
                ) : meetings.length === 0 ? (
                  <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    Sem reunioes agendadas por enquanto.
                  </div>
                ) : (
                  meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-[#1c1a16]">
                        {meeting.title}
                      </p>
                      <p className="text-xs text-[#6c6055]">
                        {meeting.time}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </section>
      </main>

      {isMeetingOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-4 py-6 sm:items-center sm:px-6 sm:py-8">
          <div className="w-full max-w-xl rounded-3xl border border-[#e6d3c5] bg-white p-6 shadow-[0_24px_60px_rgba(28,26,22,0.2)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#a09286]">
                  Nova reuniao
                </p>
                <h3 className="font-display text-xl text-[#1c1a16]">
                  Agendar encontro do lar
                </h3>
              </div>
              <button
                type="button"
                onClick={closeMeetingModal}
                className="rounded-full border border-[#ead6c9] px-3 py-1 text-xs font-semibold text-[#6c6055]"
              >
                Fechar
              </button>
            </div>

            {meetingError ? (
              <div className="mt-4 rounded-2xl border border-[#f1b6a3] bg-[#fde6de] px-4 py-3 text-sm text-[#8c3b1c]">
                {meetingError}
              </div>
            ) : null}

            <div className="mt-4 space-y-4">
              <label className="block text-sm text-[#6c6055]">
                Titulo da reuniao
                <input
                  className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                  placeholder="Ex: Reuniao de consenso"
                  value={meetingTitle}
                  onChange={(event) => {
                    setMeetingTitle(event.target.value);
                    if (meetingError) setMeetingError(null);
                  }}
                />
              </label>
              <label className="block text-sm text-[#6c6055]">
                Descricao (opcional)
                <textarea
                  className="mt-2 min-h-[96px] w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                  placeholder="Pauta da reuniao"
                  value={meetingDescription}
                  onChange={(event) => {
                    setMeetingDescription(event.target.value);
                    if (meetingError) setMeetingError(null);
                  }}
                />
              </label>
              <label className="block text-sm text-[#6c6055]">
                Inicio
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                  value={meetingStartsAt}
                  onChange={(event) => {
                    setMeetingStartsAt(event.target.value);
                    if (meetingError) setMeetingError(null);
                  }}
                />
              </label>
              <label className="block text-sm text-[#6c6055]">
                Termino (opcional)
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                  value={meetingEndsAt}
                  onChange={(event) => {
                    setMeetingEndsAt(event.target.value);
                    if (meetingError) setMeetingError(null);
                  }}
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeMeetingModal}
                className="rounded-full border border-[#f0ded2] px-4 py-2 text-sm font-semibold text-[#6c6055]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateMeeting}
                disabled={isMeetingSaving}
                className="rounded-full bg-[#c86b4a] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#c86b4a]/30 transition disabled:cursor-not-allowed disabled:bg-[#e5b6a3]"
              >
                {isMeetingSaving ? "Salvando..." : "Criar reuniao"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
