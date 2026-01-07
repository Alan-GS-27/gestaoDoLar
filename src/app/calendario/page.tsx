"use client";

const days = [
  { day: "Seg", date: 6 },
  { day: "Ter", date: 7 },
  { day: "Qua", date: 8 },
  { day: "Qui", date: 9 },
  { day: "Sex", date: 10 },
  { day: "Sab", date: 11 },
  { day: "Dom", date: 12 },
];

const events = [
  {
    title: "Limpar cozinha",
    time: "08:30",
    assignee: "Lara",
    tag: "Hoje",
  },
  {
    title: "Reuniao da familia",
    time: "19:00",
    assignee: "Todos",
    tag: "Hoje",
  },
  {
    title: "Lavar roupas",
    time: "10:00",
    assignee: "Alan",
    tag: "Quarta",
  },
  {
    title: "Organizar despensa",
    time: "18:00",
    assignee: "Caio",
    tag: "Sexta",
  },
];

export default function CalendarioPage() {
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
              Janeiro 2025
            </button>
            <button className="rounded-full bg-[#c86b4a] px-4 py-2 text-xs font-semibold text-white sm:text-sm">
              Hoje
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] uppercase text-[#a09286] sm:text-xs">
              {days.map((item) => (
                <div
                  key={item.day}
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
              {events.map((event) => (
                <div
                  key={`${event.title}-${event.time}`}
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
              ))}
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
                <div className="flex items-center justify-between rounded-2xl border border-[#f0ded2] bg-white px-4 py-3">
                  <span>Quarta-feira</span>
                  <span className="rounded-full bg-[#f9d7c7] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                    4 tarefas
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[#f0ded2] bg-white px-4 py-3">
                  <span>Sexta-feira</span>
                  <span className="rounded-full bg-[#f9d7c7] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                    3 tarefas
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Proximas reunioes
              </h2>
              <div className="mt-4 space-y-3">
                {[
                  { title: "Reuniao de consenso", time: "Hoje, 19:00" },
                  { title: "Planejamento da semana", time: "Domingo, 18:00" },
                ].map((meeting) => (
                  <div
                    key={meeting.title}
                    className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-[#1c1a16]">
                      {meeting.title}
                    </p>
                    <p className="text-xs text-[#6c6055]">{meeting.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
