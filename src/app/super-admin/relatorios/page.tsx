"use client";

const insights = [
  {
    title: "Crescimento mensal",
    value: "+12%",
    detail: "Comparado ao mes anterior",
  },
  {
    title: "Taxa de retencao",
    value: "94%",
    detail: "Ultimos 30 dias",
  },
  {
    title: "Chamados abertos",
    value: "7",
    detail: "Suporte pendente",
  },
];

const activity = [
  "Casa Horizonte atualizou 3 tarefas.",
  "Lar dos Ventos adicionou 1 novo membro.",
  "Casa Aurora gerou 2 aprovacoes pendentes.",
];

export default function SuperAdminReportsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,107,74,0.16),_transparent_60%)] px-4 py-8 sm:px-6 sm:py-10">
      <main className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#e6d3c5] bg-white/80 p-6 shadow-[0_24px_60px_rgba(28,26,22,0.12)] backdrop-blur sm:p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8c3b1c]">
            Super Admin
          </p>
          <h1 className="font-display text-2xl text-[#1c1a16] sm:text-3xl">
            Relatorios
          </h1>
          <p className="text-sm text-[#6c6055]">
            Indicadores globais e atividades recentes da plataforma.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {insights.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[#a09286]">
                {item.title}
              </p>
              <p className="mt-3 font-display text-3xl text-[#1c1a16]">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-[#6c6055]">{item.detail}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
          <h2 className="font-display text-xl text-[#1c1a16]">
            Atividade recente
          </h2>
          <p className="text-sm text-[#6c6055]">
            Ultimas interacoes registradas pelos lares.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[#6c6055]">
            {activity.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
