"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabaseClient";

type TaskListItem = {
  id: string;
  title: string;
  status: string;
  recurrenceLabel: string;
  nextLabel: string;
  assigneeCount: number;
  completedCount: number;
  userCompleted: boolean;
};

type ApprovalItem = {
  id: string;
  title: string;
  author: string;
  approvals: string;
};

const dayLabels = [
  "Domingo",
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
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
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [pendingChanges, setPendingChanges] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPhotoFlowOpen, setIsPhotoFlowOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null);
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null]);
  const [isSavingPhotos, setIsSavingPhotos] = useState(false);
  const [isTaskFlowOpen, setIsTaskFlowOpen] = useState(false);
  const [taskStep, setTaskStep] = useState(0);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [recurrenceType, setRecurrenceType] = useState("unica");
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [taskFlowError, setTaskFlowError] = useState<string | null>(null);

  const toLocalDateString = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().split("T")[0];
  };

  const formatNextLabel = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const today = toLocalDateString(new Date());
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = toLocalDateString(tomorrowDate);

    if (dateStr === today) return "Hoje";
    if (dateStr === tomorrow) return "Amanha";

    const parsed = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return dateStr;
    }
    return dayLabels[parsed.getDay()] ?? dateStr;
  };

  const formatRecurrenceLabel = (
    recurrence:
      | { tipo?: string | null; dias_semana?: number[] | null }
      | null
      | undefined,
  ) => {
    if (!recurrence?.tipo) return "Unica";
    if (recurrence.tipo === "diaria") return "Diaria";
    if (recurrence.tipo === "semanal") return "Recorrente";
    if (recurrence.tipo === "mensal") return "Mensal";
    return "Recorrente";
  };

  const formatProposalTitle = (
    tipo: string | null | undefined,
    payload: Record<string, unknown> | null,
  ) => {
    const title =
      (payload?.titulo as string | undefined) ??
      (payload?.title as string | undefined) ??
      "";
    if (tipo === "criacao") {
      return title ? `Nova tarefa: ${title}` : "Nova tarefa";
    }
    if (tipo === "edicao") {
      return title ? `Editar tarefa: ${title}` : "Editar tarefa";
    }
    if (tipo === "exclusao") {
      return title ? `Excluir tarefa: ${title}` : "Excluir tarefa";
    }
    return title || "Proposta pendente";
  };

  const openPhotoFlow = (task: TaskListItem) => {
    setSelectedTask(task);
    setPhotoFiles([null, null]);
    setIsPhotoFlowOpen(true);
    setMessage(null);
  };

  const closePhotoFlow = () => {
    setIsPhotoFlowOpen(false);
    setSelectedTask(null);
    setPhotoFiles([null, null]);
    setIsSavingPhotos(false);
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

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setMessage(null);

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
          setMessage("E necessario estar logado para ver as tarefas.");
          setIsLoading(false);
        }
        return;
      }

      setUserId(currentUser.id);

      const {
        data: memberships,
        error: membershipError,
        count: membershipCount,
      } = await client
        .from("household_members")
        .select("household_id,user_id,ativo", { count: "exact" })
        .eq("user_id", currentUser.id)
        .eq("ativo", true);

      const householdId = memberships?.[0]?.household_id ?? null;
      if (!householdId) {
        if (isMounted) {
          setMessage("Voce ainda nao esta vinculado a um lar.");
          setIsLoading(false);
        }
        return;
      }

      const { data: assignedTasks } = await client
        .from("task_assignees")
        .select(
          "task:tasks(id,titulo,status,proxima_execucao_em),recurrence:task_recurrences(tipo,dias_semana)",
        )
        .eq("user_id", currentUser.id);

      const taskRows = (assignedTasks ?? [])
        .map((item) => ({
          task: (Array.isArray(item.task) ? item.task[0] : item.task) as
            | {
                id: string;
                titulo: string;
                status: string | null;
                proxima_execucao_em: string | null;
              }
            | null,
          recurrence: Array.isArray(item.recurrence)
            ? item.recurrence[0]
            : item.recurrence,
        }))
        .filter((item) => item.task?.id);

      const taskIds = taskRows
        .map((item) => item.task?.id)
        .filter((id): id is string => !!id);

      const { data: assignees } = taskIds.length
        ? await client
            .from("task_assignees")
            .select("task_id,user_id")
            .in("task_id", taskIds)
        : { data: [] };

      const { data: executions } = taskIds.length
        ? await client
            .from("task_executions")
            .select("task_id,concluido_por")
            .in("task_id", taskIds)
        : { data: [] };

      const assigneeCounts = new Map<string, number>();
      (assignees ?? []).forEach((item) => {
        assigneeCounts.set(
          item.task_id,
          (assigneeCounts.get(item.task_id) ?? 0) + 1,
        );
      });

      const executionByTask = new Map<string, Set<string>>();
      (executions ?? []).forEach((item) => {
        const set = executionByTask.get(item.task_id) ?? new Set<string>();
        set.add(item.concluido_por);
        executionByTask.set(item.task_id, set);
      });

      const list: TaskListItem[] = taskRows.map((item) => {
        const task = item.task!;
        const assigneeCount = assigneeCounts.get(task.id) ?? 1;
        const completedSet = executionByTask.get(task.id) ?? new Set<string>();
        const completedCount = completedSet.size;
        const userCompleted = completedSet.has(currentUser.id);
        const isFullyCompleted = completedCount >= assigneeCount;

        const status = isFullyCompleted
          ? "Concluida"
          : userCompleted
            ? "Aguardando outros"
            : task.status ?? "Ativa";

        return {
          id: task.id,
          title: task.titulo,
          status,
          recurrenceLabel: formatRecurrenceLabel(item.recurrence),
          nextLabel: formatNextLabel(task.proxima_execucao_em),
          assigneeCount,
          completedCount,
          userCompleted,
        };
      });

      const { data: proposals } = await client
        .from("task_proposals")
        .select("id,tipo,payload,criado_por")
        .eq("household_id", householdId)
        .eq("status", "pendente");

      const proposalIds = (proposals ?? []).map((proposal) => proposal.id);

      const { data: approvals } = proposalIds.length
        ? await client
            .from("task_approvals")
            .select("proposal_id,user_id")
            .in("proposal_id", proposalIds)
        : { data: [] };

      const userApprovedIds = new Set(
        (approvals ?? [])
          .filter((approval) => approval.user_id === currentUser.id)
          .map((approval) => approval.proposal_id),
      );

      const approvalCountMap = new Map<string, number>();
      (approvals ?? []).forEach((approval) => {
        approvalCountMap.set(
          approval.proposal_id,
          (approvalCountMap.get(approval.proposal_id) ?? 0) + 1,
        );
      });

      const { count: membersTotal } = await client
        .from("household_members")
        .select("id", { count: "exact", head: true })
        .eq("household_id", householdId)
        .eq("ativo", true);

      const authorIds = Array.from(
        new Set((proposals ?? []).map((proposal) => proposal.criado_por)),
      );

      const { data: authors } = authorIds.length
        ? await client
            .from("profiles")
            .select("id,nome")
            .in("id", authorIds)
        : { data: [] };

      const authorMap = new Map(
        (authors ?? []).map((author) => [author.id, author.nome]),
      );

      const approvalsList: ApprovalItem[] = (proposals ?? [])
        .filter((proposal) => !userApprovedIds.has(proposal.id))
        .map((proposal) => ({
          id: proposal.id,
          title: formatProposalTitle(proposal.tipo, proposal.payload),
          author: authorMap.get(proposal.criado_por) ?? "Membro do lar",
          approvals: `${approvalCountMap.get(proposal.id) ?? 0}/${membersTotal ?? 0}`,
        }));

      if (isMounted) {
        setTasks(list);
        setPendingChanges(approvalsList);
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApprove = async (proposalId: string) => {
    if (!userId) return;

    let client;
    try {
      client = getSupabaseClient();
    } catch {
      setMessage("Supabase nao configurado.");
      return;
    }

    const { error } = await client.from("task_approvals").insert({
      proposal_id: proposalId,
      user_id: userId,
      aprovado: true,
    });

    if (error) {
      setMessage("Nao foi possivel aprovar agora.");
      return;
    }

    setPendingChanges((current) =>
      current.filter((change) => change.id !== proposalId),
    );
  };

  const handleFileChange = (index: number, file: File | null) => {
    setPhotoFiles((current) => {
      const next = [...current];
      next[index] = file;
      return next;
    });
  };

  const handleFinalizeTask = async () => {
    if (!selectedTask || !userId) return;
    if (photoFiles.some((file) => !file)) {
      setMessage("Envie as 2 fotos para concluir.");
      return;
    }

    let client;
    try {
      client = getSupabaseClient();
    } catch {
      setMessage("Supabase nao configurado.");
      return;
    }

    setIsSavingPhotos(true);
    setMessage(null);

    const { data: execution, error: executionError } = await client
      .from("task_executions")
      .insert({
        task_id: selectedTask.id,
        concluido_por: userId,
      })
      .select("id")
      .single();

    if (executionError || !execution) {
      setMessage("Nao foi possivel registrar a conclusao.");
      setIsSavingPhotos(false);
      return;
    }

    const photoRecords: { execution_id: string; photo_url: string }[] = [];
    for (let i = 0; i < photoFiles.length; i += 1) {
      const file = photoFiles[i];
      if (!file) continue;
      const extension = file.name.split(".").pop() || "jpg";
      const path = `${selectedTask.id}/${execution.id}/${userId}-${Date.now()}-${i + 1}.${extension}`;

      const { error: uploadError } = await client.storage
        .from("task-photos")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        setMessage("Falha ao enviar as fotos.");
        setIsSavingPhotos(false);
        return;
      }

      photoRecords.push({
        execution_id: execution.id,
        photo_url: path,
      });
    }

    const { error: photosError } = await client
      .from("task_execution_photos")
      .insert(photoRecords);

    if (photosError) {
      setMessage("Conclusao salva, mas as fotos nao foram registradas.");
      setIsSavingPhotos(false);
      return;
    }

    setTasks((current) =>
      current.map((task) => {
        if (task.id !== selectedTask.id) return task;
        const nextCompleted = task.userCompleted
          ? task.completedCount
          : task.completedCount + 1;
        const isFullyCompleted = nextCompleted >= task.assigneeCount;
        return {
          ...task,
          completedCount: nextCompleted,
          userCompleted: true,
          status: isFullyCompleted ? "Concluida" : "Aguardando outros",
        };
      }),
    );

    setIsSavingPhotos(false);
    closePhotoFlow();
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

        {message ? (
          <div className="rounded-2xl border border-[#f1b6a3] bg-[#fde6de] px-4 py-3 text-sm text-[#8c3b1c]">
            {message}
          </div>
        ) : null}

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
              {isLoading ? (
                <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-4 text-sm text-[#6c6055]">
                  Carregando tarefas...
                </div>
              ) : tasks.length === 0 ? (
                <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-4 text-sm text-[#6c6055]">
                  Voce nao tem tarefas ativas no momento.
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#1c1a16]">
                          {task.title}
                        </p>
                        <p className="text-xs text-[#6c6055]">
                          Responsaveis: {task.assigneeCount} pessoa
                          {task.assigneeCount > 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#f9d7c7] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                        {task.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6c6055]">
                      <span className="rounded-full bg-[#fde6de] px-3 py-1">
                        {task.recurrenceLabel}
                      </span>
                      <span className="rounded-full bg-[#f0ded2] px-3 py-1">
                        Proxima: {task.nextLabel}
                      </span>
                      <span className="rounded-full bg-[#f7efe7] px-3 py-1">
                        Concluido: {task.completedCount}/{task.assigneeCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => openPhotoFlow(task)}
                        disabled={task.userCompleted}
                        className="ml-auto rounded-full border border-[#c86b4a] px-4 py-1 text-xs font-semibold text-[#8c3b1c] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {task.userCompleted ? "Concluida" : "Concluir"}
                      </button>
                    </div>
                  </div>
                ))
              )}
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
                {isLoading ? (
                  <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    Carregando pendencias...
                  </div>
                ) : pendingChanges.length === 0 ? (
                  <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    Nenhuma pendencia no momento.
                  </div>
                ) : (
                  pendingChanges.map((change) => (
                    <div
                      key={change.id}
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
                        <div className="flex items-center gap-2">
                          <Link
                            href="/aprovacoes"
                            className="rounded-full border border-[#f0ded2] px-3 py-1 font-semibold text-[#6c6055]"
                          >
                            Revisar
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleApprove(change.id)}
                            className="rounded-full border border-[#c86b4a] px-3 py-1 font-semibold text-[#8c3b1c]"
                          >
                            Aprovar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                    {selectedTask?.title}
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
                {photoFiles.map((file, index) => (
                  <label
                    key={`photo-${index}`}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border px-4 py-6 text-sm font-semibold transition ${
                      file
                        ? "border-[#b1d6bd] bg-[#e8f6ec] text-[#21613a]"
                        : "border-dashed border-[#c86b4a] text-[#8c3b1c]"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) =>
                        handleFileChange(index, event.target.files?.[0] ?? null)
                      }
                    />
                    {file
                      ? `Foto ${index + 1} pronta`
                      : `Adicionar foto ${index + 1}`}
                    {file ? (
                      <span className="mt-2 text-xs text-[#21613a]">
                        {file.name}
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-[#a09286]">
                <span>
                  {photoFiles.filter(Boolean).length}/2 fotos
                </span>
                <span>Mobile-first</span>
              </div>

              <button
                type="button"
                onClick={handleFinalizeTask}
                disabled={isSavingPhotos}
                className="mt-5 w-full rounded-2xl bg-[#c86b4a] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#c86b4a]/30 transition disabled:cursor-not-allowed disabled:bg-[#e5b6a3]"
              >
                {isSavingPhotos ? "Enviando fotos..." : "Finalizar tarefa"}
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
