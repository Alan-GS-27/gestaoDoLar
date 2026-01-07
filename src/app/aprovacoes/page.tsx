"use client";

const approvals = [
  {
    title: "Nova tarefa: lavar varanda",
    type: "Criacao",
    author: "Lara",
    details: "Semanal · Sabado · Responsavel: Caio",
    approvals: 2,
    total: 3,
  },
  {
    title: "Editar recorrencia: lixo",
    type: "Edicao",
    author: "Caio",
    details: "Diaria -> 3x na semana",
    approvals: 1,
    total: 3,
  },
  {
    title: "Excluir tarefa: aspirar sala",
    type: "Exclusao",
    author: "Alan",
    details: "Motivo: tarefa substituida por robo",
    approvals: 0,
    total: 3,
  },
];

const activity = [
  {
    title: "Tarefa 'Lavar roupas' aprovada",
    time: "Hoje, 10:15",
  },
  {
    title: "Tarefa 'Limpar cozinha' concluida",
    time: "Ontem, 21:30",
  },
];

export default function AprovacoesPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,107,74,0.16),_transparent_60%)] px-4 py-8 sm:px-6 sm:py-10">
      <main className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#e6d3c5] bg-white/80 p-6 shadow-[0_24px_60px_rgba(28,26,22,0.12)] backdrop-blur md:flex-row md:items-center md:justify-between sm:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#8c3b1c]">
              Gestao do Lar
            </p>
            <h1 className="font-display text-2xl text-[#1c1a16] sm:text-3xl">
              Aprovacoes
            </h1>
            <p className="text-sm text-[#6c6055]">
              Mudancas que exigem consenso coletivo.
            </p>
          </div>
          <div className="rounded-full border border-[#ead6c9] bg-white px-5 py-2 text-sm font-semibold text-[#6c6055]">
            3 pendencias
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            {approvals.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-[#f9d7c7] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                      {item.type}
                    </span>
                    <h2 className="mt-3 font-display text-xl text-[#1c1a16]">
                      {item.title}
                    </h2>
                    <p className="text-sm text-[#6c6055]">
                      Proposto por {item.author}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    {item.approvals}/{item.total} aprovados
                  </div>
                </div>
                <p className="mt-4 text-sm text-[#6c6055]">{item.details}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-full border border-[#c86b4a] px-4 py-2 text-sm font-semibold text-[#8c3b1c]">
                    Aprovar
                  </button>
                  <button className="rounded-full border border-[#f0ded2] px-4 py-2 text-sm font-semibold text-[#6c6055]">
                    Pedir ajuste
                  </button>
                  <button className="rounded-full bg-[#c86b4a] px-4 py-2 text-sm font-semibold text-white">
                    Ver detalhes
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Como funciona
              </h2>
              <ol className="mt-4 space-y-3 text-sm text-[#6c6055]">
                <li>1. Alguem propoe uma mudanca.</li>
                <li>2. Cada membro aprova individualmente.</li>
                <li>3. Com 100% de aprovacao, a mudanca e aplicada.</li>
              </ol>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Atividade recente
              </h2>
              <div className="mt-4 space-y-3">
                {activity.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-[#1c1a16]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#6c6055]">{item.time}</p>
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
