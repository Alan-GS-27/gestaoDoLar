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

const memberOptions = [
  { id: "me", name: "Voce" },
  { id: "lara", name: "Lara" },
  { id: "alan", name: "Alan" },
  { id: "caio", name: "Caio" },
];

const weekDayOptions = [
  { id: 1, label: "Seg" },
  { id: 2, label: "Ter" },
  { id: 3, label: "Qua" },
  { id: 4, label: "Qui" },
  { id: 5, label: "Sex" },
  { id: 6, label: "Sab" },
  { id: 0, label: "Dom" },
];

export default function TarefasPage() {
  const [isPhotoFlowOpen, setIsPhotoFlowOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [isTaskFlowOpen, setIsTaskFlowOpen] = useState(false);
  const [taskStep, setTaskStep] = useState(0);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [recurrenceType, setRecurrenceType] = useState("unica");
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [taskFlowError, setTaskFlowError] = useState<string | null>(null);

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

  const openTaskFlow = () => {
    setIsTaskFlowOpen(true);
    setTaskStep(0);
    setTaskTitle("");
    setTaskDescription("");
    setTaskDate("");
    setRecurrenceType("unica");
    setRecurrenceDays([]);
    setSelectedAssignees([]);
    setTaskFlowError(null);
  };

  const closeTaskFlow = () => {
    setIsTaskFlowOpen(false);
  };

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleRecurrenceDay = (dayId: number) => {
    setRecurrenceDays((current) =>
      current.includes(dayId)
        ? current.filter((item) => item !== dayId)
        : [...current, dayId],
    );
  };

  const isAssigneesValid = selectedAssignees.length > 0;

  const validateStep = (step: number) => {
    if (step === 0) {
      if (taskTitle.trim().length === 0) {
        return "Informe o nome da tarefa.";
      }
      if (taskDescription.trim().length < 5) {
        return "Voce precisa colocar uma descricao dessa tarefa.";
      }
    }
    if (step === 1) {
      if (recurrenceType === "unica" && taskDate.length === 0) {
        return "Escolha o dia de execucao.";
      }
      if (recurrenceType !== "unica" && recurrenceDays.length === 0) {
        return "Selecione pelo menos um dia da semana.";
      }
    }
    if (step === 2 && !isAssigneesValid) {
      return "Selecione quem vai executar a tarefa.";
    }
    return null;
  };

  const handleNextStep = () => {
    const error = validateStep(taskStep);
    if (error) {
      setTaskFlowError(error);
      return;
    }
    setTaskFlowError(null);
    setTaskStep((current) => current + 1);
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
            onClick={openTaskFlow}
            className="rounded-full border border-[#c86b4a] bg-white px-5 py-2 text-sm font-semibold text-[#8c3b1c] transition hover:bg-[#fde6de]"
          >
            Nova tarefa
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

        {isTaskFlowOpen ? (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-4 py-6 sm:items-center sm:px-6 sm:py-8">
            <div className="w-full max-w-2xl rounded-3xl border border-[#e6d3c5] bg-white p-6 shadow-[0_24px_60px_rgba(28,26,22,0.2)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#a09286]">
                    Nova tarefa
                  </p>
                  <h3 className="font-display text-xl text-[#1c1a16]">
                    {["Basico", "Recorrencia", "Responsaveis"][taskStep]}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeTaskFlow}
                  className="rounded-full border border-[#ead6c9] px-3 py-1 text-xs font-semibold text-[#6c6055]"
                >
                  Fechar
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-[#a09286]">
                {[0, 1, 2].map((step) => (
                  <span
                    key={step}
                    className={`rounded-full px-3 py-1 ${
                      taskStep === step
                        ? "bg-[#fde6de] text-[#8c3b1c]"
                        : "border border-[#f0ded2]"
                    }`}
                  >
                    Etapa {step + 1}
                  </span>
                ))}
              </div>

              {taskFlowError ? (
                <div className="mt-4 rounded-2xl border border-[#f1b6a3] bg-[#fde6de] px-4 py-3 text-sm text-[#8c3b1c]">
                  {taskFlowError}
                </div>
              ) : null}

              {taskStep === 0 ? (
                <div className="mt-5 space-y-4">
                  <label className="block text-sm text-[#6c6055]">
                    Nome da tarefa
                    <input
                      className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                      placeholder="Ex: Limpar cozinha"
                      value={taskTitle}
                      onChange={(event) => {
                        setTaskTitle(event.target.value);
                        if (taskFlowError) {
                          setTaskFlowError(null);
                        }
                      }}
                    />
                  </label>
                  <label className="block text-sm text-[#6c6055]">
                    Descricao
                    <textarea
                      className="mt-2 min-h-[96px] w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                      placeholder="Explique o que precisa ser feito"
                      value={taskDescription}
                      onChange={(event) => {
                        setTaskDescription(event.target.value);
                        if (taskFlowError) {
                          setTaskFlowError(null);
                        }
                      }}
                    />
                    <span className="mt-2 block text-xs text-[#a09286]">
                      Minimo de 5 caracteres. Se for simples, repita o nome.
                    </span>
                  </label>
                </div>
              ) : null}

              {taskStep === 1 ? (
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-sm text-[#6c6055]">Agendamento</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        { id: "unica", label: "Unica" },
                        { id: "semanal", label: "Recorrente" },
                      ].map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setRecurrenceType(option.id);
                            if (taskFlowError) {
                              setTaskFlowError(null);
                            }
                          }}
                          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                            recurrenceType === option.id
                              ? "bg-[#c86b4a] text-white"
                              : "border border-[#f0ded2] text-[#6c6055]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {recurrenceType === "unica" ? (
                    <label className="block text-sm text-[#6c6055]">
                      Dia de execucao
                      <input
                        type="date"
                      className="mt-2 w-full rounded-2xl border border-[#ead6c9] bg-white px-4 py-3 text-[#1c1a16] shadow-sm outline-none transition focus:border-[#c86b4a] focus:ring-2 focus:ring-[#f3b89d]"
                      value={taskDate}
                      onChange={(event) => {
                        setTaskDate(event.target.value);
                        if (taskFlowError) {
                          setTaskFlowError(null);
                        }
                      }}
                    />
                  </label>
                ) : (
                    <div>
                      <p className="text-sm text-[#6c6055]">
                        Dias da semana
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {weekDayOptions.map((day) => (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => {
                              toggleRecurrenceDay(day.id);
                              if (taskFlowError) {
                                setTaskFlowError(null);
                              }
                            }}
                            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                              recurrenceDays.includes(day.id)
                                ? "bg-[#fde6de] text-[#8c3b1c]"
                                : "border border-[#f0ded2] text-[#6c6055]"
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {taskStep === 2 ? (
                <div className="mt-5 space-y-4">
                  <p className="text-sm text-[#6c6055]">
                    Quem vai executar a tarefa
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {memberOptions.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          toggleAssignee(member.id);
                          if (taskFlowError) {
                            setTaskFlowError(null);
                          }
                        }}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          selectedAssignees.includes(member.id)
                            ? "border-[#c86b4a] bg-[#fde6de] text-[#8c3b1c]"
                            : "border-[#f0ded2] bg-white text-[#6c6055]"
                        }`}
                      >
                        {member.name}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-[#f0ded2] bg-[#fff7f2] px-4 py-3 text-xs text-[#8c3b1c]">
                    Essa tarefa vai para aprovacao coletiva antes de ativar.
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setTaskStep((current) => Math.max(0, current - 1))}
                  className="rounded-full border border-[#f0ded2] px-4 py-2 text-sm font-semibold text-[#6c6055] disabled:opacity-50"
                  disabled={taskStep === 0}
                >
                  Voltar
                </button>

                {taskStep < 2 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="rounded-full bg-[#c86b4a] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#c86b4a]/30 transition"
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded-full bg-[#c86b4a] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#c86b4a]/30 transition disabled:cursor-not-allowed disabled:bg-[#e5b6a3]"
                    disabled={!isAssigneesValid}
                  >
                    Enviar para aprovacao
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
