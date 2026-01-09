"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabaseClient";

type TaskItem = {
  id: string;
  title: string;
  date: string | null;
};

type ApprovalItem = {
  id: string;
  title: string;
  author: string;
};

type DashboardData = {
  householdName: string;
  initials: string;
  todayTasks: TaskItem[];
  weekTasks: TaskItem[];
  pendingApprovals: ApprovalItem[];
  weekCompleted: number;
  weekTotal: number;
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

const toLocalDateString = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
};

const getWeekRange = (baseDate: Date) => {
  const start = new Date(baseDate);
  const dayIndex = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayIndex);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

const formatInitials = (name: string | null | undefined) => {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return `${first}${last}`.toUpperCase();
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
    return title ? `Adicionar tarefa: ${title}` : "Adicionar tarefa";
  }
  if (tipo === "edicao") {
    return title ? `Editar tarefa: ${title}` : "Editar tarefa";
  }
  if (tipo === "exclusao") {
    return title ? `Excluir tarefa: ${title}` : "Excluir tarefa";
  }
  return title || "Proposta pendente";
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    householdName: "-",
    initials: "??",
    todayTasks: [],
    weekTasks: [],
    pendingApprovals: [],
    weekCompleted: 0,
    weekTotal: 0,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
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
          setMessage("E necessario estar logado para ver o dashboard.");
          setIsLoading(false);
        }
        return;
      }

      setUserId(currentUser.id);

      const { data: profile } = await client
        .from("profiles")
        .select("nome")
        .eq("id", currentUser.id)
        .maybeSingle();

      const { data: membership } = await client
        .from("household_members")
        .select("household_id, household:households(nome)")
        .eq("user_id", currentUser.id)
        .eq("ativo", true)
        .maybeSingle();

      const householdName =
        (membership?.household as { nome?: string } | null)?.nome ?? "-";

      const today = new Date();
      const todayStr = toLocalDateString(today);
      const { start, end } = getWeekRange(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const weekStartStr = toLocalDateString(start);
      const weekEndStr = toLocalDateString(end);

      const { data: assignedTasks } = await client
        .from("task_assignees")
        .select("task:tasks(id,titulo,proxima_execucao_em)")
        .eq("user_id", currentUser.id)
        .gte("task.proxima_execucao_em", weekStartStr)
        .lte("task.proxima_execucao_em", weekEndStr);

      const normalizedTasks = (assignedTasks ?? [])
        .map((item) => item.task)
        .filter(
          (task): task is { id: string; titulo: string; proxima_execucao_em: string } =>
            !!task?.id && !!task?.titulo,
        )
        .map((task) => ({
          id: task.id,
          title: task.titulo,
          date: task.proxima_execucao_em ?? null,
        }));

      const todayTasks = normalizedTasks.filter(
        (task) => task.date === todayStr,
      );

      const weekTasks = normalizedTasks.filter(
        (task) =>
          task.date &&
          task.date >= toLocalDateString(tomorrow) &&
          task.date <= weekEndStr,
      );

      const weekTaskIds = normalizedTasks.map((task) => task.id);
      let completedCount = 0;

      if (weekTaskIds.length > 0) {
        const { data: executions } = await client
          .from("task_executions")
          .select("task_id")
          .eq("concluido_por", currentUser.id)
          .in("task_id", weekTaskIds);

        completedCount = new Set(
          (executions ?? []).map((execution) => execution.task_id),
        ).size;
      }

      const { data: proposals } = await client
        .from("task_proposals")
        .select("id, tipo, payload, criado_por")
        .eq("household_id", membership?.household_id ?? "")
        .eq("status", "pendente");

      const proposalIds = (proposals ?? []).map((proposal) => proposal.id);
      const { data: approvals } = proposalIds.length
        ? await client
            .from("task_approvals")
            .select("proposal_id")
            .eq("user_id", currentUser.id)
            .in("proposal_id", proposalIds)
        : { data: [] };

      const approvedIds = new Set(
        (approvals ?? []).map((approval) => approval.proposal_id),
      );

      const authorIds = Array.from(
        new Set((proposals ?? []).map((proposal) => proposal.criado_por)),
      );

      const { data: authors } = authorIds.length
        ? await client
            .from("profiles")
            .select("id, nome")
            .in("id", authorIds)
        : { data: [] };

      const authorMap = new Map(
        (authors ?? []).map((author) => [author.id, author.nome]),
      );

      const pendingApprovals = (proposals ?? [])
        .filter((proposal) => !approvedIds.has(proposal.id))
        .map((proposal) => ({
          id: proposal.id,
          title: formatProposalTitle(proposal.tipo, proposal.payload),
          author: authorMap.get(proposal.criado_por) ?? "Membro do lar",
        }));

      if (isMounted) {
        setData({
          householdName,
          initials: formatInitials(profile?.nome),
          todayTasks,
          weekTasks,
          pendingApprovals,
          weekCompleted: completedCount,
          weekTotal: normalizedTasks.length,
        });
        setIsLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const progress = useMemo(() => {
    if (data.weekTotal === 0) {
      return 0;
    }
    return Math.round((data.weekCompleted / data.weekTotal) * 100);
  }, [data.weekCompleted, data.weekTotal]);

  const handleApprove = async (proposalId: string) => {
    if (!userId) return;

    let client;
    try {
      client = getSupabaseClient();
    } catch {
      setMessage("Supabase nao configurado.");
      return;
    }

    setApprovingId(proposalId);
    setMessage(null);

    const { error } = await client.from("task_approvals").insert({
      proposal_id: proposalId,
      user_id: userId,
      aprovado: true,
    });

    if (error) {
      setMessage("Nao foi possivel aprovar agora.");
      setApprovingId(null);
      return;
    }

    setData((prev) => ({
      ...prev,
      pendingApprovals: prev.pendingApprovals.filter(
        (approval) => approval.id !== proposalId,
      ),
    }));
    setApprovingId(null);
  };

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
              {data.householdName}
            </div>
            <div className="h-10 w-10 rounded-full bg-[#f1c0a5] text-center text-xs font-semibold leading-[2.5rem] text-[#8c3b1c] sm:h-11 sm:w-11 sm:text-sm sm:leading-[2.75rem]">
              {data.initials}
            </div>
          </div>
        </header>

        {message ? (
          <div className="rounded-2xl border border-[#f1b6a3] bg-[#fde6de] px-4 py-3 text-sm text-[#8c3b1c]">
            {message}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#e6d3c5] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(140,59,28,0.12)]">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-[#1c1a16]">
                  Progresso da semana
                </h2>
                <span className="text-sm text-[#6c6055]">
                  {data.weekCompleted} de {data.weekTotal}
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
                <span>Sequencia: em breve</span>
              </div>
            </div>

            <div className="rounded-3xl border border-[#e6d3c5] bg-white/85 p-6 shadow-[0_18px_50px_rgba(28,26,22,0.12)]">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-[#1c1a16]">
                  Tarefas de hoje
                </h2>
                <span className="text-sm text-[#6c6055]">
                  {data.todayTasks.length} tarefas
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {isLoading ? (
                  <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    Carregando tarefas...
                  </div>
                ) : data.todayTasks.length === 0 ? (
                  <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    Nenhuma tarefa para hoje.
                  </div>
                ) : (
                  data.todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#1c1a16]">
                          {task.title}
                        </p>
                        <p className="text-xs text-[#6c6055]">
                          Responsavel: voce
                        </p>
                      </div>
                      <span className="rounded-full bg-[#f9d7c7] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                        Hoje
                      </span>
                    </div>
                  ))
                )}
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
                {isLoading ? (
                  <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    Carregando aprovacoes...
                  </div>
                ) : data.pendingApprovals.length === 0 ? (
                  <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    Nenhuma aprovacao pendente.
                  </div>
                ) : (
                  data.pendingApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-[#1c1a16]">
                        {approval.title}
                      </p>
                      <p className="text-xs text-[#6c6055]">
                        Proposta por {approval.author}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          className="flex-1 rounded-full border border-[#c86b4a] px-3 py-2 text-xs font-semibold text-[#8c3b1c] disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={approvingId === approval.id}
                          onClick={() => handleApprove(approval.id)}
                        >
                          {approvingId === approval.id
                            ? "Aprovando..."
                            : "Aprovar"}
                        </button>
                        <Link
                          href="/aprovacoes"
                          className="flex-1 rounded-full border border-[#f0ded2] px-3 py-2 text-center text-xs font-semibold text-[#6c6055]"
                        >
                          Revisar
                        </Link>
                      </div>
                    </div>
                  ))
                )}
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
                {isLoading ? (
                  <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    Carregando semana organizada...
                  </div>
                ) : data.weekTasks.length === 0 ? (
                  <div className="rounded-2xl border border-[#f0ded2] bg-white px-4 py-3 text-sm text-[#6c6055]">
                    Sem tarefas para os proximos dias.
                  </div>
                ) : (
                  data.weekTasks.map((task) => {
                    const dueDate = task.date
                      ? new Date(`${task.date}T00:00:00`)
                      : null;
                    const label = dueDate
                      ? dayLabels[dueDate.getDay()]
                      : "Em breve";

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-2xl border border-[#f0ded2] bg-white px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#1c1a16]">
                            {task.title}
                          </p>
                          <p className="text-xs text-[#6c6055]">
                            Responsavel: voce
                          </p>
                        </div>
                        <span className="rounded-full bg-[#fde6de] px-3 py-1 text-xs font-semibold text-[#8c3b1c]">
                          {label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
