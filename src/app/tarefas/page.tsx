"use client";

import { useState } from "react";

const tasks = [
  {
    title: "Limpar cozinha",
    assignee: "Lara",
    status: "Ativa",
    recurrence: "Diaria",
    next: "Hoje, 20:00",
  },
  {
    title: "Lavar roupas",
    assignee: "Alan",
    status: "Ativa",
    recurrence: "Semanal",
    next: "Quarta",
  },
  {
    title: "Organizar despensa",
    assignee: "Caio",
    status: "Pendente",
    recurrence: "Mensal",
    next: "15 Jan",
  },
  {
    title: "Limpar banheiro",
    assignee: "Lara",
    status: "Ativa",
    recurrence: "Semanal",
    next: "Sexta",
  },
];

const pendingChanges = [
  {
    title: "Nova tarefa: lavar varanda",
    author: "Lara",
    approvals: "2/3",
  },
  {
    title: "Editar recorrencia: lixo",
    author: "Caio",
    approvals: "1/3",
  },
];

export default function TarefasPage() {
  const [isPhotoFlowOpen, setIsPhotoFlowOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);

  const openPhotoFlow = (taskTitle: string) => {
    setSelectedTask(taskTitle);
    setPhotoCount(0);
    setIsPhotoFlowOpen(true);
  };

  const closePhotoFlow = () => {
    setIsPhotoFlowOpen(false);
    setSelectedTask(null);
    setPhotoCount(0);
  };

  const addPhoto = () => {
    setPhotoCount((current) => Math.min(current + 1, 2));
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
              Tarefas
            </h1>
            <p className="text-sm text-[#6c6055]">
              Execute tarefas ativas e acompanhe propostas pendentes.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-[#ead6c9] bg-white px-5 py-2 text-sm font-semibold text-[#6c6055] transition hover:border-[#c86b4a] hover:text-[#8c3b1c]"
            disabled
          >
            Nova tarefa (em breve)
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Lista principal
              </h2>
              <span className="text-sm text-[#6c6055]">
                {tasks.length} tarefas
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.title}
                  className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1c1a16]">
                        {task.title}
                      </p>
                      <p className="text-xs text-[#6c6055]">
                        Responsavel: {task.assignee}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f9d7c7] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6c6055]">
                    <span className="rounded-full bg-[#fde6de] px-3 py-1">
                      {task.recurrence}
                    </span>
                    <span className="rounded-full bg-[#f0ded2] px-3 py-1">
                      Proxima: {task.next}
                    </span>
                    <button
                      type="button"
                      onClick={() => openPhotoFlow(task.title)}
                      className="ml-auto rounded-full border border-[#c86b4a] px-4 py-1 text-xs font-semibold text-[#8c3b1c]"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Pendencias de aprovacao
              </h2>
              <p className="text-sm text-[#6c6055]">
                Mudancas aguardando consenso.
              </p>
              <div className="mt-4 space-y-3">
                {pendingChanges.map((change) => (
                  <div
                    key={change.title}
                    className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-[#1c1a16]">
                      {change.title}
                    </p>
                    <p className="text-xs text-[#6c6055]">
                      Proposta por {change.author}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-[#6c6055]">
                      <span>Aprovacoes: {change.approvals}</span>
                      <button
                        type="button"
                        className="rounded-full border border-[#c86b4a] px-3 py-1 font-semibold text-[#8c3b1c]"
                      >
                        Aprovar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <h2 className="font-display text-xl text-[#1c1a16]">
                Regras rapidas
              </h2>
              <ul className="mt-3 space-y-3 text-sm text-[#6c6055]">
                <li>Concluir tarefas exige 2 fotos obrigatorias.</li>
                <li>Criar/editar/excluir exige aprovacao coletiva.</li>
                <li>Tarefas pendentes ficam em consenso.</li>
              </ul>
            </div>
          </div>
        </section>

        {isPhotoFlowOpen ? (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-4 py-6 sm:items-center sm:px-6 sm:py-8">
            <div className="w-full max-w-lg rounded-3xl border border-[#e6d3c5] bg-white p-5 shadow-[0_24px_60px_rgba(28,26,22,0.2)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#a09286]">
                    Concluir tarefa
                  </p>
                  <h3 className="font-display text-xl text-[#1c1a16]">
                    {selectedTask}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closePhotoFlow}
                  className="rounded-full border border-[#ead6c9] px-3 py-1 text-xs font-semibold text-[#6c6055]"
                >
                  Fechar
                </button>
              </div>

              <p className="mt-3 text-sm text-[#6c6055]">
                Tire 2 fotos obrigatorias antes de finalizar.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[1, 2].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={addPhoto}
                    className={`rounded-2xl border px-4 py-6 text-sm font-semibold transition ${
                      photoCount >= slot
                        ? "border-[#b1d6bd] bg-[#e8f6ec] text-[#21613a]"
                        : "border-dashed border-[#c86b4a] text-[#8c3b1c]"
                    }`}
                  >
                    {photoCount >= slot
                      ? `Foto ${slot} adicionada`
                      : `Adicionar foto ${slot}`}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-[#a09286]">
                <span>{photoCount}/2 fotos</span>
                <span>Mobile-first</span>
              </div>

              <button
                type="button"
                disabled={photoCount < 2}
                className="mt-5 w-full rounded-2xl bg-[#c86b4a] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#c86b4a]/30 transition disabled:cursor-not-allowed disabled:bg-[#e5b6a3]"
              >
                Finalizar tarefa
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
