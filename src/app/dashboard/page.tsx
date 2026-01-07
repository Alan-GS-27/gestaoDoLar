"use client";

const weekStats = {
  completed: 12,
  total: 18,
  streakDays: 4,
};

const todayTasks = [
  {
    title: "Limpar cozinha",
    assignee: "Lara",
    time: "08:30",
  },
  {
    title: "Regar plantas",
    assignee: "Alan",
    time: "12:00",
  },
  {
    title: "Separar lixo reciclavel",
    assignee: "Caio",
    time: "19:00",
  },
];

const weekTasks = [
  {
    title: "Lavar roupas",
    assignee: "Lara",
    due: "Quarta",
  },
  {
    title: "Organizar despensa",
    assignee: "Alan",
    due: "Quinta",
  },
  {
    title: "Limpar banheiro",
    assignee: "Caio",
    due: "Sexta",
  },
];

const pendingApprovals = [
  {
    title: "Adicionar tarefa: lavar varanda",
    author: "Lara",
  },
  {
    title: "Editar recorrencia: lixo",
    author: "Caio",
  },
];

export default function DashboardPage() {
  const progress = Math.round((weekStats.completed / weekStats.total) * 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,107,74,0.18),_transparent_60%)] px-4 py-8 sm:px-6 sm:py-10">
      <main className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#e6d3c5] bg-white/80 p-6 shadow-[0_24px_60px_rgba(28,26,22,0.12)] backdrop-blur md:flex-row md:items-center md:justify-between sm:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#8c3b1c]">
              Gestao do Lar
            </p>
            <h1 className="font-display text-2xl text-[#1c1a16] sm:text-3xl">
              Dashboard semanal
            </h1>
            <p className="text-sm text-[#6c6055]">
              Visao rapida das tarefas e do consenso da semana.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-[#ead6c9] bg-white px-4 py-2 text-sm text-[#6c6055]">
              Casa Horizonte
            </div>
            <div className="h-10 w-10 rounded-full bg-[#f1c0a5] text-center text-xs font-semibold leading-[2.5rem] text-[#8c3b1c] sm:h-11 sm:w-11 sm:text-sm sm:leading-[2.75rem]">
              AL
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-[#1c1a16]">
                  Progresso da semana
                </h2>
                <span className="text-sm text-[#6c6055]">
                  {weekStats.completed} de {weekStats.total}
                </span>
              </div>
              <div className="mt-4 h-3 w-full rounded-full bg-[#f0ded2]">
                <div
                  className="h-3 rounded-full bg-[#c86b4a]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-[#6c6055]">
                <span>{progress}% concluido</span>
                <span>Sequencia: {weekStats.streakDays} dias</span>
              </div>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-[#1c1a16]">
                  Tarefas de hoje
                </h2>
                <span className="text-sm text-[#6c6055]">
                  {todayTasks.length} tarefas
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {todayTasks.map((task) => (
                  <div
                    key={task.title}
                    className="flex items-center justify-between rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1c1a16]">
                        {task.title}
                      </p>
                      <p className="text-xs text-[#6c6055]">
                        Responsavel: {task.assignee}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f9d7c7] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                      {task.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Aprovacoes pendentes
              </h2>
              <p className="text-sm text-[#6c6055]">
                Aguardando consenso do grupo.
              </p>
              <div className="mt-4 space-y-3">
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval.title}
                    className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-[#1c1a16]">
                      {approval.title}
                    </p>
                    <p className="text-xs text-[#6c6055]">
                      Proposta por {approval.author}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 rounded-full border border-[#c86b4a] px-3 py-2 text-xs font-semibold text-[#8c3b1c]">
                        Aprovar
                      </button>
                      <button className="flex-1 rounded-full border border-[#f0ded2] px-3 py-2 text-xs font-semibold text-[#6c6055]">
                        Revisar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Semana organizada
              </h2>
              <p className="text-sm text-[#6c6055]">
                Proximas tarefas com recorrencia ativa.
              </p>
              <div className="mt-4 space-y-3">
                {weekTasks.map((task) => (
                  <div
                    key={task.title}
                    className="flex items-center justify-between rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1c1a16]">
                        {task.title}
                      </p>
                      <p className="text-xs text-[#6c6055]">
                        Responsavel: {task.assignee}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#fde6de] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                      {task.due}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
